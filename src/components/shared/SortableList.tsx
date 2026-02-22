import React, { useState, useRef, useCallback } from 'react';
import { GripVertical, Trash2, MoreVertical } from 'lucide-react';

interface SortableItem {
  id: string;
  content: React.ReactNode;
}

interface SortableListProps {
  items: SortableItem[];
  onReorder: (items: SortableItem[]) => void;
  onDelete?: (id: string) => void;
  renderItem?: (item: SortableItem, index: number) => React.ReactNode;
  showHandle?: boolean;
  showDelete?: boolean;
  disabled?: boolean;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    transition: 'all 0.15s',
  },
  itemDragging: {
    background: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
    transform: 'scale(1.02)',
    zIndex: 10,
  },
  itemDragOver: {
    borderColor: 'rgba(99, 102, 241, 0.5)',
    background: 'rgba(99, 102, 241, 0.05)',
  },
  handle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    color: '#666',
    cursor: 'grab',
    flexShrink: 0,
    transition: 'color 0.15s',
  },
  handleActive: {
    cursor: 'grabbing',
    color: '#818cf8',
  },
  handleDisabled: {
    cursor: 'not-allowed',
    opacity: 0.4,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    flexShrink: 0,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'transparent',
    border: 'none',
    borderRadius: '6px',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actionButtonHover: {
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
  },
  deleteButton: {
    color: '#666',
  },
  deleteButtonHover: {
    background: 'rgba(239, 68, 68, 0.15)',
    color: '#ef4444',
  },
  placeholder: {
    height: '52px',
    border: '2px dashed rgba(99, 102, 241, 0.3)',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.05)',
  },
  empty: {
    padding: '2rem',
    textAlign: 'center',
    color: '#666',
    fontSize: '0.875rem',
    border: '1px dashed rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
  },
};

export const SortableList: React.FC<SortableListProps> = ({
  items,
  onReorder,
  onDelete,
  renderItem,
  showHandle = true,
  showDelete = false,
  disabled = false,
  className,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const draggedItem = useRef<SortableItem | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    if (disabled) return;
    draggedItem.current = items[index];
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  }, [items, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  }, [disabled, draggedIndex]);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, removed);

    onReorder(newItems);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [items, draggedIndex, onReorder, disabled]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedItem.current = null;
  }, []);

  const handleDelete = useCallback((id: string) => {
    onDelete?.(id);
  }, [onDelete]);

  if (items.length === 0) {
    return (
      <div style={styles.empty} className={className}>
        No items to display
      </div>
    );
  }

  return (
    <div style={styles.container} className={className}>
      {items.map((item, index) => {
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div
            key={item.id}
            style={{
              ...styles.item,
              ...(isDragging ? styles.itemDragging : {}),
              ...(isDragOver ? styles.itemDragOver : {}),
            }}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {showHandle && (
              <div
                style={{
                  ...styles.handle,
                  ...(isDragging ? styles.handleActive : {}),
                  ...(disabled ? styles.handleDisabled : {}),
                }}
              >
                <GripVertical size={16} />
              </div>
            )}

            <div style={styles.content}>
              {renderItem ? renderItem(item, index) : item.content}
            </div>

            {(showDelete || onDelete) && (
              <div style={styles.actions}>
                <button
                  style={{
                    ...styles.actionButton,
                    ...styles.deleteButton,
                    ...(hoveredAction === `delete-${item.id}` ? styles.deleteButtonHover : {}),
                  }}
                  onClick={() => handleDelete(item.id)}
                  onMouseEnter={() => setHoveredAction(`delete-${item.id}`)}
                  onMouseLeave={() => setHoveredAction(null)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Numbered sortable list variant
interface NumberedListProps extends Omit<SortableListProps, 'renderItem'> {
  startNumber?: number;
}

export const NumberedSortableList: React.FC<NumberedListProps> = ({
  items,
  startNumber = 1,
  ...props
}) => (
  <SortableList
    items={items}
    renderItem={(item, index) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '50%',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#818cf8',
          }}
        >
          {startNumber + index}
        </span>
        {item.content}
      </div>
    )}
    {...props}
  />
);

export default SortableList;
