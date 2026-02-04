import mongoose, { Schema, Model } from 'mongoose';
import { IDiscountCode } from '@/lib/types/models';

const DiscountCodeSchema = new Schema<IDiscountCode>({
    code: {
        type: String,
        required: [true, 'Discount code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [3, 'Code must be at least 3 characters'],
        maxlength: [20, 'Code must be less than 20 characters'],
    },
    discountPercent: {
        type: Number,
        required: [true, 'Discount percentage is required'],
        min: [1, 'Discount must be at least 1%'],
        max: [100, 'Discount cannot exceed 100%'],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    usageLimit: {
        type: Number,
        min: [0, 'Usage limit cannot be negative'],
        default: null, // null means unlimited
    },
    usedCount: {
        type: Number,
        default: 0,
        min: [0, 'Used count cannot be negative'],
    },
    validFrom: {
        type: Date,
        default: null, // null means valid from creation
    },
    validUntil: {
        type: Date,
        default: null, // null means no expiry
    },
    minPurchaseAmount: {
        type: Number,
        min: [0, 'Minimum purchase amount cannot be negative'],
        default: 0,
    },
    description: {
        type: String,
        default: '',
    },
}, {
    timestamps: true,
});

// Index for faster queries
DiscountCodeSchema.index({ code: 1 });
DiscountCodeSchema.index({ isActive: 1 });

// Method to check if code is valid
DiscountCodeSchema.methods.isValid = function(purchaseAmount: number = 0): { valid: boolean; reason?: string } {
    // Check if active
    if (!this.isActive) {
        return { valid: false, reason: 'Discount code is inactive' };
    }

    // Check usage limit
    if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
        return { valid: false, reason: 'Discount code has reached its usage limit' };
    }

    // Check validity dates
    const now = new Date();
    if (this.validFrom && now < this.validFrom) {
        return { valid: false, reason: 'Discount code is not yet valid' };
    }
    if (this.validUntil && now > this.validUntil) {
        return { valid: false, reason: 'Discount code has expired' };
    }

    // Check minimum purchase amount
    if (purchaseAmount < this.minPurchaseAmount) {
        return { valid: false, reason: `Minimum purchase amount is ${this.minPurchaseAmount.toFixed(3)} OMR` };
    }

    return { valid: true };
};

const DiscountCode: Model<IDiscountCode> = mongoose.models.DiscountCode || mongoose.model<IDiscountCode>('DiscountCode', DiscountCodeSchema);

export default DiscountCode;
