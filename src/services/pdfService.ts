import * as pdfjsLib from 'pdfjs-dist';

// Set workerSrc for pdf.js. Vite will copy this to /assets/pdf.worker.min.mjs
// Adjust the path based on your Vite publicDir or asset handling.
// If you've configured Vite to copy it to `dist/assets/pdf.worker.min.mjs`, this path should work.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker.min.mjs';


export const extractTextFromPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(" ");
    fullText += pageText + "\n\n"; // Add double newline between pages for separation
  }

  return fullText.trim();
};
