# 🚀 Cloudflare Tunnel Setup (1 Minute!)

Cloudflare Tunnel is the **BEST** solution for webhook testing:

✅ **Free forever** - No paid tiers, no limits
✅ **No account required** - For quick testing
✅ **Stable URLs** - Same URL until you restart
✅ **Better than ngrok** - Faster, more reliable
✅ **Production-ready** - Use it in production too!

## 🎯 Super Quick Setup (30 seconds)

### Step 1: Start the Tunnel

Just run this ONE command:

```bash
./scripts/start-cloudflare-tunnel.sh
```

That's it! The script will:
- ✅ Install cloudflared (if needed)
- ✅ Start the tunnel
- ✅ Get your public URL
- ✅ Update `.env.local` automatically
- ✅ Show you the webhook URL

### Step 2: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 3: Test Payment!

Make a payment and webhooks will work automatically! 🎉

---

## 📊 What You'll See

When you run the script:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🚀 Cloudflare Tunnel for Webhook Testing
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Starting Cloudflare Tunnel...
Waiting for tunnel to initialize...
✅ Tunnel started successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 Public URL: https://abc-def-123.trycloudflare.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Updating .env.local...
✅ Updated NEXT_PUBLIC_APP_URL in .env.local

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🎉 Tunnel is Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 Testing the Webhook

### 1. Make a Test Payment

- Card: `4242424242424242`
- Expiry: `12/25`
- CVV: `123`

### 2. Watch Your Server Logs

You should see:

```bash
Creating Thawani session: { orderId: '...', ... }
🔔 Webhook received: { event_type: 'checkout.completed', ... }
Order marked as completed: ...
```

### 3. Check Success Page

The success page should automatically show:
- ✅ Green checkmark
- ✅ "تم الدفع بنجاح!" (Payment successful!)
- ✅ Order status: "completed"
- ✅ Payment status: "paid"

---

## ⚡ Quick Commands

```bash
# Start tunnel
./scripts/start-cloudflare-tunnel.sh

# Test webhook endpoint
curl https://YOUR-TUNNEL-URL.trycloudflare.com/api/thawani/webhook

# Check tunnel logs
tail -f /tmp/cloudflared.log

# Stop tunnel
# Press Ctrl+C in the tunnel terminal
```

---

## 🔍 Troubleshooting

### Issue: "Dev server not detected"
**Solution**: Start your dev server first with `npm run dev`

### Issue: "Failed to get tunnel URL"
**Solution**:
- Check if port 3000 is in use: `lsof -i:3000`
- Check logs: `cat /tmp/cloudflared.log`
- Try again: `./scripts/start-cloudflare-tunnel.sh`

### Issue: Webhook not called
**Solution**:
- Make sure tunnel is running (check terminal)
- Verify URL in `.env.local` matches tunnel URL
- Restart dev server after changing `.env.local`

### Issue: Order stays "pending"
**Check**:
1. Tunnel is running: Terminal should show "Press Ctrl+C to stop"
2. Dev server restarted after tunnel started
3. Server logs for webhook events

---

## 🎯 Advantages Over ngrok

| Feature | Cloudflare Tunnel | ngrok |
|---------|------------------|-------|
| **Cost** | ✅ Free forever | ⚠️ Free tier limited |
| **Account Required** | ❌ No (for testing) | ✅ Yes |
| **URL Stability** | ✅ Same until restart | ⚠️ Changes each restart |
| **Speed** | ✅ Very fast | ✅ Fast |
| **Reliability** | ✅ Excellent | ✅ Good |
| **Production Ready** | ✅ Yes | ⚠️ Paid tiers only |
| **Setup Time** | ✅ 30 seconds | ⚠️ 5 minutes |

---

## 🚀 Production Setup (Optional)

For production, you can use a **named tunnel** with a custom domain:

### 1. Login to Cloudflare

```bash
cloudflared login
```

### 2. Create Named Tunnel

```bash
cloudflared tunnel create thawani-webhook
```

### 3. Configure Tunnel

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: thawani-webhook
credentials-file: /home/omar/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: webhook.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

### 4. Add DNS Record

```bash
cloudflared tunnel route dns thawani-webhook webhook.yourdomain.com
```

### 5. Run Tunnel

```bash
cloudflared tunnel run thawani-webhook
```

Now you have a permanent webhook URL: `https://webhook.yourdomain.com` 🎉

---

## 📝 Environment Variables

After running the script, your `.env.local` will have:

```bash
NEXT_PUBLIC_APP_URL=https://abc-def-123.trycloudflare.com
```

This tells your app to use the tunnel URL for webhooks!

---

## ⚠️ Important Notes

1. **Keep tunnel running** - Don't close the terminal
2. **Restart dev server** - After tunnel starts
3. **URL changes** - Only when you restart the tunnel
4. **No authentication** - Quick tunnel mode for testing
5. **Production** - Use named tunnels with custom domains

---

## 🎉 That's It!

Just run:

```bash
./scripts/start-cloudflare-tunnel.sh
```

And webhooks will work! No account needed, no configuration, just works! ✨

---

## 📚 More Resources

- [Cloudflare Tunnel Docs](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Thawani Webhook Guide](./WEBHOOK_SETUP.md)
- [Quick Start Guide](./QUICK_START.md)

---

**Ready?** Run the script and test your webhook! 🚀
