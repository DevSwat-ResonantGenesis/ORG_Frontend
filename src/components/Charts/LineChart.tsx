import { LineChart as RLineChart, Line, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts';
import getChartTheme from '../../theme/getChartTheme';

const LineChart = ({ data }: { data: any[] }) => {
  const theme = getChartTheme();

  return (
    <RLineChart width={900} height={300} data={data}>
      <CartesianGrid stroke={theme.grid} strokeDasharray="3 3" />
      <XAxis dataKey="date" stroke={theme.axis} />
      <YAxis stroke={theme.axis} />
      <Tooltip />
      <Line type="monotone" dataKey="score" stroke={theme.linePrimary} strokeWidth={2} dot={false} />
      <Line type="monotone" dataKey="risk" stroke={theme.danger} strokeWidth={1.5} dot={false} />
    </RLineChart>
  );
};

export default LineChart;
