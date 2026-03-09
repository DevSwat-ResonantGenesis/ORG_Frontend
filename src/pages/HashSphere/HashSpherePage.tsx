import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import styles from './HashSpherePage.module.css';

import { ENV } from '../../config/env';
import { useThemeStore } from '../../store/themeStore';

const DEFAULT_HASH_SPHERE_PATH = '/api/v1/state-physics/ui';

const resolveHashSphereUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return DEFAULT_HASH_SPHERE_PATH;

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    const originWithoutTrailingSlash = window.location.origin.replace(/\/+$/, '');
    if (withoutTrailingSlash === originWithoutTrailingSlash) {
      return `${originWithoutTrailingSlash}${DEFAULT_HASH_SPHERE_PATH}`;
    }
  }

  if (withoutTrailingSlash.endsWith('dev-swat.com')) {
    try {
      const u = new URL(withoutTrailingSlash);
      if (!u.pathname || u.pathname === '/') {
        return `${u.origin}${DEFAULT_HASH_SPHERE_PATH}`;
      }
    } catch {
      return `${withoutTrailingSlash}${DEFAULT_HASH_SPHERE_PATH}`;
    }
  }

  return trimmed;
};

const HASH_SPHERE_URL = resolveHashSphereUrl(ENV.hashSphereUrl);

const HashSpherePage: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);
  const savedThemeRef = useRef(theme);

  /* Force dark mode — restore previous theme on unmount */
  useEffect(() => {
    savedThemeRef.current = useThemeStore.getState().theme;
    if (savedThemeRef.current !== 'dark') setTheme('dark');
    return () => {
      if (savedThemeRef.current !== 'dark') setTheme(savedThemeRef.current);
    };
  }, []);

  const postThemeToIframe = (nextTheme: 'dark' | 'light') => {
    const targetWindow = iframeRef.current?.contentWindow;
    if (!targetWindow || typeof window === 'undefined') return;

    let targetOrigin = '*';
    try {
      targetOrigin = new URL(HASH_SPHERE_URL, window.location.origin).origin;
    } catch {
      targetOrigin = '*';
    }

    targetWindow.postMessage({ type: 'RG_THEME', theme: nextTheme }, targetOrigin);
  };

  // Redirect to signup if not logged in
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setError('State Physics service is taking longer than expected to load...');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
    postThemeToIframe(theme);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to connect to State Physics service. Please ensure the service is running.');
  };

  useEffect(() => {
    postThemeToIframe(theme);
  }, [theme]);

  return (
    <div className={styles.container}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>State Physics</h2>
          <a
            className={styles.panelLink}
            href={HASH_SPHERE_URL}
            target="_blank"
            rel="noreferrer"
          >
            Open Full Screen
          </a>
        </div>

        <div className={styles.iframeContainer}>
          {isLoading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinner}></div>
              <p>Loading State Physics...</p>
              {error && <p className={styles.warning}>{error}</p>}
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={HASH_SPHERE_URL}
            className={styles.iframe}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="State Physics Visualizer"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
          />
        </div>
      </div>
    </div>
  );
};

export default HashSpherePage;
