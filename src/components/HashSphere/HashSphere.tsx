import React, { useEffect, useRef, useState } from 'react';
import { getApiUrl } from '@/utils/apiUrl';
import client from '@/api/client';
import styles from './HashSphere.module.css';

interface Point {
  hash: string;
  words: string[];
  pos: [number, number, number];
  color: [number, number, number];
}

interface PredictionMarker {
  pos: [number, number, number];
  life: number;
  cluster: string;
}

interface HistoryEntry {
  hash: string;
  cluster: string;
  words: string[];
  r: number;
  spin: number;
  xyz: number[];
}

interface HashSphereProps {
  initialPoints?: Point[];
  onPointClick?: (hash: string) => void;
  highlightedHash?: string | null;
  showControls?: boolean; // Show search/controls UI (default: true for standalone, false for integration)
}

const HashSphere: React.FC<HashSphereProps> = ({
  initialPoints,
  onPointClick,
  highlightedHash,
  showControls = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchBtnRef = useRef<HTMLButtonElement>(null);
  const samplesBtnRef = useRef<HTMLButtonElement>(null);
  const relToggleRef = useRef<HTMLInputElement>(null);
  const diagRef = useRef<HTMLDivElement>(null);
  const predictionLogRef = useRef<HTMLDivElement>(null);
  const predictionChipsRef = useRef<HTMLDivElement>(null);
  const historyListRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const mHashRef = useRef<HTMLDivElement>(null);
  const mCoordsRef = useRef<HTMLDivElement>(null);
  const mWordsRef = useRef<HTMLDivElement>(null);
  const mPredictionRef = useRef<HTMLDivElement>(null);

  const [showRelations, setShowRelations] = useState(false);
  // Use external points if provided, otherwise use internal state
  const [internalPoints, setInternalPoints] = useState<Point[]>([]);
  const points = initialPoints || internalPoints;
  const setPoints = initialPoints ? (() => {}) : setInternalPoints; // No-op if using external points
  const [predictionMarkers, setPredictionMarkers] = useState<PredictionMarker[]>([]);
  const predictionMarkersRef = useRef<PredictionMarker[]>([]);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [predictionCache, setPredictionCache] = useState<Map<string, any>>(new Map());
  // Store original words for hash lookup (reversible mapping)
  const [hashToOriginalWords, setHashToOriginalWords] = useState<Map<string, string>>(new Map());
  const [currentModalHash, setCurrentModalHash] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Camera/orbit state
  const yawRef = useRef(0.0);
  const pitchRef = useRef(0.0);
  const distRef = useRef(2.2);
  const draggingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);
  const animationFrameRef = useRef<number>();

  // SHA-1 implementation
  function sha1(msg: string): string {
    function rl(n: number, s: number): number {
      return (n << s) | (n >>> (32 - s));
    }
    function hx(v: number): string {
      let s = '';
      for (let i = 7; i >= 0; i--) {
        s += ((v >>> (i * 4)) & 0x0f).toString(16);
      }
      return s;
    }
    function u8(s: string): string {
      return unescape(encodeURIComponent(s));
    }

    let i: number, j: number, bs: number;
    const W = new Array(80);
    let H0 = 0x67452301, H1 = 0xEFCDAB89, H2 = 0x98BADCFE, H3 = 0x10325476, H4 = 0xC3D2E1F0;
    let A: number, B: number, C: number, D: number, E: number, t: number;

    msg = u8(msg);
    const L = msg.length;
    const wa: number[] = [];

    for (i = 0; i < L - 3; i += 4) {
      j = (msg.charCodeAt(i) << 24) | (msg.charCodeAt(i + 1) << 16) | (msg.charCodeAt(i + 2) << 8) | msg.charCodeAt(i + 3);
      wa.push(j);
    }

    switch (L % 4) {
      case 0: i = 0x080000000; break;
      case 1: i = (msg.charCodeAt(L - 1) << 24) | 0x0800000; break;
      case 2: i = (msg.charCodeAt(L - 2) << 24) | (msg.charCodeAt(L - 1) << 16) | 0x08000; break;
      case 3: i = (msg.charCodeAt(L - 3) << 24) | (msg.charCodeAt(L - 2) << 16) | (msg.charCodeAt(L - 1) << 8) | 0x80; break;
    }
    wa.push(i);
    while ((wa.length % 16) !== 14) wa.push(0);
    wa.push((L >>> 29));
    wa.push((L << 3) & 0xffffffff);

    for (bs = 0; bs < wa.length; bs += 16) {
      for (i = 0; i < 16; i++) W[i] = wa[bs + i];
      for (i = 16; i <= 79; i++) {
        const x = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
        W[i] = ((x << 1) | (x >>> 31)) >>> 0;
      }
      A = H0; B = H1; C = H2; D = H3; E = H4;
      for (i = 0; i <= 19; i++) {
        t = (rl(A, 5) + ((B & C) | ((~B) & D)) + E + W[i] + 0x5A827999) >>> 0;
        E = D; D = C; C = rl(B, 30) >>> 0; B = A; A = t;
      }
      for (i = 20; i <= 39; i++) {
        t = (rl(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) >>> 0;
        E = D; D = C; C = rl(B, 30) >>> 0; B = A; A = t;
      }
      for (i = 40; i <= 59; i++) {
        t = (rl(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) >>> 0;
        E = D; D = C; C = rl(B, 30) >>> 0; B = A; A = t;
      }
      for (i = 60; i <= 79; i++) {
        t = (rl(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) >>> 0;
        E = D; D = C; C = rl(B, 30) >>> 0; B = A; A = t;
      }
      H0 = (H0 + A) >>> 0;
      H1 = (H1 + B) >>> 0;
      H2 = (H2 + C) >>> 0;
      H3 = (H3 + D) >>> 0;
      H4 = (H4 + E) >>> 0;
    }
    return '0x' + (hx(H0) + hx(H1) + hx(H2) + hx(H3) + hx(H4)).toLowerCase();
  }

  function hexToBigInt(hex: string): bigint {
    const clean = (hex || '').toLowerCase().replace(/^0x/, '').replace(/[^0-9a-f]/g, '');
    if (!clean.length) return 0n;
    return BigInt('0x' + clean);
  }

  function hashToCoords(hex: string): [number, number, number] {
    const H = hexToBigInt(hex);
    const mask53 = (1n << 53n) - 1n;
    const mask54 = (1n << 54n) - 1n;
    const x = H >> 107n;
    const y = (H >> 54n) & mask53;
    const z = H & mask54;
    const x_ = Number((2n * x) / mask53 - 1n);
    const y_ = Number((2n * y) / mask53 - 1n);
    const z_ = Number((2n * z) / mask54 - 1n);
    const r = Math.hypot(x_, y_, z_);
    return r > 1 ? [x_ / r, y_ / r, z_ / r] : [x_, y_, z_];
  }

  const WORDS = [
    'guide', 'unusual', 'scare', 'spell', 'shell', 'frequent', 'call', 'jungle', 'fringe', 'can', 'vapor', 'lock',
    'sense', 'focus', 'dream', 'echo', 'phase', 'spark', 'pulse', 'trace', 'shade', 'tone', 'wave', 'drift',
    'form', 'pattern', 'symbol', 'cycle', 'moment', 'sequence', 'ratio', 'mirror', 'vector', 'origin', 'path', 'limit',
    'merge', 'split', 'align', 'cross', 'shift', 'bind', 'flow', 'link', 'pair', 'turn', 'weave', 'bridge',
    'concept', 'notion', 'prism', 'frame', 'signal', 'system', 'logic', 'unity',
    'river', 'mountain', 'leaf', 'storm', 'desert', 'thunder', 'stone', 'ocean', 'mist', 'flame', 'root', 'breeze',
    'rain', 'cloud', 'snow', 'wind', 'flood', 'tide', 'dawn', 'dusk', 'ember', 'quake', 'seed', 'harvest',
    'dragon', 'rune', 'shadow', 'crown', 'light', 'fairy', 'orb', 'spirit', 'blade', 'charm', 'gate',
    'phoenix', 'oracle', 'portal', 'veil', 'serpent', 'halo', 'prophecy', 'illusion', 'vision', 'emberlight',
    'stellar', 'cosmos', 'eternal', 'radiance', 'infinite'
  ];
  const NWORDS = WORDS.length;

  function wordsFromHash(hex: string): string[] {
    const H = hexToBigInt(hex);
    let seed = Number(H & 0xffffffffn) >>> 0;
    function mulberry32(a: number) {
      return function () {
        a |= 0;
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const rnd = mulberry32(seed);
    const out: string[] = [];
    for (let i = 0; i < 12; i++) {
      out.push(WORDS[Math.floor(rnd() * NWORDS)]);
    }
    return out;
  }

  function hashFromWords(s: string): string {
    const normalized = s.trim().replace(/\s+/g, ' ').toLowerCase();
    return sha1(normalized);
  }

  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    function f(n: number) {
      const k = (n + h * 12) % 12;
      const a = s * Math.min(l, 1 - l);
      return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))));
    }
    return [f(0), f(8), f(4)];
  }

  function clamp(v: number, a: number, b: number): number {
    return Math.max(a, Math.min(b, v));
  }

  function log(s: string) {
    if (diagRef.current) {
      diagRef.current.textContent += s + '\n';
      diagRef.current.scrollTop = diagRef.current.scrollHeight;
    }
  }

  function findPointByHash(hash: string): Point | undefined {
    return points.find(p => p.hash === hash);
  }

  async function addPointForHash(hash: string) {
    const pos = hashToCoords(hash);
    // Check local cache first
    let originalWords = hashToOriginalWords.get(hash.toLowerCase());
    let words: string[];
    
    if (originalWords) {
      // Use cached original words
      words = originalWords.split(/\s+/);
      log(`✓ Using cached original words for ${hash}: ${words.length} words`);
    } else {
      // Try to fetch from database
      const dbWords = await fetchHashWords(hash);
      if (dbWords) {
        words = dbWords.split(/\s+/);
        log(`✓ Using database original words for ${hash}: ${words.length} words`);
      } else {
        // Fallback to generated 12 words
        words = wordsFromHash(hash);
      }
    }
    
    const hue = Number(hexToBigInt(hash) & 0xffffn) % 360;
    const color = hslToRgb(hue / 360, 1, 0.55);
    const p: Point = { hash, words, pos, color };
    setPoints(prev => [...prev, p]);
    log(`→ Added ${hash} @ [${pos.map(n => n.toFixed(3)).join(', ')}]`);
  }

  function rotateY(v: [number, number, number], a: number): [number, number, number] {
    const c = Math.cos(a), s = Math.sin(a);
    return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]];
  }

  function rotateX(v: [number, number, number], a: number): [number, number, number] {
    const c = Math.cos(a), s = Math.sin(a);
    return [v[0], c * v[1] - s * v[2], s * v[1] + c * v[2]];
  }

  function project(v: [number, number, number]): [number, number, number] {
    const canvas = canvasRef.current;
    if (!canvas) return [0, 0, 0];
    const f = 1.2 / (distRef.current - v[2]);
    const x = v[0] * f, y = v[1] * f;
    const w = canvas.clientWidth, h = canvas.clientHeight;
    return [w * 0.5 + x * h * 0.5, h * 0.5 - y * h * 0.5, f];
  }

  function pick(mx: number, my: number): Point | null {
    const hits: Array<{ p: Point; dist: number }> = [];
    points.forEach(p => {
      let v = rotateX(rotateY(p.pos, yawRef.current), pitchRef.current);
      const pr = project(v);
      const r = 10 * clamp(pr[2], 0.12, 1.2) * 0.8;
      const dx = mx - pr[0];
      const dy = my - pr[1];
      if (dx * dx + dy * dy <= r * r * 2) {
        hits.push({ p, dist: dx * dx + dy * dy });
      }
    });
    hits.sort((a, b) => a.dist - b.dist);
    return hits.length ? hits[0].p : null;
  }

  function showModalForPoint(p: Point) {
    if (mHashRef.current) mHashRef.current.textContent = p.hash;
    if (mCoordsRef.current) mCoordsRef.current.textContent = `coords: ${p.pos.map(n => n.toFixed(3)).join(', ')}`;
    // Display original words if available, otherwise generated words
    const originalWords = hashToOriginalWords.get(p.hash.toLowerCase());
    if (mWordsRef.current) {
      if (originalWords) {
        mWordsRef.current.textContent = originalWords;
      } else {
        mWordsRef.current.textContent = p.words.join(' ');
      }
    }
    setCurrentModalHash(p.hash);
    if (p.hash && predictionCache.has(p.hash)) {
      renderPrediction(p.hash);
    } else if (p.hash) {
      if (mPredictionRef.current) mPredictionRef.current.textContent = 'Fetching prediction…';
      fetchPrediction({ hash: p.hash }, p.hash);
    } else {
      renderPrediction('');
    }
    setShowModal(true);
  }

  function hideModal() {
    setShowModal(false);
    setCurrentModalHash(null);
    if (mPredictionRef.current) mPredictionRef.current.textContent = '';
  }

  function renderPrediction(hash: string) {
    if (!mPredictionRef.current) return;
    if (!hash) {
      mPredictionRef.current.textContent = '';
      return;
    }
    const data = predictionCache.get(hash);
    if (!data) {
      mPredictionRef.current.textContent = 'Awaiting API response…';
      return;
    }
    const cluster = (data.cluster || '—').toUpperCase();
    const r = Number(data.r ?? 0).toFixed(2);
    const spin = Number(data.spin ?? 0).toFixed(2);
    const energy = Number(data.energy ?? 0).toFixed(2);
    if (mPredictionRef.current) {
      mPredictionRef.current.innerHTML = `<span>Cluster ${cluster}</span><span>r ${r}</span><span>spin ${spin}</span><span>E ${energy}</span>`;
    }
  }

  async function storeHashWords(hash: string, words: string) {
    try {
      await client.post('/public/hash-words', { hash, words }, {
        timeout: 3000
      });
      // Update local cache
      setHashToOriginalWords(prev => {
        const newMap = new Map(prev);
        newMap.set(hash.toLowerCase(), words);
        return newMap;
      });
    } catch (err: any) {
      // Silently fail - local cache will still work
      log(`⚠ Could not store hash-words mapping: ${err.message || err}`);
    }
  }

  async function fetchHashWords(hash: string): Promise<string | null> {
    try {
      const normalizedHash = hash.toLowerCase().replace(/^0x/, '');
      const res = await client.get(`/public/hash-words/0x${normalizedHash}`, {
        timeout: 3000
      });
      if (res.data?.words) {
        // Update local cache
        setHashToOriginalWords(prev => {
          const newMap = new Map(prev);
          newMap.set(hash.toLowerCase(), res.data.words);
          return newMap;
        });
        return res.data.words;
      }
    } catch (err: any) {
      // Not found or error - return null
      log(`⚠ Could not fetch hash-words mapping: ${err.message || err}`);
    }
    return null;
  }

  async function fetchPrediction(payload: { hash?: string; words?: string }, hashKey: string) {
    try {
      // Use client for consistent error handling and credentials
      // Backend accepts both { hash, words } and { text } formats
      // Add timeout to prevent hanging
      const res = await client.post('/predict', payload, {
        timeout: 5000 // 5 second timeout instead of default 10s
      });
      const data = res.data;
      const key = (hashKey || data.hash || payload.hash || '').toLowerCase();
      if (key) {
        setPredictionCache(prev => {
          const newMap = new Map(prev);
          newMap.set(key, data);
          return newMap;
        });
      }
      log(`📡 API cluster=${data.cluster} r=${Number(data.r).toFixed(2)} spin=${Number(data.spin).toFixed(2)}`);
      if (key && data.xyz && Array.isArray(data.xyz) && data.xyz.length >= 3) {
        // Store original words in database if provided in payload
        if (payload.words && typeof payload.words === 'string') {
          storeHashWords(key, payload.words);
        }
        pushHistoryEntry({
          hash: key,
          cluster: data.cluster || 'alpha',
          words: Array.isArray(data.words) ? data.words : (payload.words ? (typeof payload.words === 'string' ? payload.words.split(/\s+/) : []) : []),
          r: data.r || 0,
          spin: data.spin || 0,
          xyz: data.xyz
        });
        updateMiniConsoleText({ cluster: data.cluster, xyz: data.xyz });
        addPredictionMarker(key, data);
      }
    } catch (err: any) {
      log(`⚠ API error ${err.message || err}`);
      // Even on error, add a placeholder entry if we have a hash
      const key = (hashKey || payload.hash || '').toLowerCase();
      if (key && !predictionCache.has(key)) {
        // Add placeholder entry to history so user knows something was attempted
        pushHistoryEntry({
          hash: key,
          cluster: 'error',
          words: Array.isArray(payload.words) ? payload.words : [],
          r: 0,
          spin: 0,
          xyz: [0, 0, 0]
        });
      }
    }
  }

  function pushHistoryEntry(entry: HistoryEntry) {
    setHistoryEntries(prev => {
      const existing = prev.findIndex(it => it.hash === entry.hash);
      if (existing >= 0) {
        const newEntries = [...prev];
        newEntries.splice(existing, 1);
        newEntries.unshift(entry);
        if (newEntries.length > 6) newEntries.pop();
        return newEntries;
      }
      const newEntries = [entry, ...prev];
      if (newEntries.length > 6) newEntries.pop();
      return newEntries;
    });
  }

  function updateMiniConsoleText(entry: { cluster?: string; xyz?: number[] }) {
    if (predictionLogRef.current) {
      const xyz = entry.xyz || [];
      const fmt = (val: any) => (typeof val === 'number' ? val : Number(val || 0)).toFixed(2);
      predictionLogRef.current.textContent = `Resonance ${(entry.cluster || '—').toUpperCase()} → [x:${fmt(xyz[0])} y:${fmt(xyz[1])} z:${fmt(xyz[2])}]`;
    }
  }

  function addPredictionMarker(hash: string, data: any) {
    if (!Array.isArray(data.xyz) || data.xyz.length < 3) return;
    const vec = data.xyz.map(Number);
    const len = Math.hypot(vec[0], vec[1], vec[2]) || 1;
    const normalized: [number, number, number] = [vec[0] / len, vec[1] / len, vec[2] / len];
    setPredictionMarkers(prev => {
      // Avoid duplicates
      const exists = prev.some(m => 
        Math.abs(m.pos[0] - normalized[0]) < 0.001 &&
        Math.abs(m.pos[1] - normalized[1]) < 0.001 &&
        Math.abs(m.pos[2] - normalized[2]) < 0.001
      );
      if (exists) return prev;
      const newMarkers = [...prev, { pos: normalized, life: 1, cluster: (data.cluster || 'alpha').toLowerCase() }];
      if (newMarkers.length > 24) newMarkers.shift();
      predictionMarkersRef.current = newMarkers;
      return newMarkers;
    });
  }

  function addSamples() {
    const samples = [
      '0x84bee7cb4f81abec7ad8d36c9f73ed5a0a2d6e89',
      '0xa5d57a4a7919de9e294ae77109df4310ecfd0dcd',
      '0x2102e23f9c2b3c84685d04fe03ca4739531d413f'
    ];
    // Add samples with delay to avoid overwhelming backend
    samples.forEach((h, idx) => {
      addPointForHash(h);
      setTimeout(() => {
        fetchPrediction({ hash: h }, h);
      }, idx * 200); // 200ms delay between each
    });
  }

  function handleSearch() {
    const raw = (searchInputRef.current?.value || '').trim();
    if (!raw) {
      log('⚠ Empty search');
      return;
    }
    const words = raw.split(/\s+/);
    let hash: string;
    if (words.length >= 3) {
      hash = hashFromWords(raw);
      log('🔎 phrase → ' + hash);
      // Store original words in database (reversible mapping)
      storeHashWords(hash, raw);
      fetchPrediction({ words: raw }, hash);
    } else {
      hash = '0x' + raw.replace(/^0x/i, '').toLowerCase();
      log('🔎 hash ' + hash);
      // Try to fetch original words from database
      fetchHashWords(hash).then(words => {
        if (words) {
          log(`✓ Retrieved original words from database: ${words.split(/\s+/).length} words`);
        }
      });
      fetchPrediction({ hash }, hash);
    }
    addPointForHash(hash);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Sync ref with current state
    predictionMarkersRef.current = predictionMarkers;
    let lastMarkerUpdate = 0;

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      resize();
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Auto rotate
      yawRef.current += 0.002;

      // Grid sphere
      ctx.strokeStyle = 'rgba(140,160,220,.25)';
      ctx.lineWidth = 1;
      const rings = 9, segs = 64;
      for (let r = 1; r < rings; r++) {
        const phi = (r / rings) * Math.PI - Math.PI / 2;
        ctx.beginPath();
        for (let i = 0; i <= segs; i++) {
          const th = (i / segs) * Math.PI * 2;
          let v: [number, number, number] = [Math.cos(th) * Math.cos(phi), Math.sin(phi), Math.sin(th) * Math.cos(phi)];
          v = rotateX(rotateY(v, yawRef.current), pitchRef.current);
          const p = project(v);
          if (i === 0) ctx.moveTo(p[0], p[1]);
          else ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
      }

      // Points
      const projected: Array<{ p: Point; pr: [number, number, number] }> = [];
      points.forEach(p => {
        let v = rotateX(rotateY(p.pos, yawRef.current), pitchRef.current);
        const pr = project(v);
        projected.push({ p, pr });
      });

      // Draw relations if toggled
      if (showRelations && projected.length > 1) {
        ctx.strokeStyle = 'rgba(127,191,255,.55)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < projected.length; i++) {
          let bestJ = -1, bestD = 1e9;
          for (let j = 0; j < projected.length; j++) {
            if (i === j) continue;
            const dx = projected[i].pr[0] - projected[j].pr[0];
            const dy = projected[i].pr[1] - projected[j].pr[1];
            const d = Math.hypot(dx, dy);
            if (d < bestD) {
              bestD = d;
              bestJ = j;
            }
          }
          if (bestJ >= 0) {
            ctx.beginPath();
            ctx.moveTo(projected[i].pr[0], projected[i].pr[1]);
            ctx.lineTo(projected[bestJ].pr[0], projected[bestJ].pr[1]);
            ctx.stroke();
          }
        }
      }

      // Draw points with glow
      projected.forEach(({ p, pr }) => {
        if (!ctx) return;
        const [x, y, f] = pr;
        const r = 10 * clamp(f, 0.12, 1.2);
        const isHighlighted = highlightedHash && p.hash === highlightedHash;
        const c = p.color;
        
        // Draw highlight ring if this point is highlighted
        if (isHighlighted) {
          ctx.strokeStyle = `rgba(255, 255, 255, 0.9)`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
        g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},${isHighlighted ? 1 : 0.95})`);
        g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${c[0]},${c[1]},${c[2]},${isHighlighted ? 1 : 0.95})`;
        ctx.beginPath();
        ctx.arc(x, y, r * (isHighlighted ? 0.8 : 0.65), 0, Math.PI * 2);
        ctx.fill();
      });

      // Prediction markers - update life periodically (not every frame)
      // Use ref to avoid triggering re-renders
      const now = Date.now();
      if (now - lastMarkerUpdate > 100) { // Update every 100ms instead of every frame
        const currentMarkers = predictionMarkersRef.current;
        const updatedMarkers = currentMarkers.map(marker => ({
          ...marker,
          life: Math.max(0, marker.life - 0.02) // Larger decrement since we update less frequently
        })).filter(m => m.life > 0);
        
        if (updatedMarkers.length !== currentMarkers.length) {
          predictionMarkersRef.current = updatedMarkers;
          setPredictionMarkers(updatedMarkers);
        } else {
          // Update ref even if length is same (life values changed)
          predictionMarkersRef.current = updatedMarkers;
        }
        lastMarkerUpdate = now;
      }

      predictionMarkersRef.current.forEach(marker => {
        if (!canvas || !ctx) return;
        let v = rotateX(rotateY(marker.pos, yawRef.current), pitchRef.current);
        const pr = project(v);
        const [x, y, f] = pr;
        const radius = 18 * marker.life * clamp(f, 0.12, 1);
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const color = marker.cluster === 'beta' ? '#ffb347' : marker.cluster === 'gamma' ? '#c09bff' : '#7df6ff';
        gradient.addColorStop(0, color + 'cc');
        gradient.addColorStop(1, color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color + 'aa';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.clientWidth / 2, canvas.clientHeight / 2);
        ctx.lineTo(x, y);
        ctx.stroke();
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    }

    // Mouse controls
    const handleMouseDown = (e: MouseEvent) => {
      draggingRef.current = true;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const dx = e.clientX - lastXRef.current;
      const dy = e.clientY - lastYRef.current;
      lastXRef.current = e.clientX;
      lastYRef.current = e.clientY;
      yawRef.current += dx * 0.006;
      pitchRef.current += dy * 0.006;
      pitchRef.current = clamp(pitchRef.current, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
    };

    const handleWheel = (e: WheelEvent) => {
      distRef.current = clamp(distRef.current + (e.deltaY > 0 ? 0.12 : -0.12), 1.4, 4.0);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const hit = pick(mx, my);
      if (hit) {
        // If onPointClick is provided (external integration), call it
        if (onPointClick) {
          onPointClick(hit.hash);
        } else {
          // Otherwise, show modal (standalone mode)
          setTimeout(() => {
            showModalForPoint(hit);
          }, 0);
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('click', handleClick);

    // Initialize
    resize();
    log('✅ Canvas ready');
    // Only add samples if not using external points (standalone mode)
    if (!initialPoints) {
      addSamples();
      log('✅ Samples added');
    }
    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('click', handleClick);
    };
  }, [points, showRelations, initialPoints, onPointClick, highlightedHash]);

  // Sync ref when predictionMarkers state changes
  useEffect(() => {
    predictionMarkersRef.current = predictionMarkers;
  }, [predictionMarkers]);

  // Render history chips
  useEffect(() => {
    if (predictionChipsRef.current) {
      predictionChipsRef.current.innerHTML = '';
      historyEntries.slice(0, 3).forEach(item => {
        const btn = document.createElement('button');
        const hashLabel = item.hash ? item.hash.slice(0, 8) + '…' : 'WORDS';
        btn.textContent = `${(item.cluster || '—').toUpperCase()} • ${hashLabel}`;
        btn.addEventListener('click', () => {
          if (searchInputRef.current) {
            searchInputRef.current.value = item.words?.join(' ') || item.hash || '';
          }
          if (item.hash) {
            const point = findPointByHash(item.hash);
            if (point) {
              showModalForPoint(point);
            } else {
              addPointForHash(item.hash);
              fetchPrediction({ hash: item.hash }, item.hash);
            }
          }
        });
        predictionChipsRef.current?.appendChild(btn);
      });
    }
  }, [historyEntries]);

  // Render history list (top right)
  useEffect(() => {
    const historyList = historyListRef.current;
    if (!historyList) return;
    
    historyList.innerHTML = '';
    
    if (historyEntries.length === 0) {
      const emptyMsg = document.createElement('div');
      emptyMsg.className = styles.historyItem;
      emptyMsg.style.opacity = '0.5';
      emptyMsg.style.fontSize = '12px';
      emptyMsg.textContent = 'No predictions yet';
      historyList.appendChild(emptyMsg);
      return;
    }
    
    historyEntries.forEach(item => {
      const row = document.createElement('div');
      row.className = styles.historyItem;
      const label = document.createElement('strong');
      label.textContent = (item.cluster || '—').toUpperCase();
      const info = document.createElement('span');
      if (item.words && item.words.length) {
        info.textContent = item.words.slice(0, 4).join(' ');
      } else if (item.hash) {
        info.textContent = item.hash.slice(0, 10) + '…';
      }
      row.appendChild(label);
      row.appendChild(info);
      row.addEventListener('click', () => {
        if (searchInputRef.current) {
          searchInputRef.current.value = item.words?.join(' ') || item.hash || '';
        }
        if (item.hash) {
          const point = findPointByHash(item.hash);
          if (point) {
            showModalForPoint(point);
          } else {
            addPointForHash(item.hash);
            fetchPrediction({ hash: item.hash }, item.hash);
          }
        }
      });
      historyList.appendChild(row);
    });
  }, [historyEntries]);

  return (
    <div className={styles.hashSphereContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {/* Top Left Overlay - Search Controls (only show if showControls is true) */}
      {showControls && (
        <div className={styles.fullOverlay}>
          <div className={styles.overlayControls}>
            <div className={styles.consoleInputRow}>
              <input
                ref={searchInputRef}
                id="searchBox"
                className={styles.searchInput}
                placeholder="Enter SHA‑1 hash (0x…) or 12 words…"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchBtnRef.current) {
                    searchBtnRef.current.click();
                  }
                }}
              />
            </div>
            <div className={styles.consoleActionRow}>
              <div className={styles.consoleActionButtons}>
                <button ref={searchBtnRef} className={styles.btn} onClick={handleSearch}>
                  Search
                </button>
                <button ref={samplesBtnRef} className={styles.btn} onClick={addSamples}>
                  Samples
                </button>
              </div>
              <label className={styles.toggle}>
                <input
                  ref={relToggleRef}
                  type="checkbox"
                  checked={showRelations}
                  onChange={(e) => setShowRelations(e.target.checked)}
                />
                Show Relations
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Right - Diagnostic Panel (only show if showControls is true) */}
      {showControls && <div ref={diagRef} className={styles.diag}></div>}

      {/* Prediction Console (only show if showControls is true) */}
      {showControls && (
        <div className={styles.miniConsole}>
          <div ref={predictionLogRef} className={styles.consoleLog}>
            Awaiting resonance…
          </div>
        </div>
      )}

      {/* Quick Replay Chips (only show if showControls is true) */}
      {showControls && (
        <div className={styles.predictionHistoryRow}>
          <div className={styles.predictionHistory}>
            <p className={styles.historyTitle}>Quick Replay</p>
            <div ref={predictionChipsRef} className={styles.consoleChips}></div>
          </div>
        </div>
      )}

      {/* Recent Predictions List (Top Right) (only show if showControls is true) */}
      {showControls && (
        <div className={styles.predictionHistoryTopRight}>
          <p className={styles.historyTitle}>Recent Predictions</p>
          <div ref={historyListRef} className={styles.historyList}></div>
        </div>
      )}

      {/* Modal */}
      <div 
        ref={modalRef} 
        className={showModal ? styles.modal : `${styles.modal} ${styles.hidden}`}
        onClick={(e) => {
          if (e.target === modalRef.current) {
            hideModal();
          }
        }}
      >
        <div className={styles.modalCard}>
          <div className={styles.modalHead}>
            <div ref={mHashRef} className={styles.modalHash}></div>
            <button className={styles.closeModal} onClick={hideModal} title="Close">✕</button>
          </div>
          <div ref={mCoordsRef} className={styles.modalCoords}></div>
          <div ref={mPredictionRef} className={styles.modalPrediction}></div>
          <div ref={mWordsRef} className={styles.modalWords}></div>
        </div>
      </div>
    </div>
  );
};

export default HashSphere;
