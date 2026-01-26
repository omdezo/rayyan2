# ريان للتصميم | Rayan Design Store

E-commerce platform for selling digital products (presentations, templates, educational materials) with multi-language support and secure payment processing.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: MongoDB Atlas
- **Authentication**: NextAuth v5
- **Payment**: Thawani Payment Gateway (Oman)
- **Storage**: Cloudflare R2
- **Deployment**: Vercel
- **i18n**: next-intl (Arabic/English)

## Key Features

- ✅ Bilingual support (Arabic/English)
- ✅ Multi-language product variants (AR/EN PDFs/PPTs)
- ✅ Secure payment with Thawani (Apple Pay, Credit Cards)
- ✅ Admin dashboard for product management
- ✅ Media gallery with image/video support
- ✅ Responsive design (mobile-first)
- ✅ Real-time cart system
- ✅ Return & exchange policy (15 days)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env` file:

```bash
# MongoDB Atlas
MONGODB_URI=your_mongodb_connection_string

# NextAuth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_PUBLIC_URL=https://your-r2-public-url

# Thawani Payment Gateway
NEXT_PUBLIC_THAWANI_ENV=uat # or 'production'
THAWANI_SECRET_KEY=your_secret_key
NEXT_PUBLIC_THAWANI_PUBLISHABLE_KEY=your_publishable_key
THAWANI_WEBHOOK_SECRET=your_webhook_secret

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Admin Access

Access dashboard: `/ar/dashboard`

Admin credentials are configured separately and not stored in the repository.

## Project Structure

```
app/
├── [locale]/              # i18n routes (ar/en)
│   ├── (main)/           # Public pages
│   │   ├── products/     # Product listing & detail
│   │   ├── checkout/     # Checkout flow
│   │   ├── cart/         # Shopping cart
│   │   └── login/        # Authentication
│   └── dashboard/        # Admin panel
├── api/                  # API routes
│   ├── products/        # Product CRUD
│   ├── orders/          # Order management
│   ├── thawani/         # Payment integration
│   └── upload/          # File uploads
components/
├── features/            # Feature components
├── ui/                  # UI components (shadcn)
└── dashboard/           # Admin components
lib/
├── models/             # MongoDB models
├── thawani.ts          # Payment gateway
└── mongodb.ts          # Database connection
```

## Payment Integration

Using Thawani Payment Gateway for secure payments in Oman.

**Important**: The publishable key in payment URLs is safe to expose client-side. The secret key is only used server-side and must remain confidential.

## Deployment

Deployed on Vercel at: [rayiandesign.com](https://www.rayiandesign.com)

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Domain Setup**: Configure DNS to point to Vercel and set up redirect from non-www to www.

## Security Notes

- Strong password validation (8+ chars, uppercase, lowercase, number, special char)
- Admin-only routes protected by middleware
- JWT-based sessions (30-day expiry)
- Secure payment processing (PCI compliant via Thawani)
- Return policy as per Oman Consumer Protection Law

## Support

For technical support or questions, contact: support@rayiandesign.com
