import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = Number(searchParams.get('memberId'));
    if (!Number.isFinite(memberId)) return NextResponse.json({ error: 'memberId is required' }, { status: 400 });

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('app_withdrawal_requests')
      .select('id, reason, details, status, requestedAt')
      .eq('memberId', memberId)
      .order('requestedAt', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
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
    const reason = String(body.reason ?? '').trim();
    const details = String(body.details ?? '').trim();
    if (!Number.isFinite(memberId) || !reason) {
      return NextResponse.json({ error: 'memberId and reason are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, name, branchId')
      .eq('id', memberId)
      .maybeSingle();

    if (memberError || !member) {
      return NextResponse.json({ error: memberError?.message ?? 'member_not_found' }, { status: 404 });
    }

    const { data, error } = await supabase
      .from('app_withdrawal_requests')
      .insert({
        memberId,
        memberName: member.name,
        branchId: member.branchId,
        reason,
        details,
        status: 'requested',
      })
      .select('id, reason, details, status, requestedAt')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
