import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeaveRequests, useBulkLeaveActions } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import CustomAlert from './CustomAlert';

interface BulkLeaveApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkLeaveApprovalModal({ isOpen, onClose, onSuccess }: BulkLeaveApprovalModalProps) {
  const queryClient = useQueryClient();
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [action, setAction] = useState<'approve' | 'reject' | 'cancel'>('approve');
  const [reason, setReason] = useState('');

  const { data: leaveRequestsData, isLoading, error } = useLeaveRequests({
    status: 'pending',
    per_page: 100,
  });

  const bulkActionsMutation = useBulkLeaveActions();

  const pendingRequests = leaveRequestsData?.data?.data || [];

  const handleSelectionChange = (id: number) => {
    setSelectedRequests(prev =>
      prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === pendingRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(pendingRequests.map((req: any) => req.id));
    }
  };

  const handleSubmit = async () => {
    if (selectedRequests.length === 0) {
      // You might want to show an alert here
      return;
    }

    try {
      await bulkActionsMutation.mutateAsync({
        action,
        leave_request_ids: selectedRequests,
        rejection_reason: action === 'reject' ? reason : undefined,
        cancellation_reason: action === 'cancel' ? reason : undefined,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Bulk Leave Actions</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message="Failed to load pending leave requests." />}
        {!isLoading && !error && (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Action</label>
              <select
                value={action}
                onChange={e => setAction(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="approve">Approve</option>
                <option value="reject">Reject</option>
                <option value="cancel">Cancel</option>
              </select>
            </div>
            {(action === 'reject' || action === 'cancel') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            )}
            <div className="max-h-64 overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedRequests.length === pendingRequests.length && pendingRequests.length > 0}
                      />
                    </th>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2 text-left">Leave Type</th>
                    <th className="px-4 py-2 text-left">Dates</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((req: any) => (
                    <tr key={req.id}>
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(req.id)}
                          onChange={() => handleSelectionChange(req.id)}
                        />
                      </td>
                      <td className="px-4 py-2">{req.employee.name}</td>
                      <td className="px-4 py-2">{req.leave_type.name}</td>
                      <td className="px-4 py-2">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={bulkActionsMutation.isPending || selectedRequests.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400"
              >
                {bulkActionsMutation.isPending ? 'Processing...' : 'Submit'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
