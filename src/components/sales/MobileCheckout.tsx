'use client';

import { FC, useState } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  BuildingLibraryIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  XMarkIcon,
  ArrowRightIcon,
  CurrencyDollarIcon,
  UserIcon,
  ReceiptPercentIcon,
  StarIcon,
  HeartIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

interface MobileCheckoutProps {
  cartTotals: {
    subtotal: number;
    discountTotal: number;
    taxAmount: number;
    total: number;
    itemCount: number;
  };
  selectedPaymentType: string;
  setSelectedPaymentType: (type: string) => void;
  amountPaid: number;
  setAmountPaid: (amount: number) => void;
  momoReference: string;
  setMomoReference: (ref: string) => void;
  onProcessTransaction: () => void;
  isProcessing: boolean;
  selectedCustomer: any;
  onSelectCustomer: () => void;
  globalDiscount: number;
  onUpdateDiscount: (discount: number) => void;
  availablePaymentMethods: Array<{ id: string; name: string; }>;
}

const MobileCheckout: FC<MobileCheckoutProps> = ({
  cartTotals,
  selectedPaymentType,
  setSelectedPaymentType,
  amountPaid,
  setAmountPaid,
  momoReference,
  setMomoReference,
  onProcessTransaction,
  isProcessing,
  selectedCustomer,
  onSelectCustomer,
  globalDiscount,
  onUpdateDiscount,
  availablePaymentMethods,
}) => {
  const [showDiscountInput, setShowDiscountInput] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [tipAmount, setTipAmount] = useState(0);
  const [quickTipOptions] = useState([5, 10, 15, 20]);

  const calculateChange = () => {
    const totalWithTip = cartTotals.total + tipAmount;
    return Math.max(0, amountPaid - totalWithTip);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <BanknotesIcon className="h-6 w-6" />;
      case 'card':
        return <CreditCardIcon className="h-6 w-6" />;
      case 'mobile_money':
        return <DevicePhoneMobileIcon className="h-6 w-6" />;
      case 'bank_transfer':
        return <BuildingLibraryIcon className="h-6 w-6" />;
      case 'credit':
        return <ClockIcon className="h-6 w-6" />;
      default:
        return <CurrencyDollarIcon className="h-6 w-6" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'from-green-500 to-emerald-600';
      case 'card':
        return 'from-blue-500 to-indigo-600';
      case 'mobile_money':
        return 'from-purple-500 to-pink-600';
      case 'bank_transfer':
        return 'from-indigo-500 to-blue-600';
      case 'credit':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-4 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Checkout</h2>
          <div className="flex items-center space-x-2">
            <StarIcon className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium">{cartTotals.itemCount} items</span>
          </div>
        </div>
      </div>

      {/* Customer Section */}
      <div className="p-4 border-b border-gray-100">
        <button
          onClick={onSelectCustomer}
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <UserIcon className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">
                {selectedCustomer ? selectedCustomer.name : 'Walk-in Customer'}
              </p>
              <p className="text-sm text-gray-500">
                {selectedCustomer ? selectedCustomer.email || 'No email' : 'Select customer for receipt'}
              </p>
            </div>
          </div>
          <ArrowRightIcon className="h-5 w-5 text-gray-400" />
        </button>
      </div>

      {/* Order Summary */}
      <div className="p-4 border-b border-gray-100">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">UGX {cartTotals.subtotal.toLocaleString()}</span>
          </div>
          
          {cartTotals.discountTotal > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Discount ({globalDiscount}%)</span>
              <span>-UGX {cartTotals.discountTotal.toLocaleString()}</span>
            </div>
          )}
          
          {cartTotals.taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax</span>
              <span className="font-medium">UGX {cartTotals.taxAmount.toLocaleString()}</span>
            </div>
          )}
          
          {tipAmount > 0 && (
            <div className="flex justify-between text-sm text-pink-600">
              <span>Tip</span>
              <span>UGX {tipAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-green-600">UGX {(cartTotals.total + tipAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={() => setShowDiscountInput(!showDiscountInput)}
            className="flex-1 flex items-center justify-center space-x-2 p-2 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 transition-colors"
          >
            <ReceiptPercentIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Discount</span>
          </button>
          
          <button
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="flex-1 flex items-center justify-center space-x-2 p-2 bg-purple-50 text-purple-700 rounded-xl hover:bg-purple-100 transition-colors"
          >
            <SparklesIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Options</span>
          </button>
        </div>

        {/* Discount Input */}
        {showDiscountInput && (
          <div className="mt-3 p-3 bg-yellow-50 rounded-xl">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apply Discount (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={globalDiscount}
              onChange={(e) => onUpdateDiscount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        )}

        {/* Advanced Options */}
        {showAdvancedOptions && (
          <div className="mt-3 p-3 bg-purple-50 rounded-xl space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Tip (UGX)
              </label>
              <div className="flex space-x-2 mb-2">
                {quickTipOptions.map((tip) => (
                  <button
                    key={tip}
                    onClick={() => setTipAmount(tip * 1000)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      tipAmount === tip * 1000
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-purple-600 border border-purple-200'
                    }`}
                  >
                    {tip}k
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="0"
                value={tipAmount}
                onChange={(e) => setTipAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Custom tip amount"
              />
            </div>
          </div>
        )}
      </div>

      {/* Payment Methods */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
        <div className="grid grid-cols-2 gap-3">
          {availablePaymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setSelectedPaymentType(method.id)}
              className={`p-3 rounded-xl border-2 transition-all duration-200 transform active:scale-95 ${
                selectedPaymentType === method.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r ${getPaymentMethodColor(method.id)}`}>
                  <div className="text-white">
                    {getPaymentMethodIcon(method.id)}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-900">{method.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      <div className="p-4 space-y-4">
        {selectedPaymentType === 'cash' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount Received (UGX)
            </label>
            <input
              type="number"
              min="0"
              value={amountPaid}
              onChange={(e) => setAmountPaid(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-lg font-medium"
              placeholder="0"
            />
            {amountPaid > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Change:</span>
                  <span className="font-bold text-blue-600">
                    UGX {calculateChange().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedPaymentType === 'mobile_money' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Money Reference
            </label>
            <input
              type="text"
              value={momoReference}
              onChange={(e) => setMomoReference(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="M-Pesa/MTN Reference"
            />
          </div>
        )}

        {(selectedPaymentType === 'card' || selectedPaymentType === 'bank_transfer') && (
          <div className="p-4 bg-blue-50 rounded-xl">
            <div className="flex items-center space-x-2 text-blue-700">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm font-medium">
                {selectedPaymentType === 'card' ? 'Card payment ready' : 'Bank transfer ready'}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Amount: UGX {(cartTotals.total + tipAmount).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Process Button */}
      <div className="p-4">
        <button
          onClick={onProcessTransaction}
          disabled={isProcessing || cartTotals.itemCount === 0}
          className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform active:scale-95 ${
            isProcessing || cartTotals.itemCount === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-500/25'
          }`}
        >
          {isProcessing ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <BoltIcon className="h-6 w-6" />
              <span>Complete Sale - UGX {(cartTotals.total + tipAmount).toLocaleString()}</span>
            </div>
          )}
        </button>

        {selectedPaymentType === 'cash' && amountPaid < (cartTotals.total + tipAmount) && cartTotals.itemCount > 0 && (
          <div className="mt-2 flex items-center justify-center space-x-2 text-red-600">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span className="text-sm">
              Insufficient amount: UGX {((cartTotals.total + tipAmount) - amountPaid).toLocaleString()} short
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileCheckout;