'use client';

import React, { useState, useRef } from 'react';
import { 
  DocumentPlusIcon, 
  DocumentIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { 
  useProjectDocuments, 
  useUploadProjectDocument, 
  useUpdateProjectDocument, 
  useDeleteProjectDocument 
} from '../hooks/useApi';

interface ProjectDocumentsProps {
  projectId: number;
}

interface Document {
  id: number;
  name: string;
  description?: string;
  file_path: string;
  file_size: number;
  file_type: string;
  category: string;
  uploaded_by: string;
  uploaded_at: string;
}

export default function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
  const { data: documentsData, isLoading, refetch } = useProjectDocuments(projectId);
  const uploadDocument = useUploadProjectDocument();
  const updateDocument = useUpdateProjectDocument();
  const deleteDocument = useDeleteProjectDocument();
  
  // Helper function to safely extract array data from API responses
  const safeExtractArray = (data: any, fallback: any[] = []) => {
    if (!data) return fallback;
    if (Array.isArray(data)) return data;
    
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    return fallback;
  };
  
  const documents = safeExtractArray(documentsData);
  
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);
      formData.append('description', '');
      formData.append('category', 'Other');
      
      uploadDocument.mutate({
        projectId,
        data: formData
      }, {
        onSuccess: () => {
          setShowUploadModal(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      });
    }
  };

  const handleDeleteDocument = (id: number) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDocument.mutate({
        projectId,
        documentId: id
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Documents</h2>
          <p className="text-sm text-gray-600">Manage project files and documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <DocumentPlusIcon className="h-4 w-4 mr-2" />
          Upload Document
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading documents...</span>
        </div>
      )}

      {/* Documents Grid */}
      {!isLoading && documents.length === 0 ? (
        <div className="text-center py-8">
          <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {documents.map((doc: Document) => (
          <div key={doc.id} className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="text-3xl">📄</div>
              <div className="flex space-x-1">
                <button className="text-gray-400 hover:text-gray-600">
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button className="text-gray-400 hover:text-gray-600">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setEditingDocument(doc)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="text-center mb-3">
              <h3 className="font-medium text-gray-900 text-sm truncate">{doc.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{doc.description}</p>
            </div>

            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Size:</span>
                <span>{formatFileSize(doc.file_size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type:</span>
                <span className="uppercase">{doc.file_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Category:</span>
                <span>{doc.category}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">By {doc.uploaded_by}</span>
                <span className="text-gray-400">{doc.uploaded_at}</span>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Document</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (fileInputRef.current?.files?.[0]) {
                  handleFileUpload({ target: { files: fileInputRef.current.files } } as any);
                }
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">File</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      required
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Document name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Document description"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Upload
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal */}
      {editingDocument && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Document</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedDoc = {
                  ...editingDocument,
                  name: formData.get('name') as string,
                  description: formData.get('description') as string
                };
                // Instead of directly setting documents (which we don't have a setter for),
                // call the update API and then refetch
                if (editingDocument?.id) {
                  updateDocument.mutate({
                    projectId,
                    documentId: editingDocument.id,
                    data: {
                      name: formData.get('name') as string,
                      description: formData.get('description') as string
                    }
                  }, {
                    onSuccess: () => {
                      refetch();
                    }
                  });
                }
                setEditingDocument(null);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingDocument.name}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      name="description"
                      rows={3}
                      defaultValue={editingDocument.description || ''}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingDocument(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
