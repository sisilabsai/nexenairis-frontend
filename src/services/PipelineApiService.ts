// API Service for CRM Pipeline
import { AuthService } from './auth/AuthService';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wecrafttech.com/api';

// API Client with authentication
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = AuthService.getToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Pipeline API Service
export class PipelineApiService {
  // Deals / Opportunities
  static async getDeals(filters?: {
    stage_id?: number;
    search?: string;
    priority?: string[];
    owner?: number[];
    temperature?: string[];
    date_range?: { start: string; end: string };
    value_range?: { min: number; max: number };
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
              params.append(`${key}[${subKey}]`, subValue.toString());
            });
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = params.toString();
    return apiClient.get(`/crm/opportunities${queryString ? `?${queryString}` : ''}`);
  }

  static async getDeal(id: number) {
    return apiClient.get(`/crm/opportunities/${id}`);
  }

  static async createDeal(data: any) {
    return apiClient.post('/crm/opportunities', data);
  }

  static async updateDeal(id: number, data: any) {
    return apiClient.put(`/crm/opportunities/${id}`, data);
  }

  static async deleteDeal(id: number) {
    return apiClient.delete(`/crm/opportunities/${id}`);
  }

  static async moveDeal(dealId: number, stageId: number) {
    return apiClient.put(`/crm/opportunities/${dealId}/stage`, { stage_id: stageId });
  }

  // Pipeline Stages
  static async getStages() {
    return apiClient.get('/crm/sales-pipeline-stages');
  }

  static async createStage(data: any) {
    return apiClient.post('/crm/sales-pipeline-stages', data);
  }

  static async updateStage(id: number, data: any) {
    return apiClient.put(`/crm/sales-pipeline-stages/${id}`, data);
  }

  static async deleteStage(id: number) {
    return apiClient.delete(`/crm/sales-pipeline-stages/${id}`);
  }

  // Pipeline Analytics
  static async getPipelineAnalytics(timeframe: string = '30d') {
    return apiClient.get(`/pipeline/analytics?timeframe=${timeframe}`);
  }

  static async getStageAnalytics(timeframe: string = '30d') {
    return apiClient.get(`/pipeline/stage-analytics?timeframe=${timeframe}`);
  }

  static async getForecastData(months: number = 6) {
    return apiClient.get(`/pipeline/forecast?months=${months}`);
  }

  static async getPerformanceMetrics(timeframe: string = '30d') {
    return apiClient.get(`/pipeline/performance?timeframe=${timeframe}`);
  }

  // Activities and Notes
  static async getDealActivities(dealId: number) {
    return apiClient.get(`/opportunities/${dealId}/activities`);
  }

  static async createActivity(dealId: number, data: any) {
    return apiClient.post(`/opportunities/${dealId}/activities`, data);
  }

  static async getDealComments(dealId: number) {
    return apiClient.get(`/opportunities/${dealId}/comments`);
  }

  static async addComment(dealId: number, message: string) {
    return apiClient.post(`/opportunities/${dealId}/comments`, { message });
  }
}

// Collaboration API Service
export class CollaborationApiService {
  static async getOnlineUsers() {
    return apiClient.get('/collaboration/online-users');
  }

  static async getRecentActivities(limit: number = 50) {
    return apiClient.get(`/collaboration/activities?limit=${limit}`);
  }

  static async getDealViewers(dealId: number) {
    return apiClient.get(`/collaboration/deals/${dealId}/viewers`);
  }

  static async startViewingDeal(dealId: number) {
    return apiClient.post(`/collaboration/deals/${dealId}/view`);
  }

  static async stopViewingDeal(dealId: number) {
    return apiClient.delete(`/collaboration/deals/${dealId}/view`);
  }

  static async lockDeal(dealId: number) {
    return apiClient.post(`/collaboration/deals/${dealId}/lock`);
  }

  static async unlockDeal(dealId: number) {
    return apiClient.delete(`/collaboration/deals/${dealId}/lock`);
  }

  static async getDealLocks() {
    return apiClient.get('/collaboration/deal-locks');
  }
}

// Automation API Service
export class AutomationApiService {
  static async getAutomationRules() {
    return apiClient.get('/automation/rules');
  }

  static async createAutomationRule(data: any) {
    return apiClient.post('/automation/rules', data);
  }

  static async updateAutomationRule(id: string, data: any) {
    return apiClient.put(`/automation/rules/${id}`, data);
  }

  static async toggleAutomationRule(id: string, isActive: boolean) {
    return apiClient.put(`/automation/rules/${id}/toggle`, { is_active: isActive });
  }

  static async deleteAutomationRule(id: string) {
    return apiClient.delete(`/automation/rules/${id}`);
  }

  static async getLeadScores() {
    return apiClient.get('/automation/lead-scores');
  }

  static async updateLeadScore(dealId: number) {
    return apiClient.post(`/automation/lead-scores/${dealId}/update`);
  }

  static async getSmartInsights() {
    return apiClient.get('/automation/insights');
  }

  static async getWorkflowTemplates() {
    return apiClient.get('/automation/workflow-templates');
  }

  static async createWorkflowTemplate(data: any) {
    return apiClient.post('/automation/workflow-templates', data);
  }

  static async executeWorkflow(templateId: string, dealId: number) {
    return apiClient.post(`/automation/workflow-templates/${templateId}/execute`, { deal_id: dealId });
  }

  // AI-Powered Deal Analysis
  static async getAIDealInsights(dealId: number) {
    return apiClient.get(`/ai/deals/${dealId}/insights`);
  }

  static async calculateAIDealScore(dealId: number) {
    return apiClient.post(`/ai/deals/${dealId}/score`);
  }

  static async getAIPipelineForecast(timeframe: string = '3months') {
    return apiClient.get(`/ai/pipeline/forecast?timeframe=${timeframe}`);
  }

  static async qualifyLeadWithAI(leadData: any) {
    return apiClient.post('/ai/leads/qualify', leadData);
  }

  static async assessDealRisk(dealId: number) {
    return apiClient.post(`/ai/deals/${dealId}/risk-assessment`);
  }

  static async optimizeCommunication(dealId: number, type: string) {
    return apiClient.post(`/ai/deals/${dealId}/communication-optimize`, { type });
  }

  static async analyzeCompetition(dealId: number) {
    return apiClient.post(`/ai/deals/${dealId}/competitive-analysis`);
  }

  static async generateAIRecommendations(dealId: number) {
    return apiClient.get(`/ai/deals/${dealId}/recommendations`);
  }
}

// Notification API Service
export class NotificationApiService {
  static async getNotificationCounts() {
    return apiClient.get('/notifications/counts');
  }

  static async markAsRead(module: string, id?: number) {
    const payload = id ? { id } : {};
    return apiClient.post(`/notifications/${module}/mark-read`, payload);
  }

  static async getNotifications(module?: string, limit: number = 20) {
    const params = new URLSearchParams();
    if (module) params.append('module', module);
    params.append('limit', limit.toString());
    
    return apiClient.get(`/notifications?${params.toString()}`);
  }
}

// Export all services
export {
  apiClient,
  ApiClient,
};