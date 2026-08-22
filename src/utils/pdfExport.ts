import { toPng, toJpeg } from 'html-to-image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  elementId?: string;
  element?: HTMLElement | null;
  filename: string;
  onProgress?: (step: string) => void;
}

/**
 * Helper to trigger browser file download safely across iframes and all browsers
 */
function downloadBlobOrDataUrl(url: string, filename: string): void {
  const link = document.createElement('a');
  link.style.display = 'none';
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }, 1500);
}

/**
 * Locate target A4 element by ID or class fallback
 */
function findA4Element(elementId?: string, directElement?: HTMLElement | null): HTMLElement {
  if (directElement) return directElement;
  
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) return el;
  }

  // Fallback searches
  const byExportTarget = document.getElementById('registration-a4-export-target');
  if (byExportTarget) return byExportTarget;

  const byDocumentId = document.getElementById('registration-a4-document');
  if (byDocumentId) return byDocumentId;

  const byClass = document.querySelector('.a4-page') as HTMLElement | null;
  if (byClass) return byClass;

  throw new Error('لم يتم العثور على عنصر استمارة A4 في الصفحة. يرجى التأكد من فتح الاستمارة.');
}

/**
 * Ensure all images inside an element are loaded before capturing
 */
async function preloadImages(element: HTMLElement): Promise<void> {
  const images = Array.from(element.getElementsByTagName('img'));
  await Promise.all(
    images.map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
}

/**
 * Export an HTML element as an official A4 PDF document
 */
export async function exportToA4PDF({ elementId, element: directEl, filename, onProgress }: ExportOptions): Promise<boolean> {
  try {
    onProgress?.('جاري تجهيز بيانات وتنسيقات الاستمارة...');
    const element = findA4Element(elementId, directEl);

    // Scroll to top to ensure complete capture
    window.scrollTo(0, 0);

    onProgress?.('جاري معالجة الاستمارة بدقة عالية (High-Resolution Capture)...');
    await preloadImages(element);

    let imgData: string;

    try {
      // Modern native SVG foreignObject capture - 100% compatible with modern Tailwind CSS / oklch colors
      imgData = await toJpeg(element, {
        quality: 0.96,
        pixelRatio: 2.2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        fontEmbedCSS: '',
        style: {
          boxShadow: 'none',
          margin: '0',
          transform: 'none',
        },
      });
    } catch (primaryErr) {
      console.warn('html-to-image failed, falling back to html2canvas:', primaryErr);
      const canvas = await html2canvas(element, {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth || 794,
        windowHeight: element.scrollHeight || 1123,
      });
      imgData = canvas.toDataURL('image/jpeg', 0.96);
    }

    onProgress?.('جاري إنشاء ملف PDF بحجم A4 القياسي (210mm × 297mm)...');
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    // Full bleed placement for exact A4 template match
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

    onProgress?.('جاري حفظ وتنزيل ملف PDF...');
    
    const safeFilename = `${filename.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;
    
    // Use Blob download for maximum browser compatibility in iframes
    try {
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      downloadBlobOrDataUrl(blobUrl, safeFilename);
    } catch {
      pdf.save(safeFilename);
    }

    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Export an HTML element as high-resolution Image (PNG)
 */
export async function exportToImage({ elementId, element: directEl, filename, onProgress }: ExportOptions): Promise<boolean> {
  try {
    onProgress?.('جاري تجهيز الصورة عالية الدقة...');
    const element = findA4Element(elementId, directEl);

    window.scrollTo(0, 0);
    await preloadImages(element);

    onProgress?.('جاري معالجة الرسم الرقمي للصورة...');
    let dataUrl: string;

    try {
      // Modern native SVG foreignObject capture - handles Tailwind v4 oklch colors natively without errors
      dataUrl = await toPng(element, {
        pixelRatio: 2.5,
        backgroundColor: '#ffffff',
        cacheBust: true,
        fontEmbedCSS: '',
        style: {
          boxShadow: 'none',
          margin: '0',
          transform: 'none',
        },
      });
    } catch (primaryErr) {
      console.warn('html-to-image failed, falling back to html2canvas:', primaryErr);
      const canvas = await html2canvas(element, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      dataUrl = canvas.toDataURL('image/png', 1.0);
    }

    onProgress?.('جاري حفظ وتنزيل الصورة بصيغة PNG...');
    const safeFilename = `${filename.replace(/[/\\?%*:|"<>]/g, '_')}.png`;

    downloadBlobOrDataUrl(dataUrl, safeFilename);
    return true;
  } catch (error) {
    console.error('Error exporting Image:', error);
    throw error;
  }
}

/**
 * Trigger native print dialog specifically for the A4 document
 */
export function printDocument(): void {
  window.print();
}


