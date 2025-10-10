'use client';

import { useState, useMemo, Suspense, lazy } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  UsersIcon,
  DevicePhoneMobileIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  GlobeAsiaAustraliaIcon,
  HeartIcon,
  BanknotesIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  SparklesIcon,
  PhoneIcon,
  EnvelopeIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  Bars3Icon,
  ChevronRightIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import {
  useCrmContacts,
  useCrmSummary,
  useMobileMoneyAnalytics,
  useCommunityGroupsAnalytics,
  useCommunicationAnalytics,
  useRegionalInsights,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
  useExportContacts,
  // 🤖 CRM AI Services
  useLeadScoringAI,
  useDealPredictionAI,
  useCustomerSegmentationAI,
  usePricingOptimizationAI,
  useCustomer360ViewAI,
  useCustomerJourneyMappingAI,
  useVoiceOfCustomerAnalyticsAI,
  usePersonalizationEngineAI,
  useSalesOpportunities
} from '../../hooks/useApi';
import { crmApi } from '../../lib/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import { ContactImportResponse } from '../../types/crm';

// Lazy load modals for better performance
const ContactModal = lazy(() => import('../../components/ContactModal'));
const ContactDetailsModal = lazy(() => import('../../components/ContactDetailsModal'));
const ContactTypeModal = lazy(() => import('../../components/ContactTypeModal'));
const ContactImportModal = lazy(() => import('../../components/crm/ContactImportModal'));
const CustomerSegmentationDashboard = lazy(() => import('../../components/CustomerSegmentationDashboard'));
const SalesOpportunityModal = lazy(() => import('../../components/SalesOpportunityModal'));
const SalesPipelineView = lazy(() => import('../../components/SalesPipelineView'));
const EnhancedContactsView = lazy(() => import('../../components/crm/EnhancedContactsView'));

// Loading fallback for lazy components
const ModalFallback = () => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="lg" />
  </div>
);

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

export default function CrmPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactModal, setShowContactModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showContactTypeModal, setShowContactTypeModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'contacts' | 'pipeline' | 'analytics'>('overview');
  
  // Mobile-specific states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewContact, setQuickViewContact] = useState<Contact | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isGridView, setIsGridView] = useState(true);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [showOpportunityModal, setShowOpportunityModal] = useState(false);
  const [selectedAnalyticsTab, setSelectedAnalyticsTab] = useState<'mobile-money' | 'community' | 'communication' | 'regional' | 'ai-insights' | 'segmentation'>('mobile-money');
  const [contactFilters, setContactFilters] = useState({
    trust_level: '',
    district: '',
    mobile_money_provider: '',
    preferred_channel: '',
  });

  // Enhanced Contacts View State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [contactViewMode, setContactViewMode] = useState<'table' | 'grid' | 'compact'>('table');
  const [advancedFilters, setAdvancedFilters] = useState({
    trustLevels: [] as string[],
    districts: [] as string[],
    providers: [] as string[],
    channels: [] as string[],
    hasEmail: undefined as boolean | undefined,
    hasPhone: undefined as boolean | undefined,
    hasWhatsApp: undefined as boolean | undefined,
    hasMobileMoney: undefined as boolean | undefined,
    isActive: undefined as boolean | undefined,
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Bulk Operations State
  const [selectedContacts, setSelectedContacts] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionType, setBulkActionType] = useState<'delete' | 'export' | 'update_status' | 'update_trust' | 'send_message' | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState('');

  // 🤖 AI State Management
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  const [selectedAIView, setSelectedAIView] = useState<'lead-scoring' | 'deal-prediction' | 'segmentation' | 'pricing' | 'customer-360' | 'journey-mapping' | 'voice-of-customer' | 'personalization'>('lead-scoring');
  const [selectedContactForAI, setSelectedContactForAI] = useState<number | null>(null);

  // API hooks - optimized with conditional loading
  // Fetch all contacts by passing a large per_page value
  const { data: contactsData, isLoading: contactsLoading, error: contactsError, refetch: refetchContacts } = useCrmContacts({ per_page: 500 });
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useCrmSummary();

  // Lazy load analytics data only when needed
  const shouldLoadAnalytics = selectedView === 'analytics';
  const { data: mobileMoneyData, isLoading: mobileMoneyLoading } = useMobileMoneyAnalytics();
  const { data: communityData, isLoading: communityLoading } = useCommunityGroupsAnalytics();
  const { data: communicationData, isLoading: communicationLoading } = useCommunicationAnalytics();
  const { data: regionalData, isLoading: regionalLoading } = useRegionalInsights();

  const { data: opportunitiesData, isLoading: opportunitiesLoading, refetch: refetchOpportunities } = useSalesOpportunities();
  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();
  const exportContactsMutation = useExportContacts();

  // 🤖 AI Hooks - Only load when AI insights are enabled and tab is selected
  const shouldLoadAI = selectedView === 'analytics' && selectedAnalyticsTab === 'ai-insights' && aiInsightsEnabled;

  const { data: leadScoringData, isLoading: leadScoringLoading } = useLeadScoringAI();
  const { data: dealPredictionData, isLoading: dealPredictionLoading } = useDealPredictionAI();
  const { data: segmentationData, isLoading: segmentationLoading } = useCustomerSegmentationAI();
  const { data: pricingData, isLoading: pricingLoading } = usePricingOptimizationAI();

  // Only load customer-specific AI data when a contact is selected
  const { data: customer360Data, isLoading: customer360Loading } = useCustomer360ViewAI(selectedContactForAI || 0);
  const { data: journeyMappingData, isLoading: journeyMappingLoading } = useCustomerJourneyMappingAI(selectedContactForAI || 0);
  const { data: voiceOfCustomerData, isLoading: voiceOfCustomerLoading } = useVoiceOfCustomerAnalyticsAI();
  const { data: personalizationData, isLoading: personalizationLoading } = usePersonalizationEngineAI(selectedContactForAI || 0);

  const contacts = ((contactsData as any)?.data?.data as Contact[]) || [];
  const summary = (summaryData as any)?.data || {};
  const mobileMoneyAnalytics = (mobileMoneyData as any)?.data || {};
  const communityAnalytics = (communityData as any)?.data || {};
  const communicationAnalytics = (communicationData as any)?.data || {};
  const regionalInsights = (regionalData as any)?.data || {};

  const opportunities = (opportunitiesData as any)?.data?.data || [];

  // 🤖 AI Data
  const leadScoring = (leadScoringData as any)?.data || {};
  const dealPrediction = (dealPredictionData as any)?.data || {};
  const segmentation = (segmentationData as any)?.data || {};
  const pricingOptimization = (pricingData as any)?.data || {};
  const customer360View = (customer360Data as any)?.data || {};
  const journeyMapping = (journeyMappingData as any)?.data || {};
  const voiceOfCustomer = (voiceOfCustomerData as any)?.data || {};
  const personalization = (personalizationData as any)?.data || {};

  // Optimized contact filtering with memoization
  // Enhanced contact filtering with pagination, sorting, and advanced filters
  const filteredContacts = useMemo(() => {
    if (!contacts.length) return {
      filteredContacts: [],
      paginatedContacts: [],
      totalPages: 0,
      uniqueDistricts: [],
      uniqueProviders: [],
      uniqueChannels: []
    };

    // Pre-compile regex for search term to avoid repeated compilation
    const searchRegex = searchTerm ? new RegExp(searchTerm.toLowerCase(), 'i') : null;

    // Apply all filters
    let filtered = contacts.filter(contact => {
      // Basic search matching
      const matchesSearch = !searchRegex ||
        searchRegex.test(contact.name) ||
        (contact.email && searchRegex.test(contact.email)) ||
        (contact.phone && contact.phone.includes(searchTerm));

      if (!matchesSearch) return false;

      // Basic filters
      const matchesBasicFilters = 
        (!contactFilters.trust_level || contact.trust_level?.toString() === contactFilters.trust_level) &&
        (!contactFilters.district || contact.district === contactFilters.district) &&
        (!contactFilters.mobile_money_provider || contact.mobile_money_provider === contactFilters.mobile_money_provider) &&
        (!contactFilters.preferred_channel || contact.preferred_communication_channel === contactFilters.preferred_channel);

      if (!matchesBasicFilters) return false;

      // Advanced filters
      const matchesAdvancedFilters =
        (advancedFilters.trustLevels.length === 0 || advancedFilters.trustLevels.includes(contact.trust_level?.toString() || '')) &&
        (advancedFilters.districts.length === 0 || advancedFilters.districts.includes(contact.district || '')) &&
        (advancedFilters.providers.length === 0 || advancedFilters.providers.includes(contact.mobile_money_provider || '')) &&
        (advancedFilters.channels.length === 0 || advancedFilters.channels.includes(contact.preferred_communication_channel || '')) &&
        (advancedFilters.hasEmail === undefined || (advancedFilters.hasEmail ? !!contact.email : !contact.email)) &&
        (advancedFilters.hasPhone === undefined || (advancedFilters.hasPhone ? !!contact.phone : !contact.phone)) &&
        (advancedFilters.hasWhatsApp === undefined || (advancedFilters.hasWhatsApp ? !!contact.whatsapp_number : !contact.whatsapp_number)) &&
        (advancedFilters.hasMobileMoney === undefined || (advancedFilters.hasMobileMoney ? !!contact.mobile_money_number : !contact.mobile_money_number)) &&
        (advancedFilters.isActive === undefined || contact.is_active === advancedFilters.isActive);

      return matchesAdvancedFilters;
    });

    // Sort filtered contacts
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = (a as any)[sortField];
        const bValue = (b as any)[sortField];
        
        if (aValue === bValue) return 0;
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = aValue < bValue ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    // Calculate pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedContacts = filtered.slice(startIndex, startIndex + itemsPerPage);

    // Extract unique values for filters
    const uniqueDistricts = [...new Set(contacts.map(c => c.district).filter(Boolean))] as string[];
    const uniqueProviders = [...new Set(contacts.map(c => c.mobile_money_provider).filter(Boolean))] as string[];
    const uniqueChannels = [...new Set(contacts.map(c => c.preferred_communication_channel).filter(Boolean))] as string[];

    return {
      filteredContacts: filtered,
      paginatedContacts,
      totalPages,
      uniqueDistricts,
      uniqueProviders,
      uniqueChannels
    };
  }, [
    contacts, 
    searchTerm, 
    contactFilters, 
    advancedFilters,
    sortField,
    sortDirection,
    currentPage,
    itemsPerPage
  ]);

  const getTrustLevelColor = (level?: number) => {
    if (!level) return 'bg-gray-100 text-gray-800';
    if (level >= 4) return 'bg-green-100 text-green-800';
    if (level >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
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

  const handleAddContact = () => {
    setEditingContact(null);
    setShowContactModal(true);
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setShowContactModal(true);
  };

  const handleContactModalClose = () => {
    setShowContactModal(false);
    setEditingContact(null);
  };

  const handleContactSuccess = () => {
    refetchContacts();
    refetchSummary();
  };

  const handleViewContact = (contact: Contact) => {
    setViewingContact(contact);
    setShowDetailsModal(true);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setViewingContact(null);
  };

  const handleEditFromDetails = (contact: Contact) => {
    setShowDetailsModal(false);
    setEditingContact(contact);
    setShowContactModal(true);
  };

  // Enhanced contacts view handlers
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page
  };

  const clearAllFilters = () => {
    setContactFilters({
      trust_level: '',
      district: '',
      mobile_money_provider: '',
      preferred_channel: '',
    });
    setAdvancedFilters({
      trustLevels: [],
      districts: [],
      providers: [],
      channels: [],
      hasEmail: undefined,
      hasPhone: undefined,
      hasWhatsApp: undefined,
      hasMobileMoney: undefined,
      isActive: undefined,
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const hasActiveFilters = () => {
    return !!(
      contactFilters.trust_level ||
      contactFilters.district ||
      contactFilters.mobile_money_provider ||
      contactFilters.preferred_channel ||
      advancedFilters.trustLevels.length > 0 ||
      advancedFilters.districts.length > 0 ||
      advancedFilters.providers.length > 0 ||
      advancedFilters.channels.length > 0 ||
      advancedFilters.hasEmail !== undefined ||
      advancedFilters.hasPhone !== undefined ||
      advancedFilters.hasWhatsApp !== undefined ||
      advancedFilters.hasMobileMoney !== undefined ||
      advancedFilters.isActive !== undefined ||
      searchTerm
    );
  };

  const handleImportContacts = async (importData: any[]): Promise<ContactImportResponse> => {
    try {
      console.log('Importing contacts:', importData.length, 'contacts');
      
      const result = await crmApi.importContacts({
        contacts: importData,
        duplicate_handling: 'skip'
      });

      console.log('Import result:', result);

      // Cast to any to access dynamic properties from backend
      const responseData = result as any;

      // Check if the response has results directly (backend format)
      if (result.success && responseData.results) {
        // Backend returns: { success, message, results }
        const importResponse: ContactImportResponse = {
          success: result.success,
          message: result.message,
          results: responseData.results
        };
        
        // Refetch data immediately to show updated contacts
        await Promise.all([
          refetchContacts(),
          refetchSummary()
        ]);
        
        // Force another refetch after a short delay to ensure data is loaded
        setTimeout(() => {
          refetchContacts();
          refetchSummary();
        }, 2000);
        
        // Return the response for the modal to display
        return importResponse;
      } else if (result.success && result.data) {
        // Alternative format: { success, message, data: { results } }
        const importResponse = result.data as ContactImportResponse;
        
        // Refetch data immediately to show updated contacts
        await Promise.all([
          refetchContacts(),
          refetchSummary()
        ]);
        
        // Force another refetch after a short delay to ensure data is loaded
        setTimeout(() => {
          refetchContacts();
          refetchSummary();
        }, 2000);
        
        // Return the response for the modal to display
        return importResponse;
      } else {
        // Return error response
        return {
          success: false,
          message: result.message || 'Unknown error',
          results: {
            total_processed: 0,
            imported: 0,
            updated: 0,
            skipped: 0,
            failed: importData.length,
            duplicates: 0,
            errors: [{
              row: 1,
              name: 'Import Error',
              error: result.message || 'Unknown error'
            }],
            duplicate_details: [],
            created_contacts: []
          }
        };
      }
    } catch (error: any) {
      console.error('Import error:', error);
      
      // Better error handling for different types of errors
      let errorMessage = 'Import failed';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication failed. Please refresh the page and try again.';
      } else if (error.response?.status === 422) {
        errorMessage = 'Invalid data format. Please check your CSV file.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Return error response instead of throwing
      return {
        success: false,
        message: errorMessage,
        results: {
          total_processed: 0,
          imported: 0,
          updated: 0,
          skipped: 0,
          failed: importData.length,
          duplicates: 0,
          errors: [{
            row: 1,
            name: 'System Error',
            error: errorMessage
          }],
          duplicate_details: [],
          created_contacts: []
        }
      };
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContactMutation.mutateAsync(contactId);
        refetchContacts();
        refetchSummary();
      } catch (error) {
        console.error('Failed to delete contact:', error);
      }
    }
  };

  // Bulk Operations Handlers
  const handleSelectContact = (contactId: number, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId]);
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.filteredContacts.map((contact: Contact) => contact.id));
      setSelectAll(true);
    } else {
      setSelectedContacts([]);
      setSelectAll(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return;

    const confirmMessage = `Are you sure you want to delete ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        // Delete contacts one by one (could be optimized with a bulk delete endpoint)
        for (const contactId of selectedContacts) {
          await deleteContactMutation.mutateAsync(contactId);
        }
        setSelectedContacts([]);
        setSelectAll(false);
        refetchContacts();
        refetchSummary();
        alert(`Successfully deleted ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}`);
      } catch (error) {
        console.error('Failed to delete contacts:', error);
        alert('Failed to delete some contacts. Please try again.');
      }
    }
  };

  const handleBulkExport = () => {
    if (selectedContacts.length === 0) return;

    const selectedContactsData = filteredContacts.filteredContacts.filter((contact: Contact) =>
      selectedContacts.includes(contact.id)
    );

    const csvContent = [
      ['Name', 'Email', 'Phone', 'District', 'Trust Level', 'Mobile Money', 'WhatsApp', 'Status'].join(','),
      ...selectedContactsData.map((contact: Contact) => [
        contact.name,
        contact.email || '',
        contact.phone || '',
        contact.district || '',
        getTrustLevelText(contact.trust_level),
        contact.mobile_money_provider || 'None',
        contact.whatsapp_number || '',
        contact.is_active ? 'Active' : 'Inactive'
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bulk-contacts-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert(`Exported ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} to CSV`);
  };

  const handleBulkUpdateStatus = async (newStatus: string) => {
    if (selectedContacts.length === 0) return;

    try {
      for (const contactId of selectedContacts) {
        const contact = filteredContacts.filteredContacts.find((c: Contact) => c.id === contactId);
        if (contact) {
          await updateContactMutation.mutateAsync({
            id: contactId,
            data: { ...contact, status: newStatus }
          });
        }
      }
      setSelectedContacts([]);
      setSelectAll(false);
      refetchContacts();
      alert(`Successfully updated ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} status to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update contacts:', error);
      alert('Failed to update some contacts. Please try again.');
    }
  };

  const handleBulkUpdateTrustLevel = async (newTrustLevel: number) => {
    if (selectedContacts.length === 0) return;

    try {
      for (const contactId of selectedContacts) {
        const contact = filteredContacts.filteredContacts.find((c: Contact) => c.id === contactId);
        if (contact) {
          await updateContactMutation.mutateAsync({
            id: contactId,
            data: { ...contact, trust_level: newTrustLevel }
          });
        }
      }
      setSelectedContacts([]);
      setSelectAll(false);
      refetchContacts();
      alert(`Successfully updated ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''} trust level`);
    } catch (error) {
      console.error('Failed to update contacts:', error);
      alert('Failed to update some contacts. Please try again.');
    }
  };

  const handleBulkSendMessage = () => {
    if (selectedContacts.length === 0) return;

    const selectedContactsData = filteredContacts.filteredContacts.filter((contact: Contact) =>
      selectedContacts.includes(contact.id)
    );

    const whatsappContacts = selectedContactsData.filter((c: Contact) => c.whatsapp_number);
    const smsContacts = selectedContactsData.filter((c: Contact) => c.phone && !c.whatsapp_number);

    let message = `Bulk messaging for ${selectedContacts.length} contacts:\n\n`;
    message += `WhatsApp: ${whatsappContacts.length} contacts\n`;
    message += `SMS: ${smsContacts.length} contacts\n\n`;
    message += 'This feature would integrate with WhatsApp Business API and SMS gateway.';

    alert(message);
  };
  
  // Quick View Modal Handlers
  const handleQuickView = (contact: Contact) => {
    setQuickViewContact(contact);
    setShowQuickView(true);
  };
  
  const handleQuickViewClose = () => {
    setShowQuickView(false);
    setQuickViewContact(null);
  };
  
  const handleQuickEdit = (contact: Contact) => {
    setShowQuickView(false);
    setEditingContact(contact);
    setShowContactModal(true);
  };
  
  // Communication Action Handlers
  const handleCallContact = (phoneNumber: string) => {
    if (!phoneNumber) {
      alert('No phone number available for this contact');
      return;
    }
    // Clean phone number (remove spaces, dashes, etc.)
    const cleanNumber = phoneNumber.replace(/[^+\d]/g, '');
    window.open(`tel:${cleanNumber}`, '_self');
  };
  
  const handleEmailContact = (email: string, contactName: string) => {
    if (!email) {
      alert('No email address available for this contact');
      return;
    }
    const subject = encodeURIComponent(`Hello ${contactName}`);
    const body = encodeURIComponent(`Dear ${contactName},\n\nI hope this message finds you well.\n\nBest regards`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_self');
  };
  
  const handleSMSContact = (phoneNumber: string, contactName: string) => {
    if (!phoneNumber) {
      alert('No phone number available for SMS');
      return;
    }
    // Clean phone number
    const cleanNumber = phoneNumber.replace(/[^+\d]/g, '');
    const message = encodeURIComponent(`Hello ${contactName}, `);
    
    // Check if it's iOS or Android for SMS handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      window.open(`sms:${cleanNumber}&body=${message}`, '_self');
    } else if (isAndroid) {
      window.open(`sms:${cleanNumber}?body=${message}`, '_self');
    } else {
      // Fallback for other platforms
      window.open(`sms:${cleanNumber}?body=${message}`, '_self');
    }
  };
  
  const handleWhatsAppContact = (whatsappNumber: string, contactName: string) => {
    if (!whatsappNumber) {
      alert('No WhatsApp number available for this contact');
      return;
    }
    // Clean WhatsApp number and ensure it has country code
    let cleanNumber = whatsappNumber.replace(/[^+\d]/g, '');
    
    // If number doesn't start with +, assume it's Uganda (+256) and add country code
    if (!cleanNumber.startsWith('+')) {
      // Remove leading zero if present for Uganda numbers
      if (cleanNumber.startsWith('0')) {
        cleanNumber = cleanNumber.substring(1);
      }
      // Add Uganda country code if it doesn't start with 256
      if (!cleanNumber.startsWith('256')) {
        cleanNumber = '256' + cleanNumber;
      }
    } else {
      // Remove + for WhatsApp API
      cleanNumber = cleanNumber.substring(1);
    }
    
    const message = encodeURIComponent(`Hello ${contactName}, I hope you're doing well!`);
    
    // Try WhatsApp API first, then fallback to web
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    const whatsappAppUrl = `whatsapp://send?phone=${cleanNumber}&text=${message}`;
    
    // Try to open WhatsApp app first, then fallback to web
    try {
      window.open(whatsappAppUrl, '_self');
      // If app doesn't open within 2 seconds, open web version
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 2000);
    } catch (error) {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Mobile-Responsive Page Header */}
        <div className="mb-6">
          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl shadow-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h1 className="text-xl font-bold">CRM</h1>
                  <p className="text-blue-100 text-sm">Customer Management</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                  >
                    <Bars3Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile Stats Row */}
              <div className="flex justify-between mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{summary.total_contacts || 0}</p>
                  <p className="text-blue-100 text-xs">Contacts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{summary.whatsapp_contacts || 0}</p>
                  <p className="text-blue-100 text-xs">WhatsApp</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{summary.high_trust_contacts || 0}</p>
                  <p className="text-blue-100 text-xs">High Trust</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Action Menu */}
            {isMobileMenuOpen && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-4">
                <div className="p-4 space-y-3">
                  <button
                    onClick={() => {
                      handleAddContact();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add New Contact
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setShowContactTypeModal(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <span className="mr-2">⚙️</span>
                      Manage Types
                    </button>
                    <button
                      onClick={() => {
                        exportContactsMutation.mutate();
                        setIsMobileMenuOpen(false);
                      }}
                      disabled={exportContactsMutation.isPending}
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      <span className="mr-2">📊</span>
                      {exportContactsMutation.isPending ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Header */}
          <div className="hidden sm:block">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CRM - Customer Relationship Management</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Manage customer relationships with African business context in mind.
                </p>
                {/* Performance indicator */}
                <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                    Optimized with AI caching
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
                    Lazy-loaded components
                  </span>
                  <span className="flex items-center">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
                    Virtual scrolling enabled
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowContactTypeModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  ⚙️ Manage Contact Types
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  📤 Import Contacts
                </button>
                <button
                  onClick={() => exportContactsMutation.mutate()}
                  disabled={exportContactsMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  📊 {exportContactsMutation.isPending ? 'Exporting...' : 'Export CSV'}
                </button>
                <button
                  onClick={handleAddContact}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile-Responsive Navigation Tabs */}
        <div className="mb-6">
          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="sm:hidden">
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview', icon: ChartBarIcon },
                { key: 'contacts', label: 'Contacts', icon: UserGroupIcon },
                { key: 'pipeline', label: 'Pipeline', icon: CurrencyDollarIcon },
                { key: 'analytics', label: 'Analytics', icon: SparklesIcon }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedView(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                    selectedView === tab.key
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden sm:block">
            <nav className="flex space-x-8">
              {['overview', 'contacts', 'pipeline', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedView(tab as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    selectedView === tab
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Section */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            {!summaryLoading && (
              <>
                {/* Mobile Cards - Single Column */}
                <div className="sm:hidden space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-semibold text-sm mb-2">Total Contacts</p>
                        <p className="text-4xl font-bold text-blue-900">{summary.total_contacts || 0}</p>
                      </div>
                      <div className="p-4 bg-blue-500 rounded-2xl">
                        <UserGroupIcon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200 rounded-xl p-4 shadow-md">
                      <div className="text-center">
                        <DevicePhoneMobileIcon className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-green-800 font-semibold text-xs mb-1">Mobile Money</p>
                        <p className="text-2xl font-bold text-green-900">{summary.mobile_money_users || 0}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-violet-100 border border-purple-200 rounded-xl p-4 shadow-md">
                      <div className="text-center">
                        <ChatBubbleLeftRightIcon className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-purple-800 font-semibold text-xs mb-1">WhatsApp</p>
                        <p className="text-2xl font-bold text-purple-900">{summary.whatsapp_contacts || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-red-50 to-rose-100 border border-red-200 rounded-xl p-4 shadow-md">
                      <div className="text-center">
                        <HeartIcon className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="text-red-800 font-semibold text-xs mb-1">High Trust</p>
                        <p className="text-2xl font-bold text-red-900">{summary.high_trust_contacts || 0}</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 rounded-xl p-4 shadow-md">
                      <div className="text-center">
                        <CurrencyDollarIcon className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                        <p className="text-yellow-800 font-semibold text-xs mb-1">Pipeline</p>
                        <p className="text-lg font-bold text-yellow-900">UGX {((summary.total_pipeline_value || 0) / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Desktop Cards - Grid Layout */}
                <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UserGroupIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">Total Contacts</dt>
                            <dd className="text-3xl font-bold text-gray-900">{summary.total_contacts || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <DevicePhoneMobileIcon className="h-8 w-8 text-blue-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">Mobile Money Users</dt>
                            <dd className="text-3xl font-bold text-gray-900">{summary.mobile_money_users || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ChatBubbleLeftRightIcon className="h-8 w-8 text-green-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">WhatsApp Contacts</dt>
                            <dd className="text-3xl font-bold text-gray-900">{summary.whatsapp_contacts || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <HeartIcon className="h-8 w-8 text-red-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">High Trust Contacts</dt>
                            <dd className="text-3xl font-bold text-gray-900">{summary.high_trust_contacts || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <UserGroupIcon className="h-8 w-8 text-purple-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">Community Members</dt>
                            <dd className="text-3xl font-bold text-gray-900">{summary.community_group_members || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <BanknotesIcon className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">Cash Preferred</dt>
                            <dd className="text-3xl font-bold text-gray-900">{summary.cash_preferred_contacts || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <CurrencyDollarIcon className="h-8 w-8 text-indigo-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">Pipeline Value</dt>
                            <dd className="text-3xl font-bold text-gray-900">
                              UGX {(summary.total_pipeline_value || 0).toLocaleString()}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="p-8">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <ChartBarIcon className="h-8 w-8 text-orange-400" />
                        </div>
                        <div className="ml-6 w-0 flex-1">
                          <dl>
                            <dt className="text-base font-medium text-gray-500 mb-2">Open Opportunities</dt>
                            <dd className="text-3xl font-bold text-gray-900">{summary.open_opportunities || 0}</dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Quick Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mobile Money Breakdown */}
              <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Mobile Money Providers</h3>
                <div className="space-y-4">
                  {summary.mobile_money_breakdown?.map((provider: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-base font-medium text-gray-700">{provider.mobile_money_provider}</span>
                      <span className="text-base font-semibold text-gray-600">{provider.count} users</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Language Distribution */}
              <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Primary Languages</h3>
                <div className="space-y-4">
                  {summary.language_breakdown?.map((lang: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-base font-medium text-gray-700">{lang.primary_language}</span>
                      <span className="text-base font-semibold text-gray-600">{lang.count} contacts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contacts Section */}
        {selectedView === 'contacts' && (
          <Suspense fallback={<ModalFallback />}>
            <EnhancedContactsView
              contacts={filteredContacts.paginatedContacts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              sortField={sortField as keyof Contact}
              sortDirection={sortDirection}
              onSort={(field) => handleSort(field as string)}
              currentPage={currentPage}
              totalPages={filteredContacts.totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              viewMode={contactViewMode}
              onViewModeChange={setContactViewMode}
              showAdvancedFilters={showAdvancedFilters}
              onToggleAdvancedFilters={() => setShowAdvancedFilters(!showAdvancedFilters)}
              advancedFilters={advancedFilters}
              onAdvancedFiltersChange={setAdvancedFilters}
              uniqueDistricts={filteredContacts.uniqueDistricts}
              uniqueProviders={filteredContacts.uniqueProviders}
              uniqueChannels={filteredContacts.uniqueChannels}
              hasActiveFilters={hasActiveFilters()}
              onClearFilters={clearAllFilters}
              onViewContact={handleViewContact}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
              isLoading={contactsLoading}
              getTrustLevelColor={getTrustLevelColor}
              getTrustLevelText={getTrustLevelText}
              getChannelIcon={getChannelIcon}
              handleWhatsAppContact={handleWhatsAppContact}
              handleCallContact={handleCallContact}
              handleSMSContact={handleSMSContact}
              handleEmailContact={handleEmailContact}
            />
          </Suspense>
        )}

        {/* Pipeline Section */}
        {selectedView === 'pipeline' && (
          <div>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => {
                  setEditingOpportunity(null);
                  setShowOpportunityModal(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Opportunity
              </button>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <SalesPipelineView />
            </Suspense>
          </div>
        )}

        {/* Analytics Section */}
        {selectedView === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { key: 'mobile-money', label: 'Mobile Money', icon: DevicePhoneMobileIcon },
                  { key: 'community', label: 'Community Groups', icon: UserGroupIcon },
                  { key: 'communication', label: 'Communication', icon: ChatBubbleLeftRightIcon },
                  { key: 'regional', label: 'Regional Insights', icon: MapPinIcon },
                  { key: 'segmentation', label: 'Customer Segmentation', icon: UsersIcon },
                  {
                    key: 'ai-insights',
                    label: '🤖 AI Insights',
                    icon: SparklesIcon,
                    badge: aiInsightsEnabled ? 'AI' : undefined
                  },
                ].map((tab) => (
                <button
                    key={tab.key}
                    onClick={() => setSelectedAnalyticsTab(tab.key as any)}
                    className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap relative ${
                      selectedAnalyticsTab === tab.key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className={`-ml-0.5 mr-2 h-5 w-5 ${
                      selectedAnalyticsTab === tab.key ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {tab.label}
                    {tab.badge && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {tab.badge}
                      </span>
                    )}
                    {tab.key === 'ai-insights' && aiInsightsEnabled && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    )}
                </button>
                ))}
              </nav>
              </div>
              
            {/* Analytics Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedAnalyticsTab === 'mobile-money' && !mobileMoneyLoading && (
                <>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Mobile Money Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Users:</span>
                        <span className="text-sm font-medium">{mobileMoneyAnalytics.total_mobile_money_users || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Verified Users:</span>
                        <span className="text-sm font-medium">{mobileMoneyAnalytics.verified_mobile_money_users || 0}</span>
                      </div>
                    </div>
                </div>
                
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Breakdown</h3>
                    <div className="space-y-3">
                      {mobileMoneyAnalytics.provider_breakdown?.map((provider: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{provider.mobile_money_provider}</span>
                          <div className="text-right">
                            <div className="text-sm text-gray-900">{provider.count} total</div>
                            <div className="text-sm text-green-600">{provider.verified_count} verified</div>
                          </div>
                        </div>
                      ))}
                    </div>
                </div>
                </>
              )}

              {selectedAnalyticsTab === 'community' && !communityLoading && (
                <>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Community Overview</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Members:</span>
                        <span className="text-sm font-medium">{communityAnalytics.total_group_members || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Total Groups:</span>
                        <span className="text-sm font-medium">{communityAnalytics.total_groups || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Monthly Contributions:</span>
                        <span className="text-sm font-medium">UGX {(communityAnalytics.total_monthly_contributions || 0).toLocaleString()}</span>
                      </div>
                    </div>
                </div>
                
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Role Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(communityAnalytics.role_distribution || {}).map(([role, count]: [string, any], index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
                          <span className="text-sm text-gray-900">{count} members</span>
                        </div>
                      ))}
                    </div>
                </div>
                </>
              )}

              {selectedAnalyticsTab === 'communication' && !communicationLoading && (
                <>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Channel Preferences</h3>
                    <div className="space-y-3">
                      {communicationAnalytics.preferred_channels?.map((channel: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700 capitalize flex items-center">
                            <span className="mr-2">{getChannelIcon(channel.preferred_communication_channel)}</span>
                            {channel.preferred_communication_channel}
                          </span>
                          <span className="text-sm text-gray-900">{channel.count} contacts</span>
                </div>
                      ))}
                </div>
                  </div>
                  
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">WhatsApp Adoption</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">WhatsApp Users:</span>
                        <span className="text-sm font-medium">{communicationAnalytics.whatsapp_adoption?.total_whatsapp_users || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Business Verified:</span>
                        <span className="text-sm font-medium">{communicationAnalytics.whatsapp_adoption?.verified_whatsapp_business || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Preferred WhatsApp:</span>
                        <span className="text-sm font-medium">{communicationAnalytics.whatsapp_adoption?.whatsapp_preferred || 0}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedAnalyticsTab === 'regional' && !regionalLoading && (
                <>
                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Location Distribution</h3>
                    <div className="space-y-3">
                      {regionalInsights.location_distribution?.by_district?.slice(0, 5).map((district: any, index: number) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{district.district}</span>
                          <div className="text-right">
                            <div className="text-sm text-gray-900">{district.count} contacts</div>
                            <div className="text-sm text-gray-500">Avg CLV: UGX {Math.round(district.avg_clv || 0).toLocaleString()}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Inclusion</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Bank Account Holders:</span>
                        <span className="text-sm font-medium">{regionalInsights.financial_inclusion?.bank_account_holders || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Mobile Money Users:</span>
                        <span className="text-sm font-medium">{regionalInsights.financial_inclusion?.mobile_money_users || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Cash Preferred:</span>
                        <span className="text-sm font-medium">{regionalInsights.financial_inclusion?.cash_preferred || 0}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedAnalyticsTab === 'segmentation' && (
                <Suspense fallback={<LoadingSpinner size="lg" />}>
                  <CustomerSegmentationDashboard />
                </Suspense>
              )}

              {/* 🤖 AI Insights Tab */}
              {selectedAnalyticsTab === 'ai-insights' && (
                <div className="space-y-6">
                  {/* AI Controls */}
                  <div className="bg-white shadow rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">🤖 AI-Powered CRM Intelligence</h3>
                      <div className="flex items-center space-x-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={aiInsightsEnabled}
                            onChange={(e) => setAiInsightsEnabled(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Enable AI Insights</span>
                        </label>
                        <button
                          onClick={() => {
                            // Refresh all AI data
                            window.location.reload();
                          }}
                          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                        >
                          🔄 Refresh AI Data
                        </button>
                      </div>
                    </div>

                    {/* AI Sub-tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {[
                          { key: 'lead-scoring', label: 'Lead Scoring', icon: '🎯' },
                          { key: 'deal-prediction', label: 'Deal Prediction', icon: '🔮' },
                          { key: 'segmentation', label: 'Segmentation', icon: '👥' },
                          { key: 'pricing', label: 'Pricing Optimization', icon: '💰' },
                          { key: 'customer-360', label: '360° View', icon: '🔍' },
                          { key: 'journey-mapping', label: 'Journey Mapping', icon: '🗺️' },
                          { key: 'voice-of-customer', label: 'Voice of Customer', icon: '💬' },
                          { key: 'personalization', label: 'Personalization', icon: '🎨' },
                        ].map((tab) => (
                          <button
                            key={tab.key}
                            onClick={() => setSelectedAIView(tab.key as any)}
                            className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                              selectedAIView === tab.key
                                ? 'border-purple-500 text-purple-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                  </div>

                  {/* AI Content */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Lead Scoring */}
                    {selectedAIView === 'lead-scoring' && (
                      <>
                        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                          <h3 className="text-xl font-semibold text-gray-900 mb-6">🎯 Lead Scoring Dashboard</h3>
                          {leadScoringLoading ? (
                            <LoadingSpinner size="lg" />
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-3 gap-6">
                                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                                  <p className="text-3xl font-bold text-green-600">{leadScoring.hot_leads || 0}</p>
                                  <p className="text-base text-green-700 font-medium">Hot Leads</p>
                                </div>
                                <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                                  <p className="text-3xl font-bold text-yellow-600">{leadScoring.warm_leads || 0}</p>
                                  <p className="text-base text-yellow-700 font-medium">Warm Leads</p>
                                </div>
                                <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                                  <p className="text-3xl font-bold text-red-600">{leadScoring.cold_leads || 0}</p>
                                  <p className="text-base text-red-700 font-medium">Cold Leads</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">Top Scoring Leads</h4>
                                {(leadScoring.top_leads || []).slice(0, 5).map((lead: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-base font-medium">{lead.name}</span>
                                    <span className={`px-3 py-2 text-sm font-semibold rounded-full ${
                                      lead.score > 80 ? 'bg-green-100 text-green-800' :
                                      lead.score > 60 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {lead.score}/100
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                          <h3 className="text-xl font-semibold text-gray-900 mb-6">📊 Scoring Insights</h3>
                          <div className="space-y-6">
                            <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                              <p className="text-base text-blue-800">
                                <strong>Conversion Rate:</strong> {leadScoring.conversion_rate || 0}%
                              </p>
                            </div>
                            <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                              <p className="text-base text-purple-800">
                                <strong>Avg. Score:</strong> {leadScoring.average_score || 0}/100
                              </p>
                            </div>
                            <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                              <p className="text-base text-green-800">
                                <strong>AI Accuracy:</strong> {leadScoring.ai_accuracy || 0}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Deal Prediction */}
                    {selectedAIView === 'deal-prediction' && (
                      <>
                        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                          <h3 className="text-xl font-semibold text-gray-900 mb-6">🔮 Deal Prediction Analytics</h3>
                          {dealPredictionLoading ? (
                            <LoadingSpinner size="lg" />
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-6 bg-green-50 rounded-xl border border-green-200">
                                  <p className="text-3xl font-bold text-green-600">{dealPrediction.predicted_wins || 0}</p>
                                  <p className="text-base text-green-700 font-medium">Predicted Wins</p>
                                </div>
                                <div className="text-center p-6 bg-red-50 rounded-xl border border-red-200">
                                  <p className="text-3xl font-bold text-red-600">{dealPrediction.predicted_losses || 0}</p>
                                  <p className="text-base text-red-700 font-medium">Predicted Losses</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">Deal Forecast</h4>
                                {(dealPrediction.forecast || []).slice(0, 5).map((deal: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-base font-medium">{deal.name}</span>
                                    <span className={`px-3 py-2 text-sm font-semibold rounded-full ${
                                      deal.probability > 70 ? 'bg-green-100 text-green-800' :
                                      deal.probability > 40 ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {deal.probability}% win rate
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                          <h3 className="text-xl font-semibold text-gray-900 mb-6">💡 AI Recommendations</h3>
                          <div className="space-y-6">
                            {(dealPrediction.recommendations || []).slice(0, 3).map((rec: any, index: number) => (
                              <div key={index} className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                                <p className="text-base text-blue-800 font-medium">{rec.action}</p>
                                <p className="text-sm text-blue-600 mt-2">Expected impact: {rec.impact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Customer Segmentation */}
                    {selectedAIView === 'segmentation' && (
                      <>
                        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                          <h3 className="text-xl font-semibold text-gray-900 mb-6">👥 Customer Segmentation</h3>
                          {segmentationLoading ? (
                            <LoadingSpinner size="lg" />
                          ) : (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-6">
                                <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                                  <p className="text-3xl font-bold text-purple-600">{segmentation.total_segments || 0}</p>
                                  <p className="text-base text-purple-700 font-medium">Total Segments</p>
                                </div>
                                <div className="text-center p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                                  <p className="text-3xl font-bold text-indigo-600">{segmentation.avg_segment_size || 0}</p>
                                  <p className="text-base text-indigo-700 font-medium">Avg Segment Size</p>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900">Segment Breakdown</h4>
                                {(segmentation.segments || []).slice(0, 4).map((segment: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                                    <span className="text-base font-medium">{segment.name}</span>
                                    <span className="text-base font-semibold text-gray-600">{segment.count} customers</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white shadow-lg rounded-xl border border-gray-100 p-8">
                          <h3 className="text-xl font-semibold text-gray-900 mb-6">🎯 Segment Insights</h3>
                          <div className="space-y-6">
                            {(segmentation.insights || []).slice(0, 3).map((insight: any, index: number) => (
                              <div key={index} className="p-6 bg-green-50 rounded-xl border border-green-200">
                                <p className="text-base text-green-800 font-medium">{insight.description}</p>
                                <p className="text-sm text-green-600 mt-2">Revenue potential: UGX {insight.revenue_potential?.toLocaleString()}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Pricing Optimization */}
                    {selectedAIView === 'pricing' && (
                      <>
                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">💰 Pricing Optimization</h3>
                          {pricingLoading ? (
                            <LoadingSpinner size="lg" />
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-2xl font-bold text-green-600">+{pricingOptimization.revenue_increase || 0}%</p>
                                  <p className="text-sm text-green-700">Revenue Increase</p>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-2xl font-bold text-blue-600">{pricingOptimization.optimized_products || 0}</p>
                                  <p className="text-sm text-blue-700">Optimized Products</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Dynamic Pricing Suggestions</h4>
                                {(pricingOptimization.suggestions || []).slice(0, 3).map((suggestion: any, index: number) => (
                                  <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-sm font-medium text-yellow-900">{suggestion.product_name}</p>
                                    <p className="text-sm text-yellow-800">Suggested: UGX {suggestion.suggested_price} (Current: UGX {suggestion.current_price})</p>
                                    <p className="text-xs text-yellow-600">Expected impact: {suggestion.impact}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Price Elasticity</h3>
                          <div className="space-y-3">
                            <div className="p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm text-purple-800">
                                <strong>Average Elasticity:</strong> {pricingOptimization.avg_elasticity || 0}
                              </p>
                            </div>
                            <div className="p-3 bg-indigo-50 rounded-lg">
                              <p className="text-sm text-indigo-800">
                                <strong>Optimal Price Points:</strong> {pricingOptimization.optimal_points || 0} identified
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Customer 360 View */}
                    {selectedAIView === 'customer-360' && (
                      <>
                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">🔍 Customer 360° View</h3>
                          <div className="mb-4">
                            <select
                              value={selectedContactForAI || ''}
                              onChange={(e) => setSelectedContactForAI(parseInt(e.target.value) || null)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select a contact...</option>
                              {contacts.slice(0, 10).map((contact) => (
                                <option key={contact.id} value={contact.id}>
                                  {contact.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {selectedContactForAI && customer360Loading ? (
                            <LoadingSpinner size="lg" />
                          ) : selectedContactForAI && customer360View ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <p className="text-sm font-medium text-blue-900">Lifetime Value</p>
                                  <p className="text-lg font-bold text-blue-600">UGX {customer360View.lifetime_value?.toLocaleString() || 0}</p>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg">
                                  <p className="text-sm font-medium text-green-900">Engagement Score</p>
                                  <p className="text-lg font-bold text-green-600">{customer360View.engagement_score || 0}/100</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Key Insights</h4>
                                {(customer360View.insights || []).slice(0, 3).map((insight: any, index: number) => (
                                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                    {insight.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">Select a contact to view their 360° profile</p>
                          )}
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">📊 Customer Metrics</h3>
                          {selectedContactForAI && customer360View ? (
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Orders:</span>
                                <span className="font-medium">{customer360View.total_orders || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Avg Order Value:</span>
                                <span className="font-medium">UGX {customer360View.avg_order_value?.toLocaleString() || 0}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Last Purchase:</span>
                                <span className="font-medium">{customer360View.last_purchase || 'N/A'}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No data available</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Journey Mapping */}
                    {selectedAIView === 'journey-mapping' && (
                      <>
                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">🗺️ Customer Journey Mapping</h3>
                          <div className="mb-4">
                            <select
                              value={selectedContactForAI || ''}
                              onChange={(e) => setSelectedContactForAI(parseInt(e.target.value) || null)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select a contact...</option>
                              {contacts.slice(0, 10).map((contact) => (
                                <option key={contact.id} value={contact.id}>
                                  {contact.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {selectedContactForAI && journeyMappingLoading ? (
                            <LoadingSpinner size="lg" />
                          ) : selectedContactForAI && journeyMapping ? (
                            <div className="space-y-4">
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-900">Current Stage</p>
                                <p className="text-lg font-bold text-purple-600">{journeyMapping.current_stage || 'Unknown'}</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Journey Steps</h4>
                                {(journeyMapping.steps || []).slice(0, 5).map((step: any, index: number) => (
                                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                    <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm">{step.description}</span>
                                    <span className="text-xs text-gray-500 ml-auto">{step.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">Select a contact to view their journey</p>
                          )}
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Next Best Actions</h3>
                          {selectedContactForAI && journeyMapping ? (
                            <div className="space-y-3">
                              {(journeyMapping.next_actions || []).slice(0, 3).map((action: any, index: number) => (
                                <div key={index} className="p-3 bg-green-50 rounded-lg">
                                  <p className="text-sm font-medium text-green-900">{action.title}</p>
                                  <p className="text-sm text-green-800">{action.description}</p>
                                  <p className="text-xs text-green-600 mt-1">Confidence: {action.confidence}%</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No recommendations available</p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Voice of Customer */}
                    {selectedAIView === 'voice-of-customer' && (
                      <>
                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">💬 Voice of Customer Analytics</h3>
                          {voiceOfCustomerLoading ? (
                            <LoadingSpinner size="lg" />
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                  <p className="text-2xl font-bold text-blue-600">{voiceOfCustomer.total_feedback || 0}</p>
                                  <p className="text-sm text-blue-700">Total Feedback</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                  <p className="text-2xl font-bold text-green-600">{voiceOfCustomer.sentiment_score || 0}%</p>
                                  <p className="text-sm text-green-700">Positive Sentiment</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Top Themes</h4>
                                {(voiceOfCustomer.top_themes || []).slice(0, 4).map((theme: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                    <span className="text-sm font-medium">{theme.topic}</span>
                                    <span className="text-sm text-gray-600">{theme.mentions} mentions</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Recent Feedback</h3>
                          <div className="space-y-3">
                            {(voiceOfCustomer.recent_feedback || []).slice(0, 3).map((feedback: any, index: number) => (
                              <div key={index} className="p-3 bg-yellow-50 rounded-lg">
                                <p className="text-sm text-yellow-900">"{feedback.comment}"</p>
                                <p className="text-xs text-yellow-600 mt-1">- {feedback.customer_name} ({feedback.sentiment})</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Personalization */}
                    {selectedAIView === 'personalization' && (
                      <>
                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">🎨 Personalization Engine</h3>
                          <div className="mb-4">
                            <select
                              value={selectedContactForAI || ''}
                              onChange={(e) => setSelectedContactForAI(parseInt(e.target.value) || null)}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Select a contact...</option>
                              {contacts.slice(0, 10).map((contact) => (
                                <option key={contact.id} value={contact.id}>
                                  {contact.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          {selectedContactForAI && personalizationLoading ? (
                            <LoadingSpinner size="lg" />
                          ) : selectedContactForAI && personalization ? (
                            <div className="space-y-4">
                              <div className="p-3 bg-pink-50 rounded-lg">
                                <p className="text-sm font-medium text-pink-900">Personalization Score</p>
                                <p className="text-lg font-bold text-pink-600">{personalization.score || 0}/100</p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-900">Recommended Actions</h4>
                                {(personalization.recommendations || []).slice(0, 3).map((rec: any, index: number) => (
                                  <div key={index} className="p-3 bg-purple-50 rounded-lg">
                                    <p className="text-sm font-medium text-purple-900">{rec.type}</p>
                                    <p className="text-sm text-purple-800">{rec.description}</p>
                                    <p className="text-xs text-purple-600 mt-1">Expected uplift: {rec.uplift}%</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">Select a contact to view personalization recommendations</p>
                          )}
                        </div>

                        <div className="bg-white shadow rounded-lg p-6">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Personalized Offers</h3>
                          {selectedContactForAI && personalization ? (
                            <div className="space-y-3">
                              {(personalization.offers || []).slice(0, 3).map((offer: any, index: number) => (
                                <div key={index} className="p-3 bg-green-50 rounded-lg">
                                  <p className="text-sm font-medium text-green-900">{offer.title}</p>
                                  <p className="text-sm text-green-800">{offer.description}</p>
                                  <p className="text-xs text-green-600 mt-1">Discount: {offer.discount}%</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No personalized offers available</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      )}

        {/* Quick View Modal */}
        {showQuickView && quickViewContact && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header with Gradient */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{quickViewContact.name}</h2>
                    <p className="text-blue-100 opacity-90">{quickViewContact.email || 'No email provided'}</p>
                  </div>
                  <button
                    onClick={handleQuickViewClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Phone</p>
                    <p className="text-base font-medium text-gray-900">{quickViewContact.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Trust Level</p>
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTrustLevelColor(quickViewContact.trust_level)}`}>
                      {getTrustLevelText(quickViewContact.trust_level)}
                    </span>
                  </div>
                </div>

                {/* Communication Channels */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-3">Communication</p>
                  <div className="space-y-2">
                    {quickViewContact.whatsapp_number && (
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-green-500 text-lg">📱</span>
                          <div>
                            <p className="font-medium text-green-900">WhatsApp</p>
                            <p className="text-sm text-green-700">{quickViewContact.whatsapp_number}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleWhatsAppContact(quickViewContact.whatsapp_number!, quickViewContact.name)}
                          className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors active:scale-95"
                          title="Open WhatsApp"
                        >
                          <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {quickViewContact.phone && (
                      <>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-blue-500 text-lg">📞</span>
                            <div>
                              <p className="font-medium text-blue-900">Phone Call</p>
                              <p className="text-sm text-blue-700">{quickViewContact.phone}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleCallContact(quickViewContact.phone!)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors active:scale-95"
                            title="Make a call"
                          >
                            <PhoneIcon className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="flex items-center space-x-3">
                            <span className="text-purple-500 text-lg">💬</span>
                            <div>
                              <p className="font-medium text-purple-900">SMS Message</p>
                              <p className="text-sm text-purple-700">{quickViewContact.phone}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleSMSContact(quickViewContact.phone!, quickViewContact.name)}
                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors active:scale-95"
                            title="Send SMS"
                          >
                            <span className="text-xs font-bold">SMS</span>
                          </button>
                        </div>
                      </>
                    )}
                    
                    {quickViewContact.email && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-500 text-lg">📧</span>
                          <div>
                            <p className="font-medium text-gray-900">Email</p>
                            <p className="text-sm text-gray-700">{quickViewContact.email}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleEmailContact(quickViewContact.email!, quickViewContact.name)}
                          className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors active:scale-95"
                          title="Send email"
                        >
                          <EnvelopeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    
                    {!quickViewContact.phone && !quickViewContact.email && !quickViewContact.whatsapp_number && (
                      <div className="text-center py-4 text-gray-500">
                        <p className="text-sm">No communication methods available</p>
                        <p className="text-xs">Please update contact information</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Customer Value</p>
                    <p className="text-xl font-bold text-indigo-600">
                      UGX {(quickViewContact.customer_lifetime_value || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Payment Preferences</p>
                    <div className="flex space-x-2">
                      {quickViewContact.mobile_money_provider && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {quickViewContact.mobile_money_provider}
                        </span>
                      )}
                      {quickViewContact.has_bank_account && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Bank
                        </span>
                      )}
                      {quickViewContact.prefers_cash_transactions && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                          Cash
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location Information */}
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Location</p>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                    <span>{quickViewContact.district || 'Unknown district'}</span>
                    {quickViewContact.village && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span>{quickViewContact.village}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleQuickEdit(quickViewContact)}
                    className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Contact
                  </button>
                  <button
                    onClick={() => {
                      handleViewContact(quickViewContact);
                      setShowQuickView(false);
                    }}
                    className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5 mr-2" />
                    Full Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lazy-loaded Modals with Suspense */}
        <Suspense fallback={<ModalFallback />}>
          {showContactModal && (
            <ContactModal
              isOpen={showContactModal}
              onClose={handleContactModalClose}
              contact={editingContact as any}
              onSuccess={handleContactSuccess}
            />
          )}

          {showDetailsModal && (
            <ContactDetailsModal
              isOpen={showDetailsModal}
              onClose={handleDetailsModalClose}
              contact={viewingContact}
              onEdit={handleEditFromDetails}
            />
          )}

          {showContactTypeModal && (
            <ContactTypeModal
              isOpen={showContactTypeModal}
              onClose={() => setShowContactTypeModal(false)}
            />
          )}

          {showImportModal && (
            <ContactImportModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onImport={handleImportContacts}
            />
          )}

          {showOpportunityModal && (
            <SalesOpportunityModal
              isOpen={showOpportunityModal}
              onClose={() => setShowOpportunityModal(false)}
              opportunity={editingOpportunity}
              onSuccess={() => {
                refetchOpportunities();
                setShowOpportunityModal(false);
              }}
            />
          )}
        </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
