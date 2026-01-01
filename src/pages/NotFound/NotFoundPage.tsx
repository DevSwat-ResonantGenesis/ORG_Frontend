import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

/**
 * 404 Not Found Page
 * Displays when a route doesn't exist
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.errorCode}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.message}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <p className={styles.path}>
          <code>{location.pathname}</code>
        </p>
        <div className={styles.actions}>
          <button onClick={handleGoBack} className={styles.buttonSecondary}>
            Go Back
          </button>
          <button onClick={handleGoHome} className={styles.buttonPrimary}>
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

