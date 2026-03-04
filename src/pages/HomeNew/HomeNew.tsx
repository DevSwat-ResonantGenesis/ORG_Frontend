import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './HomeNew.module.css';

// Import sub-components
import { HeroSection } from './components/HeroSection';
 

const HomeNew = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      {/* SEO meta tags */}
      <Helmet>
        <title>ResonantGenesis – Autonomous Agent Infrastructure</title>
        <meta name="description" content="Build and operate autonomous agents with a unified stack for action, synthetic neural memory, invariant-based constraint simulation, and full-stack architecture observability. Ship reliable agent systems with governance, security, and remediation built in." />
        <link rel="canonical" href="https://resonantgenesis.xyz/" />
        <meta property="og:title" content="ResonantGenesis – Autonomous Agent Infrastructure" />
        <meta property="og:description" content="AGI Neural Hub + Synthetic Neural Memory + Invariants SIM + SAST & Dependency Graph Analysis—an end-to-end platform for autonomous action, memory, constraints, and full-stack observability." />
        <meta property="og:url" content="https://resonantgenesis.xyz/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://resonantgenesis.xyz/images/showcase/step5-homepage.png" />
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
    </div>
  );
};

export default HomeNew;
