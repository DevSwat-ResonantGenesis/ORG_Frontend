import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
import { Button } from '../../components/ui';
import { getSession } from '../../utils/auth';
import { isAuthenticated } from '../../utils/auth-cookies';
// Predictions/Evidence services removed — inline stubs
type Prediction = { id: string; [key: string]: any };
type EvidenceNode = { id: string; label: string; type: string; [key: string]: any };
type EvidenceEdge = { source: string; target: string; [key: string]: any };
const createPrediction = async (..._args: any[]): Promise<Prediction> => ({ id: 'stub' });
const fetchEvidenceGraph = async (_id: string): Promise<{ nodes: EvidenceNode[]; edges: EvidenceEdge[] }> => ({ nodes: [], edges: [] });
import { createAIAuditLog } from '../../api/aiAudit';
import { getMemoryAnchors } from '../../api/resonantChat';import { goToSignup } from '../../utils/navigation';

import styles from './ValidationToolPageFull-2025.module.css';


// Types
interface ValidationResult {
  validity: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  detected_issues: string[];
  confidence: number;
  summary: string;
}

interface EvidenceGraphData {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

const ValidationToolPageFull: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const isLoggedIn = isAuthenticated();
  
  // State
  const [text, setText] = useState('');
  const [context, setContext] = useState('');
  const [batchInputs, setBatchInputs] = useState<string[]>(['']);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  
  // AI API Connection State
  const [useAIConnection, setUseAIConnection] = useState(false);
  const [aiProvider, setAiProvider] = useState<'openai' | 'anthropic' | 'custom'>('openai');
  const [apiKey, setApiKey] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [fetchingAI, setFetchingAI] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [evidenceGraph, setEvidenceGraph] = useState<EvidenceGraphData | null>(null);
  const [evidenceHash, setEvidenceHash] = useState<string | null>(null);
  const [matchedAnchors, setMatchedAnchors] = useState<string[]>([]);
  const [historicalValidations, setHistoricalValidations] = useState<ValidationResult[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const batchResultsRef = useRef<Map<number, ValidationResult>>(new Map());
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Load historical validations
  useEffect(() => {
    const stored = localStorage.getItem('validation_tool_history');
    if (stored) {
      try {
        setHistoricalValidations(JSON.parse(stored));
      } catch (e) {
        logger.error('Failed to load validation history', e);
      }
    }
  }, []);

  // Rate limit countdown
  useEffect(() => {
    if (rateLimitCountdown > 0) {
      const timer = setTimeout(() => setRateLimitCountdown(rateLimitCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [rateLimitCountdown]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  // Fetch text from AI API
  const fetchFromAI = async (): Promise<string> => {
    if (!apiKey.trim()) {
      throw new Error('API key is required');
    }
    if (!aiPrompt.trim()) {
      throw new Error('Prompt is required');
    }

    setFetchingAI(true);
    try {
      let response;
      
      if (aiProvider === 'openai') {
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: aiPrompt.trim() }],
            max_tokens: 1000,
          }),
        });
      } else if (aiProvider === 'anthropic') {
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey.trim(),
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 1000,
            messages: [{ role: 'user', content: aiPrompt.trim() }],
          }),
        });
      } else {
        // Custom API endpoint
        response = await fetch(apiKey.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: aiPrompt.trim() }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
        throw new Error(errorData.error?.message || errorData.detail || 'Failed to fetch from AI API');
      }

      const data = await response.json();
      
      if (aiProvider === 'openai') {
        return data.choices?.[0]?.message?.content || '';
      } else if (aiProvider === 'anthropic') {
        return data.content?.[0]?.text || '';
      } else {
        return data.text || data.response || data.content || JSON.stringify(data);
      }
    } finally {
      setFetchingAI(false);
    }
  };

  // Main validation function
  const handleValidate = async (inputText?: string, index?: number) => {
    let textToValidate = inputText || text.trim();
    
    // If using AI connection, fetch text first
    if (useAIConnection && !inputText) {
      try {
        textToValidate = await fetchFromAI();
        if (!textToValidate || textToValidate.length < 10) {
          setError('AI API returned insufficient text. Please try a different prompt.');
          return;
        }
        setText(textToValidate); // Update the text field with AI response
      } catch (err: any) {
        setError(err.message || 'Failed to fetch from AI API');
        return;
      }
    }
    
    if (!textToValidate || textToValidate.length < 10) {
      setError('Please enter at least 10 characters of text to validate.');
      return;
    }

    setLoading(true);
    setError(null);
    setRateLimitError(false);
    setResult(null);
    setPrediction(null);
    setEvidenceGraph(null);
    setEvidenceHash(null);
    setMatchedAnchors([]);
    setStreamingProgress(0);

    try {
      const { getApiUrl } = await import('@/utils/apiUrl');
      const apiUrl = getApiUrl();
      
      // Simulate streaming progress
      const progressInterval = setInterval(() => {
        setStreamingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Step 1: Validation
      const response = await fetch(`${apiUrl}/public/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToValidate,
          context: context.trim() || undefined,
        }),
      });

      if (response.status === 429) {
        setRateLimitError(true);
        setRateLimitCountdown(60);
        setError('Rate limit exceeded. Please wait a minute before trying again.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Validation failed' }));
        let errorMessage = errorData.detail || 'Validation failed. Please try again.';
        
        if (response.status === 404) {
          errorMessage = 'Validation service is not available. The endpoint may not be configured on the server.';
        } else if (response.status === 500) {
          errorMessage = 'Server error during validation. Please try again later or contact support.';
        } else if (response.status === 503) {
          errorMessage = 'Validation service is temporarily unavailable. Please try again later.';
        }
        
        setError(errorMessage);
        return;
      }

      const data: ValidationResult = await response.json();
      setStreamingProgress(100);
      clearInterval(progressInterval);
      
      // Store in batch results if batch mode
      if (isBatchMode && index !== undefined) {
        batchResultsRef.current.set(index, data);
      } else {
        setResult(data);
        
        // Save to history
        const updated = [data, ...historicalValidations].slice(0, 10);
        setHistoricalValidations(updated);
        localStorage.setItem('validation_tool_history', JSON.stringify(updated));
      }

      // Step 2: Create Prediction (if logged in)
      if (isLoggedIn && session?.token) {
        try {
          const predictionData = await createPrediction(textToValidate, {
            text: textToValidate,
            context: context || undefined,
            validation_result: data,
          });
          
          setPrediction(predictionData);
          
          // Step 3: Fetch Evidence Graph
          if (predictionData.id) {
            try {
              const graphData = await fetchEvidenceGraph(predictionData.id);
              setEvidenceGraph(graphData);
            } catch (e) {
              logger.warn('Failed to fetch evidence graph', { error: e });
            }
          }
          
          // Step 4: Get Memory Anchors
          try {
            const anchors = await getMemoryAnchors();
            if (Array.isArray(anchors)) {
              const matched = anchors
                .filter((a: any) => textToValidate.toLowerCase().includes(a.word?.toLowerCase() || ''))
                .map((a: any) => a.word);
              if (matched.length > 0) {
                setMatchedAnchors(prev => [...new Set([...prev, ...matched])]);
              }
            }
          } catch (e) {
            logger.warn('Failed to fetch anchors', { error: e });
          }
          
          // Step 5: Create Audit Log
          try {
            const auditData = await createAIAuditLog({
              prompt: textToValidate,
              llm_output: textToValidate,
              risk_analysis: {
                validity: data.validity,
                risk_score: data.risk_score,
                risk_level: data.risk_level,
              },
            });
            setEvidenceHash(auditData.evidence_hash);
          } catch (e) {
            logger.warn('Failed to create audit log', { error: e });
          }
          
        } catch (e) {
          logger.warn('Failed to create prediction', { error: e });
        }
      }
      
    } catch (err: any) {
      logger.error('Validation error', err, { component: 'ValidationToolPageFull' });
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (err?.message) {
        if (err.message.includes('Invariant') || err.message.includes('Minified React error')) {
          errorMessage = 'A rendering error occurred. Please refresh the page and try again.';
        } else if (err.message.includes('Network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else {
          errorMessage = err.message;
        }
      } else if (err?.toString) {
        errorMessage = err.toString();
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setStreamingProgress(0);
    }
  };

  // Batch validation handler
  const handleBatchValidate = async () => {
    const validInputs = batchInputs.filter(inp => inp.trim().length >= 10);
    if (validInputs.length === 0) {
      setError('Please enter at least one valid text (10+ characters).');
      return;
    }
    
    batchResultsRef.current.clear();
    for (let i = 0; i < validInputs.length; i++) {
      await handleValidate(validInputs[i], i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  // Utility functions
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getValidityColor = (validity: number) => {
    if (validity >= 0.8) return '#10B981';
    if (validity >= 0.6) return '#F59E0B';
    if (validity >= 0.4) return '#EF4444';
    return '#DC2626';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addBatchInput = () => {
    setBatchInputs([...batchInputs, '']);
  };

  const removeBatchInput = (index: number) => {
    setBatchInputs(batchInputs.filter((_, i) => i !== index));
  };

  const isValid = result && result.validity >= 0.7 && result.risk_level !== 'high' && result.risk_level !== 'critical';

  const getRecommendations = (result: ValidationResult): string[] => {
    const recommendations: string[] = [];
    
    if (result.validity < 0.6) {
      recommendations.push('Review the content for factual accuracy and consistency.');
    }
    
    if (result.risk_level === 'high' || result.risk_level === 'critical') {
      recommendations.push('Address detected issues before using this content in production.');
    }
    
    if (result.detected_issues.length > 0) {
      recommendations.push('Consider additional review for compliance and risk mitigation.');
    }
    
    if (result.confidence < 0.7) {
      recommendations.push('Provide more context to improve validation accuracy.');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Content appears valid. Continue monitoring for changes.');
    }
    
    return recommendations;
  };

  // Render Evidence Graph Visualization
  const renderEvidenceGraph = () => {
    if (!evidenceGraph || evidenceGraph.nodes.length === 0) {
      return (
        <div className={styles.graphPlaceholder}>
          <div className={styles.graphNodePlaceholder}>Input</div>
          <div className={styles.graphArrow}>→</div>
          <div className={styles.graphNodePlaceholder}>Validation</div>
          <div className={styles.graphArrow}>→</div>
          <div className={styles.graphNodePlaceholder}>Result</div>
        </div>
      );
    }

    const nodes = evidenceGraph.nodes.slice(0, 8);
    const edges = evidenceGraph.edges.filter(
      e => nodes.some(n => n.id === e.source || n.id === e.target)
    );

    return (
      <div className={styles.graphVisualization} ref={graphContainerRef}>
        {nodes.map((node, idx) => (
          <div key={node.id} className={`${styles.graphNodeViz} ${styles[`graphNode${node.type.charAt(0).toUpperCase() + node.type.slice(1)}`] || ''}`}>
            <div className={styles.nodeLabel}>{node.label}</div>
            <div className={styles.nodeType}>{node.type}</div>
          </div>
        ))}
        {edges.slice(0, 5).map((edge, idx) => (
          <div key={idx} className={styles.graphEdge} />
        ))}
      </div>
    );
  };

  // Render Historical Comparison Chart
  const renderHistoricalChart = () => {
    if (historicalValidations.length === 0) return null;
    
    const maxValidity = Math.max(...historicalValidations.map(v => v.validity), 0.1);
    
    return (
      <div className={styles.historicalChart}>
        {historicalValidations.slice(0, 5).map((validation, idx) => (
          <div key={idx} className={styles.chartBarContainer}>
            <div className={styles.chartBarLabel}>#{idx + 1}</div>
            <div className={styles.chartBarWrapper}>
              <div 
                className={styles.chartBar}
                style={{ 
                  width: `${(validation.validity / maxValidity) * 100}%`,
                  backgroundColor: getValidityColor(validation.validity)
                }}
              />
            </div>
            <div className={styles.chartBarValue}>{(validation.validity * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.validationToolPageCompact}>
      <div className={styles.validationContainerCompact}>
        {/* Left Column - Input */}
        <div className={styles.validationLeft}>
          <div className={styles.inputSection}>
            <div className={styles.inputHeader}>
              <h2>AI Validation Tool</h2>
              <div className={styles.modeToggle}>
                <button 
                  className={!isBatchMode ? 'active' : ''}
                  onClick={() => setIsBatchMode(false)}
                >
                  Single
                </button>
                <button 
                  className={isBatchMode ? 'active' : ''}
                  onClick={() => setIsBatchMode(true)}
                >
                  Batch
                </button>
              </div>
            </div>

            {/* Capabilities Description - Collapsible */}
            <div className={styles.capabilitiesDescription}>
              <div 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  marginBottom: showCapabilities ? 'var(--space-2)' : 0
                }}
                onClick={() => setShowCapabilities(!showCapabilities)}
              >
                <h3 style={{ margin: 0 }}>About This Tool</h3>
                <span style={{ fontSize: 'var(--font-sm)' }}>
                  {showCapabilities ? '▼' : '▶'}
                </span>
              </div>
              {showCapabilities && (
                <>
                  <p className="tool-description">
                    <strong>General text validation and accuracy checking.</strong> Validates any text content for accuracy, consistency, 
                    and basic compliance.
                  </p>
                  <h4 style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>Capabilities:</h4>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                    <li>✅ Connect to your AI API (OpenAI, Anthropic, or custom)</li>
                    <li>✅ Validate AI-generated content for accuracy and consistency</li>
                    <li>✅ Assess risk levels and detect potential issues</li>
                    <li>✅ Check basic compliance with content standards</li>
                    <li>✅ Provide confidence scores and recommendations</li>
                    <li>✅ Generate evidence verification IDs for audit trails</li>
                  </ul>
                </>
              )}
            </div>

            {/* Input Mode Toggle */}
            <div className={styles.inputModeToggle}>
              <label className={styles.toggleLabel}>Input Mode:</label>
              <div className={styles.modeToggleButtons}>
                <button
                  type="button"
                  className={!useAIConnection ? 'active' : ''}
                  onClick={() => setUseAIConnection(false)}
                  disabled={loading || fetchingAI}
                >
                  Manual Input
                </button>
                <button
                  type="button"
                  className={useAIConnection ? 'active' : ''}
                  onClick={() => setUseAIConnection(true)}
                  disabled={loading || fetchingAI}
                >
                  AI API Connection
                </button>
              </div>
            </div>

            {!isBatchMode ? (
              <>
                {useAIConnection ? (
                  <>
                    {/* AI API Connection Fields */}
                    <div className={styles.inputGroup}>
                      <label>AI Provider <span className={styles.required}>*</span></label>
                      <select
                        className={styles.inputField}
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value as 'openai' | 'anthropic' | 'custom')}
                        disabled={loading || fetchingAI}
                      >
                        <option value="openai">OpenAI (GPT-3.5/GPT-4)</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="custom">Custom API Endpoint</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>
                        {aiProvider === 'custom' ? 'API Endpoint URL' : 'API Key'} <span className={styles.required}>*</span>
                      </label>
                      <input
                        type={aiProvider === 'custom' ? 'url' : 'password'}
                        className={styles.inputField}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder={
                          aiProvider === 'custom'
                            ? 'https://api.example.com/chat'
                            : aiProvider === 'openai'
                            ? 'sk-...'
                            : 'sk-ant-...'
                        }
                        disabled={loading || fetchingAI}
                      />
                      <div className={styles.formHelp}>
                        {aiProvider === 'custom'
                          ? 'Enter your custom API endpoint URL'
                          : 'Your API key is stored locally and never sent to our servers'}
                      </div>
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Prompt <span className={styles.required}>*</span></label>
                      <textarea
                        className={styles.inputTextarea}
                        rows={3}
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Enter your prompt to generate text for validation..."
                        disabled={loading || fetchingAI}
                      />
                    </div>

                    {fetchingAI && (
                      <div className={styles.aiFetching}>
                        <span>🔄 Fetching response from AI API...</span>
                      </div>
                    )}

                    {text && useAIConnection && (
                      <div className={styles.aiResponsePreview}>
                        <label>AI Response (will be validated):</label>
                        <div className={styles.previewText}>{text.substring(0, 200)}{text.length > 200 ? '...' : ''}</div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Manual Input Fields */}
                    <div className={styles.inputGroup}>
                      <label>Text to Validate <span className={styles.required}>*</span></label>
                      <textarea
                        ref={textareaRef}
                        className={styles.inputTextarea}
                        rows={4}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter text to validate (minimum 10 characters)..."
                        disabled={loading || fetchingAI}
                      />
                      <div className={styles.charCount}>{text.length} / 10 min</div>
                    </div>
                  </>
                )}

                <div className={styles.inputGroup}>
                  <label>Context (Optional)</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="e.g., financial statement, legal document, product description"
                    disabled={loading || fetchingAI}
                  />
                </div>
              </>
            ) : (
              <div className={styles.batchInputs}>
                {batchInputs.map((input, idx) => (
                  <div key={idx} className={styles.batchItem}>
                    <label>Text {idx + 1}</label>
                    <textarea
                      className={styles.inputTextarea}
                      rows={3}
                      value={input}
                      onChange={(e) => {
                        const newInputs = [...batchInputs];
                        newInputs[idx] = e.target.value;
                        setBatchInputs(newInputs);
                      }}
                      placeholder={`Text ${idx + 1}...`}
                      disabled={loading}
                    />
                    {batchInputs.length > 1 && (
                      <button className={styles.removeBtn} onClick={() => removeBatchInput(idx)}>×</button>
                    )}
                  </div>
                ))}
                <button className={styles.addBtn} onClick={addBatchInput}>+ Add Text</button>
              </div>
            )}

            {error && <div className={styles.errorMsg}>{error}</div>}
            {rateLimitError && (
              <div className={styles.rateLimitMsg}>
                Rate limit exceeded. Wait {rateLimitCountdown}s
              </div>
            )}

            {loading && streamingProgress > 0 && (
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${streamingProgress}%` }} />
                <span className={styles.progressText}>{streamingProgress}%</span>
              </div>
            )}

            <Button
              size="md"
              onClick={() => isBatchMode ? handleBatchValidate() : handleValidate()}
              disabled={
                loading || 
                fetchingAI || 
                (!isBatchMode && (
                  useAIConnection 
                    ? (!apiKey.trim() || !aiPrompt.trim())
                    : (!text.trim() || text.length < 10)
                ))
              }
              style={{ width: '100%', marginTop: '12px' }}
            >
              {fetchingAI 
                ? 'Fetching from AI...' 
                : loading 
                ? 'Validating...' 
                : isBatchMode 
                ? `Validate ${batchInputs.length} Texts` 
                : useAIConnection
                ? 'Fetch & Validate from AI'
                : 'Validate Text'}
            </Button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className={styles.validationRight}>
          <div className={styles.resultsSection}>
            {/* Validity Overview - Always Visible */}
            {result ? (
              <div className={styles.validityOverview}>
                <div 
                  className={styles.validityBadgeLarge}
                  style={{ backgroundColor: getValidityColor(result.validity) }}
                >
                  <div className={styles.validityLevel}>{isValid ? 'VALID' : 'INVALID'}</div>
                  <div className={styles.validityScore}>{(result.validity * 100).toFixed(1)}%</div>
                </div>
                <div className={styles.validityMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Confidence</span>
                    <span className={styles.metaValue}>{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`${styles.metaItem} ${isValid ? styles.valid : styles.invalid}`}>
                    {isValid ? '✓ Valid' : '⚠ Invalid'}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.validityOverviewPlaceholder}>
                <div className={styles.validityBadgeLargePlaceholder}>
                  <div className={styles.validityLevelPlaceholder}>VALIDITY</div>
                  <div className={styles.validityScorePlaceholder}>0.0%</div>
                </div>
                <div className={styles.validityMetaPlaceholder}>
                  <div className={styles.metaItemPlaceholder}>
                    <span className={styles.metaLabel}>Confidence</span>
                    <span className={styles.metaValue}>0.0%</span>
                  </div>
                  <div className={styles.metaItemPlaceholder}>
                    <span>Waiting for validation...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Metrics Boxes - Always Visible */}
            <div className={styles.validationMetricsGrid}>
              {result ? (
                <>
                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>✓</span>
                      <span className={styles.metricTitle}>Validity</span>
                    </div>
                    <div className={styles.metricScore} style={{ color: getValidityColor(result.validity) }}>
                      {(result.validity * 100).toFixed(1)}%
                    </div>
                    <div className={styles.metricDescription}>
                      Content validity score
                    </div>
                  </div>

                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>⚠️</span>
                      <span className={styles.metricTitle}>Risk Level</span>
                    </div>
                    <div className={styles.metricScore} style={{ color: getRiskColor(result.risk_level) }}>
                      {result.risk_level.toUpperCase()}
                    </div>
                    <div className={styles.metricDescription}>
                      Score: {(result.risk_score * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🎯</span>
                      <span className={styles.metricTitle}>Confidence</span>
                    </div>
                    <div className={styles.metricScore}>
                      {(result.confidence * 100).toFixed(1)}%
                    </div>
                    <div className={styles.metricDescription}>
                      Analysis confidence
                    </div>
                  </div>

                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🔍</span>
                      <span className={styles.metricTitle}>Issues</span>
                    </div>
                    <div className={styles.metricScore}>
                      {result.detected_issues.length}
                    </div>
                    <div className={styles.metricDescription}>
                      Detected issues
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>✓</span>
                      <span className={styles.metricTitle}>Validity</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>0.0%</div>
                    <div className={styles.metricDescriptionPlaceholder}>Waiting...</div>
                  </div>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>⚠️</span>
                      <span className={styles.metricTitle}>Risk Level</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>LOW</div>
                    <div className={styles.metricDescriptionPlaceholder}>Waiting...</div>
                  </div>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🎯</span>
                      <span className={styles.metricTitle}>Confidence</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>0.0%</div>
                    <div className={styles.metricDescriptionPlaceholder}>Waiting...</div>
                  </div>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🔍</span>
                      <span className={styles.metricTitle}>Issues</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>0</div>
                    <div className={styles.metricDescriptionPlaceholder}>Waiting...</div>
                  </div>
                </>
              )}
            </div>

            {/* Summary Section - Always Visible */}
            {result && (
              <div className={styles.summarySection}>
                <label>Validation Summary</label>
                <div className={styles.summaryText}>{result.summary}</div>
              </div>
            )}

            {/* Detected Issues - Only when present */}
            {result && result.detected_issues.length > 0 && (
              <div className={styles.issuesSectionCompact}>
                <label>Detected Issues ({result.detected_issues.length})</label>
                <ul className={styles.issuesListCompact}>
                  {result.detected_issues.map((issue, idx) => (
                    <li key={idx} className={styles.issueItemCompact}>
                      <span className={styles.issueIcon}>⚠️</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* API Integration Panel - Always Visible */}
            <div className={styles.apiIntegrationSection}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>API Integration</label>
                <span className={styles.apiStatusBadge}>Public</span>
              </div>
              <div className={styles.apiDetails}>
                <div className={styles.apiItem}>
                  <span className={styles.apiLabel}>Endpoint:</span>
                  <code className={styles.apiValue}>POST /public/validate</code>
                </div>
                <div className={styles.apiItem}>
                  <span className={styles.apiLabel}>Rate Limit:</span>
                  <span className={styles.apiValue}>10 requests/minute</span>
                </div>
                <div className={styles.apiItem}>
                  <span className={styles.apiLabel}>Auth:</span>
                  <span className={styles.apiValue}>Not required</span>
                </div>
                <div className={styles.apiItem}>
                  <span className={styles.apiLabel}>Request Body:</span>
                  <code className={styles.apiValue}>{"{ text: string, context?: string }"}</code>
                </div>
                <button 
                  className={styles.apiDocsBtn}
                  onClick={() => window.open('/help', '_blank')}
                >
                  View API Docs
                </button>
              </div>
            </div>

            {/* Settings Panel - Always Visible */}
            <div className={styles.settingsSection}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Settings</label>
              </div>
              <div className={styles.settingsContent}>
                <div className={styles.settingItem}>
                  <span className={styles.settingLabel}>Minimum Text Length:</span>
                  <span className={styles.settingValue}>10 characters</span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.settingLabel}>Validation Mode:</span>
                  <span className={styles.settingValue}>{isBatchMode ? 'Batch' : 'Single'}</span>
                </div>
                <div className={styles.settingItem}>
                  <span className={styles.settingLabel}>History Tracking:</span>
                  <span className={styles.settingValue}>{historicalValidations.length > 0 ? 'Enabled' : 'Disabled'}</span>
                </div>
                {isLoggedIn && (
                  <div className={styles.settingItem}>
                    <span className={styles.settingLabel}>Evidence Graph:</span>
                    <span className={styles.settingValue}>{evidenceGraph ? 'Available' : 'Not generated'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Evidence Hash - Always Visible */}
            <div className={styles.hashSection}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Evidence ID</label>
                {!isLoggedIn && (
                  <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                    Sign up to unlock
                  </span>
                )}
              </div>
              <div className={styles.hashValue}>
                <code>{evidenceHash || prediction?.id || 'N/A - Validate to generate'}</code>
                {(evidenceHash || prediction?.id) && (
                  <button onClick={() => copyToClipboard(evidenceHash || prediction?.id || '')}>Copy</button>
                )}
              </div>
              {!isLoggedIn && !evidenceHash && (
                <div className={styles.featureNote}>Available when you sign up</div>
              )}
            </div>

            {/* Context Memory - Always Visible (if logged in) */}
            {isLoggedIn && (
              <div className={styles.anchorsSectionCompact}>
                <div className={styles.sectionHeaderWithBadge}>
                  <label>Context Memory ({matchedAnchors.length || prediction?.anchors?.length || 0})</label>
                </div>
                <div className={styles.anchorsListCompact}>
                  {(matchedAnchors.length > 0 ? matchedAnchors : prediction?.anchors || []).slice(0, 5).map((anchor, idx) => (
                    <span key={idx} className={styles.anchorTagCompact}>{anchor}</span>
                  ))}
                  {matchedAnchors.length === 0 && (!prediction?.anchors || prediction.anchors.length === 0) && (
                    <span className={styles.noAnchors}>No context points detected</span>
                  )}
                </div>
              </div>
            )}

            {/* Evidence Graph - Always Visible (if logged in) */}
            {isLoggedIn && (
              <div className={styles.graphSectionCompact}>
                <div className={styles.sectionHeaderWithBadge}>
                  <label>Evidence Graph Visualization</label>
                </div>
                {renderEvidenceGraph()}
                {!evidenceGraph && (
                  <div className={styles.featureNote}>Available after validation</div>
                )}
              </div>
            )}

            {/* Historical Comparison - Always Visible */}
            <div className={styles.historicalSectionCompact}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Historical Validations</label>
              </div>
              {historicalValidations.length > 0 ? renderHistoricalChart() : (
                <div className={styles.noData}>
                  No validation history yet
                </div>
              )}
            </div>

            {/* Recommendations - Only when available */}
            {result && (
              <div className={styles.recommendationsCompact}>
                <label>Recommendations</label>
                <ul>
                  {getRecommendations(result).map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationToolPageFull;

