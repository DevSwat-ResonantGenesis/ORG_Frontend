/**
 * Marketplace API Client - Module F
 * 
 * Provides functions for browsing, purchasing, installing, and reviewing marketplace items.
 */
import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

/**
 * Marketplace Item Types
 */
export type MarketplaceItemType = 'agent' | 'plugin' | 'template' | 'workflow' | 'integration';

export type MarketplaceItemStatus = 'draft' | 'published' | 'archived' | 'rejected';

/**
 * Marketplace Item
 */
export interface MarketplaceItem {
  id: string;
  name: string;
  description?: string | null;
  short_description?: string | null;
  item_type: MarketplaceItemType;
  category?: string | null;
  tags: string[];
  price?: number | null;
  is_free: boolean;
  currency: string;
  publisher_org_id: string;
  publisher_name?: string | null;
  icon_url?: string | null;
  screenshots: string[];
  documentation_url?: string | null;
  status: MarketplaceItemStatus;
  version: string;
  download_count: number;
  purchase_count: number;
  average_rating?: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
  is_verified?: boolean;
  is_featured?: boolean;
}

/**
 * Marketplace Purchase
 */
export interface MarketplacePurchase {
  purchase_id: string;
  item_id: string;
  item_name: string;
  item_type: MarketplaceItemType;
  price: number;
  currency: string;
  purchase_date: string;
  status: 'active' | 'expired' | 'refunded' | 'pending';
  license_key?: string;
  message?: string;
}

/**
 * Marketplace Installation
 */
export interface MarketplaceInstallation {
  installation_id: string;
  item_id: string;
  item_name: string;
  item_type: MarketplaceItemType;
  installed_at?: string | null;
  status: string;
}

/**
 * Marketplace Review
 */
export interface MarketplaceReview {
  id: string;
  reviewer_name?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  helpful_count: number;
  created_at?: string | null;
}

/**
 * Request Types
 */
export interface BrowseMarketplaceParams {
  item_type?: MarketplaceItemType;
  category?: string;
  search?: string;
  min_rating?: number;
  is_free?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreateMarketplaceItemRequest {
  name: string;
  description?: string;
  short_description?: string;
  item_type: MarketplaceItemType;
  category?: string;
  tags?: string[];
  price?: number;
  is_free?: boolean;
  currency?: string;
  item_data?: Record<string, any>;
  icon_url?: string;
  screenshots?: string[];
  documentation_url?: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface PurchaseItemRequest {
  payment_method?: string;
  payment_transaction_id?: string;
}

export interface InstallItemRequest {
  installation_config?: Record<string, any>;
}

export interface CreateReviewRequest {
  rating: number;
  title?: string;
  comment?: string;
}

/**
 * Map backend listing to frontend format
 */
const mapListingToItem = (item: any): MarketplaceItem => ({
  id: item.id,
  name: item.name,
  description: item.description || item.tagline,
  short_description: item.tagline,
  item_type: (item.category?.toLowerCase() || 'agent') as MarketplaceItemType,
  category: item.category,
  tags: item.tags || [],
  price: item.price_amount ?? 0,
  is_free: item.price_type === 'free' || item.price_amount === 0,
  currency: 'USD',
  publisher_org_id: item.publisher_id,
  publisher_name: item.publisher_name || null,
  icon_url: item.icon_url || null,
  screenshots: item.screenshots || [],
  documentation_url: item.documentation_url || null,
  status: item.status as MarketplaceItemStatus,
  version: item.version || '1.0.0',
  download_count: item.downloads || 0,
  purchase_count: item.downloads || 0,
  average_rating: item.rating_average ?? null,
  review_count: item.rating_count || 0,
  created_at: item.created_at || new Date().toISOString(),
  updated_at: item.updated_at || new Date().toISOString(),
  // Extended fields for NFT marketplace
  is_verified: item.is_verified || false,
  is_featured: item.is_featured || false,
});

/**
 * Browse marketplace items
 * GET /marketplace/listings
 */
export const browseMarketplaceItems = async (
  params?: BrowseMarketplaceParams
): Promise<MarketplaceItem[]> => {
  try {
    const response = await fastapiClient.get<any[]>('/marketplace/listings', { params });
    return (response.data || []).map(mapListingToItem);
  } catch (error) {
    logger.apiError('/marketplace/listings', error);
    throw error;
  }
};

/**
 * Get featured marketplace items
 * GET /marketplace/listings/featured
 */
export const getFeaturedItems = async (limit: number = 10): Promise<MarketplaceItem[]> => {
  try {
    const response = await fastapiClient.get<any[]>('/marketplace/listings/featured', { params: { limit } });
    return (response.data || []).map(mapListingToItem);
  } catch (error) {
    logger.apiError('/marketplace/listings/featured', error);
    return [];
  }
};

/**
 * Get marketplace categories
 * GET /marketplace/categories
 */
export interface MarketplaceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  agent_count: number;
}

export const getCategories = async (): Promise<MarketplaceCategory[]> => {
  try {
    const response = await fastapiClient.get<MarketplaceCategory[]>('/marketplace/categories');
    return response.data;
  } catch (error) {
    logger.apiError('/marketplace/categories', error);
    return [];
  }
};

/**
 * Get marketplace statistics
 * GET /marketplace/stats
 */
export interface MarketplaceStats {
  total_listings: number;
  total_downloads: number;
  total_publishers: number;
}

export const getMarketplaceStats = async (): Promise<MarketplaceStats> => {
  try {
    const response = await fastapiClient.get<MarketplaceStats>('/marketplace/stats');
    return response.data;
  } catch (error) {
    logger.apiError('/marketplace/stats', error);
    return { total_listings: 0, total_downloads: 0, total_publishers: 0 };
  }
};

/**
 * Get marketplace item details
 * GET /marketplace/listings/{item_id}
 */
export const getMarketplaceItem = async (itemId: string): Promise<MarketplaceItem> => {
  try {
    const response = await fastapiClient.get<any>(`/marketplace/listings/${itemId}`);
    const item = response.data;
    return {
      id: item.id,
      name: item.name,
      description: item.description || item.tagline,
      short_description: item.tagline,
      item_type: 'agent' as MarketplaceItemType,
      category: item.category,
      tags: item.tags || [],
      price: item.price_amount,
      is_free: item.price_type === 'free' || item.price_amount === 0,
      currency: 'USD',
      publisher_org_id: item.publisher_id,
      publisher_name: null,
      icon_url: null,
      screenshots: [],
      documentation_url: null,
      status: item.status as MarketplaceItemStatus,
      version: '1.0.0',
      download_count: item.downloads || 0,
      purchase_count: item.downloads || 0,
      average_rating: item.rating_average,
      review_count: item.rating_count || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    logger.apiError(`/marketplace/listings/${itemId}`, error);
    throw error;
  }
};

/**
 * Create a new marketplace item
 * POST /marketplace/listings
 */
export const createMarketplaceItem = async (
  request: CreateMarketplaceItemRequest
): Promise<MarketplaceItem> => {
  try {
    const response = await fastapiClient.post<any>('/marketplace/listings', {
      name: request.name,
      tagline: request.short_description,
      description: request.description,
      category: request.category,
      tags: request.tags,
      price_type: request.price ? 'paid' : 'free',
      price_amount: request.price || 0,
    });
    const item = response.data;
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      short_description: item.tagline,
      item_type: request.item_type,
      category: item.category,
      tags: item.tags || [],
      price: item.price_amount,
      is_free: item.price_type === 'free',
      currency: 'USD',
      publisher_org_id: item.publisher_id,
      publisher_name: null,
      icon_url: null,
      screenshots: [],
      documentation_url: null,
      status: item.status as MarketplaceItemStatus,
      version: '1.0.0',
      download_count: 0,
      purchase_count: 0,
      average_rating: null,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    logger.apiError('/marketplace/listings', error);
    throw error;
  }
};

/**
 * Purchase a marketplace item
 * POST /marketplace/listings/{item_id}/purchase
 */
export const purchaseItem = async (
  itemId: string,
  request: PurchaseItemRequest = {}
): Promise<MarketplacePurchase> => {
  try {
    const response = await fastapiClient.post<any>(
      `/marketplace/listings/${itemId}/purchase`,
      request
    );
    return {
      purchase_id: response.data.purchase_id || response.data.id,
      item_id: itemId,
      item_name: '',
      item_type: 'agent',
      price: response.data.price_paid || 0,
      currency: 'USD',
      purchase_date: new Date().toISOString(),
      status: response.data.status || 'completed',
      message: response.data.message,
    };
  } catch (error) {
    logger.apiError(`/marketplace/listings/${itemId}/purchase`, error);
    throw error;
  }
};

/**
 * Install a marketplace item (uses purchase endpoint for free items)
 * POST /marketplace/listings/{item_id}/purchase
 */
export const installItem = async (
  itemId: string,
  _request: InstallItemRequest = {}
): Promise<{ installation_id: string; item_id: string; status: string; message: string }> => {
  try {
    // Use the purchase endpoint - for free items it acts as install
    const response = await fastapiClient.post(
      `/marketplace/listings/${itemId}/purchase`,
      {}
    );
    return {
      installation_id: response.data.purchase_id || response.data.id || itemId,
      item_id: itemId,
      status: response.data.status || 'completed',
      message: response.data.message || 'Successfully installed',
    };
  } catch (error) {
    logger.apiError(`/marketplace/listings/${itemId}/purchase`, error);
    throw error;
  }
};

/**
 * List installed items (purchases)
 * GET /marketplace/purchases
 */
export const listInstallations = async (): Promise<MarketplaceInstallation[]> => {
  try {
    const response = await fastapiClient.get<any>('/marketplace/purchases');
    const purchases = response.data?.purchases || [];
    return purchases.map((p: any) => ({
      installation_id: p.id,
      item_id: p.listing_id,
      item_name: '',
      item_type: 'agent' as MarketplaceItemType,
      installed_at: p.purchased_at,
      status: p.status,
    }));
  } catch (error) {
    logger.apiError('/marketplace/purchases', error);
    // Return empty array instead of throwing to prevent page errors
    return [];
  }
};

/**
 * List user purchases
 * GET /marketplace/purchases
 */
export const listPurchases = async (): Promise<MarketplacePurchase[]> => {
  try {
    const response = await fastapiClient.get<MarketplacePurchase[]>('/marketplace/purchases');
    return response.data;
  } catch (error) {
    logger.apiError('/marketplace/purchases', error);
    throw error;
  }
};

/**
 * Create a review for a marketplace item
 * POST /marketplace/listings/{item_id}/reviews
 */
export const createReview = async (
  itemId: string,
  request: CreateReviewRequest
): Promise<{ review_id: string; item_id: string; rating: number; message: string }> => {
  try {
    const response = await fastapiClient.post(
      `/marketplace/listings/${itemId}/reviews`,
      { rating: request.rating, title: request.title, content: request.comment }
    );
    return {
      review_id: response.data.id,
      item_id: itemId,
      rating: response.data.rating,
      message: 'Review created successfully',
    };
  } catch (error) {
    logger.apiError(`/marketplace/listings/${itemId}/reviews`, error);
    throw error;
  }
};

/**
 * List reviews for a marketplace item
 * GET /marketplace/listings/{item_id}/reviews
 */
export const listItemReviews = async (
  itemId: string,
  limit: number = 50,
  offset: number = 0
): Promise<MarketplaceReview[]> => {
  try {
    const response = await fastapiClient.get<any[]>(
      `/marketplace/listings/${itemId}/reviews`,
      { params: { limit, offset } }
    );
    return response.data.map(r => ({
      id: r.id,
      reviewer_name: null,
      rating: r.rating,
      title: r.title,
      comment: r.content,
      helpful_count: r.helpful_count || 0,
      created_at: r.created_at,
    }));
  } catch (error) {
    logger.apiError(`/marketplace/listings/${itemId}/reviews`, error);
    return [];
  }
};

// ============================================
// ADVANCED MARKETPLACE FEATURES
// ============================================

/**
 * Market Trends Data
 */
export interface MarketTrends {
  trending_items: MarketplaceItem[];
  top_sellers: SellerProfile[];
  category_stats: CategoryStats[];
  price_trends: PriceTrend[];
  total_transactions_24h: number;
  total_volume_24h: number;
}

export interface SellerProfile {
  seller_id: string;
  seller_name: string;
  avatar_url?: string;
  total_sales: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
  items_count: number;
  verified: boolean;
  joined_at: string;
}

export interface CategoryStats {
  category: string;
  item_count: number;
  total_downloads: number;
  average_price: number;
  growth_percentage: number;
}

export interface PriceTrend {
  date: string;
  average_price: number;
  total_volume: number;
  transaction_count: number;
}

/**
 * Blockchain NFT Types
 */
export interface NFTListing {
  nft_id: string;
  item_id: string;
  token_id: string;
  contract_address: string;
  chain: 'ethereum' | 'polygon' | 'solana' | 'base';
  owner_address: string;
  price: number;
  currency: string;
  listing_type: 'sale' | 'rent' | 'auction';
  rent_price_per_day?: number;
  auction_end_time?: string;
  highest_bid?: number;
  is_active: boolean;
  created_at: string;
}

export interface NFTTransaction {
  transaction_id: string;
  nft_id: string;
  from_address: string;
  to_address: string;
  transaction_type: 'purchase' | 'rent' | 'transfer' | 'mint';
  price: number;
  currency: string;
  tx_hash: string;
  block_number: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface UserDashboard {
  owned_items: MarketplaceItem[];
  rented_items: RentedItem[];
  sales_history: SaleRecord[];
  purchase_history: MarketplacePurchase[];
  total_earnings: number;
  total_spent: number;
  active_listings: NFTListing[];
  pending_transactions: NFTTransaction[];
}

export interface RentedItem {
  item_id: string;
  item_name: string;
  rental_start: string;
  rental_end: string;
  daily_rate: number;
  total_cost: number;
  status: 'active' | 'expired' | 'cancelled';
}

export interface SaleRecord {
  sale_id: string;
  item_id: string;
  item_name: string;
  buyer_id: string;
  buyer_name: string;
  price: number;
  sale_type: 'purchase' | 'rent';
  timestamp: string;
}

export interface ExecutionLedgerEntry {
  entry_id: string;
  item_id: string;
  item_name: string;
  user_id: string;
  execution_type: 'agent_run' | 'plugin_call' | 'workflow_execution';
  input_hash: string;
  output_hash: string;
  gas_used?: number;
  execution_time_ms: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
  tx_hash?: string;
}

/**
 * Get market trends and analytics
 * GET /marketplace/trends
 */
export const getMarketTrends = async (): Promise<MarketTrends> => {
  try {
    const response = await fastapiClient.get<MarketTrends>('/marketplace/trends');
    return response.data;
  } catch (error) {
    logger.apiError('/marketplace/trends', error);
    // Return mock data for development
    return {
      trending_items: [],
      top_sellers: [],
      category_stats: [],
      price_trends: [],
      total_transactions_24h: 0,
      total_volume_24h: 0,
    };
  }
};

/**
 * Get seller profile
 * GET /marketplace/sellers/{seller_id}
 */
export const getSellerProfile = async (sellerId: string): Promise<SellerProfile> => {
  try {
    const response = await fastapiClient.get<SellerProfile>(`/marketplace/sellers/${sellerId}`);
    return response.data;
  } catch (error) {
    logger.apiError(`/marketplace/sellers/${sellerId}`, error);
    throw error;
  }
};

/**
 * Get user dashboard data
 * GET /marketplace/dashboard
 */
export const getUserDashboard = async (): Promise<UserDashboard> => {
  try {
    const response = await fastapiClient.get<UserDashboard>('/marketplace/dashboard');
    return response.data;
  } catch (error) {
    logger.apiError('/marketplace/dashboard', error);
    // Return empty dashboard for development
    return {
      owned_items: [],
      rented_items: [],
      sales_history: [],
      purchase_history: [],
      total_earnings: 0,
      total_spent: 0,
      active_listings: [],
      pending_transactions: [],
    };
  }
};

/**
 * List NFT for sale or rent
 * POST /marketplace/nft/list
 */
export const listNFT = async (params: {
  item_id: string;
  listing_type: 'sale' | 'rent' | 'auction';
  price: number;
  currency?: string;
  rent_price_per_day?: number;
  auction_duration_hours?: number;
}): Promise<NFTListing> => {
  try {
    const response = await fastapiClient.post<NFTListing>('/marketplace/nft/list', params);
    return response.data;
  } catch (error) {
    logger.apiError('/marketplace/nft/list', error);
    throw error;
  }
};

/**
 * Purchase NFT
 * POST /marketplace/nft/{nft_id}/purchase
 */
export const purchaseNFT = async (nftId: string, params?: {
  payment_method?: string;
  wallet_address?: string;
}): Promise<NFTTransaction> => {
  try {
    const response = await fastapiClient.post<NFTTransaction>(
      `/marketplace/nft/${nftId}/purchase`,
      params
    );
    return response.data;
  } catch (error) {
    logger.apiError(`/marketplace/nft/${nftId}/purchase`, error);
    throw error;
  }
};

/**
 * Rent NFT
 * POST /marketplace/nft/{nft_id}/rent
 */
export const rentNFT = async (nftId: string, params: {
  rental_days: number;
  wallet_address?: string;
}): Promise<NFTTransaction> => {
  try {
    const response = await fastapiClient.post<NFTTransaction>(
      `/marketplace/nft/${nftId}/rent`,
      params
    );
    return response.data;
  } catch (error) {
    logger.apiError(`/marketplace/nft/${nftId}/rent`, error);
    throw error;
  }
};

/**
 * Get execution ledger for an item
 * GET /marketplace/items/{item_id}/executions
 */
export const getExecutionLedger = async (
  itemId: string,
  limit: number = 50
): Promise<ExecutionLedgerEntry[]> => {
  try {
    const response = await fastapiClient.get<ExecutionLedgerEntry[]>(
      `/marketplace/items/${itemId}/executions`,
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    logger.apiError(`/marketplace/items/${itemId}/executions`, error);
    return [];
  }
};

/**
 * Rate a seller
 * POST /marketplace/sellers/{seller_id}/rate
 */
export const rateSeller = async (sellerId: string, params: {
  rating: number;
  comment?: string;
  transaction_id?: string;
}): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fastapiClient.post(
      `/marketplace/sellers/${sellerId}/rate`,
      params
    );
    return response.data;
  } catch (error) {
    logger.apiError(`/marketplace/sellers/${sellerId}/rate`, error);
    throw error;
  }
};

