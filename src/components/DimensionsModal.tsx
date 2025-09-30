import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Dimension {
  id: number;
  name: string;
  description: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DimensionsModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('cost_centers');

  const { data: costCenters } = useQuery({ queryKey: ['cost_centers'], queryFn: () => api.get('/finance/cost-centers') });
  const { data: departments } = useQuery({ queryKey: ['departments'], queryFn: () => api.get('/finance/departments') });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: () => api.get('/finance/projects') });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Manage Dimensions</h3>
          <div className="mt-2 px-7 py-3">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button onClick={() => setActiveTab('cost_centers')} className={`${activeTab === 'cost_centers' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                  Cost Centers
                </button>
                <button onClick={() => setActiveTab('departments')} className={`${activeTab === 'departments' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                  Departments
                </button>
                <button onClick={() => setActiveTab('projects')} className={`${activeTab === 'projects' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                  Projects
                </button>
              </nav>
            </div>
            <div className="mt-4">
              {activeTab === 'cost_centers' && <DimensionTable data={(costCenters as any)?.data} type="cost_centers" />}
              {activeTab === 'departments' && <DimensionTable data={(departments as any)?.data} type="departments" />}
              {activeTab === 'projects' && <DimensionTable data={(projects as any)?.data} type="projects" />}
            </div>
          </div>
          <div className="items-center px-4 py-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DimensionTable = ({ data, type }: { data: Dimension[], type: string }) => {
  return (
    <div>
      <button className="mb-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
        <PlusIcon className="h-4 w-4 mr-2" />
        Add New
      </button>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.map((item) => (
            <tr key={item.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button className="text-indigo-600 hover:text-indigo-900 mr-3"><PencilIcon className="h-4 w-4" /></button>
                <button className="text-red-600 hover:text-red-900"><TrashIcon className="h-4 w-4" /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DimensionsModal;
