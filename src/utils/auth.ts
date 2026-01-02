export type UserRole = 'user' | 'org_admin' | 'platform_dev' | 'finance' | 'compliance' | 'ml_engineer' | 'viewer' | 'admin' | 'security' | 'analyst'; // Legacy roles for backward compatibility

const TOKEN_KEY = 'rg_access_token';
const LEGACY_KEY = 'rg_api_key';

export const saveSession = (token: string, email: string, role: UserRole, orgId: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem('rg_email', email);
  localStorage.setItem('rg_role', role);
  localStorage.setItem('rg_org_id', orgId);
  // Clean up the legacy key in case it exists.
  localStorage.removeItem(LEGACY_KEY);
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
  const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_KEY);
  
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
              token,
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
  
  // Fallback to legacy localStorage
  try {
    const sessionDataStr = localStorage.getItem('rg_session_data');
    if (sessionDataStr) {
      const sessionData = JSON.parse(sessionDataStr);
      if (sessionData.email) {
        return {
          token,
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
  
  // Very legacy fallback
  return {
    token,
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
