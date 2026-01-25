# Cloudflare R2 CORS Configuration - UPDATED FOR PUT METHOD

## Problem
You're getting a CORS error when uploading files to R2 because the bucket doesn't allow cross-origin requests from your browser.

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource
```

**IMPORTANT:** The upload now uses **presigned PUT URLs** (not POST) which is simpler and more reliable with CORS.

## Solution: Configure CORS on Your R2 Bucket

### Option 1: Using Cloudflare Dashboard (Easiest)

1. **Go to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com/
   - Navigate to **R2** → **rayan-products** bucket

2. **Open Settings**
   - Click on your bucket name
   - Go to the **Settings** tab
   - Scroll to **CORS Policy** section

3. **Add CORS Rules**
   Click "Edit CORS Policy" and paste this configuration:

   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "HEAD"],
       "AllowedHeaders": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

4. **Save** the configuration

---

### Option 2: Using Cloudflare API (For Automation)

Run this command with your credentials:

```bash
curl -X PUT \
  https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/r2/buckets/rayan-products/cors \
  -H "Authorization: Bearer {API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d @r2-cors-config.json
```

Replace:
- `{ACCOUNT_ID}` with your Cloudflare account ID
- `{API_TOKEN}` with your Cloudflare API token (with R2 permissions)
- The config file `r2-cors-config.json` is already created in your project root

---

### Option 3: Using Wrangler CLI (Recommended)

If you have Wrangler installed:

```bash
# Install wrangler if not already installed
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Apply CORS configuration
wrangler r2 bucket cors put rayan-products --file r2-cors-config.json
```

---

## Security Note

The configuration above uses `"AllowedOrigins": ["*"]` which allows requests from ANY domain. For production, you should restrict this:

```json
{
  "AllowedOrigins": [
    "https://yourdomain.com",
    "http://localhost:3000"
  ],
  ...
}
```

Replace `yourdomain.com` with your actual domain.

---

## Verify CORS Configuration

After applying, test by:

1. Refresh your browser
2. Try uploading a large file again
3. Check browser console - the CORS error should be gone

If you still see CORS errors, wait 1-2 minutes for the configuration to propagate.

---

## What This CORS Configuration Does

- **AllowedOrigins**: Which domains can make requests to your R2 bucket
- **AllowedMethods**: Which HTTP methods are allowed (GET, POST, PUT for uploads)
- **AllowedHeaders**: Which headers the browser can send (using * for all)
- **ExposeHeaders**: Which response headers the browser can read
- **MaxAgeSeconds**: How long browsers can cache the CORS preflight response (1 hour)

---

## Next Steps

After configuring CORS:
1. Your large file uploads (400MB, 300MB) should work perfectly
2. Files will upload directly from browser to R2 (no timeout)
3. You'll see success messages in the console
