import React, { useState } from 'react';
import styles from '../HomeNew.module.css';

export const TechnologySection = () => {
    const codeVisualizerImages = [
        '/images/technology/visualizer-1.png',
        '/images/technology/visualizer-2.png',
        '/images/technology/visualizer-3.png',
        '/images/technology/visualizer-4.png',
        '/images/technology/visualizer-5.png',
    ];

    const statePhysicsImages = [
        '/images/technology/physics-1.png',
        '/images/technology/physics-2.png',
    ];

    const [visualizerIndex, setVisualizerIndex] = useState(0);
    const [physicsIndex, setPhysicsIndex] = useState(0);

    return (
        <>
            {/* Code Visualizer Section */}
            <section className={styles.technologySection}>
                <div className={styles.sectionContent}>
                    <div className={styles.sectionHeader}>
                        <p className={styles.sectionBadge}>Our Technology</p>
                        <h2 className={styles.technologyTitle}>Built for Transparency</h2>
                        <p className={styles.sectionDescription}>
                            See exactly what your AI is doing. Every action visualized, every state tracked.
                        </p>
                    </div>

                    {/* Code Visualizer Content */}
                    <div className={styles.technologyContent}>
                        <div className={styles.technologyInfo}>
                            <h3 className={styles.technologyInfoTitle}>Code Visualizer</h3>
                            <p className={styles.technologyInfoDesc}>
                                Real-time visualization of your codebase structure, dependencies, and AI-driven analysis. 
                                See how your code connects, identify patterns, and understand complexity at a glance.
                            </p>
                            <ul className={styles.technologyFeatures}>
                                <li>Dependency graph visualization</li>
                                <li>Real-time code analysis</li>
                                <li>Pattern detection</li>
                                <li>Complexity metrics</li>
                                <li>AI-powered insights</li>
                            </ul>
                        </div>

                        <div className={styles.technologyDisplay}>
                            <div className={styles.technologyScreenshot}>
                                <img
                                    src={codeVisualizerImages[visualizerIndex]}
                                    alt="Code Visualizer"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                                            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
                                                <rect fill="#1e293b" width="800" height="500"/>
                                                <text x="400" y="250" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14">
                                                    Add: visualizer-${visualizerIndex + 1}.png
                                                </text>
                                            </svg>
                                        `);
                                    }}
                                />
                            </div>
                            {codeVisualizerImages.length > 1 && (
                                <div className={styles.technologyThumbnails}>
                                    {codeVisualizerImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles.technologyThumbnail} ${visualizerIndex === idx ? styles.technologyThumbnailActive : ''}`}
                                            onClick={() => setVisualizerIndex(idx)}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${idx + 1}`}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <span>{idx + 1}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* State Physics Section - Standalone */}
            <section className={styles.technologySection} style={{ marginTop: '4rem' }}>
                <div className={styles.sectionContent}>
                    <div className={styles.sectionHeader}>
                        <p className={styles.sectionBadge}>State Physics</p>
                        <h2 className={styles.technologyTitle}>Real-Time AI State Visualization</h2>
                        <p className={styles.sectionDescription}>
                            Watch your AI's state evolve in real-time with physics-based visualization.
                        </p>
                    </div>

                    {/* State Physics Content */}
                    <div className={styles.technologyContent}>
                        <div className={styles.technologyInfo}>
                            <h3 className={styles.technologyInfoTitle}>State Physics Engine</h3>
                            <p className={styles.technologyInfoDesc}>
                                Watch your AI's state evolve in real-time. Our physics-based visualization shows 
                                every state transition, every decision point, and every governance check as it happens.
                            </p>
                            <ul className={styles.technologyFeatures}>
                                <li>Real-time state visualization</li>
                                <li>Physics-based particle system</li>
                                <li>Governance flow tracking</li>
                                <li>Decision point analysis</li>
                            </ul>
                        </div>

                        <div className={styles.technologyDisplay}>
                            <div className={styles.technologyScreenshot}>
                                <img
                                    src={statePhysicsImages[physicsIndex]}
                                    alt="State Physics"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                                            <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
                                                <rect fill="#1e293b" width="800" height="500"/>
                                                <text x="400" y="250" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14">
                                                    Add: physics-${physicsIndex + 1}.png
                                                </text>
                                            </svg>
                                        `);
                                    }}
                                />
                            </div>
                            {statePhysicsImages.length > 1 && (
                                <div className={styles.technologyThumbnails}>
                                    {statePhysicsImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            className={`${styles.technologyThumbnail} ${physicsIndex === idx ? styles.technologyThumbnailActive : ''}`}
                                            onClick={() => setPhysicsIndex(idx)}
                                        >
                                            <img
                                                src={img}
                                                alt={`Thumbnail ${idx + 1}`}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                            <span>{idx + 1}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
