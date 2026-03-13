import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import {
  browseMarketplaceItems,
  installItem,
  purchaseItem,
  listInstallations,
  listItemReviews,
  createReview,
  getMarketTrends,
  getUserDashboard,
  getExecutionLedger,
  listNFT,
  type MarketplaceItem,
  type MarketplaceItemType,
  type MarketplaceInstallation,
  type MarketplaceReview,
  type MarketTrends,
  type UserDashboard,
  type ExecutionLedgerEntry,
} from '../../api/marketplace';
import { useToastContext } from '../../context/ToastContext';
import styles from './MarketplacePage.module.css';

type Tab = 'browse' | 'dashboard' | 'trends' | 'ledger';

const CATEGORIES: { label: string; value: MarketplaceItemType | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Agents', value: 'agent' },
  { label: 'Plugins', value: 'plugin' },
  { label: 'Templates', value: 'template' },
  { label: 'Workflows', value: 'workflow' },
  { label: 'Integrations', value: 'integration' },
];

const TypeIcon: React.FC<{ type: string; size?: number }> = ({ type, size = 24 }) => {
  const s = size;
  switch (type) {
    case 'agent': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/>
      </svg>
    );
    case 'plugin': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v6m0 12v2M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"/>
      </svg>
    );
    case 'template': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    );
    case 'workflow': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    );
    case 'integration': return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    );
    default: return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    );
  }
};

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();

  // Core state
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [installations, setInstallations] = useState<MarketplaceInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('browse');

  // Filters
  const [typeFilter, setTypeFilter] = useState<MarketplaceItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');

  // Detail modal
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [itemReviews, setItemReviews] = useState<MarketplaceReview[]>([]);
  const [installing, setInstalling] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dashboard/Trends/Ledger
  const [marketTrends, setMarketTrends] = useState<MarketTrends | null>(null);
  const [userDashboard, setUserDashboard] = useState<UserDashboard | null>(null);
  const [executionLedger, setExecutionLedger] = useState<ExecutionLedgerEntry[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // NFT modal
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nftListingType, setNftListingType] = useState<'sale' | 'rent' | 'auction'>('sale');
  const [nftPrice, setNftPrice] = useState('');
  const [nftRentPrice, setNftRentPrice] = useState('');
  const [listingNFT, setListingNFT] = useState(false);

  // ---------- Load items ----------
  const loadItems = useCallback(async () => {
    if (!canAccess(userRole, 'predictions')) { navigate('/dashboard'); return; }
    setLoading(true);
    setError(null);
    try {
      const params = {
        item_type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchQuery || undefined,
        limit: 100,
        offset: 0,
      };
      const [itemsData, installData] = await Promise.all([
        browseMarketplaceItems(params),
        listInstallations().catch(() => []),
      ]);

      let sorted = [...itemsData];
      if (sortBy === 'popular') sorted.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
      else if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      else if (sortBy === 'rating') sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));

      setItems(sorted);
      setInstallations(installData);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to load items';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, typeFilter, searchQuery, sortBy, toast]);

  useEffect(() => { loadItems(); }, [loadItems]);

  // ---------- Tab data loading ----------
  const loadTrends = useCallback(async () => {
    setLoadingTrends(true);
    try { setMarketTrends(await getMarketTrends()); } catch (e) { logger.error('Trends:', e); }
    finally { setLoadingTrends(false); }
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try { setUserDashboard(await getUserDashboard()); } catch (e) { logger.error('Dashboard:', e); }
    finally { setLoadingDashboard(false); }
  }, []);

  const loadLedger = useCallback(async () => {
    try {
      let d = userDashboard;
      if (!d) { d = await getUserDashboard(); setUserDashboard(d); }
      const ids = (d?.owned_items || []).map(i => i.id).slice(0, 10);
      if (ids.length === 0) return;
      const results = await Promise.all(ids.map(id => getExecutionLedger(id, 20).catch(() => [])));
      setExecutionLedger(results.flat().sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()));
    } catch (e) { logger.error('Ledger:', e); }
  }, [userDashboard]);

  useEffect(() => {
    if (activeTab === 'trends' && !marketTrends) loadTrends();
    else if (activeTab === 'dashboard' && !userDashboard) loadDashboard();
    else if (activeTab === 'ledger' && executionLedger.length === 0) loadLedger();
  }, [activeTab, marketTrends, userDashboard, executionLedger.length, loadTrends, loadDashboard, loadLedger]);

  // ---------- Actions ----------
  const isInstalled = (id: string) => installations.some(i => i.item_id === id);

  const openDetail = async (item: MarketplaceItem) => {
    setSelectedItem(item);
    try { setItemReviews(await listItemReviews(item.id)); } catch { setItemReviews([]); }
  };

  const closeDetail = () => {
    setSelectedItem(null);
    setItemReviews([]);
    setShowReviewForm(false);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleInstall = async () => {
    if (!selectedItem) return;
    setInstalling(true);
    try { await installItem(selectedItem.id); toast.success(`${selectedItem.name} installed!`); loadItems(); }
    catch (e: any) { toast.error(e?.message || 'Install failed'); }
    finally { setInstalling(false); }
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchasing(true);
    try { await purchaseItem(selectedItem.id); toast.success(`${selectedItem.name} purchased!`); await handleInstall(); }
    catch (e: any) { toast.error(e?.message || 'Purchase failed'); }
    finally { setPurchasing(false); }
  };

  const handleReview = async () => {
    if (!selectedItem) return;
    setSubmittingReview(true);
    try {
      await createReview(selectedItem.id, { rating: reviewRating, comment: reviewComment });
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      setItemReviews(await listItemReviews(selectedItem.id));
    } catch (e: any) { toast.error(e?.message || 'Review failed'); }
    finally { setSubmittingReview(false); }
  };

  const handleListNFT = async () => {
    if (!selectedItem || !nftPrice) return;
    setListingNFT(true);
    try {
      await listNFT({
        item_id: selectedItem.id,
        listing_type: nftListingType,
        price: parseFloat(nftPrice),
        rent_price_per_day: nftRentPrice ? parseFloat(nftRentPrice) : undefined,
      });
      toast.success('NFT listed!');
      setShowNFTModal(false);
      setNftPrice('');
      setNftRentPrice('');
      loadDashboard();
    } catch (e: any) { toast.error(e?.message || 'Failed to list NFT'); }
    finally { setListingNFT(false); }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  // ---------- RENDER ----------
  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Browse marketplace</h1>
        <p className={styles.heroSub}>
          Search through our collection of AI agents, plugins, templates, and workflows.
        </p>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <div className={styles.searchIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search agents, plugins, workflows..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadItems()}
        />
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['browse', 'dashboard', 'trends', 'ledger'] as Tab[]).map(t => (
          <button key={t} className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`} onClick={() => setActiveTab(t)}>
            {t === 'browse' ? 'Browse' : t === 'dashboard' ? 'My Items' : t === 'trends' ? 'Trends' : 'Ledger'}
          </button>
        ))}
      </div>

      {/* ===== BROWSE TAB ===== */}
      {activeTab === 'browse' && (
        <>
          {/* Category pills */}
          <div className={styles.pills}>
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                className={`${styles.pill} ${typeFilter === c.value ? styles.pillActive : ''}`}
                onClick={() => setTypeFilter(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Sort bar */}
          <div className={styles.sortBar}>
            <span className={styles.sortLabel}>{items.length} items</span>
            <div className={styles.sortBtns}>
              {(['popular', 'newest', 'rating'] as const).map(s => (
                <button key={s} className={`${styles.sortBtn} ${sortBy === s ? styles.sortBtnActive : ''}`} onClick={() => setSortBy(s)}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Icon grid */}
          {loading ? (
            <div className={styles.loading}><div className={styles.spinner} />Loading...</div>
          ) : error ? (
            <div className={styles.emptyState}>
              <p>{error}</p>
              <button className={styles.btnPrimary} onClick={loadItems} style={{ display: 'inline-block', width: 'auto', marginTop: 12 }}>Retry</button>
            </div>
          ) : items.length === 0 ? (
            <div className={styles.emptyState}><p>No items found. Try adjusting your filters.</p></div>
          ) : (
            <div className={styles.iconGrid}>
              {items.map(item => {
                const installed = isInstalled(item.id);
                const featured = (item.average_rating || 0) >= 4 && (item.download_count || 0) >= 10;
                return (
                  <div
                    key={item.id}
                    className={`${styles.iconCard} ${featured ? styles.iconCardFeatured : ''}`}
                    onClick={() => openDetail(item)}
                  >
                    {installed && <span className={`${styles.cardBadge} ${styles.badgeInstalled}`}>Installed</span>}
                    {!installed && featured && <span className={`${styles.cardBadge} ${styles.badgeFeatured}`}>Featured</span>}
                    {!installed && !featured && item.is_free && <span className={`${styles.cardBadge} ${styles.badgeFree}`}>Free</span>}
                    {!installed && !featured && !item.is_free && <span className={`${styles.cardBadge} ${styles.badgePaid}`}>${item.price?.toFixed(0)}</span>}

                    <div className={styles.cardIcon}>
                      <TypeIcon type={item.item_type} size={40} />
                    </div>
                    <div className={styles.cardName}>{item.name}</div>
                    <div className={styles.cardType}>{item.item_type}</div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===== DASHBOARD TAB ===== */}
      {activeTab === 'dashboard' && (
        <>
          {loadingDashboard ? (
            <div className={styles.loading}><div className={styles.spinner} />Loading dashboard...</div>
          ) : userDashboard ? (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={`${styles.statValue} ${styles.statValueGreen}`}>${userDashboard.total_earnings.toFixed(2)}</div>
                  <div className={styles.statName}>Total Earnings</div>
                </div>
                <div className={styles.statCard}>
                  <div className={`${styles.statValue} ${styles.statValuePurple}`}>${userDashboard.total_spent.toFixed(2)}</div>
                  <div className={styles.statName}>Total Spent</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statValue}>{userDashboard.owned_items.length}</div>
                  <div className={styles.statName}>Owned Items</div>
                </div>
                <div className={styles.statCard}>
                  <div className={`${styles.statValue} ${styles.statValueBlue}`}>{userDashboard.active_listings.length}</div>
                  <div className={styles.statName}>Active Listings</div>
                </div>
              </div>

              <h3 className={styles.sectionTitle}>My Items ({userDashboard.owned_items.length})</h3>
              {userDashboard.owned_items.length === 0 ? (
                <div className={styles.emptyState}><p>You don't own any items yet.</p></div>
              ) : (
                <div className={styles.iconGrid}>
                  {userDashboard.owned_items.map(item => (
                    <div key={item.id} className={styles.iconCard} onClick={() => openDetail(item)}>
                      <div className={styles.cardIcon}><TypeIcon type={item.item_type} size={40} /></div>
                      <div className={styles.cardName}>{item.name}</div>
                      <div className={styles.cardType}>{item.item_type}</div>
                    </div>
                  ))}
                </div>
              )}

              {userDashboard.rented_items.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: 28 }}>Rented ({userDashboard.rented_items.length})</h3>
                  {userDashboard.rented_items.map((r, i) => (
                    <div key={i} className={styles.listRow}>
                      <span><strong>{r.item_name}</strong> &middot; ${r.daily_rate}/day</span>
                      <span style={{ color: r.status === 'active' ? '#22c55e' : '#f59e0b' }}>
                        {r.status} &middot; expires {fmtDate(r.rental_end)}
                      </span>
                    </div>
                  ))}
                </>
              )}

              {userDashboard.sales_history.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: 28 }}>Recent Sales</h3>
                  {userDashboard.sales_history.slice(0, 10).map(s => (
                    <div key={s.sale_id} className={styles.listRow}>
                      <span><strong>{s.item_name}</strong> to {s.buyer_name}</span>
                      <span style={{ color: '#22c55e', fontWeight: 600 }}>+${s.price.toFixed(2)} &middot; {fmtDate(s.timestamp)}</span>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : (
            <div className={styles.emptyState}><p>Failed to load dashboard.</p><button className={styles.btnPrimary} onClick={loadDashboard} style={{ display: 'inline-block', width: 'auto', marginTop: 12 }}>Retry</button></div>
          )}
        </>
      )}

      {/* ===== TRENDS TAB ===== */}
      {activeTab === 'trends' && (
        <>
          {loadingTrends ? (
            <div className={styles.loading}><div className={styles.spinner} />Loading trends...</div>
          ) : marketTrends ? (
            <>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={`${styles.statValue} ${styles.statValuePurple}`}>{marketTrends.total_transactions_24h}</div>
                  <div className={styles.statName}>24h Transactions</div>
                </div>
                <div className={styles.statCard}>
                  <div className={`${styles.statValue} ${styles.statValueGreen}`}>${marketTrends.total_volume_24h.toFixed(2)}</div>
                  <div className={styles.statName}>24h Volume</div>
                </div>
              </div>

              {marketTrends.trending_items.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle}>Trending</h3>
                  <div className={styles.iconGrid} style={{ marginBottom: 28 }}>
                    {marketTrends.trending_items.map(item => (
                      <div key={item.id} className={styles.iconCard} onClick={() => openDetail(item)}>
                        <div className={styles.cardIcon}><TypeIcon type={item.item_type} size={40} /></div>
                        <div className={styles.cardName}>{item.name}</div>
                        <div className={styles.cardType}>{item.item_type}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {marketTrends.top_sellers.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle}>Top Sellers</h3>
                  {marketTrends.top_sellers.map(s => (
                    <div key={s.seller_id} className={styles.listRow}>
                      <span><strong>{s.seller_name}</strong> {s.verified ? '\u2713' : ''} &middot; {s.items_count} items</span>
                      <span>${s.total_revenue.toFixed(0)} revenue &middot; {s.total_sales} sales</span>
                    </div>
                  ))}
                </>
              )}

              {marketTrends.category_stats.length > 0 && (
                <>
                  <h3 className={styles.sectionTitle} style={{ marginTop: 28 }}>Categories</h3>
                  {marketTrends.category_stats.map(c => (
                    <div key={c.category} className={styles.listRow}>
                      <span><strong>{c.category}</strong> &middot; {c.item_count} items &middot; ${c.average_price.toFixed(2)} avg</span>
                      <span style={{ color: c.growth_percentage >= 0 ? '#22c55e' : '#ef4444', fontWeight: 600 }}>
                        {c.growth_percentage >= 0 ? '+' : ''}{c.growth_percentage.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </>
              )}
            </>
          ) : (
            <div className={styles.emptyState}><p>No market data available.</p></div>
          )}
        </>
      )}

      {/* ===== LEDGER TAB ===== */}
      {activeTab === 'ledger' && (
        <>
          <h3 className={styles.sectionTitle}>Execution Ledger</h3>
          <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Immutable record of agent and plugin executions.</p>
          {executionLedger.length === 0 ? (
            <div className={styles.emptyState}><p>No execution records yet.</p></div>
          ) : (
            executionLedger.map(e => (
              <div key={e.entry_id} className={styles.listRow} style={{ fontFamily: 'monospace' }}>
                <span><strong>{e.item_name}</strong> &middot; {e.execution_type} &middot; {e.execution_time_ms}ms</span>
                <span style={{ color: e.status === 'success' ? '#22c55e' : e.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                  {e.status.toUpperCase()}
                  {e.tx_hash ? ` \u00B7 ${e.tx_hash.slice(0, 10)}...` : ''}
                </span>
              </div>
            ))
          )}
        </>
      )}

      {/* ===== ITEM DETAIL MODAL (haveibeenpwned style) ===== */}
      {selectedItem && (
        <div className={styles.overlay} onClick={closeDetail}>
          <div className={styles.detailPanel} onClick={e => e.stopPropagation()}>
            <button className={styles.detailBack} onClick={closeDetail}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Back to marketplace
            </button>

            <div className={styles.detailHeader}>
              <div className={styles.detailIcon}>
                <TypeIcon type={selectedItem.item_type} size={40} />
              </div>
              <div>
                <h2 className={styles.detailTitle}>{selectedItem.name}</h2>
                <div className={styles.detailMeta}>
                  Updated on: {fmtDate(selectedItem.updated_at || selectedItem.created_at)}
                  {selectedItem.publisher_name && <> &middot; By: <a href="#">{selectedItem.publisher_name}</a></>}
                </div>
              </div>
            </div>

            {/* Stat chips */}
            <div className={styles.statChips}>
              <div className={styles.statChip}>
                <span className={styles.statChipValue}>{selectedItem.download_count || 0}</span> downloads
              </div>
              {selectedItem.average_rating != null && (
                <div className={styles.statChip}>
                  <span className={styles.statChipValue}>{'\u2605'} {selectedItem.average_rating.toFixed(1)}</span>
                  ({selectedItem.review_count || 0} reviews)
                </div>
              )}
              <div className={styles.statChip}>
                v<span className={styles.statChipValue}>{selectedItem.version || '1.0'}</span>
              </div>
              <div className={styles.statChip} style={{ textTransform: 'capitalize' }}>
                {selectedItem.item_type}
              </div>
            </div>

            {/* About */}
            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>About this item</h3>
              <p className={styles.detailDesc}>
                {selectedItem.description || selectedItem.short_description || 'No description available.'}
              </p>
            </div>

            {/* Tags */}
            {selectedItem.tags && selectedItem.tags.length > 0 && (
              <div className={styles.detailSection}>
                <h3 className={styles.detailSectionTitle}>Tags</h3>
                <div className={styles.tagList}>
                  {selectedItem.tags.map((tag, i) => <span key={i} className={styles.tag}>{tag}</span>)}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className={styles.detailActions}>
              {isInstalled(selectedItem.id) ? (
                <button className={styles.btnPrimary} disabled>{'\u2713'} Installed</button>
              ) : selectedItem.is_free ? (
                <button className={styles.btnPrimary} onClick={handleInstall} disabled={installing}>
                  {installing ? 'Installing...' : 'Install Free'}
                </button>
              ) : (
                <button className={styles.btnPrimary} onClick={handlePurchase} disabled={purchasing}>
                  {purchasing ? 'Processing...' : `Purchase $${selectedItem.price?.toFixed(2)}`}
                </button>
              )}
              {selectedItem.documentation_url && (
                <button className={styles.btnSecondary} onClick={() => window.open(selectedItem.documentation_url!, '_blank')}>Docs</button>
              )}
              <button className={styles.btnSecondary} onClick={() => { setShowNFTModal(true); }}>NFT</button>
            </div>

            {/* Reviews */}
            <div className={styles.detailSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 className={styles.detailSectionTitle} style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                  Reviews ({itemReviews.length})
                </h3>
                {!showReviewForm && (
                  <button className={styles.btnSecondary} onClick={() => setShowReviewForm(true)} style={{ padding: '6px 14px', fontSize: 12 }}>
                    Write Review
                  </button>
                )}
              </div>

              {showReviewForm && (
                <div className={styles.reviewForm}>
                  <div style={{ marginBottom: 12 }}>
                    <label className={styles.formLabel}>Rating</label>
                    <div>
                      {[1, 2, 3, 4, 5].map(s => (
                        <button key={s} className={styles.starBtn} onClick={() => setReviewRating(s)}
                          style={{ color: s <= reviewRating ? '#facc15' : '#475569' }}>{'\u2605'}</button>
                      ))}
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <label className={styles.formLabel}>Comment</label>
                    <textarea className={styles.formTextarea} value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Share your experience..." />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className={styles.btnPrimary} onClick={handleReview} disabled={submittingReview} style={{ flex: 'none', width: 'auto', padding: '8px 16px', fontSize: 13 }}>
                      {submittingReview ? 'Submitting...' : 'Submit'}
                    </button>
                    <button className={styles.btnSecondary} onClick={() => setShowReviewForm(false)} style={{ padding: '8px 16px', fontSize: 13 }}>Cancel</button>
                  </div>
                </div>
              )}

              {itemReviews.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 13 }}>No reviews yet.</p>
              ) : (
                itemReviews.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <span className={styles.reviewAuthor}>{r.reviewer_name || 'Anonymous'}</span>
                      <span className={styles.reviewStars}>{'\u2605'.repeat(r.rating)}{'\u2606'.repeat(5 - r.rating)}</span>
                    </div>
                    {r.comment && <p className={styles.reviewBody}>{r.comment}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== NFT LISTING MODAL ===== */}
      {showNFTModal && selectedItem && (
        <div className={styles.overlay} onClick={() => setShowNFTModal(false)}>
          <div className={styles.detailPanel} style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
            <h3 className={styles.detailTitle} style={{ fontSize: 20, marginBottom: 16 }}>List as NFT</h3>
            <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
              List <strong>{selectedItem.name}</strong> on the blockchain marketplace.
            </p>

            <div className={styles.nftField}>
              <label className={styles.formLabel}>Listing Type</label>
              <div className={styles.nftTypeBtns}>
                {(['sale', 'rent', 'auction'] as const).map(t => (
                  <button key={t} className={`${styles.nftTypeBtn} ${nftListingType === t ? styles.nftTypeBtnActive : ''}`}
                    onClick={() => setNftListingType(t)}>
                    {t === 'sale' ? 'Sale' : t === 'rent' ? 'Rent' : 'Auction'}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.nftField}>
              <label className={styles.formLabel}>{nftListingType === 'auction' ? 'Starting Price' : 'Price'} (USD)</label>
              <input className={styles.nftInput} type="number" placeholder="0.00" value={nftPrice} onChange={e => setNftPrice(e.target.value)} />
            </div>

            {nftListingType === 'rent' && (
              <div className={styles.nftField}>
                <label className={styles.formLabel}>Daily Rent Price (USD)</label>
                <input className={styles.nftInput} type="number" placeholder="0.00" value={nftRentPrice} onChange={e => setNftRentPrice(e.target.value)} />
              </div>
            )}

            <div className={styles.nftInfo}>
              {nftListingType === 'sale' && 'This will mint an NFT and list it for sale. Buyer gets full ownership.'}
              {nftListingType === 'rent' && 'Users can rent access without owning. Multiple users can rent simultaneously.'}
              {nftListingType === 'auction' && 'Highest bidder wins after auction ends. Set a competitive starting price.'}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className={styles.btnSecondary} onClick={() => setShowNFTModal(false)} style={{ flex: 1 }}>Cancel</button>
              <button className={styles.btnPrimary} onClick={handleListNFT} disabled={listingNFT || !nftPrice}>
                {listingNFT ? 'Listing...' : 'List NFT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplacePage;
