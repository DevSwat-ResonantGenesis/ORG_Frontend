# Complete Frontend Rebuild Plan 2025

## Overview
Complete redesign and rebuild of entire frontend platform (89+ pages) with modern, minimal, professional 2025 design system.

## Design Principles
- **Modern Minimal**: Clean, uncluttered, aesthetic
- **Mobile First**: Every component optimized for mobile
- **Consistent**: One design system across entire platform
- **Professional**: High-quality, polished UI/UX
- **Accessible**: Proper touch targets, contrast, semantics
- **Slightly Rounded**: No 90-degree corners, subtle rounding
- **Light & Dark Mode**: Full support for both themes

## Architecture

### 1. Design System Foundation
- ✅ `tokens-2025.css` - New design tokens (colors, spacing, typography)
- ✅ `reset-2025.css` - Modern CSS reset
- ✅ `typography-2025.css` - Typography system with module classes
- ✅ `Button-2025.module.css` - New button component
- ✅ `Card-2025.module.css` - New card component

### 2. Category Structure

#### Category 1: Dashboard Pages
- All pages under `/dashboard`, `/predictions`, `/policies`, `/compliance`, `/audit`, `/settings`, `/organization`, `/billing`, `/ml/*`, `/admin/*`, `/finance/*`
- **Shared Layout**: Dashboard-specific layout with sidebar navigation
- **Consistent Styling**: All dashboard pages follow same patterns

#### Category 2: Public Pages
- Home, About, Careers, Contact, Pricing, Legal pages, Auth pages
- **Shared Layout**: Public page layout with header/footer
- **Consistent Styling**: All public pages follow same patterns

#### Category 3: Special Public Tools
- `/llm-scan` (LLM Scanner)
- `/validate` (Validation Tool)
- **Shared Layout**: Public layout but with tool-specific functionality
- **Consistent Styling**: Follow public page patterns

#### Category 4: Resonant Chat
- `/resonant-chat`
- **Custom Layout**: Chat-specific interface
- **User-Friendly**: Optimized for chat interactions

### 3. Unified Header
- Single header component for entire platform
- Responsive menu (no separate burger menus)
- Context-aware content based on page category
- Mobile-optimized

### 4. Typography Modules
- `.typography-page-title` - Main page headings
- `.typography-section-title` - Section headings
- `.typography-subsection-title` - Subsection headings
- `.typography-card-title` - Card headings
- `.typography-body-large` - Large body text
- `.typography-body` - Base body text
- `.typography-body-small` - Small body text
- `.typography-label` - Form labels
- `.typography-caption` - Captions
- `.typography-micro` - Micro text

## Execution Plan

### Phase 1: Foundation (IN PROGRESS)
1. ✅ Create new design tokens
2. ✅ Create reset and typography systems
3. ✅ Create base UI components (Button, Card)
4. ⏳ Create unified header component
5. ⏳ Create page layout modules (Dashboard, Public, Chat)

### Phase 2: Category Modules
1. Create dashboard layout module
2. Create public page layout module
3. Create chat layout module
4. Create form components module
5. Create table components module

### Phase 3: Page Rebuilds
1. Rebuild all dashboard pages (systematically)
2. Rebuild all public pages (systematically)
3. Rebuild Resonant Chat
4. Rebuild LLM Scanner and Validator

### Phase 4: Cleanup
1. Remove all old CSS files
2. Remove all old style references
3. Verify no legacy code remains
4. Test all pages
5. Mobile optimization pass

## File Naming Convention
- New files: `*-2025.css` or `*-2025.module.css`
- Old files: Will be deleted after migration

## Mobile-First Approach
- All components designed mobile-first
- Minimum touch target: 44px
- Responsive typography with clamp()
- Flexible layouts with CSS Grid/Flexbox
- Touch-friendly interactions

