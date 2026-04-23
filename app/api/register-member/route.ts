import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password, memberId, phone, name } = await req.json();

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
        email_confirm: true,
        user_metadata: { member_id: memberId, phone, name },
      }),
    });

    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 });
  }
}
