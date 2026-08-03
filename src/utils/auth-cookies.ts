/**
 * Authentication Utilities
 * 
 * PRODUCTION SECURITY:
 * - Tokens are stored in HttpOnly secure cookies (set by backend) for API calls
 * - Session data is stored in localStorage for frontend validation
 * - Backend still validates HttpOnly cookies for all API requests
 * - Frontend validates localStorage tokens for route-level protection
 */

export type UserRole = 'user' | 'org_admin' | 'platform_dev' | 'platform_owner' | 'finance' | 'compliance' | 'ml_engineer' | 'viewer' | 'admin' | 'security' | 'analyst';

/**
 * Session data stored in localStorage for frontend validation
 * Backend uses HttpOnly cookies for API security
 */
export interface SessionData {
  email: string;
  role: UserRole;
  org: string;
  userId?: string;
  plan?: string;
  subscription_tier?: string;
  organization?: string;
  user?: string;
  is_superuser?: boolean;
}

const SESSION_COOKIE_NAME = 'rg_session';

/**
 * Set a secure cookie with proper flags
 */
const setSecureCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const isSecure = window.location.protocol === 'https:';
  const sameSite = 'Strict';
  
  // Build cookie string with security flags
  let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=${sameSite}`;
  if (isSecure) {
    cookie += '; Secure';
  }
  document.cookie = cookie;
};

/**
 * Get a cookie value by name
 */
const getCookie = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
};

/**
 * Delete a cookie
 */
const deleteCookie = (name: string) => {
  const base = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  const hostname = window.location.hostname;
  const parts = hostname.split('.').filter(Boolean);
  const rootDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
  const domainVariants = [
    '',
    ` domain=${hostname};`,
    ` domain=.${hostname};`,
    ` domain=${rootDomain};`,
    ` domain=.${rootDomain};`,
  ];

  for (const domain of domainVariants) {
    document.cookie = `${base}${domain}`;
    document.cookie = `${base} SameSite=Strict;${domain}`;
    if (window.location.protocol === 'https:') {
      document.cookie = `${base} SameSite=Strict; Secure;${domain}`;
    }
  }
};

/**
 * Save session data in localStorage for frontend validation
 * Backend still uses HttpOnly cookies for API security
 */
export const saveSessionData = (email: string, role: UserRole, orgId: string, userId?: string, is_superuser?: boolean) => {
  const sessionData: SessionData = {
    email,
    role,
    org: orgId,
    userId: userId || email,
    is_superuser: is_superuser || false,
  };
  // Store in localStorage for frontend validation
  localStorage.setItem('rg_session_data', JSON.stringify(sessionData));
  
  // Also store in cookie for migration/compatibility
  setSecureCookie(SESSION_COOKIE_NAME, JSON.stringify(sessionData));
};

/**
 * Get session data from localStorage for frontend validation
 */
export const getSessionData = (): SessionData | null => {
  // Try localStorage first (primary method for frontend validation)
  const localData = localStorage.getItem('rg_session_data');
  if (localData) {
    try {
      return JSON.parse(localData) as SessionData;
    } catch {
      localStorage.removeItem('rg_session_data');
      return null;
    }
  }
  
  // Fallback: check cookie for migration
  const cookieData = getCookie(SESSION_COOKIE_NAME);
  if (cookieData) {
    try {
      const parsed = JSON.parse(cookieData) as SessionData;
      // Migrate to localStorage
      localStorage.setItem('rg_session_data', cookieData);
      return parsed;
    } catch {
      return null;
    }
  }
  
  return null;
};

/**
 * Clear all session data and cookies
 */
export const clearSessionData = () => {
  // Clear session cookie
  deleteCookie(SESSION_COOKIE_NAME);
  
  // Clear all legacy localStorage items
  const legacyKeys = [
    'rg_session_data',
    'rg_access_token',
    'rg_refresh_token',
    'rg_api_key',
    'rg_email',
    'rg_role',
    'rg_org_id',
    'owner_token',
    'owner_token_expires',
    'resonant-chat-current-conversation',
    'resonant-chat-user-id',
    'ide-project-id',
    'dsidp_ide_memory',
    'ide-tabs',
    'ide-active-tab',
    'ide-open-files',
  ];
  legacyKeys.forEach(key => localStorage.removeItem(key));
  
  // Clear sessionStorage items
  const sessionKeys = [
    'resonant-chat-id',
    'current-conversation-id',
    'guest-conversations',
    'guest-memories',
  ];
  sessionKeys.forEach(key => sessionStorage.removeItem(key));
};

/**
 * Clear ALL session and storage data - use when user needs fresh start
 */
export const clearAllSessionData = () => {
  clearSessionData();
  // Clear all localStorage
  localStorage.clear();
  // Clear all sessionStorage
  sessionStorage.clear();
};

/**
 * Check if user is authenticated
 * Validates localStorage session data for route-level protection
 * Backend will still validate HttpOnly cookies for API requests
 */
export const isAuthenticated = (): boolean => {
  const session = getSessionData();
  if (!session) return false;
  
  // Validate that session has required fields
  return !!(session.email && session.role && session.org);
};

/**
 * Get user role from session data
 */
export const getUserRole = (): UserRole | null => {
  const session = getSessionData();
  return session?.role || null;
};

/**
 * Get user email from session data
 */
export const getUserEmail = (): string | null => {
  const session = getSessionData();
  return session?.email || null;
};

/**
 * Get organization ID from session data
 */
export const getOrgId = (): string | null => {
  const session = getSessionData();
  return session?.org || null;
};

