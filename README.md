# مُصحف المعرفة العالمي (Universal Knowledge Reader)

تطبيق ويب لقراءة ملفات PDF مترجمة إلى العربية مع ميزات تخصيص وفهرسة ذكية باستخدام الذكاء الاصطناعي.

## الميزات الرئيسية

*   رفع ملفات PDF ومعالجتها (محاكاة استخلاص النص حاليًا).
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
*   Tailwind CSS
*   Gemini API (@google/genai)
*   Web Speech API
*   Import Maps (لا حاجة لخطوة بناء معقدة للتشغيل الأساسي)

## التشغيل المحلي

1.  **استنساخ المستودع (Clone):**
    ```bash
    git clone https://github.com/<YourGitHubUsername>/<YourRepositoryName>.git
    cd <YourRepositoryName>
    ```
2.  **مفتاح Gemini API (اختياري للتشغيل الأساسي):**
    *   لعمل ميزات الترجمة والفهرسة الفعلية، ستحتاج إلى مفتاح Gemini API.
    *   يعتمد التطبيق حاليًا على `process.env.API_KEY`. في بيئة التشغيل البسيطة هذه بدون نظام بناء، لن يكون هذا المتغير متاحًا.
    *   **للاختبار المحلي فقط:** يمكنك تعديل ملف `src/services/geminiService.ts` واستبدال `process.env.API_KEY` بمفتاحك مباشرة. **(لا يُنصح بهذا للإنتاج)**.
    *   بدون مفتاح API صالح، سيعمل التطبيق باستخدام بيانات وهمية (mock data).
3.  **تشغيل خادم ويب محلي:**
    بما أن التطبيق يستخدم وحدات JavaScript (`type="module"` و import maps)، يجب تقديمه عبر خادم ويب.
    *   إذا كان لديك Python 3:
        ```bash
        python -m http.server
        ```
    *   إذا كان لديك Node.js، يمكنك استخدام `serve`:
        ```bash
        npx serve .
        ```
4.  **فتح التطبيق في المتصفح:**
    افتح المتصفح وانتقل إلى العنوان الذي يعرضه الخادم المحلي (عادةً `http://localhost:8000` أو `http://localhost:3000`).

## هيكل المشروع

*   `index.html`: نقطة الدخول الرئيسية لـ HTML.
*   `metadata.json`: بيانات وصفية للتطبيق.
*   `package.json`: معلومات المشروع والاعتماديات (الاعتماديات تُحمّل عبر import maps).
*   `src/`: يحتوي على جميع أكواد TypeScript و React.
    *   `src/index.tsx`: نقطة الدخول الرئيسية لتطبيق React.
    *   `src/components/`: مكونات React.
    *   `src/contexts/`: سياق React.
    *   `src/hooks/`: خطافات React المخصصة.
    *   `src/services/`: خدمات (مثل التفاعل مع Gemini API).
    *   `src/types.ts`: تعريفات TypeScript.
    *   `src/constants.ts`: ثوابت التطبيق.
