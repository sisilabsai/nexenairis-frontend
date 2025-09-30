'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
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
  useProjectsStats,
  useProjects,
  useCriticalAlerts,
  useAIInsights,
  useProjectAdvancedAnalytics
} from '../../hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface ProjectKPI {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
  description: string;
}

export default function ProjectDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'timeline' | 'resources' | 'risks' | 'analytics'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // API Hooks
  const { data: projectStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useProjectsStats();
  const { data: projectsData, isLoading: projectsLoading, error: projectsError } = useProjects({ per_page: 10 });
  const { data: criticalAlertsData, refetch: refetchCriticalAlerts } = useCriticalAlerts();
  const { data: aiInsightsData, refetch: refetchAIInsights } = useAIInsights();
  const { data: advancedAnalyticsData } = useProjectAdvancedAnalytics();

  // Extract data from API responses
  const criticalAlerts = (criticalAlertsData as any)?.data || [];
  const aiInsights = (aiInsightsData as any)?.data || [];
  const projects = (projectsData as any)?.data?.data || [];
  const stats = (projectStats as any)?.data || {};

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
    const totalProjects = projects.length;
    const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
    const onTimeDelivery = projects.filter((p: any) => p.status === 'completed' && new Date(p.end_date) >= new Date(p.planned_end_date || p.end_date)).length;
    const onTimeRate = completedProjects > 0 ? (onTimeDelivery / completedProjects) * 100 : 0;

    const activeProjects = projects.filter((p: any) => p.status === 'in_progress').length;
    const overdueProjects = projects.filter((p: any) => {
      if (p.status === 'completed') return false;
      const endDate = new Date(p.end_date || p.planned_end_date);
      return endDate < new Date();
    }).length;

    return {
      totalProjects,
      completedProjects,
      activeProjects,
      overdueProjects,
      onTimeRate,
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
      avgProjectDuration: advancedAnalyticsData?.data?.avgProjectDuration || 0,
      resourceUtilization: advancedAnalyticsData?.data?.resourceUtilization || 0,
    };
  }, [projects, advancedAnalyticsData]);

  // Toast notification helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast({ show: false, type: 'info', title: '', message: '' }), 5000);
  };

  // Create dynamic project KPIs from API data
  const projectKPIs: ProjectKPI[] = [
    {
      id: 'total-projects',
      title: 'Total Projects',
      value: advancedAnalytics.totalProjects,
      change: '+2',
      changeType: 'positive',
      icon: FolderIcon,
      color: 'blue',
      description: 'Total active projects'
    },
    {
      id: 'completion-rate',
      title: 'Completion Rate',
      value: `${advancedAnalytics.completionRate.toFixed(1)}%`,
      change: '+5.2%',
      changeType: 'positive',
      icon: CheckCircleIcon,
      color: 'green',
      description: 'Projects completed on time'
    },
    {
      id: 'active-projects',
      title: 'Active Projects',
      value: advancedAnalytics.activeProjects,
      change: '+1',
      changeType: 'neutral',
      icon: ClockIcon,
      color: 'yellow',
      description: 'Currently in progress'
    },
    {
      id: 'on-time-delivery',
      title: 'On-Time Delivery',
      value: `${advancedAnalytics.onTimeRate.toFixed(1)}%`,
      change: '+3.1%',
      changeType: 'positive',
      icon: ArrowTrendingUpIcon,
      color: 'emerald',
      description: 'Projects delivered on schedule'
    }
  ];

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchStats();
      refetchCriticalAlerts();
      refetchAIInsights();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="space-y-6">
      {/* 🚀 Advanced Header with Controls */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <FolderIcon className="h-8 w-8 mr-3" />
              Advanced Project Dashboard
            </h1>
            <p className="text-orange-100 mt-1">AI-Powered Project Management & Delivery Tracking</p>
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
              <option value="timeline">Timeline</option>
              <option value="resources">Resources</option>
              <option value="risks">Risk Assessment</option>
              <option value="analytics">Analytics</option>
            </select>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.totalProjects}</div>
            <div className="text-sm text-orange-100">Total Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.activeProjects}</div>
            <div className="text-sm text-orange-100">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.completedProjects}</div>
            <div className="text-sm text-orange-100">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.onTimeRate.toFixed(1)}%</div>
            <div className="text-sm text-orange-100">On-Time Rate</div>
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
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>

            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
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
              onClick={() => showToast('success', 'Report Generated', 'Project report has been downloaded successfully')}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 Critical Project Alerts */}
      {criticalAlerts.filter((alert: any) => alert.module === 'projects').length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-red-800">
                  {criticalAlerts.filter((alert: any) => alert.module === 'projects').length} Critical Project Issues
                </h3>
                <button className="text-red-600 hover:text-red-800 font-medium text-xs">
                  View All →
                </button>
              </div>
              <div className="mt-2 text-sm text-red-700">
                {criticalAlerts.filter((alert: any) => alert.module === 'projects').slice(0, 2).map((alert: any) => (
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

      {/* 📊 Project KPIs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {projectKPIs.map((kpi) => (
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

      {/* 📈 Project Analytics Section */}
      {selectedView === 'analytics' && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-orange-600" />
              Advanced Project Analytics
            </h2>
            <div className="flex items-center space-x-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2">
                <option value="performance">Performance Analysis</option>
                <option value="timeline">Timeline Analysis</option>
                <option value="resources">Resource Analysis</option>
                <option value="budget">Budget Analysis</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Status Distribution */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PresentationChartBarIcon className="h-5 w-5 mr-2 text-orange-600" />
                Project Status Distribution
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="font-medium text-gray-900">Planning</span>
                  <span className="text-blue-600 font-semibold">
                    {projects.filter((p: any) => p.status === 'planning').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="font-medium text-gray-900">In Progress</span>
                  <span className="text-yellow-600 font-semibold">
                    {projects.filter((p: any) => p.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="font-medium text-gray-900">Completed</span>
                  <span className="text-green-600 font-semibold">
                    {projects.filter((p: any) => p.status === 'completed').length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                  <span className="font-medium text-gray-900">On Hold</span>
                  <span className="text-red-600 font-semibold">
                    {projects.filter((p: any) => p.status === 'on_hold').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Resource Utilization */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600" />
                Resource Utilization
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Team Utilization</span>
                    <span className="text-blue-600 font-semibold">{advancedAnalytics.resourceUtilization}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${advancedAnalytics.resourceUtilization}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">Avg Project Duration</span>
                    <span className="text-green-600 font-semibold">{advancedAnalytics.avgProjectDuration} days</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: '75%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🤖 AI Project Insights */}
      <div className="lg:col-span-1 bg-white shadow-lg rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
              AI Project Insights
            </h3>
          </div>
        </div>
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {aiInsights.filter((insight: any) => insight.module === 'projects').slice(0, 5).map((insight: any) => (
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

      {/* ⚠️ Project Alerts & Recent Activity */}
      <div className="lg:col-span-1 space-y-6">
        {/* Project Alerts */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                Project Alerts
              </h3>
            </div>
          </div>
          <div className="px-6 py-4 max-h-64 overflow-y-auto">
            {criticalAlerts.filter((alert: any) => alert.module === 'projects').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">All projects on track</p>
              </div>
            ) : (
              <div className="space-y-3">
                {criticalAlerts.filter((alert: any) => alert.module === 'projects').map((alert: any) => (
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

        {/* Recent Project Activity */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
              Recent Activity
            </h3>
          </div>
          <div className="px-6 py-4 max-h-64 overflow-y-auto">
            {projectsLoading ? (
              <LoadingSpinner size="sm" className="py-4" />
            ) : projectsError ? (
              <ErrorMessage
                message={projectsError.message || 'Failed to load projects'}
                onRetry={() => window.location.reload()}
              />
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <FolderIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No recent project activity</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project: any, index: number) => {
                  const statusColor = project.status === 'completed' ? 'bg-green-500' :
                                    project.status === 'in_progress' ? 'bg-blue-500' :
                                    project.status === 'planning' ? 'bg-yellow-500' : 'bg-red-500';

                  return (
                    <div key={project.id || index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${statusColor}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {project.status === 'completed' ? 'Project completed' :
                           project.status === 'in_progress' ? 'Project in progress' :
                           'Project updated'}: {project.name}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {project.status} • Due: {new Date(project.end_date || project.planned_end_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(project.updated_at || project.created_at).toLocaleDateString()}
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
