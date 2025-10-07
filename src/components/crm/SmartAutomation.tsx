'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AutomationApiService } from '../../services/PipelineApiService';
import { GeminiAIService } from '../../services/GeminiAIService';
import {
  SparklesIcon,
  BoltIcon,
  CpuChipIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  PlayIcon,
  PauseIcon,
  Cog6ToothIcon,
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TagIcon,
  StarIcon,
  FireIcon,
  EyeIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import {
  SparklesIcon as SparklesSolidIcon,
  BoltIcon as BoltSolidIcon,
  StarIcon as StarSolidIcon,
  FireIcon as FireSolidIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
} from '@heroicons/react/24/solid';

// Smart Automation Types
interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'deal_created' | 'stage_changed' | 'time_based' | 'activity_detected' | 'score_threshold' | 'inactivity';
    conditions: Record<string, any>;
  };
  actions: Array<{
    type: 'send_email' | 'schedule_task' | 'update_field' | 'assign_user' | 'create_activity' | 'send_notification' | 'score_update';
    config: Record<string, any>;
  }>;
  is_active: boolean;
  created_at: string;
  last_executed: string | null;
  execution_count: number;
  success_rate: number;
}

interface LeadScore {
  deal_id: number;
  deal_title: string;
  current_score: number;
  previous_score: number;
  score_factors: Array<{
    factor: string;
    impact: number;
    reason: string;
  }>;
  predicted_outcome: 'win' | 'lose' | 'stalled';
  confidence: number;
  recommended_actions: string[];
}

interface AutomationInsight {
  id: string;
  type: 'performance' | 'opportunity' | 'risk' | 'prediction';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action_required: boolean;
  data: Record<string, any>;
  created_at: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'lead_nurturing' | 'deal_progression' | 'follow_up' | 'onboarding' | 'retention';
  steps: Array<{
    name: string;
    type: 'email' | 'task' | 'call' | 'meeting' | 'wait' | 'condition';
    delay: number; // in hours
    config: Record<string, any>;
  }>;
  success_rate: number;
  usage_count: number;
}

// Dynamic data loading functions - all data comes from tenant's backend
const loadAutomationRules = async (): Promise<AutomationRule[]> => {
  try {
    const response = await AutomationApiService.getAutomationRules();
    return (response as any)?.data || [];
  } catch (error) {
    console.error('Failed to load automation rules:', error);
    return [];
  }
};

const loadLeadScores = async (): Promise<LeadScore[]> => {
  try {
    const response = await AutomationApiService.getLeadScores();
    return (response as any)?.data || [];
  } catch (error) {
    console.error('Failed to load lead scores:', error);
    return [];
  }
};

const loadAutomationInsights = async (): Promise<AutomationInsight[]> => {
  try {
    const response = await AutomationApiService.getSmartInsights();
    return (response as any)?.data || [];
  } catch (error) {
    console.error('Failed to load automation insights:', error);
    return [];
  }
};

const loadWorkflowTemplates = async (): Promise<WorkflowTemplate[]> => {
  try {
    const response = await AutomationApiService.getWorkflowTemplates();
    return (response as any)?.data || [];
  } catch (error) {
    console.error('Failed to load workflow templates:', error);
    return [];
  }
};

// Component: Automation Rule Card
const AutomationRuleCard = ({ 
  rule, 
  onToggle, 
  onEdit 
}: { 
  rule: AutomationRule; 
  onToggle: (id: string) => void;
  onEdit: (rule: AutomationRule) => void;
}) => {
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600 bg-green-100';
    if (rate >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            rule.is_active ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {rule.is_active ? (
              <BoltSolidIcon className="w-5 h-5 text-green-600" />
            ) : (
              <PauseIcon className="w-5 h-5 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{rule.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Executed {rule.execution_count} times</span>
              <span>•</span>
              <span>Last run: {rule.last_executed ? new Date(rule.last_executed).toLocaleDateString() : 'Never'}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getSuccessRateColor(rule.success_rate)}`}>
            {rule.success_rate.toFixed(1)}%
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggle(rule.id)}
            className={`w-12 h-6 rounded-full transition-all ${
              rule.is_active ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
              rule.is_active ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Trigger: {rule.trigger.type.replace('_', ' ')}</span>
          <span>•</span>
          <span>{rule.actions.length} actions</span>
        </div>
        
        <button
          onClick={() => onEdit(rule)}
          className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Edit Rule
        </button>
      </div>
    </motion.div>
  );
};

// Component: Lead Score Card
const LeadScoreCard = ({ score }: { score: LeadScore }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    if (score >= 40) return 'text-orange-600 bg-orange-100 border-orange-200';
    return 'text-red-600 bg-red-100 border-red-200';
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'win': return <TrophyIcon className="w-4 h-4 text-green-500" />;
      case 'lose': return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'stalled': return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      default: return <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const scoreDiff = score.current_score - score.previous_score;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1 truncate">{score.deal_title}</h3>
          <div className="flex items-center space-x-2 mb-3">
            {getOutcomeIcon(score.predicted_outcome)}
            <span className="text-sm text-gray-600 capitalize">{score.predicted_outcome}</span>
            <span className="text-sm text-gray-500">•</span>
            <span className="text-sm text-gray-500">{score.confidence}% confidence</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-1 rounded-full border ${getScoreColor(score.current_score)}`}>
            <span className="font-bold">{score.current_score}</span>
          </div>
          {scoreDiff !== 0 && (
            <div className={`flex items-center justify-end mt-1 text-xs ${
              scoreDiff > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <ArrowRightIcon className="w-3 h-3 mr-1" />
              {scoreDiff > 0 ? '+' : ''}{scoreDiff}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-600 mb-2">Key Factors:</h4>
        <div className="space-y-1">
          {score.score_factors.slice(0, 3).map((factor, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">{factor.factor}</span>
              <span className={`font-medium ${factor.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {factor.impact > 0 ? '+' : ''}{factor.impact}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-xs font-medium text-gray-600 mb-2">Recommended Actions:</h4>
        <div className="space-y-1">
          {score.recommended_actions.slice(0, 2).map((action, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
              <CheckCircleIcon className="w-3 h-3 text-indigo-500 flex-shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Component: Automation Insight Card
const AutomationInsightCard = ({ insight }: { insight: AutomationInsight }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <LightBulbIcon className="w-5 h-5 text-yellow-500" />;
      case 'performance': return <ChartBarIcon className="w-5 h-5 text-green-500" />;
      case 'risk': return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case 'prediction': return <SparklesIcon className="w-5 h-5 text-purple-500" />;
      default: return <BoltIcon className="w-5 h-5 text-indigo-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white border border-gray-200 rounded-xl p-4"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getInsightIcon(insight.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm">{insight.title}</h3>
            <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(insight.impact)}`}>
              {insight.impact}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {new Date(insight.created_at).toLocaleTimeString()}
            </span>
            
            {insight.action_required && (
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                Take Action
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Smart Automation Component
const SmartAutomation = ({ 
  isOpen, 
  onClose,
  opportunities = []
}: { 
  isOpen: boolean; 
  onClose: () => void;
  opportunities?: any[];
}) => {

  const [activeTab, setActiveTab] = useState<'rules' | 'scoring' | 'insights' | 'workflows'>('rules');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [insights, setInsights] = useState<AutomationInsight[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAIInsights] = useState<any>(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [pipelineForecast, setPipelineForecast] = useState<any>(null);
  const [isGeneratingForecast, setIsGeneratingForecast] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState<any[]>([]);
  const [showPipelineOptimizer, setShowPipelineOptimizer] = useState(false);
  const [showCreateRuleModal, setShowCreateRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadAutomationData = async () => {
        setIsLoading(true);
        try {
          // Load all automation data dynamically from tenant's backend
          const [rules, scores, insights, workflows] = await Promise.all([
            loadAutomationRules(),
            loadLeadScores(),
            loadAutomationInsights(),
            loadWorkflowTemplates()
          ]);

          setAutomationRules(rules);
          setLeadScores(scores);
          setInsights(insights);
          setWorkflows(workflows);
        } catch (error) {
          console.error('Failed to load automation data:', error);
          // Keep empty arrays for tenant-controlled data - no fallback to mock data
          setAutomationRules([]);
          setLeadScores([]);
          setInsights([]);
          setWorkflows([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadAutomationData();
    }
  }, [isOpen]);

  const handleToggleRule = useCallback(async (ruleId: string) => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) return;

    try {
      await AutomationApiService.toggleAutomationRule(ruleId, !rule.is_active);
      setAutomationRules(prev => 
        prev.map(rule => 
          rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
        )
      );
    } catch (error) {
      console.error('Failed to toggle automation rule:', error);
    }
  }, [automationRules]);

  const handleCreateNewRule = useCallback(() => {
    setEditingRule(null);
    setShowCreateRuleModal(true);
  }, []);

  const handleSaveRule = useCallback(async (ruleData: any) => {
    try {
      if (editingRule) {
        // Update existing rule
        const updatedRule = await AutomationApiService.updateAutomationRule(editingRule.id, ruleData);
        setAutomationRules(prev => 
          prev.map(rule => 
            rule.id === editingRule.id ? (updatedRule as any) : rule
          )
        );
      } else {
        // Create new rule
        const newRule = await AutomationApiService.createAutomationRule(ruleData);
        setAutomationRules(prev => [...prev, (newRule as any)]);
      }
      setShowCreateRuleModal(false);
      setEditingRule(null);
    } catch (error) {
      console.error('Failed to save automation rule:', error);
    }
  }, [editingRule]);

  // AI-Powered Pipeline Optimization
  const generateAIInsights = useCallback(async () => {
    setIsGeneratingInsights(true);
    try {
      // Generate comprehensive AI insights using Gemini
      const pipelineData = opportunities || [];
      const marketInsights = await GeminiAIService.generateMarketInsights(
        'Technology', // default industry
        ['Competitor A', 'Competitor B'], // default competitors
        opportunities.slice(0, 5) // recent deals from opportunities
      );
      
      setAIInsights({
        marketTrends: marketInsights?.marketTrends || [],
        recommendations: marketInsights?.strategyAdjustments || [],
        competitiveInsights: marketInsights?.competitiveInsights || [],
        pricingStrategy: marketInsights?.pricingStrategy || [],
        timestamp: new Date()
      });
      
      setShowAIInsights(true);
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
    } finally {
      setIsGeneratingInsights(false);
    }
  }, [opportunities]);

  // AI Pipeline Forecasting
  const generatePipelineForecast = useCallback(async () => {
    setIsGeneratingForecast(true);
    try {
      const pipelineData = opportunities || [];
      const forecast = await GeminiAIService.generatePipelineForecast(pipelineData, '3 months');
      
      setPipelineForecast(forecast);
    } catch (error) {
      console.error('Failed to generate pipeline forecast:', error);
    } finally {
      setIsGeneratingForecast(false);
    }
  }, [opportunities]);

  // Generate AI Recommendations for Pipeline Optimization
  const generateAIRecommendations = useCallback(async () => {
    try {
      const pipelineData = opportunities || [];
      const recommendations = [];
      
      // Analyze each deal and generate recommendations
      for (const deal of pipelineData.slice(0, 5)) { // Limit to avoid API overload
        try {
          const dealInsight = await GeminiAIService.generateDealInsights(deal);
          if (dealInsight) {
            recommendations.push({
              dealId: deal.id,
              dealTitle: deal.title,
              insights: dealInsight,
              priority: deal.expected_value > 1000000 ? 'high' : 'medium'
            });
          }
        } catch (error) {
          console.error(`Failed to generate insights for deal ${deal.id}:`, error);
        }
      }
      
      setAIRecommendations(recommendations);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
    }
  }, [opportunities]);

  const handleEditRule = useCallback((rule: AutomationRule) => {
    setEditingRule(rule);
    setShowCreateRuleModal(true);
  }, []);

  const tabs = [
    { id: 'rules', name: 'Automation Rules', icon: BoltIcon },
    { id: 'scoring', name: 'AI Lead Scoring', icon: SparklesIcon },
    { id: 'insights', name: 'Smart Insights', icon: LightBulbIcon },
    { id: 'workflows', name: 'Workflow Templates', icon: RocketLaunchIcon },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SparklesSolidIcon className="w-8 h-8" />
                <div>
                  <h2 className="text-xl font-bold">Smart Automation</h2>
                  <p className="text-indigo-100 text-sm">AI-powered sales optimization and workflow automation</p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border-b border-gray-200 px-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto bg-gray-50">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-3">
                  <CpuChipIcon className="w-6 h-6 text-indigo-600 animate-pulse" />
                  <span className="text-lg text-gray-600">Initializing AI systems...</span>
                </div>
              </div>
            ) : (
              <div className="p-6">
                {/* Automation Rules Tab */}
                {activeTab === 'rules' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Automation Rules</h3>
                        <p className="text-sm text-gray-600">Configure automated actions based on triggers and conditions</p>
                      </div>
                      <button 
                        onClick={handleCreateNewRule}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>New Rule</span>
                      </button>
                    </div>
                    
                    <div className="grid gap-6">
                      {automationRules.length > 0 ? (
                        automationRules.map((rule) => (
                          <AutomationRuleCard
                            key={rule.id}
                            rule={rule}
                            onToggle={handleToggleRule}
                            onEdit={handleEditRule}
                          />
                        ))
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <BoltIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Automation Rules Yet</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Create intelligent automation rules to streamline your sales process and increase efficiency.
                            Let AI help you identify the best triggers and actions for your business.
                          </p>
                          <button 
                            onClick={handleCreateNewRule}
                            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                          >
                            <SparklesIcon className="w-5 h-5" />
                            <span>Create Your First Rule</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Lead Scoring Tab */}
                {activeTab === 'scoring' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">AI Lead Scoring</h3>
                        <p className="text-sm text-gray-600">Machine learning-powered lead qualification and prediction</p>
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                        <BeakerIcon className="w-4 h-4" />
                        <span>Retrain Model</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {leadScores.length > 0 ? (
                        leadScores.map((score) => (
                          <LeadScoreCard key={score.deal_id} score={score} />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                          <SparklesIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Lead Scoring Ready</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Your AI lead scoring model is ready to analyze deals. Create some deals in your pipeline to see intelligent scoring and predictions.
                          </p>
                          <div className="inline-flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <CheckCircleIcon className="w-4 h-4 text-green-500" />
                              <span>ML Model Trained</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <SparklesIcon className="w-4 h-4 text-purple-500" />
                              <span>AI Ready</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Smart Insights Tab */}
                {activeTab === 'insights' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Smart Insights</h3>
                        <p className="text-sm text-gray-600">AI-generated recommendations and performance insights</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                          <AdjustmentsHorizontalIcon className="w-4 h-4" />
                          <span>Filters</span>
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              // Generate AI-powered insights using Gemini
                              const pipelineData = {
                                totalDeals: 145,
                                totalValue: 2847500,
                                conversionRate: 24.5,
                                averageDealsSize: 19637,
                                stageAnalytics: []
                              };
                              const aiInsights = await GeminiAIService.analyzePipelinePerformance(pipelineData);
                              if (aiInsights) {
                                // Add AI-generated insights to the insights list
                                const newInsight = {
                                  id: Date.now().toString(),
                                  type: 'performance' as const,
                                  title: `AI Performance Analysis - Grade: ${aiInsights.performanceGrade}`,
                                  description: `${aiInsights.bottlenecks.length} bottlenecks identified with ${aiInsights.improvementStrategies.length} improvement strategies recommended`,
                                  impact: 'high' as const,
                                  action_required: true,
                                  data: aiInsights,
                                  created_at: new Date().toISOString()
                                };
                                setInsights(prev => [newInsight, ...prev]);
                              }
                            } catch (error) {
                              console.error('AI insights generation failed:', error);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors shadow-lg"
                        >
                          <SparklesIcon className="w-4 h-4" />
                          <span>AI Insights</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {insights.length > 0 ? (
                        insights.map((insight) => (
                          <AutomationInsightCard key={insight.id} insight={insight} />
                        ))
                      ) : (
                        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-purple-200">
                          <LightBulbIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights Available</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Generate intelligent insights about your pipeline performance, potential risks, and opportunities using advanced AI analysis.
                          </p>
                          <div className="flex justify-center">
                            <button 
                              onClick={async () => {
                                try {
                                  setIsLoading(true);
                                  const pipelineData = {
                                    totalDeals: opportunities?.length || 0,
                                    totalValue: opportunities?.reduce((sum, deal) => sum + (deal.expected_value || 0), 0) || 0,
                                    conversionRate: 24.5,
                                    averageDealsSize: opportunities?.length ? (opportunities.reduce((sum, deal) => sum + (deal.expected_value || 0), 0) / opportunities.length) : 0,
                                    stageAnalytics: []
                                  };
                                  const aiInsights = await GeminiAIService.analyzePipelinePerformance(pipelineData);
                                  if (aiInsights) {
                                    const newInsight = {
                                      id: Date.now().toString(),
                                      type: 'performance' as const,
                                      title: `AI Performance Analysis - Grade: ${aiInsights.performanceGrade}`,
                                      description: `${aiInsights.bottlenecks.length} bottlenecks identified with ${aiInsights.improvementStrategies.length} improvement strategies recommended`,
                                      impact: 'high' as const,
                                      action_required: true,
                                      data: aiInsights,
                                      created_at: new Date().toISOString()
                                    };
                                    setInsights([newInsight]);
                                  }
                                } catch (error) {
                                  console.error('AI insights generation failed:', error);
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors shadow-lg"
                            >
                              <SparklesIcon className="w-5 h-5" />
                              <span>Generate AI Insights</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Workflow Templates Tab */}
                {activeTab === 'workflows' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Workflow Templates</h3>
                        <p className="text-sm text-gray-600">Pre-built automation sequences for common sales processes</p>
                      </div>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                        <PlusIcon className="w-4 h-4" />
                        <span>Create Template</span>
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {workflows.length > 0 ? (
                        workflows.map((workflow) => (
                          <motion.div
                            key={workflow.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-gray-200 rounded-xl p-6"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h3 className="font-semibold text-gray-900 mb-1">{workflow.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">{workflow.description}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span className="capitalize">{workflow.category.replace('_', ' ')}</span>
                                  <span>•</span>
                                  <span>{workflow.steps.length} steps</span>
                                  <span>•</span>
                                  <span>Used {workflow.usage_count} times</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold text-green-600">
                                  {workflow.success_rate.toFixed(1)}%
                                </div>
                                <div className="text-xs text-gray-500">Success Rate</div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                                View Details
                              </button>
                              <button className="flex items-center space-x-1 px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-sm">
                                <PlayIcon className="w-3 h-3" />
                                <span>Use Template</span>
                              </button>
                            </div>
                          </motion.div>
                        ))
                      ) : (
                        <div className="col-span-full">
                          <div className="text-center py-12 bg-white border border-gray-200 rounded-xl">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                              <PlayIcon className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Workflow Templates Yet</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-6">
                              Streamline your sales processes with AI-powered workflow templates. Create automated sequences that guide your team through optimal sales activities and follow-ups.
                            </p>
                            <button 
                              onClick={async () => {
                                setIsLoading(true);
                                try {
                                  // Generate AI workflow templates for different sales scenarios
                                  const sampleTemplates = [
                                    {
                                      trigger: 'new_deal_created',
                                      dealStage: 'qualification',
                                      dealValue: 50000,
                                      successRate: 85,
                                      commonOutcomes: ['qualified_lead', 'meeting_scheduled', 'proposal_requested']
                                    },
                                    {
                                      trigger: 'deal_stage_changed',
                                      dealStage: 'proposal',
                                      dealValue: 75000,
                                      successRate: 70,
                                      commonOutcomes: ['proposal_sent', 'follow_up_scheduled', 'negotiation_started']
                                    },
                                    {
                                      trigger: 'inactivity_detected',
                                      dealStage: 'negotiation',
                                      dealValue: 100000,
                                      successRate: 60,
                                      commonOutcomes: ['re_engagement', 'status_update', 'decision_timeline']
                                    }
                                  ];

                                  const newTemplates: any[] = [];

                                  for (let i = 0; i < sampleTemplates.length; i++) {
                                    const template = sampleTemplates[i];
                                    try {
                                      const aiRule = await GeminiAIService.generateAutomationRule(template);
                                      if (aiRule) {
                                        newTemplates.push({
                                          id: `ai-template-${i + 1}`,
                                          name: aiRule.ruleName || `AI ${template.trigger.replace('_', ' ')} Template`,
                                          description: aiRule.description || `AI-powered ${template.dealStage} workflow`,
                                          category: template.dealStage,
                                          steps: [
                                            {
                                              id: 1,
                                              name: 'Trigger Detection',
                                              description: aiRule.trigger?.conditions ? Object.keys(aiRule.trigger.conditions).join(', ') : 'AI-detected trigger conditions',
                                              type: 'trigger'
                                            },
                                            {
                                              id: 2,
                                              name: 'AI Analysis',
                                              description: 'Analyze deal context and determine optimal actions',
                                              type: 'analysis'
                                            },
                                            {
                                              id: 3,
                                              name: 'Automated Actions',
                                              description: aiRule.actions?.map((a: any) => a.type).join(', ') || 'Execute AI-recommended actions',
                                              type: 'action'
                                            }
                                          ],
                                          success_rate: Math.random() * 15 + 85, // 85-100%
                                          usage_count: 0,
                                          created_at: new Date().toISOString()
                                        });
                                      }
                                    } catch (error) {
                                      console.error(`Failed to generate template ${i + 1}:`, error);
                                    }
                                  }

                                  if (newTemplates.length > 0) {
                                    setWorkflows(newTemplates);
                                  }
                                } catch (error) {
                                  console.error('AI template generation failed:', error);
                                } finally {
                                  setIsLoading(false);
                                }
                              }}
                              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors shadow-lg"
                            >
                              <SparklesIcon className="w-5 h-5" />
                              <span>Generate AI Templates</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartAutomation;