import { NextRequest } from 'next/server';
import { successResponse, requireAdmin, withDB, handleError } from '@/lib/api-utils';
import Order from '@/lib/models/Order';
import User from '@/lib/models/User';
import Product from '@/lib/models/Product';

// GET /api/stats - Dashboard statistics (admin only)
export async function GET(req: NextRequest) {
    try {
        const { error: authError } = await requireAdmin(req);
        if (authError) return authError;

        return await withDB(async () => {
            // Calculate total sales from completed orders
            const salesResult = await Order.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$total' } } },
            ]);
            const totalSales = salesResult[0]?.total || 0;

            // Get total orders count
            const totalOrders = await Order.countDocuments();

            // Get products count
            const totalProducts = await Product.countDocuments({ status: 'active' });

            // Get users count
            const totalUsers = await User.countDocuments({ status: 'active' });

            // Get recent orders (last 5)
            const recentOrders = await Order.find()
                .sort({ date: -1 })
                .limit(5)
                .lean();

            // Generate sales chart data (simplified version)
            const now = new Date();
            const weekData = [];
            const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

            for (let i = 6; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));

                const dayOrders = await Order.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            date: { $gte: dayStart, $lte: dayEnd },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$total' } } },
                ]);

                weekData.push({
                    day: days[date.getDay()],
                    value: dayOrders[0]?.total || 0,
                });
            }

            // Month data (last 30 days)
            const monthData = [];
            for (let i = 29; i >= 0; i -= 5) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;

                const dayStart = new Date(date.setHours(0, 0, 0, 0));
                const dayEnd = new Date(date.setHours(23, 59, 59, 999));

                const dayOrders = await Order.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            date: { $gte: dayStart, $lte: dayEnd },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$total' } } },
                ]);

                monthData.push({
                    day: dateStr,
                    value: dayOrders[0]?.total || 0,
                });
            }

            // Year data (last 12 months)
            const yearData = [];
            const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

            for (let i = 11; i >= 0; i--) {
                const date = new Date(now);
                date.setMonth(date.getMonth() - i);
                const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
                const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

                const monthOrders = await Order.aggregate([
                    {
                        $match: {
                            status: 'completed',
                            date: { $gte: monthStart, $lte: monthEnd },
                        },
                    },
                    { $group: { _id: null, total: { $sum: '$total' } } },
                ]);

                yearData.push({
                    month: months[date.getMonth()],
                    value: monthOrders[0]?.total || 0,
                });
            }

            return successResponse({
                totalSales: {
                    value: `${totalSales.toFixed(3)} ر.ع`,
                    change: '+12%',
                    trend: 'up' as const,
                },
                totalOrders: {
                    value: totalOrders,
                    change: '+8%',
                    trend: 'up' as const,
                },
                products: {
                    value: totalProducts,
                    change: '+2',
                    trend: 'up' as const,
                },
                users: {
                    value: totalUsers,
                    change: '+5%',
                    trend: 'up' as const,
                },
                recentOrders,
                salesChartData: {
                    week: weekData,
                    month: monthData,
                    year: yearData,
                },
            });
        });
    } catch (error) {
        return handleError(error);
    }
}
