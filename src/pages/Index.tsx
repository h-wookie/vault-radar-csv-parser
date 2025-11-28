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
import { Separator } from '@/components/ui/separator';
import { saveCSVData, loadCSVData, clearCSVData } from '@/utils/db';

const STORAGE_KEY = 'vault-radar-csv-data';

const Index = () => {
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const { toast } = useToast();

  // Load data from IndexedDB on mount
  useEffect(() => {
    loadCSVData(STORAGE_KEY).then(data => {
      if (data) {
        setCsvData(data);
      }
    }).catch(error => {
      console.error('Failed to load data from IndexedDB:', error);
    });
  }, []);

  // Save to IndexedDB whenever csvData changes
  useEffect(() => {
    if (csvData) {
      saveCSVData(STORAGE_KEY, csvData).catch(error => {
        console.error('Failed to save data to IndexedDB:', error);
      });
    } else {
      clearCSVData(STORAGE_KEY).catch(error => {
        console.error('Failed to clear data from IndexedDB:', error);
      });
    }
  }, [csvData]);

  const handleDataLoaded = (newData: CSVData) => {
    setCsvData(prevData => {
      
      if (prevData && prevData.length > 0) {
        // Find fingerprint columns in both datasets (case-insensitive)
        const prevFpCol = Object.keys(prevData[0]).find(col =>
          col.toLowerCase().includes('fingerprint')
        );
        const newFpCol = Object.keys(newData[0] || {}).find(col =>
          col.toLowerCase().includes('fingerprint')
        );

        if (prevFpCol && newFpCol) {
          const existingFingerprints = new Set(
            prevData
              .map(record => (record[prevFpCol] || '').toLowerCase())
              .filter(Boolean)
          );

          // Dedupe against existing data AND within the newly uploaded set
          const seenNew = new Set<string>();
          const uniqueNewData: typeof newData = [];
          let duplicatesVsExisting = 0;
          let duplicatesWithinUploads = 0;

          for (const record of newData) {
            const fingerprint = (record[newFpCol] || '').toLowerCase();
            if (!fingerprint) continue;
            if (existingFingerprints.has(fingerprint)) {
              duplicatesVsExisting++;
              continue;
            }
            if (seenNew.has(fingerprint)) {
              duplicatesWithinUploads++;
              continue;
            }
            seenNew.add(fingerprint);
            uniqueNewData.push(record);
          }

          const duplicateCount = duplicatesVsExisting + duplicatesWithinUploads;

          toast({
            title: '업로드 완료',
            description:
              duplicatesWithinUploads > 0
                ? `${uniqueNewData.length}건 추가, 중복 ${duplicateCount}건 건너뜀 (업로드 내 중복 ${duplicatesWithinUploads}건 포함)`
                : `${uniqueNewData.length}건 추가, 중복 ${duplicateCount}건 건너뜀`,
          });

          const finalData = uniqueNewData.length > 0 ? [...prevData, ...uniqueNewData] : prevData;
          return finalData;
        }

        // No fingerprint in one or both datasets: append without de-duplication
        toast({
          title: '업로드 완료',
          description: `${newData.length}건을 추가했습니다.`,
        });
        const finalData = [...prevData, ...newData];
        return finalData;
      }

      // First load
      toast({
        title: '데이터 불러옴',
        description: `${newData.length}건을 불러왔습니다.`,
      });
      return newData;
    });
  };

  const handleClearStorage = async () => {
    await clearCSVData(STORAGE_KEY);
    setCsvData(null);
    toast({
      title: '저장소 삭제 완료',
      description: '업로드한 CSV 데이터가 모두 삭제되었습니다.',
    });
  };

  const handleUploadComplete = (newData: CSVData) => {
    handleDataLoaded(newData);
    setIsUploadDialogOpen(false);
    setIsMenuOpen(false);
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
                  Vault Radar CSV 데이터 분석기
                </h1>
                <p className="text-sm text-muted-foreground">
                  Vault Radar CSV 결과를 시각적으로 분석하고 정리하세요
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {csvData && (
                <Sheet open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                  <SheetTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      title="데이터 추가 업로드"
                    >
                      <Upload className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="h-auto">
                    <SheetHeader>
                      <SheetTitle>데이터 추가 업로드</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FileUpload onDataLoaded={handleUploadComplete} hasExistingData={!!csvData} />
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>메뉴</SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-4 mt-6">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">테마</span>
                    <ThemeToggle />
                  </div>
                  
                  <Separator />
                  
                  {/* Upload More Button */}
                  {csvData && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => {
                          setIsUploadDialogOpen(true);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Upload className="w-4 h-4" />
                        데이터 추가 업로드
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="w-full justify-start gap-2">
                            <Trash2 className="w-4 h-4" />
                            저장소 비우기
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>모든 데이터를 삭제할까요?</AlertDialogTitle>
                            <AlertDialogDescription>
                              업로드한 CSV 데이터를 전부 삭제합니다. 
                              되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => {
                              handleClearStorage();
                              setIsMenuOpen(false);
                            }}>
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                      
                      <Separator />
                    </>
                  )}
                  
                  {/* External Links */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">자료 / 링크</p>
                    
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
                        What is Vault Radar? (공식 문서)
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
                        Vault Radar CLI (공식 문서)
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
                        Vault Radar Scan (Repo 스캔 가이드)
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
                      GitHub 저장소
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
                      Docker Hub 이미지
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                </div>
                  
                  {/* Disclaimer */}
                  <div className="mt-6 pt-4 border-t">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <strong>Disclaimer:</strong> 커뮤니티가 유지하는 개인 프로젝트이며 HashiCorp 공식 제품이 아닙니다. 
                      HashiCorp의 제휴/승인/지원이 없으며, 소프트웨어는 "있는 그대로(as is)" 제공됩니다. 
                      사용에 따른 책임은 사용자에게 있습니다.
                    </p>
                  </div>
                  
                  {/* Made with Lovable */}
                  <div className="mt-4 pt-4 border-t">
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {!csvData ? (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-8">
            <div className="text-center max-w-2xl">
              <h2 className="text-3xl font-bold mb-4">
                Vault Radar CSV 데이터를 불러와 분석하세요
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Vault Radar export CSV를 업로드하고 대화형 차트, 검색 가능한 테이블, 고급 필터로 빠르게 살펴보세요.
              </p>
            </div>
            
            <FileUpload onDataLoaded={handleDataLoaded} hasExistingData={!!csvData} />

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl">
              <div className="text-center p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">스마트 검색</h3>
                <p className="text-sm text-muted-foreground">
                  모든 필드를 대상으로 실시간 검색/필터링
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Filter className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">고급 필터</h3>
                <p className="text-sm text-muted-foreground">
                  Severity, Category 등으로 정밀 필터링
                </p>
              </div>

              <div className="text-center p-6 rounded-lg bg-card border">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Database className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold mb-2">시각적 인사이트</h3>
                <p className="text-sm text-muted-foreground">
                  Severity 분포를 차트로 한눈에 확인
                </p>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div className="max-w-3xl mt-12 p-6 rounded-lg bg-muted/50 border">
              <p className="text-sm text-muted-foreground leading-relaxed text-center">
                <strong>Disclaimer:</strong> 커뮤니티가 유지하는 개인 프로젝트이며 HashiCorp 공식 제품이 아닙니다. 
                HashiCorp의 제휴/승인/지원이 없으며, 소프트웨어는 "있는 그대로(as is)" 제공됩니다. 
                사용에 따른 책임은 사용자에게 있습니다.
              </p>
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
