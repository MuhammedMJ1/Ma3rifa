
import * as pdfjsLib from 'pdfjs-dist';
// Explicitly import types from their definition files for clarity and correctness
import type { 
    PDFDocumentProxy as PDFDocumentProxyType, 
    PDFPageProxy as PDFPageProxyType, 
    TextItem as TextItemType, 
    TextContent as TextContentType 
} from 'pdfjs-dist/types/src/display/api';

export const pdfService = {
  loadPdf: async (file: File): Promise<PDFDocumentProxyType | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use pdfjsLib.getDocument
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      return await loadingTask.promise;
    } catch (error) {
      console.error('Error loading PDF:', error);
      return null;
    }
  },

  renderPage: async (
    pdfDoc: PDFDocumentProxyType,
    pageNum: number,
    canvas: HTMLCanvasElement,
    textLayerDiv: HTMLDivElement,
    fontSizeMultiplier: number // e.g., 1.0 for 100%, 1.2 for 120%
  ): Promise<void> => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewportBase = page.getViewport({ scale: 1.5 }); // Base viewport scale
      const effectiveScale = 1.5 * (fontSizeMultiplier / 100);
      const viewport = page.getViewport({ scale: effectiveScale });

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = '100%';
      canvas.style.height = 'auto';

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      textLayerDiv.innerHTML = ''; 
      textLayerDiv.style.width = `${canvas.width}px`; 
      textLayerDiv.style.height = `${canvas.height}px`;
      textLayerDiv.style.left = `${canvas.offsetLeft}px`;
      textLayerDiv.style.top = `${canvas.offsetTop}px`;
      
      const textContentSource: TextContentType = await page.getTextContent(); // Use TextContentType
      // Use pdfjsLib.renderTextLayer and await its promise
      await pdfjsLib.renderTextLayer({ // Use pdfjsLib.renderTextLayer
          textContent: textContentSource, 
          container: textLayerDiv,
          viewport: viewport,
          textDivs: [] 
      }).promise;

    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  },

  extractTextFromPage: async (page: PDFPageProxyType): Promise<string> => {
    try {
      const textContent: TextContentType = await page.getTextContent(); // Use TextContentType
      return textContent.items.map(item => (item as TextItemType).str).join(' '); // Use TextItemType
    } catch (error) {
      console.error('Error extracting text from page:', error);
      return '';
    }
  },

  extractAllText: async (pdfDoc: PDFDocumentProxyType): Promise<{pageTexts: string[], fullText: string}> => {
    const numPages = pdfDoc.numPages;
    const pageTexts: string[] = [];
    let fullText = "";
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const text = await pdfService.extractTextFromPage(page);
      pageTexts.push(text);
      fullText += text + "\n\n"; 
      page.cleanup(); 
    }
    return {pageTexts, fullText};
  },
};
