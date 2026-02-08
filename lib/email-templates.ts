/**
 * Base email template with RTL support
 */
function baseEmailTemplate(content: string): string {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        ${content}

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ريان للتصاميم. جميع الحقوق محفوظة.
            </p>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 10px;">
                إذا لم تطلب هذا البريد الإلكتروني، يمكنك تجاهله بأمان.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

/**
 * Email verification template
 */
export function getVerificationEmailTemplate(verificationLink: string, userName: string): {
    subject: string;
    html: string;
} {
    const content = `
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 28px; margin: 0 0 10px 0;">✉️ تأكيد البريد الإلكتروني</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">مرحباً ${userName}!</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #f0fdfa; border-right: 4px solid #10b981; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: right;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; text-align: right;">
                شكراً لتسجيلك في ريان للتصاميم! لإكمال إنشاء حسابك، يرجى تأكيد بريدك الإلكتروني بالنقر على الزر أدناه:
            </p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${verificationLink}"
                   style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                    ✓ تأكيد البريد الإلكتروني
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: right;">
                هذا الرابط صالح لمدة 10 دقائق فقط.
            </p>
        </div>

        <!-- Alternative Link -->
        <div style="background-color: #fef3c7; border-right: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: right;">
            <p style="margin: 0 0 10px 0; color: #92400e; font-size: 14px; font-weight: 600; text-align: right;">
                لا يعمل الزر؟
            </p>
            <p style="margin: 0; color: #78350f; font-size: 13px; text-align: right; word-break: break-all;">
                انسخ والصق هذا الرابط في متصفحك:<br/>
                <a href="${verificationLink}" style="color: #0066cc;">${verificationLink}</a>
            </p>
        </div>
    `;

    return {
        subject: '✉️ تأكيد البريد الإلكتروني - ريان للتصاميم',
        html: baseEmailTemplate(content),
    };
}

/**
 * Password reset email template
 */
export function getPasswordResetEmailTemplate(resetLink: string, userName: string): {
    subject: string;
    html: string;
} {
    const content = `
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 28px; margin: 0 0 10px 0;">🔐 إعادة تعيين كلمة المرور</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">مرحباً ${userName}</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #fef2f2; border-right: 4px solid #ef4444; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: right;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; text-align: right;">
                تلقينا طلباً لإعادة تعيين كلمة مرور حسابك. انقر على الزر أدناه لإنشاء كلمة مرور جديدة:
            </p>
            <div style="text-align: center; margin: 25px 0;">
                <a href="${resetLink}"
                   style="display: inline-block; background-color: #ef4444; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3);">
                    🔑 إعادة تعيين كلمة المرور
                </a>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: right;">
                هذا الرابط صالح لمدة 10 دقائق فقط.
            </p>
        </div>

        <!-- Security Warning -->
        <div style="background-color: #fef3c7; border-right: 4px solid #f59e0b; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: right;">
            <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px; text-align: right;">⚠️ تنبيه أمني:</h3>
            <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.6; text-align: right;">
                إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني. حسابك آمن ولن يتم إجراء أي تغييرات.
            </p>
        </div>

        <!-- Alternative Link -->
        <div style="text-align: right;">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600;">
                لا يعمل الزر؟
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 13px; word-break: break-all;">
                انسخ والصق هذا الرابط في متصفحك:<br/>
                <a href="${resetLink}" style="color: #0066cc;">${resetLink}</a>
            </p>
        </div>
    `;

    return {
        subject: '🔐 إعادة تعيين كلمة المرور - ريان للتصاميم',
        html: baseEmailTemplate(content),
    };
}

/**
 * Welcome email after verification (optional)
 */
export function getWelcomeEmailTemplate(userName: string): {
    subject: string;
    html: string;
} {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rayiandesign.com';

    const content = `
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 28px; margin: 0 0 10px 0;">🎉 مرحباً بك في ريان للتصاميم!</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">مرحباً ${userName}</p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #f0fdfa; border-right: 4px solid #10b981; padding: 20px; margin-bottom: 30px; border-radius: 8px; text-align: right;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; text-align: right;">
                تم تأكيد بريدك الإلكتروني بنجاح! 🎊
            </p>
            <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0; text-align: right;">
                يمكنك الآن الاستمتاع بجميع منتجاتنا الرقمية الإبداعية.
            </p>
        </div>

        <!-- CTA -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/ar/products"
               style="display: inline-block; background-color: #10b981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">
                🛍️ تصفح المنتجات
            </a>
        </div>
    `;

    return {
        subject: '🎉 مرحباً بك! تم تفعيل حسابك',
        html: baseEmailTemplate(content),
    };
}
