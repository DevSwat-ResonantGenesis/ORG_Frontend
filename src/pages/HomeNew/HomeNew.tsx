import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './HomeNew.module.css';

// Import sub-components
import { HeroSection } from './components/HeroSection';
import { Link } from 'react-router-dom';


const HomeNew = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      {/* SEO meta tags */}
      <Helmet>
        <title>ResonantGenesis — Agentic AI SaaS Platform</title>
        <meta name="description" content="ResonantGenesis — full-stack Agentic AI SaaS platform. ~550K lines of production code, 30 microservices, 9 proprietary IP systems, 85+ routes. Multi-agent orchestration, governed memory, physics-based state simulation, and complete billing infrastructure. Production-deployed and available for acquisition." />
        <link rel="canonical" href="https://resonantgenesis.xyz/" />
        <meta property="og:title" content="ResonantGenesis — Agentic AI SaaS Platform" />
        <meta property="og:description" content="Full-stack Agentic AI platform: ~550K lines of production code, 30 microservices, 9 proprietary IP systems. Multi-agent orchestration, governed memory, physics-based state simulation, and complete SaaS billing. Production-deployed and available for acquisition." />
        <meta property="og:url" content="https://resonantgenesis.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonantgenesis.xyz/images/investorpitch/VR1.jpg" />
        <meta property="og:image:width" content="1408" />
        <meta property="og:image:height" content="768" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="ResonantGenesis — Agentic AI SaaS Platform" />
        <meta name="twitter:description" content="Full-stack Agentic AI platform: ~550K lines of production code, 30 microservices, 9 proprietary IP systems. Production-deployed and available for acquisition." />
        <meta name="twitter:image" content="https://resonantgenesis.xyz/images/investorpitch/VR1.jpg" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "ResonantGenesis",
                  "url": "https://resonantgenesis.xyz",
                  "logo": "https://resonantgenesis.xyz/favicon.svg",
                  "description": "Autonomous agent infrastructure for action, memory, invariant-based constraint simulation, and full-stack observability."
                },
                {
                  "@type": "WebSite",
                  "name": "ResonantGenesis",
                  "url": "https://resonantgenesis.xyz",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://resonantgenesis.xyz/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>

      {/* Main Content - Streamlined for conversion */}
      <main className={styles.main}>
        <HeroSection />
      </main>
      {/* Simple one-line footer */}
      <div style={{
        padding: '12px 24px',
        textAlign: 'center',
        fontSize: '12px',
        color: 'rgba(255,255,255,0.35)',
        letterSpacing: '0.02em',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <span>© 2025 DevSwat Inc. San Francisco, CA</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <Link to="/privacy-policy" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>Privacy</Link>
        <Link to="/terms-of-service" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>Terms</Link>
        <span style={{ opacity: 0.4 }}>·</span>
        <a href="mailto:info@dev-swat.com" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}>info@dev-swat.com</a>
      </div>
    </div>
  );
};

export default HomeNew;
