import { SelectHTMLAttributes } from 'react';
import { palette } from '../../theme/colors';

export const Select = ({ style, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select
    style={{
      background: 'transparent',
      border: `1px solid ${palette.border}`,
      borderRadius: 8,
      padding: '0.45rem 0.75rem',
      color: palette.text,
      width: '100%',
      ...style
    }}
    {...props}
  >
    {children}
  </select>
);
