'use client';

import { useState, useMemo } from 'react';
import {
  ChartBarIcon,
  UsersIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  BanknotesIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useCrmContacts, useCrmSummary } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  mobile_money_provider?: string;
  preferred_communication_channel?: string;
  trust_level?: number;
  community_groups?: string[];
  primary_language?: string;
  district?: string;
  has_bank_account?: boolean;
  prefers_cash_transactions?: boolean;
  customer_lifetime_value?: number;
  created_at: string;
  is_active: boolean;
  income_category?: string;
  occupation?: string;
  education_level?: string;
}

interface SegmentationCriteria {
  trust_level: string;
  income_category: string;
  has_bank_account: string;
  prefers_cash: string;
  mobile_money_provider: string;
  district: string;
  communication_channel: string;
  min_lifetime_value: string;
  max_lifetime_value: string;
}

export default function CustomerSegmentationDashboard() {
  const [segmentationCriteria, setSegmentationCriteria] = useState<SegmentationCriteria>({
    trust_level: '',
    income_category: '',
    has_bank_account: '',
    prefers_cash: '',
    mobile_money_provider: '',
    district: '',
    communication_channel: '',
    min_lifetime_value: '',
    max_lifetime_value: '',
  });

  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const { data: contactsData, isLoading: contactsLoading, error: contactsError } = useCrmContacts();
  const { data: summaryData } = useCrmSummary();

  const contacts = ((contactsData as any)?.data?.data as Contact[]) || [];
  const summary = (summaryData as any)?.data || {};

  // Segment contacts based on criteria
  const segmentedContacts = useMemo(() => {
    if (!contacts.length) return [];

    return contacts.filter(contact => {
      // Trust level filter
      if (segmentationCriteria.trust_level && contact.trust_level?.toString() !== segmentationCriteria.trust_level) {
        return false;
      }

      // Income category filter
      if (segmentationCriteria.income_category && contact.income_category !== segmentationCriteria.income_category) {
        return false;
      }

      // Bank account filter
      if (segmentationCriteria.has_bank_account) {
        const hasBank = contact.has_bank_account ? 'yes' : 'no';
        if (hasBank !== segmentationCriteria.has_bank_account) {
          return false;
        }
      }

      // Cash preference filter
      if (segmentationCriteria.prefers_cash) {
        const prefersCash = contact.prefers_cash_transactions ? 'yes' : 'no';
        if (prefersCash !== segmentationCriteria.prefers_cash) {
          return false;
        }
      }

      // Mobile money provider filter
      if (segmentationCriteria.mobile_money_provider && contact.mobile_money_provider !== segmentationCriteria.mobile_money_provider) {
        return false;
      }

      // District filter
      if (segmentationCriteria.district && contact.district !== segmentationCriteria.district) {
        return false;
      }

      // Communication channel filter
      if (segmentationCriteria.communication_channel && contact.preferred_communication_channel !== segmentationCriteria.communication_channel) {
        return false;
      }

      // Lifetime value range filter
      const minValue = segmentationCriteria.min_lifetime_value ? parseFloat(segmentationCriteria.min_lifetime_value) : 0;
      const maxValue = segmentationCriteria.max_lifetime_value ? parseFloat(segmentationCriteria.max_lifetime_value) : Infinity;
      const clv = contact.customer_lifetime_value || 0;

      if (clv < minValue || clv > maxValue) {
        return false;
      }

      return true;
    });
  }, [contacts, segmentationCriteria]);

  // Calculate segment statistics
  const segmentStats = useMemo(() => {
    if (!segmentedContacts.length) return null;

    const totalValue = segmentedContacts.reduce((sum, contact) => sum + (contact.customer_lifetime_value || 0), 0);
    const avgValue = totalValue / segmentedContacts.length;

    const trustLevels = segmentedContacts.reduce((acc, contact) => {
      const level = contact.trust_level || 0;
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const topDistricts = segmentedContacts.reduce((acc, contact) => {
      const district = contact.district || 'Unknown';
      acc[district] = (acc[district] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const communicationChannels = segmentedContacts.reduce((acc, contact) => {
      const channel = contact.preferred_communication_channel || 'Unknown';
      acc[channel] = (acc[channel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalContacts: segmentedContacts.length,
      totalValue,
      avgValue,
      trustLevels,
      topDistricts,
      communicationChannels,
      mobileMoneyUsers: segmentedContacts.filter(c => c.mobile_money_provider).length,
      bankAccountHolders: segmentedContacts.filter(c => c.has_bank_account).length,
      cashPreferrers: segmentedContacts.filter(c => c.prefers_cash_transactions).length,
    };
  }, [segmentedContacts]);

  // Predefined segments
  const predefinedSegments = [
    {
      id: 'high-value',
      name: 'High-Value Customers',
      description: 'Customers with high lifetime value and trust',
      criteria: { trust_level: '4', min_lifetime_value: '1000000' },
      icon: '💎',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'mobile-money',
      name: 'Mobile Money Users',
      description: 'Customers using mobile money services',
      criteria: { mobile_money_provider: 'MTN' },
      icon: '📱',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'cash-preferred',
      name: 'Cash-Preferred',
      description: 'Customers who prefer cash transactions',
      criteria: { prefers_cash: 'yes' },
      icon: '💵',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 'whatsapp-users',
      name: 'WhatsApp Users',
      description: 'Customers preferring WhatsApp communication',
      criteria: { communication_channel: 'whatsapp' },
      icon: '💬',
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'low-income',
      name: 'Low-Income Segment',
      description: 'Customers in low-income category',
      criteria: { income_category: 'low' },
      icon: '📊',
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'banked-customers',
      name: 'Banked Customers',
      description: 'Customers with bank accounts',
      criteria: { has_bank_account: 'yes' },
      icon: '🏦',
      color: 'bg-indigo-100 text-indigo-800'
    }
  ];

  const applyPredefinedSegment = (segment: typeof predefinedSegments[0]) => {
    setSegmentationCriteria(prev => ({
      ...prev,
      ...segment.criteria
    }));
    setSelectedSegment(segment.id);
  };

  const clearFilters = () => {
    setSegmentationCriteria({
      trust_level: '',
      income_category: '',
      has_bank_account: '',
      prefers_cash: '',
      mobile_money_provider: '',
      district: '',
      communication_channel: '',
      min_lifetime_value: '',
      max_lifetime_value: '',
    });
    setSelectedSegment(null);
  };

  if (contactsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (contactsError) {
    return (
      <div className="p-8">
        <ErrorMessage message={contactsError.message || 'Failed to load contacts'} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <SparklesIcon className="h-8 w-8 text-purple-600 mr-3" />
              Customer Segmentation Dashboard
            </h2>
            <p className="text-gray-600 mt-1">
              Segment your customers based on various criteria to understand your market better
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Predefined Segments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {predefinedSegments.map((segment) => (
            <button
              key={segment.id}
              onClick={() => applyPredefinedSegment(segment)}
              className={`p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                selectedSegment === segment.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-purple-300 bg-white'
              }`}
            >
              <div className="text-center">
                <div className="text-4xl mb-4">{segment.icon}</div>
                <div className="text-lg font-semibold text-gray-900 mb-2">{segment.name}</div>
                <div className="text-sm text-gray-600 leading-relaxed">{segment.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trust Level</label>
              <select
                value={segmentationCriteria.trust_level}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, trust_level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Levels</option>
                <option value="5">Very High (5)</option>
                <option value="4">High (4)</option>
                <option value="3">Medium (3)</option>
                <option value="2">Low (2)</option>
                <option value="1">Very Low (1)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Income Category</label>
              <select
                value={segmentationCriteria.income_category}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, income_category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Categories</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="variable">Variable</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bank Account</label>
              <select
                value={segmentationCriteria.has_bank_account}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, has_bank_account: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All</option>
                <option value="yes">Has Bank Account</option>
                <option value="no">No Bank Account</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cash Preference</label>
              <select
                value={segmentationCriteria.prefers_cash}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, prefers_cash: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All</option>
                <option value="yes">Prefers Cash</option>
                <option value="no">Prefers Digital</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Money Provider</label>
              <select
                value={segmentationCriteria.mobile_money_provider}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, mobile_money_provider: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Providers</option>
                <option value="MTN">MTN Money</option>
                <option value="Airtel">Airtel Money</option>
                <option value="M-Pesa">M-Pesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Communication Channel</label>
              <select
                value={segmentationCriteria.communication_channel}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, communication_channel: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Channels</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in_person">In Person</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Lifetime Value (UGX)</label>
              <input
                type="number"
                value={segmentationCriteria.min_lifetime_value}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, min_lifetime_value: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Lifetime Value (UGX)</label>
              <input
                type="number"
                value={segmentationCriteria.max_lifetime_value}
                onChange={(e) => setSegmentationCriteria(prev => ({ ...prev, max_lifetime_value: e.target.value }))}
                placeholder="No limit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Segment Statistics */}
      {segmentStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-gray-500 mb-2">Segment Size</dt>
                    <dd className="text-3xl font-bold text-gray-900">{segmentStats.totalContacts}</dd>
                    <dd className="text-sm text-gray-600 mt-1">Total contacts in segment</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CurrencyDollarIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-gray-500 mb-2">Total Value</dt>
                    <dd className="text-3xl font-bold text-gray-900">
                      UGX {segmentStats.totalValue.toLocaleString()}
                    </dd>
                    <dd className="text-sm text-gray-600 mt-1">Combined lifetime value</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-gray-500 mb-2">Avg Value</dt>
                    <dd className="text-3xl font-bold text-gray-900">
                      UGX {Math.round(segmentStats.avgValue).toLocaleString()}
                    </dd>
                    <dd className="text-sm text-gray-600 mt-1">Average per contact</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100">
            <div className="p-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DevicePhoneMobileIcon className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-6 w-0 flex-1">
                  <dl>
                    <dt className="text-base font-medium text-gray-500 mb-2">Mobile Money Users</dt>
                    <dd className="text-3xl font-bold text-gray-900">{segmentStats.mobileMoneyUsers}</dd>
                    <dd className="text-sm text-gray-600 mt-1">Digital payment users</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segment Insights */}
      {segmentStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trust Level Distribution */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <HeartIcon className="h-6 w-6 text-red-500 mr-3" />
              Trust Level Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(segmentStats.trustLevels)
                .sort(([a], [b]) => parseInt(b) - parseInt(a))
                .map(([level, count]) => (
                  <div key={level} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-base font-medium text-gray-700">
                      Level {level} ({level === '5' ? 'Very High' : level === '4' ? 'High' : level === '3' ? 'Medium' : level === '2' ? 'Low' : 'Very Low'})
                    </span>
                    <span className="text-lg font-semibold text-gray-900">{count} contacts</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Top Districts */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <MapPinIcon className="h-6 w-6 text-blue-500 mr-3" />
              Geographic Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(segmentStats.topDistricts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([district, count]) => (
                  <div key={district} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-base font-medium text-gray-700">{district}</span>
                    <span className="text-lg font-semibold text-gray-900">{count} contacts</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Communication Channels */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500 mr-3" />
              Communication Preferences
            </h3>
            <div className="space-y-4">
              {Object.entries(segmentStats.communicationChannels)
                .sort(([, a], [, b]) => b - a)
                .map(([channel, count]) => (
                  <div key={channel} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-base font-medium text-gray-700 capitalize">{channel.replace('_', ' ')}</span>
                    <span className="text-lg font-semibold text-gray-900">{count} contacts</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Financial Inclusion */}
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <BanknotesIcon className="h-6 w-6 text-yellow-500 mr-3" />
              Financial Inclusion
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-base text-gray-700">Bank Account Holders:</span>
                <span className="text-xl font-bold text-blue-600">{segmentStats.bankAccountHolders}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                <span className="text-base text-gray-700">Cash Preferred:</span>
                <span className="text-xl font-bold text-green-600">{segmentStats.cashPreferrers}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                <span className="text-base text-gray-700">Mobile Money Users:</span>
                <span className="text-xl font-bold text-purple-600">{segmentStats.mobileMoneyUsers}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center p-4 bg-indigo-50 rounded-lg">
                  <span className="text-base font-medium text-gray-700">Digital Adoption Rate:</span>
                  <span className="text-xl font-bold text-indigo-600">
                    {segmentStats.totalContacts > 0
                      ? Math.round(((segmentStats.mobileMoneyUsers + segmentStats.bankAccountHolders) / segmentStats.totalContacts) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Segment Contacts Preview */}
      {segmentedContacts.length > 0 && (
        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Segment Contacts ({segmentedContacts.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    District
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Trust Level
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Communication
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Lifetime Value
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {segmentedContacts.slice(0, 10).map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-base font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-base text-gray-900">{contact.district || 'N/A'}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                        contact.trust_level === 5 ? 'bg-green-100 text-green-800' :
                        contact.trust_level === 4 ? 'bg-green-100 text-green-800' :
                        contact.trust_level === 3 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {contact.trust_level || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-base text-gray-900 capitalize">
                        {contact.preferred_communication_channel?.replace('_', ' ') || 'N/A'}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-base font-semibold text-gray-900">
                        UGX {(contact.customer_lifetime_value || 0).toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {segmentedContacts.length > 10 && (
              <div className="text-center py-6 text-base text-gray-500 bg-gray-50 rounded-lg mt-4">
                Showing first 10 of {segmentedContacts.length} contacts
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {segmentedContacts.length === 0 && !contactsLoading && (
        <div className="bg-white shadow rounded-lg p-8">
          <div className="text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No contacts match your criteria</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your filters or select a predefined segment to see results.
            </p>
            <div className="mt-6">
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}