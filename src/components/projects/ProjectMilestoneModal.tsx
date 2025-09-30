'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, FlagIcon } from '@heroicons/react/24/outline';
import { useCreateProjectMilestone, useUpdateProjectMilestone } from '../../hooks/useApi';

interface ProjectMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone?: any;
  projectId: number;
  mode: 'create' | 'edit';
}

export default function ProjectMilestoneModal({ isOpen, onClose, milestone, projectId, mode }: ProjectMilestoneModalProps) {
  const [formData, setFormData] = useState({
    project_id: projectId,
    title: '',
    description: '',
    due_date: '',
    status: 'pending',
    completion_percentage: '0',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMilestoneMutation = useCreateProjectMilestone();
  const updateMilestoneMutation = useUpdateProjectMilestone();

  useEffect(() => {
    if (milestone && mode === 'edit') {
      setFormData({
        project_id: projectId,
        title: milestone.title || '',
        description: milestone.description || '',
        due_date: milestone.due_date ? new Date(milestone.due_date).toISOString().split('T')[0] : '',
        status: milestone.status || 'pending',
        completion_percentage: milestone.completion_percentage?.toString() || '0',
        notes: milestone.notes || '',
      });
    } else {
      setFormData({
        project_id: projectId,
        title: '',
        description: '',
        due_date: '',
        status: 'pending',
        completion_percentage: '0',
        notes: '',
      });
    }
    setErrors({});
  }, [milestone, mode, projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.due_date && new Date(formData.due_date) < new Date()) {
      newErrors.due_date = 'Due date cannot be in the past';
    }

    if (formData.completion_percentage) {
      const completion = parseFloat(formData.completion_percentage);
      if (completion < 0 || completion > 100) {
        newErrors.completion_percentage = 'Completion must be between 0 and 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = {
        project_id: formData.project_id,
        title: formData.title,
        name: formData.title,
        description: formData.description,
        due_date: formData.due_date || undefined,
        target_date: formData.due_date || undefined,
        status: formData.status,
      } as any;

      if (mode === 'create') {
        await createMilestoneMutation.mutateAsync(submitData);
      } else {
        await updateMilestoneMutation.mutateAsync({
          id: milestone.id,
          data: submitData,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving project milestone:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = createMilestoneMutation.isPending || updateMilestoneMutation.isPending;

  const milestoneStatuses = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-600' },
    { value: 'in_progress', label: 'In Progress', color: 'text-blue-600' },
    { value: 'completed', label: 'Completed', color: 'text-green-600' },
    { value: 'delayed', label: 'Delayed', color: 'text-red-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-gray-600' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FlagIcon className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Add Project Milestone' : 'Edit Project Milestone'}
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
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Milestone title"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the milestone..."
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.due_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.due_date && (
                <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {milestoneStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Completion Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Completion Percentage
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.completion_percentage}
                  onChange={(e) => handleInputChange('completion_percentage', e.target.value)}
                  className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.completion_percentage ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                <span className="text-gray-500">%</span>
              </div>
              {errors.completion_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.completion_percentage}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Percentage of milestone completion (0-100)</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Additional notes about this milestone..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Add Milestone' : 'Update Milestone'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

