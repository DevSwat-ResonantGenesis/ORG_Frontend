# Editor Module

**Status:** ✅ Complete  
**Created:** December 7, 2025

## 📋 Overview

The Editor module provides a complete code editing solution for the IDE, including:
- Monaco editor integration
- Tab management for multiple open files
- Content editing with debouncing
- Save operations
- Unsaved changes tracking
- Empty state UI

## 🗂️ Module Structure

```
modules/Editor/
├── index.ts                    # Public API exports
├── EditorPanel.tsx             # Main editor component
├── EditorPanel.module.css      # Editor styles
├── useEditorState.ts           # Editor state hook
└── README.md                   # This file
```

## 📦 Exports

### Components

#### `EditorPanel`
Main editor component with tabs and Monaco integration.

```tsx
import { EditorPanel } from './modules/Editor';

<EditorPanel
  tabs={editorState.tabs}
  activeTabId={editorState.activeTabId}
  activeFileContent={editorState.getActiveFileContent()}
  activeFilePath={editorState.activeTabId}
  onTabClick={editorState.handleTabClick}
  onTabClose={editorState.handleTabClose}
  onEditorChange={editorState.handleEditorChange}
  onEditorMount={setMonacoEditor}
  onSave={editorState.saveFile}
  loading={editorState.loading}
/>
```

### Hooks

#### `useEditorState(options)`
Hook for managing editor state.

```tsx
const editorState = useEditorState({
  projectId,
  onSuccess: (msg) => toast.success(msg),
  onError: (msg) => toast.error(msg),
  onFilesChanged: loadProjectFiles,
});
```

## 🎯 Usage Example

### Basic Integration

```tsx
import { EditorPanel, useEditorState } from './modules/Editor';
import { readProjectFile } from '../../api/code';

function MyIDE() {
  const [monacoEditor, setMonacoEditor] = useState(null);
  
  const editorState = useEditorState({
    projectId: 'my-project',
    onSuccess: (msg) => console.log(msg),
    onError: (msg) => console.error(msg),
    onFilesChanged: async () => {
      // Reload files
      await loadProjectFiles();
    },
  });

  const handleFileClick = async (path: string) => {
    // Check if already open
    if (editorState.openFiles.has(path)) {
      editorState.setActiveFile(path);
      return;
    }

    // Load file content
    const response = await readProjectFile(path);
    if (response.exists) {
      editorState.openFile(path, response.content);
    }
  };

  return (
    <EditorPanel
      tabs={editorState.tabs}
      activeTabId={editorState.activeTabId}
      activeFileContent={editorState.getActiveFileContent()}
      activeFilePath={editorState.activeTabId}
      onTabClick={editorState.handleTabClick}
      onTabClose={editorState.handleTabClose}
      onEditorChange={editorState.handleEditorChange}
      onEditorMount={setMonacoEditor}
      onSave={() => editorState.saveFile()}
      loading={editorState.loading}
    />
  );
}
```

## 📋 API Reference

### EditorPanel Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `tabs` | `Tab[]` | ✅ | Array of open tabs |
| `activeTabId` | `string \| null` | ✅ | Currently active tab ID |
| `activeFileContent` | `string` | ✅ | Content of active file |
| `activeFilePath` | `string \| null` | ✅ | Path of active file |
| `onTabClick` | `(tabId: string) => void` | ✅ | Tab click handler |
| `onTabClose` | `(tabId: string, e: React.MouseEvent) => void` | ✅ | Tab close handler |
| `onEditorChange` | `(value: string \| undefined) => void` | ✅ | Editor content change handler |
| `onEditorMount` | `(editor: any) => void` | ❌ | Monaco editor mount callback |
| `onSave` | `() => void` | ❌ | Save handler |
| `onFindReplace` | `() => void` | ❌ | Find/replace handler |
| `onUndo` | `() => void` | ❌ | Undo handler |
| `onRedo` | `() => void` | ❌ | Redo handler |
| `onFormatDocument` | `() => void` | ❌ | Format handler |
| `onGoToLine` | `() => void` | ❌ | Go to line handler |
| `loading` | `boolean` | ❌ | Show loading overlay |
| `showMinimap` | `boolean` | ❌ | Show minimap |
| `wordWrap` | `boolean` | ❌ | Enable word wrap |
| `emptyStateMessage` | `string` | ❌ | Custom empty state message |

### useEditorState Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `projectId` | `string` | ❌ | Current project ID |
| `onSuccess` | `(msg: string) => void` | ❌ | Success callback |
| `onError` | `(msg: string) => void` | ❌ | Error callback |
| `onFilesChanged` | `() => Promise<void>` | ❌ | Files changed callback |

### useEditorState Returns

| Property | Type | Description |
|----------|------|-------------|
| `openFiles` | `Map<string, string>` | Map of open file paths to content |
| `tabs` | `Tab[]` | Array of open tabs |
| `activeTabId` | `string \| null` | Currently active tab ID |
| `unsavedChanges` | `Set<string>` | Set of file paths with unsaved changes |
| `loading` | `boolean` | Loading state |
| `openFile` | `(path: string, content: string) => void` | Open a file |
| `closeFile` | `(path: string) => void` | Close a file |
| `setActiveFile` | `(path: string) => void` | Set active file |
| `updateFileContent` | `(path: string, content: string) => void` | Update file content |
| `saveFile` | `(path?: string) => Promise<void>` | Save file |
| `saveAllFiles` | `() => Promise<void>` | Save all files |
| `handleTabClick` | `(tabId: string) => void` | Handle tab click |
| `handleTabClose` | `(tabId: string, e: React.MouseEvent) => void` | Handle tab close |
| `handleEditorChange` | `(value: string \| undefined) => void` | Handle editor change (debounced) |
| `getActiveFileContent` | `() => string` | Get active file content |
| `getFileContent` | `(path: string) => string \| undefined` | Get file content |
| `isFileDirty` | `(path: string) => boolean` | Check if file has unsaved changes |
| `hasUnsavedChanges` | `() => boolean` | Check if any files have unsaved changes |

## 🎨 Features

### ✅ Implemented
- [x] Monaco editor integration
- [x] Tab management
- [x] Multiple file support
- [x] Content editing with debouncing (150ms)
- [x] Save operations (single file & all files)
- [x] Unsaved changes tracking
- [x] Empty state UI
- [x] Loading overlay
- [x] Language detection from file extension
- [x] Tab dirty indicators

### 🔮 Future Enhancements
- [ ] Split editor view
- [ ] Diff view
- [ ] Code folding preferences
- [ ] Custom keybindings
- [ ] Editor themes
- [ ] IntelliSense configuration
- [ ] Bracket pair colorization

## 📊 Performance

- **Debounced updates** (150ms) to prevent excessive re-renders
- **Memoized handlers** for optimal performance
- **Efficient state management** with Map and Set
- **Lazy loading** of file content

## 🔧 Integration with CursorIDELayout

To integrate this module:

1. **Import the module:**
```tsx
import { EditorPanel, useEditorState } from './modules/Editor';
```

2. **Set up the hook:**
```tsx
const editorState = useEditorState({
  projectId,
  onSuccess: success,
  onError: showError,
  onFilesChanged: loadProjectFiles,
});
```

3. **Replace editor rendering:**
```tsx
<EditorPanel
  tabs={editorState.tabs}
  activeTabId={editorState.activeTabId}
  activeFileContent={editorState.getActiveFileContent()}
  activeFilePath={editorState.activeTabId}
  onTabClick={editorState.handleTabClick}
  onTabClose={editorState.handleTabClose}
  onEditorChange={editorState.handleEditorChange}
  onEditorMount={setMonacoEditor}
  onSave={() => editorState.saveFile()}
  loading={editorState.loading}
  showMinimap={showMinimap}
  wordWrap={wordWrap}
/>
```

4. **Update file click handler:**
```tsx
const handleFileClick = async (filePath: string) => {
  if (editorState.openFiles.has(filePath)) {
    editorState.setActiveFile(filePath);
    return;
  }

  setLoading(true);
  try {
    const response = await readProjectFile(filePath);
    if (response.exists) {
      editorState.openFile(filePath, response.content);
    }
  } catch (error) {
    logger.error('Failed to read file', error);
  } finally {
    setLoading(false);
  }
};
```

## 📝 Notes

- The hook automatically manages tab state based on open files
- Debouncing prevents excessive state updates during typing
- Save operations are async and handle errors gracefully
- The component shows an empty state when no files are open
- Language detection supports 20+ file types

## 🔗 Dependencies

- `react` - Core React library
- `../../CursorEditorView` - Monaco editor wrapper
- `../../CursorTabsBar` - Tabs bar component
- `../../../../api/code` - Backend API for file operations
- `../../../../utils/logger` - Logging utility

## 📄 License

Part of the Resonant IDE project.
