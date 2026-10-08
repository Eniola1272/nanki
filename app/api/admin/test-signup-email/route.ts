import { NextResponse } from 'next/server';
import { sendNewUserSignupNotification, DEFAULT_ADMIN_EMAIL, DEFAULT_FROM_EMAIL } from '@/lib/email/resend';

/**
 * Diagnostic & test endpoint to verify Resend API key and domain setup.
 * Access via: GET /api/admin/test-signup-email
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const testRecipient = searchParams.get('to') || process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        success: false,
        error: 'RESEND_API_KEY environment variable is missing.',
        instructions:
          'Add RESEND_API_KEY=re_... to your .env.local file or Vercel Environment Variables.',
      },
      { status: 400 }
    );
  }

  const result = await sendNewUserSignupNotification({
    email: 'sample.student@gmail.com',
    name: 'Sample Test User',
    userId: 'test-user-id-12345',
    authMethod: 'email',
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    message: result.success
      ? `✅ Test signup email sent successfully to ${testRecipient}!`
      : `❌ Failed to send test email. See error details below.`,
    sender: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL,
    recipient: testRecipient,
    result,
  });
}
