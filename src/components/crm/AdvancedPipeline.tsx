'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  EllipsisVerticalIcon,
  Bars3Icon,
  Squares2X2Icon,
  ListBulletIcon,
  ArrowsUpDownIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  CurrencyDollarIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  BoltIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  FireIcon,
  WifiIcon,
  InformationCircleIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import {
  FireIcon as FireSolidIcon,
  StarIcon as StarSolidIcon,
  WifiIcon as WifiSolidIcon,
  ChartBarIcon as ChartBarSolidIcon,
} from '@heroicons/react/24/solid';

import DealCard from './DealCard';
import { DealDebugger } from './DealDebugger';
import {
  OnlineUsers,
  ActivityFeed,
  DealCollaborationIndicators,
  useRealTimeCollaboration,
  type User,
  type CollaborationState,
  type DealLock,
} from './RealTimeCollaboration';
import AdvancedAnalyticsDashboard from './AdvancedAnalyticsDashboard';
import PipelineInfoModal from './PipelineInfoModal';
import AddDealModal from './AddDealModal';
import EditDealModal from './EditDealModal';
import SmartAutomation from './SmartAutomation';
import AIInsightsPanel from './AIInsightsPanel';
import { PipelineApiService } from '../../services/PipelineApiService';

// Enhanced types
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

interface PipelineStage {
  id: number;
  name: string;
  order: number;
  color?: string;
  target_days?: number;
  conversion_rate?: number;
  deals_count?: number;
  total_value?: number;
  weighted_value?: number;
}

interface ViewMode {
  type: 'kanban' | 'list' | 'analytics';
  density: 'compact' | 'comfortable' | 'spacious';
  groupBy: 'stage' | 'owner' | 'priority' | 'source';
  sortBy: 'value' | 'probability' | 'date' | 'activity';
  sortOrder: 'asc' | 'desc';
}

interface PipelineFilters {
  search: string;
  priority: string[];
  owner: string[];
  temperature: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  valueRange: {
    min?: number;
    max?: number;
  };
  tags: string[];
  source: string[];
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
  deals_won_this_month: number;
  deals_lost_this_month: number;
  average_deal_age: number;
  hottest_deals: EnhancedOpportunity[];
  stale_deals: EnhancedOpportunity[];
}

// Dynamic pipeline - all data comes from backend API

// Pipeline Stage Column Component
const PipelineColumn = ({
  stage,
  opportunities,
  viewMode,
  onDrop,
  onEditDeal,
  onDeleteDeal,
  onAddDeal,
  collaborationState,
  viewDeal,
  stopViewingDeal,
  draggingDeal,
  setDraggingDeal,
}: {
  stage: PipelineStage;
  opportunities: EnhancedOpportunity[];
  viewMode: ViewMode;
  onDrop: (dealId: number, stageId: number) => void;
  onEditDeal: (deal: EnhancedOpportunity) => void;
  onDeleteDeal: (deal: EnhancedOpportunity) => void;
  onAddDeal: (stageId: number) => void;
  collaborationState: CollaborationState;
  viewDeal: (dealId: number) => void;
  stopViewingDeal: (dealId: number) => void;
  draggingDeal: EnhancedOpportunity | null;
  setDraggingDeal: (deal: EnhancedOpportunity | null) => void;
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const stageValue = Array.isArray(opportunities) ? opportunities.reduce((sum, opp) => sum + opp.expected_value, 0) : 0;
  const stageWeightedValue = Array.isArray(opportunities) ? opportunities.reduce((sum, opp) => sum + (opp.expected_value * opp.probability / 100), 0) : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <motion.div
      layout
      className={`
        flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 
        ${isDragOver ? 'border-indigo-400 bg-indigo-50' : ''}
        ${viewMode.density === 'compact' ? 'min-w-[280px]' : 'min-w-[320px]'}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        const dealId = parseInt(e.dataTransfer.getData('text/plain'));
        onDrop(dealId, stage.id);
      }}
    >
      {/* Stage Header */}
      <div className="flex flex-col p-4 border-b border-gray-200 bg-white rounded-t-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: stage.color }}
            />
            <h3 className="font-bold text-gray-900">{stage.name}</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
              {opportunities.length}
            </span>
          </div>
          <button
            onClick={() => onAddDeal(stage.id)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Value:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(stageValue)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Weighted:</span>
            <span className="font-semibold text-green-600">{formatCurrency(stageWeightedValue)}</span>
          </div>
          {stage.conversion_rate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Conv. Rate:</span>
              <span className="font-semibold text-blue-600">{stage.conversion_rate}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Deals List */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
        <AnimatePresence>
          {Array.isArray(opportunities) ? opportunities.map((opportunity) => {
            const viewingUsers = collaborationState.viewing_users[opportunity.id] || [];
            const dealLock = Array.isArray(collaborationState.deal_locks) ? collaborationState.deal_locks.find((lock: DealLock) => lock.deal_id === opportunity.id) : undefined;
            const comments = collaborationState.comments[opportunity.id] || [];
            
              function handleShowAIInsights(opp: EnhancedOpportunity): void {
                  throw new Error('Function not implemented.');
              }

            return (
              <div
                key={opportunity.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', opportunity.id.toString());
                  e.dataTransfer.effectAllowed = 'move';
                  setDraggingDeal(opportunity);
                }}
                onDragEnd={() => {
                  setDraggingDeal(null);
                }}
              >
                <DealCard
                  opportunity={opportunity}
                  onEdit={onEditDeal}
                  onDelete={onDeleteDeal}
                  viewMode={viewMode}
                  viewingUsers={viewingUsers}
                  isLocked={!!dealLock}
                  lockedBy={dealLock?.user}
                  commentCount={comments.length}
                  onViewDeal={viewDeal}
                  onStopViewingDeal={stopViewingDeal}
                  onAIInsights={handleShowAIInsights}
                  isDragging={draggingDeal?.id === opportunity.id}
                />
              </div>
            );
          }) : null}
        </AnimatePresence>
        
        {Array.isArray(opportunities) && opportunities.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 text-gray-500"
          >
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PlusIcon className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm">No deals in this stage</p>
            <button
              onClick={() => onAddDeal(stage.id)}
              className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first deal
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Main Advanced Pipeline Component
const AdvancedPipeline = () => {
  // State management
  const [opportunities, setOpportunities] = useState<EnhancedOpportunity[]>([]);
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>({
    type: 'kanban',
    density: 'comfortable',
    groupBy: 'stage',
    sortBy: 'value',
    sortOrder: 'desc',
  });
  const [filters, setFilters] = useState<PipelineFilters>({
    search: '',
    priority: [],
    owner: [],
    temperature: [],
    dateRange: {},
    valueRange: {},
    tags: [],
    source: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<EnhancedOpportunity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityFeed, setShowActivityFeed] = useState(false);
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showSmartAutomation, setShowSmartAutomation] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showAddDealModal, setShowAddDealModal] = useState(false);
  const [showEditDealModal, setShowEditDealModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState<EnhancedOpportunity | null>(null);
  const [addDealStageId, setAddDealStageId] = useState<number>(1);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [selectedDealForAI, setSelectedDealForAI] = useState<EnhancedOpportunity | null>(null);
  const [draggingDeal, setDraggingDeal] = useState<EnhancedOpportunity | null>(null);

  // Real-time collaboration (mock user and tenant IDs for now)
  const {
    collaborationState,
    isConnected,
    viewDeal,
    stopViewingDeal,
    lockDeal,
    unlockDeal,
    moveDeal,
    addComment,
  } = useRealTimeCollaboration(1, 1); // TODO: Get from auth context

  // Helper function to transform API data and ensure numeric fields are numbers
  const transformDealData = (deal: any): EnhancedOpportunity => {
    return {
      ...deal,
      expected_value: parseFloat(deal.expected_value) || 0,
      probability: parseFloat(deal.probability) || 0,
      // Ensure other numeric fields are properly typed
      contact_id: parseInt(deal.contact_id) || 0,
      assigned_to: deal.assigned_to?.id || deal.assigned_to || null,
      sales_pipeline_stage_id: parseInt(deal.sales_pipeline_stage_id) || 0,
    };
  };

  // Initialize with real data from API
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Load pipeline data from API - completely dynamic, no mock data
        const [dealsResponse, stagesResponse] = await Promise.all([
          PipelineApiService.getDeals(),
          PipelineApiService.getStages()
        ]);
        
        // Backend returns paginated data: { success, data: { data: [...], total, current_page, ... } }
        // So we need to access response.data.data to get the actual array of deals
        const rawDeals = (dealsResponse as any)?.data?.data || (dealsResponse as any)?.data || [];
        const stages = (stagesResponse as any)?.data?.data || (stagesResponse as any)?.data || [];
        
        // Transform deals to ensure numeric fields are proper numbers
        const transformedDeals = rawDeals.map(transformDealData);
        
        setOpportunities(transformedDeals);
        setStages(stages);
        
        console.log('✅ Pipeline data loaded:', {
          deals: transformedDeals.length,
          stages: stages.length,
          sampleDeal: transformedDeals[0],
          totalValue: transformedDeals.reduce((sum: number, d: any) => sum + d.expected_value, 0)
        });
      } catch (error) {
        console.error('❌ Failed to load pipeline data:', error);
        // Set empty arrays if API fails - no mock data fallback
        setOpportunities([]);
        setStages([]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Calculate analytics
  const analytics = useMemo((): PipelineAnalytics => {
    const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
    const totalValue = safeOpportunities.reduce((sum, opp) => sum + opp.expected_value, 0);
    const weightedValue = safeOpportunities.reduce((sum, opp) => sum + (opp.expected_value * opp.probability / 100), 0);
    const hotDeals = safeOpportunities.filter(opp => opp.deal_temperature === 'hot').slice(0, 5);
    const staleDeals = safeOpportunities.filter(opp => {
      const daysSinceActivity = opp.last_activity 
        ? Math.floor((Date.now() - new Date(opp.last_activity).getTime()) / (1000 * 60 * 60 * 24))
        : 30;
      return daysSinceActivity > 14;
    }).slice(0, 5);

    return {
      total_value: totalValue,
      weighted_value: weightedValue,
      conversion_rate: safeOpportunities.length > 0 ? (weightedValue / totalValue) * 100 : 0,
      average_deal_size: safeOpportunities.length > 0 ? totalValue / safeOpportunities.length : 0,
      cycle_time: 45, // Mock data
      win_rate: 23.5, // Mock data
      pipeline_velocity: 1.2, // Mock data
      deals_this_month: opportunities.length,
      revenue_forecast: weightedValue,
      deals_won_this_month: 8, // Mock data
      deals_lost_this_month: 3, // Mock data
      average_deal_age: 23, // Mock data
      hottest_deals: hotDeals,
      stale_deals: staleDeals,
    };
  }, [opportunities]);

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    let filtered = Array.isArray(opportunities) ? opportunities : [];

    // Apply search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(search) ||
        (opp.contact?.name || '').toLowerCase().includes(search) ||
        opp.company?.toLowerCase().includes(search)
      );
    }

    // Apply other filters
    if (filters.priority.length > 0) {
      filtered = filtered.filter(opp => filters.priority.includes(opp.priority || 'medium'));
    }

    if (filters.temperature.length > 0) {
      filtered = filtered.filter(opp => filters.temperature.includes(opp.deal_temperature || 'warm'));
    }

    // Sort opportunities
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (viewMode.sortBy) {
        case 'value':
          comparison = a.expected_value - b.expected_value;
          break;
        case 'probability':
          comparison = a.probability - b.probability;
          break;
        case 'date':
          comparison = new Date(a.expected_close_date).getTime() - new Date(b.expected_close_date).getTime();
          break;
        case 'activity':
          const aActivity = a.last_activity ? new Date(a.last_activity).getTime() : 0;
          const bActivity = b.last_activity ? new Date(b.last_activity).getTime() : 0;
          comparison = aActivity - bActivity;
          break;
      }
      return viewMode.sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [opportunities, filters, viewMode]);

  // Handle deal movement
  const handleDrop = useCallback(async (dealId: number, newStageId: number) => {
    try {
      // Update deal stage via API
      await PipelineApiService.moveDeal(dealId, newStageId);
      
      // Update local state
      setOpportunities(prev => prev.map(opp => 
        opp.id === dealId 
          ? { ...opp, sales_pipeline_stage_id: newStageId }
          : opp
      ));

      // Notify collaboration system
      if (moveDeal) {
        const safeOpportunities = Array.isArray(opportunities) ? opportunities : [];
        moveDeal(dealId, safeOpportunities.find(o => o.id === dealId)?.sales_pipeline_stage_id || 0, newStageId);
      }
    } catch (error) {
      console.error('Failed to move deal:', error);
      // Could show error toast here
    }
  }, [opportunities, moveDeal]);

  // Handle deal editing
  const handleEditDeal = useCallback((deal: EnhancedOpportunity) => {
    setEditingDeal(deal);
    setShowEditDealModal(true);
  }, []);

  // Handle deal deletion
  const handleDeleteDeal = useCallback(async (deal: EnhancedOpportunity) => {
    try {
      // Optimistic update - remove from UI immediately
      setOpportunities(prev => prev.filter(opp => opp.id !== deal.id));
      
      // Call API to delete
      await PipelineApiService.deleteDeal(deal.id);
      
      // Show success notification (you can add a toast notification here)
      console.log(`✅ Deal "${deal.title}" deleted successfully`);
    } catch (error) {
      console.error('❌ Failed to delete deal:', error);
      
      // Revert the optimistic update on error
      // Re-fetch to ensure data consistency
      const response: any = await PipelineApiService.getDeals();
      if (response.success && response.data?.data) {
        const transformedData = response.data.data.map(transformDealData);
        setOpportunities(transformedData);
      }
      
      // Show error notification (you can add a toast notification here)
      alert('Failed to delete deal. Please try again.');
    }
  }, []);

  // Handle deal updated callback
  const handleDealUpdated = useCallback((updatedDeal: any) => {
    const transformedDeal = transformDealData(updatedDeal);
    setOpportunities(prev => 
      prev.map(opp => opp.id === transformedDeal.id ? transformedDeal : opp)
    );
    setShowEditDealModal(false);
    setEditingDeal(null);
  }, []);

  // Handle adding new deal
  const handleAddDeal = useCallback((stageId: number) => {
    setAddDealStageId(stageId);
    setShowAddDealModal(true);
  }, []);

  // Handle AI insights for deal
  const handleShowAIInsights = useCallback((deal: EnhancedOpportunity) => {
    setSelectedDealForAI(deal);
    setShowAIInsights(true);
  }, []);

  // Handle deal added callback
  const handleDealAdded = useCallback((newDeal: any) => {
    // Transform the new deal to ensure numeric fields are numbers
    const transformedDeal = transformDealData(newDeal);
    setOpportunities(prev => [...prev, transformedDeal]);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-gray-600">Loading your pipeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
            <button
              onClick={() => setShowInfoModal(true)}
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Pipeline Guide"
            >
              <InformationCircleIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{filteredOpportunities.length} deals</span>
              <span>•</span>
              <span>{formatCurrency(analytics.total_value)} total (UGX)</span>
              <span>•</span>
              <span>{formatCurrency(analytics.weighted_value)} weighted</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time Collaboration Status */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <WifiSolidIcon className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiIcon className="w-4 h-4 text-gray-400" />
                )}
                <span className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-gray-500'}`}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              <OnlineUsers users={collaborationState.online_users} />
              
              <ActivityFeed
                activities={collaborationState.recent_activities}
                isOpen={showActivityFeed}
                onToggle={() => setShowActivityFeed(!showActivityFeed)}
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode(prev => ({ ...prev, type: 'kanban' }))}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode.type === 'kanban' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode(prev => ({ ...prev, type: 'list' }))}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode.type === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode(prev => ({ ...prev, type: 'analytics' }))}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode.type === 'analytics' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChartBarIcon className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowAnalyticsDashboard(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <ChartBarSolidIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Analytics</span>
            </button>

            <button
              onClick={() => setShowSmartAutomation(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-all shadow-sm hover:shadow-md"
            >
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm font-medium">AI Automation</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <FunnelIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>

            <button 
              onClick={() => handleAddDeal(1)}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="text-sm font-medium">New Deal</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-4 grid grid-cols-6 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Pipeline Value</p>
                <p className="text-blue-900 text-lg font-bold">{formatCurrency(analytics.total_value)}</p>
              </div>
              <CurrencyDollarIcon className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Weighted Value</p>
                <p className="text-green-900 text-lg font-bold">{formatCurrency(analytics.weighted_value)}</p>
              </div>
              <TrophyIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Win Rate</p>
                <p className="text-purple-900 text-lg font-bold">{analytics.win_rate}%</p>
              </div>
              <StarSolidIcon className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Avg Deal Size</p>
                <p className="text-orange-900 text-lg font-bold">{formatCurrency(analytics.average_deal_size)}</p>
              </div>
              <ChartBarIcon className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-red-100 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Hot Deals</p>
                <p className="text-red-900 text-lg font-bold">{analytics.hottest_deals.length}</p>
              </div>
              <FireSolidIcon className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">Cycle Time</p>
                <p className="text-indigo-900 text-lg font-bold">{analytics.cycle_time}d</p>
              </div>
              <ClockIcon className="w-8 h-8 text-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-gray-200 px-6 py-4 overflow-hidden"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search deals, contacts, companies..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              
              <select
                value={viewMode.sortBy}
                onChange={(e) => setViewMode(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="value">Sort by Value</option>
                <option value="probability">Sort by Probability</option>
                <option value="date">Sort by Close Date</option>
                <option value="activity">Sort by Activity</option>
              </select>

              <select
                value={viewMode.density}
                onChange={(e) => setViewMode(prev => ({ ...prev, density: e.target.value as any }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode.type === 'kanban' && (
          <div className="h-full p-6">
            <div className="flex space-x-6 h-full overflow-x-auto">
              {Array.isArray(stages) ? stages.map((stage) => (
                <PipelineColumn
                  key={stage.id}
                  stage={stage}
                  opportunities={Array.isArray(filteredOpportunities) ? filteredOpportunities.filter(opp => opp.sales_pipeline_stage_id === stage.id) : []}
                  viewMode={viewMode}
                  onDrop={handleDrop}
                  onEditDeal={handleEditDeal}
                  onDeleteDeal={handleDeleteDeal}
                  onAddDeal={handleAddDeal}
                  collaborationState={collaborationState}
                  viewDeal={viewDeal}
                  stopViewingDeal={stopViewingDeal}
                  draggingDeal={draggingDeal}
                  setDraggingDeal={setDraggingDeal}
                />
              )) : null}
            </div>
          </div>
        )}

        {viewMode.type === 'list' && (
          <div className="p-6">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-600">
                  <div className="col-span-3">Deal</div>
                  <div className="col-span-2">Contact</div>
                  <div className="col-span-1">Value</div>
                  <div className="col-span-1">Probability</div>
                  <div className="col-span-2">Stage</div>
                  <div className="col-span-2">Close Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {Array.isArray(filteredOpportunities) ? filteredOpportunities.map((opportunity) => (
                  <div key={opportunity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            opportunity.priority === 'urgent' ? 'bg-red-500' :
                            opportunity.priority === 'high' ? 'bg-orange-500' :
                            opportunity.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <p className="font-semibold text-gray-900">{opportunity.title}</p>
                            <p className="text-sm text-gray-500">{opportunity.company}</p>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">{opportunity.contact?.name || 'Unknown Contact'}</p>
                        <p className="text-xs text-gray-500">{opportunity.email}</p>
                      </div>
                      <div className="col-span-1">
                        <p className="font-semibold text-gray-900">{formatCurrency(opportunity.expected_value)}</p>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{ width: `${opportunity.probability}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{opportunity.probability}%</span>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {Array.isArray(stages) ? stages.find(s => s.id === opportunity.sales_pipeline_stage_id)?.name : 'Unknown Stage'}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">{new Date(opportunity.expected_close_date).toLocaleDateString()}</p>
                      </div>
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditDeal(opportunity)}
                            className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
                            title="View Details"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Call"
                          >
                            <PhoneIcon className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Email"
                          >
                            <EnvelopeIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete "${opportunity.title}"?`)) {
                                handleDeleteDeal(opportunity);
                              }
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Deal"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )) : null}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Analytics Dashboard */}
      <AdvancedAnalyticsDashboard
        isOpen={showAnalyticsDashboard}
        onClose={() => setShowAnalyticsDashboard(false)}
      />

      {/* Smart Automation */}
      <SmartAutomation
        isOpen={showSmartAutomation}
        onClose={() => setShowSmartAutomation(false)}
        opportunities={opportunities}
      />

      {/* Pipeline Info Modal */}
      <PipelineInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />

      {/* Add Deal Modal */}
      <AddDealModal
        isOpen={showAddDealModal}
        onClose={() => setShowAddDealModal(false)}
        stageId={addDealStageId}
        onDealAdded={handleDealAdded}
      />

      {/* Edit Deal Modal */}
      {editingDeal && (
        <EditDealModal
          isOpen={showEditDealModal}
          onClose={() => {
            setShowEditDealModal(false);
            setEditingDeal(null);
          }}
          deal={editingDeal}
          onDealUpdated={handleDealUpdated}
        />
      )}

      {/* AI Insights Panel */}
      {selectedDealForAI && (
        <AIInsightsPanel
          dealId={selectedDealForAI.id}
          dealData={selectedDealForAI}
          isOpen={showAIInsights}
          onClose={() => {
            setShowAIInsights(false);
            setSelectedDealForAI(null);
          }}
        />
      )}

      {/* Deal Creation Debugger */}
      <DealDebugger />
    </div>
  );
};

export default AdvancedPipeline;