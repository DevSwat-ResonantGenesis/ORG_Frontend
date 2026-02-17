import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';
import { isAuthenticated } from '../../utils/auth-cookies';
import styles from './CodeVisualizerPage.module.css';

const CodeVisualizerPage: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = useMemo(() => getApiUrl(), []);

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const iframeSrc = useMemo(() => {
    const qs = typeof window !== 'undefined' ? (window.location.search || '') : '';
    return `${apiUrl}/api/v1/code-visualizer-ui/${qs}`;
  }, [apiUrl]);

  return (
    <div className={styles.container} style={{ padding: 0, margin: 0, maxWidth: 'none' }}>
      <iframe
        title="Code Visualizer"
        src={iframeSrc}
        style={{ width: '100vw', height: '100vh', border: '0', display: 'block' }}
        allow="fullscreen"
      />
    </div>
  );
};

export default CodeVisualizerPage;
