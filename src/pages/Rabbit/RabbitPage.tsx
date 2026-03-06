import React, { useEffect, useState } from 'react';
import { UnifiedPageLayout } from '../shared/UnifiedPageLayout';

const RabbitPage: React.FC = () => {
  const [health, setHealth] = useState<string>('Checking...');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const resp = await fetch('/api/v1/rabbit/health', { credentials: 'include' });
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        if (!cancelled) setHealth(data?.status ?? 'ok');
      } catch {
        if (!cancelled) setHealth('Unavailable');
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <UnifiedPageLayout
      title="Rabbit"
      subtitle="A Reddit-like community platform for ResonantGenesis users"
    >
      <div style={{ display: 'grid', gap: 12, maxWidth: 720 }}>
        <div>
          <strong>Backend status:</strong> {health}
        </div>
        <div>
          <a href="/api/v1/rabbit/health" target="_blank" rel="noreferrer">
            Open API health endpoint
          </a>
        </div>
        <div>
          <a href="/api/v1/rabbit/communities" target="_blank" rel="noreferrer">
            List communities (API)
          </a>
        </div>
      </div>
    </UnifiedPageLayout>
  );
};

export default RabbitPage;
