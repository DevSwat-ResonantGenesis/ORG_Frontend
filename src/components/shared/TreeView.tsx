import React, { useState, useCallback } from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  disabled?: boolean;
  data?: unknown;
}

interface TreeViewProps {
  data: TreeNode[];
  selectedId?: string;
  expandedIds?: string[];
  onSelect?: (node: TreeNode) => void;
  onExpand?: (nodeId: string, expanded: boolean) => void;
  showIcons?: boolean;
  showLines?: boolean;
  selectable?: boolean;
  defaultExpandAll?: boolean;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    fontFamily: 'inherit',
  },
  nodeWrapper: {
    position: 'relative',
  },
  node: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    userSelect: 'none',
  },
  nodeHover: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  nodeSelected: {
    background: 'rgba(99, 102, 241, 0.15)',
  },
  nodeDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
  expandIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    color: '#666',
    flexShrink: 0,
  },
  expandIconPlaceholder: {
    width: '16px',
    height: '16px',
    flexShrink: 0,
  },
  nodeIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#888',
    flexShrink: 0,
  },
  nodeLabel: {
    color: '#e4e4e7',
    fontSize: '0.875rem',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  children: {
    marginLeft: '1rem',
    paddingLeft: '0.5rem',
  },
  childrenWithLines: {
    borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
  },
};

const TreeNodeComponent: React.FC<{
  node: TreeNode;
  level: number;
  selectedId?: string;
  expandedIds: Set<string>;
  onSelect?: (node: TreeNode) => void;
  onToggle: (nodeId: string) => void;
  showIcons: boolean;
  showLines: boolean;
  selectable: boolean;
}> = ({
  node,
  level,
  selectedId,
  expandedIds,
  onSelect,
  onToggle,
  showIcons,
  showLines,
  selectable,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const handleClick = () => {
    if (node.disabled) return;
    if (hasChildren) {
      onToggle(node.id);
    }
    if (selectable) {
      onSelect?.(node);
    }
  };

  const getDefaultIcon = () => {
    if (hasChildren) {
      return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
    }
    return <File size={16} />;
  };

  return (
    <div style={styles.nodeWrapper}>
      <div
        style={{
          ...styles.node,
          ...(isHovered && !node.disabled ? styles.nodeHover : {}),
          ...(isSelected ? styles.nodeSelected : {}),
          ...(node.disabled ? styles.nodeDisabled : {}),
        }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
      >
        {hasChildren ? (
          <span style={styles.expandIcon}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        ) : (
          <span style={styles.expandIconPlaceholder} />
        )}

        {showIcons && (
          <span style={styles.nodeIcon}>
            {node.icon || getDefaultIcon()}
          </span>
        )}

        <span style={styles.nodeLabel}>{node.label}</span>
      </div>

      {hasChildren && isExpanded && (
        <div
          style={{
            ...styles.children,
            ...(showLines ? styles.childrenWithLines : {}),
          }}
        >
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onSelect={onSelect}
              onToggle={onToggle}
              showIcons={showIcons}
              showLines={showLines}
              selectable={selectable}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const getAllNodeIds = (nodes: TreeNode[]): string[] => {
  const ids: string[] = [];
  const traverse = (nodeList: TreeNode[]) => {
    for (const node of nodeList) {
      ids.push(node.id);
      if (node.children) {
        traverse(node.children);
      }
    }
  };
  traverse(nodes);
  return ids;
};

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  selectedId,
  expandedIds: controlledExpandedIds,
  onSelect,
  onExpand,
  showIcons = true,
  showLines = true,
  selectable = true,
  defaultExpandAll = false,
  className,
}) => {
  const [internalExpandedIds, setInternalExpandedIds] = useState<Set<string>>(
    () => new Set(defaultExpandAll ? getAllNodeIds(data) : [])
  );

  const expandedIds = controlledExpandedIds
    ? new Set(controlledExpandedIds)
    : internalExpandedIds;

  const handleToggle = useCallback((nodeId: string) => {
    const newExpanded = !expandedIds.has(nodeId);

    if (controlledExpandedIds === undefined) {
      setInternalExpandedIds((prev) => {
        const next = new Set(prev);
        if (newExpanded) {
          next.add(nodeId);
        } else {
          next.delete(nodeId);
        }
        return next;
      });
    }

    onExpand?.(nodeId, newExpanded);
  }, [expandedIds, controlledExpandedIds, onExpand]);

  return (
    <div style={styles.container} className={className} role="tree">
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={onSelect}
          onToggle={handleToggle}
          showIcons={showIcons}
          showLines={showLines}
          selectable={selectable}
        />
      ))}
    </div>
  );
};

// Simplified file tree variant
interface FileTreeProps {
  files: TreeNode[];
  selectedId?: string;
  onSelect?: (node: TreeNode) => void;
  className?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  selectedId,
  onSelect,
  className,
}) => (
  <TreeView
    data={files}
    selectedId={selectedId}
    onSelect={onSelect}
    showIcons={true}
    showLines={true}
    selectable={true}
    className={className}
  />
);

export default TreeView;
