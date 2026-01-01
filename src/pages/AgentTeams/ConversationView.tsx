import React, { useEffect, useState, useCallback } from 'react';
import { getWorkflowConversation, getWorkflowStatus, cancelWorkflow, type ConversationMessage, type WorkflowStatus } from '../../api/agentTeams';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Button } from '../../components/ui';
import { useToastContext } from '../../context/ToastContext';
import logger from '../../utils/logger';
import styles from './ConversationView.module.css';
import resonantChatStyles from '@/pages/ResonantChat/ResonantChatPage-2025.module.css';

interface ConversationViewProps {
  workflowId: string;
  onClose: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  workflowId,
  onClose,
}) => {
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const toast = useToastContext();

  const loadConversation = useCallback(async () => {
    try {
      const [messages, status] = await Promise.all([
        getWorkflowConversation(workflowId),
        getWorkflowStatus(workflowId),
      ]);
      setConversation(messages);
      setWorkflowStatus(status);
    } catch (err: unknown) {
      logger.error('Failed to load conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  const handleCancelWorkflow = useCallback(async () => {
    if (!workflowStatus || workflowStatus.status === 'completed' || workflowStatus.status === 'failed' || workflowStatus.status === 'cancelled') {
      return;
    }

    if (!window.confirm('Are you sure you want to cancel this workflow? This action cannot be undone.')) {
      return;
    }

    setCancelling(true);
    try {
      await cancelWorkflow(workflowId);
      toast.success('Workflow cancelled successfully');
      // Reload status to reflect cancellation
      await loadConversation();
    } catch (err: unknown) {
      logger.error('Failed to cancel workflow:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Failed to cancel workflow';
      toast.error(errorMessage || 'Failed to cancel workflow');
    } finally {
      setCancelling(false);
    }
  }, [workflowId, workflowStatus, toast, loadConversation]);

  useEffect(() => {
    loadConversation();
    
    // Poll for updates if workflow is running or pending
    // Stop polling if workflow is completed, failed, or cancelled
    const shouldPoll = workflowStatus?.status === 'running' || workflowStatus?.status === 'pending';
    
    if (!shouldPoll) {
      return; // Don't set up polling if workflow is finished
    }

    const interval = setInterval(() => {
      loadConversation();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [loadConversation, workflowStatus?.status]);

  if (loading) {
    return (
      <div className={styles.conversationView}>
        <div className={styles.loading}>Loading conversation...</div>
      </div>
    );
  }

  return (
    <div className={styles.conversationView}>
      <div className={styles.header}>
        <h2>Workflow Conversation</h2>
        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      {workflowStatus && (
        <div className={styles.statusBar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span className={styles.statusBadge}>
              Status: {workflowStatus.status}
            </span>
            <span>
              Step: {workflowStatus.current_step} / {workflowStatus.total_steps}
            </span>
            {(workflowStatus.status === 'running' || workflowStatus.status === 'pending') && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelWorkflow}
                disabled={cancelling}
                style={{
                  marginLeft: 'auto',
                  color: 'var(--color-warning-700)',
                  borderColor: 'var(--color-warning-300)',
                  fontSize: 'var(--font-size-xs)'
                }}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Workflow'}
              </Button>
            )}
          </div>
          {workflowStatus.error && (
            <div style={{
              marginTop: 'var(--space-2)',
              padding: 'var(--space-2)',
              background: 'var(--color-bg-error)',
              color: 'var(--color-text-error)',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: 'var(--font-size-sm)',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>Error:</strong> {workflowStatus.error}
            </div>
          )}
          {workflowStatus.steps && workflowStatus.steps.length > 0 && (
            <div style={{ marginTop: 'var(--space-2)' }}>
              {workflowStatus.steps.map((step, idx) => (
                <div key={idx} style={{
                  fontSize: 'var(--font-size-xs)',
                  color: step.status === 'failed' ? 'var(--color-text-error)' : 
                         step.status === 'completed' ? 'var(--color-text-success)' : 
                         'var(--color-text-secondary)',
                  marginTop: 'var(--space-1)'
                }}>
                  Step {step.step_index + 1}: {step.status}
                  {step.error && (
                    <div style={{
                      marginLeft: 'var(--space-3)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-error)',
                      marginTop: 'var(--space-1)'
                    }}>
                      {step.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.conversation}>
        {conversation.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No messages yet. Workflow is starting...</p>
          </div>
        ) : (
          conversation.map((msg) => (
            <div key={msg.id} className={`${resonantChatStyles.message} ${resonantChatStyles.assistant}`}>
              <div className={styles.messageHeader}>
                <span className={styles.agentId}>
                  Agent: {msg.from_agent_id.substring(0, 8)}...
                </span>
                <span className={styles.messageType}>{msg.message_type}</span>
                <span className={styles.timestamp}>
                  {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className={resonantChatStyles.messageContent}>
                {/* Enhanced message rendering with markdown - same as Resonant Chat */}
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : '';
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={language}
                          PreTag="div"
                          className={resonantChatStyles.codeBlock}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={resonantChatStyles.inlineCode} {...props}>
                          {children}
                        </code>
                      );
                    },
                    p: ({ children }) => <p className={resonantChatStyles.markdownParagraph}>{children}</p>,
                    ul: ({ children }) => <ul className={resonantChatStyles.markdownList}>{children}</ul>,
                    ol: ({ children }) => <ol className={resonantChatStyles.markdownList}>{children}</ol>,
                    li: ({ children }) => <li className={resonantChatStyles.markdownListItem}>{children}</li>,
                    h1: ({ children }) => <h1 className={resonantChatStyles.markdownHeading}>{children}</h1>,
                    h2: ({ children }) => <h2 className={resonantChatStyles.markdownHeading}>{children}</h2>,
                    h3: ({ children }) => <h3 className={resonantChatStyles.markdownHeading}>{children}</h3>,
                    blockquote: ({ children }) => <blockquote className={resonantChatStyles.markdownBlockquote}>{children}</blockquote>,
                    a: ({ href, children }) => <a href={href} className={resonantChatStyles.markdownLink} target="_blank" rel="noopener noreferrer">{children}</a>,
                  }}
                >
                  {typeof msg.message === 'string' ? msg.message : String(msg.message || '')}
                </ReactMarkdown>
              </div>
              {msg.metadata.response && (
                <div className={styles.response}>
                  <strong>Response:</strong>
                  <div className={resonantChatStyles.messageContent}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              className={resonantChatStyles.codeBlock}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={resonantChatStyles.inlineCode} {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className={resonantChatStyles.markdownParagraph}>{children}</p>,
                        ul: ({ children }) => <ul className={resonantChatStyles.markdownList}>{children}</ul>,
                        ol: ({ children }) => <ol className={resonantChatStyles.markdownList}>{children}</ol>,
                        li: ({ children }) => <li className={resonantChatStyles.markdownListItem}>{children}</li>,
                        h1: ({ children }) => <h1 className={resonantChatStyles.markdownHeading}>{children}</h1>,
                        h2: ({ children }) => <h2 className={resonantChatStyles.markdownHeading}>{children}</h2>,
                        h3: ({ children }) => <h3 className={resonantChatStyles.markdownHeading}>{children}</h3>,
                        blockquote: ({ children }) => <blockquote className={resonantChatStyles.markdownBlockquote}>{children}</blockquote>,
                        a: ({ href, children }) => <a href={href} className={resonantChatStyles.markdownLink} target="_blank" rel="noopener noreferrer">{children}</a>,
                      }}
                    >
                      {typeof msg.metadata.response === 'string' ? msg.metadata.response : String(msg.metadata.response || '')}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              {msg.metadata.validated_output && (
                <div className={styles.validatedOutput}>
                  <strong>Structured Output:</strong>
                  <div className={resonantChatStyles.messageContent}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match ? match[1] : '';
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={language}
                              PreTag="div"
                              className={resonantChatStyles.codeBlock}
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={resonantChatStyles.inlineCode} {...props}>
                              {children}
                            </code>
                          );
                        },
                        p: ({ children }) => <p className={resonantChatStyles.markdownParagraph}>{children}</p>,
                        ul: ({ children }) => <ul className={resonantChatStyles.markdownList}>{children}</ul>,
                        ol: ({ children }) => <ol className={resonantChatStyles.markdownList}>{children}</ol>,
                        li: ({ children }) => <li className={resonantChatStyles.markdownListItem}>{children}</li>,
                        h1: ({ children }) => <h1 className={resonantChatStyles.markdownHeading}>{children}</h1>,
                        h2: ({ children }) => <h2 className={resonantChatStyles.markdownHeading}>{children}</h2>,
                        h3: ({ children }) => <h3 className={resonantChatStyles.markdownHeading}>{children}</h3>,
                        blockquote: ({ children }) => <blockquote className={resonantChatStyles.markdownBlockquote}>{children}</blockquote>,
                        a: ({ href, children }) => <a href={href} className={resonantChatStyles.markdownLink} target="_blank" rel="noopener noreferrer">{children}</a>,
                      }}
                    >
                      {typeof msg.metadata.validated_output === 'string' ? msg.metadata.validated_output : JSON.stringify(msg.metadata.validated_output)}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

