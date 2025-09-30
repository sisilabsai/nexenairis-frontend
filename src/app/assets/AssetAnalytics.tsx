'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AnalyticsData {
    totalAssets: number;
    totalValue: number;
    assetsByCategory: Record<string, number>;
    assetsByStatus: Record<string, number>;
}

const AssetAnalytics = () => {
    const { get } = useApi();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const response = await get('/assets/analytics');
                setData(response as unknown as AnalyticsData);
            } catch (error) {
                console.error('Failed to fetch asset analytics', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!data) {
        return <div>Could not load analytics data.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Assets</h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">{data.totalAssets}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Total Asset Value</h3>
                <p className="mt-2 text-3xl font-bold text-indigo-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'UGX' }).format(data.totalValue)}
                </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Assets by Category</h3>
                <ul className="mt-2 space-y-1">
                    {Object.entries(data.assetsByCategory).map(([category, count]) => (
                        <li key={category} className="flex justify-between text-sm">
                            <span>{category}</span>
                            <span className="font-medium">{count}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Assets by Status</h3>
                <ul className="mt-2 space-y-1">
                    {Object.entries(data.assetsByStatus).map(([status, count]) => (
                        <li key={status} className="flex justify-between text-sm">
                            <span>{status}</span>
                            <span className="font-medium">{count}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default AssetAnalytics;
