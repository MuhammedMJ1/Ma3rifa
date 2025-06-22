
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
  LOCALSTORAGE_PROCESSED_PRELOADED_BOOKS_KEY
} from '../constants';
import { translateText, generateIndexFromText } from '../services/geminiService';
import { extractTextFromPdf } from '../services/pdfService';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  books: Book[]; // User uploaded books
  preloadedBooks: Book[]; // Processed preloaded books
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

const initialPreloadedBooksData = [
  { id: PRELOADED_BOOK_QURAN_ID, name: "القرآن الكريم", originalText: PRELOADED_QURAN_TEXT, isPreloaded: true },
  { id: PRELOADED_BOOK_NAHJ_ID, name: "نهج البلاغة", originalText: PRELOADED_NAHJ_TEXT, isPreloaded: true },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<AppSettings>(LOCALSTORAGE_SETTINGS_KEY, {
    theme: Theme.Light,
    defaultFontFamily: DEFAULT_FONT_FAMILY,
    defaultFontSize: DEFAULT_FONT_SIZE,
  });
  const [userBooks, setUserBooks] = useLocalStorage<Book[]>(LOCALSTORAGE_BOOKS_KEY, []);
  const [processedPreloadedBooks, setProcessedPreloadedBooks] = useLocalStorage<Book[]>(LOCALSTORAGE_PROCESSED_PRELOADED_BOOKS_KEY, []);
  
  const [currentBook, setCurrentBookInternal] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("جاري التحميل...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle(Theme.Dark, settings.theme === Theme.Dark);
  }, [settings.theme]);

  const clearError = useCallback(() => setError(null), []);

  const toggleTheme = useCallback(() => {
    setSettings(prev => ({ ...prev, theme: prev.theme === Theme.Light ? Theme.Dark : Theme.Light }));
  }, [setSettings]);
  
  const processAndStorePreloadedBooks = useCallback(async () => {
    // Only process if not already processed and stored
    if (processedPreloadedBooks.length > 0 && processedPreloadedBooks.length === initialPreloadedBooksData.length) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage("جاري إعداد المكتبة الإسلامية الأساسية...");

    const newlyProcessedBooks: Book[] = [];
    try {
      for (const preloadedData of initialPreloadedBooksData) {
        // Check if this specific book is already in our processed list (e.g. if one processed but not others)
        if (processedPreloadedBooks.find(b => b.id === preloadedData.id)) {
          newlyProcessedBooks.push(processedPreloadedBooks.find(b => b.id === preloadedData.id)!);
          continue;
        }

        setLoadingMessage(`جاري معالجة: ${preloadedData.name}`);
        // For preloaded books, originalText is Arabic. "translatedText" will be the same.
        // Indexing is based on this original Arabic text.
        const textForIndexing = preloadedData.originalText;
        const chapters = await generateIndexFromText(textForIndexing);
        
        const book: Book = {
          ...preloadedData,
          translatedText: preloadedData.originalText, 
          chapters,
          lastReadScrollPosition: 0,
          currentFontFamily: settings.defaultFontFamily,
          currentFontSize: settings.defaultFontSize,
          dateAdded: new Date().toISOString(),
          displayMode: DisplayMode.Original, 
        };
        newlyProcessedBooks.push(book);
      }
      setProcessedPreloadedBooks(newlyProcessedBooks);
    } catch (err) {
      console.error("Error processing preloaded books:", err);
      setError(err instanceof Error ? `خطأ في إعداد الكتب الإسلامية: ${err.message}` : "خطأ غير معروف في إعداد الكتب الإسلامية.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("جاري التحميل...");
    }
  }, [settings.defaultFontFamily, settings.defaultFontSize, processedPreloadedBooks, setProcessedPreloadedBooks]);

  useEffect(() => {
    processAndStorePreloadedBooks();
  }, [processAndStorePreloadedBooks]);
  

  const allBooks = [...userBooks, ...processedPreloadedBooks];

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
    // Preloaded books are managed by processAndStorePreloadedBooks and stored in processedPreloadedBooks
    // This function is only for user-uploaded books.
    if (!newBook.isPreloaded) {
        setUserBooks(prevBooks => [...prevBooks, newBook]);
    } else {
        console.warn("Attempted to add a preloaded book via addBook. This should be handled by preloaded book processing.");
    }
  }, [setUserBooks]);

  const updateBook = useCallback((updatedBook: Book) => {
    if (updatedBook.isPreloaded) {
        setProcessedPreloadedBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    } else {
        setUserBooks(prevBooks => prevBooks.map(b => b.id === updatedBook.id ? updatedBook : b));
    }
    if (currentBook && currentBook.id === updatedBook.id) {
      setCurrentBookInternal(updatedBook);
    }
  }, [setUserBooks, setProcessedPreloadedBooks, currentBook]);

  const deleteBook = useCallback((bookId: string) => { 
    // Users can only delete their own books, not preloaded ones.
    const bookToDelete = userBooks.find(b => b.id === bookId);
    if (bookToDelete && !bookToDelete.isPreloaded) {
        setUserBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
        if (currentBook && currentBook.id === bookId) {
          setCurrentBookInternal(null);
        }
    } else {
        console.warn("Attempted to delete a non-existent or preloaded book:", bookId);
    }
  }, [setUserBooks, userBooks, currentBook]);
  
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
      addBook(newBook);
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
  }, [settings.defaultFontFamily, settings.defaultFontSize, addBook]);
  
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
      preloadedBooks: processedPreloadedBooks,
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
