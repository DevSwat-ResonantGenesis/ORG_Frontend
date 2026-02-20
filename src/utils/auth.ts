export type UserRole = 'user' | 'org_admin' | 'platform_dev' | 'finance' | 'compliance' | 'ml_engineer' | 'viewer' | 'admin' | 'security' | 'analyst'; // Legacy roles for backward compatibility

const TOKEN_KEY = 'rg_access_token';
const LEGACY_KEY = 'rg_api_key';

/**
 * DEPRECATED: This function is deprecated for security reasons.
 * Tokens should NOT be stored in localStorage (XSS vulnerability).
 * Auth tokens are now HttpOnly cookies set by backend.
 * This function is kept for backward compatibility only.
 * 
 * @deprecated Use cookie-based authentication instead
 */
export const saveSession = (token: string, email: string, role: UserRole, orgId: string) => {
  console.warn('SECURITY WARNING: saveSession() is deprecated. Tokens should be HttpOnly cookies, not localStorage.');
  // DO NOT store tokens in localStorage - this is an XSS vulnerability
  // Only store non-sensitive user metadata
  localStorage.setItem('rg_email', email);
  localStorage.setItem('rg_role', role);
  localStorage.setItem('rg_org_id', orgId);
  // Clean up any legacy tokens
  localStorage.removeItem(LEGACY_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('owner_token');
  localStorage.removeItem('owner_token_expires');
};

export interface SessionData {
  token: string | null;
  email: string | null;
  role: UserRole | null;
  org: string | null;
  plan?: string;
  organization?: string;
}

export const getSession = (): SessionData => {
  // SECURITY FIX: Do NOT read tokens from localStorage (XSS vulnerability)
  // Tokens are now in HttpOnly cookies - not accessible to JavaScript
  const legacyToken = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_KEY);
  if (legacyToken) {
    console.warn('SECURITY WARNING: Found legacy token in localStorage. This will be ignored. Tokens should be HttpOnly cookies.');
    // Clean up legacy tokens on read
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  }
  
  // Try cookie-based session data first (new secure method)
  try {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';');
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'rg_session' && value) {
          const sessionData = JSON.parse(decodeURIComponent(value));
          if (sessionData.email) {
            return {
              token: null,  // Tokens are HttpOnly cookies - not accessible to JS
              email: sessionData.email,
              role: sessionData.role || null,
              org: sessionData.org,
              plan: sessionData.plan || 'free',
              organization: sessionData.organization || sessionData.org
            };
          }
        }
      }
    }
  } catch (e) {
    // Fall through to legacy storage
  }
  
  // Fallback to legacy localStorage (for user metadata only, not tokens)
  try {
    const sessionDataStr = localStorage.getItem('rg_session_data');
    if (sessionDataStr) {
      const sessionData = JSON.parse(sessionDataStr);
      if (sessionData.email) {
        return {
          token: null,  // Never return tokens from localStorage
          email: sessionData.email,
          role: sessionData.role || (localStorage.getItem('rg_role') as UserRole | null) || null,
          org: sessionData.org || localStorage.getItem('rg_org_id'),
          plan: sessionData.plan || 'free',
          organization: sessionData.organization || sessionData.org
        };
      }
    }
  } catch (e) {
    // Fall through to very legacy storage
  }
  
  // Very legacy fallback (metadata only)
  return {
    token: null,  // Never return tokens from localStorage
    email: localStorage.getItem('rg_email'),
    role: (localStorage.getItem('rg_role') as UserRole | null) || null,
    org: localStorage.getItem('rg_org_id'),
    plan: 'free',
    organization: localStorage.getItem('rg_org_id')
  };
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_KEY);
  localStorage.removeItem('rg_email');
  localStorage.removeItem('rg_role');
  localStorage.removeItem('rg_org_id');
  // Also clear new cookie-based session data
  localStorage.removeItem('rg_session_data');
};
