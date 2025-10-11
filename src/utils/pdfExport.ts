import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVData, CSVRecord } from '@/types/csvData';
import { getFieldDisplayName, getFieldDescription } from './fieldDefinitions';

export const exportToPDF = (data: CSVData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Create pie chart as image
  const createPieChart = (severityCounts: Record<string, number>): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    
    const colors: Record<string, string> = {
      'critical': '#ef4444',
      'high': '#f97316',
      'medium': '#eab308',
      'low': '#84cc16',
      'info': '#22c55e',
    };
    
    const total = Object.values(severityCounts).reduce((a, b) => a + b, 0);
    let currentAngle = -Math.PI / 2; // Start at top
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    
    // Draw pie slices
    Object.entries(severityCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([severity, count]) => {
        const sliceAngle = (count / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        
        const color = colors[severity.toLowerCase()] || '#94a3b8';
        ctx.fillStyle = color;
        ctx.fill();
        
        // Add labels
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(severity, labelX, labelY);
        ctx.font = '12px Arial';
        ctx.fillText(`(${count})`, labelX, labelY + 15);
        
        currentAngle += sliceAngle;
      });
    
    return canvas.toDataURL('image/png');
  };

  // Helper function to add page numbers
  const addPageNumber = (pageNum: number, totalPages: number) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Page ${pageNum} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.setTextColor(0, 0, 0);
  };

  // Helper function to add new page
  const addNewPage = () => {
    doc.addPage();
    yPosition = 20;
  };

  // PAGE 1: Title & Overview with Data Table
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Vault Radar Security Report', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 8;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });

  // Overview Section
  const overviewStartY = yPosition;
  yPosition += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', 14, yPosition);

  yPosition += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total Findings: ${data.length}`, 14, yPosition);

  // Severity breakdown
  yPosition += 6;
  const severityCol = Object.keys(data[0] || {}).find(col => 
    col.toLowerCase().includes('severity')
  );
  
  let severityCounts: Record<string, number> = {};
  if (severityCol) {
    data.forEach(record => {
      const severity = record[severityCol];
      if (severity) {
        severityCounts[severity] = (severityCounts[severity] || 0) + 1;
      }
    });

    doc.setFont('helvetica', 'bold');
    doc.text('Severity Distribution:', 14, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');

    Object.entries(severityCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([severity, count]) => {
        doc.text(`  ${severity}: ${count}`, 14, yPosition);
        yPosition += 4;
      });
  }

  // Category breakdown
  yPosition += 6;
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
    yPosition += 5;
    doc.setFont('helvetica', 'normal');

    Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        doc.text(`  ${category}: ${count}`, 14, yPosition);
        yPosition += 4;
      });
  }

  // Add pie chart to the right of overview
  if (Object.keys(severityCounts).length > 0) {
    const chartImage = createPieChart(severityCounts);
    doc.addImage(chartImage, 'PNG', pageWidth - 70, overviewStartY + 5, 55, 55);
  }

  // Data Table - display columns
  yPosition += 10;
  const displayColumns = [
    Object.keys(data[0] || {}).find(col => col.toLowerCase().includes('category')),
    Object.keys(data[0] || {}).find(col => col.toLowerCase().includes('description')),
    Object.keys(data[0] || {}).find(col => col.toLowerCase().includes('severity')),
    Object.keys(data[0] || {}).find(col => col.toLowerCase().includes('path') && !col.toLowerCase().includes('location')),
    Object.keys(data[0] || {}).find(col => col.toLowerCase().includes('created')),
  ].filter(Boolean) as string[];

  if (displayColumns.length > 0) {
    const tableData = data.map(record => 
      displayColumns.map(col => {
        const value = record[col] || '';
        // Truncate long values
        return value.length > 40 ? value.substring(0, 40) + '...' : value;
      })
    );

    autoTable(doc, {
      startY: yPosition,
      head: [displayColumns.map(col => getFieldDisplayName(col))],
      body: tableData,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [66, 119, 170], fontSize: 8, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 55 },
        2: { cellWidth: 25 },
        3: { cellWidth: 45 },
        4: { cellWidth: 30 },
      },
      margin: { left: 14, right: 14, bottom: 20 },
    });
  }

  // PAGE 2: Field Descriptions
  addNewPage();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Field Descriptions', 14, yPosition);

  yPosition += 10;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const allColumns = Object.keys(data[0] || {});
  allColumns.forEach(column => {
    const displayName = getFieldDisplayName(column);
    const description = getFieldDescription(column);

    if (description) {
      if (yPosition > pageHeight - 30) {
        addNewPage();
      }

      doc.setFont('helvetica', 'bold');
      doc.text(displayName, 14, yPosition);
      yPosition += 4;

      doc.setFont('helvetica', 'normal');
      const descLines = doc.splitTextToSize(description, pageWidth - 28);
      doc.text(descLines, 14, yPosition);
      yPosition += descLines.length * 3.5 + 5;
    }
  });

  // DETAILED FINDINGS - One per page
  data.forEach((record, index) => {
    addNewPage();
    yPosition = 20;

    // Page header
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Finding #${index + 1} of ${data.length}`, 14, yPosition);

    yPosition += 10;

    // Field details
    const columns = Object.keys(record);
    columns.forEach(column => {
      const value = record[column];
      if (!value) return;

      if (yPosition > pageHeight - 30) {
        addNewPage();
      }

      const displayName = getFieldDisplayName(column);

      // Field name
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(displayName, 14, yPosition);
      yPosition += 4;

      // Field value
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      const valueLines = doc.splitTextToSize(value, pageWidth - 28);
      doc.text(valueLines, 14, yPosition);
      yPosition += valueLines.length * 3.5 + 5;
    });
  });

  // Add page numbers to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageNumber(i, totalPages);
  }

  // Save the PDF
  doc.save(`vault-radar-report-${new Date().toISOString().split('T')[0]}.pdf`);
};
