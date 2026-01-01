import React from 'react';
import './businessImpactKPIs.css';

interface BusinessMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon: string;
  color: string;
}

interface BusinessImpactKPIsProps {
  predictionsBlocked?: number;
  violationsPrevented?: number;
  costSavings?: number;
  riskIncidentsAvoided?: number;
}

export const BusinessImpactKPIs: React.FC<BusinessImpactKPIsProps> = ({
  predictionsBlocked = 0,
  violationsPrevented = 0,
  costSavings = 0,
  riskIncidentsAvoided = 0
}) => {
  const metrics: BusinessMetric[] = [
    {
      label: 'Predictions Blocked',
      value: predictionsBlocked,
      trend: 'up',
      trendValue: 'Revenue Protected',
      icon: '',
      color: '#3B82F6'
    },
    {
      label: 'Violations Prevented',
      value: violationsPrevented,
      trend: 'up',
      trendValue: 'Compliance Maintained',
      icon: '',
      color: '#10B981'
    },
    {
      label: 'Risk Incidents Avoided',
      value: riskIncidentsAvoided,
      trend: 'up',
      trendValue: 'Liability Reduced',
      icon: '',
      color: '#F59E0B'
    },
    {
      label: 'Estimated Cost Savings',
      value: `$${costSavings.toLocaleString()}`,
      trend: 'up',
      trendValue: 'Fines & Losses Prevented',
      icon: '',
      color: '#8B5CF6'
    }
  ];

  return (
    <div className="business-impact-kpis">
      <div className="kpis-header">
        <h3 className="kpis-title">Business Impact</h3>
        <p className="kpis-subtitle">Real-time metrics showing the value of AI governance</p>
      </div>

      <div className="kpis-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="kpi-card" style={{ borderTopColor: metric.color }}>
            <div className="kpi-icon" style={{ color: metric.color }}>
              {metric.icon}
            </div>
            <div className="kpi-content">
              <div className="kpi-label">{metric.label}</div>
              <div className="kpi-value" style={{ color: metric.color }}>
                {metric.value}
              </div>
              {metric.trend && (
                <div className={`kpi-trend trend-${metric.trend}`}>
                  <span className="trend-icon">
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                  </span>
                  <span className="trend-text">{metric.trendValue}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

