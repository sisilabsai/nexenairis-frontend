'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// Mock data generators
const generateAutomationRules = (): AutomationRule[] => [
  {
    id: '1',
    name: 'New Lead Welcome Sequence',
    description: 'Automatically send welcome email and create follow-up tasks for new leads',
    trigger: {
      type: 'deal_created',
      conditions: { stage: 'prospecting' }
    },
    actions: [
      { type: 'send_email', config: { template: 'welcome_email', delay: 0 } },
      { type: 'schedule_task', config: { task: 'Initial qualification call', delay: 24, assignee: 'auto' } },
      { type: 'create_activity', config: { type: 'note', content: 'Lead added to nurturing sequence' } }
    ],
    is_active: true,
    created_at: '2024-09-15',
    last_executed: '2024-10-07T09:30:00Z',
    execution_count: 247,
    success_rate: 94.3
  },
  {
    id: '2',
    name: 'Stalled Deal Revival',
    description: 'Identify and re-engage deals that have been inactive for 14+ days',
    trigger: {
      type: 'inactivity',
      conditions: { days: 14, exclude_stages: ['closed_won', 'closed_lost'] }
    },
    actions: [
      { type: 'send_notification', config: { recipient: 'deal_owner', message: 'Deal requires attention' } },
      { type: 'schedule_task', config: { task: 'Re-engagement call', priority: 'high' } },
      { type: 'update_field', config: { field: 'temperature', value: 'cold' } }
    ],
    is_active: true,
    created_at: '2024-08-20',
    last_executed: '2024-10-06T14:20:00Z',
    execution_count: 89,
    success_rate: 78.9
  },
  {
    id: '3',
    name: 'High-Value Deal Escalation',
    description: 'Automatically notify management for deals over $50k in negotiation stage',
    trigger: {
      type: 'stage_changed',
      conditions: { to_stage: 'negotiation', min_value: 50000 }
    },
    actions: [
      { type: 'send_notification', config: { recipient: 'sales_manager', priority: 'urgent' } },
      { type: 'assign_user', config: { role: 'senior_sales_rep', as: 'support' } },
      { type: 'create_activity', config: { type: 'meeting', subject: 'High-value deal strategy session' } }
    ],
    is_active: true,
    created_at: '2024-07-10',
    last_executed: '2024-10-05T16:45:00Z',
    execution_count: 34,
    success_rate: 91.2
  },
  {
    id: '4',
    name: 'Smart Lead Scoring Update',
    description: 'Continuously update lead scores based on engagement and behavioral data',
    trigger: {
      type: 'activity_detected',
      conditions: { activities: ['email_opened', 'link_clicked', 'document_viewed', 'meeting_attended'] }
    },
    actions: [
      { type: 'score_update', config: { algorithm: 'ml_enhanced', weight_recent: true } },
      { type: 'update_field', config: { field: 'engagement_level', value: 'dynamic' } }
    ],
    is_active: true,
    created_at: '2024-09-01',
    last_executed: '2024-10-07T11:15:00Z',
    execution_count: 1247,
    success_rate: 96.8
  }
];

const generateLeadScores = (): LeadScore[] => [
  {
    deal_id: 1,
    deal_title: 'Enterprise Software License - TechCorp',
    current_score: 87,
    previous_score: 82,
    score_factors: [
      { factor: 'Company Size', impact: 15, reason: '500+ employees indicate strong buying power' },
      { factor: 'Budget Confirmed', impact: 20, reason: 'Explicit budget discussion in last meeting' },
      { factor: 'Decision Timeline', impact: 12, reason: 'Q4 implementation deadline creates urgency' },
      { factor: 'Stakeholder Engagement', impact: 18, reason: 'C-level involvement signals serious intent' },
      { factor: 'Competition Risk', impact: -8, reason: 'Competitor mentioned in recent conversation' }
    ],
    predicted_outcome: 'win',
    confidence: 89,
    recommended_actions: [
      'Schedule executive presentation',
      'Prepare competitive differentiation material',
      'Confirm implementation timeline requirements'
    ]
  },
  {
    deal_id: 2,
    deal_title: 'Cloud Migration - StartupXYZ',
    current_score: 34,
    previous_score: 45,
    score_factors: [
      { factor: 'Response Rate', impact: -15, reason: 'Delayed responses to recent communications' },
      { factor: 'Budget Uncertainty', impact: -12, reason: 'No clear budget discussion yet' },
      { factor: 'Technical Fit', impact: 8, reason: 'Product demo received positive feedback' },
      { factor: 'Urgency Level', impact: -8, reason: 'No clear timeline established' },
      { factor: 'Decision Process', impact: -7, reason: 'Multiple stakeholders not yet identified' }
    ],
    predicted_outcome: 'stalled',
    confidence: 72,
    recommended_actions: [
      'Re-engage with discovery questions',
      'Identify additional stakeholders',
      'Clarify budget and timeline',
      'Offer pilot program or trial'
    ]
  },
  {
    deal_id: 3,
    deal_title: 'Marketing Automation - RetailCo',
    current_score: 92,
    previous_score: 89,
    score_factors: [
      { factor: 'Pain Point Alignment', impact: 25, reason: 'Strong match between needs and solution' },
      { factor: 'Champion Identified', impact: 18, reason: 'Strong internal advocate driving process' },
      { factor: 'Legal Review', impact: 10, reason: 'Contract under legal review (positive signal)' },
      { factor: 'Implementation Ready', impact: 15, reason: 'Technical team prepared for deployment' },
      { factor: 'Reference Success', impact: 8, reason: 'Positive reference call completed' }
    ],
    predicted_outcome: 'win',
    confidence: 94,
    recommended_actions: [
      'Prepare contract finalization',
      'Schedule implementation kick-off',
      'Identify upsell opportunities'
    ]
  }
];

const generateAutomationInsights = (): AutomationInsight[] => [
  {
    id: '1',
    type: 'opportunity',
    title: 'AI Lead Scoring Improvement',
    description: 'Machine learning model suggests 23% improvement in lead qualification accuracy with additional data points',
    impact: 'high',
    action_required: true,
    data: { potential_improvement: 23, confidence: 89, implementation_effort: 'medium' },
    created_at: '2024-10-07T08:00:00Z'
  },
  {
    id: '2',
    type: 'performance',
    title: 'Automation Rule Success',
    description: 'New Lead Welcome Sequence showing 94% success rate with 15% increase in qualified leads',
    impact: 'high',
    action_required: false,
    data: { success_rate: 94, improvement: 15, deals_affected: 247 },
    created_at: '2024-10-07T07:30:00Z'
  },
  {
    id: '3',
    type: 'risk',
    title: 'Deal Stagnation Alert',
    description: '12 high-value deals have been inactive for 14+ days, potential revenue at risk: $450K',
    impact: 'high',
    action_required: true,
    data: { deals_count: 12, revenue_at_risk: 450000, average_days_inactive: 18 },
    created_at: '2024-10-07T06:45:00Z'
  },
  {
    id: '4',
    type: 'prediction',
    title: 'Monthly Forecast Adjustment',
    description: 'AI model predicts 8% increase in monthly close rate based on current pipeline activity',
    impact: 'medium',
    action_required: false,
    data: { predicted_increase: 8, confidence: 76, factors: ['increased_activity', 'better_qualification'] },
    created_at: '2024-10-07T06:00:00Z'
  }
];

const generateWorkflowTemplates = (): WorkflowTemplate[] => [
  {
    id: '1',
    name: 'Enterprise Lead Nurturing',
    description: 'Comprehensive nurturing sequence for enterprise prospects with personalized touchpoints',
    category: 'lead_nurturing',
    steps: [
      { name: 'Welcome & Resource Share', type: 'email', delay: 0, config: { template: 'enterprise_welcome' } },
      { name: 'Discovery Call Scheduling', type: 'task', delay: 24, config: { priority: 'high' } },
      { name: 'Industry-Specific Case Study', type: 'email', delay: 72, config: { personalized: true } },
      { name: 'Technical Demo Scheduling', type: 'call', delay: 168, config: { duration: 60 } },
      { name: 'Follow-up & Next Steps', type: 'task', delay: 192, config: { assignee: 'account_executive' } }
    ],
    success_rate: 68.5,
    usage_count: 89
  },
  {
    id: '2',
    name: 'Fast-Track SMB Conversion',
    description: 'Accelerated sales process for small to medium business prospects',
    category: 'deal_progression',
    steps: [
      { name: 'Qualification Call', type: 'call', delay: 2, config: { duration: 30 } },
      { name: 'Product Demo', type: 'meeting', delay: 48, config: { demo_type: 'standard' } },
      { name: 'Proposal Generation', type: 'task', delay: 72, config: { auto_generate: true } },
      { name: 'Follow-up & Objection Handling', type: 'call', delay: 120, config: { script: 'objection_handling' } },
      { name: 'Contract Finalization', type: 'task', delay: 168, config: { legal_review: false } }
    ],
    success_rate: 74.2,
    usage_count: 156
  },
  {
    id: '3',
    name: 'Post-Demo Engagement',
    description: 'Maintain momentum after product demonstration with strategic follow-ups',
    category: 'follow_up',
    steps: [
      { name: 'Demo Recap Email', type: 'email', delay: 4, config: { include_recording: true } },
      { name: 'ROI Calculator Share', type: 'email', delay: 24, config: { personalized_data: true } },
      { name: 'Reference Customer Introduction', type: 'task', delay: 72, config: { match_industry: true } },
      { name: 'Implementation Planning Call', type: 'meeting', delay: 120, config: { technical_team: true } }
    ],
    success_rate: 82.1,
    usage_count: 203
  }
];

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
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'scoring' | 'insights' | 'workflows'>('rules');
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);
  const [leadScores, setLeadScores] = useState<LeadScore[]>([]);
  const [insights, setInsights] = useState<AutomationInsight[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      // Simulate API calls
      setTimeout(() => {
        setAutomationRules(generateAutomationRules());
        setLeadScores(generateLeadScores());
        setInsights(generateAutomationInsights());
        setWorkflows(generateWorkflowTemplates());
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen]);

  const handleToggleRule = useCallback((ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
      )
    );
  }, []);

  const handleEditRule = useCallback((rule: AutomationRule) => {
    // TODO: Open rule editor modal
    console.log('Edit rule:', rule);
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
                      <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                        <PlusIcon className="w-4 h-4" />
                        <span>New Rule</span>
                      </button>
                    </div>
                    
                    <div className="grid gap-6">
                      {automationRules.map((rule) => (
                        <AutomationRuleCard
                          key={rule.id}
                          rule={rule}
                          onToggle={handleToggleRule}
                          onEdit={handleEditRule}
                        />
                      ))}
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
                      {leadScores.map((score) => (
                        <LeadScoreCard key={score.deal_id} score={score} />
                      ))}
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
                        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
                          <SparklesIcon className="w-4 h-4" />
                          <span>Generate Insights</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4">
                      {insights.map((insight) => (
                        <AutomationInsightCard key={insight.id} insight={insight} />
                      ))}
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
                      {workflows.map((workflow) => (
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
                      ))}
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