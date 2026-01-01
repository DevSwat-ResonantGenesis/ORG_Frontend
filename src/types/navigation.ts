/**
 * Navigation Types
 * Types for navigation and routing
 */

import type { NavigateFunction } from 'react-router-dom';

// Navigation Function Types
export type NavigationFunction = (navigate: NavigateFunction, closeMenu?: () => void) => void;

// Route Types
export interface RouteConfig {
  path: string;
  name: string;
  requiresAuth?: boolean;
  roles?: string[];
}

// Navigation State
export interface NavigationState {
  currentPath: string;
  previousPath?: string;
  history: string[];
}
