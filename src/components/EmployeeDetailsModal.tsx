'use client';

import React from 'react';
import { XMarkIcon, UserCircleIcon, BriefcaseIcon, CurrencyDollarIcon, DevicePhoneMobileIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Employee } from '../types/hr';

interface EmployeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({ isOpen, onClose, employee }) => {
  if (!isOpen || !employee) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Employee Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center">
            <UserCircleIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{employee.name}</p>
              <p className="text-sm text-gray-500">{employee.email}</p>
            </div>
          </div>
          <div className="flex items-center">
            <BriefcaseIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{employee.position}</p>
              <p className="text-sm text-gray-500">
                {employee.department?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <CurrencyDollarIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(employee.salary)}</p>
              <p className="text-sm text-gray-500">Salary</p>
            </div>
          </div>
          <div className="flex items-center">
            <DevicePhoneMobileIcon className="h-8 w-8 text-gray-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">{employee.phone}</p>
              <p className="text-sm text-gray-500">Phone</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailsModal;
