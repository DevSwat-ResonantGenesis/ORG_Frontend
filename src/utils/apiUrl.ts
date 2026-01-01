/**
 * Get the base URL for API requests
 * 
 * CONFIGURATION PRIORITY:
 * 1. Environment variable (VITE_API_URL) - highest priority
 * 2. Development mode - uses '' (empty string) for Vite proxy
 * 3. Production - uses '' (empty string) for nginx proxy
 * 
 * This ensures:
 * 1. Cookies work correctly (same-origin via proxy)
 * 2. No CORS issues in development
 * 3. Consistent behavior across deployments
 */
export const getApiUrl = (): string => {
  // Priority 1: Check for environment variable (allows override)
  // Example: VITE_API_URL=http://localhost:8000 for direct backend access
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Use empty string (relative URLs) for proxy
  // In development: Vite proxy handles /api, /auth, /public routes
  // In production: nginx proxy handles the same routes
  // This makes requests same-origin, allowing cookies to work properly
  return '';
};
