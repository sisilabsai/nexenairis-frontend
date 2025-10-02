'use client';

import { useState, useMemo } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  CogIcon,
  EllipsisVerticalIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  EyeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  MapPinIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ClockIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  useSuppliers, 
  useSupplierAnalytics, 
  useDeleteSupplier,
  useBulkSupplierOperations,
  useExportSuppliers
} from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import SupplierModal from '../../components/SupplierModal';
import SupplierCodeSettings from '../../components/SupplierCodeSettings';

interface Supplier {
  id: number;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  mobile?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  status: 'active' | 'inactive' | 'suspended';
  payment_terms: 'net_30' | 'net_60' | 'net_90' | 'immediate' | string;
  credit_limit: number;
  tax_id?: string;
  is_active: boolean;
  created_at: string;
}

export default function SuppliersPage() {
  const [showModal, setShowModal] = useState(false);
  const [showCodeSettings, setShowCodeSettings] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewSupplier, setQuickViewSupplier] = useState<Supplier | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Supplier>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // API hooks
  const { data: suppliersData, isLoading: suppliersLoading, error: suppliersError, refetch: refetchSuppliers } = useSuppliers();
  const { data: analyticsData, isLoading: analyticsLoading, error: analyticsError } = useSupplierAnalytics();
  const deleteSupplierMutation = useDeleteSupplier();
  const bulkOperationsMutation = useBulkSupplierOperations();
  const exportMutation = useExportSuppliers();

  const suppliers = ((suppliersData as any)?.data?.data as Supplier[]) || [];
  const analytics = (analyticsData as any)?.data || {
    overview: { 
      total_suppliers: 0, 
      active_suppliers: 0, 
      inactive_suppliers: 0, 
      recent_additions: 0, 
      activity_rate: 0 
    },
    financial: {
      avg_credit_limit: 0,
      total_credit_exposure: 0,
      min_credit_limit: 0,
      max_credit_limit: 0
    },
    breakdowns: {
      payment_terms: {},
      countries: []
    },
    trends: {
      monthly_growth: []
    },
    recent_activity: []
  };

  // Filter and sort suppliers
  const filteredAndSortedSuppliers = useMemo(() => {
    const filtered = suppliers.filter(supplier => {
      const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && supplier.is_active) ||
                           (statusFilter === 'inactive' && !supplier.is_active);
      return matchesSearch && matchesStatus;
    });

    // Sort suppliers
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return filtered;
  }, [suppliers, searchTerm, statusFilter, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredAndSortedSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateSupplier = () => {
    setEditingSupplier(null);
    setShowModal(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleQuickView = (supplier: Supplier) => {
    setQuickViewSupplier(supplier);
    setShowQuickView(true);
  };

  const handleQuickViewClose = () => {
    setShowQuickView(false);
    setQuickViewSupplier(null);
  };

  const handleQuickEdit = () => {
    if (quickViewSupplier) {
      setEditingSupplier(quickViewSupplier);
      setShowQuickView(false);
      setShowModal(true);
    }
  };

  const handleQuickDelete = () => {
    if (quickViewSupplier) {
      setDeleteConfirm(quickViewSupplier.id);
      setShowQuickView(false);
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    try {
      await deleteSupplierMutation.mutateAsync(id);
      setDeleteConfirm(null);
      refetchSuppliers();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingSupplier(null);
    refetchSuppliers();
  };

  const handleSelectSupplier = (id: number) => {
    setSelectedSuppliers(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSuppliers.length === paginatedSuppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers(paginatedSuppliers.map(s => s.id));
    }
  };

  const handleBulkOperation = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedSuppliers.length === 0) return;

    try {
      await bulkOperationsMutation.mutateAsync({
        action,
        supplier_ids: selectedSuppliers
      });
      setSelectedSuppliers([]);
      setShowBulkMenu(false);
      refetchSuppliers();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const result = await exportMutation.mutateAsync(format);
      
      // Type assertion to fix TypeScript errors
      const exportData = (result as any).data as { content: string; filename: string; format: string };
      
      if (!exportData || !exportData.content) {
        console.error('Invalid export data:', result);
        throw new Error('Export data is missing or invalid');
      }
      
      // Create and download file
      const blob = new Blob([exportData.content], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = exportData.filename || `suppliers_export_${new Date().toISOString().slice(0,10)}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Show success notification
      setNotification({ type: 'success', message: `Export completed! Downloaded ${exportData.filename}` });
      setTimeout(() => setNotification(null), 5000);
    } catch (error: any) {
      console.error('Export failed:', error);
      setNotification({ type: 'error', message: `Export failed: ${error?.message || 'Unknown error'}` });
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-gray-100 text-gray-800';
  };

  const getPaymentTermsText = (terms: string) => {
    const termMap: { [key: string]: string } = {
      'net_30': 'Net 30',
      'net_60': 'Net 60',
      'net_90': 'Net 90',
      'immediate': 'Immediate',
      'net_15': 'Net 15',
      'net_45': 'Net 45'
    };
    return termMap[terms] || terms;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Mobile-First Page Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">
                Supplier Management
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-500">
                Manage suppliers, track performance & relationships.
              </p>
            </div>
            
            {/* Mobile Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              {/* Export Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  disabled={exportMutation.isPending}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {exportMutation.isPending ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  ) : (
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  )}
                  <span className="hidden sm:inline">{exportMutation.isPending ? 'Exporting...' : 'Export'}</span>
                  <span className="sm:hidden">{exportMutation.isPending ? 'Exporting...' : 'Export Data'}</span>
                </button>
                {showBulkMenu && !exportMutation.isPending && (
                  <div className="absolute right-0 sm:right-0 left-0 sm:left-auto mt-2 w-full sm:w-48 bg-white rounded-lg shadow-lg z-20 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleExport('csv');
                          setShowBulkMenu(false);
                        }}
                        className="block w-full px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center transition-colors duration-200"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExport('json');
                          setShowBulkMenu(false);
                        }}
                        className="block w-full px-4 py-3 sm:py-2 text-sm text-gray-700 hover:bg-gray-100 text-left flex items-center transition-colors duration-200"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-3" />
                        Export as JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Settings Button */}
              <button
                onClick={() => setShowCodeSettings(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                title="Configure supplier code settings"
              >
                <CogIcon className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Code Settings</span>
                <span className="sm:hidden">Configure Codes</span>
              </button>
              
              {/* Add Supplier Button */}
              <button
                onClick={handleCreateSupplier}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-3 sm:py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                <span>Add Supplier</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile-Optimized Analytics Overview */}
        {!analyticsLoading && !analyticsError && (
          <div className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            <div className="bg-white overflow-hidden shadow-sm hover:shadow-md rounded-xl border border-gray-100 transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      <BuildingOfficeIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Suppliers</dt>
                      <dd className="text-lg sm:text-xl font-bold text-gray-900">{analytics.overview.total_suppliers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm hover:shadow-md rounded-xl border border-gray-100 transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <UserGroupIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Active Suppliers</dt>
                      <dd className="text-lg sm:text-xl font-bold text-gray-900">{analytics.overview.active_suppliers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm hover:shadow-md rounded-xl border border-gray-100 transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Recent Additions</dt>
                      <dd className="text-lg sm:text-xl font-bold text-gray-900">{analytics.overview.recent_additions}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm hover:shadow-md rounded-xl border border-gray-100 transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <DocumentTextIcon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Activity Rate</dt>
                      <dd className="text-lg sm:text-xl font-bold text-gray-900">{analytics.overview.activity_rate}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-sm hover:shadow-md rounded-xl border border-gray-100 transition-shadow duration-200">
              <div className="p-4 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Avg Credit Limit</dt>
                      <dd className="text-lg sm:text-xl font-bold text-gray-900">
                        <span className="text-sm sm:text-base">UGX</span> {analytics.financial.avg_credit_limit.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile-Optimized Filters and Search */}
        <div className="mb-4 sm:mb-6 bg-white shadow-sm hover:shadow-md rounded-xl border border-gray-100 p-4 sm:p-6 transition-shadow duration-200">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers by name, code, or email..."
                className="block w-full pl-12 pr-4 py-3 sm:py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base transition-colors duration-200"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 sm:flex-initial sm:min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1 sm:mb-0 sm:sr-only">Status Filter</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full sm:w-40 px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-colors duration-200"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
              <div className="flex-1 sm:flex-initial sm:min-w-0">
                <label className="block text-xs font-medium text-gray-700 mb-1 sm:mb-0 sm:sr-only">Items per Page</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="block w-full sm:w-36 px-3 py-3 sm:py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white transition-colors duration-200"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mobile-Optimized Bulk Actions */}
          {selectedSuppliers.length > 0 && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CheckIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-blue-900">
                    {selectedSuppliers.length} supplier{selectedSuppliers.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => handleBulkOperation('activate')}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                  >
                    <CheckIcon className="h-4 w-4 mr-2" />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkOperation('deactivate')}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-200"
                  >
                    <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkOperation('delete')}
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile-First Responsive Suppliers Display */}
        <div className="bg-white shadow-sm hover:shadow-md rounded-xl border border-gray-100 transition-shadow duration-200">
          {suppliersLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : suppliersError ? (
            <div className="p-8">
              <ErrorMessage message={suppliersError.message || 'Failed to load suppliers'} />
            </div>
          ) : (
            <>
              {/* Mobile Card View (Hidden on lg+ screens) */}
              <div className="lg:hidden">
                {/* Mobile Header */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.length === paginatedSuppliers.length && paginatedSuppliers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {filteredAndSortedSuppliers.length} suppliers
                    </div>
                  </div>
                </div>

                {/* Mobile Cards */}
                <div className="divide-y divide-gray-100">
                  {paginatedSuppliers.map((supplier) => (
                    <div key={supplier.id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start space-x-3">
                        {/* Checkbox */}
                        <div className="flex-shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedSuppliers.includes(supplier.id)}
                            onChange={() => handleSelectSupplier(supplier.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </div>
                        
                        {/* Supplier Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">{supplier.name}</h3>
                              <p className="text-xs text-gray-500 mt-1">{supplier.code}</p>
                              
                              {/* Contact Info */}
                              <div className="mt-2 space-y-1">
                                {supplier.email && (
                                  <p className="text-xs text-gray-600 flex items-center">
                                    <span className="w-12 text-gray-400 flex-shrink-0">Email:</span>
                                    <span className="truncate">{supplier.email}</span>
                                  </p>
                                )}
                                {supplier.phone && (
                                  <p className="text-xs text-gray-600 flex items-center">
                                    <span className="w-12 text-gray-400 flex-shrink-0">Phone:</span>
                                    <span>{supplier.phone}</span>
                                  </p>
                                )}
                              </div>
                              
                              {/* Status and Details */}
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(supplier.is_active)}`}>
                                  {supplier.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {getPaymentTermsText(supplier.payment_terms)}
                                </span>
                              </div>
                              
                              {/* Financial Info */}
                              <div className="mt-2 text-xs text-gray-600">
                                <span className="font-medium">Credit Limit:</span> UGX {supplier.credit_limit?.toLocaleString() || '0'}
                              </div>
                              
                              <div className="mt-1 text-xs text-gray-500">
                                Created: {new Date(supplier.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="mt-3 flex items-center space-x-2 flex-wrap gap-y-2">
                            <button
                              onClick={() => handleQuickView(supplier)}
                              className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                              <EyeIcon className="h-3 w-3 mr-1" />
                              View
                            </button>
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                            >
                              <PencilIcon className="h-3 w-3 mr-1" />
                              Edit
                            </button>
                            {deleteConfirm === supplier.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteSupplier(supplier.id)}
                                  className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                                >
                                  <CheckIcon className="h-3 w-3 mr-1" />
                                  Confirm
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                                >
                                  <XMarkIcon className="h-3 w-3 mr-1" />
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(supplier.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                              >
                                <TrashIcon className="h-3 w-3 mr-1" />
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredAndSortedSuppliers.length === 0 && (
                  <div className="text-center py-12">
                    <BuildingOfficeIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No suppliers found matching your criteria.</p>
                    <button
                      onClick={handleCreateSupplier}
                      className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add First Supplier
                    </button>
                  </div>
                )}
              </div>

              {/* Desktop Table View (Hidden on mobile/tablet) */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={selectedSuppliers.length === paginatedSuppliers.length && paginatedSuppliers.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Supplier</span>
                          {sortField === 'name' && (
                            <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact Information
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('is_active')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {sortField === 'is_active' && (
                            <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Payment Terms
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('credit_limit')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Credit Limit</span>
                          {sortField === 'credit_limit' && (
                            <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Created</span>
                          {sortField === 'created_at' && (
                            <span className="text-indigo-600">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedSuppliers.includes(supplier.id)}
                            onChange={() => handleSelectSupplier(supplier.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{supplier.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{supplier.code}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {supplier.email && (
                              <div className="text-sm text-gray-900">{supplier.email}</div>
                            )}
                            {supplier.phone && (
                              <div className="text-sm text-gray-500">{supplier.phone}</div>
                            )}
                            {!supplier.email && !supplier.phone && (
                              <div className="text-sm text-gray-400 italic">No contact info</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.is_active)}`}>
                            {supplier.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          <span className="bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                            {getPaymentTermsText(supplier.payment_terms)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          UGX {supplier.credit_limit?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(supplier.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuickView(supplier)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors duration-200"
                              title="Quick view supplier"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditSupplier(supplier)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50 transition-colors duration-200"
                              title="Edit supplier"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {deleteConfirm === supplier.id ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleDeleteSupplier(supplier.id)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                                  title="Confirm delete"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="text-gray-600 hover:text-gray-900 p-1 rounded-md hover:bg-gray-50 transition-colors duration-200"
                                  title="Cancel delete"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeleteConfirm(supplier.id)}
                                className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors duration-200"
                                title="Delete supplier"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredAndSortedSuppliers.length === 0 && (
                  <div className="text-center py-12">
                    <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first supplier to the system.</p>
                    <button
                      onClick={handleCreateSupplier}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add First Supplier
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Mobile-Responsive Pagination */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-sm text-gray-600 text-center sm:text-left">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedSuppliers.length)}</span> of{' '}
                  <span className="font-medium">{filteredAndSortedSuppliers.length}</span> suppliers
                </div>
                <div className="flex items-center justify-center sm:justify-end space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-3 py-2">
                    Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Supplier Modal */}
        {showModal && (
          <SupplierModal
            supplier={editingSupplier as any}
            onClose={handleModalClose}
          />
        )}

        {/* Supplier Code Settings Modal */}
        <SupplierCodeSettings
          isOpen={showCodeSettings}
          onClose={() => setShowCodeSettings(false)}
        />

        {/* Quick View Modal */}
        {showQuickView && quickViewSupplier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{quickViewSupplier.name}</h3>
                      <p className="text-indigo-100 text-sm font-mono">{quickViewSupplier.code}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleQuickViewClose}
                    className="w-8 h-8 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 flex items-center justify-center transition-colors duration-200"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Information */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Status and Basic Info */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">Supplier Information</h4>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(quickViewSupplier.is_active)}`}>
                          {quickViewSupplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Supplier Name</label>
                          <p className="mt-1 text-sm text-gray-900 font-medium">{quickViewSupplier.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Supplier Code</label>
                          <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">{quickViewSupplier.code}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Terms</label>
                          <p className="mt-1 text-sm text-gray-900">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium">
                              {getPaymentTermsText(quickViewSupplier.payment_terms)}
                            </span>
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Credit Limit</label>
                          <p className="mt-1 text-sm text-gray-900 font-semibold">
                            UGX {quickViewSupplier.credit_limit?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Details</h4>
                      <div className="space-y-3">
                        {quickViewSupplier.email && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Email</p>
                              <p className="text-sm text-gray-900">{quickViewSupplier.email}</p>
                            </div>
                          </div>
                        )}
                        {quickViewSupplier.phone && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <PhoneIcon className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Phone</p>
                              <p className="text-sm text-gray-900">{quickViewSupplier.phone}</p>
                            </div>
                          </div>
                        )}
                        {quickViewSupplier.mobile && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <PhoneIcon className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Mobile</p>
                              <p className="text-sm text-gray-900">{quickViewSupplier.mobile}</p>
                            </div>
                          </div>
                        )}
                        {quickViewSupplier.website && (
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <GlobeAltIcon className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Website</p>
                              <a 
                                href={quickViewSupplier.website.startsWith('http') ? quickViewSupplier.website : `https://${quickViewSupplier.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-indigo-600 hover:text-indigo-900 underline"
                              >
                                {quickViewSupplier.website}
                              </a>
                            </div>
                          </div>
                        )}
                        {!quickViewSupplier.email && !quickViewSupplier.phone && !quickViewSupplier.mobile && !quickViewSupplier.website && (
                          <div className="text-center py-4">
                            <p className="text-sm text-gray-500 italic">No contact information available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Address Information */}
                    {(quickViewSupplier.address || quickViewSupplier.city || quickViewSupplier.state || quickViewSupplier.country || quickViewSupplier.postal_code) && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                          <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
                          Address Information
                        </h4>
                        <div className="space-y-2">
                          {quickViewSupplier.address && (
                            <p className="text-sm text-gray-900">{quickViewSupplier.address}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                            {quickViewSupplier.city && <span>{quickViewSupplier.city}</span>}
                            {quickViewSupplier.state && <span>, {quickViewSupplier.state}</span>}
                            {quickViewSupplier.postal_code && <span>{quickViewSupplier.postal_code}</span>}
                          </div>
                          {quickViewSupplier.country && (
                            <p className="text-sm font-medium text-gray-900">{quickViewSupplier.country}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar Information */}
                  <div className="space-y-4">
                    {/* Financial Info */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
                        <CreditCardIcon className="h-4 w-4 mr-2" />
                        Financial Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-medium text-green-700">Credit Limit</p>
                          <p className="text-lg font-bold text-green-900">
                            UGX {quickViewSupplier.credit_limit?.toLocaleString() || '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-green-700">Payment Terms</p>
                          <p className="text-sm font-medium text-green-800">
                            {getPaymentTermsText(quickViewSupplier.payment_terms)}
                          </p>
                        </div>
                        {quickViewSupplier.tax_id && (
                          <div>
                            <p className="text-xs font-medium text-green-700">Tax ID</p>
                            <p className="text-sm font-mono text-green-800">{quickViewSupplier.tax_id}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        Timeline
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs font-medium text-blue-700">Created</p>
                          <p className="text-sm text-blue-800">
                            {new Date(quickViewSupplier.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-blue-600">
                            {new Date(quickViewSupplier.created_at).toLocaleDateString('en-US', {
                              weekday: 'long'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
                      <div className="space-y-2">
                        <button
                          onClick={handleQuickEdit}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-indigo-300 text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit Supplier
                        </button>
                        
                        {quickViewSupplier.email && (
                          <a
                            href={`mailto:${quickViewSupplier.email}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                            Send Email
                          </a>
                        )}
                        
                        {quickViewSupplier.phone && (
                          <a
                            href={`tel:${quickViewSupplier.phone}`}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-green-300 text-sm font-medium rounded-lg text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors duration-200"
                          >
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            Call Now
                          </a>
                        )}
                        
                        <button
                          onClick={handleQuickDelete}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-lg text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete Supplier
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-600">Supplier details loaded successfully</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleQuickViewClose}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleQuickEdit}
                    className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    Edit Supplier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile-Responsive Notification Toast */}
        {notification && (
          <div className={`fixed top-4 left-4 right-4 sm:top-4 sm:right-4 sm:left-auto sm:w-96 z-50 p-4 rounded-xl shadow-lg backdrop-blur-sm ${
            notification.type === 'success' 
              ? 'bg-green-50/95 border border-green-200' 
              : 'bg-red-50/95 border border-red-200'
          } transition-all duration-300 transform animate-in slide-in-from-top-2`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  notification.type === 'success' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {notification.type === 'success' ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4" />
                  )}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.type === 'success' ? 'Success!' : 'Error!'}
                </p>
                <p className={`text-xs mt-1 ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setNotification(null)}
                  className={`p-1 rounded-md transition-colors duration-200 ${
                    notification.type === 'success' 
                      ? 'text-green-600 hover:text-green-800 hover:bg-green-100' 
                      : 'text-red-600 hover:text-red-800 hover:bg-red-100'
                  }`}
                  title="Dismiss notification"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}