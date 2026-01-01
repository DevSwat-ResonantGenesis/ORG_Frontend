import React, { useEffect, useRef, useState } from 'react';
import './enterpriseGraphics.css';

interface EnterpriseGraphicsProps {
  variant?: 'hero' | 'section' | 'background';
  intensity?: 'subtle' | 'medium' | 'strong';
}

export const EnterpriseGraphics: React.FC<EnterpriseGraphicsProps> = ({
  variant = 'hero',
  intensity = 'medium',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        setIsVisible(isInView);
        if (isInView) {
          setScrollY(window.scrollY);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const intensityMultiplier = {
    subtle: 0.3,
    medium: 0.6,
    strong: 1.0,
  }[intensity];

  const parallaxOffset = scrollY * 0.3 * intensityMultiplier;

  return (
    <div
      ref={containerRef}
      className={`enterprise-graphics enterprise-graphics-${variant} ${isVisible ? 'visible' : ''}`}
    >
      {/* Animated Grid Background */}
      <div className="eg-grid-layer">
        <svg className="eg-grid-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern
              id="grid-pattern"
              x="0"
              y="0"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
              />
            </pattern>
            <linearGradient id="grid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-500)" stopOpacity="0.1" />
              <stop offset="50%" stopColor="var(--accent-500)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--accent-500)" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          <rect width="100%" height="100%" fill="url(#grid-gradient)" />
        </svg>
      </div>

      {/* Floating Nodes */}
      <div className="eg-nodes-layer">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="eg-node"
            style={{
              left: `${(i * 73) % 100}%`,
              top: `${(i * 47) % 100}%`,
              animationDelay: `${i * 0.2}s`,
              transform: `translate(0, ${parallaxOffset * 0.5}px)`,
            }}
          >
            <div className="eg-node-core"></div>
            <div className="eg-node-ring"></div>
            <div className="eg-node-pulse"></div>
          </div>
        ))}
      </div>

      {/* Connection Lines */}
      <div className="eg-connections-layer">
        <svg className="eg-connections-svg" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent-500)" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--accent-500)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-500)" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[...Array(8)].map((_, i) => {
            const x1 = (i * 125) % 1000;
            const y1 = (i * 187) % 1000;
            const x2 = ((i * 125) + 200) % 1000;
            const y2 = ((i * 187) + 150) % 1000;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="url(#line-gradient)"
                strokeWidth="1"
                opacity="0.2"
                className="eg-connection-line"
                style={{
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            );
          })}
        </svg>
      </div>

      {/* Data Flow Particles */}
      <div className="eg-particles-layer">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="eg-particle"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            <div className="eg-particle-dot"></div>
            <div className="eg-particle-trail"></div>
          </div>
        ))}
      </div>

      {/* Geometric Shapes */}
      <div className="eg-shapes-layer">
        <div
          className="eg-shape eg-shape-1"
          style={{
            transform: `translate(0, ${parallaxOffset * 0.3}px) rotate(${scrollY * 0.1}deg)`,
          }}
        >
          <svg viewBox="0 0 200 200">
            <polygon
              points="100,20 180,60 180,140 100,180 20,140 20,60"
              fill="none"
              stroke="var(--accent-500)"
              strokeWidth="2"
              opacity="0.15"
            />
          </svg>
        </div>
        <div
          className="eg-shape eg-shape-2"
          style={{
            transform: `translate(0, ${parallaxOffset * 0.4}px) rotate(${-scrollY * 0.15}deg)`,
          }}
        >
          <svg viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--accent-500)"
              strokeWidth="2"
              opacity="0.1"
            />
            <circle
              cx="100"
              cy="100"
              r="50"
              fill="none"
              stroke="var(--accent-500)"
              strokeWidth="1"
              opacity="0.15"
            />
          </svg>
        </div>
        <div
          className="eg-shape eg-shape-3"
          style={{
            transform: `translate(0, ${parallaxOffset * 0.2}px) rotate(${scrollY * 0.2}deg)`,
          }}
        >
          <svg viewBox="0 0 200 200">
            <rect
              x="50"
              y="50"
              width="100"
              height="100"
              fill="none"
              stroke="var(--accent-500)"
              strokeWidth="2"
              opacity="0.12"
              transform="rotate(45 100 100)"
            />
          </svg>
        </div>
      </div>

      {/* Gradient Orbs */}
      <div className="eg-orbs-layer">
        <div
          className="eg-orb eg-orb-1"
          style={{
            transform: `translate(0, ${parallaxOffset * 0.25}px)`,
          }}
        ></div>
        <div
          className="eg-orb eg-orb-2"
          style={{
            transform: `translate(0, ${parallaxOffset * 0.35}px)`,
          }}
        ></div>
        <div
          className="eg-orb eg-orb-3"
          style={{
            transform: `translate(0, ${parallaxOffset * 0.3}px)`,
          }}
        ></div>
      </div>
    </div>
  );
};

export default EnterpriseGraphics;

