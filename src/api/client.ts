import axios from 'axios';
import { getSessionData } from '../utils/auth-cookies';
import { getApiUrl } from '../utils/apiUrl';
import { logger } from '../utils/logger';
import { apiErrorHandler } from '../utils/apiErrorHandler';

// Get API URL and log it for debugging
const apiBaseUrl = getApiUrl();
console.log('[API Client] Base URL:', apiBaseUrl);

const client = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased to 30 seconds for slower connections
  // Enable credentials to send/receive cookies
  withCredentials: true,
});

client.interceptors.request.use((config) => {
  // Get session data (user info only, tokens are in HttpOnly cookies)
  const sessionData = getSessionData();
  
  // Tokens are sent automatically via HttpOnly cookies
  // We only need to send user context headers if available
  if (sessionData) {
    if (sessionData.userId) {
      (config.headers as any)['x-user-id'] = sessionData.userId;
    }
    if (sessionData.role) {
      (config.headers as any)['RG-Role'] = sessionData.role;
    }
    if (sessionData.org) {
      (config.headers as any)['RG-Org-ID'] = sessionData.org;
    }
  }
  
  // Ensure credentials are always sent
  config.withCredentials = true;
  
  return config;
});

// Request retry logic for rate limiting
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle 401 (Unauthorized) - try to refresh token
    if (error.response?.status === 401 && !config.__isRetryRequest) {
      config.__isRetryRequest = true;
      
      try {
        const refreshRes = await axios.post(
          `${apiBaseUrl}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = refreshRes?.data?.access_token;
        
        if (newToken) {
          console.log('[API Client] ✅ Token refreshed successfully, retrying request');
          // Retry the original request - cookies are automatically updated
          return client(config);
        }
      } catch (refreshError) {
        console.warn('[API Client] ⚠️ Token refresh failed:', refreshError);
        // Token refresh failed - user needs to re-login
        // Clear session and redirect to login
        try {
          const { clearSessionData } = await import('../utils/auth-cookies');
          clearSessionData();
        } catch (e) {
          localStorage.removeItem('rg_session_data');
        }
        // Redirect to login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          window.location.href = '/login?session_expired=true';
        }
      }
    }
    
    // Handle 429 (Too Many Requests) with exponential backoff retry
    if (error.response?.status === 429) {
      const retryCount = config.__retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        config.__retryCount = retryCount + 1;
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        
        logger.warn(`Rate limited (429). Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`, {
          url: config.url,
          retryCount: retryCount + 1,
          maxRetries: MAX_RETRIES
        });
        
        await sleep(delay);
        return client(config);
      } else {
        logger.error('Rate limit exceeded. Too many retries.', new Error('Rate limit exceeded'), {
          url: config.url,
          retries: MAX_RETRIES
        });
        return Promise.reject({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please wait a moment and try again.',
          status: 429
        });
      }
    }
    
    // Enhanced error logging for debugging
    if (error.code === 'ECONNABORTED') {
      logger.apiError('Request Timeout', new Error('API Request Timeout'), {
        url: error.config?.url,
        message: 'Backend may be slow or unresponsive. Check backend status.'
      });
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      logger.apiError('Network Error - Backend Disconnected', new Error('Network Error'), {
        url: error.config?.url,
        possibleCauses: [
          'Backend service is down',
          'Nginx proxy is misconfigured',
          'Network connectivity issue'
        ]
      });
    } else if (error.response?.status === 502 || error.response?.status === 503) {
      logger.apiError('Bad Gateway - Backend Unavailable', new Error('Bad Gateway'), {
        url: error.config?.url,
        status: error.response?.status,
        message: 'Backend service may be down or restarting'
      });
    } else if (error.response?.status !== 429) {
      // Don't log 429 errors as they're handled above
      logger.apiError('API Error', error, {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url
      });
    }
    
    // Handle 400 Bad Request with proper error parsing
    if (error.response?.status === 400) {
      const parsedError = apiErrorHandler(error);
      return Promise.reject(parsedError);
    }
    
    // For other errors, use enhanced error handler
    const parsedError = apiErrorHandler(error);
    return Promise.reject(parsedError);
  },
);

export default client;
