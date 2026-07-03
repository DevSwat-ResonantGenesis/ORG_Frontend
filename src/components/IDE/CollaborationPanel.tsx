// ============== COLLABORATION PANEL ==============
// Real-time collaboration features for the IDE

import React, { memo, useState, useCallback, useEffect, useRef } from 'react';
import styles from './CollaborationPanel.module.css';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: {
    file: string;
    line: number;
    column: number;
  };
  selection?: {
    file: string;
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  };
  status: 'online' | 'away' | 'offline';
  lastActive: Date;
}

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  file: string;
  line: number;
  createdAt: Date;
  replies: Comment[];
  resolved: boolean;
}

interface LiveSession {
  id: string;
  name: string;
  hostId: string;
  collaborators: Collaborator[];
  startedAt: Date;
  isActive: boolean;
}

interface CollaborationPanelProps {
  currentUserId: string;
  currentUserName: string;
  activeFile?: string;
  onJumpToLine?: (file: string, line: number) => void;
  onHighlightSelection?: (file: string, start: number, end: number, color: string) => void;
  className?: string;
}

const AVATAR_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#0ea5e9', '#6366f1', '#a855f7', '#ec4899',
];

const CollaborationPanelComponent: React.FC<CollaborationPanelProps> = ({
  currentUserId,
  currentUserName,
  activeFile,
  onJumpToLine,
  onHighlightSelection,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'collaborators' | 'comments' | 'sessions'>('collaborators');
  const [session, setSession] = useState<LiveSession | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isJoiningSession, setIsJoiningSession] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentLine, setCommentLine] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (session) {
      connectToSession(session.id);
    }
    return () => {
      wsRef.current?.close();
    };
  }, [session?.id]);

  const connectToSession = (sessionId: string) => {
    // In production, connect to actual WebSocket server
    console.log('Connecting to session:', sessionId);
    
    // Simulate collaborators joining
    setTimeout(() => {
      setCollaborators([
        {
          id: currentUserId,
          name: currentUserName,
          email: 'you@example.com',
          color: AVATAR_COLORS[0],
          status: 'online',
          lastActive: new Date(),
        },
        {
          id: 'user-2',
          name: 'Alice Developer',
          email: 'alice@example.com',
          color: AVATAR_COLORS[1],
          cursor: { file: activeFile || '', line: 42, column: 15 },
          status: 'online',
          lastActive: new Date(),
        },
        {
          id: 'user-3',
          name: 'Bob Engineer',
          email: 'bob@example.com',
          color: AVATAR_COLORS[2],
          status: 'away',
          lastActive: new Date(Date.now() - 300000),
        },
      ]);
    }, 500);
  };

  const handleCreateSession = useCallback(async () => {
    setIsCreatingSession(true);
    try {
      // Generate session code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newSession: LiveSession = {
        id: `session-${Date.now()}`,
        name: `${currentUserName}'s Session`,
        hostId: currentUserId,
        collaborators: [],
        startedAt: new Date(),
        isActive: true,
      };
      
      setSession(newSession);
      setSessionCode(code);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  }, [currentUserId, currentUserName]);

  const handleJoinSession = useCallback(async (code: string) => {
    setIsJoiningSession(true);
    try {
      // In production, validate code with server
      const joinedSession: LiveSession = {
        id: `session-${code}`,
        name: 'Shared Session',
        hostId: 'host-user',
        collaborators: [],
        startedAt: new Date(),
        isActive: true,
      };
      
      setSession(joinedSession);
    } catch (error) {
      console.error('Failed to join session:', error);
    } finally {
      setIsJoiningSession(false);
    }
  }, []);

  const handleLeaveSession = useCallback(() => {
    wsRef.current?.close();
    setSession(null);
    setCollaborators([]);
    setSessionCode('');
  }, []);

  const handleAddComment = useCallback(() => {
    if (!newComment.trim() || !activeFile || commentLine === null) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      authorId: currentUserId,
      authorName: currentUserName,
      content: newComment,
      file: activeFile,
      line: commentLine,
      createdAt: new Date(),
      replies: [],
      resolved: false,
    };

    setComments(prev => [...prev, comment]);
    setNewComment('');
    setCommentLine(null);
  }, [newComment, activeFile, commentLine, currentUserId, currentUserName]);

  const handleResolveComment = useCallback((commentId: string) => {
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, resolved: true } : c
    ));
  }, []);

  const handleFollowCollaborator = useCallback((collaborator: Collaborator) => {
    if (collaborator.cursor && onJumpToLine) {
      onJumpToLine(collaborator.cursor.file, collaborator.cursor.line);
    }
    if (collaborator.selection && onHighlightSelection) {
      onHighlightSelection(
        collaborator.selection.file,
        collaborator.selection.startLine,
        collaborator.selection.endLine,
        collaborator.color
      );
    }
  }, [onJumpToLine, onHighlightSelection]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#22c55e';
      case 'away': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatLastActive = (date: Date) => {
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>👥</span>
          Collaboration
        </h3>
        {session && (
          <div className={styles.sessionInfo}>
            <span className={styles.liveIndicator} />
            Live
          </div>
        )}
      </div>

      {!session ? (
        <div className={styles.noSession}>
          <div className={styles.sessionActions}>
            <button
              className={styles.createBtn}
              onClick={handleCreateSession}
              disabled={isCreatingSession}
            >
              {isCreatingSession ? 'Creating...' : '🚀 Start Live Session'}
            </button>
            
            <div className={styles.divider}>
              <span>or</span>
            </div>
            
            <div className={styles.joinForm}>
              <input
                type="text"
                placeholder="Enter session code"
                value={sessionCode}
                onChange={e => setSessionCode(e.target.value.toUpperCase())}
                maxLength={6}
                className={styles.codeInput}
              />
              <button
                className={styles.joinBtn}
                onClick={() => handleJoinSession(sessionCode)}
                disabled={isJoiningSession || sessionCode.length < 6}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.sessionBar}>
            <div className={styles.sessionCode}>
              <span className={styles.codeLabel}>Session Code:</span>
              <code className={styles.code}>{sessionCode || session.id.slice(-6).toUpperCase()}</code>
              <button
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(sessionCode || session.id.slice(-6).toUpperCase())}
              >
                📋
              </button>
            </div>
            <button className={styles.leaveBtn} onClick={handleLeaveSession}>
              Leave
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'collaborators' ? styles.active : ''}`}
              onClick={() => setActiveTab('collaborators')}
            >
              Collaborators
              <span className={styles.badge}>{collaborators.length}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'comments' ? styles.active : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              Comments
              {comments.filter(c => !c.resolved).length > 0 && (
                <span className={styles.badge}>{comments.filter(c => !c.resolved).length}</span>
              )}
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'sessions' ? styles.active : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              History
            </button>
          </div>

          <div className={styles.content}>
            {activeTab === 'collaborators' && (
              <div className={styles.collaboratorsList}>
                {collaborators.map(collab => (
                  <div
                    key={collab.id}
                    className={`${styles.collaboratorCard} ${collab.id === currentUserId ? styles.isYou : ''}`}
                    onClick={() => collab.id !== currentUserId && handleFollowCollaborator(collab)}
                  >
                    <div className={styles.avatar} style={{ backgroundColor: collab.color }}>
                      {collab.avatar ? (
                        <img src={collab.avatar} alt={collab.name} />
                      ) : (
                        collab.name.charAt(0).toUpperCase()
                      )}
                      <span
                        className={styles.statusDot}
                        style={{ backgroundColor: getStatusColor(collab.status) }}
                      />
                    </div>
                    <div className={styles.collaboratorInfo}>
                      <span className={styles.collaboratorName}>
                        {collab.name}
                        {collab.id === currentUserId && <span className={styles.youTag}>(You)</span>}
                        {collab.id === session.hostId && <span className={styles.hostTag}>Host</span>}
                      </span>
                      {collab.cursor && (
                        <span className={styles.cursorInfo}>
                          📍 Line {collab.cursor.line}
                        </span>
                      )}
                      <span className={styles.lastActive}>
                        {collab.status === 'online' ? 'Active now' : formatLastActive(collab.lastActive)}
                      </span>
                    </div>
                    {collab.id !== currentUserId && collab.status === 'online' && (
                      <button className={styles.followBtn}>
                        Follow
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'comments' && (
              <div className={styles.commentsPanel}>
                <div className={styles.addComment}>
                  <div className={styles.commentInputGroup}>
                    <input
                      type="number"
                      placeholder="Line"
                      value={commentLine || ''}
                      onChange={e => setCommentLine(parseInt(e.target.value) || null)}
                      className={styles.lineInput}
                      min={1}
                    />
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      className={styles.commentInput}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    />
                    <button
                      className={styles.sendBtn}
                      onClick={handleAddComment}
                      disabled={!newComment.trim() || commentLine === null}
                    >
                      Send
                    </button>
                  </div>
                </div>

                <div className={styles.commentsList}>
                  {comments.filter(c => !c.resolved).length === 0 ? (
                    <div className={styles.emptyComments}>
                      <span className={styles.emptyIcon}>💬</span>
                      <p>No comments yet</p>
                      <small>Add comments to discuss code with your team</small>
                    </div>
                  ) : (
                    comments.filter(c => !c.resolved).map(comment => (
                      <div key={comment.id} className={styles.commentCard}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentAuthor}>{comment.authorName}</span>
                          <span className={styles.commentLine}>Line {comment.line}</span>
                          <span className={styles.commentTime}>
                            {formatLastActive(comment.createdAt)}
                          </span>
                        </div>
                        <p className={styles.commentContent}>{comment.content}</p>
                        <div className={styles.commentActions}>
                          <button
                            className={styles.jumpBtn}
                            onClick={() => onJumpToLine?.(comment.file, comment.line)}
                          >
                            Jump to line
                          </button>
                          <button
                            className={styles.resolveBtn}
                            onClick={() => handleResolveComment(comment.id)}
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {comments.filter(c => c.resolved).length > 0 && (
                  <div className={styles.resolvedSection}>
                    <div className={styles.resolvedHeader}>
                      Resolved ({comments.filter(c => c.resolved).length})
                    </div>
                    {comments.filter(c => c.resolved).map(comment => (
                      <div key={comment.id} className={`${styles.commentCard} ${styles.resolved}`}>
                        <div className={styles.commentHeader}>
                          <span className={styles.commentAuthor}>{comment.authorName}</span>
                          <span className={styles.resolvedBadge}>✓ Resolved</span>
                        </div>
                        <p className={styles.commentContent}>{comment.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className={styles.historyPanel}>
                <div className={styles.historyItem}>
                  <div className={styles.historyIcon}>📅</div>
                  <div className={styles.historyInfo}>
                    <span className={styles.historyName}>{session.name}</span>
                    <span className={styles.historyMeta}>
                      Started {formatLastActive(session.startedAt)}
                    </span>
                  </div>
                  <span className={styles.activeBadge}>Active</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export const CollaborationPanel = memo(CollaborationPanelComponent);
export default CollaborationPanel;
