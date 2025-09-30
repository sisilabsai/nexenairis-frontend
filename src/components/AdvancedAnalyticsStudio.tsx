'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  PrinterIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  Bars3Icon,
  AdjustmentsHorizontalIcon,
  EyeIcon,
  EyeSlashIcon,
  CubeIcon,
  TableCellsIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  BeakerIcon,
  LightBulbIcon,
  CpuChipIcon,
  DocumentTextIcon,
  PhotoIcon,
  CalendarIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';
import { useAdvancedAnalyticsQuery, useExportAnalytics } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import AnalyticsCharts, {
  RevenueTrendChart,
  OrdersComparisonChart,
  PerformanceOverviewChart,
  CustomerSegmentationChart,
  CorrelationAnalysisChart
} from './AnalyticsCharts';

interface AnalyticsQuery {
  id: string;
  query: string;
  timestamp: Date;
  results: any[];
  insights: string[];
  recommendations?: string[];
  metadata: any;
}

interface DragItem {
  id: string;
  type: 'metric' | 'dimension' | 'filter';
  name: string;
  value?: any;
  icon?: any;
  color?: string;
}

export default function AdvancedAnalyticsStudio() {
  const [activeTab, setActiveTab] = useState<'chat' | 'visualize' | 'export'>('chat');
  const [chatMessages, setChatMessages] = useState<AnalyticsQuery[]>([]);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['revenue', 'orders']);
  const [groupBy, setGroupBy] = useState('date');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [filters, setFilters] = useState<{
    customer_type?: string;
    min_amount?: number;
    max_amount?: number;
    product_category?: string;
  }>({});
  const [draggedItems, setDraggedItems] = useState<DragItem[]>([]);
  const [visualizationType, setVisualizationType] = useState<'table' | 'chart' | 'insights'>('table');
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'pdf'>('json');

  const chatEndRef = useRef<HTMLDivElement>(null);
  const advancedQuery = useAdvancedAnalyticsQuery();
  const exportAnalytics = useExportAnalytics();

  const availableMetrics = [
    { id: 'revenue', name: 'Revenue', icon: CurrencyDollarIcon, color: 'green' },
    { id: 'orders', name: 'Orders', icon: ShoppingCartIcon, color: 'blue' },
    { id: 'customers', name: 'Customers', icon: UserGroupIcon, color: 'purple' },
    { id: 'avg_order_value', name: 'Avg Order Value', icon: CalculatorIcon, color: 'emerald' },
    { id: 'items_sold', name: 'Items Sold', icon: CubeIcon, color: 'orange' }
  ];

  const availableDimensions = [
    { id: 'date', name: 'Date', icon: CalendarIcon },
    { id: 'month', name: 'Month', icon: CalendarIcon },
    { id: 'week', name: 'Week', icon: CalendarIcon },
    { id: 'customer', name: 'Customer', icon: UserGroupIcon }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const generateConversationalResponse = (query: string, data: any) => {
    const query_lower = query.toLowerCase();

    // Conversational responses based on query type
    if (query_lower.includes('top') && query_lower.includes('product')) {
      return "Based on your sales data, here are your best-performing products. I've analyzed the transaction data and sorted them by total revenue generated.";
    }

    if (query_lower.includes('trend') || query_lower.includes('over time')) {
      return "I've analyzed your sales trends over the selected period. The data shows some interesting patterns in your revenue and order volumes.";
    }

    if (query_lower.includes('revenue') || query_lower.includes('sales')) {
      const totalRevenue = data.results?.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0) || 0;
      return `I've crunched the numbers for you! Your total revenue for this period is UGX ${totalRevenue.toLocaleString()}. Here's a detailed breakdown of your sales performance.`;
    }

    if (query_lower.includes('customer') || query_lower.includes('client')) {
      return "Let me analyze your customer data. I can see patterns in customer behavior and purchasing habits that might be valuable for your business strategy.";
    }

    if (query_lower.includes('compare') || query_lower.includes('vs')) {
      return "I've compared the metrics you requested. This comparison should help you understand the relationships between different aspects of your business performance.";
    }

    // Default conversational response
    return `I've analyzed your data for "${query}". Here are the key insights and patterns I found in your sales performance.`;
  };

  const handleSendQuery = async () => {
    if (!currentQuery.trim()) return;

    setIsTyping(true);
    const queryId = Date.now().toString();

    try {
      const result = await advancedQuery.mutateAsync({
        query: currentQuery,
        filters,
        group_by: groupBy,
        metrics: selectedMetrics,
        date_range: dateRange
      });

      const data = (result as any).data || {};

      // Generate conversational insights if AI insights are not available
      let enhancedInsights = (data.insights && Array.isArray(data.insights)) ? data.insights : [];
      if (enhancedInsights.length === 0) {
        enhancedInsights = [
          generateConversationalResponse(currentQuery, data),
          "The data shows clear patterns that can help optimize your business strategy.",
          "I've identified key performance indicators that deserve your attention."
        ];
      }

      // Add contextual recommendations if not provided by AI
      let recommendations = (data.recommendations && Array.isArray(data.recommendations)) ? data.recommendations : [];
      if (recommendations.length === 0) {
        recommendations = [
          "Consider focusing on your highest-performing products to maximize revenue.",
          "Monitor customer purchasing patterns to identify upselling opportunities.",
          "Use these insights to optimize your inventory management strategy."
        ];
      }

      const newQuery: AnalyticsQuery = {
        id: queryId,
        query: currentQuery,
        timestamp: new Date(),
        results: data.results || [],
        insights: enhancedInsights,
        recommendations: recommendations,
        metadata: data.metadata || {}
      };

      setChatMessages(prev => [...prev, newQuery]);
      setCurrentQuery('');
      setShowWelcome(false); // Hide welcome message after first query

      // Auto-suggest follow-up questions
      setTimeout(() => {
        if (chatMessages.length === 0) { // First query
          setCurrentQuery("What are my top selling products?");
        }
      }, 2000);

    } catch (error) {
      console.error('Query failed:', error);

      // Add error message to chat
      const errorQuery: AnalyticsQuery = {
        id: queryId,
        query: currentQuery,
        timestamp: new Date(),
        results: [],
        insights: ["I apologize, but I encountered an error while analyzing your data. Please try rephrasing your question or check your filters."],
        recommendations: ["Try using simpler terms or check your date range and filters."],
        metadata: { error: true }
      };

      setChatMessages(prev => [...prev, errorQuery]);
      setCurrentQuery('');
    } finally {
      setIsTyping(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    try {
      const item: DragItem = JSON.parse(e.dataTransfer.getData('application/json'));
      setDraggedItems(prev => [...prev, item]);
    } catch (error) {
      console.error('Drop failed:', error);
    }
  };

  const handleExport = async () => {
    if (chatMessages.length === 0) return;

    try {
      const latestResults = chatMessages[chatMessages.length - 1].results;
      const result = await exportAnalytics.mutateAsync({
        format: exportFormat,
        data: latestResults
      });

      // Handle the export response
      const data = (result as any).data;
      if (data.content && data.filename) {
        const blob = new Blob([atob(data.content)], { type: data.mime_type });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderVisualization = (query: AnalyticsQuery) => {
    switch (visualizationType) {
      case 'table':
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  {selectedMetrics.map(metric => (
                    <th key={metric} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {metric.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {query.results.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.period}
                    </td>
                    {selectedMetrics.map(metric => (
                      <td key={metric} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {typeof row[metric] === 'number' ? row[metric].toLocaleString() : row[metric]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'chart':
        return (
          <div className="space-y-6">
            <AnalyticsCharts
              data={query.results}
              chartType="line"
              metrics={selectedMetrics}
              title={`Analysis: ${query.query}`}
            />
          </div>
        );

      case 'insights':
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-6 w-6 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">AI-Powered Insights</h3>
              </div>
              <div className="space-y-3">
                {query.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <SparklesIcon className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations */}
            {query.recommendations && query.recommendations.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <BeakerIcon className="h-6 w-6 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                </div>
                <div className="space-y-3">
                  {query.recommendations.map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                      <LightBulbIcon className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Configuration Notice */}
            {query.metadata?.note && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <SparklesIcon className="h-6 w-6 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Enhancement Available</h3>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    {query.metadata.note}
                  </p>
                  <div className="bg-white p-3 rounded-lg border">
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>To enable AI-powered insights:</strong>
                    </p>
                    <ol className="text-xs text-gray-600 list-decimal list-inside space-y-1">
                      <li>Get a Gemini API key from Google AI Studio</li>
                      <li>Add <code className="bg-gray-100 px-1 rounded">GEMINI_API_KEY=your_key_here</code> to your .env file</li>
                      <li>Run <code className="bg-gray-100 px-1 rounded">php artisan config:cache</code></li>
                      <li>Restart your application</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Select a visualization type above</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CpuChipIcon className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold">Advanced Analytics Studio</h2>
              <p className="text-indigo-100 text-sm">AI-Powered Data Exploration & Insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
            >
              <PrinterIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          {[
            { id: 'chat', name: 'Multi-Chat Analysis', icon: ChatBubbleLeftRightIcon },
            { id: 'visualize', name: 'Data Visualization', icon: ChartBarIcon },
            { id: 'export', name: 'Export & Print', icon: ArrowDownTrayIcon }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeTab === 'chat' && (
          <div className="space-y-6">
            {/* Drag & Drop Zone */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag metrics and dimensions here to build your query</p>
              <p className="text-sm text-gray-500">Or type your question below</p>

              {draggedItems.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {draggedItems.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                    >
                      {item.name}
                      <button
                        onClick={() => setDraggedItems(prev => prev.filter((_, i) => i !== index))}
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Available Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Available Metrics</h3>
                <div className="space-y-2">
                  {availableMetrics.map((metric) => (
                    <div
                      key={metric.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { ...metric, type: 'metric' })}
                      className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                    >
                      <metric.icon className="h-5 w-5 text-gray-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{metric.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Available Dimensions</h3>
                <div className="space-y-2">
                  {availableDimensions.map((dimension) => (
                    <div
                      key={dimension.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, { ...dimension, type: 'dimension', value: dimension.id })}
                      className="flex items-center p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                    >
                      <dimension.icon className="h-5 w-5 text-gray-500 mr-3" />
                      <span className="text-sm font-medium text-gray-900">{dimension.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-4 max-h-96 overflow-y-auto mb-4">
                {showWelcome && chatMessages.length === 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <SparklesIcon className="h-6 w-6 text-blue-500 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Welcome to AIDA Analytics Studio!</h3>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                      <p>👋 Hi! I'm AIDA, your AI Data Analyst for NEXEN AIRIS. I can help you:</p>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Analyze your sales trends and patterns</li>
                        <li>Identify top-performing products and customers</li>
                        <li>Generate insights and actionable recommendations</li>
                        <li>Create visualizations and export reports</li>
                        <li>Answer questions about your business data</li>
                      </ul>
                      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-800">
                          <strong>💡 Pro Tip:</strong> Configure your Gemini API key to unlock AI-powered insights and get even smarter analysis!
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-white rounded-lg border">
                        <p className="font-medium text-gray-900 mb-2">💡 Try asking:</p>
                        <div className="space-y-1 text-xs">
                          <button
                            onClick={() => setCurrentQuery("What's my total revenue this month?")}
                            className="block w-full text-left p-2 rounded hover:bg-gray-50 text-blue-600"
                          >
                            "What's my total revenue this month?"
                          </button>
                          <button
                            onClick={() => setCurrentQuery("Show me my top selling products")}
                            className="block w-full text-left p-2 rounded hover:bg-gray-50 text-blue-600"
                          >
                            "Show me my top selling products"
                          </button>
                          <button
                            onClick={() => setCurrentQuery("How are my sales trending?")}
                            className="block w-full text-left p-2 rounded hover:bg-gray-50 text-blue-600"
                          >
                            "How are my sales trending?"
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">Query: {msg.query}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp.toLocaleTimeString()}</span>
                    </div>

                    <div className="flex items-center space-x-4 mb-3">
                      <button
                        onClick={() => setVisualizationType('table')}
                        className={`flex items-center px-3 py-1 rounded text-xs ${
                          visualizationType === 'table' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <TableCellsIcon className="h-4 w-4 mr-1" />
                        Table
                      </button>
                      <button
                        onClick={() => setVisualizationType('chart')}
                        className={`flex items-center px-3 py-1 rounded text-xs ${
                          visualizationType === 'chart' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        Chart
                      </button>
                      <button
                        onClick={() => setVisualizationType('insights')}
                        className={`flex items-center px-3 py-1 rounded text-xs ${
                          visualizationType === 'insights' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <LightBulbIcon className="h-4 w-4 mr-1" />
                        AI Insights
                      </button>
                    </div>

                    {renderVisualization(msg)}
                  </div>
                ))}

                {isTyping && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      <span className="text-sm text-gray-600">Analyzing your data...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                  placeholder="Ask me anything about your sales data... (e.g., 'What's my best selling product?' or 'How are sales trending?')"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendQuery}
                  disabled={!currentQuery.trim() || isTyping}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'visualize' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <RevenueTrendChart data={chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].results : []} />
              </div>

              {/* Orders vs Customers Chart */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <OrdersComparisonChart data={chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].results : []} />
              </div>

              {/* Performance Overview */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <PerformanceOverviewChart data={chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].results : []} />
              </div>

              {/* Customer Segmentation */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <CustomerSegmentationChart data={chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].results : []} />
              </div>
            </div>

            {/* Correlation Analysis */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <CorrelationAnalysisChart data={chatMessages.length > 0 ? chatMessages[chatMessages.length - 1].results : []} />
            </div>

            {/* Chart Type Selector */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Type Selector</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { type: 'line', name: 'Line Chart', icon: PresentationChartLineIcon, description: 'Trend analysis' },
                  { type: 'area', name: 'Area Chart', icon: ChartBarIcon, description: 'Volume visualization' },
                  { type: 'bar', name: 'Bar Chart', icon: Bars3Icon, description: 'Comparison view' },
                  { type: 'pie', name: 'Pie Chart', icon: ChartPieIcon, description: 'Distribution view' }
                ].map((chartType) => (
                  <button
                    key={chartType.type}
                    onClick={() => {
                      // This would trigger a re-render with the selected chart type
                      setVisualizationType('chart');
                    }}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-colors text-left"
                  >
                    <chartType.icon className="h-8 w-8 text-indigo-500 mb-2" />
                    <div className="font-medium text-gray-900">{chartType.name}</div>
                    <div className="text-sm text-gray-500">{chartType.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Chart Builder */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Chart Builder</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="line">Line Chart</option>
                    <option value="bar">Bar Chart</option>
                    <option value="area">Area Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="scatter">Scatter Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    <option value="period">Period</option>
                    <option value="date">Date</option>
                    <option value="month">Month</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis Metrics</label>
                  <select multiple className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                    {availableMetrics.map(metric => (
                      <option key={metric.id} value={metric.id}>{metric.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  Generate Custom Chart
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Export Your Analytics</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  { format: 'json', name: 'JSON', icon: DocumentTextIcon, description: 'Raw data format' },
                  { format: 'csv', name: 'CSV', icon: TableCellsIcon, description: 'Spreadsheet compatible' },
                  { format: 'pdf', name: 'PDF', icon: PhotoIcon, description: 'Formatted report' }
                ].map((option) => (
                  <button
                    key={option.format}
                    onClick={() => setExportFormat(option.format as any)}
                    className={`p-4 border rounded-lg text-left hover:bg-gray-50 transition-colors ${
                      exportFormat === option.format ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    }`}
                  >
                    <option.icon className="h-6 w-6 text-gray-500 mb-2" />
                    <div className="font-medium text-gray-900">{option.name}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleExport}
                  disabled={chatMessages.length === 0 || exportAnalytics.isPending}
                  className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exportAnalytics.isPending ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : (
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  )}
                  Export {exportFormat.toUpperCase()}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group By</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                {availableDimensions.map((dim) => (
                  <option key={dim.id} value={dim.id}>{dim.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
              <select
                value={filters.customer_type || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, customer_type: e.target.value || undefined }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Customers</option>
                <option value="registered">Registered Only</option>
                <option value="walk_in">Walk-in Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Amount</label>
              <input
                type="number"
                value={filters.min_amount || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, min_amount: e.target.value ? parseFloat(e.target.value) : undefined }))}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
