# CSS Module Cleanup Plan

## Found 28 CSS Modules

### Main Layout Components (5)
1. ✅ CursorIDELayout.module.css - Main IDE layout
2. ✅ CursorSidebar.module.css - Left sidebar
3. ✅ CursorTabsBar.module.css - Tab bar
4. ✅ CursorEditorView.module.css - Editor view
5. ✅ CursorTerminalPanel.module.css - Terminal panel

### Panel Components (6)
6. ✅ CursorChatPanel.module.css - Chat panel
7. ✅ CursorFileTree.module.css - File tree
8. ✅ GitPanel.module.css - Git panel
9. ✅ ModelSelectorBar.module.css - Model selector
10. ✅ CommandPalette.module.css - Command palette
11. ✅ ResizablePanel.module.css - Resizable panels

### Advanced Modules (11)
12. ✅ RunButton.module.css
13. ✅ DownloadProjectButton.module.css
14. ✅ PatchModal.module.css
15. ✅ InlineComment.module.css
16. ✅ ASTRefactorButton.module.css
17. ✅ CollaborationPanel.module.css
18. ✅ CodeSearchPanel.module.css
19. ✅ GitHubPanel.module.css
20. ✅ DebuggerPanel.module.css
21. ✅ DiffViewer.module.css
22. ✅ InlineActions.module.css

### Other Components (6)
23. ✅ TerminalTabs.module.css
24. ✅ TopBar.module.css
25. ✅ RefactorDialog.module.css
26. ✅ IDELayout.module.css
27. ✅ FileContextMenu.module.css
28. ✅ ExecutionPanel.module.css

## Issues Found

### 1. Duplicates
- ✅ GitPanel.module.css - Duplicate `.refreshButton:hover` rules (FIXED)
- ✅ CursorIDELayout.module.css - Duplicate `.toolbarButton:hover` rules (FIXED)

### 2. Missing !important
- ✅ CursorFileTree.module.css - `.renameInput` needs !important (FIXED)
- ✅ GitPanel.module.css - Some rules missing !important

### 3. Inconsistent Colors
- All modules should use CSS variables consistently
- All should match Resonant Chat theme

### 4. Organization
- Each module should only contain styles for its component
- No global styles in module files
- Consistent naming conventions

## Cleanup Steps

1. ✅ Delete leftover CSS files
2. ✅ Fix duplicates in main modules
3. ⏳ Fix all button styles
4. ⏳ Fix all panel alignment
5. ⏳ Fix all colors
6. ⏳ Verify all modules are clean

