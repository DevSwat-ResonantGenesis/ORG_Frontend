/**
 * Code Search Panel - AI-powered semantic + grep search
 * Module 2: AI Code Search
 * Harmonized design matching IDE Settings Panel
 */
import React, { useState, useEffect, useCallback } from 'react';
import { searchCodebase, searchCodebaseML } from '@/api/code';
import { logger } from '@/utils/logger';
import styles from './CodeSearchPanel.module.css';

interface SearchResult {
  file_path: string;
  language: string;
  line_number: number;
  code: string;
  context?: string;
  score?: number;
  match_type?: 'grep' | 'semantic' | 'filename';
  start_line?: number;
  end_line?: number;
  resonance_score?: number;
  similarity_score?: number;
}

interface CodeSearchPanelProps {
  onFileSelect?: (filePath: string, lineNumber: number) => void;
  onClose?: () => void;
}

export const CodeSearchPanel: React.FC<CodeSearchPanelProps> = ({
  onFileSelect,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'grep' | 'semantic' | 'hybrid'>('hybrid');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      let searchResults: SearchResult[] = [];
      if (searchType === 'semantic') {
        // Use ML embeddings search
        const response = await searchCodebaseML(searchQuery, undefined, 50);
        searchResults = (response.results || []).map((r) => ({
          file_path: r.file_path,
          language: r.language,
          line_number: r.start_line || 0,
          code: r.code,
          context: r.code,
          score: r.similarity_score,
          match_type: 'semantic' as const,
          start_line: r.start_line,
          end_line: r.end_line,
          similarity_score: r.similarity_score,
        }));
      } else if (searchType === 'grep') {
        // Use Hash Sphere search (grep-like)
        const response = await searchCodebase(searchQuery, undefined, 50);
        searchResults = (response.results || []).map((r) => ({
          file_path: r.file_path,
          language: r.language,
          line_number: r.start_line || 0,
          code: r.code,
          context: r.code,
          score: r.resonance_score,
          match_type: 'grep' as const,
          start_line: r.start_line,
          end_line: r.end_line,
          resonance_score: r.resonance_score,
        }));
      } else {
        // Hybrid: combine both
        const [hashSphereResults, mlResults] = await Promise.all([
          searchCodebase(searchQuery, undefined, 25),
          searchCodebaseML(searchQuery, undefined, 25),
        ]);
        // Merge and deduplicate by file_path and start_line
        const combined = [
          ...(hashSphereResults.results || []).map((r) => ({
            file_path: r.file_path,
            language: r.language,
            line_number: r.start_line || 0,
            code: r.code,
            context: r.code,
            score: r.resonance_score,
            match_type: 'grep' as const,
            start_line: r.start_line,
            end_line: r.end_line,
            resonance_score: r.resonance_score,
          })),
          ...(mlResults.results || []).map((r) => ({
            file_path: r.file_path,
            language: r.language,
            line_number: r.start_line || 0,
            code: r.code,
            context: r.code,
            score: r.similarity_score,
            match_type: 'semantic' as const,
            start_line: r.start_line,
            end_line: r.end_line,
            similarity_score: r.similarity_score,
          })),
        ];
        const unique = combined.filter((result, index, self) =>
          index === self.findIndex((r) => r.file_path === result.file_path && r.start_line === result.start_line)
        );
        searchResults = unique;
      }

      setResults(searchResults);
    } catch (error: any) {
      logger.error('Search error', error);
      console.error('Search error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        query,
        searchType
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchType]);

  useEffect(() => {
    // Debounce search
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [query, performSearch]);

  const handleResultClick = (result: SearchResult) => {
    if (onFileSelect) {
      onFileSelect(result.file_path, result.line_number);
    }
  };

  const getMatchTypeLabel = (type?: string) => {
    switch (type) {
      case 'semantic': return 'Semantic';
      case 'grep': return 'Grep';
      case 'filename': return 'Filename';
      default: return 'Match';
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.headerIcon}>
            <circle cx="9" cy="9" r="6" />
            <path d="M15 15L12.5 12.5" strokeLinecap="round" />
          </svg>
          <h3 className={styles.title}>Code Search</h3>
        </div>
        {results.length > 0 && (
          <span className={styles.resultCount}>{results.length} results</span>
        )}
      </div>

      <div className={styles.searchBar}>
        <div className={styles.searchInputWrapper}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.searchIcon}>
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search code or ask a question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.input}
            autoFocus
          />
        </div>
        <select
          value={searchType}
          onChange={(e) => setSearchType(e.target.value as any)}
          className={styles.select}
          title="Search type"
        >
          <option value="hybrid">Hybrid</option>
          <option value="grep">Grep</option>
          <option value="semantic">Semantic</option>
        </select>
      </div>

      <div className={styles.resultsContainer}>
        {loading && (
          <div className={styles.loading}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.spinner}>
              <circle cx="10" cy="10" r="8" strokeOpacity="0.3" />
              <path d="M10 2C5.6 2 2 5.6 2 10" strokeLinecap="round" />
            </svg>
            <span>Searching...</span>
          </div>
        )}

        {!loading && results.length === 0 && query && (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
              <circle cx="24" cy="24" r="18" />
              <path d="M30 30L36 36" strokeLinecap="round" />
            </svg>
            <p className={styles.emptyTitle}>No results found</p>
            <p className={styles.emptyDescription}>
              Try a different search term or change the search type.
              {query.length < 3 && ' (Try searching with at least 3 characters)'}
            </p>
            <p className={styles.emptyHint} style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
              Make sure your project files are indexed. Upload a project or wait for indexing to complete.
            </p>
          </div>
        )}

        {!loading && results.length === 0 && !query && (
          <div className={styles.empty}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.emptyIcon}>
              <circle cx="24" cy="24" r="18" />
              <path d="M30 30L36 36" strokeLinecap="round" />
            </svg>
            <p className={styles.emptyTitle}>Start searching</p>
            <p className={styles.emptyDescription}>Type a query to search your codebase</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className={styles.results}>
            {results.map((result, index) => (
              <div
                key={index}
                className={styles.result}
                onClick={() => handleResultClick(result)}
              >
                <div className={styles.resultHeader}>
                  <div className={styles.resultTitle}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" className={styles.fileIcon}>
                      <path d="M3 2.5C3 2.2 3.2 2 3.5 2H7.3C7.4 2 7.5 2.1 7.5 2.1L9.9 4.5C9.9 4.5 10 4.6 10 4.7V11.5C10 11.8 9.8 12 9.5 12H3.5C3.2 12 3 11.8 3 11.5V2.5Z" />
                    </svg>
                    <span className={styles.filePath}>{result.file_path}</span>
                  </div>
                  <span className={styles.matchType}>{getMatchTypeLabel(result.match_type)}</span>
                </div>
                <div className={styles.resultMeta}>
                  <span className={styles.lineNumber}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 3H10M2 6H10M2 9H7" strokeLinecap="round" />
                    </svg>
                    Line {result.line_number}
                  </span>
                  {result.language && (
                    <span className={styles.language}>{result.language}</span>
                  )}
                  {result.score !== undefined && (
                    <span className={styles.score}>
                      {((result.score || 0) * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
                {result.code && (
                  <div className={styles.code}>
                    <code>{result.code}</code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
