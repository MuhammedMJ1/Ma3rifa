
import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk } from '@google/genai';
import { GEMINI_TEXT_MODEL } from '../constants';

// Safely attempt to get API_KEY from process.env (Node.js/build environments)
// or fallback to a global window variable (for direct browser/Netlify scenarios where user might inject it)
let apiKey: string | undefined = undefined;

try {
  // Standard for Node.js environments or build tools that define process.env
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    apiKey = process.env.API_KEY;
  }
} catch (e) {
  // console.warn("process.env.API_KEY is not accessible. This is expected in some browser environments if not using a bundler that polyfills process.");
}

// Fallback for browser environments where API_KEY might be set on the window object
// This is less secure if the key is hardcoded directly into HTML,
// but can be a way for build tools or Netlify snippets to inject the key.
if (!apiKey && typeof window !== 'undefined') {
  // User might configure their build (e.g., Vite with define) or manually set this for simpler deployments.
  // Example: Netlify build variable VITE_GEMINI_API_KEY -> import.meta.env.VITE_GEMINI_API_KEY -> window.GEMINI_API_KEY via script
  apiKey = (window as any).GEMINI_API_KEY;
}

const API_KEY = apiKey; // Final API_KEY to be used for initialization and checks.

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please ensure it's configured in your environment. For Netlify, set it in site settings and ensure your build process makes it available (e.g., as process.env.API_KEY or window.GEMINI_API_KEY). AI features will be unavailable.");
}

let ai: GoogleGenAI;
if (API_KEY) {
    try {
        // The SDK constructor requires `apiKey` to be a non-empty string.
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI. The API_KEY might be invalid or missing. AI features will be unavailable.", error);
        // 'ai' will remain undefined, and service methods will fail gracefully.
    }
} else {
    // console.warn("GoogleGenAI client not initialized because API_KEY is missing. AI features will be unavailable.");
    // 'ai' remains undefined.
}


export const geminiService = {
  summarizeText: async (text: string): Promise<string> => {
    if (!API_KEY || !ai) return "خدمة التلخيص غير متاحة حالياً. يرجى التأكد من إعداد مفتاح API بشكل صحيح وأن خدمة الذكاء الاصطناعي مهيأة.";
    try {
      const prompt = `قم بتلخيص النص التالي بشكل موجز ودقيق باللغة العربية. ركز على الأفكار الرئيسية:\n\n${text}`;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error('Error summarizing text with Gemini:', error);
      return `حدث خطأ أثناء التلخيص: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  extractKeywords: async (text: string): Promise<string[]> => {
    if (!API_KEY || !ai) return ["خدمة استخراج الكلمات المفتاحية غير متاحة حالياً. تأكد من إعداد مفتاح API."];
    try {
      const prompt = `استخرج الكلمات المفتاحية الرئيسية من النص التالي. قدمها كقائمة مفصولة بفواصل باللغة العربية:\n\n${text}`;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
      });
      const keywordsText = response.text;
      return keywordsText.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
    } catch (error) {
      console.error('Error extracting keywords with Gemini:', error);
      return [`حدث خطأ أثناء استخراج الكلمات المفتاحية: ${error instanceof Error ? error.message : String(error)}`];
    }
  },
  
  translateText: async (text: string, targetLanguage: string = 'ar'): Promise<string> => {
    if (!API_KEY || !ai) return "خدمة الترجمة غير متاحة حالياً. تأكد من إعداد مفتاح API.";
    if (!text.trim()) return ""; 
    try {
      const prompt = `ترجم النص التالي إلى اللغة العربية الفصحى مع التشكيل (الحركات) قدر الإمكان. إذا كان النص بالفعل باللغة العربية، قم بتحسين صياغته وتشكيله إذا لزم الأمر:\n\n"${text}"`;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
         config: {
            temperature: 0.2 
        }
      });
      return response.text;
    } catch (error)
    {
      console.error('Error translating text with Gemini:', error);
      return `حدث خطأ أثناء الترجمة: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  searchResearchPapers: async (query: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
    if (!API_KEY || !ai) return { text: "خدمة البحث العلمي غير متاحة حالياً. تأكد من إعداد مفتاح API.", sources: [] };
    try {
      const prompt = `ابحث عن أوراق بحثية علمية من مصادر مفتوحة حول الموضوع التالي: "${query}". قدم ملخصًا موجزًا للم یافته‌های الرئيسية باللغة العربية.`;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL, 
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      
      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources: GroundingChunk[] = groundingMetadata?.groundingChunks || [];
      
      return { text: response.text, sources };
    } catch (error) {
      console.error('Error searching research papers with Gemini:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes(" शख") || errorMessage.includes("model does not support")) { 
         return { text: `حدث خطأ في البحث: النموذج الحالي قد لا يدعم البحث المتقدم بشكل كامل أو أن الأداة غير مدعومة. (${errorMessage})`, sources: [] };
      }
      return { text: `حدث خطأ أثناء البحث عن الأوراق العلمية: ${errorMessage}`, sources: [] };
    }
  },

  createChat: (): Chat | null => {
    if (!API_KEY || !ai) {
      console.error("Chat functionality unavailable. API Key not configured or AI client not initialized.");
      return null;
    }
    try {
        return ai.chats.create({
            model: GEMINI_TEXT_MODEL,
            config: {
            systemInstruction: 'أنت مساعد ذكي في البحث. ساعد المستخدم في العثور على معلومات داخل المستندات أو بشكل عام. كن دقيقًا وموجزًا في إجاباتك باللغة العربية.',
            },
        });
    } catch(error) {
        console.error('Error creating chat with Gemini:', error);
        return null;
    }
  },

  sendMessageInChat: async (chat: Chat, message: string): Promise<string> => {
    if (!API_KEY || !ai) return "خدمة الدردشة غير متاحة حالياً. تأكد من إعداد مفتاح API.";
    if (!chat) return "كائن الدردشة غير صالح أو لم يتم تهيئته.";

    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message });
      return response.text;
    } catch (error) {
      console.error('Error sending message in chat:', error);
      return `حدث خطأ في الدردشة: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  generateContentWithJsonOutput: async (prompt: string): Promise<any> => {
    if (!API_KEY || !ai) return { error: "خدمة JSON غير متاحة حالياً. تأكد من إعداد مفتاح API." };
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let jsonStr = response.text.trim();
      const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[2]) {
        jsonStr = match[2].trim();
      }
      try {
        return JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse JSON response:", e, "Raw text:", response.text);
        return { error: "Failed to parse JSON response from AI.", rawText: response.text };
      }
    } catch (error) {
      console.error('Error generating JSON content with Gemini:', error);
      return { error: `AI service error: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
};
