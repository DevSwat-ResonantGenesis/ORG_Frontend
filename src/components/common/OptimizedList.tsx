// ============== OPTIMIZED LIST COMPONENT ==============
// Virtual scrolling and performance optimizations for large lists

import React, { memo, useCallback, useRef, useState, useEffect, useMemo } from 'react';
import styles from './OptimizedList.module.css';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight?: number;
  overscan?: number;
  keyExtractor?: (item: T, index: number) => string;
  onEndReached?: () => void;
  endReachedThreshold?: number;
  emptyComponent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

function OptimizedListComponent<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight = 400,
  overscan = 5,
  keyExtractor,
  onEndReached,
  endReachedThreshold = 0.8,
  emptyComponent,
  loadingComponent,
  isLoading,
  className,
}: OptimizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const endReachedRef = useRef(false);

  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
    
    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Handle scroll with RAF for performance
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    
    requestAnimationFrame(() => {
      setScrollTop(target.scrollTop);
      
      // Check if end reached
      const scrollPercentage = (target.scrollTop + target.clientHeight) / target.scrollHeight;
      if (scrollPercentage >= endReachedThreshold && !endReachedRef.current) {
        endReachedRef.current = true;
        onEndReached?.();
      } else if (scrollPercentage < endReachedThreshold) {
        endReachedRef.current = false;
      }
    });
  }, [endReachedThreshold, onEndReached]);

  // Visible items
  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; style: React.CSSProperties }[] = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        result.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute',
            top: i * itemHeight,
            left: 0,
            right: 0,
            height: itemHeight,
          },
        });
      }
    }
    
    return result;
  }, [items, visibleRange, itemHeight]);

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        {emptyComponent || (
          <div className={styles.empty}>
            <span>No items</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className || ''}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div className={styles.inner} style={{ height: totalHeight }}>
        {visibleItems.map(({ item, index, style }) => (
          <div
            key={keyExtractor ? keyExtractor(item, index) : index}
            style={style}
            className={styles.item}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className={styles.loading}>
          {loadingComponent || <span className={styles.spinner} />}
        </div>
      )}
    </div>
  );
}

export const OptimizedList = memo(OptimizedListComponent) as typeof OptimizedListComponent;

// ============== OPTIMIZED GRID ==============

interface OptimizedGridProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  columns: number;
  itemHeight: number;
  gap?: number;
  containerHeight?: number;
  className?: string;
}

function OptimizedGridComponent<T>({
  items,
  renderItem,
  columns,
  itemHeight,
  gap = 8,
  containerHeight = 400,
  className,
}: OptimizedGridProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const rowHeight = itemHeight + gap;
  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * rowHeight;

  const visibleRange = useMemo(() => {
    const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 1);
    const visibleRows = Math.ceil(containerHeight / rowHeight);
    const endRow = Math.min(totalRows - 1, startRow + visibleRows + 2);
    
    return {
      startIndex: startRow * columns,
      endIndex: Math.min(items.length - 1, (endRow + 1) * columns - 1),
    };
  }, [scrollTop, rowHeight, containerHeight, totalRows, columns, items.length]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  }, []);

  const visibleItems = useMemo(() => {
    const result: { item: T; index: number; style: React.CSSProperties }[] = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        const row = Math.floor(i / columns);
        const col = i % columns;
        
        result.push({
          item: items[i],
          index: i,
          style: {
            position: 'absolute',
            top: row * rowHeight,
            left: `calc(${(col / columns) * 100}% + ${gap / 2}px)`,
            width: `calc(${100 / columns}% - ${gap}px)`,
            height: itemHeight,
          },
        });
      }
    }
    
    return result;
  }, [items, visibleRange, columns, rowHeight, itemHeight, gap]);

  return (
    <div
      ref={containerRef}
      className={`${styles.gridContainer} ${className || ''}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div className={styles.gridInner} style={{ height: totalHeight }}>
        {visibleItems.map(({ item, index, style }) => (
          <div key={index} style={style} className={styles.gridItem}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export const OptimizedGrid = memo(OptimizedGridComponent) as typeof OptimizedGridComponent;

// ============== SKELETON LOADER ==============

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = memo(({
  width = '100%',
  height = 20,
  borderRadius = 4,
  className,
}) => (
  <div
    className={`${styles.skeleton} ${className || ''}`}
    style={{ width, height, borderRadius }}
  />
));

Skeleton.displayName = 'Skeleton';

// ============== SKELETON LIST ==============

interface SkeletonListProps {
  count?: number;
  itemHeight?: number;
  gap?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = memo(({
  count = 5,
  itemHeight = 60,
  gap = 8,
}) => (
  <div className={styles.skeletonList}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className={styles.skeletonItem} style={{ height: itemHeight, marginBottom: gap }}>
        <Skeleton width={40} height={40} borderRadius="50%" />
        <div className={styles.skeletonContent}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </div>
      </div>
    ))}
  </div>
));

SkeletonList.displayName = 'SkeletonList';

export default OptimizedList;
