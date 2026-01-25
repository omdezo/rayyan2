# Media Gallery Integration Guide 🚀

## Quick Start - Just Add These Lines!

### Step 1: Add to Dashboard Products Page

**File**: `app/[locale]/dashboard/products/page.tsx`

**1. Add import at top:**
```typescript
import { MediaGalleryManager } from "@/components/dashboard/media-gallery-manager";
import type { IProductMedia } from "@/lib/types/models";
```

**2. Add to ProductFormData interface (around line 39):**
```typescript
interface ProductFormData {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    image: string;
    status: string;
    media: IProductMedia[]; // ADD THIS LINE
    languages: {
        ar: LanguageFormData;
        en: LanguageFormData;
    };
}
```

**3. Update initial formData state (around line 63):**
```typescript
const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category: "ai-games",
    subcategory: "",
    image: "",
    status: "active",
    media: [], // ADD THIS LINE
    languages: {
        ar: { enabled: true, price: "", fileUrl: "", fileName: "", uploading: false },
        en: { enabled: false, price: "", fileUrl: "", fileName: "", uploading: false }
    }
});
```

**4. Update handleOpenDialog for editing (around line 243-289):**

In the editing section (when product exists), add:
```typescript
setFormData({
    title: product.title,
    description: product.description,
    category: product.category,
    subcategory: product.subcategory || "",
    image: product.image,
    status: product.status,
    media: product.media || [], // ADD THIS LINE
    languages: {
        // ... existing language code
    }
});
```

In the new product section, add:
```typescript
setFormData({
    title: "",
    description: "",
    category: "ai-games",
    subcategory: "",
    image: "",
    status: "active",
    media: [], // ADD THIS LINE
    languages: {
        // ... existing language code
    }
});
```

**5. Update handleSubmit to include media (around line 349):**
```typescript
const productData = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    subcategory: formData.subcategory || undefined,
    image: formData.image,
    media: formData.media, // ADD THIS LINE
    languages,
    status: formData.status,
};
```

**6. Add media gallery UI in the form (around line 665, after image upload section):**
```tsx
{/* Product Image */}
<div className="space-y-2">
    {/* ... existing image upload code ... */}
</div>

{/* ADD THIS ENTIRE SECTION: */}
{/* Media Gallery */}
<div className="space-y-2 pt-4 border-t">
    <MediaGalleryManager
        media={formData.media}
        onChange={(newMedia) => setFormData(prev => ({ ...prev, media: newMedia }))}
    />
</div>
```

---

### Step 2: Update Product Detail Page

**File**: `app/[locale]/(main)/products/[id]/page.tsx`

**1. Add import at top:**
```typescript
import { ProductMediaGallery } from "@/components/features/product-media-gallery";
```

**2. Replace the image div (around line 248-262) with:**
```tsx
{/* OLD CODE - REMOVE THIS:
<div className="relative aspect-video md:aspect-square bg-muted rounded-xl overflow-hidden border border-border/50">
    <R2Image
        r2Key={product.image}
        alt={product.title}
        className="w-full h-full object-cover"
        fallback={...}
    />
</div>
*/}

{/* NEW CODE - ADD THIS: */}
<ProductMediaGallery
    media={product.media || []}
    coverImage={product.image}
/>
```

---

## That's It! 🎉

You're done! The feature is now fully integrated.

## Test It

### In Dashboard:
1. Go to `/dashboard/products`
2. Click "Add Product" or edit existing
3. Scroll down to find "معرض الوسائط (صور وفيديوهات)"
4. Click "إضافة ملفات" and upload images/videos
5. Reorder, delete, add captions as needed
6. Save the product

### On Product Page:
1. Go to any product detail page
2. You'll see the media gallery with thumbnails
3. Click thumbnails or arrows to navigate
4. Click "عرض كامل" for fullscreen
5. Videos will play with controls

## Need Help?

Check `MEDIA_GALLERY_FEATURE.md` for:
- Full feature documentation
- Database structure
- API details
- Troubleshooting
- Advanced usage

## Quick Reference

### Component Props

**MediaGalleryManager:**
```typescript
<MediaGalleryManager
    media={IProductMedia[]}      // Array of media items
    onChange={(media) => void}   // Callback when media changes
/>
```

**ProductMediaGallery:**
```typescript
<ProductMediaGallery
    media={IProductMedia[]}      // Array of media items
    coverImage={string}          // Fallback cover image (R2 key)
/>
```

### Media Item Structure:
```typescript
{
    id: string;              // "1234567890-abc123def"
    type: 'image' | 'video'; // Media type
    url: string;             // R2 key: "images/xxx.png" or "videos/xxx.mp4"
    thumbnail?: string;      // Optional video thumbnail
    order: number;           // Display order: 0, 1, 2...
    caption?: string;        // Optional caption: "Beautiful sunset"
}
```

## File Size Limits

- Images: 1GB max
- Videos: 2GB max
- Files >50MB use presigned URL upload automatically

## Supported Formats

**Images**: JPG, PNG, WebP, GIF
**Videos**: MP4, WebM, OGG, MOV, AVI, MKV

---

**Happy coding! 🎬📷**
