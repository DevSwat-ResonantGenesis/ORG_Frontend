import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import getChartTheme from '../../theme/getChartTheme';

type Prediction = {
  timestamp?: string;
  created_at?: string;
  entropy: number;
  validity: number;
};

const ComplianceTrendChart = ({ predictions }: { predictions: Prediction[] }) => {
  const theme = getChartTheme();
  const data = (predictions || []).map((p) => ({
    date: (p.timestamp || p.created_at || new Date().toISOString()).split('T')[0],
    risk: p.entropy || 0,
    validity: p.validity || 0
  }));

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px',
        flex: 1
      }}
    >
      <h3 style={{ marginBottom: '10px' }}>Risk &amp; Validity Trend</h3>
      <LineChart width={500} height={300} data={data}>
        <CartesianGrid stroke={theme.grid} />
        <XAxis dataKey="date" stroke={theme.axis} />
        <YAxis stroke={theme.axis} />
        <Tooltip />
        <Line type="monotone" dataKey="risk" stroke={theme.danger} strokeWidth={2} dot={false} />
        <Line
          type="monotone"
          dataKey="validity"
          stroke={theme.linePrimary}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </div>
  );
};

export default ComplianceTrendChart;
