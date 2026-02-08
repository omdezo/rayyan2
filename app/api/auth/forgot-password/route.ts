import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import User from '@/lib/models/User';
import { generateToken, getTokenExpiration, canSendEmail } from '@/lib/token-utils';
import { getPasswordResetEmailTemplate } from '@/lib/email-templates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/forgot-password - Request password reset
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return errorResponse('Email is required', 400);
        }

        return await withDB(async () => {
            const user = await User.findOne({ email: email.toLowerCase() });

            // Security: Always return success even if user not found (prevent email enumeration)
            if (!user) {
                console.log('Password reset requested for non-existent email:', email);
                return successResponse({
                    message: 'إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة تعيين كلمة المرور',
                });
            }

            // OAuth users can't reset password
            if (!user.password) {
                return errorResponse('حساب Google لا يمكن إعادة تعيين كلمة المرور له', 400);
            }

            // Rate limiting
            const rateLimitCheck = canSendEmail(user.lastPasswordResetEmailSent);
            if (!rateLimitCheck.allowed) {
                return errorResponse(
                    `يرجى الانتظار ${rateLimitCheck.waitTime} ثانية قبل إعادة المحاولة`,
                    429
                );
            }

            // Generate reset token
            const token = generateToken();
            const expires = getTokenExpiration();

            user.passwordResetToken = token;
            user.passwordResetExpires = expires;
            user.lastPasswordResetEmailSent = new Date();
            await user.save();

            // Create reset link
            const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/ar/auth/reset-password?token=${token}`;

            // Send email
            const emailTemplate = getPasswordResetEmailTemplate(resetLink, user.name);

            const { data, error: resendError } = await resend.emails.send({
                from: 'ريان للتصاميم <noreply@rayiandesign.com>',
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
            });

            if (resendError) {
                console.error('Resend error:', resendError);
                return errorResponse('Failed to send reset email', 500);
            }

            console.log('✅ Password reset email sent:', data);

            return successResponse({
                message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
                emailId: data?.id,
            });
        });
    } catch (error) {
        return handleError(error);
    }
}
