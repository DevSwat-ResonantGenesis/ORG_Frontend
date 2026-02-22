import React, { useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Download, Maximize2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  alt?: string;
  thumbnail?: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  columns?: 2 | 3 | 4 | 5;
  gap?: string;
  aspectRatio?: 'square' | '4:3' | '16:9' | 'auto';
  showCaptions?: boolean;
  enableLightbox?: boolean;
  className?: string;
}

const ASPECT_RATIOS: Record<string, string> = {
  square: '100%',
  '4:3': '75%',
  '16:9': '56.25%',
  auto: 'auto',
};

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    width: '100%',
  },
  imageWrapper: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: '10px',
    cursor: 'pointer',
    background: 'rgba(255, 255, 255, 0.03)',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s',
  },
  imageHover: {
    transform: 'scale(1.05)',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(transparent 50%, rgba(0, 0, 0, 0.7))',
    opacity: 0,
    transition: 'opacity 0.3s',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '1rem',
  },
  overlayVisible: {
    opacity: 1,
  },
  caption: {
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  zoomIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    opacity: 0,
    transition: 'opacity 0.3s',
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lightboxImage: {
    maxWidth: '90vw',
    maxHeight: '85vh',
    objectFit: 'contain',
    borderRadius: '8px',
  },
  lightboxClose: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
    width: '44px',
    height: '44px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  lightboxNav: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  lightboxPrev: {
    left: '1rem',
  },
  lightboxNext: {
    right: '1rem',
  },
  lightboxCaption: {
    position: 'absolute',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    color: '#fff',
    fontSize: '1rem',
    textAlign: 'center',
    maxWidth: '80%',
  },
  lightboxCounter: {
    position: 'absolute',
    top: '1rem',
    left: '1rem',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '0.875rem',
  },
  lightboxActions: {
    position: 'absolute',
    top: '1rem',
    right: '4rem',
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '50%',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

const GalleryItem: React.FC<{
  image: GalleryImage;
  aspectRatio: string;
  showCaption: boolean;
  onClick: () => void;
}> = ({ image, aspectRatio, showCaption, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={styles.imageWrapper}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          ...styles.imageContainer,
          paddingBottom: aspectRatio === 'auto' ? undefined : aspectRatio,
        }}
      >
        <img
          src={image.thumbnail || image.src}
          alt={image.alt || ''}
          style={{
            ...styles.image,
            ...(isHovered ? styles.imageHover : {}),
            ...(aspectRatio === 'auto' ? { position: 'relative' } : {}),
          }}
          loading="lazy"
        />
      </div>
      <div
        style={{
          ...styles.overlay,
          ...(isHovered ? styles.overlayVisible : {}),
        }}
      >
        {showCaption && image.caption && (
          <span style={styles.caption}>{image.caption}</span>
        )}
      </div>
      <ZoomIn
        size={24}
        style={{
          ...styles.zoomIcon,
          opacity: isHovered ? 1 : 0,
        }}
      />
    </div>
  );
};

const Lightbox: React.FC<{
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}> = ({ images, currentIndex, onClose, onPrev, onNext }) => {
  const currentImage = images[currentIndex];

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft') onPrev();
    if (e.key === 'ArrowRight') onNext();
  }, [onClose, onPrev, onNext]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage.src;
    link.download = currentImage.alt || 'image';
    link.click();
  };

  return (
    <div
      style={styles.lightbox}
      onClick={onClose}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <span style={styles.lightboxCounter}>
        {currentIndex + 1} / {images.length}
      </span>

      <div style={styles.lightboxActions}>
        <button
          style={styles.actionButton}
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
          title="Download"
        >
          <Download size={18} />
        </button>
      </div>

      <button style={styles.lightboxClose} onClick={onClose}>
        <X size={20} />
      </button>

      {images.length > 1 && (
        <>
          <button
            style={{ ...styles.lightboxNav, ...styles.lightboxPrev }}
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            style={{ ...styles.lightboxNav, ...styles.lightboxNext }}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <img
        src={currentImage.src}
        alt={currentImage.alt || ''}
        style={styles.lightboxImage}
        onClick={(e) => e.stopPropagation()}
      />

      {currentImage.caption && (
        <div style={styles.lightboxCaption}>{currentImage.caption}</div>
      )}
    </div>
  );
};

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  columns = 3,
  gap = '0.75rem',
  aspectRatio = 'square',
  showCaptions = true,
  enableLightbox = true,
  className,
}) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    if (enableLightbox) {
      setLightboxIndex(index);
    }
  };

  const closeLightbox = () => setLightboxIndex(null);

  const goToPrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === images.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <>
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap,
        }}
        className={className}
      >
        {images.map((image, index) => (
          <GalleryItem
            key={image.id}
            image={image}
            aspectRatio={ASPECT_RATIOS[aspectRatio]}
            showCaption={showCaptions}
            onClick={() => openLightbox(index)}
          />
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onPrev={goToPrev}
          onNext={goToNext}
        />
      )}
    </>
  );
};

export default ImageGallery;
