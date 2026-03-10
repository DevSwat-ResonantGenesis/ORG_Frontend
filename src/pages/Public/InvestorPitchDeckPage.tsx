import React, { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import styles from './InvestorPitchDeckPage.module.css';

const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

const InvestorPitchDeckPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement | null>(null);
  const sphereRef = useRef<HTMLDivElement | null>(null);
  const sphereLayerRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const [heroSize, setHeroSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [traces, setTraces] = useState<
    Array<{
      points: Array<{ x: number; y: number }>;
      nodeSize: number;
      endNodeSize: number;
      nodeOpacity: number;
      baseDelayMs: number;
      stepDelayMs: number;
    }>
  >([]);
  const [animate, setAnimate] = useState(false);
  const [scrollCentered, setScrollCentered] = useState(false);
  const [heroPadLeft, setHeroPadLeft] = useState<number | null>(null);
  const TOTAL_SLIDES = 12;
  const [currentSlide, setCurrentSlide] = useState(0);
  const transitioning = useRef(false);
  const touchStartY = useRef(0);

  /* Lock body scroll on mount, restore on unmount.
     Also add body class so the header can detect this page. */
  /* Force dark mode on this page — restore previous theme on unmount */
  const { theme, setTheme } = useThemeStore();
  const savedTheme = useRef(theme);
  useEffect(() => {
    savedTheme.current = useThemeStore.getState().theme;
    if (savedTheme.current !== 'dark') setTheme('dark');
    return () => {
      if (savedTheme.current !== 'dark') setTheme(savedTheme.current);
    };
  }, []);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('pitch-deck-active');
    window.scrollTo(0, 0);
    return () => {
      document.body.style.overflow = prev;
      document.body.classList.remove('pitch-deck-active');
    };
  }, []);


  /* Scroll-hijack: wheel + touch events change slide, no page scroll */
  useEffect(() => {
    const go = (dir: 1 | -1) => {
      if (transitioning.current) return;
      setCurrentSlide((prev) => {
        const next = prev + dir;
        if (next < 0 || next >= TOTAL_SLIDES) return prev;
        transitioning.current = true;
        setTimeout(() => { transitioning.current = false; }, 900);
        return next;
      });
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) < 15) return;
      go(e.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 40) return;
      go(diff > 0 ? 1 : -1);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  /* Measure the header logo's left offset and mirror it as hero padding-left */
  useEffect(() => {
    const measure = () => {
      const logo = document.querySelector('header [class*="logo"]') as HTMLElement | null;
      if (logo) {
        const left = logo.getBoundingClientRect().left;
        if (left > 0 && left < 200) setHeroPadLeft(left);
      }
    };
    measure();
    /* re-measure after layout settles (sidebar transitions, fonts, etc.) */
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1000);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const heroEl = heroRef.current;
      if (!heroEl) return;
      const threshold = heroEl.offsetHeight * 0.35;
      setScrollCentered(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);



  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const raf = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;

    const cubicBezierPoint = (
      t: number,
      p0: { x: number; y: number },
      p1: { x: number; y: number },
      p2: { x: number; y: number },
      p3: { x: number; y: number }
    ) => {
      const u = 1 - t;
      const tt = t * t;
      const uu = u * u;
      const uuu = uu * u;
      const ttt = tt * t;

      const x = uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x;
      const y = uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y;
      return { x, y };
    };

    const updatePath = () => {
      const heroEl = heroRef.current;
      const sphereEl = sphereRef.current;
      const sphereLayerEl = sphereLayerRef.current;
      if (!heroEl || !sphereEl) return;

      const heroRect = heroEl.getBoundingClientRect();
      const sphereCanvasEl = sphereLayerEl?.querySelector('canvas') as HTMLElement | null;
      const sphereTargetEl = sphereCanvasEl ?? sphereLayerEl ?? sphereEl;
      const sphereRect = sphereTargetEl.getBoundingClientRect();

      setHeroSize({ width: heroRect.width, height: heroRect.height });

      const endX = sphereRect.left - heroRect.left + sphereRect.width * 0.44;
      const endY = sphereRect.top - heroRect.top + sphereRect.height * 0.50;

      const w = heroRect.width;
      const h = heroRect.height;
      const end = { x: endX, y: endY };

      const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
      const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

      const totalTraces = 15;
      const margin = 18;

      const startPointFor = (i: number) => {
        const side = i % 4;
        const t = (i + 1) / (totalTraces + 1);
        if (i === 0) return { x: w * 0.14, y: h * 0.22 };
        if (side === 0) return { x: lerp(margin, w - margin, t), y: margin }; // top
        if (side === 1) return { x: w - margin, y: lerp(margin, h - margin, t) }; // right
        if (side === 2) return { x: lerp(w - margin, margin, t), y: h - margin }; // bottom
        return { x: margin, y: lerp(h - margin, margin, t) }; // left
      };

      const makeControls = (i: number, start: { x: number; y: number }) => {
        const base = (i + 3) * 0.37;
        const wobbleX = Math.sin(base) * w * 0.18;
        const wobbleY = Math.cos(base) * h * 0.16;
        const c1 = {
          x: clamp(start.x + wobbleX + w * 0.25, margin, w - margin),
          y: clamp(start.y + wobbleY + h * 0.12, margin, h - margin)
        };
        const c2 = {
          x: clamp(end.x - wobbleX + w * 0.08, margin, w - margin),
          y: clamp(end.y - wobbleY + h * 0.08, margin, h - margin)
        };
        return { c1, c2 };
      };

      const nextTraces = Array.from({ length: totalTraces }).map((_, i) => {
        const start = startPointFor(i);

        const nearViewer = i === 0;

        const t = totalTraces <= 1 ? 0 : i / (totalTraces - 1);
        const nodeSize = nearViewer ? 96 : lerp(18, 2.8, t);
        const endNodeSize = nearViewer ? 28 : lerp(6, 1.3, t);
        const nodeOpacity = nearViewer ? 0.9 : lerp(0.55, 0.18, t);
        const count = nearViewer ? 10 : Math.round(lerp(26, 14, t));
        const baseDelayMs = nearViewer ? 0 : 180 + i * 80;
        const stepDelayMs = nearViewer ? 120 : Math.round(lerp(70, 95, t));

        const { c1, c2 } = makeControls(i, start);

        const points: Array<{ x: number; y: number }> = [];
        for (let j = 0; j < count; j += 1) {
          const tt = count <= 1 ? 1 : j / (count - 1);
          points.push(cubicBezierPoint(tt, start, c1, c2, end));
        }

        return {
          points,
          nodeSize,
          endNodeSize,
          nodeOpacity,
          baseDelayMs,
          stepDelayMs
        };
      });

      setTraces(nextTraces);
    };

    updatePath();

    let rafId: number | null = null;
    let stopTimeoutId: number | null = null;

    if (animate) {
      const start = performance.now();
      const step = () => {
        updatePath();
        if (performance.now() - start < 3200) {
          rafId = requestAnimationFrame(step);
        }
      };
      rafId = requestAnimationFrame(step);

      stopTimeoutId = window.setTimeout(() => {
        updatePath();
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      }, 3300);
    }

    window.addEventListener('resize', updatePath);
    return () => {
      window.removeEventListener('resize', updatePath);
      if (rafId) cancelAnimationFrame(rafId);
      if (stopTimeoutId) window.clearTimeout(stopTimeoutId);
    };
  }, [prefersReducedMotion, animate]);

  const isReactSnap = typeof navigator !== 'undefined' && navigator.userAgent === 'ReactSnap';

  return (
    <div className={`${styles.page}${animate ? ` ${styles.animate}` : ''}${scrollCentered ? ` ${styles.parallaxCentered}` : ''}`}>
      <Helmet>
        <title>Investor Pitch Deck – ResonantGenesis</title>
        <meta
          name="description"
          content="ResonantGenesis investor pitch deck: sovereign agent infrastructure with governed memory, constraint simulation, and full-stack observability."
        />
        <link rel="canonical" href="https://resonantgenesis.xyz/investor-pitch-deck" />
        <link rel="preload" as="image" href="/images/investorpitch/VR1.jpg" />
        <link rel="preload" as="image" href="/images/investorpitch/VR2.jpg" />
        <link rel="preload" as="image" href="/images/investorpitch/VR3.jpg" />
      </Helmet>

      <main className={styles.main}>
        {/* SLIDE 0 — VR1 fullscreen image + parallax sphere overlay */}
        <div className={`${styles.slide} ${styles.slideVr} ${currentSlide === 0 ? styles.slideActive : ''}`}>
          <img
            src="/images/investorpitch/VR1.jpg"
            alt="ResonantGenesis VR interface — IDE VibeCoding in San Francisco"
            className={styles.vrImage}
          />
          <div className={styles.vrTitleOverlay}>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>Investor Pitch Deck</span>
              <span className={styles.badge}>2026: AI systems, compliance, and autonomy</span>
            </div>
            <h1 className={styles.vrTitle}>
              Own your agent stack.
              <br />
              Govern it end-to-end. Execute.
            </h1>
          </div>
          <div className={styles.vrOverlay}>
            <div className={styles.parallax} aria-hidden="true">
              <Suspense fallback={null}>
                <div ref={sphereRef} className={styles.parallaxInner}>
                  <div ref={sphereLayerRef} className={styles.sphereLayer}>
                    {isReactSnap ? null : <ThreeParticleSphere />}
                  </div>
                </div>
              </Suspense>
            </div>

            {!prefersReducedMotion && traces.length > 0 && heroSize.width > 0 && heroSize.height > 0 && (
              <svg
                className={styles.noodleOverlay}
                aria-hidden="true"
                width="100%"
                height="100%"
                viewBox={`0 0 ${heroSize.width} ${heroSize.height}`}
                preserveAspectRatio="none"
              >
                {traces.flatMap((trace, traceIdx) =>
                  trace.points.map((pt, idx) => (
                    (() => {
                      const t = trace.points.length <= 1 ? 1 : idx / (trace.points.length - 1);
                      const size = trace.nodeSize + (trace.endNodeSize - trace.nodeSize) * t;
                      return (
                    <rect
                      key={`vr-${traceIdx}-${idx}`}
                      className={styles.nodeParticleTools}
                      x={pt.x - size / 2}
                      y={pt.y - size / 2}
                      width={size}
                      height={size}
                      rx={0.9}
                      ry={0.9}
                      opacity={trace.nodeOpacity}
                      style={{ animationDelay: `${trace.baseDelayMs + idx * trace.stepDelayMs}ms` }}
                    />
                      );
                    })()
                  ))
                )}
              </svg>
            )}
          </div>
        </div>

        {/* SLIDE 1 — Executive Summary */}
        <div ref={heroRef} className={`${styles.slide} ${styles.slideDark} ${styles.accentBlue} ${currentSlide === 1 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>01</span>Executive summary</h2>
              <p className={styles.sectionLead}>
                ResonantGenesis is a production-deployed, full-stack Agentic AI SaaS platform available for acquisition as a complete code and IP asset. Every component described in this document is implemented in source code and running in production at dev-swat.com. This is not a prototype or mockup.
              </p>
              <p className={styles.wpText}>
                The platform comprises ~550,000 source lines of code (SLOC) across 30 Python FastAPI microservices, 662 React components, and 85+ frontend routes. Infrastructure includes 33 Docker containers orchestrated via docker-compose.unified.yml, DigitalOcean Managed PostgreSQL with database-per-service design, Redis for caching/sessions/pub-sub, and Nginx for SSL termination and reverse proxying. 178 registered users in production.
              </p>

              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Governed Memory</h3>
                  <p className={styles.cardBody}>Per-user semantic memory universe with embedding-based retrieval, clustering, anchoring, decay rates, importance scoring, and 3D visualization. Dual memory engine: short-term + long-term with hybrid ranking. AES-encrypted API key storage. IP-encrypted neural-somatic hash memory.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Constraints SIM</h3>
                  <p className={styles.cardBody}>Hash Sphere / State Physics engine: physics-based state management using 3D coordinates, forces (attraction/repulsion/resonance/gravity/electromagnetic), spin, energy, and conservation invariants. System state represented as nodes in a 3D sphere with force edges.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Evidence Graphs</h3>
                  <p className={styles.cardBody}>68-module intelligence pipeline with hallucination detection, evidence graph construction linking claims to sources, cross-validation, causal reasoning, source citations. DSID-P protocol for immutable hash anchoring and audit trails with 8 database tables.</p>
                </div>
              </div>

              <h3 className={styles.wpSubtitle}>Core differentiators</h3>
              <p className={styles.wpText}>
                10 proprietary IP systems built from scratch — not wrappers around existing APIs. Includes a custom blockchain protocol (DSID-P), physics-based state engine (Hash Sphere), PyTorch ML embeddings engine (V8), RARA governance layer for autonomous agent operations, 68-module AI chat pipeline, modular skill system with 9 built-in skills, multi-agent orchestration with voting/debate/chaining, semantic memory universe, full SaaS billing stack with 5 revenue streams, and enterprise-grade multi-tenant architecture with 4 role levels.
              </p>
            </div>
          </div>
        </div>

        {/* SLIDE 2 — Platform Scale */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentCyan} ${currentSlide === 2 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>02</span>Platform scale &amp; code audit</h2>
              <p className={styles.sectionLead}>
                Generated from codebase analysis — zero assumptions, all claims grounded in source code. Active SLOC excludes blank lines, comments, auto-generated migrations, and ~25K lines of identified dead/backup code.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                    <tbody>
                      <tr><td>Active SLOC (total)</td><td>~550,000 lines</td></tr>
                      <tr><td>Backend Python SLOC</td><td>~209,000 (843 files)</td></tr>
                      <tr><td>Frontend TS/React SLOC</td><td>~250,000 (662 components)</td></tr>
                      <tr><td>Frontend CSS SLOC</td><td>~91,000 (CSS Modules)</td></tr>
                      <tr><td>Raw lines (wc -l)</td><td>685,000</td></tr>
                      <tr><td>Backend microservices</td><td>30 Python FastAPI</td></tr>
                      <tr><td>Docker containers</td><td>33 (production)</td></tr>
                      <tr><td>Database tables</td><td>80+ across 14 services</td></tr>
                      <tr><td>Frontend routes</td><td>85+ pages</td></tr>
                      <tr><td>API client files</td><td>97</td></tr>
                      <tr><td>Registered users</td><td>178 (production)</td></tr>
                      <tr><td>Live domain</td><td>dev-swat.com (active SSL)</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Code audit breakdown</h3>
                  <p className={styles.wpText}>
                    Non-code removed from raw total: ~89K blank lines, ~22K comment-only lines, ~2K __init__.py / alembic boilerplate. Dead code identified: 44 backup "-2025" files (~19K lines) and 4 orphan pages (~6K lines). Only ~3.6% of the codebase is deletable dead code.
                  </p>
                  <h3 className={styles.wpSubtitle}>Architecture type</h3>
                  <p className={styles.wpText}>
                    Microservices architecture with central API Gateway. All services are Python FastAPI applications containerized with Docker, orchestrated via Docker Compose on DigitalOcean. Communication: Browser → Nginx (443/80) → Gateway (8001) → Internal Services (8000/8080/8091/8093/9001). All inter-service communication is HTTP over Docker internal network (app-network). WebSocket connections supported for real-time chat and provider status.
                  </p>
                  <h3 className={styles.wpSubtitle}>Database architecture</h3>
                  <p className={styles.wpText}>
                    DigitalOcean Managed PostgreSQL (resonant-db). Separate DATABASE_URL env vars per service — database-per-service design. Critical services use SQLAlchemy QueuePool (pool_size=1). Non-critical use NullPool. Gateway uses asyncpg pool (min=0, max=2). Alembic migrations in 14 services. Redis shared instance for caching, sessions, pub-sub.
                  </p>

                  <h3 className={styles.wpSubtitle}>Code Visualizer forensic scan (backend)</h3>
                  <p className={styles.wpText}>
                    Independent verification via our own Code Visualizer tool — static analysis of the full backend repo (analysis ID: 0df61891b34e482eaac664c5de515f39):
                  </p>
                  <table className={styles.wpTable}>
                    <thead><tr><th>CV Metric</th><th>Value</th></tr></thead>
                    <tbody>
                      <tr><td>Total nodes mapped</td><td>30,119</td></tr>
                      <tr><td>Files scanned</td><td>1,714</td></tr>
                      <tr><td>Services detected</td><td>40</td></tr>
                      <tr><td>Functions mapped</td><td>17,773</td></tr>
                      <tr><td>Classes mapped</td><td>6,184</td></tr>
                      <tr><td>API endpoints indexed</td><td>4,384</td></tr>
                      <tr><td>External services</td><td>24</td></tr>
                      <tr><td>Inter-service connections</td><td>59,160</td></tr>
                      <tr><td>Broken connections (raw)</td><td>1,043 reported</td></tr>
                      <tr><td>Broken (cross-verified)</td><td>508 truly broken (51.3% were false positives)</td></tr>
                      <tr><td>Pipelines auto-detected</td><td>6</td></tr>
                    </tbody>
                  </table>
                  <p className={styles.wpText}>
                    Cross-verified against actual filesystem: of 1,043 "broken" imports reported by CV, 426 are false positives (relative imports where target file exists next to source), 100 are pip/stdlib packages, 9 are same-service cross-directory. 508 are truly unresolved — primarily cross-service references and missing shared modules (platform_tools: 20 refs, disd_message: 44, economic_state: 29). CV accuracy bug: cannot resolve Python relative imports. Full remediation plan in CODEBASE_REMEDIATION_PLAN.md. Estimated fix: 2–3 engineer-days for real issues + 3–5 days for CV import resolution improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 3 — Platform Workflow (VR3 background) */}
        <div className={`${styles.slide} ${styles.slideVr} ${currentSlide === 3 ? styles.slideActive : ''}`}>
          <img
            src="/images/investorpitch/VR3.jpg"
            alt="ResonantGenesis VR interface — street view coding"
            className={styles.vrImage}
          />
          <div className={styles.workflowOverlay}>
            <div className={styles.workflowPanel}>
              <h2 className={styles.workflowTitle}>The Platform Workflow</h2>
              <p className={styles.workflowSubtitle}>One ecosystem. Every capability an AI team needs.</p>
              <div className={styles.workflowSteps}>
                <div className={`${styles.workflowStep} ${currentSlide === 3 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '0.2s' }}>
                  <span className={styles.workflowStepNum}>01</span>
                  <div className={styles.workflowStepBody}>
                    <strong>AGI Neural Hub</strong>
                    <span>Conversational AI that plans, reasons, and acts autonomously</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 3 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '0.5s' }}>
                  <span className={styles.workflowStepNum}>02</span>
                  <div className={styles.workflowStepBody}>
                    <strong>AI Agent Studio</strong>
                    <span>Create, configure & deploy autonomous agents</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 3 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '0.8s' }}>
                  <span className={styles.workflowStepNum}>03</span>
                  <div className={styles.workflowStepBody}>
                    <strong>SAST & Dependency Graph</strong>
                    <span>Full-stack architecture observability & remediation</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 3 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '1.1s' }}>
                  <span className={styles.workflowStepNum}>04</span>
                  <div className={styles.workflowStepBody}>
                    <strong>Invariants SIM</strong>
                    <span>Constraint simulation & economic safety modeling</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 3 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '1.4s' }}>
                  <span className={styles.workflowStepNum}>05</span>
                  <div className={styles.workflowStepBody}>
                    <strong>Resonant IDE</strong>
                    <span>In-browser development with split-view AI assistance</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 3 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '1.7s' }}>
                  <span className={styles.workflowStepNum}>06</span>
                  <div className={styles.workflowStepBody}>
                    <strong>Marketplace</strong>
                    <span>Publish & monetize T3-verified agents</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 4 — The problem */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentRed} ${currentSlide === 4 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>03</span>The problem</h2>
              <p className={styles.sectionLead}>
                AI teams can ship demos in days but production-grade autonomy is blocked by three systemic realities that compound at scale: memory safety, action safety, and governance. Most "AI platforms" are thin wrappers around a single LLM API with no durable infrastructure underneath.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Agents break silently</h3>
                  <p className={styles.cardBody}>
                    When tools, prompts, or dependencies change, behavior drifts. Without execution traces, invariant checks, and evidence graphs, failures are discovered only after damage. No cross-validation. No causal reasoning audit. No multi-timeline tracking to detect when a conversation thread diverged from expected behavior.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Governance is bolted on</h3>
                  <p className={styles.cardBody}>
                    EU AI Act, SOC 2, HIPAA — compliance requirements are growing. Teams need explainability artifacts, immutable audit logs, policy controls, capability manifests, and mutation proposals built into the platform from day one. Bolting them on after launch means rewriting your entire agent execution layer. ResonantGenesis has RARA governance and DSID-P audit trails as core primitives.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Memory is a liability</h3>
                  <p className={styles.cardBody}>
                    Long-term memory can leak secrets, amplify hallucinations, and create unclear provenance. Most platforms have no memory architecture at all — or store raw conversation logs with no encryption, no decay rates, no importance scoring, no clustering, no anchoring. ResonantGenesis provides per-user semantic memory universes with embedding-based retrieval, dual memory engines, and 3D visualization.
                  </p>
                </div>
              </div>
              <h3 className={styles.wpSubtitle}>What this means for buyers</h3>
              <p className={styles.wpText}>
                Building this infrastructure from scratch takes 12–18 months with a senior team. ResonantGenesis is already built: 30 microservices, 80+ database tables, 68-module pipeline, 10 proprietary IP systems, full billing stack, and multi-tenant auth — all production-deployed. The acquisition price reflects the IP value, infrastructure depth, and the 12+ months of solo development that would cost $2M–$5M+ to replicate with a team.
              </p>
            </div>
          </div>
        </div>

        {/* SLIDE 5 — Architecture & Services */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentPurple} ${currentSlide === 5 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>04</span>Architecture &amp; backend services</h2>
              <p className={styles.sectionLead}>
                30 FastAPI microservices with central API Gateway. 6 LLM providers with smart failover (OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere). Bring-your-own-key supported. All services containerized with Docker, health-checked, auto-restart on failure.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>Core services</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Service</th><th>DB tables</th><th>Detail</th></tr></thead>
                    <tbody>
                      <tr><td>auth_service</td><td>10</td><td>User auth, OAuth (Google/GitHub), MFA (TOTP), JWT, API keys, orgs, roles, sessions, 80+ endpoints</td></tr>
                      <tr><td>billing_service</td><td>8</td><td>Stripe subscriptions, credits, usage tracking, invoices, referrals, payment methods, 45+ endpoints</td></tr>
                      <tr><td>chat_service</td><td>8</td><td>Primary AI chat interface, 68 intelligence modules, 40+ endpoints, skills system, evidence graphs</td></tr>
                      <tr><td>agent_engine_service</td><td>13</td><td>Agent CRUD, versioning, teams, sessions, plans, tools, safety rules, workflows, marketplace rental</td></tr>
                      <tr><td>blockchain_service</td><td>8</td><td>DSID-P protocol: blocks, transactions, merkle roots, hash anchoring, audit entries, state snapshots</td></tr>
                      <tr><td>memory_service</td><td>5</td><td>Semantic memory with embeddings, chunking, anchoring, resonance clustering</td></tr>
                      <tr><td>code_visualizer</td><td>1</td><td>GitHub repo scanning, dependency graphs, function tracing, governance reports, AI code reviews, 20+ endpoints</td></tr>
                      <tr><td>llm_service</td><td>0</td><td>Unified LLM provider abstraction, automatic failover, streaming SSE, user key passthrough</td></tr>
                      <tr><td>gateway</td><td>0</td><td>Central reverse proxy, auth middleware, JWT validation, API key verification, system metrics</td></tr>
                      <tr><td>rara_service</td><td>0</td><td>RARA governance: capability manifests, mutation proposals, agent budgets, explainability artifacts</td></tr>
                    </tbody>
                  </table>

                  <h3 className={styles.wpSubtitle}>Supporting services</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Service</th><th>Purpose</th></tr></thead>
                    <tbody>
                      <tr><td>state_physics_service</td><td>Hash Sphere engine — 3D coordinates, forces, spin, energy, invariants</td></tr>
                      <tr><td>user_memory_service</td><td>Per-user semantic memory universe, embeddings, clustering, 3D visualization</td></tr>
                      <tr><td>v8_api_service</td><td>PyTorch resonance engine — token → 3D coordinates + spin + energy</td></tr>
                      <tr><td>cognitive_service</td><td>Anomaly detection, clustering, workflow triggering from system patterns</td></tr>
                      <tr><td>crypto_service</td><td>Wallet management, token economics, payment processing (8 tables)</td></tr>
                      <tr><td>marketplace_service</td><td>Agent marketplace — publish, discover, purchase, review (7 tables)</td></tr>
                      <tr><td>ml_service</td><td>ML model registry, training jobs, inference endpoints (9 tables)</td></tr>
                      <tr><td>notification_service</td><td>Multi-channel notifications: in_app, email, push, SMS (2 tables)</td></tr>
                      <tr><td>workflow_service</td><td>Visual workflow builder — create, run, monitor multi-step automations (4 tables)</td></tr>
                      <tr><td>ed_service / ide_service</td><td>Execution environments, file management, terminal, code execution</td></tr>
                      <tr><td>storage_service</td><td>S3-compatible file storage with presigned URLs, batch upload</td></tr>
                      <tr><td>sandbox_runner_service</td><td>Docker-isolated sandboxed code execution, multi-language</td></tr>
                      <tr><td>rabbit_api_service (+4)</td><td>Social platform: communities, posts, comments, voting + content/vote/moderation sub-services</td></tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h3 className={styles.wpSubtitle}>68-module AI intelligence pipeline</h3>
                  <p className={styles.wpText}>
                    The chat_service contains 68 Python service modules implementing the full AI pipeline. Each module is a separate Python file — not prompt engineering. Key modules:
                  </p>
                  <ul className={styles.wpList}>
                    <li><strong>hallucination_detector.py</strong> — Detects hallucinated content in AI responses</li>
                    <li><strong>evidence_graph.py</strong> — Builds evidence graphs linking claims to sources</li>
                    <li><strong>rag_engine.py</strong> — Retrieval-Augmented Generation from knowledge base</li>
                    <li><strong>debate_engine.py</strong> — Multi-agent debate for exploring perspectives</li>
                    <li><strong>causal_reasoning.py</strong> — Causal inference chains</li>
                    <li><strong>autonomous_planner.py</strong> — Multi-step planning for autonomous agents</li>
                    <li><strong>autonomous_error_correction.py</strong> — Self-correcting agent responses</li>
                    <li><strong>personality_dna.py</strong> — Agent personality profiling</li>
                    <li><strong>narrative_continuity_engine.py</strong> — Maintains coherence across conversations</li>
                    <li><strong>thought_branching.py</strong> — Branching thought exploration</li>
                    <li><strong>multi_timeline_engine.py</strong> — Multi-timeline conversation tracking</li>
                    <li><strong>cross_validation.py</strong> — Cross-validates claims across sources</li>
                    <li><strong>dual_memory_engine.py</strong> — Short-term + long-term memory</li>
                    <li><strong>neural_gravity_engine.py</strong> — Neural gravity for context weighting</li>
                    <li><strong>adaptive_agent_allocator.py</strong> — Dynamic agent allocation</li>
                    <li><strong>self_improving_agent.py</strong> — Self-improvement feedback loops</li>
                    <li><strong>ab_testing.py</strong> — A/B testing framework for chat responses</li>
                    <li><strong>skill_executor.py</strong> — Executes 9 built-in skills (code_visualizer, web_search, image_generation, memory_search, memory_library, agents_os, state_physics, ide_workspace, rabbit_post)</li>
                  </ul>

                  <h3 className={styles.wpSubtitle}>LLM provider integration</h3>
                  <p className={styles.wpText}>
                    6 providers with automatic failover: OpenAI (GPT-4, GPT-3.5), Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku), Groq, Google Gemini, Mistral, Cohere. User API key passthrough — bring-your-own-key supported. Automatic fallback: preferred → user keys → platform keys. Streaming SSE support. Context adaptation between provider formats.
                  </p>
                  <p className={styles.wpText}>
                    Frontend has dedicated provider client files: openai.ts, anthropic.ts, groq.ts, gemini.ts, mistral.ts, cohere.ts — with unified router. 97 total API client files mapping to every backend service.
                  </p>

                  <h3 className={styles.wpSubtitle}>6 pipelines auto-detected by Code Visualizer</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Pipeline</th><th>Nodes</th><th>Connections</th><th>Scope</th></tr></thead>
                    <tbody>
                      <tr><td>agent_execution</td><td>8,482</td><td>17,078</td><td>Agent CRUD, versioning, teams, voting, debate, chaining, autonomous planning, safety rules, marketplace</td></tr>
                      <tr><td>chat_flow</td><td>3,752</td><td>7,611</td><td>68-module AI pipeline, skill execution, evidence graphs, hallucination detection, LLM provider routing</td></tr>
                      <tr><td>billing_flow</td><td>2,187</td><td>4,764</td><td>Stripe subscriptions, credits, usage tracking, invoices, referrals, economic integration</td></tr>
                      <tr><td>memory_pipeline</td><td>1,940</td><td>4,032</td><td>Semantic memory universe, embeddings, clustering, anchoring, user_memory_service + memory_service</td></tr>
                      <tr><td>user_login</td><td>594</td><td>862</td><td>Rate limiting, login notifications, MFA, OAuth, JWT, session management, device tracking</td></tr>
                      <tr><td>user_registration</td><td>—</td><td>—</td><td>Registration flow, email verification, RARA economic state creation, initial credit grant</td></tr>
                    </tbody>
                  </table>
                  <p className={styles.wpText}>
                    The agent_execution pipeline is the largest (8,482 nodes, 17,078 connections) spanning agent_engine_service + auth_service agent CRUD + blockchain economic integration. The chat_flow pipeline (3,752 nodes) encompasses all 68 intelligence modules, 9 skills, and cross-service calls to code_visualizer, memory, and agent_engine.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 6 — VR2 + Thesis quote */}
        <div className={`${styles.slide} ${styles.slideVr} ${currentSlide === 6 ? styles.slideActive : ''}`}>
          <img
            src="/images/investorpitch/VR2.jpg"
            alt="ResonantGenesis VR interface — street view coding experience"
            className={styles.vrImage}
          />
          <div className={styles.vrQuoteOverlay}>
            <p className={styles.vrQuote}>
              <strong>Thesis:</strong> The winners in agentic AI won't just have better models.
              They'll have better infrastructure—memory, constraints, and governance that can survive production.
            </p>
          </div>
        </div>

        {/* SLIDE 7 — Unique IP */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentGreen} ${currentSlide === 7 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>05</span>Unique intellectual property</h2>
              <p className={styles.sectionLead}>
                10 proprietary systems built from scratch — based solely on code analysis. These are not wrappers around existing APIs. Each system has its own service, database models, and endpoints.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>#</th><th>System</th><th>Detail</th></tr></thead>
                    <tbody>
                      <tr><td>1</td><td>ResonantChat Pipeline</td><td>68 service modules: hallucination detection, evidence graphs, cross-validation, causal reasoning, debate engine, personality DNA, autonomous planning with error correction, narrative continuity, thought branching, multi-timeline tracking. Each module is a separate Python file.</td></tr>
                      <tr><td>2</td><td>Code Visualizer</td><td>Full code analysis engine: scans GitHub repos, generates interactive dependency graphs, traces function calls, produces governance reports, runs AI-powered code reviews. Persistence with per-user storage limits. 20+ endpoints.</td></tr>
                      <tr><td>3</td><td>DSID-P Protocol</td><td>Decentralized State Identity Protocol — custom blockchain: DSID records, HashNode graph, Block/BlockTransaction with merkle roots, TransactionGraph, AuditEntry (immutable), StateSnapshot, AnchorRecord. 8 database tables.</td></tr>
                      <tr><td>4</td><td>Hash Sphere / State Physics</td><td>Physics-based state management: HashNode (position x/y/z, velocity, mass, charge, spin, energy, hash), HashEdge (weight, force type: attraction/repulsion/resonance/gravity/electromagnetic), Invariant (conservation laws). Node types: data, agent, user, service, model, memory, transaction, policy, anchor, cluster, embedding.</td></tr>
                      <tr><td>5</td><td>V8 Resonance Engine</td><td>Custom PyTorch embedding engine: token → embedding vector → 3D coordinates (x,y,z) + resonance radius + spin + energy. Spatial cluster classification (alpha/beta/gamma). Trainable from corpus with vocabulary and forbidden word filtering. Flask + PyTorch. Web UI with Three.js 3D sphere.</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>#</th><th>System</th><th>Detail</th></tr></thead>
                    <tbody>
                      <tr><td>6</td><td>Modular Skill System</td><td>9 built-in skills with auto-detection from message intent, per-user enable/disable: code_visualizer, web_search, image_generation, memory_search, memory_library, agents_os, state_physics, ide_workspace, rabbit_post.</td></tr>
                      <tr><td>7</td><td>Multi-Agent Orchestration</td><td>Agent voting, debate, chaining, team composition, autonomous planning with error correction, self-improving agents, A/B testing. 13 database tables. Full marketplace rental system.</td></tr>
                      <tr><td>8</td><td>Semantic Memory Universe</td><td>Per-user semantic memory space: MemoryNode (embedding, importance, decay, position), MemoryEdge (connections with type/strength), MemoryCluster, UserMemoryUniverse. Embedding-based retrieval, clustering, anchoring, 3D visualization endpoint.</td></tr>
                      <tr><td>9</td><td>Full SaaS Billing Stack</td><td>Stripe: Subscription/CreditBalance/CreditTransaction/UsageRecord/Invoice/PaymentMethod/PricingPlan/Coupon (8 tables). 45+ endpoints. Credit deduction per-operation tracked by service/provider/model/tokens/latency. 5 revenue streams.</td></tr>
                      <tr><td>10</td><td>RARA Governance Layer</td><td>Resonant Autonomous Runtime Architecture: CapabilityManifest, MutationRequest/Result, AgentBudget, GovernanceDecision, ExplainabilityArtifact, InvariantCheckResult. 9 capability types: code_generation, data_analysis, web_search, file_management, api_integration, blockchain_ops, ml_training, agent_creation, system_admin.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8 — Business model & billing */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentAmber} ${currentSlide === 8 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>06</span>Monetization &amp; billing infrastructure</h2>
              <p className={styles.sectionLead}>
                Complete SaaS billing stack with Stripe. 8 database tables (Subscription, CreditBalance, CreditTransaction, UsageRecord, Invoice, PaymentMethod, PricingPlan, Coupon). 45+ billing endpoints. Revenue calculated only from transactions with stripe_payment_intent_id (real Stripe payments).
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>5 revenue streams (code-supported)</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Subscription plans</strong> — Stripe recurring billing via /checkout/subscription. 4 tiers: Free/Developer (1,000 credits on signup), Plus, Pro, Enterprise. Checkout sessions, webhooks, billing portal, invoice generation.</li>
                    <li><strong>Credit packs</strong> — One-time credit purchases via /checkout/credits. Per-operation credit deduction tracked by service, operation, tokens_used, provider, model, latency_ms. Credit transaction types: purchase, bonus, deduction, refund, rollover, period_grant, referral_reward.</li>
                    <li><strong>API product subscriptions</strong> — API access tiers via /checkout/api-product.</li>
                    <li><strong>Agent marketplace</strong> — AgentPurchase model for marketplace transactions. Agent listing, versioning, purchase records, reviews, usage stats, publisher profiles.</li>
                    <li><strong>Referral system</strong> — 5,000 credits for referrer, 2,000 for referred (tx_type: referral_reward). Period grants and rollover logic implemented.</li>
                  </ul>

                  <h3 className={styles.wpSubtitle}>Billing endpoints (45+)</h3>
                  <p className={styles.wpText}>
                    Subscriptions: GET/POST /subscription, cancel, reactivate, change-plan. Credits: GET /credits (balance), POST /credits/purchase, /deduct, /bonus, /refund, GET /credits/transactions, /balance/&#123;user_id&#125;. Usage: POST /usage/record, GET /usage/summary, /metrics, /tokens/history, /providers, /activity, /history, /limits, /export, /breakdown. Invoices: GET /invoices, /invoices/&#123;id&#125;, /invoices/stats, /invoices/&#123;id&#125;/pdf. Stripe: POST /webhook/stripe, /stripe/checkout, /checkout/subscription, /checkout/credits. Portal: POST /portal (Stripe customer portal). Pricing: GET /pricing, /pricing/plans, /pricing/credit-packs, /pricing/credit-costs.
                  </p>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Auth service (10 DB tables, 80+ endpoints)</h3>
                  <p className={styles.wpText}>
                    Tables: User, Organization, OrgMembership, ApiKey, UserApiKey, RefreshToken, TrustedDevice, PasswordResetToken, Agent, AgentApiKey.
                  </p>
                  <ul className={styles.wpList}>
                    <li><strong>Registration/Login</strong> — /auth/register, /auth/login — password strength validation (8+ chars, uppercase, lowercase, digit, special). Account lockout after failed attempts.</li>
                    <li><strong>OAuth/SSO</strong> — /oauth/google/login, /oauth/github/login, SAML SSO initiate/callback stubs.</li>
                    <li><strong>MFA</strong> — /auth/mfa/setup, /verify, /disable, /backup-codes/regenerate — TOTP-based with backup codes.</li>
                    <li><strong>Token management</strong> — JWT access tokens + HttpOnly cookie refresh tokens. Configurable token expiry.</li>
                    <li><strong>Organization management</strong> — Roles: admin, member, owner, platform_owner. Per-org API keys. Per-user LLM provider keys (OpenAI, Anthropic, Groq, Google, Mistral, Cohere).</li>
                    <li><strong>Session management</strong> — List, revoke individual, revoke all. Trusted device CRUD.</li>
                    <li><strong>Agent settings</strong> — Full CRUD per-user agents: create, update, delete, list, share, import/export, templates, per-agent API keys, memory settings, restrictions.</li>
                    <li><strong>Identity</strong> — /auth/identity returns crypto_hash and user_hash for blockchain anchoring (SHA-256).</li>
                  </ul>

                  <h3 className={styles.wpSubtitle}>Security features</h3>
                  <p className={styles.wpText}>
                    Bcrypt password hashing. JWT with configurable expiry. HttpOnly secure cookies (SameSite=lax). Rate limiting on login, register, password reset, token refresh. Account lockout. Audit logging with client IP/user-agent tracking. AES-encrypted API key storage. Crypto identity generation (SHA-256). Docker-isolated sandboxed code execution. Gateway auth middleware on all non-public routes. CORS per-service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 9 — Frontend & Technology Stack */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentPink} ${currentSlide === 9 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>07</span>Frontend &amp; technology stack</h2>
              <p className={styles.sectionLead}>
                React 18 + TypeScript frontend with 662 components, 85+ routes, 97 API client files, CSS Modules (91K SLOC). Multi-LLM provider support with dedicated client files per provider. Full page inventory from router/index.tsx.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>Frontend page inventory (85+ routes)</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Public (no auth):</strong> Landing, signup, login, pricing, enterprise, community, contact, API docs, DSID-P overview, validation tool, LLM scanner, investor pitch deck, state physics demo, resonant memory, code visualizer, rabbit social</li>
                    <li><strong>Core authenticated:</strong> Resonant Chat (primary), user dashboard, plus/enterprise/owner dashboards, profile, settings, organization, predictions, evidence graphs</li>
                    <li><strong>Agent OS:</strong> Agent OS v2, individual agent dashboards, agent teams (create/edit/dashboard), autonomous agent dashboard, agent browser, publish, templates</li>
                    <li><strong>Marketplace:</strong> NFT/Agent marketplace, item detail, installations, purchases</li>
                    <li><strong>Dev tools:</strong> Web IDE, project builder, AI chat console v2, V8 engine panel, Hash Sphere test/fullscreen</li>
                    <li><strong>Admin:</strong> System dashboard, user management, feature flags</li>
                    <li><strong>Finance:</strong> Invoices, reports, credits &amp; refunds</li>
                    <li><strong>ML Ops:</strong> Training jobs (list/create/detail), model versions, worker monitor, evaluation drift</li>
                    <li><strong>Enterprise control plane (9 pages):</strong> Overview, semantics, trust, governance, compliance, security, performance, live execution, guided scenarios</li>
                  </ul>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Technology stack</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
                    <tbody>
                      <tr><td>Frontend</td><td>React 18 + TypeScript, Vite build</td></tr>
                      <tr><td>Styling</td><td>CSS Modules (91K SLOC)</td></tr>
                      <tr><td>3D</td><td>Three.js (Hash Sphere, V8 visualization)</td></tr>
                      <tr><td>Router</td><td>React Router v6 (createBrowserRouter)</td></tr>
                      <tr><td>Backend</td><td>FastAPI (Python 3.11)</td></tr>
                      <tr><td>V8 Engine</td><td>Flask + PyTorch</td></tr>
                      <tr><td>Blockchain</td><td>Node.js</td></tr>
                      <tr><td>Database</td><td>PostgreSQL (DO Managed)</td></tr>
                      <tr><td>Cache</td><td>Redis (shared instance)</td></tr>
                      <tr><td>ORM</td><td>SQLAlchemy 2.0 (async)</td></tr>
                      <tr><td>Direct DB</td><td>asyncpg (gateway only)</td></tr>
                      <tr><td>Migrations</td><td>Alembic (14 services)</td></tr>
                      <tr><td>Containers</td><td>Docker + Docker Compose</td></tr>
                      <tr><td>Web Server</td><td>Nginx (SSL, reverse proxy)</td></tr>
                      <tr><td>Payments</td><td>Stripe (checkout, webhooks, portal)</td></tr>
                      <tr><td>LLM</td><td>OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere, Ollama</td></tr>
                      <tr><td>OAuth</td><td>Google, GitHub</td></tr>
                      <tr><td>ML</td><td>PyTorch (V8 engine)</td></tr>
                    </tbody>
                  </table>

                  <h3 className={styles.wpSubtitle}>Frontend API clients (97 files)</h3>
                  <p className={styles.wpText}>
                    Each file maps to a backend service: auth, billing, blockchain, chat, code, cognitive, compliance, crypto, dashboard, evidence, governance, hashSphere, llm, marketplace, memory, metrics, mfa, ml, notifications, org, predictions, skills, storage, sso, system, teams, universe, usage, workflow, workspace. Multi-LLM provider clients: openai.ts, anthropic.ts, groq.ts, gemini.ts, mistral.ts, cohere.ts + unified router.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 10 — Production & Implementation Status */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentCyan} ${currentSlide === 10 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>08</span>Production status &amp; implementation</h2>
              <p className={styles.sectionLead}>
                Live at dev-swat.com (IP: 134.199.221.149) with 178 registered users, 0 paying (pre-revenue). Single DigitalOcean droplet + managed DB. Services auto-restart on failure.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>Fully implemented &amp; verified in production</h3>
                  <ul className={styles.wpList}>
                    <li>User registration, login, OAuth (Google/GitHub)</li>
                    <li>JWT authentication with cookies and token refresh</li>
                    <li>MFA (TOTP) setup and verification with backup codes</li>
                    <li>Password reset flow with email</li>
                    <li>Organization management with 4 roles</li>
                    <li>AI chat with multi-provider LLM routing</li>
                    <li>Conversation CRUD (create, list, archive, delete)</li>
                    <li>9 chat skills with auto-detection</li>
                    <li>Credit system (balance, deduction, transaction history)</li>
                    <li>Stripe integration (checkout sessions, webhooks)</li>
                    <li>Code Visualizer (GitHub scan, analysis, dependency graphs, persistence)</li>
                    <li>Billing dashboard with usage metrics</li>
                    <li>User API key management (bring-your-own-key)</li>
                    <li>Agent CRUD (create, configure, share, template, export/import)</li>
                    <li>Owner dashboard with live system analytics</li>
                    <li>Docker-based production deployment (33 containers)</li>
                    <li>Gateway auth middleware with public path exemptions</li>
                    <li>Redis caching, Nginx reverse proxy with SSL</li>
                  </ul>

                  <h3 className={styles.wpSubtitle}>Implemented — needs testing/polish</h3>
                  <ul className={styles.wpList}>
                    <li>Rabbit social platform (communities, posts, comments, votes)</li>
                    <li>V8 Engine (PyTorch embeddings, 3D resonance, retraining)</li>
                    <li>Agent Teams (creation, workflow, rental)</li>
                    <li>Marketplace (listings, purchases, reviews)</li>
                    <li>Workflow engine (definition, execution, event sourcing)</li>
                    <li>Autonomous agent execution (planning, error correction)</li>
                    <li>Hallucination detection and evidence graphs</li>
                    <li>Knowledge base (upload, RAG retrieval)</li>
                    <li>Notification service (multi-channel)</li>
                    <li>Blockchain/DSID-P (hash anchoring, blocks, audit)</li>
                    <li>State Physics / Hash Sphere engine</li>
                    <li>User Memory Universe (semantic space, clustering)</li>
                  </ul>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Production status</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Item</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Domain</td><td>dev-swat.com (active SSL)</td></tr>
                      <tr><td>Registered users</td><td>178</td></tr>
                      <tr><td>Paying users</td><td>0 (pre-revenue)</td></tr>
                      <tr><td>Containers running</td><td>33</td></tr>
                      <tr><td>Database</td><td>DO Managed PostgreSQL</td></tr>
                      <tr><td>Uptime</td><td>Auto-restart on failure</td></tr>
                      <tr><td>CI/CD</td><td>GitHub Actions</td></tr>
                      <tr><td>Frontend deploy</td><td>npm build → rsync → nginx reload</td></tr>
                    </tbody>
                  </table>

                  <h3 className={styles.wpSubtitle}>Infrastructure</h3>
                  <p className={styles.wpText}>
                    Docker Compose: 33 containers on app-network bridge. Health checks (HTTP GET /health) on every service. restart: unless-stopped. Persistent volumes: v8_data, v8_model, build_projects, blockchain_node_data. Nginx serves React static build from /var/www/frontend/, reverse-proxies API to gateway:8001.
                  </p>

                  <h3 className={styles.wpSubtitle}>Service line counts (top 10)</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Service</th><th>Python lines</th></tr></thead>
                    <tbody>
                      <tr><td>agent_engine_service</td><td>54,608</td></tr>
                      <tr><td>blockchain_service</td><td>38,043</td></tr>
                      <tr><td>chat_service</td><td>37,712</td></tr>
                      <tr><td>billing_service</td><td>17,112</td></tr>
                      <tr><td>gateway</td><td>16,712</td></tr>
                      <tr><td>rara_service</td><td>14,663</td></tr>
                      <tr><td>auth_service</td><td>12,280</td></tr>
                      <tr><td>memory_service</td><td>11,626</td></tr>
                      <tr><td>code_visualizer</td><td>9,738</td></tr>
                      <tr><td>ed_service</td><td>4,397</td></tr>
                    </tbody>
                  </table>

                  <h3 className={styles.wpSubtitle}>System health &amp; optimization roadmap</h3>
                  <p className={styles.wpText}>
                    Code Visualizer static analysis identified 1,043 broken connections out of 59,160 total (1.76% error rate). All 1,043 are unresolved Python imports — cross-service module references that the static analyzer cannot resolve at scan time. 348 unique missing targets.
                  </p>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Service (source)</th><th>Broken imports</th><th>Top missing targets</th></tr></thead>
                    <tbody>
                      <tr><td>root (test files, scripts)</td><td>524</td><td>chat_service.app.db, chat_service.app.models — cross-service test imports</td></tr>
                      <tr><td>rara_service</td><td>131</td><td>economic_state.UserEconomicState, disd_message.DISDMessage — shared models</td></tr>
                      <tr><td>billing_service</td><td>82</td><td>economic_state, cache.get_cache, auth.AuthContext</td></tr>
                      <tr><td>agent_engine_service</td><td>75</td><td>revocation_manager_redis, quorum_authority, deps.get_db</td></tr>
                      <tr><td>auth_service</td><td>65</td><td>crypto.encrypt_api_key, qrcode, sessions, economic_integration</td></tr>
                      <tr><td>cascade_control_plane</td><td>32</td><td>platform_tools.auth, monitoring_agents</td></tr>
                      <tr><td>chat_service</td><td>29</td><td>deps modules, skill internal imports</td></tr>
                      <tr><td>gateway</td><td>25</td><td>auth modules, rate limiter backends</td></tr>
                      <tr><td>All other services</td><td>80</td><td>Various cross-service shared module references</td></tr>
                    </tbody>
                  </table>
                  <p className={styles.wpText}>
                    The majority (524/1,043) are in root-level test files importing across service boundaries — these are not production issues. The remaining 519 are cross-service shared module references (economic_state, disd_message, auth, cache) that resolve at Docker runtime via Python path configuration but appear broken to static analysis. The CV tool provides exact file paths and line numbers for every broken import — the buyer receives a pre-built remediation checklist.
                  </p>

                  <h3 className={styles.wpSubtitle}>Per-service CV stats (top 10 by functions)</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Service</th><th>Files</th><th>Functions</th><th>Classes</th><th>Endpoints</th></tr></thead>
                    <tbody>
                      <tr><td>agent_engine_service</td><td>157</td><td>3,486</td><td>1,214</td><td>646</td></tr>
                      <tr><td>blockchain_service</td><td>55</td><td>2,640</td><td>1,264</td><td>988</td></tr>
                      <tr><td>chat_service</td><td>100</td><td>1,884</td><td>500</td><td>226</td></tr>
                      <tr><td>v8_api_service</td><td>15</td><td>1,336</td><td>442</td><td>28</td></tr>
                      <tr><td>rara_service</td><td>30</td><td>1,170</td><td>266</td><td>148</td></tr>
                      <tr><td>billing_service</td><td>49</td><td>1,096</td><td>306</td><td>174</td></tr>
                      <tr><td>gateway</td><td>62</td><td>724</td><td>258</td><td>1,048</td></tr>
                      <tr><td>code_visualizer_service</td><td>22</td><td>664</td><td>194</td><td>56</td></tr>
                      <tr><td>auth_service</td><td>41</td><td>638</td><td>198</td><td>204</td></tr>
                      <tr><td>memory_service</td><td>32</td><td>566</td><td>206</td><td>120</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 11 — Acquisition Terms */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentBlue} ${currentSlide === 11 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>09</span>Acquire ResonantGenesis</h2>
              <p className={styles.sectionLead}>
                ~550,000 source lines of production code. 30 microservices. 33 Docker containers. 80+ database tables. 10 unique IP assets. Complete Stripe billing with 5 revenue streams. 178 registered users. Built solo over 12+ months — needs a team to take to market.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>What's included</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Full source code</strong> — Both repositories (genesis2026_production_backend + genesis2026_frontend), complete git history</li>
                    <li><strong>30-day transition support</strong> — Architecture walkthrough, deployment guidance, codebase orientation</li>
                    <li><strong>3-day unlimited live trial</strong> — Full access to production environment before committing</li>
                    <li><strong>Complete deployment runbook</strong> — Docker Compose, Nginx config, database setup, environment variables</li>
                    <li><strong>PLATFORM_SALE_REPORT.md</strong> — 873-line comprehensive technical audit (the source for this document)</li>
                    <li><strong>All documentation</strong> — 31K lines of .md files (backend) + 4K lines (frontend) + 500 lines .txt</li>
                    <li><strong>Domain transfer</strong> — dev-swat.com and/or resonantgenesis.xyz (negotiable)</li>
                    <li><strong>Infrastructure handoff</strong> — DigitalOcean droplet, managed DB, DNS, SSL certificates</li>
                  </ul>

                  <h3 className={styles.wpSubtitle}>Deal structures open</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Full asset sale</strong> — $3,600,000</li>
                    <li><strong>Acqui-hire</strong> — Code + founder joins the team</li>
                    <li><strong>White-label licensing</strong> — License the platform for your brand/vertical</li>
                    <li><strong>Partial stake + revenue share</strong> — Co-ownership with aligned incentives</li>
                  </ul>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Why selling</h3>
                  <p className={styles.wpText}>
                    Built solo by one developer over 12+ months. The platform is production-ready and architecturally sound, but needs a team for go-to-market: sales, marketing, customer success, and continued feature development. The cost to rebuild this from scratch with a 5–8 person senior engineering team would be $2M–$5M+ and 18–24 months. The $3.6M acquisition price reflects the IP value of 10 proprietary systems, 30 production microservices, 17,773 mapped functions, and 6 verified pipelines — a fraction of rebuild cost with zero time-to-market risk.
                  </p>

                  <h3 className={styles.wpSubtitle}>Ideal buyers</h3>
                  <ul className={styles.wpList}>
                    <li><strong>AI agencies / dev shops</strong> — White-label the platform. You provide clients, it provides infrastructure.</li>
                    <li><strong>SaaS companies adding AI</strong> — Skip 12+ months of agent infrastructure build. Deploy on your infrastructure.</li>
                    <li><strong>Enterprise ISVs</strong> — Plug-in agent orchestration with governance, audit trails, compliance controls.</li>
                    <li><strong>Technical founders</strong> — Buy the infrastructure, focus on your vertical. 3-day trial available.</li>
                    <li><strong>AI infrastructure / MLOps companies</strong> — Unique IP: 68-module pipeline, custom blockchain, physics engine, PyTorch resonance engine.</li>
                  </ul>

                  <h3 className={styles.wpSubtitle}>Report generation</h3>
                  <p className={styles.wpText}>
                    This document was generated by analyzing every service directory, models.py, routers.py, main.py, skills_registry.py, docker-compose.unified.yml, and router/index.tsx in the codebase. All claims are grounded in actual source code inspection. No external claims or assumptions were made.
                  </p>
                </div>
              </div>

              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={styles.ctaPrimary}
                  onClick={() => navigate('/signup')}
                >
                  <span>Request Investor Access</span>
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  type="button"
                  className={styles.ctaSecondary}
                  onClick={() => navigate('/contact')}
                >
                  <span>Contact</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Slide indicator dots */}
        <div className={styles.slideNav}>
          {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
            <button
              key={i}
              className={`${styles.slideDot} ${currentSlide === i ? styles.slideDotActive : ''}`}
              onClick={() => setCurrentSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default InvestorPitchDeckPage;
