import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';
import getChartTheme from '../../theme/getChartTheme';

type Summary = {
  hipaa_violations: number;
  low_validity_count: number;
  risky_predictions: number;
};

const ComplianceRiskDonut = ({ summary }: { summary: Summary }) => {
  if (!summary) return null;

  const theme = getChartTheme();
  const data = [
    { name: 'HIPAA', value: summary.hipaa_violations },
    { name: 'Low Validity', value: summary.low_validity_count },
    { name: 'Risky', value: summary.risky_predictions }
  ];

  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '20px'
      }}
    >
      <h3 style={{ marginBottom: '10px' }}>Risk Breakdown</h3>
      <PieChart width={350} height={300}>
        <Tooltip />
        <Pie data={data} cx="50%" cy="50%" innerRadius={70} outerRadius={120} dataKey="value">
          {data.map((_, idx) => (
            <Cell key={idx} fill={theme.donut[idx % theme.donut.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};

export default ComplianceRiskDonut;
