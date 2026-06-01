import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

const ACTIVE_STATUSES = ['BOOKED', 'WAITLIST', 'PENDING', 'approved', 'pending'];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = Number(searchParams.get('memberId'));
    const classId = Number(searchParams.get('classId'));

    if (!Number.isFinite(memberId) || !Number.isFinite(classId)) {
      return NextResponse.json({ error: 'memberId and classId are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('lesson_bookings')
      .select('*')
      .eq('memberId', memberId)
      .eq('scheduleId', classId)
      .in('status', ACTIVE_STATUSES)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const classId = Number(body.classId);
    const memberId = Number(body.memberId);
    const memberName = String(body.memberName ?? '').trim();
    const mode = body.mode === 'waitlist' ? 'waitlist' : body.mode === 'pending' ? 'pending' : 'booked';

    if (!Number.isFinite(classId) || !Number.isFinite(memberId) || !memberName) {
      return NextResponse.json({ error: 'classId, memberId, memberName are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (classError || !classData) {
      return NextResponse.json({ error: classError?.message ?? 'class_not_found' }, { status: 404 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('lesson_bookings')
      .select('*')
      .eq('memberId', memberId)
      .eq('scheduleId', classId)
      .in('status', ACTIVE_STATUSES)
      .order('createdAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ success: true, data: existing, duplicate: true });
    }

    const capacity = Number(classData.capacity ?? 0);

    // 예약 의도에 따라 상태를 정한다. 일반 예약은 동시 예약 overbooking을 막기 위해
    // booked 값을 조건으로 한 compare-and-swap으로 정원을 확보하고, 실패하면 대기열로 폴백한다.
    let status: 'PENDING' | 'WAITLIST' | 'BOOKED';
    if (mode === 'pending') {
      status = 'PENDING';
    } else if (mode === 'waitlist') {
      status = 'WAITLIST';
    } else {
      const claimed = await claimSlot(supabase, classId, capacity);
      status = claimed ? 'BOOKED' : 'WAITLIST';
    }

    const waitlistPosition = status === 'WAITLIST'
      ? await getNextWaitlistPosition(supabase, classId)
      : null;

    const { data, error } = await supabase
      .from('lesson_bookings')
      .insert({
        scheduleId: classId,
        memberId,
        memberName,
        branchId: body.branchId ?? classData.branchId ?? null,
        status,
        title: classData.title,
        type: classData.type,
        staffId: classData.staffId,
        staffName: classData.staffName,
        room: classData.room,
        startTime: classData.startTime,
        endTime: classData.endTime,
        source: mode === 'pending' ? 'member_request' : 'member_app',
        note: body.note ?? null,
        waitlistPosition,
      })
      .select('*')
      .single();

    if (error) {
      if (status === 'BOOKED') {
        await releaseSlot(supabase, classId);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const bookingId = Number(body.bookingId);

    if (!Number.isFinite(bookingId)) {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: booking, error: bookingError } = await supabase
      .from('lesson_bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: bookingError?.message ?? 'booking_not_found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('lesson_bookings')
      .update({
        status: 'CANCELLED',
        cancelReason: body.reason ?? '회원이 앱에서 취소함',
      })
      .eq('id', bookingId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (booking.status === 'BOOKED' && booking.scheduleId) {
      const { data: classData } = await supabase
        .from('classes')
        .select('booked')
        .eq('id', booking.scheduleId)
        .maybeSingle();

      if (classData) {
        await supabase
          .from('classes')
          .update({ booked: Math.max(0, Number(classData.booked ?? 0) - 1) })
          .eq('id', booking.scheduleId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * 동시 예약 overbooking 방지: 현재 booked 값을 조건(`eq`)으로 한 compare-and-swap 증가를
 * 재시도한다. 정원이 다 찼으면 false, 다른 요청과 경합이 계속되면(읽은 값이 바뀌어 update가
 * 0행) 재시도 후 false를 반환해 호출 측에서 대기열로 폴백하게 한다. capacity가 0이면 무제한.
 */
async function claimSlot(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  classId: number,
  capacity: number
): Promise<boolean> {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const { data: cls } = await supabase
      .from('classes')
      .select('booked')
      .eq('id', classId)
      .maybeSingle();

    const current = Number(cls?.booked ?? 0);
    if (capacity > 0 && current >= capacity) {
      return false;
    }

    const { data: updated } = await supabase
      .from('classes')
      .update({ booked: current + 1 })
      .eq('id', classId)
      .eq('booked', current) // 읽은 값이 그대로일 때만 성공(compare-and-swap)
      .select('id');

    if (updated && updated.length > 0) {
      return true;
    }
    // 다른 요청이 먼저 증가시킴 → 재시도
  }
  return false;
}

/** 예약 insert 실패 시 확보한 정원 1칸을 되돌린다. */
async function releaseSlot(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  classId: number
) {
  const { data: cls } = await supabase
    .from('classes')
    .select('booked')
    .eq('id', classId)
    .maybeSingle();

  if (cls) {
    await supabase
      .from('classes')
      .update({ booked: Math.max(0, Number(cls.booked ?? 0) - 1) })
      .eq('id', classId);
  }
}

async function getNextWaitlistPosition(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  classId: number
) {
  const { count } = await supabase
    .from('lesson_bookings')
    .select('id', { count: 'exact', head: true })
    .eq('scheduleId', classId)
    .eq('status', 'WAITLIST');

  return (count ?? 0) + 1;
}
