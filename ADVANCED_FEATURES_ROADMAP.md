# Advanced Features Roadmap: LSP, Code Execution, Git, Advanced Refactoring

## 🎯 Goal
Implement the remaining 4 major features to match Cursor's capabilities:
1. **LSP Integration** (Language Server Protocol)
2. **Code Execution** (Sandbox runner)
3. **Git Integration** (Version control)
4. **Advanced Refactoring** (Multi-file, dependency tracking)

---

## 1️⃣ LSP Integration (Language Server Protocol)

### What is LSP?
LSP provides:
- Real-time type checking
- Go to definition
- Find references
- Symbol navigation
- Code diagnostics
- Auto-completion with types

### Implementation Plan

#### Option A: Use Monaco Editor's Built-in LSP (Easiest)
**Monaco Editor already supports LSP!** We just need to connect it.

**Frontend:**
```typescript
// src/components/IDE/MonacoCodeEditor.tsx
import { editor } from 'monaco-editor';
import { MonacoLanguageClient } from 'monaco-languageclient';

// Configure LSP for TypeScript
const languageClient = new MonacoLanguageClient({
  name: 'TypeScript Language Client',
  clientOptions: {
    documentSelector: ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'],
    workspaceFolder: {
      uri: 'file:///workspace',
      name: 'workspace'
    }
  },
  connectionProvider: {
    get: async () => {
      // Connect to backend LSP server
      const response = await fetch('/api/lsp/connect');
      return response.json();
    }
  }
});
```

**Backend:**
```python
# backend/fastapi_app/services/lsp_service.py
from pygls.server import LanguageServer
from pygls.workspace import Workspace
import asyncio

class ResonantLanguageServer:
    def __init__(self):
        self.server = LanguageServer('resonant-lsp', 'v1.0')
        self.workspace = Workspace()
    
    async def initialize(self, params):
        # Initialize LSP server
        return {
            'capabilities': {
                'textDocumentSync': 1,
                'completionProvider': True,
                'definitionProvider': True,
                'referencesProvider': True,
                'hoverProvider': True,
                'diagnosticsProvider': True
            }
        }
```

**Dependencies:**
```bash
# Frontend
npm install monaco-languageclient vscode-languageserver-protocol

# Backend
pip install pygls python-lsp-server
```

**Estimated Time:** 2-3 weeks

---

#### Option B: Use Existing LSP Servers (Recommended)
Connect to existing LSP servers (TypeScript, Python, etc.)

**Backend:**
```python
# backend/fastapi_app/services/lsp_proxy.py
import subprocess
import json
from typing import Dict, Any

class LSPProxy:
    def __init__(self):
        self.servers = {
            'typescript': ['typescript-language-server', '--stdio'],
            'python': ['pylsp'],
            'javascript': ['typescript-language-server', '--stdio']
        }
    
    async def start_server(self, language: str, workspace_path: str):
        """Start LSP server for language"""
        if language not in self.servers:
            return None
        
        cmd = self.servers[language]
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            cwd=workspace_path
        )
        return process
    
    async def send_request(self, server, method: str, params: Dict[str, Any]):
        """Send LSP request"""
        request = {
            'jsonrpc': '2.0',
            'id': 1,
            'method': method,
            'params': params
        }
        server.stdin.write(json.dumps(request).encode())
        response = await server.stdout.readline()
        return json.loads(response)
```

**Frontend Integration:**
```typescript
// Connect Monaco to LSP via WebSocket
const lspClient = new MonacoLanguageClient({
  name: 'Resonant LSP Client',
  clientOptions: {
    documentSelector: ['typescript', 'python', 'javascript'],
  },
  connectionProvider: {
    get: async () => {
      const ws = new WebSocket('ws://localhost:8000/api/lsp/ws');
      return createConnection(ws);
    }
  }
});
```

**Estimated Time:** 3-4 weeks

---

## 2️⃣ Code Execution (Sandbox Runner)

### What We Need
- Safe code execution environment
- Error capture and parsing
- Self-correction loop
- Test runner integration

### Implementation Plan

#### Option A: Docker-Based Sandbox (Recommended)
**Backend:**
```python
# backend/fastapi_app/services/code_executor.py
import docker
import asyncio
from typing import Dict, Any
import tempfile
import os

class CodeExecutor:
    def __init__(self):
        self.client = docker.from_env()
        self.timeout = 30  # seconds
    
    async def execute_code(
        self,
        code: str,
        language: str,
        inputs: list = None
    ) -> Dict[str, Any]:
        """Execute code in Docker sandbox"""
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=f'.{self._get_extension(language)}') as f:
            f.write(code)
            temp_file = f.name
        
        try:
            # Run in Docker container
            container = self.client.containers.run(
                image=self._get_image(language),
                command=self._get_command(language, temp_file),
                volumes={os.path.dirname(temp_file): {'bind': '/workspace', 'mode': 'ro'}},
                remove=True,
                timeout=self.timeout,
                mem_limit='512m',
                cpu_period=100000,
                cpu_quota=50000,  # Limit CPU
                network_disabled=True,  # No network access
                detach=True
            )
            
            # Wait for completion
            result = container.wait(timeout=self.timeout)
            
            # Get output
            logs = container.logs().decode('utf-8')
            
            return {
                'success': result['StatusCode'] == 0,
                'output': logs,
                'error': None if result['StatusCode'] == 0 else logs,
                'exit_code': result['StatusCode']
            }
        except Exception as e:
            return {
                'success': False,
                'output': '',
                'error': str(e),
                'exit_code': -1
            }
        finally:
            os.unlink(temp_file)
    
    def _get_image(self, language: str) -> str:
        """Get Docker image for language"""
        images = {
            'python': 'python:3.11-slim',
            'javascript': 'node:18-slim',
            'typescript': 'node:18-slim',
            'java': 'openjdk:17-slim',
            'go': 'golang:1.21-alpine'
        }
        return images.get(language, 'python:3.11-slim')
    
    def _get_command(self, language: str, file_path: str) -> str:
        """Get execution command"""
        commands = {
            'python': f'python /workspace/{os.path.basename(file_path)}',
            'javascript': f'node /workspace/{os.path.basename(file_path)}',
            'typescript': f'ts-node /workspace/{os.path.basename(file_path)}',
        }
        return commands.get(language, f'python /workspace/{os.path.basename(file_path)}')
    
    def _get_extension(self, language: str) -> str:
        """Get file extension"""
        extensions = {
            'python': 'py',
            'javascript': 'js',
            'typescript': 'ts',
            'java': 'java',
            'go': 'go'
        }
        return extensions.get(language, 'py')
```

**API Endpoint:**
```python
# backend/fastapi_app/routers/code.py
@router.post("/execute")
async def execute_code(
    request: CodeExecutionRequest,
    identity: Identity = Depends(get_jwt_identity),
):
    """Execute code in sandbox"""
    executor = CodeExecutor()
    result = await executor.execute_code(
        code=request.code,
        language=request.language,
        inputs=request.inputs
    )
    return result
```

**Frontend:**
```typescript
// src/api/code.ts
export const executeCode = async (
  code: string,
  language: string,
  inputs?: any[]
): Promise<ExecutionResult> => {
  const response = await fastapiClient.post('/code/execute', {
    code,
    language,
    inputs
  });
  return response.data;
};
```

**Dependencies:**
```bash
# Backend
pip install docker
```

**Estimated Time:** 2-3 weeks

---

#### Option B: Cloud-Based Execution (Alternative)
Use services like:
- **Replit API** - Code execution API
- **Judge0** - Online code execution
- **CodeSandbox API** - Sandbox execution

**Pros:** No Docker setup needed
**Cons:** External dependency, costs

**Estimated Time:** 1-2 weeks

---

## 3️⃣ Git Integration

### What We Need
- Git operations (commit, branch, merge)
- Auto-commit messages
- PR summaries
- Git status tracking

### Implementation Plan

**Backend:**
```python
# backend/fastapi_app/services/git_service.py
import subprocess
import os
from typing import Dict, List, Any
from pathlib import Path

class GitService:
    def __init__(self, workspace_path: str):
        self.workspace_path = Path(workspace_path)
        self.git_path = self.workspace_path / '.git'
    
    async def init_repo(self) -> Dict[str, Any]:
        """Initialize git repository"""
        result = subprocess.run(
            ['git', 'init'],
            cwd=self.workspace_path,
            capture_output=True,
            text=True
        )
        return {
            'success': result.returncode == 0,
            'message': result.stdout
        }
    
    async def get_status(self) -> Dict[str, Any]:
        """Get git status"""
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=self.workspace_path,
            capture_output=True,
            text=True
        )
        
        files = []
        for line in result.stdout.strip().split('\n'):
            if line:
                status = line[:2]
                file_path = line[3:]
                files.append({
                    'status': status,
                    'file': file_path
                })
        
        return {
            'files': files,
            'has_changes': len(files) > 0
        }
    
    async def add_files(self, files: List[str] = None) -> Dict[str, Any]:
        """Stage files"""
        cmd = ['git', 'add']
        if files:
            cmd.extend(files)
        else:
            cmd.append('.')
        
        result = subprocess.run(
            cmd,
            cwd=self.workspace_path,
            capture_output=True,
            text=True
        )
        return {
            'success': result.returncode == 0,
            'message': result.stdout
        }
    
    async def commit(
        self,
        message: str = None,
        auto_generate: bool = True
    ) -> Dict[str, Any]:
        """Commit changes"""
        if auto_generate and not message:
            # Generate commit message using AI
            status = await self.get_status()
            changes_summary = self._summarize_changes(status['files'])
            
            # Use AI to generate commit message
            from ..services.multi_ai_routing import MultiAIRouter
            ai_router = MultiAIRouter()
            
            prompt = f"Generate a concise git commit message for these changes:\n{changes_summary}"
            ai_response = ai_router.route_query(
                message=prompt,
                context=None,
                preferred_provider="openai"
            )
            message = ai_response['response'].strip()
        
        result = subprocess.run(
            ['git', 'commit', '-m', message],
            cwd=self.workspace_path,
            capture_output=True,
            text=True
        )
        
        return {
            'success': result.returncode == 0,
            'message': message,
            'output': result.stdout
        }
    
    async def create_branch(self, branch_name: str) -> Dict[str, Any]:
        """Create new branch"""
        result = subprocess.run(
            ['git', 'checkout', '-b', branch_name],
            cwd=self.workspace_path,
            capture_output=True,
            text=True
        )
        return {
            'success': result.returncode == 0,
            'output': result.stdout
        }
    
    async def get_branches(self) -> List[str]:
        """Get list of branches"""
        result = subprocess.run(
            ['git', 'branch', '--list'],
            cwd=self.workspace_path,
            capture_output=True,
            text=True
        )
        branches = [b.strip().replace('*', '').strip() for b in result.stdout.split('\n') if b.strip()]
        return branches
    
    def _summarize_changes(self, files: List[Dict[str, str]]) -> str:
        """Summarize file changes"""
        summary = []
        for file in files:
            status = file['status']
            file_path = file['file']
            if status.startswith('A'):
                summary.append(f"Added: {file_path}")
            elif status.startswith('M'):
                summary.append(f"Modified: {file_path}")
            elif status.startswith('D'):
                summary.append(f"Deleted: {file_path}")
        return '\n'.join(summary)
```

**API Endpoints:**
```python
# backend/fastapi_app/routers/git.py
@router.post("/git/init")
async def init_git_repo(
    project_id: str,
    identity: Identity = Depends(get_jwt_identity),
):
    """Initialize git repository"""
    git_service = GitService(project_path)
    return await git_service.init_repo()

@router.get("/git/status")
async def get_git_status(
    project_id: str,
    identity: Identity = Depends(get_jwt_identity),
):
    """Get git status"""
    git_service = GitService(project_path)
    return await git_service.get_status()

@router.post("/git/commit")
async def commit_changes(
    project_id: str,
    message: str = None,
    auto_generate: bool = True,
    identity: Identity = Depends(get_jwt_identity),
):
    """Commit changes"""
    git_service = GitService(project_path)
    return await git_service.commit(message, auto_generate)
```

**Frontend:**
```typescript
// src/components/IDE/GitPanel.tsx
export const GitPanel: React.FC = () => {
  const [status, setStatus] = useState(null);
  
  const handleCommit = async () => {
    const result = await commitChanges(projectId, null, true);
    // Auto-generated commit message
  };
  
  return (
    <div>
      <button onClick={handleCommit}>Commit</button>
      <GitStatus status={status} />
    </div>
  );
};
```

**Dependencies:**
- Git must be installed on server
- No additional Python packages needed (uses subprocess)

**Estimated Time:** 2-3 weeks

---

## 4️⃣ Advanced Refactoring

### What We Need
- Multi-file synchronized refactoring
- Dependency tracking
- Import path updates
- Type consistency checks

### Implementation Plan

**Backend:**
```python
# backend/fastapi_app/services/advanced_refactor.py
from typing import Dict, List, Any
from ..services.code_parser import CodeParserService
from ..services.code_context import CodeContextService
from ..services.multi_ai_routing import MultiAIRouter

class AdvancedRefactorService:
    def __init__(self):
        self.parser = CodeParserService()
        self.context = CodeContextService()
        self.ai_router = MultiAIRouter()
    
    async def refactor_multi_file(
        self,
        refactor_request: str,
        project_files: List[Dict[str, str]],
        session: Session,
        org_id: UUID
    ) -> Dict[str, Any]:
        """Refactor multiple files with dependency tracking"""
        
        # 1. Parse all files to understand structure
        parsed_files = []
        for file in project_files:
            parsed = self.parser.parse_code(
                code=file['content'],
                language=file['language'],
                file_path=file['path']
            )
            parsed_files.append({
                'path': file['path'],
                'parsed': parsed,
                'content': file['content']
            })
        
        # 2. Build dependency graph
        dependency_graph = self._build_dependency_graph(parsed_files)
        
        # 3. Find affected files
        affected_files = self._find_affected_files(
            refactor_request,
            parsed_files,
            dependency_graph
        )
        
        # 4. Generate refactored code for each file
        refactored_files = []
        for file in affected_files:
            # Get context from related files
            related_files = self._get_related_files(
                file['path'],
                dependency_graph
            )
            
            # Generate refactored code
            refactored = await self._generate_refactored_code(
                file,
                refactor_request,
                related_files
            )
            
            refactored_files.append({
                'path': file['path'],
                'original': file['content'],
                'refactored': refactored,
                'diff': self._generate_diff(file['content'], refactored)
            })
        
        # 5. Validate refactoring
        validation = await self._validate_refactoring(
            refactored_files,
            dependency_graph
        )
        
        return {
            'files': refactored_files,
            'validation': validation,
            'dependency_changes': self._analyze_dependency_changes(
                parsed_files,
                refactored_files
            )
        }
    
    def _build_dependency_graph(self, parsed_files: List[Dict]) -> Dict:
        """Build dependency graph from parsed files"""
        graph = {}
        for file in parsed_files:
            imports = file['parsed'].get('imports', [])
            graph[file['path']] = {
                'imports': imports,
                'exports': file['parsed'].get('exports', []),
                'dependencies': []
            }
        
        # Resolve dependencies
        for file_path, file_data in graph.items():
            for imp in file_data['imports']:
                # Find file that exports this
                for other_path, other_data in graph.items():
                    if imp in other_data['exports']:
                        file_data['dependencies'].append(other_path)
        
        return graph
    
    def _find_affected_files(
        self,
        refactor_request: str,
        parsed_files: List[Dict],
        dependency_graph: Dict
    ) -> List[Dict]:
        """Find files affected by refactoring"""
        # Use AI to determine which files need changes
        affected = []
        
        # Simple heuristic: if refactoring mentions a symbol,
        # find all files that use it
        for file in parsed_files:
            if self._file_matches_refactor(file, refactor_request):
                affected.append(file)
                # Also add dependent files
                deps = dependency_graph.get(file['path'], {}).get('dependencies', [])
                for dep_path in deps:
                    dep_file = next((f for f in parsed_files if f['path'] == dep_path), None)
                    if dep_file and dep_file not in affected:
                        affected.append(dep_file)
        
        return affected
    
    async def _generate_refactored_code(
        self,
        file: Dict,
        refactor_request: str,
        related_files: List[Dict]
    ) -> str:
        """Generate refactored code using AI"""
        context = f"Refactor request: {refactor_request}\n\n"
        context += f"Current file ({file['path']}):\n{file['content']}\n\n"
        
        if related_files:
            context += "Related files:\n"
            for rf in related_files:
                context += f"{rf['path']}:\n{rf['content'][:500]}\n\n"
        
        prompt = f"{context}\n\nGenerate refactored code that maintains compatibility with related files."
        
        ai_response = self.ai_router.route_query(
            message=prompt,
            context=None,
            preferred_provider="openai"
        )
        
        return ai_response['response']
    
    async def _validate_refactoring(
        self,
        refactored_files: List[Dict],
        dependency_graph: Dict
    ) -> Dict[str, Any]:
        """Validate refactoring maintains dependencies"""
        issues = []
        
        for file in refactored_files:
            # Check if imports are still valid
            # Check if exports are still available
            # Check type consistency
            pass
        
        return {
            'valid': len(issues) == 0,
            'issues': issues
        }
```

**API Endpoint:**
```python
@router.post("/code/refactor/advanced")
async def advanced_refactor(
    request: AdvancedRefactorRequest,
    identity: Identity = Depends(get_jwt_identity),
    session: Session = Depends(get_session),
):
    """Advanced multi-file refactoring"""
    refactor_service = AdvancedRefactorService()
    result = await refactor_service.refactor_multi_file(
        refactor_request=request.refactor_request,
        project_files=request.files,
        session=session,
        org_id=identity.org_id
    )
    return result
```

**Frontend:**
```typescript
// src/components/IDE/RefactorDialog.tsx
export const RefactorDialog: React.FC = () => {
  const handleAdvancedRefactor = async (request: string) => {
    const result = await advancedRefactor({
      refactor_request: request,
      files: openFiles
    });
    
    // Show diff for each file
    result.files.forEach(file => {
      showDiff(file.path, file.diff);
    });
  };
};
```

**Estimated Time:** 3-4 weeks

---

## 📊 Implementation Priority

### Phase 1: Quick Wins (4-6 weeks)
1. **Git Integration** (2-3 weeks) - Easiest, high value
2. **Code Execution** (2-3 weeks) - High value, moderate complexity

### Phase 2: Advanced Features (6-8 weeks)
3. **LSP Integration** (3-4 weeks) - Complex but high value
4. **Advanced Refactoring** (3-4 weeks) - Most complex

---

## 🎯 Total Estimated Time

**All 4 features: 10-14 weeks (2.5-3.5 months)**

---

## ✅ Can We Do It?

**YES! All features are feasible:**

1. ✅ **LSP Integration** - Monaco supports it, just need to connect
2. ✅ **Code Execution** - Docker sandbox is standard approach
3. ✅ **Git Integration** - Python subprocess, straightforward
4. ✅ **Advanced Refactoring** - Complex but doable with existing services

**All features can be built on top of existing infrastructure!** 🚀

---

## 🚀 Next Steps

1. **Start with Git Integration** (easiest, high value)
2. **Add Code Execution** (high value)
3. **Implement LSP** (complex but powerful)
4. **Build Advanced Refactoring** (most complex)

**Ready to start?** Let me know which feature you want to tackle first! 🎯

