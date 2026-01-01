import React, { useState, useEffect } from 'react';
import {
  initGitRepo,
  getGitStatus,
  stageFiles,
  commitChanges,
  manageBranch,
  listBranches,
  getCommitLog,
  type GitStatus,
  type GitCommit
} from '@/api/code';
import { stageFile, unstageFile } from '@/api/git';
import { logger } from '@/utils/logger';
import { useToastContext } from '@/context/ToastContext';
import styles from './GitPanel.module.css';

interface GitPanelProps {
  projectId: string;
}

export const GitPanel: React.FC<GitPanelProps> = ({ projectId }) => {
  const [status, setStatus] = useState<GitStatus | null>(null);
  const [branches, setBranches] = useState<string[]>([]);
  const [commits, setCommits] = useState<GitCommit[]>([]);
  const [loading, setLoading] = useState(false);
  const [commitMessage, setCommitMessage] = useState('');
  const [autoGenerateMessage, setAutoGenerateMessage] = useState(true);
  const [newBranchName, setNewBranchName] = useState('');
  const [stagedFiles, setStagedFiles] = useState<Set<string>>(new Set());
  const { success, error: showError } = useToastContext();

  useEffect(() => {
    if (projectId) {
      loadGitStatus();
      loadBranches();
      loadCommitLog();
    }
  }, [projectId]);

  const loadGitStatus = async () => {
    try {
      const gitStatus = await getGitStatus(projectId);
      setStatus(gitStatus);
    } catch (err) {
      logger.error('Failed to load git status', err);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await listBranches(projectId);
      setBranches(response.branches);
    } catch (err) {
      logger.error('Failed to load branches', err);
    }
  };

  const loadCommitLog = async () => {
    try {
      const response = await getCommitLog(projectId, 10);
      setCommits(response.commits);
    } catch (err) {
      logger.error('Failed to load commit log', err);
    }
  };

  const handleInitRepo = async () => {
    setLoading(true);
    try {
      const result = await initGitRepo(projectId);
      if (result.success) {
        success('Git repository initialized');
        await loadGitStatus();
        await loadBranches();
      } else {
        showError(result.error || 'Failed to initialize repository');
      }
    } catch (err: any) {
      showError(`Failed to initialize: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStageFiles = async () => {
    setLoading(true);
    try {
      const result = await stageFiles(projectId);
      if (result.success) {
        success('Files staged');
        await loadGitStatus();
      } else {
        showError(result.error || 'Failed to stage files');
      }
    } catch (err: any) {
      showError(`Failed to stage files: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStageFile = async (filePath: string) => {
    setLoading(true);
    try {
      await stageFile(filePath, projectId);
      setStagedFiles(prev => new Set(prev).add(filePath));
      success(`Staged: ${filePath}`);
      await loadGitStatus();
    } catch (err: any) {
      showError(`Failed to stage file: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUnstageFile = async (filePath: string) => {
    setLoading(true);
    try {
      await unstageFile(filePath, projectId);
      setStagedFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(filePath);
        return newSet;
      });
      success(`Unstaged: ${filePath}`);
      await loadGitStatus();
    } catch (err: any) {
      showError(`Failed to unstage file: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Separate files into staged and unstaged
  const getStagedFiles = () => {
    if (!status) return [];
    return status.files.filter(file => 
      file.status.startsWith('A') || 
      file.status.startsWith('M') && stagedFiles.has(file.file)
    );
  };

  const getUnstagedFiles = () => {
    if (!status) return [];
    return status.files.filter(file => 
      !file.status.startsWith('A') && 
      !stagedFiles.has(file.file)
    );
  };

  const handleCommit = async () => {
    if (!autoGenerateMessage && !commitMessage.trim()) {
      showError('Please enter a commit message or enable auto-generation');
      return;
    }

    setLoading(true);
    try {
      const result = await commitChanges(
        projectId,
        autoGenerateMessage ? undefined : commitMessage,
        autoGenerateMessage
      );
      if (result.success) {
        success(`Committed: ${result.message}`);
        setCommitMessage('');
        await loadGitStatus();
        await loadCommitLog();
      } else {
        showError(result.error || 'Failed to commit changes');
      }
    } catch (err: any) {
      showError(`Failed to commit: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) {
      showError('Please enter a branch name');
      return;
    }

    setLoading(true);
    try {
      const result = await manageBranch(projectId, newBranchName, true);
      if (result.success) {
        success(`Switched to branch: ${result.branch}`);
        setNewBranchName('');
        await loadBranches();
        await loadGitStatus();
      } else {
        showError(result.error || 'Failed to create branch');
      }
    } catch (err: any) {
      showError(`Failed to create branch: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchBranch = async (branchName: string) => {
    setLoading(true);
    try {
      const result = await manageBranch(projectId, branchName, false);
      if (result.success) {
        success(`Switched to branch: ${result.branch}`);
        await loadBranches();
        await loadGitStatus();
      } else {
        showError(result.error || 'Failed to switch branch');
      }
    } catch (err: any) {
      showError(`Failed to switch branch: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return (
      <div className={styles.gitPanel}>
        <div className={styles.header}>
          <h4>Git</h4>
        </div>
        <div className={styles.empty}>
          <p>No git repository found</p>
          <button
            onClick={handleInitRepo}
            disabled={loading}
            className={styles.initButton}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '6px' }}>
              <circle cx="7" cy="4" r="2" />
              <circle cx="4" cy="10" r="2" />
              <circle cx="10" cy="10" r="2" />
              <path d="M7 6V10M4 8L10 12" strokeLinecap="round" />
            </svg>
            Initialize Repository
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.gitPanel}>
      <div className={styles.header}>
        <h4>Git</h4>
        <button
          onClick={loadGitStatus}
          className={styles.refreshButton}
          disabled={loading}
          title="Refresh Git Status"
          aria-label="Refresh Git Status"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12.5 3C12 2.5 11 2 10 2C7.5 2 6 3.5 6 5.5M3.5 13C4 13.5 5 14 6 14C8.5 14 10 12.5 10 10.5" strokeLinecap="round" />
            <path d="M2.5 2.5L5.5 5.5L2.5 8.5M13.5 7L10.5 10L13.5 13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Branch Info */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Branch: {status.branch || 'main'}</span>
        </div>
        <div className={styles.branchControls}>
          <input
            type="text"
            placeholder="New branch name"
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            className={styles.branchInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newBranchName.trim()) {
                handleCreateBranch();
              }
            }}
          />
          <button
            onClick={handleCreateBranch}
            disabled={loading || !newBranchName.trim()}
            className={styles.branchButton}
            title="Create New Branch"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '6px' }}>
              <circle cx="7" cy="3" r="2" />
              <circle cx="4" cy="11" r="2" />
              <circle cx="10" cy="11" r="2" />
              <path d="M7 5V11M4 9L10 13" strokeLinecap="round" />
            </svg>
            Create Branch
          </button>
        </div>
        {branches.length > 0 && (
          <div className={styles.branchList}>
            {branches.map((branch) => (
              <button
                key={branch}
                onClick={() => handleSwitchBranch(branch)}
                className={`${styles.branchItem} ${branch === status.branch ? styles.activeBranch : ''}`}
                disabled={loading}
              >
                {branch === status.branch ? '✓ ' : ''}{branch}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Staged Changes */}
      {getStagedFiles().length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Staged Changes ({getStagedFiles().length})</span>
          </div>
          <div className={styles.fileList}>
            {getStagedFiles().map((file, idx) => (
              <div key={idx} className={`${styles.fileItem} ${styles.staged}`}>
                <span className={styles.statusBadge}>{file.status_text}</span>
                <span className={styles.filePath}>{file.file}</span>
                <button
                  onClick={() => handleUnstageFile(file.file)}
                  disabled={loading}
                  className={styles.unstageButton}
                  title="Unstage"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 7H10" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unstaged Changes */}
      {getUnstagedFiles().length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Changes ({getUnstagedFiles().length})</span>
            <button
              onClick={handleStageFiles}
              disabled={loading || getUnstagedFiles().length === 0}
              className={styles.stageAllButton}
              title="Stage All Changes"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '4px' }}>
                <path d="M7 3V11M3 7H11" strokeLinecap="round" />
              </svg>
              Stage All
            </button>
          </div>
          <div className={styles.fileList}>
            {getUnstagedFiles().map((file, idx) => (
              <div key={idx} className={styles.fileItem}>
                <span className={styles.statusBadge}>{file.status_text}</span>
                <span className={styles.filePath}>{file.file}</span>
                <button
                  onClick={() => handleStageFile(file.file)}
                  disabled={loading}
                  className={styles.stageButton}
                  title="Stage"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M7 4V10M4 7H10" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Commit */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span>Commit</span>
        </div>
        <div className={styles.commitControls}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={autoGenerateMessage}
              onChange={(e) => setAutoGenerateMessage(e.target.checked)}
            />
            Auto-generate message
          </label>
          {!autoGenerateMessage && (
            <textarea
              placeholder="Enter commit message..."
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className={styles.commitInput}
              rows={3}
            />
          )}
          <button
            onClick={handleCommit}
            disabled={loading || (!autoGenerateMessage && !commitMessage.trim()) || getStagedFiles().length === 0}
            className={styles.commitButton}
            title="Commit Staged Changes"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginRight: '6px' }}>
              <circle cx="7" cy="7" r="5" />
              <path d="M5 7L7 9L9 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {loading ? 'Committing...' : `Commit ${getStagedFiles().length > 0 ? `(${getStagedFiles().length})` : ''}`}
          </button>
        </div>
      </div>

      {/* Commit History */}
      {commits.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span>Recent Commits</span>
          </div>
          <div className={styles.commitList}>
            {commits.map((commit, idx) => (
              <div key={idx} className={styles.commitItem}>
                <div className={styles.commitHeader}>
                  <span className={styles.commitHash}>{commit.hash}</span>
                  <span className={styles.commitAuthor}>{commit.author}</span>
                  <span className={styles.commitDate}>
                    {new Date(commit.date).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.commitMessage}>{commit.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!status.has_changes && status.is_repo && (
        <div className={styles.emptyState}>
          <p>No changes to commit</p>
        </div>
      )}
    </div>
  );
};

