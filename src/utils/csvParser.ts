import { CSVRecord, CSVData } from "@/types/csvData";

export const parseCSV = (csvText: string): CSVData => {
  // Normalize line endings and handle BOM
  let normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove BOM if present (can cause issues in Chromium)
  if (normalizedText.charCodeAt(0) === 0xFEFF) {
    normalizedText = normalizedText.slice(1);
  }
  
  const lines = normalizedText.split('\n').filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const headers = parseCSVLine(lines[0]).filter(h => h.trim() !== '');
  
  if (headers.length === 0) {
    throw new Error('CSV file has no valid headers');
  }

  // Parse data rows
  const records: CSVData = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0 || values.every(v => v.trim() === '')) continue;

    const record: CSVRecord = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }

  return records;
};

// Helper to parse a CSV line handling quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Push final field (even if empty)
  result.push(current);
  return result.map(field => field.trim());
};

export const exportToCSV = (data: CSVData, filename: string = 'export.csv') => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape values containing commas or quotes
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};
