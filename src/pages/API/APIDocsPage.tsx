import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Brain, Atom, Zap, Shield, Lock, Database, 
  ArrowRight, Check, Code, Key, ExternalLink,
  Copy, Server
} from 'lucide-react';
import styles from './APIDocsPage.module.css';

const APIDocsPage: React.FC = () => {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const products = [
    {
      id: 'hash-sphere',
      name: 'Hash Sphere Memory API',
      tagline: 'Invariant-Governed Long-Term Memory',
      description: 'Persistent, encrypted, high-dimensional memory for AI systems with conservation laws that ensure state can evolve but never break.',
      icon: <Brain size={32} />,
      color: 'cyan',
      features: [
        'High-dimensional semantic embeddings (1536-dim)',
        'Encrypted memory at rest (AES-256-GCM)',
        'Deterministic memory clustering',
        'Invariant enforcement with violation signals',
        'Memory replay & audit trail',
        'API-first architecture'
      ],
      pricing: [
        { tier: 'Starter', price: '$49/mo', units: '100K Memory Units' },
        { tier: 'Builder', price: '$299/mo', units: '2M Memory Units', popular: true },
        { tier: 'Scale', price: '$1,200/mo', units: '10M Memory Units' },
        { tier: 'Enterprise', price: 'Custom', units: 'Unlimited' }
      ],
      endpoints: [
        { method: 'POST', path: '/hash-sphere/memory/write', desc: 'Write memory entry' },
        { method: 'GET', path: '/hash-sphere/memory/query', desc: 'Query by similarity' },
        { method: 'POST', path: '/hash-sphere/memory/evolve', desc: 'Evolve memory state' },
        { method: 'GET', path: '/hash-sphere/invariants/check', desc: 'Check invariants' }
      ],
      cta: 'Explore Hash Sphere API',
      link: '/api/hash-sphere-memory'
    },
    {
      id: 'state-physics',
      name: 'State Physics API',
      tagline: 'Constraint-Governed State Simulation',
      description: 'Model complex systems with conservation laws. Detect anomalies, validate invariants, and simulate multi-agent behaviors.',
      icon: <Atom size={32} />,
      color: 'purple',
      features: [
        'State-space simulation with conservation laws',
        'Real-time invariant enforcement',
        'Anomaly detection via violation signals',
        'Multi-agent swarm simulation',
        'Fraud detection & trust networks',
        'Distributed system monitoring'
      ],
      pricing: [
        { tier: 'Dev', price: '$49/mo', units: '100K Simulation Units' },
        { tier: 'Startup', price: '$299/mo', units: '2M Simulation Units', popular: true },
        { tier: 'Enterprise', price: '$2K-$10K/mo', units: 'Custom allocation' }
      ],
      endpoints: [
        { method: 'POST', path: '/state-physics/generate', desc: 'Create universe' },
        { method: 'GET', path: '/state-physics/state', desc: 'Get current state' },
        { method: 'POST', path: '/state-physics/simulate', desc: 'Run simulation' },
        { method: 'GET', path: '/state-physics/invariants', desc: 'Check violations' }
      ],
      cta: 'Explore State Physics API',
      link: '/api/state-physics'
    }
  ];

  const codeExamples = {
    'hash-sphere': `curl -X POST "https://api.dev-swat.com/hash-sphere/memory/write" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "content": "User prefers dark mode and concise responses",
    "metadata": {"source": "preferences", "priority": "high"}
  }'`,
    'state-physics': `curl -X POST "https://api.dev-swat.com/state-physics/simulate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "steps": 100,
    "validate_invariants": true,
    "detect_anomalies": true
  }'`
  };

  return (
    <div className={styles.apiPage}>
      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero}>
          <div className={styles.heroBadge}>
            <Code size={16} />
            <span>Developer APIs</span>
          </div>
          <h1>DevSwat API Platform</h1>
          <p className={styles.heroSubtitle}>
            Build with physics-governed AI infrastructure. Memory that remembers, 
            state that evolves, invariants that protect.
          </p>
          <div className={styles.heroActions}>
            <button 
              className={styles.primaryBtn}
              onClick={() => navigate('/api-keys')}
            >
              <Key size={18} />
              Get API Keys
            </button>
            <button 
              className={styles.secondaryBtn}
              onClick={() => navigate('/help')}
            >
              <ExternalLink size={18} />
              Documentation
            </button>
          </div>
        </header>

        {/* Products */}
        <section className={styles.productsSection}>
          <h2>Our API Products</h2>
          <p className={styles.sectionSubtitle}>
            Two powerful APIs for building intelligent, governed AI systems
          </p>

          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div 
                key={product.id} 
                className={`${styles.productCard} ${styles[product.color]}`}
              >
                <div className={styles.productHeader}>
                  <div className={styles.productIcon}>
                    {product.icon}
                  </div>
                  <div>
                    <h3>{product.name}</h3>
                    <p className={styles.productTagline}>{product.tagline}</p>
                  </div>
                </div>

                <p className={styles.productDesc}>{product.description}</p>

                <div className={styles.productFeatures}>
                  <h4>Key Features</h4>
                  <ul>
                    {product.features.map((feature, idx) => (
                      <li key={idx}>
                        <Check size={14} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={styles.productPricing}>
                  <h4>Pricing Tiers</h4>
                  <div className={styles.pricingTiers}>
                    {product.pricing.map((tier, idx) => (
                      <div 
                        key={idx} 
                        className={`${styles.pricingTier} ${tier.popular ? styles.popular : ''}`}
                      >
                        <span className={styles.tierName}>{tier.tier}</span>
                        <span className={styles.tierPrice}>{tier.price}</span>
                        <span className={styles.tierUnits}>{tier.units}</span>
                        {tier.popular && <span className={styles.popularBadge}>Popular</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.productEndpoints}>
                  <h4>API Endpoints</h4>
                  <div className={styles.endpointsList}>
                    {product.endpoints.map((ep, idx) => (
                      <div key={idx} className={styles.endpoint}>
                        <span className={`${styles.method} ${ep.method === 'GET' ? styles.get : styles.post}`}>
                          {ep.method}
                        </span>
                        <code>{ep.path}</code>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  className={styles.productCta}
                  onClick={() => navigate(product.link)}
                >
                  {product.cta}
                  <ArrowRight size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Code Examples */}
        <section className={styles.codeSection}>
          <h2>Quick Start Examples</h2>
          <p className={styles.sectionSubtitle}>
            Get started in minutes with our simple REST API
          </p>

          <div className={styles.codeExamples}>
            {products.map((product) => (
              <div key={product.id} className={styles.codeBlock}>
                <div className={styles.codeHeader}>
                  <span>{product.name}</span>
                  <button 
                    onClick={() => copyToClipboard(codeExamples[product.id as keyof typeof codeExamples], product.id)}
                    className={styles.copyBtn}
                  >
                    {copiedCode === product.id ? <Check size={14} /> : <Copy size={14} />}
                    {copiedCode === product.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre>
                  <code>{codeExamples[product.id as keyof typeof codeExamples]}</code>
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className={styles.whySection}>
          <h2>Why DevSwat APIs?</h2>
          <div className={styles.whyGrid}>
            <div className={styles.whyCard}>
              <Shield size={24} />
              <h4>Invariant Protection</h4>
              <p>Conservation laws ensure your AI state can evolve but never break</p>
            </div>
            <div className={styles.whyCard}>
              <Lock size={24} />
              <h4>Enterprise Security</h4>
              <p>AES-256-GCM encryption, audit trails, and compliance exports</p>
            </div>
            <div className={styles.whyCard}>
              <Zap size={24} />
              <h4>Real-Time Processing</h4>
              <p>Sub-millisecond invariant checks with hard real-time guarantees</p>
            </div>
            <div className={styles.whyCard}>
              <Database size={24} />
              <h4>Semantic Memory</h4>
              <p>High-dimensional embeddings with deterministic clustering</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaCard}>
            <h2>Ready to Build?</h2>
            <p>Get your API keys and start building with physics-governed AI infrastructure today.</p>
            <div className={styles.ctaActions}>
              <button 
                className={styles.primaryBtn}
                onClick={() => navigate('/api-keys')}
              >
                <Key size={18} />
                Get API Keys
              </button>
              <button 
                className={styles.secondaryBtn}
                onClick={() => navigate('/pricing')}
              >
                View Pricing
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default APIDocsPage;
