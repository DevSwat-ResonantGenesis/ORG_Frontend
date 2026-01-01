import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  hover?: boolean;
  padding?: 'small' | 'medium' | 'large';
}

// OpenAI-style Panel: No rounded corners, flat surfaces
const Card = ({ 
  children, 
  style,
  hover = false,
  padding = 'medium'
}: CardProps) => {
  const paddingMap = {
    small: '16px',
    medium: '24px',
    large: '32px',
  };

  return (
    <div
      style={{
        background: 'var(--surface-alt)',
        border: '1px solid var(--border)',
        borderRadius: '0', // No rounded corners
        padding: paddingMap[padding],
        transition: 'background-color 0.15s ease',
        ...(hover && {
          cursor: 'pointer',
        }),
        ...style,
      }}
      onMouseEnter={(e) => {
        if (hover) {
          e.currentTarget.style.background = 'var(--surface)';
        }
      }}
      onMouseLeave={(e) => {
        if (hover) {
          e.currentTarget.style.background = 'var(--surface-alt)';
        }
      }}
    >
      {children}
    </div>
  );
};

export default Card;
