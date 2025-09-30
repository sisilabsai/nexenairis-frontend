'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { 
  useProjectCategories,
  useCreateProjectCategory,
  useUpdateProjectCategory,
  useDeleteProjectCategory
} from '../hooks/useApi';

interface ProjectCategory {
  id?: number;
  name: string;
  code: string;
  description: string;
  is_active: boolean;
}

interface ProjectCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategorySelect?: (category: any) => void;
}

export default function ProjectCategoryModal({ isOpen, onClose, onCategorySelect }: ProjectCategoryModalProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [formData, setFormData] = useState<ProjectCategory>({
    name: '',
    code: '',
    description: '',
    is_active: true
  });
  const [errors, setErrors] = useState<any>({});

  // API hooks
  const { data: categoriesData, isLoading, error, refetch } = useProjectCategories();
  const createCategoryMutation = useCreateProjectCategory();
  const updateCategoryMutation = useUpdateProjectCategory();
  const deleteCategoryMutation = useDeleteProjectCategory();

  // Accept either a paginated response (data.data) or a direct array (data)
  const categories = (categoriesData as any)?.data?.data || (categoriesData as any)?.data || [];

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        code: editingCategory.code,
        description: editingCategory.description || '',
        is_active: editingCategory.is_active
      });
      setIsFormOpen(true);
    }
  }, [editingCategory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Generate code if not already set
    const currentFormData = { ...formData };
    if (!currentFormData.code && currentFormData.name) {
      let baseCode = currentFormData.name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 10);
      
      // Check if this code might already exist by looking at current categories
      const existingCodes = categories.map((cat: any) => cat.code) || [];
      let generatedCode = baseCode;
      let counter = 1;
      
      // If code already exists, append a number
      while (existingCodes.includes(generatedCode)) {
        generatedCode = `${baseCode}_${counter}`;
        if (generatedCode.length > 50) {
          // If too long, truncate base and try again
          baseCode = baseCode.substring(0, 8);
          generatedCode = `${baseCode}_${counter}`;
        }
        counter++;
      }
      
      currentFormData.code = generatedCode;
      setFormData(currentFormData);
    }

    // Client-side validation
    const newErrors: any = {};
    if (!currentFormData.name) newErrors.name = 'Category name is required';
    if (!currentFormData.code) newErrors.code = 'Category code is required';
    if (currentFormData.code && !/^[A-Z0-9_]+$/.test(currentFormData.code)) {
      newErrors.code = 'Code must contain only uppercase letters, numbers, and underscores';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const mutation = editingCategory ? updateCategoryMutation : createCategoryMutation;
    const mutationData = editingCategory ? { id: editingCategory.id!, data: currentFormData } : currentFormData;

    mutation.mutate(mutationData as any, {
        onSuccess: () => {
            console.log(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
            resetForm();
            refetch();
        },
        onError: (error: any) => {
            console.error(`Error ${editingCategory ? 'updating' : 'creating'} category:`, error);
            if (error.response?.data?.errors) {
                const backendErrors = error.response.data.errors;
                const newErrors: any = {};
                if (backendErrors.code && backendErrors.code.includes('already been taken')) {
                    newErrors.code = `Code "${currentFormData.code}" already exists. Please use a different code.`;
                } else {
                    Object.assign(newErrors, backendErrors);
                }
                setErrors(newErrors);
            } else if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message });
            } else {
                setErrors({ general: 'An error occurred. Please try again.' });
            }
        },
    });
  };

  const handleDelete = async (category: any) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This action cannot be undone.`)) {
      try {
        await deleteCategoryMutation.mutateAsync(category.id);
        console.log('Category deleted successfully!');
        refetch();
      } catch (error: any) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category. It may be in use by existing projects.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      is_active: true
    });
    setEditingCategory(null);
    setIsFormOpen(false);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCodeGeneration = () => {
    if (formData.name && !formData.code) {
      let baseCode = formData.name
        .toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 10);
      
      // Check if this code might already exist by looking at current categories
      const existingCodes = categories.map((cat: any) => cat.code) || [];
      let generatedCode = baseCode;
      let counter = 1;
      
      // If code already exists, append a number
      while (existingCodes.includes(generatedCode)) {
        generatedCode = `${baseCode}_${counter}`;
        if (generatedCode.length > 50) {
          // If too long, truncate base and try again
          baseCode = baseCode.substring(0, 8);
          generatedCode = `${baseCode}_${counter}`;
        }
        counter++;
      }
      
      setFormData(prev => ({ ...prev, code: generatedCode }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-8 transform transition-all duration-300 ease-in-out">
          <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">Manage Project Categories</h3>
              <button
                type="button"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {!isFormOpen && (
              <div className="mb-6">
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-transform transform hover:scale-105"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New Category
                </button>
              </div>
            )}

            {isFormOpen && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h4>
                {errors.general && (
                  <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleCodeGeneration}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        placeholder="e.g., Web Development"
                      />
                      {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Code *</label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.code ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                        placeholder="e.g., WEBDEV"
                        style={{ textTransform: 'uppercase' }}
                      />
                      {errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Brief description of this category..."
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                      className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {createCategoryMutation.isPending || updateCategoryMutation.isPending 
                        ? 'Saving...' 
                        : editingCategory ? 'Update' : 'Create'
                      }
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Existing Categories</h4>
              {isLoading ? (
                <div className="text-center py-4"><span className="loader"></span></div>
              ) : error ? (
                <div className="text-center py-4 text-red-600">Error loading categories.</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No categories found.</div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {categories.map((category: any) => (
                      <li key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div className="flex-1">
                                <h5 className="text-md font-semibold text-gray-900">{category.name}</h5>
                                <p className="text-sm text-gray-500">Code: {category.code}</p>
                                {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                  category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {category.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-sm text-gray-500">{category.projects_count || 0} projects</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-3 mt-2">
                            {onCategorySelect && (
                              <button
                                onClick={() => { onCategorySelect(category); onClose(); }}
                                className="text-sm text-indigo-600 hover:underline"
                              >
                                Select
                              </button>
                            )}
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="text-sm text-gray-600 hover:underline"
                            >
                              <PencilIcon className="h-4 w-4 mr-1 inline" /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(category)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              <TrashIcon className="h-4 w-4 mr-1 inline" /> Delete
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white rounded-b-2xl z-10 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
