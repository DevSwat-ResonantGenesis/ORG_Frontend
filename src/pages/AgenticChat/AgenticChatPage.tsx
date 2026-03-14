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
  { id: 'web_search', name: 'Web Search', icon: '🔍' },
  { id: 'fetch_url', name: 'Fetch URL', icon: '🌐' },
  { id: 'memory_read', name: 'Memory Read', icon: '🧠' },
  { id: 'memory_write', name: 'Memory Write', icon: '💾' },
  { id: 'execute_code', name: 'Execute Code', icon: '⚡' },
  { id: 'create_rabbit_post', name: 'Rabbit Post', icon: '🐰' },
  { id: 'http_request', name: 'HTTP Request', icon: '📡' },
  { id: 'google_calendar', name: 'Calendar', icon: '📅' },
  { id: 'google_drive', name: 'Drive', icon: '📁' },
  { id: 'figma', name: 'Figma', icon: '🎨' },
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
  const [showTools, setShowTools] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [lastStats, setLastStats] = useState<{ loops: number; tokens: number; elapsed: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        body: JSON.stringify({ message: msg, conversation_history: history, enabled_tools: enabledTools, max_loops: 10 }),
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
              if (eventType === 'response') finalContent = data.content || '';
              if (eventType === 'done') { doneStats = { loops: data.loops, tokens: data.tokens, elapsed: data.elapsed_seconds }; setLastStats(doneStats); }
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
        return <div key={i} style={{ ...base, background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>🧠 Thinking... <span style={{ opacity: 0.5 }}>(loop {step.data.loop})</span></div>;
      case 'tool_call':
        return (
          <div key={i} style={{ ...base, background: 'rgba(59,130,246,0.12)', color: '#93c5fd' }}>
            🔧 <strong>{step.data.tool}</strong>(<span style={{ opacity: 0.7 }}>{JSON.stringify(step.data.args).slice(0, 150)}</span>)
          </div>
        );
      case 'tool_result': {
        let result = step.data.result || '';
        if (result.length > 250) result = result.slice(0, 250) + '…';
        return (
          <div key={i} style={{ ...base, background: 'rgba(16,185,129,0.12)', color: '#6ee7b7', wordBreak: 'break-all' }}>
            ✅ <strong>{step.data.tool}</strong>: <span style={{ opacity: 0.7 }}>{result}</span>
          </div>
        );
      }
      case 'error':
        return <div key={i} style={{ ...base, background: 'rgba(239,68,68,0.12)', color: '#fca5a5' }}>❌ {step.data.error}</div>;
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
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Resonant Agent</div>
        <div style={styles.subtitle}>Cascade-style agentic AI with tool calling</div>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowTools(!showTools)} style={{ ...styles.headerBtn, background: showTools ? '#1e1b4b' : '#1a1a1a', borderColor: showTools ? '#4c1d95' : '#333', color: showTools ? '#c4b5fd' : '#999' }}>
          🔧 Tools ({enabledTools.length}/{TOOLS.length})
        </button>
        <button onClick={() => { setMessages([]); setCurrentSteps([]); setLastStats(null); }} style={styles.headerBtn}>Clear</button>
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
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px', color: '#777' }}>Resonant Agent</div>
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
  );
};

export default AgenticChatPage;
