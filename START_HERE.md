# 🚀 START HERE - Thawani Payment Gateway Setup

## ✅ What's Already Done

Your Thawani payment gateway is **fully integrated**! Here's what works:

- ✅ Checkout page with Thawani card payment
- ✅ Secure payment processing
- ✅ Order creation and management
- ✅ Success/Cancel callback pages
- ✅ Webhook endpoint for payment validation
- ✅ Database models updated
- ✅ Test environment configured

## 🎯 What You Need to Do (5 Minutes)

### For Webhook Testing (Required)

Webhooks don't work on `localhost` because Thawani can't reach your computer. You need a public URL.

**🌟 RECOMMENDED: Use Cloudflare Tunnel (30 seconds)**

This is the BEST option - free, fast, and no account required:

```bash
./scripts/start-cloudflare-tunnel.sh
```

Then restart your dev server:

```bash
npm run dev
```

**That's it!** Webhooks will now work automatically. 🎉

See full guide: [CLOUDFLARE_TUNNEL_SETUP.md](./CLOUDFLARE_TUNNEL_SETUP.md)

---

## 🧪 Testing the Payment Flow

### 1. Start Your Tunnel (if not already)

```bash
./scripts/start-cloudflare-tunnel.sh
```

### 2. Start Dev Server

```bash
npm run dev
```

### 3. Make a Test Payment

1. Go to: http://localhost:3000/products
2. Add a product to cart
3. Go to checkout
4. Fill in your details
5. Use test card:
   - **Card**: `4242424242424242`
   - **Expiry**: `12/25` (MM/YY format!)
   - **CVV**: `123`
6. Complete payment on Thawani page

### 4. See Success!

You should automatically see:
- ✅ "تم الدفع بنجاح!" message
- ✅ Order status: "completed"
- ✅ Payment status: "paid"
- ✅ Download links (if products have files)

---

## 📚 Documentation

All the guides you need:

| Document | What's Inside |
|----------|---------------|
| **CLOUDFLARE_TUNNEL_SETUP.md** | Quick tunnel setup (recommended!) |
| **QUICK_START.md** | Testing guide with troubleshooting |
| **THAWANI_INTEGRATION.md** | Complete technical documentation |
| **WEBHOOK_SETUP.md** | Detailed webhook configuration |

---

## 🛠️ Useful Scripts

```bash
# Start Cloudflare Tunnel (webhook testing)
./scripts/start-cloudflare-tunnel.sh

# List recent orders
node scripts/list-recent-orders.js

# Mark order as paid manually (if webhook didn't fire)
node scripts/mark-order-paid.js <order_id>

# Auto-complete all pending orders
node scripts/auto-complete-pending-orders.js

# Check Thawani configuration
node scripts/check-thawani-setup.js
```

---

## ⚙️ Environment Variables

Your `.env.local` has these Thawani settings:

```bash
# Environment: 'uat' for testing, 'production' for live
NEXT_PUBLIC_THAWANI_ENV=uat

# Test keys (replace with production keys later)
THAWANI_SECRET_KEY=rRQ26GcsZzoEhbrP2HZvLYDbn9C9et
NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY=HGvTMLDssJghr9tlN9gr4DVYt0qyBy

# Webhook secret (set in Thawani portal)
THAWANI_WEBHOOK_SECRET=your_webhook_secret_key_here

# Your app URL (updated by tunnel script)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note**: The tunnel script automatically updates `NEXT_PUBLIC_APP_URL` when you run it.

---

## 🚀 Going to Production

When ready for production:

### 1. Get Production Keys

Contact Thawani: sales@thawani.om

### 2. Update Environment

```bash
NEXT_PUBLIC_THAWANI_ENV=production
THAWANI_SECRET_KEY=your_production_key
NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY=your_production_key
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### 3. Configure Webhook in Thawani Portal

Set webhook URL: `https://yourdomain.com/api/thawani/webhook`

### 4. Deploy

Deploy to Vercel/Netlify and webhooks work automatically (no tunnel needed!)

---

## 🐛 Common Issues

### Issue: Payment stays "pending"
**Cause**: Webhook not fired (tunnel not running or dev server not restarted)

**Fix**:
1. Check tunnel is running (terminal should show "Press Ctrl+C to stop")
2. Restart dev server: `npm run dev`
3. Or manually: `node scripts/mark-order-paid.js <order_id>`

### Issue: "Card issue" error
**Cause**: Wrong expiry date format

**Fix**: Use `12/25` NOT `1234`

### Issue: "Page not found" after payment
**Cause**: Old session (already fixed in code)

**Fix**: Should work now, if not restart dev server

---

## 🎯 Quick Start Checklist

- [ ] Run: `./scripts/start-cloudflare-tunnel.sh`
- [ ] Restart: `npm run dev`
- [ ] Test payment with card `4242424242424242`
- [ ] See success page with "Paid!" status
- [ ] Check order in database shows `paymentStatus: 'paid'`

---

## 📞 Support

- **Thawani Support**: sales@thawani.om
- **Thawani Docs**: https://thawani.om/support/
- **Working Hours**: Sunday-Thursday, 9:00 AM - 3:00 PM

---

## 🎉 You're Ready!

Just run the tunnel script and start testing! Everything else is already set up and working.

```bash
./scripts/start-cloudflare-tunnel.sh
```

Then make a test payment and watch it work automatically! ✨
