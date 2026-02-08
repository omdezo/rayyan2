import dotenv from 'dotenv';
import path from 'path';
import connectDB from './mongodb';
import User from './models/User';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Migration script to add email verification fields to existing users
 * Run this once with: npx tsx lib/migrate-users.ts
 */
async function migrateExistingUsers() {
    try {
        await connectDB();

        console.log('🔄 Starting user migration...');

        const result = await User.updateMany(
            {
                // Only update users that don't have the new fields
                emailVerified: { $exists: false },
            },
            {
                $set: {
                    // Mark existing users as verified (grandfather clause)
                    emailVerified: true,
                    sessionVersion: 1,
                    emailVerificationToken: null,
                    emailVerificationExpires: null,
                    passwordResetToken: null,
                    passwordResetExpires: null,
                    lastVerificationEmailSent: null,
                    lastPasswordResetEmailSent: null,
                },
            }
        );

        console.log(`✅ Migration complete! Updated ${result.modifiedCount} users`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrateExistingUsers();
