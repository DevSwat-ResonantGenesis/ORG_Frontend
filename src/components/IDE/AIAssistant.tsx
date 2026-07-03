// ============== AI ASSISTANT ==============
// Conversational coding assistant with context awareness

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './AIAssistant.module.css';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  codeBlocks?: { language: string; code: string }[];
  isStreaming?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  icon: string;
}

interface AIAssistantProps {
  code?: string;
  language?: string;
  selection?: string;
  onInsertCode?: (code: string) => void;
  onApplyFix?: (fix: string) => void;
  className?: string;
}

const quickSuggestions: Suggestion[] = [
  { id: '1', text: 'Explain this code', icon: '📖' },
  { id: '2', text: 'Find bugs', icon: '🐛' },
  { id: '3', text: 'Optimize performance', icon: '⚡' },
  { id: '4', text: 'Add TypeScript types', icon: '🔷' },
  { id: '5', text: 'Write tests', icon: '🧪' },
  { id: '6', text: 'Add comments', icon: '💬' },
];

const AIAssistantComponent: React.FC<AIAssistantProps> = ({
  code,
  language,
  selection,
  onInsertCode,
  onApplyFix,
  className,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your AI coding assistant. I can help you write, debug, and improve your code. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [contextEnabled, setContextEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);

    // Simulate AI response with streaming
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Simulate streaming response
    const response = generateAIResponse(content, code, language, selection);
    let currentContent = '';

    for (let i = 0; i < response.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
      currentContent += response[i];
      
      setMessages(prev => prev.map(m => 
        m.id === assistantMessage.id 
          ? { ...m, content: currentContent }
          : m
      ));
    }

    // Extract code blocks
    const codeBlocks = extractCodeBlocks(currentContent);

    setMessages(prev => prev.map(m => 
      m.id === assistantMessage.id 
        ? { ...m, isStreaming: false, codeBlocks }
        : m
    ));

    setIsLoading(false);
  }, [code, language, selection]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    const context = selection ? `\n\nSelected code:\n\`\`\`${language || ''}\n${selection}\n\`\`\`` : '';
    sendMessage(suggestion.text + context);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const insertCode = (code: string) => {
    onInsertCode?.(code);
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Chat cleared. How can I help you?",
      timestamp: new Date(),
    }]);
    setShowSuggestions(true);
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🤖</span>
          <span>AI Assistant</span>
          {isLoading && <span className={styles.statusDot} />}
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.contextBtn} ${contextEnabled ? styles.active : ''}`}
            onClick={() => setContextEnabled(!contextEnabled)}
            title="Include code context"
          >
            📎
          </button>
          <button className={styles.clearBtn} onClick={clearChat}>
            🗑️
          </button>
        </div>
      </div>

      <div className={styles.messages}>
        {messages.map(message => (
          <div key={message.id} className={`${styles.message} ${styles[message.role]}`}>
            <div className={styles.messageHeader}>
              <span className={styles.roleIcon}>
                {message.role === 'user' ? '👤' : '🤖'}
              </span>
              <span className={styles.roleName}>
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </span>
              <span className={styles.timestamp}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className={styles.messageContent}>
              {renderMessageContent(message.content)}
              {message.isStreaming && <span className={styles.cursor}>▊</span>}
            </div>
            {message.codeBlocks && message.codeBlocks.length > 0 && (
              <div className={styles.codeActions}>
                {message.codeBlocks.map((block, i) => (
                  <div key={i} className={styles.codeBlock}>
                    <div className={styles.codeHeader}>
                      <span>{block.language || 'code'}</span>
                      <div className={styles.codeButtons}>
                        <button onClick={() => copyCode(block.code)}>📋 Copy</button>
                        <button onClick={() => insertCode(block.code)}>⬇️ Insert</button>
                      </div>
                    </div>
                    <pre className={styles.codeContent}>{block.code}</pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {showSuggestions && (
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>Quick actions:</span>
          <div className={styles.suggestionsList}>
            {quickSuggestions.map(suggestion => (
              <button
                key={suggestion.id}
                className={styles.suggestionBtn}
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion.icon} {suggestion.text}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={styles.inputArea}>
        {contextEnabled && (selection || code) && (
          <div className={styles.contextIndicator}>
            <span>📎</span>
            <span>{selection ? 'Selection attached' : 'File attached'}</span>
          </div>
        )}
        <div className={styles.inputWrapper}>
          <textarea
            ref={inputRef}
            className={styles.input}
            placeholder="Ask me anything about your code..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className={styles.sendBtn}
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? '⏳' : '➤'}
          </button>
        </div>
      </div>
    </div>
  );
};

function generateAIResponse(query: string, code?: string, language?: string, selection?: string): string {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('explain')) {
    return `Here's an explanation of the code:\n\nThis code appears to be written in ${language || 'JavaScript'}. Let me break it down:\n\n1. **Purpose**: The code defines functionality for handling data processing.\n\n2. **Key Components**:\n   - Variables and state management\n   - Functions for data transformation\n   - Error handling logic\n\n3. **How it works**:\n   The code follows a standard pattern where input is validated, processed, and then returned.\n\nWould you like me to explain any specific part in more detail?`;
  }
  
  if (queryLower.includes('bug') || queryLower.includes('debug')) {
    return `I've analyzed the code and found some potential issues:\n\n🐛 **Potential Bug #1**: Missing null check\n\`\`\`${language || 'javascript'}\n// Add null check before accessing properties\nif (data && data.value) {\n  processData(data.value);\n}\n\`\`\`\n\n🐛 **Potential Bug #2**: Unhandled promise rejection\n\`\`\`${language || 'javascript'}\ntry {\n  const result = await fetchData();\n} catch (error) {\n  console.error('Error:', error);\n}\n\`\`\`\n\nWould you like me to apply these fixes?`;
  }
  
  if (queryLower.includes('optimize') || queryLower.includes('performance')) {
    return `Here are some optimization suggestions:\n\n⚡ **Performance Improvements**:\n\n1. **Memoization**: Use useMemo/useCallback for expensive computations\n\`\`\`${language || 'typescript'}\nconst memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);\n\`\`\`\n\n2. **Lazy Loading**: Load components only when needed\n\`\`\`${language || 'typescript'}\nconst LazyComponent = React.lazy(() => import('./Component'));\n\`\`\`\n\n3. **Debouncing**: Prevent excessive function calls\n\`\`\`${language || 'typescript'}\nconst debouncedSearch = useMemo(\n  () => debounce(handleSearch, 300),\n  []\n);\n\`\`\`\n\nThese changes can significantly improve your app's performance.`;
  }
  
  if (queryLower.includes('test')) {
    return `Here's a test suite for your code:\n\n\`\`\`${language || 'typescript'}\nimport { render, screen, fireEvent } from '@testing-library/react';\nimport { Component } from './Component';\n\ndescribe('Component', () => {\n  it('renders correctly', () => {\n    render(<Component />);\n    expect(screen.getByRole('button')).toBeInTheDocument();\n  });\n\n  it('handles click events', () => {\n    const handleClick = jest.fn();\n    render(<Component onClick={handleClick} />);\n    fireEvent.click(screen.getByRole('button'));\n    expect(handleClick).toHaveBeenCalled();\n  });\n});\n\`\`\`\n\nShould I add more test cases?`;
  }
  
  return `I understand you want help with: "${query}"\n\nBased on the context provided, here's my suggestion:\n\n\`\`\`${language || 'typescript'}\n// Suggested code implementation\nconst solution = () => {\n  // Your implementation here\n  return result;\n};\n\`\`\`\n\nLet me know if you'd like me to elaborate or modify this approach!`;
}

function extractCodeBlocks(content: string): { language: string; code: string }[] {
  const blocks: { language: string; code: string }[] = [];
  const regex = /```(\w*)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    blocks.push({
      language: match[1] || 'text',
      code: match[2].trim(),
    });
  }
  
  return blocks;
}

function renderMessageContent(content: string): React.ReactNode {
  // Simple markdown-like rendering
  const parts = content.split(/(```[\s\S]*?```)/);
  
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      return null; // Code blocks are rendered separately
    }
    
    // Bold text
    const formatted = part.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    return (
      <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
    );
  });
}

export const AIAssistant = memo(AIAssistantComponent);
export default AIAssistant;
