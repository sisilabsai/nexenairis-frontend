'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateLocalHoliday, useUpdateLocalHoliday } from '../hooks/useApi';

interface LocalHoliday {
  id?: number;
  name: string;
  date: string;
  type: 'public_holiday' | 'company_holiday' | 'observance';
  is_paid: boolean;
  description?: string;
}

interface LocalHolidayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  holiday?: LocalHoliday | null;
}

export default function LocalHolidayModal({
  isOpen,
  onClose,
  onSuccess,
  holiday = null
}: LocalHolidayModalProps) {
  const [formData, setFormData] = useState<LocalHoliday>({
    name: '',
    date: '',
    type: 'public_holiday',
    is_paid: true,
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createHolidayMutation = useCreateLocalHoliday();
  const updateHolidayMutation = useUpdateLocalHoliday();

  const isLoading = createHolidayMutation.isPending || updateHolidayMutation.isPending;

  useEffect(() => {
    if (holiday) {
      // Format the date for the input field (YYYY-MM-DD)
      const formattedDate = holiday.date ? holiday.date.split('T')[0] : '';
      setFormData({
        name: holiday.name,
        date: formattedDate,
        type: holiday.type,
        is_paid: holiday.is_paid,
        description: holiday.description || ''
      });
    } else {
      setFormData({
        name: '',
        date: '',
        type: 'public_holiday',
        is_paid: true,
        description: ''
      });
    }
    setErrors({});
  }, [holiday, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
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

    if (!formData.name.trim()) {
      newErrors.name = 'Holiday name is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.type) {
      newErrors.type = 'Holiday type is required';
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
      if (holiday && holiday.id) {
        // Update existing holiday
        await updateHolidayMutation.mutateAsync({
          id: holiday.id,
          data: formData
        });
      } else {
        // Create new holiday
        await createHolidayMutation.mutateAsync(formData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving holiday:', error);
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        alert(`Error saving holiday: ${error?.message || 'Please try again.'}`);
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
            {holiday ? 'Edit Holiday' : 'Add New Holiday'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Holiday Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Holiday Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Independence Day, Christmas, Company Anniversary"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Date and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Holiday Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.type ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="public_holiday">Public Holiday</option>
                <option value="company_holiday">Company Holiday</option>
                <option value="observance">Observance</option>
              </select>
              {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
            </div>
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
              placeholder="Optional description or notes about this holiday..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Paid Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_paid"
              checked={formData.is_paid}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Paid Holiday</label>
            <p className="ml-2 text-xs text-gray-500">(Employees receive full pay for this day)</p>
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
              {holiday ? 'Update Holiday' : 'Add Holiday'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 