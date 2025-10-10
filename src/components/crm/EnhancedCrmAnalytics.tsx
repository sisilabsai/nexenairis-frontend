'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  DevicePhoneMobileIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';

interface EnhancedCrmAnalyticsProps {
  analyticsType: 'mobile-money' | 'community' | 'communication' | 'regional';
  data: any;
  isLoading?: boolean;
}

// Color palettes for charts
const COLORS = {
  primary: ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#84cc16'],
  success: ['#10b981', '#059669', '#047857', '#065f46'],
  warning: ['#f59e0b', '#d97706', '#b45309', '#92400e'],
  info: ['#3b82f6', '#2563eb', '#1d4ed8', '#1e40af'],
  purple: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6'],
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
        <p className="font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold text-gray-900">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, change, trend, color = 'blue' }: any) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    orange: 'bg-orange-50 text-orange-600',
    pink: 'bg-pink-50 text-pink-600',
    indigo: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={`inline-flex p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} mb-4`}>
            <Icon className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function EnhancedCrmAnalytics({ analyticsType, data, isLoading }: EnhancedCrmAnalyticsProps) {
  // Mobile Money Analytics
  const mobileMoneyCharts = useMemo(() => {
    if (analyticsType !== 'mobile-money' || !data) return null;

    // Provider breakdown for pie chart
    const providerData = (data.provider_breakdown || []).map((item: any) => ({
      name: item.mobile_money_provider || 'Unknown',
      value: item.count || 0,
      verified: item.verified_count || 0,
    }));

    // Verification status data
    const verificationData = [
      {
        name: 'Verified',
        value: data.verified_mobile_money_users || 0,
        color: '#10b981',
      },
      {
        name: 'Unverified',
        value: (data.total_mobile_money_users || 0) - (data.verified_mobile_money_users || 0),
        color: '#f59e0b',
      },
    ];

    return { providerData, verificationData };
  }, [analyticsType, data]);

  // Community Analytics
  const communityCharts = useMemo(() => {
    if (analyticsType !== 'community' || !data) return null;

    // Role distribution
    const roleData = Object.entries(data.role_distribution || {}).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count as number,
    }));

    // Group metrics
    const groupMetrics = [
      { name: 'Total Members', value: data.total_group_members || 0 },
      { name: 'Total Groups', value: data.total_groups || 0 },
      { name: 'Avg Members/Group', value: Math.round((data.total_group_members || 0) / (data.total_groups || 1)) },
    ];

    return { roleData, groupMetrics };
  }, [analyticsType, data]);

  // Communication Analytics
  const communicationCharts = useMemo(() => {
    if (analyticsType !== 'communication' || !data) return null;

    // Channel preferences
    const channelData = (data.preferred_channels || []).map((item: any) => ({
      name: (item.preferred_communication_channel || 'Unknown').toUpperCase(),
      value: item.count || 0,
    }));

    // WhatsApp metrics
    const whatsappData = [
      {
        name: 'Total Users',
        value: data.whatsapp_adoption?.total_whatsapp_users || 0,
        color: '#10b981',
      },
      {
        name: 'Business Verified',
        value: data.whatsapp_adoption?.verified_whatsapp_business || 0,
        color: '#3b82f6',
      },
      {
        name: 'Preferred',
        value: data.whatsapp_adoption?.whatsapp_preferred || 0,
        color: '#8b5cf6',
      },
    ];

    return { channelData, whatsappData };
  }, [analyticsType, data]);

  // Regional Analytics
  const regionalCharts = useMemo(() => {
    if (analyticsType !== 'regional' || !data) return null;

    // District distribution
    const districtData = (data.location_distribution?.by_district || [])
      .slice(0, 10)
      .map((item: any) => ({
        name: item.district || 'Unknown',
        contacts: item.count || 0,
        avgCLV: Math.round(item.avg_clv || 0),
      }));

    // Financial inclusion
    const financialData = [
      {
        category: 'Bank Account',
        value: data.financial_inclusion?.bank_account_holders || 0,
        color: '#3b82f6',
      },
      {
        category: 'Mobile Money',
        value: data.financial_inclusion?.mobile_money_users || 0,
        color: '#10b981',
      },
      {
        category: 'Cash Preferred',
        value: data.financial_inclusion?.cash_preferred || 0,
        color: '#f59e0b',
      },
    ];

    return { districtData, financialData };
  }, [analyticsType, data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg">
        <GlobeAltIcon className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No analytics data available</p>
      </div>
    );
  }

  // Mobile Money Analytics View
  if (analyticsType === 'mobile-money' && mobileMoneyCharts) {
    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={DevicePhoneMobileIcon}
            label="Total Mobile Money Users"
            value={(data.total_mobile_money_users || 0).toLocaleString()}
            change={12.5}
            trend="up"
            color="blue"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Verified Users"
            value={(data.verified_mobile_money_users || 0).toLocaleString()}
            change={8.3}
            trend="up"
            color="green"
          />
          <StatCard
            icon={ClockIcon}
            label="Verification Rate"
            value={`${Math.round(((data.verified_mobile_money_users || 0) / (data.total_mobile_money_users || 1)) * 100)}%`}
            change={5.2}
            trend="up"
            color="purple"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Provider Distribution - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Provider Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mobileMoneyCharts.providerData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mobileMoneyCharts.providerData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Verification Status - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Verification Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mobileMoneyCharts.verificationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {mobileMoneyCharts.verificationData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Provider Details - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Provider Breakdown with Verification</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mobileMoneyCharts.providerData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" name="Total Users" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="verified" name="Verified" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Community Analytics View
  if (analyticsType === 'community' && communityCharts) {
    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={UsersIcon}
            label="Total Members"
            value={(data.total_group_members || 0).toLocaleString()}
            change={15.3}
            trend="up"
            color="blue"
          />
          <StatCard
            icon={UserGroupIcon}
            label="Total Groups"
            value={(data.total_groups || 0).toLocaleString()}
            change={7.8}
            trend="up"
            color="green"
          />
          <StatCard
            icon={CurrencyDollarIcon}
            label="Monthly Contributions"
            value={`UGX ${(data.total_monthly_contributions || 0).toLocaleString()}`}
            change={22.1}
            trend="up"
            color="purple"
          />
          <StatCard
            icon={UserGroupIcon}
            label="Avg Members/Group"
            value={Math.round((data.total_group_members || 0) / (data.total_groups || 1))}
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Role Distribution - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Role Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={communityCharts.roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                >
                  {communityCharts.roleData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Group Metrics - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Community Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={communityCharts.groupMetrics} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#666" />
                <YAxis dataKey="name" type="category" stroke="#666" width={150} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]}>
                  {communityCharts.groupMetrics.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.purple[index % COLORS.purple.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Communication Analytics View
  if (analyticsType === 'communication' && communicationCharts) {
    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={PhoneIcon}
            label="WhatsApp Users"
            value={(data.whatsapp_adoption?.total_whatsapp_users || 0).toLocaleString()}
            change={18.2}
            trend="up"
            color="green"
          />
          <StatCard
            icon={CheckCircleIcon}
            label="Business Verified"
            value={(data.whatsapp_adoption?.verified_whatsapp_business || 0).toLocaleString()}
            change={12.5}
            trend="up"
            color="blue"
          />
          <StatCard
            icon={ChatBubbleBottomCenterTextIcon}
            label="WhatsApp Preferred"
            value={(data.whatsapp_adoption?.whatsapp_preferred || 0).toLocaleString()}
            change={25.3}
            trend="up"
            color="purple"
          />
          <StatCard
            icon={EnvelopeIcon}
            label="Total Channels"
            value={communicationCharts.channelData.length}
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Channel Preferences - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Channel Preferences</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={communicationCharts.channelData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {communicationCharts.channelData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* WhatsApp Adoption - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">WhatsApp Adoption Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={communicationCharts.whatsappData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {communicationCharts.whatsappData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Communication Channel Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Channel Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={communicationCharts.channelData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Contacts" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {communicationCharts.channelData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS.primary[index % COLORS.primary.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  // Regional Analytics View
  if (analyticsType === 'regional' && regionalCharts) {
    const totalContacts = regionalCharts.districtData.reduce((sum: number, item: any) => sum + item.contacts, 0);
    const avgCLV = Math.round(
      regionalCharts.districtData.reduce((sum: number, item: any) => sum + item.avgCLV, 0) /
        (regionalCharts.districtData.length || 1)
    );

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={MapPinIcon}
            label="Total Districts"
            value={regionalCharts.districtData.length}
            color="blue"
          />
          <StatCard
            icon={UsersIcon}
            label="Total Contacts"
            value={totalContacts.toLocaleString()}
            change={10.5}
            trend="up"
            color="green"
          />
          <StatCard
            icon={CurrencyDollarIcon}
            label="Avg Customer Value"
            value={`UGX ${avgCLV.toLocaleString()}`}
            change={8.7}
            trend="up"
            color="purple"
          />
          <StatCard
            icon={BanknotesIcon}
            label="Financial Inclusion Rate"
            value={`${Math.round(((data.financial_inclusion?.bank_account_holders || 0) / totalContacts) * 100)}%`}
            change={6.2}
            trend="up"
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Districts - Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Districts by Contacts</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalCharts.districtData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="contacts" name="Contacts" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Financial Inclusion - Pie Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Inclusion</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={regionalCharts.financialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, value }) => `${category}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {regionalCharts.financialData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* CLV by District - Area Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Lifetime Value by District</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={regionalCharts.districtData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#666" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="avgCLV"
                  name="Avg CLV"
                  stroke="#8b5cf6"
                  fill="#c4b5fd"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
