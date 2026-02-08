import { NextRequest } from 'next/server';
import { Resend } from 'resend';
import { successResponse, errorResponse, handleError, withDB } from '@/lib/api-utils';
import Order from '@/lib/models/Order';

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/send-order-email - Send order details and download links to customer
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderId } = body;

        if (!orderId) {
            return errorResponse('Order ID is required', 400);
        }

        return await withDB(async () => {
            // Fetch the order
            const order = await Order.findById(orderId).lean();

            if (!order) {
                return errorResponse('Order not found', 404);
            }

            // Only send email for completed orders
            if (order.status !== 'completed') {
                return errorResponse('Order must be completed to send email', 400);
            }

            const customerEmail = order.customerInfo.email;
            const customerName = order.customerInfo.name;

            // Generate download links for each item
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rayiandesign.com';

            // Build product list HTML
            const productListHtml = order.items.map((item: any) => {
                const languageLabel = item.language === 'ar' ? 'النسخة العربية' : 'English Version';
                return `
                    <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
                        <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 16px; font-weight: 600;">
                            ${item.title}
                        </h3>
                        ${item.language ? `
                            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                                ${languageLabel}
                            </p>
                        ` : ''}
                        <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                            السعر: ${item.price.toFixed(3)} ر.ع
                        </p>
                        ${item.fileUrl ? `
                            <a href="${appUrl}/ar/my-orders"
                               style="display: inline-block; background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                تحميل المنتج
                            </a>
                        ` : ''}
                    </div>
                `;
            }).join('');

            // Create email HTML
            const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تفاصيل طلبك - ريان للتصاميم</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 40px 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #111827; font-size: 28px; margin: 0 0 10px 0;">🎉 شكراً لك على الشراء!</h1>
            <p style="color: #6b7280; font-size: 16px; margin: 0;">طلبك جاهز للتحميل</p>
        </div>

        <!-- Order Info -->
        <div style="background-color: #f0fdfa; border-right: 4px solid: #10b981; padding: 20px; margin-bottom: 30px; border-radius: 8px;">
            <h2 style="margin: 0 0 12px 0; color: #059669; font-size: 18px;">معلومات الطلب</h2>
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
                <strong>رقم الطلب:</strong> #${order._id.toString().slice(-8).toUpperCase()}
            </p>
            <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
                <strong>العميل:</strong> ${customerName}
            </p>
            <p style="margin: 0; color: #374151; font-size: 14px;">
                <strong>الإجمالي:</strong> ${order.total.toFixed(3)} ر.ع
            </p>
        </div>

        <!-- Products -->
        <h2 style="color: #111827; font-size: 20px; margin: 0 0 16px 0;">منتجاتك:</h2>
        ${productListHtml}

        <!-- Download Instructions -->
        <div style="background-color: #fef3c7; border-right: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">📥 كيفية التحميل:</h3>
            <ol style="margin: 0; padding-right: 20px; color: #78350f; font-size: 14px; line-height: 1.8;">
                <li>اضغط على زر "تحميل المنتج" لكل منتج</li>
                <li>سيتم نقلك إلى صفحة طلباتك</li>
                <li>يمكنك تحميل المنتجات في أي وقت من صفحة "طلباتي"</li>
            </ol>
        </div>

        <!-- Usage Terms -->
        <div style="background-color: #fef2f2; border-right: 4px solid #ef4444; padding: 20px; margin: 30px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 12px 0; color: #991b1b; font-size: 16px;">⚠️ شروط الاستخدام:</h3>
            <p style="margin: 0; color: #7f1d1d; font-size: 13px; line-height: 1.6;">
                هذا المنتج الرقمي مخصص للاستخدام الشخصي فقط. يحق لك استخدامه وحفظه ونسخه لنفسك.
                يُرجى عدم مشاركته مع الآخرين أو إعادة بيعه. نشكرك على احترام حقوق الملكية. ❤️
            </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px 0;">
                هل تحتاج مساعدة؟ تواصل معنا عبر واتساب
            </p>
            <a href="https://wa.me/96895534007"
               style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-bottom: 20px;">
                تواصل معنا
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © ${new Date().getFullYear()} ريان للتصاميم. جميع الحقوق محفوظة.
            </p>
        </div>
    </div>
</body>
</html>
            `;

            // Send email using Resend
            const { data, error } = await resend.emails.send({
                from: 'ريان للتصاميم <noreply@send.rayiandesign.com>',
                to: customerEmail,
                subject: `🎉 طلبك جاهز! رقم الطلب #${order._id.toString().slice(-8).toUpperCase()}`,
                html: emailHtml,
            });

            if (error) {
                console.error('Resend error:', error);
                return errorResponse('Failed to send email: ' + error.message, 500);
            }

            console.log('✅ Order email sent successfully:', data);

            return successResponse({
                emailId: data?.id,
                sentTo: customerEmail,
            }, 'Email sent successfully');
        });
    } catch (error) {
        console.error('Send order email error:', error);
        return handleError(error);
    }
}
