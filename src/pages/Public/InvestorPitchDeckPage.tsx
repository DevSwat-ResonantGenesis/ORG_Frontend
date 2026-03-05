import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    window.scrollTo(0, 0);
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
    <div className={`${styles.page}${animate ? ` ${styles.animate}` : ''}`}>
      <Helmet>
        <title>Investor Pitch Deck – ResonantGenesis</title>
        <meta
          name="description"
          content="ResonantGenesis investor pitch deck: sovereign agent infrastructure with governed memory, constraint simulation, and full-stack observability."
        />
        <link rel="canonical" href="https://resonantgenesis.xyz/investor-pitch-deck" />
      </Helmet>

      <main className={styles.main}>
        <section ref={heroRef} className={styles.hero}>
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
                    key={`${traceIdx}-${idx}`}
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

          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.badgeRow}>
                <span className={styles.badge}>Investor Pitch Deck</span>
                <span className={styles.badge}>2026: AI systems, compliance, and autonomy</span>
              </div>

              <h1 className={styles.title}>
                Own your agent stack.
                <br />
                Govern it end-to-end. Execute.
              </h1>

              <p className={styles.subtitle}>
                ResonantGenesis is sovereign infrastructure for autonomous agents: governed memory, invariant-based constraint simulation, and full-stack observability—so teams can ship agentic products that are safe, auditable, and controllable.
              </p>

              <div className={styles.heroMetrics}>
                <div className={styles.metricCard}>
                  <p className={styles.metricValue}>Governed Memory</p>
                  <p className={styles.metricLabel}>Encrypted, attributable, retrievable</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricValue}>Constraints SIM</p>
                  <p className={styles.metricLabel}>Invariants for actions and risk</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricValue}>Evidence Graphs</p>
                  <p className={styles.metricLabel}>Explainability & audit trails</p>
                </div>
              </div>

              <div className={styles.ctaRow}>
                <button
                  type="button"
                  className={styles.ctaPrimary}
                  onClick={() => navigate('/signup')}
                >
                  <span>Request Access</span>
                  <span aria-hidden="true">→</span>
                </button>

                <button
                  ref={anchorRef}
                  type="button"
                  className={`${styles.ctaSecondary} ${styles.anchorButton}`}
                  onClick={() => navigate('/pricing')}
                >
                  <span>Pricing</span>
                  <span aria-hidden="true">↗</span>
                </button>
              </div>

              <div className={styles.traceLegend} aria-label="Trace legend">
                <div className={styles.traceLegendItem}>
                  <span className={`${styles.traceLegendSwatch} ${styles.traceLegendSwatchCyan}`} aria-hidden="true" />
                  <span>Tools</span>
                </div>
              </div>
            </div>

            <div aria-hidden="true" />
          </div>
        </section>

        <section className={styles.section}>
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
                  Long-term memory can leak secrets, amplify hallucinations, and create unclear provenance—unless it’s encrypted, scoped, and attributable.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>The solution</h2>
            <p className={styles.sectionLead}>
              ResonantGenesis is an agent infrastructure layer that turns autonomy into an engineered system—observable, governed, and resilient.
            </p>

            <div className={styles.twoCol}>
              <div>
                <h3 className={styles.cardTitle}>Core pillars</h3>
                <ul className={styles.list}>
                  <li>Resonant memory with encryption, access boundaries, and provenance.</li>
                  <li>Invariant-based constraints simulation for tool execution and safety policies.</li>
                  <li>Evidence graphs for explainability, audit, and post-incident forensics.</li>
                  <li>Full-stack observability for prompts, tools, dependencies, and latency/cost.</li>
                </ul>
              </div>
              <blockquote className={styles.quote}>
                <strong>Thesis:</strong> The winners in agentic AI won’t just have better models.
                They’ll have better infrastructure—memory, constraints, and governance that can survive production.
              </blockquote>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionInner}>
            <h2 className={styles.sectionTitle}>Business model</h2>
            <p className={styles.sectionLead}>
              Usage-based platform with premium governance and enterprise control plane.
            </p>

            <div className={styles.cardsGrid}>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Self-serve</h3>
                <p className={styles.cardBody}>
                  Developers start with a hosted experience to ship MVP agents fast.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Team & compliance</h3>
                <p className={styles.cardBody}>
                  Add policy controls, audit trails, and org management as teams scale.
                </p>
              </div>
              <div className={styles.card}>
                <h3 className={styles.cardTitle}>Enterprise</h3>
                <p className={styles.cardBody}>
                  Advanced governance, incident controls, dedicated support, and deployment options.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.footerCta}>
          <div className={styles.footerCtaInner}>
            <h2 className={styles.footerCtaTitle}>Let’s talk</h2>
            <p className={styles.footerCtaBody}>
              If you’re investing in durable infrastructure for autonomous AI, we’re building the missing layer: governed memory + constraints + observability.
              Reach out to discuss the roadmap, security posture, and go-to-market.
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
      </main>
    </div>
  );
};

export default InvestorPitchDeckPage;
