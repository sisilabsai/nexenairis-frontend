'use client';

import React, { useState, useEffect } from 'react';
import {
  useContactTypes,
  useCreateContactType,
  useUpdateContactType,
  useDeleteContactType,
  useInitializeDefaultContactTypes
} from '../hooks/useApi';

interface ContactType {
  id?: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
}

interface ContactTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactTypeModal({ isOpen, onClose }: ContactTypeModalProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingType, setEditingType] = useState<ContactType | null>(null);
  const [formData, setFormData] = useState<ContactType>({
    name: '',
    code: '',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState<any>({});

  // API hooks
  const { data: contactTypesData, isLoading, error, refetch } = useContactTypes();
  const createTypeMutation = useCreateContactType();
  const updateTypeMutation = useUpdateContactType();
  const deleteTypeMutation = useDeleteContactType();
  const initializeDefaultsMutation = useInitializeDefaultContactTypes();

  const contactTypes = (contactTypesData as any)?.data || [];

  useEffect(() => {
    if (editingType) {
      setFormData({
        name: editingType.name,
        code: editingType.code,
        description: editingType.description || '',
        is_active: editingType.is_active
      });
      setIsFormOpen(true);
    }
  }, [editingType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.code) newErrors.code = 'Code is required';
    if (formData.code && !/^[a-zA-Z0-9_-]+$/.test(formData.code)) {
      newErrors.code = 'Code can only contain letters, numbers, hyphens, and underscores';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingType) {
        await updateTypeMutation.mutateAsync({
          id: editingType.id!,
          data: formData
        });
      } else {
        await createTypeMutation.mutateAsync(formData);
      }
      resetForm();
    } catch (error: any) {
      console.error('Error saving contact type:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Failed to save contact type' });
      }
    }
  };

  const handleEdit = (contactType: ContactType) => {
    setEditingType(contactType);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteTypeMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete contact type. It may be in use by existing contacts.');
      }
    }
  };

  const handleInitializeDefaults = async () => {
    if (window.confirm('This will create default contact types (Customer, Lead, Vendor, Partner, Distributor) if they don\'t already exist. Continue?')) {
      try {
        await initializeDefaultsMutation.mutateAsync();
        alert('Default contact types initialized successfully!');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to initialize default contact types');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true
    });
    setEditingType(null);
    setIsFormOpen(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <span style={{ position: 'absolute', left: '-9999px' }}>Hidden for centering</span>
        <div className="relative">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Contact Type Management
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {!isFormOpen ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Add Contact Type
                    </button>
                    <button
                      onClick={handleInitializeDefaults}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                      disabled={initializeDefaultsMutation.isPending}
                    >
                      {initializeDefaultsMutation.isPending ? 'Creating...' : 'Initialize Defaults'}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => refetch()}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">Failed to load contact types</p>
                    <button
                      onClick={() => refetch()}
                      className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Retry
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contactTypes.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500 mb-4">No contact types found</p>
                        <button
                          onClick={handleInitializeDefaults}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                          disabled={initializeDefaultsMutation.isPending}
                        >
                          {initializeDefaultsMutation.isPending ? 'Creating...' : 'Create Default Types'}
                        </button>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {contactTypes.map((type: any) => (
                              <tr key={type.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{type.name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {type.code}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-500">{type.description || 'No description'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    type.is_active 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {type.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEdit(type)}
                                      className="text-indigo-600 hover:text-indigo-900"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(type.id, type.name)}
                                      className="text-red-600 hover:text-red-900"
                                      disabled={deleteTypeMutation.isPending}
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingType ? 'Edit Contact Type' : 'Add New Contact Type'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {errors.general && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-600">{errors.general}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Customer, Lead, Vendor"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Code *</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.code ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., customer, lead, vendor"
                      />
                      {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Brief description of this contact type..."
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createTypeMutation.isPending || updateTypeMutation.isPending}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      {createTypeMutation.isPending || updateTypeMutation.isPending
                        ? 'Saving...'
                        : editingType
                        ? 'Update'
                        : 'Create'
                      }
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


