'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  CurrencyDollarIcon,
  BanknotesIcon,
  CreditCardIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CpuChipIcon,
  GlobeAsiaAustraliaIcon,
  ArrowTrendingUpIcon as TrendingUpIcon,
  ArrowTrendingDownIcon as TrendingDownIcon,
  ShieldCheckIcon,
  BellIcon,
  SparklesIcon,
  Bars3Icon,
  ChevronDownIcon,
  XMarkIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Radar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import TransactionModal from '../../components/TransactionModal';
import TransactionDetailModal from '../../components/TransactionDetailModal';
import AccountInfoModal from '../../components/AccountInfoModal';
import AccountModal from '../../components/AccountModal';
import AccountTree from '../../components/AccountTree';
import DimensionsModal from '../../components/DimensionsModal';
import FinancialPeriods from '../../components/FinancialPeriods';
import AuditTrail from '../../components/AuditTrail';
import AiInsights from '../../components/AiInsights';
import { 
  useFinanceSummary,
  useFinanceTransactions,
  useChartOfAccounts,
  useFinanceMobileMoneyAnalytics,
  useCashFlowAnalysis,
  useArAgingReport,
  useCreateTransaction,
  useUpdateTransaction,
  useDeleteTransaction,
  useCreateAccount,
  useUpdateAccount,
  useDeleteAccount,
  useInitializeChartOfAccounts,
  useExchangeRates
} from '../../hooks/useApi';

interface FinancialSummary {
  total_revenue: number;
  total_expenses: number;
  net_income: number;
  profit_margin: number;
  cash_balance: number;
  bank_balance: number;
  mobile_money_balance: number;
  total_liquid_assets: number;
  total_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  total_receivables: number;
  collection_rate: number;
  mobile_money_transactions: number;
  cash_transactions: number;
  cross_border_transactions: number;
  payment_method_breakdown: any[];
  mobile_money_provider_breakdown: any[];
  monthly_revenue_trend: any[];
  primary_currency: string;
}

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

interface CashFlowForecast {
  period: string;
  projected_inflow: number;
  projected_outflow: number;
  net_cashflow: number;
  confidence: number;
  scenarios: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

interface ExchangeRate {
  currency_pair: string;
  rate: number;
  change_24h: number;
  last_updated: string;
}

export default function FinancePage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'accounts' | 'transactions' | 'analytics' | 'ai-insights' | 'cash-flow' | 'currencies' | 'periods-audit'>('overview');
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState('UGX');
  const [showDimensionsModal, setShowDimensionsModal] = useState(false);
  const [aiInsightsEnabled, setAiInsightsEnabled] = useState(true);
  const [anomalyAlerts, setAnomalyAlerts] = useState<any[]>([]);
  const [realTimeUpdates, setRealTimeUpdates] = useState(true);
  
  // Mobile-specific states
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewTransaction, setQuickViewTransaction] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [showMobileChart, setShowMobileChart] = useState(false);
  const [selectedMobileMetric, setSelectedMobileMetric] = useState('revenue');
  
  // Real API hooks
  const { data: summaryData, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useFinanceSummary();
  const { data: exchangeRatesData, isLoading: exchangeRatesLoading } = useExchangeRates(selectedCurrency);
  const { data: transactionsData, isLoading: transactionsLoading, refetch: refetchTransactions } = useFinanceTransactions();
  const { data: accountsData, isLoading: accountsLoading, refetch: refetchAccounts } = useChartOfAccounts();
  const { data: mobileMoneyData, isLoading: mobileMoneyLoading } = useFinanceMobileMoneyAnalytics();
  const { data: cashFlowData, isLoading: cashFlowLoading } = useCashFlowAnalysis();
  const { data: receivableData, isLoading: receivableLoading } = useArAgingReport();
  
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();
  const createAccountMutation = useCreateAccount();
  const updateAccountMutation = useUpdateAccount();
  const deleteAccountMutation = useDeleteAccount();
  const initializeChartOfAccountsMutation = useInitializeChartOfAccounts();
  
  // Extract data from API responses
  const isLoading = summaryLoading || transactionsLoading || accountsLoading;
  const error = summaryError;
  const financeSummary = (summaryData as any)?.data;

  // 🛡️ Safe Math utility functions (bulletproof calculations - must be declared first)
  const safeDivide = (numerator: number, denominator: number, fallback = 0): number => {
    // Handle all edge cases: NaN, null, undefined, zero division
    if (!isFinite(numerator) || !isFinite(denominator) || denominator === 0) return fallback;
    return numerator / denominator;
  };

  const safePercentage = (numerator: number, denominator: number, fallback = 0): number => {
    const result = safeDivide(numerator, denominator, fallback / 100) * 100;
    return Math.round(isFinite(result) ? result : fallback);
  };

  const safeNumber = (value: any, fallback = 0): number => {
    // Handle all edge cases: NaN, null, undefined, Infinity, strings
    if (value === null || value === undefined || value === '') return fallback;
    const num = Number(value);
    return isFinite(num) && !isNaN(num) ? num : fallback;
  };

  const formatCurrency = (amount: number, currency?: string) => {
    // Handle all edge cases for currency formatting
    const safeAmount = safeNumber(amount, 0);
    const curr = currency || selectedCurrency || 'UGX';
    
    if (curr === 'USD') {
      const usdAmount = safeDivide(safeAmount, 3750, 0);
      return `$${usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${curr} ${safeAmount.toLocaleString()}`;
  };

  // 📊 Chart configurations and data
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      },
    },
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

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = formatCurrency(context.raw);
            const percentage = ((context.raw / context.dataset.data.reduce((a: number, b: number) => a + b, 0)) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  const financialHealthScore: FinancialHealthScore = useMemo(() => {
    if (!financeSummary) {
      return {
        overall_score: 0,
        liquidity_score: 0,
        profitability_score: 0,
        efficiency_score: 0,
        growth_score: 0,
        risk_score: 0,
      };
    }
    // Calculate liquidity score (0-100)
    const liquidityRatio = safeDivide(financeSummary.total_liquid_assets, financeSummary.total_expenses);
    const liquidity_score = Math.min(Math.round(liquidityRatio * 25), 100); // 4 months = 100 score
    
    // Calculate profitability score (0-100)
    const profitability_score = Math.min(Math.round(financeSummary.profit_margin * 3), 100); // 33% margin = 100 score
    
    // Calculate efficiency score based on collection rate and expense ratio
    const collectionScore = Math.round(financeSummary.collection_rate);
    const expenseRatio = safePercentage(financeSummary.total_expenses, financeSummary.total_revenue);
    const expenseEfficiency = Math.max(100 - expenseRatio, 0);
    const efficiency_score = Math.round((collectionScore + expenseEfficiency) / 2);
    
    // Calculate growth score based on digital adoption
    const digitalAdoption = safePercentage(
      financeSummary.mobile_money_transactions, 
      (financeSummary.mobile_money_transactions + financeSummary.cash_transactions)
    );
    const growth_score = Math.round((digitalAdoption + 60) / 2); // Base score of 60 + digital adoption
    
    // Calculate risk score (inverse - lower risk = higher score)
    const concentrationRisk = Math.abs(50 - digitalAdoption); // Risk from being too concentrated or too dispersed
    const risk_score = Math.max(100 - concentrationRisk, 40);
    
    // Calculate overall score as weighted average
    const overall_score = Math.round(
      (liquidity_score * 0.25) +
      (profitability_score * 0.25) +
      (efficiency_score * 0.2) +
      (growth_score * 0.2) +
      (risk_score * 0.1)
    );
    
    return {
      overall_score,
      liquidity_score,
      profitability_score,
      efficiency_score,
      growth_score,
      risk_score
    };
  }, [financeSummary]);

  const cashFlowForecast: CashFlowForecast[] = useMemo(() => {
    if (!financeSummary) return [];
    // Calculate realistic cash flow based on actual financial data
    const currentRevenue = safeNumber(financeSummary.total_revenue);
    const currentExpenses = safeNumber(financeSummary.total_expenses);
    const monthlyGrowthRate = 0.08; // 8% monthly growth assumption
    const seasonalityFactor = [1.0, 1.12, 1.05]; // Next 3 months seasonal adjustment
    
    return Array.from({ length: 3 }, (_, index) => {
      const monthOffset = index + 1;
      const growthFactor = Math.pow(1 + monthlyGrowthRate, monthOffset);
      const seasonal = seasonalityFactor[index];
      
      const baseInflow = currentRevenue * growthFactor * seasonal;
      const baseOutflow = currentExpenses * growthFactor * 0.95; // Assume some expense optimization
      const netFlow = baseInflow - baseOutflow;
      
      const date = new Date();
      date.setMonth(date.getMonth() + monthOffset);
      
      return {
        period: date.toISOString().substring(0, 7), // YYYY-MM format
        projected_inflow: Math.round(baseInflow),
        projected_outflow: Math.round(baseOutflow),
        net_cashflow: Math.round(netFlow),
        confidence: Math.max(90 - (index * 7), 70), // Decreasing confidence over time
        scenarios: {
          optimistic: Math.round(netFlow * 1.35),
          realistic: Math.round(netFlow),
          pessimistic: Math.round(netFlow * 0.65)
        }
      };
    });
  }, [financeSummary]);

  // 📊 Chart data configurations
  const revenueExpensesChartData = useMemo(() => {
    if (!financeSummary || !financeSummary.monthly_revenue_trend) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: financeSummary.monthly_revenue_trend.map((item: any) => 
        new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      ),
      datasets: [
        {
          label: 'Revenue',
          data: financeSummary.monthly_revenue_trend.map((item: any) => item.total),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Projected Expenses',
          data: financeSummary.monthly_revenue_trend.map((item: any) => item.total * 0.6), // Estimate expenses as 60% of revenue
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ],
    };
  }, [financeSummary]);

  const cashFlowChartData = useMemo(() => ({
    labels: cashFlowForecast.map((item: CashFlowForecast) => 
      new Date(item.period).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    ),
    datasets: [
      {
        label: 'Projected Inflow',
        data: cashFlowForecast.map((item: CashFlowForecast) => item.projected_inflow),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
      },
      {
        label: 'Projected Outflow',
        data: cashFlowForecast.map((item: CashFlowForecast) => item.projected_outflow),
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
      },
      {
        label: 'Net Cash Flow',
        data: cashFlowForecast.map((item: CashFlowForecast) => item.net_cashflow),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      }
    ],
  }), [cashFlowForecast]);

  const mobileMoneyChartData = useMemo(() => {
    if (!financeSummary || !financeSummary.mobile_money_provider_breakdown) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: financeSummary.mobile_money_provider_breakdown.map((item: any) => item.mobile_money_provider),
      datasets: [
        {
          data: financeSummary.mobile_money_provider_breakdown.map((item: any) => item.total_amount),
          backgroundColor: [
            'rgba(254, 240, 138, 0.8)', // MTN Yellow
            'rgba(239, 68, 68, 0.8)',   // Airtel Red
            'rgba(34, 197, 94, 0.8)',   // M-Pesa Green
          ],
          borderColor: [
            'rgb(254, 240, 138)',
            'rgb(239, 68, 68)',
            'rgb(34, 197, 94)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [financeSummary]);

  const currencyDistributionData = useMemo(() => {
    if (!financeSummary) {
      return { labels: [], datasets: [] };
    }
    return {
      labels: ['UGX', 'USD', 'EUR', 'KES'],
      datasets: [
        {
          data: [
            financeSummary.total_liquid_assets * 0.65,
            financeSummary.total_liquid_assets * 0.23,
            financeSummary.total_liquid_assets * 0.08,
            financeSummary.total_liquid_assets * 0.04
          ],
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(168, 85, 247, 0.8)',
          ],
          borderColor: [
            'rgb(99, 102, 241)',
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(168, 85, 247)',
          ],
          borderWidth: 2,
        },
      ],
    };
  }, [financeSummary]);

  const healthScoreRadarData = useMemo(() => ({
    labels: ['Liquidity', 'Profitability', 'Efficiency', 'Growth', 'Risk Management'],
    datasets: [
      {
        label: 'Financial Health',
        data: [
          financialHealthScore.liquidity_score,
          financialHealthScore.profitability_score,
          financialHealthScore.efficiency_score,
          financialHealthScore.growth_score,
          financialHealthScore.risk_score
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
  }), [financialHealthScore]);

  // AI Insights and Enhanced Analytics (Based on real financial data)
  const aiInsights: AIInsight[] = useMemo(() => {
    if (!financeSummary) return [];
    const insights: AIInsight[] = [];
    
    // Analyze mobile money adoption
    const mobileMoneyPercentage = safePercentage(
      financeSummary.mobile_money_transactions, 
      (financeSummary.mobile_money_transactions + financeSummary.cash_transactions)
    );
    
    if (mobileMoneyPercentage > 60) {
      insights.push({
        id: 'mobile-money-success',
        type: 'success',
        title: 'Excellent Digital Payment Adoption',
        description: `Mobile money represents ${mobileMoneyPercentage}% of transactions, indicating strong digital transformation.`,
        impact: 'high',
        actionable: false,
        confidence: 95,
        timeframe: 'Ongoing'
      });
    } else if (mobileMoneyPercentage < 40) {
      insights.push({
        id: 'mobile-money-opportunity',
        type: 'opportunity',
        title: 'Mobile Money Growth Opportunity',
        description: `Only ${mobileMoneyPercentage}% of transactions are digital. Significant opportunity to reduce cash handling costs.`,
        impact: 'high',
        actionable: true,
        confidence: 87,
        timeframe: 'Next 60 days',
        recommendation: 'Launch mobile money incentive program with 2-3% transaction discounts'
      });
    }
    
    // Analyze expense ratio
    const expenseRatio = safePercentage(financeSummary.total_expenses, financeSummary.total_revenue);
    if (expenseRatio > 80) {
      insights.push({
        id: 'high-expense-ratio',
        type: 'warning',
        title: 'High Expense Ratio Alert',
        description: `Expenses represent ${expenseRatio}% of revenue, which may impact profitability.`,
        impact: 'high',
        actionable: true,
        confidence: 92,
        timeframe: 'Immediate',
        recommendation: 'Review largest expense categories and identify cost optimization opportunities'
      });
    }
    
    // Analyze profit margin
    if (financeSummary.profit_margin > 25) {
      insights.push({
        id: 'strong-profitability',
        type: 'success',
        title: 'Strong Profit Margins',
        description: `${financeSummary.profit_margin}% profit margin indicates excellent operational efficiency.`,
        impact: 'high',
        actionable: false,
        confidence: 95,
        timeframe: 'Ongoing'
      });
    } else if (financeSummary.profit_margin < 10) {
      insights.push({
        id: 'low-profitability',
        type: 'warning',
        title: 'Margin Improvement Needed',
        description: `${financeSummary.profit_margin}% profit margin is below industry benchmarks.`,
        impact: 'high',
        actionable: true,
        confidence: 88,
        timeframe: 'Next 90 days',
        recommendation: 'Focus on revenue optimization and expense reduction strategies'
      });
    }
    
    // Analyze collection rate
    if (financeSummary.collection_rate < 75) {
      insights.push({
        id: 'collection-improvement',
        type: 'warning',
        title: 'Collection Rate Below Benchmark',
        description: `${financeSummary.collection_rate}% collection rate indicates potential cash flow issues.`,
        impact: 'medium',
        actionable: true,
        confidence: 85,
        timeframe: 'Next 30 days',
        recommendation: 'Implement automated reminders and early payment discounts'
      });
    }
    
    // Analyze cash flow forecast
    const nextMonthForecast = cashFlowForecast[0];
    if (nextMonthForecast && nextMonthForecast.net_cashflow < 0) {
      insights.push({
        id: 'negative-cashflow-forecast',
        type: 'warning',
        title: 'Negative Cash Flow Predicted',
        description: `Next month forecasts ${selectedCurrency} ${nextMonthForecast.net_cashflow.toLocaleString()} negative cash flow.`,
        impact: 'high',
        actionable: true,
        confidence: nextMonthForecast.confidence,
        timeframe: 'Immediate',
        recommendation: 'Accelerate receivables collection and defer non-essential expenses'
      });
    }
    
    // Liquidity analysis
    const liquidityRatio = safeDivide(financeSummary.total_liquid_assets, financeSummary.total_expenses);
    if (liquidityRatio < 2) {
      insights.push({
        id: 'low-liquidity',
        type: 'warning',
        title: 'Liquidity Risk Detected',
        description: `Current liquid assets cover only ${liquidityRatio.toFixed(1)} months of expenses.`,
        impact: 'medium',
        actionable: true,
        confidence: 90,
        timeframe: 'Next 45 days',
        recommendation: 'Build cash reserves to at least 3 months of operating expenses'
      });
    }
    
    return insights;
  }, [financeSummary, cashFlowForecast, selectedCurrency]);

  const exchangeRates: ExchangeRate[] = useMemo(() => {
    if (!exchangeRatesData || !(exchangeRatesData as any).conversion_rates || !(exchangeRatesData as any).time_last_update_unix) {
      return [];
    }
    const targetCurrencies = ['UGX', 'USD', 'EUR', 'KES', 'TZS'];
    return targetCurrencies
      .filter(currency => currency !== selectedCurrency)
      .map(currency => ({
        currency_pair: `${selectedCurrency}/${currency}`,
        rate: (exchangeRatesData as any).conversion_rates[currency],
        change_24h: (Math.random() - 0.5) * 2, // Placeholder for change
        last_updated: new Date((exchangeRatesData as any).time_last_update_unix * 1000).toISOString(),
      }));
  }, [exchangeRatesData, selectedCurrency]);

  // Enhanced anomaly detection system (Ready for ML integration)
  const detectAnomalies = useMemo(() => {
    if (!financeSummary) return [];
    const anomalies = [];
    
    // Check for unusual spending patterns
    if (financeSummary.total_expenses > financeSummary.total_revenue * 0.8) {
      anomalies.push({
        id: 'high-expense-ratio',
        type: 'warning',
        message: 'Expense ratio exceeding 80% of revenue',
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }
    
    // Check for cash flow issues
    if (financeSummary.cash_balance < financeSummary.total_expenses * 0.1) {
      anomalies.push({
        id: 'low-cash-balance',
        type: 'critical',
        message: 'Cash balance below 10% of monthly expenses',
        severity: 'critical',
        timestamp: new Date().toISOString()
      });
    }
    
    return anomalies;
  }, [financeSummary]);

  // Real-time updates effect
  useEffect(() => {
    if (!realTimeUpdates) return;

    const interval = setInterval(() => {
      // Simulate real-time updates by refetching data
      if (Math.random() > 0.7) { // 30% chance to trigger updates
        refetchSummary();
        refetchTransactions();
        refetchAccounts();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates, refetchSummary, refetchTransactions, refetchAccounts]);

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;
    return {
      percentage: Math.abs(change).toFixed(1),
      isPositive,
      icon: isPositive ? ArrowUpIcon : ArrowDownIcon,
      color: isPositive ? 'text-green-600' : 'text-red-600',
      bgColor: isPositive ? 'bg-green-50' : 'bg-red-50',
    };
  };

  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setShowTransactionModal(true);
  };

  const handleTransactionModalClose = () => {
    setShowTransactionModal(false);
    setEditingTransaction(null);
  };

  const handleTransactionSuccess = () => {
    refetchTransactions();
    refetchSummary();
  };

  const handleNewAccount = () => {
    setEditingAccount(null);
    setShowAccountModal(true);
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    setShowAccountModal(true);
  };

  const handleDeleteAccount = async (account: any) => {
    if (confirm(`Are you sure you want to delete "${account.account_name}"?`)) {
      try {
        await deleteAccountMutation.mutateAsync(account.id);
        refetchAccounts();
        refetchSummary();
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account. Please try again.');
      }
    }
  };

  const handleAccountModalClose = () => {
    setShowAccountModal(false);
    setEditingAccount(null);
  };

  const handleAccountSuccess = () => {
    refetchAccounts();
    refetchSummary();
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = async (transaction: any) => {
    if (confirm(`Are you sure you want to delete transaction "${transaction.transaction_number}"?`)) {
      try {
        await deleteTransactionMutation.mutateAsync(transaction.id);
        refetchTransactions();
        refetchSummary();
      } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Error deleting transaction. Please try again.');
      }
    }
  };

  // Filter transactions based on search term
  const filteredTransactions = React.useMemo(() => {
    // Handle paginated response structure
    const transactions = (transactionsData as any)?.data?.data || (transactionsData as any)?.data;
    
    // Return empty array if no transactions data or not an array
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }
    
    // If no search term, return all transactions
    if (!searchTerm.trim()) {
      return transactions;
    }
    
    // Filter transactions based on search term
    return transactions.filter((transaction: any) =>
      transaction.transaction_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.narration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.payment_method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.mobile_money_provider?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transactionsData, searchTerm]);

  if (isLoading || !financeSummary) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
          </div>
          </DashboardLayout>
        </ProtectedRoute>
      );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <ErrorMessage message="Failed to load finance data" />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Mobile-Responsive Page Header */}
        <div className="mb-6">
          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 p-4 rounded-xl shadow-lg mb-4">
              <div className="flex items-center justify-between">
                <div className="text-white">
                  <h1 className="text-xl font-bold">💰 Finance</h1>
                  <p className="text-green-100 text-sm">Financial Management</p>
                </div>
                <div className="flex items-center space-x-2">
                  {realTimeUpdates && (
                    <div className="flex items-center text-white bg-white/20 px-2 py-1 rounded-lg text-xs">
                      <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                      Live
                    </div>
                  )}
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
                  >
                    <Bars3Icon className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile Stats Row */}
              <div className="flex justify-between mt-4 pt-4 border-t border-white/20">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{formatCurrency(financeSummary.total_revenue).replace('UGX ', '').replace('$', '$')}</p>
                  <p className="text-green-100 text-xs">Revenue</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{financialHealthScore.overall_score}/100</p>
                  <p className="text-green-100 text-xs">Health Score</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{safePercentage(financeSummary.mobile_money_transactions, (financeSummary.mobile_money_transactions + financeSummary.cash_transactions))}%</p>
                  <p className="text-green-100 text-xs">Digital</p>
                </div>
              </div>
            </div>
            
            {/* Mobile Action Menu */}
            {isMobileMenuOpen && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-4">
                <div className="p-4 space-y-3">
                  <button
                    onClick={() => {
                      handleNewTransaction();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Transaction
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        setSelectedView('ai-insights');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition-colors"
                    >
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      AI Insights
                      {aiInsights.filter(i => i.actionable).length > 0 && (
                        <span className="ml-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                          {aiInsights.filter(i => i.actionable).length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = '/finance/reports';
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      Reports
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Desktop Header */}
          <div className="hidden sm:block">
            {/* Smart Financial Alerts */}
            {(detectAnomalies.length > 0 || aiInsights.filter(i => i.type === 'warning').length > 0) && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 animate-pulse" />
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-red-800">
                      Financial Alerts Require Attention
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc pl-5 space-y-1">
                        {detectAnomalies.map((anomaly, index) => (
                          <li key={index}>{anomaly.message}</li>
                        ))}
                        {aiInsights.filter(i => i.type === 'warning').slice(0, 2).map((insight) => (
                          <li key={insight.id}>{insight.title}: {insight.description}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="ml-3 flex-shrink-0">
                    <button
                      onClick={() => setSelectedView('ai-insights')}
                      className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <h1 className="text-3xl font-bold text-gray-900">💰 Finance Management</h1>
                  {realTimeUpdates && (
                    <div className="ml-3 flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <ChartBarIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    AI-powered financial insights and African business analytics
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <GlobeAsiaAustraliaIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    Multi-currency support with {exchangeRates.length} active rates
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <ShieldCheckIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    Financial Health Score: {financialHealthScore.overall_score}/100
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
              {/* AI Insights Quick Access */}
              <button 
                onClick={() => setSelectedView('ai-insights')}
                className="inline-flex items-center px-4 py-2 border border-purple-300 rounded-md shadow-sm text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <SparklesIcon className="h-4 w-4 mr-2" />
                AI Insights
                {aiInsights.filter(i => i.actionable).length > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-200 text-purple-800">
                    {aiInsights.filter(i => i.actionable).length}
                  </span>
                )}
              </button>

              {/* Export with Smart Options */}
              <div className="relative group">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export Report
                  <ArrowDownIcon className="h-3 w-3 ml-1" />
              </button>
                
                {/* Export Dropdown (hidden by default, shows on hover) */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-1">
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">📊 Financial Summary</button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">📱 Mobile Money Report</button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">🔮 AI Insights Report</button>
                    <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">💹 Cash Flow Forecast</button>
                  </div>
                </div>
              </div>

              {/* Enhanced New Transaction Button */}
              <a 
                href="/finance/reports"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                View Reports
              </a>
              <button 
                onClick={handleNewTransaction}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
              >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Transaction
          </button>
              <button 
                onClick={() => setShowDimensionsModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors"
              >
                Manage Dimensions
              </button>
            </div>
            </div>
          </div>
        </div>

      {/* Exchange Rate Ticker */}
      <div className="mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Live Exchange Rates (Base: {selectedCurrency})</h3>
          <div className="flex space-x-6 overflow-x-auto">
            {exchangeRatesLoading ? (
              <p>Loading rates...</p>
            ) : (
              exchangeRates.map((rate) => (
                <div key={rate.currency_pair} className="flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-800">{rate.currency_pair.split('/')[1]}</span>
                    <span className="text-gray-600">{safeNumber(rate.rate, 0).toLocaleString()}</span>
                    <span className={`flex items-center text-xs ${
                      rate.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rate.change_24h >= 0 ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                      {safeNumber(Math.abs(rate.change_24h), 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

        {/* Mobile-Responsive Navigation Tabs */}
        <div className="mb-6">
          {/* Mobile Tabs - Horizontal Scroll */}
          <div className="sm:hidden">
            <div className="flex space-x-1 p-1 bg-gray-100 rounded-xl overflow-x-auto">
              {[
                { key: 'overview', label: 'Overview', icon: ChartBarIcon, emoji: '📊' },
                { key: 'ai-insights', label: 'AI Insights', icon: SparklesIcon, emoji: '✨', badge: aiInsights.filter(i => i.actionable).length },
                { key: 'cash-flow', label: 'Cash Flow', icon: TrendingUpIcon, emoji: '📈' },
                { key: 'transactions', label: 'Transactions', icon: DocumentTextIcon, emoji: '📋' },
                { key: 'accounts', label: 'Accounts', icon: BuildingLibraryIcon, emoji: '🏦' },
                { key: 'currencies', label: 'Currency', icon: GlobeAsiaAustraliaIcon, emoji: '🌍' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedView(tab.key as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all relative ${
                    selectedView === tab.key
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <span>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {tab.badge && tab.badge > 0 && (
                    <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                  {tab.key === 'ai-insights' && aiInsights.filter(i => i.actionable).length > 0 && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Desktop Tabs */}
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-6 overflow-x-auto">
                {[
                  { key: 'overview', label: 'Overview', icon: ChartBarIcon, color: 'indigo' },
                  { 
                    key: 'ai-insights', 
                    label: 'AI Insights', 
                    icon: SparklesIcon, 
                    color: 'purple',
                    badge: aiInsights.filter(i => i.actionable).length
                  },
                  { key: 'cash-flow', label: 'Cash Flow', icon: TrendingUpIcon, color: 'green' },
                  { key: 'currencies', label: 'Multi-Currency', icon: GlobeAsiaAustraliaIcon, color: 'blue' },
                  { key: 'accounts', label: 'Accounts', icon: BuildingLibraryIcon, color: 'indigo' },
                  { key: 'transactions', label: 'Transactions', icon: DocumentTextIcon, color: 'indigo' },
                  { key: 'analytics', label: 'Analytics', icon: ArrowTrendingUpIcon, color: 'indigo' },
                  { key: 'periods-audit', label: 'Periods & Audit', icon: ShieldCheckIcon, color: 'indigo' },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedView === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedView(tab.key as any)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap relative ${
                        isActive
                          ? `border-${tab.color}-500 text-${tab.color}-600`
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                      {tab.badge && tab.badge > 0 && (
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-${tab.color}-100 text-${tab.color}-800`}>
                          {tab.badge}
                        </span>
                      )}
                      {tab.key === 'ai-insights' && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Enhanced Controls Bar */}
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center gap-4">
              {/* Currency Selector */}
              <div className="flex items-center space-x-2">
                <GlobeAsiaAustraliaIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="UGX">🇺🇬 UGX</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="KES">🇰🇪 KES</option>
                </select>
                    </div>
              
              {/* Period Selector */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                    </div>

              {/* AI Toggle */}
              <div className="flex items-center space-x-2">
                <CpuChipIcon className="h-4 w-4 text-gray-500" />
                <button
                  onClick={() => setAiInsightsEnabled(!aiInsightsEnabled)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    aiInsightsEnabled 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {aiInsightsEnabled ? 'AI Enabled' : 'AI Disabled'}
                </button>
                  </div>
                </div>

            {/* Status Indicators */}
            <div className="flex items-center space-x-4">
              {/* Anomaly Alerts */}
              {detectAnomalies.length > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-red-50 border border-red-200 rounded-md">
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500 animate-pulse" />
                  <span className="text-sm text-red-700 font-medium">{detectAnomalies.length} Alert{detectAnomalies.length > 1 ? 's' : ''}</span>
                  </div>
              )}
              
              {/* Live Updates Status */}
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Updated {new Date().toLocaleTimeString()}</span>
              </div>
              
              <button
                onClick={() => setRealTimeUpdates(!realTimeUpdates)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  realTimeUpdates 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${realTimeUpdates ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                {realTimeUpdates ? 'Live' : 'Manual'}
              </button>
            </div>
                </div>
              </div>

        {/* Content based on selected view */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Mobile-Responsive Financial Health Overview */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
              {/* Mobile Layout */}
              <div className="sm:hidden">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold mb-1">Financial Health Score</h2>
                  <div className="text-4xl font-bold mb-2">{financialHealthScore.overall_score}/100</div>
                  <div className="text-blue-200 text-sm">
                    {financialHealthScore.overall_score > 80 ? '🔥 Excellent' : 
                     financialHealthScore.overall_score > 60 ? '✅ Good' : 
                     financialHealthScore.overall_score > 40 ? '⚠️ Fair' : '🚨 Needs Attention'}
                  </div>
                </div>
                
                {/* Mobile Health Indicators - 2 columns */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Liquidity', value: financialHealthScore.liquidity_score, icon: '💧' },
                    { label: 'Profitability', value: financialHealthScore.profitability_score, icon: '💰' },
                    { label: 'Efficiency', value: financialHealthScore.efficiency_score, icon: '⚡' },
                    { label: 'Growth', value: financialHealthScore.growth_score, icon: '📈' },
                    { label: 'Risk', value: financialHealthScore.risk_score, icon: '🛡️' },
                    { label: 'Digital', value: safePercentage(financeSummary.mobile_money_transactions, (financeSummary.mobile_money_transactions + financeSummary.cash_transactions)), icon: '📱' }
                  ].map((metric) => (
                    <div key={metric.label} className="text-center bg-white/10 rounded-lg p-3">
                      <div className="text-xl mb-1">{metric.icon}</div>
                      <div className="text-lg font-bold">{safeNumber(metric.value, 0)}</div>
                      <div className="text-xs text-blue-200">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Desktop Layout */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Financial Health Score</h2>
                    <p className="text-blue-100">Overall business financial performance</p>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold">{financialHealthScore.overall_score}/100</div>
                    <div className="text-blue-200 text-sm">
                      {financialHealthScore.overall_score > 80 ? '🔥 Excellent' : 
                       financialHealthScore.overall_score > 60 ? '✅ Good' : 
                       financialHealthScore.overall_score > 40 ? '⚠️ Fair' : '🚨 Needs Attention'}
                    </div>
                  </div>
                </div>
                
                {/* Desktop Health Indicators */}
                <div className="grid grid-cols-6 gap-4 mt-6">
                  {[
                    { label: 'Liquidity', value: financialHealthScore.liquidity_score, icon: '💧' },
                    { label: 'Profitability', value: financialHealthScore.profitability_score, icon: '💰' },
                    { label: 'Efficiency', value: financialHealthScore.efficiency_score, icon: '⚡' },
                    { label: 'Growth', value: financialHealthScore.growth_score, icon: '📈' },
                    { label: 'Risk', value: financialHealthScore.risk_score, icon: '🛡️' },
                    { label: 'Mobile Money', value: safePercentage(financeSummary.mobile_money_transactions, (financeSummary.mobile_money_transactions + financeSummary.cash_transactions)), icon: '📱' }
                  ].map((metric) => (
                    <div key={metric.label} className="text-center">
                      <div className="text-2xl mb-1">{metric.icon}</div>
                      <div className="text-xl font-bold">{safeNumber(metric.value, 0)}</div>
                      <div className="text-xs text-blue-200">{metric.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI-Powered Quick Insights Banner */}
            {aiInsights.filter(i => i.actionable).length > 0 && (
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <SparklesIcon className="h-6 w-6 mr-3" />
                    <div>
                      <h3 className="font-semibold">AI Insights Available</h3>
                      <p className="text-purple-100 text-sm">{aiInsights.filter(i => i.actionable).length} actionable insights ready for review</p>
                  </div>
                    </div>
                  <button 
                    onClick={() => setSelectedView('ai-insights')}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    View Insights
                  </button>
                  </div>
                </div>
            )}

            {/* Mobile-Responsive Key Financial Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  title: 'Total Revenue',
                  value: financeSummary.total_revenue,
                  change: '+12.5%',
                  changeType: 'positive',
                  icon: ArrowTrendingUpIcon,
                  color: 'green',
                  description: 'Monthly revenue growth'
                },
                {
                  title: 'Total Expenses',
                  value: financeSummary.total_expenses,
                  change: '+5.2%',
                  changeType: 'negative',
                  icon: ArrowDownIcon,
                  color: 'red',
                  description: 'Operating expenses'
                },
                {
                  title: 'Net Income',
                  value: financeSummary.net_income,
                  change: `${financeSummary.profit_margin}%`,
                  changeType: 'neutral',
                  icon: CurrencyDollarIcon,
                  color: 'blue',
                  description: 'Profit margin'
                },
                {
                  title: 'Liquid Assets',
                  value: financeSummary.total_liquid_assets,
                  change: 'Multi-currency',
                  changeType: 'neutral',
                  icon: BanknotesIcon,
                  color: 'purple',
                  description: 'Cash + Bank + Mobile Money'
                }
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <div key={metric.title} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                        <Icon className={`h-6 w-6 text-${metric.color}-600`} />
                  </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        metric.changeType === 'positive' ? 'bg-green-100 text-green-800' :
                        metric.changeType === 'negative' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {metric.change}
                      </span>
                </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-gray-600">{metric.title}</h3>
                      <div className="text-2xl font-bold text-gray-900">{formatCurrency(metric.value)}</div>
                      <p className="text-xs text-gray-500">{metric.description}</p>
                    </div>
                  </div>
                );
              })}
              </div>

            {/* Mobile-Responsive African Business Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Enhanced Cash Flow Breakdown */}
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">💰 Liquidity Breakdown</h3>
                  <span className="text-xs text-gray-500">Real-time</span>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      name: 'Cash Balance',
                      value: financeSummary.cash_balance,
                      icon: BanknotesIcon,
                      color: 'green',
                      percentage: safePercentage(financeSummary.cash_balance, financeSummary.total_liquid_assets)
                    },
                    {
                      name: 'Bank Balance',
                      value: financeSummary.bank_balance,
                      icon: BuildingLibraryIcon,
                      color: 'blue',
                      percentage: safePercentage(financeSummary.bank_balance, financeSummary.total_liquid_assets)
                    },
                    {
                      name: 'Mobile Money',
                      value: financeSummary.mobile_money_balance,
                      icon: PhoneIcon,
                      color: 'purple',
                      percentage: safePercentage(financeSummary.mobile_money_balance, financeSummary.total_liquid_assets)
                    }
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.name} className="relative">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                            <div className={`p-2 rounded-lg bg-${item.color}-100 mr-3`}>
                              <Icon className={`h-4 w-4 text-${item.color}-600`} />
                        </div>
                            <div>
                              <span className="font-medium text-gray-900 text-sm">{item.name}</span>
                              <div className="text-xs text-gray-500">{safeNumber(item.percentage, 0)}% of total</div>
                    </div>
                  </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(item.value)}</div>
                </div>
                  </div>
                        {/* Progress bar */}
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                          <div 
                            className={`bg-${item.color}-500 h-1 rounded-full transition-all duration-1000`}
                            style={{ width: `${safeNumber(item.percentage, 0)}%` }}
                          ></div>
                </div>
                      </div>
                    );
                  })}
              </div>
            </div>

              {/* Enhanced Mobile Money Analytics */}
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">📱 Mobile Money Analytics</h3>
                  <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                    Live
                  </div>
                </div>
                <div className="space-y-4">
                  {financeSummary.mobile_money_provider_breakdown.map((provider: any, index: number) => {
                    const totalMobile = financeSummary.mobile_money_provider_breakdown.reduce((sum: number, p: any) => sum + p.total_amount, 0);
                    const percentage = safePercentage(provider.total_amount, totalMobile);
                    return (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                            <div className={`w-4 h-4 rounded-full mr-3 ${
                              provider.mobile_money_provider === 'MTN' ? 'bg-yellow-400' :
                              provider.mobile_money_provider === 'Airtel' ? 'bg-red-500' :
                              'bg-green-500'
                            }`}></div>
                            <div>
                              <span className="font-semibold text-gray-900">{provider.mobile_money_provider}</span>
                              <div className="text-xs text-gray-500">{safeNumber(percentage, 0)}% market share</div>
                    </div>
      </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">{formatCurrency(provider.total_amount)}</div>
                            <div className="text-xs text-gray-500">{provider.count} transactions</div>
        </div>
      </div>
                        {/* Provider progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              provider.mobile_money_provider === 'MTN' ? 'bg-yellow-400' :
                              provider.mobile_money_provider === 'Airtel' ? 'bg-red-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${safeNumber(percentage, 0)}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Mobile Money Insights */}
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center text-blue-800">
                      <LightBulbIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm font-medium">Digital Transformation Insight</span>
              </div>
                                        <p className="text-xs text-blue-700 mt-1">
                      Mobile money represents {safePercentage(financeSummary.mobile_money_transactions, (financeSummary.mobile_money_transactions + financeSummary.cash_transactions))}% of your transactions - excellent digital adoption!
                    </p>
                  </div>
                  
                  {/* Mobile Money Provider Chart */}
                  <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Provider Market Share</h4>
                    <div className="h-48">
                      <Pie data={mobileMoneyChartData} options={{
                        ...pieOptions,
                        plugins: {
                          ...pieOptions.plugins,
                          legend: {
                            position: 'bottom' as const,
                          }
                        }
                      }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* African Business Performance */}
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">🇺🇬 African Business KPIs</h3>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Growing</span>
                </div>
                
                <div className="space-y-4">
                  {[
                    {
                      label: 'Digital Payment Adoption',
                      value: safePercentage(financeSummary.mobile_money_transactions, (financeSummary.mobile_money_transactions + financeSummary.cash_transactions)),
                      benchmark: 85,
                      icon: '📱',
                      suffix: '%'
                    },
                    {
                      label: 'Collection Efficiency',
                      value: financeSummary.collection_rate,
                      benchmark: 90,
                      icon: '💰',
                      suffix: '%'
                    },
                    {
                      label: 'Cross-Border Transactions',
                      value: financeSummary.cross_border_transactions,
                      benchmark: 50,
                      icon: '🌍',
                      suffix: ''
                    },
                    {
                      label: 'Financial Health Score',
                      value: financialHealthScore.overall_score,
                      benchmark: 80,
                      icon: '🔥',
                      suffix: '/100'
                    }
                  ].map((kpi) => (
                    <div key={kpi.label} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                          <span className="text-lg mr-2">{kpi.icon}</span>
                          <span className="text-sm font-medium text-gray-700">{kpi.label}</span>
                      </div>
                      <div className="text-right">
                          <span className="text-xl font-bold text-gray-900">{safeNumber(kpi.value, 0)}{kpi.suffix}</span>
                        </div>
                        </div>
                      
                      {/* KPI Progress vs Benchmark */}
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-1000 ${
                              kpi.value >= kpi.benchmark ? 'bg-green-500' : 
                              kpi.value >= kpi.benchmark * 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${safeNumber(Math.min(safePercentage(kpi.value, kpi.benchmark), 100), 0)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">vs {kpi.benchmark}{kpi.suffix}</span>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500">
                        {kpi.value >= kpi.benchmark ? '✅ Above benchmark' :
                         kpi.value >= kpi.benchmark * 0.8 ? '⚠️ Near benchmark' : '🔴 Below benchmark'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Revenue vs Expenses Trend Chart */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">📈 Revenue vs Expenses Trend</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <Line data={revenueExpensesChartData} options={chartOptions} />
              </div>
            </div>

            {/* Transaction Methods & Receivables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method Distribution</h3>
                <div className="space-y-3">
                  {financeSummary.payment_method_breakdown.map((method: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-lg mr-3">
                          {method.payment_method === 'mobile_money' ? '📱' :
                           method.payment_method === 'cash' ? '💵' :
                           method.payment_method === 'bank' ? '🏦' : '💳'}
                        </span>
                        <span className="font-medium text-gray-900 capitalize">
                          {(method.payment_method || '').replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(method.total_amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {method.count} transactions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Accounts Receivable</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Total Invoices</span>
                    <span className="font-semibold text-gray-900">{financeSummary.total_invoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Paid Invoices</span>
                    <span className="font-semibold text-green-600">{financeSummary.paid_invoices}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Overdue Invoices</span>
                    <span className="font-semibold text-red-600">{financeSummary.overdue_invoices}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <span className="text-sm font-medium text-gray-900">Outstanding Receivables</span>
                    <span className="font-bold text-lg text-orange-600">
                      {formatCurrency(financeSummary.total_receivables)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Collection Rate</span>
                    <span className="font-semibold text-blue-600">{financeSummary.collection_rate}%</span>
            </div>
          </div>
        </div>
      </div>

            {/* Transaction Activity Summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">African Business Transaction Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{financeSummary.mobile_money_transactions}</div>
                  <div className="text-sm text-gray-500 mt-1">📱 Mobile Money Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{financeSummary.cash_transactions}</div>
                  <div className="text-sm text-gray-500 mt-1">💵 Cash Transactions</div>
                                 </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{financeSummary.cross_border_transactions}</div>
                  <div className="text-sm text-gray-500 mt-1">🌍 Cross-Border Transactions</div>
                   </div>
                 </div>
               </div>
             </div>
        )}

        {/* Chart of Accounts Tab */}
        {selectedView === 'accounts' && (
          <div className="space-y-6">
            {/* Account Actions Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Chart of Accounts</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage your financial account structure</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => initializeChartOfAccountsMutation.mutate()}
                      disabled={initializeChartOfAccountsMutation.isPending}
                      className="group relative inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="flex items-center">
                        {initializeChartOfAccountsMutation.isPending ? (
                          <>
                            <div className="animate-spin -ml-1 mr-3 h-4 w-4 text-white">
                              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                            <span>Creating Accounts...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4 mr-2 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                            </svg>
                            <span>Initialize Default Accounts</span>
                          </>
                        )}
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                    </button>
                    <button 
                      onClick={() => setShowAccountInfoModal(true)}
                      className="group relative inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="flex items-center">
                        <LightBulbIcon className="h-4 w-4 mr-2 group-hover:animate-pulse" />
                        <span>Learn About Accounts</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                    </button>
                    <button 
                      onClick={handleNewAccount}
                      className="group relative inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    >
                      <div className="flex items-center">
                        <PlusIcon className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                        <span>Add New Account</span>
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                    </button>
                  </div>
                </div>

              {/* Enhanced Account Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[
                  { type: 'asset', emoji: '💰', color: 'from-green-500 to-emerald-600', bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50', textColor: 'text-green-700' },
                  { type: 'liability', emoji: '📋', color: 'from-red-500 to-pink-600', bgColor: 'bg-gradient-to-br from-red-50 to-pink-50', textColor: 'text-red-700' },
                  { type: 'equity', emoji: '🏛️', color: 'from-blue-500 to-indigo-600', bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50', textColor: 'text-blue-700' },
                  { type: 'revenue', emoji: '💹', color: 'from-purple-500 to-violet-600', bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50', textColor: 'text-purple-700' },
                  { type: 'expense', emoji: '�', color: 'from-orange-500 to-amber-600', bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50', textColor: 'text-orange-700' }
                ].map(({ type, emoji, color, bgColor, textColor }) => {
                  const accountCount = Array.isArray((accountsData as any)?.data) ? (accountsData as any)?.data?.filter((acc: any) => acc.account_type === type)?.length || 0 : 0;
                  return (
                    <div key={type} className={`${bgColor} rounded-xl p-6 text-center border border-gray-100 hover:shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer group`}>
                      <div className="text-3xl mb-3 group-hover:animate-bounce">
                        {emoji}
                      </div>
                      <div className={`text-lg font-bold ${textColor} capitalize mb-1`}>{type}</div>
                      <div className="text-sm text-gray-600 mb-2">
                        {accountCount} account{accountCount !== 1 ? 's' : ''}
                      </div>
                      <div className={`h-2 bg-gradient-to-r ${color} rounded-full mx-auto w-16 group-hover:w-20 transition-all duration-300`}></div>
                      {accountCount === 0 && (
                        <div className="mt-2">
                          <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                            Empty
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Accounts Table */}
              <div className="overflow-x-auto">
                <AccountTree
                  accounts={(accountsData as any)?.data || []}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onAddChild={(parentAccount) => {
                    setEditingAccount({ parent_id: parentAccount.id });
                    setShowAccountModal(true);
                  }}
                />
                {(!accountsData?.data || (accountsData as any)?.data?.length === 0) && (
                  <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                    <div className="max-w-sm mx-auto">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Chart of Accounts Yet</h3>
                      <p className="text-gray-600 mb-6">Get started by initializing default accounts or create your own custom account structure.</p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => initializeChartOfAccountsMutation.mutate()}
                          disabled={initializeChartOfAccountsMutation.isPending}
                          className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-xl text-base font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-105"
                        >
                          {initializeChartOfAccountsMutation.isPending ? (
                            <>
                              <div className="animate-spin -ml-1 mr-3 h-5 w-5 text-white">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                              Creating Default Accounts...
                            </>
                          ) : (
                            <>
                              <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                              ✨ Initialize Default Accounts
                            </>
                          )}
                        </button>
                        
                        <div className="text-sm text-gray-500 flex items-center justify-center">
                          <span>or</span>
                        </div>
                        
                        <button
                          onClick={handleNewAccount}
                          className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 rounded-xl text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                        >
                          <PlusIcon className="h-5 w-5 mr-2" />
                          Create Custom Account
                        </button>
                        
                        <button
                          onClick={() => setShowAccountInfoModal(true)}
                          className="w-full inline-flex items-center justify-center px-6 py-3 border-2 border-amber-300 rounded-xl text-base font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-200"
                        >
                          <LightBulbIcon className="h-5 w-5 mr-2" />
                          📚 Learn About Chart of Accounts
                        </button>
                      </div>
                      
                      <div className="mt-6 text-xs text-gray-500">
                        💡 Tip: Default accounts include Cash, Bank, Mobile Money, and standard business accounts
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile-Responsive Transactions Tab */}
        {selectedView === 'transactions' && (
          <div className="space-y-6">
            {/* Mobile Search Header */}
            <div className="sm:hidden">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search transactions..."
                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-base"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Transactions</h3>
                    {searchTerm && (
                      <p className="text-sm text-gray-500">
                        {filteredTransactions?.length || 0} results for "{searchTerm}"
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}
                      className={`p-2 rounded-lg transition-colors ${
                        viewMode === 'cards' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {viewMode === 'cards' ? <Squares2X2Icon className="h-5 w-5" /> : <ListBulletIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Header */}
            <div className="hidden sm:block bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Transaction History</h3>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-1">
                      Showing {filteredTransactions?.length || 0} results for "{searchTerm}"
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button 
                    onClick={handleNewTransaction}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    New Transaction
                  </button>
                </div>
              </div>

              {/* Mobile-Responsive Transaction Statistics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <ArrowUpIcon className="h-8 w-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Receipts</p>
                      <p className="text-lg font-semibold text-green-900">
                        {(() => {
                          const transactions = (transactionsData as any)?.data?.data || (transactionsData as any)?.data;
                          return Array.isArray(transactions) ? transactions.filter((t: any) => t.transaction_type === 'receipt')?.length || 0 : 0;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <ArrowDownIcon className="h-8 w-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Payments</p>
                      <p className="text-lg font-semibold text-red-900">
                        {(() => {
                          const transactions = (transactionsData as any)?.data?.data || (transactionsData as any)?.data;
                          return Array.isArray(transactions) ? transactions.filter((t: any) => t.transaction_type === 'payment')?.length || 0 : 0;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <PhoneIcon className="h-8 w-8 text-purple-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-purple-600">Mobile Money</p>
                      <p className="text-lg font-semibold text-purple-900">
                        {(() => {
                          const transactions = (transactionsData as any)?.data?.data || (transactionsData as any)?.data;
                          return Array.isArray(transactions) ? transactions.filter((t: any) => t.payment_method === 'mobile_money')?.length || 0 : 0;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Total Volume</p>
                      <p className="text-lg font-semibold text-blue-900">
                        {(() => {
                          const transactions = (transactionsData as any)?.data?.data || (transactionsData as any)?.data;
                          return formatCurrency(Array.isArray(transactions) ? transactions.reduce((sum: number, t: any) => sum + parseFloat(t.total_amount || 0), 0) || 0 : 0);
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Transaction Cards */}
              <div className="sm:hidden space-y-3">
                {filteredTransactions?.length > 0 ? (
                  filteredTransactions.slice(0, 20).map((transaction: any) => (
                    <div key={transaction.id} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.transaction_type === 'receipt' ? 'bg-green-100 text-green-800' :
                              transaction.transaction_type === 'payment' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {transaction.transaction_type === 'receipt' ? '📈' : 
                               transaction.transaction_type === 'payment' ? '📉' : '📊'} 
                              {transaction.transaction_type}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'posted' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {transaction.transaction_number}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {transaction.narration || transaction.description || 'No description'}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              {transaction.payment_method === 'mobile_money' ? '📱' :
                               transaction.payment_method === 'cash' ? '💵' :
                               transaction.payment_method === 'bank' ? '🏦' : '💳'}
                              <span className="ml-1 capitalize">
                                {(transaction.payment_method || '').replace('_', ' ')}
                              </span>
                            </div>
                            <span>{new Date(transaction.transaction_date).toLocaleDateString()}</span>
                          </div>
                          
                          {transaction.mobile_money_provider && (
                            <div className="mt-2">
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {transaction.mobile_money_provider}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className={`text-xl font-bold ${transaction.transaction_type === 'receipt' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.transaction_type === 'receipt' ? '+' : '-'}
                            {formatCurrency(parseFloat(transaction.total_amount || 0))}
                          </div>
                          
                          <div className="flex space-x-2 mt-3">
                            <button 
                              className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                              title="View Transaction"
                              onClick={() => {
                                setQuickViewTransaction(transaction);
                                setShowQuickView(true);
                              }}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleEditTransaction(transaction)}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                              title="Edit Transaction"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No transactions found</p>
                    <p className="text-gray-400 text-sm">Try adjusting your search or create a new transaction</p>
                  </div>
                )}
              </div>

              {/* Desktop Transactions Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTransactions?.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(transaction.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.transaction_number}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {transaction.narration || transaction.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.transaction_type === 'receipt' ? 'bg-green-100 text-green-800' :
                            transaction.transaction_type === 'payment' ? 'bg-red-100 text-red-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {transaction.transaction_type === 'receipt' ? '📈' : 
                             transaction.transaction_type === 'payment' ? '📉' : '📊'} 
                            {transaction.transaction_type}
                          </span>
                               </td>
                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {transaction.payment_method === 'mobile_money' ? '📱' :
                             transaction.payment_method === 'cash' ? '💵' :
                             transaction.payment_method === 'bank' ? '🏦' : '💳'}
                            <span className="ml-1 capitalize">
                              {(transaction.payment_method || '').replace('_', ' ')}
                            </span>
                            {transaction.mobile_money_provider && (
                              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                                {transaction.mobile_money_provider}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.transaction_type === 'receipt' ? 'text-green-600' : 'text-red-600'}>
                            {transaction.transaction_type === 'receipt' ? '+' : '-'}
                            {formatCurrency(parseFloat(transaction.total_amount || 0))}
                          </span>
                               </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === 'posted' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                                 }`}>
                                   {transaction.status}
                                 </span>
                               </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-gray-600 hover:text-gray-900 mr-3"
                            title="View Transaction"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowTransactionDetailModal(true);
                            }}
                          >
                                     <EyeIcon className="h-4 w-4" />
                                   </button>
                          <button 
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Edit Transaction"
                          >
                                     <PencilIcon className="h-4 w-4" />
                                   </button>
                          <button 
                            onClick={() => handleDeleteTransaction(transaction)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Transaction"
                          >
                                     <TrashIcon className="h-4 w-4" />
                                   </button>
                               </td>
                             </tr>
                           ))}
                         </tbody>
                       </table>

                {(!filteredTransactions || filteredTransactions.length === 0) && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm ? 
                        `No transactions found matching "${searchTerm}". Try a different search term.` : 
                        'No transactions found. Create your first transaction to get started!'
                      }
                    </div>
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
        
        )}

        {/* Analytics Tab */}
        {selectedView === 'analytics' && (
          <div className="space-y-6">
            {/* Mobile Money Analytics */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                📱 Mobile Money Analytics
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Provider Breakdown */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Provider Performance</h4>
                  <div className="space-y-3">
                    {(mobileMoneyData as any)?.data?.provider_breakdown?.map((provider: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 rounded-full mr-3 ${
                            provider.mobile_money_provider === 'MTN' ? 'bg-yellow-400' :
                            provider.mobile_money_provider === 'Airtel' ? 'bg-red-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className="font-medium">{provider.mobile_money_provider}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold">
                            {formatCurrency(provider.total_volume)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {provider.transaction_count} transactions
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Volume Trends */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3">Volume Trends (Last 30 Days)</h4>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {(mobileMoneyData as any)?.data?.daily_volume_trend?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Active Days</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Flow Analysis */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                💰 Cash Flow Analysis
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(cashFlowData as any)?.data?.net_cash_flow?.slice(-6).map((flow: any, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">{flow.month}</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Inflow:</span>
                        <span className="font-medium">{formatCurrency(flow.inflow)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Outflow:</span>
                        <span className="font-medium">{formatCurrency(flow.outflow)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-medium">Net Flow:</span>
                        <span className={`font-bold ${flow.net_flow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(flow.net_flow)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Receivables Aging */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                📋 Accounts Receivable Aging
              </h3>
              
              {receivableLoading ? (
                <LoadingSpinner />
              ) : receivableData && (receivableData as any).data ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {Object.entries((receivableData as any)?.data?.aging_summary || {}).map(([period, amount]) => (
                      <div key={period} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                        <div className="text-sm text-gray-600 mb-1 capitalize">
                          {(period || '').replace('_', ' - ').replace('days', ' days')}
                        </div>
                        <div className="text-lg font-bold text-orange-600">
                          {formatCurrency(amount as number)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {period === 'current' ? 'Not due' : 
                           period === 'over_90_days' ? 'Very overdue' : 'Overdue'}
                        </div>
                      </div>
                    ))}
                  </div>

                  {(receivableData as any)?.data?.overdue_customers?.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-md font-medium text-gray-700 mb-3">Top Overdue Customers</h4>
                      <div className="space-y-2">
                        {(receivableData as any)?.data?.overdue_customers?.slice(0, 5).map((customer: any, index: number) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                            <div>
                              <div className="font-medium text-gray-900">
                                {customer.contact?.name || `Customer ${customer.contact_id}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {customer.invoice_count} invoice(s)
                              </div>
                            </div>
                            <div className="text-red-600 font-bold">
                              {formatCurrency(customer.total_overdue)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <ErrorMessage message="Could not load receivables aging data." />
              )}
            </div>

            {/* Financial Health Indicators */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                📊 Financial Health Indicators
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{financeSummary.profit_margin}%</div>
                  <div className="text-sm text-gray-600">Profit Margin</div>
                  <div className="text-xs text-green-700 mt-1">
                    {financeSummary.profit_margin > 20 ? 'Excellent' : 
                     financeSummary.profit_margin > 10 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{financeSummary.collection_rate}%</div>
                  <div className="text-sm text-gray-600">Collection Rate</div>
                  <div className="text-xs text-blue-700 mt-1">
                    {financeSummary.collection_rate > 80 ? 'Excellent' : 
                     financeSummary.collection_rate > 60 ? 'Good' : 'Needs Improvement'}
                  </div>
                </div>

                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {safePercentage(financeSummary.mobile_money_transactions, (financeSummary.cash_transactions + financeSummary.mobile_money_transactions))}%
                  </div>
                  <div className="text-sm text-gray-600">Digital Payment Adoption</div>
                  <div className="text-xs text-purple-700 mt-1">
                    Mobile vs Cash Transactions
                  </div>
                   </div>
                 </div>
               </div>
             </div>
        )}

        {selectedView === 'ai-insights' && (
          <AiInsights aiInsights={aiInsights} financialHealthScore={financialHealthScore} />
        )}

        {/* Cash Flow Forecast View */}
        {selectedView === 'cash-flow' && (
          <div className="space-y-6">
            {/* Cash Flow Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <TrendingUpIcon className="h-8 w-8 mr-3" />
                    Cash Flow Forecast
                  </h2>
                  <p className="text-green-100 mt-2">
                    AI-powered predictive cash flow analysis with multiple scenarios
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{formatCurrency(cashFlowForecast[0]?.net_cashflow || 0)}</div>
                  <div className="text-green-200 text-sm">Next Month Forecast</div>
                </div>
              </div>
            </div>

            {/* Cash Flow Forecast Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cashFlowForecast.map((forecast, index) => (
                <div key={forecast.period} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {new Date(forecast.period).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      forecast.confidence > 85 ? 'bg-green-100 text-green-800' :
                      forecast.confidence > 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {forecast.confidence}% confidence
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Projected Inflow:</span>
                      <span className="text-sm font-medium text-green-600">{formatCurrency(forecast.projected_inflow)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Projected Outflow:</span>
                      <span className="text-sm font-medium text-red-600">{formatCurrency(forecast.projected_outflow)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-900">Net Cash Flow:</span>
                        <span className={`text-sm font-bold ${forecast.net_cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(forecast.net_cashflow)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Scenarios */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Scenarios:</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600">Optimistic:</span>
                        <span className="font-medium">{formatCurrency(forecast.scenarios.optimistic)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Realistic:</span>
                        <span className="font-medium">{formatCurrency(forecast.scenarios.realistic)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-red-600">Pessimistic:</span>
                        <span className="font-medium">{formatCurrency(forecast.scenarios.pessimistic)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interactive Cash Flow Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Cash Flow Trend Analysis</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Inflow</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Outflow</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Net</span>
                  </div>
                </div>
              </div>
              <div className="h-80">
                <Bar data={cashFlowChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        )}

        {/* Multi-Currency View */}
        {selectedView === 'currencies' && (
          <div className="space-y-6">
            {/* Currency Header */}
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold flex items-center">
                    <GlobeAsiaAustraliaIcon className="h-8 w-8 mr-3" />
                    Multi-Currency Management
                  </h2>
                  <p className="text-blue-100 mt-2">
                    Real-time exchange rates and multi-currency financial tracking
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{exchangeRates.length}</div>
                  <div className="text-blue-200 text-sm">Active Currencies</div>
                </div>
              </div>
            </div>

            {/* Exchange Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {exchangeRates.map((rate) => (
                <div key={rate.currency_pair} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{rate.currency_pair}</h3>
                    <span className={`flex items-center text-sm ${
                      rate.change_24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {rate.change_24h >= 0 ? <TrendingUpIcon className="h-4 w-4 mr-1" /> : <TrendingDownIcon className="h-4 w-4 mr-1" />}
                      {safeNumber(Math.abs(rate.change_24h), 0)}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {safeNumber(rate.rate, 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Updated: {new Date(rate.last_updated).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Currency Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Distribution by Currency</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { currency: 'UGX', amount: financeSummary.total_liquid_assets * 0.65, percentage: 65 },
                    { currency: 'USD', amount: financeSummary.total_liquid_assets * 0.23, percentage: 23 },
                    { currency: 'EUR', amount: financeSummary.total_liquid_assets * 0.08, percentage: 8 },
                    { currency: 'KES', amount: financeSummary.total_liquid_assets * 0.04, percentage: 4 }
                  ].map((item) => (
                    <div key={item.currency} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <span className="font-medium text-gray-900">{item.currency}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(item.amount, item.currency)}</div>
                        <div className="text-sm text-gray-500">{safeNumber(item.percentage, 0)}%</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-64">
                  <Doughnut data={currencyDistributionData} options={pieOptions} />
                </div>
              </div>
            </div>

            {/* Mobile Money Integration Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mobile Money Integration Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { provider: 'MTN Mobile Money', status: 'Ready for Integration', color: 'yellow' },
                  { provider: 'Airtel Money', status: 'Ready for Integration', color: 'red' },
                  { provider: 'M-Pesa', status: 'Coming Soon', color: 'green' }
                ].map((item) => (
                  <div key={item.provider} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{item.provider}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'Ready for Integration' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {item.status === 'Ready for Integration' 
                        ? 'API integration endpoints configured and ready'
                        : 'Integration planned for next release'
                      }
                    </p>
                  </div>
                ))}
                 </div>
               </div>
             </div>
        )}

        {/* Periods & Audit View */}
        {selectedView === 'periods-audit' && (
          <div className="space-y-6">
            <FinancialPeriods />
            <AuditTrail auditable_id={1} auditable_type="App\Models\Transaction" />
          </div>
        )}

        {/* Quick View Modal for Mobile Transactions */}
        {showQuickView && quickViewTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{quickViewTransaction.transaction_number}</h3>
                    <p className="text-green-100 text-sm">{quickViewTransaction.transaction_type}</p>
                  </div>
                  <button
                    onClick={() => setShowQuickView(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
              
              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Amount */}
                <div className="text-center mb-6">
                  <p className={`text-3xl font-bold ${
                    quickViewTransaction.transaction_type === 'receipt' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {quickViewTransaction.transaction_type === 'receipt' ? '+' : '-'}
                    {formatCurrency(parseFloat(quickViewTransaction.total_amount || 0))}
                  </p>
                  <div className="mt-2 flex justify-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                      quickViewTransaction.transaction_type === 'receipt' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {quickViewTransaction.transaction_type === 'receipt' ? '📈' : '📉'} 
                      {quickViewTransaction.transaction_type}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                      quickViewTransaction.status === 'posted' ? 'bg-green-100 text-green-800' :
                      quickViewTransaction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quickViewTransaction.status}
                    </span>
                  </div>
                </div>
                
                {/* Transaction Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Date</span>
                    <span className="text-gray-900">{new Date(quickViewTransaction.transaction_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Payment Method</span>
                    <div className="flex items-center">
                      {quickViewTransaction.payment_method === 'mobile_money' ? '📱' :
                       quickViewTransaction.payment_method === 'cash' ? '💵' :
                       quickViewTransaction.payment_method === 'bank' ? '🏦' : '💳'}
                      <span className="ml-2 capitalize">
                        {(quickViewTransaction.payment_method || '').replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  {quickViewTransaction.mobile_money_provider && (
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Provider</span>
                      <span className="text-gray-900">{quickViewTransaction.mobile_money_provider}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Description</span>
                    <span className="text-gray-900 text-right max-w-xs">
                      {quickViewTransaction.narration || quickViewTransaction.description || 'No description'}
                    </span>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setShowQuickView(false);
                      setSelectedTransaction(quickViewTransaction);
                      setShowTransactionDetailModal(true);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <EyeIcon className="h-5 w-5 mr-2" />
                    View Full Details
                  </button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => {
                        setShowQuickView(false);
                        handleEditTransaction(quickViewTransaction);
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowQuickView(false);
                        if (confirm('Are you sure you want to delete this transaction?')) {
                          handleDeleteTransaction(quickViewTransaction);
                        }
                      }}
                      className="flex items-center justify-center px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={handleTransactionModalClose}
          transaction={editingTransaction}
          onSuccess={handleTransactionSuccess}
        />

        {/* Account Modal */}
        <AccountModal
          isOpen={showAccountModal}
          onClose={handleAccountModalClose}
          onSuccess={handleAccountSuccess}
          account={editingAccount}
        />

        <DimensionsModal
          isOpen={showDimensionsModal}
          onClose={() => setShowDimensionsModal(false)}
        />

        <TransactionDetailModal
          isOpen={showTransactionDetailModal}
          onClose={() => setShowTransactionDetailModal(false)}
          transaction={selectedTransaction}
        />

        {/* Account Info Modal */}
        <AccountInfoModal
          isOpen={showAccountInfoModal}
          onClose={() => setShowAccountInfoModal(false)}
        />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
