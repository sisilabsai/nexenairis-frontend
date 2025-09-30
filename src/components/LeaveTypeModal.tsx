import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import { 
  useCreateLeaveType, 
  useUpdateLeaveType 
} from '../hooks/useApi';

interface LeaveTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveType?: any;
  onSuccess?: () => void;
}

export default function LeaveTypeModal({ 
  isOpen, 
  onClose, 
  leaveType, 
  onSuccess 
}: LeaveTypeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    days_per_year: 21,
    carry_forward: false,
    requires_approval: true,
    description: '',
    is_active: true
  });

  const [errors, setErrors] = useState<any>({});

  // API hooks
  const createMutation = useCreateLeaveType();
  const updateMutation = useUpdateLeaveType();

  useEffect(() => {
    if (leaveType) {
      setFormData({
        name: leaveType.name || '',
        code: leaveType.code || '',
        days_per_year: leaveType.days_per_year || 21,
        carry_forward: leaveType.carry_forward || false,
        requires_approval: leaveType.requires_approval !== false,
        description: leaveType.description || '',
        is_active: leaveType.is_active !== false
      });
    } else {
      setFormData({
        name: '',
        code: '',
        days_per_year: 21,
        carry_forward: false,
        requires_approval: true,
        description: '',
        is_active: true
      });
    }
    setErrors({});
  }, [leaveType, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
               type === 'number' ? parseInt(value) || 0 : 
               value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const generateCode = () => {
    if (formData.name) {
      const code = formData.name
        .toUpperCase()
        .replace(/[^A-Z\s]/g, '')
        .split(' ')
        .map(word => word.substring(0, 3))
        .join('')
        .substring(0, 10);
      
      setFormData(prev => ({
        ...prev,
        code
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (formData.code.length > 10) newErrors.code = 'Code must be 10 characters or less';
    if (formData.days_per_year < 0) newErrors.days_per_year = 'Days per year must be 0 or greater';
    if (formData.days_per_year > 365) newErrors.days_per_year = 'Days per year cannot exceed 365';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (leaveType) {
        await updateMutation.mutateAsync({
          id: leaveType.id,
          data: formData
        });
      } else {
        await createMutation.mutateAsync(formData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving leave type:', error);
      
      // Handle validation errors from backend
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert('Failed to save leave type. Please try again.');
      }
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {leaveType ? 'Edit Leave Type' : 'New Leave Type'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Annual Leave, Sick Leave"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g., ANNUAL, SICK"
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                }`}
                maxLength={10}
              />
              <button
                type="button"
                onClick={generateCode}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-50"
                title="Generate code from name"
              >
                Auto
              </button>
            </div>
            {errors.code && (
              <p className="mt-1 text-sm text-red-600">{errors.code}</p>
            )}
          </div>

          {/* Days per Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <ClockIcon className="h-4 w-4 inline mr-1" />
              Days per Year
            </label>
            <input
              type="number"
              name="days_per_year"
              value={formData.days_per_year}
              onChange={handleInputChange}
              min="0"
              max="365"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.days_per_year ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.days_per_year && (
              <p className="mt-1 text-sm text-red-600">{errors.days_per_year}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of this leave type..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="carry_forward"
                id="carry_forward"
                checked={formData.carry_forward}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="carry_forward" className="ml-2 block text-sm text-gray-900">
                Allow carry forward to next year
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="requires_approval"
                id="requires_approval"
                checked={formData.requires_approval}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="requires_approval" className="ml-2 block text-sm text-gray-900">
                Requires manager approval
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active (available for new requests)
              </label>
            </div>
          </div>

          {/* African Business Context Examples */}
          {!leaveType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-800 mb-2">African Business Context Examples:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p>• <strong>Maternity:</strong> 60-84 days (Uganda: 60, Kenya: 84)</p>
                <p>• <strong>Paternity:</strong> 4-14 days</p>
                <p>• <strong>Compassionate:</strong> 3-7 days for bereavement</p>
                <p>• <strong>Study Leave:</strong> 10-30 days for education</p>
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner />
                  <span className="ml-2">
                    {leaveType ? 'Updating...' : 'Creating...'}
                  </span>
                </div>
              ) : (
                leaveType ? 'Update Leave Type' : 'Create Leave Type'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



