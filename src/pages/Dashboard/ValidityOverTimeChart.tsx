import { LineChart as RLineChart, CartesianGrid, Line, Tooltip, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import getChartTheme from '../../theme/getChartTheme';
import type { LineSeriesData } from '../../types';

interface ValidityOverTimeChartProps {
  data: Array<{ date: string; score: number; risk: number }>;
}

const ValidityOverTimeChart = ({ data }: ValidityOverTimeChartProps) => {
  const theme = getChartTheme();
  return (
    <div style={{ 
      background: 'transparent',
      padding: '0',
      width: '100%',
      height: '300px',
    }}>
      <ResponsiveContainer width="100%" height="100%">
      <RLineChart data={data} style={{ background: 'transparent' }}>
        {/* Only horizontal baseline - no grid background */}
        <CartesianGrid 
          stroke={theme.grid} 
          strokeDasharray="3 3" 
          horizontal={true}
          vertical={false}
          strokeOpacity={0.15}
        />
        <XAxis 
          dataKey="date" 
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
        {/* 1px lines with 1px markers */}
        <Line 
          type="monotone" 
          dataKey="score" 
          stroke={theme.linePrimary} 
          strokeWidth={1} 
          dot={{ r: 1, fill: theme.linePrimary }}
          activeDot={{ r: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="risk" 
          stroke={theme.lineSecondary} 
          strokeWidth={1} 
          dot={{ r: 1, fill: theme.lineSecondary }}
          activeDot={{ r: 2 }}
        />
      </RLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ValidityOverTimeChart;
