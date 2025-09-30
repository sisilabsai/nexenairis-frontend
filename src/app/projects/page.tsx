'use client';

import { useState, useEffect, useCallback, JSX } from 'react';
import { 
  DocumentTextIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  SparklesIcon,
  RocketLaunchIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  StarIcon,
  FireIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import { 
  useProjectsStats, 
  useProjects, 
  useDeleteProject, 
  useProjectPhases,
  useProjectTasks,
  useProjectCategories,
  useDeleteProjectTask,
  useCreateProjectCategory
} from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import ProjectModal from '../../components/ProjectModal';
import ProjectViewModal from '../../components/ProjectViewModal';
import ProjectCategoryModal from '../../components/ProjectCategoryModal';
import ClientModal from '../../components/ClientModal';
import ProjectPhaseModal from '../../components/ProjectPhaseModal';
import ProjectTaskModal from '../../components/ProjectTaskModal';
import ProjectDashboard from '../../components/projects/ProjectDashboard';
import ProjectTimeline from '../../components/ProjectTimeline';
import ProjectTeam from '../../components/ProjectTeam';
import ProjectDocuments from '../../components/ProjectDocuments';
import ProjectAnalytics from '../../components/ProjectAnalytics';
import Link from 'next/link';

// Safe number conversion utility
const safeNumber = (value: any): number => {
  if (value === null || value === undefined || value === '') return 0;
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};

// Safe number display utility  
const safeNumberDisplay = (value: any, currency?: string): string => {
  const num = safeNumber(value);
  const formatted = num > 0 ? num.toLocaleString() : 'No Budget';
  return currency ? `${currency} ${formatted}` : formatted;
};

// No fallback data - all data comes from APIs

export default function ProjectsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentView, setCurrentView] = useState<'overview' | 'project-details' | 'dashboard' | 'timeline' | 'team' | 'documents' | 'analytics' | 'gantt'>('overview');
  const [activeDetailsTab, setActiveDetailsTab] = useState<'overview' | 'dashboard' | 'timeline' | 'team' | 'documents' | 'analytics' | 'gantt' | 'info'>('overview');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedPhase, setSelectedPhase] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    start_date: '',
    end_date: '',
    budget: '',
    currency: 'UGX',
    status: 'planning',
    priority: 'medium',
    client_id: '',
    project_manager: ''
  });

  // Additional state for form data
  const [users, setUsers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#6366f1'
  });
  
  const { data: statsData, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useProjectsStats();
  const { data: projectsData, isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useProjects();
  const { data: categoriesData, isLoading: categoriesLoading } = useProjectCategories();
  const deleteProjectMutation = useDeleteProject();
  const createCategoryMutation = useCreateProjectCategory();
  const deleteTaskMutation = useDeleteProjectTask();
  
  // Fetch phases and tasks for selected project
  const { data: phasesData, isLoading: phasesLoading } = useProjectPhases(selectedProject?.id);
  const { data: tasksData, isLoading: tasksLoading } = useProjectTasks(selectedProject?.id);

  // Use API data or fallback to mock data
  const projectStats = (statsData as any)?.data?.summary || [];
  const allProjects = (projectsData as any)?.data?.data || (projectsData as any)?.data || [];
  const phases = (phasesData as any)?.data?.data || (phasesData as any)?.data || [];
  const tasks = (tasksData as any)?.data?.data || (tasksData as any)?.data || [];
  const categories = (categoriesData as any)?.data?.data || (categoriesData as any)?.data || [];

  // Fetch users and clients for form dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/hr/employees', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : data.data || data);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await fetch('/api/crm/contacts', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log('Clients API response:', data);
          
          // Handle paginated response structure from Laravel
          let clientsArray = [];
          if (data.success && data.data && data.data.data) {
            clientsArray = data.data.data; // Laravel pagination: response.data.data.data
          } else if (Array.isArray(data)) {
            clientsArray = data;
          } else if (data.data && Array.isArray(data.data)) {
            clientsArray = data.data;
          }
          
          console.log('Final clients array:', clientsArray);
          setClients(clientsArray);
        } else {
          console.error('Failed to fetch clients:', response.status, response.statusText);
          setClients([]);
        }
      } catch (error) {
        console.error('Error fetching clients:', error);
        setClients([]);
      }
    };

    fetchUsers();
    fetchClients();
  }, []);

  // Keyboard shortcuts for magical UX
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setShowSearch(true);
        setTimeout(() => {
          const searchInput = document.getElementById('project-search');
          if (searchInput) searchInput.focus();
        }, 100);
      }
      if (e.key === 'F3') {
        e.preventDefault();
        handleCreateProject();
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setSearchTerm('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    console.log('Tasks data:', tasks);
  }, [tasks]);
  
  // Filter projects by selected status and search term
  const filteredProjects = allProjects.filter((project: any) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (project.name && project.name.toLowerCase().includes(searchTermLower)) ||
      (project.project_number && project.project_number.toLowerCase().includes(searchTermLower)) ||
      (project.client?.name && project.client.name.toLowerCase().includes(searchTermLower)) ||
      (project.client && typeof project.client === 'string' && project.client.toLowerCase().includes(searchTermLower)) ||
      (project.projectManager?.name && project.projectManager.name.toLowerCase().includes(searchTermLower)) ||
      (project.project_manager_name && project.project_manager_name.toLowerCase().includes(searchTermLower));
    
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const projects = filteredProjects;

  // Progress calculation functions
  const calculateTaskProgress = (task: any) => {
    if (!task) return 0;
    
    // If progress_percentage exists and is valid, use it
    if (task.progress_percentage !== null && task.progress_percentage !== undefined && !isNaN(task.progress_percentage)) {
      return Math.min(100, Math.max(0, task.progress_percentage));
    }
    
    // Calculate based on status
    switch (task.status) {
      case 'completed':
        return 100;
      case 'in_progress':
        return 50;
      case 'on_hold':
        return 25;
      case 'not_started':
      default:
        return 0;
    }
  };

  const calculatePhaseProgress = (phase: any, phaseTasks: any[]) => {
    if (!phase) return 0;
    
    // If progress_percentage exists and is valid, use it
    if (phase.progress_percentage !== null && phase.progress_percentage !== undefined && !isNaN(phase.progress_percentage)) {
      return Math.min(100, Math.max(0, phase.progress_percentage));
    }
    
    // Calculate based on tasks in this phase
    const phaseTasksList = phaseTasks.filter((task: any) => task.phase_id === phase.id);
    if (phaseTasksList.length === 0) {
      // No tasks, calculate based on status
      switch (phase.status) {
        case 'completed':
          return 100;
        case 'in_progress':
          return 50;
        case 'on_hold':
          return 25;
        case 'not_started':
        default:
          return 0;
      }
    }
    
    // Calculate average of task progress
    const totalProgress = phaseTasksList.reduce((sum: number, task: any) => sum + calculateTaskProgress(task), 0);
    return Math.round(totalProgress / phaseTasksList.length);
  };

  const calculateProjectProgress = (project: any, projectPhases: any[], projectTasks: any[]) => {
    if (!project) return 0;
    
    // If progress_percentage exists and is valid, use it
    if (project.progress_percentage !== null && project.progress_percentage !== undefined && !isNaN(project.progress_percentage)) {
      return Math.min(100, Math.max(0, project.progress_percentage));
    }
    
    // Calculate based on phases
    if (projectPhases.length === 0) {
      // No phases, calculate based on status
      switch (project.status) {
        case 'completed':
          return 100;
        case 'active':
          return 50;
        case 'planning':
          return 25;
        case 'on_hold':
          return 10;
        default:
          return 0;
      }
    }
    
    // Calculate average of phase progress
    const totalProgress = projectPhases.reduce((sum: number, phase: any) => sum + calculatePhaseProgress(phase, projectTasks), 0);
    return Math.round(totalProgress / projectPhases.length);
  };

  // Calculate progress for current project
  const currentProjectProgress = calculateProjectProgress(selectedProject, phases, tasks);
  const safeProjectProgress = Number.isFinite(currentProjectProgress) ? currentProjectProgress : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_hold':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-emerald-600';
      case 'active':
        return 'from-blue-500 to-indigo-600';
      case 'planning':
        return 'from-yellow-500 to-orange-500';
      case 'on_hold':
        return 'from-gray-500 to-slate-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'active':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'planning':
        return <CalendarIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <FireIcon className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <StarIcon className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <LightBulbIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <LightBulbIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Modal handlers
  const handleCreateProject = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      description: '',
      category_id: '',
      start_date: '',
      end_date: '',
      budget: '',
      currency: 'UGX',
      status: 'planning',
      priority: 'medium',
      client_id: '',
      project_manager: ''
    });
    setShowModal(true);
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setFormData({
      name: project.name || '',
      description: project.description || '',
      category_id: project.category_id || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || '',
      currency: project.currency || 'UGX',
      status: project.status || 'planning',
      priority: project.priority || 'medium',
      client_id: project.client_id || '',
      project_manager: project.project_manager || ''
    });
    setShowModal(true);
  };

  const handleCreateCategory = () => {
    setCategoryFormData({
      name: '',
      code: '',
      description: '',
      color: '#6366f1'
    });
    setShowCategoryModal(true);
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setCurrentView('project-details');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedProject(null);
  };

  const handleViewModal = (project: any) => {
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  const handleDeleteProject = async (project: any) => {
    if (window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
      try {
        await deleteProjectMutation.mutateAsync(project.id);
        console.log('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project. Please try again.');
      }
    }
  };

  const handleCloseModals = () => {
    setIsProjectModalOpen(false);
    setIsViewModalOpen(false);
    setIsCategoryModalOpen(false);
    setIsClientModalOpen(false);
    setSelectedProject(null);
  };

  // Category and Client management handlers
  const handleManageCategories = () => {
    setIsCategoryModalOpen(true);
  };

  const handleManageClients = () => {
    setIsClientModalOpen(true);
  };

  const handleCategorySelect = (category: any) => {
    // This could be used to auto-select a category in the project form
    console.log('Category selected:', category);
  };

  const handleClientSelect = (client: any) => {
    // This could be used to auto-select a client in the project form
    console.log('Client selected:', client);
  };

  // Phase management handlers
  const handleCreatePhase = (projectId?: number) => {
    if (!projectId || isNaN(projectId)) {
      console.error('Invalid project ID for phase creation:', projectId);
      return;
    }
    setSelectedProject({ id: projectId });
    setSelectedPhase(null);
    setModalMode('create');
    setIsPhaseModalOpen(true);
  };

  const handleEditPhase = (phase: any) => {
    if (!phase || !phase.id) {
      console.error('Invalid phase for editing:', phase);
      return;
    }
    setSelectedPhase(phase);
    setModalMode('edit');
    setIsPhaseModalOpen(true);
  };

  const handleClosePhaseModal = () => {
    setIsPhaseModalOpen(false);
    setSelectedPhase(null);
  };

  // Task management handlers
  const handleCreateTask = (projectId?: number, phaseId?: number) => {
    if (!projectId || isNaN(projectId)) {
      console.error('Invalid project ID for task creation:', projectId);
      return;
    }
    setSelectedProject({ id: projectId });
    setSelectedPhase(phaseId ? { id: phaseId } : null);
    setSelectedTask(null);
    setModalMode('create');
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: any) => {
    if (!task || !task.id) {
      console.error('Invalid task for editing:', task);
      return;
    }
    setSelectedTask(task);
    setModalMode('edit');
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Navigation handlers for different project views
  const handleNavigateToView = (view: 'overview' | 'project-details' | 'dashboard' | 'timeline' | 'team' | 'documents' | 'analytics' | 'gantt') => {
    setCurrentView(view);
  };

  // Additional handlers for new modal system
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const endpoint = editingProject 
        ? `/api/projects/${editingProject.id}` 
        : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        setEditingProject(null);
        refetchProjects();
      } else {
        console.error('Failed to save project');
      }
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategoryMutation.mutateAsync(categoryFormData);
      setShowCategoryModal(false);
      setCategoryFormData({
        name: '',
        code: '',
        description: '',
        color: '#6366f1'
      });
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/projects/${deleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setDeleteId(null);
        refetchProjects();
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmDeleteTask = async () => {
    if (!deleteTaskId) return;
    
    setIsDeleting(true);
    try {
      await deleteTaskMutation.mutateAsync(deleteTaskId);
      setDeleteTaskId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  let mainContent: JSX.Element | null = null;

  if (currentView === 'overview') {
    mainContent = (
      <>
        {/* Magical Header with Gradient Background */}
        <div className="relative mb-8 p-8 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center">
                  <RocketLaunchIcon className="h-8 w-8 mr-3 animate-pulse" />
                  Project Management Hub
                </h1>
                <p className="mt-2 text-indigo-100">
                  Transform ideas into reality - Press F2 to search, F3 to create ✨
                </p>
              </div>
              <button
                onClick={handleCreateProject}
                className="group relative inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-purple-600 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Create Project
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </button>
            </div>
          </div>
          
          {/* Floating decoration elements */}
          <div className="absolute top-4 right-20 w-12 h-12 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-4 left-20 w-8 h-8 bg-white/5 rounded-full animate-pulse"></div>
        </div>

        {/* Enhanced Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <div className="col-span-full flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : statsError ? (
            <div className="col-span-full">
              <ErrorMessage message={statsError?.message || 'Failed to load project stats'} onRetry={refetchStats} />
            </div>
          ) : (
            projectStats.map((stat: any, index: number) => {
              const gradients = [
                'from-blue-500 to-blue-600',
                'from-green-500 to-green-600', 
                'from-yellow-500 to-orange-500',
                'from-purple-500 to-purple-600'
              ];
              const icons = [DocumentTextIcon, CheckCircleIcon, ClockIcon, ChartBarIcon];
              const IconComponent = icons[index % 4];
              
              return (
                <div key={stat.name} className={`bg-gradient-to-br ${gradients[index % 4]} rounded-xl p-6 text-white transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{stat.name}</p>
                      <p className="text-3xl font-bold mt-1">{stat.value}</p>
                      {stat.change && (
                        <div className={`flex items-center text-sm font-semibold mt-1 ${stat.changeType === 'positive' ? 'text-white/90' : 'text-white/70'}`}>
                          {stat.change}
                        </div>
                      )}
                    </div>
                    <IconComponent className="h-12 w-12 text-white/60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Smart Search and Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="project-search"
                type="text"
                placeholder="Search projects... (Press F2 for quick search)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl text-sm transition-all duration-200 ${
                  showSearch 
                    ? 'border-purple-500 ring-4 ring-purple-200 bg-purple-50' 
                    : 'border-gray-300 hover:border-gray-400 focus:border-purple-500'
                }`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-gray-300 rounded-xl text-sm hover:border-gray-400 focus:border-purple-500 transition-colors duration-200"
                >
                  <option value="all">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              
              <div className="flex rounded-xl border-2 border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'cards' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    viewMode === 'table' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Display */}
        {projectsLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-500 animate-pulse">Loading magical projects...</p>
          </div>
        ) : projectsError ? (
          <ErrorMessage message={projectsError?.message || 'Failed to load projects'} onRetry={refetchProjects} />
        ) : (
          <>
            {/* Cards View */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length > 0 ? (
                  projects.map((project: any) => {
                    const progress = calculateProjectProgress(project, phases, tasks);
                    const safeProgress = Number.isFinite(progress) ? progress : 0;
                    
                    return (
                      <div
                        key={project.id}
                        onClick={() => handleViewProject(project)}
                        className="group relative bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer"
                      >
                        {/* Status Gradient Bar */}
                        <div className={`h-2 bg-gradient-to-r ${getStatusGradient(project.status)}`}></div>
                        
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200 line-clamp-1">
                                {project.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">{project.project_number || `#${project.id}`}</p>
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{project.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {project.priority && getPriorityIcon(project.priority)}
                              {getStatusIcon(project.status)}
                            </div>
                          </div>

                          {/* Client & Manager */}
                          <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                            <div>
                              <span className="block text-xs font-medium text-gray-500">Client</span>
                              <span className="text-gray-900 truncate">{project.client?.name || project.client || 'No Client'}</span>
                            </div>
                            <div>
                              <span className="block text-xs font-medium text-gray-500">Manager</span>
                              <span className="text-gray-900 truncate">{project.projectManager?.name || project.project_manager_name || 'No Manager'}</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">Progress</span>
                              <span className="text-sm font-bold text-purple-600">{safeProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                                style={{ width: `${safeProgress}%` }}
                              ></div>
                            </div>
                          </div>

                          {/* Budget */}
                          <div className="mb-4">
                            <p className="text-xl font-bold text-gray-900 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                              {project.currency} {project.budget && !isNaN(Number(project.budget)) ? Number(project.budget).toLocaleString() : 'No Budget'}
                            </p>
                          </div>

                          {/* Timeline */}
                          <div className="mb-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              <span>
                                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'No start'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : 'No end'}
                              </span>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}
                            >
                              {getStatusIcon(project.status)}
                              <span className="ml-1 capitalize">{project.status === 'on_hold' ? 'On Hold' : project.status.replace('_', ' ')}</span>
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewProject(project);
                                }}
                                className="group/btn p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                                title="View Project"
                              >
                                <EyeIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditProject(project);
                                }}
                                className="group/btn p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
                                title="Edit Project"
                              >
                                <PencilIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteId(project.id);
                                }}
                                className="group/btn p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                                title="Delete Project"
                              >
                                <TrashIcon className="h-4 w-4 group-hover/btn:scale-110 transition-transform duration-200" />
                              </button>
                            </div>
                            
                            <div className="flex items-center text-xs text-gray-500">
                              <UserGroupIcon className="h-4 w-4 mr-1" />
                              <span>{phases.length} phases • {tasks.length} tasks</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 to-pink-400/0 group-hover:from-purple-400/10 group-hover:to-pink-400/10 transition-all duration-300 pointer-events-none"></div>
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-16">
                    <RocketLaunchIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchTerm || selectedStatus !== 'all' 
                        ? 'Try adjusting your search or filters.' 
                        : 'Get started by creating your first magical project.'}
                    </p>
                    {!searchTerm && selectedStatus === 'all' && (
                      <button
                        onClick={handleCreateProject}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
                      >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Create Your First Project
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Project</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Manager</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Timeline</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Budget</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {projects.length > 0 ? (
                        projects.map((project: any, index: number) => {
                          const progress = calculateProjectProgress(project, phases, tasks);
                          const safeProgress = Number.isFinite(progress) ? progress : 0;
                          
                          return (
                            <tr 
                              key={project.id}
                              onClick={() => handleViewProject(project)}
                              className={`hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 cursor-pointer ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                      <FolderIcon className="h-5 w-5 text-white" />
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-semibold text-gray-900">{project.name}</div>
                                    <div className="text-xs text-gray-500">{project.project_number || `Project #${project.id}`}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{project.client?.name || project.client || 'No Client'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <img className="h-8 w-8 rounded-full" src={`https://i.pravatar.cc/150?u=${project.projectManager?.name || project.project_manager_name}`} alt="" />
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{project.projectManager?.name || project.project_manager_name || 'No Manager'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                                  {getStatusIcon(project.status)}
                                  <span className="ml-1 capitalize">{project.status === 'on_hold' ? 'On Hold' : project.status.replace('_', ' ')}</span>
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex items-center">
                                  <div className="w-24 bg-gray-200 rounded-full h-2.5 mr-2">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" style={{ width: `${safeProgress}%` }}></div>
                                  </div>
                                  <span className="text-sm font-semibold text-purple-600">{safeProgress}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-1.5" />
                                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : '-'} - {project.end_date ? new Date(project.end_date).toLocaleDateString() : '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                                  {project.currency} {project.budget && !isNaN(Number(project.budget)) ? Number(project.budget).toLocaleString() : 'No Budget'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewProject(project);
                                    }}
                                    className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                    title="View Project"
                                  >
                                    <EyeIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditProject(project);
                                    }}
                                    className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-all duration-200"
                                    title="Edit Project"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteId(project.id);
                                    }}
                                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-all duration-200"
                                    title="Delete Project"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-16">
                            <RocketLaunchIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                            <p className="text-gray-500">
                              {searchTerm || selectedStatus !== 'all' 
                                ? 'Try adjusting your search or filters.' 
                                : 'Get started by creating your first project.'}
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </>
    );
  } else if (currentView === 'project-details') {
    mainContent = (
      <div className="space-y-6">
        {/* Header with back button and navigation tabs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={handleBackToOverview} className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">← Back to Projects</button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{selectedProject?.name}</h1>
              <p className="text-sm text-gray-500">{selectedProject?.project_number}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => handleCreatePhase(selectedProject?.id)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"><PlusIcon className="h-4 w-4 mr-2" />Add Phase</button>
            <button onClick={() => handleCreateTask(selectedProject?.id)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"><PlusIcon className="h-4 w-4 mr-2" />Add Task</button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveDetailsTab('dashboard')} className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Dashboard</button>
            <button onClick={() => setActiveDetailsTab('timeline')} className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Timeline</button>
            <button onClick={() => setActiveDetailsTab('team')} className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Team</button>
            <button onClick={() => setActiveDetailsTab('documents')} className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Documents</button>
            <button onClick={() => setActiveDetailsTab('analytics')} className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Analytics</button>
            <button onClick={() => setActiveDetailsTab('gantt')} className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Gantt Chart</button>
            <button onClick={() => setActiveDetailsTab('info')} className="py-2 px-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">Info</button>
          </nav>
        </div>

        {/* Project Info Summary / Details Tabs */}
        {activeDetailsTab === 'info' ? (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Projects Module — How to use</h3>
            <p className="text-sm text-gray-600 mb-4">The Projects module lets you plan, track and deliver work. Use the tabs to view different aspects of a project:</p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2 mb-4">
              <li><strong>Dashboard:</strong> Overall progress, budget usage and key metrics.</li>
              <li><strong>Timeline:</strong> Visualize phases, tasks and milestones over time.</li>
              <li><strong>Team:</strong> Assign and manage project members and roles.</li>
              <li><strong>Documents:</strong> Upload and manage project files and deliverables.</li>
              <li><strong>Analytics:</strong> Insights and financials related to this project.</li>
              <li><strong>Gantt Chart:</strong> Visual schedule for phases and tasks.</li>
            </ul>
            <h4 className="text-sm font-medium text-gray-800">AI-Assisted Content</h4>
            <p className="text-sm text-gray-600 mb-2">Use the "Generate with AI" box inside the Create Project/Phase/Task forms to auto-generate names and descriptions. Example prompts:</p>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>"Create a project to build a mobile banking app for small retailers"</li>
              <li>"Define a phase for backend API development"</li>
              <li>"Create a task for implementing user authentication"</li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">Tip: AI generation requires the Gemini API key in production. In development, a safe local fallback is used.</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <div className="mt-1 flex items-center">
                    {getStatusIcon(selectedProject?.status)}
                    <span className="ml-2 text-sm text-gray-900">{selectedProject?.status?.charAt(0).toUpperCase() + selectedProject?.status?.slice(1)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Progress</h3>
                  <div className="mt-1">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${safeProjectProgress}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-900">{Number.isFinite(safeProjectProgress) ? safeProjectProgress : 0}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Budget</h3>
                  <p className="mt-1 text-sm text-gray-900">{selectedProject?.currency || ''} {selectedProject?.budget !== undefined && selectedProject?.budget !== null && !isNaN(Number(selectedProject.budget)) ? Number(selectedProject.budget).toLocaleString() : 'No Budget'}</p>
                </div>
              </div>
            </div>

            {/* Phases Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Project Phases</h3>
                  <span className="text-sm text-gray-500">{phases.length} phases</span>
                </div>

                {phasesLoading ? (
                  <LoadingSpinner size="md" className="py-4" />
                ) : phases.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No phases yet</h4>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating a new phase for this project.</p>
                    <button onClick={() => handleCreatePhase(selectedProject?.id)} className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"><PlusIcon className="h-4 w-4 mr-2" />Create First Phase</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {phases.map((phase: any) => (
                      <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{phase.name}</h4>
                            <p className="text-sm text-gray-500">{phase.description}</p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Status: {phase.status?.replace('_', ' ')}</span>
                              <span>Order: {phase.order}</span>
                              <span>Progress: {Number.isFinite(calculatePhaseProgress(phase, tasks)) ? calculatePhaseProgress(phase, tasks) : 0}%</span>
                              {phase.start_date && <span>Start: {new Date(phase.start_date).toLocaleDateString()}</span>}
                              {phase.end_date && <span>End: {new Date(phase.end_date).toLocaleDateString()}</span>}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button onClick={() => handleEditPhase(phase)} className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">Edit</button>
                            <button onClick={() => handleCreateTask(selectedProject?.id, phase.id)} className="text-green-600 hover:text-green-900 text-sm font-medium">Add Task</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Tasks Section */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">Project Tasks</h3>
                  <span className="text-sm text-gray-500">{tasks.length} tasks</span>
                </div>

                {tasksLoading ? (
                  <LoadingSpinner size="md" className="py-4" />
                ) : tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">No tasks yet</h4>
                    <p className="mt-1 text-sm text-gray-500">Break down your project into manageable tasks.</p>
                    <button onClick={() => handleCreateTask(selectedProject?.id)} className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"><PlusIcon className="h-4 w-4 mr-2" />Create First Task</button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task: any) => (
                          <tr key={task.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{task.name}</div>
                                <div className="text-sm text-gray-500">{task.task_number}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.assignedTo?.name || task.assigned_to?.name || 'Unassigned'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${task.progress_percentage || 0}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-500">{task.progress_percentage || 0}%</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button 
                                onClick={() => handleEditTask(task)} 
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => setDeleteTaskId(task.id)} 
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div>{mainContent}</div>
      </DashboardLayout>

      {/* Create/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="min-h-screen px-4 text-center">
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <SparklesIcon className="h-6 w-6 mr-2" />
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    required
                    placeholder="Enter magical project name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    placeholder="Describe your amazing project..."
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Project Category *</label>
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium underline"
                    >
                      + New Category
                    </button>
                  </div>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    required
                  >
                    <option value="">Select a category...</option>
                    {Array.isArray(categories) && categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.code})
                      </option>
                    ))}
                  </select>
                  {categoriesLoading && (
                    <p className="mt-1 text-sm text-gray-500">Loading categories...</p>
                  )}
                  {!categoriesLoading && (!categories || categories.length === 0) && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        No categories found. <button 
                          type="button" 
                          onClick={handleCreateCategory} 
                          className="text-purple-600 hover:text-purple-700 font-medium underline ml-1"
                        >
                          Create your first category
                        </button>
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Client</label>
                    <select
                      value={formData.client_id}
                      onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="">Select a client...</option>
                      {Array.isArray(clients) && clients.map((client: any) => (
                        <option key={client.id} value={client.id}>
                          {client.name || `${client.first_name} ${client.last_name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Project Manager</label>
                    <select
                      value={formData.project_manager}
                      onChange={(e) => setFormData({ ...formData, project_manager: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="">Select a project manager...</option>
                      {users.map((user: any) => (
                        <option key={user.id} value={user.id}>
                          {user.name || `${user.first_name} ${user.last_name}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Budget</label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="UGX">UGX</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transform hover:scale-105 transition-all duration-200 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        {editingProject ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        {editingProject ? 'Update Project' : 'Create Project'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Project Phase Modal */}
      <ProjectPhaseModal
        isOpen={isPhaseModalOpen}
        onClose={handleClosePhaseModal}
        phase={selectedPhase}
        projectId={selectedProject?.id}
        mode={modalMode}
      />

      {/* Project Task Modal */}
      <ProjectTaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        task={selectedTask}
        projectId={selectedProject?.id}
        phaseId={selectedPhase?.id}
        mode={modalMode}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="min-h-screen px-4 text-center">
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                  Delete Project
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this project? This action cannot be undone and will permanently remove all associated data including phases, tasks, and progress.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-200 flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Delete Project
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="min-h-screen px-4 text-center">
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <PlusIcon className="h-6 w-6 mr-2" />
                  Create Project Category
                </h3>
              </div>
              <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryFormData.name}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter category name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category Code <span className="text-red-500">*</span>
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={categoryFormData.code}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, code: e.target.value.toUpperCase() })}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter unique category code (e.g., WEB, MOBILE)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const code = categoryFormData.name
                          .replace(/[^a-zA-Z0-9\s]/g, '')
                          .split(' ')
                          .map(word => word.substring(0, 3))
                          .join('')
                          .toUpperCase()
                          .substring(0, 8);
                        setCategoryFormData({ ...categoryFormData, code });
                      }}
                      disabled={!categoryFormData.name}
                      className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium"
                    >
                      Auto
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    A unique identifier for this category (letters and numbers only)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryFormData.description}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter category description"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className="w-full h-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createCategoryMutation.isPending}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 transition-all duration-200 flex items-center"
                  >
                    {createCategoryMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Task Delete Modal */}
      {deleteTaskId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm">
          <div className="min-h-screen px-4 text-center">
            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-gradient-to-r from-red-500 to-pink-500 px-6 py-4">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
                  Delete Task
                </h3>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to delete this task? This action cannot be undone and will permanently remove the task and all associated data.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteTaskId(null)}
                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDeleteTask}
                    disabled={isDeleting}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-xl hover:from-red-600 hover:to-pink-600 disabled:opacity-50 transition-all duration-200 flex items-center"
                  >
                    {isDeleting ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-5 w-5 mr-2" />
                        Delete Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
