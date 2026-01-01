# Typography System Guide

## Overview

The ResonantGenesis typography system provides a clear, hierarchical structure for all text elements across the application. This guide documents the typography hierarchy, component usage, and best practices.

---

## Typography Hierarchy

### Desktop (1920px+)

| Level | Element | Size | Weight | Usage |
|-------|---------|------|--------|-------|
| **1** | Hero Title | 96px | 800 | Main page hero sections |
| **2** | Hero Subtitle | 40px | 600 | Hero section subtitles |
| **3** | Section Title | 36px | 700 | Main section headings |
| **4** | Large Title | 28px | 600 | Pricing, special sections |
| **5** | Card/Feature Title | 24px | 600-700 | Card titles, feature titles |
| **6** | Subsection Title | 18px | 600 | Smaller section headings |
| **7** | Body Text | 15-18px | 400 | Paragraphs, descriptions |

### Mobile (375px)

| Level | Element | Size | Weight | Usage |
|-------|---------|------|--------|-------|
| **1** | Hero Title | 42px | 800 | Main page hero sections |
| **2** | Hero Subtitle | 22px | 600 | Hero section subtitles |
| **3** | Section Title | 28px | 700 | Main section headings |
| **4** | Card/Feature Title | 24px | 600-700 | Card titles, feature titles |
| **5** | Body Text | 15px | 400 | Paragraphs, descriptions |

---

## CSS Components

### HeroTitle Component

**Location:** `src/components/ui/HeroTitle.module.css`

**Usage:**
```tsx
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';

<h1 className={heroTitleStyles.heroTitle}>
  AI Governance Platform
</h1>
<p className={heroTitleStyles.heroSubtitle}>
  Complete Control for Multi-AI Operations
</p>
```

**Features:**
- Responsive sizing using `clamp()`: `clamp(42px, 10vw, 96px)`
- Mobile-first approach
- Dark mode support
- Gradient text effects (when supported)

**Classes:**
- `.heroTitle` - Main hero title (96px desktop, 42px mobile)
- `.heroSubtitle` - Hero subtitle (40px desktop, 22px mobile)

---

### Title Component

**Location:** `src/components/ui/Title.module.css`

**Usage:**
```tsx
import titleStyles from '@/components/ui/Title.module.css';

<h2 className={titleStyles.sectionTitle}>
  Our Services
</h2>
<h3 className={titleStyles.featureTitle}>
  Advanced Features
</h3>
```

**Available Classes:**

| Class | Size | Weight | Usage |
|-------|------|--------|-------|
| `.sectionTitle` | 28-36px (responsive) | 700 | Main section headings |
| `.ctaTitle` | 28-36px (responsive) | 700 | Call-to-action sections |
| `.featureTitle` | 24px | 600 | Feature/service titles |
| `.serviceTitle` | 24px | 600 | Service card titles |
| `.differentiatorTitle` | 24px | 700 | Differentiator card titles |
| `.useCaseTitle` | 24px | 600 | Use case card titles |
| `.pricingName` | 28px | 600 | Pricing plan names |
| `.resonantChatTitle` | 32px | 600 | Resonant Chat section titles |
| `.apiSectionTitle` | 28px | 600 | API section titles |
| `.sdkSectionTitle` | 28px | 600 | SDK section titles |
| `.largeTitle` | 28px | 600 | Large titles for special sections |
| `.mediumTitle` | 24px | 600 | Medium titles for cards/items |
| `.subsectionTitle` | 18px | 600 | Smaller section headings |
| `.capabilityTitle` | 20px | 600 | Capability section titles |
| `.architectureTitle` | 20px | 600 | Architecture section titles |

---

## CSS Module System

### How It Works

CSS Modules use hashed class names (e.g., `_heroTitle_1p09m_6`) to provide scoped styling. This prevents style conflicts between components.

### Global Typography Rules

Global typography rules in `typography-enforcement.css` and `base.css` are configured to **exclude CSS modules** using the `:not([class*="_"])` selector. This allows:

1. ✅ CSS modules to define their own typography
2. ✅ Global rules to apply to non-module elements
3. ✅ No style conflicts between global and module styles

### Best Practices

1. **Use CSS Modules for Components**
   - Always use CSS modules for component-specific typography
   - Import styles: `import styles from './Component.module.css'`

2. **Use Global Classes for Generic Elements**
   - Use global classes for generic HTML elements without CSS modules
   - Global rules will apply automatically

3. **Avoid !important in CSS Modules**
   - CSS modules have higher specificity by default
   - Only use `!important` when absolutely necessary

4. **Use Explicit Pixel Values**
   - Prefer explicit pixel values over CSS variables for critical typography
   - CSS variables may not resolve in all contexts

---

## Responsive Typography

### Using clamp()

The typography system uses `clamp()` for responsive sizing:

```css
/* Hero Title - Responsive */
.heroTitle {
  font-size: clamp(42px, 10vw, 96px);
  /* Minimum: 42px (mobile) */
  /* Preferred: 10vw (scales with viewport) */
  /* Maximum: 96px (desktop) */
}
```

### Breakpoints

- **Mobile:** < 640px
- **Tablet:** 640px - 1023px
- **Desktop:** 1024px+

---

## Dark Mode Support

All typography components support dark mode via the `[data-theme='dark']` selector:

```css
[data-theme='dark'] .heroTitle {
  color: #f1f5f9;
}
```

---

## Examples

### Hero Section

```tsx
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';

<section className={styles.hero}>
  <h1 className={heroTitleStyles.heroTitle}>
    AI Governance Platform
  </h1>
  <p className={heroTitleStyles.heroSubtitle}>
    Complete Control for Multi-AI Operations
  </p>
</section>
```

### Section with Cards

```tsx
import titleStyles from '@/components/ui/Title.module.css';

<section>
  <h2 className={titleStyles.sectionTitle}>
    Our Services
  </h2>
  <div className={styles.cards}>
    <div className={styles.card}>
      <h3 className={titleStyles.serviceTitle}>
        AI Risk Management
      </h3>
      <p>Description text...</p>
    </div>
  </div>
</section>
```

---

## Troubleshooting

### Typography Not Applying

1. **Check CSS Module Import**
   - Ensure you're importing the CSS module correctly
   - Verify the class name matches the CSS file

2. **Check for Global Overrides**
   - Global rules should not affect CSS modules
   - If issues persist, check `typography-enforcement.css`

3. **Verify Class Names**
   - CSS modules use hashed class names
   - Check browser DevTools for the actual class name

### Size Not Responsive

1. **Check clamp() Usage**
   - Ensure responsive sizes use `clamp()`
   - Verify viewport units (vw) are appropriate

2. **Check Media Queries**
   - Some components use media queries for breakpoints
   - Verify breakpoints match your viewport size

---

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── HeroTitle.module.css      # Hero title component
│       └── Title.module.css           # Title component
└── theme/
    └── modules/
        ├── typography-enforcement.css # Global typography rules
        ├── base.css                   # Base element styles
        └── tokens-2025.css            # Design tokens
```

---

## Changelog

### 2025-01-28 - Typography System Fix

- **Fixed:** CSS module conflicts with global typography rules
- **Added:** CSS module exclusion in global rules (`:not([class*="_"])`)
- **Updated:** Replaced CSS variables with explicit pixel values
- **Improved:** Typography hierarchy clarity across all screen sizes
- **Verified:** Responsive typography on mobile (375px) and desktop (1920px)

---

## Resources

- [CSS Modules Documentation](https://github.com/css-modules/css-modules)
- [CSS clamp() Function](https://developer.mozilla.org/en-US/docs/Web/CSS/clamp)
- [Responsive Typography Guide](https://css-tricks.com/books/volume-i/scale-typography-screen-size/)

