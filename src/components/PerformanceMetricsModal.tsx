'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreatePerformanceMetric, useUpdatePerformanceMetric } from '../hooks/useApi';

interface PerformanceMetric {
  id?: number;
  employee_id: number;
  metric_name: string;
  metric_value: number;
  target_value: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  category: 'productivity' | 'quality' | 'efficiency' | 'customer_satisfaction' | 'innovation' | 'teamwork';
  date: string;
  notes?: string;
}

interface PerformanceMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  metric?: PerformanceMetric | null;
  employeeId?: number;
}

export default function PerformanceMetricsModal({
  isOpen,
  onClose,
  onSuccess,
  metric = null,
  employeeId
}: PerformanceMetricsModalProps) {
  const createPerformanceMetricMutation = useCreatePerformanceMetric();
  const updatePerformanceMetricMutation = useUpdatePerformanceMetric();
  const [formData, setFormData] = useState<PerformanceMetric>({
    employee_id: employeeId || 0,
    metric_name: '',
    metric_value: 0,
    target_value: 0,
    unit: '',
    period: 'monthly',
    category: 'productivity',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (metric) {
      setFormData({
        employee_id: metric.employee_id,
        metric_name: metric.metric_name,
        metric_value: metric.metric_value,
        target_value: metric.target_value,
        unit: metric.unit,
        period: metric.period,
        category: metric.category,
        date: metric.date,
        notes: metric.notes || ''
      });
    } else {
      setFormData({
        employee_id: employeeId || 0,
        metric_name: '',
        metric_value: 0,
        target_value: 0,
        unit: '',
        period: 'monthly',
        category: 'productivity',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setErrors({});
  }, [metric, employeeId, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
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

    if (!formData.metric_name.trim()) {
      newErrors.metric_name = 'Metric name is required';
    }

    if (formData.metric_value < 0) {
      newErrors.metric_value = 'Metric value cannot be negative';
    }

    if (formData.target_value < 0) {
      newErrors.target_value = 'Target value cannot be negative';
    }

    if (!formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      if (metric && metric.id) {
        await updatePerformanceMetricMutation.mutateAsync({ id: metric.id, data: formData });
      } else {
        await createPerformanceMetricMutation.mutateAsync(formData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving performance metric:', error);
      alert(`Error saving performance metric: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {metric ? 'Edit Performance Metric' : 'Add Performance Metric'}
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
          {/* Metric Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric Name *
              </label>
              <input
                type="text"
                name="metric_name"
                value={formData.metric_name}
                onChange={handleInputChange}
                placeholder="e.g., Sales Revenue, Customer Satisfaction Score, Code Quality Rating"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.metric_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.metric_name && <p className="text-red-500 text-xs mt-1">{errors.metric_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="productivity">Productivity</option>
                <option value="quality">Quality</option>
                <option value="efficiency">Efficiency</option>
                <option value="customer_satisfaction">Customer Satisfaction</option>
                <option value="innovation">Innovation</option>
                <option value="teamwork">Teamwork</option>
              </select>
            </div>
          </div>

          {/* Metric Values and Unit */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Value *
              </label>
              <input
                type="number"
                name="metric_value"
                value={formData.metric_value}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.metric_value ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.metric_value && <p className="text-red-500 text-xs mt-1">{errors.metric_value}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Value *
              </label>
              <input
                type="number"
                name="target_value"
                value={formData.target_value}
                onChange={handleInputChange}
                step="0.01"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.target_value ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.target_value && <p className="text-red-500 text-xs mt-1">{errors.target_value}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="e.g., %, $, hours, score"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.unit ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
            </div>
          </div>

          {/* Period and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement Period *
              </label>
              <select
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

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
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional context, observations, or explanations about this metric..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Performance Indicator */}
          {formData.metric_value > 0 && formData.target_value > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Indicator</h4>
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <span className="text-gray-600">Achievement: </span>
                  <span className={`font-medium ${
                    (formData.metric_value / formData.target_value) >= 1 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {((formData.metric_value / formData.target_value) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Status: </span>
                  <span className={`font-medium ${
                    (formData.metric_value / formData.target_value) >= 1 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {(formData.metric_value / formData.target_value) >= 1 ? 'Target Met' : 'Below Target'}
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
              {metric ? 'Update Metric' : 'Add Metric'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
