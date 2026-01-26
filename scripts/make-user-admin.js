/**
 * Script to make a user an admin
 * Usage: node scripts/make-user-admin.js user@email.com
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function makeUserAdmin(email) {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get User model
        const User = mongoose.model('User', new mongoose.Schema({
            name: String,
            email: String,
            password: String,
            role: String,
            status: String,
            joinDate: Date,
        }));

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.error(`❌ User not found with email: ${email}`);
            process.exit(1);
        }

        // Update role to admin
        user.role = 'admin';
        await user.save();

        console.log('✅ User updated successfully!');
        console.log(`📧 Email: ${user.email}`);
        console.log(`👤 Name: ${user.name}`);
        console.log(`👑 Role: ${user.role}`);
        console.log('');
        console.log('You can now access the dashboard at: https://rayiandesign.com/dashboard');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
    console.error('❌ Please provide an email address');
    console.log('Usage: node scripts/make-user-admin.js user@email.com');
    process.exit(1);
}

makeUserAdmin(email);
