import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import HashSphere from '@/components/HashSphere/HashSphere';
import { Button } from '@/components/ui';
import { goToHome } from '@/utils/navigation';
import { getHashSphereToken } from '@/api/hashSphere';
import { logger } from '@/utils/logger';
import styles from './HashSphereFullscreenPage.module.css';

const HashSphereFullscreenPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Hide body scrollbar for fullscreen
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check for token in URL params
        const token = searchParams.get('token');
        
        if (token) {
          // Store token in sessionStorage for this session
          sessionStorage.setItem('hash_sphere_view_token', token);
          setIsAuthorized(true);
          setIsLoading(false);
          return;
        }

        // Check for token in sessionStorage
        const storedToken = sessionStorage.getItem('hash_sphere_view_token');
        if (storedToken) {
          // Validate token format (HS-{id}.{secret})
          if (storedToken.startsWith('HS-') && storedToken.includes('.')) {
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          } else {
            // Invalid token format, clear it
            sessionStorage.removeItem('hash_sphere_view_token');
          }
        }

        // No valid token found - this is a protected page
        setError('Access token required. This is a company secret visualization.');
        setIsLoading(false);
        setIsAuthorized(false);
      } catch (err) {
        logger.error('Hash Sphere access check failed', err);
        setError('Failed to verify access. Please contact administrator.');
        setIsLoading(false);
        setIsAuthorized(false);
      }
    };

    checkAccess();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className={styles.fullscreen}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#fff'
        }}>
          <div>Loading Hash Sphere...</div>
        </div>
      </div>
    );
  }

  if (!isAuthorized || error) {
    return (
      <div className={styles.fullscreen}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: '#fff',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: '1rem' }}>Access Restricted</h1>
          <p style={{ marginBottom: '2rem', maxWidth: '600px' }}>
            {error || 'This Hash Sphere visualization is a company secret. Access requires a valid token.'}
          </p>
          <Button
            onClick={() => goToHome(navigate)}
            variant="outline"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fullscreen}>
      <div className={styles.controls}>
        <Button
          onClick={() => goToHome(navigate)}
          variant="outline"
          className={styles.exitButton}
        >
          Exit to Home
        </Button>
      </div>
      <div className={styles.hashSphereContainer}>
        <HashSphere />
      </div>
    </div>
  );
};

export default HashSphereFullscreenPage;

