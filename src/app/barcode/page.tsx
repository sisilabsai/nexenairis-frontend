'use client';

import { useState } from 'react';
import { 
  QrCodeIcon, 
  CameraIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  useGenerateBarcode, 
  useScanBarcode,
  useProducts
} from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function BarcodePage() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'generator'>('scanner');
  const [manualBarcode, setManualBarcode] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const generateBarcodeMutation = useGenerateBarcode();
  const scanBarcodeMutation = useScanBarcode();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts();

  const products = (productsData?.data?.data as any[]) || [];

  const handleManualScan = async () => {
    if (!manualBarcode.trim()) {
      setScanError('Please enter a barcode');
      return;
    }

    try {
      setScanError(null);
      const result = await scanBarcodeMutation.mutateAsync({
        barcode: manualBarcode.trim(),
        scan_location: 'Manual Entry',
        device_info: { type: 'manual' }
      });

      if ((result as any)?.data) {
        setScanResult((result as any).data);
      }
    } catch (error: any) {
      setScanError(error.response?.data?.message || 'Failed to scan barcode');
      setScanResult(null);
    }
  };

  const handleGenerateBarcode = async (productId: number) => {
    try {
      await generateBarcodeMutation.mutateAsync({
        product_id: productId,
        barcode_type: 'ean13'
      });
    } catch (error) {
      console.error('Failed to generate barcode:', error);
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Barcode Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Generate and scan barcodes for your products with mobile scanning capabilities.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scanner'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CameraIcon className="h-4 w-4 mr-2" />
              Scanner
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generator'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <QrCodeIcon className="h-4 w-4 mr-2" />
              Generator
            </button>
          </nav>
        </div>

        {/* Scanner Tab */}
        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Barcode Scanner</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Manual Entry</label>
                  <input
                    type="text"
                    value={manualBarcode}
                    onChange={(e) => setManualBarcode(e.target.value)}
                    placeholder="Enter barcode manually"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <button
                  onClick={handleManualScan}
                  disabled={scanBarcodeMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {scanBarcodeMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Scan Barcode
                    </>
                  )}
                </button>

                {scanError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{scanError}</p>
                  </div>
                )}

                {scanResult && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <h4 className="font-medium text-green-900 mb-2">Product Found</h4>
                    <div className="space-y-1">
                      <p className="text-sm text-green-700"><strong>Name:</strong> {scanResult.product.name}</p>
                      <p className="text-sm text-green-700"><strong>SKU:</strong> {scanResult.product.sku}</p>
                      <p className="text-sm text-green-700"><strong>Barcode:</strong> {scanResult.product.barcode}</p>
                      <p className="text-sm text-green-700"><strong>Stock:</strong> {scanResult.product.current_stock}</p>
                      <p className="text-sm text-green-700"><strong>Price:</strong> UGX {scanResult.product.selling_price?.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Barcode Generator</h3>
            
            {productsLoading ? (
              <LoadingSpinner size="lg" className="py-8" />
            ) : productsError ? (
              <ErrorMessage message={productsError.message || 'Failed to load products'} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Barcode
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product: any) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.barcode ? (
                            <span className="text-green-600 font-medium">{product.barcode}</span>
                          ) : (
                            <span className="text-gray-400">No barcode</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {!product.barcode ? (
                            <button
                              onClick={() => handleGenerateBarcode(product.id)}
                              disabled={generateBarcodeMutation.isPending}
                              className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                            >
                              {generateBarcodeMutation.isPending ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                'Generate'
                              )}
                            </button>
                          ) : (
                            <span className="text-green-600">✓ Generated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
