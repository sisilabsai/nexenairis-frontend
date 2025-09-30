'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserPlusIcon, 
  UserMinusIcon, 
  PencilIcon, 
  TrashIcon,
  UserIcon,
  ClockIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useProjectResources, useCreateProjectResource, useUpdateProjectResource, useDeleteProjectResource } from '../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';

interface ProjectTeamProps {
  projectId: number;
}

interface TeamMember {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  role: string;
  hourly_rate: number;
  start_date: string;
  end_date?: string;
  allocation_percentage: number;
  notes?: string;
  total_hours: number;
  total_cost: number;
}

export default function ProjectTeam({ projectId }: ProjectTeamProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [view, setView] = useState<'members' | 'assignments' | 'workload'>('members');

  const queryClient = useQueryClient();
  const { data: resourcesData, isLoading } = useProjectResources({ project_id: projectId });
  const createResource = useCreateProjectResource();
  const updateResource = useUpdateProjectResource();
  const deleteResource = useDeleteProjectResource();
  
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

  const resources = safeExtractArray(resourcesData, []);

  const handleAddMember = (data: any) => {
    createResource.mutate({
      ...data,
      project_id: projectId
    }, {
      onSuccess: () => {
        setShowAddMember(false);
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.resources() });
      }
    });
  };

  const handleUpdateMember = (data: any) => {
    if (editingMember) {
      updateResource.mutate({
        id: editingMember.id,
        ...data
      }, {
        onSuccess: () => {
          setEditingMember(null);
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.resources() });
        }
      });
    }
  };

  const handleDeleteMember = (id: number) => {
    if (confirm('Are you sure you want to remove this team member?')) {
      deleteResource.mutate(id, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.projects.resources() });
        }
      });
    }
  };

  const calculateWorkload = (member: TeamMember) => {
    const totalDays = member.end_date 
      ? Math.ceil((new Date(member.end_date).getTime() - new Date(member.start_date).getTime()) / (1000 * 60 * 60 * 24))
      : Math.ceil((new Date().getTime() - new Date(member.start_date).getTime()) / (1000 * 60 * 60 * 24));
    
    const allocatedHours = (totalDays * 8 * member.allocation_percentage) / 100;
    const actualHours = member.total_hours;
    
    return {
      allocated: allocatedHours,
      actual: actualHours,
      utilization: actualHours > 0 ? (actualHours / allocatedHours) * 100 : 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Team</h2>
          <p className="text-sm text-gray-600">Manage team members and resource allocation</p>
        </div>
        <button
          onClick={() => setShowAddMember(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Add Team Member
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setView('members')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              view === 'members'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Team Members
          </button>
          <button
            onClick={() => setView('assignments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              view === 'assignments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Task Assignments
          </button>
          <button
            onClick={() => setView('workload')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              view === 'workload'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Workload Analysis
          </button>
        </nav>
      </div>

      {/* Team Members View */}
      {view === 'members' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {resources.map((member: TeamMember) => (
              <li key={member.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {member.user.avatar ? (
                        <img className="h-10 w-10 rounded-full" src={member.user.avatar} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{member.user.name}</div>
                      <div className="text-sm text-gray-500">{member.user.email}</div>
                      <div className="text-xs text-gray-400">{member.role}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-900">
                        ${member.hourly_rate}/hr
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.allocation_percentage}% allocation
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingMember(member)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteMember(member.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {resources.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding team members to your project.</p>
            </div>
          )}
        </div>
      )}

      {/* Task Assignments View */}
      {view === 'assignments' && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Task Assignments</h3>
            <p className="text-sm text-gray-600">View and manage task assignments for team members</p>
          </div>
          <div className="px-6 py-4">
            <p className="text-gray-500 text-sm">Task assignment management will be implemented here.</p>
          </div>
        </div>
      )}

      {/* Workload Analysis View */}
      {view === 'workload' && (
        <div className="space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Workload Analysis</h3>
              <p className="text-sm text-gray-600">Monitor team member workload and utilization</p>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {resources.map((member: TeamMember) => {
                  const workload = calculateWorkload(member);
                  return (
                    <div key={member.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          {member.user.avatar ? (
                            <img className="h-8 w-8 rounded-full mr-3" src={member.user.avatar} alt="" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                              <UserIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{member.user.name}</div>
                            <div className="text-sm text-gray-500">{member.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Utilization</div>
                          <div className={`text-lg font-semibold ${
                            workload.utilization > 100 ? 'text-red-600' : 
                            workload.utilization > 80 ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {workload.utilization.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-gray-500">Allocated Hours</div>
                          <div className="font-medium text-gray-900">{workload.allocated.toFixed(1)}h</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">Actual Hours</div>
                          <div className="font-medium text-gray-900">{workload.actual.toFixed(1)}h</div>
                        </div>
                        <div className="text-center">
                          <div className="text-gray-500">Total Cost</div>
                          <div className="font-medium text-gray-900">${member.total_cost.toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{workload.actual.toFixed(1)}h / {workload.allocated.toFixed(1)}h</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              workload.utilization > 100 ? 'bg-red-500' : 
                              workload.utilization > 80 ? 'bg-green-500' : 'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(workload.utilization, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team Member</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleAddMember({
                  user_id: parseInt(formData.get('user_id') as string),
                  role: formData.get('role') as string,
                  hourly_rate: parseFloat(formData.get('hourly_rate') as string),
                  start_date: formData.get('start_date') as string,
                  end_date: formData.get('end_date') as string || null,
                  allocation_percentage: parseInt(formData.get('allocation_percentage') as string),
                  notes: formData.get('notes') as string
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <select name="user_id" required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                      <option value="">Select user</option>
                      {/* User options would be populated from API */}
                      <option value="1">John Doe</option>
                      <option value="2">Jane Smith</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      name="role"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Developer, Designer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                    <input
                      type="number"
                      name="hourly_rate"
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        required
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allocation (%)</label>
                    <input
                      type="number"
                      name="allocation_percentage"
                      required
                      min="1"
                      max="100"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Add Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Team Member</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleUpdateMember({
                  user_id: parseInt(formData.get('user_id') as string),
                  role: formData.get('role') as string,
                  hourly_rate: parseFloat(formData.get('hourly_rate') as string),
                  start_date: formData.get('start_date') as string,
                  end_date: formData.get('end_date') as string || null,
                  allocation_percentage: parseInt(formData.get('allocation_percentage') as string),
                  notes: formData.get('notes') as string
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User</label>
                    <select name="user_id" required defaultValue={editingMember.user.id} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                      <option value={editingMember.user.id}>{editingMember.user.name}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <input
                      type="text"
                      name="role"
                      required
                      defaultValue={editingMember.role}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hourly Rate ($)</label>
                    <input
                      type="number"
                      name="hourly_rate"
                      required
                      min="0"
                      step="0.01"
                      defaultValue={editingMember.hourly_rate}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        name="start_date"
                        required
                        defaultValue={editingMember.start_date}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        name="end_date"
                        defaultValue={editingMember.end_date || ''}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allocation (%)</label>
                    <input
                      type="number"
                      name="allocation_percentage"
                      required
                      min="1"
                      max="100"
                      defaultValue={editingMember.allocation_percentage}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <textarea
                      name="notes"
                      rows={3}
                      defaultValue={editingMember.notes || ''}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

