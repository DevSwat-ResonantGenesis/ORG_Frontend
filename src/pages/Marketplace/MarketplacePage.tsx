import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../../utils/auth';
import { canAccess, type Role } from '../../utils/permissions';
import logger from '../../utils/logger';
import {
  browseMarketplaceItems,
  getMarketplaceItem,
  installItem,
  purchaseItem,
  listInstallations,
  listItemReviews,
  createReview,
  getMarketTrends,
  getUserDashboard,
  getExecutionLedger,
  listNFT,
  purchaseNFT,
  rentNFT,
  type MarketplaceItem,
  type MarketplaceItemType,
  type MarketplaceInstallation,
  type MarketplaceReview,
  type MarketTrends,
  type UserDashboard,
  type ExecutionLedgerEntry,
  type NFTListing,
} from '../../api/marketplace';
import { Button } from '../../components/ui';
import { useToastContext } from '../../context/ToastContext';
import styles from '../Help/HelpCenterPage.module.css';
import marketStyles from './MarketplacePage.module.css';

type MarketplaceTab = 'browse' | 'dashboard' | 'trends' | 'ledger';

const MarketplacePage: React.FC = () => {
  const navigate = useNavigate();
  const session = getSession();
  const userRole = session.role as Role | null;
  const toast = useToastContext();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MarketplaceItem[]>([]);
  const [installations, setInstallations] = useState<MarketplaceInstallation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('browse');
  
  // Advanced features state
  const [marketTrends, setMarketTrends] = useState<MarketTrends | null>(null);
  const [userDashboard, setUserDashboard] = useState<UserDashboard | null>(null);
  const [executionLedger, setExecutionLedger] = useState<ExecutionLedgerEntry[]>([]);
  const [loadingTrends, setLoadingTrends] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  
  // Filters
  const [itemTypeFilter, setItemTypeFilter] = useState<MarketplaceItemType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'rating'>('popular');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [itemReviews, setItemReviews] = useState<MarketplaceReview[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  
  // NFT state
  const [showNFTModal, setShowNFTModal] = useState(false);
  const [nftListingType, setNftListingType] = useState<'sale' | 'rent' | 'auction'>('sale');
  const [nftPrice, setNftPrice] = useState<string>('');
  const [nftRentPrice, setNftRentPrice] = useState<string>('');
  const [listingNFT, setListingNFT] = useState(false);
  
  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadItems = useCallback(async () => {
    if (!canAccess(userRole, 'predictions')) {
      navigate('/dashboard');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = {
        item_type: itemTypeFilter !== 'all' ? itemTypeFilter : undefined,
        search: searchQuery || undefined,
        limit: 50,
        offset: 0,
      };
      
      const [itemsData, installationsData] = await Promise.all([
        browseMarketplaceItems(params),
        listInstallations().catch(() => []),
      ]);
      
      // Sort items
      let sortedItems = [...itemsData];
      if (sortBy === 'popular') {
        sortedItems.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
      } else if (sortBy === 'newest') {
        sortedItems.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      } else if (sortBy === 'rating') {
        sortedItems.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
      }
      
      setItems(sortedItems);
      setInstallations(installationsData);
      
      // Set featured items (top rated with most downloads)
      const featured = [...itemsData]
        .filter(item => (item.average_rating || 0) >= 4 && (item.download_count || 0) >= 10)
        .slice(0, 4);
      setFeaturedItems(featured);
    } catch (err: unknown) {
      logger.error('Failed to load marketplace items:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { status?: number; data?: { detail?: string } } }).response?.data?.detail
        : err && typeof err === 'object' && 'message' in err
        ? (err as { message: string }).message
        : 'Failed to load marketplace items';
      setError(errorMessage as string);
      toast.error(errorMessage as string);
    } finally {
      setLoading(false);
    }
  }, [userRole, navigate, itemTypeFilter, searchQuery, sortBy, toast]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Load market trends when trends tab is active
  const loadTrends = useCallback(async () => {
    setLoadingTrends(true);
    try {
      const trends = await getMarketTrends();
      setMarketTrends(trends);
    } catch (err) {
      logger.error('Failed to load market trends:', err);
    } finally {
      setLoadingTrends(false);
    }
  }, []);

  // Load user dashboard when dashboard tab is active
  const loadDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const dashboard = await getUserDashboard();
      setUserDashboard(dashboard);
    } catch (err) {
      logger.error('Failed to load dashboard:', err);
    } finally {
      setLoadingDashboard(false);
    }
  }, []);

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'trends' && !marketTrends) {
      loadTrends();
    } else if (activeTab === 'dashboard' && !userDashboard) {
      loadDashboard();
    }
  }, [activeTab, marketTrends, userDashboard, loadTrends, loadDashboard]);

  // Handle NFT listing
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
      toast.success('NFT listed successfully!');
      setShowNFTModal(false);
      setNftPrice('');
      setNftRentPrice('');
      loadDashboard();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to list NFT');
    } finally {
      setListingNFT(false);
    }
  };
  
  // Check if item is installed
  const isInstalled = (itemId: string) => {
    return installations.some(inst => inst.item_id === itemId);
  };
  
  // Open item detail modal
  const openItemModal = async (item: MarketplaceItem) => {
    setSelectedItem(item);
    setShowModal(true);
    try {
      const reviews = await listItemReviews(item.id);
      setItemReviews(reviews);
    } catch (err) {
      logger.error('Failed to load reviews:', err);
      setItemReviews([]);
    }
  };
  
  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setItemReviews([]);
    setShowReviewForm(false);
    setReviewRating(5);
    setReviewComment('');
  };
  
  // Install item
  const handleInstall = async () => {
    if (!selectedItem) return;
    setInstalling(true);
    try {
      await installItem(selectedItem.id);
      toast.success(`${selectedItem.name} installed successfully!`);
      await loadItems(); // Refresh installations
    } catch (err: any) {
      toast.error(err?.message || 'Failed to install item');
    } finally {
      setInstalling(false);
    }
  };
  
  // Purchase item
  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchasing(true);
    try {
      await purchaseItem(selectedItem.id);
      toast.success(`${selectedItem.name} purchased successfully!`);
      await handleInstall(); // Auto-install after purchase
    } catch (err: any) {
      toast.error(err?.message || 'Failed to purchase item');
    } finally {
      setPurchasing(false);
    }
  };
  
  // Submit review
  const handleSubmitReview = async () => {
    if (!selectedItem) return;
    setSubmittingReview(true);
    try {
      await createReview(selectedItem.id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted!');
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment('');
      // Refresh reviews
      const reviews = await listItemReviews(selectedItem.id);
      setItemReviews(reviews);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const categories = ['all', 'agent', 'plugin', 'template', 'workflow', 'integration'];
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'agent': return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="5"/>
          <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/>
        </svg>
      );
      case 'plugin': return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v6m0 12v2M4.93 4.93l4.24 4.24m5.66 5.66l4.24 4.24M2 12h6m8 0h6M4.93 19.07l4.24-4.24m5.66-5.66l4.24-4.24"/>
        </svg>
      );
      case 'template': return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      );
      case 'workflow': return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      );
      case 'integration': return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      );
      default: return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
      );
    }
  };

  return (
    <div className={styles.helpCenterPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Marketplace</h1>
          <p className={styles.subtitle}>
            The most advanced AI marketplace - Buy, sell, rent agents, plugins, and more with blockchain verification.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: 'var(--space-1)', 
          marginBottom: 'var(--space-4)',
          borderBottom: '2px solid var(--border-color)',
          paddingBottom: '0'
        }}>
          {(['browse', 'dashboard', 'trends', 'ledger'] as MarketplaceTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab ? '2px solid var(--color-primary-500)' : '2px solid transparent',
                color: activeTab === tab ? 'var(--color-primary-600)' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 600 : 500,
                cursor: 'pointer',
                marginBottom: '-2px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {tab === 'browse' && (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                  Browse
                </>
              )}
              {tab === 'dashboard' && (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  My Dashboard
                </>
              )}
              {tab === 'trends' && (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  Market Trends
                </>
              )}
              {tab === 'ledger' && (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  Execution Ledger
                </>
              )}
            </button>
          ))}
        </div>

        {/* Browse Tab */}
        {activeTab === 'browse' && (
        <div className={styles.contentBody}>
          <div className={styles.contentMain}>
            {/* Search */}
            <section className={styles.contentSection}>
              <div className={styles.helpSearch}>
                <div className={styles.searchInputWrapper}>
                  <input
                    type="text"
                    placeholder="Search marketplace..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadItems()}
                    className={styles.searchInput}
                  />
                </div>
              </div>
            </section>

            {/* Category Filter */}
            <section className={styles.contentSection}>
              <h2>Filter by Type</h2>
              <div className={styles.categoryFilters}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`${styles.categoryFilter} ${itemTypeFilter === cat ? styles.active : ''}`}
                    onClick={() => {
                      setItemTypeFilter(cat as MarketplaceItemType | 'all');
                    }}
                  >
                    {cat === 'all' ? 'All Types' : cat.charAt(0).toUpperCase() + cat.slice(1) + 's'}
                  </button>
                ))}
              </div>
            </section>

            {/* Featured Items */}
            {featuredItems.length > 0 && itemTypeFilter === 'all' && !searchQuery && (
              <section className={styles.contentSection}>
                <h2><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '8px', verticalAlign: 'middle', color: '#fbbf24' }}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Featured</h2>
                <div className={styles.articleGrid}>
                  {featuredItems.map((item) => (
                    <div
                      key={item.id}
                      className={styles.articleCard}
                      onClick={() => openItemModal(item)}
                      style={{ 
                        cursor: 'pointer',
                        border: '2px solid var(--color-primary-500)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--color-primary-500)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: 'var(--font-xs)', fontWeight: 600 }}>
                        Featured
                      </div>
                      <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>{getTypeIcon(item.item_type)}</div>
                      <h3>{item.name}</h3>
                      <p>{item.short_description || item.description || 'No description available'}</p>
                      <div className={styles.articleTags}>
                        <span className={styles.articleTag}>{item.item_type}</span>
                        {item.is_free ? (
                          <span className={styles.articleTag} style={{ background: 'var(--color-success-500)', color: 'white' }}>Free</span>
                        ) : (
                          <span className={styles.articleTag}>${item.price?.toFixed(2)}</span>
                        )}
                        {item.average_rating && (
                          <span className={styles.articleTag}>★ {item.average_rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sort Options */}
            <section className={styles.contentSection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                <h2>All Items ({items.length})</h2>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {(['popular', 'newest', 'rating'] as const).map((sort) => (
                    <button
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: sortBy === sort ? 'var(--color-primary-500)' : 'var(--bg-secondary)',
                        color: sortBy === sort ? 'white' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-sm)',
                      }}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {loading ? (
                <div className={styles.articleCard} style={{ cursor: 'default', textAlign: 'center' }}>
                  <p>Loading marketplace items...</p>
                </div>
              ) : error ? (
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>Error Loading Items</h3>
                  <p>{error}</p>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Button variant="primary" onClick={loadItems}>Retry</Button>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <h3>No Items Found</h3>
                  <p>Try adjusting your filters or check back later for new items.</p>
                </div>
              ) : (
                <div className={styles.articleGrid}>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={styles.articleCard}
                      onClick={() => openItemModal(item)}
                      style={{ cursor: 'pointer', position: 'relative' }}
                    >
                      {isInstalled(item.id) && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'var(--color-success-500)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 600 }}>
                          Installed
                        </div>
                      )}
                      <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>{getTypeIcon(item.item_type)}</div>
                      <h3>{item.name}</h3>
                      <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        {(item.short_description || item.description || 'No description available').slice(0, 100)}
                        {(item.short_description || item.description || '').length > 100 ? '...' : ''}
                      </p>
                      <div className={styles.articleTags}>
                        <span className={styles.articleTag}>{item.item_type}</span>
                        {item.is_free ? (
                          <span className={styles.articleTag} style={{ background: 'var(--color-success-100)', color: 'var(--color-success-700)' }}>Free</span>
                        ) : (
                          <span className={styles.articleTag}>${item.price?.toFixed(2)}</span>
                        )}
                        {item.average_rating && (
                          <span className={styles.articleTag}>★ {item.average_rating.toFixed(1)}</span>
                        )}
                      </div>
                      <div style={{ 
                        marginTop: 'var(--space-2)', 
                        fontSize: 'var(--font-xs)', 
                        color: 'var(--text-tertiary)',
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}>
                        <span>{item.publisher_name || 'Unknown'}</span>
                        <span>{item.download_count} downloads</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className={styles.contentSidebar}>
            <div className={styles.sidebarCard}>
              <h3>Publish Your Own</h3>
              <p>
                Create and share your own agents, plugins, and templates.
              </p>
              <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/marketplace/create')}>
                Publish Item
              </Button>
            </div>
            <div className={styles.sidebarCard}>
              <h3>My Installations</h3>
              <ul>
                <li><a href="/marketplace/installations">View Installed Items</a></li>
                <li><a href="/marketplace/purchases">My Purchases</a></li>
              </ul>
            </div>
            <div className={styles.sidebarCard}>
              <h3>Categories</h3>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setItemTypeFilter('agent'); }}>Agents</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setItemTypeFilter('plugin'); }}>Plugins</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setItemTypeFilter('template'); }}>Templates</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); setItemTypeFilter('workflow'); }}>Workflows</a></li>
              </ul>
            </div>
          </div>
        </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className={styles.contentBody}>
            <div className={styles.contentMain}>
              {loadingDashboard ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <p>Loading your dashboard...</p>
                </div>
              ) : userDashboard ? (
                <>
                  {/* Stats Overview */}
                  <section className={styles.contentSection}>
                    <h2>📊 Overview</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                      <div className={styles.articleCard} style={{ cursor: 'default', textAlign: 'center' }}>
                        <h3 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-success-600)' }}>${userDashboard.total_earnings.toFixed(2)}</h3>
                        <p>Total Earnings</p>
                      </div>
                      <div className={styles.articleCard} style={{ cursor: 'default', textAlign: 'center' }}>
                        <h3 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-primary-600)' }}>${userDashboard.total_spent.toFixed(2)}</h3>
                        <p>Total Spent</p>
                      </div>
                      <div className={styles.articleCard} style={{ cursor: 'default', textAlign: 'center' }}>
                        <h3 style={{ fontSize: 'var(--font-2xl)' }}>{userDashboard.owned_items.length}</h3>
                        <p>Owned Items</p>
                      </div>
                      <div className={styles.articleCard} style={{ cursor: 'default', textAlign: 'center' }}>
                        <h3 style={{ fontSize: 'var(--font-2xl)' }}>{userDashboard.active_listings.length}</h3>
                        <p>Active Listings</p>
                      </div>
                    </div>
                  </section>

                  {/* Owned Items */}
                  <section className={styles.contentSection}>
                    <h2>🎯 My Items ({userDashboard.owned_items.length})</h2>
                    {userDashboard.owned_items.length === 0 ? (
                      <div className={styles.articleCard} style={{ cursor: 'default' }}>
                        <p>You don't own any items yet. Browse the marketplace to get started!</p>
                        <Button variant="primary" size="sm" onClick={() => setActiveTab('browse')}>Browse Marketplace</Button>
                      </div>
                    ) : (
                      <div className={styles.articleGrid}>
                        {userDashboard.owned_items.map((item) => (
                          <div key={item.id} className={styles.articleCard} onClick={() => openItemModal(item)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>{getTypeIcon(item.item_type)}</div>
                            <h3>{item.name}</h3>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>{item.short_description}</p>
                            <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                              <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedItem(item); setShowNFTModal(true); }}>
                                List as NFT
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Rented Items */}
                  {userDashboard.rented_items.length > 0 && (
                    <section className={styles.contentSection}>
                      <h2>⏰ Rented Items ({userDashboard.rented_items.length})</h2>
                      <div className={styles.articleGrid}>
                        {userDashboard.rented_items.map((item, idx) => (
                          <div key={idx} className={styles.articleCard} style={{ cursor: 'default' }}>
                            <h3>{item.item_name}</h3>
                            <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                              Expires: {new Date(item.rental_end).toLocaleDateString()}
                            </p>
                            <div className={styles.articleTags}>
                              <span className={styles.articleTag} style={{ 
                                background: item.status === 'active' ? 'var(--color-success-100)' : 'var(--color-warning-100)',
                                color: item.status === 'active' ? 'var(--color-success-700)' : 'var(--color-warning-700)'
                              }}>
                                {item.status}
                              </span>
                              <span className={styles.articleTag}>${item.daily_rate}/day</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Sales History */}
                  {userDashboard.sales_history.length > 0 && (
                    <section className={styles.contentSection}>
                      <h2>💰 Recent Sales</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {userDashboard.sales_history.slice(0, 10).map((sale) => (
                          <div key={sale.sale_id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            padding: 'var(--space-3)', 
                            background: 'var(--bg-secondary)', 
                            borderRadius: 'var(--radius-md)' 
                          }}>
                            <div>
                              <strong>{sale.item_name}</strong>
                              <span style={{ marginLeft: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                                to {sale.buyer_name}
                              </span>
                            </div>
                            <div>
                              <span style={{ color: 'var(--color-success-600)', fontWeight: 600 }}>+${sale.price.toFixed(2)}</span>
                              <span style={{ marginLeft: 'var(--space-2)', color: 'var(--text-tertiary)', fontSize: 'var(--font-xs)' }}>
                                {new Date(sale.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <p>Failed to load dashboard. Please try again.</p>
                  <Button variant="primary" size="sm" onClick={loadDashboard}>Retry</Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className={styles.contentBody}>
            <div className={styles.contentMain}>
              {loadingTrends ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <p>Loading market trends...</p>
                </div>
              ) : marketTrends ? (
                <>
                  {/* 24h Stats */}
                  <section className={styles.contentSection}>
                    <h2>📈 24h Market Activity</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
                      <div className={styles.articleCard} style={{ cursor: 'default', textAlign: 'center' }}>
                        <h3 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-primary-600)' }}>{marketTrends.total_transactions_24h}</h3>
                        <p>Transactions</p>
                      </div>
                      <div className={styles.articleCard} style={{ cursor: 'default', textAlign: 'center' }}>
                        <h3 style={{ fontSize: 'var(--font-2xl)', color: 'var(--color-success-600)' }}>${marketTrends.total_volume_24h.toFixed(2)}</h3>
                        <p>Volume</p>
                      </div>
                    </div>
                  </section>

                  {/* Trending Items */}
                  {marketTrends.trending_items.length > 0 && (
                    <section className={styles.contentSection}>
                      <h2>🔥 Trending Now</h2>
                      <div className={styles.articleGrid}>
                        {marketTrends.trending_items.map((item) => (
                          <div key={item.id} className={styles.articleCard} onClick={() => openItemModal(item)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>{getTypeIcon(item.item_type)}</div>
                            <h3>{item.name}</h3>
                            <div className={styles.articleTags}>
                              <span className={styles.articleTag}>{item.item_type}</span>
                              {item.average_rating && <span className={styles.articleTag}>★ {item.average_rating.toFixed(1)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Top Sellers */}
                  {marketTrends.top_sellers.length > 0 && (
                    <section className={styles.contentSection}>
                      <h2>🏆 Top Sellers</h2>
                      <div className={styles.articleGrid}>
                        {marketTrends.top_sellers.map((seller) => (
                          <div key={seller.seller_id} className={styles.articleCard} style={{ cursor: 'default' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                              <div style={{ 
                                width: 48, 
                                height: 48, 
                                borderRadius: '50%', 
                                background: 'var(--color-primary-100)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '20px'
                              }}>
                                {seller.verified ? '✓' : '👤'}
                              </div>
                              <div>
                                <h3 style={{ margin: 0 }}>{seller.seller_name}</h3>
                                <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                                  {seller.items_count} items • ★ {seller.average_rating.toFixed(1)}
                                </p>
                              </div>
                            </div>
                            <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: 'var(--color-success-600)' }}>${seller.total_revenue.toFixed(0)} revenue</span>
                              <span>{seller.total_sales} sales</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Category Stats */}
                  {marketTrends.category_stats.length > 0 && (
                    <section className={styles.contentSection}>
                      <h2>📊 Category Performance</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                        {marketTrends.category_stats.map((cat) => (
                          <div key={cat.category} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: 'var(--space-3)', 
                            background: 'var(--bg-secondary)', 
                            borderRadius: 'var(--radius-md)' 
                          }}>
                            <div>
                              <strong>{cat.category}</strong>
                              <span style={{ marginLeft: 'var(--space-2)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
                                {cat.item_count} items
                              </span>
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                              <span>${cat.average_price.toFixed(2)} avg</span>
                              <span style={{ 
                                color: cat.growth_percentage >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
                                fontWeight: 600
                              }}>
                                {cat.growth_percentage >= 0 ? '+' : ''}{cat.growth_percentage.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              ) : (
                <div className={styles.articleCard} style={{ cursor: 'default' }}>
                  <p>No market data available yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Execution Ledger Tab */}
        {activeTab === 'ledger' && (
          <div className={styles.contentBody}>
            <div className={styles.contentMain}>
              <section className={styles.contentSection}>
                <h2>📜 Execution Ledger</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  Immutable record of all agent and plugin executions on the blockchain.
                </p>
                {executionLedger.length === 0 ? (
                  <div className={styles.articleCard} style={{ cursor: 'default' }}>
                    <p>No execution records yet. Start using agents and plugins to see their execution history here.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {executionLedger.map((entry) => (
                      <div key={entry.entry_id} style={{ 
                        padding: 'var(--space-3)', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: 'var(--radius-md)',
                        fontFamily: 'monospace',
                        fontSize: 'var(--font-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                          <span style={{ fontWeight: 600 }}>{entry.item_name}</span>
                          <span style={{ 
                            color: entry.status === 'success' ? 'var(--color-success-600)' : 
                                   entry.status === 'failed' ? 'var(--color-danger-600)' : 'var(--color-warning-600)'
                          }}>
                            {entry.status.toUpperCase()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 'var(--space-4)', color: 'var(--text-tertiary)' }}>
                          <span>Type: {entry.execution_type}</span>
                          <span>Time: {entry.execution_time_ms}ms</span>
                          {entry.tx_hash && <span>TX: {entry.tx_hash.slice(0, 10)}...</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </div>
      
      {/* Item Detail Modal */}
      {showModal && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          reviews={itemReviews}
          isInstalled={isInstalled(selectedItem.id)}
          onClose={closeModal}
          onInstall={handleInstall}
          onPurchase={handlePurchase}
          installing={installing}
          purchasing={purchasing}
          showReviewForm={showReviewForm}
          setShowReviewForm={setShowReviewForm}
          reviewRating={reviewRating}
          setReviewRating={setReviewRating}
          reviewComment={reviewComment}
          setReviewComment={setReviewComment}
          onSubmitReview={handleSubmitReview}
          submittingReview={submittingReview}
          getTypeIcon={getTypeIcon}
        />
      )}

      {/* NFT Listing Modal */}
      {showNFTModal && selectedItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: 'var(--space-4)'
        }} onClick={() => setShowNFTModal(false)}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-lg)',
            maxWidth: '500px',
            width: '100%',
            padding: 'var(--space-6)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
              <h2 style={{ margin: 0 }}>List as NFT</h2>
              <button onClick={() => setShowNFTModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              List <strong>{selectedItem.name}</strong> on the blockchain marketplace.
            </p>

            {/* Listing Type */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>Listing Type</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {(['sale', 'rent', 'auction'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNftListingType(type)}
                    style={{
                      flex: 1,
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: nftListingType === type ? '2px solid var(--color-primary-500)' : '1px solid var(--border-color)',
                      background: nftListingType === type ? 'var(--color-primary-50)' : 'transparent',
                      color: nftListingType === type ? 'var(--color-primary-700)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: 500,
                    }}
                  >
                    {type === 'sale' && '💰 Sale'}
                    {type === 'rent' && '⏰ Rent'}
                    {type === 'auction' && '🔨 Auction'}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>
                {nftListingType === 'auction' ? 'Starting Price' : 'Price'} (USD)
              </label>
              <input
                type="number"
                value={nftPrice}
                onChange={(e) => setNftPrice(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-md)',
                }}
              />
            </div>

            {/* Rent Price (only for rent type) */}
            {nftListingType === 'rent' && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 500 }}>Daily Rent Price (USD)</label>
                <input
                  type="number"
                  value={nftRentPrice}
                  onChange={(e) => setNftRentPrice(e.target.value)}
                  placeholder="0.00"
                  style={{
                    width: '100%',
                    padding: 'var(--space-3)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-md)',
                  }}
                />
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                  Users can rent this item without owning it. You keep ownership.
                </p>
              </div>
            )}

            {/* Info */}
            <div style={{ 
              padding: 'var(--space-3)', 
              background: 'var(--color-primary-50)', 
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)'
            }}>
              <p style={{ margin: 0, fontSize: 'var(--font-sm)', color: 'var(--color-primary-700)' }}>
                {nftListingType === 'sale' && '🔗 This will mint an NFT and list it for sale. Buyer gets full ownership.'}
                {nftListingType === 'rent' && '🔗 Users can rent access without owning. Multiple users can rent simultaneously.'}
                {nftListingType === 'auction' && '🔗 Highest bidder wins after auction ends. Set a competitive starting price.'}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button variant="secondary" onClick={() => setShowNFTModal(false)} fullWidth>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleListNFT} 
                disabled={listingNFT || !nftPrice}
                fullWidth
              >
                {listingNFT ? 'Listing...' : 'List NFT'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Item Detail Modal
const ItemDetailModal: React.FC<{
  item: MarketplaceItem;
  reviews: MarketplaceReview[];
  isInstalled: boolean;
  onClose: () => void;
  onInstall: () => void;
  onPurchase: () => void;
  installing: boolean;
  purchasing: boolean;
  showReviewForm: boolean;
  setShowReviewForm: (show: boolean) => void;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  reviewComment: string;
  setReviewComment: (comment: string) => void;
  onSubmitReview: () => void;
  submittingReview: boolean;
  getTypeIcon: (type: string) => React.ReactNode;
}> = ({
  item,
  reviews,
  isInstalled,
  onClose,
  onInstall,
  onPurchase,
  installing,
  purchasing,
  showReviewForm,
  setShowReviewForm,
  reviewRating,
  setReviewRating,
  reviewComment,
  setReviewComment,
  onSubmitReview,
  submittingReview,
  getTypeIcon,
}) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 'var(--space-4)'
  }} onClick={onClose}>
    <div style={{
      background: 'var(--bg-primary)',
      borderRadius: 'var(--radius-lg)',
      maxWidth: '700px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      padding: 'var(--space-6)',
    }} onClick={(e) => e.stopPropagation()}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
          <div style={{ fontSize: '48px' }}>{getTypeIcon(item.item_type)}</div>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--font-xl)' }}>{item.name}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>
              by {item.publisher_name || 'Unknown Publisher'}
            </p>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
      </div>
      
      {/* Stats */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>{item.download_count}</span>
          <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginLeft: '4px' }}>downloads</span>
        </div>
        {item.average_rating && (
          <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>★ {item.average_rating.toFixed(1)}</span>
            <span style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginLeft: '4px' }}>({item.review_count} reviews)</span>
          </div>
        )}
        <div style={{ padding: 'var(--space-2) var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontSize: 'var(--font-lg)', fontWeight: 600 }}>v{item.version}</span>
        </div>
      </div>
      
      {/* Description */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h3 style={{ fontSize: 'var(--font-md)', marginBottom: 'var(--space-2)' }}>Description</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {item.description || item.short_description || 'No description available.'}
        </p>
      </div>
      
      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <h3 style={{ fontSize: 'var(--font-md)', marginBottom: 'var(--space-2)' }}>Tags</h3>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {item.tags.map((tag, idx) => (
              <span key={idx} style={{ padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: '12px', fontSize: 'var(--font-sm)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {isInstalled ? (
          <Button variant="secondary" disabled fullWidth>✓ Installed</Button>
        ) : item.is_free ? (
          <Button variant="primary" onClick={onInstall} disabled={installing} fullWidth>
            {installing ? 'Installing...' : 'Install Free'}
          </Button>
        ) : (
          <Button variant="primary" onClick={onPurchase} disabled={purchasing} fullWidth>
            {purchasing ? 'Processing...' : `Purchase $${item.price?.toFixed(2)}`}
          </Button>
        )}
        {item.documentation_url && (
          <Button variant="secondary" onClick={() => window.open(item.documentation_url!, '_blank')}>
            Docs
          </Button>
        )}
      </div>
      
      {/* Reviews */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <h3 style={{ fontSize: 'var(--font-md)', margin: 0 }}>Reviews ({reviews.length})</h3>
          {!showReviewForm && (
            <Button variant="secondary" size="sm" onClick={() => setShowReviewForm(true)}>Write Review</Button>
          )}
        </div>
        
        {showReviewForm && (
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-3)' }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-sm)', marginBottom: '4px' }}>Rating</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewRating(star)}
                    style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: star <= reviewRating ? '#fbbf24' : 'var(--text-tertiary)' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <label style={{ display: 'block', fontSize: 'var(--font-sm)', marginBottom: '4px' }}>Comment</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience..."
                style={{ width: '100%', padding: 'var(--space-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '80px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button variant="primary" size="sm" onClick={onSubmitReview} disabled={submittingReview}>
                {submittingReview ? 'Submitting...' : 'Submit'}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setShowReviewForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
        
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-sm)' }}>No reviews yet. Be the first to review!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ padding: 'var(--space-3)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500 }}>{review.reviewer_name || 'Anonymous'}</span>
                  <span style={{ color: '#fbbf24' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                </div>
                {review.comment && <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--font-sm)' }}>{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default MarketplacePage;

