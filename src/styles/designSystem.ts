/**
 * ResonantGenesis Design System
 * Unified design tokens for consistent UI across the platform
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Brand Colors
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  
  accent: {
    purple: '#8b5cf6',
    pink: '#ec4899',
    cyan: '#06b6d4',
  },
  
  success: {
    light: '#6ee7b7',
    main: '#10b981',
    dark: '#059669',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  warning: {
    light: '#fcd34d',
    main: '#f59e0b',
    dark: '#d97706',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  error: {
    light: '#fca5a5',
    main: '#ef4444',
    dark: '#dc2626',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
  },
  info: {
    light: '#93c5fd',
    main: '#3b82f6',
    dark: '#2563eb',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },
  
  bg: {
    primary: '#050508',
    secondary: '#0a0a0f',
    tertiary: '#0f0f14',
    elevated: '#12121a',
    card: 'rgba(255, 255, 255, 0.02)',
    cardHover: 'rgba(255, 255, 255, 0.04)',
    input: 'rgba(255, 255, 255, 0.03)',
    overlay: 'rgba(0, 0, 0, 0.8)',
  },
  
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    default: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(99, 102, 241, 0.5)',
  },
  
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    tertiary: '#71717a',
    muted: '#52525b',
  },
  
  gradient: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    hero: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    card: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
    page: 'linear-gradient(180deg, #050508 0%, #0a0a0f 50%, #12121a 100%)',
  },
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Fira Code", Menlo, Monaco, Consolas, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '1.8',
  },
};

// ============================================================================
// SPACING
// ============================================================================

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
};

// ============================================================================
// BORDERS & RADIUS
// ============================================================================

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  '3xl': '24px',
  full: '9999px',
};

// ============================================================================
// SHADOWS
// ============================================================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  glow: '0 0 20px rgba(99, 102, 241, 0.3)',
  glowStrong: '0 0 40px rgba(99, 102, 241, 0.4)',
};

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '300ms ease',
};

// ============================================================================
// COMPONENT STYLES - Reusable style objects
// ============================================================================

export const buttonStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '600',
    borderRadius: '12px',
    transition: 'all 200ms ease',
    cursor: 'pointer',
    outline: 'none',
    border: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  
  primary: {
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    color: '#fff',
    boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
  } as React.CSSProperties,
  
  secondary: {
    background: 'rgba(255, 255, 255, 0.03)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,
  
  outline: {
    background: 'transparent',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  } as React.CSSProperties,
  
  ghost: {
    background: 'transparent',
    color: '#a1a1aa',
  } as React.CSSProperties,
  
  danger: {
    background: '#ef4444',
    color: '#fff',
  } as React.CSSProperties,
  
  sizes: {
    xs: { padding: '0.375rem 0.75rem', fontSize: '0.75rem', height: '28px' },
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem', height: '36px' },
    md: { padding: '0.625rem 1.25rem', fontSize: '0.875rem', height: '42px' },
    lg: { padding: '0.75rem 1.5rem', fontSize: '1rem', height: '48px' },
    xl: { padding: '1rem 2rem', fontSize: '1.125rem', height: '56px' },
  },
};

export const cardStyles = {
  base: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '20px',
    transition: 'all 200ms ease',
  } as React.CSSProperties,
  
  elevated: {
    background: '#12121a',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  } as React.CSSProperties,
  
  interactive: {
    cursor: 'pointer',
  } as React.CSSProperties,
  
  highlighted: {
    background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  } as React.CSSProperties,
  
  sizes: {
    sm: { padding: '1rem' },
    md: { padding: '1.5rem' },
    lg: { padding: '2rem' },
  },
};

export const inputStyles = {
  base: {
    width: '100%',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '0.875rem',
    transition: 'all 200ms ease',
    outline: 'none',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  
  focus: {
    borderColor: '#6366f1',
    boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)',
  } as React.CSSProperties,
  
  error: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
  } as React.CSSProperties,
  
  sizes: {
    sm: { padding: '0.5rem 0.75rem', height: '36px' },
    md: { padding: '0.625rem 1rem', height: '44px' },
    lg: { padding: '0.75rem 1.25rem', height: '52px' },
  },
};

export const badgeStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    fontWeight: '500',
    borderRadius: '100px',
  } as React.CSSProperties,
  
  primary: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  } as React.CSSProperties,
  
  success: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#6ee7b7',
    border: '1px solid rgba(16, 185, 129, 0.2)',
  } as React.CSSProperties,
  
  warning: {
    background: 'rgba(245, 158, 11, 0.1)',
    color: '#fcd34d',
    border: '1px solid rgba(245, 158, 11, 0.2)',
  } as React.CSSProperties,
  
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#fca5a5',
    border: '1px solid rgba(239, 68, 68, 0.2)',
  } as React.CSSProperties,
  
  sizes: {
    sm: { padding: '0.25rem 0.5rem', fontSize: '0.7rem' },
    md: { padding: '0.375rem 0.75rem', fontSize: '0.75rem' },
    lg: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
  },
};

// ============================================================================
// LAYOUT STYLES
// ============================================================================

export const layoutStyles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #121212 100%)',
    color: '#fff',
  } as React.CSSProperties,
  
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 1.5rem',
  } as React.CSSProperties,
  
  section: {
    padding: '5rem 1.5rem',
  } as React.CSSProperties,
  
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    background: 'rgba(10, 10, 10, 0.8)',
    backdropFilter: 'blur(12px)',
  } as React.CSSProperties,
};

// ============================================================================
// TYPOGRAPHY STYLES
// ============================================================================

export const textStyles = {
  h1: {
    fontSize: '3rem',
    fontWeight: '800',
    lineHeight: '1.1',
    color: '#fff',
  } as React.CSSProperties,
  
  h2: {
    fontSize: '2.25rem',
    fontWeight: '700',
    lineHeight: '1.2',
    color: '#fff',
  } as React.CSSProperties,
  
  h3: {
    fontSize: '1.5rem',
    fontWeight: '600',
    lineHeight: '1.3',
    color: '#fff',
  } as React.CSSProperties,
  
  h4: {
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1.4',
    color: '#fff',
  } as React.CSSProperties,
  
  body: {
    fontSize: '1rem',
    fontWeight: '400',
    lineHeight: '1.6',
    color: '#a1a1aa',
  } as React.CSSProperties,
  
  bodySmall: {
    fontSize: '0.875rem',
    fontWeight: '400',
    lineHeight: '1.5',
    color: '#a1a1aa',
  } as React.CSSProperties,
  
  caption: {
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#71717a',
  } as React.CSSProperties,
  
  gradient: {
    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  } as React.CSSProperties,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getButtonStyle = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' = 'primary',
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md'
): React.CSSProperties => ({
  ...buttonStyles.base,
  ...buttonStyles.sizes[size],
  ...buttonStyles[variant],
});

export const getCardStyle = (
  variant: 'base' | 'elevated' | 'highlighted' = 'base',
  size: 'sm' | 'md' | 'lg' = 'md'
): React.CSSProperties => ({
  ...cardStyles.base,
  ...cardStyles.sizes[size],
  ...(variant !== 'base' ? cardStyles[variant] : {}),
});

export const getInputStyle = (
  size: 'sm' | 'md' | 'lg' = 'md'
): React.CSSProperties => ({
  ...inputStyles.base,
  ...inputStyles.sizes[size],
});

export const getBadgeStyle = (
  variant: 'primary' | 'success' | 'warning' | 'error' = 'primary',
  size: 'sm' | 'md' | 'lg' = 'md'
): React.CSSProperties => ({
  ...badgeStyles.base,
  ...badgeStyles.sizes[size],
  ...badgeStyles[variant],
});

// ============================================================================
// COMMON UI PATTERNS
// ============================================================================

export const commonStyles = {
  // Logo container
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
  } as React.CSSProperties,
  
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  
  logoText: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#fff',
  } as React.CSSProperties,
  
  // Nav links
  navLink: {
    color: '#a1a1aa',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'color 200ms ease',
  } as React.CSSProperties,
  
  // Icon containers
  iconBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
  } as React.CSSProperties,
  
  // Animated orbs for backgrounds
  orb: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.4,
    pointerEvents: 'none',
  } as React.CSSProperties,
  
  // Dividers
  divider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
    margin: '1.5rem 0',
  } as React.CSSProperties,
  
  // Grid layouts
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1.5rem',
  } as React.CSSProperties,
  
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1.5rem',
  } as React.CSSProperties,
  
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
  } as React.CSSProperties,
  
  // Flex utilities
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as React.CSSProperties,
  
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as React.CSSProperties,
  
  flexColumn: {
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  
  // Scroll area
  scrollArea: {
    overflowY: 'auto',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(255,255,255,0.1) transparent',
  } as React.CSSProperties,
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  transitions,
  buttonStyles,
  cardStyles,
  inputStyles,
  badgeStyles,
  layoutStyles,
  textStyles,
  commonStyles,
  getButtonStyle,
  getCardStyle,
  getInputStyle,
  getBadgeStyle,
};
