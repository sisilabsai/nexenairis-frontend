'use client';
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { 
  useCreateProjectPhase, 
  useUpdateProjectPhase, 
  useDeleteProjectPhase,
  useProjects 
} from '../hooks/useApi';
import { aidaApi } from '../lib/api';

interface ProjectPhase {
  id?: number;
  project_id: number;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  order: number;
  progress_percentage: number;
}

interface ProjectPhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase?: ProjectPhase | null;
  projectId?: number;
  mode: 'create' | 'edit';
}

const ProjectPhaseModal: React.FC<ProjectPhaseModalProps> = ({
  isOpen,
  onClose,
  phase,
  projectId,
  mode
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<ProjectPhase>({
    project_id: projectId || 0,
    name: '',
    description: '',
    status: 'not_started',
    start_date: '',
    end_date: '',
    order: 1,
    progress_percentage: 0
  });

  const [errors, setErrors] = useState<any>({});

  // API hooks
  const createPhaseMutation = useCreateProjectPhase();
  const updatePhaseMutation = useUpdateProjectPhase();
  const deletePhaseMutation = useDeleteProjectPhase();
  const { data: projectsData } = useProjects();

  // Extract projects data
  const projects = (projectsData as any)?.data?.data || (projectsData as any)?.data || [];

  useEffect(() => {
    if (!isOpen) return; // Don't update form when modal is closed
    
    if (phase && mode === 'edit') {
      setFormData({
        ...phase,
        start_date: phase.start_date?.split('T')[0] || '',
        end_date: phase.end_date?.split('T')[0] || '',
        // Ensure null values are converted to empty strings for textarea fields
        description: phase.description || '',
        project_id: phase.project_id || projectId || 0,
      });
    } else {
      // Reset form for create mode
      setFormData({
        project_id: projectId || 0,
        name: '',
        description: '',
        status: 'not_started',
        start_date: '',
        end_date: '',
        order: 1,
        progress_percentage: 0
      });
    }
    setErrors({});
  }, [phase, mode, isOpen, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Phase name is required';
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.end_date) newErrors.end_date = 'End date is required';
    if (formData.end_date && formData.start_date && new Date(formData.end_date) < new Date(formData.start_date)) {
      newErrors.end_date = 'End date must be after start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const phaseData = {
        ...formData,
        progress_percentage: Number(formData.progress_percentage),
        order: Number(formData.order),
      };

      if (mode === 'create') {
        await createPhaseMutation.mutateAsync(phaseData);
        console.log('Phase created successfully!');
      } else {
        await updatePhaseMutation.mutateAsync({ id: phase?.id ?? 0, data: phaseData });
        console.log('Phase updated successfully!');
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving phase:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  const handleDelete = async () => {
    if (!phase?.id) return;
    
    if (window.confirm('Are you sure you want to delete this phase? This action cannot be undone.')) {
      try {
        await deletePhaseMutation.mutateAsync(phase.id);
        console.log('Phase deleted successfully!');
        onClose();
      } catch (error: any) {
        console.error('Error deleting phase:', error);
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'An error occurred while deleting the phase.' });
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'project_id' || name === 'order' || name === 'progress_percentage'
        ? parseInt(value) || 0 
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
      console.log('AI Generate: Fetching content...');
      const response = await aidaApi.generateProjectContent({ prompt: aiPrompt, type: 'phase' });
      console.log('AI Generate: Response received:', JSON.stringify(response, null, 2));
      
      const generatedData = response.data as any;
      console.log('AI Generate: Extracted data:', JSON.stringify(generatedData, null, 2));

      if (generatedData && typeof generatedData === 'object' && (generatedData.name || generatedData.description)) {
        console.log('AI Generate: Data is valid. Updating form state.');
        setFormData(prev => {
          const newState = {
            ...prev,
            name: generatedData.name || prev.name,
            description: generatedData.description || prev.description,
          };
          console.log('AI Generate: New form state:', JSON.stringify(newState, null, 2));
          return newState;
        });
        console.log('AI Generate: Form state updated.');
      } else {
        console.log('AI Generate: Data is invalid. Throwing error.');
        throw new Error(response.message || 'Failed to generate AI content.');
      }
    } catch (error: any) {
      console.error('AI generation error:', error);
      setErrors({ general: error.message || 'Failed to generate content. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto my-8 transform transition-all duration-300 ease-in-out">
          <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800">
                {mode === 'create' ? 'Create New Phase' : 'Edit Phase'}
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* AI Generation Section */}
              <div className="p-6 bg-indigo-50 rounded-lg border border-indigo-200">
                <h4 className="text-lg font-semibold text-indigo-800 mb-3">Generate with AI</h4>
                <div className="flex items-center space-x-4">
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="w-full px-4 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter a phase idea, e.g., 'User testing and feedback'"
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

              {!projectId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select
                    name="project_id"
                    value={formData.project_id}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.project_id ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="">Select a project...</option>
                    {projects.map((project: any) => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.project_number})
                      </option>
                    ))}
                  </select>
                  {errors.project_id && <p className="mt-1 text-sm text-red-600">{errors.project_id}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phase Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                  }`}
                  placeholder="e.g., Planning & Design"
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Briefly describe this phase..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order || ''}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
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
              </div>

              {mode === 'edit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                  <input
                    type="number"
                    name="progress_percentage"
                    value={formData.progress_percentage || ''}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </form>
          </div>

          <div className="sticky bottom-0 bg-white rounded-b-2xl z-10 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between">
              {mode === 'edit' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                >
                  Delete Phase
                </button>
              )}
              <div className="flex space-x-4 ml-auto">
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
                  className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  {mode === 'create' ? 'Create Phase' : 'Update Phase'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPhaseModal;
