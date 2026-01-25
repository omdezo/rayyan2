# Quick Start - Thawani Payment Testing

## 🚀 Ready to Test!

Your Thawani payment integration is now complete. Follow these steps to test:

### 1. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:3000`

### 2. Test Payment Flow

1. **Browse products**: Go to `/products`
2. **Add to cart**: Click on a product and add to cart
3. **Go to checkout**: Click checkout
4. **Fill customer details**:
   ```
   Name: Test User
   Email: test@example.com
   Phone: +968 12345678
   ```
5. **Click "المتابعة للدفع"** - You'll be redirected to Thawani

### 3. Use Test Card on Thawani Page

Enter these EXACT values on the Thawani payment page:

```
Card Number:  4242424242424242
Expiry Date:  12/25        ← IMPORTANT: Use MM/YY format, NOT 1234!
CVV:          123
Name:         TEST USER
```

### 4. Complete Payment

- Click Pay/Continue
- You'll be redirected back to your site
- Success page will show order details
- Order status will update automatically (with polling every 5 seconds)

## ✅ Success Indicators

After successful payment, you should see:
- ✅ Green checkmark on success page
- ✅ Order status: "completed"
- ✅ Payment status: "paid"
- ✅ Download links for products (if applicable)
- ✅ Cart cleared

## 🐛 Troubleshooting

### Issue: "Card issue" error
**Fix**: Make sure expiry is `12/25` NOT `1234`

### Issue: "Page not found" after payment
**Fix**: Already fixed! URLs now use order_id instead of session_id

### Issue: Payment status shows "pending" (COMMON!)
**Why**: Webhooks don't work on localhost - Thawani can't reach your local server

**Quick Fix** (for testing):
1. Open terminal
2. Run: `node scripts/list-recent-orders.js`
3. Copy the order ID from the latest order
4. Run: `node scripts/mark-order-paid.js <order_id>`
5. Refresh the success page - Should show "Paid!" ✅

**Permanent Fix**:
- See `WEBHOOK_SETUP.md` for ngrok setup
- Or deploy to production where webhooks work automatically

### Issue: Webhook not updating order
**Reason**: Localhost is not accessible from the internet
**Solutions**:
1. Use ngrok (see `WEBHOOK_SETUP.md`)
2. Deploy to production
3. Manual: Use `mark-order-paid.js` script (see above)

## 📝 Check Server Logs

While testing, watch your terminal for:

```bash
Creating Thawani session: {
  orderId: '...',
  totalOMR: 1.5,
  totalBaisa: 1500,
  products: [...]
}
```

## 🧪 Test Different Scenarios

### Test Success:
- Card: `4242424242424242`
- Result: Payment succeeds

### Test Decline:
- Card: `4000000000000002`
- Result: Payment fails

### Test Cancel:
- Start payment, click "Cancel" on Thawani page
- Result: Redirected to cancel page

## 🔄 What Happens Behind the Scenes

1. **Checkout form submitted** → Creates order with status "pending"
2. **Thawani session created** → Redirects to Thawani payment page
3. **User pays** → Thawani processes payment
4. **Redirect to success** → Using order_id parameter
5. **Page polls order** → Checks status every 5 seconds
6. **Webhook received** → Server updates order to "completed"
7. **Page shows success** → User can download products

## 📊 Database Check

After payment, check your MongoDB:

```javascript
// Order document should have:
{
  _id: "...",
  customerInfo: { name, email, phone },
  items: [...],
  total: 1.5,
  status: "completed",          // ← Updated by webhook
  paymentStatus: "paid",         // ← Updated by webhook
  paymentMethod: "card",
  thawaniSessionId: "checkout_...",
  thawaniInvoice: "123456",
  paymentId: "...",             // ← From webhook
  paidAt: "2024-01-07T...",     // ← From webhook
  date: "2024-01-07T..."
}
```

## 🎯 Next Steps

Once testing is successful:

1. **Set up webhook** (see THAWANI_INTEGRATION.md)
2. **Get production keys** from Thawani
3. **Update environment** to production
4. **Deploy and test** on production

## 📚 Full Documentation

See `THAWANI_INTEGRATION.md` for complete details.

## ❓ Need Help?

- Check server console for errors
- Review `THAWANI_INTEGRATION.md` troubleshooting section
- Contact: sales@thawani.om
