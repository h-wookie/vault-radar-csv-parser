import { CSVRecord, CSVData } from "@/types/csvData";

export const parseCSV = (csvText: string): CSVData => {
  console.log('[parseCSV] Input length:', csvText.length);
  console.log('[parseCSV] Last 200 chars:', csvText.slice(-200));
  
  // Normalize line endings and handle BOM (hardened for Chromium)
  let normalizedText = csvText
    .replace(/^\uFEFF/, '')     // Remove BOM (even if charCode check fails)
    .replace(/\r\n/g, '\n')     // Windows line endings
    .replace(/\r/g, '\n');      // Old Mac line endings
  
  const lines = normalizedText.split('\n').filter(line => line.trim() !== '');
  console.log('[parseCSV] Line count after split:', lines.length);
  
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

  console.log('[parseCSV] Final record count:', records.length);
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
