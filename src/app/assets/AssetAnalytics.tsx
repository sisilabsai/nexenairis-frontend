'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { CubeIcon, CurrencyDollarIcon, TagIcon, ClipboardDocumentListIcon, ChartBarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AnalyticsData {
    totalAssets: number;
    totalValue: number;
    assetsByCategory: Record<string, number>;
    assetsByStatus: Record<string, number>;
    averageAssetValue: number;
    assetsNearWarrantyExpiry: number;
    primary_currency?: string;
    tenant_settings?: any;
}

// Currency formatting utility
const formatCurrency = (amount: number, currency: string = 'UGX') => {
    const currencySymbols: Record<string, string> = {
        'UGX': 'UGX ',
        'KES': 'KSh ',
        'TZS': 'TSh ',
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };
    
    const symbol = currencySymbols[currency] || currency + ' ';
    return symbol + new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

const getCurrencyFromSettings = (settings: any): string => {
    if (!settings) return 'UGX';
    const parsed = typeof settings === 'string' ? JSON.parse(settings) : settings;
    return parsed?.currency || 'UGX';
};

const AssetAnalytics = () => {
    const { get } = useApi();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await get('/assets/analytics') as any;
                setData(response as AnalyticsData);
            } catch (error) {
                console.error('Failed to fetch asset analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-4 md:p-6 rounded-lg shadow animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <div className="text-center text-gray-500">
                    <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>Could not load analytics data.</p>
                </div>
            </div>
        );
    }

    const currency = data.primary_currency || getCurrencyFromSettings(data.tenant_settings);

    return (
        <div className="space-y-6 mb-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Assets</p>
                            <p className="text-2xl md:text-3xl font-bold mt-1">{data.totalAssets.toLocaleString()}</p>
                        </div>
                        <CubeIcon className="h-8 w-8 md:h-10 md:w-10 text-blue-200" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-green-100 text-sm font-medium">Total Value</p>
                            <p className="text-xl md:text-2xl font-bold mt-1 truncate">
                                {formatCurrency(data.totalValue, currency)}
                            </p>
                        </div>
                        <CurrencyDollarIcon className="h-8 w-8 md:h-10 md:w-10 text-green-200 flex-shrink-0" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-purple-100 text-sm font-medium">Avg. Value</p>
                            <p className="text-xl md:text-2xl font-bold mt-1 truncate">
                                {formatCurrency(data.averageAssetValue || (data.totalValue / (data.totalAssets || 1)), currency)}
                            </p>
                        </div>
                        <ChartBarIcon className="h-8 w-8 md:h-10 md:w-10 text-purple-200 flex-shrink-0" />
                    </div>
                </div>

                <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 md:p-6 rounded-xl shadow-lg text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-amber-100 text-sm font-medium">Warranty Expiring</p>
                            <p className="text-2xl md:text-3xl font-bold mt-1">{data.assetsNearWarrantyExpiry || 0}</p>
                        </div>
                        <ExclamationTriangleIcon className="h-8 w-8 md:h-10 md:w-10 text-amber-200" />
                    </div>
                </div>
            </div>

            {/* Category & Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <TagIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Assets by Category</h3>
                    </div>
                    {Object.keys(data.assetsByCategory).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(data.assetsByCategory)
                                .sort(([,a], [,b]) => b - a)
                                .map(([category, count]) => (
                                <div key={category} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">{category}</span>
                                    <div className="flex items-center">
                                        <div className="w-16 md:w-20 bg-gray-200 rounded-full h-2 mr-2">
                                            <div 
                                                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${Math.min((count / data.totalAssets) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No category data available</p>
                    )}
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                    <div className="flex items-center mb-4">
                        <ClipboardDocumentListIcon className="h-5 w-5 text-green-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Assets by Status</h3>
                    </div>
                    {Object.keys(data.assetsByStatus).length > 0 ? (
                        <div className="space-y-3">
                            {Object.entries(data.assetsByStatus)
                                .sort(([,a], [,b]) => b - a)
                                .map(([status, count]) => {
                                    const statusColors: Record<string, string> = {
                                        'in_use': 'bg-green-500',
                                        'in_storage': 'bg-blue-500',
                                        'under_maintenance': 'bg-yellow-500',
                                        'disposed': 'bg-red-500',
                                        'retired': 'bg-gray-500'
                                    };
                                    const statusLabels: Record<string, string> = {
                                        'in_use': 'In Use',
                                        'in_storage': 'In Storage',
                                        'under_maintenance': 'Under Maintenance',
                                        'disposed': 'Disposed',
                                        'retired': 'Retired'
                                    };
                                    return (
                                        <div key={status} className="flex items-center justify-between">
                                            <div className="flex items-center flex-1 mr-2">
                                                <div className={`w-3 h-3 rounded-full ${statusColors[status] || 'bg-gray-500'} mr-2 flex-shrink-0`}></div>
                                                <span className="text-sm font-medium text-gray-700 truncate">{statusLabels[status] || status}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="w-16 md:w-20 bg-gray-200 rounded-full h-2 mr-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-300 ${statusColors[status] || 'bg-gray-500'}`}
                                                        style={{ width: `${Math.min((count / data.totalAssets) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900 w-8 text-right">{count}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No status data available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssetAnalytics;
