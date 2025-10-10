'use client';

import { Fragment } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  ChevronUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  whatsapp_number?: string;
  mobile_money_provider?: string;
  mobile_money_number?: string;
  preferred_communication_channel?: string;
  trust_level?: number;
  community_groups?: string[];
  primary_language?: string;
  district?: string;
  village?: string;
  has_bank_account?: boolean;
  prefers_cash_transactions?: boolean;
  customer_lifetime_value?: number;
  created_at: string;
  is_active: boolean;
}

interface EnhancedContactsViewProps {
  contacts: Contact[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sortField: keyof Contact;
  sortDirection: 'asc' | 'desc';
  onSort: (field: keyof Contact) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  viewMode: 'table' | 'grid' | 'compact';
  onViewModeChange: (mode: 'table' | 'grid' | 'compact') => void;
  showAdvancedFilters: boolean;
  onToggleAdvancedFilters: () => void;
  advancedFilters: any;
  onAdvancedFiltersChange: (filters: any) => void;
  uniqueDistricts: string[];
  uniqueProviders: string[];
  uniqueChannels: string[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onViewContact: (contact: Contact) => void;
  onEditContact: (contact: Contact) => void;
  onDeleteContact: (id: number) => void;
  isLoading?: boolean;
  getTrustLevelColor: (level?: number) => string;
  getTrustLevelText: (level?: number) => string;
  getChannelIcon: (channel?: string) => string;
  handleWhatsAppContact: (number: string, name: string) => void;
  handleCallContact: (number: string) => void;
  handleSMSContact: (number: string, name: string) => void;
  handleEmailContact: (email: string, name: string) => void;
}

export default function EnhancedContactsView({
  contacts,
  searchTerm,
  onSearchChange,
  sortField,
  sortDirection,
  onSort,
  currentPage,
  totalPages,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  viewMode,
  onViewModeChange,
  showAdvancedFilters,
  onToggleAdvancedFilters,
  advancedFilters,
  onAdvancedFiltersChange,
  uniqueDistricts,
  uniqueProviders,
  uniqueChannels,
  hasActiveFilters,
  onClearFilters,
  onViewContact,
  onEditContact,
  onDeleteContact,
  isLoading,
  getTrustLevelColor,
  getTrustLevelText,
  getChannelIcon,
  handleWhatsAppContact,
  handleCallContact,
  handleSMSContact,
  handleEmailContact,
}: EnhancedContactsViewProps) {
  
  const SortIcon = ({ field }: { field: keyof Contact }) => {
    if (sortField !== field) return <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="h-4 w-4 text-indigo-600" /> : 
      <ChevronDownIcon className="h-4 w-4 text-indigo-600" />;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPages = 7;
    
    if (totalPages <= maxPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push(-1); // Ellipsis
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push(-1);
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push(-1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(totalPages);
      }
    }

    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * itemsPerPage, contacts.length)}</span> of{' '}
              <span className="font-medium">{contacts.length}</span> results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-700">Per page:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="rounded-md border-gray-300 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm ml-4" aria-label="Pagination">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                <ChevronDownIcon className="h-5 w-5 rotate-90" aria-hidden="true" />
              </button>
              
              {pages.map((page, idx) => (
                page === -1 ? (
                  <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                      currentPage === page
                        ? 'z-10 bg-indigo-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                <ChevronDownIcon className="h-5 w-5 -rotate-90" aria-hidden="true" />
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Search, Filters, and View Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, email, phone, or district..."
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* View Controls */}
          <div className="flex items-center gap-3">
            {/* View Mode Selector */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Table view"
              >
                <TableCellsIcon className={`h-5 w-5 ${viewMode === 'table' ? 'text-indigo-600' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={() => onViewModeChange('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Grid view"
              >
                <Squares2X2Icon className={`h-5 w-5 ${viewMode === 'grid' ? 'text-indigo-600' : 'text-gray-600'}`} />
              </button>
              <button
                onClick={() => onViewModeChange('compact')}
                className={`p-2 rounded ${viewMode === 'compact' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Compact view"
              >
                <ListBulletIcon className={`h-5 w-5 ${viewMode === 'compact' ? 'text-indigo-600' : 'text-gray-600'}`} />
              </button>
            </div>

            {/* Advanced Filters Button */}
            <button
              onClick={onToggleAdvancedFilters}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-indigo-600 rounded-full">
                  !
                </span>
              )}
            </button>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 hover:text-red-800"
              >
                <XMarkIcon className="h-4 w-4" />
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Trust Level Multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trust Level</label>
                <div className="space-y-2">
                  {[
                    { value: '5', label: 'Very High (5)' },
                    { value: '4', label: 'High (4)' },
                    { value: '3', label: 'Medium (3)' },
                    { value: '2', label: 'Low (2)' },
                    { value: '1', label: 'Very Low (1)' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.trustLevels?.includes(option.value) || false}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...(advancedFilters.trustLevels || []), option.value]
                            : (advancedFilters.trustLevels || []).filter((v: string) => v !== option.value);
                          onAdvancedFiltersChange({ ...advancedFilters, trustLevels: newValues });
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* District Multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {uniqueDistricts.slice(0, 10).map(district => (
                    <label key={district} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.districts?.includes(district) || false}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...(advancedFilters.districts || []), district]
                            : (advancedFilters.districts || []).filter((d: string) => d !== district);
                          onAdvancedFiltersChange({ ...advancedFilters, districts: newValues });
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{district}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Provider Multi-select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Money Provider</label>
                <div className="space-y-2">
                  {uniqueProviders.map(provider => (
                    <label key={provider} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters.providers?.includes(provider) || false}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...(advancedFilters.providers || []), provider]
                            : (advancedFilters.providers || []).filter((p: string) => p !== provider);
                          onAdvancedFiltersChange({ ...advancedFilters, providers: newValues });
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{provider}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Contact Attributes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Attributes</label>
                <div className="space-y-2">
                  {[
                    { key: 'hasEmail', label: 'Has Email' },
                    { key: 'hasPhone', label: 'Has Phone' },
                    { key: 'hasWhatsApp', label: 'Has WhatsApp' },
                    { key: 'hasMobileMoney', label: 'Has Mobile Money' },
                    { key: 'isActive', label: 'Is Active' }
                  ].map(attr => (
                    <label key={attr.key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={advancedFilters[attr.key] === true}
                        onChange={(e) => {
                          onAdvancedFiltersChange({
                            ...advancedFilters,
                            [attr.key]: e.target.checked ? true : undefined
                          });
                        }}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{attr.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">{contacts.length}</span> contact{contacts.length !== 1 ? 's' : ''} found
        </p>
        {isLoading && (
          <div className="flex items-center text-sm text-gray-600">
            <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
            Loading...
          </div>
        )}
      </div>

      {/* Contacts Display */}
      {viewMode === 'table' && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <button
                      onClick={() => onSort('name')}
                      className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Name
                      <span className="ml-2">
                        <SortIcon field="name" />
                      </span>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Info
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    <button
                      onClick={() => onSort('trust_level')}
                      className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Trust Level
                      <span className="ml-2">
                        <SortIcon field="trust_level" />
                      </span>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mobile Money
                  </th>
                  <th scope="col" className="px-6 py-3 text-left">
                    <button
                      onClick={() => onSort('district')}
                      className="group inline-flex items-center text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Location
                      <span className="ml-2">
                        <SortIcon field="district" />
                      </span>
                    </button>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-700 font-semibold text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        {contact.whatsapp_number && (
                          <button
                            onClick={() => handleWhatsAppContact(contact.whatsapp_number!, contact.name)}
                            className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                            title="WhatsApp"
                          >
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          </button>
                        )}
                        {contact.phone && (
                          <>
                            <button
                              onClick={() => handleCallContact(contact.phone!)}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                              title="Call"
                            >
                              <PhoneIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleSMSContact(contact.phone!, contact.name)}
                              className="p-1.5 bg-purple-50 text-purple-600 rounded-md hover:bg-purple-100 transition-colors text-xs font-bold"
                              title="SMS"
                            >
                              SMS
                            </button>
                          </>
                        )}
                        {contact.email && (
                          <button
                            onClick={() => handleEmailContact(contact.email!, contact.name)}
                            className="p-1.5 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                            title="Email"
                          >
                            <EnvelopeIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{contact.phone || 'No phone'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getTrustLevelColor(contact.trust_level)}`}>
                        {getTrustLevelText(contact.trust_level)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {contact.mobile_money_provider ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{contact.mobile_money_provider}</div>
                          <div className="text-sm text-gray-500">{contact.mobile_money_number}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{contact.district || 'Unknown'}</div>
                      {contact.village && <div className="text-sm text-gray-500">{contact.village}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => onViewContact(contact)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="View details"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onEditContact(contact)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit contact"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete contact"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-700 font-semibold text-lg">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.email || 'No email'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                    {contact.phone || 'No phone'}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${getTrustLevelColor(contact.trust_level)}`}>
                      {getTrustLevelText(contact.trust_level)}
                    </span>
                    {contact.mobile_money_provider && (
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {contact.mobile_money_provider}
                      </span>
                    )}
                  </div>

                  {contact.district && (
                    <div className="text-sm text-gray-600">
                      📍 {contact.district}{contact.village && `, ${contact.village}`}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {contact.whatsapp_number && (
                      <button
                        onClick={() => handleWhatsAppContact(contact.whatsapp_number!, contact.name)}
                        className="p-2 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                        title="WhatsApp"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                    )}
                    {contact.phone && (
                      <button
                        onClick={() => handleCallContact(contact.phone!)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                        title="Call"
                      >
                        <PhoneIcon className="h-4 w-4" />
                      </button>
                    )}
                    {contact.email && (
                      <button
                        onClick={() => handleEmailContact(contact.email!, contact.name)}
                        className="p-2 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
                        title="Email"
                      >
                        <EnvelopeIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onViewContact(contact)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEditContact(contact)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            {renderPagination()}
          </div>
        </>
      )}

      {/* Compact View */}
      {viewMode === 'compact' && (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
            {contacts.map((contact) => (
              <div key={contact.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-700 font-semibold text-sm">
                        {contact.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">{contact.name}</h3>
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getTrustLevelColor(contact.trust_level)}`}>
                          {getTrustLevelText(contact.trust_level)}
                        </span>
                        {contact.mobile_money_provider && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {contact.mobile_money_provider}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                        <span>{contact.phone || 'No phone'}</span>
                        <span>•</span>
                        <span>{contact.email || 'No email'}</span>
                        {contact.district && (
                          <>
                            <span>•</span>
                            <span>📍 {contact.district}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {contact.whatsapp_number && (
                      <button
                        onClick={() => handleWhatsAppContact(contact.whatsapp_number!, contact.name)}
                        className="p-1.5 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                        title="WhatsApp"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onViewContact(contact)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="View"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onEditContact(contact)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDeleteContact(contact.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            {renderPagination()}
          </div>
        </>
      )}

      {/* Empty State */}
      {contacts.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100">
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No contacts found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {hasActiveFilters
              ? 'Try adjusting your filters or search query'
              : 'Get started by adding your first contact'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
