'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useLeaveTypes, useEmployees, useCreateLeaveRequest, useUpdateLeaveRequest } from '../hooks/useApi';
import CustomAlert from './CustomAlert';

interface LeaveRequest {
  id?: number;
  employee_id: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requested_date: string;
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  is_emergency: boolean;
  contact_during_leave?: string;
  notes?: string;
}

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  request?: LeaveRequest | null;
  employeeId?: number;
}

export default function LeaveRequestModal({
  isOpen,
  onClose,
  onSuccess,
  request = null,
  employeeId
}: LeaveRequestModalProps) {
  const [formData, setFormData] = useState<LeaveRequest>({
    employee_id: employeeId || 0,
    leave_type_id: 0,
    start_date: '',
    end_date: '',
    total_days: 0,
    reason: '',
    status: 'pending',
    requested_date: new Date().toISOString().split('T')[0],
    approved_by: '',
    approval_date: '',
    rejection_reason: '',
    is_emergency: false,
    contact_during_leave: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom Alert State
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    showConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  // API hooks
  const { data: leaveTypesData } = useLeaveTypes();
  const { data: employeesData } = useEmployees();
  const createLeaveRequestMutation = useCreateLeaveRequest();
  const updateLeaveRequestMutation = useUpdateLeaveRequest();

  // Helper function to safely extract array data from API responses
  const safeExtractArray = (data: any, fallback: any[] = []) => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    
    // Handle paginated API response (data.data.data for Laravel paginated results)
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    // Handle direct API response (data.data)
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return fallback;
  };

  // Extract data
  const leaveTypes = safeExtractArray(leaveTypesData);
  const employees = safeExtractArray(employeesData);

  // Custom Alert Helper Functions
  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setCustomAlert({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const closeAlert = () => {
    setCustomAlert(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (request) {
      setFormData({
        employee_id: request.employee_id,
        leave_type_id: request.leave_type_id,
        start_date: request.start_date,
        end_date: request.end_date,
        total_days: request.total_days,
        reason: request.reason,
        status: request.status,
        requested_date: request.requested_date,
        approved_by: request.approved_by || '',
        approval_date: request.approval_date || '',
        rejection_reason: request.rejection_reason || '',
        is_emergency: request.is_emergency,
        contact_during_leave: request.contact_during_leave || '',
        notes: request.notes || ''
      });
    } else {
      setFormData({
        employee_id: employeeId || 0,
        leave_type_id: 0,
        start_date: '',
        end_date: '',
        total_days: 0,
        reason: '',
        status: 'pending',
        requested_date: new Date().toISOString().split('T')[0],
        approved_by: '',
        approval_date: '',
        rejection_reason: '',
        is_emergency: false,
        contact_during_leave: '',
        notes: ''
      });
    }
    setErrors({});
  }, [request, employeeId, isOpen]);

  // Auto-calculate days when dates or leave type changes
  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const calculatedDays = calculateTotalDays();
      setFormData(prev => ({ ...prev, total_days: calculatedDays }));
    }
  }, [formData.start_date, formData.end_date, formData.leave_type_id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
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

  const calculateTotalDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    
    if (start > end) return 0;
    
    // Get leave type info for better calculation
    const selectedLeaveType = leaveTypes.find((lt: any) => lt.id === formData.leave_type_id);
    
    // Calculate working days (excluding weekends)
    let workingDays = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    // If leave type has specific rules, apply them
    if (selectedLeaveType) {
      // For some leave types, we might want to include weekends
      if (selectedLeaveType.include_weekends) {
        const timeDiff = end.getTime() - start.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        return daysDiff + 1; // Include both start and end dates
      }
    }
    
    return workingDays;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Leave type is required';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date) {
      const start = new Date(formData.start_date);
      const end = new Date(formData.end_date);
      
      if (start > end) {
        newErrors.end_date = 'End date must be after start date';
      }
      
      if (start < new Date()) {
        newErrors.start_date = 'Start date cannot be in the past';
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for leave is required';
    }

    if (formData.status === 'rejected' && !formData.rejection_reason?.trim()) {
      newErrors.rejection_reason = 'Rejection reason is required when status is rejected';
    }

    if (formData.status === 'approved' && !formData.approved_by?.trim()) {
      newErrors.approved_by = 'Approver name is required when status is approved';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total days before validation
    const calculatedDays = calculateTotalDays();
    setFormData(prev => ({ ...prev, total_days: calculatedDays }));
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (request && request.id) {
        // Update existing leave request
        await updateLeaveRequestMutation.mutateAsync({
          id: request.id,
          data: formData
        });
        showAlert('success', 'Success', 'Leave request updated successfully!');
      } else {
        // Create new leave request
        await createLeaveRequestMutation.mutateAsync(formData);
        showAlert('success', 'Success', 'Leave request created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error submitting leave request:', error);
      
      if (error?.response?.data?.errors) {
        // Handle validation errors from backend
        setErrors(error.response.data.errors);
      } else if (error?.response?.data?.message) {
        // Handle general error message from backend
        showAlert('error', 'Error', error.response.data.message);
      } else {
        // Handle generic error
        showAlert('error', 'Error', 'Failed to submit leave request. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {request ? 'Edit Leave Request' : 'Submit Leave Request'}
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
          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <select
              name="employee_id"
              value={formData.employee_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.employee_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select Employee</option>
              {employees.map((employee: any) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.employee_id || employee.id})
                </option>
              ))}
            </select>
            {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>}
          </div>

          {/* Leave Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type *
              </label>
              <select
                name="leave_type_id"
                value={formData.leave_type_id}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.leave_type_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Leave Type</option>
                {leaveTypes.map((leaveType: any) => (
                  <option key={leaveType.id} value={leaveType.id}>
                    {leaveType.name} ({leaveType.code})
                  </option>
                ))}
              </select>
              {errors.leave_type_id && <p className="text-red-500 text-xs mt-1">{errors.leave_type_id}</p>}
            </div>

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
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.start_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>}
            </div>
          </div>

          {/* Total Days and Requested Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Days
              </label>
              <input
                type="number"
                name="total_days"
                value={formData.total_days}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from start and end dates</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requested Date
              </label>
              <input
                type="date"
                name="requested_date"
                value={formData.requested_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Reason and Emergency Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Leave *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                rows={3}
                placeholder="Please provide a detailed reason for your leave request..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.reason ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_emergency"
                  checked={formData.is_emergency}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">Emergency Leave</label>
                <p className="ml-2 text-xs text-gray-500">(Mark if this is an emergency request)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact During Leave
                </label>
                <input
                  type="text"
                  name="contact_during_leave"
                  value={formData.contact_during_leave}
                  onChange={handleInputChange}
                  placeholder="Phone number or email for urgent contact"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Approval Information */}
          {formData.status === 'approved' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved By *
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
          )}

          {/* Rejection Information */}
          {formData.status === 'rejected' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                name="rejection_reason"
                value={formData.rejection_reason}
                onChange={handleInputChange}
                rows={3}
                placeholder="Please provide a reason for rejecting this leave request..."
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.rejection_reason ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.rejection_reason && <p className="text-red-500 text-xs mt-1">{errors.rejection_reason}</p>}
            </div>
          )}

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
              placeholder="Additional information, special circumstances, or notes about this leave request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Leave Summary */}
          {formData.start_date && formData.end_date && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Leave Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Duration: </span>
                  <span className="font-medium text-gray-900">
                    {formData.total_days} day{formData.total_days !== 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status: </span>
                  <span className={`font-medium ${getStatusColor(formData.status)}`}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Emergency: </span>
                  <span className={`font-medium ${formData.is_emergency ? 'text-red-600' : 'text-green-600'}`}>
                    {formData.is_emergency ? 'Yes' : 'No'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Requested: </span>
                  <span className="font-medium text-gray-900">
                    {new Date(formData.requested_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

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
              {request ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={customAlert.isOpen}
        onClose={closeAlert}
        type={customAlert.type}
        title={customAlert.title}
        message={customAlert.message}
        showConfirm={customAlert.showConfirm}
        onConfirm={customAlert.onConfirm}
      />
    </div>
  );
}



