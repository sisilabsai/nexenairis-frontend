'use client';

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SampleReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  receiptCustomization: any;
  activeReceiptTemplate: string;
  logoSrc: string | null;
}

export default function SampleReceiptModal({
  isOpen,
  onClose,
  profileData,
  receiptCustomization,
  activeReceiptTemplate,
  logoSrc,
}: SampleReceiptModalProps) {
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerEmail, setCustomerEmail] = useState('john.doe@example.com');
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Sample Receipt</h2>
          <button onClick={onClose}>
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Receipt Date</label>
            <input
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
          >
            Cancel
          </button>
          <button
            // Add functionality to generate and send the sample receipt
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Generate and Send
          </button>
        </div>
      </div>
    </div>
  );
}
