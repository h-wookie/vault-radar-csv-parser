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

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--destructive))',
  'hsl(var(--secondary))',
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
    
    if (!name || width < 40 || height < 30) return null;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill,
            stroke: 'hsl(var(--background))',
            strokeWidth: 2,
            opacity: 0.9,
          }}
        />
        {width > 60 && height > 40 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 8}
              textAnchor="middle"
              fill="hsl(var(--background))"
              fontSize={12}
              fontWeight="bold"
            >
              {name.length > 20 ? name.substring(0, 20) + '...' : name}
            </text>
            {size && (
              <text
                x={x + width / 2}
                y={y + height / 2 + 10}
                textAnchor="middle"
                fill="hsl(var(--background))"
                fontSize={11}
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
