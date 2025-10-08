import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVData, CSVRecord } from '@/types/csvData';
import { getFieldDisplayName, getFieldDescription } from './fieldDefinitions';

export const exportToPDF = (data: CSVData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add new page with header
  const addNewPage = () => {
    doc.addPage();
    yPosition = 20;
  };

  // Title Page
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Vault Radar Security Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

  // Overview Section
  yPosition += 20;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', 14, yPosition);

  yPosition += 10;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Findings: ${data.length}`, 14, yPosition);

  // Severity breakdown
  yPosition += 10;
  const severityCol = Object.keys(data[0] || {}).find(col => 
    col.toLowerCase().includes('severity')
  );
  
  if (severityCol) {
    const severityCounts: Record<string, number> = {};
    data.forEach(record => {
      const severity = record[severityCol];
      if (severity) {
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
      }
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Severity Distribution:', 14, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');

    Object.entries(severityCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([severity, count]) => {
        doc.text(`  ${severity}: ${count}`, 14, yPosition);
        yPosition += 6;
      });
  }

  // Category breakdown
  yPosition += 10;
  const categoryCol = Object.keys(data[0] || {}).find(col => 
    col.toLowerCase().includes('category')
  );
  
  if (categoryCol) {
    const categoryCounts: Record<string, number> = {};
    data.forEach(record => {
      const category = record[categoryCol];
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Category Distribution:', 14, yPosition);
    yPosition += 8;
    doc.setFont('helvetica', 'normal');

    Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        if (yPosition > pageHeight - 30) {
          addNewPage();
        }
        doc.text(`  ${category}: ${count}`, 14, yPosition);
        yPosition += 6;
      });
  }

  // Detailed Findings - One per page
  data.forEach((record, index) => {
    addNewPage();
    yPosition = 20;

    // Page header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Finding #${index + 1} of ${data.length}`, 14, yPosition);

    yPosition += 12;

    // Field details
    const columns = Object.keys(record);
    columns.forEach(column => {
      const value = record[column];
      if (!value) return;

      if (yPosition > pageHeight - 40) {
        addNewPage();
      }

      const displayName = getFieldDisplayName(column);
      const description = getFieldDescription(column);

      // Field name
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(displayName, 14, yPosition);
      yPosition += 5;

      // Field description (if available)
      if (description) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        const descLines = doc.splitTextToSize(description, pageWidth - 28);
        doc.text(descLines, 14, yPosition);
        yPosition += descLines.length * 4 + 2;
        doc.setTextColor(0, 0, 0);
      }

      // Field value
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const valueLines = doc.splitTextToSize(value, pageWidth - 28);
      doc.text(valueLines, 14, yPosition);
      yPosition += valueLines.length * 5 + 8;
    });
  });

  // Save the PDF
  doc.save(`vault-radar-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
