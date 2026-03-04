import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAnchors, deleteAnchor, Anchor } from '../../api/anchors';
import { Button, Card, Text } from '../../components/ui';
import AnchorCreateForm from './AnchorCreateForm';
import AnchorsTable from './AnchorsTable';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';
import { logger } from '../../utils/logger';

const AnchorsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<Anchor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
    const data = await fetchAnchors();
      setItems(data || []);
    } catch (err: any) {
      logger.error('Anchors load error', err, { component: 'AnchorsPage' });
      setError(err?.message || 'Failed to load context points');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ModernPageLayout
      title="Context Memory Management"
      subtitle="Manage context memory points for intelligent memory system. Create, organize, and track context points that enable persistent context and intelligent retrieval in AGI Neural Hub and AI applications."
      loading={loading}
      error={error}
      onRetry={load}
      maxWidth="xl"
    >
      {/* Create New Context Point */}
      <Card variant="elevated" padding="md">
              <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Create New Context Point
          </Text>
              </Card.Header>
              <Card.Body>
                <AnchorCreateForm onCreate={load} />
              </Card.Body>
            </Card>

      {/* Active Context Points */}
            <Card variant="elevated" padding="md">
              <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Active Context Points
          </Text>
          <Text variant="body-sm" color="secondary">
            {items.length > 0 
              ? `${items.length} context point${items.length !== 1 ? 's' : ''} active`
              : 'No context points created yet'}
          </Text>
              </Card.Header>
              <Card.Body>
                <AnchorsTable items={items} onDelete={deleteAnchor} reload={load} />
              </Card.Body>
            </Card>
    </ModernPageLayout>
  );
};

export default AnchorsPage;
