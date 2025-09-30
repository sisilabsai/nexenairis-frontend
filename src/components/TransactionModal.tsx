'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PhoneIcon, BanknotesIcon, BuildingLibraryIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { useCreateTransaction, useUpdateTransaction } from '../hooks/useApi';

interface Transaction {
  id?: number;
  transaction_number?: string;
  transaction_date: string;
  transaction_type: 'journal' | 'payment' | 'receipt' | 'invoice' | 'bill' | 'mobile_money' | 'bank_transfer';
  amount: number;
  currency: string;
  payment_method: 'cash' | 'bank' | 'mobile_money' | 'check' | 'remittance';
  mobile_money_provider?: string;
  mobile_money_reference?: string;
  bank_reference?: string;
  description: string;
  reference_number?: string;
  contact_id?: number;
  notes?: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction | null;
  onSuccess?: () => void;
}

export default function TransactionModal({ isOpen, onClose, transaction, onSuccess }: TransactionModalProps) {
  const [formData, setFormData] = useState<Transaction>({
    transaction_date: new Date().toISOString().split('T')[0],
    transaction_type: 'journal',
    amount: 0,
    currency: 'UGX',
    payment_method: 'cash',
    description: '',
  });

  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  
  const isLoading = createTransactionMutation.isPending || updateTransactionMutation.isPending;

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        transaction_date: new Date().toISOString().split('T')[0],
        transaction_type: 'journal',
        amount: 0,
        currency: 'UGX',
        payment_method: 'cash',
        description: '',
      });
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (transaction && transaction.id) {
        // Update existing transaction
        await updateTransactionMutation.mutateAsync({
          id: transaction.id,
          data: formData
        });
        console.log('Transaction updated successfully!');
      } else {
        // Create new transaction
        await createTransactionMutation.mutateAsync(formData);
        console.log('Transaction created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving transaction:', error);
      // TODO: Show error toast to user
      alert('Error saving transaction. Please try again.');
    }
  };

  const handleInputChange = (field: keyof Transaction, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'mobile_money': return <PhoneIcon className="h-5 w-5" />;
      case 'bank': return <BuildingLibraryIcon className="h-5 w-5" />;
      case 'cash': return <BanknotesIcon className="h-5 w-5" />;
      case 'check': return <CreditCardIcon className="h-5 w-5" />;
      default: return <BanknotesIcon className="h-5 w-5" />;
    }
  };

  if (!isOpen) return null;

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

        <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
             role="dialog" 
             aria-modal="true">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {transaction ? 'Edit Transaction' : 'New Transaction'}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Transaction Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction Date *</label>
                <input
                  type="date"
                  required
                  value={formData.transaction_date}
                  onChange={(e) => handleInputChange('transaction_date', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Transaction Type *</label>
                <select
                  required
                  value={formData.transaction_type}
                  onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="journal">Journal Entry</option>
                  <option value="payment">Payment</option>
                  <option value="receipt">Receipt</option>
                  <option value="invoice">Invoice</option>
                  <option value="bill">Bill</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount *</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', parseFloat(e.target.value))}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 pr-16 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center">
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('currency', e.target.value)}
                      className="h-full py-0 pl-2 pr-7 border-transparent bg-transparent text-gray-500 focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    >
                      <option value="UGX">UGX</option>
                      <option value="USD">USD</option>
                      <option value="KES">KES</option>
                      <option value="TZS">TZS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method *</label>
                <select
                  required
                  value={formData.payment_method}
                  onChange={(e) => handleInputChange('payment_method', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="cash">💵 Cash</option>
                  <option value="mobile_money">📱 Mobile Money</option>
                  <option value="bank">🏦 Bank Transfer</option>
                  <option value="check">📋 Check/Cheque</option>
                  <option value="remittance">🌍 Remittance</option>
                </select>
              </div>

              {/* Mobile Money Provider (conditional) */}
              {formData.payment_method === 'mobile_money' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Money Provider</label>
                  <select
                    value={formData.mobile_money_provider || ''}
                    onChange={(e) => handleInputChange('mobile_money_provider', e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select Provider</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="Airtel">Airtel Money</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="Orange">Orange Money</option>
                    <option value="Tigo">Tigo Pesa</option>
                  </select>
                </div>
              )}

              {/* Mobile Money Reference (conditional) */}
              {formData.payment_method === 'mobile_money' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Money Reference</label>
                  <input
                    type="text"
                    value={formData.mobile_money_reference || ''}
                    onChange={(e) => handleInputChange('mobile_money_reference', e.target.value)}
                    placeholder="e.g., MP241025XYZ123"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Bank Reference (conditional) */}
              {formData.payment_method === 'bank' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bank Reference</label>
                  <input
                    type="text"
                    value={formData.bank_reference || ''}
                    onChange={(e) => handleInputChange('bank_reference', e.target.value)}
                    placeholder="e.g., FT241025123456"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Reference Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                <input
                  type="text"
                  value={formData.reference_number || ''}
                  onChange={(e) => handleInputChange('reference_number', e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter transaction description..."
              />
            </div>

            {/* Notes */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={2}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Additional notes..."
              />
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                  isLoading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  transaction ? 'Update Transaction' : 'Create Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
