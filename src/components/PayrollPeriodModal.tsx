import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useCreatePayrollPeriod, useUpdatePayrollPeriod } from '../hooks/useApi';

interface PayrollPeriod {
  id?: number;
  period_name: string;
  start_date: string;
  end_date: string;
  payment_date?: string;
  currency: string;
  status?: string;
}

interface PayrollPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  period?: PayrollPeriod | null;
}

export default function PayrollPeriodModal({
  isOpen,
  onClose,
  onSuccess,
  period = null
}: PayrollPeriodModalProps) {
  const [formData, setFormData] = useState<PayrollPeriod>({
    period_name: '',
    start_date: '',
    end_date: '',
    payment_date: '',
    currency: 'UGX',
  });

  const createPeriodMutation = useCreatePayrollPeriod();
  const updatePeriodMutation = useUpdatePayrollPeriod();

  const isLoading = createPeriodMutation.isPending || updatePeriodMutation.isPending;

  // Generate period name based on dates
  const generatePeriodName = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const year = start.getFullYear();
    
    if (startMonth === endMonth) {
      return `${startMonth} ${year} Payroll`;
    } else {
      return `${startMonth} - ${endMonth} ${year} Payroll`;
    }
  };

  useEffect(() => {
    if (period) {
      setFormData({
        period_name: period.period_name || '',
        start_date: period.start_date || '',
        end_date: period.end_date || '',
        payment_date: period.payment_date || '',
        currency: period.currency || 'UGX',
      });
    } else {
      // Generate default dates for current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const startDate = firstDay.toISOString().split('T')[0];
      const endDate = lastDay.toISOString().split('T')[0];
      
      setFormData({
        period_name: generatePeriodName(startDate, endDate),
        start_date: startDate,
        end_date: endDate,
        payment_date: '',
        currency: 'UGX',
      });
    }
  }, [period, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (period && period.id) {
        await updatePeriodMutation.mutateAsync({
          id: period.id,
          data: formData
        });
        console.log('Payroll period updated successfully!');
      } else {
        await createPeriodMutation.mutateAsync(formData);
        console.log('Payroll period created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving payroll period:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, messages]: [string, any]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        alert(`Validation errors:\n${errorMessages}`);
      } else {
        alert(`Error saving payroll period: ${error.response?.data?.message || error.message || 'Please try again.'}`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Auto-generate period name when dates change
      if ((name === 'start_date' || name === 'end_date') && !period) {
        newData.period_name = generatePeriodName(
          name === 'start_date' ? value : prev.start_date,
          name === 'end_date' ? value : prev.end_date
        );
      }
      
      return newData;
    });
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-2" />
                    {period ? 'Edit Payroll Period' : 'Create New Payroll Period'}
                  </div>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-white px-2 py-1 text-sm font-medium text-gray-400 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </Dialog.Title>
                
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period Name *
                      </label>
                      <input
                        type="text"
                        name="period_name"
                        value={formData.period_name}
                        onChange={handleInputChange}
                        placeholder="e.g., January 2024 Payroll"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>

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
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
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
                          min={formData.start_date}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Date
                        </label>
                        <input
                          type="date"
                          name="payment_date"
                          value={formData.payment_date}
                          onChange={handleInputChange}
                          min={formData.end_date}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          When salaries will be paid
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Currency *
                        </label>
                        <select
                          name="currency"
                          value={formData.currency}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          required
                        >
                          <option value="UGX">UGX - Uganda Shilling</option>
                          <option value="KES">KES - Kenya Shilling</option>
                          <option value="TZS">TZS - Tanzania Shilling</option>
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                        </select>
                      </div>
                    </div>

                    {/* African Business Context Information */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CalendarIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800">
                            African Payroll Processing
                          </h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc list-inside space-y-1">
                              <li>Automatic tax calculation based on local rates</li>
                              <li>Mobile money payment support (MTN, Airtel, M-Pesa)</li>
                              <li>Multi-currency support for regional businesses</li>
                              <li>Bank transfer integration for corporate accounts</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                        onClick={onClose}
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : (period ? 'Update Period' : 'Create Period')}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}




