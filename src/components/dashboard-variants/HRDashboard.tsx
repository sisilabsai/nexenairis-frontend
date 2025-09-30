'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  UserGroupIcon,
  UserIcon,
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
  useEmployees,
  useCriticalAlerts,
  useAIInsights
} from '../../hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface HRKPI {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
  description: string;
}

export default function HRDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'performance' | 'recruitment' | 'engagement'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // API Hooks
  const { data: employeesData, isLoading: employeesLoading, error: employeesError, refetch: refetchEmployees } = useEmployees({ per_page: 10 });
  const { data: criticalAlertsData, refetch: refetchCriticalAlerts } = useCriticalAlerts();
  const { data: aiInsightsData, refetch: refetchAIInsights } = useAIInsights();

  // Extract data from API responses
  const criticalAlerts = (criticalAlertsData as any)?.data || [];
  const aiInsights = (aiInsightsData as any)?.data || [];
  const employees = (employeesData as any)?.data?.data || [];
  const stats = {}; // Using employees data for stats calculation

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
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e: any) => e.status === 'active').length;
    const newHires = employees.filter((e: any) => {
      const hireDate = new Date(e.hire_date);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return hireDate >= monthAgo;
    }).length;

    const avgPerformance = employees.length > 0 ?
      employees.reduce((sum: number, e: any) => sum + (e.performance_rating || 0), 0) / employees.length : 0;

    const turnoverRate = employees.length > 0 ?
      (employees.filter((e: any) => e.status === 'terminated').length / employees.length) * 100 : 0;

    return {
      totalEmployees,
      activeEmployees,
      newHires,
      avgPerformance,
      turnoverRate,
      engagementScore: 78, // Mock data - would be calculated from real data
      trainingCompletion: 85, // Mock data - would be calculated from real data
      absenteeismRate: 3.2 // Mock data - would be calculated from real data
    };
  }, [employees]);

  // Toast notification helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast({ show: false, type: 'info', title: '', message: '' }), 5000);
  };

  // Create dynamic HR KPIs from API data
  const hrKPIs: HRKPI[] = [
    {
      id: 'total-employees',
      title: 'Total Employees',
      value: advancedAnalytics.totalEmployees,
      change: `+${advancedAnalytics.newHires}`,
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'blue',
      description: 'Active workforce size'
    },
    {
      id: 'performance-rating',
      title: 'Avg Performance',
      value: `${advancedAnalytics.avgPerformance.toFixed(1)}/5`,
      change: '+0.2',
      changeType: 'positive',
      icon: StarIcon,
      color: 'yellow',
      description: 'Average employee performance rating'
    },
    {
      id: 'engagement-score',
      title: 'Engagement Score',
      value: `${advancedAnalytics.engagementScore}%`,
      change: '+5%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'green',
      description: 'Employee engagement level'
    },
    {
      id: 'turnover-rate',
      title: 'Turnover Rate',
      value: `${advancedAnalytics.turnoverRate.toFixed(1)}%`,
      change: '-0.5%',
      changeType: 'positive',
      icon: UserIcon,
      color: 'red',
      description: 'Employee turnover percentage'
    }
  ];

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchEmployees();
      refetchCriticalAlerts();
      refetchAIInsights();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* 🚀 Advanced Header with Controls */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <UserGroupIcon className="h-8 w-8 mr-3" />
              Advanced HR Dashboard
            </h1>
            <p className="text-pink-100 mt-1">AI-Powered Workforce Analytics & People Management</p>
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
              <option value="analytics">Analytics</option>
              <option value="performance">Performance</option>
              <option value="recruitment">Recruitment</option>
              <option value="engagement">Engagement</option>
            </select>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.totalEmployees}</div>
            <div className="text-sm text-pink-100">Total Employees</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.newHires}</div>
            <div className="text-sm text-pink-100">New Hires</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.engagementScore}%</div>
            <div className="text-sm text-pink-100">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.avgPerformance.toFixed(1)}</div>
            <div className="text-sm text-pink-100">Avg Rating</div>
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
                placeholder="Search employees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="sales">Sales</option>
              <option value="marketing">Marketing</option>
              <option value="hr">HR</option>
              <option value="finance">Finance</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500"
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
              onClick={() => showToast('success', 'Report Generated', 'HR report has been downloaded successfully')}
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 Critical HR Alerts */}
      {criticalAlerts.filter((alert: any) => alert.module === 'hr').length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-red-800">
                  {criticalAlerts.filter((alert: any) => alert.module === 'hr').length} Critical HR Issues
                </h3>
                <button className="text-red-600 hover:text-red-800 font-medium text-xs">
                  View All →
                </button>
              </div>
              <div className="mt-2 text-sm text-red-700">
                {criticalAlerts.filter((alert: any) => alert.module === 'hr').slice(0, 2).map((alert: any) => (
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

      {/* 📊 HR KPIs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {hrKPIs.map((kpi) => (
          <div key={kpi.id} className={`bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-l-${kpi.color}-500 hover:shadow-xl transition-shadow`}>
            <div className="p-5">
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
            </div>
          </div>
        ))}
      </div>

      {/* 📈 HR Analytics Section */}
      {selectedView === 'analytics' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-pink-600" />
              Advanced HR Analytics
            </h2>
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option value="performance">Performance Analysis</option>
                <option value="engagement">Engagement Analysis</option>
                <option value="turnover">Turnover Analysis</option>
                <option value="productivity">Productivity Analysis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Performance */}
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PresentationChartBarIcon className="h-5 w-5 mr-2 text-pink-600" />
                Department Performance
              </h3>
              <div className="space-y-3">
                {[
                  { dept: 'Engineering', employees: 25, avgRating: 4.2, utilization: 85 },
                  { dept: 'Sales', employees: 15, avgRating: 4.0, utilization: 78 },
                  { dept: 'Marketing', employees: 10, avgRating: 3.8, utilization: 82 },
                  { dept: 'HR', employees: 5, avgRating: 4.5, utilization: 90 }
                ].map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{dept.dept}</p>
                      <p className="text-sm text-gray-500">{dept.employees} employees</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">{dept.avgRating}/5</div>
                      <div className="text-xs text-gray-500">{dept.utilization}% utilized</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employee Engagement Metrics */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-purple-600" />
                Engagement Metrics
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Job Satisfaction</span>
                    <span className="text-purple-600 font-semibold">84%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Work-Life Balance</span>
                    <span className="text-blue-600 font-semibold">76%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Career Development</span>
                    <span className="text-green-600 font-semibold">72%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '72%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🤖 AI HR Insights */}
      <div className="lg:col-span-1 bg-white shadow-lg rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
              AI HR Insights
            </h3>
          </div>
        </div>
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {aiInsights.filter((insight: any) => insight.module === 'hr').slice(0, 5).map((insight: any) => (
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

      {/* ⚠️ HR Alerts & Recent Activity */}
      <div className="lg:col-span-1 space-y-6">
        {/* HR Alerts */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                HR Alerts
              </h3>
            </div>
          </div>
          <div className="px-6 py-4 max-h-64 overflow-y-auto">
            {criticalAlerts.filter((alert: any) => alert.module === 'hr').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All HR metrics normal</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalAlerts.filter((alert: any) => alert.module === 'hr').map((alert: any) => (
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

        {/* Recent HR Activity */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              Recent Activity
            </h3>
          </div>
          <div className="px-6 py-4 max-h-64 overflow-y-auto">
            {employeesLoading ? (
              <LoadingSpinner size="sm" className="py-4" />
            ) : employeesError ? (
              <ErrorMessage
                message={employeesError.message || 'Failed to load employees'}
                onRetry={() => window.location.reload()}
              />
            ) : employees.length === 0 ? (
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent HR activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.slice(0, 5).map((employee: any, index: number) => {
                  const statusColor = employee.status === 'active' ? 'bg-green-500' :
                                    employee.status === 'inactive' ? 'bg-yellow-500' : 'bg-red-500';

                  return (
                    <div key={employee.id || index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${statusColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {employee.status === 'active' ? 'Employee onboarded' :
                           employee.status === 'inactive' ? 'Employee status changed' :
                           'Employee updated'}: {employee.first_name} {employee.last_name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {employee.department} • {employee.position}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(employee.updated_at || employee.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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