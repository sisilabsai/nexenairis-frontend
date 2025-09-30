'use client';

import { useState } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

interface NssfStatusUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  contribution: any;
  newStatus: 'processed' | 'paid';
}

export default function NssfStatusUpdateModal({
  isOpen,
  onClose,
  onSuccess,
  contribution,
  newStatus
}: NssfStatusUpdateModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async () => {
    if (!contribution?.id) return;

    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) throw new Error('Authentication required');

      const updateData = {
        user_id: contribution.employee_id || contribution.user_id || null,
        payroll_period_id: contribution.payroll_period_id || null,
        gross_salary: contribution.gross_salary || null,
        employee_contribution: contribution.employee_contribution || null,
        employer_contribution: contribution.employer_contribution || null,
        total_contribution: contribution.total_contribution || null,
        status: newStatus,
        nssf_number: contribution.nssf_number || '',
        processed_at: new Date().toISOString(),
      };

      const response = await fetch(`http://localhost:8000/api/hr/nssf-contributions/${contribution.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.errors) {
          const errorMessages = Object.entries(errorData.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          throw new Error(`Validation failed:\n${errorMessages}`);
        }
        
        throw new Error(errorData.message || 'Failed to update status');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      alert(`Error updating status: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  const getStatusInfo = () => {
    switch (newStatus) {
      case 'processed':
        return {
          title: 'Mark as Processed',
          description: 'Mark this NSSF contribution as processed and ready for payment',
          icon: '⚡',
          color: 'yellow'
        };
      case 'paid':
        return {
          title: 'Mark as Paid',
          description: 'Mark this NSSF contribution as paid and completed',
          icon: '💰',
          color: 'green'
        };
      default:
        return { title: '', description: '', icon: '', color: '' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">{statusInfo.title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isUpdating}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-${statusInfo.color}-100 mb-4`}>
            <span className="text-2xl">{statusInfo.icon}</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{statusInfo.title}</h3>
          <p className="text-sm text-gray-500 mb-4">
            {statusInfo.description}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <div className="text-sm text-gray-600 mb-2">Contribution Details:</div>
            <div className="space-y-1 text-sm">
              <div><strong>Employee:</strong> {contribution?.employee_name || 'Unknown'}</div>
              <div><strong>Amount:</strong> UGX {contribution?.total_contribution?.toLocaleString() || '0'}</div>
              <div><strong>Current Status:</strong> 
                <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  contribution?.status === 'paid' ? 'bg-green-100 text-green-800' :
                  contribution?.status === 'processed' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {contribution?.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStatusUpdate}
            disabled={isUpdating}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${statusInfo.color}-600 hover:bg-${statusInfo.color}-700 disabled:opacity-50 flex items-center`}
          >
            {isUpdating && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isUpdating ? 'Updating...' : statusInfo.title}
          </button>
        </div>
      </div>
    </div>
  );
} 