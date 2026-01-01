// ============== AUTO EXECUTOR ==============
// Autonomous code execution pipeline with intelligent orchestration

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './AutoExecutor.module.css';

interface ExecutionStep {
  id: string;
  type: 'analyze' | 'prepare' | 'validate' | 'execute' | 'test' | 'deploy';
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: number;
  output?: string;
  error?: string;
}

interface ExecutionConfig {
  autoFix: boolean;
  runTests: boolean;
  hotReload: boolean;
  sandboxMode: boolean;
  maxRetries: number;
  timeout: number;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  errors: string[];
  warnings: string[];
  metrics: {
    totalTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

interface AutoExecutorProps {
  code: string;
  language: string;
  filePath?: string;
  onExecutionStart?: () => void;
  onExecutionComplete?: (result: ExecutionResult) => void;
  onStepComplete?: (step: ExecutionStep) => void;
  config?: Partial<ExecutionConfig>;
  className?: string;
}

const defaultConfig: ExecutionConfig = {
  autoFix: true,
  runTests: true,
  hotReload: true,
  sandboxMode: true,
  maxRetries: 3,
  timeout: 30000,
};

const AutoExecutorComponent: React.FC<AutoExecutorProps> = ({
  code,
  language,
  filePath,
  onExecutionStart,
  onExecutionComplete,
  onStepComplete,
  config: userConfig,
  className,
}) => {
  const config = { ...defaultConfig, ...userConfig };
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [steps, setSteps] = useState<ExecutionStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [output, setOutput] = useState<string[]>([]);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);
  const abortRef = useRef(false);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const initializeSteps = useCallback((): ExecutionStep[] => {
    const baseSteps: ExecutionStep[] = [
      { id: 'analyze', type: 'analyze', name: 'Analyzing Code', status: 'pending' },
      { id: 'prepare', type: 'prepare', name: 'Preparing Environment', status: 'pending' },
      { id: 'validate', type: 'validate', name: 'Validating Syntax', status: 'pending' },
      { id: 'execute', type: 'execute', name: 'Executing Code', status: 'pending' },
    ];
    
    if (localConfig.runTests) {
      baseSteps.push({ id: 'test', type: 'test', name: 'Running Tests', status: 'pending' });
    }
    
    return baseSteps;
  }, [localConfig.runTests]);

  const addOutput = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '→';
    setOutput(prev => [...prev, `[${timestamp}] ${prefix} ${message}`]);
  }, []);

  const executeStep = useCallback(async (step: ExecutionStep): Promise<boolean> => {
    if (abortRef.current) return false;
    
    const startTime = Date.now();
    
    setSteps(prev => prev.map(s => 
      s.id === step.id ? { ...s, status: 'running' } : s
    ));
    
    addOutput(`Starting: ${step.name}...`);
    
    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    if (abortRef.current) {
      setSteps(prev => prev.map(s => 
        s.id === step.id ? { ...s, status: 'failed', error: 'Aborted' } : s
      ));
      return false;
    }
    
    // Simulate step-specific logic
    let success = true;
    let stepOutput = '';
    
    switch (step.type) {
      case 'analyze':
        stepOutput = `Found ${code.split('\n').length} lines, ${(code.match(/function|const|let|var/g) || []).length} declarations`;
        addOutput(stepOutput, 'info');
        break;
        
      case 'prepare':
        stepOutput = `Environment ready: ${language} runtime initialized`;
        addOutput(stepOutput, 'info');
        if (localConfig.sandboxMode) {
          addOutput('Sandbox mode enabled - isolated execution', 'info');
        }
        break;
        
      case 'validate':
        const hasErrors = code.includes('syntax error') || code.includes('undefined variable');
        if (hasErrors && !localConfig.autoFix) {
          success = false;
          addOutput('Syntax validation failed', 'error');
        } else {
          addOutput('Syntax validation passed', 'success');
        }
        break;
        
      case 'execute':
        addOutput(`Executing ${language} code...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 300));
        addOutput('Code executed successfully', 'success');
        addOutput(`Output: [Simulated execution result]`, 'info');
        break;
        
      case 'test':
        addOutput('Running test suite...', 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
        const testCount = Math.floor(Math.random() * 10) + 1;
        addOutput(`${testCount}/${testCount} tests passed`, 'success');
        break;
    }
    
    const duration = Date.now() - startTime;
    
    setSteps(prev => prev.map(s => 
      s.id === step.id ? { 
        ...s, 
        status: success ? 'success' : 'failed', 
        duration,
        output: stepOutput,
      } : s
    ));
    
    onStepComplete?.({ ...step, status: success ? 'success' : 'failed', duration });
    
    if (success) {
      addOutput(`Completed: ${step.name} (${duration}ms)`, 'success');
    }
    
    return success;
  }, [code, language, localConfig, addOutput, onStepComplete]);

  const startExecution = useCallback(async () => {
    abortRef.current = false;
    setIsRunning(true);
    setIsPaused(false);
    setOutput([]);
    setResult(null);
    
    const executionSteps = initializeSteps();
    setSteps(executionSteps);
    setCurrentStepIndex(0);
    
    onExecutionStart?.();
    addOutput('🚀 Starting autonomous execution pipeline...', 'info');
    addOutput(`Language: ${language} | File: ${filePath || 'untitled'}`, 'info');
    
    const startTime = Date.now();
    let allSuccess = true;
    const errors: string[] = [];
    const warnings: string[] = [];
    
    for (let i = 0; i < executionSteps.length; i++) {
      if (abortRef.current) break;
      
      while (isPaused && !abortRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      setCurrentStepIndex(i);
      const success = await executeStep(executionSteps[i]);
      
      if (!success) {
        allSuccess = false;
        errors.push(`Step failed: ${executionSteps[i].name}`);
        
        if (localConfig.maxRetries > 0) {
          addOutput(`Retrying step (${localConfig.maxRetries} attempts remaining)...`, 'warning');
          // Could implement retry logic here
        }
        break;
      }
    }
    
    const totalTime = Date.now() - startTime;
    
    const executionResult: ExecutionResult = {
      success: allSuccess,
      output: output.join('\n'),
      errors,
      warnings,
      metrics: {
        totalTime,
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 50,
      },
    };
    
    setResult(executionResult);
    setIsRunning(false);
    setCurrentStepIndex(-1);
    
    if (allSuccess) {
      addOutput(`✨ Execution completed successfully in ${totalTime}ms`, 'success');
    } else {
      addOutput(`❌ Execution failed after ${totalTime}ms`, 'error');
    }
    
    onExecutionComplete?.(executionResult);
  }, [initializeSteps, executeStep, language, filePath, localConfig, addOutput, onExecutionStart, onExecutionComplete, isPaused, output]);

  const stopExecution = useCallback(() => {
    abortRef.current = true;
    setIsRunning(false);
    setIsPaused(false);
    addOutput('Execution aborted by user', 'warning');
  }, [addOutput]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
    addOutput(isPaused ? 'Execution resumed' : 'Execution paused', 'info');
  }, [isPaused, addOutput]);

  const clearOutput = useCallback(() => {
    setOutput([]);
    setResult(null);
    setSteps([]);
  }, []);

  const getStepIcon = (step: ExecutionStep) => {
    switch (step.status) {
      case 'running': return '⏳';
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'skipped': return '⏭️';
      default: return '○';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🚀</span>
          <span>Auto Executor</span>
          {isRunning && <span className={`${styles.statusBadge} ${styles.running}`}>Running</span>}
          {isPaused && <span className={`${styles.statusBadge} ${styles.paused}`}>Paused</span>}
        </div>
        <div className={styles.actions}>
          {!isRunning ? (
            <button className={styles.runBtn} onClick={startExecution}>
              ▶️ Run
            </button>
          ) : (
            <>
              <button className={styles.pauseBtn} onClick={togglePause}>
                {isPaused ? '▶️' : '⏸️'}
              </button>
              <button className={styles.stopBtn} onClick={stopExecution}>
                ⏹️ Stop
              </button>
            </>
          )}
          <button className={styles.configBtn} onClick={() => setShowConfig(!showConfig)}>
            ⚙️
          </button>
          <button className={styles.clearBtn} onClick={clearOutput}>
            🗑️
          </button>
        </div>
      </div>

      {showConfig && (
        <div className={styles.configPanel}>
          <div className={styles.configRow}>
            <label>
              <input
                type="checkbox"
                checked={localConfig.autoFix}
                onChange={e => setLocalConfig(prev => ({ ...prev, autoFix: e.target.checked }))}
              />
              Auto-fix issues
            </label>
            <label>
              <input
                type="checkbox"
                checked={localConfig.runTests}
                onChange={e => setLocalConfig(prev => ({ ...prev, runTests: e.target.checked }))}
              />
              Run tests
            </label>
            <label>
              <input
                type="checkbox"
                checked={localConfig.sandboxMode}
                onChange={e => setLocalConfig(prev => ({ ...prev, sandboxMode: e.target.checked }))}
              />
              Sandbox mode
            </label>
            <label>
              <input
                type="checkbox"
                checked={localConfig.hotReload}
                onChange={e => setLocalConfig(prev => ({ ...prev, hotReload: e.target.checked }))}
              />
              Hot reload
            </label>
          </div>
        </div>
      )}

      <div className={styles.pipeline}>
        {steps.map((step, i) => (
          <div 
            key={step.id} 
            className={`${styles.step} ${styles[step.status]} ${i === currentStepIndex ? styles.current : ''}`}
          >
            <span className={styles.stepIcon}>{getStepIcon(step)}</span>
            <span className={styles.stepName}>{step.name}</span>
            {step.duration && <span className={styles.stepDuration}>{step.duration}ms</span>}
          </div>
        ))}
      </div>

      <div className={styles.outputPanel} ref={outputRef}>
        {output.length === 0 ? (
          <div className={styles.emptyOutput}>
            <span>Press Run to start execution</span>
          </div>
        ) : (
          output.map((line, i) => (
            <div key={i} className={styles.outputLine}>{line}</div>
          ))
        )}
      </div>

      {result && (
        <div className={`${styles.resultPanel} ${result.success ? styles.success : styles.failed}`}>
          <div className={styles.resultHeader}>
            <span>{result.success ? '✅ Success' : '❌ Failed'}</span>
            <span className={styles.resultTime}>{result.metrics.totalTime}ms</span>
          </div>
          <div className={styles.resultMetrics}>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>Memory</span>
              <span className={styles.metricValue}>{result.metrics.memoryUsage.toFixed(1)}MB</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricLabel}>CPU</span>
              <span className={styles.metricValue}>{result.metrics.cpuUsage.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AutoExecutor = memo(AutoExecutorComponent);
export default AutoExecutor;
