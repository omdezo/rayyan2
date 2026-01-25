# Thawani Payment Gateway Integration Guide

## Overview
This document describes the complete integration of Thawani Payment Gateway into the e-commerce platform. The integration replaces Apple Pay and PayPal with Thawani's secure card payment system.

## Table of Contents
1. [Features](#features)
2. [Architecture](#architecture)
3. [Environment Setup](#environment-setup)
4. [Payment Flow](#payment-flow)
5. [Webhook Configuration](#webhook-configuration)
6. [Testing](#testing)
7. [Production Checklist](#production-checklist)

## Features

### Implemented Features
- ✅ Secure card payment via Thawani Pay
- ✅ Automatic checkout session creation
- ✅ Webhook validation for payment confirmation
- ✅ Order status tracking (pending → completed/failed)
- ✅ Payment success/cancel callback pages
- ✅ Minimum amount validation (0.100 OMR)
- ✅ Multi-language product support
- ✅ Cart and single product checkout

### Security Features
- ✅ HMAC-SHA256 webhook signature verification
- ✅ Server-side payment validation
- ✅ Secure API key management
- ✅ SSL/TLS encryption for all transactions

## Architecture

### File Structure
```
├── lib/
│   ├── thawani.ts                      # Core Thawani utilities
│   ├── models/Order.ts                 # Updated Order model
│   └── types/models.ts                 # TypeScript interfaces
├── app/
│   ├── api/
│   │   └── thawani/
│   │       ├── create-session/route.ts # Create checkout session
│   │       ├── webhook/route.ts        # Handle webhooks
│   │       └── verify/route.ts         # Verify payments
│   └── [locale]/(main)/
│       ├── checkout/page.tsx           # Updated checkout page
│       └── payment/
│           ├── success/page.tsx        # Success callback
│           └── cancel/page.tsx         # Cancel callback
└── .env.local                          # Environment variables
```

### Data Flow
1. **Checkout Initiation**: User fills form → Frontend validates → API creates Thawani session
2. **Payment**: User redirected to Thawani → Enters card details → Thawani processes
3. **Callback**: User redirected to success/cancel page → Frontend verifies payment
4. **Webhook**: Thawani sends webhook → Backend validates signature → Order updated

## Environment Setup

### Required Environment Variables

Add these to your `.env.local` file:

```bash
# Thawani Payment Gateway
NEXT_PUBLIC_THAWANI_ENV=uat                              # 'uat' for testing, 'production' for live
THAWANI_SECRET_KEY=rRQ26GcsZzoEhbrP2HZvLYDbn9C9et       # Your secret key
NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY=HGvTMLDssJghr9tlN9gr4DVYt0qyBy # Your publishable key
THAWANI_WEBHOOK_SECRET=your_webhook_secret_key_here      # Set in merchant portal
NEXT_PUBLIC_APP_URL=http://localhost:3000                # Your app URL
```

### Test Credentials (UAT Environment)
- **Secret Key**: `rRQ26GcsZzoEhbrP2HZvLYDbn9C9et`
- **Publishable Key**: `HGvTMLDssJghr9tlN9gr4DVYt0qyBy`
- **API Base URL**: `https://uatcheckout.thawani.om/api/v1`
- **Checkout URL**: `https://uatcheckout.thawani.om`

### Production Setup
1. Register with Thawani at [sales@thawani.om](mailto:sales@thawani.om)
2. Get production API keys from Thawani merchant portal
3. Update `.env.local` with production keys
4. Set `NEXT_PUBLIC_THAWANI_ENV=production`
5. Update `NEXT_PUBLIC_APP_URL` to your production domain

## Payment Flow

### Step 1: User Initiates Checkout
```typescript
// User fills form on /checkout page
{
  name: "Customer Name",
  email: "customer@example.com",
  phone: "+968 12345678"
}
```

### Step 2: Create Thawani Session
```typescript
// POST /api/thawani/create-session
const response = await fetch('/api/thawani/create-session', {
  method: 'POST',
  body: JSON.stringify({
    customerInfo: { name, email, phone },
    items: [{ productId, title, price, language, fileUrl }],
    total: 5.000 // Amount in OMR
  })
});

// Response
{
  success: true,
  data: {
    orderId: "...",
    sessionId: "checkout_...",
    invoice: "123456",
    paymentUrl: "https://uatcheckout.thawani.om/pay/checkout_...?key=...",
    expiresAt: "2024-01-08T10:00:00Z"
  }
}
```

### Step 3: Redirect to Thawani
```typescript
// Frontend automatically redirects user
window.location.href = data.paymentUrl;
```

### Step 4: User Completes Payment
- User enters card details on Thawani's secure page
- Thawani processes 3D Secure authentication if required
- Thawani sends OTP to user's registered phone number

### Step 5: Callback & Verification
```typescript
// Success: /payment/success?session_id={CHECKOUT_SESSION_ID}
// Cancel: /payment/cancel?session_id={CHECKOUT_SESSION_ID}

// Verify payment
GET /api/thawani/verify?session_id=checkout_...
```

### Step 6: Webhook Confirmation
```typescript
// POST /api/thawani/webhook
// Webhook events:
- checkout.created      // Session created
- checkout.completed    // Payment successful
- payment.pending       // Payment processing
- payment.succeeded     // Payment confirmed
- payment.failed        // Payment failed
```

## Webhook Configuration

### Setting Up Webhooks

1. **Access Thawani Merchant Portal**
   - Login to your Thawani merchant account
   - Navigate to "Webhook URL" settings

2. **Configure Webhook URL**
   ```
   Production: https://yourdomain.com/api/thawani/webhook
   Development: Use ngrok or webhook.site for testing
   ```

3. **Generate Webhook Secret**
   - Generate a secure webhook secret in the portal
   - Update `THAWANI_WEBHOOK_SECRET` in `.env.local`

4. **Test Webhook**
   - Use test payment to trigger webhook
   - Check server logs for webhook events
   - Verify signature validation

### Webhook Signature Verification

```typescript
// Automatic verification in /api/thawani/webhook
const isValid = verifyWebhookSignature(
  rawBody,          // Request body as string
  timestamp,        // From 'thawani-timestamp' header
  signature,        // From 'thawani-signature' header
  webhookSecret     // Your webhook secret
);
```

### Webhook Event Handlers

```typescript
switch (payload.event_type) {
  case 'checkout.completed':
    // Payment successful - update order to 'completed'
    break;
  case 'payment.succeeded':
    // Payment confirmed - update order status
    break;
  case 'payment.failed':
    // Payment failed - update order to 'failed'
    break;
}
```

## Testing

### Test Cards (UAT Environment)

Thawani provides test cards for UAT environment:

| Card Number         | Brand      | Type   | 3DS | Result     |
|---------------------|------------|--------|-----|------------|
| 4242 4242 4242 4242 | Visa       | Debit  | Yes | Success    |
| 5200 0000 0000 0007 | MasterCard | Credit | Yes | Success    |
| 4000 0000 0000 0002 | Visa       | Debit  | No  | Declined   |

**Additional Test Data:**
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- OTP: Will be sent to registered phone number in UAT

### Test Scenarios

1. **Successful Payment Flow**
   ```bash
   1. Go to /checkout
   2. Fill customer information
   3. Click "المتابعة للدفع"
   4. Use test card: 4242 4242 4242 4242
   5. Complete 3DS authentication
   6. Verify redirect to /payment/success
   7. Check order status in database
   ```

2. **Failed Payment Flow**
   ```bash
   1. Use declined test card: 4000 0000 0000 0002
   2. Verify order status updated to 'failed'
   ```

3. **Cancelled Payment Flow**
   ```bash
   1. Start payment flow
   2. Click "Cancel" on Thawani page
   3. Verify redirect to /payment/cancel
   4. Check order status remains 'pending'
   ```

4. **Webhook Testing**
   ```bash
   # Use webhook testing tools
   1. https://webhook.site
   2. https://webhook-test.com

   # Test locally with ngrok
   ngrok http 3000
   # Set webhook URL: https://YOUR_NGROK_URL/api/thawani/webhook
   ```

### Manual Testing Checklist

- [ ] Checkout form validation
- [ ] Minimum amount validation (0.100 OMR)
- [ ] Order creation in database
- [ ] Thawani session creation
- [ ] Redirect to Thawani payment page
- [ ] Successful payment completion
- [ ] Success page displays correct order details
- [ ] Failed payment handling
- [ ] Cancel payment handling
- [ ] Webhook signature verification
- [ ] Order status updates from webhooks
- [ ] Download links for completed orders

## Production Checklist

### Before Going Live

- [ ] **SSL Certificate**: Ensure your site has a valid SSL certificate
- [ ] **Production API Keys**: Replace test keys with production keys from Thawani
- [ ] **Environment Variable**: Set `NEXT_PUBLIC_THAWANI_ENV=production`
- [ ] **App URL**: Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] **Webhook URL**: Configure production webhook URL in Thawani portal
- [ ] **Webhook Secret**: Generate and set production webhook secret
- [ ] **Customer Metadata**: Verify customer info is passed in metadata
- [ ] **Payment Display**: Add message indicating card payment acceptance
- [ ] **Error Handling**: Test all error scenarios
- [ ] **Logging**: Ensure proper logging for debugging
- [ ] **Security**: Review API endpoints for security vulnerabilities
- [ ] **Email Notifications**: Set up email for automatic communications
- [ ] **Support Contact**: Provide support email for payment issues

### Thawani Requirements

As per Thawani documentation:

1. **SSL Certificate**: ✅ Required
2. **Customer Information**: ✅ Passed in metadata (name, phone, email)
3. **Payment Display**: ✅ Shows card payment acceptance message
4. **Support Email**: Configure in merchant portal
5. **Test Transaction**: Thawani will perform test and print receipt for verification

### Contact Information

- **Thawani Sales**: [sales@thawani.om](mailto:sales@thawani.om)
- **Thawani Support**: [https://thawani.om/support/](https://thawani.om/support/)
- **Working Hours**: Sunday - Thursday, 9:00 AM - 3:00 PM (working days only)

## API Reference

### Create Checkout Session
```typescript
POST /api/thawani/create-session

Request:
{
  customerInfo: {
    name: string,
    email: string,
    phone: string
  },
  items: Array<{
    productId: string,
    title: string,
    price: number,
    language?: 'ar' | 'en',
    fileUrl?: string
  }>,
  total: number
}

Response:
{
  success: boolean,
  data: {
    orderId: string,
    sessionId: string,
    invoice: string,
    paymentUrl: string,
    expiresAt: string
  }
}
```

### Verify Payment
```typescript
GET /api/thawani/verify?session_id={sessionId}

Response:
{
  success: boolean,
  data: {
    order: IOrder,
    thawaniSession: {
      session_id: string,
      payment_status: 'unpaid' | 'paid' | 'cancelled',
      total_amount: number,
      ...
    }
  }
}
```

### Webhook Endpoint
```typescript
POST /api/thawani/webhook

Headers:
- thawani-timestamp: string
- thawani-signature: string

Body:
{
  data: { ... },
  event_type: 'checkout.completed' | 'payment.succeeded' | 'payment.failed' | ...
}

Response:
{
  success: true,
  received: true
}
```

## Troubleshooting

### Common Issues

1. **"Invalid signature" webhook error**
   - Verify `THAWANI_WEBHOOK_SECRET` matches portal setting
   - Check webhook URL is correctly configured
   - Ensure raw body is used for signature verification

2. **"Session creation failed"**
   - Verify API keys are correct
   - Check `NEXT_PUBLIC_THAWANI_ENV` is set correctly
   - Ensure total amount is >= 0.100 OMR

3. **Order not updating after payment**
   - Check webhook is configured correctly
   - Verify webhook endpoint is accessible
   - Check server logs for webhook errors

4. **Redirect not working**
   - Verify `NEXT_PUBLIC_APP_URL` is correct
   - Check callback URLs in session creation
   - Ensure URLs are properly encoded

## Support

For implementation support:
- Check server logs for error messages
- Review Thawani API documentation
- Contact Thawani support for payment gateway issues
- Email: [sales@thawani.om](mailto:sales@thawani.om)

## License

This integration follows Thawani's terms of service: [https://thawani.om/terms/](https://thawani.om/terms/)
