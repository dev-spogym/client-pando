import { NextResponse } from 'next/server';
import { verifyQrToken } from '@/lib/server/qrToken';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const token = body.token ?? body.qr_token;

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'token is required' }, { status: 400 });
    }

    const payload = verifyQrToken(token);
    const supabase = createSupabaseAdminClient();
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: existing, error: existingError } = await supabase
      .from('attendance')
      .select('id, checkInAt')
      .eq('memberId', payload.memberId)
      .gte('checkInAt', startOfDay.toISOString())
      .lte('checkInAt', endOfDay.toISOString())
      .is('checkOutAt', null)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        data: existing,
      });
    }

    const { data, error } = await supabase
      .from('attendance')
      .insert({
        memberId: payload.memberId,
        memberName: payload.memberName,
        checkInAt: now.toISOString(),
        type: 'REGULAR',
        checkInMethod: 'APP_QR',
        branchId: payload.branchId,
      })
      .select('id, memberId, memberName, checkInAt, checkInMethod, branchId')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, alreadyCheckedIn: false, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    const status = message === 'expired_token' ? 410 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
