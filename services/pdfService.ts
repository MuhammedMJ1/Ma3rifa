import { getDocument, renderTextLayer } from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy, TextItem } from 'pdfjs-dist/types/src/display/api';

export const pdfService = {
  loadPdf: async (file: File): Promise<PDFDocumentProxy | null> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use named import getDocument
      const loadingTask = getDocument({ data: arrayBuffer });
      return await loadingTask.promise;
    } catch (error) {
      console.error('Error loading PDF:', error);
      return null;
    }
  },

  renderPage: async (
    pdfDoc: PDFDocumentProxy,
    pageNum: number,
    canvas: HTMLCanvasElement,
    textLayerDiv: HTMLDivElement,
    fontSizeMultiplier: number // e.g., 1.0 for 100%, 1.2 for 120%
  ): Promise<void> => {
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewportBase = page.getViewport({ scale: 1.5 }); // Base viewport scale
      // Adjust scale based on fontSizeMultiplier. This is an approximation.
      // A more accurate way might involve scaling text elements directly if possible,
      // or re-evaluating how font size translates to canvas rendering.
      // For now, we scale the entire canvas content.
      const effectiveScale = 1.5 * (fontSizeMultiplier / 100);
      const viewport = page.getViewport({ scale: effectiveScale });

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;
      canvas.style.width = '100%'; // Make canvas responsive within its container
      canvas.style.height = 'auto';


      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      // Render text layer for selection and search highlighting
      textLayerDiv.innerHTML = ''; // Clear previous text layer
      textLayerDiv.style.width = `${canvas.width}px`; // Match canvas dimensions
      textLayerDiv.style.height = `${canvas.height}px`;
      textLayerDiv.style.left = `${canvas.offsetLeft}px`;
      textLayerDiv.style.top = `${canvas.offsetTop}px`;
      
      const textContent = await page.getTextContent();
      // Use named import renderTextLayer
      await renderTextLayer({ 
          textContentSource: textContent,
          container: textLayerDiv,
          viewport: viewport,
          textDivs: [] // Array of HTMLDivElement
      });


    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
    }
  },

  extractTextFromPage: async (page: PDFPageProxy): Promise<string> => {
    try {
      const textContent = await page.getTextContent();
      return textContent.items.map(item => (item as TextItem).str).join(' ');
    } catch (error) {
      console.error('Error extracting text from page:', error);
      return '';
    }
  },

  extractAllText: async (pdfDoc: PDFDocumentProxy): Promise<{pageTexts: string[], fullText: string}> => {
    const numPages = pdfDoc.numPages;
    const pageTexts: string[] = [];
    let fullText = "";
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const text = await pdfService.extractTextFromPage(page);
      pageTexts.push(text);
      fullText += text + "\n\n"; // Add newlines between pages
      page.cleanup(); // Important for memory management
    }
    return {pageTexts, fullText};
  },
};