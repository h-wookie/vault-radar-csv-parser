import { useState, useMemo } from 'react';
import { CSVData, CSVRecord } from '@/types/csvData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, Download, ArrowUpDown, ArrowUp, ArrowDown,
  ExternalLink, Calendar, User, Hash, Tag
} from 'lucide-react';
import { exportToCSV } from '@/utils/csvParser';
import { Card } from '@/components/ui/card';

interface DataTableProps {
  data: CSVData;
}

type SortField = keyof CSVRecord | null;
type SortDirection = 'asc' | 'desc' | null;

export const DataTable = ({ data }: DataTableProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const uniqueSeverities = useMemo(() => 
    Array.from(new Set(data.map(r => r.Severity).filter(Boolean))),
    [data]
  );

  const uniqueCategories = useMemo(() => 
    Array.from(new Set(data.map(r => r.Category).filter(Boolean))),
    [data]
  );

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(record => {
      const matchesSearch = searchQuery === '' || 
        Object.values(record).some(value => 
          value.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesSeverity = severityFilter === 'all' || record.Severity === severityFilter;
      const matchesCategory = categoryFilter === 'all' || record.Category === categoryFilter;

      return matchesSearch && matchesSeverity && matchesCategory;
    });

    if (sortField && sortDirection) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        const comparison = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [data, searchQuery, severityFilter, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: keyof CSVRecord) => {
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

  const getSortIcon = (field: keyof CSVRecord) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="w-4 h-4" />;
    return <ArrowDown className="w-4 h-4" />;
  };

  const getSeverityColor = (severity: string) => {
    const lower = severity.toLowerCase();
    if (lower.includes('critical') || lower.includes('high')) return 'destructive';
    if (lower.includes('medium')) return 'warning';
    if (lower.includes('low')) return 'success';
    return 'secondary';
  };

  return (
    <div className="space-y-6">
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

          <Button
            onClick={() => exportToCSV(filteredAndSortedData, 'filtered-data.csv')}
            variant="outline"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>
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
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('Field name')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Field Name {getSortIcon('Field name')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('Category')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Category {getSortIcon('Category')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('Severity')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Severity {getSortIcon('Severity')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Description</th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('Author')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Author {getSortIcon('Author')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('CreatedAt')}
                    className="flex items-center gap-2 font-semibold text-sm hover:text-primary transition-colors"
                  >
                    Created {getSortIcon('CreatedAt')}
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Tags</th>
                <th className="px-4 py-3 text-left font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredAndSortedData.map((record, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{record["Field name"]}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      {record.Fingerprint.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{record.Category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={getSeverityColor(record.Severity) as any}>
                      {record.Severity}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="text-sm line-clamp-2" title={record.Description}>
                      {record.Description}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {record.Author}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {record.CreatedAt}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {record.Tags.split(',').slice(0, 2).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.trim()}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {record["Deep Link"] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="gap-2"
                      >
                        <a href={record["Deep Link"]} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </td>
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
