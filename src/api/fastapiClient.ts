import axios from 'axios';
import { getSessionData } from '../utils/auth-cookies';
import { getApiUrl } from '../utils/apiUrl';
import { logger } from '../utils/logger';
import { apiErrorHandler } from '../utils/apiErrorHandler';
import { retryWithBackoff } from '../utils/retry';

// Get API URL and log it for debugging
const apiBaseUrl = getApiUrl();
console.log('[FastAPI Client] Base URL:', apiBaseUrl);

const fastapiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 120000, // Increased to 120 seconds (2 minutes) for chat requests with heavy processing
  // Enable credentials to send/receive cookies
  withCredentials: true,
});

fastapiClient.interceptors.request.use((config) => {
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
  
  // For FormData, don't set Content-Type - let axios/browser set it with boundary
  if (config.data instanceof FormData) {
    delete (config.headers as any)['Content-Type'];
  }
  
  return config;
});

// Request retry logic for rate limiting
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

fastapiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check if error.config exists before accessing it
    if (!error || !error.config) {
      // If no config, it's likely a network error or malformed request
      const parsedError = apiErrorHandler(error);
      return Promise.reject(parsedError);
    }
    
    const config = error.config;
    
    // Handle retryable errors (429, 500, 502, 503, 504, timeouts)
    const retryableStatuses = [429, 500, 502, 503, 504];
    const retryCount = config.__retryCount || 0;
    
    if (error?.response?.status && retryableStatuses.includes(error.response.status)) {
      if (retryCount < MAX_RETRIES) {
        config.__retryCount = retryCount + 1;
        const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
        
        const statusMessages: Record<number, string> = {
          429: 'Rate limited',
          500: 'Server error',
          502: 'Bad gateway',
          503: 'Service unavailable',
          504: 'Gateway timeout',
        };
        
        logger.warn(`${statusMessages[error.response.status] || 'Error'} (${error.response.status}). Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`, {
          url: config?.url,
          status: error.response.status,
          retryCount: retryCount + 1,
          maxRetries: MAX_RETRIES
        });
        
        await sleep(delay);
        return fastapiClient.request(config);
      } else {
        const errorMessages: Record<number, string> = {
          429: 'Too many requests. Please wait a moment and try again.',
          500: 'Server error. Please try again in a moment.',
          502: 'Service temporarily unavailable. Please try again.',
          503: 'Service is currently unavailable. Please try again later.',
          504: 'Request timeout. Please try again.',
        };
        
        logger.error(`Error after ${MAX_RETRIES} retries`, error, {
          url: config?.url,
          status: error.response.status,
          retries: MAX_RETRIES
        });
        
        // Include actual error detail from backend if available
        const backendDetail = error?.response?.data?.detail;
        const errorMessage = backendDetail || errorMessages[error.response.status] || 'Request failed';
        return Promise.reject({
          error: errorMessage,
          message: errorMessage,
          status: error.response.status
        });
      }
    }
    
    // Skip retries on test pages (they work offline)
    const isTestPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/test-');
    
    // Handle network errors and timeouts
    const isNetworkError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.code === 'ECONNABORTED' ||
      error?.message?.includes('Network Error') ||
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('timeout');
    
    if (isNetworkError && retryCount < MAX_RETRIES && !isTestPage) {
      config.__retryCount = retryCount + 1;
      const delay = RETRY_DELAY * Math.pow(2, retryCount);
      
      logger.warn(`Network error. Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`, {
        url: config?.url,
        code: error?.code,
        retryCount: retryCount + 1,
        maxRetries: MAX_RETRIES
      });
      
      await sleep(delay);
      return fastapiClient.request(config);
    }
    
    // On test pages, silently fail network errors (no retries, no logs)
    if (isNetworkError && isTestPage) {
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized - token expired or invalid
    if (error?.response?.status === 401) {
      const detail = error?.response?.data?.detail || '';
      
      // Prevent infinite retry loops - mark request as already retried
      if (config.__auth401Handled) {
        return Promise.reject(error);
      }
      
      // Don't retry on auth endpoints - just reject
      const isAuthEndpoint = config?.url?.includes('/auth/');
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }
      
      // For other 401 errors, try ONE refresh attempt
      // Also handle "Missing or invalid Authorization header" from gateway
      if (detail.includes('expired') || detail.includes('Invalid token') || detail.includes('Token expired') || detail.includes('Not authenticated') || detail === 'Missing refresh token' || detail === 'Expired refresh token' || detail.includes('Missing or invalid') || detail === '') {
        try {
          const { refreshToken, logout } = await import('./auth');
          const newToken = await refreshToken();
          if (newToken && config) {
            // Mark as handled to prevent loops
            config.__auth401Handled = true;
            return fastapiClient.request(config);
          } else {
            // Refresh returned null - session is invalid, clear local state
            logout();
            // Redirect to login if not already there
            if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
              window.location.href = '/login?expired=true';
            }
          }
        } catch (refreshError) {
          // Refresh failed - clear session and redirect to login
          console.warn('Token refresh failed:', refreshError);
          const { logout } = await import('./auth');
          logout();
          if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
            window.location.href = '/login?expired=true';
          }
        }
      }
      
      // All 401s that weren't handled above - just reject (no retry)
      return Promise.reject(error);
    }
    // Handle 400 Bad Request with proper FastAPI validation error parsing
    if (error?.response?.status === 400) {
      const parsedError = apiErrorHandler(error);
      return Promise.reject(parsedError);
    }
    
    // Only log non-connection errors (connection errors are expected when backend is down)
    const isConnectionError = 
      error?.code === 'ECONNREFUSED' || 
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('Network Error') ||
      error?.message?.includes('Failed to fetch');
    
    // Skip all error logging on test pages
    // Note: isTestPage is declared earlier in this function scope
    if (!isConnectionError && !isTestPage) {
      logger.apiError('FastAPI Error', error, {
        url: error?.config?.url,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      });
    }
    
    // For other errors, use enhanced error handler
    const parsedError = apiErrorHandler(error);
    return Promise.reject(parsedError);
  },
);

export default fastapiClient;
