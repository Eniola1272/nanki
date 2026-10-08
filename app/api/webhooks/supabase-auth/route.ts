import { NextResponse } from 'next/server';
import { sendNewUserSignupNotification } from '@/lib/email/resend';

/**
 * Supabase Database Webhook handler.
 * Triggered on INSERT to `public.profiles` or `auth.users` table.
 *
 * Configurable in Supabase Dashboard:
 * Database -> Webhooks -> Create Webhook:
 * - Table: public.profiles (or auth.users)
 * - Events: INSERT
 * - URL: https://your-domain.vercel.app/api/webhooks/supabase-auth
 * - HTTP Headers: x-webhook-secret: <your SUPABASE_WEBHOOK_SECRET>
 */
export async function POST(request: Request) {
  try {
    // 1. Optional Secret Verification
    const expectedSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    if (expectedSecret) {
      const authHeader =
        request.headers.get('x-webhook-secret') ||
        request.headers.get('authorization')?.replace('Bearer ', '');
      if (authHeader !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Parse payload
    const body = await request.json();
    const { type, table, record } = body;

    // We only care about new user inserts
    if (type && type !== 'INSERT') {
      return NextResponse.json({ message: `Ignored event type: ${type}` });
    }

    const email = record?.email || record?.raw_user_meta_data?.email;
    const name =
      record?.name ||
      record?.raw_user_meta_data?.full_name ||
      record?.raw_user_meta_data?.name ||
      null;
    const userId = record?.id || null;
    const createdAt = record?.created_at || new Date().toISOString();

    if (!email) {
      console.warn('[Webhook supabase-auth] Received insert without email:', record);
      return NextResponse.json({ message: 'No email found in record' });
    }

    // 3. Send email via Resend from @alignmindsetinitiative.com.ng
    const result = await sendNewUserSignupNotification({
      email,
      name,
      userId,
      createdAt,
      authMethod: table === 'profiles' ? 'new profile' : 'auth user',
    });

    return NextResponse.json({
      success: true,
      emailSent: result.success,
      details: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Webhook supabase-auth Exception]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/webhooks/supabase-auth',
    senderDomain: 'alignmindsetinitiative.com.ng',
    resendConfigured: Boolean(process.env.RESEND_API_KEY),
  });
}
