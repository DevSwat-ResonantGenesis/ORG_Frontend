import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import styles from './HomeRebuild.module.css';


const HomeNew = () => {
  const navigate = useNavigate();

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

      <main className={styles.hero}>
        <section className={styles.left}>
          <h1 className={styles.title}>
            Digitalize Your
            <br />
            Vision
          </h1>
          <p className={styles.subtitle}>Simpler Than Ever</p>
          <button className={styles.cta} onClick={() => navigate('/signup')}>
            GET STARTED
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </button>
        </section>

        <section className={styles.right} aria-hidden="true">
          <div className={`${styles.card} ${styles.cardDark}`} />
          <div className={`${styles.card} ${styles.cardYellowTall}`} />
          <div className={`${styles.card} ${styles.cardOrange}`} />
          <div className={`${styles.card} ${styles.cardBlueWide}`} />
          <div className={`${styles.card} ${styles.cardPink}`} />
          <div className={`${styles.card} ${styles.cardLight}`} />
          <div className={`${styles.card} ${styles.cardGreen}`} />
          <span className={styles.labelCode}>Code</span>
          <span className={styles.labelGov}>Governance</span>
        </section>
      </main>
    </div>
  );
};

export default HomeNew;
