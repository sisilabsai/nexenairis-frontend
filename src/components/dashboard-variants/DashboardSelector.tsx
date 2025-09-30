'use client';

import { useState } from 'react';
import {
  CubeIcon,
  CurrencyDollarIcon,
  FolderIcon,
  UserGroupIcon,
  UsersIcon,
  CogIcon,
  ChevronDownIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface DashboardVariant {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  features: string[];
  recommendedFor: string[];
}

interface DashboardSelectorProps {
  selectedDashboard: string;
  onDashboardChange: (dashboardId: string) => void;
}

export default function DashboardSelector({ selectedDashboard, onDashboardChange }: DashboardSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);

  const dashboardVariants: DashboardVariant[] = [
    {
      id: 'executive',
      name: 'Executive Dashboard',
      description: 'Comprehensive overview of all business operations',
      icon: CogIcon,
      color: 'blue',
      features: ['KPI Overview', 'Critical Alerts', 'AI Insights', 'Real-time Updates'],
      recommendedFor: ['CEOs', 'Directors', 'Business Owners']
    },
    {
      id: 'inventory',
      name: 'Inventory Dashboard',
      description: 'Advanced inventory management with AI-powered insights',
      icon: CubeIcon,
      color: 'purple',
      features: ['Smart Reordering', 'Heat Maps', 'IoT Integration', 'Blockchain Trace'],
      recommendedFor: ['Inventory Managers', 'Warehouse Supervisors', 'Procurement Teams']
    },
    {
      id: 'sales',
      name: 'Sales Dashboard',
      description: 'Revenue analytics and sales performance tracking',
      icon: CurrencyDollarIcon,
      color: 'green',
      features: ['Revenue Analytics', 'Customer Insights', 'Sales Forecasting', 'Performance Metrics'],
      recommendedFor: ['Sales Managers', 'Business Development', 'Revenue Teams']
    },
    {
      id: 'project',
      name: 'Project Dashboard',
      description: 'Project management and delivery tracking',
      icon: FolderIcon,
      color: 'orange',
      features: ['Project Timeline', 'Resource Allocation', 'Risk Assessment', 'Delivery Metrics'],
      recommendedFor: ['Project Managers', 'Team Leads', 'IT Departments']
    },
    {
      id: 'hr',
      name: 'HR Dashboard',
      description: 'Human resources and workforce analytics',
      icon: UserGroupIcon,
      color: 'pink',
      features: ['Employee Analytics', 'Productivity Metrics', 'Recruitment Tracking', 'Performance Reviews'],
      recommendedFor: ['HR Managers', 'Department Heads', 'People Operations']
    },
    {
      id: 'crm',
      name: 'CRM Dashboard',
      description: 'Customer relationship management and insights',
      icon: UsersIcon,
      color: 'indigo',
      features: ['Customer Analytics', 'Lead Tracking', 'Deal Pipeline', 'Customer Segmentation'],
      recommendedFor: ['Sales Teams', 'Customer Success', 'Marketing Teams']
    }
  ];

  const selectedVariant = dashboardVariants.find(v => v.id === selectedDashboard);

  return (
    <div className="relative">
      {/* Current Dashboard Display */}
      <div
        className="bg-white shadow-lg rounded-lg p-4 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => setShowSelector(!showSelector)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg bg-${selectedVariant?.color}-100`}>
              {selectedVariant && <selectedVariant.icon className={`h-6 w-6 text-${selectedVariant.color}-600`} />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedVariant?.name}</h3>
              <p className="text-sm text-gray-600">{selectedVariant?.description}</p>
            </div>
          </div>
          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${showSelector ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dashboard Selector Dropdown */}
      {showSelector && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl rounded-lg border border-gray-200 z-50">
          <div className="p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Dashboard</h4>
            <div className="space-y-3">
              {dashboardVariants.map((variant) => (
                <div
                  key={variant.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                    selectedDashboard === variant.id
                      ? `border-${variant.color}-300 bg-${variant.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    onDashboardChange(variant.id);
                    setShowSelector(false);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-${variant.color}-100 flex-shrink-0`}>
                        <variant.icon className={`h-5 w-5 text-${variant.color}-600`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-medium text-gray-900">{variant.name}</h5>
                          {selectedDashboard === variant.id && (
                            <CheckIcon className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{variant.description}</p>

                        {/* Features */}
                        <div className="mt-3">
                          <p className="text-xs font-medium text-gray-700 mb-2">Key Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {variant.features.map((feature, index) => (
                              <span
                                key={index}
                                className={`px-2 py-1 text-xs rounded-full bg-${variant.color}-100 text-${variant.color}-700`}
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Recommended For */}
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Recommended for: {variant.recommendedFor.join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSelector(false)}
        />
      )}
    </div>
  );
}