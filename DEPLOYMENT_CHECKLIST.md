# ✅ Cloudflare Deployment Checklist

Use this checklist to ensure a smooth deployment to Cloudflare.

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] MongoDB Atlas account created
- [ ] Database cluster created (M0 Free tier or higher)
- [ ] Database user created with strong password
- [ ] IP whitelist set to `0.0.0.0/0` (allow all - required for Cloudflare)
- [ ] Connection string copied and saved securely
- [ ] Database indexes created for performance
- [ ] Local data migrated (if applicable)

### 2. Code Preparation
- [ ] `next.config.ts` updated (standalone output commented out)
- [ ] All code committed to git repository
- [ ] Code pushed to GitHub
- [ ] `.env.production.example` reviewed
- [ ] No secrets committed to git (check `.gitignore`)

### 3. Cloudflare Account
- [ ] Cloudflare account created
- [ ] Account verified (email confirmation)
- [ ] Domain added to Cloudflare (if using custom domain)
- [ ] R2 bucket created and configured
- [ ] R2 public URL obtained

### 4. Environment Variables Ready
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `NEXTAUTH_SECRET` - Generated with `openssl rand -base64 32`
- [ ] `NEXTAUTH_URL` - Your deployment URL
- [ ] `R2_ACCOUNT_ID` - From Cloudflare R2
- [ ] `R2_ACCESS_KEY_ID` - From Cloudflare R2
- [ ] `R2_SECRET_ACCESS_KEY` - From Cloudflare R2
- [ ] `R2_BUCKET_NAME` - Your R2 bucket name
- [ ] `R2_PUBLIC_URL` - Your R2 public URL
- [ ] `THAWANI_SECRET_KEY` - Production key from Thawani
- [ ] `NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY` - Production key
- [ ] `THAWANI_WEBHOOK_SECRET` - From Thawani dashboard
- [ ] `NEXT_PUBLIC_THAWANI_ENV=production`

### 5. Third-Party Services
- [ ] Thawani production keys requested (sales@thawani.om)
- [ ] Thawani production account activated
- [ ] Cloudinary account configured (if using)

## Deployment Steps

### Phase 1: Initial Deployment (15-20 minutes)
- [ ] Go to Cloudflare Dashboard
- [ ] Create new Pages project
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Framework: Next.js
  - Build command: `npm run build`
  - Output directory: `.next`
- [ ] Add environment variables
- [ ] Deploy and wait for build

### Phase 2: Post-Deployment Configuration (10 minutes)
- [ ] Test deployed site loads
- [ ] Update `NEXTAUTH_URL` to actual deployment URL
- [ ] Update `NEXT_PUBLIC_APP_URL` to actual deployment URL
- [ ] Redeploy after updating URLs
- [ ] Configure Thawani webhook URL
- [ ] Test webhook endpoint responds

### Phase 3: Testing (20-30 minutes)
- [ ] Home page loads correctly
- [ ] Products page displays products
- [ ] User registration works
- [ ] User login works
- [ ] Add product to cart
- [ ] Proceed to checkout
- [ ] Complete test payment (small amount with real card)
- [ ] Webhook processes payment correctly
- [ ] Order marked as "paid"
- [ ] Success page shows correct status
- [ ] Dashboard accessible (admin features)
- [ ] Images load from R2/Cloudinary

### Phase 4: Custom Domain (Optional, 10 minutes)
- [ ] Add custom domain in Cloudflare Pages
- [ ] DNS automatically configured
- [ ] SSL certificate issued
- [ ] Update `NEXTAUTH_URL` to custom domain
- [ ] Update `NEXT_PUBLIC_APP_URL` to custom domain
- [ ] Update Thawani webhook URL to custom domain
- [ ] Redeploy
- [ ] Test all features on custom domain

### Phase 5: Monitoring Setup (10 minutes)
- [ ] Enable Cloudflare Analytics
- [ ] Set up Cloudflare alerts (build failures, errors)
- [ ] Enable MongoDB Atlas monitoring
- [ ] Set up MongoDB Atlas alerts (connections, disk usage)
- [ ] Configure uptime monitoring (optional - uptimerobot.com)

## Post-Deployment Checklist

### Security
- [ ] All secrets stored in Cloudflare dashboard (not in code)
- [ ] `.env.local` added to `.gitignore`
- [ ] MongoDB Atlas IP whitelist configured
- [ ] HTTPS enabled (automatic with Cloudflare)
- [ ] CORS configured for R2
- [ ] Strong passwords used for all services
- [ ] Production keys separate from test keys

### Performance
- [ ] MongoDB Atlas indexes created
- [ ] Image optimization enabled
- [ ] Cloudflare CDN active
- [ ] R2 CORS configured for optimal performance

### Documentation
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Team members have access (if applicable)
- [ ] Backup and recovery plan documented

### Backup & Recovery
- [ ] MongoDB Atlas automatic backups enabled
- [ ] Backup schedule configured (daily recommended)
- [ ] Recovery process tested
- [ ] Git repository up to date

## Ongoing Maintenance

### Daily
- [ ] Monitor error rates
- [ ] Check payment processing

### Weekly
- [ ] Review Cloudflare Analytics
- [ ] Review MongoDB Atlas metrics
- [ ] Check database storage usage

### Monthly
- [ ] Review and rotate secrets (if needed)
- [ ] Update dependencies
- [ ] Test backup restoration
- [ ] Review performance metrics

## Rollback Plan

If something goes wrong:
1. [ ] Go to Cloudflare Pages > Deployments
2. [ ] Find last working deployment
3. [ ] Click "Rollback to this deployment"
4. [ ] Verify site is working
5. [ ] Fix issues in development
6. [ ] Test thoroughly
7. [ ] Deploy fix

## Common Issues & Solutions

### Build Fails
- Check Node version is set to 20
- Check build logs for errors
- Verify all dependencies in package.json
- Test build locally: `npm run build`

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
- Check connection string format
- Test connection with mongosh

### Images Not Loading
- Verify R2 public URL is correct
- Check CORS configuration on R2
- Verify image domains in next.config.ts

### Webhook Not Working
- Verify webhook URL in Thawani matches deployment URL
- Check webhook secret matches
- Test webhook endpoint manually

### Environment Variables Not Applied
- After updating, redeploy from Cloudflare dashboard
- Variables only apply to new deployments

## Support Contacts

- **Cloudflare Support**: https://support.cloudflare.com
- **MongoDB Atlas Support**: https://support.mongodb.com
- **Thawani Support**: sales@thawani.om
- **Next.js Docs**: https://nextjs.org/docs

## Quick Commands

```bash
# Generate NextAuth secret
openssl rand -base64 32

# Test MongoDB connection
mongosh "YOUR_MONGODB_ATLAS_URI"

# Test local build
npm run build

# Commit and push for deployment
git add .
git commit -m "Deploy to production"
git push origin main
```

## Estimated Timeline

- **First-time deployment**: 60-90 minutes
- **Subsequent deployments**: 5-10 minutes (automatic)
- **Custom domain setup**: 10-15 minutes
- **Full testing**: 30-45 minutes

## Success Criteria

Your deployment is successful when:
- ✅ Site loads on deployment URL
- ✅ All pages load without errors
- ✅ User authentication works
- ✅ Products display correctly
- ✅ Cart functionality works
- ✅ Payment processing completes successfully
- ✅ Webhooks update order status
- ✅ Images load from R2/Cloudinary
- ✅ Dashboard accessible
- ✅ No console errors
- ✅ MongoDB Atlas shows active connections
- ✅ Cloudflare Analytics shows traffic

---

**Ready to deploy?** Start with the Database Setup section and work through each checklist item! 🚀
