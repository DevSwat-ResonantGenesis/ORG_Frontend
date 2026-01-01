# Project Building Implementation Plan
## Leveraging Existing Code Features + Hash Sphere Memory

---

## ✅ What We Already Have

### Backend (Fully Implemented)
1. **Code Router** (`/code/*`)
   - ✅ `/code/complete` - Code completion
   - ✅ `/code/generate` - Single file generation
   - ✅ `/code/refactor` - Code refactoring
   - ✅ `/code/index` - Index codebase
   - ✅ `/code/search` - Hash Sphere resonance search
   - ✅ `/code/search/ml` - ML embedding search

2. **Code Services**
   - ✅ `CodeContextService` - File context, related files, code memories
   - ✅ `CodeIndexerService` - Index files with Hash Sphere hashing
   - ✅ `CodeParserService` - AST parsing (Python, TypeScript/JS)

3. **Hash Sphere Integration**
   - ✅ Code chunks stored with `hash_sphere_hash`
   - ✅ Resonance matching for code search
   - ✅ Memory anchors for code patterns
   - ✅ Infinite memory via Hash Sphere

4. **Database Models**
   - ✅ `CodeFile` - Indexed files
   - ✅ `CodeChunk` - Code chunks with hashes & embeddings
   - ✅ `CodeDependency` - File dependencies

---

## 🚀 What We Need to Add

### Phase 1: Multi-File Project Generation (Week 1-2)

#### Backend: New Endpoint
**File:** `/Applications/ResonantGraphAIV0.1/backend/fastapi_app/routers/code.py`

```python
@router.post("/project/generate", response_model=ProjectGenerationResponse)
def generate_project(
    request: ProjectGenerationRequest,
    identity: Identity = Depends(get_jwt_identity),
    session: Session = Depends(get_session),
):
    """
    Generate a complete project with multiple files.
    Uses Hash Sphere to find similar project patterns.
    """
    # 1. Search Hash Sphere for similar projects
    similar_projects = code_context_service.search_codebase(
        session=session,
        query=request.description,
        org_id=identity.org_id,
        limit=5
    )
    
    # 2. Get project structure from similar patterns
    project_structure = _infer_project_structure(
        request.description,
        request.project_type,
        similar_projects
    )
    
    # 3. Generate files one by one with context
    generated_files = []
    for file_spec in project_structure["files"]:
        # Get related files context
        related_context = _get_related_context(
            session, file_spec, generated_files, identity.org_id
        )
        
        # Generate code with Hash Sphere memory
        code_response = generate_code(
            CodeGenerationRequest(
                description=f"{request.description} - {file_spec['purpose']}",
                language=file_spec["language"],
                context_files=related_context
            ),
            identity,
            session
        )
        
        generated_files.append({
            "path": file_spec["path"],
            "content": code_response.code,
            "language": file_spec["language"],
            "explanation": code_response.explanation
        })
        
        # Index generated file immediately for future reference
        code_indexer_service.index_file(
            session=session,
            file_path=file_spec["path"],
            content=code_response.code,
            language=file_spec["language"],
            org_id=identity.org_id,
            user_id=identity.user_id
        )
    
    # 4. Create Hash Sphere anchors for the project
    project_hash = hasher.hash_text(request.description)
    _create_project_anchors(session, project_hash, generated_files, identity)
    
    return ProjectGenerationResponse(
        files=generated_files,
        project_structure=project_structure,
        setup_instructions=_generate_setup_instructions(project_structure)
    )
```

#### Request/Response Models
```python
class ProjectGenerationRequest(BaseModel):
    description: str = Field(..., description="Project description")
    project_type: Optional[str] = Field(None, description="react, python, node, etc.")
    files: Optional[List[Dict]] = Field(None, description="Optional file specifications")
    context: Optional[Dict] = Field(None, description="Existing project context")

class ProjectGenerationResponse(BaseModel):
    files: List[Dict] = Field(..., description="Generated files")
    project_structure: Dict = Field(..., description="Project structure")
    setup_instructions: str = Field(..., description="Setup instructions")
    anchors: List[str] = Field(default_factory=list, description="Hash Sphere anchors")
```

---

### Phase 2: Frontend Integration (Week 2-3)

#### A. Update Frontend API Client
**File:** `src/api/code.ts`

```typescript
export interface ProjectGenerationRequest {
  description: string;
  project_type?: string;
  files?: Array<{
    path: string;
    purpose: string;
    language: string;
  }>;
  context?: {
    existing_files?: string[];
    project_structure?: any;
  };
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
  explanation: string;
}

export interface ProjectGenerationResponse {
  files: ProjectFile[];
  project_structure: any;
  setup_instructions: string;
  anchors: string[];
}

export const generateProject = async (
  request: ProjectGenerationRequest
): Promise<ProjectGenerationResponse> => {
  try {
    const response = await fastapiClient.post('/code/project/generate', request);
    return response.data;
  } catch (error) {
    logger.error('Project generation error', error);
    throw error;
  }
};
```

#### B. Add Project Builder Component
**New File:** `src/components/ResonantChat/ProjectBuilder.tsx`

```typescript
import React, { useState } from 'react';
import JSZip from 'jszip';
import { generateProject, type ProjectFile } from '@/api/code';
import styles from './ProjectBuilder.module.css';

interface ProjectBuilderProps {
  description: string;
  projectType?: string;
  onClose?: () => void;
}

export const ProjectBuilder: React.FC<ProjectBuilderProps> = ({
  description,
  projectType,
  onClose
}) => {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await generateProject({
        description,
        project_type: projectType
      });
      setFiles(response.files);
    } catch (error) {
      console.error('Failed to generate project', error);
    } finally {
      setLoading(false);
    }
  };

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
      {/* File tree, code preview, download buttons */}
    </div>
  );
};
```

#### C. Integrate with Resonant Chat
**File:** `src/pages/ResonantChat/ResonantChatPage.tsx`

```typescript
// Add state
const [buildMode, setBuildMode] = useState(false);
const [generatedProject, setGeneratedProject] = useState<ProjectFile[] | null>(null);

// Detect project requests
const detectProjectRequest = (message: string): boolean => {
  const keywords = ['build', 'create', 'generate', 'make', 'scaffold', 'project', 'app'];
  return keywords.some(k => message.toLowerCase().includes(k));
};

// In handleSend
if (buildMode || detectProjectRequest(input)) {
  // Show project builder UI
  // Generate project using /code/project/generate
}
```

---

### Phase 3: Hash Sphere Memory Enhancement (Week 3-4)

#### A. Store Project Patterns in Hash Sphere
**File:** `backend/fastapi_app/services/code_context.py`

```python
def create_project_anchors(
    self,
    session: Session,
    project_hash: str,
    files: List[Dict],
    identity: Identity
):
    """Create Hash Sphere anchors for project patterns."""
    from ..models.governance.resonant_chat import MemoryAnchor
    
    # Create anchor for entire project
    project_anchor = MemoryAnchor(
        user_id=identity.user_id,
        org_id=identity.org_id,
        anchor_hash=project_hash,
        anchor_type="project",
        anchor_content=json.dumps({
            "files": [f["path"] for f in files],
            "structure": "..." 
        }),
        importance_score=1.0
    )
    session.add(project_anchor)
    
    # Create anchors for each file pattern
    for file in files:
        file_hash = self.hasher.hash_text(file["content"])
        file_anchor = MemoryAnchor(
            user_id=identity.user_id,
            org_id=identity.org_id,
            anchor_hash=file_hash,
            anchor_type="code_pattern",
            anchor_content=file["content"][:500],
            importance_score=0.8
        )
        session.add(file_anchor)
    
    session.commit()
```

#### B. Retrieve Similar Projects from Memory
```python
def get_similar_projects(
    self,
    session: Session,
    query: str,
    org_id: UUID,
    limit: int = 5
) -> List[Dict]:
    """Get similar projects from Hash Sphere memory."""
    query_hash = self.hasher.hash_text(query)
    
    # Get project anchors
    project_anchors = session.exec(
        select(MemoryAnchor).where(
            MemoryAnchor.org_id == org_id,
            MemoryAnchor.anchor_type == "project"
        )
    ).all()
    
    # Calculate resonance
    scored = []
    for anchor in project_anchors:
        resonance = self.hasher.calculate_resonance(query_hash, anchor.anchor_hash)
        scored.append((anchor, resonance))
    
    scored.sort(key=lambda x: x[1], reverse=True)
    
    # Return top similar projects
    results = []
    for anchor, resonance in scored[:limit]:
        project_data = json.loads(anchor.anchor_content)
        results.append({
            "hash": anchor.anchor_hash,
            "files": project_data.get("files", []),
            "resonance_score": resonance
        })
    
    return results
```

---

### Phase 4: Project Context Understanding (Week 4-5)

#### A. Project Scanner Service
**New File:** `backend/fastapi_app/services/project_scanner.py`

```python
class ProjectScannerService:
    """Scans and understands project structure."""
    
    def scan_project(
        self,
        files: List[Dict[str, str]]  # [{"path": str, "content": str}]
    ) -> Dict:
        """Scan project and extract structure."""
        # Detect project type
        project_type = self._detect_project_type(files)
        
        # Extract dependencies
        dependencies = self._extract_dependencies(files, project_type)
        
        # Build dependency graph
        dependency_graph = self._build_dependency_graph(files)
        
        return {
            "type": project_type,
            "dependencies": dependencies,
            "structure": dependency_graph,
            "entry_points": self._find_entry_points(files, project_type)
        }
    
    def _detect_project_type(self, files: List[Dict]) -> str:
        """Detect project type from files."""
        # Check for package.json -> Node.js/React
        # Check for requirements.txt -> Python
        # Check for Cargo.toml -> Rust
        # etc.
        pass
```

#### B. Project Context Endpoint
```python
@router.post("/project/scan")
def scan_project(
    request: ProjectScanRequest,
    identity: Identity = Depends(get_jwt_identity),
    session: Session = Depends(get_session),
):
    """Scan uploaded project and extract context."""
    scanner = ProjectScannerService()
    structure = scanner.scan_project(request.files)
    
    # Index all files
    for file_data in request.files:
        code_indexer_service.index_file(
            session=session,
            file_path=file_data["path"],
            content=file_data["content"],
            language=_detect_language(file_data["path"]),
            org_id=identity.org_id,
            user_id=identity.user_id
        )
    
    return {"structure": structure}
```

---

## 🎯 Implementation Steps

### Step 1: Backend - Multi-File Generation (Day 1-3)
1. Add `ProjectGenerationRequest` and `ProjectGenerationResponse` models
2. Implement `/code/project/generate` endpoint
3. Add Hash Sphere project anchor creation
4. Test with simple projects

### Step 2: Frontend - API Integration (Day 4-5)
1. Update `src/api/code.ts` with project generation
2. Create `ProjectBuilder.tsx` component
3. Add file tree and code preview
4. Add ZIP download functionality

### Step 3: Frontend - Chat Integration (Day 6-7)
1. Add "Build Mode" toggle
2. Detect project requests in chat
3. Show project builder UI
4. Connect to backend endpoint

### Step 4: Hash Sphere Memory (Day 8-10)
1. Enhance `CodeContextService` with project anchors
2. Add similar project retrieval
3. Use project patterns in generation
4. Test memory retrieval

### Step 5: Project Scanner (Day 11-14)
1. Create `ProjectScannerService`
2. Add `/code/project/scan` endpoint
3. Integrate with frontend file upload
4. Test with real projects

---

## 🔥 Key Features

### 1. Infinite Memory via Hash Sphere
- Every generated project stored as Hash Sphere anchor
- Every code pattern stored with resonance hash
- Future requests find similar patterns automatically
- No limit on memory - grows infinitely

### 2. Context-Aware Generation
- Uses existing code files for context
- Understands project structure
- Maintains consistency across files
- Resolves dependencies automatically

### 3. Multi-Provider AI
- Uses existing `MultiAIRouter`
- Can route to best provider for code generation
- Falls back gracefully

### 4. Real-Time Indexing
- Generated files indexed immediately
- Available for future searches
- Hash Sphere hashes calculated on the fly

---

## 📊 Success Metrics

- ✅ Can generate complete React app from scratch
- ✅ Can add features to existing projects
- ✅ Hash Sphere finds similar projects
- ✅ Generated code is syntactically correct
- ✅ Files work together (imports resolved)
- ✅ User can download as ZIP

---

## 🚀 Next Steps

1. **Start with Backend** - Add `/code/project/generate` endpoint
2. **Test with Simple Projects** - "Build a todo app"
3. **Add Frontend UI** - Project builder component
4. **Enhance Memory** - Hash Sphere project anchors
5. **Iterate** - Add more project types and features

---

## 💡 Key Advantages Over Cursor

1. **Hash Sphere Memory** - Infinite, resonance-based memory
2. **Multi-AI Routing** - Best provider for each task
3. **Web-Based** - No IDE installation needed
4. **Project Patterns** - Learn from all generated projects
5. **Evidence & Resonance** - Track code quality

---

Let's start building! 🚀

