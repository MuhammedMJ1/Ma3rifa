/// <reference types="react" />
import React, { useState, useCallback } from 'react';
import { geminiService } from '../services/geminiService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Search, ExternalLink, AlertTriangle, FileText, CheckCircle, Languages } from 'lucide-react';
import type { GroundingChunk } from '../types';

interface ResearchResult {
  summary: string;
  sources: GroundingChunk[];
}

export const ResearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [translatedSummaries, setTranslatedSummaries] = useState<Record<number, string>>({});
  const [isTranslating, setIsTranslating] = useState<Record<number, boolean>>({});

  const handleSearch = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    if (!query.trim()) {
      setError("الرجاء إدخال موضوع البحث.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTranslatedSummaries({});
    try {
      const { text, sources } = await geminiService.searchResearchPapers(query);
      if (text.toLowerCase().includes("error") || text.toLowerCase().includes("خطأ")) {
         setError(text); // Display AI-returned error if it seems like one
      }
      setResult({ summary: text, sources });
    } catch (err) {
      console.error("Research search error:", err);
      setError(`حدث خطأ أثناء البحث: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsLoading(false); // Corrected: should be setIsLoading(false) in finally
    }
  };

  const handleTranslateSummary = useCallback(async (textToTranslate: string, index: number) => {
    if (!textToTranslate.trim()) return;
    setIsTranslating(prev => ({ ...prev, [index]: true }));
    try {
      const translation = await geminiService.translateText(textToTranslate);
      setTranslatedSummaries(prev => ({ ...prev, [index]: translation }));
    } catch (err) {
      console.error("Summary translation error:", err);
      // Optionally set an error message for this specific translation
    } finally {
      setIsTranslating(prev => ({ ...prev, [index]: false }));
    }
  }, []);


  return (
    <div className="space-y-6">
      <header className="text-center py-6 bg-gradient-to-r from-accent to-primary text-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-2">البحث العلمي العالمي</h1>
        <p className="text-md">استكشف الأبحاث من مصادر مفتوحة واحصل على ملخصات مترجمة بالذكاء الاصطناعي.</p>
      </header>

      <form onSubmit={handleSearch} className="flex items-center gap-2 p-4 bg-white shadow rounded-lg">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="أدخل موضوع البحث (مثال: تأثير الذكاء الاصطناعي على التعليم)"
          className="flex-grow p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
          aria-label="موضوع البحث"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-6 rounded-md transition-colors disabled:opacity-70 flex items-center gap-2"
        >
          {isLoading ? <LoadingSpinner size={20} className="text-white"/> : <Search size={20} />}
          <span>بحث</span>
        </button>
      </form>

      {error && (
        <div className="p-4 my-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md flex items-center gap-2">
          <AlertTriangle size={24} />
          <div>
            <p className="font-bold">حدث خطأ</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {isLoading && <LoadingSpinner text="جاري البحث عن الأوراق العلمية..." className="my-8" />}

      {result && (
        <div className="mt-6 bg-white p-4 sm:p-6 shadow rounded-lg">
          <h2 className="text-2xl font-semibold mb-3 text-primary-dark flex items-center gap-2"><FileText size={28}/> ملخص البحث:</h2>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed mb-4">{result.summary}</p>
          
          {!translatedSummaries[0] && !isTranslating[0] && result.summary && (
            <button
              onClick={() => handleTranslateSummary(result.summary, 0)}
              className="mb-4 text-sm bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded-md transition-colors flex items-center gap-1"
            >
              <Languages size={16} /> ترجمة هذا الملخص
            </button>
          )}
          {isTranslating[0] && <LoadingSpinner text="جاري ترجمة الملخص..." size={16} className="text-sm mb-2" />}
          {translatedSummaries[0] && (
            <div className="p-3 my-2 bg-green-50 border border-green-200 rounded-md">
                <h3 className="font-semibold text-green-700 mb-1 flex items-center gap-1"><CheckCircle size={16}/> الملخص المترجم:</h3>
                <p className="text-sm text-green-600 whitespace-pre-wrap">{translatedSummaries[0]}</p>
            </div>
          )}


          {result.sources && result.sources.length > 0 && (
            <>
              <h3 className="text-xl font-semibold mt-6 mb-3 text-primary-dark">المصادر المرجعية:</h3>
              <ul className="space-y-3 list-inside">
                {result.sources.map((sourceItem, index) => {
                  const chunk = sourceItem.web || sourceItem.retrievedContext;
                  if (!chunk || !chunk.uri) return null;
                  
                  return (
                    <li key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-shadow">
                      <a
                        href={chunk.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 font-medium flex items-center"
                      >
                        {chunk.title || chunk.uri}
                        <ExternalLink size={14} className="mr-2" />
                      </a>
                      {/* Add translation button for source summary if available in future */}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {result.sources && result.sources.length === 0 && (
            <p className="text-gray-500">لم يتم العثور على مصادر محددة لهذه المعلومات.</p>
          )}
        </div>
      )}
    </div>
  );
};