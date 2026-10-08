import { NextResponse } from 'next/server';
import { sendNewUserSignupNotification } from '@/lib/email/resend';

/**
 * Direct client/app signup notification endpoint.
 * Called immediately upon successful signup form submission.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, method, userId } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = await sendNewUserSignupNotification({
      email,
      name,
      userId,
      authMethod: method || 'email',
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Notify Signup Route Error]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
