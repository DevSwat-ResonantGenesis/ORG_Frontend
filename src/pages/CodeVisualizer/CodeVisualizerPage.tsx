import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';
import { isAuthenticated } from '../../utils/auth-cookies';
import { useThemeStore } from '../../store/themeStore';
import styles from './CodeVisualizerPage.module.css';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/code-visualizer'];

/* Force dark mode on this page — restore previous theme on unmount */
function useForceDarkMode() {
  const { setTheme } = useThemeStore();
  const savedTheme = useRef(useThemeStore.getState().theme);
  useEffect(() => {
    savedTheme.current = useThemeStore.getState().theme;
    if (savedTheme.current !== 'dark') setTheme('dark');
    return () => {
      if (savedTheme.current !== 'dark') setTheme(savedTheme.current);
    };
  }, []);
}

interface SavedAnalysis {
  analysis_id: string;
  project_name: string;
  source: 'github' | 'upload' | string;
  repo_url: string;
  stats: Record<string, number>;
  storage_bytes: number;
  created_at: string | null;
}

const formatBytes = (b: number) => {
  if (b < 1024) return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
};

const formatDate = (iso: string | null) => {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(); } catch { return iso.slice(0, 10); }
};

const CodeVisualizerPage: React.FC = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const apiUrl = useMemo(() => getApiUrl(), []);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useThemeStore(state => state.theme);

  const postThemeToIframe = (nextTheme: 'dark' | 'light') => {
    const targetWindow = iframeRef.current?.contentWindow;
    if (!targetWindow) return;
    targetWindow.postMessage({ type: 'RG_THEME', theme: nextTheme }, '*');
  };

  const [panelOpen, setPanelOpen] = useState(false);
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [storageLimit, setStorageLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeAnalysisId, setActiveAnalysisId] = useState<string | null>(null);

  // GitHub export state
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [exportRepoName, setExportRepoName] = useState('resonant-cv-reports');
  const [exportTargetId, setExportTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    postThemeToIframe(theme);
  }, [theme]);

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/v1/code-visualizer-ui/api/v1/analyses`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAnalyses(data.analyses || []);
      setStorageLimit(data.storage_limit ?? null);
    } catch (e: any) {
      setError(e.message || 'Failed to load analyses');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (panelOpen) fetchAnalyses();
  }, [panelOpen, fetchAnalyses]);

  // Check GitHub connection status when panel opens
  useEffect(() => {
    if (!panelOpen) return;
    fetch(`${apiUrl}/api/v1/github/status`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : { connected: false })
      .then(d => {
        setGithubConnected(d.connected || false);
        setGithubUsername(d.username || null);
      })
      .catch(() => setGithubConnected(false));
  }, [panelOpen, apiUrl]);

  const handleExportToGitHub = async (analysisId: string) => {
    if (!githubConnected) {
      window.location.href = `/connect-profiles?connect=github`;
      return;
    }
    setExportingId(analysisId);
    try {
      const res = await fetch(`${apiUrl}/api/v1/github/export/analysis`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis_id: analysisId, repo_name: exportRepoName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Export failed');
      setExportTargetId(null);
      window.open(data.file_url, '_blank');
    } catch (e: any) {
      alert(`GitHub export failed: ${e.message}`);
    } finally {
      setExportingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this saved analysis? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`${apiUrl}/api/v1/code-visualizer-ui/api/v1/analyses/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnalyses(prev => prev.filter(a => a.analysis_id !== id));
      if (activeAnalysisId === id) setActiveAnalysisId(null);
    } catch (e: any) {
      alert(`Delete failed: ${e.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLoad = (id: string) => {
    setActiveAnalysisId(id);
    setPanelOpen(false);
  };

  const iframeSrc = useMemo(() => {
    const base = `${apiUrl}/api/v1/code-visualizer-ui/`;
    return activeAnalysisId ? `${base}?analysis_id=${activeAnalysisId}` : base;
  }, [apiUrl, activeAnalysisId]);

  const usedCount = analyses.length;
  const limitPct = storageLimit ? Math.min(100, Math.round((usedCount / storageLimit) * 100)) : null;

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/code-visualizer" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/code-visualizer" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>
      {/* Main CV iframe */}
      <iframe
        ref={iframeRef}
        key={iframeSrc}
        title="Code Visualizer"
        src={iframeSrc}
        style={{ width: '100%', height: '100%', border: 0, display: 'block' }}
        allow="fullscreen"
        onLoad={() => postThemeToIframe(theme)}
      />

      {/* Saved Analyses toggle button */}
      <button
        onClick={() => setPanelOpen(o => !o)}
        style={{
          position: 'fixed', top: 16, right: panelOpen ? 368 : 16, zIndex: 1000,
          background: '#161616', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
          transition: 'right 0.25s',
        }}
        title="Your saved analyses"
      >
        <span>🗂</span> Saved Analyses
        {analyses.length > 0 && (
          <span style={{
            background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: 10,
            padding: '1px 7px', fontSize: 11, marginLeft: 4,
          }}>{analyses.length}</span>
        )}
      </button>

      {/* Sidebar panel */}
      {panelOpen && (
        <div style={{
          position: 'fixed', top: 0, right: 0, width: 360, height: '100vh',
          background: '#0a0a0c', borderLeft: '1px solid rgba(255,255,255,0.06)',
          zIndex: 999, display: 'flex', flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 15 }}>🗂 Saved Analyses</div>
              {storageLimit !== null && (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 3 }}>
                  {usedCount} / {storageLimit} used
                  <div style={{ marginTop: 4, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                    <div style={{
                      width: `${limitPct}%`, height: '100%', borderRadius: 2,
                      background: (limitPct ?? 0) > 80 ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
                      transition: 'width 0.3s',
                    }} />
                  </div>
                </div>
              )}
              {storageLimit === null && (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 2 }}>Unlimited storage</div>
              )}
              {/* GitHub status pill */}
              <div style={{ marginTop: 6 }}>
                {githubConnected ? (
                  <span style={{
                    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
                    padding: '2px 8px', fontSize: 10, fontWeight: 600,
                  }}>🐙 GitHub: {githubUsername}</span>
                ) : (
                  <button onClick={() => { window.location.href = `/connect-profiles?connect=github`; }}
                    style={{
                      background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)',
                      borderRadius: 10, padding: '2px 8px', fontSize: 10, cursor: 'pointer',
                    }}
                  >GitHub</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <button onClick={fetchAnalyses} style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)',
                borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12,
              }}>↻</button>
              <button onClick={() => setPanelOpen(false)} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
                fontSize: 18, cursor: 'pointer', padding: '0 4px',
              }}>✕</button>
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
            {loading && (
              <div style={{ color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: 32, fontSize: 13 }}>Loading...</div>
            )}
            {error && !loading && (
              <div style={{
                color: 'rgba(255,180,150,0.8)', background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                padding: 12, fontSize: 12, marginBottom: 8,
              }}>{error}</div>
            )}
            {!loading && !error && analyses.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, textAlign: 'center', padding: '40px 16px' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div>No saved analyses yet.</div>
                <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.2)' }}>Scan a GitHub repo or upload code to get started.</div>
              </div>
            )}
            {!loading && analyses.map(a => (
              <div key={a.analysis_id} style={{
                background: activeAnalysisId === a.analysis_id ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeAnalysisId === a.analysis_id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                borderRadius: 8, padding: '10px 12px', marginBottom: 8,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 14 }}>{a.source === 'github' ? '🐙' : '📦'}</span>
                      <span style={{
                        color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{a.project_name || 'Unnamed'}</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'monospace', marginBottom: 4 }}>
                      {a.analysis_id.slice(0, 16)}...
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[['⚡', a.stats?.total_functions ?? 0, 'fn'],
                        ['🔗', a.stats?.total_endpoints ?? 0, 'ep'],
                        ['📄', a.stats?.total_files ?? 0, 'files']].map(([icon, val, label]) => (
                        <span key={String(label)} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10 }}>
                          {icon} {val} {label}
                        </span>
                      ))}
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10 }}>{formatBytes(a.storage_bytes)}</span>
                    </div>
                    {a.repo_url && (
                      <div style={{
                        color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{a.repo_url.replace('https://github.com/', '')}</div>
                    )}
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 2 }}>{formatDate(a.created_at)}</div>
                  </div>
                  <button onClick={() => handleDelete(a.analysis_id)} disabled={deletingId === a.analysis_id}
                    style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 14, padding: '2px 4px', flexShrink: 0 }}
                    title="Delete">🗑</button>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button onClick={() => handleLoad(a.analysis_id)} style={{
                    flex: 1,
                    background: activeAnalysisId === a.analysis_id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                    color: activeAnalysisId === a.analysis_id ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)',
                    border: `1px solid ${activeAnalysisId === a.analysis_id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                    borderRadius: 6, padding: '6px 0', fontSize: 12, cursor: 'pointer', fontWeight: 600,
                  }}>
                    {activeAnalysisId === a.analysis_id ? '✓ Loaded' : '▶ Load'}
                  </button>
                  <button
                    onClick={() => setExportTargetId(exportTargetId === a.analysis_id ? null : a.analysis_id)}
                    title="Push analysis report to GitHub"
                    style={{
                      background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6,
                      padding: '6px 8px', fontSize: 11, cursor: 'pointer',
                    }}
                  >🐙</button>
                </div>
                {/* Inline GitHub export form */}
                {exportTargetId === a.analysis_id && (
                  <div style={{
                    marginTop: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 8, padding: '10px 10px 8px',
                  }}>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 6 }}>
                      Push report to GitHub repo:
                    </div>
                    <input
                      value={exportRepoName}
                      onChange={e => setExportRepoName(e.target.value)}
                      placeholder="resonant-cv-reports"
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)', borderRadius: 6, padding: '5px 8px',
                        fontSize: 11, marginBottom: 6, outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => handleExportToGitHub(a.analysis_id)}
                      disabled={exportingId === a.analysis_id}
                      style={{
                        width: '100%', background: exportingId === a.analysis_id ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
                        color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                        padding: '6px 0', fontSize: 11, cursor: 'pointer', fontWeight: 600,
                      }}
                    >
                      {exportingId === a.analysis_id ? 'Pushing...' : (githubConnected ? '🐙 Push to GitHub' : '🐙 Connect & Push')}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            padding: '10px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center',
          }}>
            Analyses persist across sessions •{' '}
            {storageLimit !== null ? `${storageLimit - usedCount} slots remaining` : 'Unlimited storage'}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeVisualizerPage;
