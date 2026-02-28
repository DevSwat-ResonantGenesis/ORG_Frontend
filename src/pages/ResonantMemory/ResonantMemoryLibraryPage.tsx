import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Search, Activity, List, X, Move } from 'lucide-react';
import { getSessionData, isAuthenticated } from '@/utils/auth-cookies';
import { getMemoryStats, listAnchors, searchMemories, type MemoryAnchor, type MemoryRecord } from '@/api/memory';
import styles from './ResonantMemoryLibraryPage.module.css';

type PanelKey = 'search' | 'metrics' | 'feed' | 'detail';

type MemoryNode = {
  id: string;
  kind: 'memory' | 'anchor';
  label: string;
  content: string;
  score: number;
  createdAt?: string;
  vector: [number, number, number];
};

type PanelState = {
  x: number;
  y: number;
  visible: boolean;
};

const panelDefaults: Record<PanelKey, PanelState> = {
  search: { x: 24, y: 84, visible: true },
  metrics: { x: 24, y: 252, visible: true },
  feed: { x: 24, y: 392, visible: true },
  detail: { x: 0, y: 84, visible: true },
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const hashUnitVector = (seed: string): [number, number, number] => {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const rand = (n: number) => {
    const x = Math.sin((h + n) * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  let x = rand(1) * 2 - 1;
  let y = rand(2) * 2 - 1;
  let z = rand(3) * 2 - 1;
  const len = Math.hypot(x, y, z) || 1;
  x /= len;
  y /= len;
  z /= len;
  return [x, y, z];
};

const ResonantMemoryLibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const sessionData = getSessionData();
  const isEmbedded = new URLSearchParams(window.location.search).get('embed') === '1';
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ key: PanelKey; dx: number; dy: number } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [anchors, setAnchors] = useState<MemoryAnchor[]>([]);
  const [stats, setStats] = useState<{ total_memories: number; total_anchors: number; storage_size_mb: number } | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [panels, setPanels] = useState(panelDefaults);

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
          listAnchors(sessionData?.userId, 400),
          searchMemories({ user_id: sessionData?.userId, query: '', limit: 400 }),
        ]);
        setStats(statsRes);
        setAnchors(Array.isArray(anchorsRes) ? anchorsRes : []);
        setMemories(Array.isArray(memoriesRes.memories) ? memoriesRes.memories : []);
      } catch (err: any) {
        setError(err?.message || 'Failed to load memory data');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [navigate, sessionData?.userId]);

  const nodes = useMemo<MemoryNode[]>(() => {
    const memoryNodes = memories.map((m) => {
      const xyz = Array.isArray(m.xyz) && m.xyz.length === 3
        ? ([m.xyz[0], m.xyz[1], m.xyz[2]] as [number, number, number])
        : hashUnitVector(`mem-${m.id}`);
      return {
        id: `mem-${m.id}`,
        kind: 'memory' as const,
        label: m.source ? `${m.source} memory` : 'memory',
        content: m.content || '',
        score: m.resonance_score ?? m.similarity ?? 0.45,
        createdAt: m.created_at,
        vector: xyz,
      };
    });

    const anchorNodes = anchors.map((a) => ({
      id: `anchor-${a.id}`,
      kind: 'anchor' as const,
      label: 'anchor',
      content: a.anchor_text || '',
      score: a.importance_score ?? 0.5,
      createdAt: a.created_at,
      vector: Array.isArray(a.xyz) && a.xyz.length === 3
        ? ([a.xyz[0], a.xyz[1], a.xyz[2]] as [number, number, number])
        : hashUnitVector(`anchor-${a.id}`),
    }));

    return [...memoryNodes, ...anchorNodes];
  }, [memories, anchors]);

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nodes;
    return nodes.filter((n) => n.content.toLowerCase().includes(q) || n.label.toLowerCase().includes(q));
  }, [nodes, query]);

  const selectedNode = useMemo(
    () => filteredNodes.find((n) => n.id === selectedNodeId) || null,
    [filteredNodes, selectedNodeId]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let raf = 0;
    let projected: Array<{ node: MemoryNode; x: number; y: number; r: number; z: number }> = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      frame += 0.004;
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.31;

      ctx.strokeStyle = 'rgba(96, 165, 250, 0.25)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 6; i += 1) {
        ctx.beginPath();
        ctx.arc(cx, cy, (radius / 6) * i, 0, Math.PI * 2);
        ctx.stroke();
      }

      projected = filteredNodes.map((node) => {
        const [vx, vy, vz] = node.vector;
        const angle = frame;
        const rx = vx * Math.cos(angle) - vz * Math.sin(angle);
        const rz = vx * Math.sin(angle) + vz * Math.cos(angle);
        const perspective = 0.65 + (rz + 1) * 0.35;
        const x = cx + rx * radius * perspective;
        const y = cy + vy * radius * perspective;
        const r = 2 + clamp(node.score, 0.05, 1) * 5;
        return { node, x, y, r, z: rz };
      }).sort((a, b) => a.z - b.z);

      for (const item of projected) {
        const color = item.node.kind === 'anchor' ? '244,114,182' : '56,189,248';
        const glow = ctx.createRadialGradient(item.x, item.y, 0, item.x, item.y, item.r * 4);
        glow.addColorStop(0, `rgba(${color},0.95)`);
        glow.addColorStop(1, `rgba(${color},0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${color},1)`;
        ctx.beginPath();
        ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
        ctx.fill();

        if (selectedNodeId === item.node.id) {
          ctx.strokeStyle = 'rgba(255,255,255,0.9)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(item.x, item.y, item.r + 4, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      let hit: string | null = null;
      let best = Number.POSITIVE_INFINITY;
      for (const item of projected) {
        const d = Math.hypot(mx - item.x, my - item.y);
        if (d <= item.r + 7 && d < best) {
          best = d;
          hit = item.node.id;
        }
      }
      if (hit) setSelectedNodeId(hit);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    canvas.addEventListener('click', onClick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', onClick);
    };
  }, [filteredNodes, selectedNodeId]);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!dragRef.current || !stageRef.current) return;
      const stageRect = stageRef.current.getBoundingClientRect();
      const { key, dx, dy } = dragRef.current;
      const panelWidth = key === 'detail' ? 360 : 320;
      const x = clamp(e.clientX - stageRect.left - dx, 8, stageRect.width - panelWidth - 8);
      const y = clamp(e.clientY - stageRect.top - dy, 56, stageRect.height - 140);
      setPanels((prev) => ({ ...prev, [key]: { ...prev[key], x, y } }));
    };
    const up = () => {
      dragRef.current = null;
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
  }, []);

  const beginDrag = (key: PanelKey, e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current) return;
    const panelEl = (e.currentTarget.parentElement as HTMLDivElement | null);
    if (!panelEl) return;
    const panelRect = panelEl.getBoundingClientRect();
    dragRef.current = {
      key,
      dx: e.clientX - panelRect.left,
      dy: e.clientY - panelRect.top,
    };
  };

  const setPanelVisible = (key: PanelKey, visible: boolean) => {
    setPanels((prev) => ({ ...prev, [key]: { ...prev[key], visible } }));
  };

  return (
    <div className={styles.page} ref={stageRef}>
      <header className={styles.topNav}>
        <div className={styles.brand}>
          <Brain size={17} />
          <span>Resonant Memory Visualizer</span>
        </div>
        <div className={styles.navControls}>
          <button onClick={() => setPanelVisible('search', !panels.search.visible)}>Search</button>
          <button onClick={() => setPanelVisible('metrics', !panels.metrics.visible)}>Metrics</button>
          <button onClick={() => setPanelVisible('feed', !panels.feed.visible)}>Feed</button>
          <button onClick={() => setPanelVisible('detail', !panels.detail.visible)}>Detail</button>
          {!isEmbedded && <button onClick={() => navigate('/resonant-chat')}>Back to Chat</button>}
        </div>
      </header>

      <div className={styles.canvasStage}>
        <canvas ref={canvasRef} className={styles.canvas} />
        {loading && <div className={styles.overlayMsg}>Loading memory graph…</div>}
        {!loading && error && <div className={styles.overlayErr}>{error}</div>}
      </div>

      {panels.search.visible && (
        <div className={styles.floatingPanel} style={{ left: panels.search.x, top: panels.search.y }}>
          <div className={styles.panelHeader} onMouseDown={(e) => beginDrag('search', e)}>
            <span><Move size={13} /> Search</span>
            <button onClick={() => setPanelVisible('search', false)}><X size={13} /></button>
          </div>
          <div className={styles.panelBody}>
            <label className={styles.label}>Query memory space</label>
            <div className={styles.searchWrap}>
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type to filter memories and anchors"
              />
            </div>
            <p className={styles.muted}>Nodes shown: {filteredNodes.length}</p>
          </div>
        </div>
      )}

      {panels.metrics.visible && (
        <div className={styles.floatingPanel} style={{ left: panels.metrics.x, top: panels.metrics.y }}>
          <div className={styles.panelHeader} onMouseDown={(e) => beginDrag('metrics', e)}>
            <span><Move size={13} /> Metrics</span>
            <button onClick={() => setPanelVisible('metrics', false)}><X size={13} /></button>
          </div>
          <div className={styles.panelBody}>
            <div className={styles.metricRow}><Activity size={13} /> Total memories <strong>{stats?.total_memories ?? memories.length}</strong></div>
            <div className={styles.metricRow}><Activity size={13} /> Total anchors <strong>{stats?.total_anchors ?? anchors.length}</strong></div>
            <div className={styles.metricRow}><Activity size={13} /> Storage MB <strong>{(stats?.storage_size_mb ?? 0).toFixed(2)}</strong></div>
          </div>
        </div>
      )}

      {panels.feed.visible && (
        <div className={styles.floatingPanel} style={{ left: panels.feed.x, top: panels.feed.y }}>
          <div className={styles.panelHeader} onMouseDown={(e) => beginDrag('feed', e)}>
            <span><Move size={13} /> Memory Feed</span>
            <button onClick={() => setPanelVisible('feed', false)}><X size={13} /></button>
          </div>
          <div className={`${styles.panelBody} ${styles.listBody}`}>
            {filteredNodes.slice(0, 8).map((node) => (
              <button
                key={node.id}
                className={styles.feedItem}
                onClick={() => setSelectedNodeId(node.id)}
              >
                <span className={node.kind === 'anchor' ? styles.anchorDot : styles.memoryDot} />
                <div>
                  <strong>{node.kind === 'anchor' ? 'Anchor' : 'Memory'}</strong>
                  <p>{(node.content || '').slice(0, 70) || '(empty)'}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {panels.detail.visible && (
        <div className={`${styles.floatingPanel} ${styles.detailPanel}`} style={{ right: 20, top: panels.detail.y }}>
          <div className={styles.panelHeader} onMouseDown={(e) => beginDrag('detail', e)}>
            <span><Move size={13} /> Node Detail</span>
            <button onClick={() => setPanelVisible('detail', false)}><X size={13} /></button>
          </div>
          <div className={styles.panelBody}>
            {!selectedNode && <p className={styles.muted}>Click a node in the graph or feed to inspect full memory metadata.</p>}
            {selectedNode && (
              <>
                <div className={styles.metricRow}><List size={13} /> Type <strong>{selectedNode.kind}</strong></div>
                <div className={styles.metricRow}><List size={13} /> Score <strong>{Math.round(selectedNode.score * 100)}%</strong></div>
                <div className={styles.metricRow}><List size={13} /> Created <strong>{selectedNode.createdAt ? new Date(selectedNode.createdAt).toLocaleString() : '—'}</strong></div>
                <p className={styles.contentBlock}>{selectedNode.content || '(empty memory text)'}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResonantMemoryLibraryPage;
