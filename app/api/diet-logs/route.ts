import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

const MEAL_TYPES = new Set(['아침', '점심', '저녁', '간식']);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = Number(searchParams.get('memberId'));

    if (!Number.isFinite(memberId)) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('app_diet_logs')
      .select('id, date, mealType, name, calories, memo, photoName, createdAt')
      .eq('memberId', memberId)
      .order('date', { ascending: false })
      .order('createdAt', { ascending: true })
      .limit(180);

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
    const memberId = Number(body.memberId);
    const date = String(body.date ?? '').trim();
    const mealType = String(body.mealType ?? '').trim();
    const name = String(body.name ?? '').trim();
    const calories = Number(body.calories);
    const memo = String(body.memo ?? '').trim();
    const photoName = String(body.photoName ?? '').trim();

    if (
      !Number.isFinite(memberId) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !MEAL_TYPES.has(mealType) ||
      name.length < 1 ||
      !Number.isFinite(calories)
    ) {
      return NextResponse.json({ error: 'invalid_diet_log_payload' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, branchId')
      .eq('id', memberId)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: memberError?.message ?? 'member_not_found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('app_diet_logs')
      .insert({
        memberId,
        branchId: member.branchId,
        date,
        mealType,
        name,
        calories: Math.max(0, Math.round(calories)),
        memo: memo || null,
        photoName: photoName || null,
      })
      .select('id, date, mealType, name, calories, memo, photoName, createdAt')
      .single();

    if (error) {
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
    const { searchParams } = new URL(req.url);
    const memberId = Number(searchParams.get('memberId'));
    const id = Number(searchParams.get('id'));

    if (!Number.isFinite(memberId) || !Number.isFinite(id)) {
      return NextResponse.json({ error: 'memberId and id are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from('app_diet_logs')
      .delete()
      .eq('memberId', memberId)
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
