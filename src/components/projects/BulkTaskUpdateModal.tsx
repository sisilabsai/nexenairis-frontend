'use client';

import { useState } from 'react';
import { XMarkIcon, CogIcon } from '@heroicons/react/24/outline';
import { useBulkUpdateTasks } from '../../hooks/useApi';

interface BulkTaskUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTaskIds: number[];
  projectId: number;
}

export default function BulkTaskUpdateModal({ isOpen, onClose, selectedTaskIds, projectId }: BulkTaskUpdateModalProps) {
  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    assignee_id: '',
    due_date: '',
    phase_id: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const bulkUpdateMutation = useBulkUpdateTasks();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if at least one field is filled
    const hasChanges = Object.values(formData).some(value => value !== '');
    if (!hasChanges) {
      setErrors({ general: 'Please select at least one field to update' });
      return;
    }

    try {
      const updateData: any = {};
      
      // Only include fields that have values
      if (formData.status) updateData.status = formData.status;
      if (formData.priority) updateData.priority = formData.priority;
      if (formData.assignee_id) updateData.assignee_id = parseInt(formData.assignee_id);
      if (formData.due_date) updateData.due_date = formData.due_date;
      if (formData.phase_id) updateData.phase_id = parseInt(formData.phase_id);

      await bulkUpdateMutation.mutateAsync({
        taskIds: selectedTaskIds,
        data: updateData,
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = bulkUpdateMutation.isPending;

  const taskStatuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'in_progress', label: 'In Progress', color: 'text-blue-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'on_hold', label: 'On Hold', color: 'text-orange-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600' },
  ];

  const taskPriorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CogIcon className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Bulk Update Tasks
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              Updating <strong>{selectedTaskIds.length}</strong> selected task{selectedTaskIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No change</option>
                {taskStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No change</option>
                {taskPriorities.map((priority) => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={formData.assignee_id}
                onChange={(e) => handleInputChange('assignee_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No change</option>
                <option value="0">Unassigned</option>
                {/* This would be populated with actual users from the system */}
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
                <option value="3">Bob Johnson</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty to keep current due dates</p>
            </div>

            {/* Phase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phase
              </label>
              <select
                value={formData.phase_id}
                onChange={(e) => handleInputChange('phase_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">No change</option>
                {/* This would be populated with actual phases from the project */}
                <option value="1">Planning</option>
                <option value="2">Development</option>
                <option value="3">Testing</option>
                <option value="4">Deployment</option>
              </select>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update Tasks'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

