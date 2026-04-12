import React, { useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import { getApiUrl } from '../../utils/apiUrl';
import { useThemeStore } from '../../store/themeStore';
import styles from './HashSpherePage.module.css';

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

const HashSpherePage: React.FC = () => {
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
    return `${apiUrl}/api/v1/state-physics/ui${qs}`;
  }, [apiUrl]);

  return (
    <div className={styles.container} style={{ padding: 0, margin: 0, maxWidth: 'none' }}>
      <iframe
        title="State Physics Visualizer"
        src={iframeSrc}
        style={{ width: '100vw', height: '100vh', border: '0', display: 'block' }}
        allow="fullscreen"
      />
    </div>
  );
};

export default HashSpherePage;
