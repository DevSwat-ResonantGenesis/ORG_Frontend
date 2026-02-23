/**
 * V8 Control Panel Component
 * Provides UI for managing V8 ML training, forbidden words, formula settings
 */
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Play, FileText, Shield, Sliders, Database, Cpu, AlertTriangle, X } from 'lucide-react';

const V8_API_BASE = '/v8-app/api';
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
  spin_weights: number[];
  energy_multiplier: number;
  energy_min: number;
  energy_max: number;
  radius_base: number;
  radius_scale: number;
  cluster_thresholds: Record<string, unknown>;
}

interface CorpusFile {
  name: string;
  size: number;
}

const V8ControlPanel: React.FC = () => {
  const [status, setStatus] = useState<V8Status | null>(null);
  const [forbidden, setForbidden] = useState<string[]>([]);
  const [formula, setFormula] = useState<FormulaParams | null>(null);
  const [corpusFiles, setCorpusFiles] = useState<CorpusFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trainingInProgress, setTrainingInProgress] = useState(false);
  const [newForbiddenWord, setNewForbiddenWord] = useState('');
  const [activeTab, setActiveTab] = useState<'status' | 'training' | 'forbidden' | 'formula'>('status');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'X-Dev-Token': DEV_TOKEN };
      const [statusRes, forbiddenRes, formulaRes, corpusRes] = await Promise.all([
        fetch(V8_API_BASE + '/admin/status', { headers }),
        fetch(V8_API_BASE + '/admin/forbidden', { headers }),
        fetch(V8_API_BASE + '/admin/formula', { headers }),
        fetch(V8_API_BASE + '/admin/corpus', { headers }),
      ]);
      if (statusRes.ok) setStatus(await statusRes.json());
      if (forbiddenRes.ok) { const d = await forbiddenRes.json(); setForbidden(d.words || []); }
      if (formulaRes.ok) setFormula(await formulaRes.json());
      if (corpusRes.ok) { const d = await corpusRes.json(); setCorpusFiles(d.files || []); }
    } catch (err) {
      setError('Failed to fetch V8 data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const startTraining = async (corpusName: string) => {
    setTrainingInProgress(true);
    try {
      const res = await fetch(V8_API_BASE + '/admin/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Dev-Token': DEV_TOKEN },
        body: JSON.stringify({ corpus: corpusName }),
      });
      if (res.ok) await fetchData();
      else { const e = await res.json(); setError(e.error || 'Training failed'); }
    } catch { setError('Training request failed'); }
    finally { setTrainingInProgress(false); }
  };

  const updateForbidden = async (words: string[]) => {
    try {
      const res = await fetch(V8_API_BASE + '/forbidden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Dev-Token': DEV_TOKEN },
        body: JSON.stringify({ words }),
      });
      if (res.ok) { setForbidden(words); await fetchData(); }
    } catch { setError('Failed to update forbidden words'); }
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

      {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16} /> {error}</div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button style={tabStyle(activeTab === 'status')} onClick={() => setActiveTab('status')}><Database size={16} /> Status</button>
        <button style={tabStyle(activeTab === 'training')} onClick={() => setActiveTab('training')}><Play size={16} /> Training</button>
        <button style={tabStyle(activeTab === 'forbidden')} onClick={() => setActiveTab('forbidden')}><Shield size={16} /> Forbidden</button>
        <button style={tabStyle(activeTab === 'formula')} onClick={() => setActiveTab('formula')}><Sliders size={16} /> Formula</button>
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
          <FormulaRow title="Spin Weights" value={formula.spin_weights.join(', ')} />
          <FormulaRow title="Energy Multiplier" value={String(formula.energy_multiplier)} />
          <FormulaRow title="Energy Range" value={formula.energy_min + ' - ' + formula.energy_max} />
          <FormulaRow title="Radius Base" value={String(formula.radius_base)} />
          <FormulaRow title="Radius Scale" value={String(formula.radius_scale)} />
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cluster Thresholds</h4>
            <pre style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(formula.cluster_thresholds, null, 2)}</pre>
          </div>
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

const FormulaRow: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <span style={{ color: 'var(--text-secondary)' }}>{title}</span>
    <span style={{ fontFamily: 'monospace', color: '#6366f1' }}>{value}</span>
  </div>
);

export default V8ControlPanel;
