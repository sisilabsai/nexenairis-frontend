'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, PanInfo } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  TrophyIcon,
  BoltIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  Bars3Icon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  StarIcon,
  TagIcon,
  LockClosedIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentDuplicateIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarSolidIcon,
  FireIcon as FireSolidIcon,
  BoltIcon as BoltSolidIcon,
} from '@heroicons/react/24/solid';
// Enhanced types for our advanced pipeline
interface EnhancedOpportunity {
  id: number;
  title: string;
  description?: string;
  contact: {
    name: string;
  };
  expected_value: number;
  currency: string;
  sales_pipeline_stage_id: number;
  contact_id: number;
  probability: number;
  expected_close_date: string;
  stage: string;
  source?: string;
  assigned_to?: number;
  notes?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  health_score?: number;
  last_activity?: string;
  next_action?: string;
  tags?: string[];
  deal_temperature?: 'cold' | 'warm' | 'hot';
  competitor?: string;
  decision_maker?: boolean;
  estimated_close_date?: string;
  activities_count?: number;
  files_count?: number;
  last_contacted?: string;
  lead_source?: string;
  company?: string;
  phone?: string;
  email?: string;
}

interface PipelineAnalytics {
  total_value: number;
  weighted_value: number;
  conversion_rate: number;
  average_deal_size: number;
  cycle_time: number;
  win_rate: number;
  pipeline_velocity: number;
  deals_this_month: number;
  revenue_forecast: number;
}

interface ViewMode {
  type: 'kanban' | 'list' | 'analytics';
  density: 'compact' | 'comfortable' | 'spacious';
  groupBy: 'stage' | 'owner' | 'priority' | 'source';
  sortBy: 'value' | 'probability' | 'date' | 'activity';
}

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-700 border-green-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  urgent: 'bg-red-100 text-red-700 border-red-300',
};

const TEMPERATURE_ICONS = {
  cold: <div className="w-2 h-2 rounded-full bg-blue-400" />,
  warm: <div className="w-2 h-2 rounded-full bg-yellow-400" />,
  hot: <FireSolidIcon className="w-4 h-4 text-red-500" />,
};

// Advanced Deal Card Component
interface DealCardProps {
  opportunity: EnhancedOpportunity;
  onEdit: (opp: EnhancedOpportunity) => void;
  onDrag?: (opp: EnhancedOpportunity, info: PanInfo) => void;
  isDragging?: boolean;
  viewMode: ViewMode;
  // Collaboration props
  viewingUsers?: Array<{ id: number; name: string; color: string; avatar?: string }>;
  isLocked?: boolean;
  lockedBy?: { id: number; name: string; color: string; avatar?: string };
  commentCount?: number;
  onViewDeal?: (dealId: number) => void;
  onStopViewingDeal?: (dealId: number) => void;
  onAIInsights?: (opp: EnhancedOpportunity) => void;
}

const DealCard = ({ 
  opportunity, 
  onEdit, 
  onDrag, 
  isDragging,
  viewMode,
  viewingUsers = [],
  isLocked = false,
  lockedBy,
  commentCount = 0,
  onViewDeal,
  onStopViewingDeal,
  onAIInsights,
}: DealCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const dragControls = useDragControls();

  const priorityColor = PRIORITY_COLORS[opportunity.priority || 'medium'];
  const isOverdue = opportunity.expected_close_date && new Date(opportunity.expected_close_date) < new Date();
  const daysUntilClose = opportunity.expected_close_date 
    ? Math.ceil((new Date(opportunity.expected_close_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const healthScore = opportunity.health_score || Math.floor(opportunity.probability || 50);
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (viewMode.density === 'compact') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
        whileTap={{ scale: 0.98 }}
        drag={onDrag ? 'y' : false}
        dragControls={dragControls}
        onDragEnd={(event, info) => onDrag?.(opportunity, info)}
        className={`
          bg-white rounded-lg border border-gray-200 p-3 mb-2 cursor-pointer transition-all duration-200
          hover:border-indigo-300 hover:shadow-md relative group
          ${isDragging ? 'shadow-xl z-50 rotate-2' : ''}
          ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onEdit(opportunity)}
      >
        {/* Priority indicator */}
        <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
          opportunity.priority === 'urgent' ? 'bg-red-500' :
          opportunity.priority === 'high' ? 'bg-orange-500' :
          opportunity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
        }`} />

        {/* Collaboration indicators */}
        {(viewingUsers.length > 0 || isLocked || commentCount > 0) && (
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {/* Viewing users */}
            {viewingUsers.length > 0 && (
              <div className="flex -space-x-1">
                {viewingUsers.slice(0, 2).map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative"
                  >
                    <div
                      className="w-4 h-4 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: user.color }}
                      title={`${user.name} is viewing`}
                    >
                      <EyeIcon className="w-2.5 h-2.5" />
                    </div>
                  </motion.div>
                ))}
                {viewingUsers.length > 2 && (
                  <div className="w-4 h-4 bg-gray-400 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold">
                    +{viewingUsers.length - 2}
                  </div>
                )}
              </div>
            )}

            {/* Lock indicator */}
            {isLocked && lockedBy && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-1 bg-red-100 px-1 py-0.5 rounded-full"
                title={`Locked by ${lockedBy.name}`}
              >
                <LockClosedIcon className="w-2.5 h-2.5 text-red-600" />
                <span className="text-xs text-red-600 font-medium truncate max-w-[40px]">
                  {lockedBy.name.split(' ')[0]}
                </span>
              </motion.div>
            )}

            {/* Comment count */}
            {commentCount > 0 && (
              <div className="flex items-center space-x-1 bg-purple-100 px-1 py-0.5 rounded-full">
                <ChatBubbleBottomCenterTextIcon className="w-2.5 h-2.5 text-purple-600" />
                <span className="text-xs text-purple-600 font-medium">{commentCount}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate pr-4">
              {opportunity.title}
            </h3>
            <p className="text-xs text-gray-600 truncate">{opportunity.contact?.name || 'Unknown Contact'}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            {TEMPERATURE_ICONS[opportunity.deal_temperature || 'warm']}
            <span className="text-sm font-bold text-gray-900">
              {formatCurrency(opportunity.expected_value)}
            </span>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </div>
        </div>

        {daysUntilClose !== null && (
          <div className={`text-xs mt-1 ${
            daysUntilClose < 0 ? 'text-red-600 font-semibold' :
            daysUntilClose < 7 ? 'text-orange-600' : 'text-gray-500'
          }`}>
            {daysUntilClose < 0 ? `${Math.abs(daysUntilClose)} days overdue` :
             daysUntilClose === 0 ? 'Due today' :
             `${daysUntilClose} days left`}
          </div>
        )}

        {/* Quick action overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900 bg-opacity-10 rounded-lg flex items-center justify-center"
            >
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-indigo-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(opportunity);
                  }}
                >
                  <EyeIcon className="w-4 h-4 text-indigo-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-green-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle quick call action
                  }}
                >
                  <PhoneIcon className="w-4 h-4 text-green-600" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1.5 bg-white rounded-full shadow-md hover:bg-blue-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Handle quick email action
                  }}
                >
                  <EnvelopeIcon className="w-4 h-4 text-blue-600" />
                </motion.button>
                {onAIInsights && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 bg-white rounded-full shadow-md hover:bg-purple-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAIInsights(opportunity);
                    }}
                    title="AI Insights"
                  >
                    <SparklesIcon className="w-4 h-4 text-purple-600" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // Full detailed card for comfortable/spacious view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ 
        scale: 1.02, 
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        borderColor: 'rgb(99, 102, 241)'
      }}
      whileTap={{ scale: 0.98 }}
      drag={onDrag ? 'y' : false}
      dragControls={dragControls}
      onDragEnd={(event, info) => onDrag?.(opportunity, info)}
      className={`
        bg-white rounded-xl border border-gray-200 p-4 mb-4 cursor-pointer transition-all duration-300
        hover:shadow-lg relative group overflow-hidden
        ${isDragging ? 'shadow-2xl z-50 rotate-1 scale-105' : ''}
        ${isOverdue ? 'border-l-4 border-l-red-500' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(opportunity)}
    >
      {/* Background gradient based on priority */}
      <div className={`absolute inset-0 opacity-5 ${
        opportunity.priority === 'urgent' ? 'bg-gradient-to-br from-red-500 to-red-600' :
        opportunity.priority === 'high' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
        opportunity.priority === 'medium' ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
        'bg-gradient-to-br from-green-500 to-green-600'
      }`} />

      {/* Priority and temperature indicators */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${priorityColor}`}>
            {(opportunity.priority || 'medium').toUpperCase()}
          </div>
          {TEMPERATURE_ICONS[opportunity.deal_temperature || 'warm']}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="flex space-x-1">
              {opportunity.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {opportunity.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{opportunity.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {opportunity.deal_temperature === 'hot' && (
            <FireSolidIcon className="w-4 h-4 text-red-500 animate-pulse" />
          )}
          <div className={`text-sm font-bold ${getHealthColor(healthScore)}`}>
            {healthScore}%
          </div>
        </div>
      </div>

      {/* Deal info */}
      <div className="space-y-2">
        <h3 className="font-bold text-gray-900 text-lg leading-tight">
          {opportunity.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-600">
            <UserIcon className="w-4 h-4" />
            <span className="text-sm">{opportunity.contact?.name || 'Unknown Contact'}</span>
            {opportunity.company && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-sm">{opportunity.company}</span>
              </>
            )}
          </div>
          {opportunity.decision_maker && (
            <div className="flex items-center space-x-1 text-purple-600">
              <TrophyIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Decision Maker</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(opportunity.expected_value)}
            </span>
            <span className="text-sm text-gray-500">
              ({opportunity.probability || 50}%)
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Weighted: {formatCurrency((opportunity.expected_value * (opportunity.probability || 50)) / 100)}
          </div>
        </div>

        {/* Timeline info */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4" />
            <span>
              {daysUntilClose !== null ? (
                daysUntilClose < 0 ? (
                  <span className="text-red-600 font-semibold">
                    {Math.abs(daysUntilClose)} days overdue
                  </span>
                ) : daysUntilClose === 0 ? (
                  <span className="text-orange-600 font-semibold">Due today</span>
                ) : (
                  <span>{daysUntilClose} days left</span>
                )
              ) : (
                'No close date'
              )}
            </span>
          </div>
          {opportunity.last_activity && (
            <div className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>Last activity: {new Date(opportunity.last_activity).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Activity indicators */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {opportunity.activities_count !== undefined && (
              <div className="flex items-center space-x-1 text-gray-600">
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
                <span className="text-xs">{opportunity.activities_count}</span>
              </div>
            )}
            {opportunity.files_count !== undefined && (
              <div className="flex items-center space-x-1 text-gray-600">
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span className="text-xs">{opportunity.files_count}</span>
              </div>
            )}
            {opportunity.next_action && (
              <div className="flex items-center space-x-1 text-orange-600">
                <BoltIcon className="w-4 h-4" />
                <span className="text-xs font-medium">Next: {opportunity.next_action}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(healthScore / 20) 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 right-4 flex space-x-2"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(opportunity);
              }}
            >
              <EyeIcon className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`tel:${opportunity.phone}`, '_self');
              }}
            >
              <PhoneIcon className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${opportunity.email}`, '_self');
              }}
            >
              <EnvelopeIcon className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DealCard;