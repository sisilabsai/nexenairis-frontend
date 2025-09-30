'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useEmployees, usePayrollPeriods } from '../hooks/useApi';

interface NssfContribution {
  id?: number;
  employee_id: number;
  employee_name: string;
  gross_salary: number;
  employee_contribution: number;
  employer_contribution: number;
  total_contribution: number;
  month: string;
  year: number;
  status: 'pending' | 'processed' | 'paid';
  nssf_number?: string;
  payroll_period_id?: number;
}

interface NssfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contribution?: NssfContribution | null;
}

export default function NssfModal({
  isOpen,
  onClose,
  onSuccess,
  contribution = null
}: NssfModalProps) {
  const [formData, setFormData] = useState<NssfContribution>({
    employee_id: 0,
    employee_name: '',
    gross_salary: 0,
    employee_contribution: 0,
    employer_contribution: 0,
    total_contribution: 0,
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear(),
    status: 'pending',
    nssf_number: '',
    payroll_period_id: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get real employees data from API
  const { data: employeesData } = useEmployees();
  const { data: payrollPeriodsData } = usePayrollPeriods();
  
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
  
  const employees = safeExtractArray(employeesData);
  const payrollPeriods = safeExtractArray(payrollPeriodsData);

  useEffect(() => {
    if (contribution) {
      setFormData({
        employee_id: contribution.employee_id,
        employee_name: contribution.employee_name,
        gross_salary: contribution.gross_salary,
        employee_contribution: contribution.employee_contribution,
        employer_contribution: contribution.employer_contribution,
        total_contribution: contribution.total_contribution,
        month: contribution.month,
        year: contribution.year,
        status: contribution.status,
        nssf_number: contribution.nssf_number || '',
        payroll_period_id: contribution.payroll_period_id
      });
    } else {
      setFormData({
        employee_id: 0,
        employee_name: '',
        gross_salary: 0,
        employee_contribution: 0,
        employer_contribution: 0,
        total_contribution: 0,
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear(),
        status: 'pending',
        nssf_number: '',
        payroll_period_id: undefined
      });
    }
    setErrors({});
  }, [contribution, isOpen]);

  const calculateContributions = (grossSalary: number) => {
    const employeeContribution = grossSalary * 0.05; // 5%
    const employerContribution = grossSalary * 0.10; // 10%
    const totalContribution = employeeContribution + employerContribution;
    
    return {
      employee_contribution: employeeContribution,
      employer_contribution: employerContribution,
      total_contribution: totalContribution
    };
  };

  const handleEmployeeChange = (employeeId: number) => {
    const employee = employees.find((emp: any) => emp.id === employeeId);
    if (employee) {
      const contributions = calculateContributions(employee.salary);
      setFormData(prev => ({
        ...prev,
        employee_id: employeeId,
        employee_name: employee.name,
        gross_salary: employee.salary,
        ...contributions
      }));
    }
  };

  const handlePayrollPeriodChange = (periodId: number) => {
    const period = payrollPeriods.find((p: any) => p.id === periodId);
    if (period) {
      const startDate = new Date(period.start_date);
      const month = startDate.toLocaleString('default', { month: 'long' });
      const year = startDate.getFullYear();
      
      setFormData(prev => ({
        ...prev,
        payroll_period_id: periodId,
        month: month,
        year: year
      }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'gross_salary') {
      const salary = parseFloat(value) || 0;
      const contributions = calculateContributions(salary);
      setFormData(prev => ({
        ...prev,
        [name]: salary,
        ...contributions
      }));
    } else if (name === 'payroll_period_id') {
      // Handle payroll period selection - convert empty string to undefined, otherwise to number
      const periodValue = value === '' ? undefined : Number(value);
      setFormData(prev => ({ ...prev, [name]: periodValue }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
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

    if (!formData.payroll_period_id) {
      newErrors.payroll_period_id = 'Payroll period is required';
    }

    if (formData.gross_salary <= 0) {
      newErrors.gross_salary = 'Gross salary must be greater than 0';
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
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Debug: Log the data being sent
      const submitData = {
        user_id: formData.employee_id,
        payroll_period_id: formData.payroll_period_id,
        gross_salary: formData.gross_salary,
        status: formData.status,
        nssf_number: formData.nssf_number,
      };
      
      console.log('📤 Submitting NSSF contribution data:', submitData);
      console.log('🔍 Data types:', {
        user_id: typeof submitData.user_id,
        payroll_period_id: typeof submitData.payroll_period_id,
        gross_salary: typeof submitData.gross_salary,
        status: typeof submitData.status,
        nssf_number: typeof submitData.nssf_number
      });
      
      let response;
      if (contribution && contribution.id) {
        // Update existing contribution
        response = await fetch(`http://localhost:8000/api/hr/nssf-contributions/${contribution.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(submitData),
        });
      } else {
        // Create new contribution
        response = await fetch('http://localhost:8000/api/hr/nssf-contributions', {
          method: 'POST',
          headers,
          body: JSON.stringify(submitData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Backend validation errors:', errorData);
        
        if (errorData.errors) {
          // Handle validation errors
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        
        throw new Error(errorData.message || 'Failed to save NSSF contribution');
      }

      const result = await response.json();
      console.log('NSSF contribution saved successfully:', result);
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving NSSF contribution:', error);
      alert(`Error saving NSSF contribution: ${error?.message || 'Please try again.'}`);
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
            {contribution ? 'Edit NSSF Contribution' : 'Add NSSF Contribution'}
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
          {/* Help Text */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> To add NSSF contributions, you need:
              <br />• At least one employee with a salary set
              <br />• At least one payroll period created
              <br />• The system will automatically calculate 5% employee and 10% employer contributions
            </p>
          </div>

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employee *
            </label>
            <select
              name="employee_id"
              value={formData.employee_id || ''}
              onChange={(e) => handleEmployeeChange(parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.employee_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select an employee</option>
              {employees.length > 0 ? (
                employees.map((employee: any) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.salary ? `UGX ${employee.salary.toLocaleString()}` : 'No salary set'}
                  </option>
                ))
              ) : (
                <option value="" disabled>No employees available. Please add employees first.</option>
              )}
            </select>
            {errors.employee_id && <p className="text-red-500 text-xs mt-1">{errors.employee_id}</p>}
            
            {/* Show selected employee info */}
            {formData.employee_id && formData.employee_name && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  <strong>Selected:</strong> {formData.employee_name}
                  {formData.gross_salary > 0 && (
                    <span className="ml-2">• Salary: UGX {formData.gross_salary.toLocaleString()}</span>
                  )}
                  {formData.gross_salary === 0 && (
                    <span className="ml-2 text-yellow-600">• No salary set - please set salary in employee profile</span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Payroll Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payroll Period *
            </label>
            <select
              name="payroll_period_id"
              value={formData.payroll_period_id || ''}
              onChange={(e) => handlePayrollPeriodChange(parseInt(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.payroll_period_id ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select a payroll period</option>
              {payrollPeriods.length > 0 ? (
                payrollPeriods.map((period: any) => (
                  <option key={period.id} value={period.id}>
                    {period.period_name} ({new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()})
                  </option>
                ))
              ) : (
                <option value="" disabled>No payroll periods available. Please create a payroll period first.</option>
              )}
            </select>
            {errors.payroll_period_id && <p className="text-red-500 text-xs mt-1">{errors.payroll_period_id}</p>}
            
            {/* Show selected payroll period info */}
            {formData.payroll_period_id && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected Period:</strong> {formData.month} {formData.year}
                </p>
              </div>
            )}
          </div>

          {/* Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month *
              </label>
              <input
                type="text"
                name="month"
                value={formData.month}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Auto-set from payroll period</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Auto-set from payroll period</p>
            </div>
          </div>

          {/* Salary and Contributions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gross Salary (UGX) *
              </label>
              <input
                type="number"
                name="gross_salary"
                value={formData.gross_salary}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.gross_salary ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.gross_salary && <p className="text-red-500 text-xs mt-1">{errors.gross_salary}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee (5%)
              </label>
              <input
                type="number"
                name="employee_contribution"
                value={formData.employee_contribution}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employer (10%)
              </label>
              <input
                type="number"
                name="employer_contribution"
                value={formData.employer_contribution}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
              />
            </div>
          </div>

          {/* Total Contribution */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Contribution (UGX)
            </label>
            <input
              type="number"
              name="total_contribution"
              value={formData.total_contribution}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold text-lg"
            />
          </div>

          {/* NSSF Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NSSF Number
            </label>
            <input
              type="text"
              name="nssf_number"
              value={formData.nssf_number || ''}
              onChange={handleInputChange}
              placeholder="e.g., NSSF123456"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="processed">Processed</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="space-y-3 pt-6 border-t">
            {/* Help message when form is disabled */}
            {(employees.length === 0 || payrollPeriods.length === 0 || formData.gross_salary <= 0) && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <p className="text-sm text-yellow-800">
                  {employees.length === 0 && payrollPeriods.length === 0 && 
                    'Please add employees and create payroll periods before adding NSSF contributions.'}
                  {employees.length === 0 && payrollPeriods.length > 0 && 
                    'Please add employees before adding NSSF contributions.'}
                  {employees.length > 0 && payrollPeriods.length === 0 && 
                    'Please create payroll periods before adding NSSF contributions.'}
                  {employees.length > 0 && payrollPeriods.length > 0 && formData.gross_salary <= 0 && 
                    'Selected employee has no salary set. Please set a salary in the employee profile.'}
                </p>
              </div>
            )}
            
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
                disabled={isSubmitting || employees.length === 0 || payrollPeriods.length === 0 || formData.gross_salary <= 0}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
              >
                {isSubmitting && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {contribution ? 'Update Contribution' : 'Add Contribution'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
} 