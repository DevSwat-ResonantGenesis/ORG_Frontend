# 🎨 IDE Style System - Complete Hierarchy

## Overview

The IDE now uses a **unified design system** with a proper 5-level hierarchy:

1. **Design Tokens** (Foundation)
2. **Light Mode Overrides**
3. **Component Base Styles**
4. **Layout Components**
5. **Utility Classes**

---

## Level 1: Design Tokens

**File:** `src/theme/modules/ide-design-system.css`

### Color System

#### Background Hierarchy
- `--ide-bg-primary`: Main background (#1A1A1A dark, #FFFFFF light)
- `--ide-bg-secondary`: Sidebar/Panel background (#2D2E30 dark, #FAFAFA light)
- `--ide-bg-tertiary`: Nested panels (#252526 dark, #F5F5F5 light)
- `--ide-bg-elevated`: Elevated surfaces (#353535 dark, #FFFFFF light)

#### Surface Hierarchy
- `--ide-surface`: Card/Panel surface
- `--ide-surface-hover`: Hover state
- `--ide-surface-active`: Active/Selected state
- `--ide-surface-disabled`: Disabled state

#### Border Hierarchy
- `--ide-border`: Primary borders (rgba(255,255,255,0.1))
- `--ide-border-subtle`: Subtle dividers
- `--ide-border-strong`: Strong dividers
- `--ide-border-focus`: Focus borders (blue)

#### Text Hierarchy
- `--ide-text-primary`: High contrast text (#E8E8E8 dark, #171717 light)
- `--ide-text-secondary`: Secondary text (70% opacity)
- `--ide-text-tertiary`: Tertiary text (50% opacity)
- `--ide-text-disabled`: Disabled text (30% opacity)

#### Accent Colors
- `--ide-accent-500`: Primary blue (#3B82F6)
- `--ide-accent-600`: Hover state (#2563EB)
- `--ide-accent-700`: Active state (#1D4ED8)

#### Semantic Colors
- `--ide-success`: Green (#10B981)
- `--ide-error`: Red (#EF4444)
- `--ide-warning`: Orange (#F59E0B)
- `--ide-info`: Blue (#3B82F6)

### Spacing System (4px base unit)

- `--ide-space-1`: 4px
- `--ide-space-2`: 8px
- `--ide-space-3`: 12px
- `--ide-space-4`: 16px
- `--ide-space-6`: 24px
- `--ide-space-8`: 32px
- `--ide-space-12`: 48px

### Typography System

#### Font Families
- `--ide-font-sans`: System sans-serif
- `--ide-font-mono`: Monospace (SF Mono, Monaco, etc.)

#### Font Sizes
- `--ide-font-xs`: 11px (Labels, captions)
- `--ide-font-sm`: 12px (Small text)
- `--ide-font-base`: 13px (Body text - IDE standard)
- `--ide-font-md`: 14px (Medium text)
- `--ide-font-lg`: 16px (Large text)
- `--ide-font-xl`: 18px (Headings)

#### Font Weights
- `--ide-font-normal`: 400
- `--ide-font-medium`: 500
- `--ide-font-semibold`: 600
- `--ide-font-bold`: 700

### Border Radius

- `--ide-radius-sm`: 4px
- `--ide-radius-md`: 6px
- `--ide-radius-lg`: 8px
- `--ide-radius-xl`: 12px

### Shadows (Elevation System)

- `--ide-shadow-xs`: Subtle shadow
- `--ide-shadow-sm`: Small shadow
- `--ide-shadow-md`: Medium shadow
- `--ide-shadow-lg`: Large shadow
- `--ide-shadow-xl`: Extra large shadow

### Transitions

- `--ide-transition-fast`: 150ms
- `--ide-transition-base`: 200ms
- `--ide-transition-slow`: 300ms

### Z-Index (Layer System)

- `--ide-z-base`: 1
- `--ide-z-dropdown`: 100
- `--ide-z-sticky`: 200
- `--ide-z-modal`: 300
- `--ide-z-tooltip`: 400
- `--ide-z-notification`: 500

---

## Level 2: Light Mode Overrides

All design tokens automatically switch when `[data-theme='light']` is set.

**Example:**
```css
[data-theme='light'] .ide-container {
  --ide-bg-primary: #FFFFFF;
  --ide-text-primary: #171717;
  /* ... all other tokens */
}
```

---

## Level 3: Component Base Styles

### Buttons

**Base Button:**
```css
.ide-container button {
  font-family: var(--ide-font-sans);
  font-size: var(--ide-font-base);
  padding: var(--ide-space-2) var(--ide-space-4);
  border-radius: var(--ide-radius-md);
  /* ... */
}
```

**Primary Button:**
```css
.ide-container .ide-button-primary {
  background: var(--ide-accent-500);
  color: white;
}
```

### Inputs

```css
.ide-container input,
.ide-container textarea,
.ide-container select {
  font-family: var(--ide-font-sans);
  font-size: var(--ide-font-base);
  padding: var(--ide-space-2) var(--ide-space-3);
  border-radius: var(--ide-radius-md);
  border: 1px solid var(--ide-border);
  /* ... */
}
```

### Scrollbars

Unified scrollbar styling across all IDE components:
- Width: 8px
- Track: `--ide-bg-primary`
- Thumb: `--ide-surface-hover`
- Hover: `--ide-text-tertiary`

---

## Level 4: Layout Components

### Panel

```css
.ide-container .ide-panel {
  background: var(--ide-bg-secondary);
  border: 1px solid var(--ide-border);
  border-radius: var(--ide-radius-lg);
  padding: var(--ide-space-4);
  box-shadow: var(--ide-shadow-sm);
}
```

### Panel Header

```css
.ide-container .ide-panel-header {
  padding: var(--ide-space-3) var(--ide-space-4);
  border-bottom: 1px solid var(--ide-border);
  background: var(--ide-bg-tertiary);
  font-size: var(--ide-font-sm);
  font-weight: var(--ide-font-semibold);
  text-transform: uppercase;
}
```

### Panel Content

```css
.ide-container .ide-panel-content {
  padding: var(--ide-space-4);
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
```

### Card

```css
.ide-container .ide-card {
  background: var(--ide-surface);
  border: 1px solid var(--ide-border);
  border-radius: var(--ide-radius-lg);
  padding: var(--ide-space-4);
  box-shadow: var(--ide-shadow-xs);
}
```

---

## Level 5: Utility Classes

### Text Utilities

```css
.ide-text-xs, .ide-text-sm, .ide-text-base, .ide-text-md, .ide-text-lg, .ide-text-xl
.ide-text-primary, .ide-text-secondary, .ide-text-tertiary, .ide-text-disabled
.ide-text-bold, .ide-text-semibold, .ide-text-medium
```

### Spacing Utilities

```css
.ide-p-1, .ide-p-2, .ide-p-3, .ide-p-4, .ide-p-6
.ide-m-1, .ide-m-2, .ide-m-3, .ide-m-4, .ide-m-6
```

### Flex Utilities

```css
.ide-flex, .ide-flex-col, .ide-flex-row
.ide-items-center, .ide-justify-between
.ide-gap-2, .ide-gap-3, .ide-gap-4
```

### Border Utilities

```css
.ide-border, .ide-border-subtle, .ide-border-strong
.ide-rounded-sm, .ide-rounded-md, .ide-rounded-lg
```

### Shadow Utilities

```css
.ide-shadow-xs, .ide-shadow-sm, .ide-shadow-md, .ide-shadow-lg
```

---

## Usage Examples

### Using Design Tokens

```css
.myComponent {
  background: var(--ide-bg-secondary);
  color: var(--ide-text-primary);
  padding: var(--ide-space-4);
  border-radius: var(--ide-radius-md);
  border: 1px solid var(--ide-border);
}
```

### Using Utility Classes

```html
<div class="ide-panel">
  <div class="ide-panel-header ide-flex ide-items-center ide-justify-between">
    <h3 class="ide-text-lg ide-text-bold">Title</h3>
    <button class="ide-button-primary">Action</button>
  </div>
  <div class="ide-panel-content">
    <p class="ide-text-base ide-text-secondary">Content</p>
  </div>
</div>
```

---

## Component Integration

All IDE components should:

1. **Use design tokens** instead of hardcoded values
2. **Follow the hierarchy** (tokens → components → utilities)
3. **Support light mode** automatically via token overrides
4. **Use utility classes** for common patterns
5. **Maintain consistency** across all panels

---

## Benefits

✅ **Unified Design**: All components use the same design system
✅ **Easy Theming**: Change tokens, everything updates
✅ **Consistency**: No more style conflicts
✅ **Maintainability**: Single source of truth
✅ **User-Friendly**: Harmonized UI/UX across all functionality
✅ **Scalability**: Easy to add new components

---

## Migration Guide

### Before (Old Way)
```css
.myComponent {
  background: #2D2E30;
  color: #E8E8E8;
  padding: 16px;
  border-radius: 6px;
}
```

### After (New Way)
```css
.myComponent {
  background: var(--ide-bg-secondary);
  color: var(--ide-text-primary);
  padding: var(--ide-space-4);
  border-radius: var(--ide-radius-md);
}
```

---

**Status:** ✅ Complete design system implemented
**Next:** Migrate all IDE components to use the new system

