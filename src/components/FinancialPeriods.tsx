import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PlusIcon, LockClosedIcon, LockOpenIcon, PencilIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import FinancialPeriodModal from './FinancialPeriodModal';
import PeriodsAuditInfoModal from './PeriodsAuditInfoModal';

interface FinancialPeriod {
  id?: number;
  name: string;
  start_date: string;
  end_date: string;
  status?: 'open' | 'closed';
}

const FinancialPeriods = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<FinancialPeriod | null>(null);

  const { data: periods, isLoading } = useQuery({ 
    queryKey: ['financial_periods'], 
    queryFn: () => api.get('/finance/financial-periods') 
  });

  const createPeriodMutation = useMutation({
    mutationFn: (period: FinancialPeriod) => api.post('/finance/financial-periods', period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_periods'] });
    },
  });

  const updatePeriodMutation = useMutation({
    mutationFn: (period: FinancialPeriod) => api.put(`/finance/financial-periods/${period.id}`, period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_periods'] });
    },
  });

  const closePeriodMutation = useMutation({
    mutationFn: (id: number) => api.post(`/finance/financial-periods/${id}/close`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_periods'] });
    },
  });

  const reopenPeriodMutation = useMutation({
    mutationFn: (id: number) => api.post(`/finance/financial-periods/${id}/reopen`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_periods'] });
    },
  });

  const handleSavePeriod = (data: FinancialPeriod) => {
    if (selectedPeriod) {
      updatePeriodMutation.mutate({ ...data, id: selectedPeriod.id });
    } else {
      createPeriodMutation.mutate(data);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Financial Periods</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => {
              setSelectedPeriod(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add New Period
          </button>
          <button onClick={() => setIsInfoModalOpen(true)} className="p-2 text-gray-400 hover:text-gray-600">
            <InformationCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr>
              <td colSpan={5} className="text-center py-4">Loading...</td>
            </tr>
          ) : (
            (periods as any)?.data?.map((period: FinancialPeriod) => (
              <tr key={period.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.start_date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{period.end_date}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  period.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {period.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsModalOpen(true);
                    }} 
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  {period.status === 'open' ? (
                    <button onClick={() => closePeriodMutation.mutate(period.id!)} className="text-red-600 hover:text-red-900">
                      <LockClosedIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button onClick={() => reopenPeriodMutation.mutate(period.id!)} className="text-green-600 hover:text-green-900">
                      <LockOpenIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
            ))
          )}
        </tbody>
      </table>
      <FinancialPeriodModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePeriod}
        period={selectedPeriod}
      />
      <PeriodsAuditInfoModal 
        isOpen={isInfoModalOpen} 
        onClose={() => setIsInfoModalOpen(false)} 
      />
    </div>
  );
};

export default FinancialPeriods;
