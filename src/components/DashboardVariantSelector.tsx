'use client';

import { useState } from 'react';
import {
  ComputerDesktopIcon,
  CubeIcon,
  ShoppingCartIcon,
  BriefcaseIcon,
  UsersIcon,
  UserGroupIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

export type DashboardVariant = 'executive' | 'inventory' | 'sales' | 'projects' | 'hr' | 'crm';

interface DashboardVariantSelectorProps {
  selectedVariant: DashboardVariant;
  onVariantChange: (variant: DashboardVariant) => void;
}

const variants = [
  {
    id: 'executive' as DashboardVariant,
    name: 'Executive Dashboard',
    description: 'Business overview',
    icon: ComputerDesktopIcon,
    color: 'blue'
  },
  {
    id: 'inventory' as DashboardVariant,
    name: 'Inventory Dashboard',
    description: 'Stock & supply chain',
    icon: CubeIcon,
    color: 'green'
  },
  {
    id: 'sales' as DashboardVariant,
    name: 'Sales Dashboard',
    description: 'Revenue & customers',
    icon: ShoppingCartIcon,
    color: 'emerald'
  },
  {
    id: 'projects' as DashboardVariant,
    name: 'Project Dashboard',
    description: 'Project management',
    icon: BriefcaseIcon,
    color: 'purple'
  },
  {
    id: 'hr' as DashboardVariant,
    name: 'HR Dashboard',
    description: 'Employee management',
    icon: UsersIcon,
    color: 'orange'
  },
  {
    id: 'crm' as DashboardVariant,
    name: 'CRM Dashboard',
    description: 'Customer relationships',
    icon: UserGroupIcon,
    color: 'pink'
  }
];

export default function DashboardVariantSelector({ selectedVariant, onVariantChange }: DashboardVariantSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedVariantData = variants.find(v => v.id === selectedVariant);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          {selectedVariantData && (
            <selectedVariantData.icon className={`h-5 w-5 mr-2 text-${selectedVariantData.color}-600`} />
          )}
          <span className="text-sm font-medium text-gray-900">{selectedVariantData?.name}</span>
        </div>
        <ChevronDownIcon className="h-4 w-4 ml-2 text-gray-400" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 py-1">
                Dashboard Variants
              </h3>
              <div className="mt-1 space-y-1">
                {variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => {
                      onVariantChange(variant.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                      selectedVariant === variant.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <variant.icon className={`h-4 w-4 mr-3 text-${variant.color}-600`} />
                    <div className="flex-1 text-left">
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-xs text-gray-500">{variant.description}</div>
                    </div>
                    {selectedVariant === variant.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}