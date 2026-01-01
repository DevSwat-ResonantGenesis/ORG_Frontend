// Code Blocks Extraction Hook

import { useCallback, useMemo, useRef } from 'react';
import type { CodeBlock } from '../types';

interface Message {
  id: string;
  content: string;
  role: string;
  [key: string]: any;
}

export const useCodeBlocks = (
  messages: Message[],
  selectedMessageId: string | null
) => {
  // Cache the last result to prevent unnecessary recalculations
  const cacheRef = useRef<{ id: string | null; content: string | null; blocks: CodeBlock[] | null }>({
    id: null,
    content: null,
    blocks: null,
  });

  const extractCodeBlocks = useCallback((content: string): CodeBlock[] => {
    const blocks: CodeBlock[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;
    let idx = 0;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1] || 'text';
      const code = match[2]?.trim() || '';
      blocks.push({ language, code, idx: idx++ });
    }
    
    return blocks;
  }, []);

  // Only find the message if the ID changed
  const selectedMessage = useMemo(() => {
    if (!selectedMessageId) return null;
    return messages.find(m => m.id === selectedMessageId) || null;
  }, [selectedMessageId, messages]);

  // Only extract code blocks if the content actually changed
  const codeBlocks = useMemo(() => {
    const content = selectedMessage?.content || null;
    
    // Return cached result if nothing changed
    if (cacheRef.current.id === selectedMessageId && cacheRef.current.content === content) {
      return cacheRef.current.blocks;
    }
    
    if (!content) {
      cacheRef.current = { id: selectedMessageId, content: null, blocks: null };
      return null;
    }
    
    const blocks = extractCodeBlocks(content);
    const result = blocks.length > 0 ? blocks : null;
    
    // Update cache
    cacheRef.current = { id: selectedMessageId, content, blocks: result };
    
    return result;
  }, [selectedMessageId, selectedMessage?.content, extractCodeBlocks]);

  return { codeBlocks, extractCodeBlocks };
};

export default useCodeBlocks;
