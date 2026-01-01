import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartProps {
  data: any[];
  height?: number;
}

// Color palette for charts (supports dark/light mode)
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#6B7280',
  purple: '#8B5CF6',
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.success,
  COLORS.warning,
  COLORS.danger,
  COLORS.purple,
  COLORS.info,
];

// Line Chart Component
export const TrendLineChart: React.FC<ChartProps & { dataKey: string; name?: string }> = ({
  data,
  dataKey,
  name = 'Value',
  height = 200,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          stroke="var(--text-tertiary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--text-tertiary)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={COLORS.primary}
          strokeWidth={2}
          dot={{ fill: COLORS.primary, r: 4 }}
          name={name}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Bar Chart Component
export const ComparisonBarChart: React.FC<ChartProps & { dataKey: string; name?: string }> = ({
  data,
  dataKey,
  name = 'Value',
  height = 200,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          stroke="var(--text-tertiary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--text-tertiary)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          }}
        />
        <Legend />
        <Bar dataKey={dataKey} fill={COLORS.primary} name={name} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Pie Chart Component
export const DistributionPieChart: React.FC<ChartProps & { dataKey: string; nameKey: string }> = ({
  data,
  dataKey,
  nameKey,
  height = 200,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey={dataKey}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Multi-line Chart Component
export const MultiLineChart: React.FC<ChartProps & { lines: Array<{ dataKey: string; name: string; color?: string }> }> = ({
  data,
  lines,
  height = 200,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="name"
          stroke="var(--text-tertiary)"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="var(--text-tertiary)"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          }}
        />
        <Legend />
        {lines.map((line, index) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color || CHART_COLORS[index % CHART_COLORS.length]}
            strokeWidth={2}
            dot={{ fill: line.color || CHART_COLORS[index % CHART_COLORS.length], r: 4 }}
            name={line.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

// Risk Distribution Bar Chart
export const RiskBarChart: React.FC<ChartProps & { riskLevels: string[] }> = ({
  data,
  riskLevels,
  height = 200,
}) => {
  const riskColors: Record<string, string> = {
    low: COLORS.success,
    medium: '#FBBF24',
    high: COLORS.warning,
    critical: COLORS.danger,
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis type="number" stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
        <YAxis dataKey="name" type="category" stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={riskColors[entry.name.toLowerCase()] || COLORS.info} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

