'use client';

import { useState } from 'react';
import { XMarkIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useCloneProject } from '../../hooks/useApi';

interface ProjectCloneModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
}

export default function ProjectCloneModal({ isOpen, onClose, project }: ProjectCloneModalProps) {
  const [formData, setFormData] = useState({
    name: `${project?.name || 'Project'} (Copy)`,
    description: project?.description || '',
    start_date: '',
    end_date: '',
    clone_tasks: true,
    clone_resources: true,
    clone_milestones: true,
    clone_expenses: false,
    clone_issues: false,
    clone_time_entries: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const cloneProjectMutation = useCloneProject();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const cloneOptions = {
        clone_tasks: formData.clone_tasks,
        clone_resources: formData.clone_resources,
        clone_milestones: formData.clone_milestones,
        clone_expenses: formData.clone_expenses,
        clone_issues: formData.clone_issues,
        clone_time_entries: formData.clone_time_entries,
      };

      await cloneProjectMutation.mutateAsync({
        id: project.id,
        data: {
          name: formData.name,
          description: formData.description,
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          options: cloneOptions,
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Error cloning project:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = cloneProjectMutation.isPending;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DocumentDuplicateIcon className="h-6 w-6 text-teal-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Clone Project
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-md">
            <p className="text-sm text-teal-800">
              Cloning: <strong>{project?.name}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter new project name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Project description..."
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>

            {/* Clone Options */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Clone Options</h4>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clone_tasks"
                    checked={formData.clone_tasks}
                    onChange={(e) => handleInputChange('clone_tasks', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="clone_tasks" className="ml-2 text-sm text-gray-700">
                    Tasks and Subtasks
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clone_resources"
                    checked={formData.clone_resources}
                    onChange={(e) => handleInputChange('clone_resources', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="clone_resources" className="ml-2 text-sm text-gray-700">
                    Project Resources
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clone_milestones"
                    checked={formData.clone_milestones}
                    onChange={(e) => handleInputChange('clone_milestones', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="clone_milestones" className="ml-2 text-sm text-gray-700">
                    Milestones
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clone_expenses"
                    checked={formData.clone_expenses}
                    onChange={(e) => handleInputChange('clone_expenses', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="clone_expenses" className="ml-2 text-sm text-gray-700">
                    Expense Categories
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clone_issues"
                    checked={formData.clone_issues}
                    onChange={(e) => handleInputChange('clone_issues', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="clone_issues" className="ml-2 text-sm text-gray-700">
                    Issue Templates
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="clone_time_entries"
                    checked={formData.clone_time_entries}
                    onChange={(e) => handleInputChange('clone_time_entries', e.target.checked)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="clone_time_entries" className="ml-2 text-sm text-gray-700">
                    Time Entry Templates
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Cloning...' : 'Clone Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

