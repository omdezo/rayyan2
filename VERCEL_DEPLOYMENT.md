# 🚀 Deploy to Vercel with Custom Cloudflare Domain

This guide will help you deploy your application to Vercel and connect your Cloudflare domain **rayiandesign.com**.

---

## 📋 What You'll Need

- ✅ GitHub account (you have this)
- ✅ MongoDB Atlas database (configured)
- ✅ Cloudflare domain: **rayiandesign.com**
- ⏳ Thawani payment keys (get these later)

---

## Part 1: Deploy to Vercel

### Step 1: Sign Up for Vercel

1. Go to: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

### Step 2: Import Your Project

1. Click **"Add New Project"**
2. Click **"Import Git Repository"**
3. Search for and select: **rayyan2**
4. Click **"Import"**

### Step 3: Configure Build Settings

Leave these as default (Vercel auto-detects Next.js):

```
Framework Preset: Next.js
Root Directory: ./
Build Command: npm run build
Output Directory: (leave empty)
Install Command: npm install
Node.js Version: 20.x
```

### Step 4: Add Environment Variables

Click **"Environment Variables"** and add these **one by one**:

#### Required Variables (Add These Now)

**Variable 1:**
```
Name: MONGODB_URI
Value: mongodb+srv://ivuxi2_db_user:0EsjRkbsRfQKN29N@rayan-store-prod.sf1xnsk.mongodb.net/rayan-store?retryWrites=true&w=majority&appName=rayan-store-prod
```

**Variable 2:**
```
Name: NEXTAUTH_SECRET
Value: FaRKDdluKfhO84Wzl6+qptWL2pgWc7S0f8uMKbh8B9w=
```

**Variable 3:**
```
Name: NEXTAUTH_URL
Value: https://rayiandesign.com
```

**Variable 4:**
```
Name: CLOUDINARY_CLOUD_NAME
Value: ddauocagf
```

**Variable 5:**
```
Name: CLOUDINARY_API_KEY
Value: 144578892867628
```

**Variable 6:**
```
Name: CLOUDINARY_API_SECRET
Value: wBy7punWxYJ3HBksFQswW9_4hGI
```

**Variable 7:**
```
Name: NEXT_PUBLIC_APP_URL
Value: https://rayiandesign.com
```

#### Thawani Variables (Add Later When You Get Keys)

**Variable 8:**
```
Name: NEXT_PUBLIC_THAWANI_ENV
Value: production
```

**Variable 9:**
```
Name: THAWANI_SECRET_KEY
Value: (get from Thawani dashboard)
```

**Variable 10:**
```
Name: NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY
Value: (get from Thawani dashboard)
```

**Variable 11:**
```
Name: THAWANI_WEBHOOK_SECRET
Value: (get from Thawani dashboard)
```

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes for build to complete
3. You'll get a temporary URL like: `https://rayyan2.vercel.app`

✅ **Your site is now live!** But we'll connect your custom domain next.

---

## Part 2: Connect Your Cloudflare Domain

### Step 1: Add Domain in Vercel

1. In Vercel dashboard, go to your project
2. Click **"Settings"** tab
3. Click **"Domains"** in left sidebar
4. Click **"Add Domain"**
5. Enter: **rayiandesign.com**
6. Click **"Add"**

### Step 2: Add www Subdomain (Optional but Recommended)

1. Click **"Add Domain"** again
2. Enter: **www.rayiandesign.com**
3. Click **"Add"**

### Step 3: Configure DNS in Cloudflare

Vercel will show you DNS records to add. Follow these steps:

1. Go to: **https://dash.cloudflare.com/**
2. Select your domain: **rayiandesign.com**
3. Click **"DNS"** in left sidebar
4. Click **"Add record"**

#### Add These DNS Records:

**Record 1: Root Domain (rayiandesign.com)**
```
Type: CNAME
Name: @
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**Record 2: www Subdomain (www.rayiandesign.com)**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com
Proxy status: DNS only (gray cloud)
TTL: Auto
```

**Important:** Make sure "Proxy status" is set to **"DNS only"** (gray cloud icon), NOT proxied (orange cloud).

### Step 4: Verify Domain

1. Go back to Vercel dashboard
2. Wait 1-2 minutes for DNS propagation
3. Click **"Refresh"** next to your domain
4. Status should change to **"Valid Configuration"**
5. SSL certificate will be issued automatically (2-5 minutes)

---

## Part 3: Final Configuration

### Update Environment Variables

Now that your domain is connected, verify the URLs are correct:

1. In Vercel, go to **Settings → Environment Variables**
2. Verify these match:
   - `NEXTAUTH_URL` = `https://rayiandesign.com`
   - `NEXT_PUBLIC_APP_URL` = `https://rayiandesign.com`

### Redeploy (if needed)

If you changed any environment variables:
1. Go to **Deployments** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**

---

## Part 4: Test Your Deployment

### ✅ Test Checklist

Visit **https://rayiandesign.com** and test:

- [ ] Home page loads correctly
- [ ] Products page shows products
- [ ] User registration works
- [ ] User login works
- [ ] Add product to cart
- [ ] Checkout page loads (payment will work once you add Thawani keys)
- [ ] Images load from Cloudinary
- [ ] Dashboard accessible (for admin users)

---

## Part 5: Add Thawani Payment Keys (When Ready)

### Get Production Keys from Thawani

1. Contact Thawani support: **sales@thawani.om**
2. Request production API keys
3. Get these values:
   - Secret Key
   - Publishable Key
   - Webhook Secret

### Add Keys to Vercel

1. Go to **Settings → Environment Variables**
2. Find the Thawani variables
3. Click **"Edit"** and paste the real values:
   - `THAWANI_SECRET_KEY` → Your secret key
   - `NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY` → Your publishable key
   - `THAWANI_WEBHOOK_SECRET` → Your webhook secret
4. Click **"Save"**

### Configure Thawani Webhook

1. Log in to Thawani dashboard
2. Go to **Webhooks** settings
3. Set webhook URL to:
   ```
   https://rayiandesign.com/api/thawani/webhook
   ```
4. Save the configuration

### Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. Wait 2 minutes
4. Test payment flow with a real card

---

## 📊 Vercel Free Tier Limits

Your site is on the free tier with these limits:

- ✅ **Bandwidth**: 100 GB/month
- ✅ **Build Time**: 6,000 minutes/month
- ✅ **Serverless Functions**: 100 GB-hours
- ✅ **Deployments**: Unlimited
- ✅ **Custom Domains**: Unlimited
- ✅ **SSL**: Free automatic HTTPS

**Perfect for small to medium traffic!** You can upgrade to Pro ($20/month) when you scale.

---

## 🔧 Troubleshooting

### Domain Not Working

**Problem:** Domain shows "This domain is not configured"

**Solution:**
1. Check DNS records in Cloudflare are correct
2. Make sure "Proxy status" is **"DNS only"** (gray cloud)
3. Wait up to 48 hours for DNS propagation (usually 5-10 minutes)
4. Try clearing your browser cache

### SSL Certificate Pending

**Problem:** "SSL certificate is pending"

**Solution:**
1. This is normal, wait 5-10 minutes
2. Vercel automatically issues Let's Encrypt certificates
3. Refresh the page after a few minutes

### Build Fails

**Problem:** Deployment fails during build

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set correctly
3. Make sure MongoDB Atlas allows connections from `0.0.0.0/0`

### Images Not Loading

**Problem:** Product images don't show up

**Solution:**
1. Verify Cloudinary credentials are correct
2. Check browser console for errors
3. Make sure image URLs are valid

### Login Not Working

**Problem:** Can't log in after deployment

**Solution:**
1. Check `NEXTAUTH_URL` matches your domain exactly
2. Make sure `NEXTAUTH_SECRET` is set
3. Clear browser cookies and try again

---

## 🚀 Automatic Deployments

Every time you push to GitHub, Vercel automatically deploys:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds and deploys in 2-3 minutes
```

### Preview Deployments

Every pull request gets a preview URL:
1. Create a branch: `git checkout -b feature-branch`
2. Push changes: `git push origin feature-branch`
3. Open PR on GitHub
4. Vercel creates preview: `https://rayyan2-abc123.vercel.app`

---

## 📈 Monitoring

### Analytics

1. Go to Vercel dashboard → Your project
2. Click **"Analytics"** tab
3. View:
   - Page views
   - Visitors
   - Top pages
   - Geographic distribution

### Logs

1. Go to **"Deployments"** tab
2. Click on a deployment
3. View build logs and runtime logs

### Alerts

Set up email alerts:
1. Go to **Settings → Notifications**
2. Enable alerts for:
   - Build failures
   - Domain configuration issues
   - Deployment errors

---

## 🔒 Security Checklist

- [x] HTTPS enabled (automatic)
- [x] Environment variables secured (not in code)
- [x] MongoDB Atlas IP whitelist allows Vercel (0.0.0.0/0)
- [x] Strong NextAuth secret generated
- [ ] Thawani production keys (add when you get them)
- [x] Cloudinary credentials secured

---

## 📞 Support

**Vercel Support:**
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**MongoDB Atlas:**
- Docs: https://www.mongodb.com/docs/atlas/
- Support: https://www.mongodb.com/support

**Thawani:**
- Email: sales@thawani.om
- Docs: https://docs.thawani.om/

**Cloudflare DNS:**
- Dashboard: https://dash.cloudflare.com/
- Docs: https://developers.cloudflare.com/dns/

---

## ✅ You're Ready!

Your deployment steps:
1. ✅ Sign up for Vercel
2. ✅ Import GitHub repository
3. ✅ Add environment variables
4. ✅ Deploy
5. ✅ Connect Cloudflare domain
6. ✅ Configure DNS
7. ✅ Test deployment
8. ⏳ Add Thawani keys (when ready)

**Total time: ~15 minutes** (excluding DNS propagation)

Good luck! 🎉

---

## Quick Reference

**Your Domain:** https://rayiandesign.com
**Vercel Dashboard:** https://vercel.com/dashboard
**Cloudflare DNS:** https://dash.cloudflare.com/
**MongoDB Atlas:** https://cloud.mongodb.com/

**Webhook URL (for Thawani):**
```
https://rayiandesign.com/api/thawani/webhook
```
