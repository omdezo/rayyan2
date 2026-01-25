# 🚀 Setup ngrok for Webhooks (5 Minutes)

ngrok is installed! Now you need to authenticate it to get webhooks working.

## Step 1: Create Free ngrok Account (2 minutes)

1. **Go to**: https://dashboard.ngrok.com/signup
2. **Sign up** with email or GitHub (it's FREE!)
3. **Verify your email**

## Step 2: Get Your Authtoken (1 minute)

1. **Login to**: https://dashboard.ngrok.com
2. **Go to**: https://dashboard.ngrok.com/get-started/your-authtoken
3. **Copy your authtoken** (looks like: `2abc...xyz`)

## Step 3: Configure ngrok (30 seconds)

Open terminal and run:

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

Replace `YOUR_AUTHTOKEN_HERE` with the token you copied.

Example:
```bash
ngrok config add-authtoken 2abcXYZ123_defGHI456jklMNO789
```

## Step 4: Start ngrok (30 seconds)

```bash
ngrok http 3000
```

You'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

**IMPORTANT**: Keep this terminal window open! Copy the `https://...ngrok-free.app` URL.

## Step 5: Update Environment (1 minute)

1. **Open** `.env.local` file
2. **Find** the line: `NEXT_PUBLIC_APP_URL=http://localhost:3000`
3. **Replace** with your ngrok URL: `NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app`
4. **Save** the file

Example:
```bash
# Before
NEXT_PUBLIC_APP_URL=http://localhost:3000

# After (use YOUR ngrok URL)
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
```

## Step 6: Restart Dev Server (30 seconds)

1. **Stop** your current dev server (Ctrl+C)
2. **Start** again: `npm run dev`

## Step 7: Configure Thawani Webhook (Optional for UAT)

For UAT testing, this is optional. For production:

1. **Login to** Thawani Merchant Portal
2. **Go to** Webhook Settings
3. **Set Webhook URL**: `https://YOUR_NGROK_URL/api/thawani/webhook`

   Example: `https://abc123.ngrok-free.app/api/thawani/webhook`
4. **Generate webhook secret** (if not already done)
5. **Copy secret** and update `.env.local`:
   ```bash
   THAWANI_WEBHOOK_SECRET=your_webhook_secret_here
   ```

## ✅ Test It!

1. **Make a test payment** with card `4242424242424242`
2. **Watch your terminal** - you should see:
   ```
   Creating Thawani session: {...}
   🔔 Webhook received: { event_type: 'checkout.completed', ... }
   Order marked as completed: ...
   ```
3. **Success page** should automatically show "تم الدفع بنجاح!" ✅

## 🎯 Quick Commands Reference

```bash
# Authenticate ngrok (do once)
ngrok config add-authtoken YOUR_TOKEN

# Start ngrok (keep running)
ngrok http 3000

# Restart dev server (after changing .env.local)
npm run dev

# Check if webhook endpoint is working
curl https://YOUR_NGROK_URL/api/thawani/webhook
```

## ⚠️ Important Notes

1. **Keep ngrok running** - If you close the ngrok terminal, webhooks will stop working
2. **Free tier limitation** - ngrok free URL changes each time you restart
3. **Update .env.local** each time ngrok URL changes
4. **Restart dev server** after updating .env.local
5. **For production** - Deploy to Vercel/Netlify and webhooks work without ngrok!

## 🔄 Alternative: Skip Webhooks (For Now)

If you don't want to set up ngrok right now, you can:

```bash
# After each payment, run:
node scripts/auto-complete-pending-orders.js

# Then refresh the success page
```

But ngrok is MUCH better - webhooks happen automatically! 🎉

---

**Ready?** Follow Step 1 above and you'll have webhooks working in 5 minutes!
