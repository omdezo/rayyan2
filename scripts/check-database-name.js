/**
 * Check which database the admin user is in
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function checkDatabaseName() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📊 Connection String:', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));
        console.log('📊 Database Name:', mongoose.connection.db.databaseName);
        console.log('');

        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Collections in this database:');
        collections.forEach(col => {
            console.log(`   - ${col.name}`);
        });
        console.log('');

        // Check users collection
        const usersCount = await mongoose.connection.db.collection('users').countDocuments();
        console.log(`👥 Total users in database: ${usersCount}`);
        console.log('');

        // Find admin
        const admin = await mongoose.connection.db.collection('users').findOne({
            email: 'admin@rayiandesign.com'
        });

        if (admin) {
            console.log('✅ Admin user found in database!');
            console.log('   Email:', admin.email);
            console.log('   Name:', admin.name);
            console.log('   Role:', admin.role);
        } else {
            console.log('❌ Admin user NOT found in this database');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDatabaseName();
