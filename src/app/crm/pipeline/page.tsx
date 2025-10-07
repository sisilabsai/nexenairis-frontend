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

// Mock data for mobile version
const generateMobileDeals = (): MobileOptimizedDeal[] => {
  const companies = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Future Systems'];
  const contacts = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Alex Rodriguez'];
  const priorities = ['low', 'medium', 'high', 'urgent'] as const;
  const temperatures = ['cold', 'warm', 'hot'] as const;

  return Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Deal ${i + 1} - ${companies[i % companies.length]}`,
    contact: { name: contacts[i % contacts.length] },
    company: companies[i % companies.length],
    expected_value: Math.floor(Math.random() * 500000) + 10000,
    currency: 'USD',
    probability: Math.floor(Math.random() * 100),
    expected_close_date: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString(),
    priority: priorities[i % priorities.length],
    deal_temperature: temperatures[i % temperatures.length],
    health_score: Math.floor(Math.random() * 100),
    last_activity: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    next_action: ['Follow up call', 'Send proposal', 'Schedule demo'][i % 3],
    phone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    email: `${contacts[i % contacts.length].toLowerCase().replace(' ', '.')}@${companies[i % companies.length].toLowerCase().replace(' ', '')}.com`,
    sales_pipeline_stage_id: (i % 5) + 1,
  }));
};

const generateMobileStages = (): MobileStage[] => [
  { id: 1, name: 'Leads', color: '#6B7280', deals_count: 5, total_value: 150000 },
  { id: 2, name: 'Qualified', color: '#3B82F6', deals_count: 4, total_value: 320000 },
  { id: 3, name: 'Proposal', color: '#F59E0B', deals_count: 3, total_value: 280000 },
  { id: 4, name: 'Negotiation', color: '#EF4444', deals_count: 2, total_value: 450000 },
  { id: 5, name: 'Closed Won', color: '#10B981', deals_count: 6, total_value: 890000 },
];

// Mobile Pipeline Component
const MobilePipeline = () => {
  const [deals, setDeals] = useState<MobileOptimizedDeal[]>([]);
  const [stages, setStages] = useState<MobileStage[]>([]);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setDeals(generateMobileDeals());
      setStages(generateMobileStages());
      setIsLoading(false);
    };

    loadData();
  }, []);

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
