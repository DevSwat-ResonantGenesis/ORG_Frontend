# Missing IDE Buttons for Resonant Chat IDE

## ✅ Currently Available Buttons (in Toolbar)

1. **Resonant IDE Logo** - Branding
2. **Home** - Navigation to home page
3. **Dashboard** - Navigation to dashboard
4. **Resonant Chat** - Navigation to Resonant Chat page
5. **Run** (Module A) - Run project/execute code
6. **Download** (Module D) - Download project as ZIP
7. **Code Search** - AI-powered code search (Next-Gen Module)
8. **Collaboration** - Real-time collaboration panel (Next-Gen Module)
9. **GitHub Sync** - GitHub integration panel (Next-Gen Module)
10. **Debugger** - Debug panel (Next-Gen Module)
11. **AI/Close Chat** - Toggle Resonant Chat panel (right side)

## ❌ Missing Critical IDE Buttons

### High Priority (Essential IDE Features)

1. **Command Palette Button** ⚠️
   - Currently: Only accessible via Cmd+K / Cmd+P keyboard shortcuts
   - Should have: Toolbar button to open command palette
   - Icon: Command/Search icon
   - Tooltip: "Command Palette (Cmd+K)"

2. **Git Panel Toggle** ⚠️
   - Currently: GitPanel exists but no toolbar button to toggle it
   - Should have: Button to show/hide Git panel
   - Icon: Git branch icon
   - Tooltip: "Git Panel"

3. **Save File** ⚠️
   - Currently: Save functionality exists (handleSave) but no visible button
   - Should have: Save button (disabled when no unsaved changes)
   - Icon: Save/floppy disk icon
   - Tooltip: "Save File (Cmd+S)"
   - Keyboard shortcut: Cmd+S (should be implemented)

4. **Upload Project** ⚠️
   - Currently: Upload functionality exists (handleUploadProject) but no visible button
   - Should have: Upload project button (file input trigger)
   - Icon: Upload/cloud icon
   - Tooltip: "Upload Project ZIP"

5. **File Explorer Toggle** ⚠️
   - Currently: File tree always visible
   - Should have: Button to show/hide file explorer sidebar
   - Icon: Folder/explorer icon
   - Tooltip: "Toggle File Explorer"

6. **Terminal Toggle** ⚠️
   - Currently: Terminal always visible at bottom
   - Should have: Button to show/hide terminal panel
   - Icon: Terminal/console icon
   - Tooltip: "Toggle Terminal"

### Medium Priority (Useful IDE Features)

7. **AST Refactor Button** ⚠️
   - Currently: ASTRefactorButton component exists but not in toolbar
   - Should have: Button to trigger AST-based refactoring
   - Icon: Refactor/wand icon
   - Tooltip: "AST Refactor"

8. **Settings/Preferences** ⚠️
   - Currently: Removed from toolbar
   - Should have: Settings button (theme, editor preferences, etc.)
   - Icon: Gear/settings icon
   - Tooltip: "Settings"

9. **Theme Toggle** ⚠️
   - Currently: Theme system exists but no toggle button
   - Should have: Button to toggle dark/light theme
   - Icon: Sun/moon icon
   - Tooltip: "Toggle Theme"

10. **Find/Replace** ⚠️
    - Currently: Monaco Editor has built-in find, but no toolbar button
    - Should have: Button to open find/replace dialog
    - Icon: Search/magnifying glass icon
    - Tooltip: "Find/Replace (Cmd+F)"

### Low Priority (Nice to Have)

11. **Undo/Redo** - Editor operations (Monaco has built-in, but toolbar buttons are nice)
12. **Split Editor** - Split view for side-by-side editing
13. **Minimap Toggle** - Show/hide editor minimap
14. **Word Wrap Toggle** - Toggle word wrap in editor
15. **Format Document** - Auto-format code
16. **Go to Line** - Jump to specific line number

## 📊 Summary

- **Total Current Buttons**: 11
- **Missing High Priority**: 6 buttons
- **Missing Medium Priority**: 4 buttons
- **Missing Low Priority**: 6 buttons
- **Total Missing**: 16 buttons

## 🎯 Recommended Implementation Order

1. **Command Palette Button** - Critical for discoverability
2. **Git Panel Toggle** - Essential for version control
3. **Save File** - Basic file operation
4. **Upload Project** - Project management
5. **File Explorer Toggle** - UI flexibility
6. **Terminal Toggle** - UI flexibility
7. **AST Refactor** - Advanced feature
8. **Settings** - User preferences
9. **Theme Toggle** - User preference
10. **Find/Replace** - Editor enhancement

