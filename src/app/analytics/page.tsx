'use client';

import { useState } from 'react';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import { useAnalyticsStats, useTopProducts, useRecentMetrics } from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import AnalyticsChart from '../../components/AnalyticsChart';


export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useAnalyticsStats();
  const { data: topProductsData, isLoading: topProductsLoading, error: topProductsError, refetch: refetchTopProducts } = useTopProducts();
  const { data: recentMetricsData, isLoading: recentMetricsLoading, error: recentMetricsError, refetch: refetchRecentMetrics } = useRecentMetrics();

  // Normalize API responses: some hooks return the full envelope ({ success, data }),
  // others return the inner data directly. Guard against either shape.
  const normalizeArray = (resp: any) => {
    if (!resp) return [];
    // envelope: { data: [...] }
    if (Array.isArray(resp.data)) return resp.data;
    // sometimes hooks already return the array directly
    if (Array.isArray(resp)) return resp;
    // nested envelope (paginated): { data: { data: [...] } }
    if (resp.data && Array.isArray(resp.data.data)) return resp.data.data;
    return [];
  };

  const analyticsStats = normalizeArray(statsData);
  const topProducts = normalizeArray(topProductsData);
  const recentMetrics = normalizeArray(recentMetricsData);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page header */}
        <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-sm text-gray-500">
              Deep insights into your business performance and trends.
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
              <EyeIcon className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsLoading ? (
          <div className="col-span-full">
            <LoadingSpinner size="lg" className="py-8" />
          </div>
        ) : statsError ? (
          <div className="col-span-full">
            <ErrorMessage
              message={statsError.message || 'Failed to load analytics stats'}
              onRetry={refetchStats}
            />
          </div>
          ) : (
          analyticsStats.map((stat: any, i: number) => (
            <div key={stat?.name ?? `stat-${i}`} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Metric Selector */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {['revenue', 'sales', 'customers', 'conversion'].map((metric) => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                selectedMetric === metric
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Charts and Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Main Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Trends
            </h3>
            <AnalyticsChart metric={selectedMetric} />
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Top Products</h3>
            {topProductsLoading ? (
              <LoadingSpinner size="lg" className="py-8" />
            ) : topProductsError ? (
              <ErrorMessage
                message={topProductsError.message || 'Failed to load top products'}
                onRetry={refetchTopProducts}
              />
            ) : (
              <div className="space-y-4">
                {topProducts.map((product: any, index: number) => {
                  const name = product?.name ?? product?.product_name ?? product?.productName ?? 'Unknown product';
                  const sales = product?.sales ?? product?.count ?? product?.quantity ?? null;
                  const revenue = product?.revenue ?? product?.total_revenue ?? product?.totalRevenue ?? null;
                  const growth = product?.growth ?? product?.change ?? '';

                  return (
                    <div key={`${product?.id ?? name ?? 'top'}-${index}`} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-indigo-600">{index + 1}</span>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{name}</p>
                          {sales !== null && <p className="text-sm text-gray-500">{sales} sales</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{revenue ?? '—'}</p>
                        <p className="text-sm text-green-600">{growth}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Metrics */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Recent Metrics</h3>
            {recentMetricsLoading ? (
              <LoadingSpinner size="lg" className="py-8" />
            ) : recentMetricsError ? (
              <ErrorMessage
                message={recentMetricsError.message || 'Failed to load recent metrics'}
                onRetry={refetchRecentMetrics}
              />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {recentMetrics.map((metric: any, i: number) => (
                  <div key={metric?.name ?? `recent-${i}`} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ChartBarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{metric.name}</p>
                        <p className="text-lg font-semibold text-gray-900">{metric.value}</p>
                        <p className="text-sm text-green-600">{metric.change}</p>
                        <p className="text-xs text-gray-500">{metric.period}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">Revenue Growth</h4>
                    <p className="text-lg font-semibold text-green-900">+15.3%</p>
                    <p className="text-sm text-green-600">vs last month</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Customer Growth</h4>
                    <p className="text-lg font-semibold text-blue-900">+23</p>
                    <p className="text-sm text-blue-600">new customers</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CubeIcon className="h-8 w-8 text-purple-500" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-purple-800">Inventory Turnover</h4>
                    <p className="text-lg font-semibold text-purple-900">4.2x</p>
                    <p className="text-sm text-purple-600">annual rate</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
