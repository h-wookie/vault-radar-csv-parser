import { useState, useEffect, useRef } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { CSVData } from '@/types/csvData';
import { Database, FileSpreadsheet, Trash2, Upload, Menu, Github, ExternalLink, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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
import { parseCSV } from '@/utils/csvParser';
import { Separator } from '@/components/ui/separator';

const STORAGE_KEY = 'vault-radar-csv-data';

const Index = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (prevData && prevData.length > 0) {
        // Get existing fingerprints
        const fingerprintCol = Object.keys(prevData[0]).find(col => 
          col.toLowerCase().includes('fingerprint')
        );
        
        if (!fingerprintCol) {
          // If no fingerprint column, just append
          return [...prevData, ...newData];
        }
        
        const existingFingerprints = new Set(
          prevData.map(record => record[fingerprintCol]).filter(Boolean)
        );
        
        // Filter out duplicates from new data
        const uniqueNewData = newData.filter(record => {
          const fingerprint = record[fingerprintCol];
          return fingerprint && !existingFingerprints.has(fingerprint);
        });
        
        const duplicateCount = newData.length - uniqueNewData.length;
        
        if (duplicateCount > 0) {
          toast({
            title: 'Duplicates Removed',
            description: `Added ${uniqueNewData.length} new records, skipped ${duplicateCount} duplicates`,
          });
        }
        
        return [...prevData, ...uniqueNewData];
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          throw new Error('No data found in CSV');
        }

        handleDataLoaded(data);
      } catch (error) {
        toast({
          title: 'Parse Error',
          description: error instanceof Error ? error.message : 'Failed to parse CSV',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
            
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-4 mt-6">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  
                  <Separator />
                  
                  {/* Upload More Button */}
                  {csvData && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="header-file-upload"
                      />
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          fileInputRef.current?.click();
                          setIsMenuOpen(false);
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        Upload More Data
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full justify-start gap-2">
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
                            <AlertDialogAction onClick={() => {
                              handleClearStorage();
                              setIsMenuOpen(false);
                            }}>
                              Clear Data
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Separator />
                    </>
                  )}
                  
                  {/* External Links */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Resources</p>
                    
                    {/* Vault Radar Documentation */}
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <a 
                        href="https://developer.hashicorp.com/hcp/docs/vault-radar" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <BookOpen className="w-4 h-4" />
                        What is Vault Radar?
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <a 
                        href="https://developer.hashicorp.com/hcp/docs/vault-radar/cli" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <BookOpen className="w-4 h-4" />
                        Vault Radar CLI
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <a 
                        href="https://developer.hashicorp.com/hcp/docs/vault-radar/cli/scan/repo" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <BookOpen className="w-4 h-4" />
                        Vault Radar Scan
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                    
                    <Separator className="my-2" />
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <a 
                        href="https://github.com/Atnaszurc/vault-radar-csv-parser" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4" />
                        GitHub Repository
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start gap-2"
                      asChild
                    >
                      <a 
                        href="https://hub.docker.com/r/fwarfvinge/vault-radar-csv" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Database className="w-4 h-4" />
                        Docker Hub
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </Button>
                  </div>
                  
                  {/* Made with Lovable */}
                  <div className="mt-auto pt-6 border-t">
                    <a 
                      href="https://lovable.dev" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Made with ❤️ using Lovable.dev
                    </a>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
