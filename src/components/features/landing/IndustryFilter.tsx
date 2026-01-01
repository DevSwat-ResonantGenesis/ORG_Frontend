import React, { useState } from 'react';
import './industryFilter.css';

export type Industry = 'all' | 'banking' | 'healthcare' | 'legal' | 'fraud' | 'hr';

interface IndustryFilterProps {
  industries: Industry[];
  activeIndustry: Industry;
  onFilterChange: (industry: Industry) => void;
}

const industryConfig: Record<Industry, { label: string; icon: string; color: string }> = {
  all: { label: 'All Industries', icon: '', color: '#6B7280' },
  banking: { label: 'Banking', icon: '', color: '#3B82F6' },
  healthcare: { label: 'Healthcare', icon: '', color: '#10B981' },
  legal: { label: 'Legal', icon: '', color: '#8B5CF6' },
  fraud: { label: 'Fraud Detection', icon: '', color: '#EF4444' },
  hr: { label: 'HR Screening', icon: '', color: '#F59E0B' }
};

export const IndustryFilter: React.FC<IndustryFilterProps> = ({
  industries,
  activeIndustry,
  onFilterChange
}) => {
  return (
    <div className="industry-filter">
      <div className="filter-tags">
        {industries.map((industry) => {
          const config = industryConfig[industry];
          const isActive = activeIndustry === industry;
          
          return (
            <span
              key={industry}
              className={`filter-tag ${isActive ? 'active' : ''}`}
              onClick={() => onFilterChange(industry)}
              style={{
                color: isActive ? config.color : 'var(--text-tertiary)',
                fontWeight: isActive ? 600 : 400
              }}
            >
              {config.label}
            </span>
          );
        })}
      </div>
    </div>
  );
};

