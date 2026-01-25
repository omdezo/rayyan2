# FIX CORS ERROR - STEP BY STEP GUIDE

## Current Status
✅ Code updated to use presigned PUT (simpler, more reliable)
❌ CORS still blocking uploads - need to verify/fix R2 bucket configuration

---

## STEP 1: Double-Check CORS Configuration in Cloudflare

### Go to your R2 bucket settings:
1. Open https://dash.cloudflare.com/
2. Click **R2** in the left sidebar
3. Click on **rayan-products** bucket
4. Click the **Settings** tab
5. Scroll down to **CORS Policy** section

### Verify the CORS configuration looks EXACTLY like this:

```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

**IMPORTANT**: Make sure "PUT" is in the AllowedMethods array!

### If it's wrong or missing:
1. Click **Edit CORS Policy**
2. Delete any existing configuration
3. Paste the configuration above
4. Click **Save**
5. **Wait 2-3 minutes** for changes to propagate

---

## STEP 2: Verify Your Code is Updated

Make sure you have the latest changes:

```bash
# Check if the upload code uses PUT method
grep -A5 "method: 'PUT'" app/[locale]/dashboard/products/page.tsx
```

You should see:
```javascript
const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    ...
```

If you don't see this, the file wasn't updated. Let me know.

---

## STEP 3: Clear Browser Cache and Test

1. **Close all browser tabs** with your app
2. **Clear browser cache** (or use Incognito/Private mode)
3. **Restart your dev server**:
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```
4. Open your app in a **fresh browser tab**
5. Try uploading your 400MB file again

---

## STEP 4: Check Console Logs

Open browser console (F12) and look for these logs:

### ✅ Success looks like:
```
Starting upload for ar language, size: 400.00MB
Using presigned URL upload for large file (400.00MB)
Uploading directly to R2...
✅ File uploaded successfully to R2, key: files/1234567890-abc123.pdf
```

### ❌ Still failing? Check for:
- **CORS error**: CORS configuration not applied or wrong
- **403 Forbidden**: Check your R2 credentials in .env.local
- **Network error**: Check internet connection or Cloudflare tunnel

---

## STEP 5: Alternative - Test with Wrangler CLI

If dashboard method doesn't work, use Wrangler CLI:

```bash
# Install wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# View current CORS settings
wrangler r2 bucket cors get rayan-products

# Apply CORS configuration
wrangler r2 bucket cors put rayan-products --file r2-cors-config.json

# Verify it was applied
wrangler r2 bucket cors get rayan-products
```

---

## STEP 6: Still Not Working? Debugging Steps

### Check environment variables:
```bash
grep R2_ .env.local
```

You should see:
```
R2_ACCOUNT_ID=fac2e0dd660f30d3a821504eeacf8d14
R2_BUCKET_NAME=rayan-products
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
```

### Test presigned URL generation:
Try uploading a file and check the presigned URL in the network tab:
1. Open Browser DevTools (F12) → Network tab
2. Try uploading a file
3. Look for request to `/api/upload-file/presigned`
4. Check the response - you should see `uploadUrl` and `key`
5. Look for the PUT request to `r2.cloudflarestorage.com`
6. If it's blocked by CORS, the CORS configuration isn't applied

### Common Issues:

**Issue**: CORS error persists after configuring
**Solution**: Wait 2-3 minutes, then try again. CORS changes take time to propagate.

**Issue**: 403 Forbidden error
**Solution**: Check your R2 access credentials are correct in .env.local

**Issue**: URL not generated
**Solution**: Check server logs for errors in generating presigned URL

---

## What Changed

### Before (POST with FormData):
- Complex FormData with multiple fields
- More prone to CORS issues
- Required specific field ordering

### After (PUT with raw file):
- Simple PUT request with file as body
- More CORS-friendly
- No field ordering issues
- **Much more reliable!**

---

## Need Help?

If still not working after all steps:
1. Send me the **full console error** (browser console, F12)
2. Send me the **CORS policy** from your R2 bucket settings
3. Send me the **network request details** for the failed PUT request (from Network tab)
