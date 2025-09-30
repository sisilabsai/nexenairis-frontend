'use client';

import { useState, useMemo } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';
import { supplierApi } from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './LoadingSpinner';

interface Supplier {
  id: number;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  is_active: boolean;
}

interface SupplierSelectorProps {
  value?: number | null;
  onChange: (supplier: Supplier | null) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  activeOnly?: boolean;
}

export default function SupplierSelector({
  value,
  onChange,
  placeholder = "Select a supplier...",
  disabled = false,
  required = false,
  className = "",
  activeOnly = true
}: SupplierSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers', 'options', { activeOnly }],
    queryFn: () => supplierApi.getOptions({ active_only: activeOnly }),
  });
  const suppliers = (suppliersData?.data as Supplier[]) || [];

  // Filter suppliers based on search term and active status
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = !searchTerm || 
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = !activeOnly || supplier.is_active;
      
      return matchesSearch && matchesStatus;
    });
  }, [suppliers, searchTerm, activeOnly]);

  const selectedSupplier = suppliers.find(s => s.id === value);

  const handleSelect = (supplier: Supplier) => {
    onChange(supplier);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
          ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'hover:border-gray-400'}
          ${required && !value ? 'border-red-300' : ''}
        `}
      >
        <span className="block truncate">
          {selectedSupplier ? (
            <div className="flex items-center">
              <span className="font-medium">{selectedSupplier.name}</span>
              <span className="ml-2 text-gray-500 text-sm">({selectedSupplier.code})</span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {/* Search input */}
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search suppliers..."
                className="block w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-500">Loading suppliers...</span>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="px-3 py-2 text-sm text-red-600">
              Failed to load suppliers
            </div>
          )}

          {/* Clear selection option */}
          {selectedSupplier && (
            <button
              onClick={handleClear}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100"
            >
              <span className="text-gray-500 italic">Clear selection</span>
            </button>
          )}

          {/* Supplier options */}
          {!isLoading && !error && (
            <>
              {filteredSuppliers.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No suppliers found matching your search' : 'No suppliers available'}
                </div>
              ) : (
                filteredSuppliers.map((supplier) => (
                  <button
                    key={supplier.id}
                    onClick={() => handleSelect(supplier)}
                    className={`
                      w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 flex items-center justify-between
                      ${supplier.id === value ? 'bg-indigo-50 text-indigo-900' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{supplier.name}</div>
                      <div className="text-gray-500 text-xs flex items-center space-x-2">
                        <span>{supplier.code}</span>
                        {supplier.email && <span>• {supplier.email}</span>}
                        {!supplier.is_active && (
                          <span className="text-red-500">• Inactive</span>
                        )}
                      </div>
                    </div>
                    {supplier.id === value && (
                      <CheckIcon className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </>
          )}

          {/* Footer info */}
          {!isLoading && !error && filteredSuppliers.length > 0 && (
            <div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">
              {filteredSuppliers.length} supplier{filteredSuppliers.length !== 1 ? 's' : ''} found
              {activeOnly && ' (active only)'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
