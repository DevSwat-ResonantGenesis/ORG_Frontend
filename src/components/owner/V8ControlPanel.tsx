/**
 * V8 Control Panel Component
 * Real ML-backed V8 Engine management: training, models, forbidden words, predictions
 * All data stored in PostgreSQL ML Registry DB - no localStorage
 */
import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Play, FileText, Shield, Sliders, Database, Cpu, AlertTriangle, X, History, Trash2, CheckCircle, Layers, Anchor, Zap } from 'lucide-react';

const V8_API_BASE = '/api/v1/v8/api';
const DEV_TOKEN = 'LouieArt';

interface V8Status {
  version: string;
  has_active_model: boolean;
  active_model: { id: string; version_tag: string; status: string; meta: Record<string, unknown>; created_at: string } | null;
  vocab_size: number;
  embedding_count: number;
  forbidden_count: number;
  anchors_count: number;
}

interface ModelVersion {
  id: string;
  version_tag: string;
  status: string;
  is_active: boolean;
  embedding_count: number;
  meta: Record<string, unknown>;
  created_at: string;
}

interface FormulaParams { resonance_scale: number; spin_factor: number; energy_decay: number; cluster_threshold: number; [key: string]: unknown; }
interface CorpusFile { name: string; size: number; lines: number; }
interface PredictionEntry { id: string; input_hash: string | null; input_words: string[] | null; output_hash: string | null; output_words: string[] | null; xyz: number[]; r: number; spin: number; energy: number; cluster: string; is_anchor: boolean; model_version_id: string | null; created_at: string; }
interface AnchorEntry { id: string; words: string[]; xyz: number[]; cluster: string; created_at: string; }
interface TrainingState { status: string; job_id: string | null; corpus: string | null; started_at: string | null; finished_at: string | null; error: string | null; vocab_size?: number; }

const CC: Record<string, string> = { alpha: '#7df6ff', beta: '#ffb347', gamma: '#c09bff', delta: '#ff6b6b', epsilon: '#6bff6b', zeta: '#ff6bff' };

type Tab = 'status' | 'models' | 'training' | 'forbidden' | 'anchors' | 'formula' | 'predictions';

const V8ControlPanel: React.FC = () => {
  const [status, setStatus] = useState<V8Status | null>(null);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [forbidden, setForbidden] = useState<string[]>([]);
  const [anchors, setAnchors] = useState<AnchorEntry[]>([]);
  const [formula, setFormula] = useState<FormulaParams | null>(null);
  const [corpusFiles, setCorpusFiles] = useState<CorpusFile[]>([]);
  const [predictions, setPredictions] = useState<PredictionEntry[]>([]);
  const [predsTotal, setPredsTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [training, setTraining] = useState(false);
  const [trainingJobId, setTrainingJobId] = useState<string | null>(null);
  const [newForbidden, setNewForbidden] = useState('');
  const [newAnchorWords, setNewAnchorWords] = useState('');
  const [newAnchorHash, setNewAnchorHash] = useState('');
  const [tab, setTab] = useState<Tab>('status');

  const hdr = { 'X-Dev-Token': DEV_TOKEN };
  const hdrJson = { 'Content-Type': 'application/json', 'X-Dev-Token': DEV_TOKEN };

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [sR, mR, fR, aR, frR, cR, pR] = await Promise.all([
        fetch(V8_API_BASE + '/admin/status', { headers: hdr }),
        fetch(V8_API_BASE + '/admin/models', { headers: hdr }),
        fetch(V8_API_BASE + '/admin/forbidden', { headers: hdr }),
        fetch(V8_API_BASE + '/admin/anchors', { headers: hdr }),
        fetch(V8_API_BASE + '/admin/formula', { headers: hdr }),
        fetch(V8_API_BASE + '/admin/corpus', { headers: hdr }),
        fetch(V8_API_BASE + '/admin/predictions?limit=50', { headers: hdr }),
      ]);
      if (sR.ok) setStatus(await sR.json());
      if (mR.ok) { const d = await mR.json(); setModels(d.models || []); }
      if (fR.ok) { const d = await fR.json(); setForbidden(d.words || []); }
      if (aR.ok) { const d = await aR.json(); setAnchors(d.anchors || []); }
      if (frR.ok) setFormula(await frR.json());
      if (cR.ok) { const d = await cR.json(); setCorpusFiles(d.files || []); }
      if (pR.ok) { const d = await pR.json(); setPredictions(d.predictions || []); setPredsTotal(d.total || 0); }
    } catch (err) { console.error('[V8]', err); setError('Failed to fetch V8 data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const pollTraining = useCallback(async (jobId: string) => {
    const startedAt = Date.now();
    const maxMs = 30 * 60 * 1000;
    while (Date.now() - startedAt < maxMs) {
      try {
        const res = await fetch(V8_API_BASE + `/admin/training/status?job_id=${encodeURIComponent(jobId)}`, { headers: hdr });
        if (!res.ok) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        const d = await res.json();
        const ts: TrainingState | undefined = d?.training;
        const st = (ts?.status || '').toLowerCase();

        if (st === 'completed') {
          setTrainingJobId(null);
          setSuccess(`Training complete! vocab: ${ts?.vocab_size || status?.vocab_size || 0}`);
          await fetchData();
          return;
        }
        if (st === 'failed') {
          setTrainingJobId(null);
          setError(ts?.error || 'Training failed');
          await fetchData();
          return;
        }
      } catch (e) {
        console.error('[V8 training poll]', e);
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    setTrainingJobId(null);
    setError('Training timed out while waiting for completion');
  }, [fetchData, hdr, status?.vocab_size]);

  const startTraining = async (corpus: string) => {
    setTraining(true); setError(null); setSuccess(null);
    try {
      const res = await fetch(V8_API_BASE + '/admin/training/start', { method: 'POST', headers: hdrJson, body: JSON.stringify({ corpus }) });
      if (res.status === 202) {
        const d = await res.json();
        const jobId = d.job_id as string | undefined;
        if (jobId) {
          setTrainingJobId(jobId);
          setSuccess('Training started. This may take a few minutes...');
          await pollTraining(jobId);
        } else {
          setSuccess('Training started.');
        }
      }
      else if (res.ok) {
        const d = await res.json();
        setSuccess(d.message || 'Training completed');
        await fetchData();
      }
      else { const e = await res.json().catch(() => ({})); setError(e.error || 'Training failed'); }
    } catch (err) { setError('Training failed: ' + (err instanceof Error ? err.message : 'error')); }
    finally { setTraining(false); }
  };

  const activateModel = async (id: string) => {
    try {
      const res = await fetch(V8_API_BASE + '/admin/models/activate', { method: 'POST', headers: hdrJson, body: JSON.stringify({ model_version_id: id }) });
      if (res.ok) { setSuccess('Model activated'); await fetchData(); }
      else { const e = await res.json().catch(() => ({})); setError(e.error || 'Activation failed'); }
    } catch { setError('Failed to activate model'); }
  };

  const updateForbidden = async (words: string[]) => {
    setError(null); setSuccess(null);
    try {
      const res = await fetch(V8_API_BASE + '/admin/forbidden', { method: 'POST', headers: hdrJson, body: JSON.stringify({ words }) });
      if (res.ok) { setForbidden(words); setSuccess('Forbidden words updated (retrain to apply)'); }
      else { const e = await res.json().catch(() => ({})); setError(e.error || 'Update failed'); }
    } catch { setError('Failed to update forbidden words'); }
  };

  const addAnchor = async () => {
    const words = newAnchorWords.trim().split(/\s+/).map(w => w.toLowerCase());
    if (words.length !== 12) { setError('Anchors require exactly 12 words (got ' + words.length + ')'); return; }
    const hash = newAnchorHash.trim();
    if (hash && !hash.match(/^0x[0-9a-fA-F]{40}$/)) { setError('Hash must be a valid 40-char hex string starting with 0x'); return; }
    try {
      const res = await fetch(V8_API_BASE + '/admin/anchors', { method: 'POST', headers: hdrJson, body: JSON.stringify({ words, hash: hash || undefined }) });
      if (res.ok) { setNewAnchorWords(''); setNewAnchorHash(''); setSuccess('Anchor added! Retrain model to incorporate.'); await fetchData(); }
      else { const e = await res.json().catch(() => ({})); setError(e.error || 'Failed to add anchor'); }
    } catch { setError('Failed to add anchor'); }
  };

  const removeAnchor = async (id: string) => {
    try {
      await fetch(V8_API_BASE + '/admin/anchors', { method: 'DELETE', headers: hdrJson, body: JSON.stringify({ id }) });
      await fetchData();
    } catch { setError('Failed to remove anchor'); }
  };

  const clearPredictions = async () => {
    try {
      const res = await fetch(V8_API_BASE + '/admin/predictions/clear', { method: 'POST', headers: hdr });
      if (res.ok) { setPredictions([]); setPredsTotal(0); setSuccess('History cleared'); }
    } catch { setError('Failed to clear'); }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}><RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} /> Loading V8 Engine...</div>;

  const ts = (a: boolean): React.CSSProperties => ({ padding: '0.5rem 1rem', background: a ? 'rgba(99,102,241,0.1)' : 'transparent', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: a ? '#6366f1' : 'var(--text-secondary)', fontWeight: a ? 600 : 400 });
  const badge = (n: number) => n > 0 ? <span style={{ background: '#6366f1', color: '#fff', borderRadius: '999px', padding: '0 6px', fontSize: '0.65rem', minWidth: '16px', textAlign: 'center' }}>{n}</span> : null;

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Cpu size={24} style={{ color: '#6366f1' }} />
        <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>V8 Engine Control</h2>
        <span style={{ fontSize: '0.75rem', color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>v{status?.version || '8.4'} | ML DB</span>
        <button onClick={fetchData} style={{ marginLeft: 'auto', padding: '0.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertTriangle size={16} /> {error} <button onClick={() => setError(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button></div>}
      {success && <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', color: '#22c55e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> {success} <button onClick={() => setSuccess(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer' }}><X size={14} /></button></div>}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        <button style={ts(tab === 'status')} onClick={() => setTab('status')}><Database size={16} /> Status</button>
        <button style={ts(tab === 'models')} onClick={() => setTab('models')}><Layers size={16} /> Models {badge(models.length)}</button>
        <button style={ts(tab === 'training')} onClick={() => setTab('training')}><Play size={16} /> Training</button>
        <button style={ts(tab === 'forbidden')} onClick={() => setTab('forbidden')}><Shield size={16} /> Forbidden {badge(forbidden.length)}</button>
        <button style={ts(tab === 'anchors')} onClick={() => setTab('anchors')}><Anchor size={16} /> Anchors {badge(anchors.length)}</button>
        <button style={ts(tab === 'formula')} onClick={() => setTab('formula')}><Sliders size={16} /> Formula</button>
        <button style={ts(tab === 'predictions')} onClick={() => setTab('predictions')}><History size={16} /> Predictions {badge(predsTotal)}</button>
      </div>

      {/* STATUS */}
      {tab === 'status' && status && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <SC label="Active Model" value={status.has_active_model ? 'Yes' : 'No Model'} color={status.has_active_model ? '#22c55e' : '#ef4444'} />
            <SC label="Embeddings" value={String(status.embedding_count)} />
            <SC label="Vocabulary" value={String(status.vocab_size)} />
            <SC label="Forbidden" value={String(status.forbidden_count)} />
            <SC label="Anchors" value={String(status.anchors_count)} />
            <SC label="Models" value={String(models.length)} />
          </div>
          {status.active_model && (
            <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.9rem' }}>Active Model: <span style={{ color: '#6366f1' }}>{status.active_model.version_tag}</span></h4>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Vocab: {String((status.active_model.meta as Record<string, unknown>)?.vocab_size ?? 'N/A')}</span>
                <span>Tokens: {String((status.active_model.meta as Record<string, unknown>)?.token_count ?? 'N/A')}</span>
                <span>Trained: {new Date(status.active_model.created_at).toLocaleString()}</span>
              </div>
            </div>
          )}
          {!status.has_active_model && (
            <div style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(239,68,68,0.05)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <Zap size={32} style={{ color: '#f59e0b', marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, color: '#f59e0b', fontWeight: 600 }}>No trained model! Go to Training tab to train your first model.</p>
            </div>
          )}
        </div>
      )}

      {/* MODELS */}
      {tab === 'models' && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Trained Models <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.85rem' }}>({models.length})</span></h3>
          {models.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>No models trained yet. Go to Training tab.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {models.map(m => (
                <div key={m.id} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: m.is_active ? '2px solid #6366f1' : '1px solid var(--border-color)', position: 'relative' }}>
                  {m.is_active && <span style={{ position: 'absolute', top: '-8px', right: '12px', background: '#6366f1', color: '#fff', fontSize: '0.65rem', padding: '1px 8px', borderRadius: '4px', fontWeight: 600 }}>ACTIVE</span>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{m.version_tag}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {m.embedding_count} embeddings | Vocab: {String((m.meta as Record<string, unknown>)?.vocab_size ?? '?')} | {new Date(m.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!m.is_active && (
                      <button onClick={() => activateModel(m.id)} style={{ padding: '0.4rem 0.75rem', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Activate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRAINING */}
      {tab === 'training' && (
        <div>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Train New Model</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Training builds a TinyU neural net using BIP39 deterministic mapping (2048-word vocabulary).
            Data sources: <strong>{status?.anchors_count || anchors.length} anchors</strong> (ground truth) + 3000 random BIP39 samples.
            <strong style={{ color: '#ef4444' }}> {status?.forbidden_count || forbidden.length} forbidden words</strong> are excluded from training data and masked during loss computation.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><Anchor size={14} style={{ color: '#6366f1' }} /><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Anchors</span></div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{status?.anchors_count || anchors.length} ground truth mappings + 5 variations each</span>
              </div>
              <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><Shield size={14} style={{ color: '#ef4444' }} /><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Forbidden Words</span></div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{status?.forbidden_count || forbidden.length} words excluded from dataset + masked in loss</span>
              </div>
              <div style={{ flex: 1, padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}><Database size={14} style={{ color: '#22c55e' }} /><span style={{ fontWeight: 600, fontSize: '0.85rem' }}>BIP39 Vocab</span></div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>2048 words, deterministic bit-segment mapping</span>
              </div>
            </div>
          </div>
          <button onClick={() => startTraining('bip39')} disabled={training || !!trainingJobId} style={{ padding: '0.6rem 1.2rem', marginBottom: '1rem', background: (training || !!trainingJobId) ? '#666' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', cursor: (training || !!trainingJobId) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}><Play size={16} /> {(training || !!trainingJobId) ? 'Training TinyU Model...' : 'Train from Anchors + Forbidden Exclusion'}</button>
        </div>
      )}

      {/* FORBIDDEN */}
      {tab === 'forbidden' && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Forbidden words are excluded from vocabulary during training. After editing, retrain to apply changes.</p>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input type="text" value={newForbidden} onChange={e => setNewForbidden(e.target.value)} onKeyDown={e => e.key === 'Enter' && newForbidden.trim() && updateForbidden([...forbidden, newForbidden.trim().toLowerCase()]) && setNewForbidden('')} placeholder="Add forbidden word..." style={{ flex: 1, padding: '0.5rem 0.75rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)' }} />
            <button onClick={() => { if (newForbidden.trim()) { updateForbidden([...forbidden, newForbidden.trim().toLowerCase()]); setNewForbidden(''); }}} style={{ padding: '0.5rem 1rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {forbidden.map(w => (
              <span key={w} style={{ padding: '0.25rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '999px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                {w} <button onClick={() => updateForbidden(forbidden.filter(x => x !== w))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#ef4444', display: 'flex' }}><X size={14} /></button>
              </span>
            ))}
            {forbidden.length === 0 && <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No forbidden words set.</p>}
          </div>
        </div>
      )}

      {/* ANCHORS */}
      {tab === 'anchors' && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Anchors are ground truth: each is a hash (0x...) mapped to exactly 12 words. The model trains on these anchors. After adding, retrain to incorporate.</p>
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>Hash (0x... 40-char hex) — optional, auto-generated from words if empty</label>
              <input type="text" value={newAnchorHash} onChange={e => setNewAnchorHash(e.target.value)} placeholder="0xe457550a86cd40bc9c123ba5d11b93c512935a12" style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem', fontFamily: 'monospace' }} />
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'block', marginBottom: '0.25rem' }}>12 Words (space separated)</label>
              <input type="text" value={newAnchorWords} onChange={e => setNewAnchorWords(e.target.value)} placeholder="series repair voice prepare novel volcano absurd fiscal risk fame fox state" style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
              <span style={{ fontSize: '0.7rem', color: newAnchorWords.trim().split(/\s+/).filter(Boolean).length === 12 ? '#22c55e' : 'var(--text-tertiary)' }}>{newAnchorWords.trim() ? newAnchorWords.trim().split(/\s+/).filter(Boolean).length : 0}/12 words</span>
            </div>
            <button onClick={addAnchor} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>Add Anchor</button>
          </div>
          {anchors.length === 0 ? <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No anchors set.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {anchors.map(a => {
                const cc = CC[a.cluster?.toLowerCase()] || '#888';
                return (
                  <div key={a.id} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: `3px solid ${cc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ padding: '0.1rem 0.4rem', background: cc + '22', color: cc, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginRight: '0.5rem' }}>{a.cluster}</span>
                        <span style={{ fontSize: '0.8rem' }}>{a.words?.join(' ')}</span>
                      </div>
                      <button onClick={() => removeAnchor(a.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FORMULA */}
      {tab === 'formula' && formula && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          <FR title="Resonance Scale" value={String(formula.resonance_scale ?? 'N/A')} desc="Controls the overall resonance field magnitude" />
          <FR title="Spin Factor" value={String(formula.spin_factor ?? 'N/A')} desc="Weight applied to spin vector calculations" />
          <FR title="Energy Decay" value={String(formula.energy_decay ?? 'N/A')} desc="Rate of energy dissipation per cycle" />
          <FR title="Cluster Threshold" value={String(formula.cluster_threshold ?? 'N/A')} desc="Minimum distance for cluster boundary detection" />
          <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Raw Formula</h4>
            <pre style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(formula, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* PREDICTIONS */}
      {tab === 'predictions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Prediction History <span style={{ color: 'var(--text-tertiary)', fontWeight: 400, fontSize: '0.85rem' }}>({predsTotal} in DB)</span></h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={fetchData} style={{ padding: '0.4rem 0.75rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}><RefreshCw size={14} /> Refresh</button>
              {predsTotal > 0 && <button onClick={clearPredictions} style={{ padding: '0.4rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.8rem' }}><Trash2 size={14} /> Clear</button>}
            </div>
          </div>
          {predictions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <History size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p style={{ margin: 0 }}>No predictions yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '600px', overflowY: 'auto' }}>
              {predictions.map(p => {
                const cc = CC[p.cluster?.toLowerCase()] || '#888';
                const words = p.output_words || p.input_words || [];
                const hash = p.input_hash || p.output_hash || '';
                return (
                  <div key={p.id} style={{ padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: `3px solid ${cc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ padding: '0.1rem 0.4rem', background: cc + '22', color: cc, borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{p.cluster}</span>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>r={Number(p.r).toFixed(2)} spin={Number(p.spin).toFixed(2)} E={Number(p.energy).toFixed(2)}</span>
                        {p.is_anchor && <span style={{ background: '#f59e0b22', color: '#f59e0b', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '3px' }}>ANCHOR</span>}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>{new Date(p.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8rem' }}>
                        {p.input_hash && <span style={{ color: 'var(--text-tertiary)', marginRight: '0.5rem' }}>Hash:</span>}
                        {p.input_hash && <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: '0.75rem' }}>{p.input_hash.slice(0, 20)}...</span>}
                        {!p.input_hash && words.length > 0 && <span style={{ color: 'var(--text-primary)' }}>{words.slice(0, 6).join(' ')}{words.length > 6 ? '...' : ''}</span>}
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>[{p.xyz?.map(v => Number(v).toFixed(2)).join(', ')}]</span>
                    </div>
                    {p.output_words && p.output_words.length > 0 && p.input_hash && (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#6366f1' }}>
                        Predicted: {p.output_words.join(', ')}
                      </div>
                    )}
                    {p.output_hash && p.input_words && (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.75rem', color: '#6366f1', fontFamily: 'monospace' }}>
                        Predicted hash: {p.output_hash}
                      </div>
                    )}
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

const SC: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '0.2rem' }}>{label}</div>
    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: color || 'var(--text-primary)' }}>{value}</div>
  </div>
);

const FR: React.FC<{ title: string; value: string; desc?: string }> = ({ title, value, desc }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
    <div>
      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{title}</span>
      {desc && <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: '2px' }}>{desc}</div>}
    </div>
    <span style={{ fontFamily: 'monospace', color: '#6366f1', fontSize: '1.1rem', fontWeight: 600 }}>{value}</span>
  </div>
);

export default V8ControlPanel;
