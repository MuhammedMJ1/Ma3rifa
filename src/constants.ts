export const APP_NAME = "مدينة العلم";
export const GEMINI_MODEL_TEXT = "gemini-2.5-flash-preview-04-17";

export const PLACEHOLDER_PDF_TEXT_GENERAL = `مرحباً بالعالم. هذا مثال لنص سيتم استخلاصه من ملف PDF.
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
شكراً لاستخدامكم ${APP_NAME}.
`;

export const PRELOADED_BOOK_QURAN_ID = "preloaded-quran";
export const PRELOADED_BOOK_NAHJ_ID = "preloaded-nahj";

export const PRELOADED_QURAN_TEXT = `بسم الله الرحمن الرحيم
الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
الرَّحْمَٰنِ الرَّحِيمِ
مَالِكِ يَوْمِ الدِّينِ
إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ
صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ

الفصل الأول: سورة الفاتحة
هذا هو النص الأساسي لسورة الفاتحة.
`;

export const PRELOADED_NAHJ_TEXT = `من خطبة له (عليه السلام) وهي من أفصح كلامه وفيها يعظ الناس ويهديهم من ضلالتهم:
أَمَّا بَعْدُ فَإِنَّ الدُّنْيَا قَدْ أَدْبَرَتْ وَ آذَنَتْ بِوَدَاعٍ وَ إِنَّ الْآخِرَةَ قَدْ أَقْبَلَتْ وَ أَشْرَفَتْ بِاطِّلَاعٍ أَلَا وَ إِنَّ الْيَوْمَ الْمِضْمَارَ وَ غَداً السِّبَاقَ وَ السَّبَقَةُ الْجَنَّةُ وَ الْغَايَةُ النَّارُ أَ فَلَا تَائِبٌ مِنْ خَطِيئَتِهِ قَبْلَ مَنِيَّتِهِ أَلَا عَامِلٌ لِنَفْسِهِ قَبْلَ يَوْمِ بُؤْسِهِ.

القسم الأول: الدنيا والآخرة
يشرح الإمام علي (ع) حال الدنيا والآخرة.
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

export const LOCALSTORAGE_BOOKS_KEY = "madinatAlIlm_userBooks"; // Explicitly for user books
export const LOCALSTORAGE_SETTINGS_KEY = "madinatAlIlm_settings";
export const LOCALSTORAGE_PROCESSED_PRELOADED_BOOKS_KEY = "madinatAlIlm_processedPreloadedBooks"; // New key
