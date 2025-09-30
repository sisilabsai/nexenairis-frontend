import React, { useState } from 'react';
import { useLeavePolicies, useDeleteLeavePolicy } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import LeavePolicyModal from './LeavePolicyModal';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function LeavePolicies() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);

  const { data: policiesData, isLoading, error } = useLeavePolicies();
  const deletePolicyMutation = useDeleteLeavePolicy();

  const policies = policiesData?.data?.data || [];

  const handleNewPolicy = () => {
    setSelectedPolicy(null);
    setIsModalOpen(true);
  };

  const handleEditPolicy = (policy: any) => {
    setSelectedPolicy(policy);
    setIsModalOpen(true);
  };

  const handleDeletePolicy = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await deletePolicyMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting policy:', error);
      }
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Leave Policies</h2>
        <button
          onClick={handleNewPolicy}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Policy
        </button>
      </div>
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage message="Failed to load leave policies." />}
      {!isLoading && !error && (
        <div className="space-y-4">
          {policies.map((policy: any) => (
            <div key={policy.id} className="border rounded-md p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">{policy.name}</h3>
                <div className="flex space-x-2">
                  <button onClick={() => handleEditPolicy(policy)} className="text-indigo-600">
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDeletePolicy(policy.id)} className="text-red-600">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600">{policy.description}</p>
              <div className="mt-2">
                <h4 className="font-medium text-sm">Leave Types:</h4>
                <ul className="list-disc list-inside">
                  {policy.leave_types.map((lt: any) => (
                    <li key={lt.id} className="text-sm">{lt.name}: {lt.pivot.days} days</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      <LeavePolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
        policy={selectedPolicy}
      />
    </div>
  );
}
