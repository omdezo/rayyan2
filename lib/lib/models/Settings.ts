import mongoose, { Schema, Model } from 'mongoose';
import { ISettings } from '@/lib/types/models';

const SettingsSchema = new Schema<ISettings>({
    siteName: {
        type: String,
        default: 'ريان للتصميم',
    },
    siteDescription: {
        type: String,
        default: 'متجر للمنتجات الرقمية والتصاميم الإبداعية',
    },
    contactEmail: {
        type: String,
        trim: true,
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    socialLinks: {
        instagram: {
            type: String,
            trim: true,
        },
        twitter: {
            type: String,
            trim: true,
        },
        facebook: {
            type: String,
            trim: true,
        },
    },
}, {
    timestamps: true,
});

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);

export default Settings;
