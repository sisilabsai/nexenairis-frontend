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
} from '@heroicons/react/24/outline';
import { PipelineApiService } from '../../services/PipelineApiService';
import { crmApi } from '../../lib/api';

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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTag, setCurrentTag] = useState('');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
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
      });
      setErrors({});
    }
  }, [isOpen]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required';
    }

    if (!formData.contact_name.trim()) {
      newErrors.contact_name = 'Contact name is required';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Contact email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Please enter a valid email address';
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
      // Step 1: Create or find the contact first (required by backend)
      let contactId = formData.contact_id;
      
      if (!contactId) {
        // Create a new contact with the provided information
        try {
          const contactResponse: any = await crmApi.createContact({
            name: formData.contact_name,
            email: formData.contact_email,
            phone: formData.contact_phone,
            company: formData.company || null,
            contact_type_id: 1, // Default to first contact type (you might want to make this configurable)
            status: 'active',
          });
          
          contactId = contactResponse.data?.id || contactResponse?.id;
        } catch (contactError: any) {
          console.error('Failed to create contact:', contactError);
          setErrors({ submit: 'Failed to create contact. Please try again.' });
          setIsSubmitting(false);
          return;
        }
      }

      // Step 2: Create the deal with the contact_id and all required fields
      const dealData = {
        title: formData.title,
        contact_id: contactId, // Required by backend
        description: formData.description || null,
        expected_value: Number(formData.expected_value),
        currency: formData.currency || 'UGX', // Required by backend
        probability: Number(formData.probability),
        expected_close_date: formData.expected_close_date,
        sales_pipeline_stage_id: Number(stageId), // Required by backend
        source: formData.source || null,
        notes: formData.tags.length > 0 ? `Tags: ${formData.tags.join(', ')}` : null,
        assigned_to: null, // You might want to add user selection later
      };

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

                    {/* Contact Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <UserIcon className="w-4 h-4 inline mr-1" />
                        Contact Name *
                      </label>
                      <input
                        type="text"
                        value={formData.contact_name}
                        onChange={(e) => handleInputChange('contact_name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.contact_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.contact_name && <p className="mt-1 text-sm text-red-600">{errors.contact_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="ABC Corporation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                        Contact Email *
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => handleInputChange('contact_email', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                          errors.contact_email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="john@company.com"
                      />
                      {errors.contact_email && <p className="mt-1 text-sm text-red-600">{errors.contact_email}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <PhoneIcon className="w-4 h-4 inline mr-1" />
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="+256 700 000 000"
                      />
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