'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  CalendarIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  FlagIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: number;
  project_number: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  start_date: string;
  end_date: string;
  budget: number;
  currency: string;
  progress_percentage: number;
  objectives: string;
  deliverables: string;
  risks: string;
  assumptions: string;
  category?: {
    name: string;
    code: string;
  };
  projectManager?: {
    name: string;
    email: string;
    position: string;
  };
  client?: {
    name: string;
    email: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
}

interface ProjectViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ProjectViewModal({ isOpen, onClose, project, onEdit, onDelete }: ProjectViewModalProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !project) return null;

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
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      case 'on_hold':
        return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString()}`;
  };

  const calculateDaysRemaining = () => {
    if (!project.end_date) return null;
    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl mx-auto my-8 transform transition-all duration-300 ease-in-out">
          <div className="sticky top-0 bg-white rounded-t-2xl z-10 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-800">{project.name}</h3>
                <p className="text-md text-gray-500">{project.project_number}</p>
              </div>
              <div className="flex items-center space-x-3">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Edit Project
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-8 overflow-y-auto" style={{ maxHeight: '75vh' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Project Description</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-6">
                    {[
                      { id: 'details', name: 'Project Details' },
                      { id: 'team', name: 'Team & Client' },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-2 px-1 border-b-2 font-semibold text-md transition-colors ${
                          activeTab === tab.id
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {tab.name}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Tab Content */}
                <div>
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {project.objectives && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Objectives</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{project.objectives}</p>
                        </div>
                      )}
                      {project.deliverables && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Deliverables</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{project.deliverables}</p>
                        </div>
                      )}
                      {project.risks && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Risks</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{project.risks}</p>
                        </div>
                      )}
                      {project.assumptions && (
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-2">Assumptions</h4>
                          <p className="text-gray-700 whitespace-pre-wrap">{project.assumptions}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'team' && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Project Manager</h4>
                        {project.projectManager ? (
                          <div className="flex items-center space-x-4">
                            <img className="h-12 w-12 rounded-full" src={`https://i.pravatar.cc/150?u=${project.projectManager.name}`} alt="" />
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{project.projectManager.name}</p>
                              <p className="text-sm text-gray-500">{project.projectManager.position || 'Project Manager'}</p>
                              <p className="text-sm text-gray-500">{project.projectManager.email}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">No project manager assigned</p>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-3">Client</h4>
                        {project.client ? (
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                              <UserGroupIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                              <p className="text-lg font-semibold text-gray-900">{project.client.name}</p>
                              <p className="text-sm text-gray-500">{project.client.email}</p>
                              {project.client.phone && <p className="text-sm text-gray-500">{project.client.phone}</p>}
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500">No client assigned</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Status</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Status</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
                        {getStatusIcon(project.status)}
                        <span className="ml-1.5 capitalize">{project.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-600">Priority</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getPriorityColor(project.priority)}`}>
                        <FlagIcon className="h-4 w-4 mr-1.5" />
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Progress</span>
                      <div className="mt-2 flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-indigo-600 h-3 rounded-full" 
                            style={{ width: `${project.progress_percentage}%` }}
                          ></div>
                        </div>
                        <span className="ml-3 text-sm font-semibold text-gray-800">{project.progress_percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Key Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-500" />
                      <span className="ml-3 font-medium text-gray-700">Budget: {formatCurrency(project.budget, project.currency)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      <span className="ml-3 font-medium text-gray-700">Start: {formatDate(project.start_date)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-5 w-5 text-gray-500" />
                      <span className="ml-3 font-medium text-gray-700">End: {project.end_date ? formatDate(project.end_date) : 'Not set'}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="h-5 w-5 text-gray-500" />
                      <span className="ml-3 font-medium text-gray-700">
                        {daysRemaining !== null ? (
                          daysRemaining > 0 ? `${daysRemaining} days remaining` : daysRemaining === 0 ? 'Due today' : `${Math.abs(daysRemaining)} days overdue`
                        ) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white rounded-b-2xl z-10 px-8 py-4 border-t border-gray-200">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Created: {formatDate(project.created_at)}</span>
              <span>Last updated: {formatDate(project.updated_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
