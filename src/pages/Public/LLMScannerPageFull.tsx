import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../../utils/logger';
import { Button } from '../../components/ui';
import { getSession } from '../../utils/auth';
import { isAuthenticated } from '../../utils/auth-cookies';
import { createPrediction, type Prediction } from '../../api/predictions';
import { fetchEvidenceGraph, type EvidenceNode, type EvidenceEdge } from '../../api/evidence';
import { createAIAuditLog } from '../../api/aiAudit';
import { getMemoryAnchors } from '../../api/resonantChat';
import { goToSignup } from '../../utils/navigation';
import styles from './LLMScannerPageFull-2025.module.css';

// Types
interface RiskCategory {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  detected: boolean;
  details: string[];
}

interface LLMScanResult {
  overall_risk_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  hallucination_risk: RiskCategory;
  bias_risk: RiskCategory;
  toxicity_risk: RiskCategory;
  factual_accuracy_risk: RiskCategory;
  privacy_risk: RiskCategory;
  compliance_risk: RiskCategory;
  confidence: number;
  summary: string;
  recommendations: string[];
  detected_issues: string[];
  safe_to_use: boolean;
}

interface ResonanceData {
  resonance_score: number;
  anchor_matches: number;
  matched_anchors: string[];
  cluster_id?: number;
}

interface EvidenceGraphData {
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
}

const LLMScannerPageFull: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const isLoggedIn = isAuthenticated();
  
  // State
  const [llmOutput, setLlmOutput] = useState('');
  const [prompt, setPrompt] = useState('');
  const [modelName, setModelName] = useState('');
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
  const [result, setResult] = useState<LLMScanResult | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [evidenceGraph, setEvidenceGraph] = useState<EvidenceGraphData | null>(null);
  const [resonanceData, setResonanceData] = useState<ResonanceData | null>(null);
  const [evidenceHash, setEvidenceHash] = useState<string | null>(null);
  const [matchedAnchors, setMatchedAnchors] = useState<string[]>([]);
  const [historicalScans, setHistoricalScans] = useState<LLMScanResult[]>([]);
  const [modelStats, setModelStats] = useState<Record<string, any>>({});
  
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(0);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const batchResultsRef = useRef<Map<number, LLMScanResult>>(new Map());
  const graphContainerRef = useRef<HTMLDivElement>(null);

  // Load historical scans
  useEffect(() => {
    const stored = localStorage.getItem('llm_scanner_history');
    if (stored) {
      try {
        setHistoricalScans(JSON.parse(stored));
      } catch (e) {
        logger.error('Failed to load scan history', e);
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
  }, [llmOutput]);

  // Fetch text from AI API
  const fetchFromAI = async (): Promise<string> => {
    if (!isLoggedIn) {
      throw new Error('Please sign up or log in to use AI API connection');
    }
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
        // Custom API - try common response formats
        return data.text || data.response || data.content || JSON.stringify(data);
      }
    } finally {
      setFetchingAI(false);
    }
  };

  // Main scan function
  const handleScan = async (inputText?: string, index?: number) => {
    let textToScan = inputText || llmOutput.trim();
    
    // If using AI connection, fetch text first
    if (useAIConnection && !inputText) {
      if (!isLoggedIn) {
        setError('Please sign up or log in to use AI API connection');
        return;
      }
      try {
        textToScan = await fetchFromAI();
        if (!textToScan || textToScan.length < 10) {
          setError('AI API returned insufficient text. Please try a different prompt.');
          return;
        }
        setLlmOutput(textToScan); // Update the LLM output field with AI response
        setPrompt(aiPrompt); // Update prompt field with AI prompt
      } catch (err: any) {
        setError(err.message || 'Failed to fetch from AI API');
        return;
      }
    }
    
    if (!textToScan || textToScan.length < 10) {
      setError('Please enter at least 10 characters of LLM output to scan.');
      return;
    }

    setLoading(true);
    setError(null);
    setRateLimitError(false);
    setResult(null);
    setPrediction(null);
    setEvidenceGraph(null);
    setResonanceData(null);
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

      // Step 1: LLM Scan
      const scanResponse = await fetch(`${apiUrl}/public/llm-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          llm_output: textToScan,
          prompt: prompt.trim() || undefined,
          model_name: modelName.trim() || undefined,
        }),
      });

      if (scanResponse.status === 429) {
        setRateLimitError(true);
        setRateLimitCountdown(60);
        setError('Rate limit exceeded. Please wait a minute before trying again.');
        return;
      }

      if (!scanResponse.ok) {
        const errorData = await scanResponse.json().catch(() => ({ detail: 'Scan failed' }));
        setError(errorData.detail || 'Scan failed. Please try again.');
        return;
      }

      const scanData: LLMScanResult = await scanResponse.json();
      setStreamingProgress(100);
      clearInterval(progressInterval);
      
      // Store in batch results if batch mode
      if (isBatchMode && index !== undefined) {
        batchResultsRef.current.set(index, scanData);
      } else {
        setResult(scanData);
        
        // Save to history
        const updated = [scanData, ...historicalScans].slice(0, 10);
        setHistoricalScans(updated);
        localStorage.setItem('llm_scanner_history', JSON.stringify(updated));
      }

      // Step 2: Create Prediction (if logged in)
      if (isLoggedIn && session?.token) {
        try {
          const predictionData = await createPrediction(textToScan, {
            llm_output: textToScan,
            model_name: modelName || undefined,
            prompt: prompt || undefined,
            risk_analysis: scanData,
          });
          
          setPrediction(predictionData);
          
          // Step 3: Fetch Evidence Graph
          if (predictionData.id) {
            try {
              const graphData = await fetchEvidenceGraph(predictionData.id);
              setEvidenceGraph(graphData);
            } catch (e) {
              logger.warn('Failed to fetch evidence graph', e as Record<string, unknown>);
            }
          }
          
          // Step 4: Get Resonance Data
          if (predictionData.resonance_score !== undefined) {
            setResonanceData({
              resonance_score: predictionData.resonance_score,
              anchor_matches: predictionData.anchors?.length || 0,
              matched_anchors: predictionData.anchors || [],
              cluster_id: predictionData.cluster,
            });
            setMatchedAnchors(predictionData.anchors || []);
          }
          
          // Step 5: Get Memory Anchors
          try {
            const anchors = await getMemoryAnchors();
            if (Array.isArray(anchors)) {
              const matched = anchors
                .filter((a: any) => textToScan.toLowerCase().includes(a.word?.toLowerCase() || ''))
                .map((a: any) => a.word);
              if (matched.length > 0) {
                setMatchedAnchors(prev => [...new Set([...prev, ...matched])]);
              }
            }
          } catch (e) {
            logger.warn('Failed to fetch anchors', e as Record<string, unknown>);
          }
          
          // Step 6: Create Audit Log
          try {
            const auditData = await createAIAuditLog({
              prompt: prompt || textToScan,
              llm_output: textToScan,
              model_name: modelName || undefined,
              risk_analysis: scanData,
            });
            setEvidenceHash(auditData.evidence_hash);
          } catch (e) {
            logger.warn('Failed to create audit log', e as Record<string, unknown>);
          }
          
        } catch (e) {
          logger.warn('Failed to create prediction', e as Record<string, unknown>);
        }
      }
      
      // Update model stats
      if (modelName) {
        setModelStats(prev => ({
          ...prev,
          [modelName]: {
            total_scans: (prev[modelName]?.total_scans || 0) + 1,
            avg_risk: ((prev[modelName]?.avg_risk || 0) * (prev[modelName]?.total_scans || 0) + scanData.overall_risk_score) / ((prev[modelName]?.total_scans || 0) + 1),
          },
        }));
      }
      
    } catch (err: any) {
      logger.error('LLM Scan error', err, { component: 'LLMScannerPageFull' });
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
      setStreamingProgress(0);
    }
  };

  // Batch scan handler
  const handleBatchScan = async () => {
    const validInputs = batchInputs.filter(inp => inp.trim().length >= 10);
    if (validInputs.length === 0) {
      setError('Please enter at least one valid LLM output (10+ characters).');
      return;
    }
    
    batchResultsRef.current.clear();
    for (let i = 0; i < validInputs.length; i++) {
      await handleScan(validInputs[i], i);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const addBatchInput = () => {
    setBatchInputs([...batchInputs, '']);
  };

  const removeBatchInput = (index: number) => {
    setBatchInputs(batchInputs.filter((_, i) => i !== index));
  };

  // Render Evidence Graph Visualization
  const renderEvidenceGraph = () => {
    if (!evidenceGraph || evidenceGraph.nodes.length === 0) {
      return (
        <div className={styles.graphPlaceholder}>
          <div className={styles.graphNodePlaceholder}>Input</div>
          <div className={styles.graphArrow}>→</div>
          <div className={styles.graphNodePlaceholder}>Tokens</div>
          <div className={styles.graphArrow}>→</div>
          <div className={styles.graphNodePlaceholder}>Context</div>
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
    if (historicalScans.length === 0) return null;
    
    const maxRisk = Math.max(...historicalScans.map(s => s.overall_risk_score), 0.1);
    
    return (
      <div className={styles.historicalChart}>
        {historicalScans.slice(0, 5).map((scan, idx) => (
          <div key={idx} className={styles.chartBarContainer}>
            <div className={styles.chartBarLabel}>#{idx + 1}</div>
            <div className={styles.chartBarWrapper}>
              <div 
                className={styles.chartBar}
                style={{ 
                  width: `${(scan.overall_risk_score / maxRisk) * 100}%`,
                  backgroundColor: getRiskColor(scan.risk_level)
                }}
              />
            </div>
            <div className={styles.chartBarValue}>{(scan.overall_risk_score * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
    );
  };

  // Render Model Stats Chart
  const renderModelStatsChart = () => {
    if (Object.keys(modelStats).length === 0) return null;
    
    return (
      <div className={styles.modelStatsChart}>
        {Object.entries(modelStats).map(([model, stats]: [string, any]) => (
          <div key={model} className={styles.modelStatItem}>
            <div className={styles.statModelName}>{model}</div>
            <div className={styles.statBarWrapper}>
              <div 
                className={styles.statBar}
                style={{ 
                  width: `${(stats.avg_risk * 100)}%`,
                  backgroundColor: stats.avg_risk > 0.7 ? '#EF4444' : stats.avg_risk > 0.4 ? '#F59E0B' : '#10B981'
                }}
              />
            </div>
            <div className={styles.statValue}>{(stats.avg_risk * 100).toFixed(1)}%</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.llmScannerPageCompact}>
      <div className={styles.scannerContainerCompact}>
        {/* Left Column - Input */}
        <div className={styles.scannerLeft}>
          <div className={styles.inputSection}>
            <div className={styles.inputHeader}>
              <div className={styles.titleWrapper}>
                <div className={styles.semanticLabel}>SEMANTIC</div>
                <h2>Scanner</h2>
              </div>
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
                    <strong>Comprehensive LLM risk analysis with 6 detailed categories.</strong> Scans LLM outputs for hallucinations, bias, toxicity, 
                    factual accuracy, privacy risks, and compliance issues.
                  </p>
                  <h4 style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>Capabilities:</h4>
                  <ul style={{ margin: 0, paddingLeft: 'var(--space-4)' }}>
                    <li>✅ Connect to your AI API (OpenAI, Anthropic, or custom)</li>
                    <li>✅ Scan for hallucinations and factual inaccuracies</li>
                    <li>✅ Detect bias and fairness issues</li>
                    <li>✅ Identify toxicity and harmful content</li>
                    <li>✅ Check privacy and data protection compliance</li>
                    <li>✅ Assess regulatory compliance (GDPR, HIPAA, etc.)</li>
                  </ul>
                </>
              )}
            </div>

            {!isBatchMode ? (
              <>
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
                      onClick={() => {
                        if (!isLoggedIn) {
                          setError('Please sign up or log in to use AI API connection');
                          return;
                        }
                        setUseAIConnection(true);
                      }}
                      disabled={loading || fetchingAI}
                    >
                      AI API Connection {!isLoggedIn && '🔒'}
                    </button>
                  </div>
                  {!isLoggedIn && (
                    <div className={styles.signupNotice}>
                      <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                        Sign up to unlock AI API connection
                      </span>
                    </div>
                  )}
                </div>

                {useAIConnection ? (
                  <>
                    {/* AI API Connection Fields */}
                    {!isLoggedIn && (
                      <div className={styles.errorMsg} style={{ marginBottom: '12px' }}>
                        Please sign up or log in to use AI API connection
                      </div>
                    )}
                    <div className={styles.inputGroup}>
                      <label>AI Provider <span className={styles.required}>*</span></label>
                      <select
                        className={styles.inputField}
                        value={aiProvider}
                        onChange={(e) => setAiProvider(e.target.value as 'openai' | 'anthropic' | 'custom')}
                        disabled={loading || fetchingAI || !isLoggedIn}
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
                        disabled={loading || fetchingAI || !isLoggedIn}
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
                        placeholder="Enter your prompt to generate LLM output for scanning..."
                        disabled={loading || fetchingAI || !isLoggedIn}
                      />
                    </div>

                    {fetchingAI && (
                      <div className={styles.aiFetching}>
                        <span>🔄 Fetching response from AI API...</span>
                      </div>
                    )}

                    {llmOutput && useAIConnection && (
                      <div className={styles.aiResponsePreview}>
                        <label>AI Response (will be scanned):</label>
                        <div className={styles.previewText}>{llmOutput.substring(0, 200)}{llmOutput.length > 200 ? '...' : ''}</div>
                      </div>
                    )}

                    <Button
                      size="md"
                      onClick={async () => {
                        if (!isLoggedIn) {
                          setError('Please sign up or log in to use AI API connection');
                          return;
                        }
                        try {
                          const aiResponse = await fetchFromAI();
                          if (aiResponse && aiResponse.length >= 10) {
                            setLlmOutput(aiResponse);
                            setPrompt(aiPrompt);
                            setError(null);
                          } else {
                            setError('AI API returned insufficient text. Please try a different prompt.');
                          }
                        } catch (err: any) {
                          setError(err.message || 'Failed to fetch from AI API');
                        }
                      }}
                      disabled={loading || fetchingAI || !isLoggedIn || !apiKey.trim() || !aiPrompt.trim()}
                      style={{ width: '100%', marginBottom: '12px' }}
                    >
                      {fetchingAI ? 'Fetching...' : 'Fetch from AI'}
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Manual Input Fields */}
                    <div className={styles.inputGroup}>
                      <label>Prompt (Optional)</label>
                      <textarea
                        className={styles.inputTextarea}
                        rows={2}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Original prompt..."
                        disabled={loading}
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label>LLM Output <span className={styles.required}>*</span></label>
                      <textarea
                        ref={textareaRef}
                        className={styles.inputTextarea}
                        rows={4}
                        value={llmOutput}
                        onChange={(e) => setLlmOutput(e.target.value)}
                        placeholder="Paste LLM output to scan..."
                        disabled={loading}
                      />
                      <div className={styles.charCount}>{llmOutput.length} / 10 min</div>
                    </div>
                  </>
                )}

                <div className={styles.inputGroup}>
                  <label>Model Name (Optional)</label>
                  <input
                    type="text"
                    className={styles.inputField}
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g., gpt-4, claude-3"
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <div className={styles.batchInputs}>
                {batchInputs.map((input, idx) => (
                  <div key={idx} className={styles.batchItem}>
                    <label>Output {idx + 1}</label>
                    <textarea
                      className={styles.inputTextarea}
                      rows={3}
                      value={input}
                      onChange={(e) => {
                        const newInputs = [...batchInputs];
                        newInputs[idx] = e.target.value;
                        setBatchInputs(newInputs);
                      }}
                      placeholder={`Output ${idx + 1}...`}
                      disabled={loading}
                    />
                    {batchInputs.length > 1 && (
                      <button className={styles.removeBtn} onClick={() => removeBatchInput(idx)}>×</button>
                    )}
                  </div>
                ))}
                <button className={styles.addBtn} onClick={addBatchInput}>+ Add Output</button>
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
              onClick={() => isBatchMode ? handleBatchScan() : handleScan()}
              disabled={loading || fetchingAI || (!isBatchMode && (!llmOutput.trim() || llmOutput.length < 10))}
              style={{ width: '100%', marginTop: '12px' }}
            >
              {loading ? 'Scanning...' : isBatchMode ? `Scan ${batchInputs.length} Outputs` : 'Scan LLM Output'}
            </Button>
          </div>
        </div>

        {/* Right Column - Results */}
        <div className={styles.scannerRight}>
          <div className={styles.resultsSection}>
            {/* Risk Overview - Always Visible */}
            {result ? (
              <div className={styles.riskOverview}>
                <div 
                  className={styles.riskBadgeLarge}
                  style={{ backgroundColor: getRiskColor(result.risk_level) }}
                >
                  <div className={styles.riskLevel}>{result.risk_level.toUpperCase()}</div>
                  <div className={styles.riskScore}>{(result.overall_risk_score * 100).toFixed(1)}%</div>
                </div>
                <div className={styles.riskMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Confidence</span>
                    <span className={styles.metaValue}>{(result.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`${styles.metaItem} ${result.safe_to_use ? styles.safe : styles.unsafe}`}>
                    {result.safe_to_use ? '✓ Safe' : '⚠ Unsafe'}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.riskOverviewPlaceholder}>
                <div className={styles.riskBadgeLargePlaceholder}>
                  <div className={styles.riskLevelPlaceholder}>RISK LEVEL</div>
                  <div className={styles.riskScorePlaceholder}>0.0%</div>
                </div>
                <div className={styles.riskMetaPlaceholder}>
                  <div className={styles.metaItemPlaceholder}>
                    <span className={styles.metaLabel}>Confidence</span>
                    <span className={styles.metaValue}>0.0%</span>
                  </div>
                  <div className={styles.metaItemPlaceholder}>
                    <span>Waiting for scan...</span>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed Risk Metrics Boxes - Always Visible */}
            <div className={styles.riskMetricsGrid}>
              {result ? (
                <>
                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🧠</span>
                      <span className={styles.metricTitle}>Hallucination</span>
                    </div>
                    <div className={styles.metricScore} style={{ color: getRiskColor(result.hallucination_risk.severity) }}>
                      {(result.hallucination_risk.score * 100).toFixed(1)}%
                    </div>
                    <div className={styles.metricSeverity} style={{ color: getRiskColor(result.hallucination_risk.severity) }}>
                      {result.hallucination_risk.severity.toUpperCase()}
                    </div>
                    {result.hallucination_risk.detected && result.hallucination_risk.details.length > 0 && (
                      <div className={styles.metricDetails}>
                        {result.hallucination_risk.details.slice(0, 2).map((detail, idx) => (
                          <div key={idx} className={styles.detailItem}>• {detail}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>⚖️</span>
                      <span className={styles.metricTitle}>Bias</span>
                    </div>
                    <div className={styles.metricScore} style={{ color: getRiskColor(result.bias_risk.severity) }}>
                      {(result.bias_risk.score * 100).toFixed(1)}%
                    </div>
                    <div className={styles.metricSeverity} style={{ color: getRiskColor(result.bias_risk.severity) }}>
                      {result.bias_risk.severity.toUpperCase()}
                    </div>
                    {result.bias_risk.detected && result.bias_risk.details.length > 0 && (
                      <div className={styles.metricDetails}>
                        {result.bias_risk.details.slice(0, 2).map((detail, idx) => (
                          <div key={idx} className={styles.detailItem}>• {detail}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>☠️</span>
                      <span className={styles.metricTitle}>Toxicity</span>
                    </div>
                    <div className={styles.metricScore} style={{ color: getRiskColor(result.toxicity_risk.severity) }}>
                      {(result.toxicity_risk.score * 100).toFixed(1)}%
                    </div>
                    <div className={styles.metricSeverity} style={{ color: getRiskColor(result.toxicity_risk.severity) }}>
                      {result.toxicity_risk.severity.toUpperCase()}
                    </div>
                    {result.toxicity_risk.detected && result.toxicity_risk.details.length > 0 && (
                      <div className={styles.metricDetails}>
                        {result.toxicity_risk.details.slice(0, 2).map((detail, idx) => (
                          <div key={idx} className={styles.detailItem}>• {detail}</div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={styles.metricBox}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🛡️</span>
                      <span className={styles.metricTitle}>Compliance</span>
                    </div>
                    <div className={styles.metricScore} style={{ color: getRiskColor(result.compliance_risk.severity) }}>
                      {(result.compliance_risk.score * 100).toFixed(1)}%
                    </div>
                    <div className={styles.metricSeverity} style={{ color: getRiskColor(result.compliance_risk.severity) }}>
                      {result.compliance_risk.severity.toUpperCase()}
                    </div>
                    {result.compliance_risk.detected && result.compliance_risk.details.length > 0 && (
                      <div className={styles.metricDetails}>
                        {result.compliance_risk.details.slice(0, 2).map((detail, idx) => (
                          <div key={idx} className={styles.detailItem}>• {detail}</div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🧠</span>
                      <span className={styles.metricTitle}>Hallucination</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>0.0%</div>
                    <div className={styles.metricSeverityPlaceholder}>LOW</div>
                  </div>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>⚖️</span>
                      <span className={styles.metricTitle}>Bias</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>0.0%</div>
                    <div className={styles.metricSeverityPlaceholder}>LOW</div>
                  </div>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>☠️</span>
                      <span className={styles.metricTitle}>Toxicity</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>0.0%</div>
                    <div className={styles.metricSeverityPlaceholder}>LOW</div>
                  </div>
                  <div className={`${styles.metricBox} ${styles.metricBoxPlaceholder}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.metricIcon}>🛡️</span>
                      <span className={styles.metricTitle}>Compliance</span>
                    </div>
                    <div className={styles.metricScorePlaceholder}>0.0%</div>
                    <div className={styles.metricSeverityPlaceholder}>LOW</div>
                  </div>
                </>
              )}
            </div>

                {/* Policy Details Section - Always Visible */}
            <div className={styles.policySection}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Policy Compliance Details</label>
                {!isLoggedIn && (
                  <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                    Sign up to unlock
                  </span>
                )}
              </div>
              <div className={styles.policyGrid}>
                {result ? (
                  <>
                    <div className={styles.policyItem}>
                      <div className={styles.policyHeader}>
                        <span className={styles.policyName}>GDPR</span>
                        <span className={`${styles.policyStatus} ${result.compliance_risk.severity === 'low' ? styles.pass : styles.fail}`}>
                          {result.compliance_risk.severity === 'low' ? '✓ Compliant' : '⚠ Review Required'}
                        </span>
                      </div>
                      <div className={styles.policyScore}>Score: {(result.compliance_risk.score * 100).toFixed(1)}%</div>
                      {result.compliance_risk.detected && (
                        <div className={styles.policyFlags}>
                          Flags: {result.compliance_risk.details.length}
                        </div>
                      )}
                    </div>
                    <div className={styles.policyItem}>
                      <div className={styles.policyHeader}>
                        <span className={styles.policyName}>HIPAA</span>
                        <span className={`${styles.policyStatus} ${result.privacy_risk.severity === 'low' ? styles.pass : styles.fail}`}>
                          {result.privacy_risk.severity === 'low' ? '✓ Compliant' : '⚠ Review Required'}
                        </span>
                      </div>
                      <div className={styles.policyScore}>Score: {(result.privacy_risk.score * 100).toFixed(1)}%</div>
                      {result.privacy_risk.detected && (
                        <div className={styles.policyFlags}>
                          Flags: {result.privacy_risk.details.length}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className={`${styles.policyItem} ${styles.policyItemPlaceholder}`}>
                      <div className={styles.policyHeader}>
                        <span className={styles.policyName}>GDPR</span>
                        <span className={styles.policyStatusPlaceholder}>Pending</span>
                      </div>
                      <div className={styles.policyScore}>Score: 0.0%</div>
                    </div>
                    <div className={`${styles.policyItem} ${styles.policyItemPlaceholder}`}>
                      <div className={styles.policyHeader}>
                        <span className={styles.policyName}>HIPAA</span>
                        <span className={styles.policyStatusPlaceholder}>Pending</span>
                      </div>
                      <div className={styles.policyScore}>Score: 0.0%</div>
                    </div>
                  </>
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
                <code>{evidenceHash || prediction?.id || 'N/A - Scan to generate'}</code>
                {(evidenceHash || prediction?.id) && (
                  <button onClick={() => copyToClipboard(evidenceHash || prediction?.id || '')}>Copy</button>
                )}
              </div>
              {!isLoggedIn && !evidenceHash && (
                <div className={styles.featureNote}>Available when you sign up</div>
              )}
            </div>

            {/* Quality Score - Always Visible */}
            <div className={styles.resonanceSectionCompact}>
              <div className={styles.sectionHeaderWithBadge}>
                <div className={styles.resonanceHeaderCompact}>
                  <span>Quality Score</span>
                  <span className={styles.resonanceValueCompact}>
                    {resonanceData ? (resonanceData.resonance_score * 100).toFixed(1) : prediction?.resonance_score ? (prediction.resonance_score * 100).toFixed(1) : '0.0'}%
                  </span>
                </div>
                {!isLoggedIn && (
                  <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                    Sign up to unlock
                  </span>
                )}
              </div>
              <div className={styles.resonanceMeterCompact}>
                <div 
                  className={styles.resonanceFillCompact}
                  style={{ 
                    width: `${(resonanceData?.resonance_score || prediction?.resonance_score || 0) * 100}%` 
                  }}
                />
              </div>
              <div className={styles.resonanceDetailsCompact}>
                Context Points: {resonanceData?.anchor_matches || prediction?.anchors?.length || 0} | 
                Group: {resonanceData?.cluster_id || prediction?.cluster || 'N/A'}
              </div>
              {!isLoggedIn && !resonanceData && (
                <div className={styles.featureNote}>Available when you sign up</div>
              )}
            </div>

            {/* Context Memory - Always Visible */}
            <div className={styles.anchorsSectionCompact}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Context Memory ({matchedAnchors.length || prediction?.anchors?.length || 0})</label>
                {!isLoggedIn && (
                  <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                    Sign up to unlock
                  </span>
                )}
              </div>
              <div className={styles.anchorsListCompact}>
                {(matchedAnchors.length > 0 ? matchedAnchors : prediction?.anchors || []).slice(0, 5).map((anchor, idx) => (
                  <span key={idx} className={styles.anchorTagCompact}>{anchor}</span>
                ))}
                {matchedAnchors.length === 0 && (!prediction?.anchors || prediction.anchors.length === 0) && (
                  <span className={styles.noAnchors}>No context points detected</span>
                )}
              </div>
              {!isLoggedIn && matchedAnchors.length === 0 && (
                <div className={styles.featureNote}>Available when you sign up</div>
              )}
            </div>

            {/* PII Alert - Only when detected */}
            {result && result.privacy_risk.detected && result.privacy_risk.severity !== 'low' && (
              <div className={styles.piiAlertCompact}>
                <span className={styles.piiIcon}>⚠️</span>
                <div className={styles.piiContent}>
                  <span className={styles.piiText}>PII Detected</span>
                  {result.privacy_risk.details.length > 0 && (
                    <div className={styles.piiDetails}>
                      {result.privacy_risk.details.slice(0, 3).map((detail, idx) => (
                        <span key={idx} className={styles.piiTag}>{detail}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Evidence Graph - Always Visible */}
            <div className={styles.graphSectionCompact}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Evidence Graph Visualization</label>
                {!isLoggedIn && (
                  <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                    Sign up to unlock
                  </span>
                )}
              </div>
              {renderEvidenceGraph()}
              {!isLoggedIn && !evidenceGraph && (
                <div className={styles.featureNote}>Available when you sign up</div>
              )}
            </div>

            {/* Historical Comparison - Always Visible */}
            <div className={styles.historicalSectionCompact}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Historical Comparison</label>
                {!isLoggedIn && (
                  <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                    Sign up to unlock
                  </span>
                )}
              </div>
              {historicalScans.length > 0 ? renderHistoricalChart() : (
                <div className={styles.noData}>
                  {isLoggedIn ? 'No historical scans yet' : 'Available when you sign up'}
                </div>
              )}
            </div>

            {/* Model Performance - Always Visible */}
            <div className={styles.modelStatsSectionCompact}>
              <div className={styles.sectionHeaderWithBadge}>
                <label>Model Performance Tracking</label>
                {!isLoggedIn && (
                  <span className={styles.signupBadge} onClick={() => goToSignup(navigate)}>
                    Sign up to unlock
                  </span>
                )}
              </div>
              {Object.keys(modelStats).length > 0 ? renderModelStatsChart() : (
                <div className={styles.noData}>
                  {isLoggedIn ? 'No model statistics yet' : 'Available when you sign up'}
                </div>
              )}
            </div>

            {/* Recommendations - Only when available */}
            {result && result.recommendations.length > 0 && (
              <div className={styles.recommendationsCompact}>
                <label>Recommendations</label>
                <ul>
                  {result.recommendations.slice(0, 3).map((rec, idx) => (
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

export default LLMScannerPageFull;
