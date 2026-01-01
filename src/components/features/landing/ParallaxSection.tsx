import React, { useEffect, useRef, useState } from 'react';
import { EnterpriseGraphics } from './EnterpriseGraphics';
import './parallaxSection.css';

interface ParallaxSectionProps {
  children: React.ReactNode;
  className?: string;
  graphicsVariant?: 'hero' | 'section' | 'background';
  graphicsIntensity?: 'subtle' | 'medium' | 'strong';
  parallaxSpeed?: number;
  enableGraphics?: boolean;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({
  children,
  className = '',
  graphicsVariant = 'section',
  graphicsIntensity = 'medium',
  parallaxSpeed = 0.5,
  enableGraphics = true,
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight && rect.bottom > 0;
        setIsVisible(isInView);
        
        if (isInView) {
          // Calculate parallax offset based on scroll position relative to section
          const sectionTop = rect.top;
          const sectionHeight = rect.height;
          const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - sectionTop) / (window.innerHeight + sectionHeight)));
          setScrollY(scrollProgress * 100);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const parallaxOffset = scrollY * parallaxSpeed;

  return (
    <section
      ref={sectionRef}
      className={`parallax-section ${className} ${isVisible ? 'visible' : ''}`}
      style={{
        '--parallax-offset': `${parallaxOffset}px`,
      } as React.CSSProperties}
    >
      {enableGraphics && (
        <EnterpriseGraphics
          variant={graphicsVariant}
          intensity={graphicsIntensity}
        />
      )}
      <div className="parallax-content">
        {children}
      </div>
    </section>
  );
};

export default ParallaxSection;

