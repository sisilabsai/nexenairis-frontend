'use client';

import React, { useState, useMemo } from 'react';
import { 
  ChartBarIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { 
  useProject, 
  useProjectPhases, 
  useProjectTasks, 
  useProjectResources, 
  useProjectMilestones, 
  useProjectIssues,
  useTimeEntries 
} from '../hooks/useApi';

interface ProjectAnalyticsProps {
  projectId: number;
}

interface AnalyticsData {
  progress: {
    overall: number;
    phases: { name: string; progress: number; color: string }[];
  };
  timeTracking: {
    totalEstimated: number;
    totalActual: number;
    remaining: number;
    byPhase: { phase: string; estimated: number; actual: number }[];
  };
  budget: {
    total: number;
    spent: number;
    remaining: number;
    byCategory: { category: string; amount: number; color: string }[];
  };
  team: {
    totalMembers: number;
    activeMembers: number;
    workload: { member: string; utilization: number; status: string }[];
  };
  milestones: {
    total: number;
    completed: number;
    upcoming: { name: string; dueDate: string; status: string }[];
  };
  issues: {
    total: number;
    open: number;
    resolved: number;
    byPriority: { priority: string; count: number; color: string }[];
  };
}

export default function ProjectAnalytics({ projectId }: ProjectAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'time' | 'budget' | 'team' | 'milestones' | 'issues'>('overview');

  // Fetch project data from APIs
  const { data: projectData } = useProject(projectId);
  const { data: phasesData } = useProjectPhases(projectId);
  const { data: tasksData } = useProjectTasks(projectId);
  const { data: resourcesData } = useProjectResources({ project_id: projectId });
  const { data: milestonesData } = useProjectMilestones({ project_id: projectId });
  const { data: issuesData } = useProjectIssues({ project_id: projectId });
  const { data: timeEntriesData } = useTimeEntries({ project_id: projectId });

  // Compute analytics data from API responses
  // Helper function to safely extract array data from API responses
  const safeExtractArray = (data: any, fallback: any[] = []) => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return fallback;
  };

  const analyticsData: AnalyticsData = useMemo(() => {
    const project: { budget?: number } = projectData?.data || {};
    const phases = safeExtractArray(phasesData);
    const tasks = safeExtractArray(tasksData);
    const resources = safeExtractArray(resourcesData);
    const milestones = safeExtractArray(milestonesData);
    const issues = safeExtractArray(issuesData);
    const timeEntries = safeExtractArray(timeEntriesData);

    // Calculate progress
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task: any) => task.status === 'completed').length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const phaseProgress = phases.map((phase: any) => {
      const phaseTasks = tasks.filter((task: any) => task.phase_id === phase.id);
      const phaseCompletedTasks = phaseTasks.filter((task: any) => task.status === 'completed').length;
      const progress = phaseTasks.length > 0 ? Math.round((phaseCompletedTasks / phaseTasks.length) * 100) : 0;
      
      const colors = ['bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500', 'bg-gray-500'];
      const colorIndex = phases.indexOf(phase) % colors.length;
      
      return {
        name: phase.name,
        progress,
        color: colors[colorIndex]
      };
    });

    // Calculate time tracking
    const totalEstimated = tasks.reduce((sum: number, task: any) => sum + (task.estimated_hours || 0), 0);
    const totalActual = timeEntries.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0);
    const remaining = Math.max(0, totalEstimated - totalActual);

    const timeByPhase = phases.map((phase: any) => {
      const phaseTasks = tasks.filter((task: any) => task.phase_id === phase.id);
      const estimated = phaseTasks.reduce((sum: number, task: any) => sum + (task.estimated_hours || 0), 0);
      const actual = timeEntries
        .filter((entry: any) => phaseTasks.some((task: any) => task.id === entry.task_id))
        .reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0);
      
      return {
        phase: phase.name,
        estimated,
        actual
      };
    });

    // Calculate budget
    const totalBudget = project?.budget || 0;
    const spentBudget = timeEntries.reduce((sum: number, entry: any) => {
      const resource = resources.find((r: any) => r.id === entry.resource_id);
      return sum + ((entry.hours || 0) * (resource?.hourly_rate || 0));
    }, 0);
    const remainingBudget = Math.max(0, totalBudget - spentBudget);

    const budgetByCategory = [
      { category: 'Development', amount: spentBudget * 0.6, color: 'bg-blue-500' },
      { category: 'Design', amount: spentBudget * 0.2, color: 'bg-green-500' },
      { category: 'Testing', amount: spentBudget * 0.15, color: 'bg-yellow-500' },
      { category: 'Project Management', amount: spentBudget * 0.05, color: 'bg-purple-500' }
    ];

    // Calculate team metrics
    const totalMembers = resources.length;
    const activeMembers = resources.filter((r: any) => r.is_active !== false).length;
    
    const workload = resources.map((resource: any) => {
      const memberTimeEntries = timeEntries.filter((entry: any) => entry.resource_id === resource.id);
      const totalHours = memberTimeEntries.reduce((sum: number, entry: any) => sum + (entry.hours || 0), 0);
      const utilization = Math.min(100, Math.round((totalHours / 160) * 100)); // Assuming 160 hours per month
      
      let status = 'Good';
      if (utilization > 90) status = 'High';
      else if (utilization > 80) status = 'Optimal';
      else if (utilization < 50) status = 'Low';
      
      return {
        member: resource.user?.name || 'Unknown',
        utilization,
        status
      };
    });

    // Calculate milestones
    const totalMilestones = milestones.length;
    const completedMilestones = milestones.filter((m: any) => m.status === 'completed').length;
    const upcomingMilestones = milestones
      .filter((m: any) => m.status !== 'completed')
      .slice(0, 5)
      .map((m: any) => ({
        name: m.name,
        dueDate: m.due_date,
        status: m.status
      }));

    // Calculate issues
    const totalIssues = issues.length;
    const openIssues = issues.filter((i: any) => i.status === 'open').length;
    const resolvedIssues = issues.filter((i: any) => i.status === 'resolved').length;
    
    const issuesByPriority = [
      { priority: 'High', count: issues.filter((i: any) => i.priority === 'high').length, color: 'bg-red-500' },
      { priority: 'Medium', count: issues.filter((i: any) => i.priority === 'medium').length, color: 'bg-yellow-500' },
      { priority: 'Low', count: issues.filter((i: any) => i.priority === 'low').length, color: 'bg-green-500' }
    ];

    return {
      progress: {
        overall: overallProgress,
        phases: phaseProgress
      },
      timeTracking: {
        totalEstimated,
        totalActual,
        remaining,
        byPhase: timeByPhase
      },
      budget: {
        total: totalBudget,
        spent: spentBudget,
        remaining: remainingBudget,
        byCategory: budgetByCategory
      },
      team: {
        totalMembers,
        activeMembers,
        workload
      },
      milestones: {
        total: totalMilestones,
        completed: completedMilestones,
        upcoming: upcomingMilestones
      },
      issues: {
        total: totalIssues,
        open: openIssues,
        resolved: resolvedIssues,
        byPriority: issuesByPriority
      }
    };
  }, [projectData, phasesData, tasksData, resourcesData, milestonesData, issuesData, timeEntriesData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track': return 'text-green-600 bg-green-100';
      case 'At Risk': return 'text-orange-600 bg-orange-100';
      case 'Delayed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 80) return 'text-orange-600';
    if (utilization >= 60) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Analytics</h2>
          <p className="text-sm text-gray-600">Comprehensive project performance insights</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: ChartBarIcon },
            { key: 'time', label: 'Time Tracking', icon: ClockIcon },
            { key: 'budget', label: 'Budget', icon: CurrencyDollarIcon },
            { key: 'team', label: 'Team', icon: UserGroupIcon },
            { key: 'milestones', label: 'Milestones', icon: CheckCircleIcon },
            { key: 'issues', label: 'Issues', icon: ExclamationTriangleIcon }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedMetric(key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                selectedMetric === key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Dashboard */}
      {selectedMetric === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Progress Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.progress.overall}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analyticsData.progress.overall}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Time Tracking Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Time Spent</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.timeTracking.totalActual}h</p>
                <p className="text-sm text-gray-500">of {analyticsData.timeTracking.totalEstimated}h</p>
              </div>
            </div>
          </div>

          {/* Budget Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-semibold text-gray-900">${analyticsData.budget.spent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">of ${analyticsData.budget.total.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Team Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-semibold text-gray-900">{analyticsData.team.activeMembers}</p>
                <p className="text-sm text-gray-500">of {analyticsData.team.totalMembers} total</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Tracking Analytics */}
      {selectedMetric === 'time' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Time Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Total:</span>
                  <span className="font-medium">{analyticsData.timeTracking.totalEstimated}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Actual Spent:</span>
                  <span className="font-medium">{analyticsData.timeTracking.totalActual}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{analyticsData.timeTracking.remaining}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Efficiency:</span>
                  <span className="font-medium">
                    {Math.round((analyticsData.timeTracking.totalActual / analyticsData.timeTracking.totalEstimated) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Phase Breakdown</h3>
              <div className="space-y-3">
                {analyticsData.timeTracking.byPhase.map((phase, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{phase.phase}</span>
                      <span className="font-medium">{phase.actual}h / {phase.estimated}h</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((phase.actual / phase.estimated) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trends</h3>
              <div className="text-center">
                <ArrowTrendingUpIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Time tracking trends and analytics will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Analytics */}
      {selectedMetric === 'budget' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Budget:</span>
                  <span className="font-medium">${analyticsData.budget.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spent:</span>
                  <span className="font-medium">${analyticsData.budget.spent.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">${analyticsData.budget.remaining.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilization:</span>
                  <span className="font-medium">
                    {Math.round((analyticsData.budget.spent / analyticsData.budget.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
              <div className="space-y-3">
                {analyticsData.budget.byCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${category.color} mr-2`}></div>
                      <span className="text-sm text-gray-600">{category.category}</span>
                    </div>
                    <span className="font-medium">${category.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Forecast</h3>
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Budget forecasting and projections will be displayed here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Team Analytics */}
      {selectedMetric === 'team' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Team Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Members:</span>
                  <span className="font-medium">{analyticsData.team.totalMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Members:</span>
                  <span className="font-medium">{analyticsData.team.activeMembers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Utilization:</span>
                  <span className="font-medium">
                    {Math.round(analyticsData.team.workload.reduce((sum, member) => sum + member.utilization, 0) / analyticsData.team.workload.length)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Workload Distribution</h3>
              <div className="space-y-3">
                {analyticsData.team.workload.map((member, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-24 truncate">{member.member}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-sm font-medium ${getUtilizationColor(member.utilization)}`}>
                        {member.utilization}%
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones Analytics */}
      {selectedMetric === 'milestones' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Milestone Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Milestones:</span>
                  <span className="font-medium">{analyticsData.milestones.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{analyticsData.milestones.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium">{analyticsData.milestones.total - analyticsData.milestones.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completion Rate:</span>
                  <span className="font-medium">
                    {Math.round((analyticsData.milestones.completed / analyticsData.milestones.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upcoming Milestones</h3>
              <div className="space-y-3">
                {analyticsData.milestones.upcoming.map((milestone, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{milestone.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(milestone.status)}`}>
                        {milestone.status}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      {milestone.dueDate}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Issues Analytics */}
      {selectedMetric === 'issues' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Issues:</span>
                  <span className="font-medium">{analyticsData.issues.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Open:</span>
                  <span className="font-medium">{analyticsData.issues.open}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolved:</span>
                  <span className="font-medium">{analyticsData.issues.resolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolution Rate:</span>
                  <span className="font-medium">
                    {Math.round((analyticsData.issues.resolved / analyticsData.issues.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Priority</h3>
              <div className="space-y-3">
                {analyticsData.issues.byPriority.map((priority, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${priority.color} mr-2`}></div>
                      <span className="text-sm text-gray-600">{priority.priority}</span>
                    </div>
                    <span className="font-medium">{priority.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

