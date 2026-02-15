import React, { useEffect, useRef, useState } from 'react';
import './scrollReveal.css';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className = '',
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;
    const scrollRoot = (el.closest('.main-content') as Element) || null;

    let didReveal = false;

    const failSafe = window.setTimeout(() => {
      if (!didReveal) {
        setIsVisible(true);
      }
    }, Math.max(1200, 1200 + delay));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            didReveal = true;
            window.clearTimeout(failSafe);
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
            observer.disconnect();
          }
        });
      },
      {
        threshold: 0.1,
        root: scrollRoot,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    observer.observe(el);

    return () => {
      window.clearTimeout(failSafe);
      observer.disconnect();
    };
  }, [delay]);

  const getTransform = () => {
    switch (direction) {
      case 'up':
        return `translateY(${distance}px)`;
      case 'down':
        return `translateY(-${distance}px)`;
      case 'left':
        return `translateX(${distance}px)`;
      case 'right':
        return `translateX(-${distance}px)`;
      case 'fade':
        return 'none';
      default:
        return `translateY(${distance}px)`;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`scroll-reveal scroll-reveal-${direction} ${className} ${isVisible ? 'visible' : ''}`}
      style={{
        '--reveal-distance': `${distance}px`,
        '--reveal-duration': `${duration}s`,
        '--reveal-delay': `${delay}s`,
        '--reveal-transform': getTransform(),
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;

