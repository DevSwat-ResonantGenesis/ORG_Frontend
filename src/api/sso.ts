import fastapiClient from './fastapiClient';
import { logger } from '@/utils/logger';

/**
 * SSO (Single Sign-On) API Client
 * Supports OAuth 2.0 and SAML 2.0 providers
 */

export interface SSOProvider {
  id: string;
  name: string;
  type: 'oauth2' | 'saml';
  icon?: string;
  enabled: boolean;
}

export interface SSOAuthRequest {
  provider: string;
  redirect_uri?: string;
  state?: string;
}

export interface SSOAuthResponse {
  authorization_url: string;
  state: string;
}

export interface SSOCallbackRequest {
  code: string;
  state: string;
  provider: string;
}

export interface SSOCallbackResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    email: string;
    name?: string;
    role?: string;
    org_id?: string;
  };
}

/**
 * Get available SSO providers
 */
export const getSSOProviders = async (): Promise<SSOProvider[]> => {
  try {
    const response = await fastapiClient.get('/auth/sso/providers'); // Suppress error logging for connection tests
    return response.data;
  } catch (error: any) {
    // Don't log errors for 401 (unauthorized - expected on login page), 429, 404, or 501
    if (error?.response?.status === 401 || error?.response?.status === 429 || error?.response?.status === 404 || error?.response?.status === 501) {
      // Return empty array - these are expected errors
      return [];
    }
    logger.error('Failed to get SSO providers', error, { component: 'SSO' });
    // Return empty array for any other errors too
    return [];
  }
};

/**
 * Initiate OAuth 2.0 flow
 */
export const initiateOAuth = async (request: SSOAuthRequest): Promise<SSOAuthResponse> => {
  try {
    const response = await fastapiClient.post('/auth/sso/oauth/initiate', request);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to initiate OAuth', error, { component: 'SSO' });
    throw error;
  }
};

/**
 * Handle OAuth callback
 */
export const handleOAuthCallback = async (request: SSOCallbackRequest): Promise<SSOCallbackResponse> => {
  try {
    const response = await fastapiClient.post('/auth/sso/oauth/callback', request);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to handle OAuth callback', error, { component: 'SSO' });
    throw error;
  }
};

/**
 * Initiate SAML flow
 */
export const initiateSAML = async (request: SSOAuthRequest): Promise<SSOAuthResponse> => {
  try {
    const response = await fastapiClient.post('/auth/sso/saml/initiate', request);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to initiate SAML', error, { component: 'SSO' });
    throw error;
  }
};

/**
 * Handle SAML callback
 */
export const handleSAMLCallback = async (request: SSOCallbackRequest): Promise<SSOCallbackResponse> => {
  try {
    const response = await fastapiClient.post('/auth/sso/saml/callback', request);
    return response.data;
  } catch (error: any) {
    logger.error('Failed to handle SAML callback', error, { component: 'SSO' });
    throw error;
  }
};

/**
 * Generic SSO initiate (auto-detects OAuth vs SAML)
 */
export const initiateSSO = async (providerId: string, redirectUri?: string): Promise<string> => {
  try {
    // Get provider info to determine type
    const providers = await getSSOProviders();
    const provider = providers.find(p => p.id === providerId);

    if (!provider) {
      throw new Error(`SSO provider ${providerId} not found`);
    }

    const request: SSOAuthRequest = {
      provider: providerId,
      redirect_uri: redirectUri || window.location.origin + '/auth/oauth/callback',
      state: generateState(),
    };

    let response: SSOAuthResponse;
    if (provider.type === 'oauth2') {
      response = await initiateOAuth(request);
    } else {
      response = await initiateSAML(request);
    }

    // Store state in sessionStorage for verification
    sessionStorage.setItem(`sso_state_${providerId}`, response.state);

    return response.authorization_url;
  } catch (error: any) {
    logger.error('Failed to initiate SSO', error, { component: 'SSO' });
    throw error;
  }
};

/**
 * Generate random state for OAuth flow
 */
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

