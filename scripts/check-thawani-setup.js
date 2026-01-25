// Quick script to verify Thawani setup
// Run with: node scripts/check-thawani-setup.js

require('dotenv').config({ path: '.env.local' });

console.log('\n🔍 Checking Thawani Configuration...\n');

const checks = {
    'NEXT_PUBLIC_THAWANI_ENV': process.env.NEXT_PUBLIC_THAWANI_ENV,
    'THAWANI_SECRET_KEY': process.env.THAWANI_SECRET_KEY ? '✓ Set' : '✗ Missing',
    'NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY ? '✓ Set' : '✗ Missing',
    'THAWANI_WEBHOOK_SECRET': process.env.THAWANI_WEBHOOK_SECRET ? '✓ Set' : '✗ Missing',
    'NEXT_PUBLIC_APP_URL': process.env.NEXT_PUBLIC_APP_URL,
};

console.log('Environment Variables:');
console.log('─────────────────────────────────────────');
Object.entries(checks).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
});

console.log('\n📋 Test Card Details:');
console.log('─────────────────────────────────────────');
console.log('Card Number: 4242 4242 4242 4242');
console.log('Expiry: 12/25 (MM/YY format - must be future date)');
console.log('CVV: 123');
console.log('Name: TEST USER');

console.log('\n⚠️  Common Issues:');
console.log('─────────────────────────────────────────');
console.log('1. Expiry Date: Use "12/25" NOT "1234"');
console.log('2. Minimum Amount: 0.100 OMR (100 baisa)');
console.log('3. Environment: Should be "uat" for testing');

console.log('\n✅ API Endpoints:');
console.log('─────────────────────────────────────────');
const apiBase = process.env.NEXT_PUBLIC_THAWANI_ENV === 'production'
    ? 'https://checkout.thawani.om/api/v1'
    : 'https://uatcheckout.thawani.om/api/v1';
console.log(`Using: ${apiBase}`);

console.log('\n');
