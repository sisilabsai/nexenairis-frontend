'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import DashboardLayout from '@/components/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import AddCategoryModal from './AddCategoryModal';

interface AssetCategory {
    id: number;
    name: string;
    description: string;
    useful_life: number;
}

const AssetCategoriesPage = () => {
    const { get, post, delete: deleteCategory } = useApi();
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<AssetCategory | null>(null);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await get('/asset-categories') as any;
            if (response && Array.isArray(response)) {
                setCategories(response);
            } else {
                console.error('Fetched categories is not an array:', response);
                setCategories([]);
            }
        } catch (error: any) {
            console.error('Failed to fetch asset categories', error);
            setError(error.message || 'Failed to fetch asset categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleCategoryAdded = () => {
        fetchCategories();
    };

    const handleEdit = (category: AssetCategory) => {
        setCategoryToEdit(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await deleteCategory(`/asset-categories/${id}`);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
                console.error('Failed to delete category', error);
            }
        }
    };

    const handleSeedCategories = async () => {
        if (window.confirm('Are you sure you want to add the default system categories? This will not remove any categories you have already created.')) {
            try {
                await post('/asset-categories/seed', {});
                fetchCategories();
            } catch (error) {
                console.error('Failed to seed categories', error);
            }
        }
    };

    const breadcrumbs = [
        { label: 'Assets', href: '/assets' },
        { label: 'Categories', href: '/assets/categories' }
    ];

    return (
        <DashboardLayout>
            <div>
                <PageHeader
                    title="Asset Categories"
                    subtitle="Manage your asset categories."
                    breadcrumbs={breadcrumbs}
                    actions={
                        <div className="flex space-x-4">
                            <button
                                onClick={handleSeedCategories}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
                            >
                                Use System Categories
                            </button>
                            <button
                                onClick={() => {
                                    setCategoryToEdit(null);
                                    setIsModalOpen(true);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Category
                            </button>
                        </div>
                    }
                />

                <main className="p-6">
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorMessage message={error} onRetry={fetchCategories} />
                    ) : (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Category List</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Useful Life (Years)</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {categories.map((category) => (
                                                <tr key={category.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.description}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.useful_life}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => handleEdit(category)} className="text-indigo-600 hover:text-indigo-900">
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-900 ml-4">
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <AddCategoryModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onCategoryAdded={handleCategoryAdded}
                    categoryToEdit={categoryToEdit}
                />
            </div>
        </DashboardLayout>
    );
};

export default AssetCategoriesPage;
