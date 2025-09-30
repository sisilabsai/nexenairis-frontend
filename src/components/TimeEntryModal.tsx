'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useCreateTimeEntry, useUpdateTimeEntry, useProjectTasks } from '../hooks/useApi';

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeEntry?: any;
  projectId: number;
  mode: 'create' | 'edit';
}

export default function TimeEntryModal({ isOpen, onClose, timeEntry, projectId, mode }: TimeEntryModalProps) {
  const [formData, setFormData] = useState({
    project_id: projectId,
    task_id: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    description: '',
    billable: false,
    rate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createTimeEntryMutation = useCreateTimeEntry();
  const updateTimeEntryMutation = useUpdateTimeEntry();
  const { data: tasksData } = useProjectTasks(projectId);
  
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

  useEffect(() => {
    if (timeEntry && mode === 'edit') {
      setFormData({
        project_id: projectId,
        task_id: timeEntry.task_id || '',
        date: timeEntry.date ? new Date(timeEntry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        hours: timeEntry.hours?.toString() || '',
        description: timeEntry.description || '',
        billable: timeEntry.billable || false,
        rate: timeEntry.rate?.toString() || '',
        notes: timeEntry.notes || '',
      });
    } else {
      setFormData({
        project_id: projectId,
        task_id: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        description: '',
        billable: false,
        rate: '',
        notes: '',
      });
    }
    setErrors({});
  }, [timeEntry, mode, projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.hours || parseFloat(formData.hours) <= 0) {
      newErrors.hours = 'Hours must be greater than 0';
    }

    if (parseFloat(formData.hours) > 24) {
      newErrors.hours = 'Hours cannot exceed 24';
    }

    if (formData.rate && parseFloat(formData.rate) < 0) {
      newErrors.rate = 'Rate cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (mode === 'create') {
        await createTimeEntryMutation.mutateAsync({
          ...formData,
          hours: parseFloat(formData.hours),
          rate: formData.rate ? parseFloat(formData.rate) : null,
        });
      } else {
        await updateTimeEntryMutation.mutateAsync({
          id: timeEntry.id,
          data: {
            ...formData,
            hours: parseFloat(formData.hours),
            rate: formData.rate ? parseFloat(formData.rate) : null,
          },
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = createTimeEntryMutation.isPending || updateTimeEntryMutation.isPending;
  const tasks = safeExtractArray(tasksData?.data, []);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Add Time Entry' : 'Edit Time Entry'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task (Optional)
              </label>
              <select
                value={formData.task_id}
                onChange={(e) => handleInputChange('task_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Task</option>
                {tasks.map((task: any) => (
                  <option key={task.id} value={task.id}>
                    {task.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hours *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="24"
                value={formData.hours}
                onChange={(e) => handleInputChange('hours', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.hours ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.0"
                required
              />
              {errors.hours && (
                <p className="mt-1 text-sm text-red-600">{errors.hours}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="What did you work on?"
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Billable and Rate */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="billable"
                  checked={formData.billable}
                  onChange={(e) => handleInputChange('billable', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="billable" className="ml-2 text-sm text-gray-700">
                  Billable
                </label>
              </div>
              
              {formData.billable && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate (per hour)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate}
                    onChange={(e) => handleInputChange('rate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.rate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.rate && (
                    <p className="mt-1 text-sm text-red-600">{errors.rate}</p>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Add Time Entry' : 'Update Time Entry'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

