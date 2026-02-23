/**
 * V8 HashSphere Page - Wrapper with platform header
 * Embeds the V8 HashSphere application with full platform navigation
 */

import React from 'react';
import { Header } from '../../components/layout/Header/Header';

const V8Page: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Header />
      <div style={{ paddingTop: '60px', height: 'calc(100vh - 60px)' }}>
        <iframe
          src="/v8/?embedded=true"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            background: '#0a0a0f',
          }}
          title="V8 HashSphere"
        />
      </div>
    </div>
  );
};

export default V8Page;
