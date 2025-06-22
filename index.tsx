
import React, { useState, useEffect, useRef, useCallback, ChangeEvent, KeyboardEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider, useAppContext } from './contexts/AppContext';
import {
  UploadIcon, BookOpenIcon, SunIcon, MoonIcon, PlayIcon, PauseIcon, StopIcon,
  PlusIcon, MinusIcon, TrashIcon, ChevronDownIcon, HamburgerIcon, CloseIcon,
  TranslateIcon, EyeIcon, OriginalTextIcon, SidebarOpenIcon, SidebarCloseIcon, HomeIcon,
  SpinnerIcon, WarningIcon
} from './components/icons';
import { Book, ChapterIndexItem, Theme, DisplayMode, VoiceOption } from './types';
import { ARABIC_FONTS, MIN_FONT_SIZE, MAX_FONT_SIZE, FONT_SIZE_STEP, APP_NAME } from './constants';
import useSpeechSynthesis from './hooks/useSpeechSynthesis';

// Helper: Debounce function
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return function(this: ThisParameterType<T>, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// === Sub-Components ===

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', size = 'md', leftIcon, rightIcon, className, children, ...props }) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-background-dark transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variantStyles = {
    primary: "bg-primary text-white hover:bg-primary-light dark:bg-primary-dark dark:hover:bg-primary focus:ring-primary",
    secondary: "bg-secondary text-primary-dark hover:bg-secondary-light dark:hover:bg-secondary-dark focus:ring-secondary",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 text-primary dark:text-primary-light focus:ring-primary",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  return (
    <button
      className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
};


const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "جاري التحميل..." }) => (
  <div className="flex flex-col items-center justify-center p-4" role="status" aria-live="polite">
    <SpinnerIcon className="w-12 h-12 text-primary dark:text-primary-light" />
    <p className="mt-2 text-lg text-text-light dark:text-text-dark">{message}</p>
  </div>
);

const ErrorDisplay: React.FC<{ message: string; onDismiss?: () => void }> = ({ message, onDismiss }) => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md my-4" role="alert">
    <div className="flex">
      <div className="py-1"><WarningIcon className="h-6 w-6 text-red-500 mr-3" /></div>
      <div>
        <p className="font-bold">حدث خطأ</p>
        <p className="text-sm">{message}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-auto -mx-1.5 -my-1.5 bg-red-100 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex h-8 w-8" aria-label="Dismiss error">
          <CloseIcon />
        </button>
      )}
    </div>
  </div>
);

interface DropdownProps<T> {
  options: { label: string; value: T }[];
  selectedValue: T;
  onSelect: (value: T) => void;
  label?: string;
  className?: string;
}

const Dropdown = <T extends string | number>({ options, selectedValue, onSelect, label, className }: DropdownProps<T>) => {
  return (
    <div className={`relative inline-block text-left ${className}`}>
      {label && <label className="block text-sm font-medium text-text-light dark:text-text-dark mb-1">{label}</label>}
      <select
        value={selectedValue}
        onChange={(e) => onSelect(e.target.value as T)}
        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-surface-light dark:bg-surface-dark dark:border-gray-600 text-text-light dark:text-text-dark"
      >
        {options.map((option) => (
          <option key={option.value.toString()} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// === Main Application Components ===

const AppHeader: React.FC = () => {
  const { theme, toggleTheme, currentBook, setCurrentBookById } = useAppContext();

  return (
    <header className="bg-surface-light dark:bg-surface-dark shadow-md p-3 sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center">
        {currentBook && (
          <Button variant="ghost" size="sm" onClick={() => setCurrentBookById(null)} className="mr-2" aria-label="العودة إلى المكتبة">
            <HomeIcon className="w-5 h-5" />
          </Button>
        )}
        <h1 className="text-xl md:text-2xl font-bold text-primary dark:text-primary-light">
          {currentBook ? currentBook.name : APP_NAME}
        </h1>
      </div>
      <Button onClick={toggleTheme} variant="ghost" size="sm" aria-label={theme === Theme.Light ? "تفعيل الوضع الليلي" : "تفعيل الوضع النهاري"}>
        {theme === Theme.Light ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
      </Button>
    </header>
  );
};

const FileUploadArea: React.FC = () => {
  const { processNewFile, setCurrentBookById, isLoading } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newBook = await processNewFile(file);
      if (newBook) {
        setCurrentBookById(newBook.id);
      }
      // Reset file input to allow uploading the same file again
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-primary', 'dark:border-primary-light');
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      const newBook = await processNewFile(file);
      if (newBook) {
        setCurrentBookById(newBook.id);
      }
    } else {
      // Handle invalid file type
      alert("الرجاء رفع ملف PDF فقط.");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.add('border-primary', 'dark:border-primary-light');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.classList.remove('border-primary', 'dark:border-primary-light');
  };


  return (
    <div 
      className="my-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center bg-surface-light dark:bg-surface-dark transition-colors"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      <UploadIcon className="w-16 h-16 text-primary dark:text-primary-light mx-auto mb-4" />
      <p className="mb-4 text-lg text-text-light dark:text-text-dark">
        اسحب ملف PDF هنا أو انقر لرفعه
      </p>
      <input
        type="file"
        accept=".pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
        disabled={isLoading}
        aria-label="File upload input"
      />
      <Button onClick={handleButtonClick} disabled={isLoading} variant="primary" size="lg">
        {isLoading ? <SpinnerIcon className="w-5 h-5 mr-2"/> :  <UploadIcon className="w-5 h-5 mr-2" />}
        {isLoading ? "جاري المعالجة..." : "اختيار ملف PDF"}
      </Button>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">سيتم استخلاص النص وترجمته وفهرسته تلقائياً.</p>
    </div>
  );
};

const BookItem: React.FC<{ book: Book; onOpen: (id: string) => void; onDelete: (id: string) => void }> = ({ book, onOpen, onDelete }) => {
  const openBook = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering delete if open is on the same element or parent
    onOpen(book.id);
  };

  const deleteBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد أنك تريد حذف كتاب "${book.name}"؟`)) {
      onDelete(book.id);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      action();
    }
  };

  return (
    <div 
      className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex justify-between items-center"
      onClick={openBook}
      onKeyDown={(e) => handleKeyDown(e, () => openBook(e as any))}
      tabIndex={0}
      role="button"
      aria-label={`فتح كتاب ${book.name}`}
    >
      <div>
        <h3 className="text-lg font-semibold text-primary dark:text-primary-light">{book.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          أضيف بتاريخ: {new Date(book.dateAdded).toLocaleDateString('ar-EG')}
        </p>
      </div>
      <div className="flex items-center space-x-2 space-x-reverse">
         <Button onClick={openBook} variant="ghost" size="sm" title={`فتح كتاب ${book.name}`} leftIcon={<BookOpenIcon />} >
           فتح
         </Button>
        <Button onClick={deleteBook} variant="danger" size="sm" title={`حذف كتاب ${book.name}`} leftIcon={<TrashIcon />} >
            حذف
        </Button>
      </div>
    </div>
  );
};

const LibraryView: React.FC = () => {
  const { books, setCurrentBookById, deleteBook, isLoading: globalLoading, error: globalError } = useAppContext();
  
  if (globalLoading && books.length === 0) { // Show full page loader only if processing first book
      return <div className="flex-grow flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <FileUploadArea />
      {globalError && <ErrorDisplay message={globalError} />}
      {books.length > 0 ? (
        <>
          <h2 className="text-2xl font-semibold my-6 text-text-light dark:text-text-dark">مكتبتي</h2>
          <div className="space-y-4">
            {books.sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()).map(book => (
              <BookItem key={book.id} book={book} onOpen={setCurrentBookById} onDelete={deleteBook} />
            ))}
          </div>
        </>
      ) : (
        !globalLoading && <p className="text-center text-gray-500 dark:text-gray-400 mt-8 text-lg">مكتبتك فارغة. قم برفع أول كتاب لك!</p>
      )}
    </div>
  );
};

const ContentRenderer = React.memo(({ text, chapters, fontFamily, fontSize }: { text: string; chapters: ChapterIndexItem[]; fontFamily: string; fontSize: number }) => {
  const lines = text.split('\n');
  
  // Create a map for quick chapter lookup by title for efficiency
  const chapterTitleMap = new Map(chapters.map(c => [c.title.trim(), c.id]));

  return (
    <div className={`${fontFamily} text-text-light dark:text-text-dark`} style={{ fontSize: `${fontSize}px`, lineHeight: 1.8 }}>
      {lines.map((line, index) => {
        const trimmedLine = line.trim();
        const chapterId = chapterTitleMap.get(trimmedLine);
        
        if (chapterId) {
          return (
            <h2 
              key={`line-${index}-${chapterId}`} 
              id={chapterId} 
              className="text-xl md:text-2xl font-bold my-4 pt-4 scroll-mt-24 text-primary dark:text-primary-light" // scroll-mt accounts for fixed header/toolbar
            >
              {line}
            </h2>
          );
        }
        // Preserve empty lines for paragraph breaks
        return <p key={`line-${index}`} className="my-1 leading-relaxed whitespace-pre-wrap">{line || '\u00A0'}</p>;
      })}
    </div>
  );
});


const ReaderView: React.FC = () => {
  const { 
    currentBook, 
    currentFontFamily, setCurrentFontFamily, 
    currentFontSize, setCurrentFontSize,
    updateCurrentBookScrollPosition,
    updateCurrentBookDisplayMode,
    isLoading: globalLoading, error: globalError
  } = useAppContext();

  const { speak, pause, resume, cancel, voices, selectedVoice, setSelectedVoice, isSpeaking, isPaused } = useSpeechSynthesis();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const contentElement = contentRef.current;
    if (currentBook && contentElement) {
        // Debounced scroll restoration
        const timer = setTimeout(() => {
            contentElement.scrollTop = currentBook.lastReadScrollPosition || 0;
        }, 100); // Small delay to ensure content is rendered
        return () => clearTimeout(timer);
    }
  }, [currentBook?.id, currentBook?.lastReadScrollPosition]); // Rerun if book ID or initial scroll position changes


  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) {
      window.clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (contentRef.current && currentBook) {
        updateCurrentBookScrollPosition(contentRef.current.scrollTop);
      }
    }, 250); // Debounce scroll saving
  }, [currentBook, updateCurrentBookScrollPosition]);


  useEffect(() => {
    const contentEl = contentRef.current;
    if (contentEl) {
      contentEl.addEventListener('scroll', handleScroll);
      return () => {
        contentEl.removeEventListener('scroll', handleScroll);
        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, [handleScroll]);

  if (!currentBook) return <div className="p-4 text-center">لم يتم تحديد كتاب.</div>;
  if (globalLoading) return <div className="flex-grow flex items-center justify-center"><LoadingSpinner message="جاري تحميل الكتاب..." /></div>;
  if (globalError) return <ErrorDisplay message={globalError} />;

  const fontOptions = ARABIC_FONTS.map(f => ({ label: f.name, value: f.value }));
  const voiceOptions = voices
    .filter(v => v.lang.startsWith('ar') || voices.length <=5) // Prioritize Arabic, show all if few
    .map(v => ({ label: `${v.name} (${v.lang})`, value: v.voice.name }));

  const handleChapterSelect = (chapterId: string) => {
    const chapterElement = document.getElementById(chapterId);
    if (chapterElement && contentRef.current) {
      chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if(window.innerWidth < 768) setIsSidebarOpen(false); // Close mobile sidebar on selection
  };
  
  const handleTTSAction = () => {
    if (isSpeaking) {
      if (isPaused) resume(); else pause();
    } else {
      let textToSpeak = "";
      if (currentBook.displayMode === DisplayMode.Original) {
        textToSpeak = currentBook.originalText;
      } else {
        textToSpeak = currentBook.translatedText;
      }
      // Attempt to get text from visible part or whole content.
      // For simplicity, reading whole current view.
      // A more advanced version might use IntersectionObserver to read visible parts.
      speak(textToSpeak, selectedVoice?.lang || 'ar-SA');
    }
  };

  const currentTextContent = currentBook.displayMode === DisplayMode.Original ? currentBook.originalText : currentBook.translatedText;


  return (
    <div className="flex flex-col h-[calc(100vh-4.75rem)]"> {/* Full height minus header */}
      {/* Reader Toolbar */}
      <div className="bg-surface-light dark:bg-surface-dark p-2 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-[4.75rem] z-40">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Font Controls */}
          <div className="flex items-center space-x-2 space-x-reverse">
            <Dropdown options={fontOptions} selectedValue={currentFontFamily} onSelect={setCurrentFontFamily} label="الخط:" />
            <Button onClick={() => setCurrentFontSize(Math.max(MIN_FONT_SIZE, currentFontSize - FONT_SIZE_STEP))} disabled={currentFontSize <= MIN_FONT_SIZE} title="تصغير الخط" variant="ghost" size="sm"><MinusIcon /></Button>
            <span className="text-sm w-6 text-center">{currentFontSize}</span>
            <Button onClick={() => setCurrentFontSize(Math.min(MAX_FONT_SIZE, currentFontSize + FONT_SIZE_STEP))} disabled={currentFontSize >= MAX_FONT_SIZE} title="تكبير الخط" variant="ghost" size="sm"><PlusIcon /></Button>
          </div>

          {/* Display Mode Toggle */}
          <div className="flex items-center space-x-1 space-x-reverse">
            <Button 
              variant={currentBook.displayMode === DisplayMode.Translated ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => updateCurrentBookDisplayMode(DisplayMode.Translated)}
              leftIcon={<TranslateIcon className="w-4 h-4"/>}
            >
              المترجم
            </Button>
            <Button
              variant={currentBook.displayMode === DisplayMode.Original ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => updateCurrentBookDisplayMode(DisplayMode.Original)}
              leftIcon={<OriginalTextIcon className="w-4 h-4"/>}
            >
              الأصلي
            </Button>
          </div>

          {/* TTS Controls */}
          <div className="flex items-center space-x-2 space-x-reverse">
            {voices.length > 0 && voiceOptions.length > 0 && (
              <Dropdown
                options={voiceOptions}
                selectedValue={selectedVoice?.name || ""}
                onSelect={(voiceName) => {
                    const newVoice = voices.find(v => v.voice.name === voiceName)?.voice || null;
                    setSelectedVoice(newVoice);
                }}
                label="الصوت:"
                className="min-w-[150px]"
              />
            )}
            <Button onClick={handleTTSAction} title={isSpeaking && !isPaused ? "إيقاف مؤقت" : "تشغيل/استئناف"} variant="ghost" size="sm">
              {isSpeaking && !isPaused ? <PauseIcon /> : <PlayIcon />}
            </Button>
            <Button onClick={cancel} disabled={!isSpeaking && !isPaused} title="إيقاف القراءة" variant="ghost" size="sm"><StopIcon /></Button>
          </div>
          
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden">
            <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} variant="ghost" size="sm" title={isSidebarOpen ? "إغلاق الفهرس" : "فتح الفهرس"}>
              {isSidebarOpen ? <CloseIcon /> : <HamburgerIcon />}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className={`hidden md:block w-72 lg:w-80 bg-surface-light dark:bg-surface-dark border-l dark:border-gray-700 p-4 overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'ml-0' : '-ml-72 lg:-ml-80' }`}
          aria-label="فهرس الكتاب"
        >
          <div className="flex justify-between items-center mb-3">
             <h2 className="text-lg font-semibold text-primary dark:text-primary-light">الفهرس</h2>
             <Button onClick={() => setIsSidebarOpen(false)} variant="ghost" className="md:hidden"><CloseIcon /></Button>
          </div>
          {currentBook.chapters.length > 0 ? (
            <ul className="space-y-1">
              {currentBook.chapters.map(chapter => (
                <li key={chapter.id}>
                  <button 
                    onClick={() => handleChapterSelect(chapter.id)} 
                    className="w-full text-right p-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors text-sm"
                  >
                    {chapter.title}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">لا يوجد فهرس لهذا الكتاب.</p>
          )}
        </aside>
        
        {/* Sidebar Toggle Button (Desktop - to reopen if closed, though current setup doesn't close it this way) */}
        {/* This button logic for desktop might be redundant if sidebar is always part of layout unless explicitly hidden. 
            Adjusting for better UX: if sidebar is essential, maybe it just collapses, not fully disappears requiring a separate button.
            For now, keeping it as is, but it's an area for potential UX refinement.
            Corrected: The `isSidebarOpen` state already controls the visibility including collapse/expand with `ml-0` and `-ml-72`.
            A button to *open* it when closed makes sense.
        */}
        {!isSidebarOpen && (
             <Button 
                onClick={() => setIsSidebarOpen(true)} 
                className="hidden md:block fixed bottom-4 right-4 z-50 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-light"
                title="فتح الفهرس"
                aria-label="فتح الفهرس"
             >
                <SidebarOpenIcon className="w-6 h-6"/>
            </Button>
        )}


        {/* Main Content */}
        <main ref={contentRef} className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto bg-background-light dark:bg-background-dark" dir="rtl">
          <ContentRenderer 
            text={currentTextContent} 
            chapters={currentBook.chapters}
            fontFamily={currentFontFamily}
            fontSize={currentFontSize}
          />
        </main>
      </div>

      {/* Mobile Sidebar (Modal/Drawer) */}
      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[60] bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)}> {/* Increased z-index for mobile sidebar */}
            <aside 
                className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-surface-light dark:bg-surface-dark shadow-xl p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside sidebar
                role="dialog"
                aria-modal="true"
                aria-label="فهرس الكتاب"
            >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-primary dark:text-primary-light">الفهرس</h2>
              <Button onClick={() => setIsSidebarOpen(false)} variant="ghost" size="sm"><CloseIcon /></Button>
            </div>
            {currentBook.chapters.length > 0 ? (
              <ul className="space-y-1">
                {currentBook.chapters.map(chapter => (
                  <li key={chapter.id}>
                    <button 
                      onClick={() => handleChapterSelect(chapter.id)} 
                      className="w-full text-right p-2 rounded hover:bg-primary-light hover:text-white dark:hover:bg-primary-dark transition-colors text-sm"
                    >
                      {chapter.title}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">لا يوجد فهرس لهذا الكتاب.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};


const App: React.FC = () => {
  const { currentBook, isLoading, error, books, theme } = useAppContext();

  useEffect(() => {
    // Apply a subtle pattern to the body background for the "Islamic modern" feel
    document.body.style.backgroundImage = theme === Theme.Dark
      ? `radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)`
      : `radial-gradient(circle, rgba(0,0,0,0.02) 1px, transparent 1px)`;
    document.body.style.backgroundSize = '20px 20px';
    return () => {
      document.body.style.backgroundImage = ''; // Clean up on unmount or theme change
    };
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <AppHeader />
      {/* Global loading indicator for initial app load or critical operations */}
      {isLoading && !currentBook && books.length === 0 && (
         <div className="flex-grow flex items-center justify-center">
            <LoadingSpinner message="جاري تهيئة التطبيق..."/>
         </div>
      )}
      {/* Global error display if not handled by specific views */}
      {error && !currentBook && !isLoading && ( // Show error only if not loading and no current book
        <div className="p-4"><ErrorDisplay message={error} /></div>
      )}
      
      {/* Render views if not in critical initial load/error state or if a book is selected */}
      {(!isLoading && !error) || currentBook || books.length > 0 ? (
        currentBook ? <ReaderView /> : <LibraryView />
      ) : null}
      {/* Fallback for critical error state before any books are loaded */}
      {error && !currentBook && books.length === 0 && !isLoading && (
         <div className="p-4 flex-grow flex flex-col items-center justify-center">
          <ErrorDisplay message={`فشل تهيئة التطبيق: ${error}. الرجاء المحاولة مرة أخرى لاحقاً.`} />
          <p className="mt-4 text-text-light dark:text-text-dark">يمكنك محاولة تحديث الصفحة.</p>
        </div>
      )}
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <AppProvider>
        <App />
      </AppProvider>
    </React.StrictMode>
  );
} else {
  console.error("Root element not found");
}
