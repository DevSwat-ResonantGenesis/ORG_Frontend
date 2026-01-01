/**
 * NFT-Style Marketplace - Fully Connected to Backend
 * Modern marketplace with custom animated SVG icons
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../../context/ToastContext';
import {
  browseMarketplaceItems,
  getFeaturedItems,
  getMarketplaceStats,
  getCategories,
  purchaseItem,
  type MarketplaceItem,
  type MarketplaceStats,
  type MarketplaceCategory,
} from '../../../api/marketplace';
import styles from './NFTMarketplace.module.css';

type FilterType = 'all' | 'agent' | 'workflow' | 'template' | 'plugin' | 'integration';

// Custom Animated SVG Icons
const AgentIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="agentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#agentGrad)" opacity="0.15" />
    <circle cx="24" cy="16" r="8" stroke="url(#agentGrad)" strokeWidth="2.5" fill="none">
      <animate attributeName="r" values="8;9;8" dur="2s" repeatCount="indefinite" />
    </circle>
    <path d="M12 36c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="url(#agentGrad)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    <circle cx="21" cy="15" r="1.5" fill="#818cf8">
      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
    </circle>
    <circle cx="27" cy="15" r="1.5" fill="#818cf8">
      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0.2s" />
    </circle>
  </svg>
);

const WorkflowIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="workflowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#10b981" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#workflowGrad)" opacity="0.15" />
    <circle cx="12" cy="24" r="4" stroke="url(#workflowGrad)" strokeWidth="2" fill="none" />
    <circle cx="24" cy="12" r="4" stroke="url(#workflowGrad)" strokeWidth="2" fill="none" />
    <circle cx="36" cy="24" r="4" stroke="url(#workflowGrad)" strokeWidth="2" fill="none" />
    <circle cx="24" cy="36" r="4" stroke="url(#workflowGrad)" strokeWidth="2" fill="none" />
    <path d="M16 24h4M28 24h4" stroke="url(#workflowGrad)" strokeWidth="2" strokeLinecap="round">
      <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
    </path>
    <path d="M24 16v4M24 28v4" stroke="url(#workflowGrad)" strokeWidth="2" strokeLinecap="round">
      <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" begin="0.5s" />
    </path>
  </svg>
);

const TemplateIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="templateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#templateGrad)" opacity="0.15" />
    <rect x="10" y="10" width="28" height="28" rx="4" stroke="url(#templateGrad)" strokeWidth="2" fill="none" />
    <line x1="10" y1="18" x2="38" y2="18" stroke="url(#templateGrad)" strokeWidth="2" />
    <rect x="14" y="22" width="8" height="12" rx="1" fill="url(#templateGrad)" opacity="0.5">
      <animate attributeName="opacity" values="0.5;0.8;0.5" dur="2s" repeatCount="indefinite" />
    </rect>
    <line x1="26" y1="24" x2="34" y2="24" stroke="url(#templateGrad)" strokeWidth="2" strokeLinecap="round" />
    <line x1="26" y1="28" x2="32" y2="28" stroke="url(#templateGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
    <line x1="26" y1="32" x2="30" y2="32" stroke="url(#templateGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
  </svg>
);

const PluginIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="pluginGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#pluginGrad)" opacity="0.15" />
    <rect x="16" y="20" width="16" height="18" rx="2" stroke="url(#pluginGrad)" strokeWidth="2" fill="none" />
    <path d="M20 20v-6a4 4 0 018 0v6" stroke="url(#pluginGrad)" strokeWidth="2" fill="none" />
    <circle cx="24" cy="29" r="3" fill="url(#pluginGrad)">
      <animate attributeName="r" values="3;4;3" dur="1.5s" repeatCount="indefinite" />
    </circle>
  </svg>
);

const IntegrationIcon = ({ size = 48 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <defs>
      <linearGradient id="integrationGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="100%" stopColor="#ec4899" />
      </linearGradient>
    </defs>
    <circle cx="24" cy="24" r="20" fill="url(#integrationGrad)" opacity="0.15" />
    <circle cx="24" cy="24" r="6" stroke="url(#integrationGrad)" strokeWidth="2" fill="none">
      <animate attributeName="r" values="6;7;6" dur="2s" repeatCount="indefinite" />
    </circle>
    <path d="M24 10v8M24 30v8M10 24h8M30 24h8" stroke="url(#integrationGrad)" strokeWidth="2" strokeLinecap="round">
      <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
    </path>
  </svg>
);

// Small Icons
const HeartIcon = ({ filled, size = 14 }: { filled?: boolean; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#f87171" : "none"} stroke={filled ? "#f87171" : "currentColor"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

const VerifiedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 6L6 18M6 6l12 12"/>
  </svg>
);

const EmptyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="1.5">
    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0110 10" strokeLinecap="round">
      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
    </path>
  </svg>
);

// Get icon component by type
const getItemIcon = (type: string, size = 48) => {
  switch (type?.toLowerCase()) {
    case 'agent': return <AgentIcon size={size} />;
    case 'workflow': return <WorkflowIcon size={size} />;
    case 'template': return <TemplateIcon size={size} />;
    case 'plugin': return <PluginIcon size={size} />;
    case 'integration': return <IntegrationIcon size={size} />;
    default: return <AgentIcon size={size} />;
  }
};

const getGradient = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'agent': return 'linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)';
    case 'workflow': return 'linear-gradient(145deg, #022c22 0%, #064e3b 50%, #065f46 100%)';
    case 'template': return 'linear-gradient(145deg, #451a03 0%, #78350f 50%, #92400e 100%)';
    case 'plugin': return 'linear-gradient(145deg, #1e3a5f 0%, #1e40af 50%, #1d4ed8 100%)';
    case 'integration': return 'linear-gradient(145deg, #500724 0%, #831843 50%, #9d174d 100%)';
    default: return 'linear-gradient(145deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)';
  }
};

const getBadgeClass = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'agent': return styles.badgeAgent;
    case 'workflow': return styles.badgeWorkflow;
    case 'template': return styles.badgeTemplate;
    case 'plugin': return styles.badgePlugin;
    case 'integration': return styles.badgeIntegration;
    default: return styles.badgeAgent;
  }
};

// NFT Card Component
const NFTCard: React.FC<{
  item: MarketplaceItem;
  onSelect: (item: MarketplaceItem) => void;
  onLike: (itemId: string) => void;
  isLiked: boolean;
}> = ({ item, onSelect, onLike, isLiked }) => (
  <div className={styles.nftCard} onClick={() => onSelect(item)}>
    <div className={styles.cardImageWrapper}>
      <div className={styles.cardImage} style={{ background: getGradient(item.item_type) }}>
        {getItemIcon(item.item_type, 56)}
      </div>
      <span className={`${styles.cardBadge} ${getBadgeClass(item.item_type)}`}>
        {item.item_type}
      </span>
      <button 
        className={`${styles.cardLikeButton} ${isLiked ? styles.cardLikeButtonActive : ''}`}
        onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
      >
        <HeartIcon filled={isLiked} size={14} />
      </button>
    </div>
    
    <div className={styles.cardContent}>
      <div className={styles.cardHeader}>
        <div className={styles.creatorAvatar} />
        <span className={styles.creatorName}>{item.publisher_name || 'Anonymous'}</span>
        {item.is_verified && <VerifiedIcon />}
      </div>
      
      <h3 className={styles.cardTitle}>{item.name}</h3>
      <p className={styles.cardDescription}>{item.description || item.short_description}</p>
      
      <div className={styles.cardFooter}>
        <div className={styles.priceSection}>
          <span className={styles.priceLabel}>Price</span>
          <span className={`${styles.priceValue} ${item.is_free || item.price === 0 ? styles.priceFree : ''}`}>
            {item.is_free || item.price === 0 ? 'Free' : `$${(item.price || 0).toFixed(2)}`}
          </span>
        </div>
        <div className={styles.cardStats}>
          <span className={styles.cardStat}>
            <DownloadIcon /> {item.download_count || 0}
          </span>
          <span className={styles.cardStat}>
            <StarIcon /> {item.average_rating?.toFixed(1) || '0.0'}
          </span>
        </div>
      </div>
    </div>
  </div>
);

// Skeleton Card
const SkeletonCard: React.FC = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImage} />
    <div className={styles.skeletonContent}>
      <div className={styles.skeletonLine} />
      <div className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
    </div>
  </div>
);

// Main Component
const NFTMarketplace: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToastContext();

  // State
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MarketplaceItem[]>([]);
  const [, setCategories] = useState<MarketplaceCategory[]>([]);
  const [stats, setStats] = useState<MarketplaceStats>({ total_listings: 0, total_downloads: 0, total_publishers: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  // Load data from backend
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [listingsData, featuredData, statsData, categoriesData] = await Promise.all([
        browseMarketplaceItems({ 
          search: searchQuery || undefined,
          item_type: activeFilter !== 'all' ? activeFilter : undefined,
          limit: 50 
        }),
        getFeaturedItems(4),
        getMarketplaceStats(),
        getCategories(),
      ]);
      
      setItems(listingsData);
      setFeaturedItems(featuredData);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (err: any) {
      console.error('Failed to load marketplace data:', err);
      setError(err?.message || 'Failed to load marketplace');
      setItems([]);
      setFeaturedItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleLike = (itemId: string) => {
    setLikedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) newSet.delete(itemId);
      else newSet.add(itemId);
      return newSet;
    });
  };

  const handlePurchase = async () => {
    if (!selectedItem) return;
    setPurchasing(true);
    try {
      await purchaseItem(selectedItem.id);
      toast.success(`Successfully acquired ${selectedItem.name}`);
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to acquire item');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const filteredItems = items.filter(item => {
    if (activeFilter !== 'all' && item.item_type?.toLowerCase() !== activeFilter) return false;
    return true;
  });

  return (
    <div className={styles.marketplace}>
      {/* Header */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Marketplace</h1>
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.total_listings}</span>
              <span className={styles.statLabel}>items</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.total_publishers}</span>
              <span className={styles.statLabel}>creators</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.total_downloads.toLocaleString()}</span>
              <span className={styles.statLabel}>installs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <section className={styles.searchSection}>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search agents, workflows, templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
        <div className={styles.filterTabs}>
          {(['all', 'agent', 'workflow', 'template', 'plugin', 'integration'] as FilterType[]).map(filter => (
            <button
              key={filter}
              className={`${styles.filterTab} ${activeFilter === filter ? styles.filterTabActive : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1) + 's'}
            </button>
          ))}
        </div>
      </section>

      {/* Error State */}
      {error && (
        <div className={styles.errorBanner}>
          <span>{error}</span>
          <button onClick={loadData}>Retry</button>
        </div>
      )}

      {/* Featured */}
      {featuredItems.length > 0 && !loading && (
        <section className={styles.featuredSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured</h2>
          </div>
          <div className={styles.featuredGrid}>
            {featuredItems.map(item => (
              <div key={item.id} className={styles.featuredCard} onClick={() => setSelectedItem(item)}>
                <div className={styles.featuredImage} style={{ background: getGradient(item.item_type) }}>
                  {getItemIcon(item.item_type, 64)}
                </div>
                <div className={styles.featuredContent}>
                  <h3 className={styles.featuredTitle}>{item.name}</h3>
                  <p className={styles.featuredDescription}>{item.description || item.short_description}</p>
                  <div className={styles.categoryPills}>
                    <span className={styles.categoryPill}>{item.item_type}</span>
                    <span className={styles.categoryPill}>⭐ {item.average_rating?.toFixed(1) || '0.0'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Grid */}
      <section className={styles.gridSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {activeFilter === 'all' ? 'All Items' : `${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}s`}
          </h2>
          <span className={styles.viewAllLink}>{filteredItems.length} items</span>
        </div>

        {loading ? (
          <div className={styles.cardGrid}>
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className={styles.emptyState}>
            <EmptyIcon />
            <h3 className={styles.emptyTitle}>No items found</h3>
            <p className={styles.emptyDescription}>
              {searchQuery ? `No results for "${searchQuery}"` : 'No items available in this category'}
            </p>
            <button className={styles.primaryButton} onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {filteredItems.map(item => (
              <NFTCard key={item.id} item={item} onSelect={setSelectedItem} onLike={handleLike} isLiked={likedItems.has(item.id)} />
            ))}
          </div>
        )}
      </section>

      {/* Modal */}
      {selectedItem && (
        <div className={styles.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedItem.name}</h2>
              <button className={styles.modalClose} onClick={() => setSelectedItem(null)}>
                <CloseIcon />
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalImage} style={{ background: getGradient(selectedItem.item_type) }}>
                {getItemIcon(selectedItem.item_type, 96)}
              </div>
              
              <div className={styles.modalDetails}>
                <p className={styles.modalDescription}>{selectedItem.description || selectedItem.short_description}</p>
                
                <div className={styles.modalMeta}>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Type</div>
                    <div className={styles.metaValue}>{selectedItem.item_type}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Price</div>
                    <div className={styles.metaValue}>
                      {selectedItem.is_free || selectedItem.price === 0 ? 'Free' : `$${(selectedItem.price || 0).toFixed(2)}`}
                    </div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Rating</div>
                    <div className={styles.metaValue}>⭐ {selectedItem.average_rating?.toFixed(1) || '0.0'}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Downloads</div>
                    <div className={styles.metaValue}>{selectedItem.download_count?.toLocaleString() || 0}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Publisher</div>
                    <div className={styles.metaValue}>{selectedItem.publisher_name || 'Anonymous'}</div>
                  </div>
                  <div className={styles.metaItem}>
                    <div className={styles.metaLabel}>Version</div>
                    <div className={styles.metaValue}>{selectedItem.version}</div>
                  </div>
                </div>
                
                <div className={styles.modalActions}>
                  <button className={styles.primaryButton} onClick={handlePurchase} disabled={purchasing}>
                    {purchasing ? <><LoadingSpinner /> Processing...</> : 
                      selectedItem.is_free || selectedItem.price === 0 ? 'Install Now' : `Buy $${(selectedItem.price || 0).toFixed(2)}`}
                  </button>
                  <button className={styles.secondaryButton} onClick={() => navigate(`/marketplace/items/${selectedItem.id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplace;
