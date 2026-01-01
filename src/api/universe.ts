import fastapiClient from './fastapiClient';
import { logger } from '../utils/logger';

export interface Universe {
  id: string;
  name: string;
  description?: string;
  anchor_set_id?: string;
  created_at?: string;
  is_default?: boolean;
}

export interface UniverseAnchors {
  universe_id: string;
  anchors: Array<{
    anchor_id: string;
    weight: number;
  }>;
}

export interface UserUniverseContext {
  user_id: string;
  current_universe_id: string;
  last_switched: string;
}

/**
 * List all available universes
 * Endpoint: GET /hash-sphere/universes
 */
export const listUniverses = async (): Promise<Universe[]> => {
  try {
    const response = await fastapiClient.get('/hash-sphere/universes');
    return response.data.universes || response.data || [];
  } catch (error: any) {
    logger.error('List universes error', error, { component: 'Universe' });
    // Return default universe on error
    return [{
      id: 'default',
      name: 'Default Universe',
      description: 'Standard meaning universe',
      is_default: true,
    }];
  }
};

/**
 * Get current user's universe context
 * Endpoint: GET /hash-sphere/universe/current
 */
export const getCurrentUniverse = async (): Promise<UserUniverseContext> => {
  try {
    const response = await fastapiClient.get('/hash-sphere/universe/current');
    return response.data;
  } catch (error: any) {
    logger.error('Get current universe error', error, { component: 'Universe' });
    throw error;
  }
};

/**
 * Switch to a different universe
 * Endpoint: POST /hash-sphere/switch-universe
 */
export const switchUniverse = async (universeId: string): Promise<UserUniverseContext> => {
  try {
    const response = await fastapiClient.post('/hash-sphere/switch-universe', {
      universe_id: universeId,
    });
    return response.data;
  } catch (error: any) {
    logger.error('Switch universe error', error, { component: 'Universe' });
    throw error;
  }
};

/**
 * Infer universe from context
 * Endpoint: POST /hash-sphere/universe/infer
 */
export const inferUniverse = async (context: {
  text?: string;
  anchors?: string[];
  predictions?: string[];
}): Promise<Universe> => {
  try {
    const response = await fastapiClient.post('/hash-sphere/universe/infer', context);
    return response.data;
  } catch (error: any) {
    logger.error('Infer universe error', error, { component: 'Universe' });
    throw error;
  }
};

/**
 * Get universe-specific anchors
 * Endpoint: GET /hash-sphere/universe/{id}/anchors
 */
export const getUniverseAnchors = async (universeId: string): Promise<UniverseAnchors> => {
  try {
    const response = await fastapiClient.get(`/hash-sphere/universe/${universeId}/anchors`);
    return response.data;
  } catch (error: any) {
    logger.error('Get universe anchors error', error, { component: 'Universe' });
    throw error;
  }
};

/**
 * Create a new universe
 * Endpoint: POST /hash-sphere/universe
 */
export const createUniverse = async (universe: {
  name: string;
  description?: string;
  anchor_set_id?: string;
}): Promise<Universe> => {
  try {
    const response = await fastapiClient.post('/hash-sphere/universe', universe);
    return response.data;
  } catch (error: any) {
    logger.error('Create universe error', error, { component: 'Universe' });
    throw error;
  }
};

