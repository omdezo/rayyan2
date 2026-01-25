export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    image: string;
}

export const products: Product[] = [
    // AI Games - Omani
    {
        id: "ai-game-om-1",
        title: "لعبة الذكاء الاصطناعي - النسخة العمانية",
        description: "لعبة تفاعلية تعليمية تعزز مهارات التفكير النقدي باستخدام تقنيات الذكاء الاصطناعي، مصممة خصيصاً للبيئة العمانية.",
        price: 5.000,
        category: "ai-games",
        subcategory: "omani",
        image: "/images/ai-game-om.jpg",
    },
    // AI Games - Saudi
    {
        id: "ai-game-sa-1",
        title: "تحدي المستقبل - النسخة السعودية",
        description: "لعبة استراتيجية تحاكي رؤية 2030، تعتمد على الذكاء الاصطناعي في اتخاذ القرارات.",
        price: 6.500,
        category: "ai-games",
        subcategory: "saudi",
        image: "/images/ai-game-sa.jpg",
    },
    // Guidance - Qatari
    {
        id: "guidance-qa-1",
        title: "عرض تقديمي - التوجيه المهني (قطر)",
        description: "قالب عرض تقديمي متكامل لبرامج التوجيه المهني في المدارس القطرية.",
        price: 3.000,
        category: "guidance",
        subcategory: "qatari",
        image: "/images/guidance-qa.jpg",
    },
    // General Presentation
    {
        id: "general-1",
        title: "قالب الإبداع اللانهائي",
        description: "قالب عرض تقديمي متعدد الاستخدامات بتصاميم عصرية ورسوم بيانية متقدمة.",
        price: 4.000,
        category: "general",
        image: "/images/general-1.jpg",
    },
    // Stories
    {
        id: "story-1",
        title: "قصة رحلة إلى المريخ",
        description: "قصة تفاعلية مصورة للأطفال تعلمهم عن الفضاء والكواكب بأسلوب ممتع.",
        price: 2.500,
        category: "stories",
        image: "/images/story-1.jpg",
    },
];

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
