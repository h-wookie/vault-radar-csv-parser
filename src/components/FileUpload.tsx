import { useCallback, useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseCSV } from '@/utils/csvParser';
import { CSVData } from '@/types/csvData';

interface FileUploadProps {
  onDataLoaded: (data: CSVData) => void;
}

export const FileUpload = ({ onDataLoaded }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a CSV file',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = parseCSV(text);
        
        if (data.length === 0) {
          throw new Error('No data found in CSV');
        }

        onDataLoaded(data);
        toast({
          title: 'Success!',
          description: `Loaded ${data.length} records`,
        });
      } catch (error) {
        toast({
          title: 'Parse Error',
          description: error instanceof Error ? error.message : 'Failed to parse CSV',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  }, [onDataLoaded, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-lg p-12 text-center
          transition-all duration-300 ease-in-out
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }
        `}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            p-4 rounded-full transition-all duration-300
            ${isDragging ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-muted-foreground'}
          `}>
            {isDragging ? (
              <FileText className="w-8 h-8" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-semibold text-foreground mb-2">
              {isDragging ? 'Drop your CSV file here' : 'Upload CSV File'}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag and drop or click to browse
            </p>
          </div>

          <Button variant="outline" size="lg" className="mt-2" asChild>
            <label htmlFor="file-upload" className="cursor-pointer">
              Choose File
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
};
