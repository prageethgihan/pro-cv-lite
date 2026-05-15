import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export Service for Cover Letters
 */

export const exportService = {
  /**
   * Export as PDF using html2canvas and jsPDF for visual fidelity
   */
  exportToPDF: async (elementId, filename) => {
    const element = document.getElementById(elementId);
    if (!element) return false;

    // Save original styles
    const originalStyle = element.style.cssText;
    const originalColor = element.style.color;
    const originalBg = element.style.backgroundColor;

    try {
      // Force light theme for export
      element.style.backgroundColor = "#ffffff";
      element.style.color = "#000000";
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      // Restore original styles
      element.style.cssText = originalStyle;
      element.style.color = originalColor;
      element.style.backgroundColor = originalBg;

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
      return true;
    } catch (err) {
      console.error("PDF Export failed", err);
      return false;
    }
  },

  /**
   * Export as DOCX (HTML based approach for styling)
   */
  exportToDOCX: (content, filename) => {
    try {
      const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            "<head><meta charset='utf-8'><title>Export HTML to Doc</title></head><body>";
      const footer = "</body></html>";
      const sourceHTML = header + content.replace(/\n/g, '<br>') + footer;
      
      const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
      const fileDownload = document.createElement("a");
      document.body.appendChild(fileDownload);
      fileDownload.href = source;
      fileDownload.download = `${filename}.doc`;
      fileDownload.click();
      document.body.removeChild(fileDownload);
      return true;
    } catch (err) {
      console.error("DOCX Export failed", err);
      return false;
    }
  },

  /**
   * Export as plain text
   */
  exportToTXT: (content, filename) => {
    try {
      const element = document.createElement("a");
      const file = new Blob([content], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `${filename}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return true;
    } catch (err) {
      console.error("TXT Export failed", err);
      return false;
    }
  }
};
