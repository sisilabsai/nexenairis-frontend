'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  StarIcon,
  FireIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  TagIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  FireIcon as FireSolidIcon,
} from '@heroicons/react/24/solid';

interface MobileOptimizedDeal {
  id: number;
  title: string;
  contact: { name: string };
  company?: string;
  expected_value: number;
  currency: string;
  probability: number;
  expected_close_date: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  deal_temperature?: 'cold' | 'warm' | 'hot';
  health_score?: number;
  last_activity?: string;
  next_action?: string;
  phone?: string;
  email?: string;
  sales_pipeline_stage_id: number;
}

interface MobileStage {
  id: number;
  name: string;
  color: string;
  deals_count: number;
  total_value: number;
}

// Mobile-optimized Deal Card
const MobileDealCard = ({ 
  deal, 
  onEdit, 
  onSwipeAction,
  index 
}: { 
  deal: MobileOptimizedDeal;
  onEdit: (deal: MobileOptimizedDeal) => void;
  onSwipeAction: (deal: MobileOptimizedDeal, action: 'call' | 'email' | 'edit') => void;
  index: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const x = useMotionValue(0);
  const background = useTransform(
    x,
    [-150, -75, 0, 75, 150],
    ['#ef4444', '#f97316', '#ffffff', '#10b981', '#3b82f6']
  );

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  const getDaysUntilClose = () => {
    const today = new Date();
    const closeDate = new Date(deal.expected_close_date);
    const diffTime = closeDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 75;
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        onSwipeAction(deal, info.offset.x > 150 ? 'edit' : 'call');
      } else {
        onSwipeAction(deal, Math.abs(info.offset.x) > 150 ? 'email' : 'call');
      }
    }
    x.set(0);
  };

  const daysUntilClose = getDaysUntilClose();
  const isOverdue = daysUntilClose < 0;
  const isDueSoon = daysUntilClose >= 0 && daysUntilClose <= 7;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative mb-3 last:mb-0"
    >
      {/* Background Actions */}
      <div className="absolute inset-0 flex items-center justify-between px-4 rounded-xl overflow-hidden">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-red-500 rounded-full">
            <PhoneIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full">
            <EnvelopeIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full">
            <PhoneIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-500 rounded-full">
            <EyeIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        style={{ x, background }}
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.98 }}
        className={`
          relative bg-white rounded-xl border border-gray-200 p-4 shadow-sm
          ${isDragging ? 'z-10 shadow-lg' : ''}
          ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
          ${isDueSoon ? 'border-l-4 border-l-orange-500' : ''}
        `}
        onClick={() => !isDragging && setIsExpanded(!isExpanded)}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-bold text-gray-900 text-base truncate">
                {deal.title}
              </h3>
              {deal.deal_temperature === 'hot' && (
                <FireSolidIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{deal.contact.name}</span>
              {deal.company && (
                <>
                  <span>•</span>
                  <span className="truncate">{deal.company}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            <div className={`px-2 py-1 rounded-full text-xs font-bold ${
              deal.priority === 'urgent' ? 'bg-red-100 text-red-700' :
              deal.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              deal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {(deal.priority || 'medium').toUpperCase()}
            </div>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                deal.deal_temperature === 'hot' ? 'bg-red-400' :
                deal.deal_temperature === 'warm' ? 'bg-yellow-400' :
                'bg-blue-400'
              }`} />
              <span className="text-xs text-gray-500 font-medium">
                {deal.health_score || Math.floor(deal.probability)}%
              </span>
            </div>
          </div>
        </div>

        {/* Value and Probability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(deal.expected_value)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${deal.probability}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600 w-8 text-right">
              {deal.probability}%
            </span>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <span className={`${
              isOverdue ? 'text-red-600 font-semibold' :
              isDueSoon ? 'text-orange-600 font-medium' :
              'text-gray-600'
            }`}>
              {isOverdue ? `${Math.abs(daysUntilClose)}d overdue` :
               daysUntilClose === 0 ? 'Due today' :
               `${daysUntilClose}d left`}
            </span>
          </div>
          
          {deal.last_activity && (
            <div className="flex items-center space-x-1 text-gray-500">
              <ClockIcon className="w-4 h-4" />
              <span className="text-xs">
                {Math.floor((Date.now() - new Date(deal.last_activity).getTime()) / (1000 * 60 * 60 * 24))}d ago
              </span>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
            >
              {deal.next_action && (
                <div className="flex items-center space-x-2 mb-3 p-3 bg-orange-50 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-900">Next Action</p>
                    <p className="text-sm text-orange-700">{deal.next_action}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Close Date:</span>
                    <span className="font-medium">
                      {new Date(deal.expected_close_date).toLocaleDateString()}
                    </span>
                  </div>
                  {deal.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <PhoneIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-blue-600">{deal.phone}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-500">Weighted:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency((deal.expected_value * deal.probability) / 100)}
                    </span>
                  </div>
                  {deal.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-blue-600 truncate">{deal.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 mt-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwipeAction(deal, 'call');
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-green-600 text-white rounded-lg font-medium"
                >
                  <PhoneIcon className="w-4 h-4" />
                  <span>Call</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSwipeAction(deal, 'email');
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-blue-600 text-white rounded-lg font-medium"
                >
                  <EnvelopeIcon className="w-4 h-4" />
                  <span>Email</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(deal);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 bg-indigo-600 text-white rounded-lg font-medium"
                >
                  <EyeIcon className="w-4 h-4" />
                  <span>View</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Mobile Stage View
const MobileStageView = ({ 
  stages, 
  deals, 
  currentStageIndex, 
  onStageChange,
  onEditDeal,
  onSwipeAction,
  onAddDeal 
}: {
  stages: MobileStage[];
  deals: MobileOptimizedDeal[];
  currentStageIndex: number;
  onStageChange: (index: number) => void;
  onEditDeal: (deal: MobileOptimizedDeal) => void;
  onSwipeAction: (deal: MobileOptimizedDeal, action: 'call' | 'email' | 'edit') => void;
  onAddDeal: (stageId: number) => void;
}) => {
  const currentStage = stages[currentStageIndex];
  const stageDeals = deals.filter(deal => deal.sales_pipeline_stage_id === currentStage.id);
  
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Stage Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onStageChange(Math.max(0, currentStageIndex - 1))}
              disabled={currentStageIndex === 0}
              className="p-2 rounded-full bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-900">{currentStage.name}</h2>
              <p className="text-sm text-gray-500">
                {stageDeals.length} deals • {formatCurrency(currentStage.total_value)}
              </p>
            </div>
            
            <button
              onClick={() => onStageChange(Math.min(stages.length - 1, currentStageIndex + 1))}
              disabled={currentStageIndex === stages.length - 1}
              className="p-2 rounded-full bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          <button
            onClick={() => onAddDeal(currentStage.id)}
            className="p-2 rounded-full bg-indigo-600 text-white"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Progress Indicator */}
        <div className="flex space-x-2">
          {stages.map((_, index) => (
            <div
              key={index}
              className={`flex-1 h-2 rounded-full transition-colors duration-200 ${
                index === currentStageIndex ? 'bg-indigo-600' :
                index < currentStageIndex ? 'bg-green-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Deals List */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {stageDeals.length > 0 ? (
          <div className="space-y-0">
            {stageDeals.map((deal, index) => (
              <MobileDealCard
                key={deal.id}
                deal={deal}
                onEdit={onEditDeal}
                onSwipeAction={onSwipeAction}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals in {currentStage.name}</h3>
            <p className="text-gray-500 mb-6 max-w-sm">
              Start building your pipeline by adding your first deal to this stage.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddDeal(currentStage.id)}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Add Deal</span>
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
};

export { MobileDealCard, MobileStageView };
export type { MobileOptimizedDeal, MobileStage };