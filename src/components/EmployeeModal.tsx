'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateEmployee, useUpdateEmployee, useDepartments, useJobPositions } from '../hooks/useApi';

import { useToast } from './ui/toast';

interface Employee {
  id?: number;
  name: string;
  email: string;
  phone: string;
  employee_id?: string;
  position: string;
  department: string;
  salary: string;
  payment_method?: string;
  bank_name?: string;
  bank_account?: string;
  mobile_money_provider?: string;
  mobile_money_number?: string;
  password?: string;
  is_active?: boolean;
}

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  employee?: Employee | null;
}

export default function EmployeeModal({
  isOpen,
  onClose,
  onSuccess,
  employee = null
}: EmployeeModalProps) {
  const [formData, setFormData] = useState<Employee>({
    name: '',
    email: '',
    phone: '',
    employee_id: '',
    position: '',
    department: '',
    salary: '',
    payment_method: '',
    bank_name: '',
    bank_account: '',
    mobile_money_provider: '',
    mobile_money_number: '',
    password: '',
    is_active: true,
  });

  const { addToast } = useToast();
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const { data: departmentsData, isLoading: departmentsLoading } = useDepartments();
  const { data: jobPositionsData, isLoading: jobPositionsLoading } = useJobPositions();
  

  const isLoading = createEmployeeMutation.isPending || updateEmployeeMutation.isPending;

  // Dynamic data for Uganda context
  const ugandaBanks = [
    'Stanbic Bank Uganda',
    'Centenary Bank',
    'DFCU Bank',
    'Bank of Uganda',
    'Cairo International Bank',
    'Ecobank Uganda',
    'Housing Finance Bank',
    'KCB Bank Uganda',
    'NC Bank Uganda',
    'PostBank Uganda',
    'Tropical Bank',
    'United Bank for Africa',
    'ABSA Bank Uganda',
    'Bank of Africa Uganda',
    'Citibank Uganda',
    'Exim Bank Uganda',
    'Global Trust Bank',
    'I&M Bank Uganda',
    'Opportunity Bank Uganda',
    'Standard Chartered Bank Uganda'
  ];

  const ugandaMobileMoneyProviders = [
    'MTN Mobile Money',
    'Airtel Money',
    'M-Pesa (Safaricom)',
    'Orange Money',
    'Tigo Pesa',
    'Africell Money',
    'Vodafone Cash'
  ];

  // Uganda currency and payment context
  const ugandaCurrency = 'UGX';
  const ugandaPaymentMethods = [
    { value: 'mobile_money', label: 'Mobile Money', icon: '📱' },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
    { value: 'cash', label: 'Cash', icon: '💵' },
    { value: 'cheque', label: 'Cheque', icon: '📝' }
  ];

  // Helper function to safely extract array data from API responses
  const safeExtractArray = (data: any, fallback: unknown[] = []) => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    
    // Handle paginated API response (data.data.data for Laravel paginated results)
    if ('data' in data && data.data && 'data' in data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    // Handle direct API response (data.data)
    if ('data' in data && data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return fallback;
  };

  // Auto-generate employee ID
  const generateEmployeeId = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `EMP${timestamp}`;
  };

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        phone: employee.phone || '',
        employee_id: employee.employee_id || '',
        position: employee.position || '',
        department: employee.department || '',
        salary: employee.salary || '',
        payment_method: employee.payment_method || '',
        bank_name: employee.bank_name || '',
        bank_account: employee.bank_account || '',
        mobile_money_provider: employee.mobile_money_provider || '',
        mobile_money_number: employee.mobile_money_number || '',
        password: '', // Don't populate password for security
        is_active: employee.is_active !== undefined ? employee.is_active : true,
      });
    } else {
      // For new employees, auto-generate employee ID
      const autoId = generateEmployeeId();
      setFormData({
        name: '',
        email: '',
        phone: '',
        employee_id: autoId,
        position: '',
        department: '',
        salary: '',
        payment_method: '',
        bank_name: '',
        bank_account: '',
        mobile_money_provider: '',
        mobile_money_number: '',
        password: '',
        is_active: true,
      });
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (employee && employee.id) {
        // Update existing employee
        const updateData = { ...formData };
        // Don't send password if it's empty (keep existing password)
        if (!updateData.password) {
          delete updateData.password;
        }
        
        console.log('Updating employee with data:', updateData);
        await updateEmployeeMutation.mutateAsync({
          id: employee.id,
          data: updateData
        });
        console.log('Employee updated successfully!');
      } else {
        // Create new employee - password is required
        if (!formData.password || formData.password.length < 8) {
          alert('Password is required and must be at least 8 characters');
          return;
        }
        
        // Convert salary to number if it's a string
        const employeeData = {
          ...formData,
          salary: formData.salary ? Number(formData.salary) : null,
          is_active: formData.is_active ?? true
        };
        
        console.log('Creating employee with data:', employeeData);
        await createEmployeeMutation.mutateAsync(employeeData);
        console.log('Employee created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      console.error('Error details:', error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]: [string, unknown]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('; ');
        addToast(`Validation errors: ${errorMessages}`, 'error');
      } else {
        addToast(`Error saving employee: ${error.response?.data?.message || 'Please try again.'}`, 'error');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dynamic Data Status */}
          {(departmentsLoading || jobPositionsLoading) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center text-blue-800">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm">Loading dynamic data...</span>
              </div>
            </div>
          )}
          
          {!departmentsLoading && !jobPositionsLoading && 
           safeExtractArray(departmentsData).length === 0 && 
           safeExtractArray(jobPositionsData).length === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="text-yellow-800">
                <p className="text-sm font-medium">Setup Required</p>
                <p className="text-xs mt-1">
                  Please create departments and job positions first before adding employees.
                </p>
              </div>
            </div>
          )}
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Auto-generated"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated unique identifier
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+256700000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Authentication Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter a secure password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required={!employee} // Only required for new employees
              minLength={8}
            />
            <p className="text-xs text-gray-500 mt-1">
              {employee ? 'Leave blank to keep current password' : 'Minimum 8 characters required'}
            </p>
          </div>

          {/* Job Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position *
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Position</option>
                {jobPositionsLoading ? (
                  <option value="" disabled>
                    Loading positions...
                  </option>
                ) : safeExtractArray(jobPositionsData).length > 0 ? (
                  safeExtractArray(jobPositionsData).map((position: any) => (
                    <option key={position.id} value={position.title}>
                      {position.title}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No positions available. Please create job positions first.
                  </option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Department</option>
                {departmentsLoading ? (
                  <option value="" disabled>
                    Loading departments...
                  </option>
                ) : safeExtractArray(departmentsData).length > 0 ? (
                  safeExtractArray(departmentsData).map((dept: any) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No departments available. Please create departments first.
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Salary ({ugandaCurrency}) *
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                placeholder="5000000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Payment Method *
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Payment Method</option>
                {ugandaPaymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.icon} {method.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Information - Uganda Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Information (Uganda Business Context)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Configure payment details based on employee's preferred method. Mobile money is widely used in Uganda.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-3">🏦 Bank Details</h4>
                <div className="space-y-3">
                  <div>
                    <select
                      name="bank_name"
                      value={formData.bank_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Bank</option>
                      {ugandaBanks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="bank_account"
                      value={formData.bank_account}
                      onChange={handleInputChange}
                      placeholder="Bank Account Number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="text-sm font-medium text-purple-900 mb-3">📱 Mobile Money</h4>
                <div className="space-y-3">
                  <div>
                    <select
                      name="mobile_money_provider"
                      value={formData.mobile_money_provider}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select Provider</option>
                      {ugandaMobileMoneyProviders.map((provider) => (
                        <option key={provider} value={provider}>
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="mobile_money_number"
                      value={formData.mobile_money_number}
                      onChange={handleInputChange}
                      placeholder="Mobile Money Number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
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
            <label className="ml-2 text-sm text-gray-700">Active Employee</label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {employee ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
