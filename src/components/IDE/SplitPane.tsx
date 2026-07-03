// ============== SPLIT PANE ==============
// Resizable split pane layout component

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import styles from './SplitPane.module.css';

interface SplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  defaultSizes?: [number, number];
  minSizes?: [number, number];
  maxSizes?: [number, number];
  children: [React.ReactNode, React.ReactNode];
  onResize?: (sizes: [number, number]) => void;
  resizerSize?: number;
  className?: string;
}

const SplitPaneComponent: React.FC<SplitPaneProps> = ({
  direction = 'horizontal',
  defaultSizes = [50, 50],
  minSizes = [100, 100],
  maxSizes = [Infinity, Infinity],
  children,
  onResize,
  resizerSize = 6,
  className,
}) => {
  const [sizes, setSizes] = useState<[number, number]>(defaultSizes);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef(0);
  const startSizesRef = useRef<[number, number]>([0, 0]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSizesRef.current = [...sizes];
  }, [direction, sizes]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current;
    const containerSize = direction === 'horizontal' 
      ? container.offsetWidth 
      : container.offsetHeight;
    
    const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
    const delta = currentPos - startPosRef.current;
    const deltaPercent = (delta / containerSize) * 100;

    let newFirst = startSizesRef.current[0] + deltaPercent;
    let newSecond = startSizesRef.current[1] - deltaPercent;

    // Apply min/max constraints
    const minFirstPercent = (minSizes[0] / containerSize) * 100;
    const minSecondPercent = (minSizes[1] / containerSize) * 100;
    const maxFirstPercent = (maxSizes[0] / containerSize) * 100;
    const maxSecondPercent = (maxSizes[1] / containerSize) * 100;

    if (newFirst < minFirstPercent) {
      newFirst = minFirstPercent;
      newSecond = 100 - newFirst;
    }
    if (newSecond < minSecondPercent) {
      newSecond = minSecondPercent;
      newFirst = 100 - newSecond;
    }
    if (newFirst > maxFirstPercent) {
      newFirst = maxFirstPercent;
      newSecond = 100 - newFirst;
    }
    if (newSecond > maxSecondPercent) {
      newSecond = maxSecondPercent;
      newFirst = 100 - newSecond;
    }

    const newSizes: [number, number] = [newFirst, newSecond];
    setSizes(newSizes);
    onResize?.(newSizes);
  }, [isDragging, direction, minSizes, maxSizes, onResize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
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
  }, [isDragging, handleMouseMove, handleMouseUp, direction]);

  const containerClass = direction === 'horizontal' 
    ? styles.horizontal 
    : styles.vertical;

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${containerClass} ${className || ''}`}
    >
      <div 
        className={styles.pane}
        style={{ 
          [direction === 'horizontal' ? 'width' : 'height']: `calc(${sizes[0]}% - ${resizerSize / 2}px)`
        }}
      >
        {children[0]}
      </div>
      
      <div 
        className={`${styles.resizer} ${isDragging ? styles.active : ''}`}
        style={{
          [direction === 'horizontal' ? 'width' : 'height']: resizerSize,
        }}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.resizerLine} />
      </div>
      
      <div 
        className={styles.pane}
        style={{ 
          [direction === 'horizontal' ? 'width' : 'height']: `calc(${sizes[1]}% - ${resizerSize / 2}px)`
        }}
      >
        {children[1]}
      </div>
    </div>
  );
};

export const SplitPane = memo(SplitPaneComponent);

// ============== MULTI SPLIT PANE ==============

interface MultiSplitPaneProps {
  direction?: 'horizontal' | 'vertical';
  defaultSizes?: number[];
  minSize?: number;
  children: React.ReactNode[];
  className?: string;
}

const MultiSplitPaneComponent: React.FC<MultiSplitPaneProps> = ({
  direction = 'horizontal',
  defaultSizes,
  minSize = 50,
  children,
  className,
}) => {
  const count = React.Children.count(children);
  const initialSizes = defaultSizes || Array(count).fill(100 / count);
  const [sizes, setSizes] = useState<number[]>(initialSizes);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleResize = useCallback((index: number, delta: number) => {
    setSizes(prev => {
      const newSizes = [...prev];
      const totalSize = containerRef.current 
        ? (direction === 'horizontal' ? containerRef.current.offsetWidth : containerRef.current.offsetHeight)
        : 1000;
      
      const deltaPercent = (delta / totalSize) * 100;
      
      newSizes[index] = Math.max(minSize / totalSize * 100, prev[index] + deltaPercent);
      newSizes[index + 1] = Math.max(minSize / totalSize * 100, prev[index + 1] - deltaPercent);
      
      return newSizes;
    });
  }, [direction, minSize]);

  const containerClass = direction === 'horizontal' 
    ? styles.horizontal 
    : styles.vertical;

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${containerClass} ${className || ''}`}
    >
      {React.Children.map(children, (child, index) => (
        <React.Fragment key={index}>
          <div 
            className={styles.pane}
            style={{ 
              [direction === 'horizontal' ? 'width' : 'height']: `${sizes[index]}%`
            }}
          >
            {child}
          </div>
          {index < count - 1 && (
            <Resizer 
              direction={direction}
              onDrag={(delta) => handleResize(index, delta)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export const MultiSplitPane = memo(MultiSplitPaneComponent);

// ============== RESIZER ==============

interface ResizerProps {
  direction: 'horizontal' | 'vertical';
  onDrag: (delta: number) => void;
}

const Resizer: React.FC<ResizerProps> = memo(({ direction, onDrag }) => {
  const [isDragging, setIsDragging] = useState(false);
  const lastPosRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    lastPosRef.current = direction === 'horizontal' ? e.clientX : e.clientY;
  }, [direction]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const currentPos = direction === 'horizontal' ? e.clientX : e.clientY;
      const delta = currentPos - lastPosRef.current;
      lastPosRef.current = currentPos;
      onDrag(delta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, direction, onDrag]);

  return (
    <div 
      className={`${styles.resizer} ${isDragging ? styles.active : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.resizerLine} />
    </div>
  );
});

Resizer.displayName = 'Resizer';

export default SplitPane;
