'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCreateProjectIssue, useUpdateProjectIssue } from '../../hooks/useApi';

interface ProjectIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue?: any;
  projectId: number;
  mode: 'create' | 'edit';
}

export default function ProjectIssueModal({ isOpen, onClose, issue, projectId, mode }: ProjectIssueModalProps) {
  const [formData, setFormData] = useState({
    project_id: projectId,
    title: '',
    description: '',
    priority: 'medium',
    status: 'open',
    assignee_id: '',
    due_date: '',
    resolution_notes: '',
    tags: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createIssueMutation = useCreateProjectIssue();
  const updateIssueMutation = useUpdateProjectIssue();

  useEffect(() => {
    if (issue && mode === 'edit') {
      setFormData({
        project_id: projectId,
        title: issue.title || '',
        description: issue.description || '',
        priority: issue.priority || 'medium',
        status: issue.status || 'open',
        assignee_id: issue.assignee_id?.toString() || '',
        due_date: issue.due_date ? new Date(issue.due_date).toISOString().split('T')[0] : '',
        resolution_notes: issue.resolution_notes || '',
        tags: issue.tags || '',
      });
    } else {
      setFormData({
        project_id: projectId,
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assignee_id: '',
        due_date: '',
        resolution_notes: '',
        tags: '',
      });
    }
    setErrors({});
  }, [issue, mode, projectId]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
      };

      if (mode === 'create') {
        await createIssueMutation.mutateAsync(submitData);
      } else {
        await updateIssueMutation.mutateAsync({
          id: issue.id,
          data: submitData,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving project issue:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = createIssueMutation.isPending || updateIssueMutation.isPending;

  const priorities = [
    { value: 'low', label: 'Low', color: 'text-green-600' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'critical', label: 'Critical', color: 'text-red-600' },
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'text-blue-600' },
    { value: 'in_progress', label: 'In Progress', color: 'text-yellow-600' },
    { value: 'resolved', label: 'Resolved', color: 'text-green-600' },
    { value: 'closed', label: 'Closed', color: 'text-gray-600' },
    { value: 'on_hold', label: 'On Hold', color: 'text-purple-600' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Add Project Issue' : 'Edit Project Issue'}
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Issue title"
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the issue..."
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Priority and Status */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {priorities.map((priority) => (
                    <option key={priority.value} value={priority.value}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {statuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assignee
              </label>
              <select
                value={formData.assignee_id}
                onChange={(e) => handleInputChange('assignee_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Unassigned</option>
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  errors.due_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.due_date && (
                <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="bug, feature, documentation (comma separated)"
              />
              <p className="mt-1 text-xs text-gray-500">Separate tags with commas</p>
            </div>

            {/* Resolution Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resolution Notes
              </label>
              <textarea
                value={formData.resolution_notes}
                onChange={(e) => handleInputChange('resolution_notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Notes about how the issue was resolved..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Add Issue' : 'Update Issue'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

