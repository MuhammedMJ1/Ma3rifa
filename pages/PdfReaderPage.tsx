
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { pdfService } from '../services/pdfService';
import { geminiService } from '../services/geminiService';
import { storageService } from '../services/storageService';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import type { DisplaySettings, PdfFileState, AiFeaturesState } from '../types';
import { PdfViewer } from '../components/pdfReader/PdfViewer';
import { PdfControls } from '../components/pdfReader/PdfControls';
import { AiToolsPanel } from '../components/pdfReader/AiToolsPanel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { UploadCloud, AlertTriangle } from 'lucide-react';
import { DEFAULT_FONT_SIZE, DEFAULT_FONT_FAMILY, DEFAULT_BACKGROUND_COLOR, DEFAULT_TEXT_COLOR, DARK_MODE_TEXT_COLOR } from '../constants';

export const PdfReaderPage: React.FC = () => {
  const [pdfFileState, setPdfFileState] = useState<PdfFileState>({
    file: null,
    pdfDoc: null,
    numPages: 0,
    extractedText: [],
    fullText: ""
  });
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(storageService.loadDisplaySettings());
  const [aiFeatures, setAiFeatures] = useState<AiFeaturesState>({
    translation: null,
    summary: null,
    keywords: [],
    isOriginalVisible: true,
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<{ page: number; count: number }[]>([]);

  const { ttsState, play, pause, resume, stop, setSpeed, setSelectedVoice, isSynthesisPaused } = useSpeechSynthesis();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    storageService.saveDisplaySettings(displaySettings);
    if (displaySettings.backgroundColor === '#121212' && displaySettings.textColor !== DARK_MODE_TEXT_COLOR) {
        setDisplaySettings(s => ({...s, textColor: DARK_MODE_TEXT_COLOR}));
    } else if (displaySettings.backgroundColor !== '#121212' && displaySettings.textColor === DARK_MODE_TEXT_COLOR) {
        setDisplaySettings(s => ({...s, textColor: DEFAULT_TEXT_COLOR}));
    }
  }, [displaySettings]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setIsLoading(true);
      setError(null);
      setPdfFileState({ file: null, pdfDoc: null, numPages: 0, extractedText: [], fullText: ""}); // Reset
      setAiFeatures({ translation: null, summary: null, keywords: [], isOriginalVisible: true });
      setCurrentPage(1);

      try {
        const pdfDoc = await pdfService.loadPdf(file);
        if (pdfDoc) {
          const { pageTexts, fullText } = await pdfService.extractAllText(pdfDoc);
          setPdfFileState({ file, pdfDoc, numPages: pdfDoc.numPages, extractedText: pageTexts, fullText });
          storageService.saveLastPdfName(file.name);
          const lastReadPage = storageService.loadLastReadPage(file.name);
          if (lastReadPage && lastReadPage <= pdfDoc.numPages) {
            setCurrentPage(lastReadPage);
          }
        } else {
          setError("فشل في تحميل ملف PDF. قد يكون الملف تالفًا أو غير مدعوم.");
        }
      } catch (err) {
        console.error("Error processing PDF: ", err);
        setError(`حدث خطأ أثناء معالجة الملف: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("الرجاء اختيار ملف PDF صالح.");
    }
  };

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (!term.trim() || !pdfFileState.extractedText.length) {
      setSearchResults([]);
      return;
    }
    const results: { page: number; count: number }[] = [];
    pdfFileState.extractedText.forEach((text, index) => {
      const count = (text.match(new RegExp(term, 'gi')) || []).length;
      if (count > 0) {
        results.push({ page: index + 1, count });
      }
    });
    setSearchResults(results);
  }, [pdfFileState.extractedText]);

  useEffect(() => {
    if (pdfFileState.file) {
      storageService.saveLastReadPage(pdfFileState.file.name, currentPage);
    }
  }, [currentPage, pdfFileState.file]);

  const handleTranslate = async () => {
    if (!pdfFileState.fullText && pdfFileState.extractedText.length === 0) {
        setError("لا يوجد نص لترجمته. الرجاء تحميل ملف PDF أولاً.");
        return;
    }
    const textToTranslate = aiFeatures.isOriginalVisible ? (pdfFileState.extractedText[currentPage -1] || pdfFileState.fullText) : (aiFeatures.translation || "");

    if (!textToTranslate.trim()) {
        setError("النص المحدد فارغ أو لم يتم تحميله بعد.");
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
        const targetText = aiFeatures.isOriginalVisible ? textToTranslate : pdfFileState.extractedText[currentPage -1] || pdfFileState.fullText;
        const translated = await geminiService.translateText(targetText);
        setAiFeatures(prev => ({ ...prev, translation: translated, isOriginalVisible: !prev.isOriginalVisible }));
    } catch (err) {
        console.error("Translation error: ", err);
        setError(`خطأ في الترجمة: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!pdfFileState.fullText) {
        setError("لا يوجد نص لتلخيصه. الرجاء تحميل ملف PDF أولاً.");
        return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const summary = await geminiService.summarizeText(pdfFileState.fullText);
      const keywords = await geminiService.extractKeywords(pdfFileState.fullText.substring(0, 5000)); // Limit keyword extraction length
      setAiFeatures(prev => ({ ...prev, summary, keywords }));
    } catch (err) {
        console.error("Summarization error: ", err);
        setError(`خطأ في التلخيص: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
        setIsLoading(false);
    }
  };

  const handleToggleTextView = () => {
    if (aiFeatures.translation) {
      setAiFeatures(prev => ({ ...prev, isOriginalVisible: !prev.isOriginalVisible }));
    } else if (!aiFeatures.isOriginalVisible) { // Switched to translated view but no translation available
      setAiFeatures(prev => ({ ...prev, isOriginalVisible: true })); // Switch back to original
      setError("الترجمة غير متوفرة. يرجى طلب الترجمة أولاً.");
    } else {
      setError("لا توجد ترجمة متاحة للتبديل إليها. يرجى طلب الترجمة أولاً.");
    }
  };

  const textToRead = aiFeatures.isOriginalVisible || !aiFeatures.translation 
    ? (pdfFileState.extractedText[currentPage -1] || "") 
    : (aiFeatures.translation || "");

  return (
    <div className="flex flex-col h-[calc(100vh-150px)]" style={{ backgroundColor: displaySettings.backgroundColor, color: displaySettings.textColor }}>
      <PdfControls
        displaySettings={displaySettings}
        setDisplaySettings={setDisplaySettings}
        currentPage={currentPage}
        numPages={pdfFileState.numPages}
        onPageChange={setCurrentPage}
        onFileSelectClick={() => fileInputRef.current?.click()}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        searchResults={searchResults}
        isLoading={isLoading}
      />
      <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center m-2">
          <AlertTriangle size={20} className="ml-2" />
          {error}
        </div>
      )}

      <div className="flex-grow flex overflow-hidden">
        {pdfFileState.pdfDoc ? (
          <>
            <PdfViewer
              pdfDoc={pdfFileState.pdfDoc}
              currentPage={currentPage}
              displaySettings={displaySettings}
              searchTerm={searchTerm}
              textToDisplay={aiFeatures.isOriginalVisible ? undefined : aiFeatures.translation || undefined}
            />
            <AiToolsPanel
              onTranslate={handleTranslate}
              onSummarize={handleSummarize}
              onToggleTextView={handleToggleTextView}
              summary={aiFeatures.summary}
              keywords={aiFeatures.keywords}
              isOriginalVisible={aiFeatures.isOriginalVisible}
              hasTranslation={!!aiFeatures.translation}
              isLoading={isLoading}
              tts={{
                play: () => play(textToRead),
                pause,
                resume,
                stop,
                setSpeed,
                setSelectedVoice,
                ttsState,
                isSynthesisPaused: isSynthesisPaused(),
                canPlay: !!textToRead.trim()
              }}
            />
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            {isLoading ? (
              <LoadingSpinner text="جاري تحميل ومعالجة الملف..." size={48} />
            ) : (
              <>
                <UploadCloud size={64} className="text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold mb-2 text-textSecondary" style={{color: displaySettings.textColor === DARK_MODE_TEXT_COLOR ? DARK_MODE_TEXT_COLOR : undefined }}>
                  لم يتم تحديد ملف PDF
                </h2>
                <p className="text-gray-500 mb-6" style={{color: displaySettings.textColor === DARK_MODE_TEXT_COLOR ? '#A0AEC0' : undefined }}>
                  الرجاء اختيار ملف PDF لبدء القراءة والاستفادة من أدوات الذكاء الاصطناعي.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition duration-150 ease-in-out flex items-center"
                >
                  <UploadCloud size={20} className="ml-2" />
                  اختر ملف PDF
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};