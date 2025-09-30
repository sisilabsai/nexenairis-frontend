'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { useProjectDashboard, useProjectTimeline, useProjectFinancials } from '../../hooks/useApi';

interface ProjectDashboardProps {
  projectId: number;
}

export default function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'financials'>('overview');
  
  const { data: dashboardDataRaw, isLoading: dashboardLoading } = useProjectDashboard(projectId);
  const { data: timelineDataRaw, isLoading: timelineLoading } = useProjectTimeline(projectId);
  const { data: financialsDataRaw, isLoading: financialsLoading } = useProjectFinancials(projectId);

  // Helper function to safely extract data from API responses
  const safeExtractData = (data: any, fallback: any = {}) => {
    if (!data) return fallback;
    if (data.data) return data.data;
    return data;
  };

  const dashboardData = safeExtractData(dashboardDataRaw);
  const timelineData = safeExtractData(timelineDataRaw);
  const financialsData = safeExtractData(financialsDataRaw);

  const isLoading = dashboardLoading || timelineLoading || financialsLoading;

  const renderProgressBar = (percentage: number, color: string = 'bg-blue-600') => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    const safe = Number.isFinite(amount) ? amount : 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(safe);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Project Dashboard</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('financials')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === 'financials'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Financials
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardData && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.progress_percentage || 0}%
                  </p>
                </div>
              </div>
              <div className="mt-4">
                {renderProgressBar(dashboardData.progress_percentage || 0)}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Time Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.total_hours || 0}h
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  of {dashboardData.estimated_hours || 0}h estimated
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Budget Used</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboardData.total_expenses || 0)}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  of {formatCurrency(dashboardData.budget || 0)} budget
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserGroupIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Team Size</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData.team_size || 0}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">active members</p>
              </div>
            </div>
          </div>

          {/* Progress Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Task Status</h3>
              <div className="space-y-3">
                {dashboardData.task_status_breakdown?.map((status: any) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize">
                      {status.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {status.count}
                      </span>
                      <div className="w-20">
                        {renderProgressBar(
                          (status.count / dashboardData.total_tasks) * 100,
                          status.status === 'completed' ? 'bg-green-600' : 
                          status.status === 'in_progress' ? 'bg-blue-600' : 'bg-gray-600'
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {dashboardData.recent_activities?.slice(0, 5).map((activity: any, index: number) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Milestones */}
          {dashboardData.milestones && dashboardData.milestones.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Milestones</h3>
              <div className="space-y-3">
                {dashboardData.milestones.slice(0, 3).map((milestone: any) => (
                  <div key={milestone.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{milestone.title}</p>
                      <p className="text-sm text-gray-500">
                        Due: {formatDate(milestone.due_date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {milestone.completion_percentage}%
                      </p>
                      <div className="w-20 mt-1">
                        {renderProgressBar(milestone.completion_percentage, 'bg-purple-600')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && timelineData && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Timeline</h3>
          <div className="space-y-4">
            {timelineData.timeline?.map((item: any, index: number) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
                  {index < timelineData.timeline.length - 1 && (
                    <div className="w-0.5 h-8 bg-gray-300 mx-auto"></div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(item.date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financials Tab */}
      {activeTab === 'financials' && financialsData && (
        <div className="space-y-6">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Revenue</h3>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(financialsData.total_revenue || 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Total Expenses</h3>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(financialsData.total_expenses || 0)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Profit Margin</h3>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency((financialsData.total_revenue || 0) - (financialsData.total_expenses || 0))}
              </p>
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Breakdown</h3>
            <div className="space-y-3">
              {financialsData.expense_breakdown?.map((expense: any) => (
                <div key={expense.category} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{expense.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
                    <div className="w-32">
                      {renderProgressBar(
                        (expense.amount / (financialsData.total_expenses || 1)) * 100,
                        'bg-red-600'
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Time Tracking Summary */}
          {financialsData.time_tracking_summary && (
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Time Tracking Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Billable Hours</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {financialsData.time_tracking_summary.billable_hours || 0}h
                  </p>
                  <p className="text-sm text-gray-500">
                    Revenue: {formatCurrency(financialsData.time_tracking_summary.billable_revenue || 0)}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Non-billable Hours</h4>
                  <p className="text-2xl font-bold text-gray-600">
                    {financialsData.time_tracking_summary.non_billable_hours || 0}h
                  </p>
                  <p className="text-sm text-gray-500">
                    Internal work
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

