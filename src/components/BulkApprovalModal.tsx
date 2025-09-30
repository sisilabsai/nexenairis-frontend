import React, { useState } from 'react';
import { 
  XMarkIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import { 
  useLeaveRequests, 
  useApproveLeaveRequest 
} from '../hooks/useApi';

interface BulkApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkApprovalModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: BulkApprovalModalProps) {
  const [selectedRequests, setSelectedRequests] = useState<number[]>([]);
  const [approvalNotes, setApprovalNotes] = useState('Bulk approved via leave management dashboard');
  const [isProcessing, setIsProcessing] = useState(false);

  // API hooks
  const { data: leaveRequestsData } = useLeaveRequests({ status: 'pending', per_page: 100 });
  const approveRequestMutation = useApproveLeaveRequest();

  const pendingRequests = Array.isArray(leaveRequestsData?.data) ? leaveRequestsData.data : [];

  const handleSelectAll = () => {
    if (selectedRequests.length === pendingRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(pendingRequests.map((req: any) => req.id));
    }
  };

  const handleSelectRequest = (requestId: number) => {
    setSelectedRequests(prev => 
      prev.includes(requestId) 
        ? prev.filter(id => id !== requestId)
        : [...prev, requestId]
    );
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.length === 0) {
      alert('Please select at least one request to approve.');
      return;
    }

    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const requestId of selectedRequests) {
        try {
          await approveRequestMutation.mutateAsync({
            id: requestId,
            data: { approval_notes: approvalNotes }
          });
          successCount++;
        } catch (error) {
          console.error(`Error approving request ${requestId}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        alert(`Successfully approved ${successCount} leave request(s).${errorCount > 0 ? ` Failed to approve ${errorCount} request(s).` : ''}`);
        onSuccess?.();
        onClose();
      } else {
        alert('Failed to approve any requests. Please try again.');
      }
    } finally {
      setIsProcessing(false);
      setSelectedRequests([]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-4xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <ClipboardDocumentListIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Bulk Approval</h3>
              <p className="text-sm text-gray-500">Select multiple leave requests to approve at once</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardDocumentListIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              All leave requests have been processed.
            </p>
          </div>
        ) : (
          <>
            {/* Selection Controls */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {selectedRequests.length === pendingRequests.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-500">
                  {selectedRequests.length} of {pendingRequests.length} selected
                </span>
              </div>
            </div>

            {/* Approval Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Notes (will be applied to all selected requests)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Enter approval notes..."
              />
            </div>

            {/* Request List */}
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedRequests.length === pendingRequests.length && pendingRequests.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((request: any) => (
                    <tr 
                      key={request.id} 
                      className={`hover:bg-gray-50 ${selectedRequests.includes(request.id) ? 'bg-green-50' : ''}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedRequests.includes(request.id)}
                          onChange={() => handleSelectRequest(request.id)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-6 w-6 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.employee?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{request.employee?.employee_id || 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {request.leave_type?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{formatDate(request.start_date)} - {formatDate(request.end_date)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {request.days_requested}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={request.reason}>
                        {request.reason || 'No reason provided'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkApprove}
                disabled={selectedRequests.length === 0 || isProcessing}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2">Approving...</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Approve {selectedRequests.length} Request{selectedRequests.length !== 1 ? 's' : ''}
                  </div>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



