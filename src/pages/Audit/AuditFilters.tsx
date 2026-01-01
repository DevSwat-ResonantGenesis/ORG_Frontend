import React from 'react';

type AuditFiltersProps = {
  search: string;
  setSearch: (value: string) => void;
  actionFilter: string;
  setActionFilter: (value: string) => void;
};

const AuditFilters = ({ search, setSearch, actionFilter, setActionFilter }: AuditFiltersProps) => {
  return (
    <div
      style={{
        marginTop: '20px',
        marginBottom: '20px',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        background: 'var(--surface)',
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap'
      }}
    >
      <div style={{ flexGrow: 1, minWidth: '220px' }}>
        <label style={{ color: 'var(--text-secondary)' }}>Search</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search user, action, or metadata…"
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)'
          }}
        />
      </div>

      <div style={{ width: '200px' }}>
        <label style={{ color: 'var(--text-secondary)' }}>Action</label>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)'
          }}
        >
          <option value="">All</option>
          <option value="prediction_run">Prediction Run</option>
          <option value="policy_check">Policy Check</option>
          <option value="policy_triggered">Policy Triggered</option>
          <option value="model_update">Model Update</option>
          <option value="anchor_event">Anchor Event</option>
        </select>
      </div>
    </div>
  );
};

export default AuditFilters;
