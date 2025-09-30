'use client';

import { useState, useEffect, useMemo } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateContact, useUpdateContact, useContactTypes } from '../hooks/useApi';

interface Contact {
  id?: number;
  contact_type_id: number;
  name: string;
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
  
  // African-specific fields
  mobile_money_provider?: string;
  mobile_money_number?: string;
  mobile_money_verified?: boolean;
  whatsapp_number?: string;
  whatsapp_business_verified?: boolean;
  preferred_communication_channel?: 'phone' | 'email' | 'whatsapp' | 'sms' | 'in_person';
  family_relationships?: string[];
  business_network?: string[];
  referred_by?: string;
  trust_level?: number;
  community_groups?: string[];
  group_role?: string;
  group_contribution_amount?: number;
  group_contribution_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  market_days?: string[];
  seasonal_patterns?: any[];
  primary_language?: string;
  languages_spoken?: string[];
  religion?: string;
  cultural_considerations?: any[];
  district?: string;
  sub_county?: string;
  parish?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  income_category?: 'low' | 'medium' | 'high' | 'variable';
  income_sources?: string[];
  has_bank_account?: boolean;
  bank_name?: string;
  bank_account_number?: string;
  prefers_cash_transactions?: boolean;
  customer_lifetime_value?: number;
  interaction_frequency?: string;
  purchase_patterns?: any[];
  special_requirements?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  marital_status?: string;
  number_of_dependents?: number;
  education_level?: string;
  occupation?: string;
}

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact?: Contact | null;
  onSuccess?: () => void;
}

export default function ContactModal({ isOpen, onClose, contact, onSuccess }: ContactModalProps) {
  const [activeTab, setActiveTab] = useState<'basic' | 'african' | 'location' | 'financial'>('basic');
  const [formData, setFormData] = useState<Contact>({
    contact_type_id: 0, // Will be set when contact types load
    name: '',
    email: '',
    phone: '',
    mobile: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: 'Uganda',
    postal_code: '',
    tax_id: '',
    
    // African-specific defaults
    preferred_communication_channel: 'phone',
    trust_level: 3,
    prefers_cash_transactions: true,
    has_bank_account: false,
    mobile_money_verified: false,
    whatsapp_business_verified: false,
  });

  const { data: contactTypesData } = useContactTypes();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();

  const contactTypes = useMemo(() => (contactTypesData as any)?.data || [], [contactTypesData]);

  useEffect(() => {
    if (contact) {
      setFormData(contact);
    } else {
      // Reset form for new contact
      const defaultTypeId = contactTypes.length > 0 ? contactTypes[0].id : 0;
      setFormData({
        contact_type_id: defaultTypeId,
        name: '',
        email: '',
        phone: '',
        mobile: '',
        website: '',
        address: '',
        city: '',
        state: '',
        country: 'Uganda',
        postal_code: '',
        tax_id: '',
        preferred_communication_channel: 'phone',
        trust_level: 3,
        prefers_cash_transactions: true,
        has_bank_account: false,
        mobile_money_verified: false,
        whatsapp_business_verified: false,
      });
    }
  }, [contact]); // Remove contactTypes from dependency array

  // Separate effect to update default contact type when contactTypes load
  useEffect(() => {
    if (!contact && contactTypes.length > 0 && formData.contact_type_id === 0) {
      setFormData(prev => ({
        ...prev,
        contact_type_id: contactTypes[0].id
      }));
    }
  }, [contactTypes, contact, formData.contact_type_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.contact_type_id) {
      alert('Please select a contact type');
      return;
    }
    
    if (!formData.name.trim()) {
      alert('Please enter a contact name');
      return;
    }
    
    try {
      const contactData = {
        ...formData,
        // Convert arrays to proper format
        family_relationships: formData.family_relationships || [],
        business_network: formData.business_network || [],
        community_groups: formData.community_groups || [],
        market_days: formData.market_days || [],
        seasonal_patterns: formData.seasonal_patterns || [],
        languages_spoken: formData.languages_spoken || [],
        cultural_considerations: formData.cultural_considerations || [],
        income_sources: formData.income_sources || [],
        purchase_patterns: formData.purchase_patterns || [],
      };

      if (contact?.id) {
        await updateContactMutation.mutateAsync({ id: contact.id, data: contactData });
      } else {
        await createContactMutation.mutateAsync(contactData);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Contact save failed:', error);
    }
  };

  const handleInputChange = (field: keyof Contact, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof Contact, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({
      ...prev,
      [field]: items
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
          aria-hidden="true" 
        />

        {/* This element is to trick the browser into centering the modal contents. */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
             role="dialog" 
             aria-modal="true" 
             aria-labelledby="modal-headline">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {contact ? 'Edit Contact' : 'Add New Contact'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'basic', label: 'Basic Info' },
                  { key: 'african', label: 'African Context' },
                  { key: 'location', label: 'Location' },
                  { key: 'financial', label: 'Financial' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info Tab */}
              {activeTab === 'basic' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Type *</label>
                    <select
                      required
                      value={formData.contact_type_id}
                      onChange={(e) => handleInputChange('contact_type_id', parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select contact type...</option>
                      {contactTypes.map((type: any) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile</label>
                    <input
                      type="tel"
                      value={formData.mobile || ''}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <input
                      type="url"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                    <input
                      type="text"
                      value={formData.tax_id || ''}
                      onChange={(e) => handleInputChange('tax_id', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* African Context Tab */}
              {activeTab === 'african' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Money Provider</label>
                    <select
                      value={formData.mobile_money_provider || ''}
                      onChange={(e) => handleInputChange('mobile_money_provider', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Provider</option>
                      <option value="MTN">MTN Money</option>
                      <option value="Airtel">Airtel Money</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mobile Money Number</label>
                    <input
                      type="tel"
                      value={formData.mobile_money_number || ''}
                      onChange={(e) => handleInputChange('mobile_money_number', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                    <input
                      type="tel"
                      value={formData.whatsapp_number || ''}
                      onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preferred Communication</label>
                    <select
                      value={formData.preferred_communication_channel || 'phone'}
                      onChange={(e) => handleInputChange('preferred_communication_channel', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="phone">Phone</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                      <option value="in_person">In Person</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trust Level (1-5)</label>
                    <select
                      value={formData.trust_level || 3}
                      onChange={(e) => handleInputChange('trust_level', parseInt(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={1}>1 - Very Low</option>
                      <option value={2}>2 - Low</option>
                      <option value={3}>3 - Medium</option>
                      <option value={4}>4 - High</option>
                      <option value={5}>5 - Very High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Primary Language</label>
                    <select
                      value={formData.primary_language || ''}
                      onChange={(e) => handleInputChange('primary_language', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Language</option>
                      <option value="English">English</option>
                      <option value="Luganda">Luganda</option>
                      <option value="Swahili">Swahili</option>
                      <option value="Lusoga">Lusoga</option>
                      <option value="Runyoro">Runyoro</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Community Groups (comma-separated)</label>
                    <input
                      type="text"
                      value={(formData.community_groups || []).join(', ')}
                      onChange={(e) => handleArrayChange('community_groups', e.target.value)}
                      placeholder="Chama, Cooperative, SACCO"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Group Role</label>
                    <input
                      type="text"
                      value={formData.group_role || ''}
                      onChange={(e) => handleInputChange('group_role', e.target.value)}
                      placeholder="Leader, Treasurer, Member"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Referred By</label>
                    <input
                      type="text"
                      value={formData.referred_by || ''}
                      onChange={(e) => handleInputChange('referred_by', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Occupation</label>
                    <input
                      type="text"
                      value={formData.occupation || ''}
                      onChange={(e) => handleInputChange('occupation', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      value={formData.country || 'Uganda'}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">State/Region</label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">District</label>
                    <input
                      type="text"
                      value={formData.district || ''}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sub-County</label>
                    <input
                      type="text"
                      value={formData.sub_county || ''}
                      onChange={(e) => handleInputChange('sub_county', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Parish</label>
                    <input
                      type="text"
                      value={formData.parish || ''}
                      onChange={(e) => handleInputChange('parish', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Village</label>
                    <input
                      type="text"
                      value={formData.village || ''}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Postal Code</label>
                    <input
                      type="text"
                      value={formData.postal_code || ''}
                      onChange={(e) => handleInputChange('postal_code', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Financial Tab */}
              {activeTab === 'financial' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Income Category</label>
                    <select
                      value={formData.income_category || ''}
                      onChange={(e) => handleInputChange('income_category', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select Category</option>
                      <option value="low">Low Income</option>
                      <option value="medium">Medium Income</option>
                      <option value="high">High Income</option>
                      <option value="variable">Variable Income</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Customer Lifetime Value (UGX)</label>
                    <input
                      type="number"
                      value={formData.customer_lifetime_value || ''}
                      onChange={(e) => handleInputChange('customer_lifetime_value', parseInt(e.target.value))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bank_name || ''}
                      onChange={(e) => handleInputChange('bank_name', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Account Number</label>
                    <input
                      type="text"
                      value={formData.bank_account_number || ''}
                      onChange={(e) => handleInputChange('bank_account_number', e.target.value)}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="has_bank_account"
                      checked={formData.has_bank_account || false}
                      onChange={(e) => handleInputChange('has_bank_account', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="has_bank_account" className="ml-2 block text-sm text-gray-900">
                      Has Bank Account
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="prefers_cash"
                      checked={formData.prefers_cash_transactions || false}
                      onChange={(e) => handleInputChange('prefers_cash_transactions', e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="prefers_cash" className="ml-2 block text-sm text-gray-900">
                      Prefers Cash Transactions
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Income Sources (comma-separated)</label>
                    <input
                      type="text"
                      value={(formData.income_sources || []).join(', ')}
                      onChange={(e) => handleArrayChange('income_sources', e.target.value)}
                      placeholder="Salary, Business, Agriculture, Investments"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Special Requirements</label>
                    <textarea
                      value={formData.special_requirements || ''}
                      onChange={(e) => handleInputChange('special_requirements', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createContactMutation.isPending || updateContactMutation.isPending}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {createContactMutation.isPending || updateContactMutation.isPending ? 'Saving...' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
