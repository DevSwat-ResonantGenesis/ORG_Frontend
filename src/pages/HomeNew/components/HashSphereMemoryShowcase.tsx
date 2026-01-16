import React from 'react';
import styles from '../HomeNew.module.css';

export const HashSphereMemoryShowcase = () => {
    return (
        <section className={styles.hashSphereShowcase}>
            <div className={styles.hashSphereContent}>
                {/* Left: Screenshot */}
                <div className={styles.hashSphereImage}>
                    <img
                        src="/images/technology/hashsphere-memory.png"
                        alt="Hash Sphere Memory"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                                <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
                                    <rect fill="#0f172a" width="800" height="600"/>
                                    <circle cx="400" cy="300" r="150" fill="none" stroke="#3b82f6" stroke-width="2" opacity="0.3"/>
                                    <circle cx="400" cy="300" r="100" fill="none" stroke="#8b5cf6" stroke-width="2" opacity="0.5"/>
                                    <circle cx="400" cy="300" r="50" fill="none" stroke="#06b6d4" stroke-width="2" opacity="0.7"/>
                                    <text x="400" y="300" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14">
                                        Add: hashsphere-memory.png
                                    </text>
                                </svg>
                            `);
                        }}
                    />
                </div>

                {/* Right: Description */}
                <div className={styles.hashSphereInfo}>
                    <p className={styles.sectionBadge}>Persistent Memory</p>
                    <h2 className={styles.hashSphereTitle}>Hash Sphere Memory</h2>
                    <p className={styles.hashSphereDesc}>
                        Your AI remembers everything — across conversations, sessions, and even different models.
                        Our 6-cluster semantic encoding with 3D coordinate mapping stores context permanently in an encrypted Hash Sphere,
                        enabling 87.5% retrieval accuracy with sub-millisecond query times.
                    </p>

                    {/* Technical Specs */}
                    <div className={styles.hashSphereSpecs}>
                        <div className={styles.hashSphereSpec}>
                            <span className={styles.hashSphereSpecValue}>AES-256-GCM</span>
                            <span className={styles.hashSphereSpecLabel}>Military-Grade Encryption</span>
                        </div>
                        <div className={styles.hashSphereSpec}>
                            <span className={styles.hashSphereSpecValue}>6 Clusters</span>
                            <span className={styles.hashSphereSpecLabel}>Semantic Classification</span>
                        </div>
                        <div className={styles.hashSphereSpec}>
                            <span className={styles.hashSphereSpecValue}>87.5%</span>
                            <span className={styles.hashSphereSpecLabel}>Retrieval Accuracy</span>
                        </div>
                    </div>

                    {/* Comparison Table */}
                    <div className={styles.hashSphereComparison}>
                        <p className={styles.hashSphereComparisonTitle}>vs Other AI Platforms</p>
                        <div className={styles.hashSphereComparisonGrid}>
                            <div className={styles.hashSphereComparisonItem}>
                                <span className={styles.hashSphereComparisonName}>OpenAI</span>
                                <span className={styles.hashSphereComparisonValue}>No persistent memory</span>
                                <span className={styles.hashSphereComparisonNote}>Session-only context</span>
                            </div>
                            <div className={styles.hashSphereComparisonItem}>
                                <span className={styles.hashSphereComparisonName}>Gemini</span>
                                <span className={styles.hashSphereComparisonValue}>No persistent memory</span>
                                <span className={styles.hashSphereComparisonNote}>Session-only context</span>
                            </div>
                            <div className={styles.hashSphereComparisonItem}>
                                <span className={styles.hashSphereComparisonName}>Claude</span>
                                <span className={styles.hashSphereComparisonValue}>No persistent memory</span>
                                <span className={styles.hashSphereComparisonNote}>Session-only context</span>
                            </div>
                            <div className={`${styles.hashSphereComparisonItem} ${styles.hashSphereComparisonItemHighlight}`}>
                                <span className={styles.hashSphereComparisonName}>ResonantGenesis</span>
                                <span className={styles.hashSphereComparisonValue}>Hash Sphere Memory</span>
                                <span className={styles.hashSphereComparisonNote}>AES-256-GCM encrypted</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.hashSphereFeatures}>
                        <div className={styles.hashSphereFeature}>
                            <div className={styles.hashSphereFeatureIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                </svg>
                            </div>
                            <div>
                                <h4>6-Cluster Semantic Encoding</h4>
                                <p>Alpha, Beta, Gamma, Delta, Epsilon, Zeta classification with temperature & polarity</p>
                            </div>
                        </div>
                        
                        <div className={styles.hashSphereFeature}>
                            <div className={styles.hashSphereFeatureIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <path d="M12 6v6l4 2"/>
                                </svg>
                            </div>
                            <div>
                                <h4>3D Coordinate Mapping</h4>
                                <p>XYZ positioning with resonance function R(h), anchor energy E_j(s), and spin vectors</p>
                            </div>
                        </div>
                        
                        <div className={styles.hashSphereFeature}>
                            <div className={styles.hashSphereFeatureIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                                </svg>
                            </div>
                            <div>
                                <h4>Hybrid 7-Signal Ranking</h4>
                                <p>RAG + Resonance + Proximity + Recency + Anchor + R(h) + E_j(s) scoring</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
