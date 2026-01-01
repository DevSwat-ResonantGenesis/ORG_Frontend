/**
 * Business Dashboard Page
 * Displays revenue streams, licensing, partnerships, and projections
 */

import React, { useState, useEffect } from 'react';
import { 
  getRevenueStreams, 
  getLicensingTiers, 
  getRevenueProjections,
  getPartnerCategories,
  getTargetIndustries 
} from '@/api/dsidProtocol';
import styles from './ProtocolPages.module.css';

interface RevenueStream {
  stream: string;
  name: string;
  description: string;
  pricing_model: string;
  typical_revenue: string;
}

interface LicensingTier {
  tier: string;
  name: string;
  scale: string;
  price_range: string;
  includes: string[];
}

interface RevenueProjection {
  period: string;
  revenue: string;
  drivers: string;
}

interface PartnerCategory {
  category_id: string;
  name: string;
  description: string;
  examples: string[];
}

interface TargetIndustry {
  industry_id: string;
  name: string;
  why_dsidp: string;
  key_requirements: string[];
}

const BusinessDashboard: React.FC = () => {
  const [streams, setStreams] = useState<RevenueStream[]>([]);
  const [tiers, setTiers] = useState<LicensingTier[]>([]);
  const [projections, setProjections] = useState<RevenueProjection[]>([]);
  const [partners, setPartners] = useState<PartnerCategory[]>([]);
  const [industries, setIndustries] = useState<TargetIndustry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [streamsRes, tiersRes, projectionsRes, partnersRes, industriesRes] = await Promise.all([
          getRevenueStreams(),
          getLicensingTiers(),
          getRevenueProjections(),
          getPartnerCategories(),
          getTargetIndustries(),
        ]);
        setStreams(streamsRes.streams || []);
        setTiers(tiersRes.tiers || []);
        setProjections(projectionsRes.projections || []);
        setPartners(partnersRes.categories || []);
        setIndustries(industriesRes.industries || []);
      } catch (err) {
        console.error('Failed to load business data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Loading business data...</div>;

  return (
    <div className={styles.dashboardContainer}>

      {/* Revenue Projections */}
      <section className={styles.section}>
        <h2>Revenue Projections</h2>
        <div className={styles.projectionsGrid}>
          {projections.map((p) => (
            <div key={p.period} className={styles.projectionCard}>
              <span className={styles.projectionPeriod}>{p.period}</span>
              <span className={styles.projectionRevenue}>{p.revenue}</span>
              <p className={styles.projectionDrivers}>{p.drivers}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Revenue Streams */}
      <section className={styles.section}>
        <h2>Revenue Streams ({streams.length})</h2>
        <div className={styles.streamsGrid}>
          {streams.map((stream) => (
            <div key={stream.stream} className={styles.streamCard}>
              <h3>{stream.name}</h3>
              <p>{stream.description}</p>
              <div className={styles.streamDetails}>
                <span className={styles.pricingModel}>{stream.pricing_model}</span>
                <span className={styles.typicalRevenue}>{stream.typical_revenue}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Licensing Tiers */}
      <section className={styles.section}>
        <h2>Licensing Tiers</h2>
        <div className={styles.licensingGrid}>
          {tiers.map((tier) => (
            <div key={tier.tier} className={`${styles.licensingCard} ${styles[`tier-${tier.tier}`]}`}>
              <h3>{tier.name}</h3>
              <span className={styles.tierScale}>{tier.scale}</span>
              <span className={styles.tierPrice}>{tier.price_range}</span>
              <div className={styles.tierIncludes}>
                <h4>Includes:</h4>
                <ul>
                  {tier.includes?.slice(0, 4).map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partner Categories */}
      <section className={styles.section}>
        <h2>Partner Categories ({partners.length})</h2>
        <div className={styles.partnersGrid}>
          {partners.map((partner) => (
            <div key={partner.category_id} className={styles.partnerCard}>
              <h3>{partner.name}</h3>
              <p>{partner.description}</p>
              <div className={styles.partnerExamples}>
                {partner.examples?.map((ex, idx) => (
                  <span key={idx} className={styles.exampleTag}>{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Target Industries */}
      <section className={styles.section}>
        <h2>Target Industries ({industries.length})</h2>
        <div className={styles.industriesGrid}>
          {industries.map((industry) => (
            <div key={industry.industry_id} className={styles.industryCard}>
              <h3>{industry.name}</h3>
              <p className={styles.industryWhy}>{industry.why_dsidp}</p>
              <div className={styles.industryRequirements}>
                {industry.key_requirements?.map((req, idx) => (
                  <span key={idx} className={styles.requirementTag}>{req}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BusinessDashboard;
