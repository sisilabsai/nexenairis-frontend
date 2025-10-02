import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { SendMessagePayload } from '@/types';
import {
  api,
  authApi,
  dashboardApi,
  financeApi,
  inventoryApi,
  demandForecastingApi,
  intelligenceApi,
  barcodeApi,
  supplierApi,
  crmApi,
  hrApi,
  projectsApi,
  analyticsApi,
  aidaApi,
  systemApi,
  salesApi,
  testApi,
  invoiceApi,
  chatApi
} from '../lib/api';
import { queryKeys } from '../lib/queryClient';

export const useApi = () => {
    return {
        get: (url: string, params?: any) => api.get(url, { params }),
        post: (url: string, data: any) => api.post(url, data),
        put: (url: string, data: any) => api.put(url, data),
        delete: (url: string) => api.delete(url),
    };
};

// Auth Hooks
export const useAuth = () => {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      }
    },
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      if (data.success && data.data?.token) {
        localStorage.setItem('auth_token', data.data.token);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      }
    },
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      localStorage.removeItem('auth_token');
      queryClient.clear();
    },
  });

  const me = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('auth_token'),
  });

  return { login, register, logout, me };
};


export const useLeaveEncashmentRequests = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'leave-encashment-requests', params],
    queryFn: () => hrApi.getLeaveEncashmentRequests(params),
  });
};

export const useLeaveReports = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'leave-reports', params],
    queryFn: () => hrApi.getLeaveReports(params),
    enabled: false,
  });
};

export const useCreatePerformanceMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hrApi.createPerformanceMetric,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'performance-metrics'] });
    },
  });
};

export const useUpdatePerformanceMetric = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.updatePerformanceMetric(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'performance-metrics'] });
    },
  });
};

export const useCreateLeaveEncashmentRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createLeaveEncashmentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-encashment-requests'] });
    },
  });
};

export const useApproveLeaveEncashmentRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => hrApi.approveLeaveEncashmentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-encashment-requests'] });
    },
  });
};

export const useRejectLeaveEncashmentRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => hrApi.rejectLeaveEncashmentRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-encashment-requests'] });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => authApi.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message || 'Password changed successfully');
      }
    },
    onError: (error: any) => {
      // Allow the error to be handled by the component
      return error;
    },
  });
};

// Dashboard Hooks
export const useDashboardStats = (period: string = 'today') => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.stats, period],
    queryFn: () => dashboardApi.getStats(period),
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.recentActivity,
    queryFn: dashboardApi.getRecentActivity,
  });
};

// 🚨 Critical business alerts
export const useCriticalAlerts = () => {
  return useQuery({
    queryKey: ['critical-alerts'],
    queryFn: async () => {
      const response = await dashboardApi.getCriticalAlerts();
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

// 🤖 AI-powered insights
export const useAIInsights = () => {
  return useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      const response = await dashboardApi.getAIInsights();
      return response.data;
    },
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

export const useFinancialInsights = () => {
  return useQuery({
    queryKey: ['financial-insights'],
    queryFn: () => aidaApi.analyzeData({ context: 'finance' }),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};

// Local Holidays Hooks
export const useLocalHolidays = () => {
  return useQuery({
    queryKey: queryKeys.hr.localHolidays,
    queryFn: hrApi.getLocalHolidays,
  });
};

export const useCreateLocalHoliday = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createLocalHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.localHolidays });
    },
  });
};

export const useUpdateLocalHoliday = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.updateLocalHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.localHolidays });
    },
  });
};

export const useDeleteLocalHoliday = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deleteLocalHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.localHolidays });
    },
  });
};

export const useInitializeUgandaHolidays = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.initializeUgandaHolidays,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.localHolidays });
    },
  });
};

// Old Finance Hooks - removed to avoid duplication (comprehensive versions below)

// Inventory Hooks
export const useInventoryStats = () => {
  return useQuery({
    queryKey: queryKeys.inventory.stats,
    queryFn: inventoryApi.getStats,
  });
};

export const useProducts = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.inventory.products(params),
    queryFn: () => inventoryApi.getProducts(params),
  });
};

export const useProduct = (id: number) => {
  return useQuery({
    queryKey: queryKeys.inventory.product(id),
    queryFn: () => inventoryApi.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      inventoryApi.updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.product(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats });
    },
  });
};

export const useToggleProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inventoryApi.toggleProductStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats });
    },
  });
};

export const useRestockProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      inventoryApi.restockProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.stats });
    },
  });
};

export const useStockItems = () => {
  return useQuery({
    queryKey: queryKeys.inventory.stockItems,
    queryFn: inventoryApi.getStockItems,
  });
};

export const useStockMovements = () => {
  return useQuery({
    queryKey: queryKeys.inventory.stockMovements,
    queryFn: inventoryApi.getStockMovements,
  });
};

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: queryKeys.inventory.lowStockAlerts,
    queryFn: inventoryApi.getLowStockAlerts,
  });
};

export const useInventorySummary = () => {
  return useQuery({
    queryKey: queryKeys.inventory.summary,
    queryFn: inventoryApi.getInventorySummary,
  });
};

// Product SKU hooks
export const useNextProductSku = () => {
  return useQuery({
    queryKey: ['nextProductSku'],
    queryFn: inventoryApi.getNextSku,
  });
};

export const useProductSkuSettings = () => {
  return useQuery({
    queryKey: ['productSkuSettings'],
    queryFn: inventoryApi.getSkuSettings,
  });
};

export const useUpdateProductSkuPrefix = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prefix: string) => inventoryApi.updateSkuPrefix(prefix),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productSkuSettings'] });
      queryClient.invalidateQueries({ queryKey: ['nextProductSku'] });
    },
  });
};

// Product Categories
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.inventory.categories,
    queryFn: inventoryApi.getCategories,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryApi.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      inventoryApi.updateCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: inventoryApi.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.categories });
    },
  });
};

// CRM Hooks
export const useCrmStats = () => {
  return useQuery({
    queryKey: queryKeys.crm.stats,
    queryFn: crmApi.getCrmSummary,
  });
};

// Contact Types hooks
export const useContactTypes = () => {
  return useQuery({
    queryKey: ['crm', 'contact-types'],
    queryFn: crmApi.getContactTypes,
  });
};

export const useCreateContactType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createContactType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contact-types'] });
    },
  });
};

export const useUpdateContactType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      crmApi.updateContactType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contact-types'] });
    },
  });
};

export const useDeleteContactType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmApi.deleteContactType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contact-types'] });
    },
  });
};

export const useInitializeDefaultContactTypes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmApi.initializeDefaultContactTypes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'contact-types'] });
    },
  });
};

export const useContacts = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.crm.contacts(params),
    queryFn: () => crmApi.getContacts(params),
  });
};

// Alias for consistency with CRM page
export const useCrmContacts = useContacts;

export const useContact = (id: number) => {
  return useQuery({
    queryKey: queryKeys.crm.contact(id),
    queryFn: () => crmApi.getContact(id),
    enabled: !!id,
  });
};

// Alias for consistency with CRM page
export const useCrmContact = useContact;

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.contacts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.summary });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => crmApi.updateContact(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.contacts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.summary });
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => crmApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.contacts() });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.summary });
    },
  });
};

export const useExportContacts = () => {
  return useMutation({
    mutationFn: crmApi.exportContacts,
    onSuccess: (result) => {
      // Handle successful export
      const data = (result as any).data;
      if (data?.content && data?.filename) {
        const blob = new Blob([atob(data.content)], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = data.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    },
  });
};

// Finance Hooks
export const useFinanceSummary = () => {
  return useQuery({
    queryKey: ['finance', 'summary'],
    queryFn: financeApi.getFinanceSummary,
  });
};

export const useChartOfAccounts = () => {
  return useQuery({
    queryKey: ['finance', 'chart-of-accounts'],
    queryFn: financeApi.getChartOfAccounts,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: financeApi.createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'chart-of-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => financeApi.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'chart-of-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
  });
};

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: financeApi.deleteAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'chart-of-accounts'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
  });
};

export const useFinanceTransactions = (params?: any) => {
  return useQuery({
    queryKey: ['finance', 'transactions', params],
    queryFn: () => financeApi.getTransactions(params),
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: financeApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'chart-of-accounts'] });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => financeApi.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => financeApi.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'summary'] });
    },
  });
};

export const useFinanceMobileMoneyAnalytics = () => {
  return useQuery({
    queryKey: ['finance', 'analytics', 'mobile-money'],
    queryFn: financeApi.getMobileMoneyAnalytics,
  });
};

export const useCashFlowAnalysis = (params?: any) => {
  return useQuery({
    queryKey: ['finance', 'analytics', 'cash-flow', params],
    queryFn: () => financeApi.getCashFlowAnalysis(params),
  });
};

export const useCashFlowStatement = (params?: any) => {
    return useQuery({
        queryKey: ['finance', 'reports', 'cash-flow-statement', params],
        queryFn: () => financeApi.getCashFlowStatement(params),
    });
};

export const useArAgingReport = () => {
    return useQuery({
        queryKey: ['finance', 'reports', 'ar-aging-report'],
        queryFn: financeApi.getArAgingReport,
    });
};

export const useProfitAndLoss = (params?: any) => {
  return useQuery({
    queryKey: ['finance', 'reports', 'profit-and-loss', params],
    queryFn: () => financeApi.getProfitAndLoss(params),
  });
};

export const useBalanceSheet = (params?: any) => {
  return useQuery({
    queryKey: ['finance', 'reports', 'balance-sheet', params],
    queryFn: () => financeApi.getBalanceSheet(params),
  });
};

export const useStatementOfChangesInEquity = (params?: any) => {
  return useQuery({
    queryKey: ['finance', 'reports', 'statement-of-changes-in-equity', params],
    queryFn: () => financeApi.getStatementOfChangesInEquity(params),
  });
};

export const useInitializeChartOfAccounts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: financeApi.initializeDefaultChartOfAccounts,
    onSuccess: (response) => {
      // Invalidate and refetch the accounts
      queryClient.invalidateQueries({ queryKey: ['finance', 'chart-of-accounts'] });
      
      // Show success message with more details
      toast.success('🎉 Default chart of accounts created successfully! Your account structure is now ready.', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });
      
      // Force refetch after a brief delay to ensure the backend has processed
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['finance', 'chart-of-accounts'] });
      }, 1000);
    },
    onError: (error: any) => {
      console.error('Failed to initialize Chart of Accounts:', error);
      toast.error('❌ Failed to initialize Chart of Accounts. Please try again.', {
        duration: 4000,
        style: {
          background: '#EF4444',
          color: '#fff',
        },
      });
    },
  });
};

export const useSalesOpportunities = (params?: any) => {
  return useQuery({
    queryKey: ['crm', 'opportunities', params],
    queryFn: () => crmApi.getSalesOpportunities(params),
  });
};

export const useCrmSummary = () => {
  return useQuery({
    queryKey: queryKeys.crm.summary,
    queryFn: crmApi.getCrmSummary,
  });
};

// HR Hooks
export const useHrSummary = () => {
  return useQuery({
    queryKey: ['hr', 'summary'],
    queryFn: hrApi.getHrSummary,
  });
};

export const useHrStats = () => {
  return useQuery({
    queryKey: queryKeys.hr.stats,
    queryFn: hrApi.getStats,
  });
};

export const useEmployees = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.hr.employees(params),
    queryFn: () => hrApi.getEmployees(params),
  });
};

export const useEmployee = (id: number) => {
  return useQuery({
    queryKey: queryKeys.hr.employee(id),
    queryFn: () => hrApi.getEmployee(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.employees() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.stats });
    },
  });
};

export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      hrApi.updateEmployee(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.employees() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.employee(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.stats });
    },
  });
};

export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.employees() });
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.stats });
    },
  });
};

export const useDepartments = () => {
  return useQuery({
    queryKey: queryKeys.hr.departments,
    queryFn: hrApi.getDepartments,
  });
};

export const useTenantDepartments = () => {
  return useQuery({
    queryKey: ['hr', 'tenant-departments'],
    queryFn: () => hrApi.getTenantDepartments(),
  });
};

export const useCreateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      hrApi.updateDepartment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useJobPositions = () => {
  return useQuery({
    queryKey: queryKeys.hr.jobPositions,
    queryFn: hrApi.getJobPositions,
  });
};

export const useTenantJobPositions = () => {
  return useQuery({
    queryKey: ['hr', 'tenant-job-positions'],
    queryFn: () => hrApi.getTenantJobPositions(),
  });
};

export const useCreateJobPosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createJobPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.jobPositions });
    },
  });
};

export const useUpdateJobPosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.updateJobPosition(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.jobPositions });
    },
  });
};

export const useDeleteJobPosition = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deleteJobPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.hr.jobPositions });
    },
  });
};

export const useEmployeeContracts = () => {
  return useQuery({
    queryKey: queryKeys.hr.employeeContracts,
    queryFn: hrApi.getEmployeeContracts,
  });
};

// Payroll hooks
export const usePayrollPeriods = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'payroll-periods', params],
    queryFn: () => hrApi.getPayrollPeriods(params),
  });
};

export const useCreatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createPayrollPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useUpdatePayrollPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.updatePayrollPeriod(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useDeletePayrollPeriod = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deletePayrollPeriod,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useGeneratePayrollItems = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.generatePayrollItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-items'] });
    },
  });
};

export const usePayrollItems = (periodId: number, params?: any) => {
  return useQuery({
    queryKey: ['hr', 'payroll-items', periodId, params],
    queryFn: () => hrApi.getPayrollItems(periodId, params),
    enabled: !!periodId,
  });
};

export const useProcessPayroll = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.processPayroll,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-items'] });
    },
  });
};

export const useMarkPayrollPaid = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ periodId, data }: { periodId: number; data?: any }) => hrApi.markPayrollPaid(periodId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-periods'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'payroll-items'] });
    },
  });
};

export const usePayrollStats = () => {
  return useQuery({
    queryKey: ['hr', 'payroll', 'stats'],
    queryFn: hrApi.getPayrollStats,
  });
};

// Leave Management hooks
export const useLeaveTypes = () => {
  return useQuery({
    queryKey: ['hr', 'leave-types'],
    queryFn: hrApi.getLeaveTypes,
  });
};

export const useCreateLeaveType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-types'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useUpdateLeaveType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.updateLeaveType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-types'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useDeleteLeaveType = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deleteLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-types'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useLeaveRequests = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'leave-requests', params],
    queryFn: () => hrApi.getLeaveRequests(params),
  });
};

export const useCreateLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useUpdateLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.updateLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useDeleteLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deleteLeaveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useApproveLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: any }) => hrApi.approveLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useRejectLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.rejectLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useCancelLeaveRequest = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: any }) => hrApi.cancelLeaveRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useLeaveBalances = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'leave-balances', params],
    queryFn: () => hrApi.getLeaveBalances(params),
  });
};

export const useInitializeLeaveBalances = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.initializeLeaveBalances,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};

export const useLeaveCalendar = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'leave', 'calendar', params],
    queryFn: () => hrApi.getLeaveCalendar(params),
  });
};

export const useLeaveStats = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'leave', 'stats', params],
    queryFn: () => hrApi.getLeaveStats(params),
  });
};

export const useLeavePolicies = (params?: any) => {
  return useQuery({
    queryKey: ['hr', 'leave-policies', params],
    queryFn: () => hrApi.getLeavePolicies(params),
  });
};

export const useCreateLeavePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.createLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-policies'] });
    },
  });
};

export const useUpdateLeavePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => hrApi.updateLeavePolicy(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-policies'] });
    },
  });
};

export const useDeleteLeavePolicy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.deleteLeavePolicy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-policies'] });
    },
  });
};

export const useBulkLeaveActions = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: hrApi.bulkLeaveActions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
    },
  });
};



// Projects Hooks
export const useProjectsStats = () => {
  return useQuery({
    queryKey: queryKeys.projects.stats,
    queryFn: projectsApi.getStats,
  });
};

export const useProjects = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.projects.projects(params),
    queryFn: () => projectsApi.getProjects(params),
  });
};

export const useProject = (id: number) => {
  return useQuery({
    queryKey: queryKeys.projects.project(id),
    queryFn: () => projectsApi.getProject(id),
    enabled: !!id,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.stats });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      projectsApi.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.project(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.stats });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.summary });
    },
  });
};

export const useProjectPhases = (projectId?: number) => {
  return useQuery({
    queryKey: projectId ? ['projects', 'phases', projectId] : queryKeys.projects.phases,
    queryFn: () => projectsApi.getProjectPhases(projectId),
  });
};

export const useCreateProjectPhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProjectPhase,
    onSuccess: () => {
      // Force refresh all project-related queries
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      // Also force refetch to ensure immediate UI update
      queryClient.refetchQueries({ queryKey: ['projects', 'projects'] });
    },
  });
};

export const useUpdateProjectPhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.updateProjectPhase(id, data),
    onSuccess: () => {
      // Force refresh all project-related queries
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      queryClient.refetchQueries({ queryKey: ['projects', 'projects'] });
    },
  });
};

export const useDeleteProjectPhase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.deleteProjectPhase,
    onSuccess: () => {
      // Force refresh all project-related queries
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      queryClient.refetchQueries({ queryKey: ['projects', 'projects'] });
    },
  });
};

export const useProjectTasks = (projectId?: number, phaseId?: number) => {
  return useQuery({
    queryKey: ['projects', 'tasks', projectId, phaseId].filter(Boolean),
    queryFn: () => projectsApi.getProjectTasks(projectId, phaseId),
  });
};

export const useCreateProjectTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProjectTask,
    onSuccess: () => {
      // Force refresh all project-related queries
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      queryClient.refetchQueries({ queryKey: ['projects', 'projects'] });
    },
  });
};

export const useUpdateProjectTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.updateProjectTask(id, data),
    onSuccess: () => {
      // Force refresh all project-related queries
      queryClient.invalidateQueries({ queryKey: ['projects'], refetchType: 'all' });
      queryClient.refetchQueries({ queryKey: ['projects', 'projects'] });
    },
  });
};

export const useDeleteProjectTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProjectTask(id),
    onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.phases });
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};



export const useProjectSummary = () => {
  return useQuery({
    queryKey: queryKeys.projects.summary,
    queryFn: projectsApi.getProjectSummary,
  });
};

// Project Category Management hooks
export const useProjectCategories = () => {
  return useQuery({
    queryKey: ['projects', 'categories'],
    queryFn: projectsApi.getProjectCategories,
  });
};

export const useCreateProjectCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProjectCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'categories'] });
    },
  });
};

export const useUpdateProjectCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      projectsApi.updateProjectCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'categories'] });
    },
  });
};

export const useDeleteProjectCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProjectCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', 'categories'] });
    },
  });
};

// Time Entries
export const useTimeEntries = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.projects.timeEntries(params),
    queryFn: () => projectsApi.getTimeEntries(params),
  });
};

export const useCreateTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.timeEntries() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useUpdateTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.updateTimeEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.timeEntries() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useDeleteTimeEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteTimeEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.timeEntries() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

// Project Resources
export const useProjectResources = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.projects.resources(params),
    queryFn: () => projectsApi.getProjectResources(params),
  });
};

export const useCreateProjectResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProjectResource,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resources() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useUpdateProjectResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.updateProjectResource(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resources() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useDeleteProjectResource = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProjectResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.resources() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

// Project Expenses
export const useProjectExpenses = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.projects.expenses(params),
    queryFn: () => projectsApi.getProjectExpenses(params),
  });
};

export const useCreateProjectExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProjectExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.expenses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useUpdateProjectExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.updateProjectExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.expenses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useDeleteProjectExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProjectExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.expenses() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

// Project Milestones
export const useProjectMilestones = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.projects.milestones(params),
    queryFn: () => projectsApi.getProjectMilestones(params),
  });
};

export const useCreateProjectMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProjectMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.milestones() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useUpdateProjectMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.updateProjectMilestone(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.milestones() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useDeleteProjectMilestone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProjectMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.milestones() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

// Project Issues
export const useProjectIssues = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.projects.issues(params),
    queryFn: () => projectsApi.getProjectIssues(params),
  });
};

export const useCreateProjectIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createProjectIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.issues() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useUpdateProjectIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => projectsApi.updateProjectIssue(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.issues() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useDeleteProjectIssue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => projectsApi.deleteProjectIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.issues() });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

// Bulk Operations
export const useBulkUpdateTasks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.bulkUpdateTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.phases });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

// Project Templates and Cloning
export const useProjectTemplates = () => {
  return useQuery({
    queryKey: queryKeys.projects.templates,
    queryFn: projectsApi.getProjectTemplates,
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: projectsApi.createFromTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

export const useCloneProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data?: any }) => projectsApi.cloneProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.projects() });
    },
  });
};

// Project Analytics and Reporting
export const useProjectDashboard = (projectId: number) => {
  return useQuery({
    queryKey: queryKeys.projects.dashboard(projectId),
    queryFn: () => projectsApi.getProjectDashboard(projectId),
    enabled: !!projectId,
  });
};

export const useProjectTimeline = (projectId: number) => {
  return useQuery({
    queryKey: queryKeys.projects.timeline(projectId),
    queryFn: () => projectsApi.getProjectTimeline(projectId),
    enabled: !!projectId,
  });
};

export const useProjectFinancials = (projectId: number) => {
  return useQuery({
    queryKey: queryKeys.projects.financials(projectId),
    queryFn: () => projectsApi.getProjectFinancials(projectId),
    enabled: !!projectId,
  });
};

export const useProjectAdvancedAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.projects.advancedAnalytics,
    queryFn: projectsApi.getAdvancedAnalytics,
  });
};

// Project Documents
export const useProjectDocuments = (projectId: number) => {
  return useQuery({
    queryKey: queryKeys.projects.documents(projectId),
    queryFn: () => projectsApi.getProjectDocuments(projectId),
    enabled: !!projectId,
  });
};

export const useUploadProjectDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: number; data: FormData }) => 
      projectsApi.uploadProjectDocument(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) });
    },
  });
};

export const useUpdateProjectDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, documentId, data }: { projectId: number; documentId: number; data: any }) => 
      projectsApi.updateProjectDocument(projectId, documentId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) });
    },
  });
};

export const useDeleteProjectDocument = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, documentId }: { projectId: number; documentId: number }) => 
      projectsApi.deleteProjectDocument(projectId, documentId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.documents(projectId) });
    },
  });
};

// Analytics Hooks
export const useAnalyticsStats = () => {
  return useQuery({
    queryKey: queryKeys.analytics.stats,
    queryFn: async () => {
      const res = await analyticsApi.getStats();
      // apiService.get returns the envelope { success, data }
      return res?.data ?? [];
    },
  });
};

export const useMetrics = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.analytics.metrics(params),
    queryFn: async () => {
      const res = await analyticsApi.getMetrics(params);
      return res?.data ?? [];
    },
  });
};

export const useTopProducts = () => {
  return useQuery({
    queryKey: queryKeys.analytics.topProducts,
    queryFn: async () => {
      const res = await analyticsApi.getTopProducts();
      return res?.data ?? [];
    },
  });
};

export const useRecentMetrics = () => {
  return useQuery({
    queryKey: queryKeys.analytics.recentMetrics,
    queryFn: async () => {
      const res = await analyticsApi.getRecentMetrics();
      return res?.data ?? [];
    },
  });
};

export const usePerformanceInsights = () => {
  return useQuery({
    queryKey: queryKeys.analytics.performanceInsights,
    queryFn: analyticsApi.getPerformanceInsights,
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: analyticsApi.exportReport,
  });
};

// AIDA Hooks
export const useAidaConversation = (id: string) => {
  return useQuery({
    queryKey: queryKeys.aida.conversation(id),
    queryFn: () => aidaApi.startConversation({ conversation_id: id }),
    enabled: !!id,
  });
};

export const useAidaMessages = (conversationId: string) => {
  return useQuery({
    queryKey: queryKeys.aida.conversationMessages(conversationId),
    queryFn: () => aidaApi.getConversationHistory(conversationId),
    enabled: !!conversationId,
  });
};

export const useSendAidaMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, data }: { conversationId: string; data: any }) => 
      aidaApi.sendMessage(conversationId, data),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.aida.conversationMessages(conversationId) 
      });
    },
  });
};

export const useAidaCapabilities = () => {
  return useQuery({
    queryKey: queryKeys.aida.capabilities,
    queryFn: aidaApi.getCapabilities,
  });
};

export const useAidaAnalyze = () => {
  return useMutation({
    mutationFn: aidaApi.analyzeData,
  });
};

// System Hooks
export const useSystemSettings = () => {
  return useQuery({
    queryKey: queryKeys.system.settings,
    queryFn: systemApi.getSettings,
  });
};

export const useTenantSettings = () => {
  return useQuery({
    queryKey: ['tenantSettings'],
    queryFn: systemApi.getTenantSettings,
  });
};

export const useUpdateSystemSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: systemApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.system.settings });
    },
  });
};

export const useBillingDetails = () => {
  return useQuery({
    queryKey: ['billingDetails'],
    queryFn: systemApi.getBillingDetails,
  });
};

export const useUpdateBillingDetails = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: systemApi.updateBillingDetails,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['billingDetails'] });
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: ['notificationSettings'],
    queryFn: systemApi.getNotificationSettings,
  });
};

export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: systemApi.updateNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationSettings'] });
    },
  });
};

export const useSecuritySettings = () => {
  return useQuery({
    queryKey: ['securitySettings'],
    queryFn: systemApi.getSecuritySettings,
  });
};

export const useUpdateSecuritySettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: systemApi.updateSecuritySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['securitySettings'] });
    },
  });
};

export const useUpdateTenantSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => {
      if (data instanceof FormData) {
        return systemApi.updateTenantSettings(data);
      }
      // If it's a plain object, it might be our tax settings
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        formData.append(key, JSON.stringify(data[key]));
      });
      return systemApi.updateTenantSettings(formData);
    },
    onSuccess: (updatedTenantResponse) => {
      // Manually update the cache for an instant UI refresh
      queryClient.setQueryData(queryKeys.auth.me, (oldData: any) => {
        if (!oldData || !oldData.data || !oldData.data.user) {
          return oldData;
        }
        // The API returns the tenant object directly in the response data
        const newTenantData = updatedTenantResponse.data;

        const updatedUser = {
          ...oldData.data.user,
          tenant: newTenantData,
        };

        return {
          ...oldData,
          data: {
            ...oldData.data,
            user: updatedUser,
          },
        };
      });

      // Invalidate other related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['tenantSettings'] });
      toast.success('Settings updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update settings.');
    },
  });
};

export const useAuditLogs = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.system.auditLogs(params),
    queryFn: () => systemApi.getAuditLogs(params),
  });
};

export const useSystemHealth = () => {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: systemApi.getSystemHealth,
  });
};

export const useSystemSummary = () => {
  return useQuery({
    queryKey: queryKeys.system.summary,
    queryFn: systemApi.getSystemSummary,
  });
};

export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: systemApi.uploadFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.system.auditLogs() });
    },
  });
};

export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: systemApi.deleteFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.system.auditLogs() });
    },
  });
};

// Test Hooks
export const useTest = () => {
  return useQuery({
    queryKey: queryKeys.test.test,
    queryFn: testApi.test,
  });
};

export const useTestDatabase = () => {
  return useQuery({
    queryKey: queryKeys.test.database,
    queryFn: testApi.testDatabase,
  });
};

export const useTestAida = () => {
  return useQuery({
    queryKey: queryKeys.test.aida,
    queryFn: testApi.testAida,
  });
};

// AI-Powered Demand Forecasting Hooks
export const useDemandPredictions = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.demandForecasting.predictions(params),
    queryFn: () => demandForecastingApi.getDemandPredictions(params),
  });
};

export const useReorderSuggestions = () => {
  return useQuery({
    queryKey: queryKeys.demandForecasting.reorderSuggestions,
    queryFn: demandForecastingApi.getReorderSuggestions,
  });
};

export const useSupplierRecommendations = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.demandForecasting.supplierRecommendations(params),
    queryFn: () => demandForecastingApi.getSupplierRecommendations(params),
  });
};

export const useTrackSupplierPerformance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: demandForecastingApi.trackSupplierPerformance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demandForecasting.supplierRecommendations() });
    },
  });
};

export const useRecordSalesData = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: demandForecastingApi.recordSalesData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.demandForecasting.predictions() });
      queryClient.invalidateQueries({ queryKey: queryKeys.demandForecasting.reorderSuggestions });
    },
  });
};

export const useDemandForecastingAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.demandForecasting.analytics,
    queryFn: demandForecastingApi.getAnalyticsDashboard,
  });
};

// Real-Time Intelligence Dashboard Hooks
export const useIntelligenceDashboard = () => {
  return useQuery({
    queryKey: queryKeys.intelligence.dashboard,
    queryFn: intelligenceApi.getIntelligenceDashboard,
  });
};

// Barcode Management Hooks
export const useGenerateBarcode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { product_id: number; barcode_type: string; barcode_value?: string }) => 
      barcodeApi.generateBarcode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products() });
    },
  });
};

export const useScanBarcode = () => {
  return useMutation({
    mutationFn: (data: { barcode: string; scan_location?: string; device_info?: any }) => 
      barcodeApi.scanBarcode(data),
  });
};

export const useBulkGenerateBarcodes = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { product_ids: number[]; barcode_type: string }) => 
      barcodeApi.bulkGenerateBarcodes(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.products() });
    },
  });
};

export const useBarcodeScanHistory = (params?: { product_id?: number; date_from?: string; date_to?: string; per_page?: number }) => {
  return useQuery({
    queryKey: queryKeys.barcode.scanHistory(params),
    queryFn: () => barcodeApi.getScanHistory(params),
  });
};

export const useBarcodeAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.barcode.analytics,
    queryFn: barcodeApi.getBarcodeAnalytics,
  });
};

// Supplier Hooks
export const useSuppliers = (params?: any) => {
  return useQuery({
    queryKey: queryKeys.suppliers.list(params),
    queryFn: () => supplierApi.getSuppliers(params),
  });
};

export const useSupplier = (id: number) => {
  return useQuery({
    queryKey: queryKeys.suppliers.detail(id),
    queryFn: () => supplierApi.getSupplier(id),
    enabled: !!id,
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supplierApi.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.analytics });
    },
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: any }) => 
      supplierApi.updateSupplier(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.analytics });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supplierApi.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.analytics });
    },
  });
};

export const useSupplierAnalytics = () => {
  return useQuery({
    queryKey: queryKeys.suppliers.analytics,
    queryFn: supplierApi.getAnalytics,
  });
};

export const useNextSupplierCode = () => {
  return useQuery({
    queryKey: queryKeys.suppliers.nextCode,
    queryFn: supplierApi.getNextSupplierCode,
  });
};

export const useSupplierCodeSettings = () => {
  return useQuery({
    queryKey: queryKeys.suppliers.codeSettings,
    queryFn: supplierApi.getCodeSettings,
  });
};

export const useUpdateSupplierCodePrefix = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supplierApi.updateCodePrefix,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.codeSettings });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.nextCode });
    },
  });
};

export const useBulkSupplierOperations = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: supplierApi.bulkOperations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers.analytics });
    },
  });
};

export const useExportSuppliers = () => {
  return useMutation({
    mutationFn: supplierApi.exportSuppliers,
  });
};

// Additional CRM hooks for sales opportunities
export const useCreateSalesOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: crmApi.createSalesOpportunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.summary });
    },
  });
};

export const useUpdateSalesOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => crmApi.updateSalesOpportunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'opportunities'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.crm.summary });
    },
  });
};

export const useSalesPipelineStages = () => {
  return useQuery({
    queryKey: ['crm', 'sales-pipeline-stages'],
    queryFn: crmApi.getSalesPipelineStages,
  });
};

export const useCreateSalesPipelineStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crmApi.createSalesPipelineStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'sales-pipeline-stages'] });
    },
  });
};

export const useUpdateSalesPipelineStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: number; name: string; order: number }) =>
      crmApi.updateSalesPipelineStage(data.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'sales-pipeline-stages'] });
    },
  });
};

export const useDeleteSalesPipelineStage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => crmApi.deleteSalesPipelineStage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm', 'sales-pipeline-stages'] });
    },
  });
};

// African-specific CRM hooks
export const useMobileMoneyAnalytics = () => {
  return useQuery({
    queryKey: ['crm', 'analytics', 'mobile-money'],
    queryFn: crmApi.getMobileMoneyAnalytics,
  });
};

export const useCommunityGroupsAnalytics = () => {
  return useQuery({
    queryKey: ['crm', 'analytics', 'community-groups'],
    queryFn: crmApi.getCommunityGroupsAnalytics,
  });
};

export const useCommunicationAnalytics = () => {
  return useQuery({
    queryKey: ['crm', 'analytics', 'communication'],
    queryFn: crmApi.getCommunicationAnalytics,
  });
};

export const useRegionalInsights = () => {
  return useQuery({
    queryKey: ['crm', 'analytics', 'regional'],
    queryFn: crmApi.getRegionalInsights,
  });
};

// Sales Hooks
export const useProcessTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesApi.processTransaction,
    onSuccess: () => {
      // Invalidate all sales-related queries to refresh analytics, history, etc.
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'daily-summary'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'hourly-pattern'] });
      queryClient.invalidateQueries({ queryKey: ['sales', 'top-products'] });
      
      // Invalidate all CRM-related queries to refresh customer lists, stats, and AI segments.
      // This ensures the Customer Intelligence tab is always up-to-date after a sale.
      queryClient.invalidateQueries({ queryKey: ['crm'] });
    },
  });
};

export const useSalesHistory = (params?: any) => {
  return useQuery({
    queryKey: ['sales', 'transactions', params],
    queryFn: async () => {
      // Return the full API envelope so components that expect
      // { success, message, data } (and use data.data) keep working.
      const res = await salesApi.getSalesHistory(params);
      return res;
    },
  });
};

export const useSalesCustomers = () => {
  return useQuery({
    queryKey: ['sales', 'customers'],
    queryFn: salesApi.getCustomers,
  });
};

export const useDailySalesSummary = (params?: any) => {
  return useQuery({
    queryKey: ['sales', 'daily-summary', params],
    queryFn: async () => {
      // Return the full API envelope to match components that access data.data.summary
      const res = await salesApi.getDailySalesSummary(params);
      return res;
    },
  });
};

export const useSalesAnalytics = (params?: any) => {
  return useQuery({
    queryKey: ['sales', 'analytics', params],
    queryFn: async () => {
      const res = await salesApi.getSalesAnalytics(params);
      return res.data;
    },
  });
};

export const useHourlySalesPattern = (params?: any) => {
  return useQuery({
    queryKey: ['sales', 'hourly-pattern', params],
    queryFn: async () => {
      const res = await salesApi.getHourlySalesPattern(params);
      return res.data;
    },
  });
};

export const useTopSellingProducts = (params?: any) => {
  return useQuery({
    queryKey: ['sales', 'top-products', params],
    queryFn: () => salesApi.getTopSellingProducts(params),
  });
};

export const useSmartRecommendations = (params?: any) => {
  return useQuery({
    queryKey: ['sales', 'recommendations', params],
    queryFn: () => salesApi.getSmartRecommendations(params),
  });
};

export const useDynamicPricing = (params?: any) => {
  return useQuery({
    queryKey: ['sales', 'dynamic-pricing', params],
    queryFn: () => salesApi.getDynamicPricing(params),
  });
};

// 🚀 Advanced Analytics Hooks
export const useAdvancedAnalyticsQuery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      query?: string;
      filters?: any;
      group_by?: string;
      metrics?: string[];
      date_range?: { start: string; end: string };
    }) => salesApi.advancedAnalyticsQuery(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', 'analytics'] });
    },
  });
};

export const useExportAnalytics = () => {
  return useMutation({
    mutationFn: (params: {
      format: 'json' | 'csv' | 'pdf';
      data: any[];
    }) => salesApi.exportAnalytics(params),
  });
};

// 🤖 CRM AI Services Hooks
export const useLeadScoringAI = () => {
  return useQuery({
    queryKey: ['crm', 'ai', 'lead-scoring'],
    queryFn: () => crmApi.getLeadScoring,
  });
};

export const useDealPredictionAI = () => {
  return useQuery({
    queryKey: ['crm', 'ai', 'deal-prediction'],
    queryFn: () => crmApi.getDealPrediction,
  });
};

export const useCustomerSegmentationAI = () => {
  return useQuery({
    queryKey: ['crm', 'ai', 'segmentation'],
    queryFn: () => crmApi.getCustomerSegmentation(),
  });
};

export const usePricingOptimizationAI = () => {
  return useQuery({
    queryKey: ['crm', 'ai', 'pricing-optimization'],
    queryFn: () => crmApi.getPricingOptimization,
  });
};

export const useCustomer360ViewAI = (contactId: number) => {
  return useQuery({
    queryKey: ['crm', 'ai', 'customer-360', contactId],
    queryFn: () => crmApi.getCustomer360View(contactId),
    enabled: !!contactId,
  });
};

export const useCustomerJourneyMappingAI = (contactId: number) => {
  return useQuery({
    queryKey: ['crm', 'ai', 'journey-mapping', contactId],
    queryFn: () => crmApi.getCustomerJourneyMapping(contactId),
    enabled: !!contactId,
  });
};

export const useVoiceOfCustomerAnalyticsAI = () => {
  return useQuery({
    queryKey: ['crm', 'ai', 'voice-of-customer'],
    queryFn: () => crmApi.getVoiceOfCustomerAnalytics,
  });
};

export const usePersonalizationEngineAI = (contactId: number) => {
  return useQuery({
    queryKey: ['crm', 'ai', 'personalization', contactId],
    queryFn: () => crmApi.getPersonalizationEngine(contactId),
    enabled: !!contactId,
  });
};

// Invoice Hooks
export const useInvoices = (params?: any) => {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceApi.getInvoices(params),
  });
};

export const useInvoice = (id: string | number) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getInvoice(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: invoiceApi.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => {
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      return invoiceApi.updateInvoice(id, filteredData);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', variables.id] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => invoiceApi.deleteInvoice(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    },
  });
};

export const useMarkAsSent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => invoiceApi.markAsSent(id),
    onSuccess: (_data, id) => {
      toast.success('Invoice marked as sent');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.refetchQueries({ queryKey: ['invoice', id] });
    },
    onError: () => {
      toast.error('Failed to mark invoice as sent');
    },
  });
};

export const useMarkAsPaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => invoiceApi.markAsPaid(id),
    onSuccess: (_data, id) => {
      toast.success('Invoice marked as paid');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.refetchQueries({ queryKey: ['invoice', id] });
    },
    onError: () => {
      toast.error('Failed to mark invoice as paid');
    },
  });
};

export const useVoidInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string | number) => invoiceApi.void(id),
    onSuccess: (_data, id) => {
      toast.success('Invoice voided');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
      queryClient.refetchQueries({ queryKey: ['invoice', id] });
    },
    onError: () => {
      toast.error('Failed to void invoice');
    },
  });
};

// Chat Hooks
export const useConversations = (page = 1) => {
  return useQuery({
    queryKey: ['chat', 'conversations', page],
    queryFn: () => chatApi.getConversations(page),
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: chatApi.createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'conversations'] });
    },
  });
};

export const useConversation = (id: number) => {
  return useQuery({
    queryKey: ['chat', 'conversation', id],
    queryFn: () => chatApi.getConversation(id),
    enabled: !!id,
  });
};

export const useMessages = (conversationId: number) => {
  return useQuery({
    queryKey: ['chat', 'messages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId),
    enabled: !!conversationId,
  });
};

export const useChannelMessages = (channelId: number) => {
  return useQuery({
    queryKey: ['chat', 'channel-messages', channelId],
    queryFn: () => chatApi.getChannelMessages(channelId),
    enabled: !!channelId,
  });
};

export const useSendMessage = (conversationId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessagePayload) => {
      const formData = new FormData();
      formData.append('content', data.content);
      if (data.files) {
        data.files.forEach(file => {
          formData.append('files[]', file);
        });
      }
      if (data.voice_note) {
        formData.append('voice_note', data.voice_note, 'voice_note.ogg');
      }
      return chatApi.sendMessage(conversationId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages', conversationId] });
      toast.success('Message sent');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });
};

export const useSendChannelMessage = (channelId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SendMessagePayload) => {
      const formData = new FormData();
      formData.append('content', data.content);
      if (data.files) {
        data.files.forEach(file => {
          formData.append('files[]', file);
        });
      }
      if (data.voice_note) {
        formData.append('voice_note', data.voice_note, 'voice_note.ogg');
      }
      return chatApi.sendChannelMessage(channelId, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'channel-messages', channelId] });
      toast.success('Message sent');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['chat', 'users'],
    queryFn: chatApi.getUsers,
  });
};

export const useAddReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { messageId: number; reaction: string }) =>
      chatApi.addReaction(data.messageId, data.reaction),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
};

export const useRemoveReaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { messageId: number; reactionId: number }) =>
      chatApi.removeReaction(data.messageId, data.reactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
    },
  });
};

export const useInitiateVoiceCall = () => {
  return useMutation({
    mutationFn: (receiverId: number) => chatApi.initiateVoiceCall(receiverId),
  });
};

export const useAcceptVoiceCall = () => {
  return useMutation({
    mutationFn: (callId: number) => chatApi.acceptVoiceCall(callId),
  });
};

export const useRejectVoiceCall = () => {
  return useMutation({
    mutationFn: (callId: number) => chatApi.rejectVoiceCall(callId),
  });
};

export const useExchangeRates = (baseCurrency = 'USD') => {
  return useQuery({
    queryKey: ['exchange-rates', baseCurrency],
    queryFn: async () => {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${baseCurrency}`);
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      const data = await response.json();
      if (data.result === 'error') {
        throw new Error(data['error-type'] || 'API returned an error');
      }
      return data;
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};
