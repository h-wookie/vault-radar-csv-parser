import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { CSVData } from '@/types/csvData';
import { Card } from '@/components/ui/card';

interface PathTreeChartProps {
  data: CSVData;
}

interface TreeNode {
  name: string;
  size?: number;
  children?: TreeNode[];
  fill?: string;
}

// Colorblind-friendly color palette (based on Paul Tol's palette)
const COLORS = [
  '#4477AA', // Blue
  '#EE6677', // Red
  '#228833', // Green
  '#CCBB44', // Yellow
  '#66CCEE', // Cyan
  '#AA3377', // Purple
  '#BBBBBB', // Grey
];

export const PathTreeChart = ({ data }: PathTreeChartProps) => {
  const treeData = useMemo(() => {
    if (data.length === 0) return [];

    // Find relevant columns
    const pathCol = Object.keys(data[0]).find(col => 
      col.toLowerCase().includes('path') && !col.toLowerCase().includes('location')
    ) || '';
    const gitRefCol = Object.keys(data[0]).find(col => 
      col.toLowerCase().includes('git') && col.toLowerCase().includes('reference')
    ) || '';
    const repoCol = Object.keys(data[0]).find(col => 
      col.toLowerCase().includes('repo') && col.toLowerCase().includes('name')
    ) || '';

    // Build hierarchy: git_reference > repo > path
    const hierarchy: Record<string, Record<string, Record<string, number>>> = {};

    data.forEach(record => {
      const gitRef = (gitRefCol && record[gitRefCol]) || 'unknown';
      const repo = (repoCol && record[repoCol]) || 'unknown';
      const path = (pathCol && record[pathCol]) || 'unknown';

      if (!hierarchy[gitRef]) hierarchy[gitRef] = {};
      if (!hierarchy[gitRef][repo]) hierarchy[gitRef][repo] = {};
      hierarchy[gitRef][repo][path] = (hierarchy[gitRef][repo][path] || 0) + 1;
    });

    // Convert to treemap format
    const treeNodes: TreeNode[] = Object.entries(hierarchy).map(([gitRef, repos], gitIndex) => ({
      name: gitRef.split('/').pop() || gitRef,
      children: Object.entries(repos).map(([ repo, paths], repoIndex) => ({
        name: repo,
        children: Object.entries(paths).map(([path, count]) => ({
          name: path,
          size: count,
          fill: COLORS[(gitIndex + repoIndex) % COLORS.length],
        })),
      })),
    }));

    return treeNodes;
  }, [data]);

  if (treeData.length === 0 || data.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-sm">{data.name}</p>
          {data.size && (
            <p className="text-xs text-muted-foreground">
              Findings: {data.size}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomContent = (props: any) => {
    const { x, y, width, height, name, size, fill } = props;
    
    if (!name || width < 50 || height < 35) return null;

    const showText = width > 80 && height > 50;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill,
            stroke: 'hsl(var(--border))',
            strokeWidth: 2,
            opacity: 0.85,
          }}
        />
        {showText && (
          <>
            <rect
              x={x + 4}
              y={y + height / 2 - 18}
              width={width - 8}
              height={36}
              fill="rgba(0, 0, 0, 0.6)"
              rx={4}
            />
            <text
              x={x + width / 2}
              y={y + height / 2 - 4}
              textAnchor="middle"
              fill="#ffffff"
              fontSize={11}
              fontWeight="600"
            >
              {name.length > 15 ? name.substring(0, 15) + '...' : name}
            </text>
            {size && (
              <text
                x={x + width / 2}
                y={y + height / 2 + 11}
                textAnchor="middle"
                fill="#ffffff"
                fontSize={10}
              >
                {size} finding{size !== 1 ? 's' : ''}
              </text>
            )}
          </>
        )}
      </g>
    );
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Findings by Path & Repository</h3>
      <ResponsiveContainer width="100%" height={400}>
        <Treemap
          data={treeData}
          dataKey="size"
          stroke="hsl(var(--background))"
          fill="hsl(var(--primary))"
          content={<CustomContent />}
        >
          <Tooltip content={<CustomTooltip />} />
        </Treemap>
      </ResponsiveContainer>
      <div className="mt-4 text-sm text-muted-foreground">
        Hover over sections to see details. Larger blocks indicate more findings in that location.
      </div>
    </Card>
  );
};
