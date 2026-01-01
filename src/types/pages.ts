/**
 * Page Types
 * Types for page components and props
 */

import type { ReactNode } from 'react';

// Base Page Props
export interface BasePageProps {
  children?: ReactNode;
  className?: string;
}

// Dashboard Page Props
export interface DashboardPageProps extends BasePageProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
  error?: string;
}

// Form Page Props
export interface FormPageProps extends BasePageProps {
  title?: string;
  onSubmit?: (data: unknown) => void;
  loading?: boolean;
  error?: string;
}

// List Page Props
export interface ListPageProps extends BasePageProps {
  title?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  emptyMessage?: string;
}
