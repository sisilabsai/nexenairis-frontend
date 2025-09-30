'use client';

import { FC } from 'react';
import { XMarkIcon, TicketIcon, UserIcon, ClockIcon, ShoppingCartIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Sale } from '../types';

interface SaleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
}

const SaleDetailModal: FC<SaleDetailModalProps> = ({ isOpen, onClose, sale }) => {
  if (!isOpen || !sale) return null;

  const totalItems = sale.items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Transaction Details</h2>
              <p className="text-sm text-gray-500">Review the complete information for this sale.</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
              <XMarkIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 px-8 py-6 border-t border-b border-gray-200">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div className="flex items-center">
              <TicketIcon className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Transaction ID</p>
                <p className="font-semibold text-gray-800">{sale.transaction_number}</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-semibold text-gray-800">{sale.customer_name || 'Walk-in Customer'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-800">{new Date(sale.transaction_date).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center">
              <UserCircleIcon className="h-6 w-6 text-blue-500 mr-3" />
              <div>
                <p className="text-xs text-gray-500">Cashier</p>
                <p className="font-semibold text-gray-800">{sale.cashier_name || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="flex items-center mb-4">
            <ShoppingCartIcon className="h-6 w-6 text-gray-700 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Items Sold ({totalItems})</h3>
          </div>
          <div className="max-h-60 overflow-y-auto pr-2">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500">
                <tr>
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium text-center">Qty</th>
                  <th className="pb-2 font-medium text-right">Unit Price</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3">{item.product_name}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">UGX {item.unit_price.toLocaleString()}</td>
                    <td className="py-3 text-right font-medium">UGX {(item.quantity * item.unit_price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-gray-100 px-8 py-5 rounded-b-2xl">
          <div className="flex justify-end items-center">
            <p className="text-lg font-semibold text-gray-600 mr-4">Grand Total:</p>
            <p className="text-2xl font-bold text-blue-600">UGX {sale.total_amount.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetailModal;
