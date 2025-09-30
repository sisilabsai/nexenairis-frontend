'use client';

import { useState, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
  StarIcon,
  SparklesIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import {
  useSalesAnalytics,
  useDailySalesSummary,
  useTopSellingProducts,
  useHourlySalesPattern,
  useSalesHistory,
  useAIInsights,
} from '../../hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import AdvancedSalesChart from '../AdvancedSalesChart';

// Type Definitions
type SalesSummary = {
  total_revenue?: number;
  total_transactions?: number;
  average_transaction_value?: number;
};

type TopProduct = {
  product_id: number;
  product_name: string;
  total_quantity: number;
};

type HourlyPattern = {
  hour: number;
  revenue: number;
};

type SalesHistory = {
  id: number;
  transaction_number: string;
  total_amount: number;
  customer_name: string;
  transaction_date: string;
};

type AIInsight = {
  id: number;
  module: string;
  insight: string;
  actionable_tip: string;
};

export default function SalesDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // API Hooks
  const { data: salesAnalyticsData, isLoading: analyticsLoading } = useSalesAnalytics({ period: selectedPeriod });
  const { data: dailySalesSummaryData, isLoading: dailyLoading } = useDailySalesSummary();
  const { data: topProductsData, isLoading: productsLoading } = useTopSellingProducts({ limit: 5 });
  const { data: hourlyPatternData, isLoading: hourlyLoading } = useHourlySalesPattern({ period: selectedPeriod });
  const { data: salesHistoryData, isLoading: historyLoading } = useSalesHistory({ per_page: 5 });
  const { data: aiInsightsData, isLoading: insightsLoading } = useAIInsights();

  // Memoized data extraction
  const summary: SalesSummary = useMemo(() => {
    const d = dailySalesSummaryData as any;
    if (!d) return {};
    // hook returns the inner server `data` already in many places: { summary: { ... } }
    if (d.summary) return d.summary;
    // fallback: envelope shapes
    if (d.data && d.data.summary) return d.data.summary;
    return {};
  }, [dailySalesSummaryData]);

  const topProducts: TopProduct[] = useMemo(() => {
    const d = topProductsData as any;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.data?.data)) return d.data.data;
    return [];
  }, [topProductsData]);

  // Aggregate and dedupe top products by name to avoid duplicate entries and sum quantities/revenue
  const dedupedTopProducts: TopProduct[] = useMemo(() => {
    const map = new Map<string, any>();
    topProducts.forEach((p: any) => {
      const name = p.product_name || p.name || String(p.description || '').trim();
      const qty = Number(p.total_quantity || p.total || p.sales || 0) || 0;
      const revenue = Number(p.total_revenue || p.revenue || p.total_revenue || 0) || 0;
      if (!map.has(name)) {
        map.set(name, { product_name: name, total_quantity: qty, total_revenue: revenue });
      } else {
        const cur = map.get(name);
        cur.total_quantity += qty;
        cur.total_revenue += revenue;
      }
    });
    // return sorted array by revenue desc
    return Array.from(map.values()).sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0));
  }, [topProducts]);

  const hourlyPattern: HourlyPattern[] = useMemo(() => {
    const d = hourlyPatternData as any;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.hourly_sales)) return d.hourly_sales;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.data?.data)) return d.data.data;
    return [];
  }, [hourlyPatternData]);

  // Normalize hourly pattern into objects { hour, revenue } for AdvancedSalesChart
  const hourlyDataForChart = useMemo(() => {
    if (!hourlyPattern) return [];
    // If it's already array of objects with hour/revenue, return as-is
    if (hourlyPattern.length > 0 && hourlyPattern[0] && typeof hourlyPattern[0] === 'object' && ('hour' in hourlyPattern[0] || 'revenue' in hourlyPattern[0])) {
      return hourlyPattern.map((d: any) => ({ hour: Number(d.hour ?? d.h ?? 0), revenue: Number(d.revenue ?? d.value ?? d.amount ?? 0) }));
    }
    // If it's an array of numbers, map index -> hour
    if (hourlyPattern.length > 0 && typeof hourlyPattern[0] === 'number') {
      return (hourlyPattern as any[]).map((val: number, idx: number) => ({ hour: idx, revenue: Number(val || 0) }));
    }
    return [];
  }, [hourlyPattern]);

  const salesHistory: SalesHistory[] = useMemo(() => {
    const d = salesHistoryData as any;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.data?.data)) return d.data.data;
    return [];
  }, [salesHistoryData]);

  const aiInsights: AIInsight[] = useMemo(() => {
    const d = aiInsightsData as any;
    const arr = Array.isArray(d) ? d : (d?.data || d?.data?.data || []);
    return (arr as any[]).filter((i: any) => i.module === 'sales');
  }, [aiInsightsData]);

  const isLoading = dailyLoading || productsLoading || hourlyLoading || historyLoading || insightsLoading || analyticsLoading;

  const kpis = [
    { title: "Today's Revenue", value: `UGX ${Number(summary.total_revenue || 0).toLocaleString()}`, icon: CurrencyDollarIcon },
    { title: 'Total Transactions', value: Number(summary.total_transactions || 0).toLocaleString(), icon: ShoppingCartIcon },
    { title: 'Avg. Sale Value', value: `UGX ${Number(summary.average_transaction_value || 0).toLocaleString()}`, icon: ArrowTrendingUpIcon },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-4">
        <h1 className="text-2xl font-bold text-gray-800">Sales Dashboard</h1>
        <p className="text-sm text-gray-500">Real-time overview of your sales performance.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpis.map(kpi => (
          <div key={kpi.title} className="bg-white shadow rounded-lg p-5 flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full">
              <kpi.icon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{kpi.title}</p>
              <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdvancedSalesChart hourlyData={hourlyDataForChart} topProducts={dedupedTopProducts} />
        </div>
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
              <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
              Aida's AI Insights
            </h3>
            <div className="space-y-3">
              {aiInsights.length > 0 ? aiInsights.map((insight: any) => (
                <div key={insight.id} className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-800">{insight.insight}</p>
                  <p className="text-xs text-purple-600 mt-1">{insight.actionable_tip}</p>
                </div>
              )) : <p className="text-sm text-gray-500">No insights available right now.</p>}
            </div>
          </div>
          {/* Top Selling Products */}
          <div className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
              <StarIcon className="h-5 w-5 text-yellow-500 mr-2" />
              Top Selling Products
            </h3>
            <ul className="space-y-2">
              {dedupedTopProducts.slice(0, 10).map((product: any, idx: number) => (
                <li key={`${product.product_name}-${idx}`} className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700">{product.product_name}</span>
                  <span className="font-bold text-green-600">
                    {Number(product.total_quantity || 0) > 0
                      ? `${Number(product.total_quantity).toLocaleString()} sold`
                      : product.total_revenue && Number(product.total_revenue) > 0
                        ? `UGX ${Number(product.total_revenue).toLocaleString()}`
                        : '0 sold'
                    }
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
