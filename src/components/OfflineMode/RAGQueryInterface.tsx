/**
 * RAG Query Interface
 * 
 * Interface for performing RAG queries with:
 * - Query input
 * - Project selection
 * - Results display
 * - Source citations
 * - Streaming support
 */

import React, { useState } from 'react';
import { askRAG } from '@/utils/ragService';
import styles from './RAGQueryInterface.module.css';

interface RAGResult {
  answer: string;
  sources?: Array<{
    text: string;
    score: number;
    metadata?: any;
  }>;
  success: boolean;
  error?: string;
}

export const RAGQueryInterface: React.FC<{ projectId?: string }> = ({ projectId: initialProjectId }) => {
  const [query, setQuery] = useState<string>('');
  const [projectId, setProjectId] = useState<string>(initialProjectId || '');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<RAGResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuery = async () => {
    if (!query.trim()) {
      setError('Please enter a query');
      return;
    }

    if (!projectId) {
      setError('Please select a project');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await askRAG(query, projectId, {
        topK: 5,
        temperature: 0.7,
        maxTokens: 500,
      });

      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || 'Failed to perform RAG query');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>RAG Query</h3>
        <p className={styles.subtitle}>Ask questions about your cached project files</p>
      </div>

      <div className={styles.inputSection}>
        <div className={styles.inputGroup}>
          <label htmlFor="project-select">Project ID</label>
          <input
            id="project-select"
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="Enter project ID"
            className={styles.input}
            disabled={loading}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="query-input">Query</label>
          <textarea
            id="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your project..."
            className={styles.textarea}
            rows={4}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleQuery();
              }
            }}
          />
        </div>

        <button
          onClick={handleQuery}
          disabled={loading || !query.trim() || !projectId}
          className={styles.submitButton}
        >
          {loading ? 'Querying...' : 'Ask Question'}
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className={styles.results}>
          <div className={styles.answer}>
            <h4>Answer</h4>
            <div className={styles.answerText}>{result.answer}</div>
          </div>

          {result.sources && result.sources.length > 0 && (
            <div className={styles.sources}>
              <h4>Sources ({result.sources.length})</h4>
              <div className={styles.sourcesList}>
                {result.sources.map((source, index) => (
                  <div key={index} className={styles.sourceItem}>
                    <div className={styles.sourceHeader}>
                      <span className={styles.sourceIndex}>#{index + 1}</span>
                      <span className={styles.sourceScore}>
                        {(source.score * 100).toFixed(1)}% match
                      </span>
                    </div>
                    <div className={styles.sourceText}>
                      {source.text.substring(0, 200)}
                      {source.text.length > 200 && '...'}
                    </div>
                    {source.metadata?.filePath && (
                      <div className={styles.sourceMeta}>
                        {source.metadata.filePath}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

