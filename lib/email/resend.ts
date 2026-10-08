import { Resend } from 'resend';

// Default sender using your custom domain
export const DEFAULT_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || 'Nanki <notifications@alignmindsetinitiative.com.ng>';

// Admin recipient who should receive the signup alerts
export const DEFAULT_ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || 'eniolaadesina43@gmail.com';

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Resend(apiKey);
}

export interface SignupNotificationPayload {
  email: string;
  name?: string | null;
  userId?: string | null;
  authMethod?: 'email' | 'google' | 'oauth' | string;
  createdAt?: string;
}

/**
 * Sends an email notification to the administrator whenever a new user signs up.
 * Powered by Resend, sending from @alignmindsetinitiative.com.ng.
 */
export async function sendNewUserSignupNotification(payload: SignupNotificationPayload) {
  const resend = getResendClient();
  const toEmail = process.env.ADMIN_NOTIFICATION_EMAIL || DEFAULT_ADMIN_EMAIL;
  const fromEmail = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

  if (!resend) {
    console.warn(
      '[Resend Email] RESEND_API_KEY is not configured in environment variables. Signup notification skipped.'
    );
    return { success: false, error: 'RESEND_API_KEY_MISSING' };
  }

  const userName = payload.name?.trim() || 'New Learner';
  const userEmail = payload.email || 'No email provided';
  const method = payload.authMethod || 'email';
  const signupDate = payload.createdAt
    ? new Date(payload.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });

  const subject = `🎉 New Nanki Sign-up: ${userName} (${userEmail})`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>New User Sign-up</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f7f6f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #23221e;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f7f6f2; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e7e5df; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px; background-color: #624187; color: #ffffff;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">nanki<span style="color: #ffd88a;">.</span></span>
                    <span style="display: block; font-size: 12px; opacity: 0.85; margin-top: 4px; text-transform: uppercase; letter-spacing: 1px;">Admin Notification</span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,0.18); font-size: 11px; font-weight: 600; color: #ffffff;">
                      New User
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="font-size: 20px; font-weight: 700; margin: 0 0 12px 0; color: #23221e;">
                Someone just joined Nanki! 🚀
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #5a5750; margin: 0 0 24px 0;">
                A new learner has created an account on your platform. Here are the details:
              </p>

              <!-- User Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf9f6; border: 1px solid #eeece6; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size: 13px;">
                      <tr>
                        <td width="32%" style="color: #837f76; font-weight: 600;">Name</td>
                        <td style="color: #23221e; font-weight: 700;">${userName}</td>
                      </tr>
                      <tr>
                        <td style="color: #837f76; font-weight: 600;">Email</td>
                        <td style="color: #624187; font-weight: 600;"><a href="mailto:${userEmail}" style="color: #624187; text-decoration: none;">${userEmail}</a></td>
                      </tr>
                      <tr>
                        <td style="color: #837f76; font-weight: 600;">Sign-up Method</td>
                        <td style="color: #23221e; text-transform: capitalize;">${method === 'google' ? 'Google OAuth' : 'Email & Password'}</td>
                      </tr>
                      <tr>
                        <td style="color: #837f76; font-weight: 600;">Registered At</td>
                        <td style="color: #23221e;">${signupDate}</td>
                      </tr>
                      ${
                        payload.userId
                          ? `<tr>
                        <td style="color: #837f76; font-weight: 600;">User ID</td>
                        <td style="color: #837f76; font-family: monospace; font-size: 11px;">${payload.userId}</td>
                      </tr>`
                          : ''
                      }
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="https://supabase.com/dashboard" target="_blank" style="display: inline-block; background-color: #624187; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: 700; padding: 12px 28px; border-radius: 999px; box-shadow: 0 2px 8px rgba(98, 65, 135, 0.25);">
                      View User in Supabase Dashboard
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #faf9f6; border-top: 1px solid #eeece6; font-size: 11px; color: #9c978d; text-align: center;">
              Sent via <strong style="color: #624187;">Resend</strong> from domain <strong style="color: #23221e;">alignmindsetinitiative.com.ng</strong> for Nanki.
              <br />You can change notification preferences in your environment variables.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject,
      html,
    });

    if (error) {
      console.error('[Resend Email Error]', error);
      return { success: false, error: error.message };
    }

    console.log('[Resend Email Success] Sent signup notification for', userEmail, 'ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[Resend Email Exception]', msg);
    return { success: false, error: msg };
  }
}
