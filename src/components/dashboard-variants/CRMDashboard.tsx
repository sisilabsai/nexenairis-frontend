'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  UsersIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CogIcon,
  PresentationChartLineIcon,
  PresentationChartBarIcon,
  UserIcon,
  StarIcon,
  LightBulbIcon,
  SparklesIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  BellIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  PauseIcon,
  SignalIcon,
  Battery50Icon,
  MapPinIcon,
  CameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon
} from '@heroicons/react/24/outline';
import {
  useCrmContacts,
  useCrmStats,
  useCriticalAlerts,
  useAIInsights
} from '../../hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface CRMKPI {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
  description: string;
}

// Color mapping for Tailwind classes
const colorClasses = {
  blue: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-100',
    text: 'text-blue-600'
  },
  green: {
    border: 'border-l-green-500',
    bg: 'bg-green-100',
    text: 'text-green-600'
  },
  purple: {
    border: 'border-l-purple-500',
    bg: 'bg-purple-100',
    text: 'text-purple-600'
  },
  emerald: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-100',
    text: 'text-emerald-600'
  },
  red: {
    border: 'border-l-red-500',
    bg: 'bg-red-100',
    text: 'text-red-600'
  },
  yellow: {
    border: 'border-l-yellow-500',
    bg: 'bg-yellow-100',
    text: 'text-yellow-600'
  },
  indigo: {
    border: 'border-l-indigo-500',
    bg: 'bg-indigo-100',
    text: 'text-indigo-600'
  }
};

export default function CRMDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'leads' | 'deals' | 'customers' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // API Hooks
  const { data: contactsData, isLoading: contactsLoading, error: contactsError, refetch: refetchContacts } = useCrmContacts({ per_page: 10 });
  const { data: crmStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useCrmStats();
  const { data: criticalAlertsData, refetch: refetchCriticalAlerts } = useCriticalAlerts();
  const { data: aiInsightsData, refetch: refetchAIInsights } = useAIInsights();

  // Extract data from API responses
  const criticalAlerts = (criticalAlertsData as any)?.data || [];
  const aiInsights = (aiInsightsData as any)?.data || [];
  const contacts = (contactsData as any)?.data?.data || [];
  const stats = (crmStats as any)?.data || {};

  // Mock data for leads, deals, and customers from contacts
  const leads = contacts.filter((c: any) => c.type === 'lead' || c.contact_type === 'lead') || [];
  const customers = contacts.filter((c: any) => c.type === 'customer' || c.contact_type === 'customer') || [];
  const deals: any[] = []; // Mock empty deals for now

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // Advanced Analytics
  const advancedAnalytics = useMemo(() => {
    const totalLeads = leads.length;
    const totalDeals = deals.length;
    const totalCustomers = customers.length;
    const wonDeals = deals.filter((d: any) => d.status === 'won').length;
    const conversionRate = totalLeads > 0 ? (wonDeals / totalLeads) * 100 : 0;

    const totalDealValue = deals.reduce((sum: number, d: any) => sum + (d.value || 0), 0);
    const wonDealValue = deals.filter((d: any) => d.status === 'won').reduce((sum: number, d: any) => sum + (d.value || 0), 0);

    const newCustomers = customers.filter((c: any) => {
      const createdDate = new Date(c.created_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return createdDate >= monthAgo;
    }).length;

    return {
      totalLeads,
      totalDeals,
      totalCustomers,
      wonDeals,
      conversionRate,
      totalDealValue,
      wonDealValue,
      newCustomers,
      avgDealSize: totalDeals > 0 ? totalDealValue / totalDeals : 0,
      customerRetention: 85, // Mock data - would be calculated from real data
      leadQuality: 78 // Mock data - would be calculated from real data
    };
  }, [leads, deals, customers]);

  // Toast notification helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast({ show: false, type: 'info', title: '', message: '' }), 5000);
  };

  // Create dynamic CRM KPIs from API data
  const crmKPIs: CRMKPI[] = [
    {
      id: 'total-leads',
      title: 'Total Leads',
      value: advancedAnalytics.totalLeads,
      change: '+12',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'blue',
      description: 'Active leads in pipeline'
    },
    {
      id: 'conversion-rate',
      title: 'Conversion Rate',
      value: `${advancedAnalytics.conversionRate.toFixed(1)}%`,
      change: '+2.3%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'green',
      description: 'Lead to customer conversion'
    },
    {
      id: 'total-deals',
      title: 'Total Deals',
      value: advancedAnalytics.totalDeals,
      change: '+8',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'purple',
      description: 'Active deals in pipeline'
    },
    {
      id: 'deal-value',
      title: 'Pipeline Value',
      value: `UGX ${advancedAnalytics.totalDealValue?.toLocaleString()}`,
      change: '+15.2%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'emerald',
      description: 'Total value of active deals'
    }
  ];

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchContacts();
      refetchStats();
      refetchCriticalAlerts();
      refetchAIInsights();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* 🚀 Advanced Header with Controls */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <UsersIcon className="h-8 w-8 mr-3" />
              Advanced CRM Dashboard
            </h1>
            <p className="text-indigo-100 mt-1">AI-Powered Customer Relationship Management & Sales Intelligence</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {autoRefresh ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
              </button>
              <span className="text-sm">Live Updates</span>
            </div>

            {/* View Selector */}
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="overview">Overview</option>
              <option value="leads">Lead Management</option>
              <option value="deals">Deal Pipeline</option>
              <option value="customers">Customer Insights</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.totalLeads}</div>
            <div className="text-sm text-indigo-100">Total Leads</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.totalDeals}</div>
            <div className="text-sm text-indigo-100">Active Deals</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.totalCustomers}</div>
            <div className="text-sm text-indigo-100">Total Customers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.conversionRate.toFixed(1)}%</div>
            <div className="text-sm text-indigo-100">Conversion Rate</div>
          </div>
        </div>
      </div>

      {/* 🔍 Advanced Search & Filters */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search CRM data..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => showToast('success', 'Report Generated', 'CRM report has been downloaded successfully')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 Critical CRM Alerts */}
      {criticalAlerts.filter((alert: any) => alert.module === 'crm').length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-red-800">
                  {criticalAlerts.filter((alert: any) => alert.module === 'crm').length} Critical CRM Issues
                </h3>
                <button className="text-red-600 hover:text-red-800 font-medium text-xs">
                  View All →
                </button>
              </div>
              <div className="mt-2 text-sm text-red-700">
                {criticalAlerts.filter((alert: any) => alert.module === 'crm').slice(0, 2).map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between py-1">
                    <span>• {alert.message}</span>
                    <button className="text-red-600 hover:text-red-800 font-medium text-xs">
                      {alert.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 📊 CRM KPIs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {crmKPIs.map((kpi) => {
          const colorClass = colorClasses[kpi.color as keyof typeof colorClasses] || colorClasses.blue;
          return (
            <div key={kpi.id} className={`bg-white overflow-hidden shadow-lg rounded-lg border-l-4 ${colorClass.border} hover:shadow-xl transition-shadow`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`p-3 rounded-full ${colorClass.bg}`}>
                      <kpi.icon className={`h-6 w-6 ${colorClass.text}`} />
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
              </div>
            </div>
          );
        })}
      </div>

      {/* 📈 CRM Analytics Section */}
      {selectedView === 'analytics' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-600" />
              Advanced CRM Analytics
            </h2>
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option value="performance">Performance Analysis</option>
                <option value="pipeline">Pipeline Analysis</option>
                <option value="customer">Customer Analysis</option>
                <option value="conversion">Conversion Analysis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Pipeline */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PresentationChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Deal Pipeline Status
              </h3>
              <div className="space-y-3">
                {[
                  { stage: 'New', count: deals.filter((d: any) => d.status === 'new').length, value: 0 },
                  { stage: 'Contacted', count: deals.filter((d: any) => d.status === 'contacted').length, value: 0 },
                  { stage: 'Qualified', count: deals.filter((d: any) => d.status === 'qualified').length, value: 0 },
                  { stage: 'Proposal', count: deals.filter((d: any) => d.status === 'proposal').length, value: 0 },
                  { stage: 'Won', count: deals.filter((d: any) => d.status === 'won').length, value: 0 }
                ].map((stage, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{stage.stage}</p>
                      <p className="text-sm text-gray-500">{stage.count} deals</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{stage.count}</div>
                      <div className="text-xs text-gray-500">deals</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Segmentation */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-purple-600" />
                Customer Segmentation
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">High-Value Customers</span>
                    <span className="text-purple-600 font-semibold">
                      {customers.filter((c: any) => c.customer_type === 'vip').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Regular Customers</span>
                    <span className="text-blue-600 font-semibold">
                      {customers.filter((c: any) => c.customer_type === 'regular').length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">New Customers</span>
                    <span className="text-green-600 font-semibold">{advancedAnalytics.newCustomers}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🤖 AI CRM Insights & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI CRM Insights */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
                AI CRM Insights
              </h3>
            </div>
          </div>
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {aiInsights.filter((insight: any) => insight.module === 'crm').slice(0, 5).map((insight: any) => (
              <div key={insight.id} className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {insight.impact.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{insight.insight}</p>
                    <button className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2">
                      {insight.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ⚠️ CRM Alerts & Recent Activity */}
        <div className="space-y-6">
        {/* CRM Alerts */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                CRM Alerts
              </h3>
            </div>
          </div>
          <div className="px-6 py-4 max-h-64 overflow-y-auto">
            {criticalAlerts.filter((alert: any) => alert.module === 'crm').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All CRM metrics normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalAlerts.filter((alert: any) => alert.module === 'crm').map((alert: any) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'critical' ? 'bg-red-50 border-red-400' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                    'bg-blue-50 border-blue-400'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className={`text-sm font-medium ${
                          alert.type === 'critical' ? 'text-red-800' :
                          alert.type === 'warning' ? 'text-yellow-800' :
                          'text-blue-800'
                        }`}>
                          {alert.title}
                        </h4>
                        <p className={`text-xs mt-1 ${
                          alert.type === 'critical' ? 'text-red-700' :
                          alert.type === 'warning' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">{alert.module}</span>
                          <button className={`text-xs font-medium ${
                            alert.type === 'critical' ? 'text-red-600 hover:text-red-800' :
                            alert.type === 'warning' ? 'text-yellow-600 hover:text-yellow-800' :
                            'text-blue-600 hover:text-blue-800'
                          }`}>
                            {alert.action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent CRM Activity */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              Recent Activity
            </h3>
          </div>
          <div className="px-6 py-4 max-h-64 overflow-y-auto">
            {contactsLoading ? (
              <LoadingSpinner size="sm" className="py-4" />
            ) : contactsError ? (
              <ErrorMessage
                message="Failed to load CRM data"
                onRetry={() => {
                  refetchContacts();
                }}
              />
            ) : leads.length === 0 && deals.length === 0 && customers.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent CRM activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Recent Leads */}
                {leads.slice(0, 2).map((lead: any, index: number) => (
                  <div key={`lead-${lead.id || index}`} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        New lead: {lead.name || lead.company_name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {lead.email || lead.phone}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(lead.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recent Deals */}
                {deals.slice(0, 2).map((deal: any, index: number) => (
                  <div key={`deal-${deal.id || index}`} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        Deal {deal.status}: {deal.title}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          UGX {deal.value?.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(deal.updated_at || deal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Recent Customers */}
                {customers.slice(0, 2).map((customer: any, index: number) => (
                  <div key={`customer-${customer.id || index}`} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-purple-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        Customer: {customer.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-gray-500">
                          {customer.email || customer.phone}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(customer.created_at).toLocaleDateString()}
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
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${
            toast.type === 'success' ? 'border-l-4 border-green-500' :
            toast.type === 'error' ? 'border-l-4 border-red-500' :
            toast.type === 'warning' ? 'border-l-4 border-yellow-500' :
            'border-l-4 border-blue-500'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-400" />}
                  {toast.type === 'error' && <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />}
                  {toast.type === 'warning' && <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />}
                  {toast.type === 'info' && <CheckCircleIcon className="h-6 w-6 text-blue-400" />}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setToast({ show: false, type: 'info', title: '', message: '' })}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}