import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPredictions, createPrediction } from '../../api/predictions';
import { logger } from '../../utils/logger';
import type { Prediction } from '../../types';
import PredictionsFilters from './PredictionsFilters';
import PredictionsTable from './PredictionsTable';
import { Button, Card, Text } from '../../components/ui';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { FlowDiagram } from '../../components/diagrams/FlowDiagram';
import { exportToCSV, exportToJSON } from '../../utils/export';
import { ModernPageLayout } from '../../components/layout/ModernPageLayout';

const PredictionsPage = () => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filtered, setFiltered] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [minValidity, setMinValidity] = useState(0);
  const [maxRisk, setMaxRisk] = useState(1);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchPredictions();
        setPredictions(data || []);
        setFiltered(data || []);
      } catch (e: any) {
        logger.error('Predictions fetch error', e, { component: 'PredictionsPage' });
        setError(e?.message || 'Failed to load predictions');
        setPredictions([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let items = predictions || [];
    if (search.trim()) {
      items = items.filter((p) => {
        const searchLower = search.toLowerCase();
        return (
          (p.id && p.id.toLowerCase().includes(searchLower)) ||
          (p.external_id && p.external_id.toLowerCase().includes(searchLower)) ||
          (p.policies_triggered && Array.isArray(p.policies_triggered) && 
           p.policies_triggered.some((pol: string) => pol.toLowerCase().includes(searchLower)))
        );
      });
    }
    items = items.filter((p) => (p.validity || 0) >= minValidity && (p.entropy || 0) <= maxRisk);
    setFiltered(items);
    setPage(1);
  }, [search, minValidity, maxRisk, predictions]);

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageItems = filtered.slice(start, end);

  const handleExportCSV = () => {
    exportToCSV(filtered, 'predictions');
  };

  const handleExportJSON = () => {
    exportToJSON(filtered, 'predictions');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    event.target.value = '';

    const fileName = file.name.toLowerCase();
    const validExtensions = ['.json', '.jsonl', '.txt'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      alert('❌ Invalid file type. Please upload a .json, .jsonl, or .txt file.');
      return;
    }

    try {
      const text = await file.text();
      if (!text.trim()) {
        alert('File is empty. Please upload a file with content.');
        return;
      }

      const lines = text.split('\n')
        .map((line, idx) => ({ line: line.trim(), originalIndex: idx + 1 }))
        .filter(({ line }) => {
          if (!line) return false;
          if (line.startsWith('#') || line.startsWith('//') || line.startsWith('/*')) return false;
          const shellCommands = ['cd ', 'chmod', 'mkdir', 'rm ', 'cp ', 'mv ', 'echo', 'export', '#!/'];
          if (shellCommands.some(cmd => line.toLowerCase().startsWith(cmd))) return false;
          if (/^[━⚠┏┗┓┛─═║\s]+$/.test(line)) return false;
          return line.trim().startsWith('{') || line.trim().startsWith('[');
        });

      if (lines.length === 0) {
        alert('❌ No valid JSON lines found in file.\n\nExpected JSONL format (one JSON object per line).');
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      for (const { line, originalIndex } of lines) {
        try {
          const data = JSON.parse(line);
          if (typeof data !== 'object' || data === null) {
            errorCount++;
            errors.push(`Line ${originalIndex}: Not a valid JSON object`);
            continue;
          }
          
          if (data.text || data.input_text) {
            await createPrediction(data.text || data.input_text, data.context);
            successCount++;
          } else {
            errorCount++;
            errors.push(`Line ${originalIndex}: Missing 'text' or 'input_text' field`);
          }
        } catch (e: any) {
          errorCount++;
          const errorMsg = e?.message || 'Invalid JSON';
          errors.push(`Line ${originalIndex}: ${errorMsg}`);
          logger.error('Failed to parse prediction line', e, { component: 'PredictionsPage', line: originalIndex });
        }
      }
      
      // Refresh predictions
      try {
        const data = await fetchPredictions();
        setPredictions(data || []);
        setFiltered(data || []);
      } catch (refreshError) {
        logger.error('Failed to refresh predictions after upload', refreshError);
      }

      // Show results
      if (errorCount === 0) {
        alert(`✅ Successfully processed ${successCount} prediction(s)`);
      } else if (successCount > 0) {
        alert(`⚠️ Processed ${successCount} prediction(s), ${errorCount} failed.\n\nErrors:\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n... and ${errors.length - 5} more` : ''}`);
      } else {
        alert(`❌ Failed to process file.\n\nErrors:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n... and ${errors.length - 10} more` : ''}`);
      }
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown error';
      alert(`❌ Failed to process file: ${errorMessage}\n\nPlease ensure the file is a valid JSONL format (one JSON object per line).`);
      logger.error('File upload error', error, { component: 'PredictionsPage', fileName: file.name });
    }
  };

  const headerActions = (
    <>
          <input
            type="file"
        accept=".txt,.json,.jsonl"
            onChange={handleFileUpload}
            id="file-upload-input"
            style={{ display: 'none' }}
          />
          <Button size="md" onClick={() => document.getElementById('file-upload-input')?.click()}>
            Upload File
          </Button>
          <Button variant="secondary" size="md" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="secondary" size="md" onClick={handleExportJSON}>
            Export JSON
          </Button>
    </>
  );

  return (
    <ModernPageLayout
      title="Predictions"
      subtitle="Monitor and analyze all AI predictions with real-time risk scoring and compliance validation."
      headerActions={headerActions}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      maxWidth="xl"
    >
          {/* Prediction Flow Diagram */}
            <Card variant="elevated" padding="md">
              <Card.Header>
          <Text variant="h2" color="primary" style={{ marginBottom: 'var(--space-1)' }}>
            How Predictions Are Processed
          </Text>
                <Text variant="body-sm" color="secondary">
                  Input validation, evidence extraction, graph construction, policy evaluation, and risk assessment.
                </Text>
              </Card.Header>
              <Card.Body>
                <FlowDiagram type="prediction" animated={true} />
              </Card.Body>
            </Card>

          {/* Filters */}
      <Card variant="outlined" padding="md">
        <Card.Header>
          <Text variant="h3" color="primary" style={{ marginBottom: 'var(--space-2)' }}>
            Filters
          </Text>
              <Text variant="body-sm" color="secondary">
                Filter predictions by search terms, validity scores, and risk levels.
              </Text>
        </Card.Header>
        <Card.Body>
            <PredictionsFilters
              search={search}
              setSearch={setSearch}
              minValidity={minValidity}
              setMinValidity={setMinValidity}
              maxRisk={maxRisk}
              setMaxRisk={setMaxRisk}
            />
        </Card.Body>
      </Card>

      {/* Table or Empty State */}
            {pageItems.length === 0 ? (
        <EmptyState
          title={filtered.length === 0 && predictions.length > 0 ? "No predictions match your filters" : "No predictions yet"}
          description={
            filtered.length === 0 && predictions.length > 0
              ? 'Try adjusting your filters to see more results. You can search by prediction ID, external ID, or policy names.'
              : 'Create your first prediction to get started. Use the "Upload File" button to batch upload predictions, or submit predictions via API integration.'
          }
          icon="📊"
          action={
            filtered.length === 0 && predictions.length > 0
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearch('');
                    setMinValidity(0);
                    setMaxRisk(1);
                  },
                  variant: 'secondary' as const
                }
              : {
                  label: 'Upload File',
                  onClick: () => document.getElementById('file-upload-input')?.click(),
                  variant: 'primary' as const
                }
          }
            />
            ) : (
              <>
          <Card variant="elevated" padding="md">
            <Card.Header>
                  <Text variant="body-sm" color="secondary">
                    Showing {pageItems.length} of {filtered.length} predictions. Click on any prediction to view detailed information, 
                    evidence graph, and compliance status.
                  </Text>
            </Card.Header>
            <Card.Body style={{ padding: 0 }}>
                <PredictionsTable items={pageItems} onViewDetails={(id) => navigate(`/predictions/${id}`)} />
            </Card.Body>
          </Card>

            {/* Pagination */}
            {filtered.length > ITEMS_PER_PAGE && (
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 'var(--space-3)',
              padding: 'var(--space-6) 0'
              }}>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Text variant="body-sm" color="secondary" style={{ 
                padding: '0 var(--space-3)',
                  minWidth: '120px',
                  textAlign: 'center'
                }}>
                  Page {page} / {Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1}
                </Text>
                <Button
                  variant="secondary"
                  size="md"
                  disabled={end >= filtered.length}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
        </>
      )}
    </ModernPageLayout>
  );
};

export default PredictionsPage;
