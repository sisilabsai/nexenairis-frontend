'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import AddAssetModal from './AddAssetModal';
import ViewAssetModal from './ViewAssetModal';
import AssetAnalytics from './AssetAnalytics';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';

export interface Asset {
    id: number;
    name: string;
    asset_code: string;
    category?: {
        id: number;
        name: string;
    };
    status: string;
    purchase_date: string;
    purchase_price: string;
    description: string;
    serial_number: string;
    model: string;
    manufacturer: string;
    warranty_expiry_date: string;
}

interface AssetCategory {
    id: number;
    name: string;
}

const AssetsPage = () => {
    const { get, delete: deleteAsset } = useApi();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [categories, setCategories] = useState<AssetCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    const [assetToView, setAssetToView] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [assetsResponse, categoriesResponse] = await Promise.all([
                get('/assets'),
                get('/asset-categories')
            ]);

            if (assetsResponse && Array.isArray(assetsResponse.data)) {
                setAssets(assetsResponse.data);
            } else if (assetsResponse && Array.isArray(assetsResponse)) {
                setAssets(assetsResponse);
            } else {
                console.error('Fetched assets data is not in the expected format:', assetsResponse);
                setAssets([]);
            }

            if (categoriesResponse && Array.isArray(categoriesResponse)) {
                setCategories(categoriesResponse as AssetCategory[]);
            } else {
                console.error('Fetched categories is not an array:', categoriesResponse);
                setCategories([]);
            }
        } catch (error: any) {
            console.error('Failed to fetch data', error);
            setError(error.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredAssets = assets
        .filter(asset => asset) // Ensure asset is not null/undefined
        .filter(asset => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                asset.name.toLowerCase().includes(searchTermLower) ||
                asset.asset_code.toLowerCase().includes(searchTermLower) ||
                (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTermLower))
            );
        })
        .filter(asset => statusFilter ? asset.status === statusFilter : true)
        .filter(asset => categoryFilter ? asset.category?.id === parseInt(categoryFilter) : true);

    const exportToCsv = () => {
        const headers = [
            "ID", "Name", "Asset Code", "Category", "Status", "Purchase Date",
            "Purchase Price", "Serial Number", "Model", "Manufacturer", "Warranty Expiry"
        ];
        const rows = filteredAssets.map(asset => [
            asset.id,
            `"${asset.name.replace(/"/g, '""')}"`,
            asset.asset_code,
            asset.category?.name || 'N/A',
            asset.status,
            asset.purchase_date,
            asset.purchase_price,
            asset.serial_number,
            asset.model,
            asset.manufacturer,
            asset.warranty_expiry_date
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute("download", `assets-${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleAssetAdded = () => {
        fetchData();
    };

    const handleEdit = (asset: Asset) => {
        setAssetToEdit(asset);
        setIsModalOpen(true);
    };

    const handleView = (asset: Asset) => {
        setAssetToView(asset);
        setIsViewModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this asset?')) {
            try {
                await deleteAsset(`/assets/${id}`);
                setAssets(assets.filter(a => a.id !== id));
            } catch (error) {
                console.error('Failed to delete asset', error);
            }
        }
    };

    const breadcrumbs = [
        { label: 'Assets', href: '/assets' },
    ];

    return (
        <DashboardLayout>
            <div>
                <PageHeader
                    title="Assets and Equipment"
                    subtitle="Manage your company's assets and equipment."
                    breadcrumbs={breadcrumbs}
                    actions={
                        <div className="flex items-center space-x-4">
                            <Link href="/assets/categories" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700">
                                Manage Categories
                            </Link>
                            <button
                                onClick={() => {
                                    setAssetToEdit(null);
                                    setIsModalOpen(true);
                                }}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add Asset
                            </button>
                        </div>
                    }
                />

                <main className="p-6">
                    <AssetAnalytics />
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorMessage message={error} onRetry={fetchData} />
                    ) : (
                        <div className="bg-white shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium leading-6 text-gray-900">Asset List</h3>
                                    <button
                                        onClick={exportToCsv}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                                    >
                                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                                        Export CSV
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search by name, code, S/N..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>{category.name}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="in_use">In Use</option>
                                        <option value="in_storage">In Storage</option>
                                        <option value="under_maintenance">Under Maintenance</option>
                                        <option value="disposed">Disposed</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Code</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredAssets.map((asset) => (
                                                <tr key={asset.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{asset.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.asset_code}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.category?.name || 'N/A'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.status}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.purchase_date}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.purchase_price}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.serial_number}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.model}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{asset.manufacturer}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => handleView(asset)} className="text-gray-600 hover:text-gray-900">
                                                            <EyeIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleEdit(asset)} className="text-indigo-600 hover:text-indigo-900 ml-4">
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                        <button onClick={() => handleDelete(asset.id)} className="text-red-600 hover:text-red-900 ml-4">
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

                <AddAssetModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onAssetAdded={handleAssetAdded}
                    categories={categories}
                    assetToEdit={assetToEdit}
                />

                <ViewAssetModal
                    isOpen={isViewModalOpen}
                    onClose={() => setIsViewModalOpen(false)}
                    asset={assetToView}
                />
            </div>
        </DashboardLayout>
    );
};

export default AssetsPage;
