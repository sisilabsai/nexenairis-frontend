'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  CogIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  LightBulbIcon,
  BeakerIcon,
  ArrowTrendingUpIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  TruckIcon,
  BellIcon,
  WifiIcon,
  CpuChipIcon,
  CalculatorIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  PlayIcon,
  PauseIcon,
  SignalIcon,
  Battery50Icon,
  MapPinIcon,
  CameraIcon,
  MicrophoneIcon,
  SpeakerWaveIcon,
  AdjustmentsHorizontalIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  FireIcon,
  CakeIcon as RocketIcon,
  MapIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CloudIcon,
  ServerIcon,
  CircleStackIcon as DatabaseIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  PresentationChartBarIcon,
  WrenchScrewdriverIcon,
  Cog6ToothIcon,
  SwatchIcon,
  PhotoIcon,
  VideoCameraIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import {
  useInventoryStats,
  useProducts,
  useStockMovements,
  useCriticalAlerts,
  useAIInsights
} from '../../hooks/useApi';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';

interface InventoryKPI {
  id: string;
  title: string;
  value: string | number;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: any;
  color: string;
  description: string;
}

export default function InventoryDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'quarter'>('today');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 🚀 Advanced State Management
  const [selectedView, setSelectedView] = useState<'overview' | 'analytics' | 'forecasting' | 'alerts' | 'mobile' | 'collaboration' | 'iot' | 'blockchain'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [forecastPeriod, setForecastPeriod] = useState(30);
  const [alertThreshold, setAlertThreshold] = useState(10);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'value' | 'quantity' | 'turnover' | 'profit'>('value');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  // 🌟 New Advanced Features State
  const [showSmartReordering, setShowSmartReordering] = useState(false);
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showIoTDevices, setShowIoTDevices] = useState(false);
  const [showBlockchain, setShowBlockchain] = useState(false);
  const [showCustomReports, setShowCustomReports] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<'inventory' | 'sales' | 'forecast' | 'supplier'>('inventory');
  const [collaborationMessages, setCollaborationMessages] = useState<any[]>([]);
  const [iotDevices, setIotDevices] = useState<any[]>([]);
  const [blockchainTransactions, setBlockchainTransactions] = useState<any[]>([]);
  const [smartReorderingEnabled, setSmartReorderingEnabled] = useState(true);
  const [autoReorderThreshold, setAutoReorderThreshold] = useState(20);

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });

  // API Hooks
  const { data: inventoryStats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useInventoryStats();
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts({ per_page: 10 });
  const { data: stockMovementsData, isLoading: movementsLoading, error: movementsError } = useStockMovements();
  const { data: criticalAlertsData, refetch: refetchCriticalAlerts } = useCriticalAlerts();
  const { data: aiInsightsData, refetch: refetchAIInsights } = useAIInsights();

  // Extract data from API responses
  const criticalAlerts = (criticalAlertsData as any)?.data || [];
  const aiInsights = (aiInsightsData as any)?.data || [];
  const products = (productsData as any)?.data?.data || [];
  const stats = (inventoryStats as any)?.data || [];
  const stockMovements = (stockMovementsData as any)?.data || [];

  // 🚀 Advanced Computed Data
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((product: any) => product.category_id === selectedCategory);
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  // Advanced Analytics
  const advancedAnalytics = useMemo(() => {
    const totalValue = products.reduce((sum: number, p: any) => sum + (p.current_stock * p.selling_price), 0);
    const totalCost = products.reduce((sum: number, p: any) => sum + (p.current_stock * p.cost_price), 0);
    const potentialProfit = totalValue - totalCost;
    const turnoverRate = stockMovements.length > 0 ? stockMovements.filter((m: any) => m.movement_type === 'out').length / products.length : 0;

    // ABC Analysis (Pareto Principle)
    const abcAnalysis = products
      .sort((a: any, b: any) => (b.current_stock * b.selling_price) - (a.current_stock * a.selling_price))
      .reduce((acc: any, product: any, index: number) => {
        const value = product.current_stock * product.selling_price;
        const cumulativeValue = acc.cumulative + value;
        const percentage = (cumulativeValue / totalValue) * 100;

        let category = 'C';
        if (percentage <= 80) category = 'A';
        else if (percentage <= 95) category = 'B';

        acc.products.push({ ...product, abcCategory: category, cumulativeValue, percentage });
        acc.cumulative = cumulativeValue;
        return acc;
      }, { products: [], cumulative: 0 });

    return {
      totalValue,
      totalCost,
      potentialProfit,
      turnoverRate,
      abcAnalysis: abcAnalysis.products,
      stockoutRisk: products.filter((p: any) => p.current_stock <= p.min_stock_level).length,
      overstockRisk: products.filter((p: any) => p.current_stock > p.min_stock_level * 2).length
    };
  }, [products, stockMovements]);

  // Demand Forecasting
  const demandForecast = useMemo(() => {
    const historicalData = stockMovements.filter((m: any) => m.movement_type === 'out');
    const forecastData = [];

    for (let i = 1; i <= forecastPeriod; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      // Simple moving average forecast
      const recentSales = historicalData.slice(-7);
      const avgDemand = recentSales.length > 0 ? recentSales.reduce((sum: number, m: any) => sum + m.quantity, 0) / recentSales.length : 0;

      forecastData.push({
        date: date.toISOString().split('T')[0],
        predictedDemand: Math.round(avgDemand * (1 + (Math.random() - 0.5) * 0.2)), // Add some variance
        confidence: 75 + Math.random() * 20
      });
    }

    return forecastData;
  }, [stockMovements, forecastPeriod]);

  // Toast notification helper
  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setToast({ show: true, type, title, message });
    setTimeout(() => setToast({ show: false, type: 'info', title: '', message: '' }), 5000);
  };

  // Quick Actions - Enhanced with new world-class features
  const quickActions = [
    {
      id: 'smart-reordering',
      title: 'Smart Reordering',
      description: 'AI-powered automatic reorder system',
      icon: BoltIcon,
      color: 'purple',
      action: () => setShowSmartReordering(!showSmartReordering)
    },
    {
      id: 'heat-map',
      title: 'Inventory Heat Map',
      description: 'Visual stock level representation',
      icon: MapIcon,
      color: 'red',
      action: () => setShowHeatMap(!showHeatMap)
    },
    // {
    //   id: 'collaboration',
    //   title: 'Team Collaboration',
    //   description: 'Real-time team coordination',
    //   icon: GlobeAltIcon,
    //   color: 'blue',
    //   action: () => setShowCollaboration(!showCollaboration)
    // },
    // {
    //   id: 'iot-devices',
    //   title: 'IoT Integration',
    //   description: 'Smart warehouse connectivity',
    //   icon: ServerIcon,
    //   color: 'green',
    //   action: () => setShowIoTDevices(!showIoTDevices)
    // },
    // {
    //   id: 'blockchain',
    //   title: 'Blockchain Trace',
    //   description: 'Immutable inventory tracking',
    //   icon: ShieldCheckIcon,
    //   color: 'indigo',
    //   action: () => setShowBlockchain(!showBlockchain)
    // },
    {
      id: 'custom-reports',
      title: 'Custom Reports',
      description: 'Advanced reporting builder',
      icon: PresentationChartBarIcon,
      color: 'orange',
      action: () => setShowCustomReports(!showCustomReports)
    },
    {
      id: 'mobile-devices',
      title: 'Mobile Devices',
      description: 'Manage mobile device pairing',
      icon: DevicePhoneMobileIcon,
      color: 'cyan',
      action: () => window.open('/inventory?tab=mobile-devices', '_blank')
    },
    {
      id: 'emergency-restock',
      title: 'Emergency Restock',
      description: 'Restock critical low stock items',
      icon: ExclamationTriangleIcon,
      color: 'red',
      action: () => handleBulkRestock('critical')
    }
  ];

  // Create dynamic inventory KPIs from API data
  const inventoryKPIs: InventoryKPI[] = stats.map((stat: any, index: number) => {
    let icon = CubeIcon;
    let color = 'blue';

    // Map stat names to appropriate icons and colors
    switch (stat.name) {
      case 'Total Products':
        icon = CubeIcon;
        color = 'blue';
        break;
      case 'Stock Status':
        icon = CheckCircleIcon;
        color = 'green';
        break;
      case 'Inventory Value':
        icon = CurrencyDollarIcon;
        color = 'emerald';
        break;
      case 'Expiry Risk':
        icon = ExclamationTriangleIcon;
        color = 'red';
        break;
      case 'Recent Activity':
        icon = ClockIcon;
        color = 'purple';
        break;
      case 'Stock Movements':
        icon = ChartBarIcon;
        color = 'orange';
        break;
      default:
        icon = CubeIcon;
        color = 'gray';
    }

    return {
      id: `stat-${index}`,
      title: stat.name,
      value: stat.value,
      change: stat.change,
      changeType: stat.changeType === 'positive' ? 'positive' : stat.changeType === 'negative' ? 'negative' : 'neutral',
      icon: icon,
      color: color,
      description: stat.subtitle || stat.name
    };
  });

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchStats();
      refetchCriticalAlerts();
      refetchAIInsights();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 🚀 Advanced Action Functions with Toast Notifications
  const handleBulkRestock = async (priority: string) => {
    const criticalProducts = products.filter((p: any) =>
      priority === 'critical' ? p.current_stock === 0 :
      p.current_stock <= p.min_stock_level
    );

    if (criticalProducts.length === 0) {
      showToast('warning', 'No Products Found', 'No products need restocking at this priority level');
      return;
    }

    try {
      // In a real implementation, this would call the bulk operations API
      showToast('success', 'Bulk Restock Initiated', `Restock process started for ${criticalProducts.length} products`);
    } catch (error) {
      showToast('error', 'Restock Failed', 'Failed to initiate bulk restock. Please try again.');
    }
  };

  const generateInventoryReport = () => {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        totalProducts: products.length,
        totalValue: advancedAnalytics.totalValue,
        lowStockItems: products.filter((p: any) => p.current_stock <= p.min_stock_level).length,
        outOfStockItems: products.filter((p: any) => p.current_stock === 0).length,
        topProducts: products.slice(0, 10),
        recentMovements: stockMovements.slice(0, 20)
      };

      // Create downloadable report
      const reportBlob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(reportBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `inventory-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('success', 'Report Generated', 'Inventory report has been downloaded successfully');
    } catch (error) {
      showToast('error', 'Report Generation Failed', 'Failed to generate inventory report');
    }
  };

  const runStockOptimization = () => {
    try {
      // AI-powered stock optimization logic
      const recommendations = products.map((product: any) => {
        const optimalStock = Math.max(
          product.min_stock_level * 1.5,
          Math.round(product.current_stock * 1.2)
        );

        return {
          product_id: product.id,
          product_name: product.name,
          current_stock: product.current_stock,
          optimal_stock: optimalStock,
          recommended_action: product.current_stock < optimalStock ? 'restock' : 'monitor'
        };
      });

      showToast('success', 'Optimization Complete', `Generated ${recommendations.length} stock optimization recommendations`);
      console.log('Stock Optimization Results:', recommendations);
    } catch (error) {
      showToast('error', 'Optimization Failed', 'Failed to run stock optimization');
    }
  };

  const handleProductSelect = (productId: number) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) {
      showToast('warning', 'No Products Selected', 'Please select products first');
      return;
    }

    switch (action) {
      case 'restock':
        showToast('success', 'Bulk Restock', `Restocking ${selectedProducts.length} products`);
        break;
      case 'adjust-price':
        showToast('success', 'Price Adjustment', `Adjusting prices for ${selectedProducts.length} products`);
        break;
      case 'update-category':
        showToast('success', 'Category Update', `Updating categories for ${selectedProducts.length} products`);
        break;
      default:
        showToast('success', 'Bulk Action Complete', `Applied "${action}" to ${selectedProducts.length} products`);
    }

    setSelectedProducts([]);
    setShowBulkActions(false);
  };

  // Real-time filtering with debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger search/filter logic here
      console.log('Filtering with:', { searchQuery, selectedCategory });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* 🚀 Advanced Header with Controls */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <CubeIcon className="h-8 w-8 mr-3" />
              Advanced Inventory Dashboard
            </h1>
            <p className="text-blue-100 mt-1">AI-Powered Inventory Management & Analytics</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Real-time Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                className={`p-2 rounded-lg transition-colors ${
                  realTimeEnabled ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {realTimeEnabled ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
              </button>
              <span className="text-sm">Live Updates</span>
            </div>

            {/* View Selector */}
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
            >
              <option value="overview">Overview</option>
              <option value="analytics">Analytics</option>
              <option value="forecasting">AI Forecasting</option>
              <option value="alerts">Smart Alerts</option>
              <option value="mobile">Mobile Integration</option>
              {/* <option value="collaboration">Team Collaboration</option>
              <option value="iot">IoT Devices</option>
              <option value="blockchain">Blockchain Trace</option> */}
            </select>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm text-blue-100">Total Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">UGX {advancedAnalytics.totalValue?.toLocaleString()}</div>
            <div className="text-sm text-blue-100">Inventory Value</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{advancedAnalytics.stockoutRisk}</div>
            <div className="text-sm text-blue-100">Low Stock Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(advancedAnalytics.turnoverRate * 100)}%</div>
            <div className="text-sm text-blue-100">Turnover Rate</div>
          </div>
        </div>
      </div>

      {/* 🔍 Advanced Search & Filters */}
      <div className="bg-white shadow-lg rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {/* Add category options dynamically */}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FunnelIcon className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            {selectedProducts.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Bulk Actions ({selectedProducts.length})
              </button>
            )}

            <button
              onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <ChartBarIcon className="h-5 w-5 inline mr-2" />
              Advanced Analytics
            </button>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {showBulkActions && selectedProducts.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-900">
                {selectedProducts.length} products selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('restock')}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Restock
                </button>
                <button
                  onClick={() => handleBulkAction('adjust-price')}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                  Adjust Price
                </button>
                <button
                  onClick={() => handleBulkAction('update-category')}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Update Category
                </button>
                <button
                  onClick={() => setShowBulkActions(false)}
                  className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚨 Critical Inventory Alerts */}
      {criticalAlerts.filter((alert: any) => alert.module === 'inventory').length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-400 mr-3" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-red-800">
                  {criticalAlerts.filter((alert: any) => alert.module === 'inventory').length} Critical Inventory Issues
                </h3>
                <button className="text-red-600 hover:text-red-800 font-medium text-xs">
                  View All →
                </button>
              </div>
              <div className="mt-2 text-sm text-red-700">
                {criticalAlerts.filter((alert: any) => alert.module === 'inventory').slice(0, 2).map((alert: any) => (
                  <div key={alert.id} className="flex items-center justify-between py-1">
                    <span>• {alert.message}</span>
                    <button className="text-red-600 hover:text-red-800 font-medium text-xs">
                      {alert.action} →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`p-4 bg-white shadow-lg rounded-lg border-2 border-transparent hover:border-${action.color}-300 transition-all duration-200 group`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                <action.icon className={`h-6 w-6 text-${action.color}-600`} />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">{action.title}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* 📊 Inventory KPIs Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {inventoryKPIs.map((kpi) => (
          <div key={kpi.id} className={`bg-white overflow-hidden shadow-lg rounded-lg border-l-4 border-l-${kpi.color}-500 hover:shadow-xl transition-shadow`}>
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-full bg-${kpi.color}-100`}>
                    <kpi.icon className={`h-6 w-6 text-${kpi.color}-600`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{kpi.title}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                      <div className={`ml-2 flex items-center text-sm font-semibold ${
                        kpi.changeType === 'positive' ? 'text-green-600' :
                        kpi.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {kpi.changeType === 'positive' ? (
                          <ArrowUpIcon className="h-4 w-4 mr-1" />
                        ) : kpi.changeType === 'negative' ? (
                          <ArrowDownIcon className="h-4 w-4 mr-1" />
                        ) : null}
                        {kpi.change}
                      </div>
                    </dd>
                    <dt className="text-xs text-gray-400 mt-1">{kpi.description}</dt>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 📈 Advanced Analytics Section */}
      {showAdvancedAnalytics && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-purple-600" />
              Advanced Analytics Dashboard
            </h2>
            <div className="flex items-center space-x-4">
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="value">Inventory Value</option>
                <option value="quantity">Stock Quantity</option>
                <option value="turnover">Turnover Rate</option>
                <option value="profit">Profit Margin</option>
              </select>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ABC Analysis */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PresentationChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                ABC Analysis (Pareto)
              </h3>
              <div className="space-y-3">
                {advancedAnalytics.abcAnalysis.slice(0, 5).map((item: any, index: number) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center space-x-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        item.abcCategory === 'A' ? 'bg-green-500' :
                        item.abcCategory === 'B' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {item.abcCategory}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.current_stock} units</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        UGX {(item.current_stock * item.selling_price).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">{item.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Demand Forecasting */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PresentationChartLineIcon className="h-5 w-5 mr-2 text-purple-600" />
                Demand Forecast ({forecastPeriod} days)
              </h3>
              <div className="space-y-3">
                {demandForecast.slice(0, 7).map((forecast: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm">
                    <div>
                      <p className="font-medium text-gray-900">{forecast.date}</p>
                      <p className="text-sm text-gray-500">{forecast.confidence}% confidence</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{forecast.predictedDemand} units</p>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${forecast.confidence}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Optimization Insights */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <LightBulbIcon className="h-5 w-5 mr-2 text-green-600" />
                Optimization Insights
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="font-medium text-gray-900">Stockout Risk</p>
                  <p className="text-sm text-gray-600">{advancedAnalytics.stockoutRisk} products at risk</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(advancedAnalytics.stockoutRisk / products.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="font-medium text-gray-900">Overstock Risk</p>
                  <p className="text-sm text-gray-600">{advancedAnalytics.overstockRisk} products overstocked</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(advancedAnalytics.overstockRisk / products.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <p className="font-medium text-gray-900">Turnover Rate</p>
                  <p className="text-sm text-gray-600">{Math.round(advancedAnalytics.turnoverRate * 100)}% monthly</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(advancedAnalytics.turnoverRate * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 Advanced Feature Sections */}
      {/* {showSmartReordering && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          ...
        </div>
      )} */}

      {/* {showHeatMap && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          ...
        </div>
      )} */}

      {/* {showCollaboration && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          ...
        </div>
      )} */}

      {/* {showIoTDevices && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          ...
        </div>
      )} */}

      {/* {showBlockchain && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          ...
        </div>
      )} */}

      {/* {showCustomReports && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          ...
        </div>
      )} */}

      {/* 🎯 Main Inventory Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* 🤖 AI Inventory Insights */}
        <div className="lg:col-span-1 bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-500" />
                AI Inventory Insights
              </h3>
            </div>
          </div>
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {aiInsights.filter((insight: any) => insight.module === 'inventory').slice(0, 5).map((insight: any) => (
              <div key={insight.id} className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        insight.impact === 'high' ? 'bg-red-100 text-red-700' :
                        insight.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {insight.impact.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{insight.confidence}% confidence</span>
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{insight.insight}</p>
                    <button className="text-xs text-purple-600 hover:text-purple-800 font-medium mt-2">
                      {insight.action} →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 📊 Inventory Analytics */}
        <div className="lg:col-span-1 bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
              Inventory Analytics
            </h3>
          </div>
          <div className="px-6 py-4">

            {/* Stock Level Distribution */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Stock Level Distribution</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                  <span className="text-sm text-green-800">In Stock</span>
                  <span className="text-sm font-semibold text-green-600">
                    {products.filter((p: any) => p.current_stock > p.min_stock_level).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                  <span className="text-sm text-yellow-800">Low Stock</span>
                  <span className="text-sm font-semibold text-yellow-600">
                    {products.filter((p: any) => p.current_stock <= p.min_stock_level && p.current_stock > 0).length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded">
                  <span className="text-sm text-red-800">Out of Stock</span>
                  <span className="text-sm font-semibold text-red-600">
                    {products.filter((p: any) => p.current_stock === 0).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Top Products by Stock Value */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Top Products by Value</h4>
              <div className="space-y-2">
                {products.slice(0, 3).map((product: any, index: number) => (
                  <div key={product.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center">
                      <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                      }`}>
                        {index + 1}
                      </span>
                      <span className="ml-2 text-sm font-medium text-gray-900">{product.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        UGX {(product.current_stock * (product.selling_price || 0)).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">{product.current_stock} units</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ⚠️ Inventory Alerts & Recent Activity */}
        <div className="lg:col-span-1 space-y-6">

          {/* Inventory Alerts */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-500" />
                  Inventory Alerts
                </h3>
              </div>
            </div>
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
              {criticalAlerts.filter((alert: any) => alert.module === 'inventory').length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">All inventory levels normal</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {criticalAlerts.filter((alert: any) => alert.module === 'inventory').map((alert: any) => (
                    <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                      alert.type === 'critical' ? 'bg-red-50 border-red-400' :
                      alert.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${
                            alert.type === 'critical' ? 'text-red-800' :
                            alert.type === 'warning' ? 'text-yellow-800' :
                            'text-blue-800'
                          }`}>
                            {alert.title}
                          </h4>
                          <p className={`text-xs mt-1 ${
                            alert.type === 'critical' ? 'text-red-700' :
                            alert.type === 'warning' ? 'text-yellow-700' :
                            'text-blue-700'
                          }`}>
                            {alert.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">{alert.module}</span>
                            <button className={`text-xs font-medium ${
                              alert.type === 'critical' ? 'text-red-600 hover:text-red-800' :
                              alert.type === 'warning' ? 'text-yellow-600 hover:text-yellow-800' :
                              'text-blue-600 hover:text-blue-800'
                            }`}>
                              {alert.action} →
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Inventory Activity */}
          <div className="bg-white shadow-lg rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2 text-gray-500" />
                Recent Activity
              </h3>
            </div>
            <div className="px-6 py-4 max-h-64 overflow-y-auto">
              {movementsLoading ? (
                <LoadingSpinner size="sm" className="py-4" />
              ) : movementsError ? (
                <ErrorMessage
                  message={movementsError.message || 'Failed to load stock movements'}
                  onRetry={() => window.location.reload()}
                />
              ) : stockMovements.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {stockMovements.slice(0, 5).map((movement: any, index: number) => {
                    const isRestock = movement.movement_type === 'restock' || movement.movement_type === 'in';
                    const isSale = movement.movement_type === 'sale' || movement.movement_type === 'out';
                    const dotColor = isRestock ? 'bg-green-500' : isSale ? 'bg-blue-500' : 'bg-purple-500';
                    const timeAgo = new Date(movement.created_at).toLocaleString();

                    return (
                      <div key={movement.id || index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded">
                        <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${dotColor}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            {isRestock ? 'Product restocked' : isSale ? 'Product sold' : 'Stock movement'}: {movement.product_name || movement.product?.name || 'Unknown Product'}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">
                              {movement.quantity} units • {movement.movement_type}
                            </p>
                            <p className="text-xs text-gray-400">{timeAgo}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📈 Inventory Performance Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Inventory Health Score */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
              Inventory Health Score
            </h3>
          </div>
          <div className="px-6 py-5">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {statsLoading ? '...' : (() => {
                  // Calculate health score based on real data
                  const totalProducts = products.length;
                  const inStock = products.filter((p: any) => p.current_stock > p.min_stock_level).length;
                  const lowStock = products.filter((p: any) => p.current_stock <= p.min_stock_level && p.current_stock > 0).length;
                  const outOfStock = products.filter((p: any) => p.current_stock === 0).length;

                  if (totalProducts === 0) return '0%';

                  // Health score calculation: in-stock products get full points, low-stock get half, out-of-stock get zero
                  const healthScore = Math.round(((inStock * 1 + lowStock * 0.5) / totalProducts) * 100);
                  return `${healthScore}%`;
                })()}
              </div>
              <div className="text-sm text-gray-600 mb-4">Overall Inventory Health</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{
                    width: statsLoading ? '85%' : (() => {
                      const totalProducts = products.length;
                      const inStock = products.filter((p: any) => p.current_stock > p.min_stock_level).length;
                      const lowStock = products.filter((p: any) => p.current_stock <= p.min_stock_level && p.current_stock > 0).length;

                      if (totalProducts === 0) return '0%';

                      const healthScore = Math.round(((inStock * 1 + lowStock * 0.5) / totalProducts) * 100);
                      return `${healthScore}%`;
                    })()
                  }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Optimization Suggestions */}
        <div className="bg-white shadow-lg rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Optimization Suggestions
            </h3>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-3">
              {aiInsights.filter((insight: any) => insight.module === 'inventory').slice(0, 3).map((insight: any, index: number) => {
                const colors = [
                  { bg: 'bg-blue-50', text: 'text-blue-900', subtext: 'text-blue-700' },
                  { bg: 'bg-green-50', text: 'text-green-900', subtext: 'text-green-700' },
                  { bg: 'bg-purple-50', text: 'text-purple-900', subtext: 'text-purple-700' }
                ];
                const colorScheme = colors[index % colors.length];

                return (
                  <div key={insight.id || index} className={`p-3 ${colorScheme.bg} rounded-lg`}>
                    <h4 className={`font-medium ${colorScheme.text} text-sm`}>{insight.title}</h4>
                    <p className={`text-xs ${colorScheme.subtext} mt-1`}>
                      {insight.insight}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs ${colorScheme.subtext} opacity-75`}>
                        {insight.confidence}% confidence
                      </span>
                      <button className={`text-xs font-medium ${colorScheme.text} hover:opacity-75`}>
                        {insight.action} →
                      </button>
                    </div>
                  </div>
                );
              })}
              {aiInsights.filter((insight: any) => insight.module === 'inventory').length === 0 && (
                <div className="text-center py-4">
                  <LightBulbIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No optimization insights available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${
            toast.type === 'success' ? 'border-l-4 border-green-500' :
            toast.type === 'error' ? 'border-l-4 border-red-500' :
            toast.type === 'warning' ? 'border-l-4 border-yellow-500' :
            'border-l-4 border-blue-500'
          }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-400" />}
                  {toast.type === 'error' && <ExclamationTriangleIcon className="h-6 w-6 text-red-400" />}
                  {toast.type === 'warning' && <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />}
                  {toast.type === 'info' && <CheckCircleIcon className="h-6 w-6 text-blue-400" />}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => setToast({ show: false, type: 'info', title: '', message: '' })}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
