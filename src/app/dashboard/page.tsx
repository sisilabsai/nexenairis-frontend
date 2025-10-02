'use client';

import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  BellIcon,
  SparklesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CogIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  UsersIcon,
  BanknotesIcon,
  CubeIcon,
  BriefcaseIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import {
  useDashboardStats,
  useRecentActivity,
  useInventoryStats,
  useSalesAnalytics,
  useDailySalesSummary,
  useHourlySalesPattern,
  useTopSellingProducts,
  useCrmSummary,
  useHrSummary,
  useProjectsStats,
  useFinanceSummary,
  useCriticalAlerts,
  useAIInsights,
  useSystemHealth
} from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useNotificationPersistence } from '../../components/DatabaseNotificationPersistence';
import DashboardVariantSelector, { DashboardVariant } from '../../components/DashboardVariantSelector';
import InventoryDashboard from '../../components/dashboard-variants/InventoryDashboard';
import SalesDashboard from '../../components/dashboard-variants/SalesDashboard';
import ProjectDashboard from '../../components/dashboard-variants/ProjectDashboard';
import HRDashboard from '../../components/dashboard-variants/HRDashboard';
import CRMDashboard from '../../components/dashboard-variants/CRMDashboard';

interface KPIWidget {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
  description: string;
  trend: number[];
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action: string;
  timestamp: string;
  module: string;
}

interface AIInsight {
  id: string;
  type: 'prediction' | 'recommendation' | 'optimization' | 'alert';
  title: string;
  insight: string;
  confidence: number;
  impact: 'high' | 'medium' | 'low';
  action: string;
  module: string;
}

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('today');
  const [showAIInsights, setShowAIInsights] = useState(true);
  const [showCriticalAlerts, setShowCriticalAlerts] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<DashboardVariant>('executive');

  // API Hooks for real-time data
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats(selectedPeriod);
  const { data: activityData, isLoading: activityLoading, error: activityError, refetch: refetchActivity } = useRecentActivity();
  const { data: inventoryStats, refetch: refetchInventory } = useInventoryStats();
  const { data: salesAnalyticsData, isLoading: salesAnalyticsLoading, error: salesAnalyticsError, refetch: refetchSales } = useSalesAnalytics();
  const { data: dailySalesData, isLoading: dailySalesLoading, error: dailySalesError } = useDailySalesSummary();
  const { data: hourlySalesData, isLoading: hourlySalesLoading, error: hourlySalesError } = useHourlySalesPattern();
  const { data: topProductsData, isLoading: topProductsLoading, error: topProductsError } = useTopSellingProducts();

  // Additional hooks for comprehensive dashboard
  const { data: crmSummary } = useCrmSummary();
  const { data: hrSummary } = useHrSummary();
  const { data: projectsStats } = useProjectsStats();
  const { data: financeSummary } = useFinanceSummary();
  const { data: criticalAlertsData, refetch: refetchCriticalAlerts } = useCriticalAlerts();
  const { data: aiInsightsData, refetch: refetchAIInsights } = useAIInsights();
  const { data: systemHealthData } = useSystemHealth();

  // Extract data from API responses
  const criticalAlerts = (criticalAlertsData as any)?.data || [];
  const aiInsights = (aiInsightsData as any)?.data || [];

  // Add loading states for better UX
  const salesLoading = dailySalesLoading || salesAnalyticsLoading || hourlySalesLoading || topProductsLoading;
  const salesError = dailySalesError || salesAnalyticsError || hourlySalesError || topProductsError;

  // Extract inventory stats properly from array format
  const inventoryStatsArray = (inventoryStats as any)?.data || [];
  const inventoryStatsData = {
    total_products: inventoryStatsArray.find((stat: any) => stat.name === 'Total Products')?.value || 0,
    stock_status: inventoryStatsArray.find((stat: any) => stat.name === 'Stock Status')?.value || '85% in stock',
    inventory_value: inventoryStatsArray.find((stat: any) => stat.name === 'Inventory Value')?.value || 'UGX 0',
    low_stock_items: inventoryStatsArray.find((stat: any) => stat.name === 'Stock Status')?.subtitle?.split(',')[1]?.match(/\d+/)?.[0] || 0,
    health_score: (() => {
      const totalProducts = inventoryStatsArray.find((stat: any) => stat.name === 'Total Products')?.value || 0;
      const stockStatus = inventoryStatsArray.find((stat: any) => stat.name === 'Stock Status')?.value || '';
      const inStockMatch = stockStatus.match(/(\d+)\s+in stock/);
      const inStock = inStockMatch ? parseInt(inStockMatch[1]) : totalProducts;
      return totalProducts > 0 ? Math.round((inStock / totalProducts) * 100) : 85;
    })()
  };

  // Database notification persistence
  const { saveToDatabase } = useNotificationPersistence();

  // 🚀 Real-time KPI calculations
  const executiveKPIs: KPIWidget[] = [
    {
      id: 'revenue',
      title: 'Today\'s Revenue',
      // dailySalesData from the hook returns an object like { summary: { total_revenue, ... } }
      value: (dailySalesData as any)?.summary?.total_revenue ? `UGX ${(((dailySalesData as any).summary.total_revenue / 1000000).toFixed(1))}M` : 'UGX 0',
      // growth_rate may live in a different analytics payload; default to 0% when absent
      change: (dailySalesData as any)?.summary?.growth_rate ? `${(dailySalesData as any).summary.growth_rate > 0 ? '+' : ''}${(dailySalesData as any).summary.growth_rate.toFixed(1)}%` : '0%',
      changeType: ((dailySalesData as any)?.summary?.growth_rate || 0) >= 0 ? 'positive' : 'negative',
      icon: CurrencyDollarIcon,
      color: 'emerald',
      description: 'Revenue vs yesterday',
      // hourlySalesData may be an array (from the controller) or an object { hourly_sales: [] }
      trend: Array.isArray(hourlySalesData) ? (hourlySalesData as any) : (hourlySalesData as any)?.hourly_sales || [0, 0, 0, 0, 0, 0]
    },
    {
      id: 'inventory',
      title: 'Inventory Health',
      value: `${inventoryStatsData.health_score}%`,
      change: `${inventoryStatsData.low_stock_items} alerts`,
      changeType: parseInt(inventoryStatsData.low_stock_items) > 5 ? 'negative' : 'positive',
      icon: CubeIcon,
      color: 'blue',
      description: 'Stock levels & turnover',
      trend: (inventoryStats as any)?.data?.trend || [85, 87, 84, 89, 91, 88]
    },
    {
      id: 'projects',
      title: 'Project Delivery',
      value: (projectsStats as any)?.data?.delivery_rate ? `${(projectsStats as any).data.delivery_rate}%` : '94%',
      change: (projectsStats as any)?.data?.active_projects ? `+${(projectsStats as any).data.active_projects} active` : '+2.3%',
      changeType: 'positive',
      icon: BriefcaseIcon,
      color: 'purple',
      description: 'On-time completion rate',
      trend: [89, 91, 90, 93, 94, 94]
    },
    {
      id: 'team',
      title: 'Team Productivity',
      value: (hrSummary as any)?.data?.productivity_score ? `${(hrSummary as any).data.productivity_score}%` : '87%',
      change: (hrSummary as any)?.data?.engagement_rate ? `Engagement: ${(hrSummary as any).data.engagement_rate}%` : '+5.1%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'indigo',
      description: 'Employee engagement score',
      trend: [82, 84, 85, 86, 87, 87]
    }
  ];

  // 🚨 Critical Business Alerts - now from API
  // const [criticalAlerts, setCriticalAlerts] = useState<AlertItem[]>([]);

  // 🤖 AI-Powered Insights - now from API
  // const [aiInsights, setAIInsights] = useState<AIInsight[]>([]);

  // 🔄 Auto-refresh dashboard data
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchStats();
      refetchActivity();
      refetchInventory();
      refetchSales();
      refetchCriticalAlerts();
      refetchAIInsights();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 🚨 Critical alerts now loaded via API hooks
  // const loadCriticalAlerts = async () => { ... }

  // 🤖 AI insights now loaded via API hooks
  // const loadAIInsights = async () => { ... }

  // 🚀 Load real-time data on mount - now handled by API hooks
  useEffect(() => {
    // Data loading is now handled by React Query hooks
  }, []);

  // 🎯 Quick action handlers
  const handleQuickAction = async (action: string) => {
    // Save action to database for tracking
    await saveToDatabase({
      type: 'info',
      title: 'Quick Action',
      message: `User initiated ${action} from dashboard`,
      action: action,
      data: { source: 'dashboard', timestamp: new Date().toISOString() }
    });

    // Navigate to appropriate module
    switch (action) {
      case 'new-sale':
        window.location.href = '/inventory?tab=sales';
        break;
      case 'add-inventory':
        window.location.href = '/inventory?action=add-product';
        break;
      case 'new-customer':
        window.location.href = '/crm?action=add-contact';
        break;
      case 'new-project':
        window.location.href = '/projects?action=create';
        break;
      case 'mobile-scan':
        window.location.href = '/mobile-scan';
        break;
      case 'ai-insights':
        window.location.href = '/intelligence';
        break;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* 🎯 Mobile-First Dashboard Header */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="flex flex-col space-y-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {selectedVariant === 'executive' && 'Executive Dashboard'}
                  {selectedVariant === 'inventory' && 'Inventory Dashboard'}
                  {selectedVariant === 'sales' && 'Sales Dashboard'}
                  {selectedVariant === 'projects' && 'Project Dashboard'}
                  {selectedVariant === 'hr' && 'HR Dashboard'}
                  {selectedVariant === 'crm' && 'CRM Dashboard'}
                </h1>
                <p className="mt-1 text-xs text-gray-500">
                  {selectedVariant === 'executive' && 'Real-time intelligence'}
                  {selectedVariant === 'inventory' && 'Stock & supply chain'}
                  {selectedVariant === 'sales' && 'Revenue & analytics'}
                  {selectedVariant === 'projects' && 'Progress & resources'}
                  {selectedVariant === 'hr' && 'Employee management'}
                  {selectedVariant === 'crm' && 'Customer relationships'}
                </p>
              </div>

              {/* Mobile Controls */}
              <div className="flex flex-col space-y-3">
                {/* Dashboard Variant Selector - Full Width on Mobile */}
                <DashboardVariantSelector
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />
                
                <div className="flex items-center space-x-2">
                  {/* Auto-refresh toggle */}
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex-1 flex items-center justify-center px-3 py-2 text-sm rounded-lg ${
                      autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <CogIcon className="h-4 w-4 mr-2" />
                    Auto {autoRefresh ? 'ON' : 'OFF'}
                  </button>

                  {/* Period selector - only show for executive dashboard */}
                  {selectedVariant === 'executive' && (
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as any)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="today">Today</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="quarter">Quarter</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {selectedVariant === 'executive' && 'Executive Dashboard'}
                  {selectedVariant === 'inventory' && 'Inventory Dashboard'}
                  {selectedVariant === 'sales' && 'Sales Dashboard'}
                  {selectedVariant === 'projects' && 'Project Dashboard'}
                  {selectedVariant === 'hr' && 'HR Dashboard'}
                  {selectedVariant === 'crm' && 'CRM Dashboard'}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedVariant === 'executive' && 'Real-time business intelligence • Last updated: ' + new Date().toLocaleTimeString()}
                  {selectedVariant === 'inventory' && 'Stock levels, product performance, and supply chain intelligence'}
                  {selectedVariant === 'sales' && 'Revenue tracking, customer analytics, and sales performance'}
                  {selectedVariant === 'projects' && 'Project progress, timelines, and resource management'}
                  {selectedVariant === 'hr' && 'Employee management, attendance, and HR analytics'}
                  {selectedVariant === 'crm' && 'Customer relationships, leads, and sales pipeline management'}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Dashboard Variant Selector */}
                <DashboardVariantSelector
                  selectedVariant={selectedVariant}
                  onVariantChange={setSelectedVariant}
                />

                {/* Auto-refresh toggle */}
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg ${
                    autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  <CogIcon className="h-4 w-4 mr-2" />
                  Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
                </button>

                {/* Period selector - only show for executive dashboard */}
                {selectedVariant === 'executive' && (
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value as any)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🎯 Smart Dashboard Content */}
        {selectedVariant === 'executive' && (
          <>
            {/* 🚨 Mobile-Responsive Critical Alerts Banner */}
            {criticalAlerts.filter((alert: any) => alert.type === 'critical').length > 0 && (
              <div className="mb-4 sm:mb-6 bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-400 mr-2 sm:mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-red-800">
                      {criticalAlerts.filter((alert: any) => alert.type === 'critical').length} Critical Issues Need Attention
                    </h3>
                    <div className="mt-2 space-y-2">
                      {criticalAlerts.filter((alert: any) => alert.type === 'critical').slice(0, 2).map((alert: any) => (
                        <div key={alert.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
                          <span className="text-sm text-red-700">• {alert.message}</span>
                          <button
                            onClick={() => handleQuickAction(alert.action.toLowerCase().replace(' ', '-'))}
                            className="text-red-600 hover:text-red-800 font-medium text-xs self-start sm:self-auto px-2 py-1 bg-red-100 rounded sm:bg-transparent sm:px-0 sm:py-0"
                          >
                            {alert.action} →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Render Dashboard Variants */}
        {selectedVariant === 'inventory' && <InventoryDashboard />}
        {selectedVariant === 'sales' && <SalesDashboard />}
        {selectedVariant === 'projects' && <ProjectDashboard />}
        {selectedVariant === 'hr' && <HRDashboard />}
        {selectedVariant === 'crm' && <CRMDashboard />}

        {/* Executive Dashboard Content */}
        {selectedVariant === 'executive' && (
          <>
            {/* 📊 Mobile-First Executive KPIs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
              {executiveKPIs.map((kpi) => (
                <div key={kpi.id} className="bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-l-blue-500 hover:shadow-xl transition-shadow">
                  <div className="p-4 sm:p-5">
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2 rounded-full bg-${kpi.color}-100`}>
                          <kpi.icon className={`h-5 w-5 text-${kpi.color}-600`} />
                        </div>
                        <div className={`flex items-center text-xs font-semibold ${
                          kpi.changeType === 'positive' ? 'text-green-600' :
                          kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {kpi.changeType === 'positive' ? (
                            <ArrowUpIcon className="h-3 w-3 mr-1" />
                          ) : kpi.changeType === 'negative' ? (
                            <ArrowDownIcon className="h-3 w-3 mr-1" />
                          ) : null}
                          {kpi.change}
                        </div>
                      </div>
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">{kpi.title}</dt>
                        <dd className="text-xl font-bold text-gray-900 mt-1">{kpi.value}</dd>
                        <dt className="text-xs text-gray-400 mt-1">{kpi.description}</dt>
                      </div>
                      {/* Mobile Mini trend chart */}
                      <div className="mt-3 flex items-end space-x-1 h-6">
                        {kpi.trend.map((value, index) => (
                          <div
                            key={index}
                            className={`bg-${kpi.color}-200 rounded-sm flex-1`}
                            style={{ height: `${(value / Math.max(...kpi.trend)) * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-3 rounded-full bg-${kpi.color}-100`}>
                            <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{kpi.title}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                              <div className={`ml-2 flex items-center text-sm font-semibold ${
                                kpi.changeType === 'positive' ? 'text-green-600' :
                                kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                              }`}>
                                {kpi.changeType === 'positive' ? (
                                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                                ) : kpi.changeType === 'negative' ? (
                                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                                ) : null}
                                {kpi.change}
                              </div>
                            </dd>
                            <dt className="text-xs text-gray-400 mt-1">{kpi.description}</dt>
                          </dl>
                        </div>
                      </div>

                      {/* Desktop Mini trend chart */}
                      <div className="mt-4 flex items-end space-x-1 h-8">
                        {kpi.trend.map((value, index) => (
                          <div
                            key={index}
                            className={`bg-${kpi.color}-200 rounded-sm flex-1`}
                            style={{ height: `${(value / Math.max(...kpi.trend)) * 100}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 🎯 Mobile-First Main Dashboard Grid */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">

              {/* 🤖 Mobile-Responsive AI Intelligence Hub */}
              {showAIInsights && (
                <div className="lg:col-span-1 bg-white shadow-lg rounded-lg">
                  <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                        <SparklesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-500" />
                        AI Intelligence
                      </h3>
                      <button
                        onClick={() => handleQuickAction('ai-insights')}
                        className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-medium px-2 py-1 bg-purple-50 rounded sm:bg-transparent sm:px-0 sm:py-0"
                      >
                        View All →
                      </button>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-80 sm:max-h-96 overflow-y-auto">
                    {aiInsights.slice(0, 5).map((insight: any) => (
                      <div key={insight.id} className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                                insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {insight.impact.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{insight.insight}</p>
                          </div>
                          <button
                            onClick={() => handleQuickAction(insight.action.toLowerCase().replace(' ', '-'))}
                            className="text-xs text-purple-600 hover:text-purple-800 font-medium self-start px-2 py-1 bg-purple-100 rounded hover:bg-purple-200 transition-colors"
                          >
                            {insight.action} →
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 📊 Mobile-Responsive Business Analytics Center */}
              <div className="lg:col-span-1 bg-white shadow-lg rounded-lg">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <ChartBarIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-500" />
                    Live Analytics
                  </h3>
                </div>
                <div className="px-4 sm:px-6 py-3 sm:py-4">

                  {/* Mobile-Responsive Sales Performance Chart */}
                  <div className="mb-4 sm:mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Today's Sales Performance</h4>
                    <div className="flex items-end space-x-1 h-20 sm:h-24 bg-gray-50 rounded-lg p-2 sm:p-3">
                      {(
                        Array.isArray(hourlySalesData)
                          ? (hourlySalesData as any)
                          : (hourlySalesData as any)?.hourly_sales || [12, 8, 15, 22, 28, 35, 42, 38]
                      ).map((value: number, index: number) => (
                        <div
                          key={index}
                          className="bg-blue-500 rounded-t flex-1 min-h-1 hover:bg-blue-600 transition-colors"
                          style={{ height: `${(value / 50) * 100}%` }}
                          title={`${index + 8}:00 - UGX ${value}K`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>8AM</span>
                      <span className="hidden sm:inline">12PM</span>
                      <span className="sm:hidden">12PM</span>
                      <span className="hidden sm:inline">4PM</span>
                      <span>8PM</span>
                    </div>
                  </div>

                  {/* Mobile-Responsive Top Products */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Top Selling Products</h4>
                    <div className="space-y-2">
                      {((topProductsData as any)?.length > 0 ? (topProductsData as any) : []).slice(0, 3).map((product: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                          <div className="flex items-center min-w-0 flex-1">
                            <span className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs flex items-center justify-center text-white flex-shrink-0 ${
                              index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="ml-2 text-xs sm:text-sm font-medium text-gray-900 truncate">{product.product_name || product.name}</span>
                          </div>
                          <div className="text-right ml-2 flex-shrink-0">
                            <div className="text-xs sm:text-sm font-bold text-gray-900">{product.total_quantity || product.sales || 0} units</div>
                            <div className="text-xs text-gray-500">UGX {(((product.total_revenue || product.revenue || 0) / 1000000).toFixed(1))}M</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ⚠️ Mobile-Responsive Critical Alerts & Recent Activity */}
              <div className="lg:col-span-1 space-y-4 sm:space-y-6">

                {/* Mobile-Responsive Critical Alerts */}
                {showCriticalAlerts && (
                  <div className="bg-white shadow-lg rounded-lg">
                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                          <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500" />
                          <span className="hidden sm:inline">Critical Alerts</span>
                          <span className="sm:hidden">Alerts</span>
                          {criticalAlerts.length > 0 && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                              {criticalAlerts.length}
                            </span>
                          )}
                        </h3>
                      </div>
                    </div>
                    <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-56 sm:max-h-64 overflow-y-auto">
                      {criticalAlerts.length === 0 ? (
                        <div className="text-center py-6 sm:py-8">
                          <CheckCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-500 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-500">All systems operating normally</p>
                        </div>
                      ) : (
                        <div className="space-y-2 sm:space-y-3">
                          {criticalAlerts.map((alert: any) => (
                            <div key={alert.id} className={`p-2 sm:p-3 rounded-lg border-l-4 ${
                              alert.type === 'critical' ? 'bg-red-50 border-red-400' :
                              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                              'bg-blue-50 border-blue-400'
                            }`}>
                              <div className="flex flex-col space-y-2">
                                <div>
                                  <h4 className={`text-xs sm:text-sm font-medium ${
                                    alert.type === 'critical' ? 'text-red-800' :
                                    alert.type === 'warning' ? 'text-yellow-800' :
                                    'text-blue-800'
                                  }`}>
                                    {alert.title}
                                  </h4>
                                  <p className={`text-xs mt-1 line-clamp-2 ${
                                    alert.type === 'critical' ? 'text-red-700' :
                                    alert.type === 'warning' ? 'text-yellow-700' :
                                    'text-blue-700'
                                  }`}>
                                    {alert.message}
                                  </p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">{alert.module}</span>
                                  <button
                                    onClick={() => handleQuickAction(alert.action.toLowerCase().replace(' ', '-'))}
                                    className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                                      alert.type === 'critical' ? 'text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200' :
                                      alert.type === 'warning' ? 'text-yellow-600 hover:text-yellow-800 bg-yellow-100 hover:bg-yellow-200' :
                                      'text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200'
                                    }`}
                                  >
                                    {alert.action} →
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobile-Responsive Recent Activity */}
                <div className="bg-white shadow-lg rounded-lg">
                  <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                      <ClockIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
                      Recent Activity
                    </h3>
                  </div>
                  <div className="px-4 sm:px-6 py-3 sm:py-4 max-h-56 sm:max-h-64 overflow-y-auto">
                    {activityLoading ? (
                      <LoadingSpinner size="sm" className="py-4" />
                    ) : activityError ? (
                      <ErrorMessage
                        message={activityError.message || 'Failed to load recent activity'}
                        onRetry={refetchActivity}
                      />
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {((activityData as any)?.data || []).slice(0, 8).map((activity: any) => (
                          <div key={activity.id} className="flex items-start space-x-2 sm:space-x-3 p-2 hover:bg-gray-50 rounded transition-colors">
                            <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                              activity.type === 'sale' ? 'bg-green-500' :
                              activity.type === 'inventory' ? 'bg-blue-500' :
                              activity.type === 'project' ? 'bg-purple-500' :
                              activity.type === 'hr' ? 'bg-orange-500' :
                              activity.type === 'mobile' ? 'bg-indigo-500' :
                              'bg-gray-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-900 line-clamp-2">{activity.message}</p>
                              <div className="flex items-center justify-between mt-1">
                                <p className="text-xs text-gray-500 truncate">{activity.user}</p>
                                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{activity.time}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 📈 Mobile-Responsive Financial Overview Widget */}
            <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">

              {/* Mobile-Responsive Financial Health */}
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <BanknotesIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-emerald-500" />
                    Financial Health
                  </h3>
                </div>
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-emerald-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-600">
                        UGX {(financeSummary as any)?.data?.monthly_revenue ? (((financeSummary as any).data.monthly_revenue / 1000000).toFixed(1)) : '0'}M
                      </div>
                      <div className="text-xs sm:text-sm text-emerald-700">Monthly Revenue</div>
                      <div className="text-xs text-emerald-600 mt-1">
                        {(financeSummary as any)?.data?.revenue_growth ? `${(financeSummary as any).data.revenue_growth > 0 ? '+' : ''}${(financeSummary as any).data.revenue_growth.toFixed(1)}% vs last month` : ''}
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {(financeSummary as any)?.data?.profit_margin ? `${(financeSummary as any).data.profit_margin}%` : '0%'}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-700">Profit Margin</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {(financeSummary as any)?.data?.margin_improvement ? `${(financeSummary as any).data.margin_improvement > 0 ? '+' : ''}${(financeSummary as any).data.margin_improvement.toFixed(1)}% improvement` : ''}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile-Responsive System Performance */}
              <div className="bg-white shadow-lg rounded-lg">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                    <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
                    System Health
                  </h3>
                </div>
                <div className="px-4 sm:px-6 py-4 sm:py-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-700">API Response Time</span>
                      <div className="flex items-center">
                        <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div className={`h-2 bg-green-500 rounded-full`} style={{ width: `${100 - ((systemHealthData as any)?.data?.api_response_time || 120) / 2}%` }}></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-green-600">{`Fast (${(systemHealthData as any)?.data?.api_response_time || 120}ms)`}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-700">Database Health</span>
                      <div className="flex items-center">
                        <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full mr-2">
                          <div className={`h-2 bg-green-500 rounded-full`} style={{ width: `${(systemHealthData as any)?.data?.database_health || 100}%` }}></div>
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-green-600">{(systemHealthData as any)?.data?.database_status || 'Excellent'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-700">Mobile Devices</span>
                      <div className="flex items-center">
                        <DevicePhoneMobileIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{`${(systemHealthData as any)?.data?.mobile_devices_connected || 0} connected`}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-gray-700">AI Services</span>
                      <div className="flex items-center">
                        <CpuChipIcon className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-1" />
                        <span className="text-xs sm:text-sm font-medium text-gray-900">{`${(systemHealthData as any)?.data?.ai_services_active || 0} active`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
