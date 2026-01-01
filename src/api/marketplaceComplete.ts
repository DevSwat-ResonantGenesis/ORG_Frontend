/**
 * COMPLETE MARKETPLACE API
 * ========================
 * 
 * Full marketplace API client covering:
 * - Agent listings
 * - Purchases
 * - Reviews
 * - Publisher profiles
 */

import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============== TYPES ==============

export interface AgentListing {
  id: string;
  publisher_id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  category?: string;
  tags?: string[];
  icon_url?: string;
  banner_url?: string;
  screenshots?: string[];
  price_type: 'free' | 'one_time' | 'subscription';
  price_amount: number;
  price_currency: string;
  downloads: number;
  rating_average: number;
  rating_count: number;
  status: 'draft' | 'pending_review' | 'published' | 'suspended';
  is_featured: boolean;
  is_verified: boolean;
  published_at?: string;
  created_at: string;
}

export interface AgentVersion {
  id: string;
  listing_id: string;
  version: string;
  changelog?: string;
  is_current: boolean;
  created_at: string;
}

export interface AgentPurchase {
  id: string;
  listing_id: string;
  price_paid: number;
  currency: string;
  status: 'pending' | 'completed' | 'refunded' | 'cancelled';
  purchased_at: string;
  expires_at?: string;
}

export interface AgentReview {
  id: string;
  listing_id: string;
  reviewer_id: string;
  rating: number;
  title?: string;
  content?: string;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: Record<number, number>;
  verified_purchase_count: number;
}

export interface PublisherProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  website_url?: string;
  avatar_url?: string;
  is_verified: boolean;
  total_sales: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  agent_count: number;
}

export interface SearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  price_type?: 'free' | 'paid';
  min_rating?: number;
  sort_by?: 'popular' | 'recent' | 'rating' | 'price_low' | 'price_high';
}

// ============== BROWSE ==============

/**
 * Browse marketplace listings.
 */
export const browseListings = async (
  filters?: SearchFilters,
  limit: number = 20,
  offset: number = 0
): Promise<{ listings: AgentListing[]; total: number }> => {
  const response = await fastapiClient.get('/marketplace/browse', {
    params: { ...filters, limit, offset },
  });
  return response.data;
};

/**
 * Get featured listings.
 */
export const getFeaturedListings = async (
  limit: number = 10
): Promise<AgentListing[]> => {
  const response = await fastapiClient.get('/marketplace/featured', {
    params: { limit },
  });
  return response.data;
};

/**
 * Get trending listings.
 */
export const getTrendingListings = async (
  limit: number = 10
): Promise<AgentListing[]> => {
  const response = await fastapiClient.get('/marketplace/trending', {
    params: { limit },
  });
  return response.data;
};

/**
 * Search listings.
 */
export const searchListings = async (
  query: string,
  limit: number = 20
): Promise<AgentListing[]> => {
  const response = await fastapiClient.get('/marketplace/search', {
    params: { query, limit },
  });
  return response.data;
};

/**
 * Get listing details.
 */
export const getListing = async (
  listingIdOrSlug: string
): Promise<AgentListing> => {
  const response = await fastapiClient.get(`/marketplace/listings/${listingIdOrSlug}`);
  return response.data;
};

// ============== CATEGORIES ==============

/**
 * Get all categories.
 */
export const getCategories = async (): Promise<Category[]> => {
  const response = await fastapiClient.get('/marketplace/categories');
  return response.data;
};

/**
 * Get listings by category.
 */
export const getListingsByCategory = async (
  categorySlug: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ listings: AgentListing[]; total: number }> => {
  const response = await fastapiClient.get(`/marketplace/categories/${categorySlug}/listings`, {
    params: { limit, offset },
  });
  return response.data;
};

// ============== PURCHASES ==============

/**
 * Purchase an agent.
 */
export const purchaseAgent = async (
  listingId: string,
  successUrl: string,
  cancelUrl: string
): Promise<{ checkout_url: string; session_id: string }> => {
  try {
    const response = await fastapiClient.post(`/marketplace/listings/${listingId}/purchase`, {
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    logger.info('Purchase initiated', { listingId });
    return response.data;
  } catch (error) {
    logger.error('Purchase failed', error);
    throw error;
  }
};

/**
 * Get user's purchases.
 */
export const getMyPurchases = async (
  limit: number = 50
): Promise<AgentPurchase[]> => {
  const response = await fastapiClient.get('/marketplace/purchases', {
    params: { limit },
  });
  return response.data;
};

/**
 * Check if user owns an agent.
 */
export const checkOwnership = async (
  listingId: string
): Promise<{ owned: boolean; purchase?: AgentPurchase }> => {
  const response = await fastapiClient.get(`/marketplace/listings/${listingId}/ownership`);
  return response.data;
};

/**
 * Request refund.
 */
export const requestRefund = async (
  purchaseId: string,
  reason: string
): Promise<{ status: string; refund_id?: string }> => {
  const response = await fastapiClient.post(`/marketplace/purchases/${purchaseId}/refund`, {
    reason,
  });
  return response.data;
};

// ============== REVIEWS ==============

/**
 * Get reviews for a listing.
 */
export const getReviews = async (
  listingId: string,
  sortBy: 'recent' | 'helpful' | 'rating_high' | 'rating_low' = 'recent',
  limit: number = 20,
  offset: number = 0
): Promise<{ reviews: AgentReview[]; total: number }> => {
  const response = await fastapiClient.get(`/marketplace/listings/${listingId}/reviews`, {
    params: { sort_by: sortBy, limit, offset },
  });
  return response.data;
};

/**
 * Get review statistics.
 */
export const getReviewStats = async (listingId: string): Promise<ReviewStats> => {
  const response = await fastapiClient.get(`/marketplace/listings/${listingId}/reviews/stats`);
  return response.data;
};

/**
 * Create a review.
 */
export const createReview = async (
  listingId: string,
  rating: number,
  title?: string,
  content?: string
): Promise<AgentReview> => {
  try {
    const response = await fastapiClient.post(`/marketplace/listings/${listingId}/reviews`, {
      rating,
      title,
      content,
    });
    logger.info('Review created', { listingId, rating });
    return response.data;
  } catch (error) {
    logger.error('Failed to create review', error);
    throw error;
  }
};

/**
 * Update review.
 */
export const updateReview = async (
  reviewId: string,
  rating?: number,
  title?: string,
  content?: string
): Promise<AgentReview> => {
  const response = await fastapiClient.patch(`/marketplace/reviews/${reviewId}`, {
    rating,
    title,
    content,
  });
  return response.data;
};

/**
 * Delete review.
 */
export const deleteReview = async (reviewId: string): Promise<{ deleted: boolean }> => {
  const response = await fastapiClient.delete(`/marketplace/reviews/${reviewId}`);
  return response.data;
};

/**
 * Mark review as helpful.
 */
export const markReviewHelpful = async (
  reviewId: string
): Promise<{ helpful_count: number }> => {
  const response = await fastapiClient.post(`/marketplace/reviews/${reviewId}/helpful`);
  return response.data;
};

/**
 * Flag review.
 */
export const flagReview = async (
  reviewId: string,
  reason: string
): Promise<{ flagged: boolean }> => {
  const response = await fastapiClient.post(`/marketplace/reviews/${reviewId}/flag`, {
    reason,
  });
  return response.data;
};

// ============== PUBLISHER ==============

/**
 * Get publisher profile.
 */
export const getPublisher = async (publisherId: string): Promise<PublisherProfile> => {
  const response = await fastapiClient.get(`/marketplace/publishers/${publisherId}`);
  return response.data;
};

/**
 * Get publisher's listings.
 */
export const getPublisherListings = async (
  publisherId: string,
  limit: number = 20
): Promise<AgentListing[]> => {
  const response = await fastapiClient.get(`/marketplace/publishers/${publisherId}/listings`, {
    params: { limit },
  });
  return response.data;
};

/**
 * Create or update publisher profile.
 */
export const updatePublisherProfile = async (
  displayName: string,
  bio?: string,
  websiteUrl?: string
): Promise<PublisherProfile> => {
  const response = await fastapiClient.put('/marketplace/publisher/profile', {
    display_name: displayName,
    bio,
    website_url: websiteUrl,
  });
  return response.data;
};

/**
 * Get publisher dashboard.
 */
export const getPublisherDashboard = async (): Promise<{
  profile: PublisherProfile;
  listings: AgentListing[];
  total_earnings: number;
  recent_sales: number;
}> => {
  const response = await fastapiClient.get('/marketplace/publisher/dashboard');
  return response.data;
};

/**
 * Setup payout account.
 */
export const setupPayoutAccount = async (
  returnUrl: string
): Promise<{ onboarding_url: string }> => {
  const response = await fastapiClient.post('/marketplace/publisher/payout/setup', {
    return_url: returnUrl,
  });
  return response.data;
};

// ============== PUBLISH ==============

/**
 * Create a new listing.
 */
export const createListing = async (
  name: string,
  description: string,
  category: string,
  priceType: 'free' | 'one_time' | 'subscription',
  priceAmount?: number
): Promise<AgentListing> => {
  try {
    const response = await fastapiClient.post('/marketplace/listings', {
      name,
      description,
      category,
      price_type: priceType,
      price_amount: priceAmount,
    });
    logger.info('Listing created', response.data);
    return response.data;
  } catch (error) {
    logger.error('Failed to create listing', error);
    throw error;
  }
};

/**
 * Update listing.
 */
export const updateListing = async (
  listingId: string,
  updates: Partial<AgentListing>
): Promise<AgentListing> => {
  const response = await fastapiClient.patch(`/marketplace/listings/${listingId}`, updates);
  return response.data;
};

/**
 * Submit listing for review.
 */
export const submitForReview = async (
  listingId: string
): Promise<{ status: string }> => {
  const response = await fastapiClient.post(`/marketplace/listings/${listingId}/submit`);
  return response.data;
};

/**
 * Publish a new version.
 */
export const publishVersion = async (
  listingId: string,
  version: string,
  changelog?: string,
  agentConfig?: Record<string, any>
): Promise<AgentVersion> => {
  const response = await fastapiClient.post(`/marketplace/listings/${listingId}/versions`, {
    version,
    changelog,
    agent_config: agentConfig,
  });
  return response.data;
};

/**
 * Get listing versions.
 */
export const getVersions = async (listingId: string): Promise<AgentVersion[]> => {
  const response = await fastapiClient.get(`/marketplace/listings/${listingId}/versions`);
  return response.data;
};

// ============== INSTALL ==============

/**
 * Install agent from purchase.
 */
export const installAgent = async (
  listingId: string
): Promise<{ agent_id: string; installed: boolean }> => {
  const response = await fastapiClient.post(`/marketplace/listings/${listingId}/install`);
  return response.data;
};

/**
 * Get installed agents.
 */
export const getInstalledAgents = async (): Promise<
  Array<{ listing: AgentListing; agent_id: string; installed_at: string }>
> => {
  const response = await fastapiClient.get('/marketplace/installed');
  return response.data;
};

// ============== EXPORTS ==============

export default {
  // Browse
  browseListings,
  getFeaturedListings,
  getTrendingListings,
  searchListings,
  getListing,
  // Categories
  getCategories,
  getListingsByCategory,
  // Purchases
  purchaseAgent,
  getMyPurchases,
  checkOwnership,
  requestRefund,
  // Reviews
  getReviews,
  getReviewStats,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
  flagReview,
  // Publisher
  getPublisher,
  getPublisherListings,
  updatePublisherProfile,
  getPublisherDashboard,
  setupPayoutAccount,
  // Publish
  createListing,
  updateListing,
  submitForReview,
  publishVersion,
  getVersions,
  // Install
  installAgent,
  getInstalledAgents,
};
