import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth-cookies';
import styles from './HashSpherePage.module.css';

import { ENV } from '../../config/env';

const HASH_SPHERE_URL = ENV.hashSphereUrl || '/api/v1/state-physics/ui';

const HashSpherePage: React.FC = () => {
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setError('Failed to connect to State Physics service. Please ensure the service is running.');
  };

  return (
    <div className={styles.container}>
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
  );
};

export default HashSpherePage;
