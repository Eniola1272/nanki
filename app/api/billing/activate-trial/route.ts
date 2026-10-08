import { NextResponse } from 'next/server';
import { createClient } from '@/lib/db/supabase-server';
import { createAdminClient } from '@/lib/db/supabase-admin';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();

    // Check existing profile
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, plan, subscription_status, has_used_trial, trial_ends_at')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    if (profile?.has_used_trial) {
      return NextResponse.json(
        { error: 'You have already used your 7-day free trial.' },
        { status: 400 }
      );
    }

    if (profile?.subscription_status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'You already have an active subscription.' },
        { status: 400 }
      );
    }

    const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await admin
      .from('profiles')
      .update({
        plan: 'PRO',
        subscription_status: 'TRIALING',
        trial_ends_at: trialEndsAt,
        has_used_trial: true,
        is_premium: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: '7-day Pro trial activated successfully.',
      plan: 'PRO',
      subscription_status: 'TRIALING',
      trial_ends_at: trialEndsAt,
      has_used_trial: true,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
