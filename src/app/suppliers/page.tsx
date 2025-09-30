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
  ExclamationTriangleIcon
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
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your suppliers, track performance, and maintain relationships.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowBulkMenu(!showBulkMenu)}
                  disabled={exportMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportMutation.isPending ? (
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                  ) : (
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  )}
                  {exportMutation.isPending ? 'Exporting...' : 'Export'}
                </button>
                {showBulkMenu && !exportMutation.isPending && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleExport('csv');
                          setShowBulkMenu(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Export as CSV
                      </button>
                      <button
                        onClick={() => {
                          handleExport('json');
                          setShowBulkMenu(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left flex items-center"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Export as JSON
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowCodeSettings(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                title="Configure supplier code settings"
              >
                <CogIcon className="h-4 w-4 mr-2" />
                Code Settings
              </button>
              <button
                onClick={handleCreateSupplier}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Supplier
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Analytics Overview */}
        {!analyticsLoading && !analyticsError && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Suppliers</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.overview.total_suppliers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <UserGroupIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Suppliers</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.overview.active_suppliers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Recent Additions</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.overview.recent_additions}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Activity Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.overview.activity_rate}%</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Credit Limit</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        UGX {analytics.financial.avg_credit_limit.toLocaleString()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 bg-white shadow rounded-lg p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search suppliers..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-40">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="w-32">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedSuppliers.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">
                  {selectedSuppliers.length} supplier(s) selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleBulkOperation('activate')}
                    className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkOperation('deactivate')}
                    className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
                  >
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkOperation('delete')}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suppliers Table */}
        <div className="bg-white shadow rounded-lg">
          {suppliersLoading ? (
            <div className="p-8 text-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : suppliersError ? (
            <div className="p-8">
              <ErrorMessage message={suppliersError.message || 'Failed to load suppliers'} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedSuppliers.length === paginatedSuppliers.length && paginatedSuppliers.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')}
                    >
                      Supplier {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('is_active')}
                    >
                      Status {sortField === 'is_active' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Terms
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('credit_limit')}
                    >
                      Credit Limit {sortField === 'credit_limit' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSuppliers.map((supplier) => (
                    <tr key={supplier.id} className="hover:bg-gray-50">
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
                          <div className="text-sm font-medium text-gray-900">{supplier.name}</div>
                          <div className="text-sm text-gray-500">{supplier.code}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          {supplier.email && (
                            <div className="text-sm text-gray-900">{supplier.email}</div>
                          )}
                          {supplier.phone && (
                            <div className="text-sm text-gray-500">{supplier.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(supplier.is_active)}`}>
                          {supplier.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getPaymentTermsText(supplier.payment_terms)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        UGX {supplier.credit_limit?.toLocaleString() || '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(supplier.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditSupplier(supplier)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit supplier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {deleteConfirm === supplier.id ? (
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleDeleteSupplier(supplier.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Confirm delete"
                              >
                                <CheckIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Cancel delete"
                              >
                                <XMarkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(supplier.id)}
                              className="text-red-600 hover:text-red-900"
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
                <div className="text-center py-8">
                  <p className="text-gray-500">No suppliers found.</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAndSortedSuppliers.length)} of {filteredAndSortedSuppliers.length} suppliers
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
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

        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center">
              <div className={`flex-shrink-0 ${
                notification.type === 'success' ? 'text-green-400' : 'text-red-400'
              }`}>
                {notification.type === 'success' ? (
                  <CheckIcon className="h-5 w-5" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5" />
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-4">ts 
                <button
                  onClick={() => setNotification(null)}
                  className={`text-sm font-medium ${
                    notification.type === 'success' 
                      ? 'text-green-800 hover:text-green-900' 
                      : 'text-red-800 hover:text-red-900'
                  }`}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}