import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLeaveTypes, useCreateLeavePolicy, useUpdateLeavePolicy } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

// Helper function to safely extract array data from API responses
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

interface LeavePolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  policy?: any;
}

export default function LeavePolicyModal({ isOpen, onClose, onSuccess, policy }: LeavePolicyModalProps) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);

  const { data: leaveTypesData, isLoading, error } = useLeaveTypes();
  const createPolicyMutation = useCreateLeavePolicy();
  const updatePolicyMutation = useUpdateLeavePolicy();

  useEffect(() => {
    if (policy) {
      setName(policy.name);
      setDescription(policy.description);
      setLeaveTypes(policy.leave_types.map((lt: any) => ({
        id: lt.id,
        days: lt.pivot.days,
      })));
    } else {
      setName('');
      setDescription('');
      setLeaveTypes([]);
    }
  }, [policy]);

  const handleLeaveTypeChange = (id: number, days: string) => {
    const newLeaveTypes = [...leaveTypes];
    const index = newLeaveTypes.findIndex(lt => lt.id === id);
    if (index > -1) {
      newLeaveTypes[index].days = days;
    } else {
      newLeaveTypes.push({ id, days });
    }
    setLeaveTypes(newLeaveTypes);
  };

  const handleSubmit = async () => {
    const data = {
      name,
      description,
      leave_types: leaveTypes,
    };

    try {
      if (policy) {
        await updatePolicyMutation.mutateAsync({ id: policy.id, data });
      } else {
        await createPolicyMutation.mutateAsync(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving leave policy:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{policy ? 'Edit' : 'Create'} Leave Policy</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Policy Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-900">Leave Types</h4>
            {isLoading && <LoadingSpinner />}
            {error && <ErrorMessage message="Failed to load leave types." />}
            {!isLoading && !error && safeExtractArray(leaveTypesData).map((lt: any) => (
              <div key={lt.id} className="flex items-center justify-between mt-2">
                <span>{lt.name}</span>
                <input
                  type="number"
                  value={leaveTypes.find(l => l.id === lt.id)?.days || ''}
                  onChange={e => handleLeaveTypeChange(lt.id, e.target.value)}
                  className="w-24 text-right shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={createPolicyMutation.isPending || updatePolicyMutation.isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-gray-400"
          >
            {createPolicyMutation.isPending || updatePolicyMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
