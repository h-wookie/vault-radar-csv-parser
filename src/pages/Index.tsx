import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { CSVData } from '@/types/csvData';
import { Database, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'vault-radar-csv-data';

const Index = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const { toast } = useToast();

  // Load data from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsedData = JSON.parse(stored);
        setCsvData(parsedData);
      } catch (error) {
        console.error('Failed to load data from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever csvData changes
  useEffect(() => {
    if (csvData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(csvData));
    }
  }, [csvData]);

  const handleDataLoaded = (newData: CSVData) => {
    setCsvData(prevData => {
      if (prevData) {
        // Append new data to existing data
        return [...prevData, ...newData];
      }
      return newData;
    });
  };

  const handleClearStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCsvData(null);
    toast({
      title: 'Storage Cleared',
      description: 'All CSV data has been removed',
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-accent rounded-lg">
                <Database className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Vault Radar CSV Data Analyzer
                </h1>
                <p className="text-sm text-muted-foreground">
                  Analyze CSV data with visual insights
                </p>
              </div>
            </div>
            
            {csvData && (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="gap-2">
                      <Trash2 className="w-4 h-4" />
                      Clear Storage
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all uploaded CSV data from storage. 
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearStorage}>
                        Clear Data
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            {!csvData && <ThemeToggle />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!csvData ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-8">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Welcome to Vault Radar CSV Data Analyzer
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Upload your CSV file to get started. View your data with interactive charts,
                searchable tables, and advanced filtering capabilities.
              </p>
            </div>
            
            <FileUpload onDataLoaded={handleDataLoaded} hasExistingData={!!csvData} />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
              <div className="text-center p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Smart Search</h3>
                <p className="text-sm text-muted-foreground">
                  Search across all fields with real-time filtering
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Advanced Filters</h3>
                <p className="text-sm text-muted-foreground">
                  Filter by severity, category, and more
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">Visual Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive charts for severity distribution
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <DataTable data={csvData} />
          </div>
        )}
      </main>
    </div>
  );
};

// Missing imports for feature icons
import { Search, Filter } from 'lucide-react';

export default Index;
