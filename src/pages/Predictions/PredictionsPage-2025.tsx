import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchPredictions, createPrediction } from '../../api/predictions';
import { logger } from '../../utils/logger';
import type { Prediction } from '../../types';
import PredictionsFilters from './PredictionsFilters';
import PredictionsTable from './PredictionsTable';
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import inputStyles from '../../components/ui/Input-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './PredictionsPage-2025.module.css';

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
        const input = (p.input_text || (p as any).input || '').toLowerCase();
        const output = ((p as any).output || '').toLowerCase();
        const query = search.toLowerCase();
        return input.includes(query) || output.includes(query);
      });
    }
    if (minValidity > 0) {
      items = items.filter((p) => (p.validity || 0) >= minValidity);
    }
    if (maxRisk < 1) {
      items = items.filter((p) => {
        // Calculate risk from validity (lower validity = higher risk)
        const risk = 1 - (p.validity || 0) / 100;
        return risk <= maxRisk;
      });
    }
    setFiltered(items);
    setPage(1);
  }, [predictions, search, minValidity, maxRisk]);

  const paginatedItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={styles.loading}>Loading predictions...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
        <div className={layoutStyles.dashboardMain}>
          <div className={layoutStyles.dashboardContainer}>
            <div className={cardStyles.card + ' ' + styles.errorCard}>
              <h2 className="typography-section-title">Error</h2>
              <p className="typography-body">{error}</p>
              <button
                className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
                onClick={() => window.location.reload()}
                style={{ marginTop: 'var(--space-4)' }}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutStyles.page + ' ' + layoutStyles.dashboardPage}>
      <div className={layoutStyles.dashboardMain}>
        <div className={layoutStyles.dashboardContainer}>
          {/* Page Header */}
          <header className={styles.header}>
            <div>
              <h1 className="typography-page-title">Predictions</h1>
              <p className={'typography-body-small ' + styles.subtitle}>
                View and manage all AI predictions with validity scoring
              </p>
            </div>
            <button
              className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}
              onClick={() => navigate('/predictions/new')}
            >
              New Prediction
            </button>
          </header>

          {/* Filters */}
          <section className={styles.filtersSection}>
            <div className={cardStyles.card}>
              <div className={styles.filters}>
                <input
                  type="text"
                  className={inputStyles.input}
                  placeholder="Search predictions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <div className={styles.filterControls}>
                  <label className={inputStyles.label}>
                    Min Validity: {minValidity}%
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={minValidity}
                      onChange={(e) => setMinValidity(Number(e.target.value))}
                      className={styles.rangeInput}
                    />
                  </label>
                  <label className={inputStyles.label}>
                    Max Risk: {maxRisk}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={maxRisk}
                      onChange={(e) => setMaxRisk(Number(e.target.value))}
                      className={styles.rangeInput}
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Results */}
          <section className={styles.resultsSection}>
            <div className={styles.resultsHeader}>
              <h2 className="typography-subsection-title">
                {filtered.length} {filtered.length === 1 ? 'prediction' : 'predictions'}
              </h2>
            </div>

            {paginatedItems.length === 0 ? (
              <div className={cardStyles.card}>
                <p className="typography-body">No predictions found.</p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th className="typography-label">Input</th>
                      <th className="typography-label">Output</th>
                      <th className="typography-label">Validity</th>
                      <th className="typography-label">Risk</th>
                      <th className="typography-label">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((prediction) => (
                      <tr key={prediction.id}>
                        <td className="typography-body-small">
                          {(prediction.input_text || (prediction as any).input || '').substring(0, 50)}...
                        </td>
                        <td className="typography-body-small">
                          {((prediction as any).output || '').substring(0, 50)}...
                        </td>
                        <td>
                          <span className={styles.validityBadge}>
                            {Math.round(prediction.validity || 0)}%
                          </span>
                        </td>
                        <td>
                          <span className={styles.riskBadge}>
                            {(1 - (prediction.validity || 0) / 100).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <button
                            className={buttonStyles.button + ' ' + buttonStyles.buttonGhost + ' ' + buttonStyles.buttonSmall}
                            onClick={() => navigate(`/predictions/${prediction.id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary + ' ' + buttonStyles.buttonSmall}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className="typography-body-small">
                  Page {page} of {totalPages}
                </span>
                <button
                  className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary + ' ' + buttonStyles.buttonSmall}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default PredictionsPage;

