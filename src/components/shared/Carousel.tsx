import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';

interface CarouselSlide {
  id: string;
  content: React.ReactNode;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  infinite?: boolean;
  slidesToShow?: number;
  gap?: string;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
  },
  track: {
    display: 'flex',
    transition: 'transform 0.4s ease-out',
  },
  slide: {
    flexShrink: 0,
  },
  arrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.5)',
    border: 'none',
    borderRadius: '50%',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    zIndex: 10,
  },
  arrowHover: {
    background: 'rgba(0, 0, 0, 0.7)',
  },
  arrowDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  arrowLeft: {
    left: '1rem',
  },
  arrowRight: {
    right: '1rem',
  },
  dots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.3)',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    padding: 0,
  },
  dotActive: {
    background: '#6366f1',
    transform: 'scale(1.2)',
  },
};

export const Carousel: React.FC<CarouselProps> = ({
  slides,
  autoPlay = false,
  autoPlayInterval = 5000,
  showArrows = true,
  showDots = true,
  infinite = true,
  slidesToShow = 1,
  gap = '0',
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredArrow, setHoveredArrow] = useState<'left' | 'right' | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = slides.length;
  const maxIndex = Math.max(0, totalSlides - slidesToShow);

  const goToSlide = useCallback((index: number) => {
    let newIndex = index;
    if (infinite) {
      if (index < 0) newIndex = maxIndex;
      else if (index > maxIndex) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(index, maxIndex));
    }
    setCurrentIndex(newIndex);
  }, [infinite, maxIndex]);

  const goToPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (autoPlay && !isHovered) {
      autoPlayRef.current = setInterval(goToNext, autoPlayInterval);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [autoPlay, autoPlayInterval, isHovered, goToNext]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  const slideWidth = 100 / slidesToShow;
  const translateX = -(currentIndex * slideWidth);

  const canGoPrev = infinite || currentIndex > 0;
  const canGoNext = infinite || currentIndex < maxIndex;

  return (
    <div
      style={styles.container}
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        ref={trackRef}
        style={{
          ...styles.track,
          transform: `translateX(${translateX}%)`,
          gap,
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            style={{
              ...styles.slide,
              width: `${slideWidth}%`,
            }}
          >
            {slide.content}
          </div>
        ))}
      </div>

      {showArrows && totalSlides > slidesToShow && (
        <>
          <button
            style={{
              ...styles.arrow,
              ...styles.arrowLeft,
              ...(hoveredArrow === 'left' ? styles.arrowHover : {}),
              ...(!canGoPrev ? styles.arrowDisabled : {}),
            }}
            onClick={goToPrev}
            onMouseEnter={() => setHoveredArrow('left')}
            onMouseLeave={() => setHoveredArrow(null)}
            disabled={!canGoPrev}
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            style={{
              ...styles.arrow,
              ...styles.arrowRight,
              ...(hoveredArrow === 'right' ? styles.arrowHover : {}),
              ...(!canGoNext ? styles.arrowDisabled : {}),
            }}
            onClick={goToNext}
            onMouseEnter={() => setHoveredArrow('right')}
            onMouseLeave={() => setHoveredArrow(null)}
            disabled={!canGoNext}
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {showDots && totalSlides > slidesToShow && (
        <div style={styles.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              style={{
                ...styles.dot,
                ...(index === currentIndex ? styles.dotActive : {}),
              }}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Simple image carousel variant
interface ImageCarouselProps {
  images: { id: string; src: string; alt?: string }[];
  aspectRatio?: string;
  autoPlay?: boolean;
  className?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  aspectRatio = '56.25%',
  autoPlay = true,
  className,
}) => {
  const slides = images.map((img) => ({
    id: img.id,
    content: (
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: aspectRatio,
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      >
        <img
          src={img.src}
          alt={img.alt || ''}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
  }));

  return (
    <Carousel
      slides={slides}
      autoPlay={autoPlay}
      showArrows={true}
      showDots={true}
      infinite={true}
      className={className}
    />
  );
};

export default Carousel;
