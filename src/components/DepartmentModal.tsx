'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateDepartment, useUpdateDepartment, useTenantDepartments } from '../hooks/useApi';


interface Department {
  id?: number;
  name: string;
  code: string;
  description?: string;
  manager_id?: number;
  budget?: number;
  is_active?: boolean;
}

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  department?: Department | null;
}

export default function DepartmentModal({
  isOpen,
  onClose,
  onSuccess,
  department = null
}: DepartmentModalProps) {
  const [formData, setFormData] = useState<Department & { reused_department_id?: number | null }>({
    name: '',
    code: '',
    description: '',
    manager_id: undefined,
    budget: undefined,
    is_active: true,
    reused_department_id: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const { data: tenantDepartmentsData } = useTenantDepartments();
 

  // Auto-generate department code from name
  const generateDepartmentCode = (name: string): string => {
    if (!name.trim()) return '';
    
    // Take first letter of each word, max 4 characters
    const code = name
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 4);
    
    // Pad with 'X' if less than 3 characters
    return code.padEnd(Math.max(3, code.length), 'X').slice(0, 10);
  };

  // Reset form when modal opens/closes or department changes
  useEffect(() => {
    if (isOpen) {
      if (department) {
        setFormData({
          name: department.name || '',
          code: department.code || '',
          description: department.description || '',
          manager_id: department.manager_id || undefined,
          budget: department.budget || undefined,
          is_active: department.is_active !== undefined ? department.is_active : true,
        });
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          manager_id: undefined,
          budget: undefined,
          is_active: true,
          reused_department_id: null,
        });
      }
      setErrors({});
      setIsSubmitting(false);
    }
  }, [department, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Department name is required';
    } else if (formData.name.length > 255) {
      newErrors.name = 'Department name must be 255 characters or less';
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Department code is required';
    } else if (formData.code.length > 10) {
      newErrors.code = 'Department code must be 10 characters or less';
    }

    if (formData.budget !== undefined && formData.budget < 0) {
      newErrors.budget = 'Budget must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      console.log('🚀 Submitting department data:', formData);
      
      let submitData: Partial<Department> & { reused_department_id?: number | null };

      if (formData.reused_department_id) {
        submitData = {
          reused_department_id: formData.reused_department_id,
        };
      } else {
        submitData = {
          name: formData.name.trim(),
          code: formData.code.trim(),
          description: formData.description?.trim() || '',
          budget: formData.budget && formData.budget > 0 ? Number(formData.budget) : undefined,
          is_active: Boolean(formData.is_active)
        };

        // Remove undefined values
        Object.keys(submitData).forEach(key => {
          if (submitData[key as keyof typeof submitData] === undefined) {
            delete submitData[key as keyof typeof submitData];
          }
        });
      }

      console.log('🧹 Clean data for API:', submitData);

      if (department && department.id) {
        // Update existing department
        await updateDepartmentMutation.mutateAsync({
          id: department.id,
          data: submitData
        });
        console.log('✅ Department updated successfully!');
      } else {
        // Create new department
        await createDepartmentMutation.mutateAsync(submitData);
        console.log('✅ Department created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('❌ Error saving department:', error);
      
      setIsSubmitting(false);
      
      // Handle validation errors from backend
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error?.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: 'Failed to save department. Please try again.' });
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = { ...prev } as typeof formData;

      if (type === 'checkbox') {
        (newData as any)[name] = (e.target as HTMLInputElement).checked;
      } else if (name === 'budget') {
        newData.budget = value ? Number(value) : undefined;
      } else {
        (newData as any)[name] = value;
      }

      // Auto-generate code when name changes (only for new departments)
      if (name === 'name' && !department) {
        newData.code = generateDepartmentCode(value);
      }

      if (name === 'reused_department_id') {
        const reusedId = Number(value);
        if (reusedId) {
          const departments = Array.isArray(tenantDepartmentsData?.data) ? tenantDepartmentsData.data : [];
          const reusedDept = departments.find((d: Department) => d.id === reusedId);
          if (reusedDept) {
            return {
              ...prev,
              name: reusedDept.name,
              code: reusedDept.code,
              description: reusedDept.description,
              budget: reusedDept.budget,
              reused_department_id: reusedId,
            };
          }
        } else {
          // Reset form if "Create New" is selected
          return {
            ...prev,
            name: '',
            code: '',
            description: '',
            budget: undefined,
            reused_department_id: null,
          };
        }
      }

      return newData;
    });

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {department ? 'Edit Department' : 'Add New Department'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reuse Department */}
          {!department && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reuse Existing Department
              </label>
              <select
                name="reused_department_id"
                value={formData.reused_department_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Create New Department</option>
                {Array.isArray(tenantDepartmentsData?.data) && tenantDepartmentsData.data.map((dept: Department) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {/* Department Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Information Technology"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.name 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
              maxLength={255}
              disabled={isSubmitting || !!formData.reused_department_id}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Department Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department Code *
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="e.g., IT"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.code 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              required
              maxLength={10}
              disabled={isSubmitting || !!formData.reused_department_id}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            <p className="text-xs text-gray-500 mt-1">
              Short unique code for the department (auto-generated from name)
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Brief description of the department"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              disabled={isSubmitting || !!formData.reused_department_id}
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (UGX)
            </label>
            <input
              type="number"
              name="budget"
              value={formData.budget || ''}
              onChange={handleInputChange}
              placeholder="e.g., 5000000"
              min="0"
              step="1000"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.budget 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              disabled={isSubmitting || !!formData.reused_department_id}
            />
            {errors.budget && <p className="text-red-500 text-sm mt-1">{errors.budget}</p>}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active || false}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={isSubmitting}
            />
            <label className="ml-2 text-sm text-gray-700">
              Department is active
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : department ? 'Update Department' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
