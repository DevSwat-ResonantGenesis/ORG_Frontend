// ============== SEARCH PANEL ==============
// Global search with file filtering and replace functionality

import React, { memo, useState, useCallback, useRef, useEffect } from 'react';
import styles from './SearchPanel.module.css';

interface SearchResult {
  id: string;
  file: string;
  line: number;
  column: number;
  preview: string;
  matchStart: number;
  matchEnd: number;
}

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onResultClick?: (result: SearchResult) => void;
  onSearch?: (query: string, options: SearchOptions) => Promise<SearchResult[]>;
  onReplace?: (query: string, replacement: string, options: SearchOptions) => Promise<number>;
  className?: string;
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  includePattern: string;
  excludePattern: string;
}

const SearchPanelComponent: React.FC<SearchPanelProps> = ({
  isOpen,
  onClose,
  onResultClick,
  onSearch,
  onReplace,
  className,
}) => {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [options, setOptions] = useState<SearchOptions>({
    caseSensitive: false,
    wholeWord: false,
    regex: false,
    includePattern: '',
    excludePattern: 'node_modules,dist,.git',
  });
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.length >= 2) {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setResults([]);
    }
    
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [query, options]);

  const performSearch = useCallback(async () => {
    if (!onSearch || query.length < 2) return;
    
    setIsSearching(true);
    try {
      const searchResults = await onSearch(query, options);
      setResults(searchResults);
      
      // Auto-expand first few files
      const files = [...new Set(searchResults.slice(0, 5).map(r => r.file))];
      setExpandedFiles(new Set(files));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, [query, options, onSearch]);

  const handleReplace = useCallback(async (single?: SearchResult) => {
    if (!onReplace || !replacement) return;
    
    try {
      const count = await onReplace(query, replacement, options);
      console.log(`Replaced ${count} occurrences`);
      performSearch();
    } catch (error) {
      console.error('Replace failed:', error);
    }
  }, [query, replacement, options, onReplace, performSearch]);

  const toggleOption = useCallback((key: keyof SearchOptions) => {
    setOptions(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleFile = useCallback((file: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev);
      if (next.has(file)) {
        next.delete(file);
      } else {
        next.add(file);
      }
      return next;
    });
  }, []);

  const groupedResults = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    if (!acc[result.file]) acc[result.file] = [];
    acc[result.file].push(result);
    return acc;
  }, {});

  const getFileIcon = (file: string) => {
    const ext = file.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts': case 'tsx': return '🔷';
      case 'js': case 'jsx': return '🟨';
      case 'py': return '🐍';
      case 'css': case 'scss': return '🎨';
      case 'html': return '🌐';
      case 'json': return '📋';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.icon}>🔍</span>
          Search
        </h3>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>

      <div className={styles.searchBox}>
        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              placeholder="Search..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {isSearching && <span className={styles.spinner} />}
          </div>
          <div className={styles.optionButtons}>
            <button
              className={`${styles.optionBtn} ${options.caseSensitive ? styles.active : ''}`}
              onClick={() => toggleOption('caseSensitive')}
              title="Case Sensitive"
            >
              Aa
            </button>
            <button
              className={`${styles.optionBtn} ${options.wholeWord ? styles.active : ''}`}
              onClick={() => toggleOption('wholeWord')}
              title="Whole Word"
            >
              ab
            </button>
            <button
              className={`${styles.optionBtn} ${options.regex ? styles.active : ''}`}
              onClick={() => toggleOption('regex')}
              title="Regex"
            >
              .*
            </button>
          </div>
        </div>

        <div className={styles.toggleRow}>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowReplace(!showReplace)}
          >
            {showReplace ? '▾' : '▸'} Replace
          </button>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? '▾' : '▸'} Filters
          </button>
        </div>

        {showReplace && (
          <div className={styles.replaceRow}>
            <input
              type="text"
              className={styles.input}
              placeholder="Replace with..."
              value={replacement}
              onChange={e => setReplacement(e.target.value)}
            />
            <button className={styles.replaceBtn} onClick={() => handleReplace()}>
              Replace All
            </button>
          </div>
        )}

        {showFilters && (
          <div className={styles.filtersRow}>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Include (e.g. *.ts, src/**)"
              value={options.includePattern}
              onChange={e => setOptions(prev => ({ ...prev, includePattern: e.target.value }))}
            />
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Exclude (e.g. node_modules)"
              value={options.excludePattern}
              onChange={e => setOptions(prev => ({ ...prev, excludePattern: e.target.value }))}
            />
          </div>
        )}
      </div>

      <div className={styles.results}>
        {results.length === 0 && query.length >= 2 && !isSearching && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p>No results found</p>
          </div>
        )}

        {results.length > 0 && (
          <div className={styles.summary}>
            {results.length} results in {Object.keys(groupedResults).length} files
          </div>
        )}

        {Object.entries(groupedResults).map(([file, fileResults]) => (
          <div key={file} className={styles.fileGroup}>
            <button
              className={styles.fileHeader}
              onClick={() => toggleFile(file)}
            >
              <span className={styles.chevron}>
                {expandedFiles.has(file) ? '▾' : '▸'}
              </span>
              <span className={styles.fileIcon}>{getFileIcon(file)}</span>
              <span className={styles.fileName}>{file}</span>
              <span className={styles.fileCount}>{fileResults.length}</span>
            </button>

            {expandedFiles.has(file) && (
              <div className={styles.fileResults}>
                {fileResults.map(result => (
                  <button
                    key={result.id}
                    className={styles.resultItem}
                    onClick={() => onResultClick?.(result)}
                  >
                    <span className={styles.lineNumber}>{result.line}</span>
                    <span className={styles.preview}>
                      {result.preview.slice(0, result.matchStart)}
                      <mark className={styles.highlight}>
                        {result.preview.slice(result.matchStart, result.matchEnd)}
                      </mark>
                      {result.preview.slice(result.matchEnd)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SearchPanel = memo(SearchPanelComponent);
export default SearchPanel;
