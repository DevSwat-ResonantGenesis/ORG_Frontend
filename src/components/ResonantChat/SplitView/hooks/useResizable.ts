// Resizable Panel Hook

import { useState, useCallback, useEffect, useRef } from 'react';
import { MIN_SPLIT_WIDTH, MAX_SPLIT_WIDTH } from '../constants';

interface UseResizableOptions {
  initialWidth: number;
  onWidthChange?: (width: number) => void;
  enabled?: boolean;
}

export const useResizable = ({
  initialWidth,
  onWidthChange,
  enabled = true,
}: UseResizableOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResize = useCallback(() => {
    if (!enabled) return;
    setIsResizing(true);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      const clampedWidth = Math.min(Math.max(newWidth, MIN_SPLIT_WIDTH), MAX_SPLIT_WIDTH);
      
      setWidth(clampedWidth);
      onWidthChange?.(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, enabled, onWidthChange]);

  return {
    containerRef,
    width,
    isResizing,
    startResize,
    setWidth,
  };
};

export default useResizable;
