'use client';

import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Asset } from './page';
import AssetMedia from './AssetMedia';

interface ViewAssetModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Asset | null;
}

const ViewAssetModal: React.FC<ViewAssetModalProps> = ({ isOpen, onClose, asset }) => {
    if (!asset) return null;

    return (
        <Transition appear show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center">
                                    {asset.name}
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </Dialog.Title>
                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-medium text-gray-500">Asset Details</h4>
                                        <dl className="mt-2 divide-y divide-gray-200">
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Asset Code</dt>
                                                <dd className="text-gray-900">{asset.asset_code}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Category</dt>
                                                <dd className="text-gray-900">{asset.category?.name || 'N/A'}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Status</dt>
                                                <dd className="text-gray-900">{asset.status}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Description</dt>
                                                <dd className="text-gray-900">{asset.description}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-500">Purchase Information</h4>
                                        <dl className="mt-2 divide-y divide-gray-200">
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Purchase Date</dt>
                                                <dd className="text-gray-900">{asset.purchase_date}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Purchase Price</dt>
                                                <dd className="text-gray-900">{asset.purchase_price}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Serial Number</dt>
                                                <dd className="text-gray-900">{asset.serial_number}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Model</dt>
                                                <dd className="text-gray-900">{asset.model}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Manufacturer</dt>
                                                <dd className="text-gray-900">{asset.manufacturer}</dd>
                                            </div>
                                            <div className="py-3 flex justify-between text-sm font-medium">
                                                <dt className="text-gray-500">Warranty Expiry</dt>
                                                <dd className="text-gray-900">{asset.warranty_expiry_date}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                </div>
                                <AssetMedia assetId={asset.id} />
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ViewAssetModal;
