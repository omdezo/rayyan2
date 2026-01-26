/**
 * Check if admin user exists and verify password
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Define User schema
        const UserSchema = new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: String,
            status: String,
            joinDate: Date,
        });

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Find admin user
        const admin = await User.findOne({ email: 'admin@rayiandesign.com' });

        if (!admin) {
            console.log('❌ Admin user NOT found in database!');
            console.log('');
            console.log('Run this to create admin:');
            console.log('node scripts/create-admin.js');
            process.exit(1);
        }

        console.log('✅ Admin user found in database!');
        console.log('');
        console.log('📋 Admin Details:');
        console.log('   Email:', admin.email);
        console.log('   Name:', admin.name);
        console.log('   Role:', admin.role);
        console.log('   Status:', admin.status);
        console.log('   Join Date:', admin.joinDate);
        console.log('');

        // Test password
        const testPassword = 'Admin@123.rayyan';
        const isMatch = await bcrypt.compare(testPassword, admin.password);

        if (isMatch) {
            console.log('✅ Password verification: SUCCESS');
            console.log(`   Password "${testPassword}" matches!`);
        } else {
            console.log('❌ Password verification: FAILED');
            console.log(`   Password "${testPassword}" does NOT match!`);
            console.log('');
            console.log('Run this to reset password:');
            console.log('node scripts/create-admin.js');
        }

        console.log('');
        console.log('🔗 Try logging in at: https://rayiandesign.com/login');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAdmin();
