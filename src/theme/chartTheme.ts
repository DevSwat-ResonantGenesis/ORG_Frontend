// Chart theme using ResonantGenesis design system colors
// Blue accent (#3B82F6) - OpenAI Hybrid

const chartTheme = {
  light: {
    grid: 'var(--chart-grid)',
    axis: 'var(--text-300)',
    label: 'var(--text-secondary)',
    linePrimary: 'var(--accent-500)', // Blue #3B82F6
    lineSecondary: 'var(--accent-300)', // Light blue
    barPrimary: 'var(--accent-500)',
    barSecondary: 'var(--accent-300)',
    danger: '#ef4444',
    warning: '#f59e0b',
    muted: 'var(--text-500)',
    primary: 'var(--accent-500)',
    donut: [
      'var(--accent-500)',      // Blue
      'var(--accent-300)',      // Light blue
      '#f59e0b',                // Amber
      '#ef4444',                // Red
      'var(--text-500)',        // Muted gray
    ]
  },
  dark: {
    grid: 'var(--chart-grid)',
    axis: 'var(--text-300)',
    label: 'var(--text-secondary)',
    linePrimary: 'var(--accent-500)', // Blue #3B82F6
    lineSecondary: 'var(--accent-300)', // Light blue
    barPrimary: 'var(--accent-500)',
    barSecondary: 'var(--accent-300)',
    danger: '#ef4444',
    warning: '#f59e0b',
    muted: 'var(--text-500)',
    primary: 'var(--accent-500)',
    donut: [
      'var(--accent-500)',      // Blue
      'var(--accent-300)',      // Light blue
      '#f59e0b',                // Amber
      '#ef4444',                // Red
      'var(--text-500)',        // Muted gray
    ]
  }
};

export default chartTheme;
