'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EmployeePreference {
  id?: number;
  employee_id: number;
  preference_category: 'work_schedule' | 'communication' | 'benefits' | 'training' | 'work_environment' | 'career_development';
  preference_name: string;
  preference_value: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  is_approved: boolean;
  approval_date?: string;
  approved_by?: string;
  implementation_date?: string;
  status: 'pending' | 'approved' | 'implemented' | 'rejected' | 'on_hold';
  cost_implication?: number;
  notes?: string;
}

interface EmployeePreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  preference?: EmployeePreference | null;
  employeeId?: number;
}

export default function EmployeePreferenceModal({
  isOpen,
  onClose,
  onSuccess,
  preference = null,
  employeeId
}: EmployeePreferenceModalProps) {
  const [formData, setFormData] = useState<EmployeePreference>({
    employee_id: employeeId || 0,
    preference_category: 'work_schedule',
    preference_name: '',
    preference_value: '',
    priority: 'medium',
    is_approved: false,
    approval_date: '',
    approved_by: '',
    implementation_date: '',
    status: 'pending',
    cost_implication: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (preference) {
      setFormData({
        employee_id: preference.employee_id,
        preference_category: preference.preference_category,
        preference_name: preference.preference_name,
        preference_value: preference.preference_value,
        priority: preference.priority,
        is_approved: preference.is_approved,
        approval_date: preference.approval_date || '',
        approved_by: preference.approved_by || '',
        implementation_date: preference.implementation_date || '',
        status: preference.status,
        cost_implication: preference.cost_implication || 0,
        notes: preference.notes || ''
      });
    } else {
      setFormData({
        employee_id: employeeId || 0,
        preference_category: 'work_schedule',
        preference_name: '',
        preference_value: '',
        priority: 'medium',
        is_approved: false,
        approval_date: '',
        approved_by: '',
        implementation_date: '',
        status: 'pending',
        cost_implication: 0,
        notes: ''
      });
    }
    setErrors({});
  }, [preference, employeeId, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }

    if (!formData.preference_name.trim()) {
      newErrors.preference_name = 'Preference name is required';
    }

    if (!formData.preference_value.trim()) {
      newErrors.preference_value = 'Preference value is required';
    }

    if (formData.cost_implication && formData.cost_implication < 0) {
      newErrors.cost_implication = 'Cost implication cannot be negative';
    }

    if (formData.is_approved && !formData.approved_by?.trim()) {
      newErrors.approved_by = 'Approver name is required when approved';
    }

    if (formData.status === 'implemented' && !formData.implementation_date) {
      newErrors.implementation_date = 'Implementation date is required when status is implemented';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual API call
      console.log('Submitting employee preference:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving employee preference:', error);
      alert(`Error saving employee preference: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'approved': return 'text-blue-600';
      case 'implemented': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'on_hold': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {preference ? 'Edit Employee Preference' : 'Add Employee Preference'}
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
          {/* Preference Category and Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preference Category *
              </label>
              <select
                name="preference_category"
                value={formData.preference_category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="work_schedule">Work Schedule</option>
                <option value="communication">Communication</option>
                <option value="benefits">Benefits</option>
                <option value="training">Training</option>
                <option value="work_environment">Work Environment</option>
                <option value="career_development">Career Development</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preference Name *
              </label>
              <input
                type="text"
                name="preference_name"
                value={formData.preference_name}
                onChange={handleInputChange}
                placeholder="e.g., Flexible Working Hours, Remote Work Option, Training Budget"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.preference_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.preference_name && <p className="text-red-500 text-xs mt-1">{errors.preference_name}</p>}
            </div>
          </div>

          {/* Preference Value and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preference Value *
              </label>
              <textarea
                name="preference_value"
                value={formData.preference_value}
                onChange={handleInputChange}
                rows={3}
                placeholder="Describe the specific preference, request, or requirement..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.preference_value ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.preference_value && <p className="text-red-500 text-xs mt-1">{errors.preference_value}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority Level *
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          {/* Status and Approval */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="implemented">Implemented</option>
                <option value="rejected">Rejected</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Implication (UGX)
              </label>
              <input
                type="number"
                name="cost_implication"
                value={formData.cost_implication}
                onChange={handleInputChange}
                step="1000"
                min="0"
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.cost_implication ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.cost_implication && <p className="text-red-500 text-xs mt-1">{errors.cost_implication}</p>}
              <p className="text-xs text-gray-500 mt-1">Estimated cost to implement this preference</p>
            </div>
          </div>

          {/* Approval Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approved By
              </label>
              <input
                type="text"
                name="approved_by"
                value={formData.approved_by}
                onChange={handleInputChange}
                placeholder="Manager or HR representative name"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.approved_by ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.approved_by && <p className="text-red-500 text-xs mt-1">{errors.approved_by}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Approval Date
              </label>
              <input
                type="date"
                name="approval_date"
                value={formData.approval_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Implementation Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Implementation Date
            </label>
            <input
              type="date"
              name="implementation_date"
              value={formData.implementation_date}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.implementation_date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.implementation_date && <p className="text-red-500 text-xs mt-1">{errors.implementation_date}</p>}
            <p className="text-xs text-gray-500 mt-1">When this preference will be implemented</p>
          </div>

          {/* Approval Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_approved"
              checked={formData.is_approved}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Approved</label>
            <p className="ml-2 text-xs text-gray-500">(Mark as approved when preference is granted)</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional context, implementation details, or special considerations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Preference Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preference Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Category: </span>
                <span className="font-medium text-gray-900">
                  {formData.preference_category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Priority: </span>
                <span className={`font-medium ${getPriorityColor(formData.priority)}`}>
                  {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status: </span>
                <span className={`font-medium ${getStatusColor(formData.status)}`}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Cost: </span>
                <span className="font-medium text-gray-900">
                  UGX {formData.cost_implication?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
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
              {preference ? 'Update Preference' : 'Add Preference'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 