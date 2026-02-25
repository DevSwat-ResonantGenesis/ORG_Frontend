/**
 * V8 Control Panel Component
 * Provides UI for managing V8 ML training, forbidden words, formula settings
 */
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Play, FileText, Shield, Sliders, Database, Cpu, AlertTriangle, X, History, Trash2, CheckCircle } from 'lucide-react';

const V8_API_BASE = '/v8-api';
const DEV_TOKEN = 'LouieArt';

interface V8Status {
  version: string;
  trained: boolean;
  vocab_size: number;
  max_vocab_size: number;
  forbidden_count: number;
  anchors_count: number;
  pending_vocab: number;
}

interface FormulaParams {
  resonance_scale: number;
  spin_factor: number;
  energy_decay: number;
  cluster_threshold: number;
  [key: string]: unknown;
}

interface CorpusFile {
  name: string;
  size: number;
}

interface PredictionEntry {
  hash: string | null;
  words: string[];
  xyz: number[];
  r: number;
  spin: number;
  energy: number;
  cluster: string;
  anchor: boolean;
  timestamp: string;
}

const CLUSTER_COLORS: Record<string, string> = {
  alpha: '#7df6ff', beta: '#ffb347', gamma: '#c09bff',
  delta: '#ff6b6b', epsilon: '#6bff6b', zeta: '#ff6bff',
};

const V8ControlPanel: React.FC = () => {
  const [status, setStatus] = useState<V8Status | null>(null);
  const [forbidden, setForbidden] = useState<string[]>([]);
  const [formula, setFormula] = useState<FormulaParams | null>(null);
  const [corpusFiles, setCorpusFiles] = useState<CorpusFile[]>([]);
  const [predictions, setPredictions] = useState<PredictionEntry[]>([]);
  const [predictionsTotal, setPredictionsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const [newForbiddenWord, setNewForbiddenWord] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'training' | 'forbidden' | 'formula' | 'predictions'>('status');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'X-Dev-Token': DEV_TOKEN };
      const [statusRes, forbiddenRes, formulaRes, corpusRes, predsRes] = await Promise.all([
        fetch(V8_API_BASE + '/admin/status', { headers }),
        fetch(V8_API_BASE + '/admin/forbidden', { headers }),
        fetch(V8_API_BASE + '/admin/formula', { headers }),
        fetch(V8_API_BASE + '/admin/corpus', { headers }),
        fetch(V8_API_BASE + '/admin/predictions?limit=100', { headers }),
      ]);
      if (statusRes.ok) setStatus(await statusRes.json());
      else console.error('[V8] Status fetch failed:', statusRes.status);
      if (forbiddenRes.ok) { const d = await forbiddenRes.json(); setForbidden(d.words || []); }
      else console.error('[V8] Forbidden fetch failed:', forbiddenRes.status);
      if (formulaRes.ok) setFormula(await formulaRes.json());
      if (corpusRes.ok) { const d = await corpusRes.json(); setCorpusFiles(d.files || []); }
      if (predsRes.ok) { const d = await predsRes.json(); setPredictions(d.predictions || []); setPredictionsTotal(d.total || 0); }
    } catch (err) {
      console.error('[V8] Fetch error:', err);
      setError('Failed to fetch V8 data. Check console for details.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startTraining = async (corpusName: string) => {
    setTrainingInProgress(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(V8_API_BASE + '/admin/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Dev-Token': DEV_TOKEN },
        body: JSON.stringify({ corpus: corpusName }),
      });
      if (res.ok) {
        const d = await res.json();
        setSuccess(`Training completed! Vocab size: ${d.vocab_size || 'N/A'}`);
        await fetchData();
      } else {
        const e = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setError(e.error || 'Training failed');
      }
    } catch (err) { setError('Training request failed: ' + (err instanceof Error ? err.message : 'network error')); }
    finally { setTrainingInProgress(false); }
  };

  const updateForbidden = async (words: string[]) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(V8_API_BASE + '/admin/forbidden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Dev-Token': DEV_TOKEN },
        body: JSON.stringify({ words }),
      });
      if (res.ok) {
        setForbidden(words);
        setSuccess('Forbidden words updated');
        await fetchData();
      } else {
        const e = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        setError('Failed to update forbidden words: ' + (e.error || res.status));
      }
    } catch (err) { setError('Failed to update forbidden words: ' + (err instanceof Error ? err.message : 'network error')); }
  };

  const clearPredictions = async () => {
    try {
      const res = await fetch(V8_API_BASE + '/admin/predictions/clear', {
        method: 'POST',
        headers: { 'X-Dev-Token': DEV_TOKEN },
      });
      if (res.ok) { setPredictions([]); setPredictionsTotal(0); setSuccess('Prediction history cleared'); }
    } catch { setError('Failed to clear predictions'); }
  };

  const addForbiddenWord = () => {
    if (newForbiddenWord.trim() && !forbidden.includes(newForbiddenWord.trim().toLowerCase())) {
      updateForbidden([...forbidden, newForbiddenWord.trim().toLowerCase()]);
      setNewForbiddenWord('');
    }
  };

  const removeForbiddenWord = (word: string) => updateForbidden(forbidden.filter(w => w !== word));

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading V8...</div>;

  const tabStyle = (active: boolean) => ({
    padding: '0.5rem 1rem', background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
    border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
    color: active ? '#6366f1' : 'var(--text-secondary)', fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Cpu size={24} style={{ color: '#6366f1' }} />
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>V8 Engine Control</h2>
        <button onClick={fetchData} style={{ marginLeft: 'auto', padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16} /> {error} <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button></div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#22c55e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> {success} <button onClick={() => setSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}><X size={14} /></button></div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button style={tabStyle(activeTab === 'status')} onClick={() => setActiveTab('status')}><Database size={16} /> Status</button>
        <button style={tabStyle(activeTab === 'training')} onClick={() => setActiveTab('training')}><Play size={16} /> Training</button>
        <button style={tabStyle(activeTab === 'forbidden')} onClick={() => setActiveTab('forbidden')}><Shield size={16} /> Forbidden</button>
        <button style={tabStyle(activeTab === 'formula')} onClick={() => setActiveTab('formula')}><Sliders size={16} /> Formula</button>
        <button style={tabStyle(activeTab === 'predictions')} onClick={() => setActiveTab('predictions')}><History size={16} /> Predictions {predictionsTotal > 0 && <span style={{ background: '#6366f1', color: 'white', borderRadius: '999px', padding: '0 6px', fontSize: '0.7rem', minWidth: '18px', textAlign: 'center' }}>{predictionsTotal}</span>}</button>
      </div>

      {activeTab === 'status' && status && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          <StatCard label="Version" value={status.version} />
          <StatCard label="Trained" value={status.trained ? 'Yes' : 'No'} color={status.trained ? '#22c55e' : '#f59e0b'} />
          <StatCard label="Vocabulary" value={status.vocab_size + ' / ' + status.max_vocab_size} />
          <StatCard label="Forbidden" value={String(status.forbidden_count)} />
          <StatCard label="Anchors" value={String(status.anchors_count)} />
          <StatCard label="Pending" value={String(status.pending_vocab)} />
        </div>
      )}

      {activeTab === 'training' && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Corpus Files</h3>
          {corpusFiles.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No corpus files</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {corpusFiles.map(f => (
                <div key={f.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={18} style={{ color: '#6366f1' }} />
                    <span>{f.name}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>({(f.size/1024).toFixed(1)} KB)</span>
                  </div>
                  <button onClick={() => startTraining(f.name)} disabled={trainingInProgress} style={{ padding: '0.5rem 1rem', background: trainingInProgress ? '#666' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '6px', cursor: trainingInProgress ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Play size={14} /> {trainingInProgress ? 'Training...' : 'Train'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'forbidden' && (
        <div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="text" value={newForbiddenWord} onChange={e => setNewForbiddenWord(e.target.value)} onKeyDown={e => e.key === 'Enter' && addForbiddenWord()}  placeholder="Add word..." style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            <button onClick={addForbiddenWord} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {forbidden.map(w => (
              <span key={w} style={{ padding: '0.25rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '999px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                {w} <button onClick={() => removeForbiddenWord(w)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444', display: 'flex' }}><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'formula' && formula && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <FormulaRow title="Resonance Scale" value={String(formula.resonance_scale ?? 'N/A')} description="Controls the overall resonance field magnitude" />
          <FormulaRow title="Spin Factor" value={String(formula.spin_factor ?? 'N/A')} description="Weight applied to spin vector calculations" />
          <FormulaRow title="Energy Decay" value={String(formula.energy_decay ?? 'N/A')} description="Rate of energy dissipation per cycle" />
          <FormulaRow title="Cluster Threshold" value={String(formula.cluster_threshold ?? 'N/A')} description="Minimum distance for cluster boundary detection" />
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Raw Formula JSON</h4>
            <pre style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(formula, null, 2)}</pre>
          </div>
        </div>
      )}

      {activeTab === 'predictions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Prediction History <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.875rem' }}>({predictionsTotal} total)</span></h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={fetchData} style={{ padding: '0.4rem 0.75rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}><RefreshCw size={14} /> Refresh</button>
              {predictions.length > 0 && <button onClick={clearPredictions} style={{ padding: '0.4rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.8rem' }}><Trash2 size={14} /> Clear</button>}
            </div>
          </div>
          {predictions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <History size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No predictions yet. Use the V8 HashSphere to generate predictions.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
              {predictions.map((p, i) => {
                const clusterColor = CLUSTER_COLORS[p.cluster?.toLowerCase()] || '#888';
                const timeStr = p.timestamp ? new Date(p.timestamp).toLocaleString() : 'N/A';
                return (
                  <div key={i} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: `3px solid ${clusterColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ padding: '0.15rem 0.5rem', background: clusterColor + '22', color: clusterColor, borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>{p.cluster || '—'}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          r={Number(p.r).toFixed(2)} spin={Number(p.spin).toFixed(2)} E={Number(p.energy).toFixed(2)}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>{timeStr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>
                        {p.words?.length ? p.words.slice(0, 6).join(' ') + (p.words.length > 6 ? '...' : '') : (p.hash ? p.hash.slice(0, 18) + '...' : '—')}
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                        [{p.xyz?.map(v => Number(v).toFixed(2)).join(', ')}]
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '1.25rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</div>
  </div>
);

const FormulaRow: React.FC<{ title: string; value: string; description?: string }> = ({ title, value, description }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <div>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{title}</span>
      {description && <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{description}</div>}
    </div>
    <span style={{ fontFamily: 'monospace', color: '#6366f1', fontSize: '1.1rem', fontWeight: 600 }}>{value}</span>
  </div>
);

export default V8ControlPanel;
