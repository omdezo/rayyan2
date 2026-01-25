// List recent orders
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function listOrders() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        const orders = await Order.find().sort({ date: -1 }).limit(10);

        console.log(`📋 Recent Orders (${orders.length}):`);
        console.log('─────────────────────────────────────────');

        orders.forEach((order, idx) => {
            console.log(`\n${idx + 1}. Order ID: ${order._id.toString()}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment Status: ${order.paymentStatus || 'NOT SET'}`);
            console.log(`   Total: ${order.total} OMR`);
            console.log(`   Customer: ${order.customerInfo?.name || 'N/A'}`);
            console.log(`   Date: ${order.date}`);
        });

        if (orders.length === 0) {
            console.log('\n❌ No orders found in database');
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

listOrders();
