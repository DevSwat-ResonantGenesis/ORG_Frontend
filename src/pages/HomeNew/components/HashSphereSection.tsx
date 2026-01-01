import React, { useState } from 'react';
import titleStyles from '@/components/ui/Title.module.css';
import styles from '../HomeNew.module.css';

// SVG Icon Components
const SphereIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <ellipse cx="12" cy="12" rx="10" ry="4"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
);

const BrainIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.54"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.54"/>
    </svg>
);

const SearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.3-4.3"/>
    </svg>
);

const ZapIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
);

const CodeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/>
        <polyline points="8 6 2 12 8 18"/>
    </svg>
);

const DatabaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
);

export const HashSphereSection = () => {
    const [activeDemo, setActiveDemo] = useState<'hash' | 'resonance' | null>(null);
    const [demoInput, setDemoInput] = useState('');
    const [demoResult, setDemoResult] = useState<any>(null);

    const features = [
        {
            icon: <BrainIcon />,
            title: "Semantic Understanding",
            description: "Goes beyond keywords to understand meaning. Content with similar concepts clusters together automatically."
        },
        {
            icon: <SphereIcon />,
            title: "3D Memory Space",
            description: "Every piece of content maps to coordinates in a 3D space, enabling spatial organization and visualization."
        },
        {
            icon: <SearchIcon />,
            title: "Resonance Search",
            description: "Find content by meaning, not just words. Query with concepts and get semantically relevant results."
        },
        {
            icon: <ZapIcon />,
            title: "Magnetic Retrieval",
            description: "Strong matches get boosted automatically. The most relevant memories surface faster."
        }
    ];

    const useCases = [
        "AI Agent Memory",
        "Knowledge Bases",
        "Semantic Search",
        "Content Deduplication",
        "Recommendation Systems",
        "Document Clustering"
    ];

    const codeExample = `// Hash any text into semantic space
const response = await fetch('/api/v1/hash-sphere/hash', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: "Machine learning improves with more data",
    include_coordinates: true
  })
});

// Response
{
  "hash": "a7f3b2c1e4d5f6...",
  "coordinates": { "x": 0.342, "y": 0.718, "z": 0.156 },
  "processing_time_ms": 2.4
}`;

    const resonanceExample = `// Find semantic similarity between content
const response = await fetch('/api/v1/hash-sphere/resonance', {
  method: 'POST',
  body: JSON.stringify({
    text_a: "AI learns from data patterns",
    text_b: "Machine learning improves with more data",
    boost_strong_matches: true
  })
});

// Response
{
  "resonance_score": 0.847,
  "boosted_score": 0.923,
  "relationship": "highly_similar"
}`;

    return (
        <section id="hash-sphere" className={styles.interfacesSection}>
            <div className={styles.sectionContent}>
                {/* Header - same as InterfacesSection */}
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>Core Technology</p>
                    <h2 className={titleStyles.sectionTitle}>Hash Sphere Memory</h2>
                    <p className={styles.sectionDescription}>
                        Revolutionary semantic memory system that understands meaning, not just words.
                    </p>
                </div>

                {/* Grid - same layout as InterfacesSection */}
                <div className={styles.interfacesGrid}>
                    {features.map((feature, index) => (
                        <div key={index} className={styles.interfaceCard}>
                            <div className={styles.differentiatorIcon}>
                                {feature.icon}
                            </div>
                            <h3 className={titleStyles.differentiatorTitle}>{feature.title}</h3>
                            <p className={styles.differentiatorDescription}>{feature.description}</p>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};

export default HashSphereSection;
