import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import {
  listReviewTasks,
  getReviewTask,
  approveReviewTask,
  rejectReviewTask,
  requestModifications,
  getPendingReviewCount,
  type ReviewTask,
  type ReviewTaskStatus,
} from '../../api/aiReview';
import { Button } from '../../components/ui';
import Modal from '../../components/shared/Modal';
import styles from './ReviewQueuePage.module.css';
import { DiffViewer } from './DiffViewer';

const ReviewQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;

  const [tasks, setTasks] = useState<ReviewTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<ReviewTask | null>(null);
  const [statusFilter, setStatusFilter] = useState<ReviewTaskStatus | 'all'>('all');
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'modify' | null>(null);
  const [reviewComment, setReviewComment] = useState('');

  const loadTasks = useCallback(async () => {
    if (!canAccess(userRole, 'audit')) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const tasksData = await listReviewTasks({ status });
      setTasks(tasksData);
      
      // Get pending count
      const pending = await getPendingReviewCount();
      setPendingCount(pending);
    } catch (err: unknown) {
      logger.error('Failed to load review tasks:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to load review tasks';
      setError(errorMessage as string);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, statusFilter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskClick = async (taskId: string) => {
    try {
      const task = await getReviewTask(taskId);
      setSelectedTask(task);
      setShowReviewModal(true);
    } catch (err: unknown) {
      logger.error(`Failed to load task ${taskId}:`, err);
      setError('Failed to load task details');
    }
  };

  const handleApprove = async () => {
    if (!selectedTask) return;

    try {
      await approveReviewTask(selectedTask.id, { comment: reviewComment || undefined });
      setShowReviewModal(false);
      setSelectedTask(null);
      setReviewComment('');
      await loadTasks();
    } catch (err: unknown) {
      logger.error('Failed to approve task:', err);
      setError('Failed to approve task');
    }
  };

  const handleReject = async () => {
    if (!selectedTask || !reviewComment.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      await rejectReviewTask(selectedTask.id, { comment: reviewComment });
      setShowReviewModal(false);
      setSelectedTask(null);
      setReviewComment('');
      await loadTasks();
    } catch (err: unknown) {
      logger.error('Failed to reject task:', err);
      setError('Failed to reject task');
    }
  };

  const handleRequestModifications = async () => {
    if (!selectedTask || !reviewComment.trim()) {
      setError('Please specify what modifications are needed');
      return;
    }

    try {
      await requestModifications(selectedTask.id, { comment: reviewComment });
      setShowReviewModal(false);
      setSelectedTask(null);
      setReviewComment('');
      await loadTasks();
    } catch (err: unknown) {
      logger.error('Failed to request modifications:', err);
      setError('Failed to request modifications');
    }
  };

  const getStatusBadgeClass = (status: ReviewTaskStatus): string => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'approved':
        return styles.statusApproved;
      case 'rejected':
        return styles.statusRejected;
      case 'modifications_requested':
        return styles.statusModify;
      default:
        return styles.statusDefault;
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading review tasks...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>AI Review Queue</h1>
        <div className={styles.headerActions}>
          {pendingCount > 0 && (
            <span className={styles.pendingBadge}>
              {pendingCount} pending
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className={styles.filters}>
        <button
          className={statusFilter === 'all' ? styles.filterActive : styles.filterButton}
          onClick={() => setStatusFilter('all')}
        >
          All
        </button>
        <button
          className={statusFilter === 'pending' ? styles.filterActive : styles.filterButton}
          onClick={() => setStatusFilter('pending')}
        >
          Pending
        </button>
        <button
          className={statusFilter === 'approved' ? styles.filterActive : styles.filterButton}
          onClick={() => setStatusFilter('approved')}
        >
          Approved
        </button>
        <button
          className={statusFilter === 'rejected' ? styles.filterActive : styles.filterButton}
          onClick={() => setStatusFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      <div className={styles.tasksList}>
        {tasks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No review tasks found</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={styles.taskCard}
              onClick={() => handleTaskClick(task.id)}
            >
              <div className={styles.taskHeader}>
                <span className={styles.filePath}>{task.file_path}</span>
                <span className={`${styles.statusBadge} ${getStatusBadgeClass(task.status)}`}>
                  {task.status}
                </span>
              </div>
              {task.description && (
                <p className={styles.description}>{task.description}</p>
              )}
              <div className={styles.taskMeta}>
                <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                {task.reviewer_user_id && (
                  <span>Reviewed: {new Date(task.reviewed_at || '').toLocaleDateString()}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showReviewModal && selectedTask && (
        <Modal
          open={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setSelectedTask(null);
            setReviewAction(null);
            setReviewComment('');
          }}
          size="large"
        >
          <div className={styles.reviewModal}>
            <div className={styles.modalHeader}>
              <h2>Review: {selectedTask.file_path}</h2>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedTask(null);
                  setReviewAction(null);
                  setReviewComment('');
                }}
              >
                ×
              </button>
            </div>
            {selectedTask.description && (
              <div className={styles.descriptionSection}>
                <h3>Description</h3>
                <p>{selectedTask.description}</p>
              </div>
            )}

            <div className={styles.diffSection}>
              <h3>Code Changes</h3>
              <DiffViewer oldCode={selectedTask.old_code} newCode={selectedTask.new_code} />
            </div>

            {selectedTask.status === 'pending' && (
              <div className={styles.reviewActions}>
                <div className={styles.commentSection}>
                  <label>Comment (optional for approval, required for rejection/modifications):</label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Add your review comment..."
                    rows={3}
                  />
                </div>
                <div className={styles.actionButtons}>
                  <Button
                    onClick={handleApprove}
                    variant="primary"
                  >
                    Approve
                  </Button>
                  <Button
                    onClick={() => {
                      setReviewAction('modify');
                      if (reviewComment.trim()) {
                        handleRequestModifications();
                      }
                    }}
                    variant="secondary"
                    disabled={!reviewComment.trim()}
                  >
                    Request Modifications
                  </Button>
                  <Button
                    onClick={handleReject}
                    variant="danger"
                    disabled={!reviewComment.trim()}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {selectedTask.status !== 'pending' && selectedTask.review_comment && (
              <div className={styles.reviewComment}>
                <h3>Review Comment</h3>
                <p>{selectedTask.review_comment}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReviewQueuePage;

