import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withDB, handleError } from '@/lib/api-utils';
import User from '@/lib/models/User';
import { isTokenExpired } from '@/lib/token-utils';

// POST /api/auth/reset-password - Reset password with token
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token, newPassword } = body;

        if (!token || !newPassword) {
            return errorResponse('Token and new password are required', 400);
        }

        // Password validation (same as registration)
        if (newPassword.length < 8) {
            return errorResponse('كلمة المرور يجب أن تكون 8 أحرف على الأقل', 400);
        }
        if (!/[A-Z]/.test(newPassword)) {
            return errorResponse('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل', 400);
        }
        if (!/[a-z]/.test(newPassword)) {
            return errorResponse('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل', 400);
        }
        if (!/[0-9]/.test(newPassword)) {
            return errorResponse('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل', 400);
        }
        if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/]/.test(newPassword)) {
            return errorResponse('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل', 400);
        }

        return await withDB(async () => {
            const user = await User.findOne({ passwordResetToken: token });

            if (!user) {
                return errorResponse('رمز إعادة التعيين غير صالح', 400);
            }

            // Check if token expired
            if (isTokenExpired(user.passwordResetExpires)) {
                return errorResponse('انتهت صلاحية رمز إعادة التعيين. يرجى طلب رمز جديد', 400);
            }

            // Update password (will be hashed by pre-save hook)
            user.password = newPassword;
            user.passwordResetToken = null;
            user.passwordResetExpires = null;

            // Invalidate all sessions (logout everywhere)
            user.sessionVersion += 1;

            await user.save();

            console.log('✅ Password reset successful for user:', user.email);

            return successResponse({
                message: 'تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول',
            });
        });
    } catch (error) {
        return handleError(error);
    }
}
