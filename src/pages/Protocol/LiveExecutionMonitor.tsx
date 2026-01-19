/**
 * Live Execution Monitor Page
 * Real-time visibility into governed AI operations
 * Like Etherscan, but for governed AI behavior
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './ProtocolPages.module.css';

type EventSource = 'user' | 'system' | 'governance' | 'replay';

interface ExecutionEvent {
  id: string;
  timestamp: string;
  agentDsid: string;
  agentName: string;
  actionType: string;
  semanticDomain: string;
  semanticCluster: string;
  governanceResult: 'passed' | 'flagged' | 'blocked' | 'pending';
  trustBefore: string;
  trustAfter: string;
  auditHash: string;
  blockHeight?: number;
  parentEventId?: string;
  eventSource: EventSource;
}

// Simulated event types for demo
const EVENT_TYPES = [
  'analyze_document', 'generate_response', 'execute_workflow', 'coordinate_agents',
  'validate_input', 'process_request', 'update_memory', 'semantic_classification',
  'compliance_check', 'trust_evaluation', 'delegation_request', 'identity_verification'
];

const SEMANTIC_DOMAINS = [
  'finance.accounting', 'finance.risk', 'legal.contracts', 'legal.compliance',
  'healthcare.clinical', 'engineering.code', 'research.analysis', 'operations.workflow'
];

const AGENT_NAMES = [
  'FinanceAnalyst', 'ComplianceBot', 'ResearchAgent', 'CodeReviewer',
  'DataProcessor', 'WorkflowOrchestrator', 'SecurityMonitor', 'AuditTracker'
];

// Event source mapping based on agent type and action
const getEventSource = (agentName: string, actionType: string): EventSource => {
  // User-initiated: actions from user-facing agents
  if (['ResearchAgent', 'FinanceAnalyst'].includes(agentName) && 
      ['analyze_document', 'generate_response', 'process_request'].includes(actionType)) {
    return 'user';
  }
  // Governance-triggered: policy and compliance actions
  if (['ComplianceBot', 'SecurityMonitor'].includes(agentName) || 
      ['compliance_check', 'trust_evaluation', 'identity_verification'].includes(actionType)) {
    return 'governance';
  }
  // Replay/verification: audit and validation actions
  if (['AuditTracker'].includes(agentName) || 
      ['validate_input', 'semantic_classification'].includes(actionType)) {
    return 'replay';
  }
  // System-initiated: background orchestration and processing
  return 'system';
};

const generateRandomEvent = (index: number): ExecutionEvent => {
  const now = new Date();
  now.setSeconds(now.getSeconds() - index * 2);
  const trustTiers = ['T0', 'T1', 'T2', 'T3', 'T4'];
  const trustIdx = Math.floor(Math.random() * 5);
  const governanceResults: ('passed' | 'flagged' | 'blocked' | 'pending')[] = ['passed', 'passed', 'passed', 'passed', 'flagged', 'blocked'];
  
  const agentName = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)];
  const actionType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
  
  return {
    id: `evt_${Date.now()}_${index}`,
    timestamp: now.toISOString(),
    agentDsid: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
    agentName,
    actionType,
    semanticDomain: SEMANTIC_DOMAINS[Math.floor(Math.random() * SEMANTIC_DOMAINS.length)],
    semanticCluster: `cluster_${Math.floor(Math.random() * 50)}`,
    governanceResult: governanceResults[Math.floor(Math.random() * governanceResults.length)],
    trustBefore: trustTiers[trustIdx],
    trustAfter: trustTiers[Math.min(trustIdx + (Math.random() > 0.9 ? 1 : 0), 4)],
    auditHash: `0x${Math.random().toString(16).slice(2, 18)}`,
    blockHeight: 1000000 + Math.floor(Math.random() * 10000),
    parentEventId: Math.random() > 0.3 ? `evt_${Date.now() - 1000}_${index - 1}` : undefined,
    eventSource: getEventSource(agentName, actionType),
  };
};

const LiveExecutionMonitor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<ExecutionEvent[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<ExecutionEvent | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [eventCount, setEventCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('agent') || '');
  const [searchResult, setSearchResult] = useState<ExecutionEvent | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [agentHistory, setAgentHistory] = useState<ExecutionEvent[]>([]);
  const [showAgentHistory, setShowAgentHistory] = useState(false);

  // Copy hash to clipboard
  const copyToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Search by hash and load agent history
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResult(null);
      setAgentHistory([]);
      setShowAgentHistory(false);
      return;
    }
    const query = searchQuery.toLowerCase().trim();
    
    // Find all events matching the agent hash/DSID
    const matchingEvents = events.filter(e => 
      e.auditHash.toLowerCase().includes(query) ||
      e.agentDsid.toLowerCase().includes(query) ||
      e.id.toLowerCase().includes(query)
    );
    
    if (matchingEvents.length > 0) {
      setSearchResult(matchingEvents[0]);
      setSelectedEvent(matchingEvents[0]);
      setAgentHistory(matchingEvents);
      setShowAgentHistory(true);
    } else {
      setSearchResult(null);
      setAgentHistory([]);
    }
  }, [searchQuery, events]);

  // Auto-search if agent param is in URL
  useEffect(() => {
    const agentParam = searchParams.get('agent');
    if (agentParam && events.length > 0) {
      setSearchQuery(agentParam);
      // Trigger search after a short delay to ensure events are loaded
      setTimeout(() => handleSearch(), 100);
    }
  }, [searchParams, events.length, handleSearch]);

  // Fetch real execution data from backend
  const fetchRealExecutions = useCallback(async () => {
    try {
      import { ENV } from '../../config/env';
      const apiUrl = ENV.apiUrl;
      const response = await fetch(`${apiUrl}/executions/history?limit=50`);
      if (!response.ok) return;
      const data = await response.json();
      
      // Map backend data to ExecutionEvent format
      const realEvents: ExecutionEvent[] = (data.executions || []).map((e: any, i: number) => ({
        id: e.id || `exec-${i}`,
        timestamp: e.timestamp,
        agentDsid: e.manifest_hash?.slice(0, 16) + '...' || 'unknown',
        agentName: e.agent_name || 'Unknown Agent',
        actionType: 'execute_agent',
        semanticDomain: e.governance_decision || 'general',
        semanticCluster: 'cluster_0',
        governanceResult: e.success ? 'passed' : (e.governance_decision === 'flag' ? 'flagged' : 'blocked'),
        trustBefore: 'T1',
        trustAfter: 'T1',
        auditHash: e.execution_hash || `0x${Math.random().toString(16).slice(2, 18)}`,
        eventSource: 'user' as EventSource,
      }));
      
      setEvents(realEvents);
      setEventCount(realEvents.length);
    } catch (err) {
      console.error('Failed to fetch executions:', err);
    }
  }, []);

  // Initialize with real data
  useEffect(() => {
    fetchRealExecutions();
  }, [fetchRealExecutions]);

  // Poll for updates when live
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchRealExecutions();
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, fetchRealExecutions]);

  const filteredEvents = events.filter(e => {
    // Governance filter
    if (filter !== 'all') {
      if (filter === 'flagged' && e.governanceResult !== 'flagged') return false;
      if (filter === 'blocked' && e.governanceResult !== 'blocked') return false;
    }
    // Source filter
    if (sourceFilter !== 'all' && e.eventSource !== sourceFilter) return false;
    return true;
  });

  const getSourceClass = (source: EventSource) => {
    switch (source) {
      case 'user': return styles.sourceUser;
      case 'system': return styles.sourceSystem;
      case 'governance': return styles.sourceGovernance;
      case 'replay': return styles.sourceReplay;
      default: return '';
    }
  };

  const getSourceLabel = (source: EventSource) => {
    switch (source) {
      case 'user': return 'User';
      case 'system': return 'System';
      case 'governance': return 'Governance';
      case 'replay': return 'Replay';
      default: return source;
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour12: false });
  };

  const getGovernanceClass = (result: string) => {
    switch (result) {
      case 'passed': return styles.govPassed;
      case 'flagged': return styles.govFlagged;
      case 'blocked': return styles.govBlocked;
      default: return styles.govPending;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Search Bar */}
      <div className={styles.searchBar} style={{ 
        display: 'flex', 
        gap: '12px', 
        padding: '16px 24px', 
        background: 'var(--bg-secondary)', 
        borderRadius: '8px',
        marginBottom: '16px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Search by hash, DSID, or event ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1,
            padding: '12px 16px',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontSize: '14px',
            color: 'var(--text-primary)',
            fontFamily: 'monospace',
          }}
        />
        <button
          onClick={handleSearch}
          style={{
            padding: '12px 24px',
            background: 'var(--color-primary-600)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          🔍 Search
        </button>
        {searchResult === null && searchQuery && (
          <span style={{ color: 'var(--color-warning-600)', fontSize: '14px' }}>No results found</span>
        )}
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setSearchResult(null); setAgentHistory([]); setShowAgentHistory(false); }}
            style={{
              padding: '8px 16px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Agent History Dropdown */}
      {showAgentHistory && agentHistory.length > 0 && (
        <div style={{
          padding: '16px 24px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          marginBottom: '16px',
          border: '1px solid var(--color-primary-300)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>
              Agent Action History ({agentHistory.length} events)
            </h3>
            <button
              onClick={() => setShowAgentHistory(false)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                fontSize: '18px',
              }}
            >
              ×
            </button>
          </div>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {agentHistory.map((event, idx) => (
              <div
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  background: selectedEvent?.id === event.id ? 'var(--color-primary-100)' : 'var(--bg-primary)',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {formatTime(event.timestamp)}
                </span>
                <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{event.actionType}</span>
                <span className={`${styles.govBadge} ${getGovernanceClass(event.governanceResult)}`} style={{ fontSize: '11px' }}>
                  {event.governanceResult.toUpperCase()}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'monospace', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  {event.auditHash.slice(0, 12)}...
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Status Bar */}
      <div className={styles.liveStatusBar}>
        <div className={styles.liveIndicator}>
          <span className={`${styles.liveDot} ${isLive ? styles.liveDotActive : ''}`}>●</span>
          <span>{isLive ? 'LIVE' : 'PAUSED'}</span>
        </div>
        <div className={styles.eventStats}>
          <span className={styles.statItem}>Events: <strong>{eventCount.toLocaleString()}</strong></span>
          <span className={styles.statItem}>Passed: <strong>{events.filter(e => e.governanceResult === 'passed').length}</strong></span>
          <span className={styles.statItem}>Flagged: <strong className={styles.flaggedCount}>{events.filter(e => e.governanceResult === 'flagged').length}</strong></span>
          <span className={styles.statItem}>Blocked: <strong className={styles.blockedCount}>{events.filter(e => e.governanceResult === 'blocked').length}</strong></span>
        </div>
        <div className={styles.liveControls}>
          <select 
            value={sourceFilter} 
            onChange={(e) => setSourceFilter(e.target.value)}
            className={styles.filterSelect}
            title="Filter by event source"
          >
            <option value="all">All Sources</option>
            <option value="user">User-Initiated</option>
            <option value="system">System-Initiated</option>
            <option value="governance">Governance-Triggered</option>
            <option value="replay">Replay / Verification</option>
          </select>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className={styles.filterSelect}
            title="Filter by governance result"
          >
            <option value="all">All Results</option>
            <option value="flagged">Flagged Only</option>
            <option value="blocked">Blocked Only</option>
          </select>
          <button 
            className={`${styles.liveToggle} ${isLive ? styles.liveToggleActive : ''}`}
            onClick={() => setIsLive(!isLive)}
          >
            {isLive ? '⏸ Pause' : '▶ Resume'}
          </button>
        </div>
      </div>

      {/* Event Stream Table */}
      <section className={styles.section}>
        <div className={styles.eventTableContainer}>
          <table className={styles.eventTable}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Source</th>
                <th>Agent</th>
                <th>Action</th>
                <th>Semantic</th>
                <th>Governance</th>
                <th>Trust</th>
                <th>Audit</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event, idx) => (
                <tr 
                  key={event.id} 
                  className={`${styles.eventRow} ${idx === 0 && isLive ? styles.eventRowNew : ''}`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <td className={styles.timeCell}>{formatTime(event.timestamp)}</td>
                  <td className={styles.sourceCell}>
                    <span className={`${styles.sourceBadge} ${getSourceClass(event.eventSource)}`}>
                      {getSourceLabel(event.eventSource)}
                    </span>
                  </td>
                  <td className={styles.agentCell}>
                    <span className={styles.agentName}>{event.agentName}</span>
                    <span className={styles.agentDsid}>{event.agentDsid}</span>
                  </td>
                  <td className={styles.actionCell}>{event.actionType}</td>
                  <td className={styles.semanticCell}>
                    <span className={styles.semanticDomain}>{event.semanticDomain}</span>
                  </td>
                  <td className={styles.governanceCell}>
                    <span className={`${styles.govBadge} ${getGovernanceClass(event.governanceResult)}`}>
                      {event.governanceResult.toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.trustCell}>
                    <span className={styles.trustChange}>
                      {event.trustBefore} → {event.trustAfter}
                    </span>
                  </td>
                  <td className={styles.auditCell}>
                    <span 
                      className={styles.auditHash} 
                      style={{ 
                        cursor: 'pointer', 
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        background: copiedHash === event.auditHash ? 'var(--color-success-100)' : 'transparent',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                      }}
                      onClick={(e) => { e.stopPropagation(); copyToClipboard(event.auditHash); }}
                      title="Click to copy full hash"
                    >
                      {copiedHash === event.auditHash ? '✓ Copied!' : event.auditHash}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className={styles.eventModal} onClick={() => setSelectedEvent(null)}>
          <div className={styles.eventModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedEvent(null)}>×</button>
            <h3>Execution Event Details</h3>
            
            <div className={styles.eventDetailGrid}>
              <div className={styles.detailSection}>
                <h4>Identity</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>DSID</span>
                  <span className={styles.detailValue}>{selectedEvent.agentDsid}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Agent Name</span>
                  <span className={styles.detailValue}>{selectedEvent.agentName}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Trust Tier</span>
                  <span className={styles.detailValue}>{selectedEvent.trustAfter}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Event Source</span>
                  <span className={`${styles.sourceBadge} ${getSourceClass(selectedEvent.eventSource)}`}>
                    {getSourceLabel(selectedEvent.eventSource)}
                  </span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Action</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Type</span>
                  <span className={styles.detailValue}>{selectedEvent.actionType}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Timestamp</span>
                  <span className={styles.detailValue}>{new Date(selectedEvent.timestamp).toLocaleString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Inputs</span>
                  <span className={styles.detailValue}>[hashed]</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Governance</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Result</span>
                  <span className={`${styles.govBadge} ${getGovernanceClass(selectedEvent.governanceResult)}`}>
                    {selectedEvent.governanceResult.toUpperCase()}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Policies Evaluated</span>
                  <span className={styles.detailValue}>3 policies</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Reason Code</span>
                  <span className={styles.detailValue}>{selectedEvent.governanceResult === 'passed' ? 'N/A' : 'GOV-001'}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Semantic</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Domain</span>
                  <span className={styles.detailValue}>{selectedEvent.semanticDomain}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Cluster</span>
                  <span className={styles.detailValue}>{selectedEvent.semanticCluster}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Drift Status</span>
                  <span className={styles.detailValue}>Within bounds</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Audit</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Event Hash</span>
                  <span className={styles.detailValue + ' ' + styles.mono}>{selectedEvent.auditHash}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Block Height</span>
                  <span className={styles.detailValue}>{selectedEvent.blockHeight?.toLocaleString()}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Parent Event</span>
                  <span className={styles.detailValue + ' ' + styles.mono}>{selectedEvent.parentEventId || 'Genesis'}</span>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4>Replay</h4>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Status</span>
                  <span className={styles.detailValue}>Deterministic ✓</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Causality Chain</span>
                  <span className={styles.detailValue}>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Section */}
      <section className={styles.section}>
        <h2>How This Differs from Traditional Block Explorers</h2>
        <div className={styles.comparisonTable}>
          <table className={styles.compareTable}>
            <thead>
              <tr>
                <th>Traditional Blockchain</th>
                <th>DSID-P Live Monitor</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tracks payments</td>
                <td>Tracks AI actions</td>
              </tr>
              <tr>
                <td>Shows value transfer</td>
                <td>Shows decision execution</td>
              </tr>
              <tr>
                <td>No policy context</td>
                <td>Full governance evaluation</td>
              </tr>
              <tr>
                <td>No replay of logic</td>
                <td>Deterministic execution replay</td>
              </tr>
              <tr>
                <td>No compliance layer</td>
                <td>Built-in regulatory mapping</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={styles.comparisonNote}>
          This monitor answers: <strong>"What did the system do, and was it allowed to do it?"</strong>
        </p>
      </section>

      {/* Help Modal */}
      {showHelp && (
        <div className={styles.helpModal} onClick={() => setShowHelp(false)}>
          <div className={styles.helpModalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setShowHelp(false)}>×</button>
            
            <h2>What is this page?</h2>
            <p className={styles.helpIntro}>
              This is a <strong>read-only, real-time execution ledger</strong> for your DSID-P blockchain.
              It records every AI action as an immutable event. Comparable to an Ethereum block explorer, but for AI execution, not money.
            </p>

            <div className={styles.helpScrollContent}>
            <div className={styles.helpSection}>
              <h3>What each column means</h3>
              
              <div className={styles.helpColumn}>
                <h4>Time</h4>
                <p>Exact execution timestamp. Ordered, append-only, cannot be altered.</p>
                <span className={styles.helpEquivalent}>≈ Block timestamp on Ethereum</span>
              </div>

              <div className={styles.helpColumn}>
                <h4>Source</h4>
                <p>Who or what initiated the execution:</p>
                <ul>
                  <li><strong>User-Initiated</strong> — triggered by user action (chat, IDE, API)</li>
                  <li><strong>System-Initiated</strong> — background orchestration, heartbeats, processing</li>
                  <li><strong>Governance-Triggered</strong> — policy checks, compliance, trust evaluation</li>
                  <li><strong>Replay / Verification</strong> — audit validation, causality checks</li>
                </ul>
                <span className={styles.helpEquivalent}>Events run even when no UI is open — this is correct behavior</span>
              </div>

              <div className={styles.helpColumn}>
                <h4>Agent</h4>
                <p>The persistent agent identity (DSID). Cryptographically bound. Survives restarts, redeployments, upgrades.</p>
                <span className={styles.helpEquivalent}>≈ Wallet address on Ethereum — but for agents</span>
              </div>

              <div className={styles.helpColumn}>
                <h4>Action</h4>
                <p>The operation attempted (e.g., generate_response, update_memory, execute_workflow). This is behavior, not intent.</p>
                <span className={styles.helpEquivalent}>≈ Transaction type</span>
              </div>

              <div className={styles.helpColumn}>
                <h4>Semantic</h4>
                <p>The semantic domain classification applied at execution time (e.g., healthcare.clinical, finance.risk). Determines which rules apply.</p>
                <span className={styles.helpEquivalent}>This does not exist on traditional blockchains</span>
              </div>

              <div className={styles.helpColumn}>
                <h4>Governance</h4>
                <p>Result of policy evaluation:</p>
                <ul>
                  <li><strong>PASSED</strong> — action allowed</li>
                  <li><strong>FLAGGED</strong> — action recorded but restricted</li>
                  <li><strong>BLOCKED</strong> — action denied and halted</li>
                </ul>
                <span className={styles.helpEquivalent}>On-chain governance enforcement, not logging</span>
              </div>

              <div className={styles.helpColumn}>
                <h4>Trust</h4>
                <p>Trust tier before → after execution (T0-T4). Trust is earned, decayed, or penalized automatically.</p>
                <span className={styles.helpEquivalent}>Ethereum does not have this</span>
              </div>

              <div className={styles.helpColumn}>
                <h4>Audit</h4>
                <p>Cryptographic audit hash. Immutable reference. Verifiable proof of who acted, what rule applied, why it was allowed or blocked.</p>
                <span className={styles.helpEquivalent}>Legal-grade evidence, not logs</span>
              </div>
            </div>

            <div className={styles.helpSection}>
              <h3>What this page is NOT</h3>
              <ul className={styles.helpNotList}>
                <li>❌ Not a control interface</li>
                <li>❌ Not a workflow executor</li>
                <li>❌ Not editable</li>
                <li>❌ Not a debug console</li>
              </ul>
              <p>All mutations occur only through restricted Control Plane workflows with explicit authorization.</p>
            </div>

            <div className={styles.helpSection}>
              <h3>What problem this solves</h3>
              <table className={styles.helpProblemTable}>
                <tbody>
                  <tr><td>AI accountability</td><td>✅</td></tr>
                  <tr><td>Regulatory audit</td><td>✅</td></tr>
                  <tr><td>Post-incident reconstruction</td><td>✅</td></tr>
                  <tr><td>Trust scoring</td><td>✅</td></tr>
                  <tr><td>Governance enforcement</td><td>✅</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.helpSection}>
              <h3>Who uses this page</h3>
              <div className={styles.helpUsers}>
                <div>
                  <h4>Humans</h4>
                  <ul>
                    <li>Auditors</li>
                    <li>Compliance officers</li>
                    <li>Security teams</li>
                    <li>Enterprise operators</li>
                    <li>Regulators (read-only)</li>
                  </ul>
                </div>
                <div>
                  <h4>Systems</h4>
                  <ul>
                    <li>Incident response</li>
                    <li>Replay & reconstruction engines</li>
                    <li>Compliance export pipelines</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.helpFooter}>
              <p>This page is the <strong>proof layer</strong> of your platform. If everything else is questioned, this page still stands, the data still verifies, the chain still reconstructs.</p>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveExecutionMonitor;
