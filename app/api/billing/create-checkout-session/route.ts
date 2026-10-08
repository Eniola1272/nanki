import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';
import { createCheckoutSession } from '@/lib/billing/stripe';
import type { PlanTier, BillingCycle } from '@/types/billing';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const plan = (body.plan as PlanTier) || 'PRO';
    const cycle = (body.cycle as BillingCycle) || 'monthly';

    if (plan !== 'PRO' && plan !== 'SCHOLAR') {
      return NextResponse.json({ error: 'Invalid plan tier for checkout.' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: profile } = await admin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${origin}/profile`;
    const cancelUrl = `${origin}/#pricing`;

    const result = await createCheckoutSession({
      userId: user.id,
      userEmail: user.email || '',
      plan,
      cycle,
      successUrl,
      cancelUrl,
      existingCustomerId: profile?.stripe_customer_id,
    });

    if (result.isMock) {
      // In local dev/mock mode, simulate subscription upgrade immediately
      await admin
        .from('profiles')
        .update({
          plan,
          subscription_status: 'ACTIVE',
          billing_cycle: cycle,
          is_premium: true,
          subscription_ends_at: new Date(
            Date.now() + (cycle === 'annual' ? 365 : 30) * 24 * 60 * 60 * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    return NextResponse.json({ url: result.url, isMock: result.isMock });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
