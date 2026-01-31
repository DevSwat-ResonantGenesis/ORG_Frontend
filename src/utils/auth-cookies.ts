/**
 * Cookie-based Authentication Utilities
 * 
 * PRODUCTION SECURITY:
 * - Tokens are stored in HttpOnly secure cookies (set by backend)
 * - Session data is stored in secure cookies (not localStorage)
 * - All cookies use SameSite=Strict and Secure flags
 * - No sensitive data in localStorage (XSS protection)
 */

export type UserRole = 'user' | 'org_admin' | 'platform_dev' | 'finance' | 'compliance' | 'ml_engineer' | 'viewer' | 'admin' | 'security' | 'analyst';

/**
 * Session data stored in secure cookie (not HttpOnly so JS can read user info)
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
 * Save session data in secure cookie (user info only, not tokens)
 * Tokens are stored in HttpOnly cookies by the backend
 */
export const saveSessionData = (email: string, role: UserRole, orgId: string, userId?: string) => {
  const sessionData: SessionData = {
    email,
    role,
    org: orgId,
    userId: userId || email,
  };
  // Store in secure cookie instead of localStorage
  setSecureCookie(SESSION_COOKIE_NAME, JSON.stringify(sessionData));
  
  // MIGRATION: Clear any legacy localStorage data
  localStorage.removeItem('rg_session_data');
};

/**
 * Get session data from secure cookie
 */
export const getSessionData = (): SessionData | null => {
  // Try cookie first (new secure method)
  const cookieData = getCookie(SESSION_COOKIE_NAME);
  if (cookieData) {
    try {
      return JSON.parse(cookieData) as SessionData;
    } catch {
      return null;
    }
  }
  
  // MIGRATION: Check localStorage for legacy data and migrate
  const legacyData = localStorage.getItem('rg_session_data');
  if (legacyData) {
    try {
      const parsed = JSON.parse(legacyData) as SessionData;
      // Migrate to cookie
      setSecureCookie(SESSION_COOKIE_NAME, legacyData);
      localStorage.removeItem('rg_session_data');
      return parsed;
    } catch {
      localStorage.removeItem('rg_session_data');
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
 * Since we can't read HttpOnly cookies, we check if session data exists
 * The backend will return 401 if cookies are invalid/missing
 */
export const isAuthenticated = (): boolean => {
  return getSessionData() !== null;
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

