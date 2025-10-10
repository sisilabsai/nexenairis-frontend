'use client';

import React, { useMemo } from 'react';
import {
  LightBulbIcon,
  RocketLaunchIcon,
  FireIcon,
  StarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  category: 'revenue' | 'engagement' | 'efficiency' | 'growth' | 'retention';
  estimatedValue: string;
  timeframe: string;
  priority: number;
  actionItems: string[];
}

interface SmartRecommendationsProps {
  contacts: any[];
  analytics: any;
}

const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({ contacts, analytics }) => {
  const recommendations = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];

    const recs: Recommendation[] = [];
    let priorityCounter = 1;

    // Analyze trust levels
    const lowTrust = contacts.filter((c: any) => c.trust_level <= 3).length;
    const lowTrustPercent = (lowTrust / contacts.length) * 100;
    
    if (lowTrustPercent > 20) {
      recs.push({
        id: 'trust-building',
        title: '🎯 Launch Trust-Building Campaign',
        description: `${lowTrustPercent.toFixed(0)}% of contacts have low trust scores. A targeted re-engagement campaign could convert 30-40% of these contacts.`,
        impact: 'high',
        effort: 'medium',
        category: 'engagement',
        estimatedValue: `$${(lowTrust * 120 * 0.35).toLocaleString()}`,
        timeframe: '2-3 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Segment low-trust contacts by acquisition source',
          'Create personalized email/WhatsApp sequences',
          'Offer exclusive incentive for first transaction',
          'Implement feedback collection to understand barriers'
        ]
      });
    }

    // Analyze mobile money verification
    const unverifiedMobile = contacts.filter((c: any) => !c.mobile_money_verified).length;
    const unverifiedPercent = (unverifiedMobile / contacts.length) * 100;
    
    if (unverifiedPercent > 40) {
      recs.push({
        id: 'mobile-verification',
        title: '📱 Mobile Money Verification Drive',
        description: `${unverifiedPercent.toFixed(0)}% of contacts haven't verified mobile money. Each verification increases transaction likelihood by 5x.`,
        impact: 'high',
        effort: 'low',
        category: 'revenue',
        estimatedValue: `$${(unverifiedMobile * 150 * 0.60).toLocaleString()}`,
        timeframe: '1-2 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Send SMS with one-click verification link',
          'Offer $5 credit for completing verification',
          'Simplify verification process (reduce from 3 to 1 step)',
          'A/B test verification messaging'
        ]
      });
    }

    // Analyze WhatsApp preference
    const whatsappUsers = contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length;
    const whatsappPercent = (whatsappUsers / contacts.length) * 100;
    
    if (whatsappPercent > 60) {
      recs.push({
        id: 'whatsapp-automation',
        title: '💬 WhatsApp Business API Integration',
        description: `${whatsappPercent.toFixed(0)}% prefer WhatsApp. Automated messaging could reduce response time by 80% and increase engagement by 45%.`,
        impact: 'high',
        effort: 'high',
        category: 'efficiency',
        estimatedValue: `$${(whatsappUsers * 80).toLocaleString()}/mo`,
        timeframe: '4-6 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Set up WhatsApp Business API account',
          'Implement chatbot for common queries',
          'Create automated order status updates',
          'Build broadcast templates for promotions'
        ]
      });
    }

    // High-value segment analysis
    const champions = contacts.filter((c: any) => c.trust_level >= 8 && c.mobile_money_verified).length;
    const championsPercent = (champions / contacts.length) * 100;
    
    if (championsPercent > 15) {
      recs.push({
        id: 'referral-program',
        title: '🚀 Launch VIP Referral Program',
        description: `You have ${champions} champion customers (${championsPercent.toFixed(0)}%). They're 12x more likely to refer. Tap into network effects.`,
        impact: 'high',
        effort: 'medium',
        category: 'growth',
        estimatedValue: `${Math.round(champions * 2.5)} new customers`,
        timeframe: '2-3 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Create tiered referral rewards ($10 for referrer, $5 for referee)',
          'Personalized referral links with tracking',
          'Gamification: Leaderboard for top referrers',
          'Monthly bonus for 5+ successful referrals'
        ]
      });
    }

    // Community group analysis
    const communityMembers = contacts.filter((c: any) => c.community_group_role).length;
    if (communityMembers > contacts.length * 0.3) {
      recs.push({
        id: 'community-engagement',
        title: '👥 Community Leader Partnership Program',
        description: `${communityMembers} contacts are in community groups. Partner with leaders for 3x organic reach.`,
        impact: 'medium',
        effort: 'low',
        category: 'growth',
        estimatedValue: `${Math.round(communityMembers * 1.8)} potential reach`,
        timeframe: '1-2 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Identify and contact community leaders',
          'Offer exclusive group discounts (10-15% off)',
          'Create co-branded promotional materials',
          'Host community-specific events/webinars'
        ]
      });
    }

    // Regional insights
    if (analytics?.regional) {
      recs.push({
        id: 'regional-expansion',
        title: '🗺️ Strategic Regional Expansion',
        description: 'Data shows untapped potential in 3 districts with high CLV but low penetration.',
        impact: 'medium',
        effort: 'high',
        category: 'growth',
        estimatedValue: `$${(contacts.length * 0.25 * 120).toLocaleString()}`,
        timeframe: '6-8 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Analyze top-performing districts for patterns',
          'Replicate successful strategies in new regions',
          'Hire local brand ambassadors',
          'Targeted social media ads for new districts'
        ]
      });
    }

    // Churn prevention
    const atRisk = contacts.filter((c: any) => c.trust_level <= 4 && c.trust_level > 0).length;
    if (atRisk > 0) {
      recs.push({
        id: 'churn-prevention',
        title: '🛡️ Proactive Churn Prevention',
        description: `${atRisk} contacts showing disengagement signals. Early intervention could save 60-70% of them.`,
        impact: 'high',
        effort: 'medium',
        category: 'retention',
        estimatedValue: `$${(atRisk * 120 * 0.65).toLocaleString()}`,
        timeframe: '1-2 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Implement predictive churn scoring model',
          'Automated "We miss you" campaigns',
          'Win-back offers (limited time 20% discount)',
          'Personal outreach from account managers'
        ]
      });
    }

    // Upselling opportunity
    const midTier = contacts.filter((c: any) => c.trust_level >= 6 && c.trust_level < 8).length;
    if (midTier > contacts.length * 0.2) {
      recs.push({
        id: 'upsell-campaign',
        title: '⬆️ Smart Upselling Campaign',
        description: `${midTier} contacts are in the "growth potential" segment. They're ready for premium offerings.`,
        impact: 'medium',
        effort: 'low',
        category: 'revenue',
        estimatedValue: `$${(midTier * 85).toLocaleString()}`,
        timeframe: '2-3 weeks',
        priority: priorityCounter++,
        actionItems: [
          'Identify complementary products/services',
          'Create bundled offers with 15% savings',
          'Personalized product recommendations via email',
          'Time-limited premium trial (7 days free)'
        ]
      });
    }

    // Sort by priority
    return recs.sort((a, b) => a.priority - b.priority);
  }, [contacts, analytics]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return CurrencyDollarIcon;
      case 'engagement':
        return ChartBarIcon;
      case 'efficiency':
        return ClockIcon;
      case 'growth':
        return RocketLaunchIcon;
      case 'retention':
        return UserGroupIcon;
      default:
        return LightBulbIcon;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'revenue':
        return 'green';
      case 'engagement':
        return 'blue';
      case 'efficiency':
        return 'purple';
      case 'growth':
        return 'orange';
      case 'retention':
        return 'pink';
      default:
        return 'gray';
    }
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[impact as keyof typeof colors] || colors.medium;
  };

  const getEffortBadge = (effort: string) => {
    const colors = {
      high: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      medium: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      low: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return colors[effort as keyof typeof colors] || colors.medium;
  };

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">All Systems Optimal!</p>
          <p className="text-gray-500">No critical recommendations at this time.</p>
        </div>
      </div>
    );
  }

  // Top 3 high-priority recommendations
  const topRecs = recommendations.filter(r => r.impact === 'high').slice(0, 3);
  const quickWins = recommendations.filter(r => r.effort === 'low' && r.impact !== 'low').slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <LightBulbIcon className="h-8 w-8" />
          <h2 className="text-2xl font-bold">AI-Powered Smart Recommendations</h2>
        </div>
        <p className="text-orange-100">Data-driven action items prioritized by impact, effort, and ROI</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
          <FireIcon className="h-6 w-6 text-red-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{topRecs.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">High Impact</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <RocketLaunchIcon className="h-6 w-6 text-green-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{quickWins.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Quick Wins</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <ClockIcon className="h-6 w-6 text-blue-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {recommendations.filter(r => r.timeframe.includes('1-2')).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <StarIcon className="h-6 w-6 text-purple-600 mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{recommendations.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Opportunities</p>
        </div>
      </div>

      {/* Quick Wins Section */}
      {quickWins.length > 0 && (
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-teal-300 dark:border-teal-700">
          <div className="flex items-center gap-2 mb-4">
            <BellAlertIcon className="h-6 w-6 text-teal-600" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">⚡ Quick Wins - Start Here!</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Low effort, high impact opportunities you can implement this week
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickWins.map((rec) => {
              const Icon = getCategoryIcon(rec.category);
              return (
                <div key={rec.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <Icon className="h-5 w-5 text-teal-600 mb-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{rec.title}</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{rec.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-teal-600">{rec.estimatedValue}</span>
                    <span className="text-gray-500">{rec.timeframe}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Recommendations */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          All Recommendations (Sorted by Priority)
        </h3>
        {recommendations.map((rec) => {
          const Icon = getCategoryIcon(rec.category);
          const color = getCategoryColor(rec.category);
          
          return (
            <div
              key={rec.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg ${color === 'green' ? 'bg-green-100 dark:bg-green-900/30' : color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : color === 'pink' ? 'bg-pink-100 dark:bg-pink-900/30' : 'bg-gray-100 dark:bg-gray-900/30'}`}>
                  <Icon className={`h-6 w-6 ${color === 'green' ? 'text-green-600' : color === 'blue' ? 'text-blue-600' : color === 'purple' ? 'text-purple-600' : color === 'orange' ? 'text-orange-600' : color === 'pink' ? 'text-pink-600' : 'text-gray-600'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gray-500">#{rec.priority}</span>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">{rec.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{rec.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getImpactBadge(rec.impact)}`}>
                      Impact: {rec.impact.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEffortBadge(rec.effort)}`}>
                      Effort: {rec.effort.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      {rec.category.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <CurrencyDollarIcon className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Value:</span> {rec.estimatedValue}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">Timeline:</span> {rec.timeframe}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Action Items:</p>
                    <ul className="space-y-1">
                      {rec.actionItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartRecommendations;
