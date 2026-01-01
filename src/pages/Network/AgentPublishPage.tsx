import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import { 
  Upload, 
  FileCode, 
  Shield, 
  Tag, 
  User, 
  Package,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  Copy,
  ExternalLink
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

const NODE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: '100%',
    maxHeight: 'calc(100vh - 56px)',
    background: 'linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)',
    color: '#fff',
    padding: '0.5rem 1rem',
    overflowY: 'auto',
    overflowX: 'hidden',
  },
  header: {
    maxWidth: '900px',
    margin: '0 auto 5px',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    color: '#666',
    textDecoration: 'none',
    marginBottom: '0.5rem',
    fontSize: '0.7rem',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    marginBottom: '0.25rem',
    display: 'block',
  },
  subtitle: {
    color: '#666',
    fontSize: '0.7rem',
    display: 'block',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  card: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '0.75rem',
    marginBottom: '0.5rem',
  },
  cardTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  cardIcon: {
    color: '#6366f1',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  formGroupFull: {
    marginBottom: '1rem',
    gridColumn: '1 / -1',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.875rem',
    color: '#aaa',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
    minHeight: '100px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.875rem',
  },
  codeEditor: {
    width: '100%',
    minHeight: '300px',
    padding: '1rem',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '0.875rem',
    fontFamily: 'monospace',
    resize: 'vertical' as const,
  },
  uploadZone: {
    border: '2px dashed rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  uploadZoneActive: {
    border: '2px dashed #6366f1',
    background: 'rgba(99,102,241,0.1)',
  },
  uploadIcon: {
    color: '#6366f1',
    marginBottom: '1rem',
  },
  uploadText: {
    color: '#888',
    fontSize: '0.875rem',
  },
  tagInput: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    minHeight: '44px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.25rem 0.5rem',
    background: 'rgba(99,102,241,0.2)',
    color: '#6366f1',
    borderRadius: '4px',
    fontSize: '0.75rem',
  },
  tagRemove: {
    cursor: 'pointer',
    opacity: 0.7,
  },
  permissionList: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '0.5rem',
  },
  permissionItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  permissionItemActive: {
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.5)',
  },
  trustTierSelector: {
    display: 'flex',
    gap: '0.5rem',
  },
  trustTierOption: {
    flex: 1,
    padding: '0.75rem',
    textAlign: 'center' as const,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  trustTierOptionActive: {
    background: 'rgba(99,102,241,0.2)',
    borderColor: '#6366f1',
  },
  trustTierLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  trustTierDesc: {
    fontSize: '0.7rem',
    color: '#888',
    marginTop: '0.25rem',
  },
  submitButton: {
    width: '100%',
    padding: '1rem',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  submitButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  resultCard: {
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  resultTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#10b981',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '1rem',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
  },
  resultLabel: {
    color: '#888',
    fontSize: '0.875rem',
  },
  resultValue: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  copyButton: {
    background: 'none',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  errorCard: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
  },
  errorTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ef4444',
    fontSize: '1.125rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
};

const AVAILABLE_PERMISSIONS = [
  'memory:read',
  'memory:write',
  'network:http',
  'network:websocket',
  'filesystem:read',
  'agent:spawn',
];

const TRUST_TIERS = [
  { value: 0, label: 'Untrusted', desc: 'Minimal permissions' },
  { value: 1, label: 'Basic', desc: 'Standard sandbox' },
  { value: 2, label: 'Standard', desc: 'Network access' },
  { value: 3, label: 'Elevated', desc: 'Extended resources' },
];

const CATEGORIES = [
  'utility',
  'analysis',
  'automation',
  'communication',
  'data',
  'developer-tools',
  'productivity',
  'security',
];

export default function AgentPublishPage() {
  const navigate = useNavigate();

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const [manifest, setManifest] = useState<ManifestData>({
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
  });
  const [code, setCode] = useState<string>(`"""
My Agent
========
Description of what your agent does.
"""

from typing import Any, Dict

def handle(input_data: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main entry point for the agent.
    
    Args:
        input_data: Input from the user
        context: Execution context with session_id, user_dsid, trust_tier, memory
    
    Returns:
        Response dictionary with success, output, and optional memory_updates
    """
    message = input_data.get("message", "")
    
    return {
        "success": True,
        "output": {
            "message": f"Received: {message}",
            "processed": True
        },
        "memory_updates": None
    }
`);
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
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCode(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const computeHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handlePublish = async () => {
    if (!manifest.name || !manifest.description || !code) {
      setResult({ success: false, error: 'Please fill in all required fields' });
      return;
    }

    setPublishing(true);
    setResult(null);

    try {
      // Build full manifest
      const fullManifest = {
        $schema: 'https://resonantgenesis.io/schemas/agent-manifest-v1.json',
        manifestVersion: '1.0.0',
        agent: {
          id: '', // Will be set after hash
          name: manifest.name,
          version: manifest.version,
          description: manifest.description,
          author: {
            name: manifest.authorName,
            contact: manifest.authorEmail,
          },
          license: manifest.license,
          tags: manifest.tags,
        },
        code: {
          entrypoint: manifest.entrypoint,
          runtime: manifest.runtime,
          runtimeVersion: '>=3.11',
        },
        capabilities: {
          tools: manifest.permissions.filter(p => p.startsWith('memory:')),
          permissions: manifest.permissions,
        },
        trust: {
          tier: manifest.trustTier,
          requiredTier: 0,
        },
        governance: {
          category: manifest.category,
          auditLevel: 'standard',
        },
      };

      // Compute hashes
      const manifestJson = JSON.stringify(fullManifest, Object.keys(fullManifest).sort());
      const manifestHash = await computeHash(manifestJson);
      const codeChecksum = await computeHash(code);

      // Simulate successful publish (in real implementation, this would call the node API)
      await new Promise(resolve => setTimeout(resolve, 1500));

      setResult({
        success: true,
        manifestHash,
        codeChecksum,
      });

    } catch (error: any) {
      setResult({ success: false, error: error.message });
    } finally {
      setPublishing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <Link to="/network/agents" style={styles.backLink}>
          <ArrowLeft size={16} />
          Back to Agent Browser
        </Link>
        <h1 style={styles.title}>Publish Agent</h1>
        <p style={styles.subtitle}>
          Create and publish a new agent to the ResonantGenesis network
        </p>
      </div>

      <div style={styles.content}>
        {/* Agent Info */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Package size={20} style={styles.cardIcon} />
            Agent Information
          </div>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name *</label>
              <input
                type="text"
                style={styles.input}
                placeholder="My Agent"
                value={manifest.name}
                onChange={(e) => updateManifest('name', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Version</label>
              <input
                type="text"
                style={styles.input}
                placeholder="1.0.0"
                value={manifest.version}
                onChange={(e) => updateManifest('version', e.target.value)}
              />
            </div>
            <div style={styles.formGroupFull}>
              <label style={styles.label}>Description *</label>
              <textarea
                style={styles.textarea}
                placeholder="Describe what your agent does..."
                value={manifest.description}
                onChange={(e) => updateManifest('description', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Category</label>
              <select
                style={styles.select}
                value={manifest.category}
                onChange={(e) => updateManifest('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>License</label>
              <select
                style={styles.select}
                value={manifest.license}
                onChange={(e) => updateManifest('license', e.target.value)}
              >
                <option value="MIT">MIT</option>
                <option value="Apache-2.0">Apache 2.0</option>
                <option value="GPL-3.0">GPL 3.0</option>
                <option value="BSD-3-Clause">BSD 3-Clause</option>
                <option value="Proprietary">Proprietary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Author */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <User size={20} style={styles.cardIcon} />
            Author
          </div>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                style={styles.input}
                placeholder="Your name"
                value={manifest.authorName}
                onChange={(e) => updateManifest('authorName', e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                style={styles.input}
                placeholder="you@example.com"
                value={manifest.authorEmail}
                onChange={(e) => updateManifest('authorEmail', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Tag size={20} style={styles.cardIcon} />
            Tags
          </div>
          <div style={styles.tagInput}>
            {manifest.tags.map(tag => (
              <span key={tag} style={styles.tag}>
                {tag}
                <span style={styles.tagRemove} onClick={() => removeTag(tag)}>×</span>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              style={{ ...styles.input, flex: 1, minWidth: '100px', border: 'none', background: 'transparent' }}
            />
          </div>
        </div>

        {/* Trust & Permissions */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <Shield size={20} style={styles.cardIcon} />
            Trust & Permissions
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Trust Tier</label>
            <div style={styles.trustTierSelector}>
              {TRUST_TIERS.map(tier => (
                <div
                  key={tier.value}
                  style={{
                    ...styles.trustTierOption,
                    ...(manifest.trustTier === tier.value ? styles.trustTierOptionActive : {}),
                  }}
                  onClick={() => updateManifest('trustTier', tier.value)}
                >
                  <div style={styles.trustTierLabel}>{tier.label}</div>
                  <div style={styles.trustTierDesc}>{tier.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Permissions</label>
            <div style={styles.permissionList}>
              {AVAILABLE_PERMISSIONS.map(perm => (
                <div
                  key={perm}
                  style={{
                    ...styles.permissionItem,
                    ...(manifest.permissions.includes(perm) ? styles.permissionItemActive : {}),
                  }}
                  onClick={() => togglePermission(perm)}
                >
                  <input
                    type="checkbox"
                    checked={manifest.permissions.includes(perm)}
                    onChange={() => {}}
                  />
                  {perm}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Code */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>
            <FileCode size={20} style={styles.cardIcon} />
            Agent Code
          </div>
          
          <div
            style={{
              ...styles.uploadZone,
              ...(dragActive ? styles.uploadZoneActive : {}),
              marginBottom: '1rem',
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload size={32} style={styles.uploadIcon} />
            <p style={styles.uploadText}>
              Drag & drop a Python file here, or click to browse
            </p>
            <input
              id="file-upload"
              type="file"
              accept=".py"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>

          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Runtime</label>
              <select
                style={styles.select}
                value={manifest.runtime}
                onChange={(e) => updateManifest('runtime', e.target.value)}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Entrypoint</label>
              <input
                type="text"
                style={styles.input}
                placeholder="main.py"
                value={manifest.entrypoint}
                onChange={(e) => updateManifest('entrypoint', e.target.value)}
              />
            </div>
          </div>

          <textarea
            style={styles.codeEditor}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
          />
        </div>

        {/* Result */}
        {result && (
          result.success ? (
            <div style={styles.resultCard}>
              <div style={styles.resultTitle}>
                <CheckCircle size={20} />
                Agent Published Successfully!
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>Manifest Hash</span>
                <span style={styles.resultValue}>
                  {result.manifestHash?.slice(0, 20)}...{result.manifestHash?.slice(-8)}
                  <button style={styles.copyButton} onClick={() => copyToClipboard(result.manifestHash!)}>
                    <Copy size={14} />
                  </button>
                </span>
              </div>
              <div style={styles.resultItem}>
                <span style={styles.resultLabel}>Code Checksum</span>
                <span style={styles.resultValue}>
                  {result.codeChecksum?.slice(0, 20)}...{result.codeChecksum?.slice(-8)}
                  <button style={styles.copyButton} onClick={() => copyToClipboard(result.codeChecksum!)}>
                    <Copy size={14} />
                  </button>
                </span>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <Link to="/network/agents" style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  View in Agent Browser <ExternalLink size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={styles.errorCard}>
              <div style={styles.errorTitle}>
                <AlertCircle size={20} />
                Publication Failed
              </div>
              <p style={{ color: '#ef4444' }}>{result.error}</p>
            </div>
          )
        )}

        {/* Submit */}
        <button
          style={{
            ...styles.submitButton,
            ...(publishing ? styles.submitButtonDisabled : {}),
          }}
          onClick={handlePublish}
          disabled={publishing}
        >
          {publishing ? (
            <>
              <Loader size={20} className="animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload size={20} />
              Publish Agent
            </>
          )}
        </button>
      </div>
    </div>
  );
}
