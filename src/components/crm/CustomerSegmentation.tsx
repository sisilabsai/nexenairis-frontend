'use client';

import React, { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Treemap
} from 'recharts';
import {
  UserGroupIcon,
  FunnelIcon,
  CubeIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { formatUGX, formatUGXAbbreviated } from '../../lib/ugandaCurrency';

// Color palette
const COLORS = {
  segments: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'],
  cohorts: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'],
};

interface CustomerSegmentationProps {
  contacts: any[];
}

// Custom Tooltip
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        <p className="font-bold text-gray-900 dark:text-white mb-2">{data.name || data.segment}</p>
        {Object.keys(data).filter(key => !['name', 'segment', 'fill', 'color'].includes(key)).map(key => (
          <p key={key} className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {typeof data[key] === 'number' ? data[key].toLocaleString() : data[key]}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomerSegmentation: React.FC<CustomerSegmentationProps> = ({ contacts }) => {
  const [selectedSegment, setSelectedSegment] = useState<string>('all');

  // RFM Analysis (Recency, Frequency, Monetary)
  const rfmSegments = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];

    // Calculate RFM scores (simplified simulation)
    const segments = contacts.map((contact: any) => {
      const recency = contact.trust_level || 5; // Higher trust = more recent interaction
      const frequency = contact.mobile_money_verified ? 8 : 4; // Verified = higher frequency
      const monetary = contact.trust_level * 100; // Simplified monetary value

      // Calculate RFM score (simple average)
      const rfmScore = (recency + frequency + (monetary / 100)) / 3;

      // Assign segment
      let segment = '';
      let color = '';
      
      if (rfmScore >= 7) {
        segment = 'Champions';
        color = COLORS.segments[0];
      } else if (rfmScore >= 5.5) {
        segment = 'Loyal Customers';
        color = COLORS.segments[1];
      } else if (rfmScore >= 4) {
        segment = 'Potential Loyalists';
        color = COLORS.segments[2];
      } else if (rfmScore >= 3) {
        segment = 'At Risk';
        color = COLORS.segments[3];
      } else {
        segment = 'Need Attention';
        color = COLORS.segments[4];
      }

      return {
        ...contact,
        recency,
        frequency,
        monetary,
        rfmScore,
        segment,
        color
      };
    });

    // Group by segment
    const grouped = segments.reduce((acc: any, contact: any) => {
      const seg = contact.segment;
      if (!acc[seg]) {
        acc[seg] = {
          segment: seg,
          count: 0,
          avgValue: 0,
          totalValue: 0,
          avgTrust: 0,
          color: contact.color,
          customers: []
        };
      }
      acc[seg].count++;
      acc[seg].totalValue += contact.monetary;
      acc[seg].avgTrust += contact.trust_level || 0;
      acc[seg].customers.push(contact);
      return acc;
    }, {});

    // Calculate averages
    Object.keys(grouped).forEach(seg => {
      grouped[seg].avgValue = Math.round(grouped[seg].totalValue / grouped[seg].count);
      grouped[seg].avgTrust = (grouped[seg].avgTrust / grouped[seg].count).toFixed(1);
    });

    return Object.values(grouped);
  }, [contacts]);

  // Behavioral Clustering
  const behaviorClusters = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];

    const clusters = [
      {
        name: 'Mobile-First Users',
        count: contacts.filter((c: any) => c.mobile_money_verified && c.preferred_channel === 'whatsapp').length,
        characteristics: ['High mobile engagement', 'WhatsApp preferred', 'Quick transactions'],
        color: '#10b981'
      },
      {
        name: 'Community Leaders',
        count: contacts.filter((c: any) => c.community_group_role && c.trust_level >= 7).length,
        characteristics: ['Influential', 'High trust', 'Group participation'],
        color: '#3b82f6'
      },
      {
        name: 'Price Sensitive',
        count: contacts.filter((c: any) => c.trust_level >= 5 && !c.mobile_money_verified).length,
        characteristics: ['Value seekers', 'Comparison shoppers', 'Deal motivated'],
        color: '#f59e0b'
      },
      {
        name: 'Early Adopters',
        count: contacts.filter((c: any) => c.mobile_money_verified && c.trust_level >= 8).length,
        characteristics: ['Tech-savvy', 'Risk-takers', 'Trendsetters'],
        color: '#8b5cf6'
      },
      {
        name: 'Passive Users',
        count: contacts.filter((c: any) => c.trust_level <= 4 && !c.mobile_money_verified).length,
        characteristics: ['Low engagement', 'Sporadic activity', 'Needs nurturing'],
        color: '#ef4444'
      }
    ];

    return clusters.filter(c => c.count > 0);
  }, [contacts]);

  // Cohort Analysis (by trust level progression)
  const cohortData = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];

    const trustLevels = [
      { level: '0-2', min: 0, max: 2, label: 'New' },
      { level: '3-4', min: 3, max: 4, label: 'Warming' },
      { level: '5-6', min: 5, max: 6, label: 'Active' },
      { level: '7-8', min: 7, max: 8, label: 'Loyal' },
      { level: '9-10', min: 9, max: 10, label: 'Champion' }
    ];

    return trustLevels.map(({ level, min, max, label }) => {
      const cohort = contacts.filter((c: any) => {
        const trust = c.trust_level || 0;
        return trust >= min && trust <= max;
      });

      const verified = cohort.filter((c: any) => c.mobile_money_verified).length;
      const avgValue = cohort.length > 0 ? cohort.reduce((sum: number, c: any) => sum + ((c.trust_level || 0) * 100), 0) / cohort.length : 0;

      return {
        cohort: label,
        level,
        customers: cohort.length,
        verified,
        avgValue: Math.round(avgValue),
        verificationRate: cohort.length > 0 ? ((verified / cohort.length) * 100).toFixed(0) : 0,
        retention: Math.min(95, 50 + (min * 8)) // Simulated retention rate
      };
    });
  }, [contacts]);

  // Customer Lifetime Value Distribution (UGX)
  const clvDistribution = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];

    const ranges = [
      { range: 'UGX 0-500K', min: 0, max: 500000 },
      { range: 'UGX 500K-1M', min: 500000, max: 1000000 },
      { range: 'UGX 1M-2M', min: 1000000, max: 2000000 },
      { range: 'UGX 2M-5M', min: 2000000, max: 5000000 },
      { range: 'UGX 5M+', min: 5000000, max: Infinity }
    ];

    return ranges.map(({ range, min, max }) => {
      const clv = (contact: any) => (contact.trust_level || 0) * 100000; // UGX 100K per trust level
      const count = contacts.filter((c: any) => {
        const value = clv(c);
        return value >= min && value < max;
      }).length;

      return {
        range,
        customers: count,
        percentage: ((count / contacts.length) * 100).toFixed(1)
      };
    });
  }, [contacts]);

  // Engagement Score Radar
  const engagementRadar = useMemo(() => {
    if (!contacts || contacts.length === 0) return [];

    const avgTrust = contacts.reduce((sum: number, c: any) => sum + (c.trust_level || 0), 0) / contacts.length;
    const verificationRate = (contacts.filter((c: any) => c.mobile_money_verified).length / contacts.length) * 100;
    const whatsappRate = (contacts.filter((c: any) => c.preferred_channel === 'whatsapp').length / contacts.length) * 100;
    const communityRate = (contacts.filter((c: any) => c.community_group_role).length / contacts.length) * 100;
    const activeRate = (contacts.filter((c: any) => (c.trust_level || 0) >= 6).length / contacts.length) * 100;

    return [
      { metric: 'Trust Level', value: (avgTrust / 10) * 100, fullMark: 100 },
      { metric: 'Verification', value: verificationRate, fullMark: 100 },
      { metric: 'WhatsApp Usage', value: whatsappRate, fullMark: 100 },
      { metric: 'Community', value: communityRate, fullMark: 100 },
      { metric: 'Active Users', value: activeRate, fullMark: 100 }
    ];
  }, [contacts]);

  if (!contacts || contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No contact data available for segmentation</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <CubeIcon className="h-8 w-8" />
          <h2 className="text-2xl font-bold">Advanced Customer Segmentation</h2>
        </div>
        <p className="text-blue-100">RFM analysis, behavioral clustering, cohort tracking, and predictive scoring</p>
      </div>

      {/* Segment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rfmSegments.map((segment: any, index: number) => (
          <div
            key={index}
            onClick={() => setSelectedSegment(segment.segment)}
            className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl ${
              selectedSegment === segment.segment
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <UserGroupIcon className="h-5 w-5" style={{ color: segment.color }} />
              {selectedSegment === segment.segment && (
                <SparklesIcon className="h-4 w-4 text-blue-500 animate-pulse" />
              )}
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-1">{segment.segment}</h4>
            <p className="text-2xl font-bold mb-1" style={{ color: segment.color }}>
              {segment.count}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Avg Value: {formatUGXAbbreviated(segment.avgValue * 1000)} {/* Convert to UGX */}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Avg Trust: {segment.avgTrust}/10
            </p>
          </div>
        ))}
      </div>

      {/* RFM Scatter Plot */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ChartPieIcon className="h-5 w-5 text-purple-500" />
          RFM Segmentation Matrix
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" dataKey="frequency" name="Frequency" stroke="#6b7280" />
            <YAxis type="number" dataKey="monetary" name="Monetary Value" stroke="#6b7280" />
            <ZAxis type="number" dataKey="recency" name="Recency" range={[50, 400]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {rfmSegments.map((segment: any, index: number) => (
              <Scatter
                key={index}
                name={segment.segment}
                data={segment.customers}
                fill={segment.color}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Behavioral Clusters & Cohort Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Behavioral Clusters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-blue-500" />
            Behavioral Clusters
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={behaviorClusters} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" stroke="#6b7280" />
              <YAxis type="category" dataKey="name" stroke="#6b7280" width={150} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Customers" radius={[0, 8, 8, 0]}>
                {behaviorClusters.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {behaviorClusters.map((cluster: any, index: number) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <div className="h-3 w-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: cluster.color }} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{cluster.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {cluster.characteristics.join(' • ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cohort Analysis */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-green-500" />
            Trust Level Cohorts
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={cohortData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cohort" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="customers" fill="#3b82f6" name="Total Customers" radius={[8, 8, 0, 0]} />
              <Bar dataKey="verified" fill="#10b981" name="Verified" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {cohortData.map((cohort: any, index: number) => (
              <div key={index} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{cohort.cohort}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Verification: {cohort.verificationRate}% • Retention: {cohort.retention}%
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Engagement Radar & CLV Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <SparklesIcon className="h-5 w-5 text-purple-500" />
            Engagement Score Radar
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={engagementRadar}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" stroke="#6b7280" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
              <Radar
                name="Engagement Score"
                dataKey="value"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* CLV Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ChartPieIcon className="h-5 w-5 text-orange-500" />
            Customer Lifetime Value Distribution
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={clvDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="customers" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {clvDistribution.map((item: any, index: number) => (
              <div key={index} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900/50 text-center">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{item.range}</p>
                <p className="text-lg font-bold text-orange-600">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSegmentation;
