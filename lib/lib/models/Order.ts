import mongoose, { Schema, Model } from 'mongoose';
import { IOrder } from '@/lib/types/models';

const OrderSchema = new Schema<IOrder>({
    userId: {
        type: String,
        ref: 'User',
    },
    customerInfo: {
        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Customer email is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Customer phone is required'],
            trim: true,
        },
    },
    items: [{
        productId: {
            type: String,
            ref: 'Product',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    }],
    total: {
        type: Number,
        required: [true, 'Order total is required'],
        min: [0, 'Total cannot be negative'],
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed'],
            message: '{VALUE} is not a valid status',
        },
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['card', 'apple', 'paypal'],
            message: '{VALUE} is not a valid payment method',
        },
        required: [true, 'Payment method is required'],
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Index for faster queries
OrderSchema.index({ userId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ date: -1 });

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
