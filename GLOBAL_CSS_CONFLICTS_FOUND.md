# Global CSS Conflicts Found

## ⚠️ CRITICAL: Global Styles That Could Affect IDE CSS Modules

### 1. Global `button` Element Selector
**File:** `src/theme/modules/reset-2025.css`
```css
button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
```
**Impact:** This affects ALL buttons, including those in CSS modules!

### 2. Global `.button` Class Styles
**File:** `src/theme/modules/typography.css`
```css
button,
.button,
.cta,
.btn {
  font-family: var(--font-family);
  font-size: var(--font-lg);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-normal);
  line-height: var(--leading-normal);
}
```
**Impact:** This affects buttons with `.button` class, but CSS modules use hashed names, so this shouldn't conflict directly.

### 3. Global `.button` Enforcement (WITH PROTECTION!)
**File:** `src/theme/modules/typography-enforcement.css`
```css
button:not([class*="_"]), 
.button:not([class*="_"]), 
.btn:not([class*="_"]) {
  font-family: var(--font-family) !important;
  font-size: var(--font-base) !important;
  ...
}
```
**Impact:** ✅ This EXCLUDES CSS modules! The `:not([class*="_"])` selector means it won't affect CSS module classes (which have underscores like `ComponentName_className__hash`).

### 4. Global `.container` Class
**File:** `src/theme/modules/components.css`
```css
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
  width: 100%;
}
```
**Impact:** This is a utility class, not a CSS module conflict.

### 5. Global `.button-group` Styles
**File:** `src/theme/modules/utilities.css`
```css
.button-group > button,
.button-group > [class*="Button"] {
  width: 100%;
}
```
**Impact:** This affects buttons inside `.button-group`, but CSS modules are scoped.

## ✅ The Real Problem

### Global `button` Element Selector
The `button { }` selector in `reset-2025.css` affects ALL buttons, including those in CSS modules. This is why we need `!important` for button styles in CSS modules!

**Solution:**
1. Keep `!important` for button styles that need to override global `button` selector
2. OR: Make the global `button` selector more specific
3. OR: Exclude IDE buttons from global styles

## ✅ What's Protected

The `typography-enforcement.css` file uses `:not([class*="_"])` which EXCLUDES CSS modules:
- CSS modules generate: `ComponentName_className__hash` (has underscores)
- Global styles with `:not([class*="_"])` won't affect CSS modules ✅

## ⚠️ What Needs `!important`

1. **Button styles** - Need to override global `button { }` selector
2. **Layout styles** - May need to override global layout styles
3. **Font styles** - May need to override global typography

## ✅ Recommendation

1. **Keep `!important` for button styles** - They need to override global `button { }`
2. **Remove `!important` from other styles** - CSS module scoping handles them
3. **Consider making global `button` selector more specific** - To avoid conflicts

