import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError, requireAuth } from '@/lib/api-utils';
import User from '@/lib/models/User';
import { generateToken, getTokenExpiration, canSendEmail } from '@/lib/token-utils';
import { getVerificationEmailTemplate } from '@/lib/email-templates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/send-verification - Send or resend verification email
export async function POST(req: NextRequest) {
    try {
        const { error, session } = await requireAuth(req);
        if (error) return error;

        const userId = (session!.user as any).id;

        return await withDB(async () => {
            const user = await User.findById(userId);

            if (!user) {
                return errorResponse('User not found', 404);
            }

            // Already verified
            if (user.emailVerified) {
                return errorResponse('البريد الإلكتروني مؤكد بالفعل', 400);
            }

            // Rate limiting check
            const rateLimitCheck = canSendEmail(user.lastVerificationEmailSent);
            if (!rateLimitCheck.allowed) {
                return errorResponse(
                    `يرجى الانتظار ${rateLimitCheck.waitTime} ثانية قبل إعادة المحاولة`,
                    429
                );
            }

            // Generate new token
            const token = generateToken();
            const expires = getTokenExpiration();

            // Update user
            user.emailVerificationToken = token;
            user.emailVerificationExpires = expires;
            user.lastVerificationEmailSent = new Date();
            await user.save();

            // Create verification link
            const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL}/ar/auth/verify-email?token=${token}`;

            // Send email
            const emailTemplate = getVerificationEmailTemplate(verificationLink, user.name);

            const { data, error: resendError } = await resend.emails.send({
                from: 'ريان للتصاميم <noreply@rayiandesign.com>',
                to: user.email,
                subject: emailTemplate.subject,
                html: emailTemplate.html,
            });

            if (resendError) {
                console.error('Resend error:', resendError);
                return errorResponse('Failed to send verification email', 500);
            }

            console.log('✅ Verification email sent:', data);

            return successResponse({
                message: 'تم إرسال رسالة التحقق إلى بريدك الإلكتروني',
                emailId: data?.id,
            });
        });
    } catch (error) {
        return handleError(error);
    }
}
