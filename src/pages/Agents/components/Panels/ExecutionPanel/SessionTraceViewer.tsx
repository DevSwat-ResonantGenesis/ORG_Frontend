import React, { useState, useEffect, useCallback } from 'react';
import { Icons } from '../../shared/Icons';
import agentOSApi from '../../../services/api';
import styles from './SessionTraceViewer.module.css';

interface TraceStep {
  id: string;
  step_number: number;
  step_type: string;
  reasoning: string | null;
  tool_name: string | null;
  tokens_used: number;
  duration_ms: number | null;
  safety_check_passed: boolean;
  safety_violations: string[] | null;
  required_approval: boolean;
  approval_status: string | null;
  created_at: string | null;
}

interface WaterfallEntry {
  step_number: number;
  step_type: string;
  tool_name: string | null;
  offset_ms: number;
  duration_ms: number;
  tokens: number;
}

interface TraceData {
  session: {
    id: string;
    agent_id: string;
    status: string;
    goal: string | null;
    started_at: string | null;
    completed_at: string | null;
    loop_count: number;
    total_tokens_used: number;
    total_tool_calls: number;
  };
  trace: {
    steps: TraceStep[];
    summary: {
      total_steps: number;
      total_tokens: number;
      total_duration_ms: number;
      tool_call_count: number;
      unique_tools: string[];
      safety_flags: number;
      has_approval_gates: boolean;
    };
  };
  cost: {
    model: string;
    cost_per_1k_tokens: number;
    estimated_cost_usd: number;
  };
  waterfall: WaterfallEntry[];
}

interface SessionTraceViewerProps {
  sessionId: string;
  onClose: () => void;
}

const STEP_TYPE_COLORS: Record<string, string> = {
  think: '#a855f7',
  plan: '#6366f1',
  tool_call: '#0ea5e9',
  observe: '#22c55e',
  respond: '#f59e0b',
};

const SessionTraceViewer: React.FC<SessionTraceViewerProps> = ({ sessionId, onClose }) => {
  const [traceData, setTraceData] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'steps' | 'waterfall' | 'cost'>('steps');

  const loadTrace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await agentOSApi.getSessionTrace(sessionId) as TraceData;
      setTraceData(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load trace data');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    loadTrace();
  }, [loadTrace]);

  if (loading) {
    return (
      <div className={styles.traceViewer}>
        <div className={styles.header}>
          <h3><Icons.Activity /> Session Trace</h3>
          <button className={styles.closeBtn} onClick={onClose}><Icons.XCircle /></button>
        </div>
        <div className={styles.loading}>Loading trace data...</div>
      </div>
    );
  }

  if (error || !traceData) {
    return (
      <div className={styles.traceViewer}>
        <div className={styles.header}>
          <h3><Icons.Activity /> Session Trace</h3>
          <button className={styles.closeBtn} onClick={onClose}><Icons.XCircle /></button>
        </div>
        <div className={styles.error}>
          {error || 'No trace data available'}
          <button onClick={loadTrace}>Retry</button>
        </div>
      </div>
    );
  }

  const { session, trace, cost, waterfall } = traceData;
  const maxOffset = waterfall.length > 0
    ? Math.max(...waterfall.map(w => w.offset_ms + w.duration_ms))
    : 1;

  return (
    <div className={styles.traceViewer}>
      <div className={styles.header}>
        <h3><Icons.Activity /> Session Trace</h3>
        <button className={styles.closeBtn} onClick={onClose}><Icons.XCircle /></button>
      </div>

      {/* Session Summary */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Status</span>
          <span className={`${styles.badge} ${styles[session.status]}`}>{session.status}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Steps</span>
          <span className={styles.value}>{trace.summary.total_steps}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Tokens</span>
          <span className={styles.value}>{trace.summary.total_tokens.toLocaleString()}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Duration</span>
          <span className={styles.value}>{(trace.summary.total_duration_ms / 1000).toFixed(1)}s</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Cost</span>
          <span className={styles.value}>${cost.estimated_cost_usd.toFixed(4)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.label}>Model</span>
          <span className={styles.value}>{cost.model}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabs}>
        {(['steps', 'waterfall', 'cost'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'steps' && <><Icons.List /> Steps</>}
            {tab === 'waterfall' && <><Icons.BarChart /> Waterfall</>}
            {tab === 'cost' && <><Icons.DollarSign /> Cost</>}
          </button>
        ))}
      </div>

      {/* Steps Tab */}
      {activeTab === 'steps' && (
        <div className={styles.stepsList}>
          {trace.steps.map((step: TraceStep) => (
            <div
              key={step.id}
              className={`${styles.step} ${expandedStep === step.id ? styles.expanded : ''}`}
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
            >
              <div className={styles.stepHeader}>
                <span
                  className={styles.stepType}
                  style={{ background: STEP_TYPE_COLORS[step.step_type] || '#64748b' }}
                >
                  {step.step_type}
                </span>
                <span className={styles.stepNum}>#{step.step_number}</span>
                {step.tool_name && <span className={styles.toolName}>{step.tool_name}</span>}
                <span className={styles.stepTokens}>{step.tokens_used} tok</span>
                {step.duration_ms != null && (
                  <span className={styles.stepDuration}>{step.duration_ms}ms</span>
                )}
                {!step.safety_check_passed && (
                  <span className={styles.safetyFlag}><Icons.AlertTriangle /></span>
                )}
              </div>
              {expandedStep === step.id && (
                <div className={styles.stepDetails}>
                  {step.reasoning && (
                    <div className={styles.detailBlock}>
                      <span className={styles.detailLabel}>Reasoning</span>
                      <pre>{step.reasoning}</pre>
                    </div>
                  )}
                  {step.safety_violations && step.safety_violations.length > 0 && (
                    <div className={styles.detailBlock}>
                      <span className={styles.detailLabel}>Safety Violations</span>
                      <ul>{step.safety_violations.map((v, i) => <li key={i}>{v}</li>)}</ul>
                    </div>
                  )}
                  {step.required_approval && (
                    <div className={styles.detailBlock}>
                      <span className={styles.detailLabel}>Approval</span>
                      <span>{step.approval_status || 'pending'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Waterfall Tab */}
      {activeTab === 'waterfall' && (
        <div className={styles.waterfallView}>
          <div className={styles.waterfallHeader}>
            <span>Step</span>
            <span>Type</span>
            <span>Timeline</span>
            <span>Duration</span>
          </div>
          {waterfall.map((entry: WaterfallEntry) => {
            const leftPct = (entry.offset_ms / maxOffset) * 100;
            const widthPct = Math.max((entry.duration_ms / maxOffset) * 100, 1);
            const color = STEP_TYPE_COLORS[entry.step_type] || '#64748b';
            return (
              <div key={entry.step_number} className={styles.waterfallRow}>
                <span className={styles.wfStep}>#{entry.step_number}</span>
                <span className={styles.wfType}>
                  {entry.tool_name || entry.step_type}
                </span>
                <div className={styles.wfBar}>
                  <div
                    className={styles.wfBarFill}
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      background: color,
                    }}
                    title={`${entry.offset_ms}ms + ${entry.duration_ms}ms = ${entry.offset_ms + entry.duration_ms}ms`}
                  />
                </div>
                <span className={styles.wfDuration}>{entry.duration_ms}ms</span>
              </div>
            );
          })}
          <div className={styles.waterfallFooter}>
            Total: {(maxOffset / 1000).toFixed(1)}s
          </div>
        </div>
      )}

      {/* Cost Tab */}
      {activeTab === 'cost' && (
        <div className={styles.costView}>
          <div className={styles.costCard}>
            <h4>Cost Breakdown</h4>
            <div className={styles.costRow}>
              <span>Model</span>
              <span>{cost.model}</span>
            </div>
            <div className={styles.costRow}>
              <span>Rate</span>
              <span>${cost.cost_per_1k_tokens}/1K tokens</span>
            </div>
            <div className={styles.costRow}>
              <span>Total Tokens</span>
              <span>{trace.summary.total_tokens.toLocaleString()}</span>
            </div>
            <div className={`${styles.costRow} ${styles.costTotal}`}>
              <span>Estimated Cost</span>
              <span>${cost.estimated_cost_usd.toFixed(6)}</span>
            </div>
          </div>
          <div className={styles.costCard}>
            <h4>Execution Stats</h4>
            <div className={styles.costRow}>
              <span>Tool Calls</span>
              <span>{trace.summary.tool_call_count}</span>
            </div>
            <div className={styles.costRow}>
              <span>Unique Tools</span>
              <span>{trace.summary.unique_tools.join(', ') || 'None'}</span>
            </div>
            <div className={styles.costRow}>
              <span>Safety Flags</span>
              <span>{trace.summary.safety_flags}</span>
            </div>
            <div className={styles.costRow}>
              <span>Approval Gates</span>
              <span>{trace.summary.has_approval_gates ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { SessionTraceViewer };
export default SessionTraceViewer;
