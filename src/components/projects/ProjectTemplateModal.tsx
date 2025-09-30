'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { useCreateFromTemplate, useProjectTemplates } from '../../hooks/useApi';

interface ProjectTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectTemplateModal({ isOpen, onClose }: ProjectTemplateModalProps) {
  const [formData, setFormData] = useState({
    template_id: '',
    name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    client_id: '',
    project_manager: '',
    budget: '',
    custom_fields: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const createFromTemplateMutation = useCreateFromTemplate();
  const { data: templatesData, isLoading: templatesLoading } = useProjectTemplates();

  useEffect(() => {
    if (isOpen) {
      setFormData({
        template_id: '',
        name: '',
        description: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        client_id: '',
        project_manager: '',
        budget: '',
        custom_fields: {},
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.template_id) {
      newErrors.template_id = 'Please select a template';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.budget && parseFloat(formData.budget) < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const submitData = {
        template_id: parseInt(formData.template_id),
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        client_id: formData.client_id ? parseInt(formData.client_id) : null,
        project_manager: formData.project_manager ? parseInt(formData.project_manager) : null,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        custom_fields: formData.custom_fields,
      };

      await createFromTemplateMutation.mutateAsync(submitData);
      
      onClose();
    } catch (error) {
      console.error('Error creating project from template:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTemplateChange = (templateId: string) => {
    handleInputChange('template_id', templateId);
    
    if (templateId) {
      const templatesArray = safeExtractArray(templatesData);
      const selectedTemplate = templatesArray.find((t: any) => t.id.toString() === templateId);
      if (selectedTemplate) {
        setFormData(prev => ({
          ...prev,
          name: selectedTemplate.name || '',
          description: selectedTemplate.description || '',
          budget: selectedTemplate.estimated_budget?.toString() || '',
        }));
      }
    }
  };

  if (!isOpen) return null;

  const isLoading = createFromTemplateMutation.isPending;
  const templates = safeExtractArray(templatesData);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-amber-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Create Project from Template
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template *
              </label>
              <select
                value={formData.template_id}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.template_id ? 'border-red-500' : 'border-gray-300'
                }`}
                required
                disabled={templatesLoading}
              >
                <option value="">Select a template</option>
                {templates.map((template: any) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
              {errors.template_id && (
                <p className="mt-1 text-sm text-red-600">{errors.template_id}</p>
              )}
              {templatesLoading && (
                <p className="mt-1 text-xs text-gray-500">Loading templates...</p>
              )}
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter project name"
                required
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Project description..."
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange('start_date', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange('end_date', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  errors.end_date ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.end_date && (
                <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>
              )}
            </div>

            {/* Client */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client
              </label>
              <select
                value={formData.client_id}
                onChange={(e) => handleInputChange('client_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No client</option>
                {/* This would be populated with actual clients from the system */}
                <option value="1">Client A</option>
                <option value="2">Client B</option>
                <option value="3">Client C</option>
              </select>
            </div>

            {/* Project Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Manager
              </label>
              <select
                value={formData.project_manager}
                onChange={(e) => handleInputChange('project_manager', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">No manager</option>
                {/* This would be populated with actual users from the system */}
                <option value="1">John Doe</option>
                <option value="2">Jane Smith</option>
                <option value="3">Bob Johnson</option>
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  className={`w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-600 border border-transparent rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

