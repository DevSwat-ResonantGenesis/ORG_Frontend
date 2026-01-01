import { ReactNode } from 'react';
import { palette } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

interface Props {
  title: string;
  children: ReactNode;
}

export const ChartWrapper = ({ title, children }: Props) => (
  <section
    style={{
      background: palette.surface,
      borderRadius: 16,
      padding: '1rem',
      boxShadow: shadows.card,
      minHeight: 220
    }}
  >
    <header style={{ marginBottom: '1rem', fontWeight: 600 }}>{title}</header>
    {children}
  </section>
);
