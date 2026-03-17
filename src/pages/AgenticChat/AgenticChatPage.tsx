import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface Step {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'response' | 'error' | 'status' | 'done';
  data: any;
  timestamp: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  steps?: Step[];
  stats?: { loops: number; tokens: number; elapsed: number };
}

const TOOLS = [
  // Search & Web
  { id: 'web_search', name: 'Web Search', icon: '🔍' },
  { id: 'fetch_url', name: 'Fetch URL', icon: '🌐' },
  // Memory & Hash Sphere
  { id: 'memory_read', name: 'Memory Read', icon: '🧠' },
  { id: 'memory_write', name: 'Memory Write', icon: '💾' },
  { id: 'memory_search', name: 'Memory Search', icon: '🔎' },
  { id: 'memory_stats', name: 'Memory Stats', icon: '📊' },
  { id: 'hash_sphere_search', name: 'HS Search', icon: '🌍' },
  { id: 'hash_sphere_anchor', name: 'HS Anchor', icon: '⚓' },
  { id: 'hash_sphere_list_anchors', name: 'HS Anchors', icon: '📑' },
  { id: 'hash_sphere_hash', name: 'HS Hash', icon: '#️⃣' },
  { id: 'hash_sphere_resonance', name: 'HS Resonance', icon: '🌀' },
  // Code
  { id: 'execute_code', name: 'Execute Code', icon: '⚡' },
  // Code Visualizer
  { id: 'code_visualizer_scan', name: 'CV Scan', icon: '🔬' },
  { id: 'code_visualizer_full_analysis', name: 'CV Full Analysis', icon: '🧪' },
  { id: 'code_visualizer_trace', name: 'CV Trace', icon: '🔗' },
  { id: 'code_visualizer_functions', name: 'CV Functions', icon: '📋' },
  { id: 'code_visualizer_governance', name: 'CV Governance', icon: '🛡️' },
  { id: 'code_visualizer_list', name: 'CV List', icon: '📊' },
  { id: 'code_visualizer_report', name: 'CV Report', icon: '📄' },
  { id: 'code_visualizer_graph', name: 'CV Graph', icon: '🕸️' },
  { id: 'code_visualizer_pipeline', name: 'CV Pipeline', icon: '🛤️' },
  { id: 'code_visualizer_filter', name: 'CV Filter', icon: '🔍' },
  { id: 'code_visualizer_by_type', name: 'CV By Type', icon: '🏷️' },
  { id: 'code_visualizer_compare', name: 'CV Compare', icon: '🔄' },
  { id: 'code_visualizer_delete', name: 'CV Delete', icon: '🗑️' },
  // Agents OS
  { id: 'agents_list', name: 'Agents List', icon: '🤖' },
  { id: 'agents_create', name: 'Create Agent', icon: '➕' },
  { id: 'agents_start', name: 'Start Agent', icon: '▶️' },
  { id: 'agents_stop', name: 'Stop Agent', icon: '⏹️' },
  { id: 'agents_delete', name: 'Delete Agent', icon: '🗑️' },
  // Community
  { id: 'create_rabbit_post', name: 'Rabbit Post', icon: '🐰' },
  // Media
  { id: 'generate_image', name: 'Gen Image', icon: '🖼️' },
  { id: 'generate_audio', name: 'Gen Audio', icon: '🔊' },
  { id: 'generate_music', name: 'Gen Music', icon: '🎵' },
  // Email & Slack
  { id: 'gmail_send', name: 'Gmail Send', icon: '📧' },
  { id: 'gmail_read', name: 'Gmail Read', icon: '📨' },
  { id: 'slack_send', name: 'Slack Send', icon: '💬' },
  { id: 'slack_read', name: 'Slack Read', icon: '📩' },
  // Integrations
  { id: 'google_calendar', name: 'Calendar', icon: '📅' },
  { id: 'google_drive', name: 'Drive', icon: '📁' },
  { id: 'figma', name: 'Figma', icon: '🎨' },
  { id: 'sigma', name: 'Sigma', icon: '📈' },
  // Developer
  { id: 'http_request', name: 'HTTP Request', icon: '📡' },
];

const styles: Record<string, React.CSSProperties> = {
  root: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', color: '#e5e5e5' },
  header: { padding: '12px 24px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: '12px', background: '#111', flexShrink: 0 },
  title: { fontSize: '18px', fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle: { fontSize: '12px', color: '#555' },
  headerBtn: { padding: '5px 12px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#999', cursor: 'pointer', fontSize: '12px' },
  toolsPanel: { padding: '10px 24px', borderBottom: '1px solid #1e1e1e', background: '#0f0f0f', display: 'flex', flexWrap: 'wrap' as const, gap: '6px', flexShrink: 0 },
  messages: { flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column' as const, gap: '16px' },
  inputBar: { padding: '12px 24px', borderTop: '1px solid #1e1e1e', background: '#111', flexShrink: 0 },
  inputRow: { display: 'flex', gap: '10px', alignItems: 'flex-end' },
  textarea: { flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #333', background: '#1a1a1a', color: '#e5e5e5', fontSize: '14px', resize: 'none' as const, outline: 'none', fontFamily: 'inherit', minHeight: '42px', maxHeight: '120px' },
  sendBtn: { padding: '10px 18px', borderRadius: '10px', border: 'none', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  statsBar: { padding: '4px 24px', borderTop: '1px solid #1a1a1a', fontSize: '11px', color: '#444', display: 'flex', gap: '16px', flexShrink: 0 },
};

const AgenticChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [enabledTools, setEnabledTools] = useState<string[]>(TOOLS.map(t => t.id));
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [lastStats, setLastStats] = useState<{ loops: number; tokens: number; elapsed: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const resp = await fetch('/api/v1/agentic-chat/conversations', { credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json();
        setConversations(data.conversations || []);
      }
    } catch (e) { console.error('Load conversations error:', e); }
    setLoadingConvs(false);
  }, []);

  const loadConversation = useCallback(async (convId: string) => {
    try {
      const resp = await fetch(`/api/v1/agentic-chat/conversations/${convId}`, { credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json();
        const msgs = (data.messages || []).map((m: any) => ({
          role: m.role,
          content: m.content,
          steps: [],
        }));
        setMessages(msgs);
        setActiveConvId(convId);
        setCurrentSteps([]);
        setLastStats(null);
      }
    } catch (e) { console.error('Load conversation error:', e); }
  }, []);

  const newConversation = useCallback(() => {
    setMessages([]);
    setCurrentSteps([]);
    setLastStats(null);
    setActiveConvId('');
  }, []);

  const deleteConversation = useCallback(async (convId: string) => {
    try {
      await fetch(`/api/v1/agentic-chat/conversations/${convId}`, { method: 'DELETE', credentials: 'include' });
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConvId === convId) newConversation();
    } catch (e) { console.error('Delete error:', e); }
  }, [activeConvId, newConversation]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, currentSteps, scrollToBottom]);

  const toggleTool = (id: string) => {
    setEnabledTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    setIsStreaming(true);
    setCurrentSteps([]);
    setLastStats(null);

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch('/api/v1/agentic-chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: msg, conversation_id: activeConvId || undefined, conversation_history: history, enabled_tools: enabledTools, max_loops: 50 }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const steps: Step[] = [];
      let finalContent = '';
      let doneStats: any = null;

      if (!reader) throw new Error('No reader');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith('data: ') && eventType) {
            try {
              const data = JSON.parse(line.slice(6));
              const step: Step = { type: eventType as Step['type'], data, timestamp: Date.now() };
              steps.push(step);
              setCurrentSteps([...steps]);
              if (eventType === 'status' && data.conversation_id && !activeConvId) {
                setActiveConvId(data.conversation_id);
              }
              if (eventType === 'response') finalContent = data.content || '';
              if (eventType === 'done') {
                doneStats = { loops: data.loops, tokens: data.tokens, elapsed: data.elapsed_seconds };
                setLastStats(doneStats);
                loadConversations();
              }
            } catch { /* skip */ }
            eventType = '';
          }
        }
      }

      if (finalContent) {
        setMessages(prev => [...prev, { role: 'assistant', content: finalContent, steps, stats: doneStats }]);
      } else if (steps.some(s => s.type === 'error')) {
        const errStep = steps.find(s => s.type === 'error');
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errStep?.data?.error || 'Unknown'}`, steps, stats: doneStats }]);
      }
      setCurrentSteps([]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${err.message}` }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const renderStep = (step: Step, i: number) => {
    const base: React.CSSProperties = { padding: '6px 10px', borderRadius: '6px', fontSize: '12px', marginBottom: '3px', fontFamily: "'JetBrains Mono', monospace" };
    switch (step.type) {
      case 'thinking':
        return <div key={i} style={{ ...base, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> Thinking... <span style={{ opacity: 0.5 }}>(loop {step.data.loop})</span></div>;
      case 'tool_call':
        return (
          <div key={i} style={{ ...base, background: 'rgba(59,130,246,0.12)', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg> <strong>{step.data.tool}</strong>(<span style={{ opacity: 0.7 }}>{JSON.stringify(step.data.args).slice(0, 150)}</span>)
          </div>
        );
      case 'tool_result': {
        let result = step.data.result || '';
        if (result.length > 250) result = result.slice(0, 250) + '…';
        return (
          <div key={i} style={{ ...base, background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', wordBreak: 'break-all', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}><path d="M20 6L9 17l-5-5"/></svg> <span><strong>{step.data.tool}</strong>: <span style={{ opacity: 0.7 }}>{result}</span></span>
          </div>
        );
      }
      case 'error':
        return <div key={i} style={{ ...base, background: 'rgba(239,68,68,0.12)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg> {step.data.error}</div>;
      default:
        return null;
    }
  };

  const markdownComponents: any = {
    code({ inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <pre style={{ background: '#111', borderRadius: '8px', padding: '12px', overflow: 'auto', border: '1px solid #262626', margin: '8px 0' }}>
          <code className={className} style={{ fontSize: '13px', lineHeight: 1.5 }} {...props}>{children}</code>
        </pre>
      ) : (
        <code style={{ background: '#1a1a1a', padding: '2px 5px', borderRadius: '4px', fontSize: '13px' }} {...props}>{children}</code>
      );
    },
    p({ children }: any) { return <p style={{ margin: '6px 0', lineHeight: 1.6 }}>{children}</p>; },
    ul({ children }: any) { return <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>{children}</ul>; },
    ol({ children }: any) { return <ol style={{ margin: '6px 0', paddingLeft: '20px' }}>{children}</ol>; },
    h1({ children }: any) { return <h1 style={{ fontSize: '18px', fontWeight: 700, margin: '12px 0 6px' }}>{children}</h1>; },
    h2({ children }: any) { return <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '10px 0 4px' }}>{children}</h2>; },
    h3({ children }: any) { return <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '8px 0 4px' }}>{children}</h3>; },
    a({ children, href }: any) { return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline' }}>{children}</a>; },
    table({ children }: any) { return <table style={{ borderCollapse: 'collapse', margin: '8px 0', width: '100%', fontSize: '13px' }}>{children}</table>; },
    th({ children }: any) { return <th style={{ border: '1px solid #333', padding: '6px 10px', background: '#1a1a1a', textAlign: 'left' }}>{children}</th>; },
    td({ children }: any) { return <td style={{ border: '1px solid #262626', padding: '6px 10px' }}>{children}</td>; },
    blockquote({ children }: any) { return <blockquote style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '12px', margin: '8px 0', color: '#999' }}>{children}</blockquote>; },
  };

  return (
    <div style={{ ...styles.root, flexDirection: 'row' as const }}>
      {/* Conversation Sidebar */}
      {showSidebar && (
        <div style={{
          width: '260px', background: '#0d0d0d', borderRight: '1px solid #1e1e1e',
          display: 'flex', flexDirection: 'column' as const, flexShrink: 0, overflow: 'hidden',
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid #1e1e1e', display: 'flex', gap: '8px' }}>
            <button onClick={newConversation} style={{
              flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #333',
              background: '#1a1a1a', color: '#999', cursor: 'pointer', fontSize: '12px',
            }}>+ New Chat</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '6px' }}>
            {loadingConvs && <div style={{ color: '#555', fontSize: '12px', padding: '8px' }}>Loading...</div>}
            {conversations.map(c => (
              <div key={c.id} onClick={() => loadConversation(c.id)} style={{
                padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '2px',
                background: activeConvId === c.id ? '#1e1b4b' : 'transparent',
                border: activeConvId === c.id ? '1px solid #4c1d95' : '1px solid transparent',
                fontSize: '13px', color: activeConvId === c.id ? '#c4b5fd' : '#888',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>
                  {c.title || 'Untitled'}
                </span>
                <span onClick={(e) => { e.stopPropagation(); deleteConversation(c.id); }}
                  style={{ color: '#555', fontSize: '11px', cursor: 'pointer', flexShrink: 0 }}
                  title="Delete">✕</span>
              </div>
            ))}
            {!loadingConvs && conversations.length === 0 && (
              <div style={{ color: '#444', fontSize: '12px', padding: '12px', textAlign: 'center' }}>
                No conversations yet
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' as const, minWidth: 0 }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Resonant Assistant</div>
        <div style={styles.subtitle}>AI assistant with tools, memory & Hash Sphere</div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowSidebar(!showSidebar)} style={{
          ...styles.headerBtn,
          background: showSidebar ? '#1e1b4b' : '#1a1a1a',
          borderColor: showSidebar ? '#4c1d95' : '#333',
          color: showSidebar ? '#c4b5fd' : '#999',
        }}>
          💬 Chats
        </button>
        <button onClick={() => { newConversation(); }} style={styles.headerBtn}>+ New</button>
        <button onClick={() => setShowTools(!showTools)} style={{ ...styles.headerBtn, background: showTools ? '#1e1b4b' : '#1a1a1a', borderColor: showTools ? '#4c1d95' : '#333', color: showTools ? '#c4b5fd' : '#999' }}>
          🔧 Tools ({enabledTools.length}/{TOOLS.length})
        </button>
        <button onClick={() => { newConversation(); }} style={styles.headerBtn}>Clear</button>
      </div>

      {/* Tools panel */}
      {showTools && (
        <div style={styles.toolsPanel}>
          {TOOLS.map(t => (
            <button key={t.id} onClick={() => toggleTool(t.id)} style={{
              padding: '4px 10px', borderRadius: '6px', border: '1px solid',
              borderColor: enabledTools.includes(t.id) ? '#3b82f6' : '#333',
              background: enabledTools.includes(t.id) ? 'rgba(59,130,246,0.15)' : '#1a1a1a',
              color: enabledTools.includes(t.id) ? '#93c5fd' : '#555',
              cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s',
            }}>
              {t.icon} {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={styles.messages}>
        {messages.length === 0 && !isStreaming && (
          <div style={{ textAlign: 'center', marginTop: '18vh', color: '#444' }}>
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🤖</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', color: '#777' }}>Resonant Assistant</div>
            <div style={{ fontSize: '13px', maxWidth: '460px', margin: '0 auto', lineHeight: 1.6, color: '#555' }}>
              Ask me anything. I use real tools — web search, code execution,
              memory, Google services — to find answers and take actions.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'user' ? (
              <div style={{ padding: '10px 14px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6, background: '#1e3a5f', border: '1px solid #1e40af', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {msg.content}
              </div>
            ) : (
              <div style={{ padding: '12px 16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6, background: '#141414', border: '1px solid #222', wordBreak: 'break-word', width: '100%' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]} components={markdownComponents}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
            {msg.steps && msg.steps.filter(s => ['tool_call','tool_result','thinking','error'].includes(s.type)).length > 0 && (
              <details style={{ marginTop: '4px', width: '100%' }}>
                <summary style={{ cursor: 'pointer', fontSize: '11px', color: '#555', padding: '2px 0' }}>
                  ▸ {msg.steps.filter(s => s.type === 'tool_call').length} tool calls, {msg.stats?.loops || '?'} loops
                  {msg.stats ? ` · ${msg.stats.tokens.toLocaleString()} tokens · ${msg.stats.elapsed}s` : ''}
                </summary>
                <div style={{ marginTop: '4px' }}>
                  {msg.steps.filter(s => ['thinking','tool_call','tool_result','error'].includes(s.type)).map((s, j) => renderStep(s, j))}
                </div>
              </details>
            )}
          </div>
        ))}

        {/* Live streaming steps */}
        {isStreaming && currentSteps.length > 0 && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            {currentSteps.filter(s => ['thinking','tool_call','tool_result','error'].includes(s.type)).map((s, i) => renderStep(s, i))}
          </div>
        )}

        {isStreaming && currentSteps.length === 0 && (
          <div style={{ alignSelf: 'flex-start', color: '#555', fontSize: '13px', padding: '8px' }}>Connecting...</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Stats */}
      {lastStats && (
        <div style={styles.statsBar}>
          <span>Loops: {lastStats.loops}</span>
          <span>Tokens: {lastStats.tokens.toLocaleString()}</span>
          <span>Time: {lastStats.elapsed}s</span>
        </div>
      )}

      {/* Input */}
      <div style={styles.inputBar}>
        <div style={styles.inputRow}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — I'll use tools to find the answer..."
            disabled={isStreaming}
            rows={1}
            style={styles.textarea}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            style={{
              ...styles.sendBtn,
              background: isStreaming || !input.trim() ? '#333' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              cursor: isStreaming ? 'not-allowed' : 'pointer',
            }}
          >
            {isStreaming ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default AgenticChatPage;
