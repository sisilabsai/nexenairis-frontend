'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCreateAccount, useUpdateAccount } from '../hooks/useApi';

interface Account {
  id?: number;
  account_code?: string;
  account_name: string;
  account_type: string;
  account_subtype?: string;
  description?: string;
  is_mobile_money_account?: boolean;
  is_cash_account?: boolean;
  is_bank_account?: boolean;
  mobile_money_provider?: string;
  mobile_money_number?: string;
  bank_name?: string;
  bank_account_number?: string;
  account_category?: string;
  is_active?: boolean;
}

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  account?: Account | null;
}

export default function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  account = null
}: AccountModalProps) {
  const [formData, setFormData] = useState<Account>({
    account_code: '',
    account_name: '',
    account_type: 'asset',
    account_subtype: '',
    description: '',
    is_mobile_money_account: false,
    is_cash_account: false,
    is_bank_account: false,
    mobile_money_provider: '',
    mobile_money_number: '',
    bank_name: '',
    bank_account_number: '',
    account_category: 'operating',
    is_active: true,
  });

  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();

  const isLoading = createAccountMutation.isPending || updateAccountMutation.isPending;

  // Auto-generate account code based on account type
  const generateAccountCode = (accountType: string) => {
    const typePrefix = {
      'asset': 'A',
      'liability': 'L',
      'equity': 'E',
      'revenue': 'R',
      'expense': 'X'
    }[accountType] || 'A';
    
    const timestamp = Date.now().toString().slice(-6);
    return `${typePrefix}${timestamp}`;
  };

  useEffect(() => {
    if (account) {
      setFormData({
        account_code: account.account_code || '',
        account_name: account.account_name || '',
        account_type: account.account_type || 'asset',
        account_subtype: account.account_subtype || '',
        description: account.description || '',
        is_mobile_money_account: account.is_mobile_money_account || false,
        is_cash_account: account.is_cash_account || false,
        is_bank_account: account.is_bank_account || false,
        mobile_money_provider: account.mobile_money_provider || '',
        mobile_money_number: account.mobile_money_number || '',
        bank_name: account.bank_name || '',
        bank_account_number: account.bank_account_number || '',
        account_category: account.account_category || 'operating',
        is_active: account.is_active !== undefined ? account.is_active : true,
      });
    } else {
      // For new accounts, auto-generate the account code
      const autoCode = generateAccountCode('asset');
      setFormData({
        account_code: autoCode,
        account_name: '',
        account_type: 'asset',
        account_subtype: '',
        description: '',
        is_mobile_money_account: false,
        is_cash_account: false,
        is_bank_account: false,
        mobile_money_provider: '',
        mobile_money_number: '',
        bank_name: '',
        bank_account_number: '',
        account_category: 'operating',
        is_active: true,
      });
    }
  }, [account, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (account && account.id) {
        // Update existing account
        await updateAccountMutation.mutateAsync({
          id: account.id,
          data: formData
        });
        console.log('Account updated successfully!');
      } else {
        // Create new account
        await createAccountMutation.mutateAsync(formData);
        console.log('Account created successfully!');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving account:', error);
      alert('Error saving account. Please try again.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [name]: value
        };
        
        // Auto-regenerate account code when account type changes (only for new accounts)
        if (name === 'account_type' && !account) {
          newData.account_code = generateAccountCode(value);
        }
        
        return newData;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {account ? 'Edit Account' : 'Add New Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Code *
              </label>
              <input
                type="text"
                name="account_code"
                value={formData.account_code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Auto-generated"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-generated based on account type
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type *
              </label>
              <select
                name="account_type"
                value={formData.account_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="asset">💰 Asset</option>
                <option value="liability">📋 Liability</option>
                <option value="equity">🏛️ Equity</option>
                <option value="revenue">💹 Revenue</option>
                <option value="expense">💸 Expense</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                name="account_name"
                value={formData.account_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Subtype
              </label>
              <input
                type="text"
                name="account_subtype"
                value={formData.account_subtype}
                onChange={handleInputChange}
                placeholder="e.g., current_asset, fixed_asset"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Category
              </label>
              <select
                name="account_category"
                value={formData.account_category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="operating">Operating</option>
                <option value="financing">Financing</option>
                <option value="investing">Investing</option>
              </select>
            </div>
          </div>

          {/* Account Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Features (African Business Context)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_cash_account"
                  checked={formData.is_cash_account}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">💵 Cash Account</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_bank_account"
                  checked={formData.is_bank_account}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">🏦 Bank Account</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_mobile_money_account"
                  checked={formData.is_mobile_money_account}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">📱 Mobile Money</label>
              </div>
            </div>
          </div>

          {/* Mobile Money Details */}
          {formData.is_mobile_money_account && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-purple-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Money Provider
                </label>
                <select
                  name="mobile_money_provider"
                  value={formData.mobile_money_provider}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Provider</option>
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="Airtel">Airtel Money</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Orange">Orange Money</option>
                  <option value="Tigo">Tigo Pesa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Money Number
                </label>
                <input
                  type="text"
                  name="mobile_money_number"
                  value={formData.mobile_money_number}
                  onChange={handleInputChange}
                  placeholder="+256700000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Bank Details */}
          {formData.is_bank_account && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  name="bank_name"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  placeholder="e.g., Stanbic Bank Uganda"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  name="bank_account_number"
                  value={formData.bank_account_number}
                  onChange={handleInputChange}
                  placeholder="Account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Description of this account..."
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Active Account</label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {account ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
