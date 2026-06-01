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

    const booked = Number(classData.booked ?? 0);
    const capacity = Number(classData.capacity ?? 0);
    const isFull = capacity > 0 && booked >= capacity;
    const status = mode === 'pending' ? 'PENDING' : mode === 'waitlist' || isFull ? 'WAITLIST' : 'BOOKED';

    if (status === 'BOOKED') {
      const { error: updateError } = await supabase
        .from('classes')
        .update({ booked: booked + 1 })
        .eq('id', classId)
        .lt('booked', capacity);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
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
        await supabase.from('classes').update({ booked }).eq('id', classId);
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
