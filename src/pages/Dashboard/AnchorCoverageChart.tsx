import { BarChart as RBarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import getChartTheme from '../../theme/getChartTheme';
import type { BarSeriesData } from '../../types';

interface AnchorCoverageChartProps {
  data: Array<{ anchor: string; count: number }>;
}

const AnchorCoverageChart = ({ data }: AnchorCoverageChartProps) => {
  const theme = getChartTheme();
  return (
    <div style={{ 
      background: 'transparent',
      padding: '0',
      width: '100%',
      height: '300px',
    }}>
      <ResponsiveContainer width="100%" height="100%">
      <RBarChart data={data} style={{ background: 'transparent' }}>
        {/* Only horizontal baseline */}
        <CartesianGrid 
          stroke={theme.grid} 
          horizontal={true}
          vertical={false}
          strokeOpacity={0.15}
        />
        <XAxis 
          dataKey="anchor" 
          stroke={theme.axis}
          strokeOpacity={0.3}
          tick={{ fill: theme.label, fontSize: 12, fontWeight: 400 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke={theme.axis}
          strokeOpacity={0.3}
          tick={{ fill: theme.label, fontSize: 12, fontWeight: 400 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            background: 'var(--surface-alt)',
            border: '1px solid var(--border)',
            borderRadius: '0',
            padding: '12px',
            fontSize: '12px',
          }}
          labelStyle={{ color: 'var(--text-primary)', fontSize: '12px' }}
        />
        <Bar 
          dataKey="count" 
          fill={theme.barPrimary}
          radius={0}
        />
      </RBarChart>
      </ResponsiveContainer>
      {/* Labels left-aligned (no legend box) */}
      <div style={{ 
        marginTop: '16px',
        fontSize: '12px',
        color: 'var(--text-secondary)',
      }}>
        <span style={{ color: theme.barPrimary }}>●</span> Anchor Coverage
      </div>
    </div>
  );
};

export default AnchorCoverageChart;
