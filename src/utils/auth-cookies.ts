/**
 * Cookie-based Authentication Utilities
 * 
 * This module provides cookie-based authentication, which is more secure
 * than localStorage as cookies are HttpOnly and cannot be accessed by JavaScript,
 * protecting against XSS attacks.
 * 
 * The backend sets HttpOnly secure cookies on login, and the frontend
 * relies on these cookies being sent automatically with requests.
 */

export type UserRole = 'user' | 'org_admin' | 'platform_dev' | 'finance' | 'compliance' | 'ml_engineer' | 'viewer' | 'admin' | 'security' | 'analyst';

/**
 * Session data that can be stored in non-HttpOnly cookies or localStorage
 * (user info, not sensitive tokens)
 */
export interface SessionData {
  email: string;
  role: UserRole;
  org: string;
  userId?: string;
  plan?: string;
  organization?: string;
  user?: string;
}

const SESSION_DATA_KEY = 'rg_session_data';

/**
 * Save session data (user info only, not tokens)
 * Tokens are stored in HttpOnly cookies by the backend
 */
export const saveSessionData = (email: string, role: UserRole, orgId: string, userId?: string) => {
  const sessionData: SessionData = {
    email,
    role,
    org: orgId,
    userId: userId || email, // Use email as fallback user identifier
  };
  // Store only non-sensitive user info
  // Tokens are in HttpOnly cookies set by backend
  localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData));
};

/**
 * Get session data (user info only)
 * Note: Tokens are in HttpOnly cookies and cannot be read by JavaScript
 */
export const getSessionData = (): SessionData | null => {
  const data = localStorage.getItem(SESSION_DATA_KEY);
  if (!data) return null;
  
  try {
    return JSON.parse(data) as SessionData;
  } catch {
    return null;
  }
};

/**
 * Clear session data
 * Note: HttpOnly cookies are cleared by backend on logout
 */
export const clearSessionData = () => {
  localStorage.removeItem(SESSION_DATA_KEY);
  // Also clear any legacy localStorage items
  localStorage.removeItem('rg_access_token');
  localStorage.removeItem('rg_api_key');
  localStorage.removeItem('rg_email');
  localStorage.removeItem('rg_role');
  localStorage.removeItem('rg_org_id');
  // Clear sessionStorage items (chat IDs, etc.)
  sessionStorage.removeItem('resonant-chat-id');
  sessionStorage.removeItem('current-conversation-id');
  // SECURITY: Clear chat data to prevent leaking to next user
  localStorage.removeItem('resonant-chat-current-conversation');
  localStorage.removeItem('resonant-chat-user-id');
  // Clear guest data from sessionStorage
  sessionStorage.removeItem('guest-conversations');
  sessionStorage.removeItem('guest-memories');
  // SECURITY: Clear IDE project data to prevent leaking to next user
  localStorage.removeItem('ide-project-id');
  localStorage.removeItem('dsidp_ide_memory');
  localStorage.removeItem('ide-tabs');
  localStorage.removeItem('ide-active-tab');
  localStorage.removeItem('ide-open-files');
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

