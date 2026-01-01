/**
 * Embedding Generation Test Page
 * 
 * Navigate to /test-embedding to test embedding generation
 */

import React, { useState, useEffect } from 'react';
import { generateAndStoreEmbedding, embedCachedProject } from '@/utils/offlineEmbedding';
import { testGenerateEmbedding } from '@/utils/testEmbeddingOnly';
import styles from './EmbeddingTestPage.module.css';

const EmbeddingTestPage: React.FC = () => {
  const [text, setText] = useState('This is a test embedding for Module B offline mode.');
  const [projectId, setProjectId] = useState('test-project');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [embeddingStats, setEmbeddingStats] = useState<any>(null);
  const [isElectron, setIsElectron] = useState(false);

  // Initialize: Check Electron and load stats (only once on mount)
  useEffect(() => {
    let cancelled = false;
    
    // Check if running in Electron
    const electronAvailable = !!window.electron;
    setIsElectron(electronAvailable);
    
    // Load stats if Electron is available
    if (electronAvailable && window.electron?.embedding) {
      window.electron.embedding.getStats()
        .then((stats) => {
          if (!cancelled) {
            setEmbeddingStats(stats);
          }
        })
        .catch((err) => {
          if (!cancelled) {
            console.error('Failed to load stats:', err);
          }
        });
    }
    
    return () => {
      cancelled = true;
    };
  }, []); // Only run once on mount

  const loadStats = async () => {
    try {
      if (window.electron?.embedding) {
        const stats = await window.electron.embedding.getStats();
        setEmbeddingStats(stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleGenerateEmbedding = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('🧠 Generating embedding...');
      
      // Try to generate and store (requires Electron)
      const result = await generateAndStoreEmbedding(text, projectId);
      
      if (result.success) {
        setResult(`✅ Embedding generated and stored! ID: ${result.embeddingId}`);
        console.log('✅ Success:', result);
        await loadStats(); // Refresh stats
      } else {
        // If not in Electron, try browser-only generation
        if (!isElectron && result.error?.includes('Not running in Electron')) {
          console.log('⚠️ Not in Electron, testing generation only...');
          const testResult = await testGenerateEmbedding(text);
          
          if (testResult.success) {
            setResult(
              `✅ Embedding generated (${testResult.dimensions} dimensions)! ` +
              `Note: Not stored (requires Electron app). ` +
              `Check console for embedding details.`
            );
            console.log('✅ Embedding generated:', testResult.embedding?.slice(0, 10));
          } else {
            setError(testResult.error || 'Failed to generate embedding');
          }
        } else {
          setError(result.error || 'Failed to generate embedding');
          console.error('❌ Error:', result.error);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('❌ Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmbedProject = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log('📦 Embedding entire project...');
      setResult('⏳ Generating embeddings for all cached files... This may take a while.');
      
      const result = await embedCachedProject(projectId);
      
      if (result.success) {
        setResult(
          `✅ Project embedded! Generated ${result.embedded} embeddings, ${result.errors} errors.`
        );
        console.log('✅ Success:', result);
        await loadStats(); // Refresh stats
      } else {
        setError(result.error || 'Failed to embed project');
        console.error('❌ Error:', result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
      console.error('❌ Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>🧠 Embedding Generation Test</h1>
      
      {/* Stats Display */}
      {embeddingStats && embeddingStats.success && (
        <div className={styles.stats}>
          <h3>📊 Current Stats:</h3>
          <ul>
            <li>Total Embeddings: {embeddingStats.totalEmbeddings || 0}</li>
            <li>Projects: {embeddingStats.projectsCount || 0}</li>
            <li>Models: {embeddingStats.modelsCount || 0}</li>
          </ul>
        </div>
      )}

      <div className={styles.formGroup}>
        <label>
          <strong>Project ID:</strong>
          <input
            type="text"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            placeholder="test-project"
          />
        </label>
      </div>

      <div className={styles.formGroup}>
        <label>
          <strong>Text to Embed:</strong>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to generate embedding..."
            rows={6}
          />
        </label>
      </div>

      <div className={styles.buttonGroup}>
        <button
          onClick={handleGenerateEmbedding}
          disabled={loading || !text.trim()}
          className={styles.buttonPrimary}
        >
          {loading ? 'Generating...' : 'Generate Embedding'}
        </button>

        <button
          onClick={handleEmbedProject}
          disabled={loading}
          className={styles.buttonSecondary}
        >
          {loading ? 'Embedding...' : 'Embed Entire Project'}
        </button>

        <button
          onClick={loadStats}
          disabled={loading}
          className={styles.buttonInfo}
        >
          Refresh Stats
        </button>
      </div>

      {result && (
        <div className={styles.success}>
          {result}
        </div>
      )}

      {error && (
        <div className={styles.error}>
          ❌ Error: {error}
        </div>
      )}

      {!isElectron && (
        <div className={styles.warning}>
          <h3>⚠️ Not Running in Electron</h3>
          <p>
            Embedding generation requires the Electron desktop app to store embeddings.
            To test embedding generation:
          </p>
          <ol>
            <li>Open the Electron desktop app (not browser)</li>
            <li>Or navigate to this page in the Electron app</li>
            <li>The app should be running from: <code>npm run dev</code></li>
          </ol>
          <p>
            <strong>Note:</strong> You can still test embedding generation in the browser
            (it will generate but not store). See console for details.
          </p>
        </div>
      )}

      <div className={styles.info}>
        <h3>📝 Instructions:</h3>
        <ol>
          <li>Enter the project ID (use "test-project" for your cached project)</li>
          <li>Enter text to embed (or use default)</li>
          <li>Click "Generate Embedding" to create a single embedding</li>
          <li>Or click "Embed Entire Project" to embed all cached files</li>
          <li>Check the console (DevTools) for detailed logs</li>
        </ol>
        
        <h3>💡 Note:</h3>
        <p>
          First time generating embeddings will download the model (~50-100MB).
          This happens automatically and only once.
        </p>
      </div>
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export default React.memo(EmbeddingTestPage);

