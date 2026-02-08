import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import User from '@/lib/models/User';
import { isTokenExpired } from '@/lib/token-utils';
import { getWelcomeEmailTemplate } from '@/lib/email-templates';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/auth/verify-email - Verify email with token
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return errorResponse('Token is required', 400);
        }

        return await withDB(async () => {
            const user = await User.findOne({ emailVerificationToken: token });

            if (!user) {
                return errorResponse('رمز التحقق غير صالح', 400);
            }

            // Check if already verified
            if (user.emailVerified) {
                return errorResponse('البريد الإلكتروني مؤكد بالفعل', 400);
            }

            // Check if token expired
            if (isTokenExpired(user.emailVerificationExpires)) {
                return errorResponse('انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد', 400);
            }

            // Verify email
            user.emailVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;
            await user.save();

            // Send welcome email (optional)
            try {
                const welcomeEmail = getWelcomeEmailTemplate(user.name);
                await resend.emails.send({
                    from: 'ريان للتصاميم <noreply@rayiandesign.com>',
                    to: user.email,
                    subject: welcomeEmail.subject,
                    html: welcomeEmail.html,
                });
            } catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Don't fail the verification if welcome email fails
            }

            console.log('✅ Email verified for user:', user.email);

            return successResponse({
                message: 'تم تأكيد بريدك الإلكتروني بنجاح!',
                verified: true,
            });
        });
    } catch (error) {
        return handleError(error);
    }
}
