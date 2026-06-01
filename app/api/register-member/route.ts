import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/server/supabaseAdmin';

/** 전화번호를 숫자만 남겨 비교한다(하이픈/공백 표기 차이 흡수). */
function normalizePhone(value: unknown): string {
  return String(value ?? '').replace(/\D/g, '');
}

export async function POST(req: Request) {
  const body = await req.json();
  const metadata = body.user_metadata ?? {};
  const email = body.email;
  const password = body.password;
  const memberId = body.memberId ?? metadata.member_id;
  const phone = body.phone ?? metadata.phone;
  const name = body.name ?? metadata.name;

  if (!email || !password || !phone) {
    return NextResponse.json(
      { error: 'email, password, phone are required' },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase admin environment variables are missing' },
      { status: 500 }
    );
  }

  // 가입 가드: 임의 계정 대량 생성을 막기 위해, CRM(members)에 실제로 존재하는
  // 회원(전화번호 일치)에 대해서만 앱 계정 연동을 허용한다(MA-002 CRM 회원 연동).
  // (SMS 본인 인증이 1차 게이트이며, 이 검증은 서버 측 방어선이다.)
  try {
    const admin = createSupabaseAdminClient();
    const { data: members, error: lookupError } = await admin
      .from('members')
      .select('id, phone')
      .limit(2000);

    if (lookupError) {
      return NextResponse.json({ error: lookupError.message }, { status: 500 });
    }

    const target = normalizePhone(phone);
    const matched = (members ?? []).find((m) => normalizePhone(m.phone) === target);
    if (!matched) {
      return NextResponse.json(
        { error: '등록된 회원 정보를 찾을 수 없습니다. 센터에 회원 등록 후 다시 시도해주세요.' },
        { status: 403 }
      );
    }
    // memberId가 함께 전달되면 전화번호의 실제 회원과 일치하는지 확인한다.
    if (memberId != null && Number(memberId) !== Number(matched.id)) {
      return NextResponse.json(
        { error: '회원 정보가 일치하지 않습니다.' },
        { status: 403 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'member_lookup_failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        email_confirm: body.email_confirm ?? true,
        user_metadata: { member_id: memberId, phone, name },
      }),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
