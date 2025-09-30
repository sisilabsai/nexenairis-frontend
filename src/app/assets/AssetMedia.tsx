'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { api } from '@/lib/api';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface AssetMedia {
    id: number;
    file_path: string;
    file_type: string;
    description: string;
}

interface AssetMediaProps {
    assetId: number;
}

const AssetMedia: React.FC<AssetMediaProps> = ({ assetId }) => {
    const { get, post, delete: deleteMedia } = useApi();
    const [media, setMedia] = useState<AssetMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');

    const fetchMedia = async () => {
        try {
            setLoading(true);
            const response = await get(`/assets/${assetId}/media`);
            console.log('Media response:', response);
            if (response && Array.isArray((response as any))) {
                setMedia((response as any));
            } else {
                setMedia([]);
            }
        } catch (error: any) {
            setError(error.message || 'Failed to fetch media');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedia();
    }, [assetId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', description);

        try {
            await api.post(`/assets/${assetId}/media`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            fetchMedia();
            setFile(null);
            setDescription('');
        } catch (error) {
            console.error('Failed to upload file', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this media?')) {
            try {
                await deleteMedia(`/media/${id}`);
                setMedia(media.filter(m => m.id !== id));
            } catch (error) {
                console.error('Failed to delete media', error);
            }
        }
    };

    return (
        <div className="mt-6">
            <h4 className="text-lg font-medium leading-6 text-gray-900 mb-4">Asset Media</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {media.map((item) => (
                    <div key={item.id} className="relative">
                        <img src={`http://localhost:8000/storage/${item.file_path}`} alt={item.description} className="w-full h-48 object-cover rounded-lg" />
                        <button
                            onClick={() => handleDelete(item.id)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="flex items-center">
                    <input type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
                    <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="ml-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                    <button type="submit" className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AssetMedia;
