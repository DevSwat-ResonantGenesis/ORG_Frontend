import React, { useState, useRef, useEffect, ReactNode } from 'react';
import styles from './ResizablePanel.module.css';

interface ResizablePanelProps {
  children: ReactNode;
  direction: 'horizontal' | 'vertical';
  minSize?: number;
  maxSize?: number;
  defaultSize?: number;
  onResize?: (size: number) => void;
  className?: string;
  handlePosition?: 'left' | 'right' | 'top' | 'bottom'; // Position of resize handle
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  direction,
  minSize = 100,
  maxSize = Infinity,
  defaultSize,
  onResize,
  className = '',
  handlePosition,
}) => {
  const [size, setSize] = useState(defaultSize || (direction === 'horizontal' ? 250 : 300));
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<number>(0);
  const startSizeRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      let delta: number;
      if (direction === 'horizontal') {
        // For horizontal, adjust delta based on handle position
        if (handlePosition === 'left') {
          delta = startPosRef.current - e.clientX; // Invert for left handle
        } else {
          delta = e.clientX - startPosRef.current; // Default right handle
        }
      } else {
        // For vertical, adjust delta based on handle position
        if (handlePosition === 'top') {
          delta = startPosRef.current - e.clientY; // Invert for top handle
        } else {
          delta = startPosRef.current - e.clientY; // Default bottom handle
        }
      }
      
      const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));
      setSize(newSize);
      if (onResize) {
        onResize(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, direction, minSize, maxSize, onResize, handlePosition]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizeRef.current = size;
  };

  const style = direction === 'horizontal' 
    ? { width: `${size}px`, minWidth: `${size}px`, maxWidth: `${size}px`, flexShrink: 0, flexGrow: 0, height: '100%', minHeight: 0 }
    : { height: `${size}px`, minHeight: `${size}px`, maxHeight: `${size}px`, flexShrink: 0, flexGrow: 0, width: '100%', minWidth: 0 };

  return (
    <div 
      ref={panelRef}
      className={`${styles.resizablePanel} ${className}`}
      style={style}
    >
      {children}
      <div
        className={`${styles.resizeHandle} ${styles[direction]} ${handlePosition ? styles[handlePosition] : ''}`}
        onMouseDown={handleResizeStart}
        title={direction === 'horizontal' ? 'Drag to resize width' : 'Drag to resize height'}
      />
    </div>
  );
};
