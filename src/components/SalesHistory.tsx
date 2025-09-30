'use client';

import { useState, useMemo } from 'react';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ClockIcon,
  BanknotesIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  EyeIcon,
  PrinterIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  BuildingStorefrontIcon,
  DevicePhoneMobileIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import { useSalesHistory } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import SaleDetailModal from './SaleDetailModal';

interface SalesHistoryProps {}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

type DateFilter = 'all' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';

export default function SalesHistory({}: SalesHistoryProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const { data: salesData, isLoading, error, refetch } = useSalesHistory() as { data: any; isLoading: boolean; error: any; refetch: any };

  const filteredAndSortedSales = useMemo(() => {
    if (!salesData?.data?.data) return [];

    const filtered = salesData.data.data.filter((sale: any) => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        sale.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.cashier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.contact?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());

      // Status filter
      const statusMatch = statusFilter === 'all' || sale.status === statusFilter;

      // Payment method filter
      const paymentMatch = paymentMethodFilter === 'all' || sale.payment_method === paymentMethodFilter;

      // Date filter
      let dateMatch = true;
      if (sale.created_at) {
        const saleDate = parseISO(sale.created_at);
        switch (dateFilter) {
          case 'today':
            dateMatch = isToday(saleDate);
            break;
          case 'yesterday':
            dateMatch = isYesterday(saleDate);
            break;
          case 'this_week':
            dateMatch = isThisWeek(saleDate);
            break;
          case 'this_month':
            dateMatch = isThisMonth(saleDate);
            break;
          case 'custom':
            if (customDateRange.start && customDateRange.end) {
              const startDate = parseISO(customDateRange.start);
              const endDate = parseISO(customDateRange.end);
              dateMatch = saleDate >= startDate && saleDate <= endDate;
            }
            break;
          default:
            dateMatch = true;
        }
      }

      return searchMatch && statusMatch && paymentMatch && dateMatch;
    });

    // Sort
    filtered.sort((a: any, b: any) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [salesData, searchTerm, statusFilter, paymentMethodFilter, dateFilter, customDateRange, sortConfig]);

  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSales.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSales, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedSales.length / itemsPerPage);

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleViewDetails = (sale: any) => {
    setSelectedSale(sale);
    setIsModalOpen(true);
  };

  const handlePrintReceipt = (sale: any) => {
    // Get company name from tenant (the business using our ERP system)
    const companyName = user?.tenant?.company_name || user?.tenant?.name || "Your Company Name";
    
    // Create unique filename: CustomerName_Date_Time_ReceiptNumber
    const customerName = (sale.customer_name || 'Walk-in-Customer').replace(/[^a-zA-Z0-9]/g, '_');
    const dateTime = new Date(sale.created_at || sale.transaction_date).toISOString().slice(0, 19).replace(/:/g, '-');
    const receiptNumber = sale.transaction_number || 'Receipt';
    const filename = `${customerName}_${dateTime}_${receiptNumber}.html`;
    
    // Create a clean receipt content
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${sale.transaction_number}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              background: white;
              color: black;
              font-size: 12px;
              line-height: 1.4;
            }
            .receipt {
              max-width: 380px;
              margin: 0 auto;
              background: white;
              padding: 25px;
              border: 2px solid #333;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              border-bottom: 3px double #000;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .company-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 8px;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              color: #000;
            }
            .receipt-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #333;
            }
            .receipt-subtitle {
              font-size: 11px;
              color: #666;
              margin-bottom: 10px;
            }
            .divider {
              border-bottom: 1px solid #ccc;
              margin: 10px 0;
            }
            .transaction-info {
              margin-bottom: 25px;
              background: #f9f9f9;
              padding: 15px;
              border: 1px dashed #ccc;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 6px;
              font-size: 11px;
            }
            .info-label {
              font-weight: bold;
              min-width: 90px;
              color: #333;
            }
            .info-value {
              text-align: right;
              color: #000;
              font-weight: 500;
            }
            .items-section {
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              padding: 20px 0;
              margin: 25px 0;
              background: #fafafa;
            }
            .items-header {
              font-weight: bold;
              border-bottom: 1px solid #000;
              padding-bottom: 10px;
              margin-bottom: 15px;
              font-size: 12px;
              background: #eee;
              padding: 8px;
            }
            .item-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
              font-size: 11px;
              padding: 5px 0;
              border-bottom: 1px dotted #ccc;
            }
            .item-name {
              flex: 1;
              margin-right: 15px;
              word-wrap: break-word;
              max-width: 180px;
              font-weight: 500;
            }
            .item-qty {
              width: 50px;
              text-align: center;
              font-weight: bold;
              background: #f0f0f0;
              padding: 2px;
              border-radius: 3px;
            }
            .item-price {
              width: 90px;
              text-align: right;
              font-weight: bold;
              color: #000;
            }
            .total-section {
              margin-top: 25px;
              background: #f5f5f5;
              padding: 15px;
              border: 1px solid #ddd;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
              font-size: 12px;
            }
            .total-row.subtotal {
              border-top: 1px dashed #666;
              padding-top: 10px;
              color: #666;
            }
            .total-row.final {
              font-weight: bold;
              font-size: 18px;
              border-top: 3px double #000;
              border-bottom: 3px double #000;
              padding: 15px 0;
              margin: 15px 0;
              background: #000;
              color: white;
              text-align: center;
              border-radius: 5px;
            }
            .total-row.final span {
              display: block;
              text-align: center;
            }
            .payment-info {
              margin: 20px 0;
              font-size: 11px;
              background: #f0f8ff;
              padding: 12px;
              border-left: 4px solid #007bff;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 25px;
              border-top: 3px double #000;
              font-size: 10px;
            }
            .thank-you {
              font-size: 14px;
              font-weight: bold;
              margin-bottom: 12px;
              color: #333;
            }
            .nexen-branding {
              margin-top: 20px;
              padding-top: 15px;
              border-top: 1px solid #ddd;
              font-size: 9px;
              color: #888;
              font-style: italic;
            }
            .nexen-logo {
              font-weight: bold;
              color: #007bff;
            }
            .print-time {
              color: #999;
              font-size: 8px;
              margin-top: 10px;
            }
            .status-badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-completed {
              background-color: #d4edda;
              color: #155724;
              border: 1px solid #c3e6cb;
            }
            .status-pending {
              background-color: #fff3cd;
              color: #856404;
              border: 1px solid #faeeba;
            }
            .download-note {
              background: #e7f3ff;
              padding: 10px;
              margin: 15px 0;
              border-radius: 5px;
              font-size: 10px;
              text-align: center;
              color: #0066cc;
            }
            @media print {
              body { 
                margin: 0; 
                padding: 10px; 
                font-size: 11px;
              }
              .receipt { 
                max-width: none; 
                border: none;
                box-shadow: none;
                padding: 15px;
              }
              .download-note {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="company-name">${companyName}</div>
              <div class="divider"></div>
              <div class="receipt-title">TRANSACTION RECEIPT</div>
              <div class="receipt-subtitle">Official Sales Receipt</div>
            </div>
            
            <div class="transaction-info">
              <div class="info-row">
                <span class="info-label">Receipt No:</span>
                <span class="info-value">#${sale.transaction_number}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date & Time:</span>
                <span class="info-value">${sale.display_datetime || sale.formatted_datetime || new Date(sale.created_at || sale.transaction_date).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Customer:</span>
                <span class="info-value">${sale.customer_name || 'Walk-in Customer'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Served by:</span>
                <span class="info-value">${sale.cashier_name || 'Staff Member'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment:</span>
                <span class="info-value">${sale.payment_method || 'Cash'}</span>
              </div>
            </div>

            <div class="items-section">
              <div class="items-header">
                <div class="item-row">
                  <span class="item-name">ITEM DESCRIPTION</span>
                  <span class="item-qty">QTY</span>
                  <span class="item-price">AMOUNT</span>
                </div>
              </div>
              ${sale.items?.map((item: any) => `
                <div class="item-row">
                  <span class="item-name">${item.product_name || 'Product'}</span>
                  <span class="item-qty">${item.quantity || 1}</span>
                  <span class="item-price">${sale.currency || 'UGX'} ${(item.line_total || 0).toLocaleString()}</span>
                </div>
              `).join('') || `
                <div class="item-row">
                  <span class="item-name">Sale Transaction</span>
                  <span class="item-qty">1</span>
                  <span class="item-price">${sale.currency || 'UGX'} ${(sale.total_amount || 0).toLocaleString()}</span>
                </div>
              `}
            </div>

            <div class="total-section">
              ${sale.items?.length > 1 ? `
                <div class="total-row subtotal">
                  <span>Subtotal:</span>
                  <span>${sale.currency || 'UGX'} ${(sale.total_amount || 0).toLocaleString()}</span>
                </div>
              ` : ''}
              
              <div class="total-row final">
                <span>TOTAL AMOUNT</span>
                <span style="font-size: 22px; margin-top: 5px;">${sale.currency || 'UGX'} ${(sale.total_amount || 0).toLocaleString()}</span>
              </div>
              
              <div class="payment-info">
                <div class="info-row">
                  <span class="info-label">Transaction Status:</span>
                  <span class="status-badge ${sale.status === 'completed' ? 'status-completed' : 'status-pending'}">${sale.status || 'COMPLETED'}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="thank-you">🌟 Thank You for Your Business! 🌟</div>
              <div>We appreciate your trust and look forward to serving you again</div>
              <div style="margin: 15px 0; font-size: 12px;">⭐ ⭐ ⭐ ⭐ ⭐</div>
              
              <div class="nexen-branding">
                <div>Powered by <span class="nexen-logo">NEXEN AIRIS</span></div>
                <div>Advanced ERP & Business Management System</div>
                <div style="margin-top: 5px;">🚀 Transforming Business Operations</div>
              </div>
              
              <div class="print-time">
                Generated on ${new Date().toLocaleString()} | Unique ID: ${Date.now()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create download functionality
    const downloadReceipt = () => {
      const blob = new Blob([receiptContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Receipt downloaded as ${filename}`);
    };

    // Open print window and offer download
    const printWindow = window.open('', '_blank', 'width=450,height=700,scrollbars=yes');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      
      // Add download button to the print window
      printWindow.onload = () => {
        // Add download functionality to print window
        const downloadBtn = printWindow.document.createElement('button');
        downloadBtn.innerHTML = '💾 Download Receipt';
        downloadBtn.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          padding: 10px 15px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 12px;
          font-weight: bold;
          z-index: 1000;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        downloadBtn.onclick = () => {
          downloadReceipt();
        };
        printWindow.document.body.appendChild(downloadBtn);
        
        // Auto-trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 500);
      };
    } else {
      // Fallback: just download if popup blocked
      downloadReceipt();
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Transaction Number', 'Date', 'Time', 'Customer', 'Cashier', 'Amount', 'Status', 'Payment Method'],
      ...filteredAndSortedSales.map((sale: any) => [
        sale.transaction_number || '',
        sale.formatted_date || '',
        sale.formatted_time || '',
        sale.customer_name || sale.contact?.name || 'Walk-in',
        sale.cashier_name || '',
        `${sale.currency || 'UGX'} ${Number(sale.total_amount || 0).toLocaleString()}`,
        sale.status || '',
        sale.payment_method || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Sales history exported successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'posted':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'draft':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500" />;
      case 'void':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-4 w-4 text-green-600" />;
      case 'mobile_money':
        return <DevicePhoneMobileIcon className="h-4 w-4 text-blue-600" />;
      case 'bank':
        return <BuildingStorefrontIcon className="h-4 w-4 text-purple-600" />;
      case 'card':
        return <CreditCardIcon className="h-4 w-4 text-orange-600" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'posted':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'draft':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'void':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'UGX') => {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  };

  const formatTransactionTime = (sale: any) => {
    if (sale.formatted_time) {
      return sale.formatted_time;
    }
    if (sale.created_at) {
      return format(parseISO(sale.created_at), 'HH:mm:ss');
    }
    return '00:00:00';
  };

  const formatTransactionDate = (sale: any) => {
    if (sale.formatted_date) {
      return sale.formatted_date;
    }
    if (sale.created_at) {
      return format(parseISO(sale.created_at), 'yyyy-MM-dd');
    }
    return sale.transaction_date || '';
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Sales History</h3>
        <p className="text-red-600 mb-4">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ClockIcon className="h-7 w-7 text-indigo-600" />
              Sales History
            </h2>
            <p className="text-gray-600 mt-1">
              {filteredAndSortedSales.length} transactions found
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <DocumentTextIcon className="h-4 w-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="posted">Posted</option>
              <option value="draft">Draft</option>
              <option value="void">Void</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="relative">
            <CurrencyDollarIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="bank">Bank Transfer</option>
              <option value="card">Card</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <CalendarDaysIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range */}
        {dateFilter === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sales history...</p>
          </div>
        ) : paginatedSales.length === 0 ? (
          <div className="p-12 text-center">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No sales found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('transaction_number')}
                    >
                      <div className="flex items-center gap-1">
                        Transaction #
                        {sortConfig.key === 'transaction_number' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1">
                        Date & Time
                        {sortConfig.key === 'created_at' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cashier
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('total_amount')}
                    >
                      <div className="flex items-center gap-1">
                        Amount
                        {sortConfig.key === 'total_amount' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUpIcon className="h-4 w-4" /> : 
                            <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedSales.map((sale: any, index: number) => (
                    <tr key={sale.id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {sale.transaction_number || `TXN-${sale.id}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{formatTransactionDate(sale)}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {formatTransactionTime(sale)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                          {sale.customer_name || sale.contact?.name || 'Walk-in Customer'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {sale.cashier_name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(sale.total_amount, sale.currency)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          {getPaymentMethodIcon(sale.payment_method)}
                          <span className="capitalize">
                            {sale.payment_method?.replace('_', ' ') || 'Cash'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(sale.status)}>
                          {getStatusIcon(sale.status)}
                          <span className="capitalize">{sale.status || 'draft'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(sale)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePrintReceipt(sale)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                            title="Print & Download Receipt"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-700">
                  <span>Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="mx-2 border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <SaleDetailModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSale(null);
          }}
          sale={selectedSale}
        />
      )}
    </div>
  );
}