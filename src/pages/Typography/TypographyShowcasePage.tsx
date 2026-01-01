import React from 'react';
import heroTitleStyles from '@/components/ui/HeroTitle.module.css';
import titleStyles from '@/components/ui/Title.module.css';
import styles from './TypographyShowcasePage.module.css';

/**
 * Typography Showcase Page
 * 
 * This page demonstrates all available typography classes and their sizes.
 * Useful for developers to see the typography hierarchy in action.
 */
const TypographyShowcasePage: React.FC = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Hero Section</h1>
          <div className={styles.heroDemo}>
            <h1 className={heroTitleStyles.heroTitle}>
              Hero Title (96px Desktop, 42px Mobile)
            </h1>
            <p className={heroTitleStyles.heroSubtitle}>
              Hero Subtitle (40px Desktop, 22px Mobile)
            </p>
          </div>
        </section>

        {/* Section Titles */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Section Titles</h1>
          <h2 className={titleStyles.sectionTitle}>
            Section Title (36px Desktop, 28px Mobile)
          </h2>
          <h2 className={titleStyles.ctaTitle}>
            CTA Title (36px Desktop, 28px Mobile)
          </h2>
        </section>

        {/* Large Titles */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Large Titles</h1>
          <h2 className={titleStyles.largeTitle}>
            Large Title (28px)
          </h2>
          <h2 className={titleStyles.resonantChatTitle}>
            Resonant Chat Title (32px)
          </h2>
          <h3 className={titleStyles.pricingName}>
            Pricing Name (28px)
          </h3>
          <h3 className={titleStyles.apiSectionTitle}>
            API Section Title (28px)
          </h3>
          <h3 className={titleStyles.sdkSectionTitle}>
            SDK Section Title (28px)
          </h3>
        </section>

        {/* Card/Feature Titles */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Card & Feature Titles</h1>
          <h3 className={titleStyles.featureTitle}>
            Feature Title (24px)
          </h3>
          <h3 className={titleStyles.serviceTitle}>
            Service Title (24px)
          </h3>
          <h3 className={titleStyles.differentiatorTitle}>
            Differentiator Title (24px)
          </h3>
          <h3 className={titleStyles.useCaseTitle}>
            Use Case Title (24px)
          </h3>
          <h3 className={titleStyles.mediumTitle}>
            Medium Title (24px)
          </h3>
        </section>

        {/* Subsection Titles */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Subsection Titles</h1>
          <h4 className={titleStyles.subsectionTitle}>
            Subsection Title (18px)
          </h4>
          <h4 className={titleStyles.capabilityTitle}>
            Capability Title (20px)
          </h4>
          <h4 className={titleStyles.architectureTitle}>
            Architecture Title (20px)
          </h4>
        </section>

        {/* Body Text */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Body Text</h1>
          <p className={styles.bodyText}>
            Body Text (15-18px) - This is the standard body text used throughout the application. 
            It should be readable and comfortable for extended reading. The font size is responsive 
            and adjusts based on the viewport size.
          </p>
          <p className={styles.bodyText}>
            This is another paragraph of body text to demonstrate spacing and readability. 
            The typography system ensures consistent spacing and line height for optimal reading experience.
          </p>
        </section>

        {/* Hierarchy Visual */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Typography Hierarchy</h1>
          <div className={styles.hierarchy}>
            <div className={styles.hierarchyItem}>
              <span className={styles.level}>Level 1</span>
              <h1 className={heroTitleStyles.heroTitle} style={{ fontSize: '96px' }}>
                Hero Title
              </h1>
            </div>
            <div className={styles.hierarchyItem}>
              <span className={styles.level}>Level 2</span>
              <p className={heroTitleStyles.heroSubtitle} style={{ fontSize: '40px' }}>
                Hero Subtitle
              </p>
            </div>
            <div className={styles.hierarchyItem}>
              <span className={styles.level}>Level 3</span>
              <h2 className={titleStyles.sectionTitle} style={{ fontSize: '36px' }}>
                Section Title
              </h2>
            </div>
            <div className={styles.hierarchyItem}>
              <span className={styles.level}>Level 4</span>
              <h2 className={titleStyles.largeTitle} style={{ fontSize: '28px' }}>
                Large Title
              </h2>
            </div>
            <div className={styles.hierarchyItem}>
              <span className={styles.level}>Level 5</span>
              <h3 className={titleStyles.featureTitle} style={{ fontSize: '24px' }}>
                Card/Feature Title
              </h3>
            </div>
            <div className={styles.hierarchyItem}>
              <span className={styles.level}>Level 6</span>
              <h4 className={titleStyles.subsectionTitle} style={{ fontSize: '18px' }}>
                Subsection Title
              </h4>
            </div>
            <div className={styles.hierarchyItem}>
              <span className={styles.level}>Level 7</span>
              <p className={styles.bodyText} style={{ fontSize: '16px' }}>
                Body Text
              </p>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className={styles.section}>
          <h1 className={styles.sectionLabel}>Usage Examples</h1>
          <div className={styles.example}>
            <h3 className={styles.exampleTitle}>Hero Section Example</h3>
            <pre className={styles.code}>
{`import heroTitleStyles from '@/components/ui/HeroTitle.module.css';

<h1 className={heroTitleStyles.heroTitle}>
  AI Governance Platform
</h1>
<p className={heroTitleStyles.heroSubtitle}>
  Complete Control for Multi-AI Operations
</p>`}
            </pre>
          </div>
          <div className={styles.example}>
            <h3 className={styles.exampleTitle}>Section with Cards Example</h3>
            <pre className={styles.code}>
{`import titleStyles from '@/components/ui/Title.module.css';

<h2 className={titleStyles.sectionTitle}>
  Our Services
</h2>
<h3 className={titleStyles.serviceTitle}>
  Service Name
</h3>`}
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TypographyShowcasePage;

