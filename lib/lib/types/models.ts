export interface IProduct {
    _id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    image: string;
    status: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    status: 'active' | 'inactive' | 'banned';
    joinDate: Date;
}

export interface IOrder {
    _id: string;
    userId?: string;
    customerInfo: {
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        productId: string;
        title: string;
        price: number;
    }>;
    total: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: 'card' | 'apple' | 'paypal';
    date: Date;
}

export interface ISettings {
    _id: string;
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    socialLinks: {
        instagram?: string;
        twitter?: string;
        facebook?: string;
    };
}
