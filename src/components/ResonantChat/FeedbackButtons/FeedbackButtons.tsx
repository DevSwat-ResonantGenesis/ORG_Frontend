import React, { useState } from 'react';
import styles from './FeedbackButtons.module.css';
import fastapiClient from '@/api/client';

// Custom SVG Icons
const ThumbsUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
  </svg>
);

const ThumbsDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" />
  </svg>
);

interface FeedbackButtonsProps {
  messageId: string;
  agentType?: string;
  agentHash?: string; // Custom agent hash ID for custom agents
  task?: string;
  response?: string;
  onFeedbackSubmit?: (isPositive: boolean) => void;
}

const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  messageId,
  agentType = '',
  agentHash = '',
  task = '',
  response = '',
  onFeedbackSubmit,
}) => {
  const [submitted, setSubmitted] = useState<'positive' | 'negative' | null>(null);
  const [loading, setLoading] = useState(false);

  const submitFeedback = async (isPositive: boolean) => {
    if (submitted || loading) return;

    setLoading(true);
    try {
      // Use agent_hash for custom agents, otherwise use agent_type
      const agentIdentifier = agentHash || agentType;
      const res = await fastapiClient.post('/resonant-chat/feedback', {
        message_id: messageId,
        is_positive: isPositive,
        agent_type: agentIdentifier, // This can be either type (reasoning) or hash (custom agent)
        agent_hash: agentHash || undefined, // Explicitly pass hash for custom agents
        task: task.slice(0, 500),
        response: response.slice(0, 1000),
      });

      if (res.status === 200 || res.status === 201) {
        setSubmitted(isPositive ? 'positive' : 'negative');
        onFeedbackSubmit?.(isPositive);
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={styles.container}>
        <span className={styles.thanks}>
          <span className={submitted === 'positive' ? styles.positiveIcon : styles.negativeIcon}>
            {submitted === 'positive' ? <ThumbsUpIcon /> : <ThumbsDownIcon />}
          </span>
          Thanks for your feedback!
        </span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <span className={styles.label}>Was this helpful?</span>
      <button
        className={`${styles.button} ${styles.positive}`}
        onClick={() => submitFeedback(true)}
        disabled={loading}
        title="Helpful"
      >
        <ThumbsUpIcon />
      </button>
      <button
        className={`${styles.button} ${styles.negative}`}
        onClick={() => submitFeedback(false)}
        disabled={loading}
        title="Not helpful"
      >
        <ThumbsDownIcon />
      </button>
    </div>
  );
};

export default FeedbackButtons;
