import React, { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import styles from './InvestorPitchDeckPage.module.css';

const ThreeParticleSphere = React.lazy(() => import('@/components/features/landing/ThreeParticleSphere'));

const InvestorPitchDeckPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement | null>(null);
  const sphereRef = useRef<HTMLDivElement | null>(null);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const [pathD, setPathD] = useState<string>('');
  const [heroSize, setHeroSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [animate, setAnimate] = useState(false);
  const [activePanel, setActivePanel] = useState<'pitch' | 'codebase'>('pitch');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActivePanel((p) => (p === 'pitch' ? 'codebase' : 'pitch'));
    }, 5000);
    return () => window.clearInterval(interval);
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

    const updatePath = () => {
      const heroEl = heroRef.current;
      const sphereEl = sphereRef.current;
      const anchorEl = anchorRef.current;
      if (!heroEl || !sphereEl || !anchorEl) return;

      const heroRect = heroEl.getBoundingClientRect();
      const sphereRect = sphereEl.getBoundingClientRect();
      const anchorRect = anchorEl.getBoundingClientRect();

      setHeroSize({ width: heroRect.width, height: heroRect.height });

      const startX = anchorRect.right - heroRect.left - 14;
      const startY = anchorRect.top - heroRect.top + 10;

      const endX = sphereRect.left - heroRect.left + sphereRect.width * 0.55;
      const endY = sphereRect.top - heroRect.top + sphereRect.height * 0.45;

      const midX = (startX + endX) * 0.5;
      const c1X = midX + 140;
      const c1Y = startY - 120;
      const c2X = midX - 180;
      const c2Y = endY + 120;

      setPathD(`M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`);
    };

    updatePath();
    window.addEventListener('resize', updatePath);
    return () => window.removeEventListener('resize', updatePath);
  }, [prefersReducedMotion]);

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
                <svg className={styles.orbit} viewBox="0 0 120 120" aria-hidden="true">
                  <circle className={styles.orbitRing} cx="60" cy="60" r="46" />
                </svg>
                <div className={styles.sphereLayer}>{isReactSnap ? null : <ThreeParticleSphere />}</div>
              </div>
            </Suspense>
          </div>

          {!prefersReducedMotion && pathD && heroSize.width > 0 && heroSize.height > 0 && (
            <svg
              className={styles.noodleOverlay}
              aria-hidden="true"
              width="100%"
              height="100%"
              viewBox={`0 0 ${heroSize.width} ${heroSize.height}`}
              preserveAspectRatio="none"
            >
              <path className={styles.noodlePath} d={pathD} />
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

              <div className={styles.switchPanel}>
                <div className={styles.switchTabs} role="tablist" aria-label="Investor pitch details">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activePanel === 'pitch'}
                    className={`${styles.switchTab}${activePanel === 'pitch' ? ` ${styles.switchTabActive}` : ''}`}
                    onClick={() => setActivePanel('pitch')}
                  >
                    Pitch
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activePanel === 'codebase'}
                    className={`${styles.switchTab}${activePanel === 'codebase' ? ` ${styles.switchTabActive}` : ''}`}
                    onClick={() => setActivePanel('codebase')}
                  >
                    Codebase
                  </button>
                </div>

                {activePanel === 'pitch' ? (
                  <div className={styles.switchBody} role="tabpanel">
                    <p className={styles.switchText}>
                      A sovereign platform for agentic AI that prioritizes control: governed memory, invariant-based constraints, and observability—so autonomy is safe to ship.
                    </p>
                  </div>
                ) : (
                  <div className={styles.switchBody} role="tabpanel">
                    <p className={styles.switchText}>
                      Codebase details are generated from an automated architecture scan (Code Visualizer). This section will populate with live metrics and component breakdowns.
                    </p>
                  </div>
                )}
              </div>

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
