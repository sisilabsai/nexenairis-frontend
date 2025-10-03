'use client';

import React, { useState, useCallback } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { useApi } from '@/hooks/useApi';
import { XMarkIcon, DocumentArrowUpIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';

interface ImportAssetsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportComplete: () => void;
    categories: { id: number; name: string; }[];
}

interface ImportResult {
    success: boolean;
    message: string;
    imported_count?: number;
    failed_count?: number;
    errors?: string[];
    preview?: any[];
}

const ImportAssetsModal: React.FC<ImportAssetsModalProps> = ({
    isOpen,
    onClose,
    onImportComplete,
    categories
}) => {
    const { post } = useApi();
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);
    const [previewData, setPreviewData] = useState<any[] | null>(null);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            handlePreview(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.xls'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        },
        maxFiles: 1,
    });

    const handlePreview = async (fileToPreview: File) => {
        try {
            setImporting(true);
            const formData = new FormData();
            formData.append('file', fileToPreview);
            formData.append('preview', 'true');

            const response = await post('/assets/import', formData) as any;

            if (response.preview) {
                setPreviewData(response.preview);
                setStep('preview');
            }
        } catch (error: any) {
            console.error('Preview failed:', error);
            setImportResult({
                success: false,
                message: error.message || 'Failed to preview file',
            });
            setStep('result');
        } finally {
            setImporting(false);
        }
    };

    const handleImport = async () => {
        if (!file) return;

        try {
            setImporting(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await post('/assets/import', formData) as ImportResult;

            setImportResult(response as ImportResult);
            setStep('result');

            if (response.success) {
                setTimeout(() => {
                    onImportComplete();
                    handleClose();
                }, 2000);
            }
        } catch (error: any) {
            console.error('Import failed:', error);
            setImportResult({
                success: false,
                message: error.message || 'Import failed',
            });
            setStep('result');
        } finally {
            setImporting(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setPreviewData(null);
        setImportResult(null);
        setStep('upload');
        onClose();
    };

    const downloadTemplate = () => {
        const headers = [
            'name',
            'asset_code',
            'category_name',
            'status',
            'purchase_date',
            'purchase_price',
            'description',
            'serial_number',
            'model',
            'manufacturer',
            'warranty_expiry_date'
        ];
        
        const sampleRow = [
            'Dell Laptop L001',
            'DELL-001',
            'IT Equipment',
            'in_use',
            '2024-01-15',
            '1200.00',
            'Dell XPS 13 Laptop',
            'DL123456789',
            'XPS 13',
            'Dell Inc.',
            '2027-01-15'
        ];

        const csvContent = "data:text/csv;charset=utf-8," + 
            [headers.join(','), sampleRow.join(',')].join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "assets-import-template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
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
                    <div className="flex min-h-full items-center justify-center p-2 sm:p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title as="div" className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <DocumentArrowUpIcon className="h-6 w-6 text-indigo-600 mr-2" />
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Import Assets
                                        </h3>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 p-1"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </Dialog.Title>

                                {step === 'upload' && (
                                    <div className="space-y-6">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-blue-900 mb-2">Import Instructions</h4>
                                            <ul className="text-sm text-blue-800 space-y-1">
                                                <li>• Supported formats: CSV, XLS, XLSX</li>
                                                <li>• Maximum file size: 10MB</li>
                                                <li>• Required columns: name, asset_code, status</li>
                                                <li>• Date format: YYYY-MM-DD</li>
                                            </ul>
                                        </div>

                                        <div className="flex justify-center mb-4">
                                            <button
                                                onClick={downloadTemplate}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                                                Download Template
                                            </button>
                                        </div>

                                        <div
                                            {...getRootProps()}
                                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                                isDragActive
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-300 hover:border-indigo-400'
                                            }`}
                                        >
                                            <input {...getInputProps()} />
                                            <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                            <div className="text-sm text-gray-600">
                                                {isDragActive ? (
                                                    <p>Drop the file here...</p>
                                                ) : (
                                                    <div>
                                                        <p className="font-medium">Click to upload or drag and drop</p>
                                                        <p className="mt-1">CSV, XLS, or XLSX files only</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {file && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-center">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                                    <span className="text-sm font-medium text-green-900">
                                                        File selected: {file.name}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {step === 'preview' && previewData && (
                                    <div className="space-y-4">
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <h4 className="text-sm font-medium text-yellow-900 mb-2">
                                                Preview - {previewData.length} records found
                                            </h4>
                                            <p className="text-sm text-yellow-800">
                                                Please review the data before importing
                                            </p>
                                        </div>

                                        <div className="max-h-80 overflow-auto border border-gray-200 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {previewData.slice(0, 10).map((row, index) => (
                                                        <tr key={index} className="text-sm">
                                                            <td className="px-3 py-2 text-gray-900">{row.name}</td>
                                                            <td className="px-3 py-2 text-gray-600">{row.asset_code}</td>
                                                            <td className="px-3 py-2 text-gray-600">{row.category_name}</td>
                                                            <td className="px-3 py-2">
                                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                    row.status === 'in_use' ? 'bg-green-100 text-green-800' :
                                                                    row.status === 'in_storage' ? 'bg-blue-100 text-blue-800' :
                                                                    row.status === 'under_maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                    {row.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-3 py-2 text-gray-600">{row.purchase_price}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {previewData.length > 10 && (
                                            <p className="text-sm text-gray-500 text-center">
                                                Showing first 10 records. {previewData.length - 10} more will be imported.
                                            </p>
                                        )}

                                        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                                            <button
                                                onClick={() => setStep('upload')}
                                                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleImport}
                                                disabled={importing}
                                                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                                            >
                                                {importing ? 'Importing...' : `Import ${previewData.length} Assets`}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {step === 'result' && importResult && (
                                    <div className="space-y-4">
                                        <div className={`border rounded-lg p-4 ${
                                            importResult.success 
                                                ? 'bg-green-50 border-green-200' 
                                                : 'bg-red-50 border-red-200'
                                        }`}>
                                            <div className="flex items-center mb-2">
                                                {importResult.success ? (
                                                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                                                ) : (
                                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                                                )}
                                                <h4 className={`text-sm font-medium ${
                                                    importResult.success ? 'text-green-900' : 'text-red-900'
                                                }`}>
                                                    {importResult.success ? 'Import Successful' : 'Import Failed'}
                                                </h4>
                                            </div>
                                            <p className={`text-sm ${
                                                importResult.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                                {importResult.message}
                                            </p>
                                            
                                            {importResult.imported_count !== undefined && (
                                                <div className="mt-2 text-sm text-green-800">
                                                    Successfully imported: {importResult.imported_count} assets
                                                </div>
                                            )}
                                            
                                            {importResult.failed_count !== undefined && importResult.failed_count > 0 && (
                                                <div className="mt-2 text-sm text-red-800">
                                                    Failed to import: {importResult.failed_count} assets
                                                </div>
                                            )}
                                        </div>

                                        {importResult.errors && importResult.errors.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                <h5 className="text-sm font-medium text-red-900 mb-2">Errors:</h5>
                                                <ul className="text-sm text-red-800 space-y-1">
                                                    {importResult.errors.map((error, index) => (
                                                        <li key={index}>• {error}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        <div className="flex justify-center">
                                            <button
                                                onClick={handleClose}
                                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default ImportAssetsModal;