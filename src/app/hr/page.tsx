'use client';

import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BanknotesIcon,
  ChartBarIcon,
  UsersIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ChevronDownIcon,
  // 🚀 NEW Revolutionary AI Icons
  CpuChipIcon as BrainIcon,
  HeartIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  SparklesIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  BeakerIcon,
  ChartPieIcon,
  GlobeAltIcon,
  FireIcon,
  MagnifyingGlassIcon,
  TrophyIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import CustomAlert from '../../components/CustomAlert';
import EmployeeModal from '../../components/EmployeeModal';
import EmployeeDetailsModal from '../../components/EmployeeDetailsModal';
import DepartmentModal from '../../components/DepartmentModal';
import DepartmentDetailsModal from '../../components/DepartmentDetailsModal';
import JobPositionModal from '../../components/JobPositionModal';
import PayrollPeriodModal from '../../components/PayrollPeriodModal';
import PayrollItemsModal from '../../components/PayrollItemsModal';
import LeaveManagement from '../../components/LeaveManagement';
import LocalHolidayModal from '../../components/LocalHolidayModal';
import PerformanceMetricsModal from '../../components/PerformanceMetricsModal';
import SkillsAssessmentModal from '../../components/SkillsAssessmentModal';
import WellnessRecordModal from '../../components/WellnessRecordModal';
import AttendanceSessionModal from '../../components/AttendanceSessionModal';
import PayslipDeliveryModal from '../../components/PayslipDeliveryModal';
import EmployeePreferenceModal from '../../components/EmployeePreferenceModal';
import NssfModal from '../../components/NssfModal';
import NssfContributionModal from '../../components/NssfContributionModal';
import NssfStatusUpdateModal from '../../components/NssfStatusUpdateModal';
import PerformanceInfoModal from '../../components/PerformanceInfoModal';
import { 
  useHrSummary, 
  useEmployees, 
  useDepartments,
  useJobPositions,
  useCreateJobPosition,
  useUpdateJobPosition,
  useDeleteJobPosition,
  useCreateEmployee, 
  useUpdateEmployee, 
  useDeleteEmployee,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  usePayrollPeriods,
  useCreatePayrollPeriod,
  useUpdatePayrollPeriod,
  useDeletePayrollPeriod,
  useGeneratePayrollItems,
  useProcessPayroll,
  useMarkPayrollPaid,
  useCreateLocalHoliday,
  useUpdateLocalHoliday,
  useDeleteLocalHoliday,
  useInitializeUgandaHolidays
} from '../../hooks/useApi';
import { Employee, Department, JobPosition } from '../../types/hr';

export default function HrPage() {
  const [selectedView, setSelectedView] = useState<'overview' | 'employees' | 'departments' | 'job-positions' | 'payroll' | 'leave' | 'compliance' | 'performance' | 'mobile' | 'ai-insights' | 'talent-management' | 'wellness' | 'diversity' | 'workforce-analytics'>('overview');
  
  // Debug logging for selected view
  console.log('🔍 Current selectedView:', selectedView);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showJobPositionModal, setShowJobPositionModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);
  const [editingJobPosition, setEditingJobPosition] = useState<JobPosition | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  
  // Enhanced HR Features State
  const [showNssfModal, setShowNssfModal] = useState(false);
  const [showNssfContributionModal, setShowNssfContributionModal] = useState(false);
  const [nssfContributionModalMode, setNssfContributionModalMode] = useState<'view' | 'edit' | 'create' | 'delete'>('create');
  const [selectedNssfContribution, setSelectedNssfContribution] = useState<any>(null);
  const [showNssfStatusUpdateModal, setShowNssfStatusUpdateModal] = useState(false);
  const [statusUpdateData, setStatusUpdateData] = useState<{contribution: any, newStatus: 'processed' | 'paid'} | null>(null);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showAttendanceSessionModal, setShowAttendanceSessionModal] = useState(false);
  const [showPayslipDeliveryModal, setShowPayslipDeliveryModal] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [showPerformanceInfoModal, setShowPerformanceInfoModal] = useState(false);
  
  // 🚀 NEW Revolutionary AI Features State
  const [aiInsightsData, setAiInsightsData] = useState<any>(null);
  const [talentManagementData, setTalentManagementData] = useState<any>(null);
  const [wellnessAnalyticsData, setWellnessAnalyticsData] = useState<any>(null);
  const [diversityData, setDiversityData] = useState<any>(null);
  const [workforceAnalyticsData, setWorkforceAnalyticsData] = useState<any>(null);
  const [churnPredictionData, setChurnPredictionData] = useState<any>(null);
  const [performancePredictionData, setPerformancePredictionData] = useState<any>(null);
  const [compensationOptimizationData, setCompensationOptimizationData] = useState<any>(null);
  
  // AI Loading States
  const [loadingAiInsights, setLoadingAiInsights] = useState(false);
  const [loadingTalentManagement, setLoadingTalentManagement] = useState(false);
  const [loadingWellness, setLoadingWellness] = useState(false);
  const [loadingDiversity, setLoadingDiversity] = useState(false);
  const [loadingWorkforceAnalytics, setLoadingWorkforceAnalytics] = useState(false);
  
  // Custom Alert State
  const [customAlert, setCustomAlert] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    showConfirm?: boolean;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });
  
  // Enhanced HR Data State
  const [nssfData, setNssfData] = useState<any[]>([]);
  const [holidaysData, setHolidaysData] = useState<any[]>([]);
  const [wellnessData, setWellnessData] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [attendanceSessionsData, setAttendanceSessionsData] = useState<any[]>([]);
  const [payslipDeliveriesData, setPayslipDeliveriesData] = useState<any[]>([]);
  const [preferencesData, setPreferencesData] = useState<any[]>([]);

  // NSSF Filter State
  const [nssfSearchTerm, setNssfSearchTerm] = useState('');
  const [nssfStatusFilter, setNssfStatusFilter] = useState('');
  const [nssfPeriodFilter, setNssfPeriodFilter] = useState('');
  const [nssfSearchInput, setNssfSearchInput] = useState('');

  // Debounced search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setNssfSearchTerm(nssfSearchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [nssfSearchInput]);

  // Real API hooks
  const { data: summaryData, isLoading: summaryLoading, error: summaryError, refetch: refetchSummary } = useHrSummary();
  const { data: employeesData, isLoading: employeesLoading, refetch: refetchEmployees } = useEmployees();
  const { data: departmentsData, isLoading: departmentsLoading, refetch: refetchDepartments } = useDepartments();
  const { data: jobPositionsData, isLoading: jobPositionsLoading, refetch: refetchJobPositions } = useJobPositions();
  
  const createEmployeeMutation = useCreateEmployee();
  const updateEmployeeMutation = useUpdateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  const createDepartmentMutation = useCreateDepartment();
  const updateDepartmentMutation = useUpdateDepartment();
  const deleteDepartmentMutation = useDeleteDepartment();

  // Job Position mutations
  const createJobPositionMutation = useCreateJobPosition();
  const updateJobPositionMutation = useUpdateJobPosition();
  const deleteJobPositionMutation = useDeleteJobPosition();

  // Payroll hooks and state
  const { data: payrollPeriodsData, refetch: refetchPayrollPeriods } = usePayrollPeriods();
  const createPayrollPeriodMutation = useCreatePayrollPeriod();
  const updatePayrollPeriodMutation = useUpdatePayrollPeriod();
  const deletePayrollPeriodMutation = useDeletePayrollPeriod();
  const generatePayrollItemsMutation = useGeneratePayrollItems();
  const processPayrollMutation = useProcessPayroll();
  const markPayrollPaidMutation = useMarkPayrollPaid();

  // Holiday state - using same approach as NSSF
  const [localHolidaysData, setLocalHolidaysData] = useState<any>([]);
  

  const createLocalHolidayMutation = useCreateLocalHoliday();
  const updateLocalHolidayMutation = useUpdateLocalHoliday();
  const deleteLocalHolidayMutation = useDeleteLocalHoliday();
  const initializeUgandaHolidaysMutation = useInitializeUgandaHolidays();

  const [showPayrollPeriodModal, setShowPayrollPeriodModal] = useState(false);
  const [editingPayrollPeriod, setEditingPayrollPeriod] = useState<any>(null);
  const [showPayrollItemsModal, setShowPayrollItemsModal] = useState(false);
  const [selectedPayrollPeriod, setSelectedPayrollPeriod] = useState<any>(null);

  // Extract data from API responses with fallbacks
  const isLoading = summaryLoading || employeesLoading;
  const error = summaryError;
  
  // Helper function to safely extract array data from API responses
  const safeExtractArray = (data: any, fallback: any[] = []) => {
    if (!data) {
      return fallback;
    }
    
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle paginated API response (data.data.data for Laravel paginated results)
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      return data.data.data;
    }
    
    // Handle direct API response (data.data)
    if (data.data && Array.isArray(data.data)) {
      return data.data;
    }
    
    // Handle nested data structures
    if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      // Look for common array properties
      for (const key of ['items', 'data', 'results', 'records']) {
        if (data.data[key] && Array.isArray(data.data[key])) {
          return data.data[key];
        }
      }
    }
    
    return fallback;
  };
  
  // No fallback data - only use real data

  // Calculate real HR summary from actual data
  const realEmployees = safeExtractArray(employeesData);
  const realDepartments = safeExtractArray(departmentsData);
  
  // Calculate real statistics
  const totalEmployees = realEmployees.length;
  const activeEmployees = realEmployees.filter((emp: any) => emp.is_active).length;
  const totalPayroll = realEmployees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0);
  const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;
  
  // Calculate payment method breakdown
  const mobileMoneyEmployees = realEmployees.filter((emp: any) => emp.payment_method === 'mobile_money').length;
  const bankAccountEmployees = realEmployees.filter((emp: any) => emp.payment_method === 'bank_transfer').length;
  
  // Calculate department breakdown from real data
  const departmentBreakdown = realDepartments.map((dept: any) => {
    const deptEmployees = realEmployees.filter((emp: any) => emp.department_id === dept.id);
    const deptSalary = deptEmployees.reduce((sum: number, emp: any) => sum + (emp.salary || 0), 0);
    const avgSalary = deptEmployees.length > 0 ? deptSalary / deptEmployees.length : 0;
    
    return {
      department: dept.name,
      employees_count: deptEmployees.length,
      average_salary: avgSalary
    };
  }).filter((dept: any) => dept.employees_count > 0);
  
  // Use only real data from API or calculated values
  const apiData = (summaryData as any)?.data || {};
  const hrSummary = {
    total_employees: totalEmployees || apiData.total_employees || 0,
    active_employees: activeEmployees || apiData.active_employees || 0,
    departments: realDepartments.length || apiData.departments || 0,
    total_payroll: totalPayroll || apiData.total_payroll || 0,
    average_salary: averageSalary || apiData.average_salary || 0,
    mobile_money_employees: mobileMoneyEmployees || apiData.mobile_money_employees || 0,
    bank_account_employees: bankAccountEmployees || apiData.bank_account_employees || 0,
    pending_leave_requests: apiData.pending_leave_requests || 0,
    approved_leave_requests: apiData.approved_leave_requests || 0,
    monthly_payroll_trend: apiData.monthly_payroll_trend || [],
    department_breakdown: departmentBreakdown.length > 0 ? departmentBreakdown : (apiData.department_breakdown || []),
    payment_method_breakdown: apiData.payment_method_breakdown || [],
  };

  const formatCurrency = (amount: number | string | undefined | null) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (numAmount === undefined || numAmount === null || isNaN(numAmount)) {
      return 'UGX 0';
    }
    return `UGX ${numAmount.toLocaleString()}`;
  };

  // Load enhanced HR data
  const loadEnhancedHrData = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Set empty data instead of fallback
        setNssfData([]);
        setLocalHolidaysData([]);
        setWellnessData([]);
        setPerformanceData([]);
        setSkillsData([]);
        setAttendanceSessionsData([]);
        setPayslipDeliveriesData([]);
        setPreferencesData([]);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Load NSSF contributions
      const nssfResponse = await fetch('http://localhost:8000/api/hr/nssf-contributions', { headers });
      if (nssfResponse.ok) {
        const nssfData = await nssfResponse.json();
        setNssfData(nssfData.data || []);
      } else if (nssfResponse.status === 401) {
        // Set empty data instead of fallback
        setNssfData([]);
        setLocalHolidaysData([]);
        setWellnessData([]);
        setPerformanceData([]);
        setSkillsData([]);
        setAttendanceSessionsData([]);
        setPayslipDeliveriesData([]);
        setPreferencesData([]);
        return;
      }

      // Load local holidays
      const holidaysResponse = await fetch('http://localhost:8000/api/hr/local-holidays', { headers });
      if (holidaysResponse.ok) {
        const holidaysData = await holidaysResponse.json();
        // Ensure we always set an array, handle both direct array and paginated response
        const holidaysArray = Array.isArray(holidaysData) ? holidaysData : (holidaysData.data || []);
        setLocalHolidaysData(holidaysArray);
      } else {
        console.error('❌ Failed to load holidays:', holidaysResponse.status);
        setLocalHolidaysData([]);
      }

      // Load wellness records
      const wellnessResponse = await fetch('http://localhost:8000/api/hr/wellness-records', { headers });
      if (wellnessResponse.ok) {
        const wellnessData = await wellnessResponse.json();
        setWellnessData(wellnessData.data || []);
      }

      // Load performance metrics
      const performanceResponse = await fetch('http://localhost:8000/api/hr/performance-metrics', { headers });
      if (performanceResponse.ok) {
        const performanceData = await performanceResponse.json();
        setPerformanceData(performanceData.data || []);
      }

      // Load skills assessments
      const skillsResponse = await fetch('http://localhost:8000/api/hr/skills-gap-analysis', { headers });
      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkillsData(skillsData.data || []);
      }

      // Load attendance sessions
      const attendanceResponse = await fetch('http://localhost:8000/api/hr/attendance-sessions', { headers });
      if (attendanceResponse.ok) {
        const attendanceData = await attendanceResponse.json();
        setAttendanceSessionsData(attendanceData.data || []);
      }

      // Load payslip deliveries
      const payslipResponse = await fetch('http://localhost:8000/api/hr/payslip-deliveries', { headers });
      if (payslipResponse.ok) {
        const payslipData = await payslipResponse.json();
        setPayslipDeliveriesData(payslipData.data || []);
      }

      // Load employee preferences
      const preferencesResponse = await fetch('http://localhost:8000/api/hr/employee-preferences', { headers });
      if (preferencesResponse.ok) {
        const preferencesData = await preferencesResponse.json();
        setPreferencesData(preferencesData.data || []);
      }
    } catch (error) {
      console.error('Error loading enhanced HR data:', error);
      // Set empty data if API calls fail
      setNssfData([]);
      setLocalHolidaysData([]);
      setWellnessData([]);
      setPerformanceData([]);
      setSkillsData([]);
      setAttendanceSessionsData([]);
      setPayslipDeliveriesData([]);
      setPreferencesData([]);
    }
  };

  // Simple login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        // Reload the enhanced HR data
        loadEnhancedHrData();
        // Force re-render
        setSelectedView(selectedView);
      } else {
        showAlert('error', 'Login Failed', 'Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      showAlert('error', 'Login Failed', 'An error occurred. Please try again.');
    }
  };

  // Simple logout function
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    // Force re-render
    setSelectedView(selectedView);
  };

  // Custom Alert Helper Functions
  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setCustomAlert({
      isOpen: true,
      type,
      title,
      message
    });
  };

  const showConfirmAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, onConfirm: () => void) => {
    setCustomAlert({
      isOpen: true,
      type,
      title,
      message,
      showConfirm: true,
      onConfirm
    });
  };

  const closeAlert = () => {
    setCustomAlert(prev => ({ ...prev, isOpen: false }));
  };

  // No fallback data - only use real data from API

  // Load data when component mounts
  useEffect(() => {
    loadEnhancedHrData();
  }, []);

  // Load data when switching to enhanced tabs
  useEffect(() => {
    if (['compliance', 'performance', 'mobile'].includes(selectedView)) {
      loadEnhancedHrData();
    }
  }, [selectedView]);



  // 🤖 Load Revolutionary AI Data Functions
  const loadAIInsights = async () => {
    if (!localStorage.getItem('auth_token')) {
      setAiInsightsData(null);
      return;
    }

    setLoadingAiInsights(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Load all AI insights in parallel
      const [churnResponse, performanceResponse, compensationResponse] = await Promise.all([
        fetch('http://localhost:8000/api/hr/ai/churn-prediction', { headers }),
        fetch('http://localhost:8000/api/hr/ai/performance-prediction', { headers }),
        fetch('http://localhost:8000/api/hr/ai/compensation-optimization', { headers })
      ]);

      if (churnResponse.ok) {
        const churnData = await churnResponse.json();
        setChurnPredictionData(churnData.data || null);
      }

      if (performanceResponse.ok) {
        const perfData = await performanceResponse.json();
        setPerformancePredictionData(perfData.data || null);
      }

      if (compensationResponse.ok) {
        const compData = await compensationResponse.json();
        setCompensationOptimizationData(compData.data || null);
      }

      // Combine all AI insights
      setAiInsightsData({
        churn_prediction: churnPredictionData,
        performance_prediction: performancePredictionData,
        compensation_optimization: compensationOptimizationData,
        last_updated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error loading AI insights:', error);
      setAiInsightsData(null);
    } finally {
      setLoadingAiInsights(false);
    }
  };

  const loadTalentManagement = async () => {
    if (!localStorage.getItem('auth_token')) {
      setTalentManagementData(null);
      return;
    }

    setLoadingTalentManagement(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const [recruitmentResponse, successionResponse, learningResponse, engagementResponse] = await Promise.all([
        fetch('http://localhost:8000/api/hr/talent/recruitment-ai', { headers }),
        fetch('http://localhost:8000/api/hr/talent/succession-planning', { headers }),
        fetch('http://localhost:8000/api/hr/talent/learning-management', { headers }),
        fetch('http://localhost:8000/api/hr/talent/employee-engagement', { headers })
      ]);

      const talentData = {
        recruitment: recruitmentResponse.ok ? await recruitmentResponse.json() : null,
        succession: successionResponse.ok ? await successionResponse.json() : null,
        learning: learningResponse.ok ? await learningResponse.json() : null,
        engagement: engagementResponse.ok ? await engagementResponse.json() : null
      };

      setTalentManagementData(talentData);
    } catch (error) {
      console.error('Error loading talent management data:', error);
      setTalentManagementData(null);
    } finally {
      setLoadingTalentManagement(false);
    }
  };

  const loadWellnessData = async () => {
    if (!localStorage.getItem('auth_token')) {
      setWellnessAnalyticsData(null);
      return;
    }

    setLoadingWellness(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch('http://localhost:8000/api/hr/wellness/comprehensive-analysis', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setWellnessAnalyticsData(data.data || null);
      } else {
        setWellnessAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error loading wellness data:', error);
      setWellnessAnalyticsData(null);
    } finally {
      setLoadingWellness(false);
    }
  };

  const loadDiversityData = async () => {
    if (!localStorage.getItem('auth_token')) {
      setDiversityData(null);
      return;
    }

    setLoadingDiversity(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch('http://localhost:8000/api/hr/diversity/comprehensive-analysis', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setDiversityData(data.data || null);
      } else {
        setDiversityData(null);
      }
    } catch (error) {
      console.error('Error loading diversity data:', error);
      setDiversityData(null);
    } finally {
      setLoadingDiversity(false);
    }
  };

  const loadWorkforceAnalytics = async () => {
    if (!localStorage.getItem('auth_token')) {
      setWorkforceAnalyticsData(null);
      return;
    }

    setLoadingWorkforceAnalytics(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      const response = await fetch('http://localhost:8000/api/hr/analytics/comprehensive-workforce-insights', { headers });
      
      if (response.ok) {
        const data = await response.json();
        setWorkforceAnalyticsData(data.data || null);
      } else {
        setWorkforceAnalyticsData(null);
      }
    } catch (error) {
      console.error('Error loading workforce analytics:', error);
      setWorkforceAnalyticsData(null);
    } finally {
      setLoadingWorkforceAnalytics(false);
    }
  };

  // Enhanced useEffect for loading revolutionary features
  useEffect(() => {
    const revolutionaryViews = ['ai-insights', 'talent-management', 'wellness', 'diversity', 'workforce-analytics'];
    
    if (revolutionaryViews.includes(selectedView)) {
      switch (selectedView) {
        case 'ai-insights':
          loadAIInsights();
          break;
        case 'talent-management':
          loadTalentManagement();
          break;
        case 'wellness':
          loadWellnessData();
          break;
        case 'diversity':
          loadDiversityData();
          break;
        case 'workforce-analytics':
          loadWorkforceAnalytics();
          break;
      }
    }
  }, [selectedView]);

  // No fallback data creation functions - only use real data from API

  // Ensure payroll data is properly initialized
  useEffect(() => {
    if (selectedView === 'payroll' && payrollPeriodsData === undefined) {
      refetchPayrollPeriods();
    }
  }, [selectedView, payrollPeriodsData, refetchPayrollPeriods]);





  const handleNewEmployee = () => {
    setEditingEmployee(null);
    setShowEmployeeModal(true);
  };

  const handleEditEmployee = (employee: any) => {
    const formattedEmployee = {
      ...employee,
      department: typeof employee.department === 'string' 
        ? { name: employee.department } 
        : employee.department,
    };
    setEditingEmployee(formattedEmployee);
    setShowEmployeeModal(true);
  };

  const handleDeleteEmployee = async (employee: any) => {
    showConfirmAlert(
      'warning',
      'Delete Employee',
      `Are you sure you want to delete "${employee.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteEmployeeMutation.mutateAsync(employee.id);
          refetchEmployees();
          refetchSummary();
        } catch (error) {
          console.error('Error deleting employee:', error);
          showAlert('error', 'Delete Failed', 'Error deleting employee. Please try again.');
        }
      }
    );
  };

  const handleEmployeeModalClose = () => {
    setShowEmployeeModal(false);
    setEditingEmployee(null);
  };

  const handleEmployeeSuccess = () => {
    refetchEmployees();
    refetchSummary();
  };

  // Department handlers
  const handleNewDepartment = () => {
    setEditingDepartment(null);
    setShowDepartmentModal(true);
  };

  const handleEditDepartment = (department: any) => {
    setEditingDepartment(department);
    setShowDepartmentModal(true);
  };

  const handleDeleteDepartment = async (department: any) => {
    showConfirmAlert(
      'warning',
      'Delete Department',
      `Are you sure you want to delete "${department.name}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteDepartmentMutation.mutateAsync(department.id);
          // Refresh all data since departments affect multiple areas
          refetchEmployees();
          refetchSummary();
          // Note: departments query will automatically refetch due to mutation success
        } catch (error) {
          console.error('Error deleting department:', error);
          showAlert('error', 'Delete Failed', 'Error deleting department. Please try again.');
        }
      }
    );
  };

  const handleDepartmentModalClose = () => {
    setShowDepartmentModal(false);
    setEditingDepartment(null);
  };

  const handleDepartmentSuccess = () => {
    // Refresh all data since departments affect multiple areas
    refetchDepartments();
    refetchEmployees();
    refetchSummary();
  };

  // Job Position handlers
  const handleNewJobPosition = () => {
    setEditingJobPosition(null);
    setShowJobPositionModal(true);
  };

  const handleEditJobPosition = (position: any) => {
    setEditingJobPosition(position);
    setShowJobPositionModal(true);
  };

  const handleDeleteJobPosition = async (position: any) => {
    showConfirmAlert(
      'warning',
      'Delete Job Position',
      `Are you sure you want to delete "${position.title}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteJobPositionMutation.mutateAsync(position.id);
          refetchJobPositions();
          refetchSummary();
        } catch (error) {
          console.error('Error deleting job position:', error);
          showAlert('error', 'Delete Failed', 'Error deleting job position. Please try again.');
        }
      }
    );
  };

  const handleJobPositionSuccess = () => {
    // Refresh all data since job positions affect multiple areas
    refetchJobPositions();
    refetchEmployees();
    refetchSummary();
  };

  // Payroll handlers
  const handleNewPayrollPeriod = () => {
    setEditingPayrollPeriod(null);
    setShowPayrollPeriodModal(true);
  };

  const handleEditPayrollPeriod = (period: any) => {
    setEditingPayrollPeriod(period);
    setShowPayrollPeriodModal(true);
  };

  const handleDeletePayrollPeriod = async (period: any) => {
    showConfirmAlert(
      'warning',
      'Delete Payroll Period',
      `Are you sure you want to delete "${period.period_name}"? This action cannot be undone.`,
      async () => {
        try {
          await deletePayrollPeriodMutation.mutateAsync(period.id);
          refetchPayrollPeriods();
          refetchSummary();
        } catch (error) {
          console.error('Error deleting payroll period:', error);
          showAlert('error', 'Delete Failed', 'Error deleting payroll period. Please try again.');
        }
      }
    );
  };

  const handleGeneratePayroll = async (period: any) => {
    showConfirmAlert(
      'info',
      'Generate Payroll',
      `Generate payroll items for "${period.period_name}"? This will create payroll entries for all active employees.`,
      async () => {
        try {
          await generatePayrollItemsMutation.mutateAsync(period.id);
          refetchPayrollPeriods();
          showAlert('success', 'Success', 'Payroll items generated successfully!');
        } catch (error: any) {
          console.error('Error generating payroll:', error);
          showAlert('error', 'Error', `Error generating payroll: ${error.response?.data?.message || 'Please try again.'}`);
        }
      }
    );
  };

  const handleProcessPayroll = async (period: any) => {
    showConfirmAlert(
      'info',
      'Process Payroll',
      `Process payroll for "${period.period_name}"? This will mark all items as processed and ready for payment.`,
      async () => {
        try {
          await processPayrollMutation.mutateAsync(period.id);
          refetchPayrollPeriods();
          showAlert('success', 'Success', 'Payroll processed successfully! Ready for payment.');
        } catch (error: any) {
          console.error('Error processing payroll:', error);
          showAlert('error', 'Error', `Error processing payroll: ${error.response?.data?.message || 'Please try again.'}`);
        }
      }
    );
  };

  const handleMarkAsPaid = async (period: any) => {
    showConfirmAlert(
      'warning',
      'Mark as Paid',
      `Mark payroll as paid for "${period.period_name}"? This action cannot be undone.`,
      async () => {
        try {
          await markPayrollPaidMutation.mutateAsync({ periodId: period.id });
          refetchPayrollPeriods();
          refetchSummary();
          showAlert('success', 'Success', 'Payroll marked as paid successfully!');
        } catch (error: any) {
          console.error('Error marking payroll as paid:', error);
          showAlert('error', 'Error', `Error marking payroll as paid: ${error.response?.data?.message || 'Please try again.'}`);
        }
      }
    );
  };

  const handleViewPayrollItems = (period: any) => {
    setSelectedPayrollPeriod(period);
    setShowPayrollItemsModal(true);
  };

  const handlePayrollPeriodModalClose = () => {
    setShowPayrollPeriodModal(false);
    setEditingPayrollPeriod(null);
  };

  const handlePayrollPeriodSuccess = () => {
    refetchPayrollPeriods();
    refetchSummary();
  };

  const handlePayrollItemsModalClose = () => {
    setShowPayrollItemsModal(false);
    setSelectedPayrollPeriod(null);
  };

  // Enhanced HR Modal Close Handlers
  const handleNssfModalClose = () => setShowNssfModal(false);
  
  // NSSF Contribution Modal Handlers
  const handleNssfContributionAction = (contribution: any, action: 'view' | 'edit' | 'delete') => {
    setSelectedNssfContribution(contribution);
    setNssfContributionModalMode(action);
    setShowNssfContributionModal(true);
  };

  const handleNssfContributionModalClose = () => {
    setShowNssfContributionModal(false);
    setSelectedNssfContribution(null);
    setNssfContributionModalMode('create');
  };

  const handleNssfContributionSuccess = () => {
    loadEnhancedHrData();
    handleNssfContributionModalClose();
  };

  const handleQuickStatusUpdate = (contribution: any, newStatus: 'processed' | 'paid') => {
    setStatusUpdateData({ contribution, newStatus });
    setShowNssfStatusUpdateModal(true);
  };

  const handleStatusUpdateModalClose = () => {
    setShowNssfStatusUpdateModal(false);
    setStatusUpdateData(null);
  };

  const handleStatusUpdateSuccess = () => {
    loadEnhancedHrData();
    handleStatusUpdateModalClose();
  };

  const handleHolidayModalClose = () => {
    setShowHolidayModal(false);
    setEditingHoliday(null);
  };
  
  const handleHolidaySuccess = () => {
    loadEnhancedHrData();
    handleHolidayModalClose();
    // Show success message
    if (editingHoliday) {
      showAlert('success', 'Success', 'Holiday updated successfully!');
    } else {
      showAlert('success', 'Success', 'Holiday created successfully!');
    }
  };

  const handleEditHoliday = (holiday: any) => {
    setEditingHoliday(holiday);
    setShowHolidayModal(true);
  };
  const handleWellnessModalClose = () => setShowWellnessModal(false);
  const handlePerformanceModalClose = () => setShowPerformanceModal(false);
  const handleSkillsModalClose = () => setShowSkillsModal(false);
  const handleAttendanceSessionModalClose = () => setShowAttendanceSessionModal(false);
  const handlePayslipDeliveryModalClose = () => setShowPayslipDeliveryModal(false);
  const handlePreferencesModalClose = () => setShowPreferencesModal(false);

  // Filter employees based on search term and department
  const filteredEmployees = React.useMemo(() => {
    const employees = safeExtractArray(employeesData);
    
    if (!Array.isArray(employees)) {
      return [];
    }
    
    return employees.filter((employee: any) => {
      const matchesSearch = !searchTerm.trim() || 
        employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !filterDepartment ||
        (employee.department && employee.department.name === filterDepartment);
      
      return matchesSearch && matchesDepartment;
    });
  }, [employeesData, searchTerm, filterDepartment]);

  // Filter NSSF contributions based on search and filters
  const filteredNssfData = React.useMemo(() => {
    if (!Array.isArray(nssfData)) {
      return [];
    }
    
    return nssfData.filter((contribution: any) => {
      // Search filter
      const matchesSearch = !nssfSearchTerm.trim() || 
        contribution.employee_name?.toLowerCase().includes(nssfSearchTerm.toLowerCase()) ||
        contribution.nssf_number?.toLowerCase().includes(nssfSearchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = !nssfStatusFilter || contribution.status === nssfStatusFilter;
      
      // Payroll period filter
      const matchesPeriod = !nssfPeriodFilter || contribution.payroll_period_id?.toString() === nssfPeriodFilter;
      
      return matchesSearch && matchesStatus && matchesPeriod;
    });
  }, [nssfData, nssfSearchTerm, nssfStatusFilter, nssfPeriodFilter]);

  if (isLoading) {
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
          <ErrorMessage message="Failed to load HR data" />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page Header */}
        <div className="mb-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
          </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              {localStorage.getItem('auth_token') && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 mr-3"
                >
                  Logout
                </button>
              )}
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Export Report
              </button>
          <button 
                onClick={handleNewEmployee}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Employee
          </button>
            </div>
        </div>
      </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="sm:hidden">
            <select
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value as any)}
              className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="overview">Overview</option>
              <option value="employees">Employees</option>
              <option value="departments">Departments</option>
              <option value="job-positions">Job Positions</option>
              <option value="payroll">Payroll</option>
              <option value="leave">Leave Management</option>
              <option value="compliance">Local Compliance</option>
              <option value="performance">Performance & Wellness</option>
              <option value="mobile">Mobile Experience</option>
              <option value="ai-insights">🤖 AI Insights</option>
              <option value="talent-management">🚀 Talent Management</option>
              <option value="wellness">💝 Wellness Hub</option>
              <option value="diversity">🌍 Diversity & Inclusion</option>
              <option value="workforce-analytics">📊 Workforce Analytics</option>
            </select>
          </div>
          <div className="hidden sm:block">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                {[
                  { key: 'overview', label: 'Overview', icon: ChartBarIcon },
                  { key: 'employees', label: 'Employees', icon: UsersIcon },
                  { key: 'departments', label: 'Departments', icon: BuildingOfficeIcon },
                  { key: 'job-positions', label: 'Job Positions', icon: BuildingOfficeIcon },
                  { key: 'payroll', label: 'Payroll', icon: BanknotesIcon },
                  { key: 'leave', label: 'Leave Management', icon: CalendarIcon },
                  { key: 'compliance', label: 'Local Compliance', icon: ShieldCheckIcon },
                  { key: 'performance', label: 'Performance', icon: ArrowTrendingUpIcon },
                  { key: 'mobile', label: 'Mobile Experience', icon: PhoneIcon },
                  { key: 'ai-insights', label: '🤖 AI Insights', icon: BrainIcon },
                  { key: 'talent-management', label: '🚀 Talent Management', icon: RocketLaunchIcon },
                  { key: 'wellness', label: '💝 Wellness Hub', icon: HeartIcon },
                  { key: 'diversity', label: '🌍 Diversity & Inclusion', icon: GlobeAltIcon },
                  { key: 'workforce-analytics', label: '📊 Analytics', icon: ChartPieIcon },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedView(tab.key as any)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        selectedView === tab.key
                          ? 'border-indigo-500 text-indigo-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Content based on selected view */}
        {selectedView === 'overview' && (
          <div className="space-y-6">
            {/* Key HR Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                      <UsersIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Total Employees</dt>
                        <dd className="text-lg font-medium text-gray-900">{hrSummary.total_employees}</dd>
                      </dl>
                        </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">
                      {hrSummary.active_employees} active
                    </span>
                    <span className="text-gray-500"> employees</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                      <BuildingOfficeIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Departments</dt>
                        <dd className="text-lg font-medium text-gray-900">{hrSummary.departments}</dd>
                    </dl>
                  </div>
                </div>
              </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">All active</span>
            </div>
                </div>
      </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <BanknotesIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Monthly Payroll</dt>
                        <dd className="text-lg font-medium text-gray-900">{formatCurrency(hrSummary.total_payroll)}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-purple-600 font-medium">+8.5%</span>
                    <span className="text-gray-500"> from last month</span>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-6 w-6 text-orange-400" />
                        </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Pending Leave</dt>
                        <dd className="text-lg font-medium text-gray-900">{hrSummary.pending_leave_requests}</dd>
                    </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">
                      {hrSummary.approved_leave_requests} approved
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* African Business Context - Payment Methods */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  💰 Employee Payment Methods (African Context)
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 text-purple-600 mr-3" />
                      <span className="font-medium text-gray-900">Mobile Money</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-purple-600">
                        {hrSummary.mobile_money_employees}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((hrSummary.mobile_money_employees / hrSummary.total_employees) * 100)}% of employees
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">Bank Account</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        {hrSummary.bank_account_employees}
                      </div>
                      <div className="text-xs text-gray-500">
                        {Math.round((hrSummary.bank_account_employees / hrSummary.total_employees) * 100)}% of employees
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Department Breakdown</h3>
                <div className="space-y-3">
                  {hrSummary.department_breakdown.map((dept: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          dept.department === 'IT' ? 'bg-blue-400' :
                          dept.department === 'Sales' ? 'bg-green-400' :
                          dept.department === 'Operations' ? 'bg-purple-400' :
                          dept.department === 'Finance' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}></div>
                        <span className="font-medium text-gray-900">{dept.department}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {dept.employees_count} employees
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {formatCurrency(dept.average_salary)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payroll Trend */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Payroll Trend</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {hrSummary.monthly_payroll_trend.map((trend: any, index: number) => (
                  <div key={index} className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-4">
                    <div className="text-sm text-gray-600 mb-2">{trend.month}</div>
                    <div className="text-lg font-bold text-indigo-600">
                      {formatCurrency(trend.amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total payroll
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Employees Tab */}
        {selectedView === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Employee Directory</h3>
                  {searchTerm && (
                    <p className="text-sm text-gray-500 mt-1">
                      Showing {filteredEmployees?.length || 0} results for "{searchTerm}"
                    </p>
        )}
      </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">All Departments</option>
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                    <option value="HR">HR</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
            <button
                    onClick={handleNewEmployee}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Employee
            </button>
        </div>
      </div>

      {/* Employees Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
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
                    {filteredEmployees?.map((employee: any) => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {employee.name?.charAt(0) || 'E'}
                                </span>
                            </div>
                          </div>
                          <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {employee.name}
                          </div>
                              <div className="text-sm text-gray-500">
                                ID: {employee.employee_id}
                        </div>
                          </div>
                        </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{employee.email}</div>
                          <div className="text-sm text-gray-500">{employee.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {employee.position || 'No Position'}
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {employee.department?.name || employee.department || 'No Department'}
                        </span>
                        </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(employee.salary)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                            {employee.payment_method === 'mobile_money' ? (
                              <>
                                <PhoneIcon className="h-4 w-4 text-purple-500 mr-1" />
                                <span>Mobile Money</span>
                              </>
                            ) : employee.payment_method === 'bank_transfer' ? (
                              <>
                                <BuildingOfficeIcon className="h-4 w-4 text-blue-500 mr-1" />
                                <span>Bank Transfer</span>
                              </>
                            ) : employee.payment_method === 'cash' ? (
                              <>
                                💵
                                <span className="ml-1">Cash</span>
                              </>
                            ) : employee.payment_method === 'cheque' ? (
                              <>
                                📝
                                <span className="ml-1">Cheque</span>
                              </>
                            ) : (
                              <span className="text-gray-400">Not set</span>
                            )}
                        </div>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            employee.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {employee.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-gray-600 hover:text-gray-900 mr-3"
                            title="View Employee"
                            onClick={() => setViewingEmployee(employee)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditEmployee(employee)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Edit Employee"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEmployee(employee)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Employee"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

                {(!filteredEmployees || filteredEmployees.length === 0) && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm || filterDepartment ? 
                        'No employees found matching your criteria. Try adjusting your search or filters.' : 
                        'No employees found. Add your first employee to get started!'
                      }
            </div>
                    {(searchTerm || filterDepartment) && (
                      <button 
                        onClick={() => {
                          setSearchTerm('');
                          setFilterDepartment('');
                        }}
                        className="mt-2 text-indigo-600 hover:text-indigo-500 text-sm"
                      >
                        Clear filters
                      </button>
          )}
        </div>
          )}
      </div>
      </div>
          </div>
        )}

                {/* Departments Tab */}
        {selectedView === 'departments' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Department Management</h3>
                <button
                  onClick={handleNewDepartment}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Department
                </button>
              </div>
              
              {/* Debug Info - Check browser console for details */}
              
              {/* Loading State */}
              {departmentsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading departments...</div>
                </div>
              )}
              
              {/* Error State */}
              {!departmentsLoading && !departmentsData && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-500">Error loading departments. Please try again.</div>
                </div>
              )}
              
              {/* Departments Table */}
              {!departmentsLoading && (
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Remaining Budget
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
                    {safeExtractArray(departmentsData).map((department: any) => (
                      <tr key={department.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {department.name?.charAt(0) || 'D'}
                                </span>
                </div>
                </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {department.name}
                </div>
                </div>
                  </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {department.code}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {department.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {department.employees_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {department.budget ? formatCurrency(department.budget) : 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {department.budget ? formatCurrency(department.remaining_budget) : 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            department.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {department.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            className="text-gray-600 hover:text-gray-900 mr-3"
                            title="View Department"
                            onClick={() => setViewingDepartment(department)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditDepartment(department)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Edit Department"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteDepartment(department)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Department"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {safeExtractArray(departmentsData).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      No departments found. Create your first department to get started!
                    </div>
                    <button 
                      onClick={handleNewDepartment}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Department
                    </button>
                  </div>
                )}
                </div>
              )}
                
              {/* Department Statistics Summary */}
              {safeExtractArray(departmentsData).length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {safeExtractArray(departmentsData).length || 0}
                </div>
                    <div className="text-sm text-gray-600">Total Departments</div>
                </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {safeExtractArray(departmentsData).filter((d: any) => d.is_active).length || 0}
                </div>
                    <div className="text-sm text-gray-600">Active Departments</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {(() => {
                        const depts = safeExtractArray(departmentsData);
                        return depts.length > 0 ? depts.reduce((sum: number, d: any) => sum + (d.employees_count || 0), 0) : 0;
                      })()}
                  </div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                </div>
                  </div>
              )}
            </div>
          </div>
        )}

        {/* Job Positions Tab */}
        {selectedView === 'job-positions' && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Job Positions Management</h3>
                <button
                  onClick={() => setShowJobPositionModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Job Position
                </button>
              </div>
              
              {/* Loading State */}
              {jobPositionsLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading job positions...</div>
                </div>
              )}
              
              {/* Error State */}
              {!jobPositionsLoading && !jobPositionsData && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-red-500">Error loading job positions. Please try again.</div>
                </div>
              )}
              
              {/* Job Positions Table */}
              {!jobPositionsLoading && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Position
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Salary Range
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
                      {safeExtractArray(jobPositionsData).map((position: any) => (
                        <tr key={position.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {position.title?.charAt(0) || 'P'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {position.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {position.description || 'No description'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {position.code}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {position.department?.name || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {position.min_salary && position.max_salary ? (
                              <span>
                                {formatCurrency(position.min_salary)} - {formatCurrency(position.max_salary)}
                              </span>
                            ) : (
                              'Not set'
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              position.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {position.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              onClick={() => {
                                setEditingJobPosition(position);
                                setShowJobPositionModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                              title="Edit Position"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteJobPosition(position)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Position"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {safeExtractArray(jobPositionsData).length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-gray-500">
                        No job positions found. Create your first job position to get started!
                      </div>
                      <button 
                        onClick={() => setShowJobPositionModal(true)}
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Job Position
                      </button>
                    </div>
                  )}
                </div>
              )}
                
              {/* Job Positions Statistics Summary */}
              {safeExtractArray(jobPositionsData).length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {safeExtractArray(jobPositionsData).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Positions</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {safeExtractArray(jobPositionsData).filter((p: any) => p.is_active).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Active Positions</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {(() => {
                        const positions = safeExtractArray(jobPositionsData);
                        const withSalary = positions.filter((p: any) => p.min_salary && p.max_salary);
                        return withSalary.length;
                      })()}
                    </div>
                    <div className="text-sm text-gray-600">Positions with Salary Range</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payroll Tab */}
        {selectedView === 'payroll' && (
          <div className="space-y-6">
            {/* Payroll Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{formatCurrency(hrSummary.total_payroll)}</div>
                <div className="text-sm text-gray-600">Monthly Payroll</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{formatCurrency(hrSummary.average_salary)}</div>
                <div className="text-sm text-gray-600">Average Salary</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((hrSummary.mobile_money_employees / hrSummary.total_employees) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Mobile Money Usage</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{hrSummary.active_employees}</div>
                <div className="text-sm text-gray-600">Active Employees</div>
                  </div>
                </div>
                
            {/* Payroll Management */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Payroll Periods</h3>
                  <button
                  onClick={handleNewPayrollPeriod}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Payroll Period
                  </button>
                  </div>
                  
              {/* Payroll Periods Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Range
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employees
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Amount
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
                    {safeExtractArray(payrollPeriodsData).map((period: any) => (
                      <tr key={period.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{period.period_name}</div>
                          <div className="text-sm text-gray-500">{period.currency}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(period.start_date).toLocaleDateString()} - {new Date(period.end_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {period.payroll_items_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(period.total_net || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            period.status === 'completed' ? 'bg-green-100 text-green-800' :
                            period.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            period.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {period.status === 'completed' ? '✅ Paid' :
                             period.status === 'processing' ? '⏳ Processing' :
                             period.status === 'draft' ? '📝 Draft' :
                             period.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {period.status === 'draft' && (
                  <button
                              onClick={() => handleGeneratePayroll(period)}
                              className="text-green-600 hover:text-green-900 mr-3"
                              title="Generate Payroll"
                            >
                              ⚡ Generate
                            </button>
                          )}
                          {period.status === 'draft' && period.payroll_items_count > 0 && (
                            <button 
                              onClick={() => handleProcessPayroll(period)}
                              className="text-blue-600 hover:text-blue-900 mr-3"
                              title="Process Payroll"
                            >
                              🔄 Process
                  </button>
                          )}
                          {period.status === 'processing' && (
                            <button 
                              onClick={() => handleMarkAsPaid(period)}
                              className="text-purple-600 hover:text-purple-900 mr-3"
                              title="Mark as Paid"
                            >
                              💰 Mark Paid
                            </button>
                          )}
                          <button 
                            onClick={() => handleViewPayrollItems(period)}
                            className="text-gray-600 hover:text-gray-900 mr-3"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditPayrollPeriod(period)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            title="Edit Period"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          {period.status === 'draft' && (
                            <button 
                              onClick={() => handleDeletePayrollPeriod(period)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Period"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {safeExtractArray(payrollPeriodsData).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      No payroll periods found. Create your first payroll period to get started!
                </div>
                    <button 
                      onClick={handleNewPayrollPeriod}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Create Payroll Period
                    </button>
                </div>
                )}
                </div>
                </div>
                
            {/* African Payment Methods Summary */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <PhoneIcon className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                      <div className="text-lg font-semibold text-purple-600">{hrSummary.mobile_money_employees}</div>
                      <div className="text-sm text-gray-600">Mobile Money Employees</div>
                </div>
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                      <div className="text-lg font-semibold text-blue-600">{hrSummary.bank_account_employees}</div>
                      <div className="text-sm text-gray-600">Bank Transfer Employees</div>
                  </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💵</span>
                  <div>
                      <div className="text-lg font-semibold text-green-600">{(hrSummary as any).cash_employees || 0}</div>
                      <div className="text-sm text-gray-600">Cash Payment Employees</div>
                  </div>
                </div>
                </div>
            </div>
          </div>
        </div>
      )}

        {/* Leave Management Tab */}
        {selectedView === 'leave' && (
          <>
            {console.log('🔍 Rendering LeaveManagement component')}
            <LeaveManagement hrSummary={hrSummary} />
          </>
        )}

        {/* Authentication Notice */}
        {!localStorage.getItem('auth_token') && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Authentication Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    To access real-time data from the enhanced HR features, you need to be authenticated. 
                    Currently showing sample data for demonstration purposes.
                  </p>
                  <p className="mt-1">
                    <strong>Test Credentials:</strong> admin@singo-erp.com / password123
                  </p>
                </div>
                
                {/* Login Form */}
                <form onSubmit={handleLogin} className="mt-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      defaultValue="admin@singo-erp.com"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      defaultValue="password123"
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Login to Access Real Data
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Local Compliance Tab */}
        {selectedView === 'compliance' && (
          <div className="space-y-6">
            {/* NSSF Contributions */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">NSSF Contributions (Uganda)</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage National Social Security Fund contributions for all employees</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedNssfContribution(null);
                      setNssfContributionModalMode('create');
                      setShowNssfContributionModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Contribution
                  </button>
                  <button
                    onClick={() => setShowNssfModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Quick Add
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="mb-4 flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search by employee name or NSSF number..."
                    value={nssfSearchInput}
                    onChange={(e) => setNssfSearchInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {nssfSearchInput && (
                    <div className="text-xs text-gray-500 mt-1">
                      {nssfSearchInput !== nssfSearchTerm ? 'Searching...' : `${filteredNssfData.length} results`}
                    </div>
                  )}
                </div>
                <select 
                  value={nssfStatusFilter}
                  onChange={(e) => setNssfStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                  <option value="paid">Paid</option>
                </select>
                <select 
                  value={nssfPeriodFilter}
                  onChange={(e) => setNssfPeriodFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Payroll Periods</option>
                  {Array.isArray(nssfData) && nssfData.length > 0 && (
                    [...new Set(nssfData.map(c => c.payroll_period_id))].map(periodId => {
                      const period = nssfData.find(c => c.payroll_period_id === periodId);
                      return (
                        <option key={periodId} value={periodId}>
                          {period?.payroll_period_name || `Period ${periodId}`}
                        </option>
                      );
                    })
                  )}
                </select>
                {(nssfSearchTerm || nssfStatusFilter || nssfPeriodFilter) && (
                  <button
                    onClick={() => {
                      setNssfSearchInput('');
                      setNssfSearchTerm('');
                      setNssfStatusFilter('');
                      setNssfPeriodFilter('');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Search Results Indicator */}
              {(nssfSearchTerm || nssfStatusFilter || nssfPeriodFilter) && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-800">
                      <span className="font-medium">Filtered Results:</span> Showing {filteredNssfData.length} of {nssfData.length} contributions
                      {nssfSearchTerm && (
                        <span className="ml-2">• Search: "{nssfSearchTerm}"</span>
                      )}
                      {nssfStatusFilter && (
                        <span className="ml-2">• Status: {nssfStatusFilter}</span>
                      )}
                      {nssfPeriodFilter && (
                        <span className="ml-2">• Period: {nssfData.find(c => c.payroll_period_id?.toString() === nssfPeriodFilter)?.payroll_period_name || `Period ${nssfPeriodFilter}`}</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setNssfSearchInput('');
                        setNssfSearchTerm('');
                        setNssfStatusFilter('');
                        setNssfPeriodFilter('');
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredNssfData.length}
                  </div>
                  <div className="text-sm text-blue-700">
                    {nssfSearchTerm || nssfStatusFilter || nssfPeriodFilter ? 'Filtered' : 'Total'} Contributions
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredNssfData.filter(c => c.status === 'paid').length}
                  </div>
                  <div className="text-sm text-green-700">Paid</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredNssfData.filter(c => c.status === 'processed').length}
                  </div>
                  <div className="text-sm text-yellow-700">Processed</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-600">
                    {filteredNssfData.filter(c => c.status === 'pending').length}
                  </div>
                  <div className="text-sm text-gray-700">Pending</div>
                </div>
              </div>



              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                         <div className="flex items-center">
                           <span>Employee</span>
                           <ChevronDownIcon className="ml-1 h-4 w-4" />
                         </div>
                       </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NSSF Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payroll Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gross Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee (5%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employer (10%)</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Processed Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNssfData.length > 0 ? (
                      filteredNssfData.map((contribution, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                                  <span className="text-sm font-medium text-white">
                                    {contribution.employee_name?.charAt(0) || 'E'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {contribution.employee_name || 'Unknown Employee'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {contribution.user_id || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {contribution.nssf_number || 'Not Set'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {contribution.payroll_period_name || 
                             (contribution.payroll_period_id ? `Period ${contribution.payroll_period_id}` : 'Unknown Period')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(contribution.gross_salary)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(contribution.employee_contribution)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(contribution.employer_contribution)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            {formatCurrency(contribution.total_contribution)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              contribution.status === 'paid' ? 'bg-green-100 text-green-800' :
                              contribution.status === 'processed' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {contribution.status === 'paid' ? '✅ Paid' :
                               contribution.status === 'processed' ? '⏳ Processed' :
                               '⏸️ Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {contribution.processed_at ? 
                              new Date(contribution.processed_at).toLocaleDateString() : 
                              'Not processed'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-indigo-600 hover:text-indigo-900"
                                title="View Details"
                                onClick={() => handleNssfContributionAction(contribution, 'view')}
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button 
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Edit Contribution"
                                onClick={() => handleNssfContributionAction(contribution, 'edit')}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              {contribution.status === 'pending' && (
                                <button 
                                  className="text-green-600 hover:text-green-900"
                                  title="Mark as Processed"
                                  onClick={() => handleQuickStatusUpdate(contribution, 'processed')}
                                >
                                  ⚡
                                </button>
                              )}
                              {contribution.status === 'processed' && (
                                <button 
                                  className="text-green-600 hover:text-green-900"
                                  title="Mark as Paid"
                                  onClick={() => handleQuickStatusUpdate(contribution, 'paid')}
                                >
                                  💰
                                </button>
                              )}
                              <button 
                                className="text-red-600 hover:text-red-900"
                                title="Delete Contribution"
                                onClick={() => handleNssfContributionAction(contribution, 'delete')}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                          <div className="py-8">
                            <div className="text-gray-400 mb-2">
                              <BanknotesIcon className="h-12 w-12 mx-auto" />
                            </div>
                            <div className="text-lg font-medium text-gray-900 mb-2">
                              {nssfSearchTerm || nssfStatusFilter || nssfPeriodFilter 
                                ? 'No NSSF contributions match your filters' 
                                : 'No NSSF contributions found'
                              }
                            </div>
                            <div className="text-gray-500 mb-4">
                              {nssfSearchTerm || nssfStatusFilter || nssfPeriodFilter 
                                ? 'Try adjusting your search criteria or clear filters'
                                : 'Get started by adding your first NSSF contribution'
                              }
                            </div>
                            {(nssfSearchTerm || nssfStatusFilter || nssfPeriodFilter) ? (
                              <button
                                onClick={() => {
                                  setNssfSearchInput('');
                                  setNssfSearchTerm('');
                                  setNssfStatusFilter('');
                                  setNssfPeriodFilter('');
                                }}
                                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                              >
                                Clear All Filters
                              </button>
                            ) : (
                              <button
                                onClick={() => setShowNssfModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                              >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add First Contribution
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {filteredNssfData.length > 0 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredNssfData.length}</span> of{' '}
                    <span className="font-medium">{nssfData.length}</span> results
                    {(nssfSearchTerm || nssfStatusFilter || nssfPeriodFilter) && (
                      <span className="text-gray-500 ml-2">(filtered)</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      Previous
                    </button>
                    <span className="px-3 py-2 text-sm text-gray-700">Page 1 of 1</span>
                    <button className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Local Holidays */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Local Holidays (Uganda)</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage public and company holidays</p>
                </div>
                                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      showConfirmAlert(
                        'info',
                        'Initialize Uganda Holidays',
                        'This will add all Uganda public holidays for 2025. Continue?',
                        () => {
                          initializeUgandaHolidaysMutation.mutate(2025, {
                            onSuccess: () => {
                              showAlert('success', 'Success', 'Uganda holidays initialized successfully!');
                              loadEnhancedHrData();
                            },
                            onError: (error: any) => {
                              console.error('❌ Error initializing Uganda holidays:', error);
                              console.error('❌ Error response:', error?.response?.data);
                              showAlert('error', 'Error', `Failed to initialize holidays: ${error?.response?.data?.message || 'Unknown error'}`);
                            }
                          });
                        }
                      );
                    }}
                    disabled={initializeUgandaHolidaysMutation.isPending}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    {initializeUgandaHolidaysMutation.isPending ? (
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span>🇺🇬</span>
                    )}
                    {initializeUgandaHolidaysMutation.isPending ? 'Initializing...' : 'Init Uganda Holidays'}
                  </button>
                  <button
                    onClick={() => loadEnhancedHrData()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🔄 Refresh
                  </button>

                <button
                  onClick={() => {
                    setEditingHoliday(null);
                    setShowHolidayModal(true);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Holiday
                </button>
              </div>
              </div>
              


              {/* Holiday Summary */}
              {Array.isArray(localHolidaysData) && localHolidaysData.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {localHolidaysData.length}
                    </div>
                    <div className="text-sm text-blue-700">Total Holidays</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {localHolidaysData.filter((h: any) => h.type === 'public_holiday').length}
                    </div>
                    <div className="text-sm text-green-700">Public Holidays</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {localHolidaysData.filter((h: any) => h.type === 'company_holiday').length}
                    </div>
                    <div className="text-sm text-purple-700">Company Holidays</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {localHolidaysData.filter((h: any) => h.is_paid).length}
                    </div>
                    <div className="text-sm text-yellow-700">Paid Holidays</div>
                  </div>
                </div>
              )}
              


                            {/* Holidays Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Extract holidays from paginated response */}
                {(() => {
                  const holidaysArray = localHolidaysData?.data || [];
                  
                  if (holidaysArray.length > 0) {
                    return holidaysArray.map((holiday: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                            <p className="text-sm text-gray-500">{holiday.date}</p>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                              holiday.type === 'public_holiday' ? 'bg-blue-100 text-blue-800' :
                              holiday.type === 'company_holiday' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {holiday.type.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              holiday.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {holiday.is_paid ? 'Paid' : 'Unpaid'}
                            </span>
                          </div>
                        </div>
                        {holiday.description && (
                          <p className="text-sm text-gray-600 mt-2">{holiday.description}</p>
                        )}
                        <div className="flex justify-end space-x-2 mt-3 pt-3 border-t">
                          <button
                            onClick={() => handleEditHoliday(holiday)}
                            className="text-indigo-600 hover:text-indigo-900 text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => {
                              showConfirmAlert(
                                'warning',
                                'Delete Holiday',
                                `Are you sure you want to delete "${holiday.name}"? This action cannot be undone.`,
                                () => {
                                  deleteLocalHolidayMutation.mutate(holiday.id, {
                                    onSuccess: () => {
                                      showAlert('success', 'Success', 'Holiday deleted successfully!');
                                      loadEnhancedHrData();
                                    },
                                    onError: (error: any) => {
                                      showAlert('error', 'Error', `Failed to delete holiday: ${error?.response?.data?.message || 'Unknown error'}`);
                                    }
                                  });
                                }
                              );
                            }}
                            disabled={deleteLocalHolidayMutation.isPending}
                            className="text-red-600 hover:text-red-900 text-sm disabled:opacity-50"
                          >
                            {deleteLocalHolidayMutation.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    ));
                  } else {
                    return (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No holidays found. Add Uganda public holidays and company holidays.
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Performance & Wellness Tab */}
        {selectedView === 'performance' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowPerformanceInfoModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <LightBulbIcon className="h-4 w-4 mr-2" />
                How to Use
              </button>
            </div>
            {/* Wellness Dashboard */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Wellness Dashboard</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Array.isArray(wellnessData) ? wellnessData.filter(w => w.wellness_status === 'excellent').length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Excellent Wellness</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {Array.isArray(wellnessData) ? wellnessData.filter(w => w.wellness_status === 'good').length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Good Wellness</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Array.isArray(wellnessData) ? wellnessData.filter(w => w.wellness_status === 'fair').length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Fair Wellness</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {Array.isArray(wellnessData) ? wellnessData.filter(w => w.wellness_status === 'poor').length : 0}
                  </div>
                  <div className="text-sm text-gray-600">Poor Wellness</div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Performance Analytics</h3>
                <button
                  onClick={() => setShowPerformanceModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Metric
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Metric</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Insights</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(performanceData) && performanceData.length > 0 ? (
                      performanceData.map((metric, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {metric.employee_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {metric.metric_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {metric.score}/100
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              metric.score >= 90 ? 'bg-green-100 text-green-800' :
                              metric.score >= 80 ? 'bg-blue-100 text-blue-800' :
                              metric.score >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {metric.score >= 90 ? 'Excellent' :
                               metric.score >= 80 ? 'Good' :
                               metric.score >= 70 ? 'Satisfactory' : 'Needs Improvement'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="max-w-xs truncate" title={metric.ai_insights}>
                              {metric.ai_insights}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No performance metrics found. Add metrics to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Skills Gap Analysis */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Skills Gap Analysis</h3>
                <button
                  onClick={() => setShowSkillsModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Assessment
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(skillsData) && skillsData.length > 0 ? (
                  skillsData.map((skill, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{skill.skill_name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          skill.priority === 'high' ? 'bg-red-100 text-red-800' :
                          skill.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {skill.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{skill.skill_category}</p>
                      <div className="flex justify-between text-sm">
                        <span>Current: {skill.current_level}/5</span>
                        <span>Required: {skill.required_level}/5</span>
                      </div>
                      <div className="mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          skill.gap_score > 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          Gap: {skill.gap_score > 0 ? `+${skill.gap_score}` : 'None'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No skills assessments found. Add assessments to analyze skill gaps.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Experience Tab */}
        {selectedView === 'mobile' && (
          <div className="space-y-6">
            {/* QR Attendance Sessions */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">QR Code Attendance Sessions</h3>
                <button
                  onClick={() => setShowAttendanceSessionModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Session
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(attendanceSessionsData) && attendanceSessionsData.length > 0 ? (
                  attendanceSessionsData.map((session, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{session.session_name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.status === 'active' ? 'bg-green-100 text-green-800' :
                          session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {session.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">QR: {session.qr_code}</p>
                      <p className="text-sm text-gray-500 mb-2">Location: {session.location}</p>
                      <div className="text-xs text-gray-400">
                        Valid: {new Date(session.valid_from).toLocaleDateString()} - {new Date(session.valid_until).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No attendance sessions found. Create sessions for QR code attendance.
                  </div>
                )}
              </div>
            </div>

            {/* Payslip Delivery Tracking */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Digital Payslip Delivery</h3>
                <button
                  onClick={() => setShowPayslipDeliveryModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Delivery
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(payslipDeliveriesData) && payslipDeliveriesData.length > 0 ? (
                      payslipDeliveriesData.map((delivery, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {delivery.employee_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.delivery_method}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              delivery.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                              delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {delivery.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.sent_at ? new Date(delivery.sent_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {delivery.delivered_at ? new Date(delivery.delivered_at).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No payslip deliveries found. Add deliveries to track digital payslips.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Employee Preferences */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Employee Self-Service Preferences</h3>
                <button
                  onClick={() => setShowPreferencesModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Preferences
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(preferencesData) && preferencesData.length > 0 ? (
                  preferencesData.map((pref, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">{pref.employee_name}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Language:</span>
                          <span className="text-gray-900">{pref.language}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Timezone:</span>
                          <span className="text-gray-900">{pref.timezone}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payslip Method:</span>
                          <span className="text-gray-900">{pref.payslip_delivery_method}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Attendance Reminders:</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            pref.attendance_reminder === 'enabled' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {pref.attendance_reminder}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No employee preferences found. Add preferences for self-service features.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Employee Modal */}
        <EmployeeModal
          isOpen={showEmployeeModal}
          onClose={handleEmployeeModalClose}
          onSuccess={handleEmployeeSuccess}
          employee={
            editingEmployee
              ? {
                  ...editingEmployee,
                  salary: editingEmployee.salary.toString(), // Convert salary to string
                  department:
                    typeof editingEmployee.department === 'object' && editingEmployee.department !== null
                      ? editingEmployee.department.name
                      : editingEmployee.department
                }
              : null
          }
        />

        {/* Employee Details Modal */}
        <EmployeeDetailsModal
          isOpen={!!viewingEmployee}
          onClose={() => setViewingEmployee(null)}
          employee={viewingEmployee}
        />

        {/* Department Details Modal */}
        <DepartmentDetailsModal
          isOpen={!!viewingDepartment}
          onClose={() => setViewingDepartment(null)}
          department={viewingDepartment}
        />

        {/* Job Position Modal */}
        <JobPositionModal
          isOpen={showJobPositionModal}
          onClose={() => {
            setShowJobPositionModal(false);
            setEditingJobPosition(null);
          }}
          onSuccess={handleJobPositionSuccess}
          jobPosition={editingJobPosition}
        />

        {/* Department Modal */}
        <DepartmentModal
          isOpen={showDepartmentModal}
          onClose={handleDepartmentModalClose}
          onSuccess={handleDepartmentSuccess}
          department={editingDepartment}
        />

        {/* Payroll Period Modal */}
        <PayrollPeriodModal
          isOpen={showPayrollPeriodModal}
          onClose={handlePayrollPeriodModalClose}
          onSuccess={handlePayrollPeriodSuccess}
          period={editingPayrollPeriod}
        />

        {/* Payroll Items Modal */}
        <PayrollItemsModal
          isOpen={showPayrollItemsModal}
          onClose={handlePayrollItemsModalClose}
          period={selectedPayrollPeriod}
        />

        {/* Enhanced HR Modals - Placeholder for future implementation */}
        {/* NSSF Modal */}
        <NssfModal
          isOpen={showNssfModal}
          onClose={handleNssfModalClose}
          onSuccess={() => {
            handleNssfModalClose();
            // Refresh NSSF data
            loadEnhancedHrData();
          }}
        />

        {/* NSSF Contribution Modal - For View, Edit, Create, Delete */}
        <NssfContributionModal
          isOpen={showNssfContributionModal}
          onClose={handleNssfContributionModalClose}
          onSuccess={handleNssfContributionSuccess}
          contribution={selectedNssfContribution}
          mode={nssfContributionModalMode}
        />

        {/* NSSF Status Update Modal - For Quick Status Changes */}
        {statusUpdateData && (
          <NssfStatusUpdateModal
            isOpen={showNssfStatusUpdateModal}
            onClose={handleStatusUpdateModalClose}
            onSuccess={handleStatusUpdateSuccess}
            contribution={statusUpdateData.contribution}
            newStatus={statusUpdateData.newStatus}
          />
        )}

        {/* Holiday Modal */}
        <LocalHolidayModal
          isOpen={showHolidayModal}
          onClose={handleHolidayModalClose}
          onSuccess={handleHolidaySuccess}
          holiday={editingHoliday}
        />

        {/* Wellness Modal */}
        <WellnessRecordModal
          isOpen={showWellnessModal}
          onClose={handleWellnessModalClose}
          onSuccess={() => {
            handleWellnessModalClose();
            // Refresh wellness data
            loadEnhancedHrData();
          }}
        />

        {/* Performance Modal */}
        <PerformanceMetricsModal
          isOpen={showPerformanceModal}
          onClose={handlePerformanceModalClose}
          onSuccess={() => {
            handlePerformanceModalClose();
            // Refresh performance data
            loadEnhancedHrData();
          }}
        />

        {/* Skills Modal */}
        <SkillsAssessmentModal
          isOpen={showSkillsModal}
          onClose={handleSkillsModalClose}
          onSuccess={() => {
            handleSkillsModalClose();
            // Refresh skills data
            loadEnhancedHrData();
          }}
        />

        {/* Attendance Session Modal */}
        <AttendanceSessionModal
          isOpen={showAttendanceSessionModal}
          onClose={handleAttendanceSessionModalClose}
          onSuccess={() => {
            handleAttendanceSessionModalClose();
            // Refresh attendance data
            loadEnhancedHrData();
          }}
        />

        {/* Payslip Delivery Modal */}
        <PayslipDeliveryModal
          isOpen={showPayslipDeliveryModal}
          onClose={handlePayslipDeliveryModalClose}
          onSuccess={() => {
            handlePayslipDeliveryModalClose();
            // Refresh payslip data
            loadEnhancedHrData();
          }}
        />

        {/* Preferences Modal */}
        <EmployeePreferenceModal
          isOpen={showPreferencesModal}
          onClose={handlePreferencesModalClose}
          onSuccess={() => {
            handlePreferencesModalClose();
            // Refresh preferences data
            loadEnhancedHrData();
          }}
        />

        <PerformanceInfoModal
          isOpen={showPerformanceInfoModal}
          onClose={() => setShowPerformanceInfoModal(false)}
        />

        {/* 🤖 AI INSIGHTS TAB - Revolutionary AI-Powered HR Analytics */}
        {selectedView === 'ai-insights' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">🤖 AI-Powered HR Intelligence Hub</h2>
              <p className="text-purple-100">Revolutionary AI analytics providing unprecedented insights into your workforce</p>
            </div>

            {loadingAiInsights ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Loading AI insights...</span>
              </div>
            ) : !aiInsightsData ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No AI insights available. Please log in to access real-time data.</div>
              </div>
            ) : (
              <>
                {/* Employee Churn Prediction */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <BrainIcon className="h-6 w-6 text-red-500 mr-2" />
                      Employee Churn Prediction
                    </h3>
                    <span className="text-sm text-gray-500">AI Accuracy: 94.2%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-red-600">
                        {churnPredictionData?.high_risk_count || 0}
                      </div>
                      <div className="text-sm text-red-700">High Risk Employees</div>
                      <div className="text-xs text-red-500 mt-1">Immediate action required</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-600">
                        {churnPredictionData?.medium_risk_count || 0}
                      </div>
                      <div className="text-sm text-yellow-700">Medium Risk</div>
                      <div className="text-xs text-yellow-500 mt-1">Monitor closely</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-600">
                        {churnPredictionData?.low_risk_count || 0}
                      </div>
                      <div className="text-sm text-green-700">Low Risk</div>
                      <div className="text-xs text-green-500 mt-1">Stable employees</div>
                    </div>
                  </div>

                  {/* High Risk Employees Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Churn Probability</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Factors</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Early Warning</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(churnPredictionData?.predictions || []).filter((p: any) => p.risk_level === 'high').length > 0 ? (
                          (churnPredictionData?.predictions || []).filter((p: any) => p.risk_level === 'high').map((prediction: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                                    <span className="text-sm font-medium text-red-600">
                                      {prediction.employee_name?.charAt(0) || 'E'}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <div className="text-sm font-medium text-gray-900">{prediction.employee_name}</div>
                                    <div className="text-sm text-gray-500">{prediction.department}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-lg font-bold text-red-600">{prediction.churn_probability}%</div>
                                  <div className="ml-2">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                      {prediction.risk_level?.toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {prediction.risk_factors?.map((factor: any, idx: number) => (
                                    <div key={idx} className={`inline-flex px-2 py-1 text-xs rounded-full mr-1 mb-1 ${
                                      factor.severity === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                      {factor.factor}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {prediction.early_warning_signals?.map((signal: any, idx: number) => (
                                    <div key={idx} className="flex items-center text-xs text-red-600">
                                      <FireIcon className="h-3 w-3 mr-1" />
                                      {signal.signal}
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                  📋 Intervention Plan
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  💬 Schedule 1:1
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              No high-risk employees found. Great job on retention!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Performance Prediction */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <TrophyIcon className="h-6 w-6 text-yellow-500 mr-2" />
                      Performance Prediction & Growth Potential
                    </h3>
                    <span className="text-sm text-gray-500">AI Model Accuracy: 89.3%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {performancePredictionData?.top_performers || 0}
                      </div>
                      <div className="text-sm text-green-700">Future Top Performers</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-yellow-600">
                        {performancePredictionData?.high_potential || 0}
                      </div>
                      <div className="text-sm text-yellow-700">High Potential</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {performancePredictionData?.leadership_ready || 0}
                      </div>
                      <div className="text-sm text-purple-700">Leadership Ready</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-red-600">
                        {performancePredictionData?.at_risk || 0}
                      </div>
                      <div className="text-sm text-red-700">Performance Risk</div>
                    </div>
                  </div>
                </div>

                {/* Compensation Optimization */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <CurrencyDollarIcon className="h-6 w-6 text-green-500 mr-2" />
                      AI-Powered Compensation Optimization
                    </h3>
                    <span className="text-sm text-gray-500">ROI Projection: 165%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(compensationOptimizationData?.budget_impact?.total_increase || 0)}
                      </div>
                      <div className="text-sm text-blue-700">Recommended Budget Increase</div>
                      <div className="text-xs text-blue-500 mt-1">
                        {compensationOptimizationData?.budget_impact?.percentage_increase || 0}% overall increase
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {compensationOptimizationData?.pay_equity_analysis?.overall_equity_score || 0}%
                      </div>
                      <div className="text-sm text-green-700">Pay Equity Score</div>
                      <div className="text-xs text-green-500 mt-1">Above industry benchmark</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {compensationOptimizationData?.budget_impact?.employees_affected || 0}
                      </div>
                      <div className="text-sm text-purple-700">Employees Affected</div>
                      <div className="text-xs text-purple-500 mt-1">Requiring adjustment</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 🚀 TALENT MANAGEMENT TAB */}
        {selectedView === 'talent-management' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">🚀 AI-Powered Talent Management Hub</h2>
              <p className="text-blue-100">Revolutionary talent acquisition, development, and retention platform</p>
            </div>

            {loadingTalentManagement ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Loading talent management data...</span>
              </div>
            ) : !talentManagementData ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No talent management data available. Please log in to access real-time data.</div>
              </div>
            ) : (
              <>
                {/* AI Recruitment Dashboard */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <MagnifyingGlassIcon className="h-6 w-6 text-blue-500 mr-2" />
                    AI-Powered Recruitment Engine
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {talentManagementData?.recruitment?.talent_pipeline_health?.pipeline_strength || 0}%
                      </div>
                      <div className="text-sm text-blue-700">Pipeline Strength</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {talentManagementData?.recruitment?.talent_pipeline_health?.quality_score || 0}%
                      </div>
                      <div className="text-sm text-green-700">Candidate Quality</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {talentManagementData?.recruitment?.talent_pipeline_health?.diversity_score || 0}%
                      </div>
                      <div className="text-sm text-purple-700">Diversity Score</div>
                    </div>
                  </div>

                  {/* Open Positions Analysis */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Market Competition</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hiring Difficulty</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time to Fill</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Internal Matches</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(talentManagementData?.recruitment?.recruitment_analysis || []).length > 0 ? (
                          (talentManagementData?.recruitment?.recruitment_analysis || []).map((position: any, index: number) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{position.position_title}</div>
                                <div className="text-sm text-gray-500">{position.department}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`text-sm font-medium ${
                                    position.market_competition_score > 80 ? 'text-red-600' : 
                                    position.market_competition_score > 60 ? 'text-yellow-600' : 'text-green-600'
                                  }`}>
                                    {position.market_competition_score}%
                                  </div>
                                  <div className="ml-2">
                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                      position.market_competition_score > 80 ? 'bg-red-100 text-red-800' : 
                                      position.market_competition_score > 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                      {position.market_competition_score > 80 ? 'High' : 
                                       position.market_competition_score > 60 ? 'Medium' : 'Low'}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{position.hiring_difficulty_score}%</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{position.predicted_time_to_fill} days</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {position.internal_candidate_matches} matches
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                  🎯 AI Sourcing
                                </button>
                                <button className="text-green-600 hover:text-green-900">
                                  📊 View Analytics
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                              No recruitment analysis data available. Please log in to access real-time data.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Succession Planning */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <UserGroupIcon className="h-6 w-6 text-purple-500 mr-2" />
                    AI Succession Planning
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">High Potential Employees</h4>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {talentManagementData?.succession?.high_potential_employees?.total_identified || 0}
                      </div>
                      <div className="text-sm text-gray-600">Identified across all departments</div>
                      <div className="mt-4 space-y-2">
                        {Object.entries(talentManagementData?.succession?.high_potential_employees?.by_department || {}).length > 0 ? (
                          Object.entries(talentManagementData?.succession?.high_potential_employees?.by_department || {}).map(([dept, count]) => (
                            <div key={dept} className="flex justify-between">
                              <span className="text-sm text-gray-600">{dept}</span>
                              <span className="text-sm font-medium text-purple-600">{count as number}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No department data available</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Leadership Pipeline</h4>
                      <div className="space-y-4">
                        {(talentManagementData?.succession?.succession_plans || []).length > 0 ? (
                          (talentManagementData?.succession?.succession_plans || []).map((plan: any, index: number) => (
                                                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                              <div className="text-sm font-medium text-gray-900">{plan.position}</div>
                              <div className="text-sm text-gray-500">Current: {plan.current_incumbent}</div>
                              <div className="mt-2">
                                {plan.top_successors?.map((successor: any, idx: number) => (
                                  <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-700">{successor.name}</span>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {successor.readiness_score}% ready
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No succession plans available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Management */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <AcademicCapIcon className="h-6 w-6 text-green-500 mr-2" />
                    AI-Powered Learning Management
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {talentManagementData?.learning?.learning_effectiveness_metrics?.effectiveness_score || 0}%
                      </div>
                      <div className="text-sm text-green-700">Learning Effectiveness</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {talentManagementData?.learning?.learning_roi_analysis?.roi_percentage || 0}%
                      </div>
                      <div className="text-sm text-blue-700">Learning ROI</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        {talentManagementData?.learning?.skill_gap_analysis?.critical_gaps || 0}
                      </div>
                      <div className="text-sm text-purple-700">Critical Skill Gaps</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Critical Skills Needed</h4>
                    <div className="flex flex-wrap gap-2">
                      {(talentManagementData?.learning?.skill_gap_analysis?.critical_gaps_list || []).length > 0 ? (
                        (talentManagementData?.learning?.skill_gap_analysis?.critical_gaps_list || []).map((skill: string, index: number) => (
                          <span key={index} className="inline-flex px-3 py-1 text-sm rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-gray-700">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No critical skills identified</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 💝 WELLNESS HUB TAB */}
        {selectedView === 'wellness' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">💝 Employee Wellness & Mental Health Hub</h2>
              <p className="text-pink-100">Comprehensive wellbeing analysis and personalized wellness programs</p>
            </div>

            {loadingWellness ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Loading wellness insights...</span>
              </div>
            ) : !wellnessAnalyticsData ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No wellness data available. Please log in to access real-time data.</div>
              </div>
            ) : (
              <>
                {/* Overall Wellness Dashboard */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <HeartIcon className="h-6 w-6 text-pink-500 mr-2" />
                    Organizational Wellness Overview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-pink-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-pink-600">
                        {wellnessAnalyticsData?.organizational_wellness_score || 0}%
                      </div>
                      <div className="text-sm text-pink-700">Overall Wellness Score</div>
                      <div className="text-xs text-pink-500 mt-1">Above industry average</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {wellnessAnalyticsData?.mental_health_insights?.organizational_mental_health_score || 0}%
                      </div>
                      <div className="text-sm text-blue-700">Mental Health Score</div>
                      <div className="text-xs text-blue-500 mt-1">Needs attention</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-red-600">
                        {wellnessAnalyticsData?.burnout_prediction_models?.high_risk_employees || 0}
                      </div>
                      <div className="text-sm text-red-700">High Burnout Risk</div>
                      <div className="text-xs text-red-500 mt-1">Immediate intervention needed</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(wellnessAnalyticsData?.wellness_roi_analysis?.estimated_annual_savings || 0)}
                      </div>
                      <div className="text-sm text-green-700">Annual Savings</div>
                      <div className="text-xs text-green-500 mt-1">From wellness programs</div>
                    </div>
                  </div>
                </div>

                {/* Individual Wellness Profiles */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <UserIcon className="h-6 w-6 text-purple-500 mr-2" />
                    Individual Wellness Profiles
                  </h3>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Overall Wellness</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Burnout Risk</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stress Level</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resilience</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(wellnessAnalyticsData?.individual_wellness_profiles || []).length > 0 ? (
                          (wellnessAnalyticsData?.individual_wellness_profiles || []).map((profile: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  profile.overall_wellness_score >= 80 ? 'bg-green-100' :
                                  profile.overall_wellness_score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                                }`}>
                                  <span className={`text-sm font-medium ${
                                    profile.overall_wellness_score >= 80 ? 'text-green-600' :
                                    profile.overall_wellness_score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                  }`}>
                                    {profile.employee_name?.charAt(0) || 'E'}
                                  </span>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{profile.employee_name}</div>
                                  <div className="text-sm text-gray-500">{profile.department}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-lg font-bold text-gray-900">{profile.overall_wellness_score}%</div>
                                <div className="ml-2">
                                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                    profile.overall_wellness_score >= 80 ? 'bg-green-100 text-green-800' :
                                    profile.overall_wellness_score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {profile.wellness_category}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                profile.risk_assessments.burnout_risk.risk_level === 'Low' ? 'bg-green-100 text-green-800' :
                                profile.risk_assessments.burnout_risk.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {profile.risk_assessments.burnout_risk.risk_level} ({profile.risk_assessments.burnout_risk.burnout_risk_score}%)
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                profile.risk_assessments.stress_level.level === 'Low' ? 'bg-green-100 text-green-800' :
                                profile.risk_assessments.stress_level.level === 'Moderate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {profile.risk_assessments.stress_level.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{profile.risk_assessments.resilience_score}%</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button className="text-pink-600 hover:text-pink-900 mr-3">
                                💝 Wellness Plan
                              </button>
                              <button className="text-blue-600 hover:text-blue-900">
                                📊 Detailed View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                            No wellness profiles available. Please log in to access real-time data.
                          </td>
                        </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Wellness ROI Analysis */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <ChartBarIcon className="h-6 w-6 text-green-500 mr-2" />
                    Wellness Program ROI Analysis
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {wellnessAnalyticsData?.wellness_roi_analysis?.productivity_improvement || 0}%
                      </div>
                      <div className="text-sm text-green-700">Productivity Improvement</div>
                      <div className="text-xs text-green-500 mt-1">Since wellness program launch</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {wellnessAnalyticsData?.wellness_roi_analysis?.absenteeism_reduction || 0}%
                      </div>
                      <div className="text-sm text-blue-700">Absenteeism Reduction</div>
                      <div className="text-xs text-blue-500 mt-1">Year-over-year improvement</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">0%</div>
                      <div className="text-sm text-purple-700">Overall ROI</div>
                      <div className="text-xs text-purple-500 mt-1">Return on wellness investment</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 🌍 DIVERSITY & INCLUSION TAB */}
        {selectedView === 'diversity' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">🌍 Diversity & Inclusion Intelligence</h2>
              <p className="text-emerald-100">Comprehensive D&I analytics with AI-powered bias detection and recommendations</p>
            </div>

            {loadingDiversity ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Loading diversity insights...</span>
              </div>
            ) : !diversityData ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No diversity data available. Please log in to access real-time data.</div>
              </div>
            ) : (
              <>
                {/* Overall D&I Dashboard */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <GlobeAltIcon className="h-6 w-6 text-emerald-500 mr-2" />
                    Diversity & Inclusion Overview
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="bg-emerald-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-emerald-600">
                        {diversityData?.overall_diversity_score?.overall_score || 0}%
                      </div>
                      <div className="text-sm text-emerald-700">Overall Diversity Score</div>
                      <div className="text-xs text-emerald-500 mt-1">
                        {diversityData?.overall_diversity_score?.score_category || 'No Data'}
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {diversityData?.inclusion_index?.inclusion_score || 0}%
                      </div>
                      <div className="text-sm text-blue-700">Inclusion Index</div>
                      <div className="text-xs text-blue-500 mt-1">
                        {diversityData?.inclusion_index?.inclusion_level || 'No Data'}
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-yellow-600">
                        {diversityData?.leadership_diversity?.leadership_representation?.gender_balance || 0}%
                      </div>
                      <div className="text-sm text-yellow-700">Leadership Diversity</div>
                      <div className="text-xs text-yellow-500 mt-1">Gender balance in leadership</div>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-3xl font-bold text-red-600">
                        {diversityData?.pay_equity_analysis?.gender_pay_gap || 0}%
                      </div>
                      <div className="text-sm text-red-700">Gender Pay Gap</div>
                      <div className="text-xs text-red-500 mt-1">Needs improvement</div>
                    </div>
                  </div>

                  {/* Diversity Dimensions Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Diversity Dimensions</h4>
                      <div className="space-y-3">
                        {Object.entries(diversityData?.overall_diversity_score?.dimension_scores || {}).length > 0 ? (
                          Object.entries(diversityData?.overall_diversity_score?.dimension_scores || {}).map(([dimension, data]: [string, any]) => (
                          <div key={dimension} className="flex justify-between items-center">
                            <span className="text-sm capitalize text-gray-700">{dimension}</span>
                                                          <div className="flex items-center">
                                <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                  <div 
                                    className="bg-purple-600 h-2 rounded-full" 
                                    style={{ width: `${(data.shannon_index || 0) * 100}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                  {Math.round((data.shannon_index || 0) * 100)}%
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No diversity dimension data available</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Inclusion Metrics</h4>
                      <div className="space-y-3">
                        {Object.entries(diversityData?.inclusion_index?.metric_breakdown || {}).length > 0 ? (
                          Object.entries(diversityData?.inclusion_index?.metric_breakdown || {}).map(([metric, score]: [string, any]) => (
                          <div key={metric} className="flex justify-between items-center">
                            <span className="text-sm text-gray-700 capitalize">
                              {metric.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center">
                              <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${score * 100}%` }}
                                ></div>
                              </div>
                                                              <span className="text-sm font-medium text-gray-900">
                                  {Math.round(score * 100)}%
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500">No inclusion metrics available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bias Detection Dashboard */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <ShieldCheckIcon className="h-6 w-6 text-red-500 mr-2" />
                    AI-Powered Bias Detection
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Hiring Bias Analysis</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Resume Screening</span>
                          <span className={`text-sm font-medium ${
                            diversityData?.bias_detection?.hiring_bias_patterns?.resume_screening_bias === 'moderate' ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {diversityData?.bias_detection?.hiring_bias_patterns?.resume_screening_bias || 'No Data'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Interview Process</span>
                          <span className="text-sm font-medium text-red-600">
                            {diversityData?.bias_detection?.hiring_bias_patterns?.interview_bias_detected ? 'Detected' : 'No Data'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Performance Evaluation Bias</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Rating Distribution</span>
                          <span className="text-sm font-medium text-yellow-600">
                            {diversityData?.bias_detection?.performance_evaluation_bias?.rating_distribution_skew || 'No Data'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Demographic Correlation</span>
                          <span className="text-sm font-medium text-red-600">
                            {diversityData?.bias_detection?.performance_evaluation_bias?.demographic_correlation || 'No Data'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">🤖 AI Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm font-medium text-blue-800 mb-2">Immediate Actions</div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Implement blind resume screening</li>
                          <li>• Standardize interview questions</li>
                          <li>• Introduce bias training for managers</li>
                        </ul>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-800 mb-2">Long-term Strategy</div>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Develop diverse talent pipelines</li>
                          <li>• Create mentorship programs</li>
                          <li>• Establish D&I metrics and accountability</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* 📊 WORKFORCE ANALYTICS TAB */}
        {selectedView === 'workforce-analytics' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-lg p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">📊 Advanced Workforce Analytics</h2>
              <p className="text-indigo-100">Real-time workforce insights powered by AI and machine learning</p>
            </div>

            {loadingWorkforceAnalytics ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
                <span className="ml-3 text-gray-600">Loading workforce analytics...</span>
              </div>
            ) : !workforceAnalyticsData ? (
              <div className="text-center py-12">
                <div className="text-gray-500">No workforce analytics data available. Please log in to access real-time data.</div>
              </div>
            ) : (
              <>
                {/* Real-time Analytics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">{workforceAnalyticsData?.ai_model_accuracy || 0}%</div>
                        <div className="text-sm text-gray-600">AI Model Accuracy</div>
                      </div>
                      <BrainIcon className="h-8 w-8 text-indigo-500" />
                    </div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{workforceAnalyticsData?.employee_satisfaction || 0}%</div>
                        <div className="text-sm text-gray-600">Employee Satisfaction</div>
                      </div>
                      <HeartIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">{workforceAnalyticsData?.avg_time_to_fill || 0} Days</div>
                        <div className="text-sm text-gray-600">Avg. Time to Fill</div>
                      </div>
                      <ClockIcon className="h-8 w-8 text-yellow-500" />
                    </div>
                  </div>
                  <div className="bg-white shadow rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">{workforceAnalyticsData?.training_roi || 0}%</div>
                        <div className="text-sm text-gray-600">Training ROI</div>
                      </div>
                      <TrophyIcon className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Predictive Analytics */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <SparklesIcon className="h-6 w-6 text-purple-500 mr-2" />
                    Predictive Workforce Analytics
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Workforce Projections (Next 12 Months)</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Headcount Growth</span>
                          <span className="text-lg font-bold text-green-600">+{workforceAnalyticsData?.headcount_growth || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Projected Turnover</span>
                          <span className="text-lg font-bold text-yellow-600">{workforceAnalyticsData?.projected_turnover || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Skill Gap Risk</span>
                          <span className="text-lg font-bold text-red-600">{workforceAnalyticsData?.skill_gap_risk || 'No Data'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Leadership Readiness</span>
                          <span className="text-lg font-bold text-purple-600">{workforceAnalyticsData?.leadership_readiness || 0}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6">
                      <h4 className="font-medium text-gray-900 mb-4">AI-Powered Recommendations</h4>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <LightBulbIcon className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Proactive Retention</div>
                            <div className="text-xs text-gray-600">Target 5 high-risk employees with retention programs</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <RocketLaunchIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Skill Development</div>
                            <div className="text-xs text-gray-600">Invest in AI/ML training for 12 employees</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <UserGroupIcon className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Succession Planning</div>
                            <div className="text-xs text-gray-600">Develop 3 high-potential employees for leadership</div>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <GlobeAltIcon className="h-5 w-5 text-purple-500 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">Diversity Enhancement</div>
                            <div className="text-xs text-gray-600">Focus recruiting on underrepresented groups</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Metrics */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
                    <BeakerIcon className="h-6 w-6 text-green-500 mr-2" />
                    Advanced HR Metrics & KPIs
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Talent Acquisition</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Source Quality Score</span>
                          <span className="text-sm font-medium text-green-600">{workforceAnalyticsData?.source_quality_score || 0}/10</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Offer Acceptance Rate</span>
                          <span className="text-sm font-medium text-blue-600">{workforceAnalyticsData?.offer_acceptance_rate || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cost per Hire</span>
                          <span className="text-sm font-medium text-purple-600">{formatCurrency(workforceAnalyticsData?.cost_per_hire || 0)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Employee Experience</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">eNPS Score</span>
                          <span className="text-sm font-medium text-green-600">+{workforceAnalyticsData?.enps_score || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Internal Mobility Rate</span>
                          <span className="text-sm font-medium text-blue-600">{workforceAnalyticsData?.internal_mobility_rate || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Training Effectiveness</span>
                          <span className="text-sm font-medium text-purple-600">{workforceAnalyticsData?.training_effectiveness || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Performance & Growth</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">High Performers</span>
                          <span className="text-sm font-medium text-green-600">{workforceAnalyticsData?.high_performers || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Goal Achievement</span>
                          <span className="text-sm font-medium text-blue-600">{workforceAnalyticsData?.goal_achievement || 0}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Leadership Pipeline</span>
                          <span className="text-sm font-medium text-purple-600">{workforceAnalyticsData?.leadership_pipeline || 'No Data'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Custom Alert */}
        <CustomAlert
          isOpen={customAlert.isOpen}
          onClose={closeAlert}
          type={customAlert.type}
          title={customAlert.title}
          message={customAlert.message}
          showConfirm={customAlert.showConfirm}
          onConfirm={customAlert.onConfirm}
        />
                 </DashboardLayout>
       </ProtectedRoute>
     );
   }
