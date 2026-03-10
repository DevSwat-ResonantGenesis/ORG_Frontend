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

        {/* SLIDE 1 — Hero Section */}
        <div ref={heroRef} className={`${styles.slide} ${styles.slideDark} ${currentSlide === 1 ? styles.slideActive : ''}`}>
          <div className={styles.parallax} aria-hidden="true">
            <Suspense fallback={null}>
              <div ref={sphereRef} className={styles.parallaxInner}>
                <div ref={sphereLayerRef} className={styles.sphereLayer}>
                  {isReactSnap ? null : <ThreeParticleSphere />}
                </div>
              </div>
            </Suspense>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <p className={styles.sectionLead}>
                ResonantGenesis is sovereign infrastructure for autonomous agents: governed memory, invariant-based constraint simulation, and full-stack observability—so teams can ship agentic products that are safe, auditable, and controllable.
              </p>

              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Governed Memory</h3>
                  <p className={styles.cardBody}>Encrypted, attributable, retrievable</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Constraints SIM</h3>
                  <p className={styles.cardBody}>Invariants for actions and risk</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Evidence Graphs</h3>
                  <p className={styles.cardBody}>Explainability & audit trails</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 2 — Platform Scale */}
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 2 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}>Platform scale</h2>
              <p className={styles.sectionLead}>
                ~550,000 source lines of code across 30 microservices, 662 React components, and 85+ pages. Every component is implemented and running in production.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>~550K SLOC</h3>
                  <p className={styles.cardBody}>~209K Python backend (30 FastAPI services, 843 files). ~250K TypeScript/React frontend (662 components, 97 API clients). ~91K CSS Modules.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>33 Docker containers</h3>
                  <p className={styles.cardBody}>docker-compose.unified.yml. Kubernetes-ready architecture. Database-per-service design. Health checks on every service. Nginx SSL reverse proxy.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>80+ database tables</h3>
                  <p className={styles.cardBody}>DigitalOcean Managed PostgreSQL with separate DATABASE_URL per service. Alembic migrations across 14 services. Redis for caching, sessions, pub-sub.</p>
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
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 4 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}>The problem</h2>
              <p className={styles.sectionLead}>
                AI teams can ship demos fast, but production-grade autonomy is blocked by three realities: memory safety, action safety, and governance.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Agents break silently</h3>
                  <p className={styles.cardBody}>
                    When tools, prompts, or dependencies change, behavior drifts. Without traces and invariants, failures are discovered after damage.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Governance is bolted on</h3>
                  <p className={styles.cardBody}>
                    Compliance requirements are growing. Teams need explainability, audit logs, and policy controls built into the platform.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Memory is a liability</h3>
                  <p className={styles.cardBody}>
                    Long-term memory can leak secrets, amplify hallucinations, and create unclear provenance—unless it's encrypted, scoped, and attributable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 5 — Architecture & Services */}
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 5 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}>Architecture &amp; services</h2>
              <p className={styles.sectionLead}>
                30 FastAPI microservices. 6 LLM providers with smart failover: OpenAI, Anthropic, Groq, Gemini, Mistral, Cohere. Bring-your-own-key supported.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>68-module AI pipeline</h3>
                  <p className={styles.cardBody}>Hallucination detection, evidence graphs, RAG, debate engine, causal reasoning, personality DNA, autonomous planning, narrative continuity, cross-validation, thought branching.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Agent engine (13 tables)</h3>
                  <p className={styles.cardBody}>Agent creation, versioning, teams, voting, debate, chaining, autonomous planning with error correction, safety rules, economic budgets. Full CRUD + marketplace rental.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Code Visualizer (20+ endpoints)</h3>
                  <p className={styles.cardBody}>Scans GitHub repos, dependency graphs, function tracing, governance reports, AI code reviews, codebase comparison. Persistent saved analyses with per-plan storage limits.</p>
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
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 7 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}>Unique intellectual property</h2>
              <p className={styles.sectionLead}>
                10 proprietary systems built from scratch — not wrappers around existing APIs. Custom blockchain, physics engine, ML embeddings, governance layer.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>DSID-P Protocol (8 tables)</h3>
                  <p className={styles.cardBody}>Decentralized State Identity Protocol: blocks, transactions, merkle roots, hash anchoring, audit entries, state snapshots. Immutable cryptographic verification.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Hash Sphere / State Physics</h3>
                  <p className={styles.cardBody}>Physics-based state management: 3D coordinates, forces (attraction/repulsion/resonance/gravity), spin, energy, conservation invariants. Unique in AI infrastructure.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>RARA Governance Layer</h3>
                  <p className={styles.cardBody}>Resonant Autonomous Runtime Architecture: capability manifests, mutation proposals, agent budgets, governance decisions, explainability artifacts, invariant verification.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 8 — Business model */}
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 8 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}>Business model</h2>
              <p className={styles.sectionLead}>
                5 revenue streams ready to generate income. Complete Stripe integration with subscriptions, credits, marketplace, and referral system.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Stripe subscriptions (4 tiers)</h3>
                  <p className={styles.cardBody}>
                    Free (1,000 credits on signup), Plus, Pro, Enterprise. Checkout sessions, webhooks, billing portal, invoice generation. 45+ billing endpoints.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Credits + marketplace</h3>
                  <p className={styles.cardBody}>
                    Per-operation credit deduction tracked by service, provider, model, tokens, latency. Credit packs, API products. Agent marketplace purchases + rentals.
                  </p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Referral system</h3>
                  <p className={styles.cardBody}>
                    5,000 credits for referrer, 2,000 for referred. Usage analytics dashboard, transaction history, billing breakdown. Ready to charge from day one.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 9 — Security & Multi-tenant */}
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 9 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}>Security &amp; multi-tenant</h2>
              <p className={styles.sectionLead}>
                Enterprise-grade auth with 80+ endpoints. Multi-tenant organizations with role-based access, plan-based feature gating, and 9-page enterprise control plane.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Auth (10 DB tables)</h3>
                  <p className={styles.cardBody}>OAuth (Google/GitHub), MFA (TOTP + backup codes), JWT + HttpOnly cookies, AES-encrypted API keys, rate limiting, account lockout, bcrypt hashing, session management.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Multi-tenant (4 roles)</h3>
                  <p className={styles.cardBody}>Organizations: admin, member, owner, platform_owner. Per-org API keys, per-user LLM provider keys. Plan-based feature gating. Enterprise control plane with 9 dashboards.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Sandboxed execution</h3>
                  <p className={styles.cardBody}>Docker-isolated code execution. Multi-language sandbox runner. Gateway auth middleware on all non-public routes. Audit logging with IP/user-agent tracking. CORS per-service.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 10 — Infrastructure detail */}
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 10 ? styles.slideActive : ''}`}>
          <div className={styles.section}>
            <div className={styles.sectionInner}>
              <h2 className={styles.sectionTitle}>Production deployment</h2>
              <p className={styles.sectionLead}>
                Live at dev-swat.com with 178 registered users. Kubernetes-ready architecture on DigitalOcean. Complete CI/CD via GitHub Actions.
              </p>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>33 Docker containers</h3>
                  <p className={styles.cardBody}>docker-compose.unified.yml. Nginx SSL termination + reverse proxy. SQLAlchemy QueuePool (critical) + NullPool (non-critical). Health checks + auto-restart on every service.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Database per service</h3>
                  <p className={styles.cardBody}>DigitalOcean Managed PostgreSQL with separate DATABASE_URL per service. Alembic migrations across 14 services. Redis shared instance. Persistent volumes for models + blockchain data.</p>
                </div>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>What's included</h3>
                  <p className={styles.cardBody}>Full source code (both repos), 30-day transition support, 3-day live trial, complete deployment runbook, PLATFORM_SALE_REPORT.md technical audit. $50K–$150K negotiable.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SLIDE 11 — Let's talk (footer CTA) */}
        <div className={`${styles.slide} ${styles.slideDark} ${currentSlide === 11 ? styles.slideActive : ''}`}>
          <section className={styles.footerCta}>
            <div className={styles.footerCtaInner}>
              <h2 className={styles.footerCtaTitle}>Acquire ResonantGenesis</h2>
              <p className={styles.footerCtaBody}>
                ~550K source lines of production code. 30 microservices. 10 unique IP assets. Full Stripe billing. 178 users. Built solo — needs a team to take to market. Asking $50K–$150K. Acqui-hire, white-label, partial stake open.
              </p>
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
          </section>
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
