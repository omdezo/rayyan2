/**
 * Seed script to populate the Section collection with existing categories
 * Run this once to migrate existing hardcoded categories to the database
 *
 * Usage: npx tsx scripts/seed-sections.ts
 */

import mongoose from 'mongoose';
import Section from '../lib/models/Section';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const existingSections = [
    {
        key: 'ai-games',
        nameAr: 'ألعاب الذكاء الاصطناعي',
        nameEn: 'AI Games',
        descriptionAr: 'ألعاب تفاعلية مدعومة بالذكاء الاصطناعي',
        descriptionEn: 'Interactive games powered by artificial intelligence',
        icon: '🎮',
        isActive: true,
        order: 0,
    },
    {
        key: 'guidance',
        nameAr: 'عروض إرشادية',
        nameEn: 'Guidance',
        descriptionAr: 'عروض تقديمية إرشادية وتعليمية',
        descriptionEn: 'Educational and instructional presentations',
        icon: '📊',
        isActive: true,
        order: 1,
    },
    {
        key: 'general',
        nameAr: 'تصاميم عامة',
        nameEn: 'General Designs',
        descriptionAr: 'تصاميم رقمية متنوعة',
        descriptionEn: 'Various digital designs',
        icon: '🎨',
        isActive: true,
        order: 2,
    },
    {
        key: 'stories',
        nameAr: 'القصص',
        nameEn: 'Stories',
        descriptionAr: 'قصص تفاعلية ومحتوى سردي',
        descriptionEn: 'Interactive stories and narrative content',
        icon: '📚',
        isActive: true,
        order: 3,
    },
];

async function seedSections() {
    try {
        console.log('🔌 Connecting to MongoDB...');

        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🌱 Starting to seed sections...');

        for (const sectionData of existingSections) {
            const existingSection = await Section.findOne({ key: sectionData.key });

            if (existingSection) {
                console.log(`⏭️  Section "${sectionData.key}" already exists, skipping...`);
                continue;
            }

            const section = await Section.create(sectionData);
            console.log(`✅ Created section: ${section.nameAr} (${section.nameEn})`);
        }

        console.log('🎉 Seeding completed successfully!');
        console.log(`📊 Total sections in database: ${await Section.countDocuments()}`);

        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    } catch (error) {
        console.error('❌ Error seeding sections:', error);
        process.exit(1);
    }
}

seedSections();
