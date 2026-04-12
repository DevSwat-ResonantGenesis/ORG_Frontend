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
        <title>DevSwat — Digitalize Your Vision</title>
        <meta name="description" content="DevSwat helps you digitalize your vision with governed AI systems, code automation, memory, and autonomous workflows." />
        <link rel="canonical" href="https://dev-swat.com/" />
        <meta property="og:title" content="DevSwat — Digitalize Your Vision" />
        <meta property="og:description" content="Digitalize your vision with DevSwat. Simpler than ever." />
        <meta property="og:url" content="https://dev-swat.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <meta property="og:image:width" content="1408" />
        <meta property="og:image:height" content="768" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DevSwat — Digitalize Your Vision" />
        <meta name="twitter:description" content="Digitalize your vision with DevSwat. Simpler than ever." />
        <meta name="twitter:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "DevSwat",
                  "url": "https://dev-swat.com",
                  "logo": "https://dev-swat.com/devswat/favicon.svg",
                  "description": "Digitalize your vision with governed autonomous systems, code, memory, and orchestration."
                },
                {
                  "@type": "WebSite",
                  "name": "DevSwat",
                  "url": "https://dev-swat.com",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://dev-swat.com/search?q={search_term_string}",
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
