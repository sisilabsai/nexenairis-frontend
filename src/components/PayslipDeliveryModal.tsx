'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PayslipDelivery {
  id?: number;
  employee_id: number;
  payslip_period: string;
  delivery_date: string;
  delivery_method: 'email' | 'physical' | 'portal' | 'sms';
  delivery_status: 'pending' | 'sent' | 'delivered' | 'failed' | 'acknowledged';
  recipient_email?: string;
  recipient_phone?: string;
  delivery_notes?: string;
  acknowledgment_date?: string;
  is_confidential: boolean;
  tracking_number?: string;
  delivery_cost?: number;
  notes?: string;
}

interface PayslipDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  delivery?: PayslipDelivery | null;
  employeeId?: number;
}

export default function PayslipDeliveryModal({
  isOpen,
  onClose,
  onSuccess,
  delivery = null,
  employeeId
}: PayslipDeliveryModalProps) {
  const [formData, setFormData] = useState<PayslipDelivery>({
    employee_id: employeeId || 0,
    payslip_period: '',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_method: 'email',
    delivery_status: 'pending',
    recipient_email: '',
    recipient_phone: '',
    delivery_notes: '',
    acknowledgment_date: '',
    is_confidential: true,
    tracking_number: '',
    delivery_cost: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (delivery) {
      setFormData({
        employee_id: delivery.employee_id,
        payslip_period: delivery.payslip_period,
        delivery_date: delivery.delivery_date,
        delivery_method: delivery.delivery_method,
        delivery_status: delivery.delivery_status,
        recipient_email: delivery.recipient_email || '',
        recipient_phone: delivery.recipient_phone || '',
        delivery_notes: delivery.delivery_notes || '',
        acknowledgment_date: delivery.acknowledgment_date || '',
        is_confidential: delivery.is_confidential,
        tracking_number: delivery.tracking_number || '',
        delivery_cost: delivery.delivery_cost || 0,
        notes: delivery.notes || ''
      });
    } else {
      setFormData({
        employee_id: employeeId || 0,
        payslip_period: '',
        delivery_date: new Date().toISOString().split('T')[0],
        delivery_method: 'email',
        delivery_status: 'pending',
        recipient_email: '',
        recipient_phone: '',
        delivery_notes: '',
        acknowledgment_date: '',
        is_confidential: true,
        tracking_number: '',
        delivery_cost: 0,
        notes: ''
      });
    }
    setErrors({});
  }, [delivery, employeeId, isOpen]);

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

    if (!formData.payslip_period.trim()) {
      newErrors.payslip_period = 'Payslip period is required';
    }

    if (!formData.delivery_date) {
      newErrors.delivery_date = 'Delivery date is required';
    }

    if (formData.delivery_method === 'email' && !formData.recipient_email?.trim()) {
      newErrors.recipient_email = 'Recipient email is required for email delivery';
    }

    if (formData.delivery_method === 'sms' && !formData.recipient_phone?.trim()) {
      newErrors.recipient_phone = 'Recipient phone is required for SMS delivery';
    }

    if (formData.delivery_cost && formData.delivery_cost < 0) {
      newErrors.delivery_cost = 'Delivery cost cannot be negative';
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
      console.log('Submitting payslip delivery:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving payslip delivery:', error);
      alert(`Error saving payslip delivery: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'sent': return 'text-blue-600';
      case 'delivered': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'acknowledged': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'email': return 'text-blue-600';
      case 'physical': return 'text-green-600';
      case 'portal': return 'text-purple-600';
      case 'sms': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {delivery ? 'Edit Payslip Delivery' : 'Add Payslip Delivery'}
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
          {/* Payslip Period and Delivery Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payslip Period *
              </label>
              <input
                type="text"
                name="payslip_period"
                value={formData.payslip_period}
                onChange={handleInputChange}
                placeholder="e.g., January 2024, Q1 2024, December 2024"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.payslip_period ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.payslip_period && <p className="text-red-500 text-xs mt-1">{errors.payslip_period}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date *
              </label>
              <input
                type="date"
                name="delivery_date"
                value={formData.delivery_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.delivery_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.delivery_date && <p className="text-red-500 text-xs mt-1">{errors.delivery_date}</p>}
            </div>
          </div>

          {/* Delivery Method and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Method *
              </label>
              <select
                name="delivery_method"
                value={formData.delivery_method}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="email">Email</option>
                <option value="physical">Physical Copy</option>
                <option value="portal">Employee Portal</option>
                <option value="sms">SMS Notification</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Status *
              </label>
              <select
                name="delivery_status"
                value={formData.delivery_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="acknowledged">Acknowledged</option>
              </select>
            </div>
          </div>

          {/* Recipient Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                name="recipient_email"
                value={formData.recipient_email}
                onChange={handleInputChange}
                placeholder="employee@company.com"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.recipient_email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.recipient_email && <p className="text-red-500 text-xs mt-1">{errors.recipient_email}</p>}
              <p className="text-xs text-gray-500 mt-1">Required for email delivery method</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Phone
              </label>
              <input
                type="tel"
                name="recipient_phone"
                value={formData.recipient_phone}
                onChange={handleInputChange}
                placeholder="+256 700 000 000"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.recipient_phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.recipient_phone && <p className="text-red-500 text-xs mt-1">{errors.recipient_phone}</p>}
              <p className="text-xs text-gray-500 mt-1">Required for SMS delivery method</p>
            </div>
          </div>

          {/* Tracking and Cost */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                name="tracking_number"
                value={formData.tracking_number}
                onChange={handleInputChange}
                placeholder="e.g., TRK123456789, EMS123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">For physical delivery tracking</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Cost (UGX)
              </label>
              <input
                type="number"
                name="delivery_cost"
                value={formData.delivery_cost}
                onChange={handleInputChange}
                step="100"
                min="0"
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.delivery_cost ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.delivery_cost && <p className="text-red-500 text-xs mt-1">{errors.delivery_cost}</p>}
              <p className="text-xs text-gray-500 mt-1">Cost for physical delivery or courier services</p>
            </div>
          </div>

          {/* Acknowledgment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Acknowledgment Date
            </label>
            <input
              type="date"
              name="acknowledgment_date"
              value={formData.acknowledgment_date}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">When employee acknowledges receipt</p>
          </div>

          {/* Confidentiality and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_confidential"
                checked={formData.is_confidential}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Confidential Delivery</label>
              <p className="ml-2 text-xs text-gray-500">(Mark as confidential for sensitive information)</p>
            </div>
          </div>

          {/* Delivery Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Notes
            </label>
            <textarea
              name="delivery_notes"
              value={formData.delivery_notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Special delivery instructions, recipient preferences, or delivery requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* General Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional information about the delivery process, issues encountered, or special circumstances..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Delivery Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Delivery Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Method: </span>
                <span className={`font-medium ${getMethodColor(formData.delivery_method)}`}>
                  {formData.delivery_method.charAt(0).toUpperCase() + formData.delivery_method.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status: </span>
                <span className={`font-medium ${getStatusColor(formData.delivery_status)}`}>
                  {formData.delivery_status.charAt(0).toUpperCase() + formData.delivery_status.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Confidential: </span>
                <span className={`font-medium ${formData.is_confidential ? 'text-red-600' : 'text-green-600'}`}>
                  {formData.is_confidential ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Cost: </span>
                <span className="font-medium text-gray-900">
                  UGX {formData.delivery_cost?.toLocaleString() || '0'}
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
              {delivery ? 'Update Delivery' : 'Add Delivery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 