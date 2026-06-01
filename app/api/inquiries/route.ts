import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

export const runtime = 'nodejs';

const VALID_CATEGORIES = new Set(['이용문의', '결제문의', '시설문의', '수업문의', '기타']);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const memberId = Number(searchParams.get('memberId'));

    if (!Number.isFinite(memberId)) {
      return NextResponse.json({ error: 'memberId is required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('inquiries')
      .select('id, category, title, status, createdAt, answer')
      .eq('memberId', memberId)
      .order('createdAt', { ascending: false })
      .limit(20);

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
    const category = String(body.category ?? '').trim();
    const title = String(body.title ?? '').trim();
    const content = String(body.content ?? '').trim();

    if (!Number.isFinite(memberId) || !VALID_CATEGORIES.has(category) || title.length < 2 || content.length < 10) {
      return NextResponse.json({ error: 'invalid_inquiry_payload' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        memberId,
        memberName: body.memberName ?? null,
        branchId: body.branchId ?? null,
        category,
        title,
        content,
        status: '접수',
      })
      .select('id, category, title, status, createdAt')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data, message: '문의가 등록되었습니다' }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
