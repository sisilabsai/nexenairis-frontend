'use client';

import { useState } from 'react';
import { 
  CpuChipIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  useDemandPredictions,
  useReorderSuggestions,
  useDemandForecastingAnalytics
} from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function AIInventoryPage() {
  const { data: predictionsData, isLoading: predictionsLoading, error: predictionsError } = useDemandPredictions();
  const { data: suggestionsData, isLoading: suggestionsLoading, error: suggestionsError } = useReorderSuggestions();
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useDemandForecastingAnalytics();

  const predictions = (predictionsData?.data as any[]) || [];
  const suggestions = (suggestionsData?.data as any[]) || [];
  const analytics = (analyticsData?.data as any) || {};

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI-Powered Inventory Intelligence</h1>
              <p className="mt-1 text-sm text-gray-500">
                Leverage artificial intelligence for predictive demand forecasting and smart reordering.
              </p>
            </div>
          </div>
        </div>

        {/* AI Analytics Dashboard */}
        {analyticsLoading ? (
          <LoadingSpinner size="lg" className="py-8" />
        ) : analyticsError ? (
          <ErrorMessage
            message={analyticsError.message || 'Failed to load AI analytics'}
            onRetry={() => window.location.reload()}
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CpuChipIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Recent Predictions</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{analytics.recent_predictions || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <LightBulbIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Suggestions</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{analytics.pending_suggestions || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">High Risk Products</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{analytics.high_risk_products || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Suppliers</dt>
                      <dd className="text-2xl font-semibold text-gray-900">{analytics.supplier_performance?.total_suppliers || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demand Predictions */}
        <div className="mb-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">AI Demand Predictions</h3>
              {predictionsLoading ? (
                <LoadingSpinner size="lg" className="py-8" />
              ) : predictionsError ? (
                <ErrorMessage
                  message={predictionsError.message || 'Failed to load demand predictions'}
                  onRetry={() => window.location.reload()}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Predicted Demand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Confidence
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Trend
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {predictions.map((prediction: any) => (
                        <tr key={prediction.product_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {prediction.product_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {prediction.predicted_demand} units
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-indigo-600 h-2 rounded-full" 
                                  style={{ width: `${prediction.confidence_level}%` }}
                                ></div>
                              </div>
                              <span>{prediction.confidence_level}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              {prediction.factors?.trend_direction === 'increasing' ? (
                                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                              ) : (
                                <ArrowTrendingUpIcon className="h-4 w-4 text-red-500 mr-1" />
                              )}
                              {prediction.factors?.trend_direction || 'stable'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reorder Suggestions */}
        <div className="mb-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">AI Reorder Suggestions</h3>
              {suggestionsLoading ? (
                <LoadingSpinner size="lg" className="py-8" />
              ) : suggestionsError ? (
                <ErrorMessage
                  message={suggestionsError.message || 'Failed to load reorder suggestions'}
                  onRetry={() => window.location.reload()}
                />
              ) : (
                <div className="space-y-4">
                  {suggestions.map((suggestion: any) => (
                    <div key={suggestion.product_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{suggestion.product_name}</h4>
                          <p className="text-sm text-gray-500 mt-1">{suggestion.reasoning}</p>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Current Stock:</span> {suggestion.current_stock} units
                            </div>
                            <div>
                              <span className="font-medium">Predicted Demand:</span> {suggestion.predicted_demand} units
                            </div>
                            <div>
                              <span className="font-medium">Suggested Quantity:</span> {suggestion.suggested_quantity} units
                            </div>
                            <div>
                              <span className="font-medium">Stockout Risk:</span> {suggestion.stockout_risk}%
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col items-end">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                            {suggestion.priority} priority
                          </span>
                          <p className="text-sm text-gray-500 mt-2">
                            Confidence: {suggestion.confidence_level}%
                          </p>
                          <p className="text-sm text-gray-500">
                            Est. Cost: UGX {suggestion.estimated_cost?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
