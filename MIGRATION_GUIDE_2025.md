# Migration Guide - 2025 Design System

## Overview
This guide helps migrate all 89+ pages to the new 2025 design system.

## New Design System Files

### Core Files
- `src/theme/modules/tokens-2025.css` - Design tokens
- `src/theme/modules/reset-2025.css` - CSS reset
- `src/theme/modules/typography-2025.css` - Typography system
- `src/theme/modules/index-2025.css` - Main CSS index

### Components
- `src/components/ui/Button-2025.module.css` - Button component
- `src/components/ui/Card-2025.module.css` - Card component
- `src/components/ui/Input-2025.module.css` - Input component

### Layouts
- `src/components/layout/Header/Header-2025.tsx` - Unified header
- `src/components/layout/Header/Header-2025.module.css` - Header styles
- `src/components/layout/PageLayout-2025.module.css` - Page layouts

## Migration Pattern

### For Public Pages:
```tsx
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
import buttonStyles from '../../components/ui/Button-2025.module.css';
import cardStyles from '../../components/ui/Card-2025.module.css';
import typographyStyles from '../../theme/modules/typography-2025.css';
import styles from './PageName-2025.module.css';

// Use:
// - layoutStyles.page + layoutStyles.publicPage
// - typographyStyles.typographyPageTitle
// - typographyStyles.typographySectionTitle
// - typographyStyles.typographyBody
// - buttonStyles.button + buttonStyles.buttonPrimary
// - cardStyles.card + cardStyles.cardElevated
```

### For Dashboard Pages:
```tsx
import layoutStyles from '../../components/layout/PageLayout-2025.module.css';
// ... same imports as above

// Use:
// - layoutStyles.page + layoutStyles.dashboardPage
// - layoutStyles.dashboardMain
// - layoutStyles.dashboardContainer
```

## Typography Classes
- `.typography-page-title` - Main page heading
- `.typography-section-title` - Section heading
- `.typography-subsection-title` - Subsection heading
- `.typography-card-title` - Card heading
- `.typography-body-large` - Large body text
- `.typography-body` - Base body text
- `.typography-body-small` - Small body text
- `.typography-label` - Form labels
- `.typography-caption` - Captions
- `.typography-micro` - Micro text

## Button Usage
```tsx
<button className={buttonStyles.button + ' ' + buttonStyles.buttonPrimary}>
  Primary Button
</button>

<button className={buttonStyles.button + ' ' + buttonStyles.buttonSecondary}>
  Secondary Button
</button>

<button className={buttonStyles.button + ' ' + buttonStyles.buttonGhost}>
  Ghost Button
</button>
```

## Card Usage
```tsx
<div className={cardStyles.card + ' ' + cardStyles.cardElevated}>
  Card content
</div>

<div className={cardStyles.card + ' ' + cardStyles.cardInteractive}>
  Interactive card
</div>
```

## Pages Already Migrated
1. ✅ AboutPage-2025.tsx
2. ✅ ContactPage-2025.tsx
3. ✅ LoginPage-2025.tsx
4. ✅ CareersPage-2025.tsx
5. ✅ UnifiedUserDashboard-2025.tsx
6. ✅ PredictionsPage-2025.tsx

## Next Pages to Migrate
- [ ] HomeNew (home page)
- [ ] SignupPage
- [ ] ForgotPasswordPage
- [ ] ResetPasswordPage
- [ ] PricingPage
- [ ] All other dashboard pages
- [ ] Resonant Chat
- [ ] LLM Scanner
- [ ] Validation Tool
- [ ] All other public pages

