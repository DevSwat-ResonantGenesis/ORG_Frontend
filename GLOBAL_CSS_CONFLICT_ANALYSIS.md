# Global CSS Conflict Analysis

## 🔍 Checking for Global Styles That Might Conflict with IDE CSS Modules

### CSS Modules Are Scoped
- CSS modules generate unique class names
- `CursorIDELayout_toolbarButton__abc123` is UNIQUE
- Global CSS should NOT affect CSS modules

### BUT Global CSS CAN Affect CSS Modules If:
1. Global CSS uses generic element selectors (`button`, `div`, etc.)
2. Global CSS uses attribute selectors that match CSS module classes
3. Global CSS uses `!important` with high specificity

## 🔍 What I'm Checking

1. **Global button styles** - `button { }` or `.button { }`
2. **Global container styles** - `.container { }`
3. **Global panel styles** - `.panel { }`
4. **Global toolbar styles** - `.toolbar { }`
5. **Attribute selectors** - `[class*="button"]` that might match CSS modules

## ⚠️ Potential Conflicts Found

### 1. Global `.button` Styles
- `src/theme/modules/typography.css` - Has `.button` styles
- `src/theme/modules/components.css` - Has `.button` styles
- `src/theme/modules/utilities.css` - Has `.button-group` styles

### 2. Global `.container` Styles
- `src/theme/modules/components.css` - Has `.container` styles
- `src/theme/modules/utilities.css` - Has `.container` styles

### 3. Global Element Selectors
- `button { }` - Might affect all buttons, including in CSS modules

## ✅ Solution

1. **Check if global styles use generic selectors**
2. **Verify CSS module scoping is working**
3. **Remove unnecessary `!important` from CSS modules**
4. **Only use `!important` when fighting global styles**

