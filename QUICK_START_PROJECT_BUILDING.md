# Quick Start: Project Building in Resonant Chat

## Goal
Enable Resonant Chat to help build projects with minimal backend changes.

---

## Phase 1: Quick Wins (2-3 weeks)

### 1. Enhanced Code Generation UI (Week 1)

**What:** Make existing `/code/generate` API visible and usable in chat.

**Changes Needed:**

#### A. Add "Build Mode" Toggle
```typescript
// In ResonantChatPage.tsx
const [buildMode, setBuildMode] = useState(false);
```

#### B. Add Project Context Input
```typescript
// Allow user to describe project structure
const [projectContext, setProjectContext] = useState({
  type: 'react', // react, python, node, etc.
  existingFiles: [] as string[],
  dependencies: {} as Record<string, string>
});
```

#### C. Enhanced Code Generation Button
```typescript
// When user says "build a todo app", show:
// - File structure preview
// - Generate button for each file
// - Download as ZIP option
```

#### D. Multi-File Preview Component
```typescript
// New component: ProjectBuilder.tsx
interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

const ProjectBuilder = ({ files }: { files: ProjectFile[] }) => {
  // Show file tree
  // Show code preview
  // Allow download as ZIP
};
```

---

### 2. Project Context Enhancement (Week 2)

**What:** Improve code generation with project awareness.

#### A. Backend Enhancement (Minimal)
```python
# Enhance existing /code/generate endpoint
@app.post("/code/generate")
async def generate_code(request: CodeGenerationRequest):
    # Add project context parsing
    project_type = detect_project_type(request.context_files)
    dependencies = parse_dependencies(request.context_files)
    
    # Enhanced prompt with project context
    prompt = f"""
    Project Type: {project_type}
    Dependencies: {dependencies}
    Existing Files: {request.context_files}
    
    Generate: {request.description}
    """
    
    # Use existing LLM call
    code = await llm.generate(prompt)
    return {"code": code, "explanation": "...", "file_path": suggest_path(request)}
```

#### B. Frontend: Project Upload
```typescript
// Allow uploading project folder (zip or drag-drop)
const handleProjectUpload = async (files: File[]) => {
  // Extract file structure
  // Send to backend for context
  // Store in projectContext
};
```

---

### 3. File Download & Export (Week 3)

**What:** Let users download generated code as files.

#### A. ZIP Generation (Frontend)
```typescript
import JSZip from 'jszip';

const downloadProject = async (files: ProjectFile[]) => {
  const zip = new JSZip();
  
  files.forEach(file => {
    zip.file(file.path, file.content);
  });
  
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'project.zip';
  a.click();
};
```

#### B. Individual File Download
```typescript
const downloadFile = (file: ProjectFile) => {
  const blob = new Blob([file.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.path.split('/').pop() || 'file';
  a.click();
};
```

---

## Implementation Steps

### Step 1: Add Build Mode Toggle (Day 1)

**File:** `src/pages/ResonantChat/ResonantChatPage.tsx`

```typescript
// Add state
const [buildMode, setBuildMode] = useState(false);

// Add toggle button in input bar
<button 
  onClick={() => setBuildMode(!buildMode)}
  className={styles.buildModeToggle}
>
  {buildMode ? '💼 Build Mode' : '💬 Chat Mode'}
</button>
```

---

### Step 2: Create Project Builder Component (Day 2-3)

**New File:** `src/components/ResonantChat/ProjectBuilder.tsx`

```typescript
import React, { useState } from 'react';
import styles from './ProjectBuilder.module.css';
import JSZip from 'jszip';

interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

interface ProjectBuilderProps {
  files: ProjectFile[];
  onFileSelect?: (file: ProjectFile) => void;
}

export const ProjectBuilder: React.FC<ProjectBuilderProps> = ({ files, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    files.forEach(file => {
      zip.file(file.path, file.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project.zip';
    a.click();
  };

  return (
    <div className={styles.projectBuilder}>
      <div className={styles.fileTree}>
        <h3>Project Files</h3>
        {files.map((file, idx) => (
          <div
            key={idx}
            className={`${styles.fileItem} ${selectedFile?.path === file.path ? styles.selected : ''}`}
            onClick={() => {
              setSelectedFile(file);
              onFileSelect?.(file);
            }}
          >
            📄 {file.path}
          </div>
        ))}
        <button onClick={handleDownloadAll} className={styles.downloadButton}>
          📦 Download All as ZIP
        </button>
      </div>
      
      {selectedFile && (
        <div className={styles.codePreview}>
          <h3>{selectedFile.path}</h3>
          <pre><code>{selectedFile.content}</code></pre>
          <button onClick={() => {
            const blob = new Blob([selectedFile.content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = selectedFile.path.split('/').pop() || 'file';
            a.click();
          }}>
            💾 Download File
          </button>
        </div>
      )}
    </div>
  );
};
```

---

### Step 3: Enhance Code Generation (Day 4-5)

**File:** `src/pages/ResonantChat/ResonantChatPage.tsx`

```typescript
// Add function to detect project requests
const detectProjectRequest = (message: string): boolean => {
  const projectKeywords = [
    'build', 'create', 'generate', 'make', 'scaffold',
    'project', 'app', 'application', 'website'
  ];
  return projectKeywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
};

// Enhanced handleSend
const handleSend = async () => {
  // ... existing code ...
  
  // If build mode or project request detected
  if (buildMode || detectProjectRequest(input)) {
    // Use enhanced code generation
    const projectFiles = await generateProject({
      description: input,
      projectType: detectProjectType(input),
      context: projectContext
    });
    
    // Show project builder UI
    setGeneratedProject(projectFiles);
  }
};
```

---

### Step 4: Add Project Type Detection (Day 6-7)

**New File:** `src/utils/projectDetector.ts`

```typescript
export const detectProjectType = (description: string): string => {
  const lower = description.toLowerCase();
  
  if (lower.includes('react') || lower.includes('jsx') || lower.includes('tsx')) {
    return 'react';
  }
  if (lower.includes('python') || lower.includes('flask') || lower.includes('django')) {
    return 'python';
  }
  if (lower.includes('node') || lower.includes('express')) {
    return 'node';
  }
  if (lower.includes('next')) {
    return 'nextjs';
  }
  if (lower.includes('vue')) {
    return 'vue';
  }
  
  return 'generic';
};

export const getProjectStructure = (type: string): string[] => {
  const structures: Record<string, string[]> = {
    react: [
      'src/App.tsx',
      'src/index.tsx',
      'package.json',
      'tsconfig.json'
    ],
    python: [
      'main.py',
      'requirements.txt',
      'README.md'
    ],
    node: [
      'index.js',
      'package.json',
      'README.md'
    ]
  };
  
  return structures[type] || [];
};
```

---

### Step 5: Connect to Backend (Day 8-10)

**File:** `src/api/code.ts`

```typescript
// Add new function
export interface ProjectGenerationRequest {
  description: string;
  project_type?: string;
  files?: Array<{
    path: string;
    purpose: string;
  }>;
  context?: {
    existing_files?: string[];
    dependencies?: Record<string, string>;
  };
}

export interface ProjectGenerationResponse {
  files: Array<{
    path: string;
    content: string;
    language: string;
  }>;
  project_structure: any;
  setup_instructions: string;
}

export const generateProject = async (
  request: ProjectGenerationRequest
): Promise<ProjectGenerationResponse> => {
  try {
    // Try new endpoint first
    try {
      const response = await fastapiClient.post('/code/project/generate', request);
      return response.data;
    } catch (error: any) {
      // Fallback: generate files one by one
      if (error?.response?.status === 404) {
        const files = getProjectStructure(request.project_type || 'generic');
        const generatedFiles = await Promise.all(
          files.map(async (filePath) => {
            const response = await generateCode({
              description: `${request.description} - Create ${filePath}`,
              language: detectLanguage(filePath),
              file_path: filePath,
              context_files: request.context?.existing_files
            });
            return {
              path: filePath,
              content: response.code,
              language: detectLanguage(filePath)
            };
          })
        );
        
        return {
          files: generatedFiles,
          project_structure: { type: request.project_type },
          setup_instructions: `Run: npm install` // Basic instructions
        };
      }
      throw error;
    }
  } catch (error) {
    logger.error('Project generation error', error);
    throw error;
  }
};
```

---

## Example User Flow

### User: "Build a React todo app"

1. **System detects:** Project request → Build Mode
2. **System generates:**
   - `src/App.tsx` - Main component
   - `src/components/TodoList.tsx` - Todo list
   - `src/components/TodoItem.tsx` - Todo item
   - `package.json` - Dependencies
   - `README.md` - Instructions

3. **System shows:**
   - Project Builder UI with file tree
   - Code preview for each file
   - "Download as ZIP" button

4. **User clicks:** Download → Gets `todo-app.zip`

5. **User:** "Add filtering by status"

6. **System:**
   - Updates `TodoList.tsx`
   - Creates `FilterBar.tsx`
   - Updates `App.tsx`
   - Shows updated project

---

## Dependencies to Add

```json
{
  "dependencies": {
    "jszip": "^3.10.1"  // For ZIP generation
  }
}
```

---

## Next Steps After MVP

1. **Multi-file coordination** - Ensure imports match
2. **Dependency management** - Auto-update package.json
3. **Project templates** - Pre-built scaffolds
4. **File operations** - Create/edit/delete files
5. **Project upload** - Upload existing projects

---

## Success Criteria

- ✅ User can ask "build a todo app" and get files
- ✅ User can download generated project as ZIP
- ✅ User can preview code before downloading
- ✅ Works with existing `/code/generate` API
- ✅ No major backend changes needed

---

## Estimated Time

- **Week 1:** UI components (Project Builder, Build Mode toggle)
- **Week 2:** Backend integration & file generation
- **Week 3:** Testing & polish

**Total: 3 weeks for MVP**

