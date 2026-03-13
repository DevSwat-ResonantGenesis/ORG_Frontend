import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const STEP_COLORS: Record<string, string> = {
  http_request: '#3b82f6',
  llm_completion: '#8b5cf6',
  memory_search: '#06b6d4',
  agent_execute: '#f59e0b',
  send_notification: '#10b981',
  transform_data: '#6366f1',
  condition: '#ef4444',
  delay: '#78716c',
};

const STEP_ICONS: Record<string, string> = {
  http_request: '🌐',
  llm_completion: '🧠',
  memory_search: '🔍',
  agent_execute: '🤖',
  send_notification: '📧',
  transform_data: '🔄',
  condition: '🔀',
  delay: '⏱️',
};

interface StepNodeData {
  label: string;
  stepType: string;
  config: Record<string, any>;
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export const StepNode = memo(({ data, selected }: NodeProps<StepNodeData>) => {
  const color = STEP_COLORS[data.stepType] || '#6366f1';
  const icon = STEP_ICONS[data.stepType] || '⚙️';
  const statusColors: Record<string, string> = {
    pending: '#94a3b8',
    running: '#f59e0b',
    completed: '#10b981',
    failed: '#ef4444',
  };

  return (
    <div
      style={{
        background: '#1e293b',
        border: `2px solid ${selected ? '#e2e8f0' : color}`,
        borderRadius: 10,
        padding: 0,
        minWidth: 180,
        boxShadow: selected
          ? `0 0 12px ${color}40`
          : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'all 0.2s',
      }}
    >
      {/* Top handle */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: '2px solid #0f172a',
        }}
      />

      {/* Header */}
      <div
        style={{
          background: `${color}20`,
          borderBottom: `1px solid ${color}40`,
          padding: '6px 12px',
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span
          style={{
            color: color,
            fontSize: 10,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {data.stepType.replace(/_/g, ' ')}
        </span>
        {data.status && (
          <span
            style={{
              marginLeft: 'auto',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: statusColors[data.status] || '#94a3b8',
            }}
          />
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '8px 12px' }}>
        <div
          style={{
            color: '#e2e8f0',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {data.label}
        </div>
        {data.config?.url && (
          <div style={{ color: '#64748b', fontSize: 11, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
            {data.config.url}
          </div>
        )}
        {data.config?.model && (
          <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>
            {data.config.model}
          </div>
        )}
      </div>

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color,
          width: 10,
          height: 10,
          border: '2px solid #0f172a',
        }}
      />

      {/* Condition: extra handles for true/false branches */}
      {data.stepType === 'condition' && (
        <>
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            style={{
              background: '#10b981',
              width: 8,
              height: 8,
              border: '2px solid #0f172a',
              top: '60%',
            }}
          />
          <Handle
            type="source"
            position={Position.Left}
            id="false"
            style={{
              background: '#ef4444',
              width: 8,
              height: 8,
              border: '2px solid #0f172a',
              top: '60%',
            }}
          />
        </>
      )}
    </div>
  );
});

StepNode.displayName = 'StepNode';

export default StepNode;
