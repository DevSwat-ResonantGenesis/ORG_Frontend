import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import styles from './HomeNew.module.css';

// Import sub-components
import { HeroSection } from './components/HeroSection';
import { TrustSignalsSection } from './components/TrustSignalsSection';
import { DifferentiatorsSection } from './components/DifferentiatorsSection';
import { GovernedExecutionSection } from './components/GovernedExecutionSection';
import { InterfacesSection } from './components/InterfacesSection';
import { ProductShowcaseSection } from './components/ProductShowcaseSection';
import { TechnologySection } from './components/TechnologySection';
import { HashSphereMemoryShowcase } from './components/HashSphereMemoryShowcase';
import { CTASection } from './components/CTASection';
import { FooterSection } from './components/FooterSection';

import ScrollReveal from '@/components/features/landing/ScrollReveal';

const HomeNew = () => {
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`${styles.page} page`}>
      {/* SEO meta tags */}
      <Helmet>
        <title>ResonantGenesis – AI Governance Platform</title>
        <meta name="description" content="AI governance platform that harmonizes meaning across multiple AI models, providing intelligent processing, privacy, security, and enterprise‑grade APIs." />
        <link rel="canonical" href="https://yourdomain.com/" />
        <meta property="og:title" content="ResonantGenesis – AI Governance Platform" />
        <meta property="og:description" content="Intelligent AI governance for multi‑AI operations, privacy‑first, production‑ready." />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://yourdomain.com/og-image.png" />
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "ResonantGenesis",
                  "url": "https://yourdomain.com",
                  "logo": "https://yourdomain.com/logo.png",
                  "description": "AI governance platform that harmonizes meaning across multiple AI models."
                },
                {
                  "@type": "WebSite",
                  "name": "ResonantGenesis",
                  "url": "https://yourdomain.com",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://yourdomain.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            }
          `}
        </script>
      </Helmet>

      {/* Main Content - Streamlined for conversion */}
      <main className={`${styles.main} main`}>
        {/* 1. Hero - First impression & value proposition */}
        <ScrollReveal direction="fade" duration={0.8}>
          <HeroSection />
        </ScrollReveal>

        {/* 2. Trust Signals - Enterprise badges */}
        <TrustSignalsSection />

        {/* 3. How It Works - Simple explanation */}
        <ScrollReveal direction="up">
          <GovernedExecutionSection />
        </ScrollReveal>

        {/* 4. Interfaces - Show what you offer */}
        <ScrollReveal direction="up">
          <InterfacesSection />
        </ScrollReveal>

        {/* 5. Product Showcase - From Idea to Production */}
        <ScrollReveal direction="up">
          <ProductShowcaseSection />
        </ScrollReveal>

        {/* 6. Our Technology - Code Visualizer & State Physics */}
        <ScrollReveal direction="up">
          <TechnologySection />
        </ScrollReveal>

        {/* 7. Hash Sphere Memory */}
        <ScrollReveal direction="up">
          <HashSphereMemoryShowcase />
        </ScrollReveal>

        {/* 8. Why ResonantGenesis - Key differentiators */}
        <ScrollReveal direction="up" delay={0.2}>
          <DifferentiatorsSection />
        </ScrollReveal>

        {/* 6. Early Access CTA - Drive signups */}
        <ScrollReveal direction="up">
          <CTASection />
        </ScrollReveal>

        {/* 7. Footer */}
        <ScrollReveal direction="fade">
          <FooterSection />
        </ScrollReveal>
      </main>
    </div>
  );
};

export default HomeNew;
