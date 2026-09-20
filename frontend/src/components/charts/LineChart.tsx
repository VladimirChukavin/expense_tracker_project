import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface LineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  height?: number;
  color?: string;
  label?: string;
}

export const LineChart = ({ data, height = 300, color = '#3b82f6', label = 'Значение' }: LineChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLine data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke={color} name={label} strokeWidth={2} />
      </RechartsLine>
    </ResponsiveContainer>
  );
};
