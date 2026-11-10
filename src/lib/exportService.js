import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Export Service for CVs & Cover Letters
 */

export const exportService = {
  /**
   * Export as PDF using html2canvas and jsPDF for visual fidelity
   */
  exportToPDF: async (elementId, filename) => {
    const element = document.getElementById(elementId);
    if (!element) return false;

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = 210;
      const pdfPageHeight = 297;

      // Check if root element contains explicitly partitioned pages (.original-cv-page or .cv-page)
      const pageElements = element.querySelectorAll(".original-cv-page, .cv-page");

      if (pageElements && pageElements.length > 0) {
        for (let i = 0; i < pageElements.length; i++) {
          const pageEl = pageElements[i];
          if (i > 0) {
            pdf.addPage("a4", "portrait");
          }

          const originalStyle = pageEl.style.cssText;
          pageEl.style.backgroundColor = "#ffffff";
          pageEl.style.color = "#000000";

          const canvas = await html2canvas(pageEl, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#ffffff",
            windowWidth: 794
          });

          pageEl.style.cssText = originalStyle;

          const imgData = canvas.toDataURL("image/png");
          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfPageHeight, undefined, "FAST");
        }
      } else {
        // Fallback for single container: automatic pagination
        const originalStyle = element.style.cssText;
        element.style.backgroundColor = "#ffffff";
        element.style.color = "#000000";

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        });

        element.style.cssText = originalStyle;

        const imgData = canvas.toDataURL("image/png");
        const totalHeightMm = (canvas.height * pdfWidth) / canvas.width;
        let heightRemaining = totalHeightMm;
        let positionY = 0;

        pdf.addImage(imgData, "PNG", 0, positionY, pdfWidth, totalHeightMm, undefined, "FAST");
        heightRemaining -= pdfPageHeight;

        while (heightRemaining > 5) {
          positionY -= pdfPageHeight;
          pdf.addPage("a4", "portrait");
          pdf.addImage(imgData, "PNG", 0, positionY, pdfWidth, totalHeightMm, undefined, "FAST");
          heightRemaining -= pdfPageHeight;
        }
      }

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
