/**
 * Owner-Only ML Training Page
 * Protected page accessible ONLY to platform owner/creator
 * Manages vocabulary, anchors, datasets, and model retraining
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import fastapiClient from '@/api/fastapiClient';
import styles from './MLTraining.module.css';

interface TrainingStats {
  total_vocab_size: number;
  total_anchors: number;
  total_datasets: number;
  total_training_jobs: number;
  forbidden_words_count: number;
  last_training_at: string | null;
}

interface Anchor {
  hash: string;
  words: string[];
  xyz: number[];
  resonance: number;
  proof: {
    root: string;
    ts: number;
  };
}

interface Dataset {
  id: string;
  name: string;
  description: string;
  words: string[];
  created_at: string;
  created_by: string;
}

const MLTraining: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vocab' | 'anchors' | 'datasets' | 'retrain'>('overview');
  
  // Data states
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [vocabulary, setVocabulary] = useState<string[]>([]);
  const [forbiddenWords, setForbiddenWords] = useState<string[]>([]);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  
  // Form states
  const [newWords, setNewWords] = useState('');
  const [newForbidden, setNewForbidden] = useState('');
  const [anchorHash, setAnchorHash] = useState('');
  const [anchorWords, setAnchorWords] = useState('');
  const [datasetName, setDatasetName] = useState('');
  const [datasetWords, setDatasetWords] = useState('');
  const [retrainAddWords, setRetrainAddWords] = useState('');
  const [retrainRemoveWords, setRetrainRemoveWords] = useState('');
  
  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [statsRes, vocabRes, forbiddenRes, anchorsRes, datasetsRes] = await Promise.all([
        fastapiClient.get('/api/v1/owner/ml-training/stats'),
        fastapiClient.get('/api/v1/owner/ml-training/vocab'),
        fastapiClient.get('/api/v1/owner/ml-training/forbidden'),
        fastapiClient.get('/api/v1/owner/ml-training/anchors'),
        fastapiClient.get('/api/v1/owner/ml-training/datasets'),
      ]);
      
      setStats(statsRes.data);
      setVocabulary(vocabRes.data.words || []);
      setForbiddenWords(forbiddenRes.data.forbidden || []);
      setAnchors(anchorsRes.data.anchors || []);
      setDatasets(datasetsRes.data.datasets || []);
    } catch (err: any) {
      console.error('Failed to load ML training data:', err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Access denied. Owner authentication required.');
        setTimeout(() => navigate('/dashboard'), 2000);
      } else {
        setError('Failed to load data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleAddVocab = async () => {
    if (!newWords.trim()) return;
    
    setActionLoading(true);
    try {
      const words = newWords.split(',').map(w => w.trim()).filter(w => w);
      await fastapiClient.post('/api/v1/owner/ml-training/vocab', words);
      showMessage('success', `Added ${words.length} words to vocabulary`);
      setNewWords('');
      loadData();
    } catch (err: any) {
      showMessage('error', err.response?.data?.detail || 'Failed to add words');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddForbidden = async () => {
    if (!newForbidden.trim()) return;
    
    setActionLoading(true);
    try {
      const words = newForbidden.split(',').map(w => w.trim()).filter(w => w);
      await fastapiClient.post('/api/v1/owner/ml-training/forbidden', { add: words });
      showMessage('success', `Added ${words.length} forbidden words`);
      setNewForbidden('');
      loadData();
    } catch (err: any) {
      showMessage('error', err.response?.data?.detail || 'Failed to add forbidden words');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddAnchor = async () => {
    if (!anchorHash.trim() || !anchorWords.trim()) return;
    
    const words = anchorWords.split(',').map(w => w.trim()).filter(w => w);
    if (words.length !== 12) {
      showMessage('error', 'Anchor must have exactly 12 words');
      return;
    }
    
    setActionLoading(true);
    try {
      await fastapiClient.post('/api/v1/owner/ml-training/anchors', {
        hash: anchorHash,
        words: words
      });
      showMessage('success', 'Anchor added successfully');
      setAnchorHash('');
      setAnchorWords('');
      loadData();
    } catch (err: any) {
      showMessage('error', err.response?.data?.detail || 'Failed to add anchor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAnchor = async (hash: string) => {
    if (!confirm('Delete this anchor?')) return;
    
    setActionLoading(true);
    try {
      await fastapiClient.delete(`/api/v1/owner/ml-training/anchors/${encodeURIComponent(hash)}`);
      showMessage('success', 'Anchor deleted');
      loadData();
    } catch (err: any) {
      showMessage('error', err.response?.data?.detail || 'Failed to delete anchor');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateDataset = async () => {
    if (!datasetName.trim() || !datasetWords.trim()) return;
    
    setActionLoading(true);
    try {
      const words = datasetWords.split(',').map(w => w.trim()).filter(w => w);
      await fastapiClient.post('/api/v1/owner/ml-training/datasets', {
        name: datasetName,
        words: words
      });
      showMessage('success', 'Dataset created');
      setDatasetName('');
      setDatasetWords('');
      loadData();
    } catch (err: any) {
      showMessage('error', err.response?.data?.detail || 'Failed to create dataset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetrain = async () => {
    setActionLoading(true);
    try {
      const addWords = retrainAddWords ? retrainAddWords.split(',').map(w => w.trim()).filter(w => w) : undefined;
      const removeWords = retrainRemoveWords ? retrainRemoveWords.split(',').map(w => w.trim()).filter(w => w) : undefined;
      
      const response = await fastapiClient.post('/api/v1/owner/ml-training/retrain', {
        add_words: addWords,
        remove_words: removeWords
      });
      
      showMessage('success', `Model retrained! Vocab size: ${response.data.vocab_size}`);
      setRetrainAddWords('');
      setRetrainRemoveWords('');
      loadData();
    } catch (err: any) {
      showMessage('error', err.response?.data?.detail || 'Retrain failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading ML Training Console...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🔒 ML Training Console</h1>
        <p className={styles.subtitle}>Owner-Only Access • DevSwat V8 Training System</p>
      </header>

      {actionMessage && (
        <div className={`${styles.message} ${styles[actionMessage.type]}`}>
          {actionMessage.text}
        </div>
      )}

      <nav className={styles.tabs}>
        {(['overview', 'vocab', 'anchors', 'datasets', 'retrain'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      <main className={styles.content}>
        {activeTab === 'overview' && stats && (
          <div className={styles.overview}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.total_vocab_size}</span>
                <span className={styles.statLabel}>Vocabulary Words</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.total_anchors}</span>
                <span className={styles.statLabel}>Anchors</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.total_datasets}</span>
                <span className={styles.statLabel}>Datasets</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.total_training_jobs}</span>
                <span className={styles.statLabel}>Training Jobs</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{stats.forbidden_words_count}</span>
                <span className={styles.statLabel}>Forbidden Words</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>
                  {stats.last_training_at ? new Date(stats.last_training_at).toLocaleDateString() : 'Never'}
                </span>
                <span className={styles.statLabel}>Last Training</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vocab' && (
          <div className={styles.section}>
            <h2>Vocabulary Management</h2>
            
            <div className={styles.formGroup}>
              <label>Add Words (comma-separated)</label>
              <input
                type="text"
                value={newWords}
                onChange={e => setNewWords(e.target.value)}
                placeholder="word1, word2, word3..."
                className={styles.input}
              />
              <button onClick={handleAddVocab} disabled={actionLoading} className={styles.button}>
                Add to Vocabulary
              </button>
            </div>

            <div className={styles.formGroup}>
              <label>Add Forbidden Words (comma-separated)</label>
              <input
                type="text"
                value={newForbidden}
                onChange={e => setNewForbidden(e.target.value)}
                placeholder="forbidden1, forbidden2..."
                className={styles.input}
              />
              <button onClick={handleAddForbidden} disabled={actionLoading} className={styles.buttonDanger}>
                Add to Forbidden
              </button>
            </div>

            <div className={styles.wordLists}>
              <div className={styles.wordList}>
                <h3>Vocabulary ({vocabulary.length})</h3>
                <div className={styles.wordTags}>
                  {vocabulary.slice(0, 100).map(word => (
                    <span key={word} className={styles.wordTag}>{word}</span>
                  ))}
                  {vocabulary.length > 100 && <span className={styles.wordMore}>+{vocabulary.length - 100} more</span>}
                </div>
              </div>
              
              <div className={styles.wordList}>
                <h3>Forbidden ({forbiddenWords.length})</h3>
                <div className={styles.wordTags}>
                  {forbiddenWords.map(word => (
                    <span key={word} className={styles.wordTagForbidden}>{word}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'anchors' && (
          <div className={styles.section}>
            <h2>Anchor Management</h2>
            
            <div className={styles.formGroup}>
              <label>Hash (0x...)</label>
              <input
                type="text"
                value={anchorHash}
                onChange={e => setAnchorHash(e.target.value)}
                placeholder="0x1234..."
                className={styles.input}
              />
              <label>12 Words (comma-separated)</label>
              <input
                type="text"
                value={anchorWords}
                onChange={e => setAnchorWords(e.target.value)}
                placeholder="word1, word2, word3, ... (exactly 12)"
                className={styles.input}
              />
              <button onClick={handleAddAnchor} disabled={actionLoading} className={styles.button}>
                Add Anchor
              </button>
            </div>

            <div className={styles.anchorList}>
              <h3>Anchors ({anchors.length})</h3>
              {anchors.map(anchor => (
                <div key={anchor.hash} className={styles.anchorCard}>
                  <div className={styles.anchorHash}>{anchor.hash}</div>
                  <div className={styles.anchorWords}>{anchor.words.join(', ')}</div>
                  <div className={styles.anchorMeta}>
                    Resonance: {anchor.resonance.toFixed(4)} | 
                    XYZ: [{anchor.xyz.map(v => v.toFixed(2)).join(', ')}]
                  </div>
                  <button 
                    onClick={() => handleDeleteAnchor(anchor.hash)} 
                    className={styles.buttonSmallDanger}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'datasets' && (
          <div className={styles.section}>
            <h2>Dataset Management</h2>
            
            <div className={styles.formGroup}>
              <label>Dataset Name</label>
              <input
                type="text"
                value={datasetName}
                onChange={e => setDatasetName(e.target.value)}
                placeholder="My Dataset"
                className={styles.input}
              />
              <label>Words (comma-separated)</label>
              <textarea
                value={datasetWords}
                onChange={e => setDatasetWords(e.target.value)}
                placeholder="word1, word2, word3..."
                className={styles.textarea}
              />
              <button onClick={handleCreateDataset} disabled={actionLoading} className={styles.button}>
                Create Dataset
              </button>
            </div>

            <div className={styles.datasetList}>
              <h3>Datasets ({datasets.length})</h3>
              {datasets.map(dataset => (
                <div key={dataset.id} className={styles.datasetCard}>
                  <div className={styles.datasetName}>{dataset.name}</div>
                  <div className={styles.datasetMeta}>
                    {dataset.words?.length || 0} words • Created {new Date(dataset.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'retrain' && (
          <div className={styles.section}>
            <h2>Retrain Model</h2>
            <p className={styles.warning}>
              ⚠️ Retraining will update the model vocabulary. This action is logged.
            </p>
            
            <div className={styles.formGroup}>
              <label>Add Words During Retrain (optional, comma-separated)</label>
              <input
                type="text"
                value={retrainAddWords}
                onChange={e => setRetrainAddWords(e.target.value)}
                placeholder="new_word1, new_word2..."
                className={styles.input}
              />
              <label>Remove Words During Retrain (optional, comma-separated)</label>
              <input
                type="text"
                value={retrainRemoveWords}
                onChange={e => setRetrainRemoveWords(e.target.value)}
                placeholder="old_word1, old_word2..."
                className={styles.input}
              />
              <button 
                onClick={handleRetrain} 
                disabled={actionLoading} 
                className={styles.buttonPrimary}
              >
                {actionLoading ? 'Retraining...' : '🚀 Retrain Model'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MLTraining;
