import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../../utils/apiUrl';
import { isAuthenticated } from '../../utils/auth-cookies';
import { useThemeStore } from '../../store/themeStore';
import styles from './ResonantMemoryPage.module.css';
import { Helmet } from 'react-helmet-async';
import { ROUTE_META } from '@/config/routeMeta.mjs';

const meta = ROUTE_META['/resonant-memory'];

/* Force dark mode on this page — restore previous theme on unmount */
function useForceDarkMode() {
  const { setTheme } = useThemeStore();
  const savedTheme = useRef(useThemeStore.getState().theme);
  useEffect(() => {
    savedTheme.current = useThemeStore.getState().theme;
    if (savedTheme.current !== 'dark') setTheme('dark');
    return () => {
      if (savedTheme.current !== 'dark') setTheme(savedTheme.current);
    };
  }, []);
}

const ResonantMemoryPage: React.FC = () => {
  useForceDarkMode();
  const navigate = useNavigate();
  const apiUrl = useMemo(() => getApiUrl(), []);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  const iframeSrc = useMemo(() => {
    const qs = typeof window !== 'undefined' ? (window.location.search || '') : '';
    return `${apiUrl}/api/v1/memory/visualizer/hash-sphere${qs}`;
  }, [apiUrl]);

  return (
    <div className={styles.container} style={{ padding: 0, margin: 0, maxWidth: 'none' }}>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href="https://dev-swat.com/resonant-memory" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content="https://dev-swat.com/resonant-memory" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
      </Helmet>
      <iframe
        title="Resonant Memory"
        src={iframeSrc}
        style={{ width: '100vw', height: '100vh', border: '0', display: 'block' }}
        allow="fullscreen"
      />
    </div>
  );
};

export default ResonantMemoryPage;
