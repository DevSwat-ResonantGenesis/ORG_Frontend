import React from 'react';

interface Props {
  search: string;
  setSearch: (value: string) => void;
  minValidity: number;
  setMinValidity: (value: number) => void;
  maxRisk: number;
  setMaxRisk: (value: number) => void;
}

const PredictionsFilters = ({ search, setSearch, minValidity, setMinValidity, maxRisk, setMaxRisk }: Props) => (
  <div
    style={{
      background: 'var(--surface)',
      padding: '24px',
      borderRadius: '0', // OpenAI style - no rounded corners
      border: '1px solid var(--border)',
      marginBottom: '24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '16px'
    }}
  >
    <div style={{ flexGrow: 1, minWidth: 220 }}>
      <label style={{ 
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        fontWeight: 500
      }}>Search</label>
      <input
        placeholder="Search text..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ 
          width: '100%', 
          padding: '12px 16px', 
          borderRadius: '0', // OpenAI style
          border: '1px solid var(--border)', 
          background: 'var(--bg)', 
          color: 'var(--text-primary)',
          fontSize: '14px',
          transition: 'border-color 0.15s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      />
    </div>
    <div style={{ width: 160 }}>
      <label style={{ 
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        fontWeight: 500
      }}>Minimum Validity</label>
      <input
        type="number"
        step="0.01"
        min="0"
        max="1"
        value={minValidity}
        onChange={(e) => setMinValidity(parseFloat(e.target.value) || 0)}
        style={{ 
          width: '100%', 
          padding: '12px 16px', 
          borderRadius: '0', // OpenAI style
          border: '1px solid var(--border)', 
          background: 'var(--bg)', 
          color: 'var(--text-primary)',
          fontSize: '14px',
          transition: 'border-color 0.15s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      />
    </div>
    <div style={{ width: 160 }}>
      <label style={{ 
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        color: 'var(--text-secondary)',
        fontWeight: 500
      }}>Max Risk</label>
      <input
        type="number"
        step="0.01"
        min="0"
        max="1"
        value={maxRisk}
        onChange={(e) => setMaxRisk(parseFloat(e.target.value) || 1)}
        style={{ 
          width: '100%', 
          padding: '12px 16px', 
          borderRadius: '0', // OpenAI style
          border: '1px solid var(--border)', 
          background: 'var(--bg)', 
          color: 'var(--text-primary)',
          fontSize: '14px',
          transition: 'border-color 0.15s ease'
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--text-primary)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'var(--border)';
        }}
      />
    </div>
  </div>
);

export default PredictionsFilters;
