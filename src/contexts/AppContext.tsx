
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Book, Theme, AppSettings, ChapterIndexItem, DisplayMode } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_SIZE, LOCALSTORAGE_BOOKS_KEY, LOCALSTORAGE_SETTINGS_KEY, PLACEHOLDER_PDF_TEXT } from '../constants';
import { translateText, generateIndexFromText } from '../services/geminiService';

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  books: Book[];
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
  error: string | null;
  processNewFile: (file: File) => Promise<Book | null>;
  updateCurrentBookScrollPosition: (position: number) => void;
  updateCurrentBookDisplayMode: (mode: DisplayMode) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useLocalStorage<AppSettings>(LOCALSTORAGE_SETTINGS_KEY, {
    theme: Theme.Light,
    defaultFontFamily: DEFAULT_FONT_FAMILY,
    defaultFontSize: DEFAULT_FONT_SIZE,
  });
  const [books, setBooks] = useLocalStorage<Book[]>(LOCALSTORAGE_BOOKS_KEY, []);
  const [currentBook, setCurrentBookInternal] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle(Theme.Dark, settings.theme === Theme.Dark);
  }, [settings.theme]);

  const toggleTheme = () => {
    setSettings(prev => ({ ...prev, theme: prev.theme === Theme.Light ? Theme.Dark : Theme.Light }));
  };
  
  const setCurrentBookById = useCallback((bookId: string | null) => {
    if (bookId === null) {
      setCurrentBookInternal(null);
      return;
    }
    const book = books.find(b => b.id === bookId);
    if (book) {
      setCurrentBookInternal(book);
    } else {
      setCurrentBookInternal(null);
      console.warn(`Book with id ${bookId} not found.`);
    }
  }, [books]);

  const addBook = (newBook: Book) => {
    setBooks(prevBooks => [...prevBooks, newBook]);
  };

  const updateBook = (updatedBook: Book) => {
    setBooks(prevBooks => prevBooks.map(b => b.id === updatedBook.id ? updatedBook : b));
    if (currentBook && currentBook.id === updatedBook.id) {
      setCurrentBookInternal(updatedBook);
    }
  };

  const deleteBook = (bookId: string) => {
    setBooks(prevBooks => prevBooks.filter(b => b.id !== bookId));
    if (currentBook && currentBook.id === bookId) {
      setCurrentBookInternal(null);
    }
  };
  
  const setCurrentFontFamily = (font: string) => {
    setSettings(prev => ({ ...prev, defaultFontFamily: font }));
    if (currentBook) {
      const updatedBook = { ...currentBook, currentFontFamily: font };
      updateBook(updatedBook);
    }
  };

  const setCurrentFontSize = (size: number) => {
    setSettings(prev => ({ ...prev, defaultFontSize: size }));
    if (currentBook) {
      const updatedBook = { ...currentBook, currentFontSize: size };
      updateBook(updatedBook);
    }
  };

  const updateCurrentBookScrollPosition = (position: number) => {
    if (currentBook) {
      const updatedBook = { ...currentBook, lastReadScrollPosition: position };
      updateBook(updatedBook); // This will also update localStorage via useLocalStorage hook
    }
  };
  
  const updateCurrentBookDisplayMode = (mode: DisplayMode) => {
    if (currentBook) {
      const updatedBook = { ...currentBook, displayMode: mode };
      updateBook(updatedBook);
    }
  };

  const processNewFile = async (file: File): Promise<Book | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // Simulate text extraction for now.
      // In a real app, use pdf.js or similar here.
      // const originalText = await extractTextFromPdf(file);
      const originalText = PLACEHOLDER_PDF_TEXT + `\n\n(اسم الملف الأصلي: ${file.name})`;
      
      const translatedText = await translateText(originalText);
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
    }
  };
  
  // Initialize currentBook's font/size from settings if book has none (e.g. older book)
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
      books, 
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
      error,
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