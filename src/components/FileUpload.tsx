import { useCallback, useState, useRef } from 'react';
import { Upload, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { parseCSV } from '@/utils/csvParser';
import { CSVData } from '@/types/csvData';

interface FileUploadProps {
  onDataLoaded: (data: CSVData) => void;
  hasExistingData?: boolean;
}

export const FileUpload = ({ onDataLoaded, hasExistingData = false }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((files: FileList) => {
    // Validate all files are CSV
    const fileArray = Array.from(files);
    const nonCsvFiles = fileArray.filter(file => !file.name.toLowerCase().endsWith('.csv'));
    
    if (nonCsvFiles.length > 0) {
      toast({
        title: 'Invalid File(s)',
        description: `Please upload only CSV files. Found: ${nonCsvFiles.map(f => f.name).join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    // Process all files
    let processedCount = 0;
    let allData: CSVData = [];

    fileArray.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = parseCSV(text);
          
          if (data.length === 0) {
            throw new Error(`No data found in ${file.name}`);
          }

          allData = [...allData, ...data];
          processedCount++;

          // Once all files are processed, load the combined data
          if (processedCount === files.length) {
            onDataLoaded(allData);
            if (inputRef.current) inputRef.current.value = '';
          }
        } catch (error) {
          toast({
            title: 'Parse Error',
            description: error instanceof Error ? error.message : `Failed to parse ${file.name}`,
            variant: 'destructive',
          });
          processedCount++;
        }
      };
      reader.readAsText(file);
    });
  }, [onDataLoaded, toast, hasExistingData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e?: React.DragEvent) => {
    e?.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files);
    }
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
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          multiple
          onChange={handleFileInput}
          className="sr-only"
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
              {isDragging ? 'Drop your CSV file here' : hasExistingData ? 'Add More Data' : 'Upload CSV File'}
            </p>
            <p className="text-sm text-muted-foreground">
              {hasExistingData 
                ? 'New data will be added to existing records'
                : 'Drag and drop or click to browse (multiple files supported)'}
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
