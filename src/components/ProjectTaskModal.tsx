'use client';
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { 
  useCreateProjectTask, 
  useUpdateProjectTask, 
  useDeleteProjectTask,
  useProjects,
  useProjectPhases,
  useEmployees
} from '../hooks/useApi';
import { aidaApi } from '../lib/api';

interface ProjectTask {
  id?: number;
  project_id: number;
  phase_id?: number | null;
  parent_task_id?: number | null;
  task_number?: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  due_date: string;
  estimated_hours?: number;
  actual_hours?: number;
  assigned_to?: number | null;
  progress_percentage: number;
}

interface ProjectTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: ProjectTask | null;
  projectId?: number;
  phaseId?: number;
  mode: 'create' | 'edit';
}

const ProjectTaskModal: React.FC<ProjectTaskModalProps> = ({
  isOpen,
  onClose,
  task,
  projectId,
  phaseId,
  mode
}) => {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState<ProjectTask>({
    project_id: projectId || 0,
    phase_id: phaseId || null,
    parent_task_id: null,
    name: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    start_date: '',
    due_date: '',
    estimated_hours: 0,
    actual_hours: 0,
    assigned_to: null,
    progress_percentage: 0
  });

  const [errors, setErrors] = useState<any>({});

  // API hooks
  const createTaskMutation = useCreateProjectTask();
  const updateTaskMutation = useUpdateProjectTask();
  const deleteTaskMutation = useDeleteProjectTask();
  const { data: projectsData } = useProjects();
  const { data: phasesData } = useProjectPhases(formData.project_id);
  const { data: employeesData } = useEmployees();

  // Extract data from API responses
  const projects = (projectsData as any)?.data || [];
  const phases = (phasesData as any)?.data || [];
  const employees = (employeesData as any)?.data || [];

  useEffect(() => {
    if (!isOpen) return; // Don't update form when modal is closed
    
    if (task && mode === 'edit') {
      setFormData({
        ...task,
        start_date: task.start_date?.split('T')[0] || '',
        due_date: task.due_date?.split('T')[0] || '',
        // Ensure null values are converted to empty strings for textarea fields
        description: task.description || '',
        project_id: task.project_id || projectId || 0,
        phase_id: task.phase_id || phaseId || null,
      });
    } else {
      // Reset form for create mode
      setFormData({
        project_id: projectId || 0,
        phase_id: phaseId || null,
        parent_task_id: null,
        name: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        start_date: '',
        due_date: '',
        estimated_hours: 0,
        actual_hours: 0,
        assigned_to: null,
        progress_percentage: 0
      });
    }
    setErrors({});
  }, [task, mode, isOpen, projectId, phaseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = 'Task name is required';
    if (!formData.project_id) newErrors.project_id = 'Project is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';
    if (!formData.due_date) newErrors.due_date = 'Due date is required';
    if (formData.due_date && formData.start_date && new Date(formData.due_date) < new Date(formData.start_date)) {
      newErrors.due_date = 'Due date must be after start date';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const taskData = {
        ...formData,
        estimated_hours: Number.isFinite(Number(formData.estimated_hours)) ? Number(formData.estimated_hours) : 0,
        actual_hours: Number.isFinite(Number(formData.actual_hours)) ? Number(formData.actual_hours) : 0,
        progress_percentage: Number.isFinite(Number(formData.progress_percentage)) ? Number(formData.progress_percentage) : 0,
        project_id: Number(formData.project_id) || projectId || 0,
      };

      // Remove null/undefined values for optional fields
      if (taskData.phase_id === null || taskData.phase_id === undefined) delete taskData.phase_id;
      if (taskData.parent_task_id === null || taskData.parent_task_id === undefined) delete taskData.parent_task_id;
      if (taskData.assigned_to === null || taskData.assigned_to === undefined) delete taskData.assigned_to;

      console.log('Sending task data:', JSON.stringify(taskData, null, 2));

      if (mode === 'create') {
        await createTaskMutation.mutateAsync(taskData);
        console.log('Task created successfully!');
      } else {
        await updateTaskMutation.mutateAsync({ id: task?.id ?? 0, data: taskData });
        // Force refresh related queries so progress reflects immediately
        try {
          const { queryClient } = await import('../lib/queryClient');
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        } catch {}
        console.log('Task updated successfully!');
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving task:', error);
      console.log('Full error response:', error.response);
      console.log('Error response data:', error.response?.data);
      if (error.response?.data?.errors) {
        console.log('Validation errors:', error.response.data.errors);
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: 'An error occurred. Please try again.' });
      }
    }
  };

  const handleDelete = async () => {
    if (!task?.id) return;
    
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await deleteTaskMutation.mutateAsync(task.id);
        console.log('Task deleted successfully!');
        onClose();
      } catch (error: any) {
        console.error('Error deleting task:', error);
        if (error.response?.data?.message) {
          setErrors({ general: error.response.data.message });
        } else {
          setErrors({ general: 'An error occurred while deleting the task.' });
        }
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      let processedValue: any = value;
      
      // Handle numeric fields with proper validation
      if (name === 'project_id' || name === 'estimated_hours' || name === 'actual_hours' || name === 'progress_percentage') {
        const numValue = parseFloat(value);
        processedValue = (value === '' || isNaN(numValue)) ? 0 : numValue;
      } else if (name === 'phase_id' || name === 'parent_task_id' || name === 'assigned_to') {
        // Handle nullable numeric fields
        processedValue = value ? parseInt(value) : null;
      }
      
      return {
        ...prev,
        [name]: processedValue
      };
    });
    
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
      const response = await aidaApi.generateProjectContent({ prompt: aiPrompt, type: 'task' });
      
      const generatedData = response.data as any;

      if (generatedData && typeof generatedData === 'object' && (generatedData.name || generatedData.description)) {
        setFormData(prev => ({
          ...prev,
          name: generatedData.name || prev.name,
          description: generatedData.description || prev.description,
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
                {mode === 'create' ? 'Create New Task' : 'Edit Task'}
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
                    placeholder="Enter a task idea, e.g., 'Implement user authentication'"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {!projectId && (
                  <div className="md:col-span-2">
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                    placeholder="e.g., Design homepage mockups"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Detailed description of the task..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phase (Optional)</label>
                  <select
                    name="phase_id"
                    value={formData.phase_id || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">No Phase</option>
                    {phases.map((phase: any) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To (Optional)</label>
                  <select
                    name="assigned_to"
                    value={formData.assigned_to || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    {employees.map((employee: any) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.due_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.due_date && <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    name="estimated_hours"
                    value={formData.estimated_hours === 0 ? '' : formData.estimated_hours}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {mode === 'edit' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
                      <input
                        type="number"
                        name="actual_hours"
                        value={formData.actual_hours === 0 ? '' : formData.actual_hours}
                        onChange={handleChange}
                        min="0"
                        step="0.5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                      <input
                        type="number"
                        name="progress_percentage"
                        value={formData.progress_percentage === 0 ? '' : formData.progress_percentage}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </>
                )}
              </div>
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
                  Delete Task
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
                  {mode === 'create' ? 'Create Task' : 'Update Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTaskModal;
