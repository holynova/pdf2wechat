import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Initialize PDF.js worker
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export interface StitchConfig {
  splitCount: number;
  direction: 'vertical' | 'horizontal';
  quality: 'high' | 'normal';
  gap: boolean;
  border: boolean;
}

export interface ProcessingStatus {
  step: 'loading' | 'rendering' | 'stitching' | 'zipping' | 'done' | 'error';
  progress: number;
  message?: string;
}

export const loadPDF = async (file: File): Promise<pdfjsLib.PDFDocumentProxy> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument(arrayBuffer);
  return loadingTask.promise;
};

const renderPageToCanvas = async (page: pdfjsLib.PDFPageProxy, scale: number = 2): Promise<HTMLCanvasElement> => {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error('Could not get canvas context');

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  await page.render(renderContext as any).promise;

  return canvas;
};

export const processPDF = async (
  pdf: pdfjsLib.PDFDocumentProxy,
  config: StitchConfig,
  onStatusUpdate: (status: ProcessingStatus) => void
): Promise<string[]> => {
  try {
    const totalPages = pdf.numPages;
    const { splitCount, direction, quality, gap, border } = config;
    
    // Calculate pages per group
    // Distribute pages as evenly as possible
    const basePagesPerGroup = Math.floor(totalPages / splitCount);
    const extraPages = totalPages % splitCount;
    
    const groups: number[][] = [];
    let currentPage = 1;
    
    for (let i = 0; i < splitCount; i++) {
      const count = basePagesPerGroup + (i < extraPages ? 1 : 0);
      const group: number[] = [];
      for (let j = 0; j < count; j++) {
        if (currentPage <= totalPages) {
          group.push(currentPage++);
        }
      }
      if (group.length > 0) {
        groups.push(group);
      }
    }

    const results: string[] = [];
    const scale = quality === 'high' ? 2 : 1.5;
    const format = quality === 'high' ? 'image/png' : 'image/jpeg';
    const qualityParam = quality === 'high' ? 1.0 : 0.8;
    const gapSize = gap ? (quality === 'high' ? 40 : 20) : 0;

    for (let i = 0; i < groups.length; i++) {
      const groupPages = groups[i];
      onStatusUpdate({ 
        step: 'rendering', 
        progress: (i / groups.length) * 50, 
        message: `Processing group ${i + 1}/${groups.length}` 
      });

      // Render all pages in this group
      const pageCanvases: HTMLCanvasElement[] = [];
      for (const pageNum of groupPages) {
        const page = await pdf.getPage(pageNum);
        const canvas = await renderPageToCanvas(page, scale);
        pageCanvases.push(canvas);
      }

      // Stitch images
      onStatusUpdate({ 
        step: 'stitching', 
        progress: 50 + (i / groups.length) * 40,
        message: `Stitching group ${i + 1}/${groups.length}`
      });

      const stitchedCanvas = document.createElement('canvas');
      const ctx = stitchedCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get stitching context');

      if (direction === 'vertical') {
        const maxWidth = Math.max(...pageCanvases.map(c => c.width));
        const totalHeight = pageCanvases.reduce((sum, c) => sum + c.height, 0) + (pageCanvases.length - 1) * gapSize;
        
        stitchedCanvas.width = maxWidth;
        stitchedCanvas.height = totalHeight;
        
        // Fill background white (for JPG transparency issues)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, stitchedCanvas.width, stitchedCanvas.height);

        let currentY = 0;
        for (const canvas of pageCanvases) {
          // Center horizontally if widths differ
          const x = (maxWidth - canvas.width) / 2;
          ctx.drawImage(canvas, x, currentY);
          
          if (border) {
            ctx.strokeStyle = '#e5e7eb'; // gray-200
            ctx.lineWidth = quality === 'high' ? 4 : 2;
            ctx.strokeRect(x, currentY, canvas.width, canvas.height);
          }

          currentY += canvas.height + gapSize;
        }
      } else {
        const maxHeight = Math.max(...pageCanvases.map(c => c.height));
        const totalWidth = pageCanvases.reduce((sum, c) => sum + c.width, 0) + (pageCanvases.length - 1) * gapSize;
        
        stitchedCanvas.width = totalWidth;
        stitchedCanvas.height = maxHeight;
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, stitchedCanvas.width, stitchedCanvas.height);

        let currentX = 0;
        for (const canvas of pageCanvases) {
          // Center vertically if heights differ
          const y = (maxHeight - canvas.height) / 2;
          ctx.drawImage(canvas, currentX, y);

          if (border) {
            ctx.strokeStyle = '#e5e7eb'; // gray-200
            ctx.lineWidth = quality === 'high' ? 4 : 2;
            ctx.strokeRect(currentX, y, canvas.width, canvas.height);
          }

          currentX += canvas.width + gapSize;
        }
      }

      const dataUrl = stitchedCanvas.toDataURL(format, qualityParam);
      results.push(dataUrl);
    }

    onStatusUpdate({ step: 'done', progress: 100 });
    return results;

  } catch (error) {
    onStatusUpdate({ step: 'error', progress: 0, message: String(error) });
    throw error;
  }
};

export const generateZip = async (images: string[], filename: string = 'stitched-images'): Promise<Blob> => {
  const zip = new JSZip();
  
  images.forEach((dataUrl, index) => {
    const ext = dataUrl.startsWith('data:image/png') ? 'png' : 'jpg';
    const base64Data = dataUrl.split(',')[1];
    zip.file(`${filename}-${index + 1}.${ext}`, base64Data, { base64: true });
  });

  return zip.generateAsync({ type: 'blob' });
};
