import { palette } from '../theme/colors';

export const riskColorMap = (score: number) => {
  if (score >= 0.75) return palette.danger;
  if (score >= 0.5) return palette.warning;
  return palette.success;
};
