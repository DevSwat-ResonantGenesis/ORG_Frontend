import React, { useState } from 'react';
import styles from '../HomeNew.module.css';

export const TechnologySection = () => {
    const [activeTab, setActiveTab] = useState<'visualizer' | 'physics'>('visualizer');

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

    const currentImages = activeTab === 'visualizer' ? codeVisualizerImages : statePhysicsImages;
    const currentIndex = activeTab === 'visualizer' ? visualizerIndex : physicsIndex;
    const setCurrentIndex = activeTab === 'visualizer' ? setVisualizerIndex : setPhysicsIndex;

    return (
        <section className={styles.technologySection}>
            <div className={styles.sectionContent}>
                <div className={styles.sectionHeader}>
                    <p className={styles.sectionBadge}>Our Technology</p>
                    <h2 className={styles.technologyTitle}>Built for Transparency</h2>
                    <p className={styles.sectionDescription}>
                        See exactly what your AI is doing. Every action visualized, every state tracked.
                    </p>
                </div>

                {/* Tab Switcher */}
                <div className={styles.technologyTabs}>
                    <button
                        className={`${styles.technologyTab} ${activeTab === 'visualizer' ? styles.technologyTabActive : ''}`}
                        onClick={() => setActiveTab('visualizer')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="16 18 22 12 16 6"/>
                            <polyline points="8 6 2 12 8 18"/>
                        </svg>
                        Code Visualizer
                    </button>
                    <button
                        className={`${styles.technologyTab} ${activeTab === 'physics' ? styles.technologyTabActive : ''}`}
                        onClick={() => setActiveTab('physics')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                        </svg>
                        State Physics
                    </button>
                </div>

                {/* Content Area */}
                <div className={styles.technologyContent}>
                    {/* Description */}
                    <div className={styles.technologyInfo}>
                        {activeTab === 'visualizer' ? (
                            <>
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
                            </>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>

                    {/* Screenshot Display */}
                    <div className={styles.technologyDisplay}>
                        <div className={styles.technologyScreenshot}>
                            <img
                                src={currentImages[currentIndex]}
                                alt={activeTab === 'visualizer' ? 'Code Visualizer' : 'State Physics'}
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml,' + encodeURIComponent(`
                                        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
                                            <rect fill="#1e293b" width="800" height="500"/>
                                            <text x="400" y="250" text-anchor="middle" fill="#64748b" font-family="system-ui" font-size="14">
                                                Add: ${activeTab === 'visualizer' ? 'visualizer' : 'physics'}-${currentIndex + 1}.png
                                            </text>
                                        </svg>
                                    `);
                                }}
                            />
                        </div>
                        {/* Thumbnail Navigation */}
                        {currentImages.length > 1 && (
                            <div className={styles.technologyThumbnails}>
                                {currentImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={`${styles.technologyThumbnail} ${currentIndex === idx ? styles.technologyThumbnailActive : ''}`}
                                        onClick={() => setCurrentIndex(idx)}
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
    );
};
