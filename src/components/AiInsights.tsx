'use client';

import React from 'react';
import {
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { Radar } from 'react-chartjs-2';

interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  confidence: number;
  timeframe: string;
  recommendation?: string;
}

interface FinancialHealthScore {
  overall_score: number;
  liquidity_score: number;
  profitability_score: number;
  efficiency_score: number;
  growth_score: number;
  risk_score: number;
}

interface AiInsightsProps {
  aiInsights: AIInsight[];
  financialHealthScore: FinancialHealthScore;
}

const AiInsights: React.FC<AiInsightsProps> = ({ aiInsights, financialHealthScore }) => {
  const healthScoreRadarData = {
    labels: ['Liquidity', 'Profitability', 'Efficiency', 'Growth', 'Risk Management'],
    datasets: [
      {
        label: 'Financial Health',
        data: [
          financialHealthScore.liquidity_score,
          financialHealthScore.profitability_score,
          financialHealthScore.efficiency_score,
          financialHealthScore.growth_score,
          financialHealthScore.risk_score,
        ],
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(99, 102, 241)',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <SparklesIcon className="h-8 w-8 mr-3" />
              AI Financial Insights
            </h2>
            <p className="text-purple-100 mt-2">
              Powered by machine learning to identify patterns, opportunities, and risks
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{aiInsights.length}</div>
            <div className="text-purple-200 text-sm">Total Insights</div>
          </div>
        </div>
      </div>

      {/* Financial Health Score */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ShieldCheckIcon className="h-5 w-5 mr-2 text-green-500" />
          Financial Health Score
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circular Progress Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: 'Overall', value: financialHealthScore.overall_score, color: 'bg-blue-500' },
              { label: 'Liquidity', value: financialHealthScore.liquidity_score, color: 'bg-green-500' },
              { label: 'Profitability', value: financialHealthScore.profitability_score, color: 'bg-yellow-500' },
              { label: 'Efficiency', value: financialHealthScore.efficiency_score, color: 'bg-purple-500' },
              { label: 'Growth', value: financialHealthScore.growth_score, color: 'bg-indigo-500' },
              { label: 'Risk', value: financialHealthScore.risk_score, color: 'bg-red-500' },
            ].map((score) => (
              <div key={score.label} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={score.color.replace('bg-', '#')}
                      strokeWidth="2"
                      strokeDasharray={`${score.value}, 100`}
                      className={score.color}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">{score.value}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600">{score.label}</div>
              </div>
            ))}
          </div>

          {/* Radar Chart */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-3 text-center">Financial Health Radar</h4>
            <div className="h-64">
              <Radar data={healthScoreRadarData} options={radarOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiInsights.map((insight) => (
          <div
            key={insight.id}
            className={`bg-white rounded-lg shadow-md border-l-4 p-6 ${
              insight.type === 'opportunity'
                ? 'border-green-500'
                : insight.type === 'warning'
                ? 'border-red-500'
                : insight.type === 'success'
                ? 'border-blue-500'
                : 'border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  {insight.type === 'opportunity' && <LightBulbIcon className="h-5 w-5 text-green-500 mr-2" />}
                  {insight.type === 'warning' && <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />}
                  {insight.type === 'success' && <CheckCircleIcon className="h-5 w-5 text-blue-500 mr-2" />}
                  {insight.type === 'info' && <CheckCircleIcon className="h-5 w-5 text-gray-500 mr-2" />}
                  <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                </div>
                <p className="text-gray-600 mb-3">{insight.description}</p>
                {insight.recommendation && (
                  <div className="bg-gray-50 rounded-md p-3 mb-3">
                    <p className="text-sm text-gray-700">
                      <strong>Recommendation:</strong> {insight.recommendation}
                    </p>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      insight.impact === 'high'
                        ? 'bg-red-100 text-red-800'
                        : insight.impact === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {insight.impact.toUpperCase()} IMPACT
                  </span>
                  <span>Confidence: {insight.confidence}%</span>
                </div>
              </div>
              {insight.actionable && (
                <button className="ml-4 px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">
                  Take Action
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiInsights;
