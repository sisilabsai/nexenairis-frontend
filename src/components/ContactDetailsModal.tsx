'use client';

import { XMarkIcon, PhoneIcon, EnvelopeIcon, MapPinIcon, BanknotesIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface Contact {
  id: number;
  contact_number?: string;
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
  preferred_communication_channel?: string;
  family_relationships?: string[];
  business_network?: string[];
  referred_by?: string;
  trust_level?: number;
  community_groups?: string[];
  group_role?: string;
  group_contribution_amount?: number;
  group_contribution_frequency?: string;
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
  income_category?: string;
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
  gender?: string;
  marital_status?: string;
  number_of_dependents?: number;
  education_level?: string;
  occupation?: string;
  created_at: string;
  is_active: boolean;
  contactType?: {
    name: string;
    code: string;
  };
}

interface ContactDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: Contact | null;
  onEdit?: (contact: Contact) => void;
}

export default function ContactDetailsModal({ isOpen, onClose, contact, onEdit }: ContactDetailsModalProps) {
  if (!isOpen || !contact) return null;

  const getTrustLevelColor = (level?: number) => {
    switch (level) {
      case 5: return 'bg-green-100 text-green-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 1: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrustLevelText = (level?: number) => {
    const levels = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High' };
    return levels[level as keyof typeof levels] || 'Unknown';
  };

  const getChannelIcon = (channel?: string) => {
    switch (channel) {
      case 'whatsapp': return '📱';
      case 'phone': return '📞';
      case 'email': return '📧';
      case 'sms': return '💬';
      case 'in_person': return '👥';
      default: return '📞';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'Not specified';
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatLocation = () => {
    const parts = [contact.village, contact.parish, contact.sub_county, contact.district, contact.country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
          aria-hidden="true" 
        />

        {/* Centering element */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto"
             role="dialog" 
             aria-modal="true">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {contact.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{contact.name}</h3>
                  <p className="text-indigo-100">{contact.contact_number} • {contact.contactType?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(contact)}
                    className="text-white hover:text-indigo-200 bg-white bg-opacity-20 px-3 py-1 rounded-md text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-white hover:text-indigo-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white px-6 py-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <UserGroupIcon className="h-8 w-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Trust Level</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTrustLevelColor(contact.trust_level)}`}>
                      {getTrustLevelText(contact.trust_level)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <BanknotesIcon className="h-8 w-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Lifetime Value</p>
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(contact.customer_lifetime_value)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl">{getChannelIcon(contact.preferred_communication_channel)}</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Preferred Contact</p>
                    <p className="text-sm font-bold text-gray-900 capitalize">{contact.preferred_communication_channel || 'Phone'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <span className="text-2xl">🏦</span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Banking</p>
                    <p className="text-sm font-bold text-gray-900">
                      {contact.has_bank_account ? 'Banked' : 'Unbanked'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Basic Contact Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <PhoneIcon className="h-5 w-5 mr-2" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  {contact.email && (
                    <div className="flex items-center">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{contact.phone}</span>
                    </div>
                  )}
                  {contact.whatsapp_number && (
                    <div className="flex items-center">
                      <span className="text-green-500 mr-2">📱</span>
                      <span className="text-sm text-gray-900">{contact.whatsapp_number}</span>
                      {contact.whatsapp_business_verified && (
                        <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                      )}
                    </div>
                  )}
                  {contact.website && (
                    <div className="flex items-center">
                      <GlobeAltIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-800">
                        {contact.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2" />
                  Location
                </h4>
                <div className="space-y-2">
                  <p className="text-sm text-gray-900">{formatLocation()}</p>
                  {contact.address && (
                    <p className="text-sm text-gray-600">{contact.address}</p>
                  )}
                  {(contact.latitude && contact.longitude) && (
                    <p className="text-xs text-gray-500">
                      📍 {contact.latitude}, {contact.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* African Context Information */}
            <div className="space-y-6">
              {/* Mobile Money & Financial */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  💰 Financial & Mobile Money
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Mobile Money</h5>
                    {contact.mobile_money_provider ? (
                      <div className="space-y-1">
                        <p className="text-sm"><span className="font-medium">Provider:</span> {contact.mobile_money_provider}</p>
                        <p className="text-sm"><span className="font-medium">Number:</span> {contact.mobile_money_number}</p>
                        {contact.mobile_money_verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Verified</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No mobile money account</p>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Banking</h5>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Status:</span> {contact.has_bank_account ? 'Banked' : 'Unbanked'}
                      </p>
                      {contact.bank_name && (
                        <p className="text-sm"><span className="font-medium">Bank:</span> {contact.bank_name}</p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">Prefers Cash:</span> {contact.prefers_cash_transactions ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community & Social */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  👥 Community & Social
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Community Groups</h5>
                    {contact.community_groups && contact.community_groups.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          {contact.community_groups.map((group, index) => (
                            <span key={index} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {group}
                            </span>
                          ))}
                        </div>
                        {contact.group_role && (
                          <p className="text-sm"><span className="font-medium">Role:</span> {contact.group_role}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No community groups</p>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Languages & Culture</h5>
                    <div className="space-y-1">
                      {contact.primary_language && (
                        <p className="text-sm"><span className="font-medium">Primary:</span> {contact.primary_language}</p>
                      )}
                      {contact.languages_spoken && contact.languages_spoken.length > 0 && (
                        <p className="text-sm">
                          <span className="font-medium">Speaks:</span> {contact.languages_spoken.join(', ')}
                        </p>
                      )}
                      {contact.religion && (
                        <p className="text-sm"><span className="font-medium">Religion:</span> {contact.religion}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal & Professional */}
              {(contact.occupation || contact.education_level || contact.gender || contact.marital_status) && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    👤 Personal & Professional
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Professional</h5>
                      <div className="space-y-1">
                        {contact.occupation && (
                          <p className="text-sm"><span className="font-medium">Occupation:</span> {contact.occupation}</p>
                        )}
                        {contact.education_level && (
                          <p className="text-sm"><span className="font-medium">Education:</span> {contact.education_level}</p>
                        )}
                        {contact.income_category && (
                          <p className="text-sm">
                            <span className="font-medium">Income Category:</span> 
                            <span className="ml-1 capitalize">{contact.income_category}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Personal</h5>
                      <div className="space-y-1">
                        {contact.gender && (
                          <p className="text-sm"><span className="font-medium">Gender:</span> {contact.gender}</p>
                        )}
                        {contact.marital_status && (
                          <p className="text-sm"><span className="font-medium">Marital Status:</span> {contact.marital_status}</p>
                        )}
                        {contact.number_of_dependents !== undefined && (
                          <p className="text-sm"><span className="font-medium">Dependents:</span> {contact.number_of_dependents}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Special Requirements */}
              {contact.special_requirements && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Special Requirements</h4>
                  <p className="text-sm text-gray-700">{contact.special_requirements}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Contact created: {new Date(contact.created_at).toLocaleDateString()}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${contact.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {contact.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




