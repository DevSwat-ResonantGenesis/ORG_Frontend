import React, { useState, useRef, useEffect, useCallback } from 'react';

type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
type PopoverTrigger = 'click' | 'hover';

interface PopoverProps {
  trigger: React.ReactNode;
  content: React.ReactNode;
  placement?: PopoverPlacement;
  triggerType?: PopoverTrigger;
  offset?: number;
  showArrow?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'relative',
    display: 'inline-block',
  },
  trigger: {
    cursor: 'pointer',
  },
  popover: {
    position: 'absolute',
    zIndex: 1000,
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '10px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    padding: '0.75rem 1rem',
    minWidth: '150px',
    animation: 'popoverFadeIn 0.15s ease-out',
  },
  arrow: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    background: '#1a1a24',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transform: 'rotate(45deg)',
  },
  content: {
    color: '#ccc',
    fontSize: '0.875rem',
  },
};

const getPlacementStyles = (
  placement: PopoverPlacement,
  offset: number
): { popover: React.CSSProperties; arrow: React.CSSProperties } => {
  const base = {
    popover: {} as React.CSSProperties,
    arrow: {} as React.CSSProperties,
  };

  switch (placement) {
    case 'top':
      base.popover = { bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: offset };
      base.arrow = { bottom: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderTop: 'none', borderLeft: 'none' };
      break;
    case 'top-start':
      base.popover = { bottom: '100%', left: 0, marginBottom: offset };
      base.arrow = { bottom: '-6px', left: '16px', transform: 'rotate(45deg)', borderTop: 'none', borderLeft: 'none' };
      break;
    case 'top-end':
      base.popover = { bottom: '100%', right: 0, marginBottom: offset };
      base.arrow = { bottom: '-6px', right: '16px', transform: 'rotate(45deg)', borderTop: 'none', borderLeft: 'none' };
      break;
    case 'bottom':
      base.popover = { top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: offset };
      base.arrow = { top: '-6px', left: '50%', transform: 'translateX(-50%) rotate(45deg)', borderBottom: 'none', borderRight: 'none' };
      break;
    case 'bottom-start':
      base.popover = { top: '100%', left: 0, marginTop: offset };
      base.arrow = { top: '-6px', left: '16px', transform: 'rotate(45deg)', borderBottom: 'none', borderRight: 'none' };
      break;
    case 'bottom-end':
      base.popover = { top: '100%', right: 0, marginTop: offset };
      base.arrow = { top: '-6px', right: '16px', transform: 'rotate(45deg)', borderBottom: 'none', borderRight: 'none' };
      break;
    case 'left':
      base.popover = { right: '100%', top: '50%', transform: 'translateY(-50%)', marginRight: offset };
      base.arrow = { right: '-6px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderBottom: 'none', borderLeft: 'none' };
      break;
    case 'right':
      base.popover = { left: '100%', top: '50%', transform: 'translateY(-50%)', marginLeft: offset };
      base.arrow = { left: '-6px', top: '50%', transform: 'translateY(-50%) rotate(45deg)', borderTop: 'none', borderRight: 'none' };
      break;
  }

  return base;
};

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  placement = 'bottom',
  triggerType = 'click',
  offset = 8,
  showArrow = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  isOpen: controlledIsOpen,
  onOpenChange,
  className,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const setIsOpen = useCallback((value: boolean) => {
    setInternalIsOpen(value);
    onOpenChange?.(value);
  }, [onOpenChange]);

  useEffect(() => {
    if (!closeOnClickOutside || !isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickOutside, isOpen, setIsOpen]);

  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, setIsOpen]);

  const handleTriggerClick = () => {
    if (triggerType === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (triggerType === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (triggerType === 'hover') {
      hoverTimeoutRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 100);
    }
  };

  const placementStyles = getPlacementStyles(placement, offset);

  return (
    <div
      ref={containerRef}
      style={styles.container}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div style={styles.trigger} onClick={handleTriggerClick}>
        {trigger}
      </div>

      {isOpen && (
        <div style={{ ...styles.popover, ...placementStyles.popover }}>
          {showArrow && <div style={{ ...styles.arrow, ...placementStyles.arrow }} />}
          <div style={styles.content}>{content}</div>
        </div>
      )}
    </div>
  );
};

// Popover with header and footer
interface PopoverPanelProps extends PopoverProps {
  title?: string;
  footer?: React.ReactNode;
}

export const PopoverPanel: React.FC<PopoverPanelProps> = ({
  trigger,
  content,
  title,
  footer,
  placement = 'bottom',
  triggerType = 'click',
  offset = 8,
  showArrow = true,
  closeOnClickOutside = true,
  closeOnEscape = true,
  isOpen,
  onOpenChange,
  className,
}) => {
  const panelContent = (
    <div>
      {title && (
        <div
          style={{
            fontWeight: '600',
            color: '#fff',
            marginBottom: '0.5rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {title}
        </div>
      )}
      <div>{content}</div>
      {footer && (
        <div
          style={{
            marginTop: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );

  return (
    <Popover
      trigger={trigger}
      content={panelContent}
      placement={placement}
      triggerType={triggerType}
      offset={offset}
      showArrow={showArrow}
      closeOnClickOutside={closeOnClickOutside}
      closeOnEscape={closeOnEscape}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={className}
    />
  );
};

export default Popover;
