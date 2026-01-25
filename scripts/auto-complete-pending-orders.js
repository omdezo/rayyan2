// Automatically mark all pending orders as paid (for testing)
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function autoComplete() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

        // Find all pending orders
        const pendingOrders = await Order.find({ status: 'pending' });

        if (pendingOrders.length === 0) {
            console.log('✅ No pending orders found');
            await mongoose.disconnect();
            return;
        }

        console.log(`📦 Found ${pendingOrders.length} pending orders:\n`);

        for (const order of pendingOrders) {
            console.log(`Processing: ${order._id.toString()}`);
            console.log(`  Customer: ${order.customerInfo?.name || 'N/A'}`);
            console.log(`  Total: ${order.total} OMR`);

            await Order.findByIdAndUpdate(order._id, {
                status: 'completed',
                paymentStatus: 'paid',
                paidAt: new Date(),
                paymentId: 'auto_test_' + Date.now(),
            });

            console.log(`  ✅ Marked as paid\n`);
        }

        console.log(`\n🎉 Completed ${pendingOrders.length} orders!`);
        console.log('💡 Refresh success pages to see updates');

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

autoComplete();
