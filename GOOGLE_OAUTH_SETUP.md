# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Go to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth Client ID**
5. If prompted, configure the OAuth consent screen first:
   - User Type: External
   - App name: Rayan Design
   - User support email: your email
   - Developer contact email: your email
6. Application type: **Web application**
7. Name: **Rayan Design - Production**

## Step 2: Configure Authorized URLs

### For Production (Vercel):
**Authorized JavaScript origins:**
```
https://www.rayiandesign.com
https://rayiandesign.com
```

**Authorized redirect URIs:**
```
https://www.rayiandesign.com/api/auth/callback/google
https://rayiandesign.com/api/auth/callback/google
```

### For Local Development:
**Authorized JavaScript origins:**
```
http://localhost:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000/api/auth/callback/google
```

## Step 3: Get Your Credentials

After creating the OAuth client, you'll receive:
- **Client ID** (looks like: `xxxxx.apps.googleusercontent.com`)
- **Client Secret** (keep this secret!)

## Step 4: Add to Environment Variables

### For Local Development (.env.local):
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### For Production (Vercel):
1. Go to your Vercel project
2. Settings > Environment Variables
3. Add:
   - `GOOGLE_CLIENT_ID` = your_client_id
   - `GOOGLE_CLIENT_SECRET` = your_client_secret
4. Redeploy your application

## Step 5: Test

1. Go to your login page
2. You should see "تسجيل الدخول باستخدام Google" button
3. Click it to test the Google sign-in flow

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Console exactly matches:
  - Production: `https://www.rayiandesign.com/api/auth/callback/google`
  - Local: `http://localhost:3000/api/auth/callback/google`

### Users can't sign in
- Check that GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set correctly
- Verify the OAuth consent screen is published (if using external users)
- Check browser console for errors

## How It Works

1. User clicks "Sign in with Google"
2. Redirected to Google's OAuth page
3. User authorizes the app
4. Google redirects back with authorization code
5. NextAuth exchanges code for user info
6. If user doesn't exist, creates new account automatically
7. User is logged in and redirected to dashboard

## Notes

- Google OAuth users don't have passwords in the database
- Users created via Google will have `role: 'user'` by default
- Their profile name and email are saved automatically
- Users can only sign in with Google (no password login for OAuth accounts)
