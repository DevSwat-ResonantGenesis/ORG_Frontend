import React, { useState, useRef, useEffect, useCallback } from 'react';

interface Step {
  type: 'thinking' | 'tool_call' | 'tool_result' | 'response' | 'error' | 'status' | 'done';
  data: any;
  timestamp: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  steps?: Step[];
}

const TOOLS = [
  { id: 'web_search', name: 'Web Search', icon: '🔍', desc: 'Search the internet' },
  { id: 'fetch_url', name: 'Fetch URL', icon: '🌐', desc: 'Read web pages' },
  { id: 'memory_read', name: 'Memory Read', icon: '🧠', desc: 'Search long-term memory' },
  { id: 'memory_write', name: 'Memory Write', icon: '💾', desc: 'Save to memory' },
  { id: 'execute_code', name: 'Execute Code', icon: '⚡', desc: 'Run Python code' },
  { id: 'create_rabbit_post', name: 'Rabbit Post', icon: '🐰', desc: 'Post to Rabbit' },
  { id: 'http_request', name: 'HTTP Request', icon: '📡', desc: 'Internal API calls' },
  { id: 'google_calendar', name: 'Calendar', icon: '📅', desc: 'Google Calendar' },
  { id: 'google_drive', name: 'Drive', icon: '📁', desc: 'Google Drive' },
  { id: 'figma', name: 'Figma', icon: '🎨', desc: 'Figma designs' },
];

const AgenticChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [enabledTools, setEnabledTools] = useState<string[]>(TOOLS.map(t => t.id));
  const [showTools, setShowTools] = useState(false);
  const [currentSteps, setCurrentSteps] = useState<Step[]>([]);
  const [stats, setStats] = useState<{ loops: number; tokens: number; elapsed: number } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    setStats(null);

    const userMsg: Message = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);

    // Build conversation history (last 10 messages)
    const history = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const response = await fetch('/api/v1/agentic-chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: msg,
          conversation_history: history,
          enabled_tools: enabledTools,
          max_loops: 10,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      const steps: Step[] = [];
      let finalContent = '';

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

              if (eventType === 'response') {
                finalContent = data.content || '';
              }
              if (eventType === 'done') {
                setStats({ loops: data.loops, tokens: data.tokens, elapsed: data.elapsed_seconds });
              }
            } catch { /* skip malformed */ }
            eventType = '';
          }
        }
      }

      // Add assistant message
      if (finalContent) {
        setMessages(prev => [...prev, { role: 'assistant', content: finalContent, steps }]);
      } else if (steps.some(s => s.type === 'error')) {
        const errStep = steps.find(s => s.type === 'error');
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${errStep?.data?.error || 'Unknown error'}`, steps }]);
      }
      setCurrentSteps([]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Connection error: ${err.message}` }]);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderStep = (step: Step, i: number) => {
    const s: React.CSSProperties = {
      padding: '8px 12px',
      borderRadius: '8px',
      fontSize: '13px',
      marginBottom: '4px',
      fontFamily: 'monospace',
    };
    switch (step.type) {
      case 'thinking':
        return <div key={i} style={{ ...s, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd' }}>🧠 Thinking... (loop {step.data.loop})</div>;
      case 'tool_call':
        return (
          <div key={i} style={{ ...s, background: 'rgba(59,130,246,0.15)', color: '#93c5fd' }}>
            🔧 <strong>{step.data.tool}</strong>({JSON.stringify(step.data.args).slice(0, 120)})
          </div>
        );
      case 'tool_result': {
        let result = step.data.result || '';
        if (result.length > 300) result = result.slice(0, 300) + '...';
        return (
          <div key={i} style={{ ...s, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
            ✅ <strong>{step.data.tool}</strong> result: <span style={{ opacity: 0.8 }}>{result}</span>
          </div>
        );
      }
      case 'error':
        return <div key={i} style={{ ...s, background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}>❌ {step.data.error}</div>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0a0a', color: '#e5e5e5' }}>
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: '12px', background: '#111' }}>
        <div style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Resonant Agent
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>Cascade-style agentic AI with tool calling</div>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowTools(!showTools)}
          style={{
            padding: '6px 14px', borderRadius: '8px', border: '1px solid #333',
            background: showTools ? '#1e1b4b' : '#1a1a1a', color: '#c4b5fd', cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          🔧 Tools ({enabledTools.length}/{TOOLS.length})
        </button>
        <button
          onClick={() => { setMessages([]); setCurrentSteps([]); setStats(null); }}
          style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#999', cursor: 'pointer', fontSize: '13px' }}
        >
          Clear
        </button>
      </div>

      {/* Tools panel */}
      {showTools && (
        <div style={{ padding: '12px 24px', borderBottom: '1px solid #1e1e1e', background: '#0f0f0f', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => toggleTool(t.id)}
              style={{
                padding: '6px 12px', borderRadius: '8px', border: '1px solid',
                borderColor: enabledTools.includes(t.id) ? '#3b82f6' : '#333',
                background: enabledTools.includes(t.id) ? 'rgba(59,130,246,0.15)' : '#1a1a1a',
                color: enabledTools.includes(t.id) ? '#93c5fd' : '#666',
                cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s',
              }}
            >
              {t.icon} {t.name}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && !isStreaming && (
          <div style={{ textAlign: 'center', marginTop: '20vh', color: '#444' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#888' }}>Resonant Agent</div>
            <div style={{ fontSize: '14px', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
              Ask me anything. I'll use real tools — web search, code execution, memory,
              Google services — to find answers, not just guess.
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              padding: '12px 16px', borderRadius: '12px', fontSize: '14px', lineHeight: 1.6,
              background: msg.role === 'user' ? '#1e3a5f' : '#1a1a1a',
              border: msg.role === 'user' ? '1px solid #2563eb' : '1px solid #262626',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {msg.content}
            </div>
            {/* Collapsed steps */}
            {msg.steps && msg.steps.length > 0 && (
              <details style={{ marginTop: '4px', width: '100%' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#666', padding: '4px 0' }}>
                  {msg.steps.filter(s => s.type === 'tool_call').length} tool calls, {msg.steps.find(s => s.type === 'done')?.data?.loops || '?'} loops
                </summary>
                <div style={{ marginTop: '4px' }}>{msg.steps.map((s, j) => renderStep(s, j))}</div>
              </details>
            )}
          </div>
        ))}

        {/* Live streaming steps */}
        {isStreaming && currentSteps.length > 0 && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '85%' }}>
            {currentSteps.map((s, i) => renderStep(s, i))}
          </div>
        )}

        {isStreaming && currentSteps.length === 0 && (
          <div style={{ alignSelf: 'flex-start', color: '#666', fontSize: '14px' }}>
            <span style={{ animation: 'pulse 1.5s infinite' }}>Connecting...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Stats bar */}
      {stats && (
        <div style={{ padding: '4px 24px', borderTop: '1px solid #1e1e1e', fontSize: '11px', color: '#555', display: 'flex', gap: '16px' }}>
          <span>Loops: {stats.loops}</span>
          <span>Tokens: {stats.tokens.toLocaleString()}</span>
          <span>Time: {stats.elapsed}s</span>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #1e1e1e', background: '#111' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything — I'll use tools to find the answer..."
            disabled={isStreaming}
            rows={1}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #333',
              background: '#1a1a1a', color: '#e5e5e5', fontSize: '14px', resize: 'none',
              outline: 'none', fontFamily: 'inherit', minHeight: '44px', maxHeight: '120px',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={isStreaming || !input.trim()}
            style={{
              padding: '12px 20px', borderRadius: '12px', border: 'none',
              background: isStreaming || !input.trim() ? '#333' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
              color: '#fff', fontSize: '14px', fontWeight: 600, cursor: isStreaming ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
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
