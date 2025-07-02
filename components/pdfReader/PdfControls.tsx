

import React, { useState, useEffect } from 'react';
import { DisplaySettings } from '../../types';
import { ChevronLeft, ChevronRight, Download, Search, Settings2, ZoomIn, ZoomOut, Palette, Type, UploadCloud, ListFilter } from 'lucide-react';
import { AVAILABLE_FONTS, AVAILABLE_BACKGROUND_COLORS, FONT_SIZE_STEP, MIN_FONT_SIZE, MAX_FONT_SIZE, DEBOUNCE_DELAY, DARK_MODE_TEXT_COLOR, DEFAULT_TEXT_COLOR } from '../../constants';
import { Modal } from '../common/Modal';

interface PdfControlsProps {
  displaySettings: DisplaySettings;
  setDisplaySettings: React.Dispatch<React.SetStateAction<DisplaySettings>>;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
  onFileSelectClick: () => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  searchResults: { page: number; count: number }[];
  isLoading: boolean;
}

const ControlButton: React.FC<{ onClick?: () => void; disabled?: boolean; children: React.ReactNode; title: string; className?: string }> =
  ({ onClick, disabled, children, title, className }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode; title: string; className?: string }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white ${className}`}
  >
    {children}
  </button>
);

export const PdfControls: React.FC<PdfControlsProps> = ({
  displaySettings,
  setDisplaySettings,
  currentPage,
  numPages,
  onPageChange,
  onFileSelectClick,
  onSearch,
  searchTerm: initialSearchTerm,
  searchResults,
  isLoading
}: PdfControlsProps) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSearchTerm);
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState(-1);

  useEffect(() => {
    setSearchInput(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== initialSearchTerm) { // Only call onSearch if searchInput actually changed from prop
        onSearch(searchInput);
      }
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [searchInput, onSearch, initialSearchTerm]);
  
  useEffect(() => {
    setCurrentSearchResultIndex(-1); // Reset when search results change
  }, [searchResults]);

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newPage = parseInt(e.target.value, 10);
    if (isNaN(newPage)) newPage = 1;
    if (newPage >= 1 && newPage <= numPages) {
      onPageChange(newPage);
    }
  };
  
  const navigateSearchResults = (direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    let newIndex = currentSearchResultIndex;
    if (direction === 'next') {
      newIndex = (newIndex + 1) % searchResults.length;
    } else {
      newIndex = (newIndex - 1 + searchResults.length) % searchResults.length;
    }
    setCurrentSearchResultIndex(newIndex);
    onPageChange(searchResults[newIndex].page);
  };

  const isPrevDisabled = currentPage <= 1 || isLoading || numPages === 0;
  const isNextDisabled = currentPage >= numPages || isLoading || numPages === 0;

  return (
    <>
      <div className="bg-primary-dark text-white p-2 sm:p-3 shadow-md flex flex-wrap items-center justify-between gap-2 sticky top-0 z-10">
        <div className="flex items-center gap-1 sm:gap-2">
          <ControlButton onClick={onFileSelectClick} title="رفع ملف جديد" disabled={isLoading}>
            <UploadCloud size={20} />
          </ControlButton>
          <ControlButton onClick={() => setIsSettingsModalOpen(true)} title="إعدادات العرض" disabled={isLoading}>
            <Settings2 size={20} />
          </ControlButton>
        </div>

        {numPages > 0 && (
          <div className="flex items-center gap-1 sm:gap-2">
            <ControlButton onClick={() => onPageChange(currentPage - 1)} disabled={isPrevDisabled} title="الصفحة السابقة">
              <ChevronRight size={20} /> {/* RTL: Right arrow for previous */}
            </ControlButton>
            <input
              type="number"
              value={currentPage}
              onChange={handlePageInputChange}
              min="1"
              max={numPages}
              className="w-12 sm:w-16 text-center bg-primary text-white rounded border border-primary-light focus:outline-none focus:ring-1 focus:ring-white hide-arrows"
              disabled={isLoading || numPages === 0}
              title="رقم الصفحة الحالي"
            />
            <span className="mx-1">/ {numPages}</span>
            <ControlButton onClick={() => onPageChange(currentPage + 1)} disabled={isNextDisabled} title="الصفحة التالية">
              <ChevronLeft size={20} /> {/* RTL: Left arrow for next */}
            </ControlButton>
          </div>
        )}
        
        {numPages > 0 && (
           <div className="flex items-center gap-1 sm:gap-2 relative">
            <Search size={18} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="بحث في المستند..."
              value={searchInput}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchInput(e.target.value)}
              className="py-1.5 pr-8 pl-2 w-32 sm:w-48 bg-primary text-white rounded border border-primary-light focus:outline-none focus:ring-1 focus:ring-white placeholder-gray-300"
              disabled={isLoading || numPages === 0}
            />
            {searchResults.length > 0 && (
                <div className="flex items-center gap-1">
                    <ControlButton onClick={() => navigateSearchResults('prev')} title="النتيجة السابقة" className="text-xs p-1">
                        <ChevronRight size={16} />
                    </ControlButton>
                    <span className="text-xs">{currentSearchResultIndex + 1}/{searchResults.length}</span>
                    <ControlButton onClick={() => navigateSearchResults('next')} title="النتيجة التالية" className="text-xs p-1">
                        <ChevronLeft size={16} />
                    </ControlButton>
                </div>
            )}
            {searchInput && searchResults.length === 0 && <span className="text-xs ml-1">لا نتائج</span>}
          </div>
        )}

      </div>

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="إعدادات العرض">
        <div className="space-y-6 text-textPrimary">
          <div>
            <label htmlFor="fontSize" className="block text-sm font-medium mb-1">حجم الخط:</label>
            <div className="flex items-center gap-2">
              <ControlButton onClick={() => setDisplaySettings((s: DisplaySettings) => ({ ...s, fontSize: Math.max(MIN_FONT_SIZE, s.fontSize - FONT_SIZE_STEP) }))} title="تصغير الخط" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                <ZoomOut size={18} />
              </ControlButton>
              <span className="text-lg w-16 text-center">{displaySettings.fontSize}%</span>
              <ControlButton onClick={() => setDisplaySettings((s: DisplaySettings) => ({ ...s, fontSize: Math.min(MAX_FONT_SIZE, s.fontSize + FONT_SIZE_STEP) }))} title="تكبير الخط" className="bg-gray-200 text-gray-700 hover:bg-gray-300">
                <ZoomIn size={18} />
              </ControlButton>
            </div>
          </div>
          <div>
            <label htmlFor="fontFamily" className="block text-sm font-medium mb-1 flex items-center"><Type size={16} className="ml-1" /> نوع الخط:</label>
            <select
              id="fontFamily"
              value={displaySettings.fontFamily}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDisplaySettings((s: DisplaySettings) => ({ ...s, fontFamily: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              {AVAILABLE_FONTS.map(font => (
                <option key={font.value} value={font.value} style={{fontFamily: font.value}}>{font.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="backgroundColor" className="block text-sm font-medium mb-1 flex items-center"><Palette size={16} className="ml-1" /> لون الخلفية:</label>
            <div className="grid grid-cols-3 gap-2">
              {AVAILABLE_BACKGROUND_COLORS.map(color => (
                <button
                  key={color.value}
                  title={color.name}
                  onClick={() => setDisplaySettings((s: DisplaySettings) => ({
                      ...s, 
                      backgroundColor: color.value,
                      textColor: color.value === '#121212' ? DARK_MODE_TEXT_COLOR : DEFAULT_TEXT_COLOR 
                  }))}
                  className={`p-2 rounded border-2 ${displaySettings.backgroundColor === color.value ? 'border-primary ring-2 ring-primary' : 'border-gray-300'} h-12`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
          </div>
          <button 
            onClick={() => setIsSettingsModalOpen(false)} 
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition-colors"
          >
            إغلاق
          </button>
        </div>
      </Modal>
      {/* Styles for .hide-arrows are now in index.html */}
    </>
  );
};