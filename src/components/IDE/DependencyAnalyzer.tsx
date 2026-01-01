// ============== DEPENDENCY ANALYZER ==============
// Package analysis with vulnerability detection and update suggestions

import React, { memo, useState, useCallback } from 'react';
import styles from './DependencyAnalyzer.module.css';

interface Dependency {
  name: string;
  version: string;
  latestVersion?: string;
  type: 'production' | 'development' | 'peer';
  size?: number;
  license?: string;
  isOutdated?: boolean;
  hasVulnerability?: boolean;
  vulnerabilities?: Vulnerability[];
  usedBy?: string[];
}

interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  fixedIn?: string;
}

interface AnalysisResult {
  dependencies: Dependency[];
  totalSize: number;
  outdatedCount: number;
  vulnerableCount: number;
  suggestions: string[];
}

interface DependencyAnalyzerProps {
  packageJson?: string;
  lockFile?: string;
  onUpdate?: (packages: string[]) => void;
  onRemove?: (packages: string[]) => void;
  className?: string;
}

const DependencyAnalyzerComponent: React.FC<DependencyAnalyzerProps> = ({
  packageJson,
  lockFile,
  onUpdate,
  onRemove,
  className,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'outdated' | 'vulnerable' | 'unused'>('all');
  const [selectedDeps, setSelectedDeps] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'version'>('name');
  const [filterType, setFilterType] = useState<'all' | 'production' | 'development'>('all');

  const analyzePackages = useCallback(async () => {
    setIsAnalyzing(true);
    
    // Simulate package analysis
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    const mockDependencies: Dependency[] = [
      { name: 'react', version: '18.2.0', latestVersion: '18.2.0', type: 'production', size: 42000, license: 'MIT' },
      { name: 'react-dom', version: '18.2.0', latestVersion: '18.2.0', type: 'production', size: 130000, license: 'MIT' },
      { name: 'typescript', version: '5.0.0', latestVersion: '5.3.0', type: 'development', size: 65000, license: 'Apache-2.0', isOutdated: true },
      { name: 'lodash', version: '4.17.20', latestVersion: '4.17.21', type: 'production', size: 528000, license: 'MIT', isOutdated: true, hasVulnerability: true, vulnerabilities: [
        { id: 'CVE-2021-23337', severity: 'high', title: 'Command Injection', description: 'Lodash versions prior to 4.17.21 are vulnerable to Command Injection via the template function.', fixedIn: '4.17.21' }
      ]},
      { name: 'axios', version: '1.4.0', latestVersion: '1.6.0', type: 'production', size: 45000, license: 'MIT', isOutdated: true },
      { name: 'vite', version: '4.5.0', latestVersion: '5.0.0', type: 'development', size: 2800000, license: 'MIT', isOutdated: true },
      { name: '@types/react', version: '18.2.0', latestVersion: '18.2.45', type: 'development', size: 150000, license: 'MIT', isOutdated: true },
      { name: 'eslint', version: '8.50.0', latestVersion: '8.56.0', type: 'development', size: 3200000, license: 'MIT', isOutdated: true },
      { name: 'tailwindcss', version: '3.3.0', latestVersion: '3.4.0', type: 'development', size: 4500000, license: 'MIT', isOutdated: true },
      { name: 'date-fns', version: '2.30.0', latestVersion: '3.0.0', type: 'production', size: 220000, license: 'MIT', isOutdated: true },
    ];
    
    const analysisResult: AnalysisResult = {
      dependencies: mockDependencies,
      totalSize: mockDependencies.reduce((sum, d) => sum + (d.size || 0), 0),
      outdatedCount: mockDependencies.filter(d => d.isOutdated).length,
      vulnerableCount: mockDependencies.filter(d => d.hasVulnerability).length,
      suggestions: [
        'Update lodash to fix critical vulnerability',
        'Consider replacing moment.js with date-fns for smaller bundle',
        'Vite 5.0 has significant performance improvements',
        'TypeScript 5.3 includes new features and bug fixes',
      ],
    };
    
    setResult(analysisResult);
    setIsAnalyzing(false);
  }, []);

  const toggleDep = (name: string) => {
    setSelectedDeps(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const selectAll = () => {
    if (result) {
      setSelectedDeps(new Set(filteredDeps.map(d => d.name)));
    }
  };

  const updateSelected = () => {
    onUpdate?.(Array.from(selectedDeps));
    setSelectedDeps(new Set());
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return styles.critical;
      case 'high': return styles.high;
      case 'medium': return styles.medium;
      case 'low': return styles.low;
      default: return '';
    }
  };

  const filteredDeps = result?.dependencies.filter(dep => {
    if (filterType !== 'all' && dep.type !== filterType) return false;
    if (activeTab === 'outdated' && !dep.isOutdated) return false;
    if (activeTab === 'vulnerable' && !dep.hasVulnerability) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'size': return (b.size || 0) - (a.size || 0);
      case 'version': return a.isOutdated ? -1 : 1;
      default: return a.name.localeCompare(b.name);
    }
  }) || [];

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>📦</span>
          <span>Dependency Analyzer</span>
        </div>
        <button
          className={styles.analyzeBtn}
          onClick={analyzePackages}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <span className={styles.spinner} />
              Analyzing...
            </>
          ) : (
            <>🔍 Analyze</>
          )}
        </button>
      </div>

      {result && (
        <>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statValue}>{result.dependencies.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.warning}`}>{result.outdatedCount}</span>
              <span className={styles.statLabel}>Outdated</span>
            </div>
            <div className={styles.stat}>
              <span className={`${styles.statValue} ${styles.danger}`}>{result.vulnerableCount}</span>
              <span className={styles.statLabel}>Vulnerable</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statValue}>{formatSize(result.totalSize)}</span>
              <span className={styles.statLabel}>Total Size</span>
            </div>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.tabs}>
              {(['all', 'outdated', 'vulnerable'] as const).map(tab => (
                <button
                  key={tab}
                  className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'all' && 'All'}
                  {tab === 'outdated' && `Outdated (${result.outdatedCount})`}
                  {tab === 'vulnerable' && `Vulnerable (${result.vulnerableCount})`}
                </button>
              ))}
            </div>
            <div className={styles.filters}>
              <select value={filterType} onChange={e => setFilterType(e.target.value as typeof filterType)}>
                <option value="all">All Types</option>
                <option value="production">Production</option>
                <option value="development">Development</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}>
                <option value="name">Sort by Name</option>
                <option value="size">Sort by Size</option>
                <option value="version">Sort by Status</option>
              </select>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.selectAllBtn} onClick={selectAll}>Select All</button>
            {selectedDeps.size > 0 && (
              <button className={styles.updateBtn} onClick={updateSelected}>
                ⬆️ Update {selectedDeps.size} packages
              </button>
            )}
          </div>

          <div className={styles.list}>
            {filteredDeps.map(dep => (
              <div 
                key={dep.name} 
                className={`${styles.depItem} ${dep.hasVulnerability ? styles.vulnerable : ''} ${selectedDeps.has(dep.name) ? styles.selected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedDeps.has(dep.name)}
                  onChange={() => toggleDep(dep.name)}
                />
                <div className={styles.depInfo}>
                  <div className={styles.depHeader}>
                    <span className={styles.depName}>{dep.name}</span>
                    <span className={`${styles.depType} ${styles[dep.type]}`}>{dep.type}</span>
                  </div>
                  <div className={styles.depMeta}>
                    <span className={styles.depVersion}>
                      {dep.version}
                      {dep.isOutdated && (
                        <span className={styles.latestVersion}>→ {dep.latestVersion}</span>
                      )}
                    </span>
                    {dep.size && <span className={styles.depSize}>{formatSize(dep.size)}</span>}
                    {dep.license && <span className={styles.depLicense}>{dep.license}</span>}
                  </div>
                  {dep.vulnerabilities && dep.vulnerabilities.length > 0 && (
                    <div className={styles.vulnerabilities}>
                      {dep.vulnerabilities.map(vuln => (
                        <div key={vuln.id} className={`${styles.vuln} ${getSeverityColor(vuln.severity)}`}>
                          <span className={styles.vulnSeverity}>{vuln.severity}</span>
                          <span className={styles.vulnTitle}>{vuln.title}</span>
                          {vuln.fixedIn && <span className={styles.vulnFix}>Fixed in {vuln.fixedIn}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {result.suggestions.length > 0 && (
            <div className={styles.suggestions}>
              <h4>💡 Suggestions</h4>
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {!result && !isAnalyzing && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📦</span>
          <p>Click Analyze to scan your dependencies</p>
        </div>
      )}
    </div>
  );
};

export const DependencyAnalyzer = memo(DependencyAnalyzerComponent);
export default DependencyAnalyzer;
