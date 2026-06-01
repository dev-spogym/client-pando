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
      .from('app_payment_methods')
      .select('id, kind, company, last4, expiry, isDefault, enabled')
      .eq('memberId', memberId)
      .order('createdAt', { ascending: true });

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
    const kind = body.kind === 'naverpay' || body.kind === 'kakaopay' ? body.kind : 'card';
    const company = String(body.company ?? '').trim();
    const last4 = String(body.last4 ?? '').replace(/\D/g, '').slice(-4);

    if (!Number.isFinite(memberId) || !company || (kind === 'card' && last4.length !== 4)) {
      return NextResponse.json({ error: 'invalid_payment_method_payload' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { count } = await supabase
      .from('app_payment_methods')
      .select('id', { count: 'exact', head: true })
      .eq('memberId', memberId);

    const { data, error } = await supabase
      .from('app_payment_methods')
      .insert({
        memberId,
        kind,
        company,
        last4: kind === 'card' ? last4 : '****',
        expiry: body.expiry ?? null,
        isDefault: (count ?? 0) === 0,
        enabled: true,
      })
      .select('id, kind, company, last4, expiry, isDefault, enabled')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const memberId = Number(body.memberId);
    const id = Number(body.id);
    if (!Number.isFinite(memberId) || !Number.isFinite(id)) {
      return NextResponse.json({ error: 'memberId and id are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    if (body.isDefault === true) {
      await supabase.from('app_payment_methods').update({ isDefault: false }).eq('memberId', memberId);
    }

    const patch: Record<string, unknown> = {};
    if (typeof body.enabled === 'boolean') patch.enabled = body.enabled;
    if (typeof body.isDefault === 'boolean') patch.isDefault = body.isDefault;

    const { data, error } = await supabase
      .from('app_payment_methods')
      .update(patch)
      .eq('id', id)
      .eq('memberId', memberId)
      .select('id, kind, company, last4, expiry, isDefault, enabled')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const memberId = Number(body.memberId);
    const id = Number(body.id);
    if (!Number.isFinite(memberId) || !Number.isFinite(id)) {
      return NextResponse.json({ error: 'memberId and id are required' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from('app_payment_methods')
      .delete()
      .eq('id', id)
      .eq('memberId', memberId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
