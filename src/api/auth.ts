import logger from '../utils/logger';
import client from './client';
import fastapiClient from './fastapiClient';

const TOKEN_KEY = 'rg_access_token';
const REFRESH_TOKEN_KEY = 'rg_refresh_token';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  org_id?: string;
  crypto_hash?: string;
  user_hash?: string;
}

export const login = async (email: string, password: string) => {
  // Use withCredentials to ensure cookies are sent/received
  const res = await client.post(
    '/auth/login',
    { email, password },
    { withCredentials: true }
  );

  // Backend sets HttpOnly cookies automatically
  // We only store non-sensitive user info
  // Tokens are in HttpOnly cookies and cannot be accessed by JavaScript
  if (res.data.access_token && res.data.org_id && res.data.role) {
    // Store user info (not tokens) for UI purposes
    // Tokens are in secure HttpOnly cookies set by backend
    import('@/utils/auth-cookies').then(({ saveSessionData }) => {
      // Pass user_id if available, otherwise email is used as fallback identifier
      saveSessionData(email, res.data.role, res.data.org_id, res.data.user_id || res.data.id);
    });
  }

  return res.data;
};

export const logout = async () => {
  // Call backend logout to clear HttpOnly cookies
  try {
    await client.post('/auth/logout', {}, { withCredentials: true });
  } catch (error) {
    // Even if backend call fails, clear local session data
    logger.error('Logout error', error);
  }

  // Clear local session data (use direct import to avoid mobile issues)
  try {
    const { clearSessionData } = await import('@/utils/auth-cookies');
    clearSessionData();
  } catch (error) {
    // Fallback: manually clear session data if import fails
    localStorage.removeItem('rg_session_data');
    localStorage.removeItem('rg_access_token');
    localStorage.removeItem('rg_api_key');
    localStorage.removeItem('rg_email');
    localStorage.removeItem('rg_role');
    localStorage.removeItem('rg_org_id');
  }
};

export const refreshToken = async (): Promise<string | null> => {
  // Refresh token is in HttpOnly cookie, backend handles it automatically
  // Token expires after 12 hours - do not automatically log out user
  try {
    const res = await client.post(
      '/auth/refresh',
      {},
      { withCredentials: true }
    );
    if (res.data.access_token) {
      // Backend sets new cookies automatically
      // We don't need to store tokens manually
      return res.data.access_token;
    }
    return null;
  } catch (error) {
    // Refresh failed - but don't automatically log out
    // Token expiration (12 hours) is handled by backend
    // User session continues, will be prompted to re-authenticate when necessary
    console.warn('Token refresh failed, but user session continues:', error);
    return null;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const res = await fastapiClient.get('/auth/me');
    return res.data;
  } catch {
    return null;
  }
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const res = await fastapiClient.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword
  });
  return res.data;
};
