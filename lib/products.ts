export interface Product {
    id: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    // For backward compatibility
    title?: string;
    description?: string;
    price: number;
    category: string;
    subcategory?: string;
    image: string;
}

// Mock products array - deprecated, now using database
export const products: Product[] = [];

export const categories = [
    {
        id: "ai-games",
        title: "ألعاب الذكاء الاصطناعي",
        subcategories: [
            { id: "omani", title: "عماني" },
            { id: "saudi", title: "سعودي" },
            { id: "emirati", title: "إماراتي" },
            { id: "qatari", title: "قطري" },
            { id: "bahraini", title: "بحريني" },
            { id: "kuwaiti", title: "كويتي" },
        ],
    },
    {
        id: "guidance",
        title: "عروض إرشادية",
        subcategories: [
            { id: "omani", title: "عماني" },
            { id: "saudi", title: "سعودي" },
            { id: "emirati", title: "إماراتي" },
            { id: "qatari", title: "قطري" },
            { id: "bahraini", title: "بحريني" },
            { id: "kuwaiti", title: "كويتي" },
        ],
    },
    {
        id: "general",
        title: "تصاميم عامة",
    },
    {
        id: "stories",
        title: "القصص",
    },
];
