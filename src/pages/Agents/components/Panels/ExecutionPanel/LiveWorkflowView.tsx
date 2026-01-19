import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icons } from '../../shared/Icons';
import styles from './LiveWorkflowView.module.css';

interface WorkflowStep {
  id: string;
  stepNumber: number;
  action: string;
  reasoning?: string;
  toolInput?: Record<string, any>;
  result?: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  timestamp: string;
}

interface LiveWorkflowViewProps {
  sessionId: string;
  agentId: string;
  agentName: string;
  isActive: boolean;
}

const LiveWorkflowViewComponent: React.FC<LiveWorkflowViewProps> = ({
  sessionId,
  agentId,
  agentName,
  isActive
}) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalTokens, setTotalTokens] = useState<number>(0);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const stepsEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const connectWebSocket = useCallback(() => {
    if (!isActive || !sessionId) return;

    try {
      // Connect to the WebSocket endpoint for real-time updates
      import { ENV } from '../../../../../config/env';
      const wsUrl = `${ENV.wsUrl}/agents/sessions/${sessionId}/stream`;
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        console.log('Connected to agent session stream');
        setIsConnected(true);
        setError(null);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'step_started':
              const newStep: WorkflowStep = {
                id: data.stepId || `step-${Date.now()}`,
                stepNumber: data.stepNumber || steps.length + 1,
                action: data.action || 'Processing...',
                reasoning: data.reasoning,
                toolInput: data.toolInput,
                status: 'running',
                timestamp: new Date().toISOString()
              };
              setSteps(prev => [...prev, newStep]);
              setCurrentStep(data.stepNumber || newStep.stepNumber);
              break;

            case 'step_completed':
              setSteps(prev => prev.map(step => 
                step.id === data.stepId || step.stepNumber === data.stepNumber
                  ? { 
                      ...step, 
                      status: 'completed', 
                      result: data.result,
                      duration: data.duration
                    }
                  : step
              ));
              break;

            case 'step_failed':
              setSteps(prev => prev.map(step => 
                step.id === data.stepId || step.stepNumber === data.stepNumber
                  ? { 
                      ...step, 
                      status: 'failed', 
                      result: data.error || 'Step failed'
                    }
                  : step
              ));
              break;

            case 'tokens_used':
              setTotalTokens(prev => prev + (data.tokens || 0));
              break;

            case 'session_completed':
              setSteps(prev => prev.map(step => 
                step.status === 'running' ? { ...step, status: 'completed' } : step
              ));
              break;

            case 'error':
              setError(data.message || 'An error occurred');
              break;

            default:
              console.log('Unknown message type:', data.type);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from agent session stream');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        if (isActive) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 3000);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error');
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError('Failed to connect to agent session');
    }
  }, [sessionId, isActive, steps.length]);

  useEffect(() => {
    if (isActive && sessionId) {
      connectWebSocket();
      setStartTime(new Date());
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isActive, sessionId, connectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [steps, scrollToBottom]);

  const formatDuration = (start: Date) => {
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getStepIcon = (action: string, status: string) => {
    if (status === 'failed') return <Icons.XCircle className={styles.errorIcon} />;
    if (status === 'completed') return <Icons.CheckCircle className={styles.successIcon} />;
    if (status === 'running') return <Icons.Loader className={styles.loadingIcon} />;
    
    // Action-specific icons
    switch (action?.toLowerCase()) {
      case 'think': return <Icons.Brain className={styles.thinkIcon} />;
      case 'write': return <Icons.FileText className={styles.writeIcon} />;
      case 'search': return <Icons.Search className={styles.searchIcon} />;
      case 'analyze': return <Icons.BarChart className={styles.analyzeIcon} />;
      default: return <Icons.Cog className={styles.defaultIcon} />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'think': return styles.thinkColor;
      case 'write': return styles.writeColor;
      case 'search': return styles.searchColor;
      case 'analyze': return styles.analyzeColor;
      default: return styles.defaultColor;
    }
  };

  if (!isActive) {
    return (
      <div className={styles.inactiveContainer}>
        <div className={styles.inactiveMessage}>
          <Icons.Pause />
          <span>Agent session is inactive</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.liveWorkflowContainer}>
      {/* Header */}
      <div className={styles.workflowHeader}>
        <div className={styles.agentInfo}>
          <div className={styles.agentName}>
            <Icons.Bot />
            {agentName}
          </div>
          <div className={styles.sessionId}>
            Session: #{sessionId.slice(-8)}
          </div>
        </div>
        
        <div className={styles.workflowStats}>
          <div className={styles.stat}>
            <Icons.Clock />
            <span>{formatDuration(startTime)}</span>
          </div>
          <div className={styles.stat}>
            <Icons.Zap />
            <span>{totalTokens} tokens</span>
          </div>
          <div className={styles.stat}>
            <Icons.Activity />
            <span className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`} />
            <span>{isConnected ? 'Live' : 'Reconnecting...'}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          <Icons.AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Workflow Steps */}
      <div className={styles.stepsContainer}>
        <div className={styles.stepsList}>
          {steps.length === 0 ? (
            <div className={styles.emptyState}>
              <Icons.Loader className={styles.spinner} />
              <span>Waiting for agent to start...</span>
            </div>
          ) : (
            steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`${styles.stepItem} ${styles[step.status]} ${getActionColor(step.action)}`}
              >
                <div className={styles.stepHeader}>
                  <div className={styles.stepLeft}>
                    <div className={styles.stepIcon}>
                      {getStepIcon(step.action, step.status)}
                    </div>
                    <div className={styles.stepInfo}>
                      <div className={styles.stepAction}>
                        Step {step.stepNumber}: {step.action || 'Processing'}
                      </div>
                      {step.reasoning && (
                        <div className={styles.stepReasoning}>
                          {step.reasoning}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.stepRight}>
                    <div className={styles.stepTime}>
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </div>
                    {step.duration && (
                      <div className={styles.stepDuration}>
                        {step.duration}ms
                      </div>
                    )}
                  </div>
                </div>

                {/* Step Details */}
                {(step.toolInput || step.result) && (
                  <div className={styles.stepDetails}>
                    {step.toolInput && (
                      <div className={styles.detailSection}>
                        <div className={styles.detailLabel}>Input:</div>
                        <pre className={styles.detailContent}>
                          {JSON.stringify(step.toolInput, null, 2)}
                        </pre>
                      </div>
                    )}
                    {step.result && (
                      <div className={styles.detailSection}>
                        <div className={styles.detailLabel}>Result:</div>
                        <pre className={styles.detailContent}>
                          {typeof step.result === 'string' 
                            ? step.result 
                            : JSON.stringify(step.result, null, 2)
                          }
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={stepsEndRef} />
        </div>
      </div>
    </div>
  );
};

export const LiveWorkflowView = React.memo(LiveWorkflowViewComponent);
