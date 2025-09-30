'use client';

import { useState, useEffect } from 'react';
import {
  CameraIcon,
  QrCodeIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

interface ProductFormData {
  name: string;
  sku: string;
  description: string;
  selling_price: number;
  cost_price: number;
  unit_of_measure: string;
  category_id?: number;
  has_expiry: boolean;
  expiry_date?: string;
  current_stock: number;
  min_stock_level: number;
  restock_quantity: number;
}

interface MobileInventoryFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
  categories: any[];
  isLoading?: boolean;
}

export default function MobileInventoryForm({
  initialData,
  onSubmit,
  onClose,
  categories,
  isLoading = false
}: MobileInventoryFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: initialData?.name || '',
    sku: initialData?.sku || '',
    description: initialData?.description || '',
    selling_price: initialData?.selling_price || 0,
    cost_price: initialData?.cost_price || 0,
    unit_of_measure: initialData?.unit_of_measure || 'pcs',
    category_id: initialData?.category_id,
    has_expiry: initialData?.has_expiry || false,
    expiry_date: initialData?.expiry_date,
    current_stock: initialData?.current_stock || 0,
    min_stock_level: initialData?.min_stock_level || 0,
    restock_quantity: initialData?.restock_quantity || 0
  });

  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Generate AI suggestions when form data changes
  useEffect(() => {
    if (formData.name && formData.selling_price > 0) {
      generateAISuggestions();
    }
  }, [formData.name, formData.selling_price, formData.category_id]);

  const generateAISuggestions = async () => {
    try {
      const response = await fetch('/api/inventory-intelligence/ai-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_name: formData.name,
          selling_price: formData.selling_price,
          category_id: formData.category_id,
          context: 'mobile_form'
        })
      });

      if (response.ok) {
        const result = await response.json();
        setAiSuggestions(result.data);
      }
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const applyAISuggestion = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setShowSuggestions(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CameraIcon className="h-5 w-5 mr-2 text-blue-600" />
              Quick Add Product
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* SKU */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU (Auto-generated)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Will be auto-generated"
                readOnly
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, category_id: parseInt(e.target.value) || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Selling Price *
                </label>
                <input
                  type="number"
                  value={formData.selling_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, selling_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Price
                </label>
                <input
                  type="number"
                  value={formData.cost_price}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost_price: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Stock Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Stock *
                </label>
                <input
                  type="number"
                  value={formData.current_stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_stock: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Stock Level
                </label>
                <input
                  type="number"
                  value={formData.min_stock_level}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_stock_level: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Unit of Measure */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit of Measure
              </label>
              <select
                value={formData.unit_of_measure}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_of_measure: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pcs">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="l">Liters</option>
                <option value="m">Meters</option>
                <option value="box">Box</option>
              </select>
            </div>

            {/* AI Suggestions */}
            {aiSuggestions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <SparklesIcon className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">AI Suggestions</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    {showSuggestions ? 'Hide' : 'Show'}
                  </button>
                </div>

                {showSuggestions && (
                  <div className="space-y-2">
                    {aiSuggestions.suggested_category && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">Suggested Category:</span>
                        <button
                          type="button"
                          onClick={() => applyAISuggestion('category_id', aiSuggestions.suggested_category.id)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          {aiSuggestions.suggested_category.name}
                        </button>
                      </div>
                    )}

                    {aiSuggestions.suggested_cost_price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">Suggested Cost:</span>
                        <button
                          type="button"
                          onClick={() => applyAISuggestion('cost_price', aiSuggestions.suggested_cost_price)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          UGX {aiSuggestions.suggested_cost_price.toLocaleString()}
                        </button>
                      </div>
                    )}

                    {aiSuggestions.description_suggestion && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">Description:</span>
                        <button
                          type="button"
                          onClick={() => applyAISuggestion('description', aiSuggestions.description_suggestion)}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  </div>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Save Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}