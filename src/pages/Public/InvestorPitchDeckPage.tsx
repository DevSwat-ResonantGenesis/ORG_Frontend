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
  const TOTAL_SLIDES = 19;
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


  /* Scroll-hijack: wheel + touch events change slide, no page scroll.
     For scrollable slides (.slideDark): only advance when content is
     scrolled to the very end (bottom → next, top → prev).
     For non-scrollable slides (VR images): advance immediately. */
  useEffect(() => {
    const SCROLL_EDGE_PX = 8; // tolerance pixels for "at the edge"

    const go = (dir: 1 | -1) => {
      if (transitioning.current) return;
      setCurrentSlide((prev) => {
        const next = prev + dir;
        if (next < 0 || next >= TOTAL_SLIDES) return prev;
        transitioning.current = true;
        setTimeout(() => { transitioning.current = false; }, 900);
        // Reset scroll of the incoming slide to top
        requestAnimationFrame(() => {
          const slides = document.querySelectorAll('[class*="slide"]');
          slides.forEach((s) => {
            if (s.classList.toString().includes('slideDark')) {
              (s as HTMLElement).scrollTop = 0;
            }
          });
        });
        return next;
      });
    };

    /** Find the currently active slide element */
    const getActiveSlide = (): HTMLElement | null => {
      const el = document.querySelector('[class*="slideActive"][class*="slide"]') as HTMLElement | null;
      return el;
    };

    /** Check if a slide has scrollable overflow content */
    const isScrollable = (el: HTMLElement): boolean => {
      return el.scrollHeight > el.clientHeight + SCROLL_EDGE_PX;
    };

    const isAtBottom = (el: HTMLElement): boolean => {
      return el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_EDGE_PX;
    };

    const isAtTop = (el: HTMLElement): boolean => {
      return el.scrollTop <= SCROLL_EDGE_PX;
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 15) return;
      const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1;
      const slide = getActiveSlide();

      if (slide && isScrollable(slide)) {
        // Let native scroll happen inside the slide content
        if (dir === 1 && !isAtBottom(slide)) return;
        if (dir === -1 && !isAtTop(slide)) return;
      }

      e.preventDefault();
      go(dir);
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) < 40) return;
      const dir: 1 | -1 = diff > 0 ? 1 : -1;
      const slide = getActiveSlide();

      if (slide && isScrollable(slide)) {
        // Only change slide when the user has scrolled to the edge
        if (dir === 1 && !isAtBottom(slide)) return;
        if (dir === -1 && !isAtTop(slide)) return;
      }

      go(dir);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const slide = getActiveSlide();
      if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
        if (slide && isScrollable(slide) && !isAtBottom(slide)) return;
        e.preventDefault();
        go(1);
      }
      if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (slide && isScrollable(slide) && !isAtTop(slide)) return;
        e.preventDefault();
        go(-1);
      }
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
          content="ResonantGenesis investor pitch deck: ~550K lines of production code, 30 microservices, 9 proprietary IP systems. Full-stack Agentic AI SaaS platform available for acquisition."
        />
        <link rel="canonical" href="https://resonantgenesis.xyz/investor-pitch-deck" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Investor Pitch Deck – ResonantGenesis" />
        <meta property="og:description" content="~550K lines of production code. 30 microservices. 9 proprietary IP systems. Full-stack Agentic AI SaaS platform — production-deployed, available for acquisition. Built solo in 4 months." />
        <meta property="og:url" content="https://resonantgenesis.xyz/investor-pitch-deck" />
        <meta property="og:image" content="https://resonantgenesis.xyz/images/investorpitch/VR1.jpg" />
        <meta property="og:site_name" content="ResonantGenesis" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Investor Pitch Deck – ResonantGenesis" />
        <meta name="twitter:description" content="~550K lines of production code. 30 microservices. 9 proprietary IP systems. Full-stack Agentic AI SaaS platform — production-deployed, available for acquisition." />
        <meta name="twitter:image" content="https://resonantgenesis.xyz/images/investorpitch/VR1.jpg" />

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
                ResonantGenesis is a production-deployed, full-stack Agentic AI SaaS platform available for acquisition as a complete code and IP asset. Every component described in this document is implemented in source code and running in production at dev-swat.com and resonantgenesis.xyz. This is not a prototype or mockup.
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
                9 proprietary IP systems built from scratch — not wrappers around existing APIs. Includes a custom blockchain protocol (DSID-P), physics-based state engine (Hash Sphere), RARA governance layer for autonomous agent operations, 68-module AI chat pipeline, modular skill system with 9 built-in skills, multi-agent orchestration with voting/debate/chaining, semantic memory universe, full SaaS billing stack with 5 revenue streams, and enterprise-grade multi-tenant architecture with 4 role levels.
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
                      <tr><td>Live domains</td><td>dev-swat.com &amp; resonantgenesis.xyz (active SSL)</td></tr>
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

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SLIDE 3 — Code Analysis & Contribution Evidence */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentCyan} ${currentSlide === 3 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>02b</span>Code analysis &amp; contribution evidence</h2>
              <p className={styles.sectionLead}>
                Independent verification via Code Visualizer static analysis (analysis ID: 0df61891b34e482eaac664c5de515f39). Cross-verified with GitHub contribution history across both repositories.
              </p>
              <div className={styles.cvMetricsGrid}>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Nodes mapped</p><p className={styles.cvMetricValue}>30,119</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Files scanned</p><p className={styles.cvMetricValue}>1,714</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Services</p><p className={styles.cvMetricValue}>40</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Functions</p><p className={styles.cvMetricValue}>17,773</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Classes</p><p className={styles.cvMetricValue}>6,184</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>API endpoints</p><p className={styles.cvMetricValue}>4,384</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>External services</p><p className={styles.cvMetricValue}>24</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Connections</p><p className={styles.cvMetricValue}>59,160</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Pipelines</p><p className={styles.cvMetricValue}>6</p></div>
                <div className={styles.cvMetricCard}><p className={styles.cvMetricLabel}>Efficiency</p><p className={styles.cvMetricValue}>96.4%</p></div>
              </div>
              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>Code Visualizer dependency graph</h3>
                  <img
                    src="/images/investorpitch/cv-scan.jpg"
                    alt="Code Visualizer forensic scan — dependency graph and architecture map"
                    className={styles.slideScreenshot}
                    loading="lazy"
                    style={{ marginTop: 6 }}
                  />
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>GitHub contribution history</h3>
                  <div className={styles.screenshotGrid}>
                    <div>
                      <img src="/images/investorpitch/github/backend%20contributions1.png" alt="Backend contributions" loading="lazy" />
                      <p className={styles.screenshotCaption}>Backend repo contributions</p>
                    </div>
                    <div>
                      <img src="/images/investorpitch/github/frontend%20contribution%201.png" alt="Frontend contributions" loading="lazy" />
                      <p className={styles.screenshotCaption}>Frontend repo contributions</p>
                    </div>
                    <div>
                      <img src="/images/investorpitch/github/backend%20commits%20quantityes%20.png" alt="Backend commits" loading="lazy" />
                      <p className={styles.screenshotCaption}>Backend commit frequency</p>
                    </div>
                    <div>
                      <img src="/images/investorpitch/github/frontend%20commit%20quantities.png" alt="Frontend commits" loading="lazy" />
                      <p className={styles.screenshotCaption}>Frontend commit frequency</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 4 — Platform Workflow (VR3 background) */}
        <div className={`${styles.slide} ${styles.slideVr} ${currentSlide === 4 ? styles.slideActive : ''}`}>
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
                <div className={`${styles.workflowStep} ${currentSlide === 4 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '0.2s' }}>
                  <span className={styles.workflowStepNum}>01</span>
                  <div className={styles.workflowStepBody}>
                    <strong>AGI Neural Hub</strong>
                    <span>Conversational AI that plans, reasons, and acts autonomously</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 4 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '0.5s' }}>
                  <span className={styles.workflowStepNum}>02</span>
                  <div className={styles.workflowStepBody}>
                    <strong>AI Agent Studio</strong>
                    <span>Create, configure & deploy autonomous agents</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 4 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '0.8s' }}>
                  <span className={styles.workflowStepNum}>03</span>
                  <div className={styles.workflowStepBody}>
                    <strong>SAST & Dependency Graph</strong>
                    <span>Full-stack architecture observability & remediation</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 4 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '1.1s' }}>
                  <span className={styles.workflowStepNum}>04</span>
                  <div className={styles.workflowStepBody}>
                    <strong>Invariants SIM</strong>
                    <span>Constraint simulation & economic safety modeling</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 4 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '1.4s' }}>
                  <span className={styles.workflowStepNum}>05</span>
                  <div className={styles.workflowStepBody}>
                    <strong>Resonant IDE</strong>
                    <span>In-browser development with split-view AI assistance</span>
                  </div>
                </div>
                <div className={styles.workflowConnector} />
                <div className={`${styles.workflowStep} ${currentSlide === 4 ? styles.workflowStepAnim : ''}`} style={{ animationDelay: '1.7s' }}>
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

        {/* SLIDE 5 — The problem */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentRed} ${currentSlide === 5 ? styles.slideActive : ''}`}>
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
                Building this infrastructure from scratch takes 18–24 months with a senior team. ResonantGenesis was built in just 4 months because its own agentic infrastructure accelerated development — a half-million-line enterprise system built in 120 days by a single engineer using the tools being sold. The acquisition price reflects the IP value, infrastructure depth, and the compressed development that would cost $2M–$5M+ to replicate with a team.
              </p>
            </div>
          </div>
        </div>

        {/* SLIDE 6 — Architecture: Core & Supporting Services */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentPurple} ${currentSlide === 6 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>04</span>Architecture &amp; backend services</h2>
              <p className={styles.sectionLead}>
                30 FastAPI microservices with central API Gateway. All services containerized with Docker, health-checked, auto-restart on failure. Bring-your-own-key supported.
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
                </div>

                <div>
                  <h3 className={styles.wpSubtitle}>Supporting services</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Service</th><th>Purpose</th></tr></thead>
                    <tbody>
                      <tr><td>state_physics_service</td><td>Hash Sphere engine — 3D coordinates, forces, spin, energy, invariants</td></tr>
                      <tr><td>user_memory_service</td><td>Per-user semantic memory universe, embeddings, clustering, 3D visualization</td></tr>
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
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 7 — Architecture: AI Pipeline & LLM Providers */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentPurple} ${currentSlide === 7 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>04b</span>AI pipeline &amp; LLM providers</h2>
              <p className={styles.sectionLead}>
                68-module intelligence pipeline with 6 LLM providers. Each module is a standalone Python file — not prompt engineering. Smart failover, streaming SSE, and bring-your-own-key support across all providers.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>68-module AI intelligence pipeline</h3>
                  <p className={styles.wpText}>
                    68 Python service modules in chat_service — each a separate file, not prompt engineering. Key modules: hallucination_detector, evidence_graph, rag_engine, debate_engine, causal_reasoning, autonomous_planner, autonomous_error_correction, personality_dna, narrative_continuity_engine, thought_branching, multi_timeline_engine, cross_validation, dual_memory_engine, neural_gravity_engine, adaptive_agent_allocator, self_improving_agent, ab_testing, skill_executor (9 built-in skills).
                  </p>

                  <h3 className={styles.wpSubtitle}>LLM provider integration</h3>
                  <p className={styles.wpText}>
                    6 providers with auto-failover: OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere. BYOK supported. Streaming SSE. 97 frontend API client files with dedicated per-provider clients.
                  </p>
                </div>

                <div>
                  <h3 className={styles.wpSubtitle}>6 pipelines auto-detected by Code Visualizer</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Pipeline</th><th>Nodes</th><th>Connections</th></tr></thead>
                    <tbody>
                      <tr><td>agent_execution</td><td>8,482</td><td>17,078</td></tr>
                      <tr><td>chat_flow</td><td>3,752</td><td>7,611</td></tr>
                      <tr><td>billing_flow</td><td>2,187</td><td>4,764</td></tr>
                      <tr><td>memory_pipeline</td><td>1,940</td><td>4,032</td></tr>
                      <tr><td>user_login</td><td>594</td><td>862</td></tr>
                      <tr><td>user_registration</td><td>—</td><td>—</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8 — VR2 + Thesis quote */}
        <div className={`${styles.slide} ${styles.slideVr} ${currentSlide === 8 ? styles.slideActive : ''}`}>
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

        {/* SLIDE 9 — Unique IP Part 1 */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentGreen} ${currentSlide === 9 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>05</span>Unique intellectual property</h2>
              <p className={styles.sectionLead}>
                9 proprietary systems built from scratch — not wrappers around existing APIs. Each has its own service, database models, and endpoints.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>#</th><th>System</th><th>Detail</th></tr></thead>
                    <tbody>
                      <tr><td>1</td><td>ResonantChat Pipeline</td><td>68 service modules: hallucination detection, evidence graphs, cross-validation, causal reasoning, debate engine, personality DNA, autonomous planning with error correction, narrative continuity, thought branching, multi-timeline tracking. Each module is a separate Python file.</td></tr>
                      <tr><td>2</td><td>Code Visualizer</td><td>Full code analysis engine: scans GitHub repos, generates interactive dependency graphs, traces function calls, produces governance reports, runs AI-powered code reviews. Per-user persistence with storage limits. 20+ endpoints.</td></tr>
                      <tr><td>3</td><td>DSID-P Protocol</td><td>Decentralized State Identity Protocol — custom blockchain: DSID records, HashNode graph, Block/BlockTransaction with merkle roots, TransactionGraph, AuditEntry (immutable), StateSnapshot, AnchorRecord. 8 database tables.</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>#</th><th>System</th><th>Detail</th></tr></thead>
                    <tbody>
                      <tr><td>4</td><td>Hash Sphere / State Physics</td><td>N-body physics constraint simulation for system state. HashNode: 3D position, velocity, mass (economic weight), charge (trust polarity), temperature (activity), spin, energy, trust_score. HashEdge: weighted force connections. PhysicsEngine: gravity, repulsion, springs, entropy forces. EntropyEngine: perturbations, decay, asymmetry seeding. Conservation invariants: mass, energy, identity uniqueness, causality, trust bounds. 8 node types. Populated from live user data.</td></tr>
                      <tr><td>5</td><td>Semantic Memory Universe</td><td>Per-user semantic memory space — independent service from State Physics. MemoryNode (embedding vector, importance, decay rate, 3D position), MemoryEdge (typed connections with strength), MemoryCluster, UserMemoryUniverse. Dual memory engine: short-term + long-term with hybrid ranking. Embedding-based retrieval, resonance clustering, anchoring, 3D visualization. AES-encrypted storage.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 10 — Unique IP Part 2 */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentGreen} ${currentSlide === 10 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>05b</span>Unique IP — continued</h2>
              <p className={styles.sectionLead}>
                Modular skill system, multi-agent orchestration, complete SaaS billing stack, and autonomous governance layer.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>#</th><th>System</th><th>Detail</th></tr></thead>
                    <tbody>
                      <tr><td>6</td><td>Modular Skill System</td><td>9 built-in skills with auto-detection from message intent, per-user enable/disable: code_visualizer, web_search, image_generation, memory_search, memory_library, agents_os, state_physics, ide_workspace, rabbit_post.</td></tr>
                      <tr><td>7</td><td>Multi-Agent Orchestration</td><td>Agent voting, debate, chaining, team composition, autonomous planning with error correction, self-improving agents, A/B testing. 13 database tables. Full marketplace rental system.</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>#</th><th>System</th><th>Detail</th></tr></thead>
                    <tbody>
                      <tr><td>8</td><td>Full SaaS Billing Stack</td><td>Stripe: Subscription/CreditBalance/CreditTransaction/UsageRecord/Invoice/PaymentMethod/PricingPlan/Coupon (8 tables). 45+ endpoints. Credit deduction per-operation tracked by service/provider/model/tokens/latency. 5 revenue streams.</td></tr>
                      <tr><td>9</td><td>RARA Governance Layer</td><td>Resonant Autonomous Runtime Architecture: CapabilityManifest, MutationRequest/Result, AgentBudget, GovernanceDecision, ExplainabilityArtifact, InvariantCheckResult. 9 capability types including code_generation, data_analysis, web_search, file_management, api_integration, blockchain_ops, ml_training, agent_creation, system_admin.</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 11 — Revenue & Billing */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentAmber} ${currentSlide === 11 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>06</span>Monetization &amp; billing infrastructure</h2>
              <p className={styles.sectionLead}>
                Complete SaaS billing stack with Stripe. 8 database tables. 45+ billing endpoints. Revenue from real Stripe payments only.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>5 revenue streams (code-supported)</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Subscription plans</strong> — Stripe recurring billing. 4 tiers: Free/Developer (1,000 credits), Plus, Pro, Enterprise. Checkout sessions, webhooks, billing portal, invoice generation.</li>
                    <li><strong>Credit packs</strong> — One-time purchases. Per-operation credit deduction tracked by service, operation, tokens, provider, model, latency.</li>
                    <li><strong>API product subscriptions</strong> — API access tiers via /checkout/api-product.</li>
                    <li><strong>Agent marketplace</strong> — Agent listing, versioning, purchase records, reviews, usage stats.</li>
                    <li><strong>Referral system</strong> — 5,000 credits for referrer, 2,000 for referred. Period grants and rollover logic.</li>
                  </ul>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Billing endpoints (45+)</h3>
                  <p className={styles.wpText}>
                    Subscriptions: GET/POST /subscription, cancel, reactivate, change-plan. Credits: GET /credits, POST /purchase, /deduct, /bonus, /refund. Usage: POST /usage/record, GET /summary, /metrics, /tokens/history, /providers, /activity, /limits, /export. Invoices: GET /invoices, /stats, /pdf. Stripe: POST /webhook, /checkout/subscription, /checkout/credits. Portal: POST /portal. Pricing: GET /pricing, /plans, /credit-packs, /credit-costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 12 — Auth & Security */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentAmber} ${currentSlide === 12 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>06b</span>Auth service &amp; security</h2>
              <p className={styles.sectionLead}>
                Enterprise-grade authentication with 10 database tables and 80+ endpoints. Multi-factor authentication, OAuth/SSO, organization management, and comprehensive security controls.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>Auth service (10 DB tables, 80+ endpoints)</h3>
                  <p className={styles.wpText}>
                    Tables: User, Organization, OrgMembership, ApiKey, UserApiKey, RefreshToken, TrustedDevice, PasswordResetToken, Agent, AgentApiKey.
                  </p>
                  <ul className={styles.wpList}>
                    <li><strong>Registration/Login</strong> — Password strength validation, account lockout after failed attempts.</li>
                    <li><strong>OAuth/SSO</strong> — Google, GitHub login. SAML SSO stubs.</li>
                    <li><strong>MFA</strong> — TOTP setup/verify/disable with backup codes.</li>
                    <li><strong>Token management</strong> — JWT access tokens + HttpOnly cookie refresh tokens.</li>
                    <li><strong>Organization management</strong> — 4 roles: admin, member, owner, platform_owner. Per-org API keys. Per-user LLM provider keys.</li>
                    <li><strong>Session management</strong> — List, revoke individual, revoke all. Trusted device CRUD.</li>
                    <li><strong>Agent settings</strong> — Full CRUD: create, update, delete, list, share, import/export, templates.</li>
                    <li><strong>Identity</strong> — crypto_hash and user_hash for blockchain anchoring (SHA-256).</li>
                  </ul>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Security features</h3>
                  <p className={styles.wpText}>
                    Bcrypt password hashing. JWT with configurable expiry. HttpOnly secure cookies (SameSite=lax). Rate limiting on login, register, password reset, token refresh. Account lockout. Audit logging with client IP/user-agent tracking. AES-encrypted API key storage. Crypto identity generation (SHA-256). Docker-isolated sandboxed code execution. Gateway auth middleware on all non-public routes. CORS per-service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 13 — Frontend Routes & API Clients */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentPink} ${currentSlide === 13 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>07</span>Frontend &amp; routes</h2>
              <p className={styles.sectionLead}>
                React 18 + TypeScript frontend with 662 components, 85+ routes, 97 API client files, CSS Modules (91K SLOC). Full page inventory from router/index.tsx.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>Frontend page inventory (85+ routes)</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Public (no auth):</strong> Landing, signup, login, pricing, enterprise, community, contact, API docs, DSID-P overview, validation tool, LLM scanner, investor pitch deck, state physics demo, resonant memory, code visualizer, rabbit social</li>
                    <li><strong>Core authenticated:</strong> Resonant Chat, user dashboard, plus/enterprise/owner dashboards, profile, settings, organization, predictions, evidence graphs</li>
                    <li><strong>Agent OS:</strong> Agent OS v2, agent dashboards, agent teams, autonomous agent dashboard, agent browser, publish, templates</li>
                    <li><strong>Marketplace:</strong> NFT/Agent marketplace, item detail, installations, purchases</li>
                    <li><strong>Dev tools:</strong> Web IDE, project builder, AI chat console v2, Hash Sphere test/fullscreen</li>
                    <li><strong>Admin:</strong> System dashboard, user management, feature flags</li>
                    <li><strong>Finance:</strong> Invoices, reports, credits &amp; refunds</li>
                    <li><strong>ML Ops:</strong> Training jobs, model versions, worker monitor, evaluation drift</li>
                    <li><strong>Enterprise control plane (9 pages):</strong> Overview, semantics, trust, governance, compliance, security, performance, live execution, guided scenarios</li>
                  </ul>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Frontend API clients (97 files)</h3>
                  <p className={styles.wpText}>
                    Each file maps to a backend service: auth, billing, blockchain, chat, code, cognitive, compliance, crypto, dashboard, evidence, governance, hashSphere, llm, marketplace, memory, metrics, mfa, ml, notifications, org, predictions, skills, storage, sso, system, teams, universe, usage, workflow, workspace. Multi-LLM provider clients: openai.ts, anthropic.ts, groq.ts, gemini.ts, mistral.ts, cohere.ts + unified router.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 14 — Technology Stack */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentPink} ${currentSlide === 14 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>07b</span>Technology stack</h2>
              <p className={styles.sectionLead}>
                Full-stack architecture spanning frontend, backend, database, containerization, payments, AI/ML, and authentication — all production-deployed and self-hosted.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
                    <tbody>
                      <tr><td>Frontend</td><td>React 18 + TypeScript, Vite build</td></tr>
                      <tr><td>Styling</td><td>CSS Modules (91K SLOC)</td></tr>
                      <tr><td>3D</td><td>Three.js (Hash Sphere visualization)</td></tr>
                      <tr><td>Router</td><td>React Router v6 (createBrowserRouter)</td></tr>
                      <tr><td>Backend</td><td>FastAPI (Python 3.11)</td></tr>
                      <tr><td>Blockchain</td><td>Node.js</td></tr>
                      <tr><td>Database</td><td>PostgreSQL (DO Managed)</td></tr>
                      <tr><td>Cache</td><td>Redis (shared instance)</td></tr>
                      <tr><td>ORM</td><td>SQLAlchemy 2.0 (async)</td></tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Layer</th><th>Technology</th></tr></thead>
                    <tbody>
                      <tr><td>Direct DB</td><td>asyncpg (gateway only)</td></tr>
                      <tr><td>Migrations</td><td>Alembic (14 services)</td></tr>
                      <tr><td>Containers</td><td>Docker + Docker Compose</td></tr>
                      <tr><td>Web Server</td><td>Nginx (SSL, reverse proxy)</td></tr>
                      <tr><td>Payments</td><td>Stripe (checkout, webhooks, portal)</td></tr>
                      <tr><td>LLM</td><td>OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere, Ollama</td></tr>
                      <tr><td>OAuth</td><td>Google, GitHub</td></tr>
                      <tr><td>ML</td><td>PyTorch</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 15 — Production Status: Implementation */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentCyan} ${currentSlide === 15 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>08</span>Production status &amp; implementation</h2>
              <p className={styles.sectionLead}>
                Live at dev-swat.com &amp; resonantgenesis.xyz with 178 registered users, 0 paying (pre-revenue). Two parallel domains serving the same platform. Single DigitalOcean droplet + managed DB. Services auto-restart on failure.
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
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Implemented — needs testing/polish</h3>
                  <ul className={styles.wpList}>
                    <li>Rabbit social platform (communities, posts, comments, votes)</li>
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

                  <h3 className={styles.wpSubtitle}>Production status</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Item</th><th>Status</th></tr></thead>
                    <tbody>
                      <tr><td>Domains</td><td>dev-swat.com &amp; resonantgenesis.xyz (active SSL)</td></tr>
                      <tr><td>Registered users</td><td>178</td></tr>
                      <tr><td>Paying users</td><td>0 (pre-revenue)</td></tr>
                      <tr><td>Containers running</td><td>33</td></tr>
                      <tr><td>Database</td><td>DO Managed PostgreSQL</td></tr>
                      <tr><td>Uptime</td><td>Auto-restart on failure</td></tr>
                      <tr><td>CI/CD</td><td>GitHub Actions</td></tr>
                      <tr><td>Frontend deploy</td><td>npm build → rsync → nginx reload</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 16 — Infrastructure & Metrics */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentCyan} ${currentSlide === 16 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>08b</span>Infrastructure &amp; service metrics</h2>
              <p className={styles.sectionLead}>
                Docker Compose: 33 containers on app-network bridge. Health checks on every service. Persistent volumes: build_projects, blockchain_node_data. Nginx serves React static build, reverse-proxies API to gateway:8001.
              </p>

              <div className={styles.wpTwoCol}>
                <div>
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
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Per-service CV stats (top 10)</h3>
                  <table className={styles.wpTable}>
                    <thead><tr><th>Service</th><th>Files</th><th>Functions</th><th>Classes</th><th>Endpoints</th></tr></thead>
                    <tbody>
                      <tr><td>agent_engine_service</td><td>157</td><td>3,486</td><td>1,214</td><td>646</td></tr>
                      <tr><td>blockchain_service</td><td>55</td><td>2,640</td><td>1,264</td><td>988</td></tr>
                      <tr><td>chat_service</td><td>100</td><td>1,884</td><td>500</td><td>226</td></tr>
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

              <h3 className={styles.wpSubtitle}>System health</h3>
              <p className={styles.wpText}>
                59,160 inter-service connections mapped. 1.76% error rate (1,043 unresolved imports — mostly cross-service refs that resolve at Docker runtime). Pre-built remediation checklist included. See Slide 02 for full CV forensic breakdown.
              </p>
            </div>
          </div>
        </div>

        {/* SLIDE 17 — Acquire: What's Included */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentBlue} ${currentSlide === 17 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>09</span>Acquire ResonantGenesis</h2>
              <p className={styles.sectionLead}>
                ~550,000 source lines of production code. 30 microservices. 33 Docker containers. 80+ database tables. 9 unique IP assets. Complete Stripe billing with 5 revenue streams. 178 registered users. Built solo in 4 months — averaging ~4,500 lines/day using the platform's own agentic infrastructure.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>What's included</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Full source code</strong> — Both repositories (backend + frontend), complete git history</li>
                    <li><strong>30-day transition support</strong> — Architecture walkthrough, deployment guidance, codebase orientation</li>
                    <li><strong>3-day unlimited live trial</strong> — Full access to production environment before committing</li>
                    <li><strong>Complete deployment runbook</strong> — Docker Compose, Nginx config, database setup, environment variables</li>
                    <li><strong>PLATFORM_SALE_REPORT.md</strong> — 873-line comprehensive technical audit</li>
                    <li><strong>All documentation</strong> — 31K lines of .md files (backend) + 4K lines (frontend)</li>
                    <li><strong>Domain transfer</strong> — dev-swat.com and resonantgenesis.xyz (both active)</li>
                    <li><strong>Infrastructure handoff</strong> — DigitalOcean droplet, managed DB, DNS, SSL certificates</li>
                  </ul>
                </div>
                <div>
                  <h3 className={styles.wpSubtitle}>Deal structures open</h3>
                  <ul className={styles.wpList}>
                    <li><strong>Full asset sale</strong> — $3,600,000</li>
                    <li><strong>Acqui-hire</strong> — Code + founder joins the team</li>
                    <li><strong>White-label licensing</strong> — License the platform for your brand/vertical</li>
                    <li><strong>Partial stake + revenue share</strong> — Co-ownership with aligned incentives</li>
                  </ul>

                  <h3 className={styles.wpSubtitle}>Self-hosted &amp; Kubernetes-ready</h3>
                  <p className={styles.wpText}>
                    Zero dependency on third-party SaaS for core functionality. Docker Compose architecture designed for direct migration to Kubernetes. Each microservice is an independent container with health checks, restart policies, and isolated networking — ready for horizontal scaling on any cloud or bare-metal hardware.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 18 — Why Selling & Ideal Buyers */}
        <div className={`${styles.slide} ${styles.slideDark} ${styles.accentBlue} ${currentSlide === 18 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}><span className={styles.sectionNum}>09b</span>Why selling &amp; ideal buyers</h2>
              <p className={styles.sectionLead}>
                Built in 4 months by a single engineer using the platform's own agentic workflows — the ultimate proof-of-concept. Replacement cost: $2M–$5M+ (18–24 months for a standard senior team). Production-ready, needs a team for go-to-market.
              </p>
              <div className={styles.wpTwoCol}>
                <div>
                  <h3 className={styles.wpSubtitle}>Ideal buyers</h3>
                  <ul className={styles.wpList}>
                    <li><strong>AI agencies / dev shops</strong> — White-label the platform. You provide clients, it provides infrastructure.</li>
                    <li><strong>SaaS companies adding AI</strong> — Skip 18+ months of agent infrastructure build. Deploy on your own hardware or cloud.</li>
                    <li><strong>Enterprise ISVs</strong> — Plug-in agent orchestration with governance, audit trails, compliance controls.</li>
                    <li><strong>Technical founders</strong> — Buy the infrastructure, focus on your vertical. 3-day trial available.</li>
                    <li><strong>AI infrastructure / MLOps companies</strong> — Unique IP: 68-module pipeline, custom blockchain, physics engine.</li>
                  </ul>
                </div>
                <div>
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

              <div className={styles.socialRow}>
                <a href="https://www.linkedin.com/company/resonantgenesis/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="https://www.youtube.com/@ResonantGenesis" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://x.com/resonantgenesis" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="X (Twitter)">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
                <a href="https://www.reddit.com/u/ResonantGenesis/" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Reddit">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
                </a>
                <a href="mailto:contact@resonantgenesis.xyz" className={styles.socialLink} aria-label="Email">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </a>
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
