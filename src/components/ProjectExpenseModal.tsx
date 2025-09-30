'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import { useCreateProjectExpense, useUpdateProjectExpense } from '../hooks/useApi';

interface ProjectExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any;
  projectId: number;
  mode: 'create' | 'edit';
}

export default function ProjectExpenseModal({ isOpen, onClose, expense, projectId, mode }: ProjectExpenseModalProps) {
  const [formData, setFormData] = useState({
    project_id: projectId,
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    receipt_number: '',
    billable: false,
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createExpenseMutation = useCreateProjectExpense();
  const updateExpenseMutation = useUpdateProjectExpense();

  useEffect(() => {
    if (expense && mode === 'edit') {
      setFormData({
        project_id: projectId,
        category: expense.category || '',
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        vendor: expense.vendor || '',
        receipt_number: expense.receipt_number || '',
        billable: expense.billable || false,
        notes: expense.notes || '',
      });
    } else {
      setFormData({
        project_id: projectId,
        category: '',
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        vendor: '',
        receipt_number: '',
        billable: false,
        notes: '',
      });
    }
    setErrors({});
  }, [expense, mode, projectId]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.vendor.trim()) {
      newErrors.vendor = 'Vendor is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (mode === 'create') {
        await createExpenseMutation.mutateAsync(submitData);
      } else {
        await updateExpenseMutation.mutateAsync({
          id: expense.id,
          data: submitData,
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving project expense:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  const isLoading = createExpenseMutation.isPending || updateExpenseMutation.isPending;

  const expenseCategories = [
    'Travel',
    'Meals',
    'Equipment',
    'Software',
    'Training',
    'Marketing',
    'Office Supplies',
    'Professional Services',
    'Other'
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                {mode === 'create' ? 'Add Project Expense' : 'Edit Project Expense'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select a category</option>
                {expenseCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe the expense..."
                required
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  required
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                required
              />
            </div>

            {/* Vendor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor *
              </label>
              <input
                type="text"
                value={formData.vendor}
                onChange={(e) => handleInputChange('vendor', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.vendor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Vendor name"
                required
              />
              {errors.vendor && (
                <p className="mt-1 text-sm text-red-600">{errors.vendor}</p>
              )}
            </div>

            {/* Receipt Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Number
              </label>
              <input
                type="text"
                value={formData.receipt_number}
                onChange={(e) => handleInputChange('receipt_number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Receipt or invoice number"
              />
            </div>

            {/* Billable */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="billable"
                checked={formData.billable}
                onChange={(e) => handleInputChange('billable', e.target.checked)}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label htmlFor="billable" className="ml-2 text-sm text-gray-700">
                Billable to client
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="Additional notes about this expense..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 border border-transparent rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Add Expense' : 'Update Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

