import React, { useState } from 'react';
import { useLeaveEncashmentRequests, useCreateLeaveEncashmentRequest, useApproveLeaveEncashmentRequest, useRejectLeaveEncashmentRequest, useLeaveTypes } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import { PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function LeaveEncashment() {
  const [leaveTypeId, setLeaveTypeId] = useState('');
  const [days, setDays] = useState('');

  const { data: requestsData, isLoading, error } = useLeaveEncashmentRequests();
  const { data: leaveTypesData } = useLeaveTypes();
  const createRequestMutation = useCreateLeaveEncashmentRequest();
  const approveRequestMutation = useApproveLeaveEncashmentRequest();
  const rejectRequestMutation = useRejectLeaveEncashmentRequest();

  console.log('LeaveEncashment: leaveTypesData structure', leaveTypesData);

  // Extract data safely
  const safeExtractArray = (data: any, fallback: any[] = []) => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    
    // Handle paginated API response (data.data.data for Laravel paginated results)
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    // Handle direct API response (data.data)
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return fallback;
  };

  const requests = requestsData?.data?.data || [];
  const leaveTypes = safeExtractArray(leaveTypesData, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRequestMutation.mutateAsync({
        leave_type_id: parseInt(leaveTypeId),
        days: parseInt(days),
      });
      setLeaveTypeId('');
      setDays('');
    } catch (error) {
      console.error('Error creating encashment request:', error);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Encashment</h2>
      <form onSubmit={handleSubmit} className="mb-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Leave Type</label>
          <select
            value={leaveTypeId}
            onChange={e => setLeaveTypeId(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">Select Leave Type</option>
            {leaveTypes.map((lt: any) => (
              <option key={lt.id} value={lt.id}>{lt.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Days to Encash</label>
          <input
            type="number"
            value={days}
            onChange={e => setDays(e.target.value)}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={createRequestMutation.isPending}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          {createRequestMutation.isPending ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message="Failed to load encashment requests." />}
      {!isLoading && !error && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Leave Type</th>
              <th className="px-4 py-2 text-left">Days</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((req: any) => (
              <tr key={req.id}>
                <td className="px-4 py-2">{req.user.name}</td>
                <td className="px-4 py-2">{req.leave_type.name}</td>
                <td className="px-4 py-2">{req.days}</td>
                <td className="px-4 py-2">{req.status}</td>
                <td className="px-4 py-2">
                  {req.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button onClick={() => approveRequestMutation.mutateAsync(req.id)} className="text-green-600">
                        <CheckIcon className="h-5 w-5" />
                      </button>
                      <button onClick={() => rejectRequestMutation.mutateAsync(req.id)} className="text-red-600">
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
