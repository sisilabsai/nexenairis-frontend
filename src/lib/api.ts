import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { Conversation } from '@/types';
import { Branch, BranchFormData } from '@/types/branch';

// API Configuration  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  next_page_url: string | null;
}

// API Service Class
class ApiService {
  setHeader(key: string, value: string) {
    this.api.defaults.headers.common[key] = value;
  }
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        console.log('🔑 API Request:', {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          token: token ? `${token.substring(0, 20)}...` : 'No token'
        });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('✅ API Response:', {
          url: response.config.url,
          status: response.status,
          data: response.data
        });
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<ApiResponse<T>> {
    try {
      // Add detailed logging for department fetching
      if (url.includes('/hr/departments')) {
        console.log('🔍 Fetching Departments:', {
          url: `${this.api.defaults.baseURL}${url}`,
          params: params,
          headers: this.api.defaults.headers,
          auth_token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
        });
      }
      
      // Add detailed logging for employees fetching
      if (url.includes('/hr/employees')) {
        console.log('👥 Fetching Employees:', {
          url: `${this.api.defaults.baseURL}${url}`,
          params: params,
          headers: this.api.defaults.headers,
          auth_token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
        });
      }
      
      const response = await this.api.get(url, { params });
      
      if (url.includes('/hr/departments')) {
        console.log('✅ Departments Fetched:', {
          status: response.status,
          data: response.data,
          // response.data is the server envelope { success, message, data }
          total_items: response.data?.data?.length || 0
        });
      }
      
      if (url.includes('/hr/employees')) {
        console.log('✅ Employees Fetched:', {
          status: response.status,
          data: response.data,
          total_items: response.data?.data?.length || 0
        });
      }
      
      return response.data;
    } catch (error) {
      if (url.includes('/hr/departments')) {
        console.error('❌ Department Fetch Error:', {
          error: error,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status
        });
      }
      
      if (url.includes('/hr/employees')) {
        console.error('❌ Employees Fetch Error:', {
          error: error,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status
        });
      }
      
      throw this.handleError(error);
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> {
    try {
      // Add detailed logging for department creation
      if (url.includes('/hr/departments')) {
        console.log('🚀 Department Creation Request:', {
          url: `${this.api.defaults.baseURL}${url}`,
          data: data,
          headers: this.api.defaults.headers,
          auth_token: localStorage.getItem('auth_token') ? 'Present' : 'Missing'
        });
      }
      
      const response = await this.api.post(url, data, config);
      
      if (url.includes('/hr/departments')) {
        console.log('✅ Department Creation Success:', response.data);
      }
      
      return response.data;
    } catch (error) {
      if (url.includes('/hr/departments')) {
        console.error('❌ Department Creation Error:', {
          error: error,
          response: (error as any)?.response?.data,
          status: (error as any)?.response?.status,
          headers: (error as any)?.response?.headers
        });
      }
      throw this.handleError(error);
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.put(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async patch<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.patch(url, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await this.api.delete(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): any {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx. We return the error data from the response.
      return {
        ...error.response.data,
        status: error.response.status,
      };
    } else if (error.request) {
      // The request was made but no response was received
      return {
        message: 'No response received from server. Please check your network connection.',
        status: 503, // Service Unavailable
      };
    } else {
      // Something happened in setting up the request that triggered an Error
      return {
        message: error.message || 'An unknown error occurred.',
        status: 500,
      };
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export const api = apiService;
export const setHeader = apiService.setHeader.bind(apiService);

// Auth API
export const authApi = {
  setHeader: apiService.setHeader.bind(apiService),
  login: (credentials: { email: string; password: string }) =>
    apiService.post<{ user: any; token: string }>('/login', credentials),

  register: (userData: { 
    name: string; 
    email: string; 
    password: string; 
    password_confirmation: string;
    phone?: string;
    position?: string;
    department?: string;
    // For new tenant registration
    company_name?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    tax_id?: string;
    // For existing tenant registration
    tenant_id?: number;
  }) =>
    apiService.post<{ user: any; token: string }>('/register', userData),

  logout: () => apiService.post('/logout'),

  me: () => apiService.get<{ user: any }>('/user'),

  refresh: () => apiService.post<{ token: string }>('/refresh'),

  updateProfile: (data: any) => apiService.post('/profile', data),

  changePassword: (data: any) => apiService.post('/change-password', data),
};

export const profileApi = {
  getProfile: () => apiService.get('/profile'),
  changePassword: (data: any) => apiService.post('/profile/change-password', data),
  getActivities: () => apiService.get('/profile/activities'),
  getPayslips: () => apiService.get('/profile/payslips'),
};

// 🚀 Enhanced Dashboard API - Production Ready
export const dashboardApi = {
  getStats: (period: string = 'today') => apiService.get(`/dashboard/stats?period=${period}`),
  getRecentActivity: () => apiService.get('/dashboard/recent-activity'),
  getCriticalAlerts: () => apiService.get('/dashboard/critical-alerts'),
  getAIInsights: () => apiService.get('/dashboard/ai-insights'),
};

// Old Finance API - removed to avoid duplication (comprehensive version below)

  // Inventory API
  export const inventoryApi = {
    getStats: () => apiService.get('/inventory/stats'),
    
    // Product Categories
    getCategories: () => apiService.get('/inventory/categories'),
    createCategory: (data: any) => apiService.post('/inventory/categories', data),
    updateCategory: (id: number, data: any) => apiService.put(`/inventory/categories/${id}`, data),
    deleteCategory: (id: number) => apiService.delete(`/inventory/categories/${id}`),
    
    // Products
    getProducts: (params?: any) => apiService.get<PaginatedResponse<any>>('/inventory/products', params),
    createProduct: (data: any) => apiService.post('/inventory/products', data),
    getProduct: (id: number) => apiService.get(`/inventory/products/${id}`),
    updateProduct: (id: number, data: any) => apiService.put(`/inventory/products/${id}`, data),
    deleteProduct: (id: number) => apiService.delete(`/inventory/products/${id}`),
    restockProduct: (id: number, data: any) => apiService.post(`/inventory/products/${id}/restock`, data),
    toggleProductStatus: (id: number) => apiService.patch(`/inventory/products/${id}/toggle-status`),
    
    // Product SKU Generation
    getNextSku: () => apiService.get('/inventory/next-sku'),
    getSkuSettings: () => apiService.get('/inventory/sku-settings'),
    updateSkuPrefix: (prefix: string) => apiService.put('/inventory/sku-settings', { prefix }),
    
    // Stock Management
    getStockItems: () => apiService.get('/inventory/stock-items'),
    getStockMovements: () => apiService.get('/inventory/stock-movements'),
    getLowStockAlerts: () => apiService.get('/inventory/low-stock-alerts'),
    getInventorySummary: () => apiService.get('/inventory/summary'),
    getUnitsOfMeasure: () => apiService.get('/inventory/unit-of-measures'),
  };

  // AI-Powered Demand Forecasting API
  export const demandForecastingApi = {
    getDemandPredictions: (params?: any) => apiService.get('/demand-forecasting/predictions', params),
    getReorderSuggestions: () => apiService.get('/demand-forecasting/reorder-suggestions'),
    getSupplierRecommendations: (params?: any) => apiService.get('/demand-forecasting/supplier-recommendations', params),
    trackSupplierPerformance: (data: any) => apiService.post('/demand-forecasting/track-supplier-performance', data),
    recordSalesData: (data: any) => apiService.post('/demand-forecasting/record-sales-data', data),
    getAnalyticsDashboard: () => apiService.get('/demand-forecasting/analytics-dashboard'),
  };

  // Real-Time Intelligence Dashboard API
  export const intelligenceApi = {
    getIntelligenceDashboard: () => apiService.get('/intelligence/dashboard'),
  };

  // Barcode Management API
  export const barcodeApi = {
    generateBarcode: (data: { product_id: number; barcode_type: string; barcode_value?: string }) =>
      apiService.post('/barcode/generate', data),
    
    scanBarcode: (data: { barcode: string; scan_location?: string; device_info?: any }) =>
      apiService.post('/barcode/scan', data),
    
    bulkGenerateBarcodes: (data: { product_ids: number[]; barcode_type: string }) =>
      apiService.post('/barcode/bulk-generate', data),
    
    getScanHistory: (params?: { product_id?: number; date_from?: string; date_to?: string; per_page?: number }) =>
      apiService.get('/barcode/scan-history', params),
    
    getBarcodeAnalytics: () => apiService.get('/barcode/analytics'),
  };

  // Supplier Management API
  export const supplierApi = {
    getSuppliers: (params?: any) => apiService.get('/suppliers', params),
    getSupplier: (id: number) => apiService.get(`/suppliers/${id}`),
    createSupplier: (data: any) => apiService.post('/suppliers', data),
    updateSupplier: (id: number, data: any) => apiService.put(`/suppliers/${id}`, data),
    deleteSupplier: (id: number) => apiService.delete(`/suppliers/${id}`),
    getAnalytics: () => apiService.get('/suppliers/analytics'),
    getOptions: (params?: { active_only?: boolean; search?: string }) => 
      apiService.get('/suppliers/options', params),
    getNextSupplierCode: () => apiService.get('/suppliers/next-code'),
    getCodeSettings: () => apiService.get('/suppliers/code-settings'),
    updateCodePrefix: (data: { prefix: string; reset_sequence?: boolean }) => 
      apiService.put('/suppliers/code-settings', data),
    bulkOperations: (data: { action: 'activate' | 'deactivate' | 'delete'; supplier_ids: number[] }) =>
      apiService.post('/suppliers/bulk', data),
    exportSuppliers: (format: 'csv' | 'json' = 'csv') => 
      apiService.get('/suppliers/export', { format }),
  };

// CRM API
export const crmApi = {
  // Contact Types Management
  getContactTypes: () => apiService.get('/crm/contact-types'),
  createContactType: (data: any) => apiService.post('/crm/contact-types', data),
  updateContactType: (id: number, data: any) => apiService.put(`/crm/contact-types/${id}`, data),
  deleteContactType: (id: number) => apiService.delete(`/crm/contact-types/${id}`),
  initializeDefaultContactTypes: () => apiService.post('/crm/contact-types/initialize-defaults'),
  
  // Contacts Management
  getContacts: (params?: any) => apiService.get<PaginatedResponse<any>>('/crm/contacts', params),
  createContact: (data: any) => apiService.post('/crm/contacts', data),
  getContact: (id: number) => apiService.get(`/crm/contacts/${id}`),
  updateContact: (id: number, data: any) => apiService.put(`/crm/contacts/${id}`, data),
  deleteContact: (id: number) => apiService.delete(`/crm/contacts/${id}`),
  exportContacts: () => apiService.get('/crm/contacts/export'),
  
  // Contact Import
  importContacts: (data: { contacts: any[], duplicate_handling: string }) => apiService.post('/crm/contacts/import', data),
  validateImportData: (data: { contacts: any[] }) => apiService.post('/crm/contacts/import/validate', data),
  getImportTemplate: () => apiService.get('/crm/contacts/import/template'),
  
  // Sales Opportunities
  getSalesOpportunities: (params?: any) => apiService.get('/crm/opportunities', params),
  createSalesOpportunity: (data: any) => apiService.post('/crm/opportunities', data),
  updateSalesOpportunity: (id: number, data: any) => apiService.put(`/crm/opportunities/${id}`, data),
  
  // Basic Summary
  getCrmSummary: () => apiService.get('/crm/summary'),
  
  // African-specific Analytics
  getMobileMoneyAnalytics: () => apiService.get('/crm/analytics/mobile-money'),
  getCommunityGroupsAnalytics: () => apiService.get('/crm/analytics/community-groups'),
  getCommunicationAnalytics: () => apiService.get('/crm/analytics/communication'),
  getRegionalInsights: () => apiService.get('/crm/analytics/regional'),

  // Sales Pipeline Stages
  getSalesPipelineStages: () => apiService.get('/crm/sales-pipeline-stages'),
  createSalesPipelineStage: (data: any) => apiService.post('/crm/sales-pipeline-stages', data),
  updateSalesPipelineStage: (id: number, data: any) => apiService.put(`/crm/sales-pipeline-stages/${id}`, data),
  deleteSalesPipelineStage: (id: number) => apiService.delete(`/crm/sales-pipeline-stages/${id}`),

  // 🤖 AI Services
  getLeadScoring: () => apiService.get('/crm/ai/lead-scoring'),
  getDealPrediction: () => apiService.get('/crm/ai/deal-prediction'),
  getCustomerSegmentation: () => apiService.get('/crm/ai/segmentation'),
  getPricingOptimization: () => apiService.get('/crm/ai/pricing-optimization'),
  getCustomer360View: (contactId: number) => apiService.get(`/crm/ai/customer-360/${contactId}`),
  getCustomerJourneyMapping: (contactId: number) => apiService.get(`/crm/ai/journey-mapping/${contactId}`),
  getVoiceOfCustomerAnalytics: () => apiService.get('/crm/ai/voice-of-customer'),
  getPersonalizationEngine: (contactId: number) => apiService.get(`/crm/ai/personalization/${contactId}`),
};

// Finance API
export const financeApi = {
  // Dashboard & Summary
  getFinanceSummary: () => apiService.get('/finance/summary'),
  
  // Chart of Accounts
  getChartOfAccounts: () => apiService.get('/finance/chart-of-accounts'),
  createAccount: (data: any) => apiService.post('/finance/chart-of-accounts', data),
  updateAccount: (id: number, data: any) => apiService.put(`/finance/chart-of-accounts/${id}`, data),
  deleteAccount: (id: number) => apiService.delete(`/finance/chart-of-accounts/${id}`),
  
  // Transactions
  getTransactions: (params?: any) => apiService.get('/finance/transactions', params),
  // The backend accepts transaction creation under the sales domain: /api/sales/transactions
  // Use the sales route to avoid 405 Method Not Allowed errors from posting to /finance/transactions
  createTransaction: (data: any) => apiService.post('/sales/transactions', data),
  updateTransaction: (id: number, data: any) => apiService.put(`/sales/transactions/${id}`, data),
  deleteTransaction: (id: number) => apiService.delete(`/sales/transactions/${id}`),
  
  // Analytics
  getMobileMoneyAnalytics: () => apiService.get('/finance/analytics/mobile-money'),
  getCashFlowAnalysis: (params?: any) => apiService.get('/finance/reports/cash-flow-statement', params),
  getReceivableAging: () => apiService.get('/finance/analytics/receivables-aging'),
  
  // Reports
  getProfitAndLoss: (params?: any) => apiService.get('/finance/reports/profit-and-loss', params),
  getBalanceSheet: (params?: any) => apiService.get('/finance/reports/balance-sheet', params),
  getStatementOfChangesInEquity: (params?: any) => apiService.get('/finance/reports/statement-of-changes-in-equity', params),
  getCashFlowStatement: (params?: any) => apiService.get('/finance/reports/cash-flow-statement', params),
  getArAgingReport: (params?: any) => apiService.get('/finance/reports/ar-aging-report', params),

  // Chart of Accounts Initialization
  initializeDefaultChartOfAccounts: () => apiService.post('/finance/chart-of-accounts/initialize-defaults'),
};

// HR API
export const hrApi = {
  // Dashboard & Summary
  getHrSummary: () => apiService.get('/hr/summary'),
  getStats: () => apiService.get('/hr/stats'),
  
  // Employees
  getEmployees: (params?: any) => apiService.get<PaginatedResponse<any>>('/hr/employees', params),
  createEmployee: (data: any) => apiService.post('/hr/employees', data),
  getEmployee: (id: number) => apiService.get(`/hr/employees/${id}`),
  updateEmployee: (id: number, data: any) => apiService.put(`/hr/employees/${id}`, data),
  deleteEmployee: (id: number) => apiService.delete(`/hr/employees/${id}`),
  
  // Departments
  getDepartments: () => apiService.get('/hr/departments'),
  getTenantDepartments: () => apiService.get('/hr/tenant-departments'),
  createDepartment: (data: any) => apiService.post('/hr/departments', data),
  updateDepartment: (id: number, data: any) => apiService.put(`/hr/departments/${id}`, data),
  deleteDepartment: (id: number) => apiService.delete(`/hr/departments/${id}`),
  
  // Job Positions
  getJobPositions: () => apiService.get('/hr/job-positions'),
  getTenantJobPositions: () => apiService.get('/hr/tenant-job-positions'),
  createJobPosition: (data: any) => apiService.post('/hr/job-positions', data),
  updateJobPosition: (id: number, data: any) => apiService.put(`/hr/job-positions/${id}`, data),
  deleteJobPosition: (id: number) => apiService.delete(`/hr/job-positions/${id}`),
  
  // Employee Contracts
  getEmployeeContracts: () => apiService.get('/hr/employee-contracts'),
  createEmployeeContract: (data: any) => apiService.post('/hr/employee-contracts', data),
  
  // Payroll Management
  getPayrollPeriods: (params?: any) => apiService.get<PaginatedResponse<any>>('/hr/payroll-periods', params),
  createPayrollPeriod: (data: any) => apiService.post('/hr/payroll-periods', data),
  updatePayrollPeriod: (id: number, data: any) => apiService.put(`/hr/payroll-periods/${id}`, data),
  deletePayrollPeriod: (id: number) => apiService.delete(`/hr/payroll-periods/${id}`),
  generatePayrollItems: (periodId: number) => apiService.post(`/hr/payroll-periods/${periodId}/generate-items`),
  getPayrollItems: (periodId: number, params?: any) => apiService.get<PaginatedResponse<any>>(`/hr/payroll-periods/${periodId}/items`, params),
  processPayroll: (periodId: number) => apiService.post(`/hr/payroll-periods/${periodId}/process`),
  markPayrollPaid: (periodId: number, data?: any) => apiService.post(`/hr/payroll-periods/${periodId}/mark-paid`, data),
  getPayrollStats: () => apiService.get('/hr/payroll/stats'),
  
  // Leave Management
  getLeaveTypes: () => apiService.get('/hr/leave-types'),
  createLeaveType: (data: any) => apiService.post('/hr/leave-types', data),
  updateLeaveType: (id: number, data: any) => apiService.put(`/hr/leave-types/${id}`, data),
  deleteLeaveType: (id: number) => apiService.delete(`/hr/leave-types/${id}`),
  
  getLeaveRequests: (params?: any) => apiService.get<PaginatedResponse<any>>('/hr/leave-requests', params),
  createLeaveRequest: (data: any) => apiService.post('/hr/leave-requests', data),
  updateLeaveRequest: (id: number, data: any) => apiService.put(`/hr/leave-requests/${id}`, data),
  deleteLeaveRequest: (id: number) => apiService.delete(`/hr/leave-requests/${id}`),
  approveLeaveRequest: (id: number, data?: any) => apiService.post(`/hr/leave-requests/${id}/approve`, data),
  rejectLeaveRequest: (id: number, data: any) => apiService.post(`/hr/leave-requests/${id}/reject`, data),
  cancelLeaveRequest: (id: number, data?: any) => apiService.post(`/hr/leave-requests/${id}/cancel`, data),
  
  // Leave Balances
  getLeaveBalances: (params?: any) => apiService.get<PaginatedResponse<any>>('/hr/leave-balances', params),
  initializeLeaveBalances: (data?: any) => apiService.post('/hr/leave-balances/initialize', data),
  
  // Leave Analytics
  getLeaveCalendar: (params?: any) => apiService.get('/hr/leave/calendar', params),
  getLeaveStats: (params?: any) => apiService.get('/hr/leave/stats', params),
  
  // Local Holidays
  getLocalHolidays: () => apiService.get('/hr/local-holidays'),
  createLocalHoliday: (data: any) => apiService.post('/hr/local-holidays', data),
  updateLocalHoliday: (id: number, data: any) => apiService.put(`/hr/local-holidays/${id}`, data),
  deleteLocalHoliday: (id: number) => apiService.delete(`/hr/local-holidays/${id}`),
  initializeUgandaHolidays: (year: number) => apiService.post('/hr/local-holidays/initialize-uganda', { year }),
  
  // Reports
  getPayrollReport: (params?: any) => apiService.get('/hr/reports/payroll', params),
  getEmployeeReport: (params?: any) => apiService.get('/hr/reports/employees', params),
  bulkLeaveActions: (data: { action: 'approve' | 'reject' | 'cancel'; leave_request_ids: number[]; rejection_reason?: string; cancellation_reason?: string; }) => 
    apiService.post('/hr/leave-requests/bulk-actions', data),
  
  // Leave Policies
  getLeavePolicies: (params?: any) => apiService.get<PaginatedResponse<any>>('/hr/leave-policies', params),
  createLeavePolicy: (data: any) => apiService.post('/hr/leave-policies', data),
  updateLeavePolicy: (id: number, data: any) => apiService.put(`/hr/leave-policies/${id}`, data),
  deleteLeavePolicy: (id: number) => apiService.delete(`/hr/leave-policies/${id}`),

  // Leave Encashment
  getLeaveEncashmentRequests: (params?: any) => apiService.get<PaginatedResponse<any>>('/hr/leave-encashment-requests', params),
  createLeaveEncashmentRequest: (data: any) => apiService.post('/hr/leave-encashment-requests', data),
  approveLeaveEncashmentRequest: (id: number) => apiService.post(`/hr/leave-encashment-requests/${id}/approve`),
  rejectLeaveEncashmentRequest: (id: number) => apiService.post(`/hr/leave-encashment-requests/${id}/reject`),

  // Leave Reports
  getLeaveReports: (params?: any) => apiService.get('/hr/leave-reports', params),
  createPerformanceMetric: (data: any) => apiService.post('/hr/performance-metrics', data),
  updatePerformanceMetric: (id: number, data: any) => apiService.put(`/hr/performance-metrics/${id}`, data),
};

// Projects API
export const projectsApi = {
  getStats: () => apiService.get('/projects/stats'),
  getProjects: (params?: any) => apiService.get<PaginatedResponse<any>>('/projects', params),
  createProject: (data: any) => apiService.post('/projects', data),
  getProject: (id: number) => apiService.get(`/projects/${id}`),
  updateProject: (id: number, data: any) => apiService.put(`/projects/${id}`, data),
  deleteProject: (id: number) => apiService.delete(`/projects/${id}`),
  
  // Project Categories
  getProjectCategories: () => apiService.get('/projects/categories'),
  createProjectCategory: (data: any) => apiService.post('/projects/categories', data),
  updateProjectCategory: (id: number, data: any) => apiService.put(`/projects/categories/${id}`, data),
  deleteProjectCategory: (id: number) => apiService.delete(`/projects/categories/${id}`),
  
  // Project Phases
  getProjectPhases: (projectId?: number) => {
    const url = projectId ? `/projects/phases?project_id=${projectId}` : '/projects/phases';
    return apiService.get(url);
  },
  createProjectPhase: (data: any) => apiService.post('/projects/phases', data),
  updateProjectPhase: (id: number, data: any) => apiService.put(`/projects/phases/${id}`, data),
  deleteProjectPhase: (id: number) => apiService.delete(`/projects/phases/${id}`),
  
  // Project Tasks
  getProjectTasks: (projectId?: number, phaseId?: number) => {
    const params = new URLSearchParams();
    if (projectId) params.append('project_id', projectId.toString());
    if (phaseId) params.append('phase_id', phaseId.toString());
    const url = `/projects/tasks${params.toString() ? '?' + params.toString() : ''}`;
    return apiService.get(url);
  },
  createProjectTask: (data: any) => apiService.post('/projects/tasks', data),
  updateProjectTask: (id: number, data: any) => apiService.put(`/projects/tasks/${id}`, data),
  deleteProjectTask: (id: number) => apiService.delete(`/projects/tasks/${id}`),
  
  // Project Summary
  getProjectSummary: () => apiService.get('/projects/summary'),
  
  // Time Entries
  getTimeEntries: (params?: any) => apiService.get<PaginatedResponse<any>>('/projects/time-entries', params),
  createTimeEntry: (data: any) => apiService.post('/projects/time-entries', data),
  updateTimeEntry: (id: number, data: any) => apiService.put(`/projects/time-entries/${id}`, data),
  deleteTimeEntry: (id: number) => apiService.delete(`/projects/time-entries/${id}`),
  
  // Project Resources
  getProjectResources: (params?: any) => apiService.get<PaginatedResponse<any>>('/projects/resources', params),
  createProjectResource: (data: any) => apiService.post('/projects/resources', data),
  updateProjectResource: (id: number, data: any) => apiService.put(`/projects/resources/${id}`, data),
  deleteProjectResource: (id: number) => apiService.delete(`/projects/resources/${id}`),
  
  // Project Expenses
  getProjectExpenses: (params?: any) => apiService.get<PaginatedResponse<any>>('/projects/expenses', params),
  createProjectExpense: (data: any) => apiService.post('/projects/expenses', data),
  updateProjectExpense: (id: number, data: any) => apiService.put(`/projects/expenses/${id}`, data),
  deleteProjectExpense: (id: number) => apiService.delete(`/projects/expenses/${id}`),
  
  // Project Milestones
  getProjectMilestones: (params?: any) => apiService.get<PaginatedResponse<any>>('/projects/milestones', params),
  createProjectMilestone: (data: any) => apiService.post('/projects/milestones', data),
  updateProjectMilestone: (id: number, data: any) => apiService.put(`/projects/milestones/${id}`, data),
  deleteProjectMilestone: (id: number) => apiService.delete(`/projects/milestones/${id}`),
  
  // Project Issues
  getProjectIssues: (params?: any) => apiService.get<PaginatedResponse<any>>('/projects/issues', params),
  createProjectIssue: (data: any) => apiService.post('/projects/issues', data),
  updateProjectIssue: (id: number, data: any) => apiService.put(`/projects/issues/${id}`, data),
  deleteProjectIssue: (id: number) => apiService.delete(`/projects/issues/${id}`),
  
  // Bulk Operations
  bulkUpdateTasks: (data: any) => apiService.post('/projects/tasks/bulk-update', data),
  
  // Project Templates and Cloning
  getProjectTemplates: () => apiService.get('/projects/templates'),
  createFromTemplate: (data: any) => apiService.post('/projects/from-template', data),
  cloneProject: (id: number, data?: any) => apiService.post(`/projects/${id}/clone`, data),
  
  // Project Analytics and Reporting
  getProjectDashboard: (projectId: number) => apiService.get(`/projects/${projectId}/dashboard`),
  getProjectTimeline: (projectId: number) => apiService.get(`/projects/${projectId}/timeline`),
  getProjectFinancials: (projectId: number) => apiService.get(`/projects/${projectId}/financials`),
  getAdvancedAnalytics: () => apiService.get<{ avgProjectDuration: number; resourceUtilization: number; }>('/projects/analytics/advanced'),
  
  // Project Documents
  getProjectDocuments: (projectId: number) => apiService.get(`/projects/${projectId}/documents`),
  uploadProjectDocument: (projectId: number, data: FormData) => apiService.post(`/projects/${projectId}/documents`, data),
  updateProjectDocument: (projectId: number, documentId: number, data: any) => apiService.put(`/projects/${projectId}/documents/${documentId}`, data),
  deleteProjectDocument: (projectId: number, documentId: number) => apiService.delete(`/projects/${projectId}/documents/${documentId}`),
};

// Analytics API
export const analyticsApi = {
  getStats: () => apiService.get('/analytics/stats'),
  getMetrics: (params?: any) => apiService.get('/analytics/metrics', params),
  getTopProducts: () => apiService.get('/analytics/top-products'),
  getRecentMetrics: () => apiService.get('/analytics/recent-metrics'),
  getPerformanceInsights: () => apiService.get('/analytics/performance-insights'),
  exportReport: (params?: any) => apiService.get('/analytics/export', params),
};

// Branch API
export const branchApi = {
  getBranches: () => apiService.get<Branch[]>('/branches'),
  getBranch: (id: number) => apiService.get<Branch>(`/branches/${id}`),
  createBranch: (data: BranchFormData) => apiService.post<Branch>('/branches', data),
  updateBranch: (id: number, data: Partial<Branch>) => apiService.put<Branch>(`/branches/${id}`, data),
  deleteBranch: (id: number) => apiService.delete<void>(`/branches/${id}`),
  toggleBranchStatus: (id: number) => apiService.post<Branch>(`/branches/${id}/toggle-status`),
  getCurrentBranch: () => apiService.get<Branch>(`/current-branch`),
  switchBranch: (branchId: number) => apiService.post<Branch>('/switch-branch', { branch_id: branchId }),
};

// AIDA API
export const aidaApi = {
  startConversation: (data: any) => apiService.post('/aida/conversations', data),
  sendMessage: (conversationId: string, data: any) => 
    apiService.post(`/aida/conversations/${conversationId}/messages`, data),
  getConversationHistory: (conversationId: string) => 
    apiService.get(`/aida/conversations/${conversationId}/messages`),
  analyzeData: (data: any) => apiService.post('/aida/analyze', data),
  getCapabilities: () => apiService.get('/aida/capabilities'),
  generateProjectContent: (data: { prompt: string; type: 'project' | 'phase' | 'task' }) =>
    apiService.post('/aida/generate-project-content', data),
};

// System API
export const systemApi = {
  getSettings: () => apiService.get('/system/settings'),
  getTenantSettings: () => apiService.get('/tenant/settings'),
  updateSettings: (data: any) => apiService.post('/system/settings', data),
  getBillingDetails: () => apiService.get('/billing-details'),
  updateBillingDetails: (data: any) => apiService.post('/billing-details', data),
  getNotificationSettings: () => apiService.get('/system/notification-settings'),
  updateNotificationSettings: (data: any) => apiService.put('/system/notification-settings', data),
  getSecuritySettings: () => apiService.get('/system/security-settings'),
  updateSecuritySettings: (data: any) => apiService.put('/system/security-settings', data),
  updateTenantSettings: (data: FormData) => apiService.post('/tenant/settings', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAuditLogs: (params?: any) => apiService.get('/system/audit-logs', params),
  getSystemHealth: () => apiService.get('/system/health'),
  getSystemSummary: () => apiService.get('/system/summary'),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiService.post('/system/files/upload', formData);
  },
  deleteFile: (fileId: string) => apiService.delete(`/system/files/${fileId}`),
};

// Sales API
export const salesApi = {
  // Transaction Management
  processTransaction: (data: any) => apiService.post('/sales/transactions', data),
  getSalesHistory: (params?: any) => apiService.get('/sales/transactions', params),

  // Customer Management
  getCustomers: () => apiService.get('/sales/customers'),

  // Analytics & Reports
  getDailySalesSummary: (params?: any) => apiService.get('/sales/daily-summary', params),
  getSalesAnalytics: (params?: any) => apiService.get('/sales/analytics', params),
  getHourlySalesPattern: (params?: any) => apiService.get('/sales/hourly-pattern', params),
  getTopSellingProducts: (params?: any) => apiService.get('/sales/top-products', params),

  // AI-Powered Features
  getSmartRecommendations: (params?: any) => apiService.get('/sales/recommendations', params),
  getDynamicPricing: (params?: any) => apiService.get('/sales/dynamic-pricing', params),

  // 🚀 Advanced Analytics & AI-Powered Insights
  advancedAnalyticsQuery: (params: {
    query?: string;
    filters?: any;
    group_by?: string;
    metrics?: string[];
    date_range?: { start: string; end: string };
  }) => apiService.post('/sales/advanced-query', params),

  exportAnalytics: (params: {
    format: 'json' | 'csv' | 'pdf';
    data: any[];
  }) => apiService.post('/sales/export-analytics', params),
};

// Test API
export const testApi = {
  test: () => apiService.get('/test'),
  testDatabase: () => apiService.get('/test/database'),
  testAida: () => apiService.get('/test/aida'),
};

// Invoice API
export const invoiceApi = {
  getInvoices: (params?: any) => apiService.get<PaginatedResponse<any>>('/invoices', params),
  getInvoice: (id: string | number) => apiService.get(`/invoices/${id}`),
  createInvoice: (data: any) => apiService.post('/invoices', data),
  updateInvoice: (id: string | number, data: any) => apiService.put(`/invoices/${id}`, data),
  deleteInvoice: (id: string | number) => apiService.delete(`/invoices/${id}`),
  markAsSent: (id: string | number) => apiService.post(`/invoices/${id}/mark-as-sent`),
  markAsPaid: (id: string | number) => apiService.post(`/invoices/${id}/mark-as-paid`),
  void: (id: string | number) => apiService.post(`/invoices/${id}/void`),
};

// Permissions API
export const permissionsApi = {
  getPermissions: () => api.get('/permissions'),
  getRoles: () => api.get('/permissions/roles'),
  createRole: (data: { name: string }) => api.post('/permissions/roles', data),
  updateRole: (data: { roleId: number, name: string, permissions: number[] }) => api.put(`/permissions/roles/${data.roleId}`, data),
  deleteRole: (roleId: number) => api.delete(`/permissions/roles/${roleId}`),
};

export const userAccessApi = {
  getAccessControl: () => api.get('/user-access'),
  updateUserModules: (userId: number, modules: string[]) => api.put(`/user-access/${userId}`, { modules }),
};

// Employee Support API
export const employeeSupportApi = {
  getEmployeeDetails: () => apiService.get('/employee-support/details'),
  getTasks: () => apiService.get('/employee-support/tasks'),
};

// Chat API
export const chatApi = {
  getConversations: (page = 1) => apiService.get<PaginatedResponse<Conversation>>(`/chat/conversations?page=${page}`),
  createConversation: (data: { user_ids: number[]; name?: string }) => apiService.post('/chat/conversations', data),
  getConversation: (id: number) => apiService.get(`/chat/conversations/${id}`),
  getMessages: (conversationId: number) => apiService.get<PaginatedResponse<any>>(`/chat/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: number, data: FormData) => 
    apiService.post(`/chat/conversations/${conversationId}/messages`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  getUsers: () => apiService.get('/users'),
  addReaction: (messageId: number, reaction: string) =>
    apiService.post(`/chat/messages/${messageId}/reactions`, { reaction }),
  removeReaction: (messageId: number, reactionId: number) =>
    apiService.delete(`/chat/messages/${messageId}/reactions/${reactionId}`),
  initiateVoiceCall: (receiverId: number) =>
    apiService.post('/chat/voice-calls/initiate', { receiver_id: receiverId }),
  
  // Channel-specific methods
  getChannels: () => apiService.get('/chat/channels'),
  createChannel: (data: { name: string; description?: string; type: string }) =>
    apiService.post('/chat/channels', data),
  getChannelMessages: (channelId: number) => 
    apiService.get<PaginatedResponse<any>>(`/chat/channels/${channelId}/messages`),
  sendChannelMessage: (channelId: number, data: FormData) => 
    apiService.post(`/chat/channels/${channelId}/messages`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  acceptVoiceCall: (callId: number) =>
    apiService.post(`/chat/voice-calls/${callId}/accept`),
  rejectVoiceCall: (callId: number) =>
    apiService.post(`/chat/voice-calls/${callId}/reject`),
};
