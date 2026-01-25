export interface ILanguageVariant {
    lang: 'ar' | 'en';
    price: number;
    fileUrl?: string;
}

export interface IProductMedia {
    id: string;              // Unique identifier for each media item
    type: 'image' | 'video'; // Media type
    url: string;             // R2 key for the media file
    thumbnail?: string;      // R2 key for video thumbnail (optional)
    order: number;           // Order in gallery (0-indexed)
    caption?: string;        // Optional caption/description
}

export interface IProduct {
    _id: string;
    title: string;
    description: string;
    price: number; // For backward compatibility
    category: string;
    subcategory?: string;
    image: string;                // Primary/cover image (keep for backward compatibility)
    media?: IProductMedia[];      // NEW: Media gallery (images and videos)
    languages: ILanguageVariant[];
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
        language?: 'ar' | 'en';
        fileUrl?: string;
    }>;
    total: number;
    status: 'pending' | 'completed' | 'failed';
    paymentMethod: 'card' | 'apple' | 'paypal';
    thawaniSessionId?: string;
    thawaniInvoice?: string;
    paymentStatus?: 'unpaid' | 'paid' | 'failed';
    paymentId?: string;
    paidAt?: Date;
    failureReason?: string;
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
