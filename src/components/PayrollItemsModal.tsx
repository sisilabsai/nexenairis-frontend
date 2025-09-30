import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  XMarkIcon, 
  CurrencyDollarIcon, 
  PhoneIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { usePayrollItems } from '../hooks/useApi';

interface PayrollItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: any;
}

export default function PayrollItemsModal({
  isOpen,
  onClose,
  period
}: PayrollItemsModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');

  const { data: payrollItemsData, isLoading } = usePayrollItems(
    period?.id, 
    { 
      search: searchTerm, 
      status: filterStatus, 
      payment_method: filterPaymentMethod 
    }
  );

  const payrollItems = (payrollItemsData as any)?.data || [];

  const formatCurrency = (amount: number | string | undefined | null) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (numAmount === undefined || numAmount === null || isNaN(numAmount)) {
      return `${period?.currency || 'UGX'} 0`;
    }
    return `${period?.currency || 'UGX'} ${numAmount.toLocaleString()}`;
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mobile_money':
        return <PhoneIcon className="h-5 w-5 text-purple-600" />;
      case 'bank_transfer':
        return <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />;
      case 'cash':
        return <BanknotesIcon className="h-5 w-5 text-green-600" />;
      case 'cheque':
        return <DocumentTextIcon className="h-5 w-5 text-orange-600" />;
      default:
        return <CurrencyDollarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash Payment';
      case 'cheque': return 'Cheque';
      default: return 'Not Set';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: '📝 Draft' },
      processed: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ Processed' },
      paid: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Paid' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Calculate summary statistics
  const summary = payrollItems.reduce((acc: any, item: any) => {
    acc.totalGross += parseFloat(item.gross_salary || 0);
    acc.totalNet += parseFloat(item.net_salary || 0);
    acc.totalTax += parseFloat(item.tax_amount || 0);
    acc.count += 1;
    
    // Count by payment method
    const method = item.payment_method || 'not_set';
    acc.paymentMethods[method] = (acc.paymentMethods[method] || 0) + 1;
    
    return acc;
  }, {
    totalGross: 0,
    totalNet: 0,
    totalTax: 0,
    count: 0,
    paymentMethods: {}
  });

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setFilterStatus('');
      setFilterPaymentMethod('');
    }
  }, [isOpen]);

  if (!period) return null;

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-8 w-8 text-white mr-3" />
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                          {period.period_name}
                        </Dialog.Title>
                        <p className="text-indigo-100 text-sm">
                          {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-white bg-opacity-20 p-2 text-white hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Summary Statistics */}
                <div className="px-6 py-4 bg-gray-50 border-b">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalGross)}</div>
                      <div className="text-sm text-gray-600">Total Gross</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalNet)}</div>
                      <div className="text-sm text-gray-600">Total Net</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalTax)}</div>
                      <div className="text-sm text-gray-600">Total Tax</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="text-2xl font-bold text-purple-600">{summary.count}</div>
                      <div className="text-sm text-gray-600">Employees</div>
                    </div>
                  </div>

                  {/* Payment Method Breakdown */}
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Method Distribution</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(summary.paymentMethods).map(([method, count]) => (
                        <div key={method} className="flex items-center bg-white rounded-lg px-3 py-1 shadow-sm">
                          {getPaymentMethodIcon(method)}
                          <span className="ml-2 text-sm text-gray-700">
                            {getPaymentMethodLabel(method)}: {count as number}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 bg-white border-b">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
                      <input
                        type="text"
                        placeholder="Search by name or employee ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">All Statuses</option>
                        <option value="draft">Draft</option>
                        <option value="processed">Processed</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Payment Method</label>
                      <select
                        value={filterPaymentMethod}
                        onChange={(e) => setFilterPaymentMethod(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="">All Payment Methods</option>
                        <option value="mobile_money">Mobile Money</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      <span className="ml-2 text-gray-600">Loading payroll items...</span>
                    </div>
                  ) : payrollItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Employee
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Basic Salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Tax
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Net Salary
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Method
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {payrollItems.map((item: any) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {item.employee?.name || 'Unknown Employee'}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {item.employee?.employee_id || 'No ID'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatCurrency(item.basic_salary)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                                {formatCurrency(item.tax_amount)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(item.net_salary)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getPaymentMethodIcon(item.payment_method)}
                                  <span className="ml-2 text-sm text-gray-900">
                                    {getPaymentMethodLabel(item.payment_method)}
                                  </span>
                                </div>
                                {item.payment_method === 'mobile_money' && item.mobile_money_provider && (
                                  <div className="text-xs text-gray-500">
                                    {item.mobile_money_provider} - {item.mobile_money_number}
                                  </div>
                                )}
                                {item.payment_method === 'bank_transfer' && item.bank_name && (
                                  <div className="text-xs text-gray-500">
                                    {item.bank_name} - {item.bank_account}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(item.status)}
                                {item.paid_at && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    Paid: {new Date(item.paid_at).toLocaleDateString()}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CurrencyDollarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No payroll items found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm || filterStatus || filterPaymentMethod 
                          ? 'Try adjusting your filters to see more results.'
                          : 'Generate payroll items for this period to see employee salary details.'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        Period: {period.status}
                      </div>
                      {period.payment_date && (
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          Paid: {new Date(period.payment_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}




