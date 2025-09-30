'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useEmployees, usePayrollPeriods } from '../hooks/useApi';

interface NssfContribution {
  id?: number;
  user_id?: number;
  employee_id?: number;
  payroll_period_id: number;
  gross_salary: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
  nssf_number?: string;
  status: 'pending' | 'processed' | 'paid';
  processed_at?: string;
  employee_name?: string;
  payroll_period_name?: string;
}

interface NssfContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contribution?: NssfContribution | null;
  mode: 'view' | 'edit' | 'create' | 'delete';
}

export default function NssfContributionModal({
  isOpen,
  onClose,
  onSuccess,
  contribution = null,
  mode
}: NssfContributionModalProps) {
  const [formData, setFormData] = useState<NssfContribution>({
    user_id: undefined,
    employee_id: undefined,
    payroll_period_id: 0,
    gross_salary: 0,
    employee_contribution: 0,
    employer_contribution: 0,
    total_contribution: 0,
    nssf_number: '',
    status: 'pending',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: employeesData } = useEmployees();
  const { data: payrollPeriodsData } = usePayrollPeriods();

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

  const employees = safeExtractArray(employeesData);
  const payrollPeriods = safeExtractArray(payrollPeriodsData);

  useEffect(() => {
    if (contribution && mode !== 'create') {
      setFormData({
        user_id: contribution.employee_id || contribution.user_id || 0,
        payroll_period_id: contribution.payroll_period_id || 0,
        gross_salary: contribution.gross_salary || 0,
        employee_contribution: contribution.employee_contribution || 0,
        employer_contribution: contribution.employer_contribution || 0,
        total_contribution: contribution.total_contribution || 0,
        nssf_number: contribution.nssf_number || '',
        status: contribution.status || 'pending',
      });
    } else {
      setFormData({
        user_id: undefined,
        employee_id: undefined,
        payroll_period_id: 0,
        gross_salary: 0,
        employee_contribution: 0,
        employer_contribution: 0,
        total_contribution: 0,
        nssf_number: '',
        status: 'pending',
      });
    }
    setErrors({});
  }, [contribution, mode, isOpen]);

  const handleEmployeeChange = (employeeId: number) => {
    const employee = employees.find((emp: any) => emp.id === employeeId);
    if (employee && employee.salary) {
      const salary = parseFloat(employee.salary);
      const employeeContribution = salary * 0.05;
      const employerContribution = salary * 0.10;
      const totalContribution = employeeContribution + employerContribution;

      setFormData(prev => ({
        ...prev,
        user_id: employeeId,
        gross_salary: salary,
        employee_contribution: Math.round(employeeContribution * 100) / 100,
        employer_contribution: Math.round(employerContribution * 100) / 100,
        total_contribution: Math.round(totalContribution * 100) / 100,
      }));
    }
  };

  const handlePayrollPeriodChange = (periodId: number) => {
    const period = payrollPeriods.find((p: any) => p.id === periodId);
    if (period) {
      setFormData(prev => ({
        ...prev,
        payroll_period_id: periodId,
      }));
    }
  };

  const handleStatusChange = (newStatus: 'pending' | 'processed' | 'paid') => {
    setFormData(prev => ({
      ...prev,
      status: newStatus,
      processed_at: newStatus === 'processed' || newStatus === 'paid' ? new Date().toISOString() : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'view' || mode === 'delete') {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const submitData = {
        user_id: formData.user_id,
        payroll_period_id: formData.payroll_period_id,
        gross_salary: formData.gross_salary,
        employee_contribution: formData.employee_contribution,
        employer_contribution: formData.employer_contribution,
        total_contribution: formData.total_contribution,
        status: formData.status,
        nssf_number: formData.nssf_number,
      };

      let response;
      if (mode === 'create') {
        response = await fetch('http://localhost:8000/api/hr/nssf-contributions', {
          method: 'POST',
          headers,
          body: JSON.stringify(submitData),
        });
      } else if (mode === 'edit' && contribution?.id) {
        response = await fetch(`http://localhost:8000/api/hr/nssf-contributions/${contribution.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(submitData),
        });
      }

      if (response && !response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        throw new Error(errorData.message || 'Failed to save NSSF contribution');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      alert(`Error saving NSSF contribution: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!contribution?.id) return;

    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const response = await fetch(`http://localhost:8000/api/hr/nssf-contributions/${contribution.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete NSSF contribution');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error deleting NSSF contribution:', error);
      alert(`Error deleting NSSF contribution: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.user_id === undefined || formData.user_id === null || formData.user_id === 0) {
      newErrors.user_id = 'Employee is required';
    }

    if (formData.payroll_period_id === undefined || formData.payroll_period_id === null || formData.payroll_period_id === 0) {
      newErrors.payroll_period_id = 'Payroll period is required';
    }

    if (formData.gross_salary === undefined || formData.gross_salary === null || formData.gross_salary <= 0) {
      newErrors.gross_salary = 'Valid gross salary is required';
    }

    if (!formData.nssf_number?.trim()) {
      newErrors.nssf_number = 'NSSF number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getModalTitle = () => {
    switch (mode) {
      case 'view': return 'View NSSF Contribution';
      case 'edit': return 'Edit NSSF Contribution';
      case 'create': return 'Add NSSF Contribution';
      case 'delete': return 'Delete NSSF Contribution';
      default: return 'NSSF Contribution';
    }
  };

  const getModalContent = () => {
    switch (mode) {
      case 'view':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <div className="text-sm text-gray-900">
                  {contribution?.employee_name || employees.find((emp: any) => emp.id === formData.user_id)?.name || 'Unknown Employee'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NSSF Number</label>
                <div className="text-sm text-gray-900">{formData.nssf_number}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payroll Period</label>
                <div className="text-sm text-gray-900">
                  {contribution?.payroll_period_name || payrollPeriods.find((p: any) => p.id === formData.payroll_period_id)?.period_name || 'Unknown Period'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="text-sm text-gray-900">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    formData.status === 'paid' ? 'bg-green-100 text-green-800' :
                    formData.status === 'processed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gross Salary</label>
                <div className="text-lg font-semibold text-gray-900">
                  UGX {formData.gross_salary?.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee (5%)</label>
                <div className="text-lg font-semibold text-gray-900">
                  UGX {formData.employee_contribution?.toLocaleString()}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer (10%)</label>
                <div className="text-lg font-semibold text-gray-900">
                  UGX {formData.employer_contribution?.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Contribution</label>
              <div className="text-2xl font-bold text-indigo-600">
                UGX {formData.total_contribution?.toLocaleString()}
              </div>
            </div>

            {formData.processed_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Processed Date</label>
                <div className="text-sm text-gray-900">
                  {new Date(formData.processed_at).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>
        );

      case 'delete':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete NSSF Contribution</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this NSSF contribution for{' '}
              <strong>{employees.find((emp: any) => emp.id === formData.user_id)?.name || 'Unknown Employee'}</strong>?
              This action cannot be undone.
            </p>
          </div>
        );

      default:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employee *
                </label>
                {mode === 'edit' ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                    {contribution?.employee_name || employees.find((emp: any) => emp.id === formData.user_id)?.name || 'Unknown Employee'}
                  </div>
                ) : (
                  <select
                    value={formData.user_id || ''}
                    onChange={(e) => handleEmployeeChange(Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.user_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select an employee</option>
                    {employees.map((employee: any) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} - UGX {employee.salary?.toLocaleString() || 'No salary'}
                      </option>
                    ))}
                  </select>
                )}
                {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
                {!employees.length && (
                  <p className="text-yellow-600 text-xs mt-1">No employees available</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NSSF Number *
                </label>
                <input
                  type="text"
                  value={formData.nssf_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, nssf_number: e.target.value }))}
                  placeholder="e.g., NSSF000001"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.nssf_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.nssf_number && <p className="text-red-500 text-xs mt-1">{errors.nssf_number}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payroll Period *
              </label>
              {mode === 'edit' ? (
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                  {contribution?.payroll_period_name || payrollPeriods.find((p: any) => p.id === formData.payroll_period_id)?.period_name || 'Unknown Period'}
                </div>
              ) : (
                <select
                  value={formData.payroll_period_id || ''}
                  onChange={(e) => handlePayrollPeriodChange(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.payroll_period_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select a payroll period</option>
                  {payrollPeriods.map((period: any) => (
                    <option key={period.id} value={period.id}>
                      {period.period_name} ({new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              )}
              {errors.payroll_period_id && <p className="text-red-500 text-xs mt-1">{errors.payroll_period_id}</p>}
              {!payrollPeriods.length && (
                <p className="text-yellow-600 text-xs mt-1">No payroll periods available</p>
              )}
            </div>

            {mode === 'edit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value as 'pending' | 'processed' | 'paid')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gross Salary</label>
                <div className="text-lg font-semibold text-gray-900">
                  UGX {formData.gross_salary?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500">Auto-calculated from employee salary</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee (5%)</label>
                <div className="text-lg font-semibold text-gray-900">
                  UGX {formData.employee_contribution?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500">Auto-calculated</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employer (10%)</label>
                <div className="text-lg font-semibold text-gray-900">
                  UGX {formData.employer_contribution?.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500">Auto-calculated</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Contribution</label>
              <div className="text-2xl font-bold text-indigo-600">
                UGX {formData.total_contribution?.toLocaleString() || '0'}
              </div>
              <p className="text-xs text-gray-500">Auto-calculated total</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">NSSF Contribution Information</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>• Employee contribution: 5% of gross salary</p>
                    <p>• Employer contribution: 10% of gross salary</p>
                    <p>• Total contribution: 15% of gross salary</p>
                    <p>• All calculations are automatic based on employee salary</p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        );
    }
  };

  const getModalActions = () => {
    switch (mode) {
      case 'view':
        return (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                // Switch to edit mode
                const newMode = 'edit';
                // This would need to be handled by the parent component
                console.log('Switch to edit mode');
              }}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Edit
            </button>
          </div>
        );

      case 'delete':
        return (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {isDeleting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isDeleting ? 'Deleting...' : 'Delete Contribution'}
            </button>
          </div>
        );

      default:
        return (
          <div className="flex justify-end space-x-3">
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
              disabled={isSubmitting || (mode === 'create' && (!employees.length || !payrollPeriods.length))}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Contribution' : 'Update Contribution')}
            </button>
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">{getModalTitle()}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting || isDeleting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {getModalContent()}

        <div className="mt-8 pt-6 border-t">
          {getModalActions()}
        </div>
      </div>
    </div>
  );
} 