'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SparklesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  ClockIcon,
  FireIcon,
  EyeIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { GeminiAIService } from '../../services/GeminiAIService';
import { PipelineApiService } from '../../services/PipelineApiService';

interface AIInsightsPanelProps {
  dealId: number;
  dealData: any;
  isOpen: boolean;
  onClose: () => void;
}

interface AIInsight {
  type: 'score' | 'risk' | 'forecast' | 'recommendation' | 'competitive' | 'communication';
  title: string;
  content: any;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ 
  dealId, 
  dealData, 
  isOpen, 
  onClose 
}) => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    if (isOpen && dealId) {
      loadAIInsights();
    }
  }, [isOpen, dealId]);

  const loadAIInsights = async () => {
    setLoading(true);
    const newInsights: AIInsight[] = [];

    try {
      // Load AI Deal Score
      const scoreData = await GeminiAIService.calculateAIDealScore(dealData);
      if (scoreData) {
        newInsights.push({
          type: 'score',
          title: 'AI Deal Health Score',
          content: scoreData,
          priority: scoreData.overallScore < 50 ? 'high' : scoreData.overallScore < 75 ? 'medium' : 'low',
          timestamp: new Date(),
        });
      }

      // Load Risk Assessment
      const riskData = await GeminiAIService.assessDealRisk(dealData);
      if (riskData) {
        newInsights.push({
          type: 'risk',
          title: 'Risk Assessment',
          content: riskData,
          priority: riskData.overallRisk === 'High' ? 'high' : riskData.overallRisk === 'Medium' ? 'medium' : 'low',
          timestamp: new Date(),
        });
      }

      // Load Communication Optimization
      const commData = await GeminiAIService.optimizeCommunication(dealData, 'email');
      if (commData) {
        newInsights.push({
          type: 'communication',
          title: 'Communication Strategy',
          content: commData,
          priority: 'medium',
          timestamp: new Date(),
        });
      }

      // Load Competitive Analysis
      const compData = await GeminiAIService.analyzeCompetition(dealData);
      if (compData) {
        newInsights.push({
          type: 'competitive',
          title: 'Competitive Intelligence',
          content: compData,
          priority: compData.competitivePosition === 'Weak' ? 'high' : 'medium',
          timestamp: new Date(),
        });
      }

      // Load General Recommendations
      const dealInsights = await GeminiAIService.generateDealInsights(dealData);
      if (dealInsights) {
        newInsights.push({
          type: 'recommendation',
          title: 'AI Recommendations',
          content: dealInsights,
          priority: 'medium',
          timestamp: new Date(),
        });
      }

      setInsights(newInsights);
    } catch (error) {
      console.error('Failed to load AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatUGX = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInsightIcon = (type: string) => {
    const icons = {
      score: ChartBarIcon,
      risk: ExclamationTriangleIcon,
      forecast: ArrowTrendingUpIcon,
      recommendation: LightBulbIcon,
      competitive: TrophyIcon,
      communication: ChatBubbleBottomCenterTextIcon,
    };
    return icons[type as keyof typeof icons] || SparklesIcon;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'text-red-600 bg-red-50 border-red-200',
      medium: 'text-orange-600 bg-orange-50 border-orange-200',
      low: 'text-green-600 bg-green-50 border-green-200',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: EyeIcon },
    { id: 'score', name: 'AI Score', icon: ChartBarIcon },
    { id: 'risk', name: 'Risk Analysis', icon: ExclamationTriangleIcon },
    { id: 'recommendations', name: 'Recommendations', icon: LightBulbIcon },
    { id: 'competitive', name: 'Competition', icon: TrophyIcon },
    { id: 'communication', name: 'Communication', icon: ChatBubbleBottomCenterTextIcon },
  ];

  const renderScoreInsight = (insight: AIInsight) => {
    const data = insight.content;
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            data.overallScore >= 75 ? 'bg-green-100 text-green-600' :
            data.overallScore >= 50 ? 'bg-orange-100 text-orange-600' :
            'bg-red-100 text-red-600'
          }`}>
            <span className="text-2xl font-bold">{data.overallScore}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">Overall Deal Health</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900">Win Probability</p>
            <p className="text-lg font-bold text-blue-600">{data.winProbability}%</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm font-medium text-green-900">Value Score</p>
            <p className="text-lg font-bold text-green-600">{data.valueScore}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <p className="text-sm font-medium text-purple-900">Engagement</p>
            <p className="text-lg font-bold text-purple-600">{data.engagementScore}</p>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-900">Cultural Fit</p>
            <p className="text-lg font-bold text-orange-600">{data.culturalFit}</p>
          </div>
        </div>

        {data.reasoning && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
            <p className="text-sm text-gray-700">{data.reasoning}</p>
          </div>
        )}

        {data.recommendations && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
            <ul className="space-y-2">
              {data.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <SparklesIcon className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderRiskInsight = (insight: AIInsight) => {
    const data = insight.content;
    return (
      <div className="space-y-4">
        <div className={`p-4 rounded-lg border ${
          data.overallRisk === 'High' ? 'bg-red-50 border-red-200' :
          data.overallRisk === 'Medium' ? 'bg-orange-50 border-orange-200' :
          'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className={`w-5 h-5 ${
              data.overallRisk === 'High' ? 'text-red-500' :
              data.overallRisk === 'Medium' ? 'text-orange-500' :
              'text-green-500'
            }`} />
            <span className="font-medium">Overall Risk: {data.overallRisk}</span>
          </div>
        </div>

        {data.riskFactors && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Risk Factors</h4>
            {data.riskFactors.map((risk: any, index: number) => (
              <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(risk.level.toLowerCase())}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{risk.category}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(risk.level.toLowerCase())}`}>
                    {risk.level}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{risk.description}</p>
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Mitigation: </span>
                  <span className="text-gray-700">{risk.mitigation}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {data.criticalActions && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Critical Actions Required</h4>
            <ul className="space-y-2">
              {data.criticalActions.map((action: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <FireIcon className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    return (
      <div className="space-y-6">
        {/* Deal Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">Deal Overview</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Value</p>
              <p className="font-semibold text-lg">{formatUGX(dealData.expected_value)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Probability</p>
              <p className="font-semibold text-lg">{dealData.probability}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Stage</p>
              <p className="font-semibold">{dealData.stage}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Temperature</p>
              <p className={`font-semibold capitalize ${
                dealData.deal_temperature === 'hot' ? 'text-red-600' :
                dealData.deal_temperature === 'warm' ? 'text-orange-600' :
                'text-blue-600'
              }`}>
                {dealData.deal_temperature}
              </p>
            </div>
          </div>
        </div>

        {/* AI Insights Summary */}
        <div className="grid grid-cols-1 gap-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${getPriorityColor(insight.priority)} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => setActiveTab(insight.type)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm opacity-75">
                      Click to view detailed {insight.type} analysis
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">AI Insights</h2>
                <p className="text-indigo-100">{dealData.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 bg-indigo-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Analyzing with AI...</p>
                </div>
              </div>
            ) : (
              <div>
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'score' && insights.find(i => i.type === 'score') && 
                  renderScoreInsight(insights.find(i => i.type === 'score')!)}
                {activeTab === 'risk' && insights.find(i => i.type === 'risk') && 
                  renderRiskInsight(insights.find(i => i.type === 'risk')!)}
                {/* Add more tab content renderers as needed */}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIInsightsPanel;