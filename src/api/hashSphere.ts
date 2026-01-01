import fastapiClient from './fastapiClient';

export interface HashSphereToken {
  token: string;
  expires_at: string;
  expires_in_hours: number;
}

export interface HashRequest {
  text: string;
  context?: string;
}

export interface HashResponse {
  hash: string;
  meaning_hash: string;
  energy_score: number;
  spin_score: number;
  anchors: string[];
}

export interface ResonanceRequest {
  hash1: string;
  hash2: string;
}

export interface ResonanceResponse {
  resonance_score: number;
  hash1: string;
  hash2: string;
}

/**
 * Get a Hash Sphere access token for public pages.
 * 
 * @param isOwner - If true, generates owner token (unlimited memory, 30-day expiration)
 *                   If false, generates guest token (limited memory, 1-hour expiration)
 * @returns Hash Sphere token with expiration info
 */
export const getHashSphereToken = async (isOwner: boolean = false): Promise<HashSphereToken> => {
  const res = await fastapiClient.post('/public/hash-sphere/token', { is_owner: isOwner });
  return res.data;
};

/**
 * Hash text using Hash Sphere.
 * Requires Hash Sphere token or JWT.
 */
export const hashText = async (
  request: HashRequest,
  token?: string
): Promise<HashResponse> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fastapiClient.post('/hash-sphere/hash', request, { headers });
  return res.data;
};

/**
 * Calculate resonance between two hashes.
 * Requires Hash Sphere token or JWT.
 */
export const calculateResonance = async (
  request: ResonanceRequest,
  token?: string
): Promise<ResonanceResponse> => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const res = await fastapiClient.post('/hash-sphere/resonance', request, { headers });
  return res.data;
};

/**
 * Health check for Hash Sphere (no auth required).
 */
export const checkHashSphereHealth = async (): Promise<{ status: string; service: string; version: string }> => {
  const res = await fastapiClient.get('/hash-sphere/health');
  return res.data;
};

