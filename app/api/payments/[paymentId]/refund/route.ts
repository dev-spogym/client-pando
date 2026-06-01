import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const { paymentId } = await params;
    const body = await req.json();
    const saleId = Number(paymentId);
    const memberId = Number(body.memberId);
    const requestedAmount = Number(body.requestedAmount);

    if (!Number.isFinite(saleId) || !Number.isFinite(memberId) || !Number.isFinite(requestedAmount)) {
      return NextResponse.json({ error: 'invalid_refund_payload' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('id, memberId, productName, amount, branchId, status')
      .eq('id', saleId)
      .eq('memberId', memberId)
      .maybeSingle();

    if (saleError || !sale) {
      return NextResponse.json({ error: saleError?.message ?? 'payment_not_found' }, { status: 404 });
    }

    if (!['COMPLETED', 'PENDING'].includes(String(sale.status))) {
      return NextResponse.json({ error: 'payment_not_refundable' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('app_refund_requests')
      .insert({
        saleId,
        memberId,
        branchId: sale.branchId,
        productName: sale.productName,
        originalAmount: sale.amount,
        requestedAmount: Math.min(requestedAmount, Number(sale.amount)),
        reason: body.reason ?? 'other',
        memo: body.memo ?? null,
        status: '승인대기',
      })
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase
      .from('sales')
      .update({ status: 'REFUND_REQUESTED', refundReason: body.memo ?? body.reason ?? null })
      .eq('id', saleId);

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
