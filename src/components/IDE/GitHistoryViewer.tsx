// ============== GIT HISTORY VIEWER ==============
// Visual git history with commit graph and diff viewer

import React, { memo, useState, useCallback } from 'react';
import styles from './GitHistoryViewer.module.css';

interface Commit {
  hash: string;
  shortHash: string;
  message: string;
  author: string;
  authorEmail: string;
  date: Date;
  branch?: string;
  tags?: string[];
  parents: string[];
  isMerge?: boolean;
}

interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions: number;
  deletions: number;
  hunks: DiffHunk[];
}

interface DiffHunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

interface DiffLine {
  type: 'context' | 'addition' | 'deletion';
  content: string;
  oldLine?: number;
  newLine?: number;
}

interface GitHistoryViewerProps {
  commits?: Commit[];
  currentBranch?: string;
  onCommitSelect?: (commit: Commit) => void;
  onCheckout?: (hash: string) => void;
  onRevert?: (hash: string) => void;
  className?: string;
}

const mockCommits: Commit[] = [
  { hash: 'abc123def456', shortHash: 'abc123d', message: 'feat: Add advanced IDE components', author: 'Developer', authorEmail: 'dev@example.com', date: new Date(Date.now() - 3600000), branch: 'main', parents: ['def456'] },
  { hash: 'def456abc789', shortHash: 'def456a', message: 'fix: Resolve performance issues in editor', author: 'Developer', authorEmail: 'dev@example.com', date: new Date(Date.now() - 7200000), parents: ['ghi789'] },
  { hash: 'ghi789def012', shortHash: 'ghi789d', message: 'feat: Implement code analyzer', author: 'Developer', authorEmail: 'dev@example.com', date: new Date(Date.now() - 10800000), parents: ['jkl012', 'mno345'], isMerge: true },
  { hash: 'jkl012ghi345', shortHash: 'jkl012g', message: 'refactor: Clean up component structure', author: 'Developer', authorEmail: 'dev@example.com', date: new Date(Date.now() - 14400000), parents: ['mno345'] },
  { hash: 'mno345jkl678', shortHash: 'mno345j', message: 'chore: Update dependencies', author: 'Developer', authorEmail: 'dev@example.com', date: new Date(Date.now() - 18000000), tags: ['v1.0.0'], parents: ['pqr678'] },
  { hash: 'pqr678mno901', shortHash: 'pqr678m', message: 'feat: Add initial project setup', author: 'Developer', authorEmail: 'dev@example.com', date: new Date(Date.now() - 21600000), parents: [] },
];

const GitHistoryViewerComponent: React.FC<GitHistoryViewerProps> = ({
  commits = mockCommits,
  currentBranch = 'main',
  onCommitSelect,
  onCheckout,
  onRevert,
  className,
}) => {
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffFiles, setDiffFiles] = useState<FileDiff[]>([]);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('list');

  const handleCommitClick = useCallback((commit: Commit) => {
    setSelectedCommit(commit);
    onCommitSelect?.(commit);
    
    // Generate mock diff
    const mockDiff: FileDiff[] = [
      {
        path: 'src/components/IDE/NewComponent.tsx',
        status: 'added',
        additions: 150,
        deletions: 0,
        hunks: [{
          oldStart: 0, oldLines: 0, newStart: 1, newLines: 10,
          lines: [
            { type: 'addition', content: "import React from 'react';", newLine: 1 },
            { type: 'addition', content: '', newLine: 2 },
            { type: 'addition', content: 'export const NewComponent = () => {', newLine: 3 },
            { type: 'addition', content: '  return <div>New Component</div>;', newLine: 4 },
            { type: 'addition', content: '};', newLine: 5 },
          ]
        }]
      },
      {
        path: 'src/App.tsx',
        status: 'modified',
        additions: 5,
        deletions: 2,
        hunks: [{
          oldStart: 10, oldLines: 5, newStart: 10, newLines: 8,
          lines: [
            { type: 'context', content: 'function App() {', oldLine: 10, newLine: 10 },
            { type: 'deletion', content: '  return <OldComponent />;', oldLine: 11 },
            { type: 'addition', content: '  return (', newLine: 11 },
            { type: 'addition', content: '    <div>', newLine: 12 },
            { type: 'addition', content: '      <NewComponent />', newLine: 13 },
            { type: 'addition', content: '    </div>', newLine: 14 },
            { type: 'addition', content: '  );', newLine: 15 },
            { type: 'context', content: '}', oldLine: 12, newLine: 16 },
          ]
        }]
      },
    ];
    setDiffFiles(mockDiff);
    setShowDiff(true);
  }, [onCommitSelect]);

  const toggleFileExpand = (path: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added': return '+';
      case 'deleted': return '−';
      case 'modified': return '~';
      case 'renamed': return '→';
      default: return '•';
    }
  };

  const filteredCommits = commits.filter(c =>
    c.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.shortHash.includes(searchQuery) ||
    c.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📜</span>
          <span>Git History</span>
          <span className={styles.branch}>
            <span className={styles.branchIcon}>⎇</span>
            {currentBranch}
          </span>
        </div>
        <div className={styles.viewToggle}>
          <button
            className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
            onClick={() => setViewMode('list')}
          >
            ≡
          </button>
          <button
            className={`${styles.viewBtn} ${viewMode === 'graph' ? styles.active : ''}`}
            onClick={() => setViewMode('graph')}
          >
            ◇
          </button>
        </div>
      </div>

      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search commits..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.content}>
        <div className={`${styles.commitList} ${showDiff ? styles.narrow : ''}`}>
          {filteredCommits.map((commit, index) => (
            <div
              key={commit.hash}
              className={`${styles.commit} ${selectedCommit?.hash === commit.hash ? styles.selected : ''}`}
              onClick={() => handleCommitClick(commit)}
            >
              {viewMode === 'graph' && (
                <div className={styles.graph}>
                  <div className={styles.graphLine}>
                    {index > 0 && <div className={styles.lineTop} />}
                    <div className={`${styles.node} ${commit.isMerge ? styles.merge : ''}`} />
                    {index < commits.length - 1 && <div className={styles.lineBottom} />}
                  </div>
                </div>
              )}
              <div className={styles.commitInfo}>
                <div className={styles.commitHeader}>
                  <span className={styles.commitHash}>{commit.shortHash}</span>
                  {commit.branch && index === 0 && (
                    <span className={styles.branchTag}>{commit.branch}</span>
                  )}
                  {commit.tags?.map(tag => (
                    <span key={tag} className={styles.tag}>🏷️ {tag}</span>
                  ))}
                  {commit.isMerge && <span className={styles.mergeBadge}>⚭ merge</span>}
                </div>
                <div className={styles.commitMessage}>{commit.message}</div>
                <div className={styles.commitMeta}>
                  <span className={styles.author}>{commit.author}</span>
                  <span className={styles.date}>{formatDate(commit.date)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showDiff && selectedCommit && (
          <div className={styles.diffPanel}>
            <div className={styles.diffHeader}>
              <div className={styles.diffTitle}>
                <span>{selectedCommit.shortHash}</span>
                <span className={styles.diffMessage}>{selectedCommit.message}</span>
              </div>
              <div className={styles.diffActions}>
                <button className={styles.actionBtn} onClick={() => onCheckout?.(selectedCommit.hash)}>
                  ↩️ Checkout
                </button>
                <button className={styles.actionBtn} onClick={() => onRevert?.(selectedCommit.hash)}>
                  ⟲ Revert
                </button>
                <button className={styles.closeBtn} onClick={() => setShowDiff(false)}>×</button>
              </div>
            </div>

            <div className={styles.fileList}>
              {diffFiles.map(file => (
                <div key={file.path} className={styles.fileItem}>
                  <div
                    className={styles.fileHeader}
                    onClick={() => toggleFileExpand(file.path)}
                  >
                    <span className={styles.expandIcon}>
                      {expandedFiles.has(file.path) ? '▼' : '▶'}
                    </span>
                    <span className={`${styles.fileStatus} ${styles[file.status]}`}>
                      {getStatusIcon(file.status)}
                    </span>
                    <span className={styles.filePath}>{file.path}</span>
                    <span className={styles.fileStats}>
                      <span className={styles.additions}>+{file.additions}</span>
                      <span className={styles.deletions}>-{file.deletions}</span>
                    </span>
                  </div>

                  {expandedFiles.has(file.path) && (
                    <div className={styles.diffContent}>
                      {file.hunks.map((hunk, i) => (
                        <div key={i} className={styles.hunk}>
                          <div className={styles.hunkHeader}>
                            @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@
                          </div>
                          {hunk.lines.map((line, j) => (
                            <div key={j} className={`${styles.diffLine} ${styles[line.type]}`}>
                              <span className={styles.lineNum}>
                                {line.oldLine || ' '} {line.newLine || ' '}
                              </span>
                              <span className={styles.lineContent}>{line.content}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const GitHistoryViewer = memo(GitHistoryViewerComponent);
export default GitHistoryViewer;
