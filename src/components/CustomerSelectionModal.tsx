'use client';

import { useState, useEffect } from 'react';
import { useContacts } from '../hooks/useApi';
import { UserIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  total_purchases: number;
  customer_type: 'regular' | 'vip' | 'wholesale';
  last_purchase: string;
}

interface CustomerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
}

export default function CustomerSelectionModal({ isOpen, onClose, onSelectCustomer }: CustomerSelectionModalProps) {
  const { data: contactsData, isLoading } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  const customers = (contactsData?.data?.data as unknown as Customer[]) || [];

  useEffect(() => {
    if (isOpen) {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Select Customer</h2>
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <p>Loading customers...</p>
          ) : (
            <ul className="space-y-2">
              {filteredCustomers.map(customer => (
                <li
                  key={customer.id}
                  onClick={() => {
                    onSelectCustomer(customer);
                    onClose();
                  }}
                  className="p-3 hover:bg-gray-100 rounded-lg cursor-pointer flex items-center space-x-3"
                >
                  <UserIcon className="h-8 w-8 text-gray-500" />
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email} - {customer.phone}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
