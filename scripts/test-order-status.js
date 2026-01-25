// Check order status in database
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const orderId = process.argv[2];

if (!orderId) {
    console.log('Usage: node scripts/test-order-status.js <orderId>');
    process.exit(1);
}

async function checkOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));
        const order = await Order.findById(orderId);

        if (!order) {
            console.log('❌ Order not found');
            process.exit(1);
        }

        console.log('📦 Order Details:');
        console.log('─────────────────────────────────────────');
        console.log('Order ID:', order._id.toString());
        console.log('Status:', order.status);
        console.log('Payment Status:', order.paymentStatus || 'NOT SET');
        console.log('Payment Method:', order.paymentMethod);
        console.log('Total:', order.total);
        console.log('Thawani Session ID:', order.thawaniSessionId || 'NOT SET');
        console.log('Thawani Invoice:', order.thawaniInvoice || 'NOT SET');
        console.log('Payment ID:', order.paymentId || 'NOT SET');
        console.log('Paid At:', order.paidAt || 'NOT SET');
        console.log('Created:', order.date);
        console.log('\n💡 To manually mark as paid, run:');
        console.log(`node scripts/mark-order-paid.js ${orderId}`);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkOrder();
