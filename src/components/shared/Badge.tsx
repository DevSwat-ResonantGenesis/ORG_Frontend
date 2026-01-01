import styles from './Badge.module.css';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'custom';

interface Props {
  variant?: BadgeVariant;
  color?: string; // For custom variant
  label: string;
}

export const Badge = ({ variant = 'primary', color, label }: Props) => {
  const badgeClasses = [
    styles.badge,
    variant !== 'custom' ? styles[variant] : styles.custom,
  ].filter(Boolean).join(' ');

  const customStyle = variant === 'custom' && color
    ? {
        background: `${color}22`,
        color,
      }
    : undefined;

  return (
    <span className={badgeClasses} style={customStyle}>
      {label}
    </span>
  );
};
