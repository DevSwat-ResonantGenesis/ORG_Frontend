/**
 * NFT API Client
 * Agent NFT minting, ownership, and marketplace integration.
 */
import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

// ============== TYPES ==============

export interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  agent_id?: string;
  team_id?: string;
  capabilities?: string[];
  trust_score?: number;
}

export interface MintedNFT {
  token_id: string;
  contract_address: string;
  chain: string;
  tx_hash: string;
  metadata_uri: string;
  owner: string;
  minted_at: string;
}

export interface NFTListing {
  id: string;
  token_id: string;
  contract_address: string;
  seller: string;
  price: number;
  currency: string;
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
  expires_at?: string;
}

export interface NFTRental {
  id: string;
  token_id: string;
  renter: string;
  owner: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  total_cost: number;
  status: 'active' | 'expired' | 'cancelled';
}

export type SupportedChain = 'ethereum' | 'polygon' | 'base' | 'solana';

// ============== MINTING ==============

/**
 * Mint an agent as an NFT
 */
export const mintAgentNFT = async (params: {
  agent_id: string;
  chain: SupportedChain;
  metadata?: Partial<NFTMetadata>;
}): Promise<MintedNFT> => {
  try {
    const res = await fastapiClient.post('/blockchain/nft/mint-agent', params);
    logger.info('Agent NFT minted', res.data);
    return res.data;
  } catch (error) {
    logger.error('Failed to mint agent NFT', error);
    throw error;
  }
};

/**
 * Mint a team as an NFT
 */
export const mintTeamNFT = async (params: {
  team_id: string;
  chain: SupportedChain;
  listing_price?: number;
  rent_price_per_day?: number;
  allow_rentals: boolean;
}): Promise<MintedNFT> => {
  try {
    const res = await fastapiClient.post(`/agents/teams/${params.team_id}/mint-nft`, {
      chain: params.chain,
      listing_price: params.listing_price,
      rent_price_per_day: params.rent_price_per_day,
      allow_rentals: params.allow_rentals,
    });
    logger.info('Team NFT minted', res.data);
    return res.data;
  } catch (error) {
    logger.error('Failed to mint team NFT', error);
    throw error;
  }
};

// ============== OWNERSHIP ==============

/**
 * Get NFTs owned by user
 */
export const getOwnedNFTs = async (): Promise<MintedNFT[]> => {
  const res = await fastapiClient.get('/blockchain/nft/owned');
  return res.data;
};

/**
 * Get NFT details by token ID
 */
export const getNFT = async (tokenId: string, chain: SupportedChain): Promise<MintedNFT> => {
  const res = await fastapiClient.get(`/blockchain/nft/${tokenId}`, {
    params: { chain }
  });
  return res.data;
};

/**
 * Transfer NFT to another address
 */
export const transferNFT = async (params: {
  token_id: string;
  chain: SupportedChain;
  to_address: string;
}): Promise<{ tx_hash: string; status: string }> => {
  const res = await fastapiClient.post('/blockchain/nft/transfer', params);
  return res.data;
};

// ============== MARKETPLACE ==============

/**
 * List NFT for sale
 */
export const listNFTForSale = async (params: {
  token_id: string;
  chain: SupportedChain;
  price: number;
  currency: string;
  duration_days?: number;
}): Promise<NFTListing> => {
  const res = await fastapiClient.post('/blockchain/marketplace/list', params);
  logger.info('NFT listed for sale', res.data);
  return res.data;
};

/**
 * Get marketplace listings
 */
export const getMarketplaceListings = async (params?: {
  chain?: SupportedChain;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price' | 'created_at' | 'trust_score';
  limit?: number;
}): Promise<NFTListing[]> => {
  const res = await fastapiClient.get('/blockchain/marketplace/listings', { params });
  return res.data;
};

/**
 * Buy NFT from marketplace
 */
export const buyNFT = async (listingId: string): Promise<{
  tx_hash: string;
  status: string;
  token_id: string;
}> => {
  const res = await fastapiClient.post(`/blockchain/marketplace/buy/${listingId}`);
  logger.info('NFT purchased', res.data);
  return res.data;
};

/**
 * Cancel listing
 */
export const cancelListing = async (listingId: string): Promise<{ status: string }> => {
  const res = await fastapiClient.post(`/blockchain/marketplace/cancel/${listingId}`);
  return res.data;
};

// ============== RENTALS ==============

/**
 * List NFT for rent
 */
export const listNFTForRent = async (params: {
  token_id: string;
  chain: SupportedChain;
  daily_rate: number;
  min_days?: number;
  max_days?: number;
}): Promise<NFTListing> => {
  const res = await fastapiClient.post('/blockchain/marketplace/list-rental', params);
  return res.data;
};

/**
 * Rent an NFT
 */
export const rentNFT = async (params: {
  listing_id: string;
  rental_days: number;
}): Promise<NFTRental> => {
  const res = await fastapiClient.post('/blockchain/marketplace/rent', params);
  logger.info('NFT rented', res.data);
  return res.data;
};

/**
 * Get active rentals (as renter)
 */
export const getMyRentals = async (): Promise<NFTRental[]> => {
  const res = await fastapiClient.get('/blockchain/marketplace/my-rentals');
  return res.data;
};

/**
 * Get rentals of owned NFTs (as owner)
 */
export const getRentalsOfMyNFTs = async (): Promise<NFTRental[]> => {
  const res = await fastapiClient.get('/blockchain/marketplace/rentals-received');
  return res.data;
};

// ============== METADATA ==============

/**
 * Update NFT metadata (if allowed by contract)
 */
export const updateNFTMetadata = async (
  tokenId: string,
  chain: SupportedChain,
  metadata: Partial<NFTMetadata>
): Promise<{ status: string; metadata_uri: string }> => {
  const res = await fastapiClient.patch(`/blockchain/nft/${tokenId}/metadata`, {
    chain,
    ...metadata
  });
  return res.data;
};

/**
 * Get NFT metadata
 */
export const getNFTMetadata = async (tokenId: string, chain: SupportedChain): Promise<NFTMetadata> => {
  const res = await fastapiClient.get(`/blockchain/nft/${tokenId}/metadata`, {
    params: { chain }
  });
  return res.data;
};

// ============== VERIFICATION ==============

/**
 * Verify NFT ownership
 */
export const verifyOwnership = async (params: {
  token_id: string;
  chain: SupportedChain;
  wallet_address: string;
}): Promise<{ is_owner: boolean; verified_at: string }> => {
  const res = await fastapiClient.post('/blockchain/nft/verify-ownership', params);
  return res.data;
};

// ============== DEFAULT EXPORT ==============

export default {
  mintAgentNFT,
  mintTeamNFT,
  getOwnedNFTs,
  getNFT,
  transferNFT,
  listNFTForSale,
  getMarketplaceListings,
  buyNFT,
  cancelListing,
  listNFTForRent,
  rentNFT,
  getMyRentals,
  getRentalsOfMyNFTs,
  updateNFTMetadata,
  getNFTMetadata,
  verifyOwnership,
};
