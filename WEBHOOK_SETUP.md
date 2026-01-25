# Thawani Webhook Setup Guide

## 🔴 Current Issue: Webhooks Not Firing

When testing locally, Thawani webhooks **cannot reach your localhost** because:
1. Your server is running on `localhost:3000` (not accessible from the internet)
2. Thawani needs a public URL to send webhook events

## ✅ Solutions

### Option 1: Use ngrok (Recommended for Testing)

1. **Install ngrok**:
   ```bash
   # Download from https://ngrok.com/download
   # Or install via npm
   npm install -g ngrok
   ```

2. **Start your dev server**:
   ```bash
   npm run dev
   ```

3. **In another terminal, start ngrok**:
   ```bash
   ngrok http 3000
   ```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok.io`)

5. **Update `.env.local`**:
   ```bash
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
   ```

6. **Restart your dev server** to pick up the new URL

7. **Configure webhook in Thawani portal**:
   - Login to Thawani merchant portal
   - Go to Webhook Settings
   - Set URL: `https://abc123.ngrok.io/api/thawani/webhook`
   - Generate webhook secret
   - Copy secret to `.env.local` as `THAWANI_WEBHOOK_SECRET`

8. **Test payment** - Webhooks should now work!

### Option 2: Manual Testing (Current Workaround)

For now, when webhooks don't fire, manually mark orders as paid:

```bash
# List recent orders
node scripts/list-recent-orders.js

# Mark order as paid (use the order ID from the list)
node scripts/mark-order-paid.js <order_id>

# Example:
node scripts/mark-order-paid.js 695eab17689301778e035acd
```

### Option 3: Deploy to Production/Staging

Deploy your app to a public server (Vercel, Netlify, etc.) where Thawani can reach it:

1. Deploy your app
2. Get public URL (e.g., `https://your-app.vercel.app`)
3. Update `NEXT_PUBLIC_APP_URL` in production environment
4. Configure webhook in Thawani portal with production URL
5. Test - webhooks will work automatically!

## 🔍 Debugging Webhooks

### Check if Webhook Was Called

Add this to your server logs:

```typescript
// In app/api/thawani/webhook/route.ts
console.log('🔔 Webhook received:', {
    timestamp: new Date().toISOString(),
    headers: Object.fromEntries(req.headers),
    body: rawBody,
});
```

### Verify Webhook in Logs

When webhook fires, you should see:
```
🔔 Webhook received: {
  timestamp: '2024-01-07T...',
  headers: { 'thawani-signature': '...', 'thawani-timestamp': '...' },
  body: '{"event_type":"checkout.completed",...}'
}
```

### Common Webhook Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No webhook calls | URL not public | Use ngrok or deploy |
| Invalid signature | Wrong webhook secret | Check secret in `.env.local` |
| Order not updating | Wrong order ID | Check logs for order ID |
| 401/403 errors | Signature verification failing | Verify webhook secret matches |

## 📊 Testing Webhook Flow

### Full Test Sequence:

1. **Start ngrok** (if testing locally):
   ```bash
   ngrok http 3000
   ```

2. **Update environment**:
   ```bash
   # .env.local
   NEXT_PUBLIC_APP_URL=https://YOUR_NGROK_URL
   ```

3. **Restart server**:
   ```bash
   npm run dev
   ```

4. **Make test payment** with card `4242424242424242`

5. **Watch server logs** for:
   ```
   Creating Thawani session: { orderId: '...', ... }
   🔔 Webhook received: { event_type: 'checkout.completed', ... }
   Order marked as completed: 695e...
   ```

6. **Check success page** - Should show "تم الدفع بنجاح!"

## 🛠️ Webhook Payload Examples

### checkout.completed
```json
{
  "data": {
    "session_id": "checkout_...",
    "client_reference_id": "695e...",  // Your order ID
    "payment_status": "paid",
    "invoice": "123456",
    "total_amount": 2000  // 2.000 OMR in baisa
  },
  "event_type": "checkout.completed"
}
```

### payment.succeeded
```json
{
  "data": {
    "payment_id": "20240107123456",
    "checkout_invoice": "123456",
    "status": "Successful",
    "amount": 2000,
    "masked_card": "4242 42XX XXXX 4242"
  },
  "event_type": "payment.succeeded"
}
```

## 🚀 Production Setup

Once deployed to production:

1. **No ngrok needed** - Your app has a public URL
2. **Set webhook URL** in Thawani portal:
   ```
   https://yourdomain.com/api/thawani/webhook
   ```
3. **Generate production webhook secret** in portal
4. **Update environment variables**:
   ```bash
   NEXT_PUBLIC_THAWANI_ENV=production
   THAWANI_SECRET_KEY=your_production_key
   NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY=your_production_key
   THAWANI_WEBHOOK_SECRET=your_production_webhook_secret
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```
5. **Test thoroughly** before going live

## 📝 Quick Reference

| Action | Command |
|--------|---------|
| Check order status | `node scripts/test-order-status.js <order_id>` |
| List recent orders | `node scripts/list-recent-orders.js` |
| Mark order as paid | `node scripts/mark-order-paid.js <order_id>` |
| Start ngrok | `ngrok http 3000` |
| Check Thawani setup | `node scripts/check-thawani-setup.js` |

## 🎯 Current Workaround

Until you set up ngrok or deploy to production, use this workflow:

1. **User completes payment** on Thawani
2. **User lands on success page** showing "Processing..."
3. **You run** (in terminal):
   ```bash
   # Get the order ID from the URL or success page
   node scripts/mark-order-paid.js <order_id>
   ```
4. **User refreshes page** or waits 5 seconds for auto-refresh
5. **Success page updates** to show "Paid!"

This is **temporary** - webhooks will work automatically once you:
- Use ngrok for local testing, OR
- Deploy to production

---

**Need help?** Contact sales@thawani.om for webhook configuration assistance.
