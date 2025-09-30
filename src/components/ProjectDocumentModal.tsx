'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ProjectDocument {
  id?: number;
  project_id: number;
  document_name: string;
  document_type: 'contract' | 'proposal' | 'specification' | 'design' | 'report' | 'presentation' | 'manual' | 'other';
  file_path?: string;
  file_size?: number;
  file_extension?: string;
  version: string;
  status: 'draft' | 'review' | 'approved' | 'final' | 'archived';
  uploaded_by?: string;
  upload_date: string;
  last_modified: string;
  description?: string;
  tags?: string;
  is_confidential: boolean;
  approval_date?: string;
  approved_by?: string;
  notes?: string;
}

interface ProjectDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  document?: ProjectDocument | null;
  projectId?: number;
}

export default function ProjectDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  document = null,
  projectId
}: ProjectDocumentModalProps) {
  const [formData, setFormData] = useState<ProjectDocument>({
    project_id: projectId || 0,
    document_name: '',
    document_type: 'other',
    file_path: '',
    file_size: 0,
    file_extension: '',
    version: '1.0',
    status: 'draft',
    uploaded_by: '',
    upload_date: new Date().toISOString().split('T')[0],
    last_modified: new Date().toISOString().split('T')[0],
    description: '',
    tags: '',
    is_confidential: false,
    approval_date: '',
    approved_by: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (document) {
      setFormData({
        project_id: document.project_id,
        document_name: document.document_name,
        document_type: document.document_type,
        file_path: document.file_path || '',
        file_size: document.file_size || 0,
        file_extension: document.file_extension || '',
        version: document.version,
        status: document.status,
        uploaded_by: document.uploaded_by || '',
        upload_date: document.upload_date,
        last_modified: document.last_modified,
        description: document.description || '',
        tags: document.tags || '',
        is_confidential: document.is_confidential,
        approval_date: document.approval_date || '',
        approved_by: document.approved_by || '',
        notes: document.notes || ''
      });
    } else {
      setFormData({
        project_id: projectId || 0,
        document_name: '',
        document_type: 'other',
        file_path: '',
        file_size: 0,
        file_extension: '',
        version: '1.0',
        status: 'draft',
        uploaded_by: '',
        upload_date: new Date().toISOString().split('T')[0],
        last_modified: new Date().toISOString().split('T')[0],
        description: '',
        tags: '',
        is_confidential: false,
        approval_date: '',
        approved_by: '',
        notes: ''
      });
    }
    setErrors({});
    setSelectedFile(null);
  }, [document, projectId, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        document_name: file.name.split('.')[0] || '',
        file_extension: file.name.split('.').pop()?.toLowerCase() || '',
        file_size: file.size,
        last_modified: new Date().toISOString().split('T')[0]
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.project_id) {
      newErrors.project_id = 'Project is required';
    }

    if (!formData.document_name.trim()) {
      newErrors.document_name = 'Document name is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    }

    if (formData.status === 'approved' && !formData.approved_by?.trim()) {
      newErrors.approved_by = 'Approver name is required when status is approved';
    }

    if (formData.status === 'approved' && !formData.approval_date) {
      newErrors.approval_date = 'Approval date is required when status is approved';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual API call with file upload
      console.log('Submitting project document:', formData);
      if (selectedFile) {
        console.log('Selected file:', selectedFile);
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving project document:', error);
      alert(`Error saving project document: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-600';
      case 'review': return 'text-yellow-600';
      case 'approved': return 'text-green-600';
      case 'final': return 'text-blue-600';
      case 'archived': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contract': return 'text-red-600';
      case 'proposal': return 'text-blue-600';
      case 'specification': return 'text-green-600';
      case 'design': return 'text-purple-600';
      case 'report': return 'text-orange-600';
      case 'presentation': return 'text-indigo-600';
      case 'manual': return 'text-teal-600';
      default: return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {document ? 'Edit Project Document' : 'Add Project Document'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Name and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Name *
              </label>
              <input
                type="text"
                name="document_name"
                value={formData.document_name}
                onChange={handleInputChange}
                placeholder="e.g., Project Requirements, Technical Specification, Final Report"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.document_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.document_name && <p className="text-red-500 text-xs mt-1">{errors.document_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Document Type *
              </label>
              <select
                name="document_type"
                value={formData.document_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="contract">Contract</option>
                <option value="proposal">Proposal</option>
                <option value="specification">Specification</option>
                <option value="design">Design</option>
                <option value="report">Report</option>
                <option value="presentation">Presentation</option>
                <option value="manual">Manual</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.gif"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, RTF, JPG, PNG, GIF
            </p>
            {selectedFile && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </p>
              </div>
            )}
          </div>

          {/* Version and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Version *
              </label>
              <input
                type="text"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                placeholder="e.g., 1.0, 2.1, Draft"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.version ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.version && <p className="text-red-500 text-xs mt-1">{errors.version}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="draft">Draft</option>
                <option value="review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="final">Final</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Upload Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uploaded By
              </label>
              <input
                type="text"
                name="uploaded_by"
                value={formData.uploaded_by}
                onChange={handleInputChange}
                placeholder="Your name or username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Date
              </label>
              <input
                type="date"
                name="upload_date"
                value={formData.upload_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>

          {/* Description and Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                placeholder="Brief description of the document content and purpose..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="e.g., requirements, technical, user-guide, api"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>
          </div>

          {/* Approval Information */}
          {formData.status === 'approved' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approved By *
                </label>
                <input
                  type="text"
                  name="approved_by"
                  value={formData.approved_by}
                  onChange={handleInputChange}
                  placeholder="Manager or stakeholder name"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.approved_by ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.approved_by && <p className="text-red-500 text-xs mt-1">{errors.approved_by}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Date *
                </label>
                <input
                  type="date"
                  name="approval_date"
                  value={formData.approval_date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.approval_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.approval_date && <p className="text-red-500 text-xs mt-1">{errors.approval_date}</p>}
              </div>
            </div>
          )}

          {/* Confidentiality and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_confidential"
                checked={formData.is_confidential}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Confidential Document</label>
              <p className="ml-2 text-xs text-gray-500">(Mark if document contains sensitive information)</p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional context, special instructions, or notes about this document..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Document Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Document Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Type: </span>
                <span className={`font-medium ${getTypeColor(formData.document_type)}`}>
                  {formData.document_type.charAt(0).toUpperCase() + formData.document_type.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Status: </span>
                <span className={`font-medium ${getStatusColor(formData.status)}`}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Version: </span>
                <span className="font-medium text-gray-900">{formData.version}</span>
              </div>
              <div>
                <span className="text-gray-600">Confidential: </span>
                <span className={`font-medium ${formData.is_confidential ? 'text-red-600' : 'text-green-600'}`}>
                  {formData.is_confidential ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
            {selectedFile && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-gray-600">File: </span>
                <span className="font-medium text-gray-900">
                  {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {document ? 'Update Document' : 'Add Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 