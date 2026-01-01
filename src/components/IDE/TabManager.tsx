// ============== TAB MANAGER ==============
// Editor tabs with drag-and-drop, context menu, and modified indicators

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import styles from './TabManager.module.css';

interface Tab {
  id: string;
  label: string;
  path: string;
  icon?: string;
  isModified?: boolean;
  isPinned?: boolean;
  isPreview?: boolean;
}

interface TabManagerProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabsReorder: (tabs: Tab[]) => void;
  onTabPin?: (tabId: string) => void;
  onTabCloseOthers?: (tabId: string) => void;
  onTabCloseAll?: () => void;
  onTabCloseSaved?: () => void;
  className?: string;
}

const TabManagerComponent: React.FC<TabManagerProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabsReorder,
  onTabPin,
  onTabCloseOthers,
  onTabCloseAll,
  onTabCloseSaved,
  className,
}) => {
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; tabId: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, tabId: string) => {
    setDraggedTab(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, tabId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== tabId) {
      setDragOverTab(tabId);
    }
  }, [draggedTab]);

  const handleDragEnd = useCallback(() => {
    if (draggedTab && dragOverTab && draggedTab !== dragOverTab) {
      const newTabs = [...tabs];
      const draggedIndex = newTabs.findIndex(t => t.id === draggedTab);
      const dropIndex = newTabs.findIndex(t => t.id === dragOverTab);
      
      const [removed] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(dropIndex, 0, removed);
      
      onTabsReorder(newTabs);
    }
    setDraggedTab(null);
    setDragOverTab(null);
  }, [draggedTab, dragOverTab, tabs, onTabsReorder]);

  const handleContextMenu = useCallback((e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, tabId });
  }, []);

  const handleClose = useCallback((e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  }, [onTabClose]);

  const handleMiddleClick = useCallback((e: React.MouseEvent, tabId: string) => {
    if (e.button === 1) {
      e.preventDefault();
      onTabClose(tabId);
    }
  }, [onTabClose]);

  const getFileIcon = (tab: Tab) => {
    if (tab.icon) return tab.icon;
    const ext = tab.label.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return '🔷';
      case 'js': case 'jsx': return '🟨';
      case 'py': return '🐍';
      case 'css': case 'scss': return '🎨';
      case 'html': return '🌐';
      case 'json': return '📋';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  const pinnedTabs = tabs.filter(t => t.isPinned);
  const unpinnedTabs = tabs.filter(t => !t.isPinned);
  const orderedTabs = [...pinnedTabs, ...unpinnedTabs];

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ''}`}>
      <div className={styles.tabsWrapper}>
        <div className={styles.tabs}>
          {orderedTabs.map(tab => (
            <div
              key={tab.id}
              className={`
                ${styles.tab}
                ${tab.id === activeTabId ? styles.active : ''}
                ${tab.isPinned ? styles.pinned : ''}
                ${tab.isPreview ? styles.preview : ''}
                ${draggedTab === tab.id ? styles.dragging : ''}
                ${dragOverTab === tab.id ? styles.dragOver : ''}
              `}
              draggable={!tab.isPinned}
              onClick={() => onTabSelect(tab.id)}
              onMouseDown={e => handleMiddleClick(e, tab.id)}
              onContextMenu={e => handleContextMenu(e, tab.id)}
              onDragStart={e => handleDragStart(e, tab.id)}
              onDragOver={e => handleDragOver(e, tab.id)}
              onDragEnd={handleDragEnd}
            >
              {tab.isPinned && <span className={styles.pinIcon}>📌</span>}
              <span className={styles.tabIcon}>{getFileIcon(tab)}</span>
              <span className={styles.tabLabel}>
                {tab.label}
                {tab.isPreview && <span className={styles.previewBadge}>Preview</span>}
              </span>
              {tab.isModified && <span className={styles.modifiedDot} />}
              {!tab.isPinned && (
                <button
                  className={styles.closeBtn}
                  onClick={e => handleClose(e, tab.id)}
                  title="Close"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {contextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { onTabClose(contextMenu.tabId); setContextMenu(null); }}>
            Close
          </button>
          <button onClick={() => { onTabCloseOthers?.(contextMenu.tabId); setContextMenu(null); }}>
            Close Others
          </button>
          <button onClick={() => { onTabCloseAll?.(); setContextMenu(null); }}>
            Close All
          </button>
          <button onClick={() => { onTabCloseSaved?.(); setContextMenu(null); }}>
            Close Saved
          </button>
          <div className={styles.divider} />
          <button onClick={() => { onTabPin?.(contextMenu.tabId); setContextMenu(null); }}>
            {tabs.find(t => t.id === contextMenu.tabId)?.isPinned ? 'Unpin' : 'Pin'}
          </button>
          <div className={styles.divider} />
          <button onClick={() => { navigator.clipboard.writeText(tabs.find(t => t.id === contextMenu.tabId)?.path || ''); setContextMenu(null); }}>
            Copy Path
          </button>
        </div>
      )}
    </div>
  );
};

export const TabManager = memo(TabManagerComponent);
export default TabManager;
