import React from 'react';
import HashSphere from '../../components/HashSphere/HashSphere';
import styles from './HashSphereTestPage.module.css';

const HashSphereTestPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <HashSphere />
    </div>
  );
};

export default HashSphereTestPage;

