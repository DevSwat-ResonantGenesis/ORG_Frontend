import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock3, Sparkles, LibraryBig, Network, FolderKanban } from 'lucide-react';
import { getSessionData, isAuthenticated } from '@/utils/auth-cookies';
import { getMemoryStats, listAnchors, searchMemories, type MemoryAnchor, type MemoryRecord } from '@/api/memory';
import styles from './ResonantMemoryLibraryPage.module.css';

type LibraryTab = 'all' | 'anchors' | 'recent';

const formatDate = (value?: string): string => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString();
};

const ResonantMemoryLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const isEmbedded = new URLSearchParams(window.location.search).get('embed') === '1';
  const sessionData = getSessionData();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<LibraryTab>('all');
  const [query, setQuery] = useState('');

  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [anchors, setAnchors] = useState<MemoryAnchor[]>([]);
  const [stats, setStats] = useState<{ total_memories: number; total_anchors: number; storage_size_mb: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/signup', { replace: true });
      return;
    }

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, anchorsRes, memoriesRes] = await Promise.all([
          getMemoryStats(sessionData?.userId),
          listAnchors(sessionData?.userId, 120),
          searchMemories({ user_id: sessionData?.userId, query: '', limit: 120 }),
        ]);

        setStats(statsRes);
        setAnchors(Array.isArray(anchorsRes) ? anchorsRes : []);
        setMemories(Array.isArray(memoriesRes.memories) ? memoriesRes.memories : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load memory library.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate, sessionData?.userId]);

  const combinedItems = useMemo(() => {
    const memoryItems = memories.map((m) => ({
      id: `mem-${m.id}`,
      kind: 'memory' as const,
      title: m.source ? `${m.source.toUpperCase()} memory` : 'Memory',
      body: m.content || '(empty memory)',
      createdAt: m.created_at,
      score: m.resonance_score ?? m.similarity,
    }));

    const anchorItems = anchors.map((a) => ({
      id: `anchor-${a.id}`,
      kind: 'anchor' as const,
      title: 'Anchor',
      body: a.anchor_text || '(empty anchor)',
      createdAt: a.created_at,
      score: a.importance_score,
    }));

    return [...memoryItems, ...anchorItems]
      .sort((a, b) => (new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
  }, [memories, anchors]);

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return combinedItems.filter((item) => {
      if (tab === 'anchors' && item.kind !== 'anchor') return false;
      if (tab === 'recent' && item.kind !== 'memory') return false;
      if (!q) return true;
      return item.body.toLowerCase().includes(q) || item.title.toLowerCase().includes(q);
    });
  }, [combinedItems, query, tab]);

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      <header className={styles.header}>
        <div className={styles.headerMain}>
          <div className={styles.badge}><LibraryBig size={14} /> Unified Memory Library</div>
          <h1>Resonant Memory</h1>
          <p>Long-term memory, semantic anchors, and recent context in one searchable workspace.</p>
        </div>
        {!isEmbedded && (
          <button className={styles.openChatBtn} onClick={() => navigate('/resonant-chat')}>Back to Resonant Chat</button>
        )}
      </header>

      <section className={styles.statsRow}>
        <div className={styles.statCard}><Sparkles size={14} /><span>Total memories</span><strong>{stats?.total_memories ?? memories.length}</strong></div>
        <div className={styles.statCard}><Network size={14} /><span>Total anchors</span><strong>{stats?.total_anchors ?? anchors.length}</strong></div>
        <div className={styles.statCard}><FolderKanban size={14} /><span>Storage (MB)</span><strong>{(stats?.storage_size_mb ?? 0).toFixed(2)}</strong></div>
      </section>

      <section className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories, anchors, context..."
          />
        </div>
        <div className={styles.tabs}>
          <button className={tab === 'all' ? styles.tabActive : ''} onClick={() => setTab('all')}>All</button>
          <button className={tab === 'anchors' ? styles.tabActive : ''} onClick={() => setTab('anchors')}>Anchors</button>
          <button className={tab === 'recent' ? styles.tabActive : ''} onClick={() => setTab('recent')}>Recent</button>
        </div>
      </section>

      <section className={styles.listPanel}>
        {loading && <div className={styles.empty}>Loading memory library…</div>}
        {!loading && error && <div className={styles.error}>{error}</div>}
        {!loading && !error && visibleItems.length === 0 && (
          <div className={styles.empty}>No items found. Start chatting and saving insights to build your memory library.</div>
        )}

        {!loading && !error && visibleItems.map((item) => (
          <article key={item.id} className={styles.memoryCard}>
            <div className={styles.cardMeta}>
              <span className={item.kind === 'anchor' ? styles.anchorTag : styles.memoryTag}>
                {item.kind === 'anchor' ? 'Anchor' : 'Memory'}
              </span>
              <span className={styles.timestamp}><Clock3 size={13} /> {formatDate(item.createdAt)}</span>
            </div>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {typeof item.score === 'number' && (
              <div className={styles.score}>Relevance {Math.max(0, Math.min(100, Math.round(item.score * 100)))}%</div>
            )}
          </article>
        ))}
      </section>
    </div>
  );
};

export default ResonantMemoryLibraryPage;
