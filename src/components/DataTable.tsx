import { useState, useMemo } from 'react';
import { CSVData, CSVRecord } from '@/types/csvData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, ArrowUpDown, ArrowUp, ArrowDown,
  ExternalLink, Calendar, User, Hash, Tag
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { SeverityChart } from '@/components/SeverityChart';
import { PathTreeChart } from '@/components/PathTreeChart';

interface DataTableProps {
  data: CSVData;
}

type SortField = string | null;
type SortDirection = 'asc' | 'desc' | null;

export const DataTable = ({ data }: DataTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const columns = useMemo(() => 
    data.length > 0 ? Object.keys(data[0]) : [],
    [data]
  );

  const getSeverityColumn = () => 
    columns.find(col => col.toLowerCase().includes('severity')) || '';

  const getCategoryColumn = () => 
    columns.find(col => col.toLowerCase().includes('category')) || '';

  const uniqueSeverities = useMemo(() => {
    const sevCol = getSeverityColumn();
    return sevCol ? Array.from(new Set(data.map(r => r[sevCol]).filter(Boolean))) : [];
  }, [data, columns]);

  const uniqueCategories = useMemo(() => {
    const catCol = getCategoryColumn();
    return catCol ? Array.from(new Set(data.map(r => r[catCol]).filter(Boolean))) : [];
  }, [data, columns]);

  const filteredAndSortedData = useMemo(() => {
    const sevCol = getSeverityColumn();
    const catCol = getCategoryColumn();

    let filtered = data.filter(record => {
      const matchesSearch = searchQuery === '' || 
        Object.values(record).some(value => 
          value && value.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesSeverity = severityFilter === 'all' || (sevCol && record[sevCol] === severityFilter);
      const matchesCategory = categoryFilter === 'all' || (catCol && record[catCol] === categoryFilter);

      return matchesSearch && matchesSeverity && matchesCategory;
    });

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField] || '';
        const bVal = b[sortField] || '';
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchQuery, severityFilter, categoryFilter, sortField, sortDirection, columns]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => 
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') setSortField(null);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-4 h-4" />;
    return <ArrowDown className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const lower = severity.toLowerCase();
    if (lower.includes('critical')) return 'destructive';
    if (lower.includes('high')) return 'warning'; 
    if (lower.includes('medium')) return 'secondary';
    if (lower.includes('low') || lower.includes('info')) return 'success';
    return 'secondary';
  };

  const severityColumn = getSeverityColumn();

  return (
    <div className="space-y-6">
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {severityColumn && (
          <SeverityChart data={filteredAndSortedData} severityColumn={severityColumn} />
        )}
        <PathTreeChart data={filteredAndSortedData} />
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search across all fields..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Filter by Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {uniqueSeverities.map(sev => (
                <SelectItem key={sev} value={sev}>{sev}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full lg:w-[200px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedData.length} of {data.length} records
        </div>
      </Card>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                {columns.map(column => (
                  <th key={column} className="px-4 py-3 text-left">
                    <button
                      onClick={() => handleSort(column)}
                      className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                    >
                      {column} {getSortIcon(column)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedData.map((record, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  {columns.map(column => {
                    const value = record[column] || '';
                    const columnLower = column.toLowerCase();
                    
                    // Apply special formatting for known column types
                    if (columnLower.includes('severity') && value) {
                      return (
                        <td key={column} className="px-4 py-3">
                          <Badge variant={getSeverityColor(value) as any}>
                            {value}
                          </Badge>
                        </td>
                      );
                    }
                    
                    if (columnLower.includes('category') && value) {
                      return (
                        <td key={column} className="px-4 py-3">
                          <Badge variant="outline">{value}</Badge>
                        </td>
                      );
                    }
                    
                    if ((columnLower.includes('link') || columnLower.includes('url')) && value) {
                      return (
                        <td key={column} className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="gap-2"
                          >
                            <a href={value} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </td>
                      );
                    }
                    
                    if (columnLower.includes('date') || columnLower.includes('created') && value) {
                      return (
                        <td key={column} className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {value}
                          </div>
                        </td>
                      );
                    }
                    
                    if (columnLower.includes('author') && value) {
                      return (
                        <td key={column} className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {value}
                          </div>
                        </td>
                      );
                    }
                    
                    if (columnLower.includes('tag') && value) {
                      return (
                        <td key={column} className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {value.split(',').slice(0, 2).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {tag.trim()}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      );
                    }

                    // Default rendering
                    return (
                      <td key={column} className="px-4 py-3 max-w-xs">
                        <div className="text-sm truncate" title={value}>
                          {value}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredAndSortedData.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No records found matching your filters
        </div>
      )}
    </div>
  );
};
