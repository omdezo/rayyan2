import mongoose from 'mongoose';

export interface ISection {
    _id: string;
    key: string; // Unique identifier (e.g., 'ai-games', 'guidance')
    nameAr: string; // Arabic name (e.g., 'عروض إرشادية')
    nameEn: string; // English name
    descriptionAr?: string; // Optional description in Arabic
    descriptionEn?: string; // Optional description in English
    icon?: string; // Optional icon name or emoji
    isActive: boolean; // Show/hide section
    order: number; // Display order
    createdAt: Date;
    updatedAt: Date;
}

const SectionSchema = new mongoose.Schema<ISection>(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        nameAr: {
            type: String,
            required: true,
            trim: true,
        },
        nameEn: {
            type: String,
            required: true,
            trim: true,
        },
        descriptionAr: {
            type: String,
            trim: true,
        },
        descriptionEn: {
            type: String,
            trim: true,
        },
        icon: {
            type: String,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Create index for faster queries
SectionSchema.index({ isActive: 1, order: 1 });

const Section = mongoose.models.Section || mongoose.model<ISection>('Section', SectionSchema);

export default Section;
