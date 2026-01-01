import { palette } from '../../theme/colors';
import { riskColorMap } from '@/utils/riskColorMap';

interface Props {
  label: string;
  value: number;
  suffix?: string;
}

export const KPIBlock = ({ label, value, suffix = '' }: Props) => (
  <div
    style={{
      flex: 1,
      background: palette.surface,
      borderRadius: 16,
      padding: '1rem',
      border: `1px solid ${palette.border}`
    }}
  >
    <p style={{ margin: 0, opacity: 0.65, fontSize: '0.9rem' }}>{label}</p>
    <h3 style={{ margin: '0.5rem 0 0', color: riskColorMap(value) }}>
      {value.toFixed(2)} {suffix}
    </h3>
  </div>
);
