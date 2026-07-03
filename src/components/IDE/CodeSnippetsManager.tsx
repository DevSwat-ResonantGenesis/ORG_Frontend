// ============== CODE SNIPPETS MANAGER ==============
// Advanced snippets management with AI-powered suggestions

import React, { memo, useState, useCallback, useEffect } from 'react';
import styles from './CodeSnippetsManager.module.css';

interface Snippet {
  id: string;
  name: string;
  description: string;
  code: string;
  language: string;
  tags: string[];
  isBuiltIn: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

interface CodeSnippetsManagerProps {
  language?: string;
  onInsertSnippet?: (code: string) => void;
  className?: string;
}

const BUILT_IN_SNIPPETS: Snippet[] = [
  {
    id: 'react-component',
    name: 'React Functional Component',
    description: 'Create a new React functional component with TypeScript',
    code: `import React, { memo } from 'react';

interface \${1:ComponentName}Props {
  \${2:prop}: \${3:string};
}

const \${1:ComponentName}: React.FC<\${1:ComponentName}Props> = ({ \${2:prop} }) => {
  return (
    <div>
      {\${2:prop}}
    </div>
  );
};

export default memo(\${1:ComponentName});`,
    language: 'typescriptreact',
    tags: ['react', 'component', 'typescript'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'react-hook',
    name: 'React Custom Hook',
    description: 'Create a custom React hook',
    code: `import { useState, useCallback, useEffect } from 'react';

export function use\${1:HookName}(\${2:initialValue}: \${3:any}) {
  const [state, setState] = useState(\${2:initialValue});

  const update = useCallback((value: \${3:any}) => {
    setState(value);
  }, []);

  useEffect(() => {
    // Effect logic here
    return () => {
      // Cleanup
    };
  }, []);

  return { state, update };
}`,
    language: 'typescript',
    tags: ['react', 'hook', 'custom'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'async-function',
    name: 'Async Function with Error Handling',
    description: 'Async function template with try-catch',
    code: `async function \${1:functionName}(\${2:params}): Promise<\${3:ReturnType}> {
  try {
    const response = await \${4:apiCall};
    return response;
  } catch (error) {
    console.error('\${1:functionName} error:', error);
    throw error;
  }
}`,
    language: 'typescript',
    tags: ['async', 'error-handling', 'function'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'api-endpoint',
    name: 'API Fetch Function',
    description: 'Reusable API fetch function with types',
    code: `interface \${1:ResponseType} {
  \${2:data}: \${3:any};
}

export async function fetch\${4:Resource}(): Promise<\${1:ResponseType}> {
  const response = await fetch('\${5:/api/endpoint}', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${localStorage.getItem('auth_token')}\`,
    },
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return response.json();
}`,
    language: 'typescript',
    tags: ['api', 'fetch', 'http'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'zustand-store',
    name: 'Zustand Store',
    description: 'Create a Zustand store with TypeScript',
    code: `import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface \${1:StoreName}State {
  \${2:data}: \${3:any}[];
  loading: boolean;
  error: string | null;
  
  // Actions
  set\${2:Data}: (data: \${3:any}[]) => void;
  add\${2:Data}: (item: \${3:any}) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  \${2:data}: [],
  loading: false,
  error: null,
};

export const use\${1:StoreName}Store = create<\${1:StoreName}State>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        set\${2:Data}: (data) => set({ \${2:data}: data }),
        add\${2:Data}: (item) => set((state) => ({ 
          \${2:data}: [...state.\${2:data}, item] 
        })),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        reset: () => set(initialState),
      }),
      { name: '\${1:storeName}-storage' }
    ),
    { name: '\${1:StoreName}Store' }
  )
);`,
    language: 'typescript',
    tags: ['zustand', 'store', 'state'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'css-module',
    name: 'CSS Module Template',
    description: 'Standard CSS module with common patterns',
    code: `.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.content {
  flex: 1;
  overflow-y: auto;
}

.button {
  padding: 8px 16px;
  background: var(--primary);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: opacity 0.2s;
}

.button:hover {
  opacity: 0.9;
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}`,
    language: 'css',
    tags: ['css', 'module', 'styles'],
    isBuiltIn: true,
    usageCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const STORAGE_KEY = 'ide-custom-snippets';

const CodeSnippetsManagerComponent: React.FC<CodeSnippetsManagerProps> = ({
  language,
  onInsertSnippet,
  className,
}) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [expandedSnippet, setExpandedSnippet] = useState<string | null>(null);

  // Load snippets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const customSnippets: Snippet[] = saved ? JSON.parse(saved) : [];
    setSnippets([...BUILT_IN_SNIPPETS, ...customSnippets]);
  }, []);

  // Save custom snippets to localStorage
  const saveCustomSnippets = useCallback((allSnippets: Snippet[]) => {
    const customOnly = allSnippets.filter(s => !s.isBuiltIn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customOnly));
  }, []);

  // Get all unique tags
  const allTags = Array.from(new Set(snippets.flatMap(s => s.tags)));

  // Filter snippets
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = !searchQuery || 
      snippet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      snippet.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.some(tag => snippet.tags.includes(tag));
    
    const matchesLanguage = !language || 
      snippet.language === language ||
      snippet.language === 'typescript' && language === 'typescriptreact';
    
    return matchesSearch && matchesTags && matchesLanguage;
  });

  const handleInsert = useCallback((snippet: Snippet) => {
    // Track usage
    const updated = snippets.map(s => 
      s.id === snippet.id ? { ...s, usageCount: s.usageCount + 1 } : s
    );
    setSnippets(updated);
    saveCustomSnippets(updated);
    
    onInsertSnippet?.(snippet.code);
  }, [snippets, onInsertSnippet, saveCustomSnippets]);

  const handleSaveSnippet = useCallback((snippetData: Partial<Snippet>) => {
    if (editingSnippet) {
      // Update existing
      const updated = snippets.map(s =>
        s.id === editingSnippet.id
          ? { ...s, ...snippetData, updatedAt: new Date() }
          : s
      );
      setSnippets(updated);
      saveCustomSnippets(updated);
    } else {
      // Create new
      const newSnippet: Snippet = {
        id: `custom-${Date.now()}`,
        name: snippetData.name || 'Untitled Snippet',
        description: snippetData.description || '',
        code: snippetData.code || '',
        language: snippetData.language || 'typescript',
        tags: snippetData.tags || [],
        isBuiltIn: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const updated = [...snippets, newSnippet];
      setSnippets(updated);
      saveCustomSnippets(updated);
    }
    setIsCreating(false);
    setEditingSnippet(null);
  }, [snippets, editingSnippet, saveCustomSnippets]);

  const handleDeleteSnippet = useCallback((id: string) => {
    const updated = snippets.filter(s => s.id !== id);
    setSnippets(updated);
    saveCustomSnippets(updated);
  }, [snippets, saveCustomSnippets]);

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>📦</span>
          Code Snippets
        </h3>
        <button
          className={styles.createBtn}
          onClick={() => setIsCreating(true)}
        >
          + New
        </button>
      </div>

      <div className={styles.search}>
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.tags}>
        {allTags.slice(0, 10).map(tag => (
          <button
            key={tag}
            className={`${styles.tag} ${selectedTags.includes(tag) ? styles.active : ''}`}
            onClick={() => setSelectedTags(prev =>
              prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className={styles.snippetsList}>
        {filteredSnippets.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📝</span>
            <p>No snippets found</p>
          </div>
        ) : (
          filteredSnippets.map(snippet => (
            <div
              key={snippet.id}
              className={`${styles.snippetCard} ${expandedSnippet === snippet.id ? styles.expanded : ''}`}
            >
              <div
                className={styles.snippetHeader}
                onClick={() => setExpandedSnippet(
                  expandedSnippet === snippet.id ? null : snippet.id
                )}
              >
                <div className={styles.snippetInfo}>
                  <span className={styles.snippetName}>{snippet.name}</span>
                  {snippet.isBuiltIn && (
                    <span className={styles.builtInBadge}>Built-in</span>
                  )}
                </div>
                <div className={styles.snippetMeta}>
                  <span className={styles.language}>{snippet.language}</span>
                  <span className={styles.usage}>{snippet.usageCount} uses</span>
                </div>
              </div>

              {expandedSnippet === snippet.id && (
                <div className={styles.snippetContent}>
                  <p className={styles.snippetDesc}>{snippet.description}</p>
                  <pre className={styles.codePreview}>
                    <code>{snippet.code}</code>
                  </pre>
                  <div className={styles.snippetTags}>
                    {snippet.tags.map(tag => (
                      <span key={tag} className={styles.snippetTag}>{tag}</span>
                    ))}
                  </div>
                  <div className={styles.snippetActions}>
                    <button
                      className={styles.insertBtn}
                      onClick={() => handleInsert(snippet)}
                    >
                      Insert
                    </button>
                    {!snippet.isBuiltIn && (
                      <>
                        <button
                          className={styles.editBtn}
                          onClick={() => setEditingSnippet(snippet)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteSnippet(snippet.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreating || editingSnippet) && (
        <SnippetEditor
          snippet={editingSnippet}
          onSave={handleSaveSnippet}
          onCancel={() => {
            setIsCreating(false);
            setEditingSnippet(null);
          }}
        />
      )}
    </div>
  );
};

// ============== SNIPPET EDITOR ==============

interface SnippetEditorProps {
  snippet: Snippet | null;
  onSave: (data: Partial<Snippet>) => void;
  onCancel: () => void;
}

const SnippetEditor: React.FC<SnippetEditorProps> = memo(({
  snippet,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(snippet?.name || '');
  const [description, setDescription] = useState(snippet?.description || '');
  const [code, setCode] = useState(snippet?.code || '');
  const [language, setLanguage] = useState(snippet?.language || 'typescript');
  const [tagsInput, setTagsInput] = useState(snippet?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      description,
      code,
      language,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className={styles.editorOverlay}>
      <form className={styles.editorModal} onSubmit={handleSubmit}>
        <h3>{snippet ? 'Edit Snippet' : 'Create Snippet'}</h3>
        
        <div className={styles.formGroup}>
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Snippet name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Brief description"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Language</label>
          <select value={language} onChange={e => setLanguage(e.target.value)}>
            <option value="typescript">TypeScript</option>
            <option value="typescriptreact">TypeScript React</option>
            <option value="javascript">JavaScript</option>
            <option value="css">CSS</option>
            <option value="html">HTML</option>
            <option value="json">JSON</option>
            <option value="python">Python</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Tags (comma separated)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={e => setTagsInput(e.target.value)}
            placeholder="react, component, hook"
          />
        </div>

        <div className={styles.formGroup}>
          <label>Code</label>
          <textarea
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="// Your snippet code here"
            rows={10}
            required
          />
        </div>

        <div className={styles.editorActions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className={styles.saveBtn}>
            Save Snippet
          </button>
        </div>
      </form>
    </div>
  );
});

SnippetEditor.displayName = 'SnippetEditor';

export const CodeSnippetsManager = memo(CodeSnippetsManagerComponent);
export default CodeSnippetsManager;
