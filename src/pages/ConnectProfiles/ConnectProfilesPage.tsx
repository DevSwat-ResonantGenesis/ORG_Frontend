import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ConnectProfilesPage.module.css';
import { connectGitHub, getGitHubStatus } from '@/api/github';
import { initiateGoogleServiceConnection } from '@/api/sso';
import fastapiClient from '@/api/fastapiClient';
import { logger } from '@/utils/logger';
import { fetchUserApiKeys, addUserApiKey, deleteUserApiKey, validateApiKey, API_KEY_PROVIDERS } from '@/api/userApiKeys';

interface Integration {
  id: string;
  name: string;
  description: string;
  emoji: string;
  icon?: string;
  logoColor: string;
  category: string;
  authType: 'oauth' | 'pat' | 'apikey' | 'openclaw' | 'coming_soon';
  status: 'connected' | 'available' | 'coming_soon';
  keyLabel?: string;
  keyPlaceholder?: string;
  helpUrl?: string;
  helpText?: string;
}

const IntegrationIcon: React.FC<{ ig: Integration; size?: number }> = ({ ig, size = 24 }) =>
  ig.icon
    ? <img src={ig.icon} alt={ig.name} style={{ width: size, height: size, objectFit: 'contain', borderRadius: 4 }} />
    : <span style={{ fontSize: size }}>{ig.emoji}</span>;

const INTEGRATIONS: Integration[] = [
  { id: 'github', name: 'GitHub', description: 'Push projects, sync repos, trigger CI/CD pipelines directly from the builder.', emoji: '🐙', icon: '/images/connect-icons/github.png', logoColor: '#e4e4e7', category: 'Version Control', authType: 'oauth', status: 'available', keyLabel: 'Personal Access Token', keyPlaceholder: 'ghp_...', helpUrl: 'https://github.com/settings/tokens/new?scopes=repo,read:user', helpText: 'Create token with repo & read:user scopes' },
  { id: 'gitlab', name: 'GitLab', description: 'Push generated projects to your GitLab repositories.', emoji: '🦊', icon: '/images/connect-icons/gitlab.png', logoColor: '#FC6D26', category: 'Version Control', authType: 'pat', status: 'available', keyLabel: 'Personal Access Token', keyPlaceholder: 'glpat-...', helpUrl: 'https://gitlab.com/-/profile/personal_access_tokens', helpText: 'Scopes: api, read_user, write_repository' },
  { id: 'bitbucket', name: 'Bitbucket', description: 'Sync projects to Bitbucket repositories.', emoji: '🪣', icon: '/images/connect-icons/bitbucket.png', logoColor: '#0052CC', category: 'Version Control', authType: 'pat', status: 'available', keyLabel: 'App Password', keyPlaceholder: 'ATBB...', helpUrl: 'https://bitbucket.org/account/settings/app-passwords/', helpText: 'Repositories read/write permission required' },
  { id: 'openclaw', name: 'Openclaw', description: "Connect to Openclaw's agent network for cross-platform AI orchestration via webhooks.", emoji: '🦞', icon: '/images/connect-icons/openclaw.svg', logoColor: '#FF4500', category: 'AI & Intelligence', authType: 'openclaw', status: 'available' },
  { id: 'local-llm', name: 'Local LLM', description: 'Connect your own local LLM (Ollama, LM Studio, llama.cpp) running on your device.', emoji: '💻', logoColor: '#22d3ee', category: 'AI & Intelligence', authType: 'apikey', status: 'available', keyLabel: 'Local Endpoint URL', keyPlaceholder: 'http://localhost:11434/v1', helpText: 'Enter the API endpoint of your local model server (e.g. Ollama, LM Studio)' },
  { id: 'digitalocean', name: 'DigitalOcean', description: 'Deploy projects to DigitalOcean Droplets, App Platform, or Kubernetes.', emoji: '🌊', icon: '/images/connect-icons/digitalocean.png', logoColor: '#0080FF', category: 'Cloud & Hosting', authType: 'pat', status: 'available', keyLabel: 'Personal Access Token', keyPlaceholder: 'dop_v1_...', helpUrl: 'https://cloud.digitalocean.com/account/api/tokens', helpText: 'Read/write access required' },
  { id: 'vercel', name: 'Vercel', description: 'One-click deploy React/Next.js projects to the Vercel edge network.', emoji: '▲', icon: '/images/connect-icons/vercel.svg', logoColor: '#ffffff', category: 'Cloud & Hosting', authType: 'pat', status: 'available', keyLabel: 'Access Token', keyPlaceholder: 'vercel_token_...', helpUrl: 'https://vercel.com/account/tokens', helpText: 'Create from Vercel account settings' },
  { id: 'netlify', name: 'Netlify', description: 'Deploy static sites and serverless functions to Netlify CDN.', emoji: '🌐', icon: '/images/connect-icons/netlify.png', logoColor: '#00C7B7', category: 'Cloud & Hosting', authType: 'pat', status: 'available', keyLabel: 'Personal Access Token', keyPlaceholder: 'nfp_...', helpUrl: 'https://app.netlify.com/user/applications#personal-access-tokens', helpText: 'Create from Netlify user settings' },
  { id: 'railway', name: 'Railway', description: 'Deploy any backend project to Railway with automatic scaling.', emoji: '🚂', icon: '/images/connect-icons/railway.png', logoColor: '#7A3FDE', category: 'Cloud & Hosting', authType: 'pat', status: 'available', keyLabel: 'API Token', keyPlaceholder: 'railway_token_...', helpUrl: 'https://railway.app/account/tokens', helpText: 'Create from Railway account settings' },
  { id: 'aws', name: 'Amazon AWS', description: 'Deploy to EC2, Lambda, ECS, or S3.', emoji: '☁️', logoColor: '#FF9900', category: 'Cloud & Hosting', authType: 'coming_soon', status: 'coming_soon' },
  { id: 'google-calendar', name: 'Google Calendar', description: 'Schedule deployments and milestones synced to your calendar.', emoji: '📅', icon: '/images/connect-icons/google-calendar.png', logoColor: '#4285F4', category: 'Productivity', authType: 'oauth', status: 'available' },
  { id: 'google-drive', name: 'Google Drive', description: 'Save generated projects and docs directly to Google Drive.', emoji: '📁', icon: '/images/connect-icons/google-drive.png', logoColor: '#34A853', category: 'Productivity', authType: 'oauth', status: 'available' },
  { id: 'notion', name: 'Notion', description: 'Auto-create project docs and changelogs in Notion.', emoji: '📝', icon: '/images/connect-icons/notion.png', logoColor: '#ffffff', category: 'Productivity', authType: 'pat', status: 'available', keyLabel: 'Integration Token', keyPlaceholder: 'secret_...', helpUrl: 'https://www.notion.so/my-integrations', helpText: 'Create an internal integration' },
  { id: 'slack', name: 'Slack', description: 'Get build and deployment notifications in Slack channels.', emoji: '💬', icon: '/images/connect-icons/slack.png', logoColor: '#4A154B', category: 'Productivity', authType: 'pat', status: 'available', keyLabel: 'Bot OAuth Token', keyPlaceholder: 'xoxb-...', helpUrl: 'https://api.slack.com/apps', helpText: 'Create a Slack app and get Bot User OAuth Token' },
  { id: 'discord', name: 'Discord', description: 'Connect a ResonantGenesis AI agent to your Discord server.', emoji: '🎮', icon: '/images/connect-icons/discord.png', logoColor: '#5865F2', category: 'Productivity', authType: 'oauth', status: 'available' },
  { id: 'figma', name: 'Figma', description: 'Import Figma designs to auto-generate UI code and components.', emoji: '🎨', icon: '/images/connect-icons/figma.png', logoColor: '#1ABCFE', category: 'Design', authType: 'pat', status: 'available', keyLabel: 'Personal Access Token', keyPlaceholder: 'figd_...', helpUrl: 'https://www.figma.com/settings', helpText: 'Generate from Figma account settings' },
  { id: 'supabase', name: 'Supabase', description: 'Auto-provision databases, auth and storage for generated backends.', emoji: '⚡', icon: '/images/connect-icons/supabase.png', logoColor: '#3ECF8E', category: 'Databases', authType: 'pat', status: 'available', keyLabel: 'Access Token', keyPlaceholder: 'sbp_...', helpUrl: 'https://supabase.com/dashboard/account/tokens', helpText: 'Generate from Supabase account settings' },
  { id: 'mongodb', name: 'MongoDB Atlas', description: 'Auto-create Atlas databases for generated projects.', emoji: '🍃', icon: '/images/connect-icons/mongodb.png', logoColor: '#13AA52', category: 'Databases', authType: 'apikey', status: 'available', keyLabel: 'API Key', keyPlaceholder: 'xxxxxxxx-xxxx-...', helpUrl: 'https://cloud.mongodb.com/v2#/org/settings/apiKeys', helpText: 'Create from Atlas organization settings' },
  { id: 'firebase', name: 'Firebase', description: 'Real-time databases, auth, and cloud functions.', emoji: '🔥', icon: '/images/connect-icons/firebase.png', logoColor: '#FFCA28', category: 'Databases', authType: 'coming_soon', status: 'coming_soon' },
  { id: 'stripe', name: 'Stripe', description: 'Auto-configure Stripe checkout and subscriptions in e-commerce projects.', emoji: '💳', icon: '/images/connect-icons/stripe.png', logoColor: '#6772E5', category: 'Payments', authType: 'apikey', status: 'available', keyLabel: 'Secret Key', keyPlaceholder: 'sk_live_... or sk_test_...', helpUrl: 'https://dashboard.stripe.com/apikeys', helpText: 'Use test key for development' },
  { id: 'twilio', name: 'Twilio', description: 'Add SMS and messaging to your generated applications.', emoji: '📱', icon: '/images/connect-icons/twilio.png', logoColor: '#F22F46', category: 'Communication', authType: 'apikey', status: 'available', keyLabel: 'Auth Token', keyPlaceholder: 'xxxxxxxx...', helpUrl: 'https://console.twilio.com', helpText: 'Get Account SID and Auth Token from Twilio Console' },
  { id: 'sendgrid', name: 'SendGrid', description: 'Configure transactional email in generated apps.', emoji: '📧', icon: '/images/connect-icons/sendgrid.png', logoColor: '#1A82E2', category: 'Communication', authType: 'apikey', status: 'available', keyLabel: 'API Key', keyPlaceholder: 'SG...', helpUrl: 'https://app.sendgrid.com/settings/api_keys', helpText: 'Create with Mail Send permission' },
  { id: 'zapier', name: 'Zapier', description: 'Trigger Zapier workflows on build completion and project events.', emoji: '⚡', icon: '/images/connect-icons/zapier.png', logoColor: '#FF4A00', category: 'Automation', authType: 'apikey', status: 'available', keyLabel: 'Webhook URL', keyPlaceholder: 'https://hooks.zapier.com/...', helpUrl: 'https://zapier.com', helpText: 'Create a Zap with Webhook trigger' },
  { id: 'n8n', name: 'n8n', description: 'Open-source workflow automation for advanced build pipelines.', emoji: '🔄', icon: '/images/connect-icons/n8n.png', logoColor: '#EA4B71', category: 'Automation', authType: 'apikey', status: 'available', keyLabel: 'Webhook URL', keyPlaceholder: 'https://your-n8n.com/webhook/...', helpUrl: 'https://n8n.io', helpText: 'Create a Webhook node in your n8n workflow' },
  { id: 'sentry', name: 'Sentry', description: 'Auto-configure error tracking in your generated applications.', emoji: '🛡️', icon: '/images/connect-icons/sentry.png', logoColor: '#362D59', category: 'Monitoring', authType: 'apikey', status: 'available', keyLabel: 'Auth Token', keyPlaceholder: 'sntrys_...', helpUrl: 'https://sentry.io/settings/account/api/auth-tokens/', helpText: 'Create from Sentry account settings' },
  { id: 'datadog', name: 'Datadog', description: 'Monitor deployed applications with APM, logs, and metrics.', emoji: '📊', icon: '/images/connect-icons/datadog.png', logoColor: '#632CA6', category: 'Monitoring', authType: 'apikey', status: 'available', keyLabel: 'API Key', keyPlaceholder: 'xxxxxxxx...', helpUrl: 'https://app.datadoghq.com/organization-settings/api-keys', helpText: 'Get from Datadog Organization Settings' },
  { id: 'newrelic', name: 'New Relic', description: 'Full-stack observability and performance monitoring.', emoji: '🔍', icon: '/images/connect-icons/newrelic.png', logoColor: '#1CE783', category: 'Monitoring', authType: 'coming_soon', status: 'coming_soon' },
];

const PROVIDER_STYLES: Record<string, { emoji: string; icon?: string; color: string }> = {
  openai: { emoji: '🤖', icon: '/images/connect-icons/openai.png', color: '#10A37F' },
  anthropic: { emoji: '🧠', icon: '/images/connect-icons/claude.png', color: '#D4A574' },
  google: { emoji: '✨', icon: '/images/connect-icons/gemini.jpeg', color: '#4285F4' },
  mistral: { emoji: '🌊', icon: '/images/connect-icons/mistral.png', color: '#FF7000' },
  groq: { emoji: '⚡', icon: '/images/connect-icons/groq.png', color: '#F55036' },
  cohere: { emoji: '🔮', icon: '/images/connect-icons/cohere.webp', color: '#39594D' },
  together: { emoji: '🤝', icon: '/images/connect-icons/together.jpeg', color: '#6366F1' },
  deepseek: { emoji: '🔍', icon: '/images/connect-icons/deepseek.jpeg', color: '#4D6BFE' },
  openrouter: { emoji: '🔀', icon: '/images/connect-icons/openrouter.png', color: '#6366F1' },
  perplexity: { emoji: '🎯', icon: '/images/connect-icons/perplexity.png', color: '#20808D' },
  fireworks: { emoji: '🎆', icon: '/images/connect-icons/fireworks.png', color: '#FF6600' },
  huggingface: { emoji: '🤗', icon: '/images/connect-icons/huggingface.png', color: '#FF9A00' },
  replicate: { emoji: '🔄', icon: '/images/connect-icons/replicate.webp', color: '#3B82F6' },
  stability: { emoji: '🎨', icon: '/images/connect-icons/stability.jpg', color: '#7C3AED' },
  elevenlabs: { emoji: '🎙️', icon: '/images/connect-icons/elevenlabs.jpeg', color: '#000000' },
  github: { emoji: '🐙', icon: '/images/connect-icons/github.png', color: '#e4e4e7' },
  grok: { emoji: '🤖', icon: '/images/connect-icons/grok.webp', color: '#000000' },
  kimi: { emoji: '🌙', icon: '/images/connect-icons/kimi.png', color: '#000000' },
  metaai: { emoji: '🔷', icon: '/images/connect-icons/metaai.jpeg', color: '#0668E1' },
  copilot: { emoji: '🤖', icon: '/images/connect-icons/copilot.jpeg', color: '#2B88D8' },
  glm: { emoji: '🧠', icon: '/images/connect-icons/glm.png', color: '#4285F4' },
  chatgpt: { emoji: '💬', icon: '/images/connect-icons/chatgpt.png', color: '#10A37F' },
};

const CATEGORIES = ['Version Control', 'AI & Intelligence', 'Cloud & Hosting', 'Productivity', 'Design', 'Databases', 'Payments', 'Communication', 'Automation', 'Monitoring'];
const CAT_EMOJI: Record<string, string> = { 'Version Control': '🔀', 'AI & Intelligence': '🤖', 'Cloud & Hosting': '☁️', Productivity: '📋', Design: '🎨', Databases: '🗄️', Payments: '💳', Communication: '📡', Automation: '⚡', Monitoring: '📊' };

const ConnectProfilesPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  // display label per integration id ('connected' or github username)
  const [connections, setConnections] = useState<Record<string, string>>({});
  // key IDs from auth service DB, needed for deletion
  const [keyIds, setKeyIds] = useState<Record<string, string>>({});
  const [modal, setModal] = useState<Integration | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [discordInviteUrl, setDiscordInviteUrl] = useState<string | null>(null);
  const [providersOpen, setProvidersOpen] = useState(true);
  const [providerModal, setProviderModal] = useState<typeof API_KEY_PROVIDERS[number] | null>(null);
  const [providerKeyInput, setProviderKeyInput] = useState('');
  const [providerKeyName, setProviderKeyName] = useState('');
  const [providerSaving, setProviderSaving] = useState(false);
  const [providerValidation, setProviderValidation] = useState<{ valid: boolean; error?: string } | null>(null);
  const [openclawAgents, setOpenclawAgents] = useState<{ id: string; name: string }[]>([]);
  const [openclawSelectedAgent, setOpenclawSelectedAgent] = useState('');
  const [openclawConnName, setOpenclawConnName] = useState('');
  const [openclawResult, setOpenclawResult] = useState<{ webhook_url: string; webhook_secret: string } | null>(null);
  const [openclawSaving, setOpenclawSaving] = useState(false);

  const loadConnections = useCallback(async () => {
    // Load from the existing encrypted user_api_keys DB (same system as Model Provider Keys)
    const keys = await fetchUserApiKeys();
    const map: Record<string, string> = {};
    const ids: Record<string, string> = {};
    keys.forEach(k => {
      map[k.provider] = 'connected';
      ids[k.provider] = k.id;
    });
    setConnections(map);
    setKeyIds(ids);
    // For GitHub: also get the username from the status endpoint
    getGitHubStatus().then(s => {
      if (s.connected && s.username) setConnections(p => ({ ...p, github: s.username! }));
    }).catch(() => {});
  }, []);

  useEffect(() => { loadConnections(); }, [loadConnections]);

  // Load OpenClaw connection status on mount
  useEffect(() => {
    fastapiClient.get('/api/v1/openclaw/status').then(resp => {
      if (resp.data?.connected) {
        setConnections(p => ({ ...p, openclaw: `${resp.data.connection_count} webhook(s)` }));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const c = searchParams.get('connect');
    if (c) { const ig = INTEGRATIONS.find(i => i.id === c); if (ig && ig.status !== 'coming_soon') setModal(ig); }
    // Returned from GitHub OAuth flow — reload to pick up newly stored token
    if (searchParams.get('github') === 'connected') loadConnections();
    // Returned from Google service OAuth (Drive/Calendar/Gmail)
    const serviceStatus = searchParams.get('status');
    const serviceName = searchParams.get('service');
    if (serviceName && serviceStatus) {
      if (serviceStatus === 'connected') {
        setMsg({ type: 'success', text: `${serviceName.replace('google-', 'Google ').replace('-', ' ')} connected successfully!` });
        loadConnections();
      } else if (serviceStatus === 'error') {
        const errorMsg = searchParams.get('message') || 'Connection failed';
        setMsg({ type: 'error', text: `Failed to connect ${serviceName}: ${errorMsg}` });
      }
    }
  }, [searchParams, loadConnections]);

  const saveConn = async (id: string, token: string, name?: string) => {
    // Uses existing addUserApiKey which saves to auth service DB with proper encryption
    const result = await addUserApiKey({ provider: id, apiKey: token, name: name || `${id} Key` });
    if (!result.success) throw new Error(result.error || 'Failed to save');
    if (result.key) {
      setKeyIds(p => ({ ...p, [id]: result.key!.id }));
      // For GitHub, get username via status endpoint
      if (id === 'github') {
        getGitHubStatus().then(s => {
          setConnections(p => ({ ...p, github: s.connected && s.username ? s.username! : 'connected' }));
        }).catch(() => setConnections(p => ({ ...p, [id]: 'connected' })));
      } else {
        setConnections(p => ({ ...p, [id]: 'connected' }));
      }
    }
  };

  const disconnect = async (id: string) => {
    const keyId = keyIds[id];
    if (keyId) {
      await deleteUserApiKey(keyId);
    }
    // Also evict from in-memory GitHub cache by clearing OAuth token on server (best effort)
    setConnections(p => { const u = { ...p }; delete u[id]; return u; });
    setKeyIds(p => { const u = { ...p }; delete u[id]; return u; });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? INTEGRATIONS.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)) : INTEGRATIONS;
  }, [search]);

  const connected = INTEGRATIONS.filter(i => connections[i.id]);
  const connectedProviders = API_KEY_PROVIDERS.filter(p => p.id !== 'github' && connections[p.id]);
  const totalConnected = connected.length + connectedProviders.length;

  const openModal = async (ig: Integration) => {
    if (ig.status === 'coming_soon') return;
    setModal(ig); setInputValue(''); setMsg(null);
    if (ig.id === 'discord') {
      try {
        const resp = await fastapiClient.get('/api/v1/discord/invite-url');
        if (resp.data?.invite_url) setDiscordInviteUrl(resp.data.invite_url);
      } catch { setDiscordInviteUrl(null); }
    }
    if (ig.id === 'openclaw') {
      setOpenclawSelectedAgent(''); setOpenclawConnName(''); setOpenclawResult(null);
      fastapiClient.get('/api/v1/agents/').then(resp => {
        const agents = (resp.data?.agents || resp.data || []).map((a: any) => ({ id: a.id, name: a.name || a.id }));
        setOpenclawAgents(agents);
      }).catch(() => setOpenclawAgents([]));
    }
  };

  const handleOAuth = async (ig: Integration) => {
    if (ig.id === 'github') { connectGitHub(); setModal(null); return; }
    if (ig.id === 'discord') {
      // Discord uses bot invite flow — handled via direct link in modal
      if (discordInviteUrl) window.open(discordInviteUrl, '_blank', 'noopener');
      return;
    }
    // Google service connections (Drive, Calendar, Gmail)
    const googleServices: Record<string, string> = { 'google-drive': 'google-drive', 'google-calendar': 'google-calendar', 'gmail': 'gmail' };
    const service = googleServices[ig.id];
    if (service) {
      try {
        const result = await initiateGoogleServiceConnection(service);
        // Store state for verification on callback
        sessionStorage.setItem(`sso_state_google-service-${service}`, result.state);
        sessionStorage.setItem('google_service_pending', service);
        window.location.href = result.authorization_url;
      } catch (e: any) {
        logger.error('Google service OAuth failed', e);
        setMsg({ type: 'error', text: e?.response?.data?.detail || 'Failed to start Google authorization.' });
      }
      return;
    }
    setModal(null);
  };

  const handleSave = async () => {
    if (!modal || !inputValue.trim()) return;
    setSaving(true); setMsg(null);
    try {
      await saveConn(modal.id, inputValue.trim(), `${modal.name} Key`);
      setMsg({ type: 'success', text: `${modal.name} connected! Key stored securely (encrypted on server).` });
      setTimeout(() => { setModal(null); setMsg(null); }, 1200);
    } catch (e) { logger.error('save integration', e); setMsg({ type: 'error', text: 'Failed to save. Please try again.' }); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerIcon}>⚡</div>
          <div className={styles.headerText}>
            <h1>Integrations</h1>
            <p>Connect services, AI model providers, and local LLMs — all in one place. {INTEGRATIONS.filter(i => i.status !== 'coming_soon').length}+ integrations.</p>
          </div>
        </div>
      </div>

      <div className={styles.searchBar}>
        <input className={styles.searchInput} placeholder="Search integrations (GitHub, Stripe, Notion…)" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {msg && !modal && (
        <div style={{ margin: '0 0 var(--space-4)', padding: 'var(--space-3) var(--space-4)', borderRadius: '8px', background: msg.type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: msg.type === 'success' ? '#10b981' : '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
          <button onClick={() => setMsg(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}

      <div className={styles.connectedSummary}>
        <span className={styles.summaryTitle}>✅ Connected ({totalConnected})</span>
        {totalConnected === 0
          ? <span className={styles.noConnected}>No integrations connected yet — pick one below to get started.</span>
          : <div className={styles.summaryChips}>
              {connected.map(i => <span key={i.id} className={styles.summaryChip} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IntegrationIcon ig={i} size={14} /> {i.name}</span>)}
              {connectedProviders.map(p => {
                const ps = PROVIDER_STYLES[p.id];
                return <span key={p.id} className={styles.summaryChip} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{ps?.icon ? <img src={ps.icon} alt={p.name} style={{ width: 14, height: 14, objectFit: 'contain', borderRadius: 2 }} /> : <span style={{ fontSize: 14 }}>{ps?.emoji || '🔑'}</span>} {p.name}</span>;
              })}
            </div>
        }
      </div>

      <div className={styles.category}>
        <div className={styles.categoryHeader} onClick={() => setProvidersOpen(p => !p)} style={{ cursor: 'pointer', userSelect: 'none' }}>
          <span className={styles.categoryEmoji}>🔑</span>
          <span className={styles.categoryTitle}>Model Provider API Keys</span>
          <span className={styles.categoryCount}>{API_KEY_PROVIDERS.filter(p => p.id !== 'github').length}</span>
          <span style={{ fontSize: 12, color: '#71717a', transition: 'transform 0.2s', transform: providersOpen ? 'rotate(180deg)' : 'rotate(0deg)', marginLeft: 8 }}>▼</span>
        </div>
        {providersOpen && (
          <div className={styles.grid}>
            {API_KEY_PROVIDERS.filter(p => p.id !== 'github').map(prov => {
              const ps = PROVIDER_STYLES[prov.id] || { emoji: '🔑', color: '#71717a' };
              const isConn = !!connections[prov.id];
              return (
                <div key={prov.id} className={`${styles.card} ${isConn ? styles.connected : ''}`} onClick={() => { if (!isConn) { setProviderModal(prov); setProviderKeyInput(''); setProviderKeyName(''); setProviderValidation(null); setMsg(null); } }}>
                  {isConn && <div className={styles.connectedGlow} />}
                  <div className={styles.cardTop}>
                    <div className={styles.logo} style={{ background: `${ps.color}22`, color: ps.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {ps.icon ? <img src={ps.icon} alt={prov.name} style={{ width: 20, height: 20, objectFit: 'contain', borderRadius: 4 }} /> : <span style={{ fontSize: 16 }}>{ps.emoji}</span>}
                    </div>
                    <div className={styles.cardMeta}>
                      <h3 className={styles.cardName}>{prov.name}</h3>
                      <p className={styles.cardDesc}>{(prov.models || []).slice(0, 3).join(', ') || 'API Key'}</p>
                    </div>
                    <span className={`${styles.statusBadge} ${isConn ? styles.connected : styles.available}`}>
                      <span className={`${styles.dot} ${isConn ? styles.green : styles.purple}`} />
                      {isConn ? 'Connected' : 'Available'}
                    </span>
                  </div>
                  <div className={styles.cardFooter}>
                    {isConn ? (
                      <>
                        <span className={styles.connectedInfo}>••••••••</span>
                        <button className={`${styles.connectBtn} ${styles.danger}`} onClick={e => { e.stopPropagation(); disconnect(prov.id); }}>Disconnect</button>
                      </>
                    ) : (
                      <button className={`${styles.connectBtn} ${styles.primary}`} onClick={e => { e.stopPropagation(); setProviderModal(prov); setProviderKeyInput(''); setProviderKeyName(''); setProviderValidation(null); setMsg(null); }}>Connect</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className={styles.content}>
        {CATEGORIES.map(cat => {
          const items = filtered.filter(i => i.category === cat);
          if (!items.length) return null;
          return (
            <div key={cat} className={styles.category}>
              <div className={styles.categoryHeader}>
                <span className={styles.categoryEmoji}>{CAT_EMOJI[cat]}</span>
                <span className={styles.categoryTitle}>{cat}</span>
                <span className={styles.categoryCount}>{items.length}</span>
              </div>
              <div className={styles.grid}>
                {items.map(ig => {
                  const isConn = !!connections[ig.id];
                  const isSoon = ig.status === 'coming_soon';
                  return (
                    <div key={ig.id} className={`${styles.card} ${isConn ? styles.connected : ''} ${isSoon ? styles.comingSoon : ''}`} onClick={() => !isConn && openModal(ig)}>
                      {isConn && <div className={styles.connectedGlow} />}
                      <div className={styles.cardTop}>
                        <div className={styles.logo} style={{ background: `${ig.logoColor}22`, color: ig.logoColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IntegrationIcon ig={ig} size={20} /></div>
                        <div className={styles.cardMeta}>
                          <h3 className={styles.cardName}>{ig.name}</h3>
                          <p className={styles.cardDesc}>{ig.description}</p>
                        </div>
                        <span className={`${styles.statusBadge} ${isConn ? styles.connected : isSoon ? styles.comingSoon : styles.available}`}>
                          <span className={`${styles.dot} ${isConn ? styles.green : isSoon ? styles.gray : styles.purple}`} />
                          {isConn ? 'Connected' : isSoon ? 'Soon' : 'Available'}
                        </span>
                      </div>
                      <div className={styles.cardFooter}>
                        {isConn ? (
                          <>
                            <span className={styles.connectedInfo}>
                              {ig.authType === 'oauth' ? connections[ig.id] : '••••••••'}
                            </span>
                            <button className={`${styles.connectBtn} ${styles.danger}`} onClick={e => { e.stopPropagation(); disconnect(ig.id); }}>Disconnect</button>
                          </>
                        ) : isSoon ? (
                          <button className={`${styles.connectBtn} ${styles.disabled}`} disabled>Coming Soon</button>
                        ) : (
                          <button className={`${styles.connectBtn} ${styles.primary}`} onClick={e => { e.stopPropagation(); openModal(ig); }}>Connect</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className={styles.modalOverlay} onClick={() => setModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setModal(null)}>×</button>
            <div className={styles.modalHeader}>
              <div className={styles.modalLogo} style={{ background: `${modal.logoColor}22`, color: modal.logoColor, fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IntegrationIcon ig={modal} size={28} /></div>
              <div>
                <h2 className={styles.modalTitle}>Connect {modal.name}</h2>
                <p className={styles.modalSubtitle}>{modal.description}</p>
              </div>
            </div>
            <div className={styles.modalBody}>
              {msg && <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

              {modal.authType === 'oauth' && modal.id === 'discord' && (
                <>
                  <div style={{ padding: 'var(--space-3)', background: 'rgba(88,101,242,0.08)', borderRadius: '8px', marginBottom: 'var(--space-3)', fontSize: '13px', lineHeight: '1.6' }}>
                    <strong>How it works:</strong><br/>
                    1. Click below to add the ResonantGenesis bot to your server<br/>
                    2. In your Discord server, run <code style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 4px', borderRadius: '3px' }}>/connect &lt;agent_id&gt;</code><br/>
                    3. Mention the bot to chat with your agent!
                  </div>
                  {discordInviteUrl ? (
                    <a href={discordInviteUrl} target="_blank" rel="noreferrer" className={styles.oauthBtn} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
                      onClick={async () => {
                        // Store Discord connection marker so UI shows 'Connected'
                        try {
                          await addUserApiKey({ provider: 'discord', apiKey: 'bot-invite-authorized', name: 'Discord Bot' });
                          await loadConnections();
                          setModal(null);
                          setMsg({ type: 'success', text: 'Discord bot added! Now run /connect <agent_id> in your Discord server.' });
                        } catch { /* ignore, link still opens */ }
                      }}
                    >
                      <IntegrationIcon ig={modal} size={20} /> Add Bot to Discord Server
                    </a>
                  ) : (
                    <button className={styles.oauthBtn} disabled style={{ opacity: 0.5 }}>
                      <span style={{ fontSize: 20 }}>🎮</span> Loading invite URL…
                    </button>
                  )}
                  <span className={styles.formHint} style={{ textAlign: 'center', display: 'block', marginTop: 'var(--space-2)' }}>
                    Get your Agent ID from the <a href="/agents" style={{ color: 'var(--accent-500)' }}>Agents page</a>
                  </span>
                </>
              )}

              {modal.authType === 'oauth' && modal.id !== 'discord' && (
                <>
                  <button className={styles.oauthBtn} onClick={() => handleOAuth(modal)}>
                    <span style={{ fontSize: 20 }}>{modal.emoji}</span> Connect with {modal.name}
                  </button>
                  {(modal.id === 'google-drive' || modal.id === 'google-calendar' || modal.id === 'gmail') && (
                    <span className={styles.formHint} style={{ textAlign: 'center', display: 'block', marginTop: 'var(--space-2)' }}>
                      You'll be redirected to Google to grant access. Your agent will be able to use this service.
                    </span>
                  )}
                  {modal.id === 'github' && (
                    <>
                      <div className={styles.divider}>or use a Personal Access Token</div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Personal Access Token</label>
                        <input className={styles.formInput} type="password" placeholder="ghp_..." value={inputValue} onChange={e => setInputValue(e.target.value)} autoComplete="off" />
                        <span className={styles.formHint}>🔑 <a href="https://github.com/settings/tokens/new?scopes=repo,read:user" target="_blank" rel="noreferrer">Create token</a> — repo & read:user scopes</span>
                      </div>
                      <button className={styles.submitBtn} onClick={handleSave} disabled={saving || !inputValue.trim()}>{saving ? 'Saving…' : 'Save Token'}</button>
                    </>
                  )}
                </>
              )}

              {modal.authType === 'openclaw' && (
                <>
                  {openclawResult ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div style={{ padding: 12, background: 'rgba(16,185,129,0.1)', borderRadius: 8, fontSize: 13 }}>
                        ✅ Connection created! Copy these into your OpenClaw config:
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Webhook URL</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input className={styles.formInput} readOnly value={openclawResult.webhook_url} onClick={e => (e.target as HTMLInputElement).select()} />
                          <button style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }} onClick={() => { navigator.clipboard.writeText(openclawResult.webhook_url); }}>Copy</button>
                        </div>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Webhook Secret (HMAC-SHA256)</label>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input className={styles.formInput} readOnly value={openclawResult.webhook_secret} onClick={e => (e.target as HTMLInputElement).select()} />
                          <button style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap' }} onClick={() => { navigator.clipboard.writeText(openclawResult.webhook_secret); }}>Copy</button>
                        </div>
                      </div>
                      <span className={styles.formHint}>Use these in your OpenClaw automation webhook action config. <a href="/api/v1/openclaw/setup-guide" target="_blank" rel="noreferrer">Full setup guide →</a></span>
                      <button className={styles.submitBtn} onClick={() => { setModal(null); setOpenclawResult(null); loadConnections(); }}>Done</button>
                    </div>
                  ) : (
                    <>
                      <div style={{ padding: 12, background: 'rgba(255,69,0,0.08)', borderRadius: 8, fontSize: 13, lineHeight: 1.6, marginBottom: 8 }}>
                        <strong>How it works:</strong><br/>
                        1. Select one of your agents below<br/>
                        2. A webhook trigger is created for that agent<br/>
                        3. Copy the webhook URL + secret into your OpenClaw config<br/>
                        4. OpenClaw events will trigger your agent automatically
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Select Agent</label>
                        {openclawAgents.length === 0 ? (
                          <div style={{ fontSize: 13, color: '#71717a', padding: 8 }}>Loading agents… <a href="/agents" style={{ color: 'var(--accent-500)' }}>Create one first →</a></div>
                        ) : (
                          <select className={styles.formInput} value={openclawSelectedAgent} onChange={e => setOpenclawSelectedAgent(e.target.value)} style={{ cursor: 'pointer' }}>
                            <option value="">— Choose an agent —</option>
                            {openclawAgents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                          </select>
                        )}
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.formLabel}>Connection Name (optional)</label>
                        <input className={styles.formInput} type="text" placeholder="e.g., Telegram Bot Trigger" value={openclawConnName} onChange={e => setOpenclawConnName(e.target.value)} />
                      </div>
                      <button className={styles.submitBtn} disabled={!openclawSelectedAgent || openclawSaving} onClick={async () => {
                        setOpenclawSaving(true); setMsg(null);
                        try {
                          const resp = await fastapiClient.post('/api/v1/openclaw/connections', { agent_id: openclawSelectedAgent, connection_name: openclawConnName || undefined });
                          setOpenclawResult({ webhook_url: resp.data.webhook_url, webhook_secret: resp.data.webhook_secret });
                          setConnections(p => ({ ...p, openclaw: 'connected' }));
                        } catch (e: any) {
                          const detail = e?.response?.data?.detail || e?.message || 'Failed to create connection';
                          setMsg({ type: 'error', text: detail });
                        } finally { setOpenclawSaving(false); }
                      }}>{openclawSaving ? 'Creating…' : 'Create Webhook Connection'}</button>
                    </>
                  )}
                </>
              )}

              {(modal.authType === 'pat' || modal.authType === 'apikey') && (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>🔑 {modal.keyLabel || 'API Key'}</label>
                    <input className={styles.formInput} type="password" placeholder={modal.keyPlaceholder || 'Enter your key…'} value={inputValue} onChange={e => setInputValue(e.target.value)} autoComplete="off" />
                    {modal.helpUrl && <span className={styles.formHint}><a href={modal.helpUrl} target="_blank" rel="noreferrer">Where to find this</a>{modal.helpText ? ` — ${modal.helpText}` : ''}</span>}
                  </div>
                  <button className={styles.submitBtn} onClick={handleSave} disabled={saving || !inputValue.trim()}>{saving ? 'Saving…' : `Connect ${modal.name}`}</button>
                </>
              )}

              <button className={styles.cancelBtn} onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {providerModal && (
        <div className={styles.modalOverlay} onClick={() => setProviderModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setProviderModal(null)}>×</button>
            <div className={styles.modalHeader}>
              <div className={styles.modalLogo} style={{ background: `${(PROVIDER_STYLES[providerModal.id] || { color: '#71717a' }).color}22`, color: (PROVIDER_STYLES[providerModal.id] || { color: '#71717a' }).color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(PROVIDER_STYLES[providerModal.id])?.icon ? <img src={PROVIDER_STYLES[providerModal.id].icon} alt={providerModal.name} style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} /> : <span style={{ fontSize: 28 }}>{(PROVIDER_STYLES[providerModal.id] || { emoji: '🔑' }).emoji}</span>}
              </div>
              <div>
                <h2 className={styles.modalTitle}>Connect {providerModal.name}</h2>
                <p className={styles.modalSubtitle}>{(providerModal.models || []).join(', ') || 'Add your API key'}</p>
              </div>
            </div>
            <div className={styles.modalBody}>
              {msg && <div className={msg.type === 'success' ? styles.successMsg : styles.errorMsg}>{msg.type === 'success' ? '✅' : '⚠️'} {msg.text}</div>}

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>🔑 API Key</label>
                <input className={styles.formInput} type="password" placeholder={providerModal.placeholder || 'Enter your API key…'} value={providerKeyInput} onChange={e => { setProviderKeyInput(e.target.value); setProviderValidation(null); setMsg(null); }} autoComplete="off" />
                {providerModal.helpUrl && <span className={styles.formHint}><a href={providerModal.helpUrl} target="_blank" rel="noreferrer">Get your {providerModal.name} API key →</a></span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Name (optional)</label>
                <input className={styles.formInput} type="text" placeholder="e.g., Production Key" value={providerKeyName} onChange={e => setProviderKeyName(e.target.value)} />
              </div>

              {providerValidation && (
                <div style={{ padding: '8px 12px', borderRadius: 6, fontSize: 13, background: providerValidation.valid ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', color: providerValidation.valid ? '#10b981' : '#ef4444' }}>
                  {providerValidation.valid ? '✓ API key is valid' : `✗ ${providerValidation.error || 'Invalid key'}`}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 'var(--space-3, 12px)' }}>
                <button className={styles.cancelBtn} style={{ flex: 1 }} onClick={() => setProviderModal(null)}>Cancel</button>
                <button className={styles.submitBtn} style={{ flex: 1, opacity: !providerKeyInput.trim() ? 0.5 : 1 }} disabled={!providerKeyInput.trim() || providerSaving} onClick={async () => {
                  if (!providerKeyInput.trim()) return;
                  setProviderSaving(true); setMsg(null);
                  try {
                    const vr = await validateApiKey(providerModal.id, providerKeyInput.trim());
                    setProviderValidation(vr);
                    if (!vr.valid) { setMsg({ type: 'error', text: vr.error || 'Invalid API key' }); setProviderSaving(false); return; }
                    await saveConn(providerModal.id, providerKeyInput.trim(), providerKeyName.trim() || `${providerModal.name} Key`);
                    setMsg({ type: 'success', text: `${providerModal.name} connected!` });
                    setTimeout(() => { setProviderModal(null); setMsg(null); }, 1200);
                  } catch (e: any) { setMsg({ type: 'error', text: e?.message || 'Failed to save key' }); }
                  finally { setProviderSaving(false); }
                }}>{providerSaving ? 'Saving…' : `Connect ${providerModal.name}`}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectProfilesPage;
