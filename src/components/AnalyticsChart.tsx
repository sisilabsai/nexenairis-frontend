'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useMetrics } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

export default function AnalyticsChart({ metric }: { metric: string }) {
  const { data: metricsData, isLoading, error, refetch } = useMetrics({ metric });

  const normalize = (resp: any) => {
    if (!resp) return [];
    if (Array.isArray(resp.data)) return resp.data;
    if (Array.isArray(resp)) return resp;
    if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
    return [];
  };

  const chartData = normalize(metricsData);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;

  if (!chartData || chartData.length === 0) {
    return <div className="text-sm text-gray-500">No metric data available for the selected period.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData as any[]}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
