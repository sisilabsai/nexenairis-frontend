'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';

interface ChartData {
  period: string;
  revenue?: number;
  orders?: number;
  customers?: number;
  avg_order_value?: number;
  items_sold?: number;
}

interface AnalyticsChartsProps {
  data: ChartData[];
  chartType: 'line' | 'area' | 'bar' | 'pie' | 'scatter';
  metrics: string[];
  title: string;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'];

export default function AnalyticsCharts({ data, chartType, metrics, title }: AnalyticsChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-UG').format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{`Period: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${
                entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('value')
                  ? formatCurrency(entry.value)
                  : formatNumber(entry.value)
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderAreaChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {metrics.map((metric, index) => (
          <Area
            key={metric}
            type="monotone"
            dataKey={metric}
            stackId="1"
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        {metrics.map((metric, index) => (
          <Bar
            key={metric}
            dataKey={metric}
            fill={COLORS[index % COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => {
    // For pie chart, we'll aggregate data by the first metric
    const primaryMetric = metrics[0];
    const aggregatedData = data.map(item => ({
      name: item.period,
      value: item[primaryMetric as keyof ChartData] as number || 0
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <PieChart>
          <Pie
            data={aggregatedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(props) => {
              const { name, percent } = props;
              return `${name} ${percent !== undefined ? (Number(percent) * 100).toFixed(0) : 0}%`;
            }}
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {aggregatedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [
              primaryMetric.toLowerCase().includes('revenue') || primaryMetric.toLowerCase().includes('value')
                ? formatCurrency(value)
                : formatNumber(value),
              primaryMetric.replace('_', ' ')
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderScatterChart = () => {
    // For scatter plot, we'll use the first two metrics
    if (metrics.length < 2) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Need at least 2 metrics for scatter plot
        </div>
      );
    }

    const scatterData = data.map(item => ({
      x: item[metrics[0] as keyof ChartData] as number || 0,
      y: item[metrics[1] as keyof ChartData] as number || 0,
      period: item.period
    }));

    return (
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart data={scatterData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name={metrics[0].replace('_', ' ')}
            label={{ value: metrics[0].replace('_', ' '), position: 'insideBottom', offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name={metrics[1].replace('_', ' ')}
            label={{ value: metrics[1].replace('_', ' '), angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            formatter={(value: number, name: string) => [
              name.toLowerCase().includes('revenue') || name.toLowerCase().includes('value')
                ? formatCurrency(value)
                : formatNumber(value),
              name.replace('_', ' ')
            ]}
            labelFormatter={(label) => `Period: ${label}`}
          />
          <Scatter name="Data Points" dataKey="y" fill="#8884d8" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return renderLineChart();
      case 'area':
        return renderAreaChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'scatter':
        return renderScatterChart();
      default:
        return renderLineChart();
    }
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No data available for visualization
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">
          Showing {metrics.join(', ')} over {data.length} periods
        </p>
      </div>
      {renderChart()}
    </div>
  );
}

// Additional chart components for specific use cases
export function RevenueTrendChart({ data }: { data: ChartData[] }) {
  return (
    <AnalyticsCharts
      data={data}
      chartType="line"
      metrics={['revenue']}
      title="Revenue Trend Analysis"
    />
  );
}

export function OrdersComparisonChart({ data }: { data: ChartData[] }) {
  return (
    <AnalyticsCharts
      data={data}
      chartType="bar"
      metrics={['orders', 'customers']}
      title="Orders vs Customers Comparison"
    />
  );
}

export function PerformanceOverviewChart({ data }: { data: ChartData[] }) {
  return (
    <AnalyticsCharts
      data={data}
      chartType="area"
      metrics={['revenue', 'avg_order_value']}
      title="Performance Overview"
    />
  );
}

export function CustomerSegmentationChart({ data }: { data: ChartData[] }) {
  return (
    <AnalyticsCharts
      data={data}
      chartType="pie"
      metrics={['customers']}
      title="Customer Distribution"
    />
  );
}

export function CorrelationAnalysisChart({ data }: { data: ChartData[] }) {
  return (
    <AnalyticsCharts
      data={data}
      chartType="scatter"
      metrics={['orders', 'revenue']}
      title="Orders vs Revenue Correlation"
    />
  );
}