# Frontend Structure Analysis

## Overview
This document provides a comprehensive analysis of the ResonantGraphAI Frontend V0.1 codebase structure, architecture, and organization.

## Technology Stack

### Core Technologies
- **Framework**: React 18.3.1 with TypeScript 5.5.3
- **Build Tool**: Vite 5.3.4
- **Routing**: React Router DOM 6.26.1
- **State Management**: Zustand 4.5.2
- **Styling**: CSS Modules + Global CSS with CSS Variables (Design Tokens)
- **Testing**: Vitest 4.0.14, Cypress 15.7.0, React Testing Library
- **Charts**: Recharts 2.8.0, ECharts 5.5.1
- **Error Tracking**: Sentry 10.25.0

### Key Libraries
- **UI Components**: Custom component library
- **Data Visualization**: Recharts, ECharts, Cytoscape
- **Markdown**: React Markdown with syntax highlighting
- **HTTP Client**: Axios 1.7.4
- **Tables**: TanStack React Table 8.11.8

## Project Structure

```
src/
├── api/                    # API client modules
├── components/             # Reusable React components
├── constants/              # Application constants
├── context/                # React Context providers
├── hooks/                  # Custom React hooks
├── layout/                 # Layout components
├── layouts/                # Layout wrappers
├── pages/                  # Page components (route-level)
├── router/                 # React Router configuration
├── store/                  # Zustand state stores
├── theme/                  # Design system & styling
├── types/                  # TypeScript type definitions
├── utils/                  # Utility functions
├── test/                   # Test utilities and mocks
├── stories/                # Storybook stories
├── App.tsx                 # Root component
└── main.tsx                # Application entry point
```

## Detailed Structure

### 1. API Layer (`src/api/`)
**Purpose**: Centralized API client modules for backend communication

**Key Files**:
- `client.ts` - Base API client configuration
- `auth.ts` - Authentication endpoints
- `resonantChat.ts` - Resonant Chat API
- `providers/` - LLM provider integrations (OpenAI, Anthropic, etc.)
- `billing.ts`, `compliance.ts`, `audit.ts`, `policies.ts` - Feature-specific APIs
- `admin.ts`, `org.ts`, `users.ts` - Admin/org management APIs
- `ml.ts`, `predictions.ts`, `evidence.ts` - ML/AI feature APIs

**Pattern**: Each module exports typed functions for API calls using Axios

### 2. Components (`src/components/`)

#### 2.1 UI Components (`components/ui/`)
**Purpose**: Core reusable UI components

**Files**:
- `Button.tsx` + `Button.module.css` - Button component with variants
- `Input.tsx` + `Input.module.css` - Form input components
- `Card.tsx` + `Card.css` - Card container component
- `Select.tsx` - Dropdown select component
- `ProviderSelector.tsx` - LLM provider selector
- `UniverseSelector.tsx` - Universe/workspace selector
- `Title.module.css`, `Text.tsx` - Typography components
- `PageHeader.module.css`, `FeatureGrid.module.css` - Layout components

**Note**: Some components have both `-2025` variants (new design system) and legacy versions

#### 2.2 Layout Components (`components/layout/`)
**Purpose**: Layout and navigation components

**Files**:
- `Header/Header.tsx` + `Header.module.css` - Global header
- `Header/Header-2025.tsx` + `Header-2025.module.css` - New header design
- `Sidebar.tsx` + `Sidebar.module.css` - Sidebar navigation
- `Footer.tsx` + `Footer.css` - Footer component
- `ModernPageLayout.tsx` - Modern page layout wrapper
- `PublicPageLayout.tsx` - Public page layout wrapper
- `PageLayout-2025.module.css` - 2025 design system page layout

#### 2.3 Shared Components (`components/shared/`)
**Purpose**: Shared utility components

**Files**:
- `Modal.tsx` + `Modal.module.css` - Modal dialog component
- `Table.tsx` + `Table.module.css` - Data table component
- `Badge.tsx` + `Badge.module.css` - Badge component
- `Tabs.tsx` - Tab navigation component
- `Select.tsx` - Select dropdown component
- `LoadingState.tsx`, `ErrorState.tsx` - State components
- `EmptyState.tsx` - Empty state component
- `ErrorBoundary.tsx` - Error boundary wrapper
- `KPIBlock.tsx`, `KPIContainer.tsx` - Dashboard KPI components
- `ChartWrapper.tsx` - Chart container component
- `ResponsiveTable.tsx` - Responsive table component
- `Tooltip.tsx` - Tooltip component

#### 2.4 Feature Components (`components/features/`)
**Purpose**: Feature-specific components

**Dashboard Components** (`features/dashboard/`):
- `AdminDashboard.tsx`, `ViewerDashboard.tsx`
- `ComplianceDashboard.tsx`, `FinanceDashboard.tsx`
- `MLDashboard.tsx`
- `APIEndpointsPanel.tsx` + `apiEndpointsPanel.css`
- `BusinessImpactKPIs.tsx`
- `DashboardEvidenceGraphWidget.tsx`

**Landing Components** (`features/landing/`):
- 20+ landing page components (sections, cards, parallax effects)
- Each with corresponding CSS files

**Pricing Components** (`features/pricing/`):
- `PricingCalculator.tsx` + `pricingCalculator.css`

#### 2.5 Specialized Components
- `ResonantChat/EnhancedSidebar.tsx` - Chat sidebar with new design
- `Charts/` - Chart components (Bar, Line, Donut, Risk Heatmap)
- `HashSphere/HashSphere.tsx` - 3D visualization component
- `Toast/` - Toast notification system
- `Icons/` - Icon components (Chat, Dashboard, Provider, Service, Sidebar icons)
- `panels/LogPanel.tsx` - Log panel component
- `diagrams/FlowDiagram.tsx` - Flow diagram component

### 3. Pages (`src/pages/`)

#### 3.1 Dashboard Pages (`pages/Dashboards/`)
**Purpose**: Role-based dashboard pages

**Files**:
- `RoleBasedDashboard.tsx` - Main dashboard router
- `UnifiedUserDashboard-2025.tsx` + `.module.css`
- `UnifiedViewerDashboard-2025.tsx` + `.module.css`
- `UnifiedComplianceDashboard-2025.tsx` + `.module.css`
- `UnifiedFinanceDashboard-2025.tsx` + `.module.css`
- `UnifiedMLEngineerDashboard-2025.tsx` + `.module.css`
- `UnifiedOrgAdminDashboard-2025.tsx` + `.module.css`
- `UnifiedPlatformDevDashboard-2025.tsx` + `.module.css`
- `components/` - Dashboard-specific components

#### 3.2 Feature Pages

**Predictions** (`pages/Predictions/`):
- `PredictionsPage-2025.tsx` - Main predictions page
- `PredictionDetailPage.tsx` + `.module.css`
- `PredictionsTable.tsx`, `PredictionsFilters.tsx`
- `PredictionRow.tsx`, `EvidenceGraphPreview.tsx`

**Policies** (`pages/Policies/`):
- `PoliciesPage-2025.tsx` - Main policies page
- `PolicyRow.tsx`, `EditPolicyModal.tsx`, `CreatePolicyModal.tsx`

**Compliance** (`pages/Compliance/`):
- `CompliancePage-2025.tsx` + `.module.css`
- `ComplianceSummary.tsx`, `ComplianceViolationsTable.tsx`
- `ComplianceTrendChart.tsx`, `ComplianceRiskDonut.tsx`

**Audit** (`pages/Audit/`):
- `AuditLogsPage-2025.tsx` + `.module.css`
- `AuditLogsTable.tsx`, `AuditRow.tsx`
- `AuditFilters.tsx`, `MetadataModal.tsx`

**Settings** (`pages/Settings/`):
- `SettingsPage-2025.tsx` + `.module.css`
- `APIKeysPanel.tsx`, `CreateAPIKeyModal.tsx`, `DeleteAPIKeyModal.tsx`
- `ThresholdsPanel.tsx`, `ModelInfoPanel.tsx`
- `MFASetupPage.tsx`

**ML Pages** (`pages/ML/`):
- `TrainingJobsPage.tsx`, `CreateTrainingJobPage.tsx`
- `TrainingJobDetailPage.tsx` + `.module.css`
- `ModelVersionsPage.tsx`, `WorkerMonitorPage.tsx` + `.module.css`
- `EvaluationDriftPage.tsx`

**Finance Pages** (`pages/Finance/`):
- `InvoicesPage.tsx`, `ReportsPage.tsx`, `CreditsRefundsPage.tsx`

**Admin Pages** (`pages/Admin/`):
- `SystemDashboardPage.tsx`, `UserManagementPage.tsx`
- `FeatureFlagsPage.tsx`

**Organizations** (`pages/Organizations/`):
- `OrganizationPage.tsx`
- `OrgUsersPanel.tsx`, `OrgInviteModal.tsx`, `OrgUserRoleModal.tsx`
- `OrgApiKeysPanel.tsx`, `OrgUsagePanel.tsx`

**Billing** (`pages/Billing/`):
- `BillingPage.tsx`
- `BillingOverview.tsx`, `PricingPanel.tsx`
- `PaymentMethodsPanel.tsx`, `InvoicesPanel.tsx`, `UsageBreakdown.tsx`

#### 3.3 Public Pages (`pages/Public/`)
**Purpose**: Public-facing marketing and legal pages

**Files**:
- `PricingPage-2025.tsx` + `.module.css`
- `AboutPage-2025.tsx` + `.module.css`
- `ContactPage-2025.tsx` + `.module.css`
- `CareersPage-2025.tsx` + `.module.css`
- `CareerApplicationPage.tsx` + `.module.css`
- `SignupPageEnhanced.tsx` + `.module.css`
- `Legal/PrivacyPage-2025.tsx` + `.module.css`
- `Legal/TermsPage-2025.tsx` + `.module.css`
- `Legal/CompliancePage-2025.tsx` + `.module.css`
- `LLMScannerPageFull.tsx` + `.module.css`
- `ValidationToolPageFull.tsx` + `.module.css`

#### 3.4 Auth Pages (`pages/Auth/`)
**Files**:
- `LoginPage-2025.tsx` + `.module.css`
- `ForgotPasswordPage-2025.tsx` + `.module.css`
- `ResetPasswordPage-2025.tsx` + `.module.css`
- `OAuthCallback.tsx`

#### 3.5 Special Pages
- `HomeNew/HomeNew.tsx` + `.module.css` - Homepage
- `ResonantChat/ResonantChatPage.tsx` + `ResonantChatPage-2025.module.css` - Chat interface
- `Help/HelpCenterPage.tsx` + `.module.css` - Help center
- `Help/HelpArticlePage.tsx` + `.module.css` - Help articles
- `API/APIDocsPage.tsx` + `.module.css` - API documentation
- `HashSphere/HashSphereFullscreenPage.tsx` - Fullscreen visualization
- `Typography/TypographyShowcasePage.tsx` - Typography showcase

### 4. Theme System (`src/theme/`)

#### 4.1 Design Tokens (`theme/modules/tokens-2025.css`)
**Purpose**: CSS variables for the 2025 design system

**Key Variables**:
- **Colors**: `--color-primary-*`, `--color-gray-*`, semantic colors
- **Spacing**: `--space-*` (0, 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64)
- **Typography**: `--font-*`, `--text-*`, `--line-height-*`
- **Borders**: `--border`, `--radius-*`
- **Shadows**: `--shadow-*`
- **Surfaces**: `--surface`, `--surface-elevated`, `--surface-hover`
- **Text Colors**: `--text-primary`, `--text-secondary`, `--text-tertiary`

**Theme Modes**: Light and Dark mode support via `[data-theme='dark']`

#### 4.2 Theme Modules (`theme/modules/`)
**Load Order** (via `index.css`):
1. `tokens-2025.css` - Design tokens (CSS variables)
2. `fonts.css` - Font face declarations
3. `fonts-global-2025.css` - Global font application
4. `reset-2025.css` - CSS reset
5. `base.css` - Base element styles
6. `themes.css` - Theme-specific styles
7. `typography-2025.css` - Typography system
8. `components.css` - Component styles
9. `forms.css` - Form input styles
10. `hero.css` - Hero section styles
11. `content-pages.css` - Content page layouts
12. `dashboard-layout.css` - Dashboard layouts
13. `tool-pages.css` - Tool page layouts
14. `utilities.css` - Utility classes
15. `responsive-2025.css` - Responsive utilities
16. `typography-enforcement.css` - Typography enforcement (MUST BE LAST)

**Note**: Legacy theme files also exist (`tokens.css`, `reset.css`, `typography.css`, `index-2025.css`) but are not actively used in the main import chain.

#### 4.3 Theme Utilities
- `colors.ts` - Color constants
- `spacing.ts` - Spacing constants
- `typography.ts` - Typography constants
- `shadows.ts` - Shadow constants
- `theme.ts` - Theme configuration
- `chartTheme.ts` - Chart theming

### 5. Routing (`src/router/`)
**File**: `index.tsx`

**Structure**:
- Uses React Router v6 `createBrowserRouter`
- Lazy loading for all pages
- Protected routes via `ProtectedRoute` wrapper
- Role-based routes via `RoleRoute` component
- Layout wrappers: `withShell`, `withPublicShell`, `withRole`

**Key Routes**:
- `/` - Homepage
- `/dashboard` - Role-based dashboard
- `/predictions`, `/policies`, `/compliance`, `/audit` - Feature pages
- `/settings`, `/organization`, `/billing` - User management
- `/login`, `/public/signup` - Authentication
- `/help`, `/api/docs` - Documentation
- `/resonant-chat` - Chat interface
- Public pages: `/pricing`, `/about`, `/contact`, `/careers`

### 6. State Management (`src/store/`)
**Technology**: Zustand

**Stores**:
- `themeStore.ts` - Theme state (light/dark)
- `useAnchorsStore.ts` - Anchors data
- `useAuditStore.ts` - Audit logs data
- `useEvidenceStore.ts` - Evidence graph data
- `usePoliciesStore.ts` - Policies data
- `usePredictionsStore.ts` - Predictions data
- `useSettingsStore.ts` - Settings data

### 7. Context Providers (`src/context/`)
**Purpose**: React Context for global state

**Providers**:
- `OrgContext.tsx` - Organization context
- `BillingContext.tsx` - Billing context
- `ToastContext.tsx` - Toast notifications
- `ToolbarContext.tsx` - Toolbar state
- `ResonantChatMenuContext.tsx` - Chat menu state

### 8. Hooks (`src/hooks/`)
**Custom Hooks**:
- `useChartData.ts` - Chart data fetching
- `useDebounce.ts` - Debounce utility
- `useFetch.ts` - Data fetching
- `useKeyboardShortcuts.ts` - Keyboard shortcuts
- `useModal.ts` - Modal state management
- `useNavigation.ts` - Navigation utilities
- `usePagination.ts` - Pagination logic
- `useSignup.ts` - Signup flow
- `useToast.ts` - Toast notifications

### 9. Utilities (`src/utils/`)
**Key Utilities**:
- `apiUrl.ts` - API URL configuration
- `apiErrorHandler.ts` - Error handling
- `auth.ts`, `auth-cookies.ts` - Authentication utilities
- `formatDate.ts`, `formatScore.ts` - Formatting utilities
- `formValidation.ts`, `validators.ts` - Form validation
- `permissions.ts` - Permission checking
- `navigation.ts` - Navigation helpers
- `logger.ts` - Logging utility
- `sentry.ts` - Sentry integration
- `chartHelpers.ts` - Chart utilities
- `riskColorMap.ts` - Risk color mapping
- `export.ts` - Data export utilities

### 10. Types (`src/types/`)
**Type Definitions**:
- `api.ts` - API response types
- `components.ts` - Component prop types
- `navigation.ts` - Navigation types
- `pages.ts` - Page types
- `index.ts` - Re-exported types

### 11. Layout (`src/layout/`)
**Files**:
- `MainLayout.tsx` + `MainLayout.css` - Main application layout
- `Footer.tsx` + `Footer.css` - Footer component
- `MobileBottomNav.tsx` - Mobile navigation

### 12. Testing (`src/test/`)
**Structure**:
- `helpers/` - Test helpers and utilities
- `mocks/` - Mock data and handlers
- `setup.ts` - Test setup configuration
- `utils.tsx` - Test utilities

## Design System

### 2025 Design System
The application uses a modern, minimal design system with:

1. **Design Tokens**: CSS variables for consistent styling
2. **Typography System**: System fonts with defined scales
3. **Spacing System**: 8px base unit spacing scale
4. **Color System**: Primary colors, grays, and semantic colors
5. **Component Library**: Reusable UI components
6. **Responsive Design**: Mobile-first approach

### Migration Status
- ✅ Core UI components migrated (Button, Input, Card, Modal, Table)
- ✅ Layout components migrated (Sidebar, MainLayout)
- ✅ Help pages migrated
- ✅ Dashboard pages using new design system
- 🔄 Theme modules migration in progress
- ⏳ Some landing page components still using old styles

## Key Patterns

### 1. CSS Modules
- Component-specific styles use CSS Modules (`.module.css`)
- Global styles in `theme/modules/`
- Design tokens via CSS variables

### 2. Lazy Loading
- All pages lazy-loaded via React Router
- Code splitting for better performance

### 3. Type Safety
- Full TypeScript coverage
- Typed API responses
- Typed component props

### 4. Error Handling
- Error boundaries for React errors
- API error handling utilities
- Sentry integration for error tracking

### 5. Responsive Design
- Mobile-first CSS
- Responsive utilities in `responsive-2025.css`
- Mobile navigation components

## Build & Development

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint
- `npm run test` - Run tests
- `npm run storybook` - Storybook dev server

### Configuration
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration
- `cypress.config.ts` - Cypress configuration
- `vitest.config.ts` - Vitest configuration

## File Count Summary

**Actual Counts (Verified)**:
- **Component Files (TSX/TS)**: 97 files
- **Page Files (TSX)**: 108 files
- **Total TypeScript/TSX Files**: ~223+ files (including API, utils, types, etc.)
- **CSS Files**: 153 files (including `.module.css`)
- **CSS Module Files**: 81 files
- **Total Source Files**: ~500+ files

**Note**: File counts may vary slightly as the codebase evolves. These are current verified counts.

## Notes

1. **Dual Design Systems**: Some components have both legacy and `-2025` variants during migration
2. **Component Organization**: Components organized by feature and type
3. **Page Organization**: Pages organized by feature area
4. **Theme System**: Centralized design tokens in `tokens-2025.css`
5. **Responsive**: Mobile-first responsive design throughout

## Next Steps for Migration

1. Complete theme modules migration (`components.css`, `forms.css`, `base.css`)
2. Migrate remaining landing page components
3. Remove legacy component variants after full migration
4. Consolidate duplicate CSS files
5. Optimize bundle size with code splitting

