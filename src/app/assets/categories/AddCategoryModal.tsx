'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useApi } from '@/hooks/useApi';

interface AssetCategory {
    id: number;
    name: string;
    description: string;
    useful_life: number;
}

interface AddCategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCategoryAdded: (newCategory: AssetCategory) => void;
    categoryToEdit?: AssetCategory | null;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({ isOpen, onClose, onCategoryAdded, categoryToEdit }) => {
    const { post, put } = useApi();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [usefulLife, setUsefulLife] = useState('');

    useEffect(() => {
        if (categoryToEdit) {
            setName(categoryToEdit.name);
            setDescription(categoryToEdit.description);
            setUsefulLife(String(categoryToEdit.useful_life));
        } else {
            setName('');
            setDescription('');
            setUsefulLife('');
        }
    }, [categoryToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const categoryData = {
                name,
                description,
                useful_life: Number(usefulLife),
            };

            let response;
            if (categoryToEdit) {
                response = await put(`/asset-categories/${categoryToEdit.id}`, categoryData);
            } else {
                response = await post('/asset-categories', categoryData);
            }
            
            onCategoryAdded((response as any).data);
            onClose();
        } catch (error) {
            console.error('Failed to save category', error);
        }
    };

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                            <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                {categoryToEdit ? 'Edit' : 'Add'} Asset Category
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {categoryToEdit ? 'Update the details of the asset category.' : 'Fill in the details below to add a new asset category.'}
                                </p>
                            </div>
                            <form onSubmit={handleSubmit} className="mt-4">
                                <div className="grid grid-cols-1 gap-6">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            Category Name
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
                                    <div>
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
                                        <label htmlFor="usefulLife" className="block text-sm font-medium text-gray-700">
                                            Useful Life (Years)
                                        </label>
                                        <input
                                            type="number"
                                            name="usefulLife"
                                            id="usefulLife"
                                            value={usefulLife}
                                            onChange={(e) => setUsefulLife(e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                            required
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
                                        Save Category
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddCategoryModal;
