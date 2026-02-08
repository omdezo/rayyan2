import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '@/lib/types/models';

const LanguageVariantSchema = new Schema({
    lang: {
        type: String,
        required: true,
        enum: ['ar', 'en'],
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price cannot be negative'],
    },
    fileUrl: {
        type: String,
        default: '',
    },
    fileName: {
        type: String,
        default: '',
    },
}, { _id: false });

const ProductMediaSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['image', 'video'],
    },
    url: {
        type: String,
        required: true,
    },
    thumbnail: {
        type: String,
        default: '',
    },
    order: {
        type: Number,
        required: true,
        min: 0,
    },
    caption: {
        type: String,
        default: '',
    },
}, { _id: false });

const ProductSchema = new Schema<IProduct>({
    titleAr: {
        type: String,
        trim: true,
    },
    titleEn: {
        type: String,
        trim: true,
    },
    descriptionAr: {
        type: String,
    },
    descriptionEn: {
        type: String,
    },
    // Keep for backward compatibility
    title: {
        type: String,
        trim: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        default: 0, // Keep for backward compatibility, will be calculated from languages
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['ai-games', 'guidance', 'general', 'stories'],
            message: '{VALUE} is not a valid category',
        },
    },
    subcategory: {
        type: String,
        trim: true,
    },
    image: {
        type: String,
        required: [true, 'Product image is required'],
    },
    media: {
        type: [ProductMediaSchema],
        default: [],
    },
    languages: {
        type: [LanguageVariantSchema],
        default: [],
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive'],
            message: '{VALUE} is not a valid status',
        },
        default: 'active',
    },
}, {
    timestamps: true,
});

// Index for faster queries
ProductSchema.index({ category: 1, status: 1 });
ProductSchema.index({
    titleAr: 'text',
    titleEn: 'text',
    descriptionAr: 'text',
    descriptionEn: 'text',
    title: 'text',
    description: 'text'
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
