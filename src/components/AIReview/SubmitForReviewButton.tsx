import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitPatchForReview } from '../../api/aiReview';
import { Button } from '../ui/Button';
import { useToastContext } from '@/context/ToastContext';
import logger from '../../utils/logger';
import styles from './SubmitForReviewButton.module.css';

interface SubmitForReviewButtonProps {
  filePath: string;
  oldCode: string;
  newCode: string;
  description?: string;
  metadata?: Record<string, any>;
  onSubmitted?: (taskId: string) => void;
}

/**
 * Submit for Review Button Component
 * 
 * Reusable component to submit code changes for human review.
 * Can be used in IDE, refactor dialogs, code generation results, etc.
 */
export const SubmitForReviewButton: React.FC<SubmitForReviewButtonProps> = ({
  filePath,
  oldCode,
  newCode,
  description,
  metadata,
  onSubmitted,
}) => {
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (oldCode === newCode) {
      showError('No changes to submit');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitPatchForReview({
        file_path: filePath,
        old_code: oldCode,
        new_code: newCode,
        description: description || `AI-generated changes for ${filePath}`,
        metadata: metadata || {},
      });

      success('Patch submitted for review successfully');
      
      if (onSubmitted) {
        onSubmitted(result.task_id);
      }

      // Optionally navigate to review queue
      // navigate('/ai-review');
    } catch (err: unknown) {
      logger.error('Failed to submit patch for review:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to submit patch for review';
      showError(errorMessage as string);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={submitting || oldCode === newCode}
      variant="secondary"
      size="md"
      className={styles.submitButton}
    >
      {submitting ? 'Submitting...' : '📋 Submit for Review'}
    </Button>
  );
};

