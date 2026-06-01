import { NextResponse } from 'next/server';
import { createQrToken } from '@/lib/server/qrToken';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const memberId = Number(body.memberId);

    if (!Number.isFinite(memberId)) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: member, error } = await supabase
      .from('members')
      .select('id, name, status, membershipExpiry, branchId')
      .eq('id', memberId)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!member) {
      return NextResponse.json({ error: 'member_not_found' }, { status: 404 });
    }

    if (member.status && !['ACTIVE', 'active', '정상'].includes(String(member.status))) {
      return NextResponse.json({ error: 'member_not_active' }, { status: 403 });
    }

    if (member.membershipExpiry && new Date(member.membershipExpiry) < new Date()) {
      return NextResponse.json({ error: 'membership_expired' }, { status: 403 });
    }

    const token = createQrToken({
      memberId: member.id,
      memberName: member.name,
      branchId: member.branchId,
    });

    return NextResponse.json({
      token,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    const status = message.includes('environment') || message.includes('QR_TOKEN') ? 500 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
