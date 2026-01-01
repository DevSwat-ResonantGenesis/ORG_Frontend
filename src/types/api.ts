/**
 * API Types
 * Types for API requests and responses
 */

// Re-export types from API modules
export type { Prediction } from '../api/predictions';
export type { Policy } from '../api/policies';
export type { ComplianceSummary } from '../api/compliance';
export type { Thresholds } from '../api/settings';
export type { User } from '../api/users';

// API Response Types
export interface APIResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
