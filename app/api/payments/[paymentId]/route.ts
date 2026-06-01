import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ paymentId: string }> }) {
  try {
    const { paymentId } = await params;
    const { searchParams } = new URL(req.url);
    const memberId = Number(searchParams.get('memberId'));
    const saleId = Number(paymentId);

    if (!Number.isFinite(saleId) || !Number.isFinite(memberId)) {
      return NextResponse.json({ error: 'paymentId and memberId are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('sales')
      .select('id, memberId, productId, productName, type, amount, originalPrice, discountPrice, mileageUsed, paymentMethod, status, saleDate, cardCompany, cardNumber, approvalNo, memo')
      .eq('id', saleId)
      .eq('memberId', memberId)
      .maybeSingle();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'payment_not_found' }, { status: 404 });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
