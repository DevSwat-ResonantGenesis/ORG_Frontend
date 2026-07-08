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
        <title>DevSwat — Agentic AI Infrastructure</title>
        <meta name="description" content="DevSwat — Build, run, and schedule autonomous AI agents. AI-powered IDE with DevSwat intelligence, personalized chat with smart routing, AST/SAST code analysis, 9-layer semantic memory, and RARA governance. Connect any LLM provider. Unlimited platform integrations. Fully self-hosted." />
        <link rel="canonical" href="https://dev-swat.com/" />
        <meta property="og:title" content="DevSwat — Agentic AI Infrastructure" />
        <meta property="og:description" content="Build, run, and schedule autonomous AI agents. AI-powered IDE, personalized chat with smart routing, AST/SAST code analysis, and RARA governance. Connect any LLM provider. Your agents, your data, your infrastructure." />
        <meta property="og:url" content="https://dev-swat.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://dev-swat.com/devswat/DevSwat.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DevSwat — Agentic AI Infrastructure" />
        <meta name="twitter:description" content="Build, run, and schedule autonomous AI agents. AI IDE, personalized chat, smart routing, AST/SAST code analysis, and RARA governance. Fully self-hosted." />
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
                  "description": "Agentic AI infrastructure for building, running, and scheduling server and local agents. Built-in IDE, AST/SAST code analysis, and RARA governance."
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
