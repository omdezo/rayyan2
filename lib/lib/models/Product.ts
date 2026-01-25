import mongoose, { Schema, Model } from 'mongoose';
import { IProduct } from '@/lib/types/models';

const ProductSchema = new Schema<IProduct>({
    title: {
        type: String,
        required: [true, 'Product title is required'],
        trim: true,
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative'],
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
ProductSchema.index({ title: 'text', description: 'text' });

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
