
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Book, Theme, AppSettings, DisplayMode } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { 
  DEFAULT_FONT_FAMILY, 
  DEFAULT_FONT_SIZE, 
  LOCALSTORAGE_BOOKS_KEY, 
  LOCALSTORAGE_SETTINGS_KEY,
  PRELOADED_BOOK_QURAN_ID,
  PRELOADED_BOOK_NAHJ_ID,
  PRELOADED_QURAN_TEXT,
  PRELOADED_NAHJ_TEXT,
  LOCALSTORAGE_PRELOADED_BOOKS_PROCESSED_KEY
} from '../constants';
import { translateText, generateIndexFromText } from '../services/geminiService';
import { extractTextFromPdf } from '../services/pdfService';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  books: Book[];
  preloadedBooks: Book[];
  addBook: (newBook: Book) => void;
  updateBook: (updatedBook: Book) => void;
  deleteBook: (bookId: string) => void;
  currentBook: Book | null;
  setCurrentBookById: (bookId: string | null) => void;
  currentFontFamily: string;
  setCurrentFontFamily: (font: string) => void;
  currentFontSize: number;
  setCurrentFontSize: (size: number) => void;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  processNewFile: (file: File) => Promise<Book | null>;
  updateCurrentBookScrollPosition: (position: number) => void;
  updateCurrentBookDisplayMode: (mode: DisplayMode) => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<AppSettings>(LOCALSTORAGE_SETTINGS_KEY, {
    theme: Theme.Light,
    defaultFontFamily: DEFAULT_FONT_FAMILY,
    defaultFontSize: DEFAULT_FONT_SIZE,
  });
  const [userBooks, setUserBooks] = useLocalStorage<Book[]>(LOCALSTORAGE_BOOKS_KEY, []);
  const [preloadedBooks, setPreloadedBooks] = useState<Book[]>([]);
  const [currentBook, setCurrentBookInternal] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("جاري التحميل...");
  const [error, setError] = useState<string | null>(null);
  const [preloadedProcessed, setPreloadedProcessed] = useLocalStorage<boolean>(LOCALSTORAGE_PRELOADED_BOOKS_PROCESSED_KEY, false);

  useEffect(() => {
    document.documentElement.classList.toggle(Theme.Dark, settings.theme === Theme.Dark);
  }, [settings.theme]);

  const clearError = useCallback(() => setError(null), []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === Theme.Light ? Theme.Dark : Theme.Light }));
  }, [setSettings]);
  
  const processAndStorePreloadedBooks = useCallback(async () => {
    if (preloadedProcessed && preloadedBooks.length > 0) return; 
    
    setIsLoading(true);
    setLoadingMessage("جاري إعداد المكتبة الإسلامية...");

    const initialPreloadedBooksData = [
      { id: PRELOADED_BOOK_QURAN_ID, name: "القرآن الكريم", originalText: PRELOADED_QURAN_TEXT, isPreloaded: true },
      { id: PRELOADED_BOOK_NAHJ_ID, name: "نهج البلاغة", originalText: PRELOADED_NAHJ_TEXT, isPreloaded: true },
    ];

    const processedBooks: Book[] = [];
    try {
      for (const preloadedData of initialPreloadedBooksData) {
        setLoadingMessage(`جاري معالجة: ${preloadedData.name}`);
        const existingBook = userBooks.find(b => b.id === preloadedData.id && b.isPreloaded);
        if (existingBook) {
            processedBooks.push(existingBook);
            continue;
        }

        // For preloaded books, originalText is Arabic. Translation means providing English or other lang if needed.
        // Here, we assume translatedText will be the same as original if original is already target language (Arabic)
        // Or, we could call translateText(preloadedData.originalText, "English_placeholder") if we wanted an actual translation.
        // For simplicity, let's assume translatedText is the primary text (Arabic in this case).
        const textForIndexing = preloadedData.originalText; // Use original Arabic text for indexing
        const chapters = await generateIndexFromText(textForIndexing);
        
        const book: Book = {
          ...preloadedData,
          translatedText: preloadedData.originalText, // If source is Arabic, translated might be same or other language
          chapters,
          lastReadScrollPosition: 0,
          currentFontFamily: settings.defaultFontFamily,
          currentFontSize: settings.defaultFontSize,
          dateAdded: new Date().toISOString(),
          displayMode: DisplayMode.Original, // Default to Original for preloaded Arabic texts
        };
        processedBooks.push(book);
      }
      setPreloadedBooks(processedBooks);
      setPreloadedProcessed(true);
    } catch (err) {
      console.error("Error processing preloaded books:", err);
      setError(err instanceof Error ? `خطأ في إعداد الكتب الإسلامية: ${err.message}` : "خطأ غير معروف في إعداد الكتب الإسلامية.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("جاري التحميل...");
    }
  }, [settings.defaultFontFamily, settings.defaultFontSize, preloadedProcessed, userBooks, preloadedBooks.length, setPreloadedProcessed]); // Removed translateText, generateIndexFromText from deps as they are stable module functions

  useEffect(() => {
    if (!preloadedProcessed) {
        processAndStorePreloadedBooks();
    } else {
        // This logic ensures preloadedBooks state is populated if already processed.
        const tempInitialPreloadedBooksData = [
            { id: PRELOADED_BOOK_QURAN_ID, name: "القرآن الكريم", originalText: PRELOADED_QURAN_TEXT, isPreloaded: true },
            { id: PRELOADED_BOOK_NAHJ_ID, name: "نهج البلاغة", originalText: PRELOADED_NAHJ_TEXT, isPreloaded: true },
        ];
        if (preloadedBooks.length === 0 && tempInitialPreloadedBooksData.length > 0 && preloadedProcessed) {
             const booksToSet = tempInitialPreloadedBooksData.map(pb_1 => ({
                ...pb_1,
                translatedText: pb_1.originalText, 
                chapters: [{id: 'chap1-' + pb_1.id, title: 'فصل تجريبي (تحميل مبدئي)'}], // Placeholder chapters
                lastReadScrollPosition: 0,
                currentFontFamily: settings.defaultFontFamily,
                currentFontSize: settings.defaultFontSize,
                dateAdded: new Date().toISOString(),
                displayMode: DisplayMode.Original,
             }));
             setPreloadedBooks(booksToSet);
        }
    }
  }, [processAndStorePreloadedBooks, preloadedProcessed, settings.defaultFontFamily, settings.defaultFontSize, preloadedBooks.length]);
  

  const allBooks = [...userBooks, ...preloadedBooks];

  const setCurrentBookById = useCallback((bookId: string | null) => {
    if (bookId === null) {
      setCurrentBookInternal(null);
      return;
    }
    const book = allBooks.find(b => b.id === bookId);
    if (book) {
      setCurrentBookInternal(book);
    } else {
      setCurrentBookInternal(null);
      console.warn(`Book with id ${bookId} not found.`);
    }
  }, [allBooks]);

  const addBook = useCallback((newBook: Book) => {
    if (newBook.isPreloaded) {
        // This case should ideally not happen post-initialization for preloaded books
        // If it does, it implies updating an existing preloaded book definition
        setPreloadedBooks(prev => {
            const existing = prev.find(b => b.id === newBook.id);
            if (existing) return prev.map(b => b.id === newBook.id ? newBook : b);
            return [...prev, newBook];
        });
    } else {
        setUserBooks(prevBooks => [...prevBooks, newBook]);
    }
  }, [setUserBooks]);

  const updateBook = useCallback((updatedBook: Book) => {
    if (updatedBook.isPreloaded) {
        setPreloadedBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    } else {
        setUserBooks(prevBooks => prevBooks.map(b => b.id === updatedBook.id ? updatedBook : b));
    }
    if (currentBook && currentBook.id === updatedBook.id) {
      setCurrentBookInternal(updatedBook);
    }
  }, [setUserBooks, currentBook]);

  const deleteBook = useCallback((bookId: string) => { 
    setUserBooks(prevBooks => prevBooks.filter(b => b.id !== bookId && !b.isPreloaded));
    if (currentBook && currentBook.id === bookId && !currentBook.isPreloaded) {
      setCurrentBookInternal(null);
    }
  }, [setUserBooks, currentBook]);
  
  const setCurrentFontFamily = useCallback((font: string) => {
    setSettings(prev => ({ ...prev, defaultFontFamily: font }));
    if (currentBook) {
      const updatedBook = { ...currentBook, currentFontFamily: font };
      updateBook(updatedBook);
    }
  }, [setSettings, currentBook, updateBook]);

  const setCurrentFontSize = useCallback((size: number) => {
    setSettings(prev => ({ ...prev, defaultFontSize: size }));
    if (currentBook) {
      const updatedBook = { ...currentBook, currentFontSize: size };
      updateBook(updatedBook);
    }
  }, [setSettings, currentBook, updateBook]);

  const updateCurrentBookScrollPosition = useCallback((position: number) => {
    if (currentBook) {
      const updatedBook = { ...currentBook, lastReadScrollPosition: position };
      updateBook(updatedBook); 
    }
  }, [currentBook, updateBook]);
  
  const updateCurrentBookDisplayMode = useCallback((mode: DisplayMode) => {
    if (currentBook) {
      const updatedBook = { ...currentBook, displayMode: mode };
      updateBook(updatedBook);
    }
  }, [currentBook, updateBook]);

  const processNewFile = useCallback(async (file: File): Promise<Book | null> => {
    setIsLoading(true);
    setError(null);
    try {
      setLoadingMessage("جاري استخلاص النص من الملف...");
      const originalText = await extractTextFromPdf(file);
      
      setLoadingMessage("جاري ترجمة النص...");
      const translatedText = await translateText(originalText);

      setLoadingMessage("جاري إنشاء الفهرس...");
      const chapters = await generateIndexFromText(translatedText);

      const newBook: Book = {
        id: crypto.randomUUID(),
        name: file.name,
        originalText,
        translatedText,
        chapters,
        lastReadScrollPosition: 0,
        currentFontFamily: settings.defaultFontFamily,
        currentFontSize: settings.defaultFontSize,
        dateAdded: new Date().toISOString(),
        displayMode: DisplayMode.Translated,
        isPreloaded: false,
      };
      addBook(newBook); // This is already useCallback'd
      setIsLoading(false);
      return newBook;
    } catch (err) {
      console.error("Error processing file:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred during file processing.";
      setError(errorMessage);
      setIsLoading(false);
      return null;
    } finally {
        setLoadingMessage("جاري التحميل...");
    }
  }, [settings.defaultFontFamily, settings.defaultFontSize, addBook]); // Removed translateText, generateIndexFromText from deps as they are stable module functions
  
  useEffect(() => {
    if (currentBook && (!currentBook.currentFontFamily || !currentBook.currentFontSize)) {
      setCurrentBookInternal(prev => prev ? {
        ...prev,
        currentFontFamily: prev.currentFontFamily || settings.defaultFontFamily,
        currentFontSize: prev.currentFontSize || settings.defaultFontSize,
      } : null);
    }
  }, [currentBook, settings.defaultFontFamily, settings.defaultFontSize]);

  return (
    <AppContext.Provider value={{ 
      theme: settings.theme, 
      toggleTheme, 
      books: userBooks, 
      preloadedBooks,
      addBook, 
      updateBook, 
      deleteBook, 
      currentBook, 
      setCurrentBookById,
      currentFontFamily: currentBook?.currentFontFamily || settings.defaultFontFamily,
      setCurrentFontFamily,
      currentFontSize: currentBook?.currentFontSize || settings.defaultFontSize,
      setCurrentFontSize,
      isLoading, 
      loadingMessage,
      error,
      clearError,
      processNewFile,
      updateCurrentBookScrollPosition,
      updateCurrentBookDisplayMode,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
