import connectDB from '../lib/mongodb';
import User from '../lib/models/User';
import Product from '../lib/models/Product';
import Order from '../lib/models/Order';
import Settings from '../lib/models/Settings';
import { products as mockProducts } from '../lib/products';

async function seed() {
    try {
        console.log('🌱 Starting database seeding...');

        // Connect to database
        await connectDB();

        // Clear existing data (optional - comment out if you want to keep existing data)
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Settings.deleteMany({});

        // Create admin user
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@rayan.com',
            password: 'admin123',
            role: 'admin',
            status: 'active',
        });
        console.log('✅ Admin user created: admin@rayan.com / admin123');

        // Create test user
        console.log('👤 Creating test user...');
        const testUser = await User.create({
            name: 'Test User',
            email: 'user@test.com',
            password: 'user123',
            role: 'user',
            status: 'active',
        });
        console.log('✅ Test user created: user@test.com / user123');

        // Seed products from mock data
        console.log('📦 Seeding products...');
        const productsToCreate = mockProducts.map((product) => ({
            title: product.title,
            description: product.description,
            price: product.price,
            category: product.category,
            subcategory: product.subcategory,
            image: product.image,
            status: 'active',
        }));

        const createdProducts = await Product.insertMany(productsToCreate);
        console.log(`✅ ${createdProducts.length} products created`);

        // Create sample orders
        console.log('🛒 Creating sample orders...');
        const sampleOrders = [
            {
                userId: testUser._id.toString(),
                customerInfo: {
                    name: 'أحمد محمد',
                    email: 'ahmed@example.com',
                    phone: '+968 9999 9999',
                },
                items: [
                    {
                        productId: createdProducts[0]._id.toString(),
                        title: createdProducts[0].title,
                        price: createdProducts[0].price,
                    },
                ],
                total: createdProducts[0].price,
                status: 'completed',
                paymentMethod: 'card',
                date: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
            },
            {
                userId: testUser._id.toString(),
                customerInfo: {
                    name: 'سارة علي',
                    email: 'sara@example.com',
                    phone: '+968 9888 8888',
                },
                items: [
                    {
                        productId: createdProducts[1]._id.toString(),
                        title: createdProducts[1].title,
                        price: createdProducts[1].price,
                    },
                ],
                total: createdProducts[1].price,
                status: 'pending',
                paymentMethod: 'apple',
                date: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
            },
            {
                customerInfo: {
                    name: 'خالد عبدالله',
                    email: 'khalid@example.com',
                    phone: '+968 9777 7777',
                },
                items: [
                    {
                        productId: createdProducts[2]._id.toString(),
                        title: createdProducts[2].title,
                        price: createdProducts[2].price,
                    },
                ],
                total: createdProducts[2].price,
                status: 'completed',
                paymentMethod: 'paypal',
                date: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            },
            {
                customerInfo: {
                    name: 'منى سعيد',
                    email: 'mona@example.com',
                    phone: '+968 9666 6666',
                },
                items: [
                    {
                        productId: createdProducts[3]._id.toString(),
                        title: createdProducts[3].title,
                        price: createdProducts[3].price,
                    },
                ],
                total: createdProducts[3].price,
                status: 'failed',
                paymentMethod: 'card',
                date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            },
            {
                userId: testUser._id.toString(),
                customerInfo: {
                    name: 'عمر حسن',
                    email: 'omar@example.com',
                    phone: '+968 9555 5555',
                },
                items: [
                    {
                        productId: createdProducts[4]._id.toString(),
                        title: createdProducts[4].title,
                        price: createdProducts[4].price,
                    },
                ],
                total: createdProducts[4].price,
                status: 'completed',
                paymentMethod: 'card',
                date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            },
        ];

        const createdOrders = await Order.insertMany(sampleOrders);
        console.log(`✅ ${createdOrders.length} orders created`);

        // Create default settings
        console.log('⚙️  Creating default settings...');
        await Settings.create({
            siteName: 'ريان للتصميم',
            siteDescription: 'متجر للمنتجات الرقمية والتصاميم الإبداعية',
            contactEmail: 'info@rayan.com',
            contactPhone: '+968 9999 9999',
            address: 'سلطنة عمان',
            socialLinks: {
                instagram: 'https://instagram.com/rayan_design',
            },
        });
        console.log('✅ Default settings created');

        console.log('\n✨ Database seeded successfully!');
        console.log('\n📝 Login credentials:');
        console.log('   Admin: admin@rayan.com / admin123');
        console.log('   User: user@test.com / user123');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seed();
