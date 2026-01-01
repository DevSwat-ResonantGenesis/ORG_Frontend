import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const KPIContainer = ({ children }: Props) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>{children}</div>
);
