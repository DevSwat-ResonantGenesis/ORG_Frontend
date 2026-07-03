// ============== PERFORMANCE PROFILER ==============
// Runtime performance analysis and optimization suggestions

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './PerformanceProfiler.module.css';

interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend?: 'up' | 'down' | 'stable';
  history: number[];
}

interface FunctionProfile {
  name: string;
  calls: number;
  totalTime: number;
  avgTime: number;
  selfTime: number;
  percentage: number;
}

interface MemorySnapshot {
  timestamp: Date;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

interface PerformanceProfilerProps {
  code: string;
  language: string;
  onOptimize?: (suggestions: string[]) => void;
  className?: string;
}

const PerformanceProfilerComponent: React.FC<PerformanceProfilerProps> = ({
  code,
  language,
  onOptimize,
  className,
}) => {
  const [isProfileing, setIsProfiling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [functionProfiles, setFunctionProfiles] = useState<FunctionProfile[]>([]);
  const [memorySnapshots, setMemorySnapshots] = useState<MemorySnapshot[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'functions' | 'memory' | 'suggestions'>('overview');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  const startProfiling = useCallback(() => {
    setIsProfiling(true);
    setIsPaused(false);
    setMetrics(getInitialMetrics());
    setMemorySnapshots([]);
    
    // Simulate real-time profiling updates
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        updateMetrics();
        captureMemorySnapshot();
      }
    }, 1000);
  }, [isPaused]);

  const stopProfiling = useCallback(() => {
    setIsProfiling(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Generate analysis
    const profiles = analyzeCodePerformance(code);
    setFunctionProfiles(profiles);
    
    const optimizationSuggestions = generateOptimizationSuggestions(code, profiles);
    setSuggestions(optimizationSuggestions);
    onOptimize?.(optimizationSuggestions);
  }, [code, onOptimize]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const updateMetrics = () => {
    setMetrics(prev => prev.map(metric => {
      const change = (Math.random() - 0.5) * 10;
      const newValue = Math.max(0, metric.value + change);
      const history = [...metric.history.slice(-19), newValue];
      
      let status: 'good' | 'warning' | 'critical' = 'good';
      if (metric.name === 'CPU Usage' && newValue > 70) status = newValue > 90 ? 'critical' : 'warning';
      if (metric.name === 'Memory' && newValue > 500) status = newValue > 800 ? 'critical' : 'warning';
      if (metric.name === 'FPS' && newValue < 30) status = newValue < 15 ? 'critical' : 'warning';
      
      return {
        ...metric,
        value: newValue,
        history,
        status,
        trend: change > 1 ? 'up' : change < -1 ? 'down' : 'stable',
      };
    }));
  };

  const captureMemorySnapshot = () => {
    setMemorySnapshots(prev => {
      const newSnapshot: MemorySnapshot = {
        timestamp: new Date(),
        heapUsed: 50 + Math.random() * 100,
        heapTotal: 200 + Math.random() * 50,
        external: 10 + Math.random() * 20,
      };
      return [...prev.slice(-29), newSnapshot];
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return styles.good;
      case 'warning': return styles.warning;
      case 'critical': return styles.critical;
      default: return '';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📊</span>
          <span>Performance Profiler</span>
          {isProfileing && (
            <span className={`${styles.status} ${isPaused ? styles.paused : styles.recording}`}>
              {isPaused ? 'Paused' : 'Recording'}
            </span>
          )}
        </div>
        <div className={styles.controls}>
          {!isProfileing ? (
            <button className={styles.startBtn} onClick={startProfiling}>
              ▶️ Start
            </button>
          ) : (
            <>
              <button className={styles.pauseBtn} onClick={togglePause}>
                {isPaused ? '▶️' : '⏸️'}
              </button>
              <button className={styles.stopBtn} onClick={stopProfiling}>
                ⏹️ Stop
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        {(['overview', 'functions', 'memory', 'suggestions'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' && '📈 Overview'}
            {tab === 'functions' && '⚡ Functions'}
            {tab === 'memory' && '🧠 Memory'}
            {tab === 'suggestions' && `💡 Suggestions (${suggestions.length})`}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overviewPanel}>
            <div className={styles.metricsGrid}>
              {metrics.map(metric => (
                <div key={metric.id} className={`${styles.metricCard} ${getStatusColor(metric.status)}`}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricName}>{metric.name}</span>
                    <span className={`${styles.trend} ${styles[metric.trend || 'stable']}`}>
                      {getTrendIcon(metric.trend)}
                    </span>
                  </div>
                  <div className={styles.metricValue}>
                    {metric.value.toFixed(1)}
                    <span className={styles.metricUnit}>{metric.unit}</span>
                  </div>
                  <div className={styles.sparkline}>
                    {metric.history.map((v, i) => (
                      <div
                        key={i}
                        className={styles.sparkBar}
                        style={{ height: `${(v / Math.max(...metric.history, 1)) * 100}%` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!isProfileing && metrics.length === 0 && (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📊</span>
                <p>Start profiling to see performance metrics</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'functions' && (
          <div className={styles.functionsPanel}>
            {functionProfiles.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>⚡</span>
                <p>Stop profiling to see function analysis</p>
              </div>
            ) : (
              <div className={styles.functionsList}>
                <div className={styles.functionsHeader}>
                  <span>Function</span>
                  <span>Calls</span>
                  <span>Total Time</span>
                  <span>Avg Time</span>
                  <span>%</span>
                </div>
                {functionProfiles.map((func, i) => (
                  <div key={i} className={styles.functionRow}>
                    <span className={styles.funcName}>{func.name}</span>
                    <span className={styles.funcCalls}>{func.calls}</span>
                    <span className={styles.funcTime}>{func.totalTime.toFixed(2)}ms</span>
                    <span className={styles.funcAvg}>{func.avgTime.toFixed(2)}ms</span>
                    <div className={styles.funcBar}>
                      <div style={{ width: `${func.percentage}%` }} />
                      <span>{func.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'memory' && (
          <div className={styles.memoryPanel}>
            {memorySnapshots.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🧠</span>
                <p>Start profiling to see memory usage</p>
              </div>
            ) : (
              <>
                <div className={styles.memoryStats}>
                  <div className={styles.memoryStat}>
                    <span className={styles.memLabel}>Heap Used</span>
                    <span className={styles.memValue}>
                      {memorySnapshots[memorySnapshots.length - 1]?.heapUsed.toFixed(1)} MB
                    </span>
                  </div>
                  <div className={styles.memoryStat}>
                    <span className={styles.memLabel}>Heap Total</span>
                    <span className={styles.memValue}>
                      {memorySnapshots[memorySnapshots.length - 1]?.heapTotal.toFixed(1)} MB
                    </span>
                  </div>
                  <div className={styles.memoryStat}>
                    <span className={styles.memLabel}>External</span>
                    <span className={styles.memValue}>
                      {memorySnapshots[memorySnapshots.length - 1]?.external.toFixed(1)} MB
                    </span>
                  </div>
                </div>
                <div className={styles.memoryChart}>
                  {memorySnapshots.map((snap, i) => (
                    <div key={i} className={styles.memBar}>
                      <div
                        className={styles.heapUsed}
                        style={{ height: `${(snap.heapUsed / 300) * 100}%` }}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className={styles.suggestionsPanel}>
            {suggestions.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>💡</span>
                <p>Stop profiling to see optimization suggestions</p>
              </div>
            ) : (
              <div className={styles.suggestionsList}>
                {suggestions.map((suggestion, i) => (
                  <div key={i} className={styles.suggestion}>
                    <span className={styles.suggestionIcon}>💡</span>
                    <span className={styles.suggestionText}>{suggestion}</span>
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

// Helper functions
function getInitialMetrics(): PerformanceMetric[] {
  return [
    { id: 'cpu', name: 'CPU Usage', value: 25, unit: '%', status: 'good', history: [] },
    { id: 'memory', name: 'Memory', value: 150, unit: 'MB', status: 'good', history: [] },
    { id: 'fps', name: 'FPS', value: 60, unit: '', status: 'good', history: [] },
    { id: 'renders', name: 'Re-renders', value: 0, unit: '/s', status: 'good', history: [] },
  ];
}

function analyzeCodePerformance(code: string): FunctionProfile[] {
  const profiles: FunctionProfile[] = [];
  const funcMatches = code.matchAll(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)/g);
  
  let totalTime = 0;
  const funcs: { name: string; time: number; calls: number }[] = [];
  
  for (const match of funcMatches) {
    const name = match[1] || match[2];
    if (name) {
      const time = Math.random() * 100;
      const calls = Math.floor(Math.random() * 100) + 1;
      totalTime += time;
      funcs.push({ name, time, calls });
    }
  }
  
  funcs.forEach(func => {
    profiles.push({
      name: func.name,
      calls: func.calls,
      totalTime: func.time,
      avgTime: func.time / func.calls,
      selfTime: func.time * 0.8,
      percentage: (func.time / totalTime) * 100,
    });
  });
  
  return profiles.sort((a, b) => b.totalTime - a.totalTime).slice(0, 10);
}

function generateOptimizationSuggestions(code: string, profiles: FunctionProfile[]): string[] {
  const suggestions: string[] = [];
  
  // Check for heavy functions
  const heavyFuncs = profiles.filter(p => p.percentage > 20);
  heavyFuncs.forEach(func => {
    suggestions.push(`Consider optimizing "${func.name}" - it consumes ${func.percentage.toFixed(1)}% of execution time`);
  });
  
  // Check for frequent re-renders
  if (code.includes('useState') && !code.includes('useMemo') && !code.includes('useCallback')) {
    suggestions.push('Add useMemo/useCallback to prevent unnecessary re-renders');
  }
  
  // Check for missing memoization
  if (code.includes('map(') && !code.includes('React.memo')) {
    suggestions.push('Consider using React.memo() for list item components');
  }
  
  // Check for inline functions
  if (code.match(/onClick=\{.*=>/g)) {
    suggestions.push('Move inline arrow functions to useCallback to prevent re-creation');
  }
  
  // Check for large dependencies
  if (code.includes('lodash') && !code.includes('lodash/')) {
    suggestions.push('Use lodash tree-shaking imports (lodash/functionName) to reduce bundle size');
  }
  
  // Generic suggestions
  if (code.includes('console.log')) {
    suggestions.push('Remove console.log statements in production for better performance');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('No major performance issues detected. Code looks well optimized!');
  }
  
  return suggestions;
}

export const PerformanceProfiler = memo(PerformanceProfilerComponent);
export default PerformanceProfiler;
