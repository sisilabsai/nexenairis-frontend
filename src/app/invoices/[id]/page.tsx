'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useInvoice } from '@/hooks/useApi';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import ProtectedRoute from '@/components/ProtectedRoute';
import { 
  PencilIcon, 
  ArrowLeftIcon, 
  PaperAirplaneIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  DocumentDuplicateIcon,
  PrinterIcon,
  ShareIcon,
  EnvelopeIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useMarkAsSent, useMarkAsPaid, useVoidInvoice } from '@/hooks/useApi';
import { useState } from 'react';

export default function ViewInvoicePage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data: invoiceData, isLoading, error } = useInvoice(id as string);
  const markAsSentMutation = useMarkAsSent();
  const markAsPaidMutation = useMarkAsPaid();
  const voidInvoiceMutation = useVoidInvoice();
  const [showVoidConfirm, setShowVoidConfirm] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const invoice = invoiceData?.data as any;

  const handleMarkAsSent = () => {
    markAsSentMutation.mutate(invoice.id);
  };

  const handleMarkAsPaid = () => {
    markAsPaidMutation.mutate(invoice.id);
  };

  const handleVoid = () => {
    setShowVoidConfirm(true);
  };

  const confirmVoid = () => {
    voidInvoiceMutation.mutate(invoice.id, {
      onSuccess: () => setShowVoidConfirm(false),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'from-green-500 to-emerald-600';
      case 'overdue': return 'from-red-500 to-rose-600';
      case 'sent': return 'from-blue-500 to-indigo-600';
      case 'draft': return 'from-gray-500 to-slate-600';
      case 'void': return 'from-red-800 to-gray-800';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'overdue': return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'sent': return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'void': return <XCircleIcon className="h-6 w-6 text-red-800" />;
      default: return <DocumentTextIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const handlePrint = () => {
    // Generate clean filename: INV_CustomerName_Date
    const customerName = invoice.contact.name.replace(/[^a-zA-Z0-9]/g, '_');
    const invoiceDate = invoice.invoice_date.replace(/[-]/g, '');
    const filename = `INV_${customerName}_${invoiceDate}`;
    
    // Set document title for print
    const originalTitle = document.title;
    document.title = filename;
    
    // Add print styles
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          margin: 0.5in;
          size: A4;
        }
        
        /* Hide everything except invoice content */
        body * {
          visibility: hidden;
        }
        
        #invoice-content, #invoice-content * {
          visibility: visible;
        }
        
        #invoice-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        
        /* Remove gradients and colors for print */
        .print\\:bg-white {
          background: white !important;
        }
        
        .print\\:text-gray-900 {
          color: #111827 !important;
        }
        
        .print\\:border-gray-300 {
          border-color: #d1d5db !important;
        }
        
        /* Ensure proper spacing */
        .print\\:block {
          display: block !important;
        }
        
        /* Clean table styling */
        table {
          border-collapse: collapse;
          width: 100%;
        }
        
        th, td {
          border: 1px solid #d1d5db;
          padding: 8px;
          text-align: left;
        }
        
        /* Remove hover effects */
        *:hover {
          background: inherit !important;
          transform: none !important;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Print
    window.print();
    
    // Cleanup
    setTimeout(() => {
      document.title = originalTitle;
      document.head.removeChild(style);
    }, 1000);
  };

  const handleEmailInvoice = () => {
    // Implement email functionality
    alert('Email functionality will be implemented with backend integration');
  };

  const handleDuplicate = () => {
    router.push(`/invoices/create?duplicate=${invoice.id}`);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500 animate-pulse">Loading your magical invoice...</p>
          </div>
        ) : error ? (
          <ErrorMessage message={error.message} />
        ) : invoice ? (
          <div className="max-w-4xl mx-auto">
            {/* Header with Status and Actions */}
            <div className="relative mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <button
                      onClick={() => router.back()}
                      className="flex items-center text-white/80 hover:text-white mb-4 transition-colors duration-200"
                    >
                      <ArrowLeftIcon className="h-5 w-5 mr-2" />
                      Back to Invoices
                    </button>
                    <h1 className="text-3xl font-bold flex items-center">
                      <SparklesIcon className="h-8 w-8 mr-3 animate-pulse" />
                      Invoice {invoice.invoice_number}
                    </h1>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${getStatusColor(invoice.status)} shadow-lg transform hover:scale-105 transition-all duration-200`}>
                    <div className="flex items-center text-white">
                      {getStatusIcon(invoice.status)}
                      <span className="ml-2 font-bold text-lg capitalize">{invoice.status}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/invoices/${invoice.id}/edit`}>
                    <button className="group inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-200">
                      <PencilIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={handlePrint}
                    className="group inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-200"
                  >
                    <PrinterIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Print
                  </button>

                  <button
                    onClick={handleDuplicate}
                    className="group inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-200"
                  >
                    <DocumentDuplicateIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                    Duplicate
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="group inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white font-medium rounded-lg hover:bg-white/30 transition-all duration-200"
                    >
                      <ShareIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      Share
                    </button>
                    
                    {showShareMenu && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                        <button
                          onClick={handleEmailInvoice}
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-t-lg transition-colors duration-200"
                        >
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          Email Invoice
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(window.location.href)}
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-b-lg transition-colors duration-200"
                        >
                          <ShareIcon className="h-4 w-4 mr-2" />
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status Actions */}
                  {invoice.status === 'draft' && (
                    <button
                      onClick={handleMarkAsSent}
                      disabled={markAsSentMutation.isPending}
                      className="group inline-flex items-center px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-all duration-200"
                    >
                      <PaperAirplaneIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      {markAsSentMutation.isPending ? 'Sending...' : 'Send'}
                    </button>
                  )}

                  {invoice.status === 'sent' && (
                    <button
                      onClick={handleMarkAsPaid}
                      disabled={markAsPaidMutation.isPending}
                      className="group inline-flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all duration-200"
                    >
                      <CheckCircleIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      {markAsPaidMutation.isPending ? 'Processing...' : 'Mark Paid'}
                    </button>
                  )}

                  {invoice.status !== 'paid' && invoice.status !== 'void' && (
                    <button
                      onClick={handleVoid}
                      disabled={voidInvoiceMutation.isPending}
                      className="group inline-flex items-center px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50 transition-all duration-200"
                    >
                      <XCircleIcon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      {voidInvoiceMutation.isPending ? 'Voiding...' : 'Void'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Floating decoration elements */}
              <div className="absolute top-4 right-20 w-12 h-12 bg-white/10 rounded-full animate-bounce"></div>
              <div className="absolute bottom-4 left-20 w-8 h-8 bg-white/5 rounded-full animate-pulse"></div>
            </div>

            {/* Invoice Content - Professional Layout */}
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden" id="invoice-content">
              {/* Company Header - Client's Company Data */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8 border-b border-gray-200 print:bg-white print:border-gray-300">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {user?.tenant?.company_name || 'Your Company Name'}
                    </h2>
                    <p className="text-gray-600">Business Services</p>
                    <p className="text-gray-600">{user?.tenant?.company_address || 'Company Address'}</p>
                    <p className="text-gray-600">Kampala, Uganda</p>
                    {user?.tenant?.company_phone && (
                      <p className="text-gray-600">Tel: {user.tenant.company_phone}</p>
                    )}
                    {user?.tenant?.company_email && (
                      <p className="text-gray-600">Email: {user.tenant.company_email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">INVOICE</h3>
                    <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent print:text-gray-900">
                      #{invoice.invoice_number}
                    </p>
                    <div className="mt-4 text-sm text-gray-600 print:block hidden">
                      <p>Generated: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Details Grid */}
              <div className="p-8 print:p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-4">
                  {/* Bill To */}
                  <div className="space-y-4">
                    <div className="flex items-center mb-4 print:mb-2">
                      <UserIcon className="h-6 w-6 text-purple-600 mr-3 print:hidden" />
                      <h3 className="text-lg font-bold text-gray-900">Bill To</h3>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg print:bg-white print:border-gray-300 print:p-2">
                      <h4 className="font-bold text-blue-900 text-lg print:text-gray-900">{invoice.contact.name}</h4>
                      <p className="text-blue-700 print:text-gray-700">{invoice.contact.email}</p>
                      {invoice.contact.phone && (
                        <p className="text-blue-700 print:text-gray-700">{invoice.contact.phone}</p>
                      )}
                      {invoice.contact.address && (
                        <p className="text-blue-700 print:text-gray-700">{invoice.contact.address}</p>
                      )}
                    </div>
                  </div>

                  {/* Invoice Info */}
                  <div className="space-y-4">
                    <div className="flex items-center mb-4">
                      <CalendarIcon className="h-6 w-6 text-purple-600 mr-3" />
                      <h3 className="text-lg font-bold text-gray-900">Invoice Details</h3>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Invoice Date:</span>
                        <span className="font-bold text-gray-900">{invoice.invoice_date}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Due Date:</span>
                        <span className={`font-bold ${
                          invoice.status === 'overdue' 
                            ? 'text-red-600 animate-pulse' 
                            : 'text-gray-900'
                        }`}>
                          {invoice.due_date}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <span className="font-medium text-purple-700">Status:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                          invoice.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : invoice.status === 'overdue' 
                            ? 'bg-red-100 text-red-800' 
                            : invoice.status === 'sent' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1 capitalize">{invoice.status}</span>
                        </span>
                      </div>
                      
                      {/* Cashier Details */}
                      <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="font-medium text-blue-700">Prepared by:</span>
                        <span className="font-bold text-blue-900">
                          {invoice.created_by?.name || invoice.cashier_name || 'System User'}
                        </span>
                      </div>
                      {(invoice.created_by?.email || invoice.cashier_email) && (
                        <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <span className="font-medium text-blue-700">Contact:</span>
                          <span className="font-bold text-blue-900">
                            {invoice.created_by?.email || invoice.cashier_email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8 print:mb-4">
                  <div className="flex items-center mb-6 print:mb-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-purple-600 mr-3 print:hidden" />
                    <h3 className="text-lg font-bold text-gray-900">Invoice Items</h3>
                  </div>
                  
                  <div className="overflow-hidden rounded-lg border border-gray-200 print:border-gray-400">
                    <table className="min-w-full divide-y divide-gray-200 print:divide-gray-400">
                      <thead className="bg-gradient-to-r from-purple-50 to-pink-50 print:bg-gray-100">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-purple-900 uppercase tracking-wider print:text-gray-900 print:px-3 print:py-2">Product</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-purple-900 uppercase tracking-wider print:text-gray-900 print:px-3 print:py-2">Qty</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider print:text-gray-900 print:px-3 print:py-2">Unit Price</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider print:text-gray-900 print:px-3 print:py-2">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100 print:divide-gray-300">
                        {invoice.invoice_items.map((item: any, index: number) => (
                          <tr key={item.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-purple-50 transition-colors duration-200 print:bg-white print:hover:bg-white`}>
                            <td className="px-6 py-4 print:px-3 print:py-2">
                              <div className="font-medium text-gray-900">{item.product.name}</div>
                              {item.product.code && (
                                <div className="text-sm text-gray-500">Code: {item.product.code}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-center font-medium text-gray-900 print:px-3 print:py-2">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-gray-900 print:px-3 print:py-2">
                              UGX {parseFloat(item.unit_price).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-lg print:px-3 print:py-2">
                              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent print:text-gray-900">
                                UGX {parseFloat(item.total_price).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals Section */}
                <div className="border-t border-gray-200 pt-6 print:pt-3">
                  <div className="max-w-md ml-auto space-y-3 print:space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg print:bg-white print:border print:border-gray-300 print:p-2">
                      <span className="font-medium text-gray-700">Subtotal:</span>
                      <span className="font-bold text-gray-900">UGX {parseFloat(invoice.subtotal).toLocaleString()}</span>
                    </div>
                    
                    {invoice.tax_amount && parseFloat(invoice.tax_amount) > 0 && (
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg print:bg-white print:border print:border-gray-300 print:p-2">
                        <span className="font-medium text-gray-700">Tax:</span>
                        <span className="font-bold text-gray-900">UGX {parseFloat(invoice.tax_amount).toLocaleString()}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg print:bg-gray-200 print:text-gray-900 print:border print:border-gray-400 print:p-3">
                      <span className="text-xl font-bold">Total Amount:</span>
                      <span className="text-2xl font-bold">UGX {parseFloat(invoice.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                {invoice.notes && (
                  <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg print:bg-white print:border-gray-300 print:mt-4 print:p-3">
                    <h4 className="font-bold text-yellow-900 mb-2 print:text-gray-900">Notes:</h4>
                    <p className="text-yellow-800 print:text-gray-800">{invoice.notes}</p>
                  </div>
                )}

                {/* Footer with NEXEN AIRIS Branding */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-600 mb-2">Payment Terms:</p>
                      <p className="text-xs text-gray-500">
                        Payment is due within {Math.ceil((new Date(invoice.due_date).getTime() - new Date(invoice.invoice_date).getTime()) / (1000 * 60 * 60 * 24))} days of invoice date.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-600 mb-2">Questions?</p>
                      <p className="text-xs text-gray-500">
                        Contact: {invoice.created_by?.name || 'Customer Service'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600 mb-1">Thank you for your business!</p>
                    
                    {/* NEXEN AIRIS Marketing Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 print:bg-gray-50">
                      <div className="flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
                        <div className="mb-2 md:mb-0">
                          <span className="font-bold text-purple-600">Powered by NEXEN AIRIS</span>
                          <span className="mx-2">•</span>
                          <span>Modern ERP Solutions</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span>📧 business@nexenairis.com</span>
                          <span>🌐 nexenairis.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invoice not found</h3>
            <p className="text-gray-500">The invoice you're looking for doesn't exist or has been removed.</p>
          </div>
        )}

        {/* Void Confirmation Modal */}
        {showVoidConfirm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md mx-4">
              <div className="flex items-center mb-4">
                <XCircleIcon className="h-8 w-8 text-red-500 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Void Invoice?</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to void this invoice? This action cannot be undone and will mark the invoice as void.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setShowVoidConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
                  onClick={confirmVoid}
                  disabled={voidInvoiceMutation.isPending}
                >
                  {voidInvoiceMutation.isPending ? 'Voiding...' : 'Void Invoice'}
                </button>
              </div>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
