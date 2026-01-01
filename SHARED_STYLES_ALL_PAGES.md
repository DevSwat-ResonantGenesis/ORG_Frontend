# Shared Styles Across All 89+ Pages

## 📋 Overview

This document lists **ALL** styles that are shared across **every page** in the ResonantGenesis application. These styles are imported globally via `src/theme/modules/index.css` in `src/main.tsx`.

---

## 🎯 Import Chain

```
src/main.tsx
  └─> imports: './theme/modules/index.css'
      └─> imports 14 CSS modules in order:
          1. tokens.css          ← Design tokens (CSS variables)
          2. fonts.css           ← Font face declarations
          3. reset.css           ← CSS reset
          4. base.css            ← Base element styles
          5. themes.css          ← Dark/light theme
          6. typography.css      ← Typography system
          7. components.css      ← Global components
          8. forms.css           ← Form inputs
          9. hero.css            ← Hero sections
          10. content-pages.css  ← Content page layouts
          11. dashboard-layout.css ← Dashboard layouts
          12. tool-pages.css     ← Tool page layouts
          13. utilities.css      ← Utility classes
          14. typography-enforcement.css ← Final overrides
```

---

## 1. DESIGN TOKENS (tokens.css)

**Location**: `src/theme/modules/tokens.css`  
**Shared With**: **100% of all pages** (89+ pages)

### 1.1 Color Tokens

#### Brand Colors
```css
--accent-50 through --accent-900
--accent-500: #3b82f6  /* PRIMARY - Used everywhere */
```

#### Gray Scale
```css
--gray-50 through --gray-900
```

#### Light Mode Surfaces
```css
--bg: #F8F6F0                    /* Pearl white background */
--bg-subtle: #F5F3ED             /* Subtle background */
--surface: #ffffff                /* Card/surface background */
--surface-hover: #f3f4f6          /* Hover state */
--surface-border: var(--gray-200) /* Borders */
--surface-shadow: rgba(0, 0, 0, 0.06) /* Shadows */
```

#### Dark Mode Surfaces
```css
--bg-dark: #1A1A1A
--bg-subtle-dark: #1A1A1A
--surface-dark: #2D2E30
--surface-hover-dark: #3A3A3A
--surface-border-dark: rgba(255, 255, 255, 0.1)
```

#### Text Colors
```css
--text-900: var(--gray-900)  /* Primary text */
--text-700: var(--gray-700)  /* Secondary text */
--text-500: var(--gray-500)  /* Muted text */
--text-300: var(--gray-300)  /* Light text */
```

#### Legacy Compatibility Variables
```css
--color-bg: var(--bg)
--color-surface: var(--surface)
--color-border: var(--surface-border)
--color-primary: var(--accent-500)
--color-text-primary: var(--text-900)
--color-text-secondary: var(--text-700)
--rg-primary: var(--accent-500)
--rg-bg: var(--bg)
--rg-bg-card: var(--surface)
--rg-border: var(--surface-border)
```

**Used By**: Every element on every page

---

### 1.2 Typography Tokens

#### Font Families
```css
--font-family: 'Inter', 'Manrope', 'Poppins', 'Figtree', ...
--font-mono: 'Fira Code', 'IBM Plex Mono', 'JetBrains Mono', ...
--font-display: 'Inter', 'Manrope', 'Poppins', 'Figtree', ...
--font-primary: 'Inter', 'Manrope', 'Poppins', 'Figtree', ...
```

#### Font Sizes
```css
--font-xs: 11px      /* Microcopy/Labels */
--font-sm: 13px      /* Microcopy/Labels */
--font-base: 15px    /* Body Text (minimum) */
--font-lg: 18px      /* Body Text (standard) */
--font-xl: 20px      /* Subhead */
--font-2xl: 24px     /* H3 */
--font-3xl: 28px     /* H3 */
--font-4xl: 32px     /* H2 */
--font-5xl: 48px     /* H2 */
--font-hero: 72px    /* H1 */
--font-score: 120px  /* Compliance Score */
```

#### Font Weights
```css
--font-light: 300
--font-normal: 400
--font-medium: 500
--font-semibold: 600
--font-bold: 700
```

#### Line Heights
```css
--leading-tight: 1.2
--leading-snug: 1.3
--leading-normal: 1.5
--leading-relaxed: 1.6
```

#### Letter Spacing
```css
--tracking-tight: -0.02em
--tracking-normal: -0.011em
--tracking-wide: 0
```

**Used By**: All text elements on all pages

---

### 1.3 Spacing Tokens (8px Grid System)

```css
--spacing-0: 0
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px
--spacing-16: 64px
--spacing-20: 80px
--spacing-24: 96px

/* Legacy support */
--space-1 through --space-24 (mapped to --spacing-X)
```

**Used By**: All spacing (padding, margin, gap) on all pages

---

### 1.4 Border Radius Tokens

```css
--radius-sm: 6px      /* Small rounded corners */
--radius-md: 8px      /* Medium rounded corners */
--radius-lg: 12px     /* Large rounded corners */
--radius-xl: 16px     /* Extra large rounded corners */
--radius-full: 9999px /* Fully rounded (circular) */
--radius-none: 0      /* No rounding */
--border-radius-md: 8px
```

**Used By**: All elements with borders on all pages

---

### 1.5 Shadow Tokens

```css
--shadow-none: none
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05)
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07)
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1)
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.15)
```

**Used By**: Cards, modals, dropdowns on all pages

---

### 1.6 Transition Tokens

```css
--transition-fast: 0.15s ease
--transition: 0.25s ease
--transition-slow: 0.35s ease
```

**Used By**: All interactive elements on all pages

---

### 1.7 Breakpoint Tokens

```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
--breakpoint-2xl: 1536px
```

**Used By**: All responsive styles on all pages

---

## 2. CSS RESET (reset.css)

**Location**: `src/theme/modules/reset.css`  
**Shared With**: **100% of all pages**

```css
/* Universal Reset */
*, *::before, *::after {
  box-sizing: inherit;
  margin: 0;
  padding: 0;
  border-radius: 0 !important;  /* Minimal design - no rounded corners */
}

html {
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  scroll-behavior: smooth;
  font-family: var(--font-family);
  letter-spacing: -0.011em;
  background: var(--bg) !important;
  color-scheme: dark;
}
```

**Used By**: Every element on every page (universal reset)

---

## 3. BASE ELEMENT STYLES (base.css)

**Location**: `src/theme/modules/base.css`  
**Shared With**: **100% of all pages**

### 3.1 Body Styles

```css
body {
  background: var(--bg) !important;
  color: var(--text-900) !important;
  font-family: var(--font-family);
  line-height: 1.6;
  font-size: 16px;
  font-weight: 400;
  letter-spacing: -0.011em;
  transition: background 0.3s ease, color 0.3s ease !important;
  margin: 0;
  padding: 0;
  scrollbar-width: thin !important;
  scrollbar-color: rgba(155, 155, 155, 0.3) transparent !important;
}
```

### 3.2 Global Scrollbar Styles

```css
/* Applied to ALL scrollable elements */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(59, 130, 246, 0.45) transparent;
}

*::-webkit-scrollbar {
  width: 2px;
  height: 2px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.45);  /* Blue scrollbar */
  border-radius: 2px;
}

*::-webkit-scrollbar-thumb:hover {
  background: rgba(59, 130, 246, 0.7);
}
```

**Used By**: All scrollable elements on all pages

### 3.3 Root Element

```css
#root {
  background: var(--bg) !important;
  min-height: auto;
}
```

### 3.4 Consistency Enforcement

```css
/* Remove conflicting styles */
* {
  background-image: none !important;
}

/* Ensure proper inheritance */
.page-container,
.page-section,
.card,
.page-card {
  background: var(--bg) !important;
  color: var(--text-900) !important;
}

/* Force consistent typography */
h1, .h1 {
  font-size: 72px !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  line-height: 1.1 !important;
  font-family: var(--font-display) !important;
}

h2, .h2 {
  font-size: 48px !important;
  font-weight: 600 !important;
  letter-spacing: -0.02em !important;
  line-height: 1.2 !important;
  font-family: var(--font-display) !important;
}

h3, .h3 {
  font-size: 28px !important;
  font-weight: 600 !important;
  letter-spacing: -0.015em !important;
  line-height: 1.3 !important;
  font-family: var(--font-display) !important;
}

h4, .h4 {
  font-size: 22px !important;
  font-weight: 500 !important;
  letter-spacing: -0.01em !important;
  line-height: 1.4 !important;
  font-family: var(--font-family) !important;
}

/* Force consistent shadows */
.card,
.page-card,
.kpi-card {
  box-shadow: var(--shadow-sm) !important;
}

.card:hover,
.page-card:hover,
.kpi-card:hover {
  box-shadow: var(--shadow-md) !important;
}
```

**Used By**: All pages, all cards, all headings

---

## 4. THEME STYLES (themes.css)

**Location**: `src/theme/modules/themes.css`  
**Shared With**: **100% of all pages**

### 4.1 Dark Mode (Default)

```css
html[data-theme="dark"] {
  --bg: #1A1A1A !important;
  --bg-subtle: #1A1A1A !important;
  --surface: #2D2E30 !important;
  --surface-hover: #3A3A3A !important;
  --surface-border: rgba(255, 255, 255, 0.1) !important;
  --text-900: #F9FAFB !important;
  --text-700: #e5e7eb !important;
  --text-500: #9ca3af !important;
  background: #1A1A1A !important;
  color: var(--text-900) !important;
}
```

### 4.2 Light Mode

```css
html[data-theme="light"] {
  --bg: #FFFFFF !important;
  --bg-subtle: #F9FAFB !important;
  --surface: #FFFFFF !important;
  --surface-hover: #F3F4F6 !important;
  --surface-border: #E5E7EB !important;
  --text-900: #111827 !important;
  --text-700: #374151 !important;
  --text-500: #6B7280 !important;
  background: #FFFFFF !important;
  color: #111827 !important;
}
```

### 4.3 Theme-Specific Element Styles

```css
[data-theme="dark"] .card,
[data-theme="dark"] .page-card,
[data-theme="dark"] .kpi-card {
  background: var(--surface) !important;
  border-color: var(--surface-border) !important;
  color: var(--text-900) !important;
}

[data-theme="dark"] h1,
[data-theme="dark"] h2,
[data-theme="dark"] h3,
[data-theme="dark"] h4,
[data-theme="dark"] h5,
[data-theme="dark"] h6,
[data-theme="dark"] p,
[data-theme="dark"] span,
[data-theme="dark"] div,
[data-theme="dark"] label {
  color: var(--text-900) !important;
}
```

**Used By**: All pages (automatic theme switching)

---

## 5. TYPOGRAPHY SYSTEM (typography.css)

**Location**: `src/theme/modules/typography.css`  
**Shared With**: **100% of all pages**

### 5.1 Heading Styles

```css
/* H1 (Hero Headline) */
h1, .h1, .h-display-xl, .hero-headline {
  font-family: var(--font-display);
  font-size: var(--font-hero);  /* 72px */
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  margin: 0;
}

/* H2 (Section Titles) */
h2, .h2, .h-display-m, .section-title {
  font-family: var(--font-display);
  font-size: var(--font-5xl);  /* 48px */
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  margin: 0;
}

/* H3 (Feature Titles) */
h3, .h3, .h-headline, .feature-title {
  font-family: var(--font-display);
  font-size: var(--font-3xl);  /* 28px */
  font-weight: var(--font-semibold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-snug);
  margin: 0;
}

/* H4 (Subhead) */
h4, .h4, .subhead, .hero-subhead {
  font-family: var(--font-family);
  font-size: var(--font-xl);  /* 20px */
  font-weight: var(--font-medium);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-normal);
  margin: 0;
}
```

### 5.2 Body Text Styles

```css
/* Body Text */
p, .h-body-l, .h-body-m, .body-text, .body-lg, .body {
  font-family: var(--font-family);
  font-size: var(--font-lg);  /* 18px */
  font-weight: var(--font-normal);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-relaxed);
  margin: 0;
}

/* Microcopy/Labels */
.h-body-s, .h-caption, .microcopy, .label, small, .body-sm, .caption {
  font-size: var(--font-sm);  /* 13px */
  font-weight: var(--font-normal);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-normal);
  font-family: var(--font-family);
}
```

### 5.3 Typography Utility Classes

```css
.text-xs { font-size: var(--font-xs); }
.text-sm { font-size: var(--font-sm); }
.text-base { font-size: var(--font-base); }
.text-lg { font-size: var(--font-lg); }
.text-xl { font-size: var(--font-xl); }
.text-2xl { font-size: var(--font-2xl); }
.text-3xl { font-size: var(--font-3xl); }
.text-4xl { font-size: var(--font-4xl); }
.text-5xl { font-size: var(--font-5xl); }
.text-hero { font-size: var(--font-hero); }

.font-light { font-weight: var(--font-light); }
.font-normal { font-weight: var(--font-normal); }
.font-medium { font-weight: var(--font-medium); }
.font-semibold { font-weight: var(--font-semibold); }
.font-bold { font-weight: var(--font-bold); }

.font-display { font-family: var(--font-display); }
.font-mono { font-family: var(--font-mono); }
.font-primary { font-family: var(--font-primary); }

.leading-tight { line-height: var(--leading-tight); }
.leading-snug { line-height: var(--leading-snug); }
.leading-normal { line-height: var(--leading-normal); }
.leading-relaxed { line-height: var(--leading-relaxed); }
```

### 5.4 Unified Page Titles

```css
/* Standardize ALL page titles */
h1, .page-title, .heroTitle, .validation-title, .scanner-title, .title {
  text-align: left;
  margin-left: 0;
  margin-right: 0;
  margin-top: 0;
  padding-top: 64px;  /* Unified top padding */
  font-family: var(--font-primary);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--text-900);
  font-size: 32px;  /* Responsive */
}

@media (min-width: 768px) {
  h1, .page-title, .heroTitle, .validation-title, .scanner-title, .title {
    font-size: 36px;
  }
}

@media (min-width: 1024px) {
  h1, .page-title, .heroTitle, .validation-title, .scanner-title, .title {
    font-size: 40px;
  }
}
```

**Used By**: All headings and text on all pages

---

## 6. GLOBAL COMPONENT STYLES (components.css)

**Location**: `src/theme/modules/components.css`  
**Shared With**: **100% of all pages**

### 6.1 Page Container

```css
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: calc(60px + var(--space-6)) var(--space-6) var(--space-8) var(--space-6) !important;
  width: 100% !important;
  box-sizing: border-box;
  min-height: calc(100vh - 60px);
}

@media (min-width: 768px) {
  .page-container {
    padding: calc(60px + var(--space-8)) var(--space-8) var(--space-10) var(--space-8) !important;
  }
}

@media (min-width: 1024px) {
  .page-container {
    padding: calc(60px + var(--space-10)) var(--space-10) var(--space-12) var(--space-10) !important;
    max-width: 1400px !important;
  }
}
```

**Used By**: Most pages (standard page wrapper)

### 6.2 Page Header

```css
.page-header {
  margin-bottom: 48px;
  padding-left: 0;
  padding-right: 0;
  width: 100%;
  box-sizing: border-box;
  width: 100% !important;
  margin-bottom: var(--space-12) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: var(--space-4) !important;
}

.page-subtitle {
  font-size: var(--font-lg) !important;
  font-weight: var(--font-normal) !important;
  line-height: var(--leading-relaxed) !important;
  color: var(--text-700) !important;
  margin: 0 !important;
}
```

**Used By**: Most pages (page headers)

### 6.3 Header Element

```css
header {
  position: sticky !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  max-width: 100vw !important;
  z-index: 9999 !important;
  background: var(--bg) !important;
  border-bottom: 1px solid var(--surface-border) !important;
  margin: 0 !important;
  padding: 0 !important;
  font-family: var(--font-primary) !important;
}
```

**Used By**: All pages (global header)

### 6.4 Side Navigation

```css
.sideNavFloating {
  position: fixed !important;
  top: 60px !important;
  left: 0 !important;
  width: 280px !important;
  height: calc(100vh - 60px) !important;
  background: var(--color-bg-root, #1A1A1A) !important;
  border-right: 1px solid var(--color-border-primary, rgba(255, 255, 255, 0.1)) !important;
  z-index: 9999 !important;
  overflow-y: auto !important;
  transition: transform 0.3s ease !important;
  transform: translateX(-100%) !important;
}

.sideNavFloating.open {
  transform: translateX(0) !important;
}

.navItem {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px !important;
  border-radius: 8px !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text-700);
  text-align: left;
}

.navItem:hover {
  background: rgba(59, 130, 246, 0.1) !important;
  color: var(--accent-600, #2563eb) !important;
}

.navItem.active {
  background: rgba(59, 130, 246, 0.15) !important;
  color: var(--accent-600, #2563eb) !important;
}
```

**Used By**: Pages with side navigation

### 6.5 Section Styles

```css
section, .section, [class*="section"], .page-section {
  background: var(--color-bg-root, #FFFFFF) !important;
}

.page-section {
  margin-bottom: 64px;
  padding-left: 0;
  padding-right: 0;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: var(--space-12);
}

.page-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: var(--font-3xl) !important;
  font-weight: var(--font-semibold) !important;
  line-height: var(--leading-snug) !important;
  color: var(--text-900) !important;
  margin: 0 0 var(--space-6) 0 !important;
}
```

**Used By**: All pages with sections

### 6.6 Container Styles

```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  width: 100%;
}

.container-sm { max-width: 640px; }
.container-md { max-width: 768px; }
.container-lg { max-width: 1024px; }
.container-xl { max-width: 1280px; }
.container-2xl { max-width: 1400px; }
```

**Used By**: All pages (content containers)

### 6.7 Card Button Alignment

```css
/* Global Button Alignment - All Cards Across Platform */
[class*="Card"]:has(button),
[class*="card"]:has(button),
.card:has(button) {
  display: flex !important;
  flex-direction: column !important;
  height: 100% !important;
}

[class*="Card"] button,
[class*="card"] button,
.card button {
  margin-top: auto !important;
}
```

**Used By**: All cards with buttons on all pages

---

## 7. FORM STYLES (forms.css)

**Location**: `src/theme/modules/forms.css`  
**Shared With**: **100% of all pages with forms**

### 7.1 Global Form Inputs

```css
input:not(.resonant-chat-settings-input),
textarea,
select:not(.resonant-chat-settings-select) {
  font-family: inherit;
  font-size: inherit;
  border: none;
  outline: none;
  background: var(--surface) !important;
  border: 1px solid var(--surface-border) !important;
  color: var(--text-900) !important;
  padding: var(--space-3) var(--space-4) !important;
  font-size: var(--font-base) !important;
  font-family: var(--font-primary) !important;
  border-radius: 0 !important;
  width: 100% !important;
}

input:focus,
textarea:focus,
select:focus {
  outline: none !important;
  border-color: var(--accent-500) !important;
}

input::placeholder,
textarea::placeholder {
  color: var(--text-500) !important;
}
```

### 7.2 Form Components

```css
.form-group {
  margin-bottom: var(--space-6);
}

.form-label {
  display: block;
  font-size: var(--font-sm);
  font-weight: var(--font-medium);
  color: var(--text-900);
  margin-bottom: var(--space-2);
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-base);
  color: var(--text-900);
  background: var(--surface);
  border: 1px solid var(--surface-border);
  transition: border-color 0.15s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: var(--accent-500);
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.button-group {
  display: flex;
  gap: 16px;
  align-items: center;
}
```

**Used By**: All forms on all pages

---

## 8. CONTENT PAGES LAYOUT (content-pages.css)

**Location**: `src/theme/modules/content-pages.css`  
**Shared With**: AboutPage, ContactPage, CareersPage, HelpCenterPage, PrivacyPage, CompliancePage, TermsPage

### 8.1 Content Page Structure

```css
.content-page {
  min-height: calc(100vh - 60px);
  padding: var(--space-md, 16px);
  background: var(--bg);
  color: var(--text-900);
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg, 24px);
}

.content-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm, 12px);
  padding-bottom: var(--space-lg, 24px);
  border-bottom: 2px solid var(--surface-border);
}

.content-header h1 {
  font-size: var(--font-4xl, 32px);
  font-weight: 700;
  margin: 0;
  color: var(--text-900);
  line-height: 1.2;
  text-align: left;
  font-family: var(--font-display);
}

.content-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg, 24px);
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 16px);
}

.content-section h2 {
  font-size: var(--font-3xl, 28px);
  font-weight: 700;
  margin: 0;
  color: var(--text-900);
  padding-bottom: var(--space-xs, 8px);
  border-bottom: 1px solid var(--surface-border);
  font-family: var(--font-display);
}

.content-section p {
  font-size: var(--font-base, 15px);
  line-height: 1.7;
  color: var(--text-700);
  margin: 0 0 var(--space-md, 16px) 0;
  font-family: var(--font-family);
}
```

**Used By**: ~10 content pages

---

## 9. DASHBOARD LAYOUT (dashboard-layout.css)

**Location**: `src/theme/modules/dashboard-layout.css`  
**Shared With**: All 7 dashboard pages

### 9.1 Dashboard Container

```css
.dashboard-container-compact {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 100px);
}

.dashboard-left {
  display: flex;
  flex-direction: column;
}

.dashboard-right {
  overflow-y: auto;
  padding-right: 8px;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
```

### 9.2 Dashboard Components

```css
.dashboard-description {
  padding: 12px;
  background: var(--rg-bg-secondary, #f9fafb);
  border-radius: 8px;
  border: 1px solid var(--surface-border);
  margin-bottom: 8px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.stat-box {
  padding: 16px;
  background: var(--rg-bg-secondary, #f9fafb);
  border: 1px solid var(--surface-border);
  border-radius: 8px;
  text-align: center;
}
```

**Used By**: 7 dashboard pages

---

## 10. TOOL PAGES LAYOUT (tool-pages.css)

**Location**: `src/theme/modules/tool-pages.css`  
**Shared With**: LLMScannerPageFull, ValidationToolPageFull

### 10.1 Tool Page Structure

```css
.llm-scanner-page-compact,
.validation-tool-page-compact {
  min-height: calc(100vh - 60px);
  padding: var(--space-md, 16px);
  background: var(--bg);
  color: var(--text-900);
}

.scanner-container-compact,
.validation-container-compact {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 100px);
}

.scanner-left,
.validation-left {
  display: flex;
  flex-direction: column;
}

.scanner-right,
.validation-right {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding-right: 8px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}
```

**Used By**: 2 tool pages

---

## 11. UTILITY CLASSES (utilities.css)

**Location**: `src/theme/modules/utilities.css`  
**Shared With**: **100% of all pages** (can be used anywhere)

### 11.1 Layout Utilities

```css
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.w-full { width: 100%; }
.h-full { height: 100%; }
```

### 11.2 Spacing Utilities

```css
.m-0 { margin: var(--space-0); }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-3 { margin: var(--space-3); }
.m-4 { margin: var(--space-4); }
.m-6 { margin: var(--space-6); }
.m-8 { margin: var(--space-8); }

.p-0 { padding: var(--space-0); }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-3 { padding: var(--space-3); }
.p-4 { padding: var(--space-4); }
.p-6 { padding: var(--space-6); }
.p-8 { padding: var(--space-8); }

.gap-1 { gap: var(--space-1); }
.gap-2 { gap: var(--space-2); }
.gap-3 { gap: var(--space-3); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }
.gap-8 { gap: var(--space-8); }
```

### 11.3 Grid Utilities

```css
.grid-4 {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-6);
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}
```

### 11.4 Responsive Utilities

```css
@media (max-width: 768px) {
  .page-container {
    padding: var(--spacing-2);
  }

  .page-header {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: var(--spacing-3) !important;
  }

  [class*="Card"] {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }

  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .button-group {
    flex-direction: column;
    width: 100%;
  }

  input, select, textarea {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box;
  }
}
```

**Used By**: All pages (utility classes)

---

## 12. SUMMARY: What ALL 89+ Pages Share

### ✅ 100% Shared (Every Page)

1. **Design Tokens** (`tokens.css`)
   - All color variables
   - All spacing variables
   - All typography variables
   - All border-radius variables
   - All shadow variables
   - All transition variables
   - All breakpoint variables

2. **CSS Reset** (`reset.css`)
   - Universal reset
   - Box-sizing
   - Border-radius: 0 (minimal design)

3. **Base Styles** (`base.css`)
   - Body styles
   - Global scrollbar (2px blue)
   - Root element
   - Consistency enforcement
   - Heading enforcement

4. **Theme System** (`themes.css`)
   - Dark mode (default)
   - Light mode
   - Theme-specific element styles

5. **Typography System** (`typography.css`)
   - All heading styles (h1-h4)
   - Body text styles
   - Typography utilities
   - Unified page titles

6. **Global Components** (`components.css`)
   - `.page-container` (standard page wrapper)
   - `.page-header` (page headers)
   - `header` (global header)
   - `.sideNavFloating` (side navigation)
   - `.page-section` (sections)
   - `.container` (content containers)
   - Card button alignment

7. **Form Styles** (`forms.css`)
   - Global form inputs
   - Form components
   - Form containers

8. **Utility Classes** (`utilities.css`)
   - Layout utilities
   - Spacing utilities
   - Grid utilities
   - Responsive utilities

### 📊 Partially Shared (Specific Page Types)

9. **Content Pages** (`content-pages.css`)
   - Used by: ~10 content pages
   - `.content-page`, `.content-container`, `.content-header`, `.content-section`

10. **Dashboard Layout** (`dashboard-layout.css`)
    - Used by: 7 dashboard pages
    - `.dashboard-container-compact`, `.dashboard-left`, `.dashboard-right`

11. **Tool Pages** (`tool-pages.css`)
    - Used by: 2 tool pages
    - `.scanner-container-compact`, `.validation-container-compact`

12. **Hero Sections** (`hero.css`)
    - Used by: Landing pages
    - Hero section styles

---

## 13. Usage Statistics

| Style Category | Pages Using | Percentage |
|----------------|-------------|------------|
| Design Tokens | 89+ | 100% |
| CSS Reset | 89+ | 100% |
| Base Styles | 89+ | 100% |
| Theme System | 89+ | 100% |
| Typography | 89+ | 100% |
| Global Components | 89+ | 100% |
| Form Styles | ~50+ | ~56% |
| Utility Classes | 89+ | 100% |
| Content Pages | ~10 | ~11% |
| Dashboard Layout | 7 | ~8% |
| Tool Pages | 2 | ~2% |
| Hero Sections | ~5 | ~6% |

---

## 14. Key Shared Patterns

### Pattern 1: Page Container
```css
.page-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: calc(60px + var(--space-6)) var(--space-6);
}
```
**Used By**: ~70+ pages

### Pattern 2: Page Header
```css
.page-header {
  margin-bottom: var(--space-12);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```
**Used By**: ~60+ pages

### Pattern 3: Section
```css
.page-section {
  margin-bottom: var(--space-12);
  width: 100%;
}
```
**Used By**: ~50+ pages

### Pattern 4: Card
```css
.card, .page-card, .kpi-card {
  background: var(--surface);
  border: 1px solid var(--surface-border);
  box-shadow: var(--shadow-sm);
}
```
**Used By**: ~80+ pages

### Pattern 5: Typography
```css
h1 { font-size: 72px; font-weight: 800; }
h2 { font-size: 48px; font-weight: 600; }
h3 { font-size: 28px; font-weight: 600; }
p { font-size: 18px; line-height: 1.6; }
```
**Used By**: 89+ pages (all text)

---

## 15. Design System Consistency

### ✅ Enforced Globally

1. **Colors**: All use `var(--color-*)` tokens
2. **Spacing**: All use `var(--space-*)` or `var(--spacing-*)` tokens
3. **Typography**: All use `var(--font-*)` tokens
4. **Borders**: All use `border-radius: 0` (minimal design)
5. **Shadows**: All use `var(--shadow-*)` tokens
6. **Transitions**: All use `var(--transition-*)` tokens

### ✅ Consistent Patterns

1. **Page Structure**: `.page-container` → `.page-header` → `.page-section`
2. **Card Structure**: `.card` with button alignment
3. **Form Structure**: `.form-container` → `.form-group` → `.form-input`
4. **Typography Hierarchy**: h1 → h2 → h3 → h4 → p
5. **Spacing System**: 8px grid (multiples of 4px)

---

## 16. Files Reference

| File | Location | Shared With |
|------|----------|-------------|
| `tokens.css` | `src/theme/modules/tokens.css` | 89+ pages (100%) |
| `reset.css` | `src/theme/modules/reset.css` | 89+ pages (100%) |
| `base.css` | `src/theme/modules/base.css` | 89+ pages (100%) |
| `themes.css` | `src/theme/modules/themes.css` | 89+ pages (100%) |
| `typography.css` | `src/theme/modules/typography.css` | 89+ pages (100%) |
| `components.css` | `src/theme/modules/components.css` | 89+ pages (100%) |
| `forms.css` | `src/theme/modules/forms.css` | ~50+ pages (~56%) |
| `utilities.css` | `src/theme/modules/utilities.css` | 89+ pages (100%) |
| `content-pages.css` | `src/theme/modules/content-pages.css` | ~10 pages (~11%) |
| `dashboard-layout.css` | `src/theme/modules/dashboard-layout.css` | 7 pages (~8%) |
| `tool-pages.css` | `src/theme/modules/tool-pages.css` | 2 pages (~2%) |
| `hero.css` | `src/theme/modules/hero.css` | ~5 pages (~6%) |

---

## 17. Conclusion

### What ALL Pages Share:

1. ✅ **Design Tokens** - 100% shared
2. ✅ **CSS Reset** - 100% shared
3. ✅ **Base Styles** - 100% shared
4. ✅ **Theme System** - 100% shared
5. ✅ **Typography** - 100% shared
6. ✅ **Global Components** - 100% shared
7. ✅ **Utility Classes** - 100% shared

### What Most Pages Share:

8. ✅ **Form Styles** - ~56% of pages
9. ✅ **Page Container Pattern** - ~79% of pages
10. ✅ **Page Header Pattern** - ~67% of pages
11. ✅ **Section Pattern** - ~56% of pages
12. ✅ **Card Pattern** - ~90% of pages

### What Specific Page Types Share:

13. **Content Pages** - ~11% of pages
14. **Dashboard Pages** - ~8% of pages
15. **Tool Pages** - ~2% of pages
16. **Hero Sections** - ~6% of pages

---

**Last Updated**: 2025-01-27  
**File Location**: `/Applications/ResonantGraphAI_FrontendV0.1/SHARED_STYLES_ALL_PAGES.md`

