
import React from 'react';
import { Bot, Languages, Rows, Volume2, PauseCircle, PlayCircle, SkipForward, ChevronDown, ListChecks } from 'lucide-react';
import { TtsState } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TTS_MIN_SPEED, TTS_MAX_SPEED, TTS_SPEED_STEP } from '../../constants';

interface AiToolsPanelProps {
  onTranslate: () => void;
  onSummarize: () => void;
  onToggleTextView: () => void;
  summary: string | null;
  keywords: string[];
  isOriginalVisible: boolean;
  hasTranslation: boolean;
  isLoading: boolean;
  tts: {
    play: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    setSpeed: (speed: number) => void;
    setSelectedVoice: (voiceName: string) => void;
    ttsState: TtsState;
    isSynthesisPaused: boolean;
    canPlay: boolean;
  };
}

const AiButton: React.FC<{ onClick: () => void; disabled?: boolean; children: React.ReactNode; title: string; isActive?: boolean}> =
  ({ onClick, disabled, children, title, isActive }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; title: string; isActive?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`w-full flex items-center justify-center gap-2 p-2 rounded text-sm transition-colors
                ${isActive ? 'bg-accent text-white' : 'bg-gray-200 hover:bg-gray-300 text-textPrimary'}
                disabled:opacity-50 disabled:cursor-not-allowed`}
  >
    {children}
  </button>
);

export const AiToolsPanel: React.FC<AiToolsPanelProps> = ({
  onTranslate,
  onSummarize,
  onToggleTextView,
  summary,
  keywords,
  isOriginalVisible,
  hasTranslation,
  isLoading,
  tts,
}: AiToolsPanelProps) => {
  return (
    <div className="w-full md:w-80 lg:w-96 bg-gray-50 p-3 sm:p-4 border-r border-gray-200 flex-shrink-0 overflow-y-auto space-y-4" 
        style={{ color: '#333' /* Ensure text color is readable on light gray bg */}}>
      <h3 className="text-lg font-semibold text-primary-dark flex items-center gap-2 mb-3">
        <Bot size={22} /> أدوات الذكاء الاصطناعي
      </h3>

      <div className="space-y-2">
        <AiButton onClick={onTranslate} disabled={isLoading} title={isOriginalVisible ? "ترجمة النص الحالي" : "عرض النص الأصلي"}>
          <Languages size={18} /> {isOriginalVisible ? (hasTranslation ? "عرض الترجمة" : "ترجمة") : "عرض الأصلي"}
        </AiButton>
        {hasTranslation && (
          <AiButton onClick={onToggleTextView} disabled={isLoading} title="تبديل العرض بين الأصلي والمترجم" isActive={!isOriginalVisible}>
            <Rows size={18} /> {isOriginalVisible ? 'عرض الترجمة' : 'عرض النص الأصلي'}
          </AiButton>
        )}
        <AiButton onClick={onSummarize} disabled={isLoading} title="تلخيص المستند واستخراج الكلمات المفتاحية">
          <ListChecks size={18} /> تلخيص واستخلاص
        </AiButton>
      </div>

      {isLoading && <LoadingSpinner text="جاري المعالجة بواسطة AI..." />}

      {summary && (
        <div className="mt-4 p-3 bg-indigo-50 rounded-md border border-indigo-200">
          <h4 className="font-semibold text-indigo-700 mb-1">ملخص المستند:</h4>
          <p className="text-xs text-indigo-600 whitespace-pre-wrap">{summary}</p>
        </div>
      )}

      {keywords.length > 0 && (
        <div className="mt-3 p-3 bg-teal-50 rounded-md border border-teal-200">
          <h4 className="font-semibold text-teal-700 mb-1">الكلمات المفتاحية:</h4>
          <div className="flex flex-wrap gap-1">
            {keywords.map((kw, i) => (
              <span key={i} className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded-full">{kw}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-300">
        <h4 className="font-semibold text-primary-dark mb-2 flex items-center gap-2">
          <Volume2 size={20} /> القراءة الصوتية
        </h4>
        {tts.ttsState.availableVoices.length > 0 && (
           <div className="mb-2">
             <label htmlFor="voiceSelect" className="text-xs text-gray-600 block mb-0.5">اختر الصوت:</label>
             <select 
                id="voiceSelect"
                value={tts.ttsState.selectedVoice?.name || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => tts.setSelectedVoice(e.target.value)}
                className="w-full p-1.5 text-xs border border-gray-300 rounded-md shadow-sm focus:ring-accent focus:border-accent"
                disabled={tts.ttsState.isPlaying}
              >
              {tts.ttsState.availableVoices.filter(v => v.lang.startsWith('ar')).map(voice => (
                <option key={voice.name} value={voice.name}>{voice.name} ({voice.lang})</option>
              ))}
            </select>
           </div>
        )}
        <div className="flex items-center justify-between gap-2 mb-2">
          {tts.ttsState.isPlaying && !tts.isSynthesisPaused ? (
            <AiButton onClick={tts.pause} title="إيقاف مؤقت"> <PauseCircle size={18} /> إيقاف مؤقت </AiButton>
          ) : (
            <AiButton onClick={tts.isSynthesisPaused ? tts.resume : tts.play} disabled={!tts.canPlay} title={tts.isSynthesisPaused ? "استئناف" : "تشغيل"}>
              <PlayCircle size={18} /> {tts.isSynthesisPaused ? "استئناف" : "تشغيل"}
            </AiButton>
          )}
          <AiButton onClick={tts.stop} disabled={!tts.ttsState.isPlaying && !tts.isSynthesisPaused} title="إيقاف القراءة">
             <SkipForward size={18} /> إيقاف
          </AiButton>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span>السرعة:</span>
          <input 
            type="range" 
            min={TTS_MIN_SPEED} 
            max={TTS_MAX_SPEED} 
            step={TTS_SPEED_STEP} 
            value={tts.ttsState.speed}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => tts.setSpeed(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-accent"
            disabled={tts.ttsState.isPlaying}
            title={`سرعة القراءة: ${tts.ttsState.speed}x`}
          />
          <span className="w-8 text-right">{tts.ttsState.speed.toFixed(1)}x</span>
        </div>
        {!tts.canPlay && <p className="text-xs text-red-500 mt-1">لا يوجد نص للقراءة. قد تحتاج للترجمة أو تحميل ملف أولاً.</p>}
      </div>
    </div>
  );
};