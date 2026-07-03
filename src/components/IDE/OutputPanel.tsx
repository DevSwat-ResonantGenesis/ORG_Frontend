// ============== OUTPUT PANEL ==============
// Multi-channel output panel (Problems, Output, Debug Console)

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import styles from './OutputPanel.module.css';

interface Problem {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  source?: string;
}

interface OutputMessage {
  id: string;
  channel: string;
  content: string;
  timestamp: Date;
  type?: 'info' | 'warn' | 'error';
}

interface DebugMessage {
  id: string;
  content: string;
  timestamp: Date;
  type: 'log' | 'info' | 'warn' | 'error' | 'debug';
}

interface OutputPanelProps {
  problems?: Problem[];
  outputs?: OutputMessage[];
  debugMessages?: DebugMessage[];
  activeChannel?: string;
  channels?: string[];
  onProblemClick?: (problem: Problem) => void;
  onClear?: (tab: string) => void;
  onChannelChange?: (channel: string) => void;
  className?: string;
}

const OutputPanelComponent: React.FC<OutputPanelProps> = ({
  problems = [],
  outputs = [],
  debugMessages = [],
  activeChannel = 'Output',
  channels = ['Output', 'Tasks', 'Extensions'],
  onProblemClick,
  onClear,
  onChannelChange,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'problems' | 'output' | 'debug'>('output');
  const [selectedChannel, setSelectedChannel] = useState(activeChannel);
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const outputRef = useRef<HTMLDivElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [outputs]);

  useEffect(() => {
    if (debugRef.current) {
      debugRef.current.scrollTop = debugRef.current.scrollHeight;
    }
  }, [debugMessages]);

  const handleChannelChange = useCallback((channel: string) => {
    setSelectedChannel(channel);
    onChannelChange?.(channel);
  }, [onChannelChange]);

  const filteredProblems = problems.filter(p => 
    filter === 'all' || p.type === filter
  );

  const channelOutputs = outputs.filter(o => o.channel === selectedChannel);

  const errorCount = problems.filter(p => p.type === 'error').length;
  const warningCount = problems.filter(p => p.type === 'warning').length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      case 'log': return '📝';
      case 'debug': return '🔍';
      default: return '•';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'problems' ? styles.active : ''}`}
            onClick={() => setActiveTab('problems')}
          >
            Problems
            {(errorCount > 0 || warningCount > 0) && (
              <span className={styles.tabBadges}>
                {errorCount > 0 && <span className={styles.errorBadge}>{errorCount}</span>}
                {warningCount > 0 && <span className={styles.warningBadge}>{warningCount}</span>}
              </span>
            )}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'output' ? styles.active : ''}`}
            onClick={() => setActiveTab('output')}
          >
            Output
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'debug' ? styles.active : ''}`}
            onClick={() => setActiveTab('debug')}
          >
            Debug Console
          </button>
        </div>

        <div className={styles.actions}>
          {activeTab === 'problems' && (
            <div className={styles.filters}>
              {(['all', 'error', 'warning', 'info'] as const).map(f => (
                <button
                  key={f}
                  className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'all' ? 'All' : getIcon(f)}
                </button>
              ))}
            </div>
          )}
          {activeTab === 'output' && (
            <select
              className={styles.channelSelect}
              value={selectedChannel}
              onChange={e => handleChannelChange(e.target.value)}
            >
              {channels.map(ch => (
                <option key={ch} value={ch}>{ch}</option>
              ))}
            </select>
          )}
          <button
            className={styles.clearBtn}
            onClick={() => onClear?.(activeTab)}
            title="Clear"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.content}>
        {activeTab === 'problems' && (
          <div className={styles.problemsPanel}>
            {filteredProblems.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>✅</span>
                <p>No problems detected</p>
              </div>
            ) : (
              <div className={styles.problemsList}>
                {filteredProblems.map(problem => (
                  <button
                    key={problem.id}
                    className={`${styles.problemItem} ${styles[problem.type]}`}
                    onClick={() => onProblemClick?.(problem)}
                  >
                    <span className={styles.problemIcon}>{getIcon(problem.type)}</span>
                    <span className={styles.problemMessage}>{problem.message}</span>
                    {problem.file && (
                      <span className={styles.problemLocation}>
                        {problem.file}
                        {problem.line && `:${problem.line}`}
                        {problem.column && `:${problem.column}`}
                      </span>
                    )}
                    {problem.source && (
                      <span className={styles.problemSource}>{problem.source}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'output' && (
          <div className={styles.outputPanel} ref={outputRef}>
            {channelOutputs.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📋</span>
                <p>No output</p>
              </div>
            ) : (
              <div className={styles.outputLog}>
                {channelOutputs.map(output => (
                  <div
                    key={output.id}
                    className={`${styles.outputLine} ${output.type ? styles[output.type] : ''}`}
                  >
                    <span className={styles.outputTime}>[{formatTime(output.timestamp)}]</span>
                    <pre className={styles.outputContent}>{output.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'debug' && (
          <div className={styles.debugPanel} ref={debugRef}>
            {debugMessages.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🐛</span>
                <p>No debug output</p>
              </div>
            ) : (
              <div className={styles.debugLog}>
                {debugMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`${styles.debugLine} ${styles[msg.type]}`}
                  >
                    <span className={styles.debugIcon}>{getIcon(msg.type)}</span>
                    <span className={styles.debugTime}>{formatTime(msg.timestamp)}</span>
                    <pre className={styles.debugContent}>{msg.content}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const OutputPanel = memo(OutputPanelComponent);
export default OutputPanel;
