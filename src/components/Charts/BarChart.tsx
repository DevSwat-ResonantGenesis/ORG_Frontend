import { BarChart as RBarChart, Bar, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import getChartTheme from '../../theme/getChartTheme';

const BarChart = ({ data }: { data: any[] }) => {
  const theme = getChartTheme();

  return (
    <RBarChart width={900} height={350} data={data}>
      <CartesianGrid stroke={theme.grid} />
      <XAxis dataKey="anchor" stroke={theme.axis} />
      <YAxis stroke={theme.axis} />
      <Tooltip />
      <Bar dataKey="count" fill={theme.barPrimary} />
    </RBarChart>
  );
};

export default BarChart;
