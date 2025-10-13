import Dexie, { Table } from 'dexie';
import { CSVData } from '@/types/csvData';

export interface StoredData {
  id?: number;
  key: string;
  data: CSVData;
  timestamp: number;
}

export class AppDatabase extends Dexie {
  csvData!: Table<StoredData>;

  constructor() {
    super('VaultRadarDB');
    this.version(1).stores({
      csvData: '++id, key, timestamp'
    });
  }
}

export const db = new AppDatabase();

export const saveCSVData = async (key: string, data: CSVData) => {
  await db.csvData.put({
    key,
    data,
    timestamp: Date.now()
  });
};

export const saveOrMergeCSVData = async (key: string, newData: CSVData) => {
  await db.transaction('rw', db.csvData, async () => {
    const existing = await db.csvData.where('key').equals(key).first();
    const merged = existing ? [...existing.data, ...newData] : newData;
    await db.csvData.put({ 
      key, 
      data: merged, 
      timestamp: Date.now() 
    });
  });
};

export const loadCSVData = async (key: string): Promise<CSVData | null> => {
  const stored = await db.csvData.where('key').equals(key).first();
  return stored ? stored.data : null;
};

export const clearCSVData = async (key: string) => {
  await db.csvData.where('key').equals(key).delete();
};
