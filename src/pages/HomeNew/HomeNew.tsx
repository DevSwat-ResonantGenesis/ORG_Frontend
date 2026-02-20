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
        <title>ResonantGenesis – AI Governance Platform</title>
        <meta name="description" content="AI governance platform that harmonizes meaning across multiple AI models, providing intelligent processing, privacy, security, and enterprise‑grade APIs." />
        <link rel="canonical" href="https://resonantgenesis.xyz/" />
        <meta property="og:title" content="ResonantGenesis – AI Governance Platform" />
        <meta property="og:description" content="Intelligent AI governance for multi‑AI operations, privacy‑first, production‑ready." />
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
                  "description": "AI governance platform that harmonizes meaning across multiple AI models."
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
