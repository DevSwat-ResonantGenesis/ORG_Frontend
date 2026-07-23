import React, { useEffect, useRef } from 'react';
import styles from '../HomeNew.module.css';

export const VideoSection = () => {
    const videoRef = useRef<HTMLIFrameElement>(null);
    const sectionRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && videoRef.current) {
                        // Video ID from YouTube URL
                        const videoId = '0cyzNC5fzJU';
                        // Replace with autoplay version
                        videoRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&loop=1&playlist=${videoId}`;
                    }
                });
            },
            { threshold: 0.5 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => {
            if (sectionRef.current) {
                observer.unobserve(sectionRef.current);
            }
        };
    }, []);

    return (
        <section 
            ref={sectionRef}
            className={`${styles.heroScrollSection} ${styles.videoSection}`}
            style={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'black',
                position: 'relative'
            }}
        >
            <h2 
                style={{
                    color: 'white',
                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                    fontWeight: '600',
                    textAlign: 'center',
                    maxWidth: '1200px',
                    padding: '0 20px',
                    marginBottom: '40px',
                    lineHeight: '1.4'
                }}
            >
                AI is no longer just about powerful LLMs—it's about the infrastructure they are connected to.
            </h2>
            <div 
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    aspectRatio: '16/9',
                    padding: '0 20px'
                }}
            >
                <iframe
                    ref={videoRef}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '12px'
                    }}
                    src=""
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            </div>
        </section>
    );
};
