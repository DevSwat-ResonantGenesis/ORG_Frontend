// ============== DATABASE EXPLORER ==============
// Database connection and query tool with SQL editor

import React, { memo, useState, useCallback } from 'react';
import styles from './DatabaseExplorer.module.css';

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'mongodb' | 'sqlite' | 'redis';
  host: string;
  port: number;
  database: string;
  status: 'connected' | 'disconnected' | 'error';
}

interface TableInfo {
  name: string;
  schema: string;
  rowCount: number;
  columns: ColumnInfo[];
}

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey?: boolean;
  foreignKey?: string;
}

interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  executionTime: number;
  error?: string;
}

interface DatabaseExplorerProps {
  connections?: DatabaseConnection[];
  onConnect?: (connection: DatabaseConnection) => void;
  onQuery?: (sql: string) => Promise<QueryResult>;
  className?: string;
}

const mockTables: TableInfo[] = [
  { name: 'users', schema: 'public', rowCount: 1250, columns: [
    { name: 'id', type: 'uuid', nullable: false, primaryKey: true },
    { name: 'email', type: 'varchar(255)', nullable: false },
    { name: 'name', type: 'varchar(100)', nullable: true },
    { name: 'created_at', type: 'timestamp', nullable: false },
  ]},
  { name: 'projects', schema: 'public', rowCount: 450, columns: [
    { name: 'id', type: 'uuid', nullable: false, primaryKey: true },
    { name: 'name', type: 'varchar(255)', nullable: false },
    { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
    { name: 'status', type: 'varchar(50)', nullable: false },
  ]},
  { name: 'tasks', schema: 'public', rowCount: 3200, columns: [
    { name: 'id', type: 'uuid', nullable: false, primaryKey: true },
    { name: 'title', type: 'varchar(255)', nullable: false },
    { name: 'project_id', type: 'uuid', nullable: false, foreignKey: 'projects.id' },
    { name: 'completed', type: 'boolean', nullable: false },
  ]},
];

const DatabaseExplorerComponent: React.FC<DatabaseExplorerProps> = ({
  connections: initialConnections = [],
  onConnect,
  onQuery,
  className,
}) => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    { id: '1', name: 'Local Dev', type: 'postgresql', host: 'localhost', port: 5432, database: 'app_dev', status: 'connected' },
    { id: '2', name: 'Staging', type: 'postgresql', host: 'staging-db.example.com', port: 5432, database: 'app_staging', status: 'disconnected' },
  ]);
  const [activeConnection, setActiveConnection] = useState<DatabaseConnection | null>(connections[0] || null);
  const [tables, setTables] = useState<TableInfo[]>(mockTables);
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null);
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'history'>('tables');
  const [queryHistory, setQueryHistory] = useState<{ sql: string; time: Date; duration: number }[]>([]);
  const [showConnectionModal, setShowConnectionModal] = useState(false);

  const executeQuery = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsExecuting(true);
    const startTime = Date.now();

    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    const mockResult: QueryResult = {
      columns: ['id', 'email', 'name', 'created_at'],
      rows: [
        { id: '1', email: 'john@example.com', name: 'John Doe', created_at: '2024-01-15' },
        { id: '2', email: 'jane@example.com', name: 'Jane Smith', created_at: '2024-01-16' },
        { id: '3', email: 'bob@example.com', name: 'Bob Wilson', created_at: '2024-01-17' },
      ],
      rowCount: 3,
      executionTime: Date.now() - startTime,
    };

    setQueryResult(mockResult);
    setQueryHistory(prev => [
      { sql: query, time: new Date(), duration: mockResult.executionTime },
      ...prev.slice(0, 19),
    ]);
    setIsExecuting(false);
  }, [query]);

  const connectToDatabase = useCallback((conn: DatabaseConnection) => {
    setConnections(prev => prev.map(c => ({
      ...c,
      status: c.id === conn.id ? 'connected' : c.status === 'connected' ? 'disconnected' : c.status,
    })));
    setActiveConnection(conn);
    onConnect?.(conn);
  }, [onConnect]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'postgresql': return '🐘';
      case 'mysql': return '🐬';
      case 'mongodb': return '🍃';
      case 'sqlite': return '📦';
      case 'redis': return '🔴';
      default: return '🗄️';
    }
  };

  const getColumnIcon = (col: ColumnInfo) => {
    if (col.primaryKey) return '🔑';
    if (col.foreignKey) return '🔗';
    return '';
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.icon}>🗄️</span>
          <span>Database Explorer</span>
        </div>
        <button className={styles.addBtn} onClick={() => setShowConnectionModal(true)}>
          + Connection
        </button>
      </div>

      <div className={styles.connectionBar}>
        <select
          className={styles.connectionSelect}
          value={activeConnection?.id || ''}
          onChange={e => {
            const conn = connections.find(c => c.id === e.target.value);
            if (conn) connectToDatabase(conn);
          }}
        >
          {connections.map(conn => (
            <option key={conn.id} value={conn.id}>
              {getTypeIcon(conn.type)} {conn.name}
            </option>
          ))}
        </select>
        <span className={`${styles.status} ${styles[activeConnection?.status || 'disconnected']}`}>
          {activeConnection?.status || 'disconnected'}
        </span>
        <span className={styles.dbInfo}>
          {activeConnection?.host}:{activeConnection?.port}/{activeConnection?.database}
        </span>
      </div>

      <div className={styles.tabs}>
        {(['tables', 'query', 'history'] as const).map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'tables' && '📊 Tables'}
            {tab === 'query' && '⚡ Query'}
            {tab === 'history' && `📜 History (${queryHistory.length})`}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {activeTab === 'tables' && (
          <div className={styles.tablesPanel}>
            <div className={styles.tableList}>
              {tables.map(table => (
                <div
                  key={table.name}
                  className={`${styles.tableItem} ${selectedTable?.name === table.name ? styles.selected : ''}`}
                  onClick={() => setSelectedTable(table)}
                >
                  <span className={styles.tableIcon}>📋</span>
                  <div className={styles.tableInfo}>
                    <span className={styles.tableName}>{table.name}</span>
                    <span className={styles.tableSchema}>{table.schema}</span>
                  </div>
                  <span className={styles.rowCount}>{table.rowCount} rows</span>
                </div>
              ))}
            </div>

            {selectedTable && (
              <div className={styles.columnsPanel}>
                <div className={styles.columnsHeader}>
                  <span>{selectedTable.name}</span>
                  <button
                    className={styles.queryTableBtn}
                    onClick={() => {
                      setQuery(`SELECT * FROM ${selectedTable.name} LIMIT 100;`);
                      setActiveTab('query');
                    }}
                  >
                    ⚡ Query
                  </button>
                </div>
                <div className={styles.columnsList}>
                  {selectedTable.columns.map(col => (
                    <div key={col.name} className={styles.columnItem}>
                      <span className={styles.columnKey}>{getColumnIcon(col)}</span>
                      <span className={styles.columnName}>{col.name}</span>
                      <span className={styles.columnType}>{col.type}</span>
                      {col.nullable && <span className={styles.nullable}>null</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'query' && (
          <div className={styles.queryPanel}>
            <div className={styles.queryEditor}>
              <textarea
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Enter SQL query..."
                spellCheck={false}
              />
              <div className={styles.queryActions}>
                <button
                  className={styles.runBtn}
                  onClick={executeQuery}
                  disabled={isExecuting}
                >
                  {isExecuting ? '⏳ Running...' : '▶ Run Query'}
                </button>
                <button className={styles.formatBtn}>✨ Format</button>
              </div>
            </div>

            {queryResult && (
              <div className={styles.resultPanel}>
                <div className={styles.resultHeader}>
                  <span>{queryResult.rowCount} rows</span>
                  <span>{queryResult.executionTime}ms</span>
                </div>
                <div className={styles.resultTable}>
                  <table>
                    <thead>
                      <tr>
                        {queryResult.columns.map(col => (
                          <th key={col}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.rows.map((row, i) => (
                        <tr key={i}>
                          {queryResult.columns.map(col => (
                            <td key={col}>{String(row[col] ?? 'null')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className={styles.historyPanel}>
            {queryHistory.length === 0 ? (
              <div className={styles.emptyHistory}>No query history</div>
            ) : (
              queryHistory.map((item, i) => (
                <div
                  key={i}
                  className={styles.historyItem}
                  onClick={() => { setQuery(item.sql); setActiveTab('query'); }}
                >
                  <pre className={styles.historySql}>{item.sql}</pre>
                  <div className={styles.historyMeta}>
                    <span>{item.time.toLocaleTimeString()}</span>
                    <span>{item.duration}ms</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const DatabaseExplorer = memo(DatabaseExplorerComponent);
export default DatabaseExplorer;
