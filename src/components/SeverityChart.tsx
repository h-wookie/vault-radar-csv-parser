import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CSVData } from '@/types/csvData';
import { Card } from '@/components/ui/card';

interface SeverityChartProps {
  data: CSVData;
  severityColumn: string;
}

// Colorblind-friendly colors (Paul Tol's palette)
const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EE6677',  // Red
  high: '#CCBB44',      // Yellow  
  medium: '#4477AA',    // Blue
  low: '#228833',       // Green
  info: '#66CCEE',      // Cyan
};

export const SeverityChart = ({ data, severityColumn }: SeverityChartProps) => {
  const chartData = useMemo(() => {
    if (!severityColumn || data.length === 0) return [];

    const counts: Record<string, number> = {};
    data.forEach(record => {
      const severity = record[severityColumn];
      if (severity) {
        counts[severity] = (counts[severity] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: SEVERITY_COLORS[name.toLowerCase()] || '#BBBBBB',
    }));
  }, [data, severityColumn]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Severity Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="hsl(var(--primary))"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-muted-foreground text-center">
        Total records: {data.length}
      </div>
    </Card>
  );
};
