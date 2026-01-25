export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
}

export interface DashboardStats {
    totalSales: {
        value: string;
        change: string;
        trend: 'up' | 'down';
    };
    totalOrders: {
        value: number;
        change: string;
        trend: 'up' | 'down';
    };
    products: {
        value: number;
        change: string;
        trend: 'up' | 'down';
    };
    users: {
        value: number;
        change: string;
        trend: 'up' | 'down';
    };
    recentOrders: Array<{
        _id: string;
        customerInfo: {
            name: string;
        };
        items: Array<{
            title: string;
            price: number;
        }>;
        total: number;
        status: string;
        date: Date;
    }>;
    salesChartData: {
        week: Array<{ day: string; value: number }>;
        month: Array<{ day: string; value: number }>;
        year: Array<{ month: string; value: number }>;
    };
}
