import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportOptions {
  elementId: string;
  filename: string;
  onProgress?: (step: string) => void;
}

/**
 * Export an HTML element as an official A4 PDF document
 */
export async function exportToA4PDF({ elementId, filename, onProgress }: ExportOptions): Promise<boolean> {
  try {
    onProgress?.('جاري تجهيز المستند والتنسيقات...');
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    // Scroll to top to ensure complete capture
    window.scrollTo(0, 0);

    onProgress?.('جاري معالجة الرسم عالي الدقة (2x Canvas)...');
    const canvas = await html2canvas(element, {
      scale: 2.5, // High resolution for crisp official printing
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    onProgress?.('جاري توليد ملف PDF بحجم A4 القياسي...');
    const imgData = canvas.toDataURL('image/png', 1.0);

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate scaling to fit neatly within A4 page margins if needed
    const imgProps = pdf.getImageProperties(imgData);
    const ratio = imgProps.height / imgProps.width;
    const computedHeight = pdfWidth * ratio;

    if (computedHeight > pdfHeight) {
      // Fit by height if taller
      const computedWidth = pdfHeight / ratio;
      const marginX = (pdfWidth - computedWidth) / 2;
      pdf.addImage(imgData, 'PNG', marginX, 0, computedWidth, pdfHeight, undefined, 'FAST');
    } else {
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, computedHeight, undefined, 'FAST');
    }

    onProgress?.('جاري حفظ وتنزيل الملف...');
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
}

/**
 * Export an HTML element as high-resolution Image (PNG)
 */
export async function exportToImage({ elementId, filename, onProgress }: ExportOptions): Promise<boolean> {
  try {
    onProgress?.('جاري تجهيز الصورة عالية الدقة...');
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    window.scrollTo(0, 0);

    const canvas = await html2canvas(element, {
      scale: 3, // Very crisp for archiving / photo view
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    onProgress?.('جاري حفظ الصورة بصيغة PNG...');
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
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
