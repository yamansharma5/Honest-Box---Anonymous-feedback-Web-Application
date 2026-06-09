import { resendClient  } from '@/lib/resend';
import { ApiResponse } from '@/types/ApiResponse';

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export async function sendVerificationEmail(
  email: string,
  username: string,
  verifyCode: string
): Promise<ApiResponse> {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured.');
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error('RESEND_FROM_EMAIL is not configured.');
    }

    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify/${encodeURIComponent(username)}`;
    const safeUsername = escapeHtml(username);
    const safeVerifyCode = escapeHtml(verifyCode);

    const { error } = await resendClient.emails.send({
      from: fromEmail,
      to: email,
      subject: 'Verification Code',
      html: `
        <div style="font-family:Arial,sans-serif;background:#f6f9fc;padding:32px;">
          <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:32px;border-radius:8px;">
            <h1 style="color:#333;font-size:24px;text-align:center;">Verify your email address</h1>
            <p style="color:#555;font-size:16px;line-height:26px;">Hi ${safeUsername},</p>
            <p style="color:#555;font-size:16px;line-height:26px;">Thanks for signing up. Use the code below to verify your email address.</p>
            <p style="color:#111;font-size:28px;font-weight:700;letter-spacing:4px;text-align:center;">${safeVerifyCode}</p>
            <p style="color:#555;font-size:16px;line-height:26px;">This code will expire in 1 hour.</p>
            <p style="text-align:center;">
              <a href="${verificationUrl}" style="display:inline-block;background:#5F51E8;color:#fff;padding:12px 20px;border-radius:4px;text-decoration:none;">Verify here</a>
            </p>
          </div>
        </div>
      `,
      text: `Hi ${username}, your verification code is ${verifyCode}. It expires in 1 hour. Verify here: ${verificationUrl}`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, message: 'Verification email sent successfully.' };
  } catch (emailError) {
    console.error('Error sending verification email:', emailError);
    return { success: false, message: 'Failed to send verification email.' };
  }
}
