# 🔌 Plugin Manager Buttons - Location Guide

## Where to Find Plugin Buttons

### 1. **Main Plugin Manager Button** (Top Toolbar)

**Location**: Top toolbar (hidden by default)

**How to Access**:
1. Click the **☰ Burger Menu** button (top-left, before the logo)
2. This reveals all toolbar buttons
3. Look for the **⭐ Star Icon** button (Plugin Manager button)
4. Click it to open the Plugin Manager panel

**Visual Path**:
```
☰ Burger Menu → Toolbar Buttons → ⭐ Plugin Button
```

**Code Location**: `CursorIDELayout.tsx` line 1217-1230

---

### 2. **Plugin Manager Panel Buttons**

Once you click the Plugin Manager button, a panel opens on the right side with:

#### **Header Buttons**:
- **"+ Install Plugin"** button
  - Location: Top-right of Plugin Manager panel
  - Function: Opens file picker to install a plugin ZIP file

#### **Per-Plugin Buttons** (for each installed plugin):
- **"Enable" / "Disable"** button
  - Location: Right side of each plugin card
  - Function: Toggles plugin on/off
  - Color: Green when enabled, gray when disabled

- **"Uninstall"** button
  - Location: Below Enable/Disable button
  - Function: Removes plugin completely
  - Color: Red border

---

## Quick Access Guide

### Step-by-Step:

1. **Open Toolbar**:
   - Click **☰** (burger menu) in top-left
   - Toolbar buttons appear

2. **Open Plugin Manager**:
   - Click **⭐** (star icon) button
   - Plugin Manager panel opens on right side

3. **Install Plugin**:
   - Click **"+ Install Plugin"** in panel header
   - Select ZIP file
   - Plugin installs automatically

4. **Manage Plugins**:
   - Each plugin shows:
     - **Enable/Disable** toggle
     - **Uninstall** button

---

## Button Locations Summary

| Button | Location | Visibility |
|--------|---------|------------|
| **☰ Burger Menu** | Top-left toolbar | Always visible |
| **⭐ Plugin Button** | Top toolbar | Hidden (show via burger menu) |
| **+ Install Plugin** | Plugin Manager panel header | When panel is open |
| **Enable/Disable** | Each plugin card | When panel is open |
| **Uninstall** | Each plugin card | When panel is open |

---

## Troubleshooting

### "I don't see the Plugin button"
- ✅ Click the **☰ burger menu** button first
- ✅ The toolbar buttons are hidden by default
- ✅ Hover over the top toolbar area

### "Plugin Manager panel doesn't open"
- ✅ Check browser console for errors
- ✅ Ensure you clicked the star icon button
- ✅ Panel opens on the right side

### "Install button doesn't work"
- ✅ Click "+ Install Plugin" in the panel header
- ✅ Select a valid ZIP file with `plugin.json`
- ✅ Check browser console for errors

---

## Visual Layout

```
┌─────────────────────────────────────────────────────┐
│ ☰ [Logo] [AI/Chat] [Run] [Download] [Workspace]   │
│    [Deploy] ⭐ [Code Search] [Collaboration] [Debug] │
└─────────────────────────────────────────────────────┘
         ↑
    Click ☰ to show toolbar buttons
         ↓
    Click ⭐ to open Plugin Manager
         ↓
┌─────────────────────────────────────────────────────┐
│                    Editor Area                       │
│                                                       │
│                                                       │
└─────────────────────────────────────────────────────┘
                                    ┌──────────────────┐
                                    │ Plugin Manager   │
                                    │                  │
                                    │ [+ Install]      │
                                    │                  │
                                    │ Plugin 1         │
                                    │ [Enable] [Uninst]│
                                    │                  │
                                    │ Plugin 2         │
                                    │ [Disable][Uninst]│
                                    └──────────────────┘
```

---

**All plugin buttons are accessible!** 🎉

