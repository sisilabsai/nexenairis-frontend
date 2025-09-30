'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useCreateSupplier, useUpdateSupplier, useNextSupplierCode } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';

interface Supplier {
  id: number;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  payment_terms: 'net_30' | 'net_60' | 'net_90' | 'immediate';
  credit_limit: number;
  notes?: string;
}

interface SupplierModalProps {
  supplier?: Supplier | null;
  onClose: () => void;
}

export default function SupplierModal({ supplier, onClose }: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postal_code: '',
    tax_id: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
    payment_terms: 'net_30' as 'net_30' | 'net_60' | 'net_90' | 'immediate',
    credit_limit: 0,
    notes: ''
  });

  const createSupplierMutation = useCreateSupplier();
  const updateSupplierMutation = useUpdateSupplier();
  const { data: nextCodeData, isLoading: nextCodeLoading } = useNextSupplierCode();

  const isEditing = !!supplier;
  const isLoading = createSupplierMutation.isPending || updateSupplierMutation.isPending;
  
  // Safely extract the next code from the API response
  const safeExtractNextCode = (data: any, fallback: string = ''): string => {
    if (!data) return fallback;
    
    if (typeof data === 'object' && data.data && data.data.next_code) {
      return data.data.next_code;
    }
    
    return fallback;
  };
  
  const nextCode = safeExtractNextCode(nextCodeData);

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        mobile: supplier.mobile || '',
        website: supplier.website || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        country: supplier.country || '',
        postal_code: supplier.postal_code || '',
        tax_id: supplier.tax_id || '',
        status: supplier.status,
        payment_terms: supplier.payment_terms,
        credit_limit: supplier.credit_limit || 0,
        notes: supplier.notes || ''
      });
    }
  }, [supplier]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditing && supplier) {
        await updateSupplierMutation.mutateAsync({
          id: supplier.id,
          ...formData
        });
      } else {
        await createSupplierMutation.mutateAsync(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save supplier:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isEditing ? 'Supplier Code' : 'Auto-Generated Code'}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={supplier?.code || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
              ) : (
                <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-blue-50 text-blue-900 font-mono flex items-center">
                  {nextCodeLoading ? (
                    <div className="flex items-center">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-sm">Generating...</span>
                    </div>
                  ) : nextCode ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold">{nextCode}</span>
                      <InformationCircleIcon 
                        className="h-4 w-4 text-blue-500" 
                        title="This code will be automatically assigned"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">Code will be auto-generated</span>
                  )}
                </div>
              )}
              {!isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Code will be automatically generated when you create the supplier
                </p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Address Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State/Province
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Business Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax ID
              </label>
              <input
                type="text"
                name="tax_id"
                value={formData.tax_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Business Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Terms *
              </label>
              <select
                name="payment_terms"
                value={formData.payment_terms}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="net_30">Net 30</option>
                <option value="net_60">Net 60</option>
                <option value="net_90">Net 90</option>
                <option value="immediate">Immediate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credit Limit (UGX)
              </label>
              <input
                type="number"
                name="credit_limit"
                value={formData.credit_limit}
                onChange={handleInputChange}
                min="0"
                step="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Additional notes about the supplier..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : isEditing ? (
                'Update Supplier'
              ) : (
                'Create Supplier'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


