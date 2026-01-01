import { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

export const Tooltip = ({ label, children }: Props) => (
  <span title={label} style={{ cursor: 'help', display: 'inline-flex' }}>
    {children}
  </span>
);
