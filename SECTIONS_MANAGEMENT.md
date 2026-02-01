# Section Management System

## Overview
The Section Management system allows administrators to dynamically control website sections (categories like "عروض إرشادية", "ألعاب الذكاء الاصطناعي", etc.) through the admin dashboard without modifying code.

## Features
- ✅ Add new sections
- ✅ Edit existing sections (name, description, icon, order)
- ✅ Delete sections
- ✅ Show/Hide sections (toggle visibility)
- ✅ Reorder sections
- ✅ Bilingual support (Arabic & English)
- ✅ Custom icons (emojis or icon names)

## Setup Instructions

### 1. Run the Seeding Script (First Time Only)
To migrate existing hardcoded categories to the database:

```bash
npx tsx scripts/seed-sections.ts
```

This will create the following default sections:
- 🎮 ألعاب الذكاء الاصطناعي (AI Games)
- 📊 عروض إرشادية (Guidance)
- 🎨 تصاميم عامة (General Designs)
- 📚 القصص (Stories)

### 2. Access the Admin Dashboard
Navigate to: `/ar/dashboard/sections`

## Usage

### Adding a New Section
1. Go to the Sections page in the admin dashboard
2. Click "إضافة قسم جديد" (Add New Section)
3. Fill in the required fields:
   - **Key**: Unique identifier (e.g., `ai-games`) - English, lowercase, no spaces
   - **Arabic Name**: Display name in Arabic
   - **English Name**: Display name in English
   - **Description** (Optional): Description in both languages
   - **Icon** (Optional): Emoji or icon name
   - **Order**: Display order (lower number = appears first)
   - **Active**: Toggle to show/hide the section
4. Click "إضافة القسم" (Add Section)

### Editing a Section
1. Click the edit button (✏️) next to the section
2. Modify the fields as needed
3. Click "حفظ التعديلات" (Save Changes)

**Note**: The Key field cannot be changed after creation.

### Toggling Visibility
Click the eye icon button to show/hide a section:
- 👁️ **Visible**: Section appears on the website
- 👁️‍🗨️ **Hidden**: Section is hidden but not deleted

### Deleting a Section
1. Click the delete button (🗑️) next to the section
2. Confirm the deletion

**Warning**: Deleting a section will affect products using that category.

### Reordering Sections
Change the "Order" field when editing a section. Sections are displayed in ascending order (0, 1, 2, ...).

## Technical Details

### Database Model
```typescript
{
  key: string;          // Unique identifier
  nameAr: string;       // Arabic name
  nameEn: string;       // English name
  descriptionAr?: string;
  descriptionEn?: string;
  icon?: string;        // Emoji or icon name
  isActive: boolean;    // Visibility
  order: number;        // Display order
}
```

### API Endpoints
- `GET /api/sections` - Fetch all sections
- `GET /api/sections?activeOnly=true` - Fetch only active sections
- `POST /api/sections` - Create section (admin only)
- `GET /api/sections/[id]` - Fetch single section
- `PUT /api/sections/[id]` - Update section (admin only)
- `DELETE /api/sections/[id]` - Delete section (admin only)

### Frontend Integration
The home page automatically fetches and displays active sections from the database. Sections are shown in the order specified and use the appropriate language based on the current locale.

## Files Modified/Created

### New Files
- `lib/models/Section.ts` - Database model
- `app/api/sections/route.ts` - API endpoints for listing/creating sections
- `app/api/sections/[id]/route.ts` - API endpoints for individual sections
- `app/[locale]/dashboard/sections/page.tsx` - Admin UI for section management
- `scripts/seed-sections.ts` - Database seeding script

### Modified Files
- `lib/types/models.ts` - Added ISection interface
- `app/[locale]/dashboard/layout.tsx` - Added Sections to sidebar
- `app/[locale]/(main)/page.tsx` - Updated to use dynamic sections

## Best Practices

1. **Key Naming**: Use lowercase, English, hyphenated keys (e.g., `ai-games`, `my-section`)
2. **Order Numbers**: Leave gaps (0, 10, 20, 30) to allow easy reordering
3. **Icons**: Use emojis for consistency (🎮, 📚, 🎨, etc.)
4. **Descriptions**: Keep them concise and informative
5. **Testing**: Test visibility changes on the frontend before deleting sections

## Troubleshooting

### Sections not appearing on the home page
- Check if the section is marked as "Active" (isActive: true)
- Verify the section order is correct
- Clear cache and refresh the page

### Cannot create section with same key
- Section keys must be unique
- Try a different key name

### Products not showing in a category
- Ensure products have the correct category key
- Check that the section is active

## Future Enhancements
- Drag-and-drop reordering
- Bulk operations
- Section analytics
- Custom fields per section
- Section templates
