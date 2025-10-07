'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  BoltIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

import DashboardLayout from '../../../components/DashboardLayout';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdvancedPipeline from '../../../components/crm/AdvancedPipeline';
import { MobileStageView, MobileOptimizedDeal, MobileStage } from '../../../components/crm/MobileOptimizedPipeline';
import { useSalesOpportunities, useSalesPipelineStages } from '../../../hooks/useApi';

// Hook to detect mobile device
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return isMobile;
};

// Data transformation functions for mobile view
const transformOpportunityToMobileDeal = (opportunity: any): MobileOptimizedDeal => {
  return {
    id: opportunity.id,
    title: opportunity.title || `${opportunity.company} - ${opportunity.contact?.name || 'Unknown Contact'}`,
    contact: { name: opportunity.contact?.name || 'Unknown Contact' },
    company: opportunity.company || 'Unknown Company',
    expected_value: opportunity.expected_value || 0,
    currency: 'UGX', // Uganda Shillings for East African market
    probability: opportunity.probability || 0,
    expected_close_date: opportunity.expected_close_date || new Date().toISOString(),
    priority: opportunity.priority || 'medium',
    deal_temperature: opportunity.deal_temperature || 'warm',
    health_score: opportunity.health_score || 50,
    last_activity: opportunity.last_activity || new Date().toISOString(),
    next_action: opportunity.next_action || 'Follow up',
    phone: opportunity.contact?.phone || '+256-XXX-XXXXXX',
    email: opportunity.contact?.email || 'contact@company.com',
    sales_pipeline_stage_id: opportunity.sales_pipeline_stage_id || 1,
  };
};

const transformStagesToMobileStages = (stages: any[], opportunities: any[]): MobileStage[] => {
  return stages.map(stage => {
    const stageDeals = opportunities.filter(opp => opp.sales_pipeline_stage_id === stage.id);
    const totalValue = stageDeals.reduce((sum, deal) => sum + (deal.expected_value || 0), 0);
    
    return {
      id: stage.id,
      name: stage.name,
      color: stage.color || '#6B7280',
      deals_count: stageDeals.length,
      total_value: totalValue,
    };
  });
};

// Mobile Pipeline Component
const MobilePipeline = () => {
  const [deals, setDeals] = useState<MobileOptimizedDeal[]>([]);
  const [stages, setStages] = useState<MobileStage[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Fetch real data from API
  const { data: opportunitiesData, isLoading: opportunitiesLoading, error: opportunitiesError } = useSalesOpportunities();
  const { data: stagesData, isLoading: stagesLoading, error: stagesError } = useSalesPipelineStages();

  const isLoading = opportunitiesLoading || stagesLoading;
  const hasError = opportunitiesError || stagesError;

  useEffect(() => {
    if (opportunitiesData && stagesData) {
      // Transform API data to mobile format
      const opportunities = Array.isArray(opportunitiesData?.data) ? opportunitiesData.data : 
                           Array.isArray(opportunitiesData) ? opportunitiesData : [];
      const pipelineStages = Array.isArray(stagesData?.data) ? stagesData.data : 
                            Array.isArray(stagesData) ? stagesData : [];
      
      const transformedDeals = opportunities.map(transformOpportunityToMobileDeal);
      const transformedStages = transformStagesToMobileStages(pipelineStages, opportunities);
      
      setDeals(transformedDeals);
      setStages(transformedStages);
    }
  }, [opportunitiesData, stagesData]);

  const handleStageChange = useCallback((index: number) => {
    setCurrentStageIndex(index);
  }, []);

  const handleEditDeal = useCallback((deal: MobileOptimizedDeal) => {
    console.log('Edit deal:', deal);
    // Handle deal editing
  }, []);

  const handleSwipeAction = useCallback((deal: MobileOptimizedDeal, action: 'call' | 'email' | 'edit') => {
    switch (action) {
      case 'call':
        window.open(`tel:${deal.phone}`, '_self');
        break;
      case 'email':
        window.open(`mailto:${deal.email}`, '_self');
        break;
      case 'edit':
        handleEditDeal(deal);
        break;
    }
  }, [handleEditDeal]);

  const handleAddDeal = useCallback((stageId: number) => {
    console.log('Add deal to stage:', stageId);
    // Handle adding new deal
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading Pipeline</h2>
            <p className="text-gray-600">Preparing your deals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Pipeline</h2>
          <p className="text-gray-600 mb-4">Unable to load your deals. Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50">
      <MobileStageView
        stages={stages}
        deals={deals}
        currentStageIndex={currentStageIndex}
        onStageChange={handleStageChange}
        onEditDeal={handleEditDeal}
        onSwipeAction={handleSwipeAction}
        onAddDeal={handleAddDeal}
      />
    </div>
  );
};

// Device Toggle Component for Desktop
const DeviceToggle = ({ 
  isMobileView, 
  onToggle 
}: { 
  isMobileView: boolean; 
  onToggle: (mobile: boolean) => void; 
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
      <div className="flex items-center space-x-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggle(false)}
          className={`p-2 rounded-lg transition-colors ${
            !isMobileView ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Desktop View"
        >
          <ComputerDesktopIcon className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => onToggle(true)}
          className={`p-2 rounded-lg transition-colors ${
            isMobileView ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'
          }`}
          title="Mobile View"
        >
          <DevicePhoneMobileIcon className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
};

// Welcome Animation Component
const WelcomeAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center z-50"
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.8 }}
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div className="relative">
            <SparklesIcon className="w-24 h-24 text-yellow-400 mx-auto animate-pulse" />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0"
            >
              <BoltIcon className="w-24 h-24 text-white opacity-30 mx-auto" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-4xl font-bold text-white mb-4"
        >
          Advanced Pipeline
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-xl text-indigo-200 mb-8"
        >
          Where deals come to life ✨
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center justify-center space-x-4 text-white"
        >
          <ChartBarIcon className="w-6 h-6" />
          <span className="text-lg">AI-Powered • Mobile-First • Real-Time</span>
          <Cog6ToothIcon className="w-6 h-6 animate-spin" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Main Pipeline Page Component
const NextGenPipelinePage = () => {
  const isMobile = useIsMobile();
  const [showWelcome, setShowWelcome] = useState(true);
  const [forceDesktopView, setForceDesktopView] = useState(false);
  const [forceMobileView, setForceMobileView] = useState(false);

  const handleDeviceToggle = useCallback((mobile: boolean) => {
    if (mobile) {
      setForceMobileView(true);
      setForceDesktopView(false);
    } else {
      setForceDesktopView(true);
      setForceMobileView(false);
    }
  }, []);

  const shouldShowMobile = forceMobileView || (isMobile && !forceDesktopView);

  return (
    <ProtectedRoute>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeAnimation onComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <>
          {!shouldShowMobile && (
            <>
              <DeviceToggle 
                isMobileView={forceMobileView} 
                onToggle={handleDeviceToggle} 
              />
              <DashboardLayout>
                <AdvancedPipeline />
              </DashboardLayout>
            </>
          )}

          {shouldShowMobile && (
            <>
              {!isMobile && (
                <DeviceToggle 
                  isMobileView={true} 
                  onToggle={handleDeviceToggle} 
                />
              )}
              <MobilePipeline />
            </>
          )}
        </>
      )}
    </ProtectedRoute>
  );
};

export default NextGenPipelinePage;
