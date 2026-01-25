# 🚀 Deploy to Cloudflare Cloud (Complete Guide)

This guide will help you deploy your entire application to Cloudflare cloud infrastructure.

## 📋 Architecture Overview

Your deployment will use:
- **Cloudflare Pages**: Host the Next.js application
- **MongoDB Atlas**: Cloud-hosted MongoDB database
- **Cloudflare R2**: Object storage (already configured)
- **Cloudflare CDN**: Global content delivery
- **Cloudflare DNS**: Domain management

---

## Part 1: Set Up MongoDB Atlas (Cloud Database)

Since Cloudflare doesn't offer MongoDB, we'll use MongoDB Atlas (MongoDB's official cloud service).

### Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account (M0 tier - 512MB free forever)
3. Create a new organization and project

### Step 2: Create a Database Cluster

1. Click "Build a Database"
2. Choose **M0 FREE** tier
3. Select a cloud provider region (choose closest to your users):
   - AWS - Middle East (Bahrain) `me-south-1`
   - Or Google Cloud - Middle East (Doha)
4. Name your cluster: `rayan-store-prod`
5. Click "Create Deployment"

### Step 3: Configure Database Access

1. Create a database user:
   - Username: `rayan-admin`
   - Password: **Generate a secure password** (save it!)
   - Set as "Read and write to any database"
   - Click "Add User"

2. Configure Network Access:
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - This is needed for Cloudflare Pages
   - Click "Confirm"

### Step 4: Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Drivers"
4. Select "Node.js" and version "4.1 or later"
5. Copy the connection string:
   ```
   mongodb+srv://rayan-admin:<password>@rayan-store-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Add database name at the end:
   ```
   mongodb+srv://rayan-admin:YOUR_PASSWORD@rayan-store-prod.xxxxx.mongodb.net/rayan-store?retryWrites=true&w=majority
   ```

**Save this connection string!** You'll need it for environment variables.

### Step 5: Migrate Your Local Database (Optional)

If you have existing data in your local MongoDB:

```bash
# Export from local MongoDB
docker exec rayan-mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/rayan-store?authSource=admin" --out=/tmp/backup

# Copy backup from container
docker cp rayan-mongodb:/tmp/backup ./mongodb-backup

# Restore to MongoDB Atlas
mongorestore --uri="mongodb+srv://rayan-admin:YOUR_PASSWORD@rayan-store-prod.xxxxx.mongodb.net/rayan-store" ./mongodb-backup/rayan-store
```

**Note**: Install MongoDB Database Tools if needed: https://www.mongodb.com/try/download/database-tools

---

## Part 2: Deploy to Cloudflare Pages

### Step 1: Prepare Your Repository

1. Make sure your code is pushed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Cloudflare deployment"
   git push origin main
   ```

2. Verify these files exist:
   - `next.config.ts` - Already configured with standalone output ✅
   - `package.json` - Has all dependencies ✅

### Step 2: Update Next.js Config for Cloudflare

Your `next.config.ts` needs a small update for Cloudflare Pages compatibility:

```typescript
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Remove standalone for Cloudflare Pages
  // output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2gb',
    },
  },
};

export default withNextIntl(nextConfig);
```

### Step 3: Create Cloudflare Pages Project

1. Go to https://dash.cloudflare.com/
2. Select your account
3. Go to "Workers & Pages" > "Create application"
4. Click "Pages" tab
5. Click "Connect to Git"
6. Authorize GitHub and select your repository
7. Configure build settings:

   **Build Configuration:**
   ```
   Framework preset: Next.js
   Build command: npm run build
   Build output directory: .next
   Root directory: /
   ```

   **Environment Variables:** (Add these now)
   ```bash
   NODE_VERSION=20
   MONGODB_URI=mongodb+srv://rayan-admin:YOUR_PASSWORD@rayan-store-prod.xxxxx.mongodb.net/rayan-store?retryWrites=true&w=majority

   # NextAuth
   NEXTAUTH_SECRET=<generate-with: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-site.pages.dev

   # Cloudflare R2
   R2_ACCOUNT_ID=your_account_id
   R2_ACCESS_KEY_ID=your_access_key
   R2_SECRET_ACCESS_KEY=your_secret_key
   R2_BUCKET_NAME=rayan-media
   R2_PUBLIC_URL=https://your-r2-public-url

   # Cloudinary (optional - if keeping)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Thawani Payment
   NEXT_PUBLIC_THAWANI_ENV=production
   THAWANI_SECRET_KEY=your_production_secret_key
   NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY=your_production_publishable_key
   THAWANI_WEBHOOK_SECRET=your_webhook_secret
   NEXT_PUBLIC_APP_URL=https://your-site.pages.dev
   ```

8. Click "Save and Deploy"

### Step 4: Wait for Deployment

- First deployment takes 3-5 minutes
- Watch the build logs for any errors
- Once complete, you'll get a URL like: `https://rayan2.pages.dev`

### Step 5: Set Up Custom Domain (Optional)

1. In Cloudflare Pages project, go to "Custom domains"
2. Click "Set up a custom domain"
3. Enter your domain: `yourdomain.com`
4. Cloudflare will automatically configure DNS
5. Wait for SSL certificate (2-5 minutes)

---

## Part 3: Configure Production Services

### Update Thawani Webhook URL

1. Log in to Thawani dashboard
2. Go to Webhooks settings
3. Update webhook URL to:
   ```
   https://your-domain.pages.dev/api/thawani/webhook
   ```
4. Save the webhook secret and add to environment variables

### Verify Cloudflare R2 Access

Your R2 is already set up, but verify the public URL works:

```bash
# Test R2 access
curl https://your-r2-public-url/test-image.jpg
```

---

## Part 4: Post-Deployment Configuration

### Update Environment Variables

After first deployment, update these in Cloudflare dashboard:

1. Go to Workers & Pages > Your project > Settings > Environment variables
2. Update `NEXT_PUBLIC_APP_URL` to your actual domain
3. Update `NEXTAUTH_URL` to your actual domain
4. Redeploy: Settings > Deployments > Retry deployment

### Set Up Database Indexes (Important for Performance)

Connect to MongoDB Atlas and run:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true });

// Products collection
db.products.createIndex({ slug: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ createdAt: -1 });

// Orders collection
db.orders.createIndex({ userId: 1 });
db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ paymentStatus: 1 });
db.orders.createIndex({ createdAt: -1 });
```

You can run these in MongoDB Atlas web UI:
1. Go to your cluster
2. Click "Browse Collections"
3. Click on "..." menu > "MongoDB Shell"
4. Paste the commands above

---

## Part 5: Testing Your Deployment

### Test Checklist

- [ ] Home page loads: `https://your-site.pages.dev`
- [ ] Products page loads: `https://your-site.pages.dev/products`
- [ ] User registration works
- [ ] User login works
- [ ] Add product to cart
- [ ] Complete checkout with test card
- [ ] Webhook processes payment
- [ ] Order shows as "paid" in success page
- [ ] Dashboard loads (admin features)
- [ ] Images load from R2/Cloudinary

### Test Payment Flow

1. Go to products page
2. Add item to cart
3. Checkout with test card:
   - Card: `4242424242424242`
   - Expiry: `12/25`
   - CVV: `123`
4. Complete payment
5. Verify success page shows "paid" status
6. Check MongoDB Atlas to see order is marked as paid

---

## Part 6: Monitoring & Maintenance

### Cloudflare Analytics

1. Go to Workers & Pages > Your project > Analytics
2. Monitor:
   - Request count
   - Error rate
   - Response times
   - Geographic distribution

### MongoDB Atlas Monitoring

1. Go to your cluster > Metrics
2. Monitor:
   - Connection count
   - Query performance
   - Database size
   - Storage usage

### Set Up Alerts

**MongoDB Atlas:**
1. Go to Alerts
2. Create alert for:
   - Connections > 80% of limit
   - Disk usage > 80%
   - Query performance issues

**Cloudflare:**
1. Go to Notifications
2. Create alert for:
   - Build failures
   - Error rate > 5%

---

## Part 7: Scaling & Performance

### MongoDB Atlas Scaling

When you need more than 512MB:
1. Go to your cluster
2. Click "Edit Configuration"
3. Upgrade to M10 ($0.08/hr) or higher
4. No downtime during upgrade

### Cloudflare Pages Limits (Free Tier)

- 500 builds per month
- 100,000 requests per day
- Unlimited bandwidth
- Unlimited sites

For more: https://developers.cloudflare.com/pages/platform/limits/

### Enable Caching

Add this to your API routes for better performance:

```typescript
export const runtime = 'edge';
export const dynamic = 'force-static'; // or 'force-dynamic'
```

---

## Part 8: Continuous Deployment

### Automatic Deployments

Cloudflare Pages automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
# Cloudflare automatically builds and deploys
```

### Preview Deployments

Every pull request gets a preview URL:
1. Create a branch
2. Push changes
3. Open PR on GitHub
4. Cloudflare creates preview: `https://abc123.rayan2.pages.dev`

### Rollback

If something breaks:
1. Go to Workers & Pages > Your project > Deployments
2. Find the last working deployment
3. Click "..." > "Rollback to this deployment"

---

## Cost Breakdown

### Free Tier (Recommended to Start)

- **Cloudflare Pages**: Free (500 builds/month)
- **MongoDB Atlas**: Free M0 tier (512MB)
- **Cloudflare R2**: Free (10GB storage, 1M requests/month)
- **Cloudflare CDN**: Free (unlimited bandwidth)

**Total: $0/month** for small to medium traffic

### Paid Tier (When You Scale)

- **Cloudflare Pages**: $20/month (5,000 builds/month)
- **MongoDB Atlas M10**: ~$57/month (2GB RAM, 10GB storage)
- **Cloudflare R2**: $0.015/GB storage + $0.36/million requests

**Total: ~$80-100/month** for high traffic

---

## Troubleshooting

### Build Fails on Cloudflare Pages

**Check Node version:**
```bash
# Add to environment variables
NODE_VERSION=20
```

**Check build logs** for missing dependencies or errors

### Database Connection Issues

**MongoDB Atlas IP whitelist:**
- Make sure 0.0.0.0/0 is allowed
- Or add Cloudflare's IP ranges

**Connection string format:**
```
mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

### Images Not Loading

**Update image domains in next.config.ts:**
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: '*.r2.cloudflarestorage.com',
    },
  ],
}
```

### Webhook Not Working

**Verify webhook URL in Thawani:**
```
https://your-actual-domain.pages.dev/api/thawani/webhook
```

**Check webhook secret matches** environment variable

### Environment Variables Not Working

**After updating env vars:**
1. Go to Settings > Deployments
2. Click "Retry deployment" on latest
3. Variables only apply to new deployments

---

## Security Checklist

- [ ] MongoDB Atlas: IP whitelist configured
- [ ] MongoDB Atlas: Strong password used
- [ ] NEXTAUTH_SECRET: Generated with `openssl rand -base64 32`
- [ ] R2_SECRET_ACCESS_KEY: Not committed to git
- [ ] THAWANI_SECRET_KEY: Production keys (not test keys)
- [ ] Environment variables: Set in Cloudflare dashboard (not in code)
- [ ] HTTPS: Enabled (automatic with Cloudflare)
- [ ] CORS: Configured properly for R2

---

## Quick Reference Commands

```bash
# Generate secure NextAuth secret
openssl rand -base64 32

# Test MongoDB connection
mongosh "mongodb+srv://rayan-admin:PASSWORD@cluster.mongodb.net/rayan-store"

# Check deployment logs
# Go to: https://dash.cloudflare.com > Workers & Pages > Your project > Deployments

# Export local MongoDB for migration
docker exec rayan-mongodb mongodump --uri="mongodb://admin:admin123@localhost:27017/rayan-store?authSource=admin" --out=/tmp/backup

# Restore to MongoDB Atlas
mongorestore --uri="YOUR_ATLAS_URI" ./mongodb-backup/rayan-store
```

---

## What's Next?

After successful deployment:

1. **Set up monitoring** (Cloudflare Analytics + MongoDB Atlas)
2. **Configure custom domain** (if not done already)
3. **Test all features** with real payment cards (small amounts)
4. **Enable backups** in MongoDB Atlas
5. **Set up alerts** for errors and downtime
6. **Document your API** for future maintenance

---

## Support Links

- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/
- **Next.js on Cloudflare**: https://developers.cloudflare.com/pages/framework-guides/nextjs/
- **Thawani Support**: sales@thawani.om

---

## Need Help?

If you run into issues:
1. Check build logs in Cloudflare dashboard
2. Check MongoDB Atlas connection
3. Verify all environment variables are set
4. Test API endpoints individually
5. Check browser console for errors

---

You're ready to deploy! Start with Part 1 (MongoDB Atlas) and work through each section. The whole process takes about 30-60 minutes.

Good luck! 🚀
