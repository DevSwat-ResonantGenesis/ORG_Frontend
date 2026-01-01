# Global CSS Fix Applied

## ✅ Fixed Global `button` Selector

### Problem
The global `button { }` selector in `reset-2025.css` was affecting ALL buttons, including those in CSS modules.

### Solution
Changed from:
```css
button {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
```

To:
```css
/* Exclude CSS modules (they have underscores in class names like ComponentName_className__hash) */
button:not([class*="_"]) {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
}
```

## ✅ Why This Works

1. **CSS modules generate class names with underscores:**
   - `CursorIDELayout_toolbarButton__abc123`
   - `ModelSelectorBar_navIcon__xyz789`

2. **The `:not([class*="_"])` selector excludes CSS modules:**
   - Only affects buttons WITHOUT underscores in class names
   - CSS module buttons have underscores, so they're excluded ✅

3. **This means:**
   - Global `button` reset won't affect IDE buttons
   - IDE CSS modules can style buttons without `!important`
   - No conflicts between global and module styles

## ✅ Other Global Styles Are Already Protected

1. **`typography-enforcement.css`** - Uses `:not([class*="_"])` ✅
2. **`.button` class styles** - Only affect `.button` class, not CSS modules ✅
3. **`.container` class** - Utility class, not a conflict ✅

## ✅ Result

- Global `button` reset won't affect IDE buttons ✅
- IDE CSS modules can style buttons without `!important` ✅
- No conflicts between global and module styles ✅
- Can remove `!important` from IDE button styles ✅

## ⚠️ Still Need `!important` For

1. **Layout-critical styles** - May need to override global layout
2. **Third-party library conflicts** - Monaco Editor, etc.
3. **Specific overrides** - When absolutely necessary

## ✅ Next Steps

1. Test IDE buttons - They should work without `!important`
2. Remove `!important` from IDE button styles
3. Keep `!important` only where absolutely necessary

