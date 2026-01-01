/**
 * Module Outputs Component
 * Displays Hash Sphere module outputs (word representations, OOV words, etc.)
 */
import React from 'react';
import styles from './ModuleOutputs.module.css';

export interface ModuleOutputsProps {
  modules?: {
    word_representation?: {
      words: string[];
      method: string;
      confidence: number;
      error?: string;
      note?: string;
    };
    word_phrase?: {
      words: string[];
      method: string;
      confidence: number;
      band_distribution?: {
        alpha: number;
        beta: number;
        gamma: number;
      };
      error?: string;
      note?: string;
    };
    text_processing?: {
      oov_words: string[];
      available: boolean;
      error?: string;
      note?: string;
    };
    error?: string;
  };
  collapsed?: boolean;
}

export const ModuleOutputs: React.FC<ModuleOutputsProps> = ({ modules, collapsed = false }) => {
  if (!modules) return null;

  const [isExpanded, setIsExpanded] = React.useState(!collapsed);

  // Check if there's any content to show
  const hasContent = 
    modules.word_representation?.words?.length ||
    modules.word_phrase?.words?.length ||
    modules.text_processing?.oov_words?.length ||
    modules.error;

  if (!hasContent && !modules.text_processing?.note) return null;

  return (
    <div className={styles.moduleOutputs}>
      <button
        className={styles.toggleButton}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label={isExpanded ? 'Collapse module outputs' : 'Expand module outputs'}
      >
        <span className={styles.toggleIcon}>{isExpanded ? '▼' : '▶'}</span>
        <span className={styles.toggleLabel}>Hash Sphere Modules</span>
      </button>

      {isExpanded && (
        <div className={styles.content}>
          {/* Word Representation */}
          {modules.word_representation && (
            <div className={styles.moduleSection}>
              <h4 className={styles.moduleTitle}>
                Word Representation
                <span className={styles.moduleMethod}>
                  ({modules.word_representation.method})
                </span>
              </h4>
              {modules.word_representation.error ? (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {modules.word_representation.error}
                  {modules.word_representation.note && (
                    <div className={styles.note}>{modules.word_representation.note}</div>
                  )}
                </div>
              ) : modules.word_representation.words?.length > 0 ? (
                <div className={styles.wordList}>
                  {modules.word_representation.words.map((word, idx) => (
                    <span key={idx} className={styles.word}>
                      {word}
                    </span>
                  ))}
                  {modules.word_representation.confidence && (
                    <span className={styles.confidence}>
                      Confidence: {(modules.word_representation.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ) : (
                <div className={styles.empty}>No words found</div>
              )}
            </div>
          )}

          {/* 12-Word Phrase */}
          {modules.word_phrase && (
            <div className={styles.moduleSection}>
              <h4 className={styles.moduleTitle}>
                12-Word Phrase
                <span className={styles.moduleMethod}>
                  ({modules.word_phrase.method})
                </span>
              </h4>
              {modules.word_phrase.error ? (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {modules.word_phrase.error}
                  {modules.word_phrase.note && (
                    <div className={styles.note}>{modules.word_phrase.note}</div>
                  )}
                </div>
              ) : modules.word_phrase.words?.length > 0 ? (
                <div>
                  <div className={styles.wordList}>
                    {modules.word_phrase.words.map((word, idx) => (
                      <span key={idx} className={styles.word}>
                        {word}
                      </span>
                    ))}
                  </div>
                  {modules.word_phrase.band_distribution && (
                    <div className={styles.bandDistribution}>
                      <span className={styles.bandItem}>
                        Alpha: {modules.word_phrase.band_distribution.alpha}
                      </span>
                      <span className={styles.bandItem}>
                        Beta: {modules.word_phrase.band_distribution.beta}
                      </span>
                      <span className={styles.bandItem}>
                        Gamma: {modules.word_phrase.band_distribution.gamma}
                      </span>
                    </div>
                  )}
                  {modules.word_phrase.confidence && (
                    <span className={styles.confidence}>
                      Confidence: {(modules.word_phrase.confidence * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ) : (
                <div className={styles.empty}>No phrase generated</div>
              )}
            </div>
          )}

          {/* Text Processing (OOV Words) */}
          {modules.text_processing && (
            <div className={styles.moduleSection}>
              <h4 className={styles.moduleTitle}>Text Processing</h4>
              {modules.text_processing.error ? (
                <div className={styles.error}>
                  <span className={styles.errorIcon}>⚠️</span>
                  {modules.text_processing.error}
                </div>
              ) : !modules.text_processing.available ? (
                <div className={styles.warning}>
                  <span className={styles.warningIcon}>ℹ️</span>
                  {modules.text_processing.note || 'FastText not available'}
                </div>
              ) : modules.text_processing.oov_words?.length > 0 ? (
                <div>
                  <div className={styles.oovLabel}>Out-of-Vocabulary Words:</div>
                  <div className={styles.wordList}>
                    {modules.text_processing.oov_words.map((word, idx) => (
                      <span key={idx} className={styles.oovWord}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.empty}>No OOV words detected</div>
              )}
            </div>
          )}

          {/* General Error */}
          {modules.error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>❌</span>
              Module integration error: {modules.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

