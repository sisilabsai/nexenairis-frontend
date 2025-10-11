'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  DocumentTextIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  FireIcon,
  BoltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { PipelineApiService } from '../../services/PipelineApiService';
import { useContacts, useAuth, useUsers, useSalesPipelineStages } from '../../hooks/useApi';

interface EditDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: any;
  onDealUpdated: (deal: any) => void;
}

interface DealFormData {
  title: string;
  contact_id: number | null;
  expected_value: number;
  currency: string;
  probability: number;
  expected_close_date: string;
  sales_pipeline_stage_id: number | null;
  assigned_to: number | null;
  source: string;
  description: string;
  notes: string;
}

const EditDealModal: React.FC<EditDealModalProps> = ({
  isOpen,
  onClose,
  deal,
  onDealUpdated,
}) => {
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    contact_id: null,
    expected_value: 0,
    currency: 'UGX',
    probability: 50,
    expected_close_date: '',
    sales_pipeline_stage_id: null,
    assigned_to: null,
    source: '',
    description: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactSearch, setContactSearch] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Fetch data
  const { data: contactsData } = useContacts();
  const { data: usersData } = useUsers();
  const { data: stagesData } = useSalesPipelineStages();
  const { me } = useAuth();
  const currentUser = me?.data as any;

  // Populate form when deal changes
  useEffect(() => {
    if (isOpen && deal) {
      setFormData({
        title: deal.title || '',
        contact_id: deal.contact_id || null,
        expected_value: parseFloat(deal.expected_value) || 0,
        currency: deal.currency || 'UGX',
        probability: parseFloat(deal.probability) || 50,
        expected_close_date: deal.expected_close_date?.split('T')[0] || '',
        sales_pipeline_stage_id: deal.sales_pipeline_stage_id || null,
        assigned_to: deal.assigned_to?.id || deal.assigned_to || null,
        source: deal.source || '',
        description: deal.description || '',
        notes: deal.notes || '',
      });
      
      // Set selected contact
      if (deal.contact) {
        setSelectedContact(deal.contact);
        setContactSearch(deal.contact.name);
      }
      
      // Set selected user
      if (deal.assigned_to) {
        const user = typeof deal.assigned_to === 'object' ? deal.assigned_to : null;
        if (user) {
          setSelectedUser(user);
          setUserSearch(user.name);
        }
      }
      
      setErrors({});
    }
  }, [isOpen, deal]);

  const contacts = (contactsData as any)?.data || [];
  const users = (usersData as any)?.data || [];
  const stages = (stagesData as any)?.data || [];

  const filteredContacts = contacts.filter((contact: any) =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const filteredUsers = users.filter((user: any) =>
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData = {
        ...formData,
        contact_id: selectedContact?.id || formData.contact_id,
        assigned_to: selectedUser?.id || formData.assigned_to,
      };

      const response = await PipelineApiService.updateDeal(deal.id, updateData);
      
      console.log('✅ SUCCESS: Deal updated successfully!', response);
      
      // Extract the updated deal data
      const updatedDeal = (response as any).data || response;
      
      // Notify parent component
      onDealUpdated(updatedDeal);
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      console.error('❌ ERROR: Failed to update deal:', error);
      
      if (error.response?.data?.errors) {
        const validationErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(field => {
          validationErrors[field] = error.response.data.errors[field][0];
        });
        setErrors(validationErrors);
      } else {
        setErrors({ submit: 'Failed to update deal. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatUGX = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Edit Deal</h2>
                        <p className="text-indigo-100 text-sm">Update deal information</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="space-y-6">
                    {/* Deal Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deal Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Website Redesign Project"
                        required
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Contact Selection */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <input
                          type="text"
                          value={contactSearch}
                          onChange={(e) => {
                            setContactSearch(e.target.value);
                            setShowContactDropdown(true);
                          }}
                          onFocus={() => setShowContactDropdown(true)}
                          className="w-full pl-10 pr-4 py-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-indigo-50"
                          placeholder="Search contacts..."
                        />
                        {selectedContact && (
                          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                            <CheckIcon className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                      </div>
                      
                      {showContactDropdown && filteredContacts.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {filteredContacts.slice(0, 10).map((contact: any) => (
                            <button
                              key={contact.id}
                              type="button"
                              onClick={() => {
                                setSelectedContact(contact);
                                setContactSearch(contact.name);
                                setFormData({ ...formData, contact_id: contact.id });
                                setShowContactDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors flex items-center space-x-3"
                            >
                              <UserIcon className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{contact.name}</p>
                                {contact.email && (
                                  <p className="text-sm text-gray-500">{contact.email}</p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.contact_id && <p className="mt-1 text-sm text-red-600">{errors.contact_id}</p>}
                    </div>

                    {/* Value and Currency */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expected Value *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                          </div>
                          <input
                            type="number"
                            value={formData.expected_value}
                            onChange={(e) => setFormData({ ...formData, expected_value: parseFloat(e.target.value) || 0 })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="0"
                            required
                          />
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{formatUGX(formData.expected_value)}</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Probability %
                        </label>
                        <input
                          type="number"
                          value={formData.probability}
                          onChange={(e) => setFormData({ ...formData, probability: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max="100"
                          required
                        />
                      </div>
                    </div>

                    {/* Pipeline Stage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pipeline Stage *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <ChartBarIcon className="h-5 w-5 text-purple-500" />
                        </div>
                        <select
                          value={formData.sales_pipeline_stage_id || ''}
                          onChange={(e) => setFormData({ ...formData, sales_pipeline_stage_id: parseInt(e.target.value) })}
                          className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50 appearance-none"
                          required
                        >
                          <option value="">Select stage...</option>
                          {stages.map((stage: any) => (
                            <option key={stage.id} value={stage.id}>
                              {stage.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Assigned To */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assigned To
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-green-500" />
                        </div>
                        <input
                          type="text"
                          value={userSearch}
                          onChange={(e) => {
                            setUserSearch(e.target.value);
                            setShowUserDropdown(true);
                          }}
                          onFocus={() => setShowUserDropdown(true)}
                          className="w-full pl-10 pr-4 py-3 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-green-50"
                          placeholder="Search users..."
                        />
                      </div>
                      
                      {showUserDropdown && filteredUsers.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {filteredUsers.slice(0, 10).map((user: any) => (
                            <button
                              key={user.id}
                              type="button"
                              onClick={() => {
                                setSelectedUser(user);
                                setUserSearch(user.name);
                                setFormData({ ...formData, assigned_to: user.id });
                                setShowUserDropdown(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-green-50 transition-colors flex items-center space-x-3"
                            >
                              <UserIcon className="w-5 h-5 text-gray-400" />
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Expected Close Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Close Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-blue-500" />
                        </div>
                        <input
                          type="date"
                          value={formData.expected_close_date}
                          onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Source
                      </label>
                      <select
                        value={formData.source}
                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select source...</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Email Campaign">Email Campaign</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Event">Event</option>
                        <option value="Partner">Partner</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Describe the opportunity..."
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Additional notes..."
                      />
                    </div>

                    {/* Error Message */}
                    {errors.submit && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex items-center justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon className="w-5 h-5" />
                          <span>Update Deal</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditDealModal;
