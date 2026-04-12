import {Resend} from "resend";
import {ApiResponse} from "../types/ApiResponse";
export const resendClient = new Resend (process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, username: string, verifyCode: string): Promise<ApiResponse> {
    try {
        await resendClient.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verify Your Email Address',
            react  : `<p>Hi ${username},</p>
                   <p>Thank you for registering on our platform. Please use the following verification code to verify your email address:</p>
                   <h2>${verifyCode}</h2>
                    <p>This code will expire in 15 minutes.</p>    
                    <p>If you did not create an account, please ignore this email.</p>
                    <p>Best regards,<br/>Ananomous Platform Team</p>`
        });

        return {
            success: true,
            message: 'Verification email sent successfully.'
        }
    }catch (emailError) {
        console.error('Error sending verification email:', emailError);
        return {
            success: false,
            message: 'Failed to send verification email. Please try again later.'
        };
    }  
}
