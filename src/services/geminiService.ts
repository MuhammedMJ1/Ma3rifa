
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChapterIndexItem } from "../types";
import { GEMINI_MODEL_TEXT } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn(
    "API_KEY environment variable is not set. Gemini API calls will be mocked."
  );
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const translateText = async (text: string, targetLanguage: string = "Arabic"): Promise<string> => {
  if (!ai) {
    // Mock response if API key is not available
    return new Promise(resolve => setTimeout(() => resolve(`(مترجم) ${text}`), 1000));
  }
  try {
    const prompt = `Translate the following text to ${targetLanguage}. Ensure the translation is natural and accurate. Preserve formatting like line breaks if meaningful:\n\n${text}`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error translating text with Gemini API:", error);
    throw new Error("Failed to translate text. Please check your API key and network connection.");
  }
};

export const generateIndexFromText = async (arabicText: string): Promise<ChapterIndexItem[]> => {
  if (!ai) {
    // Mock response
    return new Promise(resolve => setTimeout(() => resolve([
      { id: 'mock-intro', title: "مقدمة (تجريبية)" },
      { id: 'mock-chap1', title: "الفصل الأول (تجريبي)" },
      { id: 'mock-chap2', title: "الفصل الثاني (تجريبي)" },
    ]), 1000));
  }
  try {
    const prompt = `
أنت مساعد متخصص في تحليل النصوص العربية. قم بتحليل النص التالي واستخرج منه الفصول أو الأقسام الرئيسية مع عناوينها.
أرجع النتيجة بصيغة JSON على شكل مصفوفة من الكائنات. كل كائن يجب أن يمثل فصلاً أو قسماً رئيسياً ويحتوي على مفتاح واحد فقط هو 'title' وقيمته هي عنوان الفصل أو القسم.
يجب أن تكون العناوين مختصرة ومعبرة كما تظهر في النص.

مثال JSON المطلوب:
[
  { "title": "مقدمة الكتاب" },
  { "title": "الفصل الأول: تاريخ الموضوع" },
  { "title": "الفصل الثاني: التحليل العميق" }
]

النص المراد تحليله:
---
${arabicText}
---
`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
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
    
    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.every(item => typeof item.title === 'string')) {
       return parsedData.map((item, index) => ({
        id: `chapter-${index}-${encodeURIComponent(item.title.slice(0,20))}`, // Create a somewhat unique ID
        title: item.title,
      }));
    } else {
      console.warn("Gemini index response was not in the expected format. Received:", parsedData);
      // Fallback: try to split by common section markers if JSON fails. This is very basic.
      const lines = arabicText.split('\n');
      const potentialTitles = lines.filter(line => line.length > 5 && line.length < 100 && (line.startsWith("الفصل") || line.startsWith("القسم") || line.startsWith("مقدمة")));
      if (potentialTitles.length > 0) {
        return potentialTitles.map((title, index) => ({ id: `fallback-chapter-${index}`, title }));
      }
      return []; // Return empty if parsing fails and no fallback
    }

  } catch (error) {
    console.error("Error generating index with Gemini API:", error);
    // If API call fails, attempt a very basic local heuristic as a fallback.
    const lines = arabicText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const chapters: ChapterIndexItem[] = [];
    lines.forEach((line, index) => {
        if ((line.startsWith("الفصل") || line.startsWith("القسم") || line.startsWith("مقدمة")) && line.length < 100) {
            chapters.push({ id: `heuristic-chapter-${chapters.length}`, title: line });
        }
    });
    if (chapters.length > 0) return chapters;
    
    throw new Error("Failed to generate index. Please check your API key and network connection.");
  }
};