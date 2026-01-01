import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles, Search, Book, Code, Zap, Bot, GitBranch,
  Shield, Globe, Database, Settings, Play, ChevronRight,
  ChevronDown, ExternalLink, Copy, Check, Terminal,
  FileText, Layers, Cpu, Key, Webhook, Clock
} from 'lucide-react';

type DocSection = 'getting-started' | 'agents' | 'workflows' | 'api' | 'sdk' | 'security';

interface DocItem {
  id: string;
  title: string;
  description?: string;
  items?: { id: string; title: string }[];
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#050508',
    color: '#fff',
    display: 'flex',
  },
  sidebar: {
    width: '280px',
    background: 'rgba(255,255,255,0.02)',
    borderRight: '1px solid rgba(255,255,255,0.06)',
    padding: '1.5rem 0',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '0 1.5rem 1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '1rem',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '1.125rem',
    fontWeight: '700',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 0.875rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
  },
  searchInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '0.875rem',
    outline: 'none',
  },
  navSection: {
    padding: '0.5rem 0',
  },
  navTitle: {
    padding: '0.5rem 1.5rem',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 1.5rem',
    fontSize: '0.875rem',
    color: '#888',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navItemActive: {
    color: '#fff',
    background: 'rgba(99,102,241,0.1)',
    borderRight: '2px solid #6366f1',
  },
  navIcon: {
    width: '18px',
    height: '18px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subNav: {
    paddingLeft: '3rem',
  },
  subNavItem: {
    padding: '0.5rem 1rem',
    fontSize: '0.8rem',
    color: '#666',
    cursor: 'pointer',
    borderLeft: '1px solid rgba(255,255,255,0.08)',
  },
  subNavItemActive: {
    color: '#6366f1',
    borderLeftColor: '#6366f1',
  },
  main: {
    flex: 1,
    marginLeft: '280px',
    padding: '2rem 3rem',
    maxWidth: '900px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8rem',
    color: '#666',
    marginBottom: '1.5rem',
  },
  breadcrumbLink: {
    color: '#888',
    cursor: 'pointer',
  },
  docTitle: {
    fontSize: '2.25rem',
    fontWeight: '700',
    marginBottom: '0.75rem',
  },
  docDescription: {
    fontSize: '1.1rem',
    color: '#888',
    lineHeight: 1.6,
    marginBottom: '2rem',
  },
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  paragraph: {
    fontSize: '0.95rem',
    color: '#aaa',
    lineHeight: 1.8,
    marginBottom: '1rem',
  },
  codeBlock: {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '1.5rem',
  },
  codeHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  codeLanguage: {
    fontSize: '0.75rem',
    color: '#888',
    fontWeight: '500',
  },
  copyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.75rem',
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    borderRadius: '6px',
    color: '#888',
    fontSize: '0.75rem',
    cursor: 'pointer',
  },
  codeContent: {
    padding: '1rem 1.25rem',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    color: '#e2e8f0',
    overflowX: 'auto',
    lineHeight: 1.6,
  },
  infoBox: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  infoIcon: {
    color: '#6366f1',
    flexShrink: 0,
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#a5b4fc',
    lineHeight: 1.6,
  },
  warningBox: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem 1.25rem',
    background: 'rgba(245,158,11,0.1)',
    border: '1px solid rgba(245,158,11,0.2)',
    borderRadius: '12px',
    marginBottom: '1.5rem',
  },
  warningIcon: {
    color: '#f59e0b',
    flexShrink: 0,
  },
  warningText: {
    fontSize: '0.875rem',
    color: '#fcd34d',
    lineHeight: 1.6,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    padding: '1.25rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  cardIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '0.75rem',
  },
  cardTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '0.35rem',
  },
  cardDesc: {
    fontSize: '0.8rem',
    color: '#888',
  },
  tableWrapper: {
    overflowX: 'auto',
    marginBottom: '1.5rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.875rem',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.03)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    fontWeight: '600',
    color: '#aaa',
  },
  td: {
    padding: '0.75rem 1rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#888',
  },
  badge: {
    display: 'inline-flex',
    padding: '0.2rem 0.5rem',
    background: 'rgba(99,102,241,0.15)',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '500',
    color: '#a5b4fc',
  },
  toc: {
    position: 'fixed',
    right: '2rem',
    top: '6rem',
    width: '200px',
    padding: '1rem',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
  },
  tocTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  tocItem: {
    fontSize: '0.8rem',
    color: '#888',
    padding: '0.35rem 0',
    cursor: 'pointer',
  },
  tocItemActive: {
    color: '#6366f1',
  },
};

const navigation: { section: DocSection; icon: React.ReactNode; title: string; items: DocItem[] }[] = [
  {
    section: 'getting-started',
    icon: <Book size={16} />,
    title: 'Getting Started',
    items: [
      { id: 'introduction', title: 'Introduction' },
      { id: 'quickstart', title: 'Quick Start' },
      { id: 'installation', title: 'Installation' },
      { id: 'authentication', title: 'Authentication' },
    ],
  },
  {
    section: 'agents',
    icon: <Bot size={16} />,
    title: 'Agents',
    items: [
      { id: 'creating-agents', title: 'Creating Agents' },
      { id: 'configuration', title: 'Configuration' },
      { id: 'tools', title: 'Tools & Capabilities' },
      { id: 'execution', title: 'Execution' },
    ],
  },
  {
    section: 'workflows',
    icon: <GitBranch size={16} />,
    title: 'Workflows',
    items: [
      { id: 'overview', title: 'Overview' },
      { id: 'designer', title: 'Visual Designer' },
      { id: 'triggers', title: 'Triggers' },
      { id: 'scheduling', title: 'Scheduling' },
    ],
  },
  {
    section: 'api',
    icon: <Code size={16} />,
    title: 'API Reference',
    items: [
      { id: 'overview', title: 'Overview' },
      { id: 'agents-api', title: 'Agents API' },
      { id: 'executions-api', title: 'Executions API' },
      { id: 'webhooks', title: 'Webhooks' },
    ],
  },
  {
    section: 'sdk',
    icon: <Terminal size={16} />,
    title: 'SDKs',
    items: [
      { id: 'python', title: 'Python SDK' },
      { id: 'javascript', title: 'JavaScript SDK' },
      { id: 'rest', title: 'REST API' },
    ],
  },
  {
    section: 'security',
    icon: <Shield size={16} />,
    title: 'Security',
    items: [
      { id: 'overview', title: 'Overview' },
      { id: 'api-keys', title: 'API Keys' },
      { id: 'compliance', title: 'Compliance' },
    ],
  },
];

export default function DocsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialSection = (searchParams.get('section') as DocSection) || 'getting-started';
  
  const [activeSection, setActiveSection] = useState<DocSection>(initialSection);
  const [activeItem, setActiveItem] = useState('introduction');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const renderContent = () => {
    if (activeSection === 'getting-started') {
      return (
        <>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Home</span>
            <ChevronRight size={14} />
            <span>Docs</span>
            <ChevronRight size={14} />
            <span>Getting Started</span>
          </div>

          <h1 style={styles.docTitle}>Getting Started</h1>
          <p style={styles.docDescription}>
            Learn how to build and deploy autonomous AI agents with ResonantGenesis. 
            This guide will get you up and running in just a few minutes.
          </p>

          <div style={styles.cardGrid}>
            <div style={styles.card} onClick={() => setActiveItem('quickstart')}>
              <div style={{ ...styles.cardIcon, background: 'rgba(99,102,241,0.15)' }}>
                <Zap size={20} color="#6366f1" />
              </div>
              <div style={styles.cardTitle}>Quick Start</div>
              <div style={styles.cardDesc}>Get your first agent running in 5 minutes</div>
            </div>
            <div style={styles.card} onClick={() => setActiveItem('installation')}>
              <div style={{ ...styles.cardIcon, background: 'rgba(16,185,129,0.15)' }}>
                <Terminal size={20} color="#10b981" />
              </div>
              <div style={styles.cardTitle}>Installation</div>
              <div style={styles.cardDesc}>Set up the SDK in your project</div>
            </div>
            <div style={styles.card} onClick={() => setActiveItem('authentication')}>
              <div style={{ ...styles.cardIcon, background: 'rgba(245,158,11,0.15)' }}>
                <Key size={20} color="#f59e0b" />
              </div>
              <div style={styles.cardTitle}>Authentication</div>
              <div style={styles.cardDesc}>Configure API keys and OAuth</div>
            </div>
            <div style={styles.card} onClick={() => navigate('/agents/new')}>
              <div style={{ ...styles.cardIcon, background: 'rgba(139,92,246,0.15)' }}>
                <Bot size={20} color="#8b5cf6" />
              </div>
              <div style={styles.cardTitle}>Create Agent</div>
              <div style={styles.cardDesc}>Build your first AI agent</div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Terminal size={20} /> Installation
            </h2>
            <p style={styles.paragraph}>
              Install the ResonantGenesis SDK using your preferred package manager:
            </p>

            <div style={styles.codeBlock}>
              <div style={styles.codeHeader}>
                <span style={styles.codeLanguage}>bash</span>
                <button 
                  style={styles.copyBtn}
                  onClick={() => copyCode('npm install @resonantgenesis/sdk', 'install')}
                >
                  {copiedCode === 'install' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCode === 'install' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre style={styles.codeContent}>
{`# Using npm
npm install @resonantgenesis/sdk

# Using yarn
yarn add @resonantgenesis/sdk

# Using pnpm
pnpm add @resonantgenesis/sdk`}
              </pre>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Key size={20} /> Authentication
            </h2>
            <p style={styles.paragraph}>
              Get your API key from the dashboard and configure the SDK:
            </p>

            <div style={styles.codeBlock}>
              <div style={styles.codeHeader}>
                <span style={styles.codeLanguage}>typescript</span>
                <button 
                  style={styles.copyBtn}
                  onClick={() => copyCode(`import { ResonantGenesis } from '@resonantgenesis/sdk';

const client = new ResonantGenesis({
  apiKey: process.env.RG_API_KEY,
});`, 'auth')}
                >
                  {copiedCode === 'auth' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCode === 'auth' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre style={styles.codeContent}>
{`import { ResonantGenesis } from '@resonantgenesis/sdk';

const client = new ResonantGenesis({
  apiKey: process.env.RG_API_KEY,
});`}
              </pre>
            </div>

            <div style={styles.warningBox}>
              <Shield size={18} style={styles.warningIcon} />
              <div style={styles.warningText}>
                <strong>Security:</strong> Never expose your API key in client-side code. 
                Use environment variables and server-side implementations.
              </div>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>
              <Bot size={20} /> Create Your First Agent
            </h2>
            <p style={styles.paragraph}>
              Here's a simple example of creating and running an agent:
            </p>

            <div style={styles.codeBlock}>
              <div style={styles.codeHeader}>
                <span style={styles.codeLanguage}>typescript</span>
                <button 
                  style={styles.copyBtn}
                  onClick={() => copyCode(`const agent = await client.agents.create({
  name: 'My Assistant',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant.',
  tools: ['web_search', 'calculator'],
});

const result = await client.agents.execute(agent.id, {
  input: 'What is the capital of France?',
});

console.log(result.output);`, 'agent')}
                >
                  {copiedCode === 'agent' ? <Check size={12} /> : <Copy size={12} />}
                  {copiedCode === 'agent' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre style={styles.codeContent}>
{`const agent = await client.agents.create({
  name: 'My Assistant',
  model: 'gpt-4',
  systemPrompt: 'You are a helpful assistant.',
  tools: ['web_search', 'calculator'],
});

const result = await client.agents.execute(agent.id, {
  input: 'What is the capital of France?',
});

console.log(result.output);`}
              </pre>
            </div>

            <div style={styles.infoBox}>
              <Zap size={18} style={styles.infoIcon} />
              <div style={styles.infoText}>
                <strong>Pro tip:</strong> Use the Agent Creation Wizard in the dashboard for a 
                visual way to configure your agents with all available options.
              </div>
            </div>
          </div>
        </>
      );
    }

    if (activeSection === 'api') {
      return (
        <>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Home</span>
            <ChevronRight size={14} />
            <span>Docs</span>
            <ChevronRight size={14} />
            <span>API Reference</span>
          </div>

          <h1 style={styles.docTitle}>API Reference</h1>
          <p style={styles.docDescription}>
            Complete reference for the ResonantGenesis REST API. All endpoints require authentication 
            via API key in the Authorization header.
          </p>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Base URL</h2>
            <div style={styles.codeBlock}>
              <div style={styles.codeHeader}>
                <span style={styles.codeLanguage}>url</span>
              </div>
              <pre style={styles.codeContent}>https://api.resonantgenesis.com/v1</pre>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Authentication</h2>
            <p style={styles.paragraph}>
              Include your API key in the Authorization header:
            </p>
            <div style={styles.codeBlock}>
              <div style={styles.codeHeader}>
                <span style={styles.codeLanguage}>http</span>
              </div>
              <pre style={styles.codeContent}>Authorization: Bearer YOUR_API_KEY</pre>
            </div>
          </div>

          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Endpoints</h2>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Method</th>
                    <th style={styles.th}>Endpoint</th>
                    <th style={styles.th}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={styles.td}><span style={styles.badge}>GET</span></td>
                    <td style={styles.td}>/agents</td>
                    <td style={styles.td}>List all agents</td>
                  </tr>
                  <tr>
                    <td style={styles.td}><span style={{ ...styles.badge, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>POST</span></td>
                    <td style={styles.td}>/agents</td>
                    <td style={styles.td}>Create a new agent</td>
                  </tr>
                  <tr>
                    <td style={styles.td}><span style={styles.badge}>GET</span></td>
                    <td style={styles.td}>/agents/:id</td>
                    <td style={styles.td}>Get agent details</td>
                  </tr>
                  <tr>
                    <td style={styles.td}><span style={{ ...styles.badge, background: 'rgba(245,158,11,0.15)', color: '#fcd34d' }}>PUT</span></td>
                    <td style={styles.td}>/agents/:id</td>
                    <td style={styles.td}>Update an agent</td>
                  </tr>
                  <tr>
                    <td style={styles.td}><span style={{ ...styles.badge, background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>DELETE</span></td>
                    <td style={styles.td}>/agents/:id</td>
                    <td style={styles.td}>Delete an agent</td>
                  </tr>
                  <tr>
                    <td style={styles.td}><span style={{ ...styles.badge, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>POST</span></td>
                    <td style={styles.td}>/agents/:id/execute</td>
                    <td style={styles.td}>Execute an agent</td>
                  </tr>
                  <tr>
                    <td style={styles.td}><span style={styles.badge}>GET</span></td>
                    <td style={styles.td}>/executions</td>
                    <td style={styles.td}>List executions</td>
                  </tr>
                  <tr>
                    <td style={styles.td}><span style={styles.badge}>GET</span></td>
                    <td style={styles.td}>/usage</td>
                    <td style={styles.td}>Get usage summary</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    // Default content for other sections
    return (
      <>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} />
          <span>Docs</span>
          <ChevronRight size={14} />
          <span>{navigation.find(n => n.section === activeSection)?.title}</span>
        </div>

        <h1 style={styles.docTitle}>{navigation.find(n => n.section === activeSection)?.title}</h1>
        <p style={styles.docDescription}>
          Documentation for this section is coming soon. Check back later or explore other sections.
        </p>

        <div style={styles.cardGrid}>
          {navigation.find(n => n.section === activeSection)?.items.map((item) => (
            <div key={item.id} style={styles.card}>
              <div style={styles.cardTitle}>{item.title}</div>
              <div style={styles.cardDesc}>Coming soon</div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logo} onClick={() => navigate('/')}>
            <div style={styles.logoIcon}>
              <Sparkles size={20} color="#fff" />
            </div>
            <span style={styles.logoText}>Docs</span>
          </div>
          <div style={styles.searchBox}>
            <Search size={16} color="#666" />
            <input
              style={styles.searchInput}
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {navigation.map((nav) => (
          <div key={nav.section} style={styles.navSection}>
            <div
              style={{
                ...styles.navItem,
                ...(activeSection === nav.section ? styles.navItemActive : {}),
              }}
              onClick={() => setActiveSection(nav.section)}
            >
              <span style={styles.navIcon}>{nav.icon}</span>
              {nav.title}
            </div>
            {activeSection === nav.section && (
              <div style={styles.subNav}>
                {nav.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...styles.subNavItem,
                      ...(activeItem === item.id ? styles.subNavItemActive : {}),
                    }}
                    onClick={() => setActiveItem(item.id)}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        {renderContent()}
      </main>
    </div>
  );
}
