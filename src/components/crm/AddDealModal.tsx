'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  TagIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  FireIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { PipelineApiService } from '../../services/PipelineApiService';
import { crmApi } from '../../lib/api';
import { useContacts, useAuth, useUsers } from '../../hooks/useApi';

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  stageId: number;
  onDealAdded: (deal: any) => void;
}

interface DealFormData {
  title: string;
  contact_id: number | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  company: string;
  expected_value: number;
  currency: string;
  probability: number;
  expected_close_date: string;
  priority: 'low' | 'medium' | 'high';
  deal_temperature: 'cold' | 'warm' | 'hot';
  description: string;
  tags: string[];
  source: string;
  assigned_to: number | null;
}

const AddDealModal: React.FC<AddDealModalProps> = ({ 
  isOpen, 
  onClose, 
  stageId, 
  onDealAdded 
}) => {
  const [formData, setFormData] = useState<DealFormData>({
    title: '',
    contact_id: null,
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    company: '',
    expected_value: 0,
    currency: 'UGX',
    probability: 50,
    expected_close_date: '',
    priority: 'medium',
    deal_temperature: 'warm',
    description: '',
    tags: [],
    source: '',
    assigned_to: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showContactDropdown, setShowContactDropdown] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Fetch contacts for dropdown
  const { data: contactsData, isLoading: contactsLoading } = useContacts();
  
  // Fetch users for assignment dropdown
  const { data: usersData, isLoading: usersLoading } = useUsers();
  
  // Get current user for default assignment
  const { me } = useAuth();
  const currentUser = me?.data as any;

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      // Default assigned_to to current user
      const defaultUserId = currentUser?.user?.id || currentUser?.id || null;
      
      setFormData({
        title: '',
        contact_id: null,
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        company: '',
        expected_value: 0,
        currency: 'UGX',
        probability: 50,
        expected_close_date: '',
        priority: 'medium',
        deal_temperature: 'warm',
        description: '',
        tags: [],
        source: '',
        assigned_to: defaultUserId,
      });
      setErrors({});
      setSelectedContact(null);
      setContactSearch('');
      setShowContactDropdown(false);
      setSelectedUser(currentUser?.user || currentUser || null);
      setUserSearch('');
      setShowUserDropdown(false);
    }
  }, [isOpen, currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.contact-dropdown-container')) {
        setShowContactDropdown(false);
      }
      if (!target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    if (showContactDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showContactDropdown, showUserDropdown]);

  const handleInputChange = (field: keyof DealFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Filter contacts based on search
  const filteredContacts = React.useMemo(() => {
    if (!contactsData?.data?.data) return [];
    const contacts = Array.isArray(contactsData.data.data) ? contactsData.data.data : [];
    
    if (!contactSearch.trim()) return contacts.slice(0, 10); // Show first 10 if no search
    
    const searchLower = contactSearch.toLowerCase();
    return contacts.filter((contact: any) => 
      contact.name?.toLowerCase().includes(searchLower) ||
      contact.email?.toLowerCase().includes(searchLower) ||
      contact.phone?.includes(contactSearch) ||
      contact.company?.toLowerCase().includes(searchLower)
    ).slice(0, 10);
  }, [contactsData, contactSearch]);

  // Filter users based on search
  const filteredUsers = React.useMemo(() => {
    if (!usersData?.data) return [];
    const users = Array.isArray(usersData.data) ? usersData.data : [];
    
    if (!userSearch.trim()) return users.slice(0, 10); // Show first 10 if no search
    
    const searchLower = userSearch.toLowerCase();
    return users.filter((user: any) => 
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    ).slice(0, 10);
  }, [usersData, userSearch]);

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    setFormData(prev => ({
      ...prev,
      contact_id: contact.id,
      contact_name: contact.name,
      contact_email: contact.email || '',
      contact_phone: contact.phone || '',
      company: contact.company || '',
    }));
    setShowContactDropdown(false);
    setContactSearch('');
    if (errors.contact_id) {
      setErrors(prev => ({ ...prev, contact_id: '' }));
    }
  };

  const handleUserSelect = (user: any) => {
    setSelectedUser(user);
    setFormData(prev => ({
      ...prev,
      assigned_to: user.id,
    }));
    setShowUserDropdown(false);
    setUserSearch('');
    if (errors.assigned_to) {
      setErrors(prev => ({ ...prev, assigned_to: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

    if (!formData.contact_id) {
      newErrors.contact_id = 'Please select a contact';
    }

    if (formData.expected_value <= 0) {
      newErrors.expected_value = 'Deal value must be greater than 0';
    }

    if (!formData.expected_close_date) {
      newErrors.expected_close_date = 'Expected close date is required';
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
      // Create the deal with all required fields
      const dealData = {
        title: formData.title,
        contact_id: formData.contact_id!, // Required by backend - validated above
        description: formData.description || null,
        expected_value: Number(formData.expected_value),
        currency: formData.currency || 'UGX', // Required by backend
        probability: Number(formData.probability),
        expected_close_date: formData.expected_close_date,
        sales_pipeline_stage_id: Number(stageId), // Required by backend
        source: formData.source || null,
        notes: formData.tags.length > 0 ? `Tags: ${formData.tags.join(', ')}` : null,
        assigned_to: formData.assigned_to || currentUser?.user?.id || currentUser?.id || null, // Backend will default to current user if null
      };

      console.log('Creating deal with data:', dealData); // Debug log

      const response = await PipelineApiService.createDeal(dealData);
      
      // Notify parent component
      onDealAdded(response);
      
      // Close modal
      onClose();
      
      // Could show success toast here
      console.log('Deal created successfully:', response);
      
    } catch (error: any) {
      console.error('Failed to create deal:', error);
      
      // Handle 422 validation errors specifically
      if (error.message && error.message.includes('422')) {
        setErrors({ submit: 'Please check your input fields. Some required fields may be missing or invalid.' });
      } else if (error.response && error.response.data && error.response.data.errors) {
        // Handle Laravel validation errors
        const validationErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(field => {
          validationErrors[field] = error.response.data.errors[field][0];
        });
        setErrors(validationErrors);
      } else {
        setErrors({ submit: 'Failed to create deal. Please try again.' });
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

  const temperatureColors = {
    cold: 'from-blue-500 to-blue-600',
    warm: 'from-orange-500 to-orange-600',
    hot: 'from-red-500 to-red-600',
  };

  const priorityColors = {
    low: 'from-gray-500 to-gray-600',
    medium: 'from-yellow-500 to-yellow-600',
    high: 'from-red-500 to-red-600',
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
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Add New Deal</h2>
                        <p className="text-indigo-100">Create a new opportunity in your pipeline</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                  {errors.submit && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {errors.submit}
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Deal Title */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deal Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.title ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="e.g., Website Redesign for ABC Corp"
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>

                    {/* Contact Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-1" />
                        Select Contact *
                      </label>
                      
                      {selectedContact ? (
                        <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {selectedContact.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{selectedContact.name}</p>
                              <p className="text-sm text-gray-600">
                                {selectedContact.email || selectedContact.phone || 'No contact info'}
                              </p>
                              {selectedContact.company && (
                                <p className="text-xs text-gray-500">{selectedContact.company}</p>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContact(null);
                              setFormData(prev => ({ ...prev, contact_id: null, contact_name: '', contact_email: '', contact_phone: '', company: '' }));
                              setShowContactDropdown(true);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="relative contact-dropdown-container">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={contactSearch}
                              onChange={(e) => {
                                setContactSearch(e.target.value);
                                setShowContactDropdown(true);
                              }}
                              onFocus={() => setShowContactDropdown(true)}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                errors.contact_id ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Search contacts by name, email, phone..."
                            />
                          </div>
                          
                          {showContactDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {contactsLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading contacts...</div>
                              ) : filteredContacts.length > 0 ? (
                                <ul className="py-1">
                                  {filteredContacts.map((contact: any) => (
                                    <li
                                      key={contact.id}
                                      onClick={() => handleContactSelect(contact)}
                                      className="px-4 py-2 hover:bg-indigo-50 cursor-pointer transition-colors"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <span className="text-indigo-600 font-semibold text-xs">
                                              {contact.name?.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 truncate">{contact.name}</p>
                                          <p className="text-sm text-gray-500 truncate">
                                            {contact.email || contact.phone || 'No contact info'}
                                          </p>
                                          {contact.company && (
                                            <p className="text-xs text-gray-400 truncate">{contact.company}</p>
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-gray-500 mb-2">No contacts found</p>
                                  <p className="text-xs text-gray-400">
                                    {contactSearch ? 'Try a different search term' : 'Start typing to search'}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {errors.contact_id && <p className="mt-1 text-sm text-red-600">{errors.contact_id}</p>}
                    </div>

                    {/* Assign To User Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-1" />
                        Assign To *
                      </label>
                      
                      {selectedUser ? (
                        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {selectedUser.name?.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                              <p className="text-sm text-gray-600">{selectedUser.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(null);
                              setFormData(prev => ({ ...prev, assigned_to: null }));
                              setShowUserDropdown(true);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="relative user-dropdown-container">
                          <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type="text"
                              value={userSearch}
                              onChange={(e) => {
                                setUserSearch(e.target.value);
                                setShowUserDropdown(true);
                              }}
                              onFocus={() => setShowUserDropdown(true)}
                              className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                                errors.assigned_to ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="Search users by name or email..."
                            />
                          </div>
                          
                          {showUserDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {usersLoading ? (
                                <div className="p-4 text-center text-gray-500">Loading users...</div>
                              ) : filteredUsers.length > 0 ? (
                                <ul className="py-1">
                                  {filteredUsers.map((user: any) => (
                                    <li
                                      key={user.id}
                                      onClick={() => handleUserSelect(user)}
                                      className="px-4 py-2 hover:bg-green-50 cursor-pointer transition-colors"
                                    >
                                      <div className="flex items-center space-x-3">
                                        <div className="flex-shrink-0">
                                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                            <span className="text-green-600 font-semibold text-xs">
                                              {user.name?.charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-gray-900 truncate">{user.name}</p>
                                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                                        </div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-gray-500 mb-2">No users found</p>
                                  <p className="text-xs text-gray-400">
                                    {userSearch ? 'Try a different search term' : 'Start typing to search'}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      {errors.assigned_to && <p className="mt-1 text-sm text-red-600">{errors.assigned_to}</p>}
                    </div>

                    {/* Deal Value */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                        Deal Value (UGX) *
                      </label>
                      <input
                        type="number"
                        value={formData.expected_value}
                        onChange={(e) => handleInputChange('expected_value', Number(e.target.value))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.expected_value ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="5000000"
                        min="0"
                      />
                      {formData.expected_value > 0 && (
                        <p className="mt-1 text-sm text-gray-600">{formatUGX(formData.expected_value)}</p>
                      )}
                      {errors.expected_value && <p className="mt-1 text-sm text-red-600">{errors.expected_value}</p>}
                    </div>

                    {/* Probability */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Probability ({formData.probability}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => handleInputChange('probability', Number(e.target.value))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>

                    {/* Expected Close Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CalendarIcon className="w-4 h-4 inline mr-1" />
                        Expected Close Date *
                      </label>
                      <input
                        type="date"
                        value={formData.expected_close_date}
                        onChange={(e) => handleInputChange('expected_close_date', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.expected_close_date ? 'border-red-300' : 'border-gray-300'
                        }`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.expected_close_date && <p className="mt-1 text-sm text-red-600">{errors.expected_close_date}</p>}
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleInputChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>

                    {/* Deal Temperature */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <FireIcon className="w-4 h-4 inline mr-1" />
                        Deal Temperature
                      </label>
                      <select
                        value={formData.deal_temperature}
                        onChange={(e) => handleInputChange('deal_temperature', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="cold">Cold</option>
                        <option value="warm">Warm</option>
                        <option value="hot">Hot</option>
                      </select>
                    </div>

                    {/* Source */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lead Source
                      </label>
                      <input
                        type="text"
                        value={formData.source}
                        onChange={(e) => handleInputChange('source', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Website, Referral, Social Media, etc."
                      />
                    </div>

                    {/* Tags */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TagIcon className="w-4 h-4 inline mr-1" />
                        Tags
                      </label>
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={currentTag}
                          onChange={(e) => setCurrentTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Add a tag..."
                        />
                        <button
                          type="button"
                          onClick={addTag}
                          className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                          Add
                        </button>
                      </div>
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 w-4 h-4 text-indigo-600 hover:text-indigo-800"
                              >
                                <XMarkIcon className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <DocumentTextIcon className="w-4 h-4 inline mr-1" />
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="Additional details about this deal..."
                      />
                    </div>
                  </div>
                </form>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <SparklesIcon className="w-4 h-4" />
                          <span>Create Deal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddDealModal;