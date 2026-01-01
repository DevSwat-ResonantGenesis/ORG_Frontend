# CSS Module Best Practices

## ✅ CSS Modules ARE Scoped

Vite automatically scopes CSS modules. Each `.module.css` file generates unique class names:
- `CursorIDELayout_toolbarButton__abc123`
- `ModelSelectorBar_navIcon__xyz789`

## ✅ Each Module Should Only Style Its Own Component

- `CursorIDELayout.module.css` → ONLY styles `CursorIDELayout` component
- `ModelSelectorBar.module.css` → ONLY styles `ModelSelectorBar` component
- `ProviderSelector.module.css` → ONLY styles `ProviderSelector` component

## ⚠️ When to Use `!important`

Only use `!important` when:
1. Overriding global styles that can't be avoided
2. Critical layout fixes that must override
3. Third-party library styles that conflict

**DO NOT** use `!important` for:
- Styles that are already scoped by CSS modules
- Normal component styling
- Styles that don't conflict

## ✅ How CSS Modules Work

1. Each component imports its own `styles` object
2. `styles.toolbarButton` is unique to that component
3. Vite hashes the class name automatically
4. No conflicts between modules

## ✅ Verification

To verify CSS module scoping:
1. Open browser DevTools
2. Inspect an element
3. Check the class name - should be like: `CursorIDELayout_toolbarButton__abc123`
4. This is UNIQUE and won't conflict with other modules

## ✅ Best Practices

1. **Use specific class names** - `.toolbarButton` not `.button`
2. **Don't use `!important` unless necessary** - Let CSS module scoping work
3. **Each module styles only its component** - No cross-module styling
4. **Use CSS variables** - For consistent theming
5. **Keep modules focused** - One component, one module

