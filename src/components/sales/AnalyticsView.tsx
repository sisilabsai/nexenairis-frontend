'use client';

import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import { 
  CurrencyDollarIcon, 
  ReceiptPercentIcon, 
  CubeIcon, 
  ChartBarIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import LiveSalesAnalytics from '../LiveSalesAnalytics';
import AdvancedSalesChart from '../AdvancedSalesChart';
import { useDailySalesSummary, useTopSellingProducts } from '../../hooks/useApi';

import { FC } from 'react';

interface AnalyticsViewProps {
  isLoading: boolean;
  dailySalesSummary: any;
  hourlyPattern: any[];
  topProducts: any[];
}

const AnalyticsView: FC<AnalyticsViewProps> = ({
  isLoading: initialLoading,
  dailySalesSummary: initialDailySalesSummary,
  hourlyPattern: initialHourlyPattern,
  topProducts: initialTopProducts,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Use hooks for real-time data with optional date parameter
  const { 
    data: liveDailySummary, 
    isLoading: isDailySummaryLoading, 
    refetch: refetchDailySummary 
  } = useDailySalesSummary(selectedDate ? { date: selectedDate } : undefined);
  
  const { 
    data: liveTopProducts, 
    isLoading: isTopProductsLoading, 
    refetch: refetchTopProducts 
  } = useTopSellingProducts();

  // Use live data when available, fallback to initial data
  const dailySalesSummary = liveDailySummary?.data || initialDailySalesSummary;
  const topProducts: any[] = Array.isArray(liveTopProducts?.data)
    ? liveTopProducts.data
    : Array.isArray(initialTopProducts)
      ? initialTopProducts
      : [];
  const hourlyPattern = initialHourlyPattern || [];
  const isLoading = initialLoading || isDailySummaryLoading || isTopProductsLoading;

  // Auto-refresh functionality
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetchDailySummary();
        refetchTopProducts();
        setLastUpdated(new Date());
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetchDailySummary, refetchTopProducts]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setLastUpdated(new Date());
  };

  const handleRefresh = () => {
    refetchDailySummary();
    refetchTopProducts();
    setLastUpdated(new Date());
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount?.toLocaleString() || '0'}`;
  };

  const getComparisonIcon = (current: number, previous: number) => {
    if (current > previous) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (current < previous) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <CalendarDaysIcon className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedDate && (
              <button
                onClick={() => handleDateChange('')}
                className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Show Latest
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="autoRefresh" className="text-sm text-gray-700">
              Auto-refresh (30s)
            </label>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="h-4 w-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Enhanced Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">
                  {selectedDate ? `Sales for ${selectedDate}` : "Today's Sales"}
                </p>
                <p className="text-2xl font-bold">
                  {formatCurrency(dailySalesSummary?.summary?.total_revenue || 0)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-200" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-green-200">
                {dailySalesSummary?.summary?.total_transactions || 0} transactions
              </p>
              <p className="text-xs text-green-200">
                Date: {dailySalesSummary?.date || 'Today'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Transactions</p>
                <p className="text-2xl font-bold">
                  {dailySalesSummary?.summary?.total_transactions || 0}
                </p>
              </div>
              <ReceiptPercentIcon className="h-8 w-8 text-blue-200" />
            </div>
            <p className="text-xs text-blue-200 mt-3">
              Average: {formatCurrency(Math.round(dailySalesSummary?.summary?.average_transaction_value || 0))}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Top Product</p>
                <p className="text-lg font-bold">
                  {dailySalesSummary?.top_products?.[0]?.product_name?.substring(0, 15) || 'No sales'}
                </p>
              </div>
              <CubeIcon className="h-8 w-8 text-purple-200" />
            </div>
            <p className="text-xs text-purple-200 mt-3">
              {dailySalesSummary?.top_products?.[0]?.total_quantity || 0} sold
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Discounts Given</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(dailySalesSummary?.summary?.total_discounts || 0)}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-orange-200" />
            </div>
            <p className="text-xs text-orange-200 mt-3">
              {dailySalesSummary?.summary?.total_transactions > 0
                ? `${((dailySalesSummary?.summary?.total_discounts / dailySalesSummary?.summary?.total_revenue) * 100).toFixed(1)}% of revenue`
                : 'No discounts'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Top Products Section */}
      {topProducts && topProducts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topProducts.slice(0, 6).map((product: any, index: number) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {product.product_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Revenue: {formatCurrency(product.total_revenue)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Sales Activity */}
      {dailySalesSummary?.recent_sales && dailySalesSummary.recent_sales.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales Activity</h3>
          <div className="space-y-3">
            {dailySalesSummary.recent_sales.map((sale: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {sale.transaction_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(sale.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(sale.total_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <LiveSalesAnalytics />
      <AdvancedSalesChart hourlyData={hourlyPattern} topProducts={topProducts} />
    </div>
  );
};

export default AnalyticsView;
