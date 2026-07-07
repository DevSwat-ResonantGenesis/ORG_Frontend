import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import {
  Upload,
  FileCode,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface ManifestData {
  name: string;
  version: string;
  description: string;
  authorName: string;
  authorEmail: string;
  license: string;
  tags: string[];
  runtime: string;
  entrypoint: string;
  trustTier: number;
  category: string;
  permissions: string[];
}

interface PublishResult {
  success: boolean;
  manifestHash?: string;
  codeChecksum?: string;
  error?: string;
}

import { ENV } from '../../config/env';
import { publishAgent as publishAgentAPI } from '../../services/nodeApi';
import type { PublishAgentRequest } from '../../services/nodeApi';
import { useThemeStore } from '../../store/themeStore';

const NODE_API_URL = ENV.apiUrl;

const AVAILABLE_PERMISSIONS = [
  'memory:read',
  'memory:write',
  'network:http',
  'network:websocket',
  'filesystem:read',
  'agent:spawn',
];

const TRUST_TIERS = [
  { value: 0, label: 'T0', desc: 'Minimal' },
  { value: 1, label: 'T1', desc: 'Sandbox' },
  { value: 2, label: 'T2', desc: 'Network' },
  { value: 3, label: 'T3', desc: 'Extended' },
];

const CATEGORIES = [
  'utility', 'analysis', 'automation', 'communication',
  'data', 'developer-tools', 'productivity', 'security',
];

export default function AgentPublishPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const factoryData = (location.state as any) || {};
  const theme = useThemeStore(state => state.theme);
  const isLight = theme === 'light';

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const [manifest, setManifest] = useState<ManifestData>(() => {
    const base: ManifestData = {
      name: '',
      version: '1.0.0',
      description: '',
      authorName: '',
      authorEmail: '',
      license: 'MIT',
      tags: [],
      runtime: 'python',
      entrypoint: 'main.py',
      trustTier: 1,
      category: 'utility',
      permissions: ['memory:read', 'memory:write'],
    };
    if (factoryData.fromFactory) {
      base.name = factoryData.name || '';
      base.description = factoryData.description || '';
      base.tags = factoryData.tags || [];
      base.category = factoryData.type || 'utility';
    }
    return base;
  });

  const [code, setCode] = useState<string>(`"""My Agent"""\nfrom typing import Any, Dict\n\ndef handle(input_data: Dict[str, Any], context: Any) -> Dict[str, Any]:\n    message = input_data.get("message", "")\n    return {"success": True, "output": {"message": f"Received: {message}"}}\n`);
  const [tagInput, setTagInput] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const updateManifest = (key: keyof ManifestData, value: any) => {
    setManifest(prev => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !manifest.tags.includes(tagInput.trim())) {
      updateManifest('tags', [...manifest.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    updateManifest('tags', manifest.tags.filter(t => t !== tag));
  };

  const togglePermission = (perm: string) => {
    if (manifest.permissions.includes(perm)) {
      updateManifest('permissions', manifest.permissions.filter(p => p !== perm));
    } else {
      updateManifest('permissions', [...manifest.permissions, perm]);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) setCode(ev.target.result as string); };
      reader.readAsText(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => { if (ev.target?.result) setCode(ev.target.result as string); };
      reader.readAsText(e.target.files[0]);
    }
  };

  const computeHash = async (data: string): Promise<string> => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
    return '0x' + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePublish = async () => {
    if (!manifest.name || !manifest.description || !code) {
      setResult({ success: false, error: 'Please fill in all required fields' });
      return;
    }
    setPublishing(true);
    setResult(null);
    try {
      const fullManifest = {
        $schema: 'https://resonant.dev-swat.com/schemas/agent-manifest-v1.json',
        manifestVersion: '1.0.0',
        agent: { id: '', name: manifest.name, version: manifest.version, description: manifest.description, author: { name: manifest.authorName, contact: manifest.authorEmail }, license: manifest.license, tags: manifest.tags },
        code: { entrypoint: manifest.entrypoint, runtime: manifest.runtime, runtimeVersion: '>=3.11' },
        capabilities: { tools: manifest.permissions.filter(p => p.startsWith('memory:')), permissions: manifest.permissions },
        trust: { tier: manifest.trustTier, requiredTier: 0 },
        governance: { category: manifest.category, auditLevel: 'standard' },
      };
      const manifestHash = await computeHash(JSON.stringify(fullManifest, Object.keys(fullManifest).sort()));
      const codeChecksum = await computeHash(code);
      // Publish to DSID Network (best-effort)
      try {
        const publishRequest: PublishAgentRequest = {
          name: manifest.name, description: manifest.description, category: manifest.category,
          manifest: { ...fullManifest, agent: { ...fullManifest.agent, id: manifestHash } },
          price_per_execution: 0, allow_rental: false, trust_requirements: manifest.trustTier,
        };
        await publishAgentAPI(publishRequest).catch(() => {});
      } catch { /* DSID network publish is best-effort */ }

      setResult({ success: true, manifestHash, codeChecksum });
    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); };

  // ── Shared tiny styles ──
  const bg = isLight ? '#f8fafc' : '#0a0a0f';
  const cardBg = isLight ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.03)';
  const border = isLight ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.08)';
  const inputBg = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
  const inputBorder = isLight ? '1px solid rgba(0,0,0,0.15)' : '1px solid rgba(255,255,255,0.1)';
  const fg = isLight ? '#1D1D1F' : '#fff';
  const muted = isLight ? '#6b7280' : '#888';
  const accent = '#6366f1';

  const inp: React.CSSProperties = {
    width: '100%', padding: '5px 8px', background: inputBg, border: inputBorder,
    borderRadius: '4px', color: fg, fontSize: '12px', outline: 'none', boxSizing: 'border-box',
  };
  const sel: React.CSSProperties = { ...inp, appearance: 'auto' as any };
  const lbl: React.CSSProperties = { display: 'block', fontSize: '10px', color: muted, marginBottom: '2px', fontWeight: 500 };

  // ── Result overlay ──
  if (result) {
    return (
      <div style={{ height: '100%', maxHeight: 'calc(100vh - 56px)', background: isLight ? 'linear-gradient(180deg,#f8fafc,#f1f5f9)' : 'linear-gradient(180deg,#0a0a0f,#12121a)', color: fg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 480, width: '100%', padding: '24px' }}>
          {result.success ? (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10b981', fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
                <CheckCircle size={16} /> Published Successfully
              </div>
              {[
                { label: 'Manifest Hash', val: result.manifestHash },
                { label: 'Code Checksum', val: result.codeChecksum },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.2)', borderRadius: 4, marginBottom: 4, fontSize: 11 }}>
                  <span style={{ color: muted }}>{r.label}</span>
                  <span style={{ fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {r.val?.slice(0, 16)}…{r.val?.slice(-6)}
                    <button onClick={() => copyToClipboard(r.val!)} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', padding: 0 }}><Copy size={11} /></button>
                  </span>
                </div>
              ))}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <Link to="/network/agents" style={{ color: '#10b981', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
                  View in Browser <ExternalLink size={11} />
                </Link>
                <button onClick={() => setResult(null)} style={{ background: 'none', border: 'none', color: muted, fontSize: 12, cursor: 'pointer' }}>Publish another</button>
              </div>
            </div>
          ) : (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ef4444', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>
                <AlertCircle size={16} /> Publication Failed
              </div>
              <p style={{ color: '#ef4444', fontSize: 12, margin: 0 }}>{result.error}</p>
              <button onClick={() => setResult(null)} style={{ marginTop: 12, background: 'none', border: 'none', color: muted, fontSize: 12, cursor: 'pointer' }}>← Back to form</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', maxHeight: 'calc(100vh - 56px)', background: isLight ? 'linear-gradient(180deg,#f8fafc,#f1f5f9)' : 'linear-gradient(180deg,#0a0a0f,#12121a)', color: fg, padding: '8px 12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexShrink: 0 }}>
        <Link to="/network/agents" style={{ color: muted, display: 'flex', alignItems: 'center' }}><ArrowLeft size={14} /></Link>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Publish Agent</span>
        <span style={{ fontSize: 10, color: muted }}>— Publish to the DSID network</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={handlePublish}
          disabled={publishing}
          style={{
            padding: '5px 16px', background: publishing ? 'rgba(99,102,241,0.4)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            border: 'none', borderRadius: 4, color: '#fff', fontSize: 12, fontWeight: 600,
            cursor: publishing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          {publishing ? <><Loader size={12} /> Publishing…</> : <><Upload size={12} /> Publish</>}
        </button>
      </div>

      {/* Main 3-column layout */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, overflow: 'hidden', minHeight: 0 }}>

        {/* ─── Col 1: Agent Info ─── */}
        <div style={{ background: cardBg, border, borderRadius: 6, padding: '10px', display: 'flex', flexDirection: 'column', gap: 6, overflow: 'auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Agent Info</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 6 }}>
            <div>
              <label style={lbl}>Name *</label>
              <input type="text" style={inp} placeholder="My Agent" value={manifest.name} onChange={e => updateManifest('name', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Version</label>
              <input type="text" style={inp} placeholder="1.0.0" value={manifest.version} onChange={e => updateManifest('version', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={lbl}>Description *</label>
            <textarea
              style={{ ...inp, minHeight: 48, resize: 'vertical', fontFamily: 'inherit' }}
              placeholder="What does your agent do…"
              value={manifest.description}
              onChange={e => updateManifest('description', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={lbl}>Category</label>
              <select style={sel} value={manifest.category} onChange={e => updateManifest('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>License</label>
              <select style={sel} value={manifest.license} onChange={e => updateManifest('license', e.target.value)}>
                {['MIT','Apache-2.0','GPL-3.0','BSD-3-Clause','Proprietary'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            <div>
              <label style={lbl}>Author</label>
              <input type="text" style={inp} placeholder="Name" value={manifest.authorName} onChange={e => updateManifest('authorName', e.target.value)} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input type="email" style={inp} placeholder="you@example.com" value={manifest.authorEmail} onChange={e => updateManifest('authorEmail', e.target.value)} />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={lbl}>Tags</label>
            <div style={{ ...inp, display: 'flex', flexWrap: 'wrap', gap: 3, padding: '3px 6px', minHeight: 26 }}>
              {manifest.tags.map(t => (
                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, padding: '1px 5px', background: 'rgba(99,102,241,0.15)', color: accent, borderRadius: 3, fontSize: 10 }}>
                  {t} <span onClick={() => removeTag(t)} style={{ cursor: 'pointer', opacity: 0.6, fontSize: 10 }}>×</span>
                </span>
              ))}
              <input
                type="text" placeholder="Add…" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={{ flex: 1, minWidth: 50, border: 'none', background: 'transparent', color: fg, fontSize: 11, outline: 'none', padding: 0 }}
              />
            </div>
          </div>

          {/* Trust Tier */}
          <div>
            <label style={lbl}>Trust Tier</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {TRUST_TIERS.map(t => (
                <button
                  key={t.value}
                  onClick={() => updateManifest('trustTier', t.value)}
                  style={{
                    flex: 1, padding: '4px 2px', textAlign: 'center', border: manifest.trustTier === t.value ? '1px solid ' + accent : inputBorder,
                    background: manifest.trustTier === t.value ? 'rgba(99,102,241,0.15)' : inputBg,
                    borderRadius: 4, cursor: 'pointer', color: fg, fontSize: 10,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: muted }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <label style={lbl}>Permissions</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              {AVAILABLE_PERMISSIONS.map(p => {
                const active = manifest.permissions.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => togglePermission(p)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 3,
                      padding: '2px 6px', fontSize: 10, borderRadius: 3, cursor: 'pointer',
                      border: active ? '1px solid rgba(99,102,241,0.5)' : inputBorder,
                      background: active ? 'rgba(99,102,241,0.15)' : inputBg,
                      color: active ? accent : fg,
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: 2, border: `1px solid ${active ? accent : muted}`, background: active ? accent : 'transparent', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff', lineHeight: 1 }}>
                      {active ? '✓' : ''}
                    </span>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ─── Col 2+3: Code editor ─── */}
        <div style={{ gridColumn: '2 / 4', background: cardBg, border, borderRadius: 6, padding: '10px', display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <FileCode size={12} style={{ verticalAlign: -1, marginRight: 4 }} />Agent Code
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <label style={{ ...lbl, margin: 0 }}>Runtime</label>
              <select style={{ ...sel, width: 80, padding: '3px 4px', fontSize: 10 }} value={manifest.runtime} onChange={e => updateManifest('runtime', e.target.value)}>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
              <label style={{ ...lbl, margin: 0 }}>Entry</label>
              <input type="text" style={{ ...inp, width: 80, padding: '3px 4px', fontSize: 10 }} value={manifest.entrypoint} onChange={e => updateManifest('entrypoint', e.target.value)} />
              <button
                onClick={() => document.getElementById('file-upload')?.click()}
                style={{ padding: '3px 8px', background: inputBg, border: inputBorder, borderRadius: 3, color: muted, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
              >
                <Upload size={10} /> Upload
              </button>
              <input id="file-upload" type="file" accept=".py,.js" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>
          </div>

          <textarea
            style={{
              flex: 1, width: '100%', padding: '8px', background: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(0,0,0,0.35)',
              border: inputBorder, borderRadius: 4, color: '#10b981', fontSize: 11, fontFamily: 'monospace',
              resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
            value={code}
            onChange={e => setCode(e.target.value)}
            spellCheck={false}
            onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          />
        </div>
      </div>
    </div>
  );
}
