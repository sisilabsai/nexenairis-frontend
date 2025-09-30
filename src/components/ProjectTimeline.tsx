'use client';

import React, { useState, useMemo } from 'react';
import { format, isAfter, isBefore, startOfDay, differenceInCalendarDays, addDays } from 'date-fns';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  useProjectMilestones, 
  useCreateProjectMilestone, 
  useUpdateProjectMilestone, 
  useDeleteProjectMilestone,
  useProjectTimeline,
} from '../hooks/useApi';
import ProjectMilestoneModal from './projects/ProjectMilestoneModal';

interface ProjectTimelineProps {
  projectId: number;
}

interface Milestone {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completion_percentage: number;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneMode, setMilestoneMode] = useState<'create' | 'edit'>('create');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [zoom, setZoom] = useState<'day' | 'week' | 'month'>('week');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [phaseFilter, setPhaseFilter] = useState<number | 'all'>('all');

  // API hooks
  const { data: milestonesData, isLoading: milestonesLoading, error: milestonesError } = useProjectMilestones({ project_id: projectId });
  const createMilestone = useCreateProjectMilestone();
  const updateMilestone = useUpdateProjectMilestone();
  const deleteMilestone = useDeleteProjectMilestone();

  // Timeline (CPM + dependencies)
  const { data: timelineResp, isLoading: timelineLoading, error: timelineError } = useProjectTimeline(projectId);
  const timelineData: any = timelineResp?.data || {};
  const rawTimeline: any[] = timelineData?.timeline || [];
  const dependencies: any[] = timelineData?.dependencies || [];
  const cpm: any = timelineData?.cpm || {};
  const taskItems = useMemo(() => rawTimeline.filter((i: any) => i.type === 'task'), [rawTimeline]);

  const cpmTaskMap = useMemo(() => {
    const m = new Map<number, any>();
    (cpm?.tasks || []).forEach((t: any) => m.set(t.id, t));
    return m;
  }, [cpm]);

  const rangeStart: Date | null = timelineData?.date_range?.start ? new Date(timelineData.date_range.start) : null;
  const rangeEnd: Date | null = timelineData?.date_range?.end ? new Date(timelineData.date_range.end) : null;
  const allStartDates = taskItems.map((t: any) => t.start_date ? new Date(t.start_date) : null).filter(Boolean) as Date[];
  const allDueDates = taskItems.map((t: any) => t.due_date ? new Date(t.due_date) : null).filter(Boolean) as Date[];

  const baseStart: Date = rangeStart || (allStartDates.length ? new Date(Math.min(...allStartDates.map(d => d.getTime()))) : new Date());
  const baseEnd: Date = rangeEnd || (allDueDates.length ? new Date(Math.max(...allDueDates.map(d => d.getTime()))) : new Date(baseStart.getTime() + ((cpm?.project_duration_days || 1) * 24 * 60 * 60 * 1000)));
  const totalDays = Math.max(1, differenceInCalendarDays(baseEnd, baseStart) + 1);

  const getPixelsPerDay = (z: 'day' | 'week' | 'month') => {
    switch (z) {
      case 'day':
        return 24;
      case 'week':
        return 12;
      case 'month':
      default:
        return 4;
    }
  };
  const pxPerDay = getPixelsPerDay(zoom);
  const rowHeight = 24; // px
  const rowGap = 12; // px
  const contentWidth = Math.max(700, totalDays * pxPerDay);

  const scheduleRows = useMemo(() => {
    const filtered = taskItems.filter((task: any) => {
      const statusOk = statusFilter === 'all' ? true : (String(task.status) === statusFilter);
      const phaseOk = phaseFilter === 'all' ? true : (Number(task.phase_id) === phaseFilter);
      return statusOk && phaseOk;
    });
    return filtered.map((task: any) => {
      const ct = cpmTaskMap.get(task.id);
      const start: Date = task.start_date ? new Date(task.start_date) : new Date(baseStart.getTime() + ((ct?.es || 0) * 24 * 60 * 60 * 1000));
      const end: Date = task.due_date ? new Date(task.due_date) : new Date(start.getTime() + (((ct?.duration || 1) - 1) * 24 * 60 * 60 * 1000));
      const dayOffset = Math.max(0, differenceInCalendarDays(start, baseStart));
      const durationDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
      const leftPx = dayOffset * pxPerDay;
      const widthPx = Math.max(pxPerDay, durationDays * pxPerDay);
      const xStart = leftPx;
      const xEnd = leftPx + widthPx;
      const predecessors = (cpm?.tasks || []).find((t: any) => t.id === task.id)?.predecessors || [];
      return { task, cpm: ct, leftPx, widthPx, xStart, xEnd, predecessors };
    });
  }, [taskItems, cpmTaskMap, baseStart, pxPerDay, statusFilter, phaseFilter, cpm]);

  const idToRowIndex = useMemo(() => {
    const map = new Map<number, number>();
    scheduleRows.forEach((r: any, idx: number) => map.set(r.task.id, idx));
    return map;
  }, [scheduleRows]);

  // Handle API errors gracefully
  if (milestonesError) {
    console.warn('Project milestones API not available:', milestonesError);
  }

  const milestones: Milestone[] = milestonesData?.data?.data || [];

  // Group milestones by status
  const groupedMilestones = useMemo(() => {
    const today = startOfDay(new Date());
    
    return {
      overdue: milestones.filter(m => 
        m.status === 'overdue' || 
        (m.status !== 'completed' && isBefore(new Date(m.due_date), today))
      ),
      inProgress: milestones.filter(m => m.status === 'in_progress'),
      upcoming: milestones.filter(m => 
        m.status === 'pending' && 
        isAfter(new Date(m.due_date), today)
      ),
      completed: milestones.filter(m => m.status === 'completed')
    };
  }, [milestones]);

  const handleCreateMilestone = () => {
    setMilestoneMode('create');
    setSelectedMilestone(null);
    setIsMilestoneModalOpen(true);
  };

  const handleEditMilestone = (milestone: Milestone) => {
    setMilestoneMode('edit');
    setSelectedMilestone(milestone);
    setIsMilestoneModalOpen(true);
  };

  const handleDeleteMilestone = (milestoneId: number) => {
    if (confirm('Are you sure you want to delete this milestone?')) {
      deleteMilestone.mutate(milestoneId, {
        onError: (error) => {
          console.error('Failed to delete milestone:', error);
          alert('Failed to delete milestone. The API endpoint may not be implemented yet.');
        }
      });
    }
  };

  const handleSaveMilestone = (milestoneData: Partial<Milestone>) => {
    if (milestoneMode === 'create') {
      createMilestone.mutate({
        ...milestoneData,
        project_id: projectId
      }, {
        onError: (error) => {
          console.error('Failed to create milestone:', error);
          alert('Failed to create milestone. The API endpoint may not be implemented yet.');
        }
      });
    } else if (selectedMilestone) {
      updateMilestone.mutate({
        id: selectedMilestone.id,
        data: milestoneData
      }, {
        onError: (error) => {
          console.error('Failed to update milestone:', error);
          alert('Failed to update milestone. The API endpoint may not be implemented yet.');
        }
      });
    }
    setIsMilestoneModalOpen(false);
  };

  const handleCloseMilestoneModal = () => {
    setIsMilestoneModalOpen(false);
    setSelectedMilestone(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };



  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (milestonesLoading || timelineLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Project Timeline</h3>
          <button
            onClick={handleCreateMilestone}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Milestone
          </button>
        </div>
      </div>

      {(milestonesError || timelineError) && (
        <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-700">
              Timeline or milestones API is not available. Some features may be limited.
            </p>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Zoom controls */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs text-gray-600">Zoom:</span>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              className={`px-3 py-1 text-xs border ${zoom === 'month' ? 'bg-gray-200' : 'bg-white'} rounded-l-md`}
              onClick={() => setZoom('month')}
            >Month</button>
            <button
              className={`px-3 py-1 text-xs border -ml-px ${zoom === 'week' ? 'bg-gray-200' : 'bg-white'}`}
              onClick={() => setZoom('week')}
            >Week</button>
            <button
              className={`px-3 py-1 text-xs border -ml-px ${zoom === 'day' ? 'bg-gray-200' : 'bg-white'} rounded-r-md`}
              onClick={() => setZoom('day')}
            >Day</button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Status</label>
            <select
              className="text-xs border rounded px-2 py-1"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600">Phase</label>
            <select
              className="text-xs border rounded px-2 py-1"
              value={String(phaseFilter)}
              onChange={(e) => setPhaseFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All</option>
              {[...new Set(rawTimeline.filter((i: any) => i.type === 'task').map((t: any) => t.phase_id))]
                .filter((v) => v !== undefined && v !== null)
                .map((pid: any) => (
                  <option key={pid} value={pid}>{pid}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Schedule (CPM) */}
        <div className="mb-10">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Schedule</h4>
          {scheduleRows.length === 0 ? (
            <div className="text-xs text-gray-500">No tasks to display on the timeline.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="relative border rounded-md p-4" style={{ minWidth: 700 }}>
                {/* Rows and bars */}
                <div className="relative" style={{ width: contentWidth }}>
                  {/* Vertical gridlines for weeks/months */}
                  <svg className="absolute top-0 left-0" width={contentWidth} height={scheduleRows.length * (24 + 12) + 24}>
                    {Array.from({ length: totalDays + 1 }).map((_, dayIdx) => {
                      const x = dayIdx * (contentWidth / totalDays);
                      const isMajor = (zoom === 'week' && dayIdx % 7 === 0) || (zoom === 'month' && dayIdx % 30 === 0);
                      return (
                        <line
                          key={dayIdx}
                          x1={x}
                          y1={0}
                          x2={x}
                          y2={scheduleRows.length * (24 + 12) + 24}
                          stroke={isMajor ? '#e2e8f0' : '#f1f5f9'}
                          strokeWidth={isMajor ? 1.25 : 0.5}
                        />
                      );
                    })}
                  </svg>
                  {scheduleRows.map((row: any) => (
                    <div key={row.task.id} className="flex items-center group" style={{ marginBottom: 12 }}>
                    <div className="w-56 text-xs text-gray-700 pr-2 truncate" title={row.task.title}>{row.task.title}</div>
                      <div className="relative flex-1 bg-gray-100 rounded" style={{ height: 24 }}>
                        <div
                          className={`absolute top-0 h-6 rounded ${row.cpm?.is_critical ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ left: row.leftPx, width: row.widthPx }}
                          title={`${row.task.title} • ${row.cpm?.duration || 0}d • slack ${row.cpm?.slack ?? 0}d`}
                        />
                        {/* Tooltip with predecessors */}
                        <div className="absolute -top-7 left-0 opacity-0 group-hover:opacity-100 transition pointer-events-none">
                          <div className="bg-gray-800 text-white text-[10px] rounded px-2 py-1 whitespace-nowrap shadow">
                            <div className="font-medium">{row.task.title}</div>
                            {row.predecessors && row.predecessors.length > 0 ? (
                              <div>
                                <span className="text-gray-300">Predecessors:</span>{' '}
                                {row.predecessors.map((p: any, i: number) => `${p.id}${p.type ? `(${String(p.type).replaceAll('_','-')})` : ''}${i < row.predecessors.length - 1 ? ', ' : ''}`)}
                              </div>
                            ) : (
                              <div className="text-gray-300">No predecessors</div>
                            )}
                          </div>
                        </div>
                      </div>
                    <div className="w-32 text-right text-xs text-gray-600 pl-2">
                      {row.cpm?.es ?? 0}–{row.cpm?.ef ?? 0}d
                    </div>
                  </div>
                  ))}

                  {/* Dependency arrows overlay */}
                  <svg
                    className="absolute top-4 left-[224px]"
                    width={contentWidth - 224}
                    height={scheduleRows.length * (24 + 12)}
                  >
                    {dependencies.map((d: any, idx: number) => {
                      const fromIdx = idToRowIndex.get(d.from);
                      const toIdx = idToRowIndex.get(d.to);
                      if (fromIdx === undefined || toIdx === undefined) return null;
                      const from = scheduleRows[fromIdx];
                      const to = scheduleRows[toIdx];
                      const type = String(d.type || 'finish_to_start');
                      const lagDays = Number(d.lag || 0);
                      const daysTotal = Math.max(1, (differenceInCalendarDays(baseEnd, baseStart) + 1));
                      const lagPx = lagDays * (contentWidth / daysTotal);
                      let x1 = from.xEnd; let x2 = to.xStart; // FS default
                      if (type === 'start_to_start') { x1 = from.xStart; x2 = to.xStart; }
                      if (type === 'finish_to_finish') { x1 = from.xEnd; x2 = to.xEnd; }
                      if (type === 'start_to_finish') { x1 = from.xStart; x2 = to.xEnd; }
                      x2 += lagPx;
                      const y1 = fromIdx * (24 + 12) + 12;
                      const y2 = toIdx * (24 + 12) + 12;
                      const midX = x1 + Math.max(16, (x2 - x1) / 2);
                      const color = (from.cpm?.is_critical && to.cpm?.is_critical) ? '#ef4444' : '#64748b';
                      const path = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
                      const arrowSize = 4;
                      const angle = Math.atan2(y2 - y1, x2 - x1);
                      const ax = x2 - arrowSize * Math.cos(angle - Math.PI / 6);
                      const ay = y2 - arrowSize * Math.sin(angle - Math.PI / 6);
                      const bx = x2 - arrowSize * Math.cos(angle + Math.PI / 6);
                      const by = y2 - arrowSize * Math.sin(angle + Math.PI / 6);
                      return (
                        <g key={idx}>
                          <path d={path} fill="none" stroke={color} strokeWidth={1.5} />
                          <polyline points={`${ax},${ay} ${x2},${y2} ${bx},${by}`} fill="none" stroke={color} strokeWidth={1.5} />
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="mt-2 text-xs text-gray-500 flex justify-between">
                  <span>{format(baseStart, 'MMM dd, yyyy')}</span>
                  <span>{format(baseEnd, 'MMM dd, yyyy')} · {(cpm?.project_duration_days) || totalDays} days</span>
                </div>
              </div>
            </div>
          )}
          {dependencies?.length > 0 && (
            <div className="mt-4">
              <h5 className="text-xs font-medium text-gray-600 mb-1">Dependencies</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dependencies.map((d: any, idx: number) => (
                  <div key={idx} className="text-xs text-gray-700 bg-gray-50 border rounded px-2 py-1">
                    {d.from} → {d.to} ({String(d.type || 'finish_to_start').replaceAll('_', ' ')}, lag {d.lag || 0})
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {milestones.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No milestones yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first project milestone.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateMilestone}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Milestone
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue Milestones */}
            {groupedMilestones.overdue.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-3 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                  Overdue ({groupedMilestones.overdue.length})
                </h4>
                <div className="space-y-3">
                  {groupedMilestones.overdue.map((milestone) => (
                    <div key={milestone.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="text-sm font-medium text-gray-900">{milestone.title}</h5>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                            <span>Progress: {milestone.completion_percentage}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMilestone(milestone)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* In Progress Milestones */}
            {groupedMilestones.inProgress.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-600 mb-3 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  In Progress ({groupedMilestones.inProgress.length})
                </h4>
                <div className="space-y-3">
                  {groupedMilestones.inProgress.map((milestone) => (
                    <div key={milestone.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="text-sm font-medium text-gray-900">{milestone.title}</h5>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                            <span>Progress: {milestone.completion_percentage}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMilestone(milestone)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming Milestones */}
            {groupedMilestones.upcoming.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-blue-600 mb-3 flex items-center">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Upcoming ({groupedMilestones.upcoming.length})
                </h4>
                <div className="space-y-3">
                  {groupedMilestones.upcoming.map((milestone) => (
                    <div key={milestone.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="text-sm font-medium text-gray-900">{milestone.title}</h5>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                            <span>Progress: {milestone.completion_percentage}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMilestone(milestone)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Milestones */}
            {groupedMilestones.completed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-3 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Completed ({groupedMilestones.completed.length})
                </h4>
                <div className="space-y-3">
                  {groupedMilestones.completed.map((milestone) => (
                    <div key={milestone.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="text-sm font-medium text-gray-900">{milestone.title}</h5>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                              {milestone.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Due: {format(new Date(milestone.due_date), 'MMM dd, yyyy')}</span>
                            <span>Progress: {milestone.completion_percentage}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMilestone(milestone)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.id)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Milestone Modal */}
      <ProjectMilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={handleCloseMilestoneModal}
        milestone={selectedMilestone}
        projectId={projectId}
        mode={milestoneMode}
      />
    </div>
  );
};

export default ProjectTimeline;

