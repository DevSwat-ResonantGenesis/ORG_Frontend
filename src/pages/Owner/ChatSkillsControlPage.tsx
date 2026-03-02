/**
 * Owner-Only Chat Skills Control Page
 * Dedicated page for platform owner to manage, create, toggle, and deploy chat skills.
 * Route: /owner/chat-skills-control
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSessionData } from '../../utils/auth-cookies';
import fastapiClient from '../../api/fastapiClient';

interface ChatSkill {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  category: string;
  credit_cost: number;
  is_default: boolean;
  requires_api_key?: string;
  capabilities?: string[];
  agent_type?: string;
  trigger_keywords?: string[];
}

const ChatSkillsControlPage: React.FC = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<ChatSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSkill, setNewSkill] = useState({
    name: '',
    description: '',
    icon: '🧠',
    category: 'ai',
    credit_cost: 1,
    agent_type: 'reasoning',
    trigger_keywords: '',
    capabilities: '',
  });

  useEffect(() => {
    const session = getSessionData();
    if (!session?.is_superuser) {
      navigate('/dashboard');
      return;
    }
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fastapiClient.get('/skills/list');
      setSkills(res.data?.skills || []);
    } catch (err: any) {
      setError(err?.message || err?.error || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSkill = async (skillId: string, enabled: boolean) => {
    try {
      await fastapiClient.post('/skills/toggle', { skill_id: skillId, enabled });
      setSkills(prev => prev.map(s => s.id === skillId ? { ...s, enabled } : s));
    } catch (err: any) {
      alert('Failed to toggle skill: ' + (err?.message || err?.error || 'Unknown error'));
    }
  };

  const handleCreateSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.name.trim()) return;
    setSaving(true);
    try {
      const payload = {
        name: newSkill.name.trim(),
        description: newSkill.description.trim(),
        icon: newSkill.icon,
        category: newSkill.category,
        credit_cost: newSkill.credit_cost,
        agent_type: newSkill.agent_type,
        trigger_keywords: newSkill.trigger_keywords.split(',').map(k => k.trim()).filter(Boolean),
        capabilities: newSkill.capabilities.split(',').map(c => c.trim()).filter(Boolean),
      };
      await fastapiClient.post('/skills/create', payload);
      setShowCreateForm(false);
      setNewSkill({ name: '', description: '', icon: '🧠', category: 'ai', credit_cost: 1, agent_type: 'reasoning', trigger_keywords: '', capabilities: '' });
      fetchSkills();
    } catch (err: any) {
      alert('Failed to create skill: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const categoryColors: Record<string, string> = {
    ai: '#8b5cf6', search: '#3b82f6', media: '#ec4899', memory: '#10b981',
    tools: '#f59e0b', agents: '#06b6d4', physics: '#ef4444', ide: '#64748b',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e17', color: '#e2e8f0', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#f1f5f9' }}>
              🧠 Chat Skills Control Center
            </h1>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0' }}>
              Owner-only platform skill management — create, toggle, and deploy chat skills
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.14)', color: '#6ee7b7', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
            >
              {showCreateForm ? '✕ Cancel' : '+ Create New Skill'}
            </button>
            <button
              onClick={fetchSkills}
              disabled={loading}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(14,165,233,0.4)', background: 'rgba(14,165,233,0.14)', color: '#7dd3fc', fontSize: '13px', cursor: 'pointer' }}
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
            <button
              onClick={() => navigate('/owner-dashboard')}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#e2e8f0' }}>{skills.length}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Total Skills</div>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>{skills.filter(s => s.enabled).length}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Enabled</div>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444' }}>{skills.filter(s => !s.enabled).length}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Disabled</div>
          </div>
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(148,163,184,0.1)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#f59e0b' }}>{[...new Set(skills.map(s => s.category))].length}</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Categories</div>
          </div>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', color: '#6ee7b7', margin: '0 0 16px' }}>Create New Chat Skill</h2>
            <form onSubmit={handleCreateSkill}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Skill Name *</label>
                  <input value={newSkill.name} onChange={e => setNewSkill(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Code Analyzer" required
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Icon</label>
                  <input value={newSkill.icon} onChange={e => setNewSkill(p => ({ ...p, icon: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Description</label>
                  <textarea value={newSkill.description} onChange={e => setNewSkill(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="What does this skill do?"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Category</label>
                  <select value={newSkill.category} onChange={e => setNewSkill(p => ({ ...p, category: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px' }}>
                    <option value="ai">AI</option>
                    <option value="search">Search</option>
                    <option value="media">Media</option>
                    <option value="memory">Memory</option>
                    <option value="tools">Tools</option>
                    <option value="agents">Agents</option>
                    <option value="physics">Physics</option>
                    <option value="ide">IDE</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Credit Cost</label>
                  <input type="number" min={0} value={newSkill.credit_cost} onChange={e => setNewSkill(p => ({ ...p, credit_cost: Number(e.target.value) }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Agent Type</label>
                  <select value={newSkill.agent_type} onChange={e => setNewSkill(p => ({ ...p, agent_type: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px' }}>
                    {['reasoning','code','debug','review','test','research','explain','summary','planning','security','architecture','optimization','documentation','math','api','database','devops','migration','refactor','accessibility','i18n','regex','git','css'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Trigger Keywords (comma separated)</label>
                  <input value={newSkill.trigger_keywords} onChange={e => setNewSkill(p => ({ ...p, trigger_keywords: e.target.value }))} placeholder="e.g. analyze code, scan repo"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Capabilities (comma separated)</label>
                  <input value={newSkill.capabilities} onChange={e => setNewSkill(p => ({ ...p, capabilities: e.target.value }))} placeholder="e.g. code analysis, pattern detection"
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(148,163,184,0.2)', background: 'rgba(15,23,42,0.8)', color: '#e2e8f0', fontSize: '13px', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                <button type="submit" disabled={saving}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                  {saving ? 'Creating...' : 'Create Skill'}
                </button>
                <button type="button" onClick={() => setShowCreateForm(false)}
                  style={{ padding: '8px 20px', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)', background: 'transparent', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error */}
        {error && <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '13px', padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}

        {/* Skills Grid */}
        {loading && skills.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>Loading skills...</div>
        ) : skills.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 0' }}>No skills found. Create one above.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {skills.map(skill => (
              <div key={skill.id} style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid ${skill.enabled ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.1)'}`, borderRadius: '12px', padding: '20px', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#f1f5f9', fontWeight: 600 }}>
                    <span style={{ fontSize: '20px', marginRight: '8px' }}>{skill.icon}</span>{skill.name}
                  </h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: skill.enabled ? '#10b981' : '#64748b', flexShrink: 0 }}>
                    <input type="checkbox" checked={skill.enabled} onChange={e => handleToggleSkill(skill.id, e.target.checked)}
                      style={{ accentColor: '#10b981', width: '18px', height: '18px' }} />
                    {skill.enabled ? 'ON' : 'OFF'}
                  </label>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '10px 0', lineHeight: 1.5 }}>{skill.description}</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: `${categoryColors[skill.category] || '#64748b'}22`, color: categoryColors[skill.category] || '#94a3b8', fontSize: '10px', fontWeight: 600 }}>
                    {skill.category}
                  </span>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(14,165,233,0.15)', color: '#7dd3fc', fontSize: '10px' }}>
                    {skill.credit_cost} credits
                  </span>
                  {skill.is_default && <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#6ee7b7', fontSize: '10px' }}>Default</span>}
                  {skill.requires_api_key && <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '10px' }}>API Key: {skill.requires_api_key}</span>}
                </div>
                {skill.capabilities && skill.capabilities.length > 0 && (
                  <div style={{ fontSize: '11px', color: '#475569' }}>{skill.capabilities.join(' · ')}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSkillsControlPage;
