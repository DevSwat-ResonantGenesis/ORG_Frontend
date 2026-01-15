import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';
import { isAuthenticated } from '../../utils/auth-cookies';
import styles from './CodeVisualizerPage.module.css';

const DESKTOP_APP_URL = import.meta.env.VITE_DESKTOP_APP_URL || '/download';

const CodeVisualizerPage: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = useMemo(() => getApiUrl(), []);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [projectName, setProjectName] = useState('');
  const [metadata, setMetadata] = useState('{"source":"web","notes":""}');
  const [file, setFile] = useState<File | null>(null);

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const handleUpload = async () => {
    setError(null);
    setResult(null);

    if (!file) {
      setError('Choose a zip or tar archive to scan.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (projectName.trim()) {
        formData.append('project_name', projectName.trim());
      }
      if (metadata.trim()) {
        formData.append('metadata', metadata.trim());
      }

      const response = await fetch(`${apiUrl}/scan/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Upload failed.' }));
        throw new Error(errorData.detail || 'Upload failed.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>Code Visualizer</p>
          <h1>Scan Your Codebase, Safely</h1>
          <p className={styles.subtitle}>
            Upload a zip or tar archive to generate dependency graphs, API maps, and risk insights.
            For local-first scanning, download the desktop app.
          </p>
        </div>
        <a className={styles.downloadButton} href={DESKTOP_APP_URL}>
          Download Desktop App
        </a>
      </div>

      <div className={styles.panelGrid}>
        <section className={styles.uploadPanel}>
          <h2>Upload Archive</h2>
          <p className={styles.panelHint}>Max 100 MB, 10k files, 500 MB extracted.</p>

          <label className={styles.field}>
            <span>Project name</span>
            <input
              type="text"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Genesis Backend"
            />
          </label>

          <label className={styles.field}>
            <span>Metadata (JSON)</span>
            <textarea
              value={metadata}
              onChange={(event) => setMetadata(event.target.value)}
              rows={4}
            />
          </label>

          <label className={styles.fileDrop}>
            <input
              type="file"
              accept=".zip,.tar,.gz,.tgz"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            <span>{file ? file.name : 'Choose a .zip / .tar / .tar.gz file'}</span>
          </label>

          {error && <p className={styles.error}>{error}</p>}

          <button
            className={styles.primaryButton}
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? 'Scanning…' : 'Upload & Scan'}
          </button>
        </section>

        <section className={styles.resultsPanel}>
          <h2>Latest Result</h2>
          {result ? (
            <pre className={styles.resultBox}>{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <div className={styles.resultEmpty}>
              <p>No scans yet. Upload a project to generate the first analysis.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CodeVisualizerPage;
