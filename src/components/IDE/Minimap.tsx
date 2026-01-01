// ============== MINIMAP ==============
// Code minimap with viewport indicator and click navigation

import React, { memo, useRef, useEffect, useCallback, useState } from 'react';
import styles from './Minimap.module.css';

interface MinimapProps {
  code: string;
  language?: string;
  viewportStart: number;
  viewportEnd: number;
  totalLines: number;
  onNavigate: (line: number) => void;
  highlights?: { line: number; type: 'error' | 'warning' | 'info' | 'search' }[];
  className?: string;
}

const MinimapComponent: React.FC<MinimapProps> = ({
  code,
  language = 'text',
  viewportStart,
  viewportEnd,
  totalLines,
  onNavigate,
  highlights = [],
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const LINE_HEIGHT = 2;
  const CHAR_WIDTH = 1;
  const MAX_CHARS = 80;

  // Render minimap
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = code.split('\n');
    const height = lines.length * LINE_HEIGHT;
    const width = canvas.width;

    canvas.height = Math.max(height, 100);
    ctx.fillStyle = '#0d0d14';
    ctx.fillRect(0, 0, width, canvas.height);

    // Syntax highlighting colors
    const colors: Record<string, string> = {
      keyword: '#c678dd',
      string: '#98c379',
      comment: '#5c6370',
      number: '#d19a66',
      function: '#61afef',
      default: '#abb2bf',
    };

    // Simple syntax detection
    const getLineColor = (line: string): string => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*')) {
        return colors.comment;
      }
      if (/^(import|export|const|let|var|function|class|if|else|for|while|return|async|await)/.test(trimmed)) {
        return colors.keyword;
      }
      if (/['"`]/.test(trimmed)) {
        return colors.string;
      }
      return colors.default;
    };

    // Draw lines
    lines.forEach((line, index) => {
      const y = index * LINE_HEIGHT;
      const color = getLineColor(line);
      
      // Draw line content
      ctx.fillStyle = color;
      const chars = Math.min(line.length, MAX_CHARS);
      
      for (let i = 0; i < chars; i++) {
        if (line[i] !== ' ' && line[i] !== '\t') {
          ctx.globalAlpha = 0.6;
          ctx.fillRect(i * CHAR_WIDTH + 2, y, CHAR_WIDTH, LINE_HEIGHT - 1);
        }
      }
    });

    // Draw highlights
    highlights.forEach(highlight => {
      const y = (highlight.line - 1) * LINE_HEIGHT;
      const highlightColors = {
        error: 'rgba(239, 68, 68, 0.4)',
        warning: 'rgba(245, 158, 11, 0.4)',
        info: 'rgba(14, 165, 233, 0.4)',
        search: 'rgba(34, 197, 94, 0.4)',
      };
      
      ctx.globalAlpha = 1;
      ctx.fillStyle = highlightColors[highlight.type];
      ctx.fillRect(0, y, width, LINE_HEIGHT);
    });

    ctx.globalAlpha = 1;
  }, [code, highlights]);

  // Handle click navigation
  const handleClick = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const line = Math.floor(y / LINE_HEIGHT) + 1;
    
    onNavigate(Math.min(line, totalLines));
  }, [totalLines, onNavigate]);

  // Handle drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    handleClick(e);
  }, [handleClick]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      handleClick(e);
    }
  }, [isDragging, handleClick]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging, handleMouseUp]);

  // Calculate viewport indicator position
  const viewportHeight = Math.max((viewportEnd - viewportStart) * LINE_HEIGHT, 20);
  const viewportTop = (viewportStart - 1) * LINE_HEIGHT;

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        width={100}
      />
      <div
        className={styles.viewport}
        style={{
          top: viewportTop,
          height: viewportHeight,
        }}
      />
      <div className={styles.lineCount}>
        {totalLines} lines
      </div>
    </div>
  );
};

export const Minimap = memo(MinimapComponent);
export default Minimap;
