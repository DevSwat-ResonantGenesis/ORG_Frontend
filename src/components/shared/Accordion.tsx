import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Minus } from 'lucide-react';

type AccordionVariant = 'default' | 'bordered' | 'separated';
type AccordionIconType = 'chevron' | 'plus';

interface AccordionItemData {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenIds?: string[];
  allowMultiple?: boolean;
  variant?: AccordionVariant;
  iconType?: AccordionIconType;
  onChange?: (openIds: string[]) => void;
  className?: string;
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
  },
  containerBordered: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  item: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  itemLast: {
    borderBottom: 'none',
  },
  itemSeparated: {
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    marginBottom: '0.5rem',
    overflow: 'hidden',
  },
  itemSeparatedLast: {
    marginBottom: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem',
    background: 'transparent',
    border: 'none',
    width: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
  },
  headerHover: {
    background: 'rgba(255, 255, 255, 0.05)',
  },
  headerDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flex: 1,
  },
  headerIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'rgba(99, 102, 241, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6366f1',
    flexShrink: 0,
  },
  title: {
    fontSize: '0.9375rem',
    fontWeight: '500',
    color: '#fff',
  },
  toggleIcon: {
    color: '#888',
    transition: 'transform 0.2s ease',
    flexShrink: 0,
  },
  toggleIconOpen: {
    transform: 'rotate(180deg)',
  },
  content: {
    overflow: 'hidden',
    transition: 'height 0.2s ease',
  },
  contentInner: {
    padding: '0 1rem 1rem',
    color: '#ccc',
    fontSize: '0.875rem',
    lineHeight: '1.6',
  },
};

interface AccordionItemProps {
  item: AccordionItemData;
  isOpen: boolean;
  onToggle: () => void;
  variant: AccordionVariant;
  iconType: AccordionIconType;
  isLast: boolean;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  item,
  isOpen,
  onToggle,
  variant,
  iconType,
  isLast,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const getItemStyle = (): React.CSSProperties => {
    if (variant === 'separated') {
      return {
        ...styles.itemSeparated,
        ...(isLast ? styles.itemSeparatedLast : {}),
      };
    }
    return {
      ...styles.item,
      ...(isLast ? styles.itemLast : {}),
    };
  };

  const renderToggleIcon = () => {
    if (iconType === 'plus') {
      return isOpen ? <Minus size={18} /> : <Plus size={18} />;
    }
    return (
      <ChevronDown
        size={18}
        style={{
          ...styles.toggleIcon,
          ...(isOpen ? styles.toggleIconOpen : {}),
        }}
      />
    );
  };

  return (
    <div style={getItemStyle()}>
      <button
        style={{
          ...styles.header,
          ...(isHovered && !item.disabled ? styles.headerHover : {}),
          ...(item.disabled ? styles.headerDisabled : {}),
        }}
        onClick={item.disabled ? undefined : onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-expanded={isOpen}
        aria-disabled={item.disabled}
      >
        <div style={styles.headerContent}>
          {item.icon && <div style={styles.headerIcon}>{item.icon}</div>}
          <span style={styles.title}>{item.title}</span>
        </div>
        <span style={styles.toggleIcon}>{renderToggleIcon()}</span>
      </button>

      <div
        ref={contentRef}
        style={{
          ...styles.content,
          height: height !== undefined ? `${height}px` : 'auto',
        }}
      >
        {isOpen && <div style={styles.contentInner}>{item.content}</div>}
      </div>
    </div>
  );
};

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpenIds = [],
  allowMultiple = false,
  variant = 'default',
  iconType = 'chevron',
  onChange,
  className,
}) => {
  const [openIds, setOpenIds] = useState<string[]>(defaultOpenIds);

  const handleToggle = (id: string) => {
    let newOpenIds: string[];

    if (openIds.includes(id)) {
      newOpenIds = openIds.filter((openId) => openId !== id);
    } else {
      newOpenIds = allowMultiple ? [...openIds, id] : [id];
    }

    setOpenIds(newOpenIds);
    onChange?.(newOpenIds);
  };

  const getContainerStyle = (): React.CSSProperties => {
    if (variant === 'bordered') {
      return { ...styles.container, ...styles.containerBordered };
    }
    return styles.container;
  };

  return (
    <div style={getContainerStyle()} className={className}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openIds.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
          variant={variant}
          iconType={iconType}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};

// Controlled Accordion for external state management
interface ControlledAccordionProps extends Omit<AccordionProps, 'defaultOpenIds' | 'onChange'> {
  openIds: string[];
  onOpenChange: (ids: string[]) => void;
}

export const ControlledAccordion: React.FC<ControlledAccordionProps> = ({
  items,
  openIds,
  onOpenChange,
  allowMultiple = false,
  variant = 'default',
  iconType = 'chevron',
  className,
}) => {
  const handleToggle = (id: string) => {
    let newOpenIds: string[];

    if (openIds.includes(id)) {
      newOpenIds = openIds.filter((openId) => openId !== id);
    } else {
      newOpenIds = allowMultiple ? [...openIds, id] : [id];
    }

    onOpenChange(newOpenIds);
  };

  const getContainerStyle = (): React.CSSProperties => {
    if (variant === 'bordered') {
      return { ...styles.container, ...styles.containerBordered };
    }
    return styles.container;
  };

  return (
    <div style={getContainerStyle()} className={className}>
      {items.map((item, index) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openIds.includes(item.id)}
          onToggle={() => handleToggle(item.id)}
          variant={variant}
          iconType={iconType}
          isLast={index === items.length - 1}
        />
      ))}
    </div>
  );
};

export default Accordion;
