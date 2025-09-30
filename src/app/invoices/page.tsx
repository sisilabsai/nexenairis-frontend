'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  DocumentMagnifyingGlassIcon, 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import Link from 'next/link';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { useInvoices, useDeleteInvoice } from '../../hooks/useApi';

export default function InvoicesPage() {
  const [page, setPage] = useState(1);
  const { data: invoicesData, isLoading, error } = useInvoices({ page });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const deleteInvoiceMutation = useDeleteInvoice();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          const searchInput = document.getElementById('invoice-search');
          if (searchInput) searchInput.focus();
        }, 100);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Reset to page 1 when search/filter changes
  useEffect(() => { setPage(1); }, [searchTerm, filterStatus]);

  const pagination = (invoicesData?.data || {}) as any;
  const invoices = pagination.data || [];
  const currentPage = pagination.current_page || 1;
  const lastPage = pagination.last_page || 1;

  const filteredInvoices = invoices.filter((invoice: any) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      (invoice.invoice_number && invoice.invoice_number.toLowerCase().includes(searchTermLower)) ||
      (invoice.contact && invoice.contact.name && invoice.contact.name.toLowerCase().includes(searchTermLower));
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics for the dashboard cards
  const stats = {
    total: invoices.length,
    paid: invoices.filter((inv: any) => inv.status === 'paid').length,
    pending: invoices.filter((inv: any) => inv.status === 'sent').length,
    overdue: invoices.filter((inv: any) => inv.status === 'overdue').length,
    totalAmount: invoices.reduce((sum: number, inv: any) => sum + parseFloat(inv.total_amount || 0), 0),
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };
  
  const confirmDelete = () => {
    if (deleteId) {
      deleteInvoiceMutation.mutate(deleteId, {
        onSuccess: () => setDeleteId(null),
      });
    }
  };

  const handleSelectInvoice = (id: string) => {
    setSelectedInvoices(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'overdue': return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'sent': return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default: return <DocumentMagnifyingGlassIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'from-green-500 to-emerald-600';
      case 'overdue': return 'from-red-500 to-rose-600';
      case 'sent': return 'from-blue-500 to-indigo-600';
      case 'draft': return 'from-gray-500 to-slate-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Magical Header with Gradient Background */}
        <div className="relative mb-8 p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <SparklesIcon className="h-8 w-8 mr-3 animate-pulse" />
                  Invoice Management
                </h1>
                <p className="mt-2 text-indigo-100">
                  Magical invoicing experience - press F2 to search instantly ✨
                </p>
              </div>
              <Link href="/invoices/create">
                <button className="group relative inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-purple-600 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200">
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                  Create Invoice
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                </button>
              </Link>
            </div>
          </div>
          
          {/* Floating decoration elements */}
          <div className="absolute top-4 right-20 w-12 h-12 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-4 left-20 w-8 h-8 bg-white/5 rounded-full animate-pulse"></div>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Total Invoices</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <ChartBarIcon className="h-12 w-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Paid</p>
                <p className="text-3xl font-bold">{stats.paid}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Total Value</p>
                <p className="text-2xl font-bold">UGX {stats.totalAmount.toLocaleString()}</p>
              </div>
              <CurrencyDollarIcon className="h-12 w-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Smart Search and Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="invoice-search"
                type="text"
                placeholder="Search invoices... (Press F2 for quick search)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm transition-all duration-200 ${
                  showSearch 
                    ? 'border-purple-500 ring-4 ring-purple-200 bg-purple-50' 
                    : 'border-gray-300 hover:border-gray-400 focus:border-purple-500'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-gray-300 rounded-xl text-sm hover:border-gray-400 focus:border-purple-500 transition-colors duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="void">Void</option>
                </select>
              </div>
              
              <div className="flex rounded-xl border-2 border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'cards' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'table' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500 animate-pulse">Loading your magical invoices...</p>
          </div>
        ) : error ? (
          <ErrorMessage message={error.message} />
        ) : (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice: any) => (
                    <Link
                      key={invoice.id}
                      href={`/invoices/${invoice.id}`}
                      className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                    >
                      {/* Status Gradient Bar */}
                      <div className={`h-2 bg-gradient-to-r ${getStatusColor(invoice.status)}`}></div>
                      
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                              {invoice.invoice_number}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{invoice.contact.name}</p>
                          </div>
                          <div className="flex items-center">
                            {getStatusIcon(invoice.status)}
                          </div>
                        </div>

                        {/* Amount - Large and Beautiful */}
                        <div className="mb-4">
                          <p className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            UGX {parseFloat(invoice.total_amount).toLocaleString()}
                          </p>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-500">
                          <div>
                            <span className="block font-medium">Invoice Date</span>
                            <span>{invoice.invoice_date}</span>
                          </div>
                          <div>
                            <span className="block font-medium">Due Date</span>
                            <span className={`${invoice.status === 'overdue' ? 'text-red-500 font-bold' : ''}`}>
                              {invoice.due_date}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : invoice.status === 'overdue' 
                                ? 'bg-red-100 text-red-800 animate-pulse' 
                                : invoice.status === 'sent' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1 capitalize">{invoice.status}</span>
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/invoices/${invoice.id}`;
                              }}
                              className="group/btn p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                              title="View Invoice"
                            >
                              <EyeIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/invoices/${invoice.id}/edit`;
                              }}
                              className="group/btn p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                              title="Edit Invoice"
                            >
                              <PencilIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDelete(invoice.id);
                              }}
                              className="group/btn p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                              title="Delete Invoice"
                            >
                              <TrashIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                            </button>
                          </div>
                          
                          {/* Quick Status Actions */}
                          {invoice.status === 'draft' && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add send invoice logic here
                              }}
                              className="text-xs bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 transition-colors duration-200"
                            >
                              Send
                            </button>
                          )}
                          {invoice.status === 'sent' && (
                            <button 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add mark as paid logic here
                              }}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 transition-colors duration-200"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Hover Glow Effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 transition-all duration-300 pointer-events-none"></div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <DocumentMagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Try adjusting your search or filters.' 
                        : 'Get started by creating your first magical invoice.'}
                    </p>
                    {!searchTerm && filterStatus === 'all' && (
                      <Link href="/invoices/create">
                        <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200">
                          <SparklesIcon className="h-5 w-5 mr-2" />
                          Create Your First Invoice
                        </button>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Invoice #</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {filteredInvoices.length > 0 ? (
                        filteredInvoices.map((invoice: any, index: number) => (
                          <tr 
                            key={invoice.id} 
                            onClick={() => window.location.href = `/invoices/${invoice.id}`}
                            className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-pointer ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {invoice.invoice_number}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                              {invoice.contact.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {invoice.invoice_date}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={invoice.status === 'overdue' ? 'text-red-600 font-bold' : ''}>
                                {invoice.due_date}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                UGX {parseFloat(invoice.total_amount).toLocaleString()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                              <span
                                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                                  invoice.status === 'paid' 
                                    ? 'bg-green-100 text-green-800' 
                                    : invoice.status === 'overdue' 
                                    ? 'bg-red-100 text-red-800 animate-pulse' 
                                    : invoice.status === 'sent' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {getStatusIcon(invoice.status)}
                                <span className="ml-1 capitalize">{invoice.status}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/invoices/${invoice.id}`;
                                  }}
                                  className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="View Invoice"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.href = `/invoices/${invoice.id}/edit`;
                                  }}
                                  className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                                  title="Edit Invoice"
                                >
                                  <PencilIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(invoice.id);
                                  }}
                                  className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Delete Invoice"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="text-center py-16">
                            <DocumentMagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
                            <p className="text-gray-500">
                              {searchTerm || filterStatus !== 'all' 
                                ? 'Try adjusting your search or filters.' 
                                : 'Get started by creating your first invoice.'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Enhanced Pagination */}
            <div className="flex justify-center items-center gap-4 py-8">
              <button
                className="group inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <span className="group-hover:-translate-x-1 transition-transform duration-200">←</span>
                <span className="ml-2">Previous</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 bg-white px-4 py-2 rounded-lg shadow-sm border">
                  Page {currentPage} of {lastPage}
                </span>
              </div>
              
              <button
                className="group inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={currentPage === lastPage}
              >
                <span>Next</span>
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-200">→</span>
              </button>
            </div>
          </>
        )}
      </DashboardLayout>
      {deleteId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-lg font-bold mb-4">Delete Invoice?</h2>
            <p>Are you sure you want to delete this invoice? This action cannot be undone.</p>
            <div className="mt-6 flex gap-2 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDelete} disabled={deleteInvoiceMutation.isPending}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
