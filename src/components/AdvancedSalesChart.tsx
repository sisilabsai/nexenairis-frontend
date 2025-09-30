'use client';

import { useMemo, useRef, useState } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ArrowDownTrayIcon, LightBulbIcon, ChartBarIcon, ChartPieIcon, PresentationChartLineIcon, ViewColumnsIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import html2canvas from 'html2canvas';
import { useDemandPredictions } from '../hooks/useApi';

// Type definitions
type Prediction = {
  timestamp: string;
  predicted_sales: number;
  confidence_upper: number;
  confidence_lower: number;
};

type DemandPredictionsResponse = {
  data: {
    predictions: Prediction[];
  };
};

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdvancedSalesChart({ hourlyData, topProducts }: { hourlyData: any[], topProducts: any[] }) {
  const chartRef = useRef(null);
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'combined', 'area', 'scatter'
  const { data: demandPredictionsData } = useDemandPredictions({ period: 'daily' }) as { data: DemandPredictionsResponse };

  const { chartData, insights } = useMemo(() => {
    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const actualSales = Array(24).fill(0);
    // Safely aggregate hourly revenues. hourlyData may be [{hour, revenue}] or similar.
    if (Array.isArray(hourlyData)) {
      hourlyData.forEach((d: any) => {
        const hour = Number(d?.hour ?? d?.h ?? d?.x ?? NaN);
        const rev = Number(d?.revenue ?? d?.value ?? d?.y ?? 0) || 0;
        if (!Number.isNaN(hour) && hour >= 0 && hour < 24) {
          actualSales[hour] = (actualSales[hour] || 0) + rev;
        }
      });
    }

    const predictions = demandPredictionsData?.data?.predictions || [];
    const predictedSales = Array(24).fill(null);
    const currentHour = new Date().getHours();
    predictions.forEach((p: Prediction) => {
      const hour = new Date(p.timestamp).getHours();
      if (hour > currentHour) {
        predictedSales[hour] = p.predicted_sales;
      }
    });

    // Generate AI Insights
    const generatedInsights = [];
    const peakHour = actualSales.indexOf(Math.max(...actualSales));
    if (peakHour > -1) generatedInsights.push(`Sales activity historically peaks around ${peakHour}:00. Ensure optimal staffing and stock availability.`);
    const upcomingPeak = predictedSales.findIndex((p, i) => i > currentHour && p > Math.max(...actualSales) * 0.9);
    if (upcomingPeak > -1) generatedInsights.push(`AI predicts a sales surge around ${upcomingPeak}:00. Prepare for increased traffic.`);
    if (topProducts.length > 0) {
        const hotProduct = topProducts[0];
        generatedInsights.push(`'${hotProduct.product_name}' is today's bestseller. Consider bundling it to increase basket size.`);
        if ((hotProduct.stock_level || 100) < 20) generatedInsights.push(`⚠️ Critical Alert: Stock for '${hotProduct.product_name}' is low. Restock advised.`);
    }

    const datasets = {
      actual: {
        label: 'Actual Sales (UGX)',
        data: actualSales,
        borderColor: 'rgb(22, 163, 74)',
        backgroundColor: 'rgba(22, 163, 74, 0.5)',
      },
      predicted: {
        label: 'AI Predicted Sales (UGX)',
        data: predictedSales,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderDash: [5, 5],
      }
    };

    let chartDatasets;
    switch (chartType) {
      case 'bar':
        chartDatasets = [{ ...datasets.actual, type: 'bar' as const }];
        break;
      case 'combined':
        chartDatasets = [
          { ...datasets.actual, type: 'bar' as const, order: 2 },
          { ...datasets.predicted, type: 'line' as const, order: 1, pointRadius: 4 }
        ];
        break;
      case 'scatter':
        const scatterData = actualSales.map((sales, hour) => ({ x: hour, y: sales })).filter(d => d.y > 0);
        chartDatasets = [{ ...datasets.actual, data: scatterData, type: 'scatter' as const }];
        break;
      case 'area':
        chartDatasets = [
            { ...datasets.actual, type: 'line' as const, fill: true },
            { ...datasets.predicted, type: 'line' as const, fill: false, pointRadius: 4 }
        ];
        break;
      case 'line':
      default:
        chartDatasets = [
            { ...datasets.actual, type: 'line' as const, fill: false, pointRadius: 4 },
            { ...datasets.predicted, type: 'line' as const, fill: false, pointRadius: 4 }
        ];
        break;
    }

    return {
      chartData: { labels, datasets: chartDatasets },
      insights: generatedInsights,
    };
  }, [hourlyData, topProducts, demandPredictionsData, chartType]);

  const handleDownloadChart = () => {
    if (chartRef.current) {
      html2canvas(chartRef.current, { backgroundColor: '#ffffff' }).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `advanced_sales_${chartType}_chart.png`;
        link.click();
      });
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Today\'s Sales Performance & AI Forecast', font: { size: 16 } },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const y = context.parsed?.y ?? 0;
            return ` ${context.dataset.label}: UGX ${Number(y).toLocaleString()}`;
          }
        }
      }
    },
    scales: { y: { beginAtZero: true, ticks: { callback: (value: any) => `UGX ${value.toLocaleString()}` } } }
  };

  const renderChart = () => {
    const chartDataAsAny = chartData as any;
    switch (chartType) {
      case 'bar':
        return <Bar options={options} data={chartDataAsAny} />;
      case 'combined':
        return <Bar options={options} data={chartDataAsAny} />;
      case 'scatter':
        return <Scatter options={options} data={chartDataAsAny} />;
      case 'area':
      case 'line':
      default:
        return <Line options={options} data={chartDataAsAny} />;
    }
  };

  const ChartTypeButton = ({ type, label, icon: Icon }: any) => (
    <button
      onClick={() => setChartType(type)}
      className={`flex items-center px-3 py-1 text-sm rounded-md transition-colors ${chartType === type ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
      <Icon className="h-4 w-4 mr-2" />
      {label}
    </button>
  );

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
        <h3 className="text-lg font-medium text-gray-900">Advanced Sales Analytics</h3>
        <div className="flex items-center space-x-2 flex-wrap">
          <ChartTypeButton type="line" label="Trend" icon={PresentationChartLineIcon} />
          <ChartTypeButton type="bar" label="Volume" icon={ChartBarIcon} />
          <ChartTypeButton type="combined" label="Combined" icon={ViewColumnsIcon} />
          <ChartTypeButton type="area" label="Area" icon={ChartPieIcon} />
          <ChartTypeButton type="scatter" label="Distribution" icon={Squares2X2Icon} />
          <button onClick={handleDownloadChart} className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 flex items-center">
            <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
            Download
          </button>
        </div>
      </div>
      <div ref={chartRef} className="bg-white p-4" style={{ height: '400px' }}>
        {renderChart()}
      </div>
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-md font-medium text-gray-800 flex items-center">
            <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
            Aida's AI Insights
        </h4>
        <ul className="mt-2 space-y-2 text-sm list-disc list-inside text-gray-700">
            {insights.map((insight, i) => <li key={i} dangerouslySetInnerHTML={{ __html: insight.replace(/⚠️/g, '<strong class="text-red-600">⚠️</strong>') }}></li>)}
        </ul>
      </div>
    </div>
  );
}
