
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

export interface DisplaySettings {
  fontSize: number; // as a percentage multiplier for base size
  fontFamily: string;
  backgroundColor: string;
  textColor: string;
}

export interface PdfFileState {
  file: File | null;
  pdfDoc: PDFDocumentProxy | null;
  numPages: number;
  extractedText: string[]; // Text per page
  fullText: string; // All text concatenated
}

export interface AiFeaturesState {
  translation: string | null; // Translated text of current view or selection
  summary: string | null;
  keywords: string[];
  isOriginalVisible: boolean;
}

export interface TtsState {
  isPlaying: boolean;
  speed: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

export interface ResearchArticle {
  title: string;
  summary: string;
  url: string;
  source?: string;
  publishedDate?: string;
  translatedSummary?: string;
}

export interface GroundingChunk {
  web?: {
    uri?: string; // Changed from 'string | undefined' to 'string?'
    title?: string; // Changed from 'string | undefined' to 'string?'
  };
  retrievedContext?: {
    uri?: string; // Changed from 'string | undefined' to 'string?'
    title?: string; // Changed from 'string | undefined' to 'string?'
  };
  // Add other possible grounding chunk types if needed
}