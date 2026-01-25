# Language Variant System - Complete Implementation Plan

## Overview
Users can purchase products in Arabic, English, or BOTH languages. Each language has its own price and downloadable file (PDF/PPT). Files are stored in Cloudinary CDN and linked in the database.

---

## System Architecture

### Data Flow
```
Admin Dashboard → Upload Files → Cloudinary CDN → Save URLs to MongoDB → Display on Site → User Selects Language(s) → Purchase → Download from CDN
```

### Database Structure

#### Product Document
```javascript
{
  _id: "507f1f77bcf86cd799439011",
  title: "لعبة الذكاء الاصطناعي",
  description: "وصف المنتج...",
  category: "ai-games",
  subcategory: "omani",
  image: "https://res.cloudinary.com/.../image.jpg",  // Product preview image
  languages: [
    {
      lang: "ar",
      price: 2.500,
      fileUrl: "https://res.cloudinary.com/.../arabic-version.pdf"  // Downloadable file
    },
    {
      lang: "en",
      price: 3.000,
      fileUrl: "https://res.cloudinary.com/.../english-version.pptx"  // Downloadable file
    }
  ],
  status: "active",
  createdAt: "2026-01-07T...",
  updatedAt: "2026-01-07T..."
}
```

#### Order Document
```javascript
{
  _id: "507f1f77bcf86cd799439012",
  userId: "507f1f77bcf86cd799439010",
  customerInfo: { name: "...", email: "...", phone: "..." },
  items: [
    {
      productId: "507f1f77bcf86cd799439011",
      title: "لعبة الذكاء الاصطناعي",
      language: "ar",  // Which language user purchased
      price: 2.500,
      fileUrl: "https://res.cloudinary.com/.../arabic-version.pdf"  // Direct download link
    },
    {
      productId: "507f1f77bcf86cd799439011",
      title: "لعبة الذكاء الاصطناعي",
      language: "en",  // Same product, different language
      price: 3.000,
      fileUrl: "https://res.cloudinary.com/.../english-version.pptx"
    }
  ],
  total: 5.500,  // Sum of both languages
  status: "completed",
  paymentMethod: "card",
  date: "2026-01-07T..."
}
```

---

## Implementation Steps

### PHASE 1: API Routes (Backend)

#### 1.1 Update Products API (`/app/api/products/route.ts`)

**GET /api/products**
- No changes needed (returns products with languages array)
- Frontend will handle displaying language options

**POST /api/products** (Create Product)
```typescript
Request Body:
{
  title: string,
  description: string,
  category: string,
  subcategory?: string,
  image: string,  // Cloudinary URL from /api/upload
  languages: [
    {
      lang: "ar",
      price: 2.500,
      fileUrl: "https://..."  // From /api/upload-file
    },
    {
      lang: "en",
      price: 3.000,
      fileUrl: "https://..."
    }
  ]
}

Validation:
- At least one language variant required
- Each language must have price and fileUrl
- No duplicate languages (can't have two "ar" entries)
- Valid file URLs (must be Cloudinary URLs)

Response:
{
  success: true,
  data: { ...product },
  message: "Product created successfully"
}
```

**PUT /api/products/[id]** (Update Product)
- Same structure as POST
- Validate that all language variants are complete
- Allow updating fileUrl (replace old file)

#### 1.2 Update Products Detail API (`/app/api/products/[id]/route.ts`)

**GET /api/products/[id]**
- Returns product with full languages array
- No changes needed

#### 1.3 File Upload API (Already Created)

**POST /api/upload** - For product preview images
- Accepts: JPEG, PNG, WebP, GIF
- Max: 5MB
- Folder: `rayan-products/images/`

**POST /api/upload-file** - For product files (PDF/PPT)
- Accepts: PDF, PPT, PPTX
- Max: 50MB
- Folder: `rayan-products/files/`
- Returns: `{ url, publicId, format, bytes }`

---

### PHASE 2: Dashboard - Product Management

#### 2.1 Product Creation Form (`/app/[locale]/dashboard/products/page.tsx`)

**Form Structure:**
```
┌─────────────────────────────────────────┐
│ Add New Product                         │
├─────────────────────────────────────────┤
│ Title: [________________]               │
│ Description: [___________]              │
│ Category: [Dropdown▼]                   │
│ Subcategory: [_______]                  │
│                                         │
│ Product Image (Preview):                │
│ [Upload Image] → Shows preview          │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ARABIC VERSION                      │ │
│ │ ☑ Available                         │ │
│ │ Price: [_____] ر.ع                  │ │
│ │ File: [Upload PDF/PPT]              │ │
│ │ Status: ✓ arabic-version.pdf        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ ENGLISH VERSION                     │ │
│ │ ☑ Available                         │ │
│ │ Price: [_____] OMR                  │ │
│ │ File: [Upload PDF/PPT]              │ │
│ │ Status: ✓ english-version.pptx      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancel] [Save Product]                 │
└─────────────────────────────────────────┘
```

**Upload Flow:**
1. Admin fills basic info (title, description, category)
2. Uploads product preview image → POST /api/upload
3. Checks "Arabic Available" checkbox
4. Sets Arabic price
5. Uploads Arabic PDF/PPT file → POST /api/upload-file → Gets URL
6. Checks "English Available" checkbox
7. Sets English price
8. Uploads English PDF/PPT file → POST /api/upload-file → Gets URL
9. Clicks "Save Product" → POST /api/products with all data

**State Management:**
```typescript
const [formData, setFormData] = useState({
  title: "",
  description: "",
  category: "",
  subcategory: "",
  image: "",
  languages: {
    ar: {
      enabled: false,
      price: 0,
      fileUrl: "",
      fileName: "",
      uploading: false
    },
    en: {
      enabled: false,
      price: 0,
      fileUrl: "",
      fileName: "",
      uploading: false
    }
  }
});

const handleFileUpload = async (lang: 'ar' | 'en', file: File) => {
  // Set uploading state
  setFormData(prev => ({
    ...prev,
    languages: {
      ...prev.languages,
      [lang]: { ...prev.languages[lang], uploading: true }
    }
  }));

  // Upload to API
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/api/upload-file', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();

  // Update state with URL
  setFormData(prev => ({
    ...prev,
    languages: {
      ...prev.languages,
      [lang]: {
        ...prev.languages[lang],
        fileUrl: data.data.url,
        fileName: file.name,
        uploading: false
      }
    }
  }));
};

const handleSubmit = async () => {
  // Build languages array from form data
  const languages = [];
  if (formData.languages.ar.enabled) {
    languages.push({
      lang: 'ar',
      price: formData.languages.ar.price,
      fileUrl: formData.languages.ar.fileUrl
    });
  }
  if (formData.languages.en.enabled) {
    languages.push({
      lang: 'en',
      price: formData.languages.en.price,
      fileUrl: formData.languages.en.fileUrl
    });
  }

  // Validate
  if (languages.length === 0) {
    toast.error('يجب إضافة لغة واحدة على الأقل');
    return;
  }

  // Submit
  await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      subcategory: formData.subcategory,
      image: formData.image,
      languages
    })
  });
};
```

#### 2.2 Product List Display

**Table Columns:**
- Image
- Title
- Category
- **Languages** (New Column)
  - Shows: "🇸🇦 Arabic (2.500 ر.ع) | 🇬🇧 English (3.000 OMR)"
  - Or: "🇸🇦 Arabic only (2.500 ر.ع)"
- Status
- Actions (Edit/Delete)

#### 2.3 Product Edit Form

Same as create form but:
- Pre-fill all fields including language variants
- Show existing file names
- Allow replacing files
- If replacing file, upload new one and update URL

---

### PHASE 3: Public Product Pages

#### 3.1 Product Listing Page (`/app/[locale]/(main)/products/page.tsx`)

**Product Card Display:**
- Show product image
- Show product title
- Show **starting price**: "من 2.500 ر.ع" (from lowest language price)
- Show available languages: "🇸🇦 عربي | 🇬🇧 English"

```typescript
const ProductCard = ({ product }) => {
  // Calculate minimum price
  const minPrice = Math.min(...product.languages.map(l => l.price));

  return (
    <Card>
      <img src={product.image} />
      <h3>{product.title}</h3>
      <div className="languages">
        {product.languages.map(lang => (
          <span key={lang.lang}>
            {lang.lang === 'ar' ? '🇸🇦' : '🇬🇧'}
            {lang.lang === 'ar' ? 'عربي' : 'English'}
          </span>
        ))}
      </div>
      <p className="price">من {minPrice.toFixed(3)} ر.ع</p>
      <Button>عرض التفاصيل</Button>
    </Card>
  );
};
```

#### 3.2 Product Detail Page (`/app/[locale]/(main)/products/[id]/page.tsx`)

**Layout:**
```
┌──────────────────────────────────────────────┐
│ [Image]              Product Title           │
│                                              │
│                      Description...          │
│                                              │
│                      SELECT LANGUAGE(S):     │
│                      ┌─────────────────────┐ │
│                      │ ☐ النسخة العربية   │ │
│                      │   2.500 ر.ع         │ │
│                      └─────────────────────┘ │
│                      ┌─────────────────────┐ │
│                      │ ☐ English Version   │ │
│                      │   3.000 OMR         │ │
│                      └─────────────────────┘ │
│                                              │
│                      Total: 0.000 ر.ع       │
│                                              │
│                      [Add to Cart]           │
│                      [Buy Now]               │
└──────────────────────────────────────────────┘
```

**Functionality:**
```typescript
const [selectedLanguages, setSelectedLanguages] = useState<{
  ar?: boolean;
  en?: boolean;
}>({});

const handleLanguageToggle = (lang: 'ar' | 'en') => {
  setSelectedLanguages(prev => ({
    ...prev,
    [lang]: !prev[lang]
  }));
};

const calculateTotal = () => {
  let total = 0;
  if (selectedLanguages.ar) {
    const arVersion = product.languages.find(l => l.lang === 'ar');
    total += arVersion?.price || 0;
  }
  if (selectedLanguages.en) {
    const enVersion = product.languages.find(l => l.lang === 'en');
    total += enVersion?.price || 0;
  }
  return total;
};

const handleAddToCart = () => {
  // Validate at least one language selected
  if (!selectedLanguages.ar && !selectedLanguages.en) {
    toast.error('الرجاء اختيار لغة واحدة على الأقل');
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  // Add each selected language as separate cart item
  if (selectedLanguages.ar) {
    const arVersion = product.languages.find(l => l.lang === 'ar');
    cart.push({
      id: product._id,
      title: product.title,
      language: 'ar',
      languageLabel: 'النسخة العربية',
      price: arVersion.price,
      fileUrl: arVersion.fileUrl,
      image: product.image,
      quantity: 1
    });
  }

  if (selectedLanguages.en) {
    const enVersion = product.languages.find(l => l.lang === 'en');
    cart.push({
      id: product._id,
      title: product.title,
      language: 'en',
      languageLabel: 'English Version',
      price: enVersion.price,
      fileUrl: enVersion.fileUrl,
      image: product.image,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cartUpdated'));
  toast.success('تم إضافة المنتج إلى السلة');
};

const handleBuyNow = () => {
  // Validate selection
  if (!selectedLanguages.ar && !selectedLanguages.en) {
    toast.error('الرجاء اختيار لغة واحدة على الأقل');
    return;
  }

  // Encode selected languages in URL
  const langs = [];
  if (selectedLanguages.ar) langs.push('ar');
  if (selectedLanguages.en) langs.push('en');

  router.push(`/checkout?productId=${product._id}&langs=${langs.join(',')}` as any);
};
```

---

### PHASE 4: Cart System

#### 4.1 Cart Storage Structure

```typescript
// localStorage 'cart' key
[
  {
    id: "507f1f77bcf86cd799439011",
    title: "لعبة الذكاء الاصطناعي",
    language: "ar",
    languageLabel: "النسخة العربية",
    price: 2.500,
    fileUrl: "https://...",
    image: "https://...",
    quantity: 1
  },
  {
    id: "507f1f77bcf86cd799439011",  // Same product ID
    title: "لعبة الذكاء الاصطناعي",
    language: "en",  // Different language
    languageLabel: "English Version",
    price: 3.000,
    fileUrl: "https://...",
    image: "https://...",
    quantity: 1
  },
  {
    id: "507f1f77bcf86cd799439012",  // Different product
    title: "عرض تقديمي",
    language: "ar",
    languageLabel: "النسخة العربية",
    price: 1.500,
    fileUrl: "https://...",
    image: "https://...",
    quantity: 1
  }
]
```

**Key Points:**
- Each language variant is stored as **separate cart item**
- Items are identified by `id + language` combination
- This allows same product with different languages in cart

#### 4.2 Cart Page Display

**Cart Item Card:**
```
┌─────────────────────────────────────────┐
│ [IMG] لعبة الذكاء الاصطناعي            │
│       النسخة العربية 🇸🇦               │
│       2.500 ر.ع                   [×]   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ [IMG] لعبة الذكاء الاصطناعي            │
│       English Version 🇬🇧               │
│       3.000 ر.ع                   [×]   │
└─────────────────────────────────────────┘
```

**Cart Functions:**
```typescript
const removeFromCart = (productId: string, language: string) => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const updated = cart.filter(item =>
    !(item.id === productId && item.language === language)
  );
  localStorage.setItem('cart', JSON.stringify(updated));
  setCart(updated);
  window.dispatchEvent(new Event('cartUpdated'));
};
```

---

### PHASE 5: Checkout Process

#### 5.1 Checkout from Product Page

**URL:** `/checkout?productId=xxx&langs=ar,en`

```typescript
const CheckoutContent = () => {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');
  const langsParam = searchParams.get('langs');
  const fromCart = searchParams.get('fromCart') === 'true';

  useEffect(() => {
    if (productId && langsParam) {
      // Direct purchase with language selection
      fetchProduct(productId, langsParam.split(','));
    } else if (fromCart) {
      // Purchase from cart
      loadCartItems();
    }
  }, [productId, langsParam, fromCart]);

  const fetchProduct = async (id: string, languages: string[]) => {
    const response = await fetch(`/api/products/${id}`);
    const data = await response.json();

    // Build items from selected languages
    const items = languages.map(lang => {
      const variant = data.data.languages.find(l => l.lang === lang);
      return {
        productId: id,
        title: data.data.title,
        language: lang,
        price: variant.price,
        fileUrl: variant.fileUrl,
        image: data.data.image
      };
    });

    setCheckoutItems(items);
  };
};
```

#### 5.2 Order Creation

**POST /api/orders Request:**
```javascript
{
  userId: "507f1f77bcf86cd799439010",
  customerInfo: {
    name: "أحمد محمد",
    email: "ahmad@example.com",
    phone: "+96899999999"
  },
  items: [
    {
      productId: "507f1f77bcf86cd799439011",
      title: "لعبة الذكاء الاصطناعي",
      language: "ar",
      price: 2.500,
      fileUrl: "https://res.cloudinary.com/.../arabic.pdf"
    },
    {
      productId: "507f1f77bcf86cd799439011",
      title: "لعبة الذكاء الاصطناعي",
      language: "en",
      price: 3.000,
      fileUrl: "https://res.cloudinary.com/.../english.pptx"
    }
  ],
  total: 5.500,
  status: "completed",
  paymentMethod: "card"
}
```

**Response:**
```javascript
{
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439012",
    // ... full order
  },
  message: "Order created successfully"
}
```

---

### PHASE 6: My Orders & Downloads

#### 6.1 My Orders Page (`/app/[locale]/(main)/my-orders/page.tsx`)

**Order Card Display:**
```
┌─────────────────────────────────────────┐
│ طلب #78C3414D                           │
│ ٧ يناير ٢٠٢٦                     5.500 ر.ع │
│ مكتمل ✓                                 │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ [IMG] لعبة الذكاء الاصطناعي        │ │
│ │       النسخة العربية 🇸🇦           │ │
│ │       2.500 ر.ع                    │ │
│ │       [⬇ تحميل PDF]                │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ [IMG] لعبة الذكاء الاصطناعي        │ │
│ │       English Version 🇬🇧           │ │
│ │       3.000 ر.ع                    │ │
│ │       [⬇ Download PPTX]            │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Download Functionality:**
```typescript
const handleDownload = (item: OrderItem) => {
  if (!item.fileUrl) {
    toast.error('الملف غير متوفر');
    return;
  }

  // Open file URL in new tab to download
  window.open(item.fileUrl, '_blank');

  toast.success(`جاري تحميل: ${item.title} (${item.language === 'ar' ? 'عربي' : 'English'})`);
};

// In JSX
{order.status === 'completed' && item.fileUrl && (
  <Button
    size="sm"
    onClick={() => handleDownload(item)}
    className="gap-2"
  >
    <Download className="w-4 h-4" />
    {item.language === 'ar' ? 'تحميل' : 'Download'}
    {item.fileUrl.endsWith('.pdf') ? ' PDF' : ' PPT'}
  </Button>
)}
```

**Important:**
- Only show download button if `order.status === 'completed'`
- Only show if `item.fileUrl` exists
- Clicking download opens Cloudinary URL directly
- Cloudinary handles the file streaming/download

---

### PHASE 7: Admin Orders Dashboard

#### 7.1 Orders Table Display

**Additional Column: "Files"**

```
┌──────────────────────────────────────────────────────────────┐
│ Invoice# │ Customer │ Products           │ Files          │ │
├──────────────────────────────────────────────────────────────┤
│ #78C3414D│ أحمد     │ AI Game (2 langs)  │ AR.pdf        │ │
│          │          │                    │ EN.pptx       │ │
└──────────────────────────────────────────────────────────────┘
```

#### 7.2 Order Details Modal

**Show Each Item with Language:**
```
المنتجات المشتراة:
┌─────────────────────────────────────┐
│ لعبة الذكاء الاصطناعي               │
│ اللغة: النسخة العربية 🇸🇦           │
│ الملف: arabic-version.pdf           │
│ السعر: 2.500 ر.ع                   │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│ لعبة الذكاء الاصطناعي               │
│ اللغة: English Version 🇬🇧          │
│ الملف: english-version.pptx         │
│ السعر: 3.000 ر.ع                   │
└─────────────────────────────────────┘
```

---

## File Upload & Download Flow Summary

### Upload Flow (Admin Dashboard)
```
1. Admin creates product
2. Admin checks "Arabic Available"
3. Admin clicks "Upload File" for Arabic
4. File picker opens → Admin selects "product-ar.pdf"
5. POST /api/upload-file with FormData
6. Cloudinary receives file
7. Cloudinary stores at: rayan-products/files/product-ar-xyz123.pdf
8. Cloudinary returns URL: https://res.cloudinary.com/.../product-ar-xyz123.pdf
9. URL saved in Product.languages[0].fileUrl
10. Repeat for English version
11. Submit product → Both URLs saved in MongoDB
```

### Download Flow (User)
```
1. User completes purchase
2. Order saved with items[].fileUrl from Product.languages[].fileUrl
3. User goes to "My Orders"
4. Clicks "Download" button
5. window.open(item.fileUrl, '_blank')
6. Browser requests file from Cloudinary CDN
7. Cloudinary streams file to browser
8. Browser downloads file
```

---

## Validation Rules

### Product Creation
- ✅ At least 1 language variant required
- ✅ Each language must have price > 0
- ✅ Each language must have fileUrl (valid Cloudinary URL)
- ✅ No duplicate languages (can't have 2 Arabic versions)
- ✅ Image required (product preview)

### Adding to Cart
- ✅ At least 1 language must be selected
- ✅ Can select both languages = 2 cart items

### Checkout
- ✅ Must be authenticated
- ✅ At least 1 item in cart or langs param
- ✅ All items must have valid fileUrl

### Downloads
- ✅ Only show if order status is 'completed'
- ✅ Only show if item.fileUrl exists
- ✅ User must own the order (userId matches or order has their email)

---

## Edge Cases & Considerations

### 1. User Buys Same Product Twice (Different Languages)
**Scenario:** User already bought Arabic version, now wants English
**Solution:** Allow it. They'll see both in "My Orders"

### 2. Admin Updates Product File
**Scenario:** Admin replaces Arabic PDF with newer version
**Question:** What about old orders?
**Solution:** Old orders keep old fileUrl (don't update). It's immutable once sold.

### 3. File Not Available on Cloudinary
**Scenario:** File deleted from Cloudinary but order exists
**Solution:** Show error message, disable download button, admin should re-upload

### 4. Large File Downloads
**Scenario:** 50MB PPTX takes time
**Solution:** Cloudinary handles streaming. Show toast "جاري التحميل..." immediately

### 5. Cart Item Deduplication
**Scenario:** User adds Arabic version twice
**Solution:** Check if `productId + language` combo already exists in cart before adding

```typescript
const handleAddToCart = () => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  if (selectedLanguages.ar) {
    const exists = cart.some(item =>
      item.id === product._id && item.language === 'ar'
    );

    if (!exists) {
      const arVersion = product.languages.find(l => l.lang === 'ar');
      cart.push({
        id: product._id,
        title: product.title,
        language: 'ar',
        languageLabel: 'النسخة العربية',
        price: arVersion.price,
        fileUrl: arVersion.fileUrl,
        image: product.image,
        quantity: 1
      });
    } else {
      toast.info('النسخة العربية موجودة بالفعل في السلة');
    }
  }

  // Same for English...
};
```

---

## Migration Strategy for Existing Products

### Current Products (Old Schema)
```javascript
{
  title: "Old Product",
  price: 5.000,
  // No languages array
}
```

### Migration Script (`/scripts/migrate-products.ts`)
```typescript
import Product from '@/lib/models/Product';
import { connectDB } from '@/lib/api-utils';

async function migrateProducts() {
  await connectDB();

  const products = await Product.find({ languages: { $exists: false } });

  for (const product of products) {
    // Convert old single price to Arabic version
    product.languages = [{
      lang: 'ar',
      price: product.price,
      fileUrl: '' // Admin must upload file manually
    }];

    await product.save();
    console.log(`Migrated: ${product.title}`);
  }

  console.log(`Migrated ${products.length} products`);
}

migrateProducts();
```

**Manual Steps After Migration:**
1. Run migration script: `npx tsx scripts/migrate-products.ts`
2. All products will have Arabic version with old price
3. Admin must:
   - Go to each product in dashboard
   - Upload Arabic PDF/PPT file
   - Optionally add English version

---

## Testing Checklist

### Dashboard
- [ ] Upload product image successfully
- [ ] Upload Arabic PDF file
- [ ] Upload English PPTX file
- [ ] Create product with both languages
- [ ] Edit product and replace file
- [ ] Create product with only Arabic
- [ ] Create product with only English
- [ ] Try to create product with no languages (should fail)
- [ ] View products table with language info

### Public Pages
- [ ] Product listing shows "من X.XXX ر.ع"
- [ ] Product listing shows language badges
- [ ] Product detail shows language checkboxes
- [ ] Select Arabic only → correct price
- [ ] Select English only → correct price
- [ ] Select both → sum of prices
- [ ] Try to add without selection → error message
- [ ] Add Arabic to cart → appears correctly
- [ ] Add both to cart → 2 separate items

### Cart & Checkout
- [ ] Cart shows language labels
- [ ] Cart calculates correct total
- [ ] Remove Arabic keeps English
- [ ] Checkout with cart items
- [ ] Direct buy with langs param
- [ ] Order created with fileUrls

### Downloads
- [ ] Completed order shows download buttons
- [ ] Pending order hides download buttons
- [ ] Click download opens Cloudinary URL
- [ ] PDF downloads correctly
- [ ] PPTX downloads correctly
- [ ] Admin can see files in order details

---

## Timeline Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| 1. API Routes | Update Products API, validate | 30 min |
| 2. Dashboard | Product form with file uploads | 2 hours |
| 3. Public Pages | Product detail with language selection | 1 hour |
| 4. Cart | Update cart to handle languages | 45 min |
| 5. Checkout | Update checkout flow | 45 min |
| 6. Downloads | My Orders with download buttons | 30 min |
| 7. Testing | Full system test | 1 hour |
| **TOTAL** | | **~6.5 hours** |

---

## Next Steps

1. **Review this plan** - Make sure it matches your vision
2. **Confirm Cloudinary setup** - Do you have account credentials?
3. **Start implementation** - I'll begin with Phase 1 (API Routes)
4. **Iterative testing** - Test each phase before moving to next

Ready to start implementation? Should I proceed with Phase 1?
