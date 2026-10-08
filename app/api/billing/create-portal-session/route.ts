import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { createCustomerPortalSession } from '@/lib/billing/stripe';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${origin}/profile`;

    if (!profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active billing customer found. Upgrade to a paid plan first.' },
        { status: 400 }
      );
    }

    const result = await createCustomerPortalSession(profile.stripe_customer_id, returnUrl);
    return NextResponse.json({ url: result.url, isMock: result.isMock });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
