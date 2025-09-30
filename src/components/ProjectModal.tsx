'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { 
  useCreateProject, 
  useUpdateProject, 
  useProjectCategories,
  useEmployees,
  useCrmContacts
} from '../hooks/useApi';
import { aidaApi } from '../lib/api';

interface Project {
  id?: number;
  category_id: number;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  project_manager: number;
  client_id?: number;
  objectives: string;
  deliverables: string;
  risks: string;
  assumptions: string;
}

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  mode: 'create' | 'edit';
  onManageCategories?: () => void;
  onManageClients?: () => void;
}

export default function ProjectModal({ isOpen, onClose, project, mode, onManageCategories, onManageClients }: ProjectModalProps) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<Project>({
    category_id: 0,
    name: '',
    description: '',
    status: 'planning',
    priority: 'medium',
    start_date: '',
    end_date: '',
    budget: 0,
    currency: 'UGX',
    project_manager: 0,
    client_id: undefined,
    objectives: '',
    deliverables: '',
    risks: '',
    assumptions: ''
  });

  const [errors, setErrors] = useState<any>({});

  // API hooks
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const { data: categoriesData } = useProjectCategories();
  const { data: employeesData } = useEmployees();
  const { data: contactsData } = useCrmContacts();

  // Extract data from API responses
  // Accept either a paginated response (data.data) or a direct array (data)
  const categories = (categoriesData as any)?.data?.data || (categoriesData as any)?.data || [];
  const employees = (employeesData as any)?.data?.data || (employeesData as any)?.data || [];
  const contacts = (contactsData as any)?.data?.data || (contactsData as any)?.data || [];

  useEffect(() => {
    if (project && mode === 'edit') {
      setFormData({
        ...project,
        start_date: project.start_date?.split('T')[0] || '',
        end_date: project.end_date?.split('T')[0] || '',
        // Ensure null values are converted to empty strings for textarea fields
        description: project.description || '',
        objectives: project.objectives || '',
        deliverables: project.deliverables || '',
        risks: project.risks || '',
        assumptions: project.assumptions || '',
      });
    } else {
      // Reset form for create mode
      setFormData({
        category_id: 0,
        name: '',
        description: '',
        status: 'planning',
        priority: 'medium',
        start_date: '',
        end_date: '',
        budget: 0,
        currency: 'UGX',
        project_manager: 0,
        client_id: undefined,
        objectives: '',
        deliverables: '',
        risks: '',
        assumptions: ''
      });
    }
    setErrors({});
  }, [project, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client-side validation
    const newErrors: any = {};
    if (!formData.name) newErrors.name = 'Project name is required';
    if (!formData.category_id) newErrors.category_id = 'Category is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.project_manager) newErrors.project_manager = 'Project manager is required';
    if (formData.end_date && formData.start_date && formData.end_date <= formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }
    if (formData.budget && formData.budget < 0) {
      newErrors.budget = 'Budget must be positive';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const projectData = {
      ...formData,
      budget: Number(formData.budget),
    };
    
    // Remove client_id if it's null to make it truly optional
    if (projectData.client_id === null) {
      delete projectData.client_id;
    }

    const mutation = mode === 'create' ? createProjectMutation : updateProjectMutation;
    const mutationData = mode === 'create' ? projectData : { id: project?.id ?? 0, data: projectData };

    mutation.mutate(mutationData as any, {
      onSuccess: () => {
        console.log(`Project ${mode === 'create' ? 'created' : 'updated'} successfully!`);
        onClose();
      },
      onError: (error: any) => {
        console.error('Error saving project:', error);
        if (error && error.errors) {
          setErrors(error.errors);
        } else if (error && error.message) {
          setErrors({ general: error.message });
        } else {
          setErrors({ general: 'An unexpected error occurred. Please try again.' });
        }
      },
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' || name === 'project_manager'
        ? parseInt(value) || 0 
        : name === 'client_id'
        ? value ? parseInt(value) : null
        : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) {
      setErrors({ aiPrompt: 'Please enter a prompt for the AI.' });
      return;
    }
    setIsGenerating(true);
    setErrors({});
    try {
      const response = await aidaApi.generateProjectContent({ prompt: aiPrompt, type: 'project' });
      
      const generatedData = response.data as any;

      if (generatedData && typeof generatedData === 'object' && (generatedData.name || generatedData.description)) {
        setFormData(prev => ({
          ...prev,
          name: generatedData.name || prev.name,
          description: generatedData.description || prev.description,
          objectives: Array.isArray(generatedData.objectives) ? generatedData.objectives.join('\n') : generatedData.objectives || prev.objectives,
          deliverables: Array.isArray(generatedData.deliverables) ? generatedData.deliverables.join('\n') : generatedData.deliverables || prev.deliverables,
          risks: Array.isArray(generatedData.risks) ? generatedData.risks.join('\n') : generatedData.risks || prev.risks,
          assumptions: Array.isArray(generatedData.assumptions) ? generatedData.assumptions.join('\n') : generatedData.assumptions || prev.assumptions,
        }));
      } else {
        throw new Error(response.message || 'Failed to generate AI content.');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setErrors({ general: 'Failed to generate content. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto my-8 transform transition-all duration-300 ease-in-out">
          <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                {mode === 'create' ? 'Create New Project' : 'Edit Project'}
              </h3>
              <button
                type="button"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                onClick={onClose}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto" style={{ maxHeight: '70vh' }}>
            {errors.general && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* AI Generation Section */}
              <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="text-lg font-semibold text-indigo-800 mb-3">Generate with AI</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter a project idea, e.g., 'Develop a mobile banking app'"
                  />
                  <button
                    type="button"
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
                {errors.aiPrompt && <p className="mt-1 text-sm text-red-600">{errors.aiPrompt}</p>}
              </div>

              {/* Section 1: Basic Information */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                      placeholder="e.g., New Website Launch"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Category *</label>
                      <button
                        type="button"
                        onClick={onManageCategories}
                        className="text-sm text-indigo-600 hover:underline font-medium"
                      >
                        Manage
                      </button>
                    </div>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.category_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((category: any) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Project Details */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager *</label>
                    <select
                      name="project_manager"
                      value={formData.project_manager}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.project_manager ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    >
                      <option value="">Select Project Manager</option>
                      {employees.map((employee: any) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name} - {employee.position || 'No Position'}
                        </option>
                      ))}
                    </select>
                    {errors.project_manager && <p className="mt-1 text-sm text-red-600">{errors.project_manager}</p>}
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">Client (Optional)</label>
                      <button
                        type="button"
                        onClick={onManageClients}
                        className="text-sm text-indigo-600 hover:underline font-medium"
                      >
                        Manage
                      </button>
                    </div>
                    <select
                      name="client_id"
                      value={formData.client_id || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">No Client</option>
                      {contacts.map((contact: any) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.name} - {contact.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.start_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    />
                    {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.end_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                    />
                    {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Budget (UGX)</label>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.budget ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                      }`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget}</p>}
                  </div>
                </div>
              </div>

              {/* Section 3: Additional Details */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="A brief summary of the project..."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Objectives</label>
                      <textarea
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="What are the main goals?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
                      <textarea
                        name="deliverables"
                        value={formData.deliverables}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="What will be the final outcomes?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Risks</label>
                      <textarea
                        name="risks"
                        value={formData.risks}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Potential challenges or obstacles"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Assumptions</label>
                      <textarea
                        name="assumptions"
                        value={formData.assumptions}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="What are you assuming to be true?"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="sticky bottom-0 bg-white rounded-b-2xl z-10 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform hover:scale-105"
              >
                {createProjectMutation.isPending || updateProjectMutation.isPending 
                  ? 'Saving...' 
                  : mode === 'create' ? 'Create Project' : 'Update Project'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
