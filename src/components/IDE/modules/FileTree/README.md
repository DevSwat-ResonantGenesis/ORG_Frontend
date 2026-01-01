# FileTree Module

**Status:** ✅ Complete  
**Created:** December 7, 2025

## 📋 Overview

The FileTree module provides a complete file explorer solution for the IDE, including:
- Hierarchical file tree visualization
- File and folder CRUD operations
- Drag and drop support
- Git status indicators
- Resizable panel interface

## 🗂️ Module Structure

```
modules/FileTree/
├── index.ts                    # Public API exports
├── FileTreePanel.tsx           # Main panel component
├── FileTreePanel.module.css    # Panel styles
├── fileTreeUtils.ts            # Pure utility functions
├── useFileOperations.ts        # File operations hook
└── README.md                   # This file
```

## 📦 Exports

### Components

#### `FileTreePanel`
Main component that wraps the file tree with a resizable panel.

```tsx
import { FileTreePanel } from './modules/FileTree';

<FileTreePanel
  files={files}
  expandedFolders={expandedFolders}
  activeFile={activeFile}
  width={240}
  onResize={setFileTreeWidth}
  onFileClick={handleFileClick}
  onToggleFolder={handleToggleFolder}
  onNewFile={handleNewFile}
  onNewFolder={handleNewFolder}
  onRename={handleRename}
  onDelete={handleDelete}
  projectId={projectId}
/>
```

### Utilities

#### `buildFileTree(fileList, gitStatusMap?)`
Builds a hierarchical tree structure from a flat list of file paths.

```ts
const tree = buildFileTree(
  [{ path: 'src/index.ts' }, { path: 'src/utils/helper.ts' }],
  gitStatusMap
);
```

#### `findNodeInTree(nodes, targetPath)`
Finds a specific node in the tree by path.

```ts
const node = findNodeInTree(files, 'src/index.ts');
```

#### `findFirstFile(nodes)`
Finds the first file in the tree (depth-first search).

```ts
const firstFile = findFirstFile(files);
```

#### `flattenFiles(nodes)`
Flattens the tree into a simple array.

```ts
const allFiles = flattenFiles(files);
```

#### `checkIfFolderInTree(nodes, folderPath)`
Checks if a path represents a folder.

```ts
const isFolder = checkIfFolderInTree(files, 'src/utils');
```

#### `sortFileTree(nodes)`
Sorts tree nodes (folders first, then alphabetically).

```ts
const sorted = sortFileTree(files);
```

#### `getParentPath(path)`
Gets the parent directory path.

```ts
const parent = getParentPath('src/utils/helper.ts'); // 'src/utils'
```

### Hooks

#### `useFileOperations(options)`
Hook for managing file operations.

```ts
const {
  loading,
  expandedFolders,
  toggleFolder,
  createFile,
  createFolder,
  renameFile,
  deleteFile,
  handleNewFile,
  handleNewFolder,
  handleRename,
  handleDelete,
} = useFileOperations({
  projectId,
  onSuccess: (msg) => toast.success(msg),
  onError: (msg) => toast.error(msg),
  onFilesChanged: loadProjectFiles,
});
```

## 🎯 Usage Example

### Basic Integration

```tsx
import { FileTreePanel, useFileOperations } from './modules/FileTree';

function MyIDE() {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [fileTreeWidth, setFileTreeWidth] = useState(240);

  const fileOps = useFileOperations({
    projectId: 'my-project',
    onSuccess: (msg) => console.log(msg),
    onError: (msg) => console.error(msg),
    onFilesChanged: async () => {
      // Reload files
      const newFiles = await loadProjectFiles();
      setFiles(newFiles);
    },
  });

  const handleFileClick = (path: string) => {
    setActiveFile(path);
    // Load file content...
  };

  return (
    <FileTreePanel
      files={files}
      expandedFolders={fileOps.expandedFolders}
      activeFile={activeFile}
      width={fileTreeWidth}
      onResize={setFileTreeWidth}
      onFileClick={handleFileClick}
      onToggleFolder={fileOps.toggleFolder}
      onNewFile={fileOps.handleNewFile}
      onNewFolder={fileOps.handleNewFolder}
      onRename={(path, newName) => fileOps.handleRename(path, files, newName)}
      onDelete={(path) => fileOps.handleDelete(path, files)}
      projectId="my-project"
      loading={fileOps.loading}
    />
  );
}
```

## 🔧 Integration with CursorIDELayout

To integrate this module into `CursorIDELayout.tsx`:

1. **Import the module:**
```tsx
import { FileTreePanel, useFileOperations, buildFileTree } from './modules/FileTree';
```

2. **Replace file tree state and operations:**
```tsx
// Replace individual state management with the hook
const fileOps = useFileOperations({
  projectId,
  onSuccess: success,
  onError: showError,
  onFilesChanged: loadProjectFiles,
});
```

3. **Replace the file tree rendering:**
```tsx
// Replace the existing ResizablePanel + CursorFileTree with:
<FileTreePanel
  files={files}
  expandedFolders={fileOps.expandedFolders}
  activeFile={activeTabId}
  width={fileTreeWidth}
  onResize={setFileTreeWidth}
  onFileClick={handleFileClick}
  onToggleFolder={fileOps.toggleFolder}
  onNewFile={fileOps.handleNewFile}
  onNewFolder={fileOps.handleNewFolder}
  onRename={(path, newName) => fileOps.handleRename(path, files, newName)}
  onDelete={(path) => fileOps.handleDelete(path, files)}
  projectId={projectId}
  loading={fileOps.loading}
/>
```

## 🎨 Features

### ✅ Implemented
- [x] File tree building from flat file list
- [x] Hierarchical tree visualization
- [x] File and folder creation
- [x] File and folder renaming
- [x] File and folder deletion
- [x] Drag and drop support
- [x] Context menu
- [x] Git status indicators
- [x] Resizable panel
- [x] Loading states
- [x] Folder expand/collapse
- [x] Active file highlighting
- [x] Auto-scroll to active file

### 🔮 Future Enhancements
- [ ] File search within tree
- [ ] Multi-select support
- [ ] Copy/paste operations
- [ ] Keyboard navigation
- [ ] Virtual scrolling for large trees
- [ ] Custom file icons
- [ ] File preview on hover

## 📊 Performance

- **Pure utility functions** for easy testing and optimization
- **Memoized operations** in the hook
- **Debounced folder expansion** to prevent excessive re-renders
- **Lazy loading** support for large file trees (future)

## 🧪 Testing

The module is designed for easy testing:

```ts
import { buildFileTree, findNodeInTree } from './modules/FileTree';

describe('FileTree Utils', () => {
  it('should build tree from flat list', () => {
    const files = [
      { path: 'src/index.ts' },
      { path: 'src/utils/helper.ts' },
    ];
    const tree = buildFileTree(files);
    expect(tree).toHaveLength(1);
    expect(tree[0].name).toBe('src');
  });
});
```

## 📝 Notes

- All file operations are async and return promises
- The hook manages loading states automatically
- File operations trigger the `onFilesChanged` callback
- Git status is optional and can be omitted
- The panel is fully controlled (no internal state)

## 🔗 Dependencies

- `react` - Core React library
- `../../CursorFileTree` - File tree visualization component
- `../../ResizablePanel` - Resizable panel wrapper
- `../../../../api/code` - Backend API for file operations
- `../../../../utils/logger` - Logging utility

## 📄 License

Part of the Resonant IDE project.
