/**
 * MARKETPLACE HOOKS
 * =================
 * 
 * React hooks for marketplace functionality.
 * Wires marketplaceComplete API to UI components.
 */

import { useState, useEffect, useCallback } from 'react';
import * as marketplaceApi from '../api/marketplaceComplete';
import type {
  AgentListing,
  AgentPurchase,
  AgentReview,
  ReviewStats,
  PublisherProfile,
  Category,
  SearchFilters,
} from '../api/marketplaceComplete';

// ============== BROWSE HOOK ==============

interface UseBrowseResult {
  listings: AgentListing[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  search: (filters?: SearchFilters) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useBrowse(initialFilters?: SearchFilters): UseBrowseResult {
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState<SearchFilters | undefined>(initialFilters);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (newFilters?: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      setFilters(newFilters);
      const data = await marketplaceApi.browseListings(newFilters, 20, 0);
      setListings(data.listings);
      setTotal(data.total);
      setOffset(20);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to browse listings'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    try {
      const data = await marketplaceApi.browseListings(filters, 20, offset);
      setListings(prev => [...prev, ...data.listings]);
      setOffset(prev => prev + 20);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more'));
    }
  }, [filters, offset]);

  useEffect(() => {
    search(initialFilters);
  }, []);

  return {
    listings,
    total,
    isLoading,
    error,
    search,
    loadMore,
    hasMore: listings.length < total,
  };
}

// ============== LISTING DETAILS HOOK ==============

interface UseListingResult {
  listing: AgentListing | null;
  reviews: AgentReview[];
  reviewStats: ReviewStats | null;
  isOwned: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  purchase: () => Promise<void>;
}

export function useListing(listingId: string): UseListingResult {
  const [listing, setListing] = useState<AgentListing | null>(null);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [listingData, reviewsData, statsData, ownershipData] = await Promise.all([
        marketplaceApi.getListing(listingId),
        marketplaceApi.getReviews(listingId).catch(() => ({ reviews: [], total: 0 })),
        marketplaceApi.getReviewStats(listingId).catch(() => null),
        marketplaceApi.checkOwnership(listingId).catch(() => ({ owned: false })),
      ]);
      setListing(listingData);
      setReviews(reviewsData.reviews);
      setReviewStats(statsData);
      setIsOwned(ownershipData.owned);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch listing'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  const purchase = useCallback(async () => {
    const { checkout_url } = await marketplaceApi.purchaseAgent(
      listingId,
      `${window.location.origin}/marketplace/${listingId}?purchased=true`,
      `${window.location.origin}/marketplace/${listingId}?canceled=true`
    );
    window.location.href = checkout_url;
  }, [listingId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { listing, reviews, reviewStats, isOwned, isLoading, error, refetch: fetchData, purchase };
}

// ============== CATEGORIES HOOK ==============

interface UseCategoriesResult {
  categories: Category[];
  isLoading: boolean;
  error: Error | null;
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await marketplaceApi.getCategories();
        setCategories(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch categories'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { categories, isLoading, error };
}

// ============== PURCHASES HOOK ==============

interface UsePurchasesResult {
  purchases: AgentPurchase[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  requestRefund: (purchaseId: string, reason: string) => Promise<void>;
}

export function usePurchases(): UsePurchasesResult {
  const [purchases, setPurchases] = useState<AgentPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await marketplaceApi.getMyPurchases();
      setPurchases(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch purchases'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const requestRefund = useCallback(async (purchaseId: string, reason: string) => {
    await marketplaceApi.requestRefund(purchaseId, reason);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { purchases, isLoading, error, refetch: fetchData, requestRefund };
}

// ============== REVIEWS HOOK ==============

interface UseReviewsResult {
  reviews: AgentReview[];
  stats: ReviewStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createReview: (rating: number, title?: string, content?: string) => Promise<void>;
  markHelpful: (reviewId: string) => Promise<void>;
}

export function useReviews(listingId: string): UseReviewsResult {
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [reviewsData, statsData] = await Promise.all([
        marketplaceApi.getReviews(listingId),
        marketplaceApi.getReviewStats(listingId),
      ]);
      setReviews(reviewsData.reviews);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch reviews'));
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  const createReview = useCallback(async (rating: number, title?: string, content?: string) => {
    await marketplaceApi.createReview(listingId, rating, title, content);
    await fetchData();
  }, [listingId, fetchData]);

  const markHelpful = useCallback(async (reviewId: string) => {
    await marketplaceApi.markReviewHelpful(reviewId);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { reviews, stats, isLoading, error, refetch: fetchData, createReview, markHelpful };
}

// ============== PUBLISHER HOOK ==============

interface UsePublisherResult {
  profile: PublisherProfile | null;
  listings: AgentListing[];
  isLoading: boolean;
  error: Error | null;
  updateProfile: (displayName: string, bio?: string, websiteUrl?: string) => Promise<void>;
  setupPayout: () => Promise<void>;
}

export function usePublisher(): UsePublisherResult {
  const [profile, setProfile] = useState<PublisherProfile | null>(null);
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await marketplaceApi.getPublisherDashboard();
      setProfile(data.profile);
      setListings(data.listings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch publisher data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (displayName: string, bio?: string, websiteUrl?: string) => {
    await marketplaceApi.updatePublisherProfile(displayName, bio, websiteUrl);
    await fetchData();
  }, [fetchData]);

  const setupPayout = useCallback(async () => {
    const { onboarding_url } = await marketplaceApi.setupPayoutAccount(window.location.href);
    window.location.href = onboarding_url;
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { profile, listings, isLoading, error, updateProfile, setupPayout };
}

// ============== FEATURED HOOK ==============

interface UseFeaturedResult {
  featured: AgentListing[];
  trending: AgentListing[];
  isLoading: boolean;
  error: Error | null;
}

export function useFeatured(): UseFeaturedResult {
  const [featured, setFeatured] = useState<AgentListing[]>([]);
  const [trending, setTrending] = useState<AgentListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredData, trendingData] = await Promise.all([
          marketplaceApi.getFeaturedListings(6),
          marketplaceApi.getTrendingListings(6),
        ]);
        setFeatured(featuredData);
        setTrending(trendingData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch featured'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { featured, trending, isLoading, error };
}

export default {
  useBrowse,
  useListing,
  useCategories,
  usePurchases,
  useReviews,
  usePublisher,
  useFeatured,
};
