'use client';

import React from 'react';
import { XMarkIcon, BuildingOfficeIcon, UserCircleIcon, BanknotesIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface DepartmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: any;
}

const DepartmentDetailsModal: React.FC<DepartmentDetailsModalProps> = ({ isOpen, onClose, department }) => {
  if (!isOpen || !department) {
    return null;
  }

  const formatCurrency = (amount: number | string | undefined | null) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (numAmount === undefined || numAmount === null || isNaN(numAmount)) {
      return 'UGX 0';
    }
    return `UGX ${numAmount.toLocaleString()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Department Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{department.name}</p>
              <p className="text-sm text-gray-500">{department.code}</p>
            </div>
          </div>
          {department.manager && (
            <div className="flex items-center">
              <UserCircleIcon className="h-8 w-8 text-gray-500 mr-3" />
              <div>
                <p className="font-medium text-gray-900">{department.manager.name}</p>
                <p className="text-sm text-gray-500">Manager</p>
              </div>
            </div>
          )}
          <div className="flex items-center">
            <BanknotesIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{formatCurrency(department.budget)} ({department.budget_type})</p>
              <p className="text-sm text-gray-500">Budget</p>
            </div>
          </div>
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{formatCurrency(department.remaining_budget)}</p>
              <p className="text-sm text-gray-500">Remaining Budget</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentDetailsModal;
