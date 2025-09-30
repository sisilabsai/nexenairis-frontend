'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCreateProjectResource, useUpdateProjectResource } from '../hooks/useApi';

interface ProjectResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource?: any;
  projectId: number;
  mode: 'create' | 'edit';
}

export default function ProjectResourceModal({ isOpen, onClose, resource, projectId, mode }: ProjectResourceModalProps) {
  const [formData, setFormData] = useState({
    project_id: projectId,
    user_id: '',
    role: '',
    hourly_rate: '',
    start_date: '',
    end_date: '',
    allocation_percentage: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createResourceMutation = useCreateProjectResource();
  const updateResourceMutation = useUpdateProjectResource();

  useEffect(() => {
    if (resource && mode === 'edit') {
      setFormData({
        project_id: projectId,
        user_id: resource.user_id?.toString() || '',
        role: resource.role || '',
        hourly_rate: resource.hourly_rate?.toString() || '',
        start_date: resource.start_date ? new Date(resource.start_date).toISOString().split('T')[0] : '',
        end_date: resource.end_date ? new Date(resource.end_date).toISOString().split('T')[0] : '',
        allocation_percentage: resource.allocation_percentage?.toString() || '',
        notes: resource.notes || '',
      });
    } else {
      setFormData({
        project_id: projectId,
        user_id: '',
        role: '',
        hourly_rate: '',
        start_date: '',
        end_date: '',
        allocation_percentage: '',
        notes: '',
      });
    }
    setErrors({});
  }, [resource, mode, projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.user_id) {
      newErrors.user_id = 'User is required';
    }

    if (!formData.role.trim()) {
      newErrors.role = 'Role is required';
    }

    if (formData.hourly_rate && parseFloat(formData.hourly_rate) < 0) {
      newErrors.hourly_rate = 'Hourly rate cannot be negative';
    }

    if (formData.allocation_percentage) {
      const allocation = parseFloat(formData.allocation_percentage);
      if (allocation < 0 || allocation > 100) {
        newErrors.allocation_percentage = 'Allocation must be between 0 and 100';
      }
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
      const submitData = {
        ...formData,
        hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
        allocation_percentage: formData.allocation_percentage ? parseFloat(formData.allocation_percentage) : null,
      };

      if (mode === 'create') {
        await createResourceMutation.mutateAsync(submitData);
      } else {
        await updateResourceMutation.mutateAsync({
          id: resource.id,
          data: submitData,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving project resource:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = createResourceMutation.isPending || updateResourceMutation.isPending;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Add Project Resource' : 'Edit Project Resource'}
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
            {/* User Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User *
              </label>
              <select
                value={formData.user_id}
                onChange={(e) => handleInputChange('user_id', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.user_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select a user</option>
                {/* This would be populated with actual users from the system */}
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
                <option value="3">Bob Johnson</option>
              </select>
              {errors.user_id && (
                <p className="mt-1 text-sm text-red-600">{errors.user_id}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.role ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Developer, Designer, Project Manager"
                required
              />
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.hourly_rate}
                onChange={(e) => handleInputChange('hourly_rate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.hourly_rate ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.hourly_rate && (
                <p className="mt-1 text-sm text-red-600">{errors.hourly_rate}</p>
              )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>

            {/* Allocation Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation Percentage
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={formData.allocation_percentage}
                onChange={(e) => handleInputChange('allocation_percentage', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
                  errors.allocation_percentage ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="100"
              />
              {errors.allocation_percentage && (
                <p className="mt-1 text-sm text-red-600">{errors.allocation_percentage}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Percentage of time allocated to this project (0-100)</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes about this resource..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Add Resource' : 'Update Resource'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

