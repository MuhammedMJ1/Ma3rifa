
import React, { useEffect, useRef, useState, memo } from 'react';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { pdfService } from '../../services/pdfService';
import { DisplaySettings } from '../../types';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PdfViewerProps {
  pdfDoc: PDFDocumentProxy;
  currentPage: number;
  displaySettings: DisplaySettings;
  searchTerm?: string;
  textToDisplay?: string; // If provided, display this text instead of rendering PDF page (for translation view)
}

const PageRenderer: React.FC<{
  pdfDoc: PDFDocumentProxy;
  pageNum: number;
  displaySettings: DisplaySettings;
  isActive: boolean;
  searchTerm?: string;
}> = memo(({ pdfDoc, pageNum, displaySettings, isActive, searchTerm }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    // Only render/re-render if page is active or settings change significantly
    if (isActive && pdfDoc && canvasRef.current && textLayerRef.current) {
      setIsLoadingPage(true);
      pdfService.renderPage(pdfDoc, pageNum, canvasRef.current, textLayerRef.current, displaySettings.fontSize)
        .then(() => {
            setIsLoadingPage(false);
            // Highlight search term if present
            if (searchTerm && textLayerRef.current) {
                const textDivs = textLayerRef.current.querySelectorAll<HTMLElement>('span[role="presentation"]');
                textDivs.forEach(div => {
                    // Basic highlighting - can be improved with more robust regex and class application
                    // This is a simplified version. pdf.js renderTextLayer creates complex structure.
                    // A better approach would be to use find_controller from pdf.js viewer components if feasible.
                    if (div.innerText.toLowerCase().includes(searchTerm.toLowerCase())) {
                       // Simple highlighting by changing background.
                       // For multiple occurrences, complex regex needed to wrap each match.
                       const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
                       div.innerHTML = div.innerText.replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
                    } else {
                       // Remove previous highlights if term changes
                       div.innerHTML = div.innerText; // Resets innerHTML, clearing marks
                    }
                });
            }
        })
        .catch(err => {
            console.error(`Failed to render page ${pageNum}:`, err);
            setIsLoadingPage(false);
        });
    }
  }, [pdfDoc, pageNum, displaySettings.fontSize, displaySettings.fontFamily, isActive, searchTerm]);

  return (
    <div className="pdf-page-container mb-4 shadow-lg relative mx-auto" style={{ width: 'fit-content', maxWidth: '100%' }}>
      {isLoadingPage && isActive && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <LoadingSpinner text={`جاري تحميل الصفحة ${pageNum}...`} />
        </div>
      )}
      <canvas ref={canvasRef} />
      <div ref={textLayerRef} className="textLayer" /> {/* Text layer for selection and accessibility */}
    </div>
  );
});
PageRenderer.displayName = 'PageRenderer';


export const PdfViewer: React.FC<PdfViewerProps> = ({ pdfDoc, currentPage, displaySettings, searchTerm, textToDisplay }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]); // To scroll to current page

  useEffect(() => {
    pageRefs.current = pageRefs.current.slice(0, pdfDoc.numPages);
 }, [pdfDoc.numPages]);

  useEffect(() => {
    // Scroll to current page
    if (pageRefs.current[currentPage - 1] && !textToDisplay) { // Only scroll if PDF view, not text view
      pageRefs.current[currentPage - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (viewerRef.current && textToDisplay) {
        viewerRef.current.scrollTop = 0; // Scroll to top for text view
    }
  }, [currentPage, textToDisplay]);


  if (textToDisplay) {
    return (
      <div 
        ref={viewerRef}
        className="pdf-viewer flex-grow overflow-y-auto p-4" 
        style={{ 
          fontFamily: displaySettings.fontFamily, 
          fontSize: `${displaySettings.fontSize}%`,
          lineHeight: `${displaySettings.fontSize / 100 * 1.6}`, // Adjust line height with font size
          backgroundColor: displaySettings.backgroundColor, 
          color: displaySettings.textColor,
          direction: 'rtl' 
        }}
      >
        <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none" style={{color: displaySettings.textColor}}>
          <pre className="whitespace-pre-wrap break-words" style={{fontFamily: displaySettings.fontFamily, color: displaySettings.textColor}}>{textToDisplay}</pre>
        </div>
      </div>
    );
  }

  return (
    <div ref={viewerRef} className="pdf-viewer flex-grow overflow-y-auto p-2 md:p-4" style={{ backgroundColor: displaySettings.backgroundColor }}>
      {Array.from(new Array(pdfDoc.numPages), (el, index) => (
        <div key={`page_${index + 1}`} ref={el => pageRefs.current[index] = el}>
          <PageRenderer
            pdfDoc={pdfDoc}
            pageNum={index + 1}
            displaySettings={displaySettings}
            isActive={index + 1 === currentPage} // Consider rendering a few pages around current for smoothness (virtualization)
            searchTerm={searchTerm}
          />
        </div>
      ))}
    </div>
  );
};