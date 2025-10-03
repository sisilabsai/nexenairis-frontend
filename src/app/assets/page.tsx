'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import AddAssetModal from './AddAssetModal';
import ViewAssetModal from './ViewAssetModal';
import ImportAssetsModal from './ImportAssetsModal';
import AssetAnalytics from './AssetAnalytics';
import PageHeader from '@/components/ui/PageHeader';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon, 
    DocumentArrowDownIcon, 
    DocumentArrowUpIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    Squares2X2Icon,
    ListBulletIcon,
    AdjustmentsHorizontalIcon,
    CheckIcon,
    CubeIcon
} from '@heroicons/react/24/outline';
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
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
    const [assetToView, setAssetToView] = useState<Asset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [selectedAssets, setSelectedAssets] = useState<Set<number>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'value' | 'status'>('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [showFilters, setShowFilters] = useState(false);

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
                (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTermLower)) ||
                (asset.manufacturer && asset.manufacturer.toLowerCase().includes(searchTermLower)) ||
                (asset.model && asset.model.toLowerCase().includes(searchTermLower))
            );
        })
        .filter(asset => statusFilter ? asset.status === statusFilter : true)
        .filter(asset => categoryFilter ? asset.category?.id === parseInt(categoryFilter) : true)
        .sort((a, b) => {
            let aValue: any, bValue: any;
            switch (sortBy) {
                case 'name':
                    aValue = a.name.toLowerCase();
                    bValue = b.name.toLowerCase();
                    break;
                case 'date':
                    aValue = new Date(a.purchase_date);
                    bValue = new Date(b.purchase_date);
                    break;
                case 'value':
                    aValue = parseFloat(a.purchase_price) || 0;
                    bValue = parseFloat(b.purchase_price) || 0;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

    // Pagination
    const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

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
                setSelectedAssets(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            } catch (error) {
                console.error('Failed to delete asset', error);
            }
        }
    };

    const handleBulkDelete = async () => {
        if (selectedAssets.size === 0) return;
        
        if (window.confirm(`Are you sure you want to delete ${selectedAssets.size} selected assets?`)) {
            try {
                const deletePromises = Array.from(selectedAssets).map(id => deleteAsset(`/assets/${id}`));
                await Promise.all(deletePromises);
                setAssets(assets.filter(a => !selectedAssets.has(a.id)));
                setSelectedAssets(new Set());
            } catch (error) {
                console.error('Failed to delete assets', error);
            }
        }
    };

    const handleSelectAsset = (id: number) => {
        setSelectedAssets(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedAssets.size === paginatedAssets.length) {
            setSelectedAssets(new Set());
        } else {
            setSelectedAssets(new Set(paginatedAssets.map(asset => asset.id)));
        }
    };

    const handleSort = (field: 'name' | 'date' | 'value' | 'status') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'in_use': return 'bg-green-100 text-green-800';
            case 'in_storage': return 'bg-blue-100 text-blue-800';
            case 'under_maintenance': return 'bg-yellow-100 text-yellow-800';
            case 'disposed': return 'bg-red-100 text-red-800';
            case 'retired': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatStatusLabel = (status: string) => {
        return status.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    const breadcrumbs = [
        { label: 'Assets', href: '/assets' },
    ];

    return (
        <DashboardLayout>
            <div>
                <PageHeader
                    title="Assets & Equipment"
                    subtitle="Manage your company's assets and equipment with advanced tools."
                    breadcrumbs={breadcrumbs}
                    actions={
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                            <Link 
                                href="/assets/categories" 
                                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                            >
                                <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
                                <span className="hidden sm:inline">Categories</span>
                            </Link>
                            <button
                                onClick={() => setIsImportModalOpen(true)}
                                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
                            >
                                <DocumentArrowUpIcon className="h-4 w-4 mr-1.5" />
                                <span className="hidden sm:inline">Import</span>
                            </button>
                            <button
                                onClick={() => {
                                    setAssetToEdit(null);
                                    setIsModalOpen(true);
                                }}
                                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                <PlusIcon className="h-4 w-4 mr-1.5" />
                                Add Asset
                            </button>
                        </div>
                    }
                />

                <main className="p-4 md:p-6 space-y-6">
                    <AssetAnalytics />
                    
                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <ErrorMessage message={error} onRetry={fetchData} />
                    ) : (
                        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                            {/* Header with controls */}
                            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Asset Management ({filteredAssets.length})
                                        </h3>
                                        <button
                                            onClick={() => setShowFilters(!showFilters)}
                                            className="lg:hidden inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            <FunnelIcon className="h-4 w-4 mr-1" />
                                            Filters
                                        </button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                                        {/* Bulk Actions */}
                                        {selectedAssets.size > 0 && (
                                            <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                                                <span className="text-sm font-medium text-blue-700">
                                                    {selectedAssets.size} selected
                                                </span>
                                                <button
                                                    onClick={handleBulkDelete}
                                                    className="text-sm text-red-600 hover:text-red-800 font-medium"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}

                                        {/* View Toggle */}
                                        <div className="flex rounded-lg border border-gray-200">
                                            <button
                                                onClick={() => setViewMode('table')}
                                                className={`px-3 py-2 text-sm font-medium rounded-l-lg ${
                                                    viewMode === 'table'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <ListBulletIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('grid')}
                                                className={`px-3 py-2 text-sm font-medium rounded-r-lg border-l border-gray-200 ${
                                                    viewMode === 'grid'
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Squares2X2Icon className="h-4 w-4" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={exportToCsv}
                                            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700"
                                        >
                                            <DocumentArrowDownIcon className="h-4 w-4 mr-1.5" />
                                            <span className="hidden sm:inline">Export CSV</span>
                                            <span className="sm:hidden">Export</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Search and Filters */}
                                <div className={`mt-4 space-y-4 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                                    <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-4">
                                        {/* Search */}
                                        <div className="flex-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search assets..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            />
                                        </div>

                                        {/* Filters */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:w-auto">
                                            <select
                                                value={categoryFilter}
                                                onChange={(e) => setCategoryFilter(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>{category.name}</option>
                                                ))}
                                            </select>

                                            <select
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="">All Statuses</option>
                                                <option value="in_use">In Use</option>
                                                <option value="in_storage">In Storage</option>
                                                <option value="under_maintenance">Under Maintenance</option>
                                                <option value="disposed">Disposed</option>
                                                <option value="retired">Retired</option>
                                            </select>

                                            <select
                                                value={sortBy}
                                                onChange={(e) => setSortBy(e.target.value as any)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                                            >
                                                <option value="name">Sort by Name</option>
                                                <option value="date">Sort by Date</option>
                                                <option value="value">Sort by Value</option>
                                                <option value="status">Sort by Status</option>
                                            </select>

                                            <button
                                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                                className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                {sortOrder === 'asc' ? '↑' : '↓'} {sortOrder.toUpperCase()}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content Area */}
                            <div className="p-0">
                                {viewMode === 'table' ? (
                                    /* Table View */
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedAssets.size === paginatedAssets.length && paginatedAssets.length > 0}
                                                            onChange={handleSelectAll}
                                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                        />
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                                                    <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Date</th>
                                                    <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {paginatedAssets.map((asset) => (
                                                    <tr key={asset.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedAssets.has(asset.id)}
                                                                onChange={() => handleSelectAsset(asset.id)}
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center">
                                                                <div className="ml-0">
                                                                    <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                                                                    <div className="text-sm text-gray-500">{asset.asset_code}</div>
                                                                    <div className="text-xs text-gray-400 md:hidden">
                                                                        {asset.category?.name} • {formatStatusLabel(asset.status)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {asset.category?.name || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                                                                {formatStatusLabel(asset.status)}
                                                            </span>
                                                        </td>
                                                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {asset.purchase_date}
                                                        </td>
                                                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                            {asset.purchase_price}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex items-center justify-end space-x-2">
                                                                <button 
                                                                    onClick={() => handleView(asset)} 
                                                                    className="text-gray-400 hover:text-gray-600 p-1"
                                                                    title="View"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleEdit(asset)} 
                                                                    className="text-indigo-400 hover:text-indigo-600 p-1"
                                                                    title="Edit"
                                                                >
                                                                    <PencilIcon className="h-4 w-4" />
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDelete(asset.id)} 
                                                                    className="text-red-400 hover:text-red-600 p-1"
                                                                    title="Delete"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    /* Grid View */
                                    <div className="p-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {paginatedAssets.map((asset) => (
                                                <div key={asset.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                                                    <div className="p-4">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedAssets.has(asset.id)}
                                                                onChange={() => handleSelectAsset(asset.id)}
                                                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mt-1"
                                                            />
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                                                                {formatStatusLabel(asset.status)}
                                                            </span>
                                                        </div>
                                                        
                                                        <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">{asset.name}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">{asset.asset_code}</p>
                                                        
                                                        <div className="space-y-1 text-xs text-gray-600">
                                                            <div className="flex justify-between">
                                                                <span>Category:</span>
                                                                <span className="font-medium">{asset.category?.name || 'N/A'}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Purchase:</span>
                                                                <span>{asset.purchase_date}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span>Value:</span>
                                                                <span className="font-medium">{asset.purchase_price}</span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
                                                            <button 
                                                                onClick={() => handleView(asset)} 
                                                                className="text-gray-400 hover:text-gray-600 p-1"
                                                                title="View"
                                                            >
                                                                <EyeIcon className="h-4 w-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleEdit(asset)} 
                                                                className="text-indigo-400 hover:text-indigo-600 p-1"
                                                                title="Edit"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(asset.id)} 
                                                                className="text-red-400 hover:text-red-600 p-1"
                                                                title="Delete"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                        <div className="flex-1 flex justify-between items-center">
                                            <div className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(startIndex + itemsPerPage, filteredAssets.length)}
                                                </span>{' '}
                                                of <span className="font-medium">{filteredAssets.length}</span> results
                                            </div>
                                            
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                    disabled={currentPage === 1}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                
                                                <div className="hidden sm:flex space-x-1">
                                                    {[...Array(totalPages)].map((_, i) => (
                                                        <button
                                                            key={i + 1}
                                                            onClick={() => setCurrentPage(i + 1)}
                                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                                                                currentPage === i + 1
                                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            {i + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                <button
                                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Empty State */}
                                {filteredAssets.length === 0 && (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-12 w-12 text-gray-400">
                                            <CubeIcon className="h-12 w-12" />
                                        </div>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No assets found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {searchTerm || statusFilter || categoryFilter
                                                ? 'Try adjusting your search or filters.'
                                                : 'Get started by adding your first asset.'}
                                        </p>
                                        <div className="mt-6">
                                            <button
                                                onClick={() => {
                                                    setAssetToEdit(null);
                                                    setIsModalOpen(true);
                                                }}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                Add Asset
                                            </button>
                                        </div>
                                    </div>
                                )}
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

                <ImportAssetsModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    onImportComplete={handleAssetAdded}
                    categories={categories}
                />
            </div>
        </DashboardLayout>
    );
};

export default AssetsPage;
