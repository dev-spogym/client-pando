import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

const METHOD_MAP: Record<string, 'CARD' | 'TRANSFER'> = {
  CARD: 'CARD',
  NAVERPAY: 'CARD',
  KAKAOPAY: 'CARD',
  TRANSFER: 'TRANSFER',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const memberId = Number(body.memberId);
    const amount = Number(body.amount);
    const originalAmount = Number(body.originalAmount ?? body.amount);
    const productName = String(body.productName ?? '').trim();
    const paymentMethod = METHOD_MAP[String(body.paymentMethod)] ?? 'CARD';

    if (!Number.isFinite(memberId) || !Number.isFinite(amount) || amount < 0 || !productName) {
      return NextResponse.json({ error: 'invalid_payment_payload' }, { status: 400 });
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

    const now = new Date().toISOString();
    const approvalNo = `APP-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const productId = Number(body.productId);
    const branchId = body.branchId ?? member.branchId;

    const { data: sale, error } = await supabase
      .from('sales')
      .insert({
        memberId,
        memberName: member.name,
        productId: Number.isFinite(productId) ? productId : null,
        productName,
        saleDate: now,
        type: body.category ?? 'APP',
        round: '회원앱',
        quantity: 1,
        originalPrice: originalAmount,
        salePrice: amount,
        discountPrice: Math.max(0, originalAmount - amount),
        amount,
        paymentMethod,
        paymentType: body.paymentType ?? '일시불',
        cash: paymentMethod === 'TRANSFER' ? amount : 0,
        card: paymentMethod === 'CARD' ? amount : 0,
        mileageUsed: Number(body.mileageUsed ?? 0),
        cardCompany: body.cardCompany ?? null,
        cardNumber: body.cardLast4 ? `**** ${body.cardLast4}` : null,
        approvalNo,
        status: 'COMPLETED',
        unpaid: 0,
        memo: body.orderMemo ?? null,
        branchId,
      })
      .select('id, productName, type, amount, paymentMethod, status, saleDate, cardCompany, approvalNo')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { error: lineError } = await supabase.from('sale_payment_lines').insert({
      saleId: sale.id,
      branchId,
      memberId,
      productId: Number.isFinite(productId) ? productId : null,
      productName,
      itemKey: body.productId ? String(body.productId) : null,
      lineType: 'PAYMENT',
      method: paymentMethod,
      amount,
      approvalNo,
      externalTransactionId: approvalNo,
      memo: body.orderMemo ?? null,
    });

    // 결제 원장(sales)은 생성됐으나 결제 라인 insert가 실패하면 원장 정합성이 깨진다.
    // 결제 자체는 완료로 처리하되, 정합성 불일치를 로깅하고 응답에 경고를 surface한다.
    if (lineError) {
      console.error('[payments] sale_payment_lines insert failed', { saleId: sale.id, error: lineError.message });
      return NextResponse.json({ success: true, data: sale, lineWarning: lineError.message }, { status: 201 });
    }

    return NextResponse.json({ success: true, data: sale }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
