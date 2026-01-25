/**
 * Create the ONE and ONLY admin user for the system
 * Run this once: node scripts/create-admin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
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

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'admin@rayiandesign.com' });

        if (existingAdmin) {
            console.log('⚠️  Admin user already exists!');
            console.log('📧 Email: admin@rayiandesign.com');
            console.log('👤 Name:', existingAdmin.name);
            console.log('👑 Role:', existingAdmin.role);

            // Update password if needed
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Admin@123.rayyan', salt);
            existingAdmin.password = hashedPassword;
            existingAdmin.role = 'admin';
            existingAdmin.status = 'active';
            await existingAdmin.save();

            console.log('✅ Admin password updated to: Admin@123.rayyan');
            console.log('');
            console.log('🔗 Login at: https://rayiandesign.com/login');
            process.exit(0);
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@123.rayyan', salt);

        // Create admin user
        const admin = new User({
            name: 'Admin Rayan',
            email: 'admin@rayiandesign.com',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
            joinDate: new Date(),
        });

        await admin.save();

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📋 Admin Credentials:');
        console.log('   Email: admin@rayiandesign.com');
        console.log('   Password: Admin@123.rayyan');
        console.log('   Name: Admin Rayan');
        console.log('   Role: admin');
        console.log('');
        console.log('🔗 Login at: https://rayiandesign.com/login');
        console.log('🎛️  Dashboard: https://rayiandesign.com/dashboard');
        console.log('');
        console.log('⚠️  IMPORTANT: Keep these credentials secure!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createAdmin();
