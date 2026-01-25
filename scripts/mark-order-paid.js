// Manually mark order as paid (for testing when webhook doesn't fire)
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const orderId = process.argv[2];

if (!orderId) {
    console.log('Usage: node scripts/mark-order-paid.js <orderId>');
    process.exit(1);
}

async function markAsPaid() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'completed',
                paymentStatus: 'paid',
                paidAt: new Date(),
                paymentId: 'manual_test_' + Date.now(),
            },
            { new: true }
        );

        if (!updatedOrder) {
            console.log('❌ Order not found');
            process.exit(1);
        }

        console.log('✅ Order marked as paid!');
        console.log('─────────────────────────────────────────');
        console.log('Order ID:', updatedOrder._id.toString());
        console.log('Status:', updatedOrder.status);
        console.log('Payment Status:', updatedOrder.paymentStatus);
        console.log('Paid At:', updatedOrder.paidAt);
        console.log('\n🎉 Refresh the success page to see the update!');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

markAsPaid();
