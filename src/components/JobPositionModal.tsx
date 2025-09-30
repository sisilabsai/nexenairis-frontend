'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateJobPosition, useUpdateJobPosition, useDepartments, useTenantJobPositions } from '../hooks/useApi';

interface JobPosition {
  id?: number;
  title: string;
  code: string;
  description?: string;
  department_id?: number;
  min_salary?: number;
  max_salary?: number;
  requirements?: string;
  is_active?: boolean;
  department?: { name: string };
}

interface JobPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  jobPosition?: JobPosition | null;
}

export default function JobPositionModal({
  isOpen,
  onClose,
  onSuccess,
  jobPosition = null
}: JobPositionModalProps) {
  const [formData, setFormData] = useState<JobPosition & { reused_job_position_id?: number | null }>({
    title: '',
    code: '',
    description: '',
    department_id: undefined,
    min_salary: undefined,
    max_salary: undefined,
    requirements: '',
    is_active: true,
    reused_job_position_id: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createJobPositionMutation = useCreateJobPosition();
  const updateJobPositionMutation = useUpdateJobPosition();
  const { data: departmentsData } = useDepartments();
  const { data: tenantJobPositionsData } = useTenantJobPositions();

  // Helper function to safely extract array data from API responses
  const safeExtractArray = (data: any, fallback: any[] = []): any[] => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    
    // Handle paginated API response (data.data.data for Laravel paginated results)
    if (data?.data?.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    // Handle direct API response (data.data)
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return fallback;
  };

  const isLoading = createJobPositionMutation.isPending || updateJobPositionMutation.isPending;

  // Auto-generate job position code
  const generateJobCode = (title: string): string => {
    if (!title.trim()) return '';
    const code = title
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 4);
    return code.padEnd(Math.max(3, code.length), 'X').slice(0, 10);
  };

  useEffect(() => {
    if (jobPosition) {
      setFormData({
        title: jobPosition.title || '',
        code: jobPosition.code || '',
        description: jobPosition.description || '',
        department_id: jobPosition.department_id || undefined,
        min_salary: jobPosition.min_salary || undefined,
        max_salary: jobPosition.max_salary || undefined,
        requirements: jobPosition.requirements || '',
        is_active: jobPosition.is_active !== undefined ? jobPosition.is_active : true,
      });
    } else {
      setFormData({
        title: '',
        code: '',
        description: '',
        department_id: undefined,
        min_salary: undefined,
        max_salary: undefined,
        requirements: '',
        is_active: true,
        reused_job_position_id: null,
      });
    }
    setErrors({});
  }, [jobPosition, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Job code is required';
    }

    if (!formData.department_id) {
      newErrors.department_id = 'Department is required';
    }

    if (formData.min_salary && formData.max_salary && formData.min_salary > formData.max_salary) {
      newErrors.max_salary = 'Maximum salary must be greater than minimum salary';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    console.log(`🔍 Input change - ${name}:`, value, 'type:', type);
    
      if (name === 'title') {
        // Auto-generate code when title changes
        const newCode = generateJobCode(value);
        console.log(`🔍 Generated code for "${value}":`, newCode);
        setFormData(prev => ({ ...prev, [name]: value, code: newCode }));
      } else if (name === 'reused_job_position_id') {
        const reusedId = Number(value);
        if (reusedId) {
          const reusedJob = safeExtractArray(tenantJobPositionsData).find((p: JobPosition) => p.id === reusedId);
          if (reusedJob) {
            setFormData(prev => ({
              ...prev,
              title: reusedJob.title,
              code: reusedJob.code,
              description: reusedJob.description,
              department_id: reusedJob.department_id,
              min_salary: reusedJob.min_salary,
              max_salary: reusedJob.max_salary,
              requirements: reusedJob.requirements,
              reused_job_position_id: reusedId,
            }));
          }
        } else {
          setFormData(prev => ({
            ...prev,
            title: '',
            code: '',
            description: '',
            department_id: undefined,
            min_salary: undefined,
            max_salary: undefined,
            requirements: '',
            reused_job_position_id: null,
          }));
        }
      } else if (type === 'number') {
      // Handle number inputs properly - convert empty string to undefined, otherwise to number
      const numValue = value === '' ? undefined : Number(value);
      console.log(`🔍 Number input ${name}:`, value, '→', numValue);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'department_id') {
      // Handle department selection - convert empty string to undefined, otherwise to number
      const deptValue = value === '' ? undefined : Number(value);
      console.log(`🔍 Department selection ${name}:`, value, '→', deptValue);
      setFormData(prev => ({ ...prev, [name]: deptValue }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      const checkedValue = target.checked;
      console.log(`🔍 Checkbox ${name}:`, checkedValue);
      setFormData(prev => ({ ...prev, [name]: checkedValue }));
    } else {
      console.log(`🔍 Text input ${name}:`, value);
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔍 Form submission - Current formData:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setIsSubmitting(true);
    
    try {
      let submitData: any;

      if (formData.reused_job_position_id) {
        submitData = {
          reused_job_position_id: formData.reused_job_position_id,
        };
      } else {
        submitData = {
          ...formData,
          min_salary: formData.min_salary || undefined,
          max_salary: formData.max_salary || undefined,
          department_id: formData.department_id || undefined,
          is_active: formData.is_active ?? true
        };
      }

      console.log('📤 Submitting job position data:', submitData);

      if (jobPosition && jobPosition.id) {
        // Update existing job position
        console.log('🔄 Updating job position with data:', submitData);
        await updateJobPositionMutation.mutateAsync({
          id: jobPosition.id,
          data: submitData
        });
        console.log('✅ Job position updated successfully!');
      } else {
        // Create new job position
        console.log('➕ Creating job position with data:', submitData);
        await createJobPositionMutation.mutateAsync(submitData);
        console.log('✅ Job position created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving job position:', error);
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(`Error saving job position: ${error?.message || 'Please try again.'}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {jobPosition ? 'Edit Job Position' : 'Create New Job Position'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Reuse Job Position */}
          {!jobPosition && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reuse Existing Job Position
              </label>
              <select
                name="reused_job_position_id"
                value={formData.reused_job_position_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Create New Job Position</option>
                {safeExtractArray(tenantJobPositionsData).map((pos: JobPosition) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.title} ({pos.department?.name})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Senior Software Developer"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={!!formData.reused_job_position_id}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Auto-generated from title"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={!!formData.reused_job_position_id}
              />
              {errors.code && <p className="text-red-500 text-xs mt-1">{errors.code}</p>}
              <p className="text-xs text-gray-500 mt-1">Auto-generated from job title</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe the role, responsibilities, and expectations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!!formData.reused_job_position_id}
            />
          </div>

          {/* Department Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department *
            </label>
            <select
              name="department_id"
              value={formData.department_id || ''}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.department_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
              disabled={!!formData.reused_job_position_id}
            >
              <option value="">Select a department</option>
              {safeExtractArray(departmentsData).map((department: any) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.department_id && <p className="text-red-500 text-xs mt-1">{errors.department_id}</p>}
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Salary (UGX)
              </label>
              <input
                type="number"
                name="min_salary"
                value={formData.min_salary || ''}
                onChange={handleInputChange}
                placeholder="3000000"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                disabled={!!formData.reused_job_position_id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Salary (UGX)
              </label>
              <input
                type="number"
                name="max_salary"
                value={formData.max_salary || ''}
                onChange={handleInputChange}
                placeholder="8000000"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.max_salary ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!!formData.reused_job_position_id}
              />
              {errors.max_salary && <p className="text-red-500 text-xs mt-1">{errors.max_salary}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements & Qualifications
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={4}
              placeholder="List required skills, experience, education, certifications..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={!!formData.reused_job_position_id}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active Position</label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {jobPosition ? 'Update Position' : 'Create Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
