'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useApi } from '@/hooks/useApi';
import AssetMedia from './AssetMedia';

interface AssetCategory {
    id: number;
    name: string;
}

interface Asset {
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

interface AddAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAssetAdded: () => void;
    categories: AssetCategory[];
    assetToEdit?: Asset | null;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onAssetAdded, categories, assetToEdit }) => {
    const { post, put } = useApi();
    const [name, setName] = useState('');
    const [assetCategoryId, setAssetCategoryId] = useState('');
    const [purchaseDate, setPurchaseDate] = useState('');
    const [purchasePrice, setPurchasePrice] = useState('');
    const [status, setStatus] = useState('in_storage');
    const [description, setDescription] = useState('');
    const [serialNumber, setSerialNumber] = useState('');
    const [model, setModel] = useState('');
    const [manufacturer, setManufacturer] = useState('');
    const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');

    useEffect(() => {
        if (assetToEdit) {
            setName(assetToEdit.name ?? '');
            setAssetCategoryId(String(assetToEdit.category?.id ?? ''));
            setPurchaseDate(assetToEdit.purchase_date ?? '');
            setPurchasePrice(assetToEdit.purchase_price ?? '');
            setStatus(assetToEdit.status ?? 'in_storage');
            setDescription(assetToEdit.description ?? '');
            setSerialNumber(assetToEdit.serial_number ?? '');
            setModel(assetToEdit.model ?? '');
            setManufacturer(assetToEdit.manufacturer ?? '');
            setWarrantyExpiryDate(assetToEdit.warranty_expiry_date ?? '');
        } else {
            setName('');
            setAssetCategoryId('');
            setPurchaseDate('');
            setPurchasePrice('');
            setStatus('in_storage');
            setDescription('');
            setSerialNumber('');
            setModel('');
            setManufacturer('');
            setWarrantyExpiryDate('');
        }
    }, [assetToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const assetData = {
                name,
                asset_category_id: assetCategoryId,
                purchase_date: purchaseDate,
                purchase_price: purchasePrice,
                status,
                description,
                serial_number: serialNumber,
                model,
                manufacturer,
                warranty_expiry_date: warrantyExpiryDate,
            };

            if (assetToEdit) {
                await put(`/assets/${assetToEdit.id}`, assetData);
            } else {
                await post('/assets', assetData);
            }
            
            onAssetAdded();
            onClose();
        } catch (error) {
            console.error('Failed to save asset', error);
        }
    };

    if (!isOpen) return null;

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                {/* ... (Modal backdrop and panel) */}
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                {assetToEdit ? 'Edit' : 'Add'} Asset
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {assetToEdit ? 'Update the details of the asset.' : 'Fill in the details below to add a new asset to your inventory.'}
                                </p>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Asset Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            id="description"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="assetCategoryId" className="block text-sm font-medium text-gray-700">
                                            Category
                                        </label>
                                        <select
                                            id="assetCategoryId"
                                            name="assetCategoryId"
                                            value={assetCategoryId}
                                            onChange={(e) => setAssetCategoryId(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        >
                                            <option value="">Select a category</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700">
                                            Purchase Date
                                        </label>
                                        <input
                                            type="date"
                                            name="purchaseDate"
                                            id="purchaseDate"
                                            value={purchaseDate}
                                            onChange={(e) => setPurchaseDate(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700">
                                            Purchase Price
                                        </label>
                                        <input
                                            type="number"
                                            name="purchasePrice"
                                            id="purchasePrice"
                                            value={purchasePrice}
                                            onChange={(e) => setPurchasePrice(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
                                        >
                                            <option value="in_storage">In Storage</option>
                                            <option value="in_use">In Use</option>
                                            <option value="under_maintenance">Under Maintenance</option>
                                            <option value="disposed">Disposed</option>
                                            <option value="retired">Retired</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700">
                                            Serial Number
                                        </label>
                                        <input
                                            type="text"
                                            name="serialNumber"
                                            id="serialNumber"
                                            value={serialNumber}
                                            onChange={(e) => setSerialNumber(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                                            Model
                                        </label>
                                        <input
                                            type="text"
                                            name="model"
                                            id="model"
                                            value={model}
                                            onChange={(e) => setModel(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700">
                                            Manufacturer
                                        </label>
                                        <input
                                            type="text"
                                            name="manufacturer"
                                            id="manufacturer"
                                            value={manufacturer}
                                            onChange={(e) => setManufacturer(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="warrantyExpiryDate" className="block text-sm font-medium text-gray-700">
                                            Warranty Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            name="warrantyExpiryDate"
                                            id="warrantyExpiryDate"
                                            value={warrantyExpiryDate}
                                            onChange={(e) => setWarrantyExpiryDate(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    >
                                        {assetToEdit ? 'Save Changes' : 'Add Asset'}
                                    </button>
                                </div>
                            </form>
                            {assetToEdit && <AssetMedia assetId={assetToEdit.id} />}
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddAssetModal;
