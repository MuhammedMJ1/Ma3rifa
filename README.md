# مُصحف المعرفة العالمي (Universal Knowledge Reader)

تطبيق ويب لقراءة ملفات PDF مترجمة إلى العربية مع ميزات تخصيص وفهرسة ذكية باستخدام الذكاء الاصطناعي.

## الميزات الرئيسية

*   رفع ملفات PDF ومعالجتها (محاكاة استخلاص النص حاليًا - **قيد التطوير: دمج قارئ PDF حقيقي**).
*   ترجمة النص إلى العربية باستخدام Gemini API.
*   عرض النص المترجم والأصلي.
*   تخصيص الخطوط (النوع والحجم).
*   وضع ليلي.
*   فهرسة ذكية للمحتوى العربي (Gemini API) وعرضها في شريط جانبي.
*   قراءة صوتية للنص العربي (Text-to-Speech) باستخدام Web Speech API.
*   مكتبة شخصية لحفظ الكتب ومتابعة القراءة (باستخدام localStorage).
*   واجهة مستخدم أنيقة وبسيطة.

## التقنيات المستخدمة

*   React مع TypeScript
*   Vite (نظام بناء وخادم تطوير)
*   Tailwind CSS (مدمج عبر PostCSS)
*   Gemini API (@google/genai)
*   Web Speech API

## التشغيل المحلي

1.  **استنساخ المستودع (Clone):**
    ```bash
    git clone https://github.com/<YourGitHubUsername>/<YourRepositoryName>.git
    cd <YourRepositoryName>
    ```
2.  **تثبيت الاعتماديات:**
    ```bash
    npm install
    # أو yarn install أو pnpm install
    ```
3.  **مفتاح Gemini API:**
    *   لعمل ميزات الترجمة والفهرسة الفعلية، ستحتاج إلى مفتاح Gemini API.
    *   قم بإنشاء ملف `.env` في جذر المشروع (يمكنك نسخ `.env.example` وتسميته `.env`).
    *   أضف مفتاحك إلى ملف `.env` كالتالي:
        ```
        VITE_GEMINI_API_KEY=YourActualApiKeyHere
        ```
    *   بدون مفتاح API صالح، سيعمل التطبيق باستخدام بيانات وهمية (mock data) للترجمة والفهرسة.
4.  **تشغيل خادم التطوير:**
    ```bash
    npm run dev
    # أو yarn dev أو pnpm dev
    ```
    سيقوم هذا الأمر بتشغيل التطبيق (عادةً على `http://localhost:3000`).

## بناء التطبيق للإنتاج

```bash
npm run build
# أو yarn build أو pnpm build
```
سيتم إنشاء الملفات النهائية في مجلد `dist`.

## هيكل المشروع

*   `index.html`: نقطة الدخول الرئيسية لـ HTML (في جذر المشروع).
*   `vite.config.ts`: ملف تهيئة Vite.
*   `tailwind.config.js`, `postcss.config.js`: ملفات تهيئة Tailwind CSS.
*   `tsconfig.json`: ملف تهيئة TypeScript.
*   `public/`: للملفات الثابتة (إذا وجدت).
*   `src/`: يحتوي على جميع أكواد TypeScript و React.
    *   `src/main.tsx`: نقطة الدخول الرئيسية لتطبيق React.
    *   `src/index.css`: ملف CSS الرئيسي (يتضمن Tailwind).
    *   `src/components/`: مكونات React.
    *   `src/contexts/`: سياق React.
    *   `src/hooks/`: خطافات React المخصصة.
    *   `src/services/`: خدمات (مثل التفاعل مع Gemini API).
    *   `src/types.ts`: تعريفات TypeScript.
    *   `src/constants.ts`: ثوابت التطبيق.
*   `.env.example`: مثال لملف متغيرات البيئة.
