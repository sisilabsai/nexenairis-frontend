'use client';

import { useTopSellingProducts } from '../hooks/useApi';
import { CubeIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';

// Type definitions
type TopProduct = {
  product_id: number;
  product_name: string;
  total_quantity: number;
  image?: string;
};

type TopProductsResponse = {
  data: {
    data: TopProduct[];
  };
};

export default function QuickKeysPanel({ onProductSelect }: { onProductSelect: (product: any) => void }) {
  const { data: topProductsData, isLoading } = useTopSellingProducts({ limit: 12 }) as { data: TopProductsResponse, isLoading: boolean };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-4 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  const topProducts = topProductsData?.data?.data || [];

  return (
    <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Keys</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {topProducts.map((product: any) => (
                    <div
                        key={product.product_id}
                        onClick={() => onProductSelect(product)}
                        className="group relative border rounded-lg p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                    >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-2">
                            {product.image ? (
                                <img src={product.image} alt={product.product_name} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <CubeIcon className="h-8 w-8 text-gray-400" />
                            )}
                        </div>
                        <p className="text-xs font-medium text-gray-700 group-hover:text-green-700">{product.product_name}</p>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
