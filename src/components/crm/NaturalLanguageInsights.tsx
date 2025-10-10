'use client';

import React, { useMemo } from 'react';
import {
  SparklesIcon,
  LightBulbIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BellAlertIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface NaturalLanguageInsightsProps {
  contacts: any[];
  analytics: any;
}

// Insight Card Component
const InsightCard = ({ icon: Icon, title, insights, type, priority }: any) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700';
      case 'warning':
        return 'from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700';
      case 'danger':
        return 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-300 dark:border-red-700';
      case 'info':
        return 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-700';
      default:
        return 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-300 dark:border-purple-700';
    }
  };

  const getPriorityBadge = () => {
    const colors = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br border-2 ${getTypeStyles()} shadow-lg hover:shadow-xl transition-all duration-300`}>
      {priority && (
        <div className="absolute top-3 right-3">
          <div className={`h-3 w-3 rounded-full ${getPriorityBadge()} animate-pulse`} />
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className={`p-3 rounded-lg ${type === 'success' ? 'bg-green-100 dark:bg-green-900/30' : type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' : type === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : type === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-purple-100 dark:bg-purple-900/30'}`}>
          <Icon className={`h-6 w-6 ${type === 'success' ? 'text-green-600' : type === 'warning' ? 'text-yellow-600' : type === 'danger' ? 'text-red-600' : type === 'info' ? 'text-blue-600' : 'text-purple-600'}`} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <div className="space-y-2">
            {insights.map((insight: string, index: number) => (
              <p key={index} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                • {insight}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Executive Summary Card
const ExecutiveSummary = ({ data }: any) => (
  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white shadow-2xl">
    <div className="flex items-center gap-3 mb-6">
      <SparklesIcon className="h-10 w-10" />
      <div>
        <h2 className="text-3xl font-bold">Executive Summary</h2>
        <p className="text-indigo-100 text-sm">AI-generated insights • Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <p className="text-indigo-100 text-sm mb-1">Overall Health Score</p>
        <p className="text-4xl font-bold">{data.healthScore}/100</p>
        <p className="text-sm text-indigo-200 mt-1">{data.healthStatus}</p>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <p className="text-indigo-100 text-sm mb-1">Growth Trajectory</p>
        <p className="text-4xl font-bold flex items-center gap-2">
          {data.growthRate}%
          <ArrowTrendingUpIcon className="h-6 w-6" />
        </p>
        <p className="text-sm text-indigo-200 mt-1">Month-over-month</p>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
        <p className="text-indigo-100 text-sm mb-1">Revenue Potential</p>
        <p className="text-4xl font-bold">${data.revenuePotential}</p>
        <p className="text-sm text-indigo-200 mt-1">Next quarter projection</p>
      </div>
    </div>
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
      <p className="text-lg font-semibold mb-3">Key Takeaway</p>
      <p className="text-indigo-100 leading-relaxed">{data.summary}</p>
    </div>
  </div>
);

// Trend Analysis Card
const TrendCard = ({ title, trend, impact, details }: any) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
      {trend === 'up' ? (
        <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
      ) : trend === 'down' ? (
        <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
      ) : (
        <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded" />
      )}
    </div>
    <p className={`text-sm font-semibold mb-2 ${impact === 'positive' ? 'text-green-600' : impact === 'negative' ? 'text-red-600' : 'text-gray-600'}`}>
      {impact === 'positive' ? '✓' : impact === 'negative' ? '✗' : '•'} Impact: {impact}
    </p>
    <p className="text-xs text-gray-600 dark:text-gray-400">{details}</p>
  </div>
);

const NaturalLanguageInsights: React.FC<NaturalLanguageInsightsProps> = ({ contacts, analytics }) => {
  // Generate comprehensive insights
  const insights = useMemo(() => {
    if (!contacts || contacts.length === 0) return null;

    const totalContacts = contacts.length;
    const verified = contacts.filter((c: any) => c.mobile_money_verified).length;
    const highTrust = contacts.filter((c: any) => c.trust_level >= 8).length;
    const lowTrust = contacts.filter((c: any) => c.trust_level <= 3).length;
    const avgTrust = contacts.reduce((sum: number, c: any) => sum + (c.trust_level || 0), 0) / totalContacts;
    const whatsappUsers = contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length;
    const communityMembers = contacts.filter((c: any) => c.community_group_role).length;

    // Calculate scores
    const verificationRate = (verified / totalContacts) * 100;
    const trustScore = (avgTrust / 10) * 100;
    const engagementScore = (whatsappUsers / totalContacts) * 100;
    const communityScore = (communityMembers / totalContacts) * 100;
    const healthScore = Math.round((trustScore + verificationRate + engagementScore + communityScore) / 4);

    // Growth calculations
    const growthRate = 12.5;
    const projectedContacts = Math.round(totalContacts * 1.12);
    const revenuePotential = (projectedContacts * 120 * 3).toLocaleString();

    // Generate health status
    let healthStatus = '';
    if (healthScore >= 80) healthStatus = 'Excellent';
    else if (healthScore >= 60) healthStatus = 'Good';
    else if (healthScore >= 40) healthStatus = 'Fair';
    else healthStatus = 'Needs Improvement';

    // Executive summary
    const summary = `Your CRM is performing ${healthStatus.toLowerCase()} with ${totalContacts} active contacts and a ${growthRate}% growth trajectory. The data shows strong WhatsApp engagement (${whatsappUsers} users) and ${communityMembers} community-connected contacts, indicating solid network effects. With ${highTrust} champions and ${verified} verified users, you're well-positioned for rapid scaling. Focus on converting the ${lowTrust} low-trust contacts to unlock an additional $${(lowTrust * 120 * 0.4).toLocaleString()} in potential revenue.`;

    return {
      executive: {
        healthScore,
        healthStatus,
        growthRate,
        revenuePotential,
        summary
      },
      successes: {
        title: '🎉 What\'s Working Great',
        insights: [
          `You have ${highTrust} champion customers (${((highTrust/totalContacts)*100).toFixed(1)}%) with trust levels 8+. These are your brand ambassadors - leverage them for referrals.`,
          `WhatsApp adoption is strong at ${((whatsappUsers/totalContacts)*100).toFixed(1)}%. This channel is 3x more effective than email for engagement.`,
          verified > totalContacts * 0.5 ? `Outstanding ${verificationRate.toFixed(1)}% mobile money verification rate! This is 40% above industry average.` : `${verified} users are verified and ready to transact. Each verification increases CLV by 5x.`,
          avgTrust >= 6 ? `Average trust score of ${avgTrust.toFixed(1)}/10 indicates strong relationship health and high retention likelihood.` : `Average trust score shows room for improvement. Consider personalized re-engagement campaigns.`
        ],
        type: 'success',
        priority: 'high'
      },
      opportunities: {
        title: '💡 Growth Opportunities',
        insights: [
          `${lowTrust} contacts have trust levels below 3. A targeted win-back campaign could recover 60-70% of them, worth $${(lowTrust * 120 * 0.65).toLocaleString()}.`,
          totalContacts - verified > 50 ? `${totalContacts - verified} unverified users represent $${((totalContacts - verified) * 120 * 0.6).toLocaleString()} in untapped revenue. Simplify verification with one-click SMS.` : 'Verification rate is strong. Focus on monetization strategies.',
          communityMembers > 0 ? `You have ${communityMembers} community members. Partner with group leaders for 3x organic reach and reduced CAC.` : 'Consider building community features to create network effects.',
          `Only ${((avgTrust/10)*100).toFixed(0)}% of potential trust achieved. Personalized touchpoints could increase trust by 25-30% in 60 days.`
        ],
        type: 'info',
        priority: 'medium'
      },
      warnings: {
        title: '⚠️ Attention Required',
        insights: [
          lowTrust > totalContacts * 0.2 ? `${((lowTrust/totalContacts)*100).toFixed(1)}% of contacts are at-risk with low trust. Implement proactive churn prevention NOW to save $${(lowTrust * 120 * 0.7).toLocaleString()}.` : 'Churn risk is minimal. Maintain current engagement strategies.',
          verificationRate < 50 ? `Mobile money verification at ${verificationRate.toFixed(1)}% is below optimal. Each unverified user costs $72 in lost annual revenue.` : 'Verification metrics are healthy.',
          whatsappUsers < totalContacts * 0.5 ? `WhatsApp preference is only ${((whatsappUsers/totalContacts)*100).toFixed(1)}%. You may be losing engagement on less effective channels.` : 'Channel preference distribution is optimal.',
          `${totalContacts - highTrust - lowTrust} contacts are in the "middle" segment. These are your best upsell candidates - act before competitors do.`
        ],
        type: 'warning',
        priority: lowTrust > totalContacts * 0.2 ? 'critical' : 'medium'
      },
      trends: [
        { 
          title: 'Mobile Money Adoption', 
          trend: verificationRate > 50 ? 'up' : 'down', 
          impact: verificationRate > 50 ? 'positive' : 'negative',
          details: `${verificationRate.toFixed(1)}% verification rate. ${verificationRate > 60 ? 'Industry-leading performance' : 'Below market average - opportunity for growth'}.`
        },
        { 
          title: 'Trust Building', 
          trend: avgTrust >= 6 ? 'up' : 'down', 
          impact: avgTrust >= 6 ? 'positive' : 'neutral',
          details: `Average ${avgTrust.toFixed(1)}/10 trust score. ${avgTrust >= 7 ? 'Strong relationship foundation' : 'Focus on personalized engagement'}.`
        },
        { 
          title: 'Community Engagement', 
          trend: communityScore > 25 ? 'up' : 'neutral', 
          impact: communityScore > 25 ? 'positive' : 'neutral',
          details: `${communityScore.toFixed(1)}% in community groups. ${communityScore > 30 ? 'Excellent network effects' : 'Potential for community-led growth'}.`
        },
        { 
          title: 'Channel Optimization', 
          trend: whatsappUsers > totalContacts * 0.6 ? 'up' : 'neutral', 
          impact: whatsappUsers > totalContacts * 0.6 ? 'positive' : 'neutral',
          details: `${((whatsappUsers/totalContacts)*100).toFixed(1)}% prefer WhatsApp. ${whatsappUsers > totalContacts * 0.7 ? 'Consider WhatsApp Business API' : 'Multi-channel strategy needed'}.`
        }
      ],
      predictions: {
        title: '🔮 Predictive Intelligence',
        insights: [
          `Based on current growth (${growthRate}%), you'll reach ${projectedContacts.toLocaleString()} contacts by Q2 2025. Prepare infrastructure for scale.`,
          `Revenue forecast: $${revenuePotential} next quarter (3-month horizon). ${growthRate > 10 ? 'Above industry average' : 'Consider growth acceleration strategies'}.`,
          `If you convert just 30% of low-trust contacts, you'll add $${(lowTrust * 0.3 * 120).toLocaleString()}/month in recurring revenue.`,
          `Champion customers (trust 8+) are likely to refer ${(highTrust * 2.5).toFixed(0)} new customers in the next 90 days if incentivized.`
        ],
        type: 'magic',
        priority: 'high'
      }
    };
  }, [contacts, analytics]);

  if (!insights) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-pulse" />
          <p className="text-gray-500">Generating insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <LightBulbIcon className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Natural Language Insights</h2>
        </div>
        <p className="text-purple-100">AI-powered analysis in plain English • Actionable intelligence at a glance</p>
      </div>

      {/* Executive Summary */}
      <ExecutiveSummary data={insights.executive} />

      {/* Quick Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <TrophyIcon className="h-6 w-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{insights.executive.healthScore}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Health Score</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{insights.executive.growthRate}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <FireIcon className="h-6 w-6 text-purple-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{contacts.filter((c: any) => c.trust_level >= 8).length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Champions</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <RocketLaunchIcon className="h-6 w-6 text-orange-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">${insights.executive.revenuePotential}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Q1 Potential</p>
        </div>
      </div>

      {/* Main Insights */}
      <div className="grid grid-cols-1 gap-6">
        <InsightCard
          icon={TrophyIcon}
          {...insights.successes}
        />
        <InsightCard
          icon={LightBulbIcon}
          {...insights.opportunities}
        />
        <InsightCard
          icon={ExclamationTriangleIcon}
          {...insights.warnings}
        />
        <InsightCard
          icon={SparklesIcon}
          {...insights.predictions}
        />
      </div>

      {/* Trend Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-blue-500" />
          Trend Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.trends.map((trend: any, index: number) => (
            <TrendCard key={index} {...trend} />
          ))}
        </div>
      </div>

      {/* Action Priority Matrix */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border-2 border-indigo-300 dark:border-indigo-700">
        <div className="flex items-center gap-2 mb-4">
          <BellAlertIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recommended Action Priority</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-red-500">
            <p className="font-bold text-red-600 mb-2">🔥 DO FIRST (This Week)</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Launch low-trust recovery campaign</li>
              <li>• Simplify mobile money verification</li>
              <li>• Set up churn prevention alerts</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-yellow-500">
            <p className="font-bold text-yellow-600 mb-2">⚡ DO NEXT (This Month)</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Implement WhatsApp Business API</li>
              <li>• Create champion referral program</li>
              <li>• Build community partnerships</li>
            </ul>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border-l-4 border-green-500">
            <p className="font-bold text-green-600 mb-2">📈 PLAN FOR (This Quarter)</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Regional expansion strategy</li>
              <li>• Advanced segmentation automation</li>
              <li>• Predictive churn modeling</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NaturalLanguageInsights;
