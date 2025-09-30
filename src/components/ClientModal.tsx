'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import {
  useCrmContacts,
  useContactTypes,
  useCreateContact,
  useUpdateContact,
  useDeleteContact
} from '../hooks/useApi';

interface Client {
  id?: number;
  contact_type_id: number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  company?: string;
  notes?: string;
  is_active: boolean;
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientSelect?: (client: any) => void;
}

export default function ClientModal({ isOpen, onClose, onClientSelect }: ClientModalProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Client>({
    contact_type_id: 0, // Will be set when contact types load
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
    is_active: true
  });
  const [errors, setErrors] = useState<any>({});

  // API hooks
  const { data: contactsData, isLoading, error, refetch } = useCrmContacts();
  const { data: contactTypesData } = useContactTypes();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();

  const contacts = (contactsData as any)?.data?.data || (contactsData as any)?.data || [];
  const contactTypes = (contactTypesData as any)?.data || [];

  useEffect(() => {
    if (editingClient) {
      setFormData({
        contact_type_id: editingClient.contact_type_id || 1,
        name: editingClient.name,
        email: editingClient.email,
        phone: editingClient.phone,
        address: editingClient.address || '',
        company: editingClient.company || '',
        notes: editingClient.notes || '',
        is_active: editingClient.is_active
      });
      setIsFormOpen(true);
    }
  }, [editingClient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const newErrors: any = {};
    if (!formData.contact_type_id) newErrors.contact_type_id = 'Contact type is required';
    if (!formData.name) newErrors.name = 'Client name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone) newErrors.phone = 'Phone number is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const clientData = {
        ...formData,
        // Only include required fields based on the API structure
      };

      if (editingClient) {
        await updateContactMutation.mutateAsync({ 
          id: editingClient.id!, 
          data: clientData 
        });
        console.log('Client updated successfully!');
      } else {
        await createContactMutation.mutateAsync(clientData);
        console.log('Client created successfully!');
      }
      
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Error saving client:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  const handleDelete = async (client: any) => {
    if (window.confirm(`Are you sure you want to delete "${client.name}"? This action cannot be undone.`)) {
      try {
        await deleteContactMutation.mutateAsync(client.id);
        console.log('Client deleted successfully!');
        refetch();
      } catch (error: any) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. It may be in use by existing projects.');
      }
    }
  };

  const resetForm = () => {
    const defaultTypeId = contactTypes.length > 0 ? contactTypes[0].id : 0;
    setFormData({
      contact_type_id: defaultTypeId,
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: '',
      is_active: true
    });
    setEditingClient(null);
    setIsFormOpen(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked 
        : name === 'contact_type_id' ? parseInt(value) || 0 
        : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-8 transform transition-all duration-300 ease-in-out">
          <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Manage Clients</h3>
              <button
                type="button"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {!isFormOpen && (
              <div className="mb-6">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-transform transform hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New Client
                </button>
              </div>
            )}

            {isFormOpen && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingClient ? 'Edit Client' : 'Add New Client'}
                </h4>
                {errors.general && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Contact Type *</label>
                      <select
                        name="contact_type_id"
                        value={formData.contact_type_id}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.contact_type_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                      >
                        <option value="">Select contact type...</option>
                        {contactTypes.map((type: any) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      {errors.contact_type_id && <p className="mt-1 text-sm text-red-600">{errors.contact_type_id}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        placeholder="e.g., John Doe"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g., Tech Solutions Ltd"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        placeholder="e.g., john@company.com"
                      />
                      {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        placeholder="e.g., +256701234567"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Client's physical address..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Additional notes about this client..."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createContactMutation.isPending || updateContactMutation.isPending}
                      className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {createContactMutation.isPending || updateContactMutation.isPending 
                        ? 'Saving...' 
                        : editingClient ? 'Update' : 'Create'
                      }
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Existing Clients</h4>
              {isLoading ? (
                <div className="text-center py-4"><span className="loader"></span></div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">Error loading clients.</div>
              ) : contacts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No clients found.</div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {contacts.map((client: any) => (
                      <li key={client.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4 flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="text-sm font-semibold text-gray-900">{client.name}</h5>
                                  {client.company && <p className="text-sm text-gray-600">{client.company}</p>}
                                  <p className="text-sm text-gray-500">{client.email}</p>
                                  <p className="text-sm text-gray-500">{client.phone}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    client.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {client.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-2">
                            {onClientSelect && (
                              <button
                                onClick={() => { onClientSelect(client); onClose(); }}
                                className="text-sm text-indigo-600 hover:underline"
                              >
                                Select
                              </button>
                            )}
                            <button
                              onClick={() => setEditingClient(client)}
                              className="text-sm text-gray-600 hover:underline"
                            >
                              <PencilIcon className="h-4 w-4 mr-1 inline" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(client)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              <TrashIcon className="h-4 w-4 mr-1 inline" /> Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white rounded-b-2xl z-10 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
