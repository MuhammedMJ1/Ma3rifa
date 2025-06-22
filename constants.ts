
export const APP_NAME = "مُصحف المعرفة العالمي";
export const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";
// Placeholder text for PDF content extraction simulation
export const PLACEHOLDER_PDF_TEXT = `مرحباً بالعالم. هذا مثال لنص سيتم استخلاصه من ملف PDF.
يحتوي هذا النص على عدة فقرات وجمل لتجربة الترجمة والفهرسة.
الذكاء الاصطناعي أداة قوية. وهو يتطور باستمرار.

القسم الأول: مقدمة في التكنولوجيا
في هذا القسم، سنتناول أساسيات التكنولوجيا الحديثة وتأثيرها على حياتنا اليومية.
تعتبر الحوسبة السحابية واحدة من أهم التطورات في هذا المجال.

القسم الثاني: تفاصيل متقدمة
هنا، سنغوص أعمق في بعض المفاهيم التقنية المعقدة.
تشمل هذه المفاهيم تعلم الآلة والشبكات العصبونية.
نأمل أن يكون هذا التطبيق مفيداً وممتعاً لجميع المستخدمين.

القسم الثالث: الخاتمة
في الختام، نؤكد على أهمية الاستمرار في التعلم ومواكبة التطورات.
شكراً لاستخدامكم مُصحف المعرفة العالمي.
`;

export const ARABIC_FONTS = [
  { name: "Cairo", value: "font-cairo" },
  { name: "Noto Naskh Arabic", value: "font-noto-naskh" },
  { name: "Amiri", value: "font-amiri" },
];

export const DEFAULT_FONT_FAMILY = "font-cairo";
export const DEFAULT_FONT_SIZE = 18; // in pixels
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 36;
export const FONT_SIZE_STEP = 2;

export const LOCALSTORAGE_BOOKS_KEY = "universalKnowledgeReader_books";
export const LOCALSTORAGE_SETTINGS_KEY = "universalKnowledgeReader_settings";
