import { useState } from 'react';
import { useQuery, QueryFunctionContext } from '@tanstack/react-query';
import { ArrowDownTrayIcon as DocumentDownloadIcon, MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import { Sale } from '../types';
import { EyeIcon } from '@heroicons/react/24/outline';
import SaleDetailModal from './SaleDetailModal';

interface Transaction {
  id: number;
  transaction_number: string;
  customer_name: string | null;
  transaction_date: string;
}

interface ReceiptsResponse {
  data: Transaction[];
  current_page: number;
  last_page: number;
  // Remove prev_page_url and next_page_url if not present in API response
  // prev_page_url: string | null;
  // next_page_url: string | null;
}

const fetchReceipts = async ({ queryKey }: QueryFunctionContext<readonly [string, { page: number; searchTerm: string }]>) => {
  const [_key, { page, searchTerm }] = queryKey;
  const { data } = await api.get<ReceiptsResponse>('/receipts', {
    params: {
      page,
      search: searchTerm,
    },
  });
  return data;
};

const Receipts = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: receiptsData, isLoading, error } = useQuery({
    queryKey: ['receipts', { page, searchTerm }] as const,
    queryFn: fetchReceipts,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page on new search
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <div className="border-b border-gray-200 pb-5 mb-5">
        <h3 className="text-xl font-semibold text-gray-900">Saved Receipts</h3>
        <p className="mt-1 text-sm text-gray-500">Browse and download past transaction receipts.</p>
        <button onClick={() => console.log(receiptsData)} className="mt-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Debug</button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by transaction ID or customer..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading receipts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 bg-red-50 rounded-lg">
          <p className="text-red-600 font-medium">Error loading receipts</p>
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        </div>
      ) : !receiptsData?.data || receiptsData.data.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-600 font-medium">No Receipts Found</p>
          <p className="text-gray-500 text-sm mt-1">There are no saved receipts matching your search.</p>
        </div>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {receiptsData.data.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{transaction.transaction_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{transaction.customer_name || 'Walk-in Customer'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedSale(transaction);
                          setIsModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <SaleDetailModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            sale={selectedSale}
          />
          {/* Pagination */}
          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setPage(page - 1)}
              disabled={receiptsData ? receiptsData.current_page <= 1 : true}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {receiptsData?.current_page} of {receiptsData?.last_page}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={receiptsData ? receiptsData.current_page >= receiptsData.last_page : true}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Receipts;
