// ============== SNIPPET MANAGER ==============
// Code snippets library with AI-powered generation

import React, { memo, useState, useCallback } from 'react';
import styles from './SnippetManager.module.css';

interface Snippet {
  id: string;
  name: string;
  description?: string;
  code: string;
  language: string;
  tags: string[];
  prefix?: string;
  createdAt: Date;
  usageCount: number;
  isFavorite?: boolean;
}

interface SnippetCategory {
  id: string;
  name: string;
  icon: string;
  snippets: Snippet[];
}

interface SnippetManagerProps {
  snippets?: Snippet[];
  onInsert?: (code: string) => void;
  onSave?: (snippet: Snippet) => void;
  className?: string;
}

const defaultSnippets: Snippet[] = [
  { id: '1', name: 'React Component', description: 'Functional component with TypeScript', code: `interface Props {\n  // props\n}\n\nexport const Component: React.FC<Props> = ({ }) => {\n  return (\n    <div>\n      \n    </div>\n  );\n};`, language: 'tsx', tags: ['react', 'component'], prefix: 'rfc', createdAt: new Date(), usageCount: 45, isFavorite: true },
  { id: '2', name: 'useState Hook', description: 'React useState with TypeScript', code: `const [value, setValue] = useState<string>('');`, language: 'tsx', tags: ['react', 'hooks'], prefix: 'us', createdAt: new Date(), usageCount: 120 },
  { id: '3', name: 'useEffect Hook', description: 'React useEffect with cleanup', code: `useEffect(() => {\n  // effect\n  return () => {\n    // cleanup\n  };\n}, []);`, language: 'tsx', tags: ['react', 'hooks'], prefix: 'ue', createdAt: new Date(), usageCount: 98, isFavorite: true },
  { id: '4', name: 'Async Function', description: 'Async function with error handling', code: `async function fetchData() {\n  try {\n    const response = await fetch(url);\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n    throw error;\n  }\n}`, language: 'typescript', tags: ['async', 'fetch'], prefix: 'afn', createdAt: new Date(), usageCount: 67 },
  { id: '5', name: 'CSS Flexbox Center', description: 'Center content with flexbox', code: `.container {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}`, language: 'css', tags: ['css', 'flexbox'], prefix: 'flx', createdAt: new Date(), usageCount: 34 },
  { id: '6', name: 'Console Log', description: 'Debug console log', code: `console.log('🔍', { });`, language: 'javascript', tags: ['debug'], prefix: 'cl', createdAt: new Date(), usageCount: 200 },
];

const SnippetManagerComponent: React.FC<SnippetManagerProps> = ({
  snippets: initialSnippets = defaultSnippets,
  onInsert,
  onSave,
  className,
}) => {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newSnippet, setNewSnippet] = useState({
    name: '',
    description: '',
    code: '',
    language: 'typescript',
    tags: '',
    prefix: '',
  });

  const allTags = Array.from(new Set(snippets.flatMap(s => s.tags)));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const toggleFavorite = useCallback((snippetId: string) => {
    setSnippets(prev => prev.map(s =>
      s.id === snippetId ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  }, []);

  const deleteSnippet = useCallback((snippetId: string) => {
    setSnippets(prev => prev.filter(s => s.id !== snippetId));
    if (selectedSnippet?.id === snippetId) {
      setSelectedSnippet(null);
    }
  }, [selectedSnippet]);

  const insertSnippet = useCallback((snippet: Snippet) => {
    setSnippets(prev => prev.map(s =>
      s.id === snippet.id ? { ...s, usageCount: s.usageCount + 1 } : s
    ));
    onInsert?.(snippet.code);
  }, [onInsert]);

  const createSnippet = useCallback(() => {
    if (!newSnippet.name || !newSnippet.code) return;

    const snippet: Snippet = {
      id: `snippet-${Date.now()}`,
      name: newSnippet.name,
      description: newSnippet.description,
      code: newSnippet.code,
      language: newSnippet.language,
      tags: newSnippet.tags.split(',').map(t => t.trim()).filter(Boolean),
      prefix: newSnippet.prefix,
      createdAt: new Date(),
      usageCount: 0,
    };

    setSnippets(prev => [snippet, ...prev]);
    onSave?.(snippet);
    setNewSnippet({ name: '', description: '', code: '', language: 'typescript', tags: '', prefix: '' });
    setShowCreateModal(false);
  }, [newSnippet, onSave]);

  const generateWithAI = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const generatedCode = `// AI Generated: ${prompt}\nconst result = () => {\n  // Implementation here\n  return null;\n};`;
    
    setNewSnippet(prev => ({ ...prev, code: generatedCode }));
    setIsGenerating(false);
  }, []);

  const filteredSnippets = snippets
    .filter(s => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(query) ||
               s.description?.toLowerCase().includes(query) ||
               s.prefix?.includes(query) ||
               s.tags.some(t => t.includes(query));
      }
      if (selectedTags.size > 0) {
        return s.tags.some(t => selectedTags.has(t));
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return b.usageCount - a.usageCount;
    });

  const getLanguageIcon = (lang: string) => {
    switch (lang) {
      case 'tsx':
      case 'typescript': return '🔷';
      case 'jsx':
      case 'javascript': return '🟨';
      case 'css': return '🎨';
      case 'python': return '🐍';
      case 'html': return '📄';
      default: return '📝';
    }
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📚</span>
          <span>Snippet Manager</span>
          <span className={styles.count}>{snippets.length}</span>
        </div>
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          + New Snippet
        </button>
      </div>

      <div className={styles.search}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search snippets..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className={styles.tags}>
        {allTags.map(tag => (
          <button
            key={tag}
            className={`${styles.tag} ${selectedTags.has(tag) ? styles.active : ''}`}
            onClick={() => toggleTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.snippetList}>
          {filteredSnippets.map(snippet => (
            <div
              key={snippet.id}
              className={`${styles.snippetItem} ${selectedSnippet?.id === snippet.id ? styles.selected : ''}`}
              onClick={() => setSelectedSnippet(snippet)}
            >
              <div className={styles.snippetHeader}>
                <span className={styles.langIcon}>{getLanguageIcon(snippet.language)}</span>
                <div className={styles.snippetInfo}>
                  <span className={styles.snippetName}>{snippet.name}</span>
                  {snippet.prefix && <span className={styles.prefix}>{snippet.prefix}</span>}
                </div>
                <button
                  className={`${styles.favBtn} ${snippet.isFavorite ? styles.active : ''}`}
                  onClick={e => { e.stopPropagation(); toggleFavorite(snippet.id); }}
                >
                  {snippet.isFavorite ? '⭐' : '☆'}
                </button>
              </div>
              {snippet.description && (
                <p className={styles.snippetDesc}>{snippet.description}</p>
              )}
              <div className={styles.snippetMeta}>
                <span className={styles.usageCount}>Used {snippet.usageCount}x</span>
                <div className={styles.snippetTags}>
                  {snippet.tags.slice(0, 3).map(tag => (
                    <span key={tag} className={styles.tagBadge}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedSnippet && (
          <div className={styles.previewPanel}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>{selectedSnippet.name}</span>
              <div className={styles.previewActions}>
                <button className={styles.copyBtn} onClick={() => navigator.clipboard.writeText(selectedSnippet.code)}>
                  📋 Copy
                </button>
                <button className={styles.insertBtn} onClick={() => insertSnippet(selectedSnippet)}>
                  ⬇️ Insert
                </button>
                <button className={styles.deleteBtn} onClick={() => deleteSnippet(selectedSnippet.id)}>
                  🗑️
                </button>
              </div>
            </div>
            <pre className={styles.codePreview}>{selectedSnippet.code}</pre>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>Create Snippet</span>
              <button className={styles.closeBtn} onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    placeholder="Snippet name"
                    value={newSnippet.name}
                    onChange={e => setNewSnippet(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Prefix</label>
                  <input
                    type="text"
                    placeholder="e.g., rfc"
                    value={newSnippet.prefix}
                    onChange={e => setNewSnippet(prev => ({ ...prev, prefix: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Brief description"
                  value={newSnippet.description}
                  onChange={e => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Language</label>
                  <select
                    value={newSnippet.language}
                    onChange={e => setNewSnippet(prev => ({ ...prev, language: e.target.value }))}
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="tsx">TSX</option>
                    <option value="jsx">JSX</option>
                    <option value="css">CSS</option>
                    <option value="html">HTML</option>
                    <option value="python">Python</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="react, hooks"
                    value={newSnippet.tags}
                    onChange={e => setNewSnippet(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <div className={styles.codeHeader}>
                  <label>Code</label>
                  <button
                    className={styles.aiBtn}
                    onClick={() => generateWithAI(newSnippet.name || 'code snippet')}
                    disabled={isGenerating}
                  >
                    {isGenerating ? '⏳' : '✨'} Generate with AI
                  </button>
                </div>
                <textarea
                  placeholder="Enter your code snippet..."
                  value={newSnippet.code}
                  onChange={e => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.cancelBtn} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className={styles.saveBtn} onClick={createSnippet}>
                Save Snippet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const SnippetManager = memo(SnippetManagerComponent);
export default SnippetManager;
