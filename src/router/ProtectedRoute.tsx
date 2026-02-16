import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getSessionData, isAuthenticated } from '../utils/auth-cookies';

type Props = {
  children: React.ReactNode;
};

const getCookieValue = (name: string): string | null => {
  try {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie ? document.cookie.split(';') : [];
    for (const part of cookies) {
      const [k, ...rest] = part.trim().split('=');
      if (k === name) return decodeURIComponent(rest.join('='));
    }
    return null;
  } catch {
    return null;
  }
};

const clearCookie = (name: string) => {
  try {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; Max-Age=0; Path=/`;
  } catch {
  }
};

const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();

  // Check if user is authenticated (session data exists)
  // Note: Tokens are in HttpOnly cookies and cannot be checked directly
  // Backend will return 401 if cookies are invalid/missing
  const sessionData = getSessionData();

  try {
    const cookieTarget = getCookieValue('rg_post_login_target');
    if (cookieTarget && isAuthenticated()) {
      if (location.pathname === cookieTarget) {
        clearCookie('rg_post_login_target');
      } else {
        clearCookie('rg_post_login_target');
        return <Navigate to={cookieTarget} replace />;
      }
    }

    const raw = sessionStorage.getItem('rg-post-login-target');
    if (raw && isAuthenticated()) {
      let targetPath: string | null = null;
      let createdAt = 0;
      let remaining = 0;

      if (raw.trim().startsWith('{')) {
        try {
          const parsed = JSON.parse(raw) as { path?: string; ts?: number; remaining?: number };
          targetPath = typeof parsed.path === 'string' ? parsed.path : null;
          createdAt = typeof parsed.ts === 'number' ? parsed.ts : 0;
          remaining = typeof parsed.remaining === 'number' ? parsed.remaining : 0;
        } catch {
          targetPath = null;
        }
      } else {
        targetPath = raw;
        createdAt = Date.now();
        remaining = 1;
      }

      const ttlMs = 60_000;
      const isExpired = !createdAt || Date.now() - createdAt > ttlMs;
      if (!targetPath || isExpired || remaining <= 0) {
        sessionStorage.removeItem('rg-post-login-target');
      } else if (location.pathname === targetPath) {
        // Target reached: consume the post-login redirect so it doesn't keep forcing navigation
        clearCookie('rg_post_login_target');
        sessionStorage.removeItem('rg-post-login-target');
      } else {
        clearCookie('rg_post_login_target');
        const next = JSON.stringify({ path: targetPath, ts: createdAt, remaining: remaining - 1 });
        sessionStorage.setItem('rg-post-login-target', next);
        return <Navigate to={targetPath} replace />;
      }
    }
  } catch {
  }
  
  // Only require basic authentication - role and org can be optional
  // Some pages may work without full session data
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // If session data exists but is incomplete, still allow access
  // The backend will handle authorization
  return <>{children}</>;
};

export default ProtectedRoute;
