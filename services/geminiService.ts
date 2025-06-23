/// <reference types="vite/client" />

import { GoogleGenAI, GenerateContentResponse, Chat, GroundingChunk } from '@google/genai';
import { GEMINI_TEXT_MODEL } from '../constants';

let apiKey: string | undefined = undefined;

try {
  // Vite specific environment variable for client-side exposure
  if (import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
  }
} catch (e) {
  // console.warn("import.meta.env.VITE_GEMINI_API_KEY is not accessible. This is expected if the variable is not set.");
}

// Fallback for browser environments where API_KEY might be set on the window object
if (!apiKey && typeof window !== 'undefined') {
  apiKey = (window as any).GEMINI_API_KEY;
}

const API_KEY = apiKey; 

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please ensure VITE_GEMINI_API_KEY is configured in your environment (e.g., .env file or Netlify build settings) or window.GEMINI_API_KEY is set. AI features will be unavailable.");
}

let ai: GoogleGenAI;
if (API_KEY) {
    try {
        ai = new GoogleGenAI({ apiKey: API_KEY });
    } catch (error) {
        console.error("Failed to initialize GoogleGenAI. The API_KEY might be invalid or missing. AI features will be unavailable.", error);
    }
}

const defaultErrorMsg = "خدمة الذكاء الاصطناعي غير متاحة حالياً. يرجى التأكد من إعداد مفتاح API بشكل صحيح وأن الخدمة مهيأة.";
const noResponseTextMsg = "لم يتم استلام نص من خدمة الذكاء الاصطناعي.";

export const geminiService = {
  summarizeText: async (text: string): Promise<string> => {
    if (!API_KEY || !ai) return defaultErrorMsg;
    try {
      const prompt = `قم بتلخيص النص التالي بشكل موجز ودقيق باللغة العربية. ركز على الأفكار الرئيسية:\n\n${text}`;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
      });
      return response.text ?? noResponseTextMsg;
    } catch (error) {
      console.error('Error summarizing text with Gemini:', error);
      return `حدث خطأ أثناء التلخيص: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  extractKeywords: async (text: string): Promise<string[]> => {
    if (!API_KEY || !ai) return ["خدمة استخراج الكلمات المفتاحية غير متاحة حالياً."];
    try {
      const prompt = `استخرج الكلمات المفتاحية الرئيسية من النص التالي. قدمها كقائمة مفصولة بفواصل باللغة العربية:\n\n${text}`;
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
      });
      const keywordsText = response.text ?? "";
      return keywordsText.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
    } catch (error) {
      console.error('Error extracting keywords with Gemini:', error);
      return [`حدث خطأ أثناء استخراج الكلمات المفتاحية: ${error instanceof Error ? error.message : String(error)}`];
    }
  },
  
  translateText: async (text: string, targetLanguage: string = 'ar'): Promise<string> => {
    if (!API_KEY || !ai) return defaultErrorMsg;
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
      return response.text ?? noResponseTextMsg;
    } catch (error)
    {
      console.error('Error translating text with Gemini:', error);
      return `حدث خطأ أثناء الترجمة: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  searchResearchPapers: async (query: string): Promise<{ text: string, sources: GroundingChunk[] }> => {
    if (!API_KEY || !ai) return { text: defaultErrorMsg, sources: [] };
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
      
      return { text: response.text ?? noResponseTextMsg, sources };
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
    if (!API_KEY || !ai) return defaultErrorMsg;
    if (!chat) return "كائن الدردشة غير صالح أو لم يتم تهيئته.";

    try {
      const response: GenerateContentResponse = await chat.sendMessage({ message });
      return response.text ?? noResponseTextMsg;
    } catch (error) {
      console.error('Error sending message in chat:', error);
      return `حدث خطأ في الدردشة: ${error instanceof Error ? error.message : String(error)}`;
    }
  },

  generateContentWithJsonOutput: async (prompt: string): Promise<any> => {
    if (!API_KEY || !ai) return { error: defaultErrorMsg };
    try {
      const response = await ai.models.generateContent({
        model: GEMINI_TEXT_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      let jsonStr = (response.text ?? "").trim();
      if (!jsonStr) {
        return { error: "Empty JSON response from AI.", rawText: response.text };
      }
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