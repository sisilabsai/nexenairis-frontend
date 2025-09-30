import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed requests 3 times
      retry: 3,
      
      // Retry delay increases exponentially
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Stale time - data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Cache time - data stays in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Auth
  auth: {
    me: ['auth', 'me'] as const,
  },
  
  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    recentActivity: ['dashboard', 'recent-activity'] as const,
  },
  
  // Finance
  finance: {
    stats: ['finance', 'stats'] as const,
    transactions: (params?: any) => ['finance', 'transactions', params] as const,
    transaction: (id: number) => ['finance', 'transactions', id] as const,
    chartOfAccounts: ['finance', 'chart-of-accounts'] as const,
    summary: ['finance', 'summary'] as const,
  },
  
  // Inventory
  inventory: {
    stats: ['inventory', 'stats'] as const,
    categories: ['inventory', 'categories'] as const,
    products: (params?: any) => ['inventory', 'products', params] as const,
    product: (id: number) => ['inventory', 'products', id] as const,
    stockItems: ['inventory', 'stock-items'] as const,
    stockMovements: ['inventory', 'stock-movements'] as const,
    lowStockAlerts: ['inventory', 'low-stock-alerts'] as const,
    summary: ['inventory', 'summary'] as const,
  },

  // AI-Powered Demand Forecasting
  demandForecasting: {
    predictions: (params?: any) => ['demand-forecasting', 'predictions', params] as const,
    reorderSuggestions: ['demand-forecasting', 'reorder-suggestions'] as const,
    supplierRecommendations: (params?: any) => ['demand-forecasting', 'supplier-recommendations', params] as const,
    analytics: ['demand-forecasting', 'analytics'] as const,
  },
  
  // Real-Time Intelligence Dashboard
  intelligence: {
    dashboard: ['intelligence', 'dashboard'] as const,
  },
  
  // Barcode Management
  barcode: {
    scanHistory: (params?: any) => ['barcode', 'scan-history', params] as const,
    analytics: ['barcode', 'analytics'] as const,
  },
  
  // Supplier Management
  suppliers: {
    list: (params?: any) => ['suppliers', 'list', params] as const,
    detail: (id: number) => ['suppliers', 'detail', id] as const,
    analytics: ['suppliers', 'analytics'] as const,
    nextCode: ['suppliers', 'next-code'] as const,
    codeSettings: ['suppliers', 'code-settings'] as const,
  },
  
  // CRM
  crm: {
    stats: ['crm', 'stats'] as const,
    contacts: (params?: any) => ['crm', 'contacts', params] as const,
    contact: (id: number) => ['crm', 'contacts', id] as const,
    salesOpportunities: ['crm', 'sales-opportunities'] as const,
    summary: ['crm', 'summary'] as const,
  },
  
  // HR
  hr: {
    stats: ['hr', 'stats'] as const,
    employees: (params?: any) => ['hr', 'employees', params] as const,
    employee: (id: number) => ['hr', 'employees', id] as const,
    departments: ['hr', 'departments'] as const,
    jobPositions: ['hr', 'job-positions'] as const,
    employeeContracts: ['hr', 'employee-contracts'] as const,
    payrollPeriods: ['hr', 'payroll-periods'] as const,
    leaveTypes: ['hr', 'leave-types'] as const,
    leaveRequests: ['hr', 'leave-requests'] as const,
    localHolidays: ['hr', 'local-holidays'] as const,
    summary: ['hr', 'summary'] as const,
  },
  
  // Projects
  projects: {
    stats: ['projects', 'stats'] as const,
    projects: (params?: any) => ['projects', 'projects', params] as const,
    project: (id: number) => ['projects', 'projects', id] as const,
    categories: ['projects', 'categories'] as const,
    phases: ['projects', 'phases'] as const,
    tasks: ['projects', 'tasks'] as const,
    summary: ['projects', 'summary'] as const,
    timeEntries: (params?: any) => ['projects', 'time-entries', params] as const,
    resources: (params?: any) => ['projects', 'resources', params] as const,
    expenses: (params?: any) => ['projects', 'expenses', params] as const,
    milestones: (params?: any) => ['projects', 'milestones', params] as const,
    issues: (params?: any) => ['projects', 'issues', params] as const,
    templates: ['projects', 'templates'] as const,
    documents: (projectId: number) => ['projects', 'documents', projectId] as const,
    dashboard: (projectId: number) => ['projects', 'dashboard', projectId] as const,
    timeline: (projectId: number) => ['projects', 'timeline', projectId] as const,
    financials: (projectId: number) => ['projects', 'financials', projectId] as const,
    advancedAnalytics: ['projects', 'analytics', 'advanced'] as const,
  },
  
  // Analytics
  analytics: {
    stats: ['analytics', 'stats'] as const,
    metrics: (params?: any) => ['analytics', 'metrics', params] as const,
    topProducts: ['analytics', 'top-products'] as const,
    recentMetrics: ['analytics', 'recent-metrics'] as const,
    performanceInsights: ['analytics', 'performance-insights'] as const,
  },
  
  // AIDA
  aida: {
    conversation: (id: string) => ['aida', 'conversations', id] as const,
    conversationMessages: (id: string) => ['aida', 'conversations', id, 'messages'] as const,
    capabilities: ['aida', 'capabilities'] as const,
  },
  
  // System
  system: {
    settings: ['system', 'settings'] as const,
    auditLogs: (params?: any) => ['system', 'audit-logs', params] as const,
    health: ['system', 'health'] as const,
    summary: ['system', 'summary'] as const,
  },
  
  // Test
  test: {
    test: ['test'] as const,
    database: ['test', 'database'] as const,
    aida: ['test', 'aida'] as const,
  },
};
