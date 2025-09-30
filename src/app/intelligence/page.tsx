'use client';

import { useState } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CubeIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import { useIntelligenceDashboard } from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';

// Type definition for intelligence dashboard data
interface IntelligenceData {
  overview?: {
    inventory: {
      total_products: number;
      active_products: number;
      low_stock_products: number;
      out_of_stock_products: number;
      stock_health_score: number;
    };
    financial: {
      total_revenue: number;
      monthly_growth: number;
      weekly_growth: number;
      profit_margin: number;
    };
    customers: {
      total_customers: number;
      new_customers_this_month: number;
      customer_satisfaction_score: number;
    };
    employees: {
      total_employees: number;
      active_employees: number;
      productivity_score: number;
    };
  };
  trends?: {
    sales_trends: any[];
    top_performing_products: any[];
    seasonal_patterns: {
      current_season: string;
      seasonal_multiplier: number;
      trend_direction: string;
    };
    growth_forecast: {
      next_month: number;
      next_quarter: number;
      confidence_level: number;
    };
  };
  alerts?: Array<{
    type: string;
    priority: string;
    title: string;
    message: string;
    action: string;
    product_id?: number;
    severity?: number;
    days_until_expiry?: number;
  }>;
  predictions?: {
    demand_forecast: {
      predicted_demand: number;
      confidence_level: number;
      factors: string[];
    };
    revenue_prediction: {
      next_month: number;
      growth_rate: number;
      confidence: number;
    };
    customer_behavior: {
      preferred_products: string[];
      purchase_patterns: string;
      lifetime_value: number;
    };
    market_trends: {
      market_growth: number;
      competition_level: string;
      opportunities: string[];
    };
  };
  performance?: {
    inventory: {
      turnover_rate: number;
      carrying_cost: number;
      stockout_rate: number;
      accuracy_rate: number;
    };
    financial: {
      roi: number;
      cash_flow: number;
      profit_margin: number;
      break_even_point: number;
    };
    operational: {
      order_fulfillment_rate: number;
      customer_satisfaction: number;
      employee_productivity: number;
      quality_score: number;
    };
  };
  ai_insights?: {
    business_health: {
      score: number;
      status: string;
      recommendations: string[];
    };
    growth_opportunities: {
      new_markets: string[];
      product_expansion: string[];
      efficiency_improvements: string[];
    };
    risk_assessment: {
      market_risk: string;
      operational_risk: string;
      financial_risk: string;
      mitigation_strategies: string[];
    };
    optimization_suggestions: {
      inventory_optimization: string;
      process_improvement: string;
      cost_reduction: string;
    };
  };
  real_time_updates?: {
    recent_transactions: any[];
    stock_movements: any[];
    system_alerts: {
      database_performance: string;
      api_response_time: string;
      system_uptime: string;
    };
  };
  timestamp?: string;
}

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'alerts' | 'predictions' | 'performance' | 'insights'>('overview');
  
  const { data: intelligenceData, isLoading, error, refetch } = useIntelligenceDashboard();

  const data = intelligenceData?.data as IntelligenceData;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'needs_attention':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getBusinessHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    return 'text-red-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSystemStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent':
      case 'good':
      case 'normal':
        return 'text-green-600';
      case 'needs attention':
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Real-Time Intelligence Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                AI-powered insights and real-time analytics for informed decision making.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-500">
                <ClockIcon className="h-4 w-4 mr-1" />
                Last updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : 'Loading...'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: ChartBarIcon },
              { id: 'trends', name: 'Trends', icon: ArrowTrendingUpIcon },
              { id: 'alerts', name: 'Alerts', icon: ExclamationTriangleIcon },
              { id: 'predictions', name: 'Predictions', icon: LightBulbIcon },
              { id: 'performance', name: 'Performance', icon: CheckCircleIcon },
              { id: 'insights', name: 'AI Insights', icon: InformationCircleIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {isLoading ? (
          <LoadingSpinner size="lg" className="py-8" />
        ) : error ? (
          <ErrorMessage
            message={error.message || 'Failed to load intelligence dashboard'}
            onRetry={refetch}
          />
        ) : (
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && data?.overview && (
              <div className="space-y-6">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Inventory Metrics */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CubeIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                            <dd className="text-lg font-medium text-gray-900">{data.overview.inventory.total_products}</dd>
                            <dt className="text-sm text-gray-500 mt-1">Active Products</dt>
                            <dd className="text-sm font-medium text-gray-900">{data.overview.inventory.active_products}</dd>
                            <dt className="text-sm text-gray-500 mt-1">Low Stock</dt>
                            <dd className="text-sm font-medium text-orange-600">{data.overview.inventory.low_stock_products}</dd>
                            <dt className="text-sm text-gray-500 mt-1">Out of Stock</dt>
                            <dd className="text-sm font-medium text-red-600">{data.overview.inventory.out_of_stock_products}</dd>
                            <dt className="text-sm text-gray-500 mt-1">Health Score</dt>
                            <dd className={`text-sm font-semibold ${getBusinessHealthColor(data.overview.inventory.stock_health_score)}`}>
                              {data.overview.inventory.stock_health_score}%
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CurrencyDollarIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
                            <dd className="text-lg font-medium text-gray-900">
                              UGX {data.overview.financial.total_revenue?.toLocaleString() || 0}
                            </dd>
                            <dt className="text-sm text-gray-500 mt-1">Monthly Growth</dt>
                            <dd className={`text-sm font-semibold ${data.overview.financial.monthly_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.overview.financial.monthly_growth > 0 ? '+' : ''}{data.overview.financial.monthly_growth}%
                            </dd>
                            <dt className="text-sm text-gray-500 mt-1">Weekly Growth</dt>
                            <dd className={`text-sm font-semibold ${data.overview.financial.weekly_growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {data.overview.financial.weekly_growth > 0 ? '+' : ''}{data.overview.financial.weekly_growth}%
                            </dd>
                            <dt className="text-sm text-gray-500 mt-1">Profit Margin</dt>
                            <dd className="text-sm font-semibold text-blue-600">{data.overview.financial.profit_margin}%</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Metrics */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UserGroupIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                            <dd className="text-lg font-medium text-gray-900">{data.overview.customers.total_customers}</dd>
                            <dt className="text-sm text-gray-500 mt-1">New This Month</dt>
                            <dd className="text-sm font-medium text-green-600">{data.overview.customers.new_customers_this_month}</dd>
                            <dt className="text-sm text-gray-500 mt-1">Satisfaction</dt>
                            <dd className={`text-sm font-semibold ${getBusinessHealthColor(data.overview.customers.customer_satisfaction_score)}`}>
                              {data.overview.customers.customer_satisfaction_score}%
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Employee Metrics */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UserGroupIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                            <dd className="text-lg font-medium text-gray-900">{data.overview.employees.total_employees}</dd>
                            <dt className="text-sm text-gray-500 mt-1">Active Employees</dt>
                            <dd className="text-sm font-medium text-green-600">{data.overview.employees.active_employees}</dd>
                            <dt className="text-sm text-gray-500 mt-1">Productivity</dt>
                            <dd className={`text-sm font-semibold ${getBusinessHealthColor(data.overview.employees.productivity_score)}`}>
                              {data.overview.employees.productivity_score}%
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Placeholder for other tabs */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Intelligence Dashboard</h3>
                  <p className="text-gray-500">Real-time AI-powered insights and analytics are being loaded...</p>
                </div>

                {/* Real-Time Updates */}
                {data?.real_time_updates && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Real-Time System Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getSystemStatusColor(data.real_time_updates.system_alerts.database_performance)}`}>
                          {data.real_time_updates.system_alerts.database_performance}
                        </div>
                        <div className="text-sm text-gray-500">Database Performance</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-semibold ${getSystemStatusColor(data.real_time_updates.system_alerts.api_response_time)}`}>
                          {data.real_time_updates.system_alerts.api_response_time}
                        </div>
                        <div className="text-sm text-gray-500">API Response Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-green-600">
                          {data.real_time_updates.system_alerts.system_uptime}
                        </div>
                        <div className="text-sm text-gray-500">System Uptime</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

             {/* Other tabs would be implemented similarly */}
             {activeTab !== 'overview' && (
               <div className="bg-white shadow rounded-lg p-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                 <p className="text-gray-500">This section is under development. The intelligence dashboard is working and ready for enhanced features.</p>
               </div>
             )}

             {/* Trends Tab */}
             {activeTab === 'trends' && data?.trends && (
               <div className="space-y-6">
                 {/* Growth Forecast */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Forecast</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-indigo-600">{data.trends.growth_forecast.next_month}%</div>
                       <div className="text-sm text-gray-500">Next Month</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-green-600">{data.trends.growth_forecast.next_quarter}%</div>
                       <div className="text-sm text-gray-500">Next Quarter</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-blue-600">{data.trends.growth_forecast.confidence_level}%</div>
                       <div className="text-sm text-gray-500">Confidence Level</div>
                     </div>
                   </div>
                 </div>

                 {/* Seasonal Patterns */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Seasonal Analysis</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div>
                       <div className="text-sm font-medium text-gray-500">Current Season</div>
                       <div className="text-lg font-semibold text-gray-900 capitalize">{data.trends.seasonal_patterns.current_season}</div>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-500">Seasonal Multiplier</div>
                       <div className="text-lg font-semibold text-gray-900">{data.trends.seasonal_patterns.seasonal_multiplier}x</div>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-500">Trend Direction</div>
                       <div className="text-lg font-semibold text-green-600 capitalize">{data.trends.seasonal_patterns.trend_direction}</div>
                     </div>
                   </div>
                 </div>

                 {/* Top Performing Products */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Products</h3>
                   {data.trends.top_performing_products.length > 0 ? (
                     <div className="space-y-3">
                       {data.trends.top_performing_products.slice(0, 5).map((product: any, index: number) => (
                         <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                           <div>
                             <div className="font-medium text-gray-900">{product.name}</div>
                             <div className="text-sm text-gray-500">{product.total_sold} units sold</div>
                           </div>
                           <div className="text-right">
                             <div className="font-semibold text-gray-900">UGX {product.revenue?.toLocaleString()}</div>
                             <div className="text-sm text-green-600">Revenue</div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <p className="text-gray-500">No product performance data available</p>
                   )}
                 </div>
               </div>
             )}

             {/* Alerts Tab */}
             {activeTab === 'alerts' && data?.alerts && (
               <div className="space-y-6">
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Intelligent Alerts</h3>
                   {data.alerts.length > 0 ? (
                     <div className="space-y-4">
                       {data.alerts.map((alert: any, index: number) => (
                         <div key={index} className={`p-4 rounded-lg border ${getPriorityColor(alert.priority)}`}>
                           <div className="flex items-start justify-between">
                             <div className="flex-1">
                               <div className="flex items-center">
                                 <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                 <h4 className="font-medium text-gray-900">{alert.title}</h4>
                               </div>
                               <p className="mt-1 text-sm text-gray-600">{alert.message}</p>
                               {alert.days_until_expiry && (
                                 <p className="mt-1 text-sm text-orange-600">
                                   Expires in {alert.days_until_expiry} days
                                 </p>
                               )}
                             </div>
                             <div className="ml-4">
                               <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                 {alert.priority}
                               </span>
                             </div>
                           </div>
                           <div className="mt-3 flex space-x-2">
                             <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium">
                               {alert.action}
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center py-8">
                       <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                       <h3 className="text-lg font-medium text-gray-900 mb-2">All Clear!</h3>
                       <p className="text-gray-500">No alerts at this time. Your business is running smoothly.</p>
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Predictions Tab */}
             {activeTab === 'predictions' && data?.predictions && (
               <div className="space-y-6">
                 {/* Demand Forecast */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Demand Forecast</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-blue-600">{data.predictions.demand_forecast.predicted_demand}</div>
                       <div className="text-sm text-gray-500">Predicted Demand</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-green-600">{data.predictions.demand_forecast.confidence_level}%</div>
                       <div className="text-sm text-gray-500">Confidence Level</div>
                     </div>
                     <div className="text-center">
                       <div className="text-sm text-gray-500">Factors</div>
                       <div className="text-sm font-medium text-gray-900">
                         {data.predictions.demand_forecast.factors.join(', ')}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Revenue Prediction */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Prediction</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-green-600">UGX {data.predictions.revenue_prediction.next_month?.toLocaleString()}</div>
                       <div className="text-sm text-gray-500">Next Month</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-blue-600">{data.predictions.revenue_prediction.growth_rate}%</div>
                       <div className="text-sm text-gray-500">Growth Rate</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-indigo-600">{data.predictions.revenue_prediction.confidence}%</div>
                       <div className="text-sm text-gray-500">Confidence</div>
                     </div>
                   </div>
                 </div>

                 {/* Customer Behavior */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Behavior Insights</h3>
                   <div className="space-y-4">
                     <div>
                       <div className="text-sm font-medium text-gray-500">Preferred Products</div>
                       <div className="text-sm text-gray-900">{data.predictions.customer_behavior.preferred_products.join(', ')}</div>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-500">Purchase Patterns</div>
                       <div className="text-sm text-gray-900 capitalize">{data.predictions.customer_behavior.purchase_patterns}</div>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-500">Lifetime Value</div>
                       <div className="text-sm text-gray-900">UGX {data.predictions.customer_behavior.lifetime_value?.toLocaleString()}</div>
                     </div>
                   </div>
                 </div>

                 {/* Market Trends */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Market Trends</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                       <div className="text-sm font-medium text-gray-500">Market Growth</div>
                       <div className="text-lg font-semibold text-green-600">{data.predictions.market_trends.market_growth}%</div>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-500">Competition Level</div>
                       <div className="text-lg font-semibold text-gray-900 capitalize">{data.predictions.market_trends.competition_level}</div>
                     </div>
                     <div className="md:col-span-2">
                       <div className="text-sm font-medium text-gray-500">Opportunities</div>
                       <div className="text-sm text-gray-900">{data.predictions.market_trends.opportunities.join(', ')}</div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Performance Tab */}
             {activeTab === 'performance' && data?.performance && (
               <div className="space-y-6">
                 {/* Inventory Performance */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Performance</h3>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-blue-600">{data.performance.inventory.turnover_rate}</div>
                       <div className="text-sm text-gray-500">Turnover Rate</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-orange-600">{data.performance.inventory.carrying_cost}%</div>
                       <div className="text-sm text-gray-500">Carrying Cost</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-red-600">{data.performance.inventory.stockout_rate}%</div>
                       <div className="text-sm text-gray-500">Stockout Rate</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-green-600">{data.performance.inventory.accuracy_rate}%</div>
                       <div className="text-sm text-gray-500">Accuracy Rate</div>
                     </div>
                   </div>
                 </div>

                 {/* Financial Performance */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Performance</h3>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-green-600">{data.performance.financial.roi}%</div>
                       <div className="text-sm text-gray-500">ROI</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-blue-600">UGX {data.performance.financial.cash_flow?.toLocaleString()}</div>
                       <div className="text-sm text-gray-500">Cash Flow</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-indigo-600">{data.performance.financial.profit_margin}%</div>
                       <div className="text-sm text-gray-500">Profit Margin</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-purple-600">{data.performance.financial.break_even_point}</div>
                       <div className="text-sm text-gray-500">Break Even Point</div>
                     </div>
                   </div>
                 </div>

                 {/* Operational Performance */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Operational Performance</h3>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="text-center">
                       <div className="text-2xl font-bold text-green-600">{data.performance.operational.order_fulfillment_rate}%</div>
                       <div className="text-sm text-gray-500">Order Fulfillment</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-blue-600">{data.performance.operational.customer_satisfaction}%</div>
                       <div className="text-sm text-gray-500">Customer Satisfaction</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-indigo-600">{data.performance.operational.employee_productivity}%</div>
                       <div className="text-sm text-gray-500">Employee Productivity</div>
                     </div>
                     <div className="text-center">
                       <div className="text-2xl font-bold text-purple-600">{data.performance.operational.quality_score}%</div>
                       <div className="text-sm text-gray-500">Quality Score</div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* AI Insights Tab */}
             {activeTab === 'insights' && data?.ai_insights && (
               <div className="space-y-6">
                 {/* Business Health */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Business Health Score</h3>
                   <div className="text-center">
                     <div className={`text-4xl font-bold ${getBusinessHealthColor(data.ai_insights.business_health.score)}`}>
                       {data.ai_insights.business_health.score}%
                     </div>
                     <div className={`text-lg font-medium capitalize ${getStatusColor(data.ai_insights.business_health.status)}`}>
                       {data.ai_insights.business_health.status}
                     </div>
                     <div className="mt-4">
                       <div className="text-sm font-medium text-gray-500 mb-2">Recommendations</div>
                       <div className="space-y-1">
                         {data.ai_insights.business_health.recommendations.map((rec: string, index: number) => (
                           <div key={index} className="text-sm text-gray-700">• {rec.replace(/_/g, ' ')}</div>
                         ))}
                       </div>
                     </div>
                   </div>
                 </div>

                 {/* Growth Opportunities */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Growth Opportunities</h3>
                   <div className="space-y-4">
                     <div>
                       <div className="text-sm font-medium text-gray-500 mb-2">New Markets</div>
                       <div className="text-sm text-gray-900">{data.ai_insights.growth_opportunities.new_markets.join(', ')}</div>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-500 mb-2">Product Expansion</div>
                       <div className="text-sm text-gray-900">{data.ai_insights.growth_opportunities.product_expansion.join(', ')}</div>
                     </div>
                     <div>
                       <div className="text-sm font-medium text-gray-500 mb-2">Efficiency Improvements</div>
                       <div className="text-sm text-gray-900">{data.ai_insights.growth_opportunities.efficiency_improvements.join(', ')}</div>
                     </div>
                   </div>
                 </div>

                 {/* Risk Assessment */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Assessment</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                     <div className="text-center">
                       <div className={`text-lg font-semibold capitalize ${getRiskColor(data.ai_insights.risk_assessment.market_risk)}`}>
                         {data.ai_insights.risk_assessment.market_risk}
                       </div>
                       <div className="text-sm text-gray-500">Market Risk</div>
                     </div>
                     <div className="text-center">
                       <div className={`text-lg font-semibold capitalize ${getRiskColor(data.ai_insights.risk_assessment.operational_risk)}`}>
                         {data.ai_insights.risk_assessment.operational_risk}
                       </div>
                       <div className="text-sm text-gray-500">Operational Risk</div>
                     </div>
                     <div className="text-center">
                       <div className={`text-lg font-semibold capitalize ${getRiskColor(data.ai_insights.risk_assessment.financial_risk)}`}>
                         {data.ai_insights.risk_assessment.financial_risk}
                       </div>
                       <div className="text-sm text-gray-500">Financial Risk</div>
                     </div>
                   </div>
                   <div>
                     <div className="text-sm font-medium text-gray-500 mb-2">Mitigation Strategies</div>
                     <div className="text-sm text-gray-900">{data.ai_insights.risk_assessment.mitigation_strategies.join(', ')}</div>
                   </div>
                 </div>

                 {/* Optimization Suggestions */}
                 <div className="bg-white shadow rounded-lg p-6">
                   <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Suggestions</h3>
                   <div className="space-y-4">
                     <div className="p-3 bg-blue-50 rounded-lg">
                       <div className="text-sm font-medium text-blue-900 mb-1">Inventory Optimization</div>
                       <div className="text-sm text-blue-700">{data.ai_insights.optimization_suggestions.inventory_optimization}</div>
                     </div>
                     <div className="p-3 bg-green-50 rounded-lg">
                       <div className="text-sm font-medium text-green-900 mb-1">Process Improvement</div>
                       <div className="text-sm text-green-700">{data.ai_insights.optimization_suggestions.process_improvement}</div>
                     </div>
                     <div className="p-3 bg-purple-50 rounded-lg">
                       <div className="text-sm font-medium text-purple-900 mb-1">Cost Reduction</div>
                       <div className="text-sm text-purple-700">{data.ai_insights.optimization_suggestions.cost_reduction}</div>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {/* Fallback for other tabs */}
             {!['overview', 'trends', 'alerts', 'predictions', 'performance', 'insights'].includes(activeTab) && (
               <div className="bg-white shadow rounded-lg p-6">
                 <h3 className="text-lg font-medium text-gray-900 mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                 <p className="text-gray-500">This section is under development. The intelligence dashboard is working and ready for enhanced features.</p>
               </div>
             )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
