'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ClockIcon,
  UserGroupIcon,
  TrophyIcon,
  FireIcon,
  BoltIcon,
  EyeIcon,
  FunnelIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  DocumentChartBarIcon,
  PresentationChartBarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  ChartBarIcon as ChartBarSolidIcon,
  ArrowTrendingUpIcon as ArrowTrendingUpSolidIcon,
  TrophyIcon as TrophySolidIcon,
  FireIcon as FireSolidIcon,
} from '@heroicons/react/24/solid';

// Analytics Types
interface AnalyticsData {
  pipeline_metrics: {
    total_deals: number;
    total_value: number;
    weighted_value: number;
    average_deal_size: number;
    conversion_rate: number;
    win_rate: number;
    average_sales_cycle: number;
    velocity: number;
  };
  stage_analytics: Array<{
    stage_id: number;
    stage_name: string;
    deal_count: number;
    total_value: number;
    average_deal_size: number;
    conversion_rate: number;
    average_time_in_stage: number;
    drop_off_rate: number;
    color: string;
  }>;
  time_series: Array<{
    date: string;
    deals_created: number;
    deals_won: number;
    deals_lost: number;
    revenue: number;
    pipeline_value: number;
  }>;
  forecasting: {
    monthly_forecast: Array<{
      month: string;
      predicted_revenue: number;
      confidence_level: number;
      deals_expected: number;
    }>;
    quarterly_targets: {
      q1: { target: number; current: number; probability: number };
      q2: { target: number; current: number; probability: number };
      q3: { target: number; current: number; probability: number };
      q4: { target: number; current: number; probability: number };
    };
  };
  performance_metrics: {
    top_performers: Array<{
      user_id: number;
      name: string;
      deals_closed: number;
      revenue_generated: number;
      win_rate: number;
      average_deal_size: number;
    }>;
    activity_metrics: {
      calls_made: number;
      emails_sent: number;
      meetings_scheduled: number;
      proposals_sent: number;
    };
  };
  predictive_insights: {
    deal_health_scores: Array<{
      deal_id: number;
      deal_title: string;
      health_score: number;
      risk_factors: string[];
      recommendations: string[];
    }>;
    churn_predictions: Array<{
      deal_id: number;
      churn_probability: number;
      days_since_last_activity: number;
      recommended_actions: string[];
    }>;
  };
}

// Mock analytics data generator
const generateAnalyticsData = (): AnalyticsData => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
  
  return {
    pipeline_metrics: {
      total_deals: 145,
      total_value: 2847500,
      weighted_value: 1423750,
      average_deal_size: 19637,
      conversion_rate: 24.5,
      win_rate: 67.8,
      average_sales_cycle: 34,
      velocity: 83750,
    },
    stage_analytics: [
      {
        stage_id: 1,
        stage_name: 'Prospecting',
        deal_count: 45,
        total_value: 883500,
        average_deal_size: 19633,
        conversion_rate: 31.1,
        average_time_in_stage: 7,
        drop_off_rate: 15.2,
        color: '#6B7280',
      },
      {
        stage_id: 2,
        stage_name: 'Qualified',
        deal_count: 32,
        total_value: 628000,
        average_deal_size: 19625,
        conversion_rate: 46.9,
        average_time_in_stage: 12,
        drop_off_rate: 12.5,
        color: '#3B82F6',
      },
      {
        stage_id: 3,
        stage_name: 'Proposal',
        deal_count: 28,
        total_value: 549600,
        average_deal_size: 19628,
        conversion_rate: 64.3,
        average_time_in_stage: 8,
        drop_off_rate: 8.9,
        color: '#F59E0B',
      },
      {
        stage_id: 4,
        stage_name: 'Negotiation',
        deal_count: 23,
        total_value: 451400,
        average_deal_size: 19626,
        conversion_rate: 82.6,
        average_time_in_stage: 6,
        drop_off_rate: 4.3,
        color: '#EF4444',
      },
      {
        stage_id: 5,
        stage_name: 'Closed Won',
        deal_count: 17,
        total_value: 335000,
        average_deal_size: 19706,
        conversion_rate: 100,
        average_time_in_stage: 1,
        drop_off_rate: 0,
        color: '#10B981',
      },
    ],
    time_series: Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        deals_created: Math.floor(Math.random() * 8) + 2,
        deals_won: Math.floor(Math.random() * 3) + 1,
        deals_lost: Math.floor(Math.random() * 2),
        revenue: Math.floor(Math.random() * 50000) + 10000,
        pipeline_value: Math.floor(Math.random() * 100000) + 50000,
      };
    }),
    forecasting: {
      monthly_forecast: Array.from({ length: 6 }, (_, i) => {
        const month = new Date(now.getFullYear(), now.getMonth() + i, 1);
        return {
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          predicted_revenue: Math.floor(Math.random() * 200000) + 150000,
          confidence_level: Math.floor(Math.random() * 30) + 70,
          deals_expected: Math.floor(Math.random() * 15) + 8,
        };
      }),
      quarterly_targets: {
        q1: { target: 500000, current: 425000, probability: 85 },
        q2: { target: 600000, current: 380000, probability: 73 },
        q3: { target: 650000, current: 180000, probability: 65 },
        q4: { target: 700000, current: 50000, probability: 58 },
      },
    },
    performance_metrics: {
      top_performers: [
        { user_id: 1, name: 'Sarah Johnson', deals_closed: 12, revenue_generated: 245000, win_rate: 78.3, average_deal_size: 20417 },
        { user_id: 2, name: 'Mike Chen', deals_closed: 9, revenue_generated: 198000, win_rate: 72.0, average_deal_size: 22000 },
        { user_id: 3, name: 'Emily Rodriguez', deals_closed: 8, revenue_generated: 176000, win_rate: 69.6, average_deal_size: 22000 },
        { user_id: 4, name: 'David Kim', deals_closed: 7, revenue_generated: 154000, win_rate: 63.6, average_deal_size: 22000 },
      ],
      activity_metrics: {
        calls_made: 1247,
        emails_sent: 3891,
        meetings_scheduled: 342,
        proposals_sent: 128,
      },
    },
    predictive_insights: {
      deal_health_scores: [
        {
          deal_id: 1,
          deal_title: 'Enterprise Software License - TechCorp',
          health_score: 85,
          risk_factors: ['No recent activity', 'Budget concerns mentioned'],
          recommendations: ['Schedule follow-up call', 'Send pricing alternatives'],
        },
        {
          deal_id: 2,
          deal_title: 'Cloud Migration - StartupXYZ',
          health_score: 42,
          risk_factors: ['Multiple stakeholders', 'Delayed timeline', 'Competitor evaluation'],
          recommendations: ['Multi-stakeholder presentation', 'Competitive analysis', 'Timeline reassessment'],
        },
        {
          deal_id: 3,
          deal_title: 'Marketing Automation - RetailCo',
          health_score: 92,
          risk_factors: [],
          recommendations: ['Prepare contract', 'Schedule signing meeting'],
        },
      ],
      churn_predictions: [
        {
          deal_id: 4,
          churn_probability: 78,
          days_since_last_activity: 14,
          recommended_actions: ['Immediate outreach', 'Value proposition reinforcement', 'Stakeholder meeting'],
        },
        {
          deal_id: 5,
          churn_probability: 45,
          days_since_last_activity: 7,
          recommended_actions: ['Check-in call', 'Demo refresh'],
        },
      ],
    },
  };
};

// Metric Card Component
const MetricCard = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  subtitle,
  color = 'indigo',
}: {
  title: string;
  value: string;
  change?: number;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  color?: string;
}) => {
  const colorClasses = {
    indigo: 'bg-indigo-500 text-indigo-100',
    green: 'bg-green-500 text-green-100',
    blue: 'bg-blue-500 text-blue-100',
    yellow: 'bg-yellow-500 text-yellow-100',
    red: 'bg-red-500 text-red-100',
    purple: 'bg-purple-500 text-purple-100',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' && <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />}
              {trend === 'down' && <ArrowTrendingDownIcon className="w-4 h-4 text-red-500 mr-1" />}
              <span className={`text-xs font-medium ${
                trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {change > 0 ? '+' : ''}{change}%
              </span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
};

// Pipeline Funnel Chart
const PipelineFunnel = ({ stages }: { stages: AnalyticsData['stage_analytics'] }) => {
  const maxValue = Math.max(...stages.map(s => s.total_value));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Pipeline Funnel</h3>
        <FunnelIcon className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const width = (stage.total_value / maxValue) * 100;
          return (
            <motion.div
              key={stage.stage_id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{stage.stage_name}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{stage.deal_count} deals</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${(stage.total_value / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
              
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="h-full rounded-lg"
                  style={{ backgroundColor: stage.color }}
                />
                
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-xs font-medium text-white mix-blend-difference">
                    {stage.conversion_rate.toFixed(1)}% conversion
                  </span>
                  <span className="text-xs font-medium text-white mix-blend-difference">
                    {stage.average_time_in_stage}d avg
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// Revenue Forecast Chart
const RevenueForecast = ({ forecast }: { forecast: AnalyticsData['forecasting']['monthly_forecast'] }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Forecast</h3>
        <PresentationChartBarIcon className="w-5 h-5 text-gray-500" />
      </div>
      
      <div className="space-y-4">
        {forecast.map((month, index) => (
          <motion.div
            key={month.month}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="font-medium text-gray-900">{month.month}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  ${(month.predicted_revenue / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-gray-500">{month.deals_expected} deals</p>
              </div>
              
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${
                  month.confidence_level >= 80 ? 'bg-green-500' :
                  month.confidence_level >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-600">{month.confidence_level}%</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Top Performers Component
const TopPerformers = ({ performers }: { performers: AnalyticsData['performance_metrics']['top_performers'] }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        <TrophySolidIcon className="w-5 h-5 text-yellow-500" />
      </div>
      
      <div className="space-y-4">
        {performers.map((performer, index) => (
          <motion.div
            key={performer.user_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                index === 0 ? 'bg-yellow-500' :
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-amber-600' : 'bg-indigo-500'
              }`}>
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{performer.name}</p>
                <p className="text-xs text-gray-500">{performer.deals_closed} deals closed</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                ${(performer.revenue_generated / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">{performer.win_rate.toFixed(1)}% win rate</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Deal Health Insights
const DealHealthInsights = ({ insights }: { insights: AnalyticsData['predictive_insights']['deal_health_scores'] }) => {
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getHealthTextColor = (score: number) => {
    if (score >= 80) return 'text-green-700';
    if (score >= 60) return 'text-yellow-700';
    if (score >= 40) return 'text-orange-700';
    return 'text-red-700';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Deal Health Insights</h3>
        <SparklesIcon className="w-5 h-5 text-purple-500" />
      </div>
      
      <div className="space-y-4">
        {insights.map((deal, index) => (
          <motion.div
            key={deal.deal_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900 truncate pr-4">{deal.deal_title}</h4>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getHealthColor(deal.health_score)}`} />
                <span className={`text-sm font-semibold ${getHealthTextColor(deal.health_score)}`}>
                  {deal.health_score}%
                </span>
              </div>
            </div>
            
            {deal.risk_factors.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Risk Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {deal.risk_factors.map((factor, i) => (
                    <span key={i} className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">Recommendations:</p>
              <div className="flex flex-wrap gap-1">
                {deal.recommendations.map((rec, i) => (
                  <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {rec}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Dashboard Component
const AdvancedAnalyticsDashboard = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    if (isOpen) {
      // Simulate API call
      setIsLoading(true);
      setTimeout(() => {
        setAnalyticsData(generateAnalyticsData());
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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
          className="bg-gray-100 rounded-2xl w-full max-w-7xl h-full max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <ChartBarSolidIcon className="w-8 h-8 text-indigo-600" />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Advanced Analytics</h2>
                <p className="text-sm text-gray-600">Comprehensive pipeline insights and forecasting</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-3">
                  <ArrowPathIcon className="w-6 h-6 text-indigo-600 animate-spin" />
                  <span className="text-lg text-gray-600">Loading analytics...</span>
                </div>
              </div>
            ) : analyticsData && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <MetricCard
                    title="Total Pipeline Value"
                    value={formatCurrency(analyticsData.pipeline_metrics.total_value)}
                    change={12.5}
                    trend="up"
                    icon={CurrencyDollarIcon}
                    color="green"
                  />
                  <MetricCard
                    title="Weighted Pipeline"
                    value={formatCurrency(analyticsData.pipeline_metrics.weighted_value)}
                    change={8.3}
                    trend="up"
                    icon={ChartBarIcon}
                    color="blue"
                  />
                  <MetricCard
                    title="Conversion Rate"
                    value={`${analyticsData.pipeline_metrics.conversion_rate}%`}
                    change={-2.1}
                    trend="down"
                    icon={FunnelIcon}
                    color="yellow"
                  />
                  <MetricCard
                    title="Sales Velocity"
                    value={formatCurrency(analyticsData.pipeline_metrics.velocity)}
                    subtitle="per day"
                    change={15.7}
                    trend="up"
                    icon={BoltIcon}
                    color="purple"
                  />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PipelineFunnel stages={analyticsData.stage_analytics} />
                  <RevenueForecast forecast={analyticsData.forecasting.monthly_forecast} />
                </div>

                {/* Performance and Insights */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TopPerformers performers={analyticsData.performance_metrics.top_performers} />
                  <DealHealthInsights insights={analyticsData.predictive_insights.deal_health_scores} />
                </div>

                {/* Additional Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <MetricCard
                    title="Average Deal Size"
                    value={formatCurrency(analyticsData.pipeline_metrics.average_deal_size)}
                    change={5.2}
                    trend="up"
                    icon={TrophyIcon}
                    color="indigo"
                  />
                  <MetricCard
                    title="Sales Cycle"
                    value={`${analyticsData.pipeline_metrics.average_sales_cycle} days`}
                    change={-8.5}
                    trend="up"
                    icon={ClockIcon}
                    color="green"
                  />
                  <MetricCard
                    title="Win Rate"
                    value={`${analyticsData.pipeline_metrics.win_rate}%`}
                    change={3.4}
                    trend="up"
                    icon={TrophySolidIcon}
                    color="yellow"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AdvancedAnalyticsDashboard;