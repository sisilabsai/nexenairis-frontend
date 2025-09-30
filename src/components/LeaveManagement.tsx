import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  UsersIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckBadgeIcon,
  XCircleIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import {
  useLeaveRequests,
  useLeaveBalances,
  useLeaveStats,
  useLeaveCalendar,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
  useCancelLeaveRequest,
  useInitializeLeaveBalances,
  useLeaveTypes,
  useDeleteLeaveType
} from '../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import LeaveRequestModal from './LeaveRequestModal';
import LeaveDetailsModal from './LeaveDetailsModal';
import LeaveTypeModal from './LeaveTypeModal';
import BulkApprovalModal from './BulkApprovalModal';
import CustomAlert from './CustomAlert';
import LeavePolicies from './LeavePolicies';
import LeaveEncashment from './LeaveEncashment';
import LeaveReports from './LeaveReports';

interface LeaveManagementProps {
  hrSummary?: any;
}

export default function LeaveManagement({ hrSummary }: LeaveManagementProps) {
  console.log('🔍 LeaveManagement component mounted');
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Modal states
  const [showLeaveRequestModal, setShowLeaveRequestModal] = useState(false);
  const [showLeaveDetailsModal, setShowLeaveDetailsModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<any>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<any>(null);
  const [showBulkApproval, setShowBulkApproval] = useState(false);

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

  // API hooks
  const { data: leaveRequestsData, isLoading: requestsLoading, error: requestsError } = useLeaveRequests({
    search: searchTerm,
    status: statusFilter,
    per_page: 50
  });

  const { data: leaveBalancesData, isLoading: balancesLoading, error: balancesError } = useLeaveBalances({
    year: selectedYear,
    per_page: 50
  });

  const { data: leaveStatsData, isLoading: statsLoading, error: statsError } = useLeaveStats({
    year: selectedYear
  });

  const { data: leaveCalendarData, isLoading: calendarLoading, error: calendarError } = useLeaveCalendar({
    year: selectedYear,
    month: new Date().getMonth() + 1
  });

  // Additional API hooks
  const { data: leaveTypesData, error: leaveTypesError, isLoading: leaveTypesLoading } = useLeaveTypes();
  
  // Debug logging for useLeaveTypes hook
  console.log('🔍 useLeaveTypes hook result:', {
    data: leaveTypesData,
    error: leaveTypesError,
    isLoading: leaveTypesLoading
  });
  
  // Mutations
  const approveRequestMutation = useApproveLeaveRequest();
  const rejectRequestMutation = useRejectLeaveRequest();
  const cancelRequestMutation = useCancelLeaveRequest();
  const initializeBalancesMutation = useInitializeLeaveBalances();
  const deleteLeaveTypeMutation = useDeleteLeaveType();

  // Extract data
  const leaveRequests = Array.isArray((leaveRequestsData as any)?.data?.data) ? (leaveRequestsData as any).data.data : [];
  const leaveBalances = Array.isArray((leaveBalancesData as any)?.data?.data) ? (leaveBalancesData as any).data.data : [];
  const leaveTypes = Array.isArray((leaveTypesData as any)?.data?.data) ? (leaveTypesData as any).data.data : [];
  const leaveStats = leaveStatsData?.data || {};
  const holidaysData = (leaveCalendarData as any)?.holidays || [];

  // Debug logging for leave types
  console.log('🔍 Leave Types Debug:', {
    rawData: leaveTypesData,
    extractedTypes: leaveTypes,
    count: leaveTypes.length,
    error: leaveTypesError,
    isLoading: leaveTypesLoading
  });
  
  // Debug logging for data extraction
  console.log('🔍 Data Extraction Debug:', {
    leaveTypesDataType: typeof leaveTypesData,
    leaveTypesDataKeys: leaveTypesData ? Object.keys(leaveTypesData) : 'null',
    leaveTypesDataData: (leaveTypesData as any)?.data,
    leaveTypesDataDataType: typeof (leaveTypesData as any)?.data,
    leaveTypesDataDataKeys: (leaveTypesData as any)?.data ? Object.keys((leaveTypesData as any).data) : 'null'
  });

  // Calculate real statistics
  const stats = {
    totalRequests: (leaveStats as any).total_requests || 0,
    pendingRequests: (leaveStats as any).requests_by_status?.find((s: any) => s.status === 'pending')?.count || 0,
    approvedRequests: (leaveStats as any).requests_by_status?.find((s: any) => s.status === 'approved')?.count || 0,
    totalLeaveDays: (leaveStats as any).total_leave_days || 0,
  };

  // Automated Leave Calculation Functions
  const calculateLeaveDays = (startDate: string, endDate: string, excludeWeekends: boolean = true, excludeHolidays: boolean = true) => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let days = 0;
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = excludeHolidays && holidaysData.some((holiday: any) => 
        new Date(holiday.date).toDateString() === d.toDateString()
      );
      
      if (!isWeekend && !isHoliday) {
        days++;
      }
    }
    
    return days;
  };

  const calculateLeaveBalance = (employeeId: number, leaveTypeId: number) => {
    const balance = leaveBalances.find((b: any) => 
      b.employee_id === employeeId && b.leave_type_id === leaveTypeId
    );
    return balance || { allocated_days: 0, used_days: 0, remaining_days: 0 };
  };

  const getLeaveTypeInfo = (leaveTypeId: number) => {
    return leaveTypes.find((lt: any) => lt.id === leaveTypeId) || {};
  };

  const handleApprove = async (requestId: number) => {
    try {
      await approveRequestMutation.mutateAsync({
        id: requestId,
        data: { approval_notes: 'Approved via leave management dashboard' }
      });
      showAlert('success', 'Success', 'Leave request approved successfully!');
      handleModalSuccess();
    } catch (error) {
      console.error('Error approving leave request:', error);
      showAlert('error', 'Error', 'Failed to approve leave request. Please try again.');
    }
  };

  const handleReject = (requestId: number) => {
    setShowRejectModal(requestId);
  };

  const handleRejectConfirm = async () => {
    if (!showRejectModal || !rejectReason.trim()) {
      showAlert('warning', 'Warning', 'Please provide a reason for rejection.');
      return;
    }

    try {
      await rejectRequestMutation.mutateAsync({
        id: showRejectModal,
        data: { approval_notes: rejectReason }
      });
      setShowRejectModal(null);
      setRejectReason('');
      showAlert('success', 'Success', 'Leave request rejected successfully!');
      handleModalSuccess();
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      showAlert('error', 'Error', 'Failed to reject leave request. Please try again.');
    }
  };

  const handleCancel = async (requestId: number) => {
    showConfirmAlert(
      'warning',
      'Cancel Leave Request',
      'Are you sure you want to cancel this leave request?',
      async () => {
        try {
          await cancelRequestMutation.mutateAsync({
            id: requestId,
            data: { cancellation_reason: 'Cancelled by administrator' }
          });
          showAlert('success', 'Success', 'Leave request cancelled successfully!');
          handleModalSuccess();
        } catch (error) {
          console.error('Error cancelling leave request:', error);
          showAlert('error', 'Error', 'Failed to cancel leave request. Please try again.');
        }
      }
    );
  };

  const handleViewDetails = (requestId: number) => {
    const request = leaveRequests.find((r: any) => r.id === requestId);
    if (request) {
      setSelectedLeaveRequest(request);
      setShowLeaveDetailsModal(true);
    }
  };

  const handleEditRequest = () => {
    setShowLeaveDetailsModal(false);
    setShowLeaveRequestModal(true);
  };

  const handleNewLeaveRequest = () => {
    setSelectedLeaveRequest(null);
    setShowLeaveRequestModal(true);
  };

  const handleNewLeaveType = () => {
    setSelectedLeaveType(null);
    setShowLeaveTypeModal(true);
  };

  const handleEditLeaveType = (leaveType: any) => {
    setSelectedLeaveType(leaveType);
    setShowLeaveTypeModal(true);
  };

  const handleDeleteLeaveType = async (leaveTypeId: number) => {
    showConfirmAlert(
      'warning',
      'Delete Leave Type',
      'Are you sure you want to delete this leave type? This action cannot be undone.',
      async () => {
        try {
          await deleteLeaveTypeMutation.mutateAsync(leaveTypeId);
          showAlert('success', 'Success', 'Leave type deleted successfully!');
          handleModalSuccess();
        } catch (error) {
          console.error('Error deleting leave type:', error);
          showAlert('error', 'Error', 'Failed to delete leave type. Please try again.');
        }
      }
    );
  };

  const handleBulkApproval = () => {
    setShowBulkApproval(true);
  };

  const handleModalSuccess = () => {
    // Refresh data after successful operations
    queryClient.invalidateQueries({ queryKey: ['hr', 'leave-requests'] });
    queryClient.invalidateQueries({ queryKey: ['hr', 'leave-types'] });
    queryClient.invalidateQueries({ queryKey: ['hr', 'leave-balances'] });
    queryClient.invalidateQueries({ queryKey: ['hr', 'leave', 'stats'] });
    queryClient.invalidateQueries({ queryKey: ['hr', 'summary'] });
  };

  const handleInitializeBalances = async () => {
    showConfirmAlert(
      'info',
      'Initialize Leave Balances',
      `Initialize leave balances for all employees for year ${selectedYear}? This will create or update leave balances based on current leave types.`,
      async () => {
        try {
          const result = await initializeBalancesMutation.mutateAsync({ year: selectedYear });
          showAlert(
            'success', 
            'Success', 
            `Leave balances initialized successfully!\n\nCreated: ${(result as any).balances_created} balances\nUpdated: ${(result as any).balances_updated} balances\nProcessed: ${(result as any).employees_processed} employees`
          );
          handleModalSuccess();
        } catch (error) {
          console.error('Error initializing leave balances:', error);
          showAlert('error', 'Error', 'Failed to initialize leave balances. Please try again.');
        }
      }
    );
  };

  const getLeaveTypeColor = (type: string) => {
    const colors = {
      'Annual Leave': 'bg-blue-100 text-blue-800',
      'Sick Leave': 'bg-red-100 text-red-800',
      'Maternity Leave': 'bg-pink-100 text-pink-800',
      'Study Leave': 'bg-purple-100 text-purple-800',
      'Compassionate Leave': 'bg-orange-100 text-orange-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      case 'cancelled': return '🚫';
      default: return '❓';
    }
  };

  // Show loading spinner if any critical data is loading
  if (requestsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error if there's a critical error
  if (requestsError || statsError) {
    return (
      <div className="space-y-4">
        <ErrorMessage message="Failed to load leave management data. Please try again." />
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Year Selector */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Leave Management ({selectedYear})</h2>
          <div className="flex items-center space-x-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {[2023, 2024, 2025].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.totalRequests}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
              <div className="text-xs text-blue-500 mt-1">
                {stats.pendingRequests} pending approval
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</div>
              <div className="text-sm text-gray-600">Pending Approval</div>
              <div className="text-xs text-yellow-600 mt-1">
                {stats.pendingRequests > 0 ? 'Requires attention' : 'All caught up'}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.approvedRequests}</div>
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-xs text-green-600 mt-1">
                {stats.approvedRequests > 0 ? `${Math.round((stats.approvedRequests / stats.totalRequests) * 100)}% approval rate` : 'No approvals yet'}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
          <div className="flex items-center">
            <UsersIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.totalLeaveDays}</div>
              <div className="text-sm text-gray-600">Total Leave Days</div>
              <div className="text-xs text-purple-600 mt-1">
                {leaveTypes.length} leave types available
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button 
            onClick={handleNewLeaveRequest}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2 text-indigo-600" />
            New Leave Request
          </button>
          <button 
            onClick={handleBulkApproval}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-green-600" />
            Bulk Approval
          </button>
          <button 
            onClick={handleNewLeaveType}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
            Manage Leave Types
          </button>
          <button 
            onClick={() => setShowBulkApproval(true)}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <ClipboardDocumentListIcon className="h-5 w-5 mr-2 text-green-600" />
            Bulk Actions
          </button>
                          <button 
                  onClick={handleInitializeBalances}
                  disabled={initializeBalancesMutation.isPending}
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                  {initializeBalancesMutation.isPending ? 'Initializing...' : 'Initialize Balances'}
                </button>
        </div>
      </div>

      {/* Leave Requests Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Leave Requests</h3>
            <div className="flex space-x-3">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requestsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-sm text-gray-500">Loading leave requests...</p>
                  </td>
                </tr>
              ) : leaveRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {statusFilter || searchTerm ? 'Try adjusting your filters.' : 'No leave requests have been submitted yet.'}
                    </p>
                  </td>
                </tr>
              ) : (
                leaveRequests.map((request: any) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <UserIcon className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.employee?.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{request.employee?.email || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeaveTypeColor(request.leave_type?.name || 'Unknown')}`}>
                      {request.leave_type?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{new Date(request.start_date).toLocaleDateString()} -</div>
                      <div>{new Date(request.end_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(() => {
                          const start = new Date(request.start_date);
                          const end = new Date(request.end_date);
                          const today = new Date();
                          if (start > today) {
                            return '🕐 Upcoming';
                          } else if (end < today) {
                            return '✅ Completed';
                          } else {
                            return '🔄 Ongoing';
                          }
                        })()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="text-center">
                      <div className="font-medium">{request.days_requested || calculateLeaveDays(request.start_date, request.end_date)}</div>
                      {request.employee?.id && request.leave_type?.id && (
                        <div className="text-xs text-gray-500">
                          Balance: {calculateLeaveBalance(request.employee.id, request.leave_type.id).remaining_days} days
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)} {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      {request.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(request.id)}
                            disabled={approveRequestMutation.isPending}
                            className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                            title="Approve"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleReject(request.id)}
                            disabled={rejectRequestMutation.isPending}
                            className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                            title="Reject"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <button 
                          onClick={() => handleCancel(request.id)}
                          disabled={cancelRequestMutation.isPending}
                          className="text-orange-600 hover:text-orange-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                          title="Cancel"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewDetails(request.id)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors" 
                        title="View Details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Employee Leave Balances ({selectedYear})</h3>
        </div>
        <div className="p-6">
          {balancesLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
              <p className="ml-3 text-sm text-gray-500">Loading leave balances...</p>
            </div>
          ) : leaveBalances.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave balances found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click "Initialize Balances" to set up leave balances for all employees.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leaveBalances.map((balance: any, index: number) => (
                <div key={balance.id || index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <UserIcon className="h-6 w-6 text-gray-400 mr-2" />
                    <div>
                      <span className="font-medium text-gray-900">{balance.employee?.name || 'Unknown Employee'}</span>
                      <div className="text-xs text-gray-500">{balance.leave_type?.name || 'Unknown Leave Type'}</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Days</span>
                        <span className="font-medium">{balance.remaining_days}/{balance.total_days}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.max(0, (balance.remaining_days / balance.total_days) * 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {balance.used_days} days used this year
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        balance.remaining_days <= 0 ? 'bg-red-100 text-red-800' :
                        balance.remaining_days <= (balance.total_days * 0.2) ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {balance.remaining_days <= 0 ? 'Exhausted' :
                         balance.remaining_days <= (balance.total_days * 0.2) ? 'Low Balance' :
                         'Available'}
                      </span>
                      <span className="text-xs text-gray-500">{balance.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Leave Calendar */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Leave Calendar Overview</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Current Month: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          {calendarLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <span className="ml-3 text-gray-600">Loading calendar data...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Leave Requests */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Upcoming Leave Requests</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {leaveRequests
                    .filter((req: any) => new Date(req.start_date) > new Date() && req.status === 'approved')
                    .slice(0, 6)
                    .map((request: any) => (
                      <div key={request.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-blue-900">{request.employee?.name || 'Unknown'}</span>
                          <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                            {request.leave_type?.name || 'Unknown Type'}
                          </span>
                        </div>
                        <div className="text-sm text-blue-700">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-blue-500 mt-1">
                          {calculateLeaveDays(request.start_date, request.end_date)} working days
                        </div>
                      </div>
                    ))}
                  {leaveRequests.filter((req: any) => new Date(req.start_date) > new Date() && req.status === 'approved').length === 0 && (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No upcoming approved leave requests
                    </div>
                  )}
                </div>
              </div>

              {/* Public Holidays */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Public Holidays This Month</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {holidaysData.length > 0 ? (
                    holidaysData
                      .filter((holiday: any) => {
                        const holidayDate = new Date(holiday.date);
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        return holidayDate.getMonth() === currentMonth && holidayDate.getFullYear() === currentYear;
                      })
                      .map((holiday: any, index: number) => (
                        <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="text-sm font-medium text-red-900">{holiday.name}</div>
                          <div className="text-sm text-red-700 mt-1">
                            {new Date(holiday.date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-red-500 mt-1 uppercase tracking-wide">
                            {holiday.type?.replace('_', ' ') || 'Public Holiday'}
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-gray-500">
                      No holiday data available for this month
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leave Types Management */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Leave Types</h3>
            <button
              onClick={handleNewLeaveType}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-4 w-4 inline mr-1" />
              Add Leave Type
            </button>
          </div>
        </div>
        <div className="p-6">
          {leaveTypes.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No leave types defined</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create leave types to start managing employee leave requests.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaveTypes.map((leaveType: any) => (
                <div key={leaveType.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{leaveType.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{leaveType.code}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleEditLeaveType(leaveType)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLeaveType(leaveType.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Days per year:</span>
                      <span className="font-medium">{leaveType.days_per_year}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Carry forward:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        leaveType.carry_forward ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {leaveType.carry_forward ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Requires approval:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        leaveType.requires_approval ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {leaveType.requires_approval ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        leaveType.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {leaveType.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {leaveType.description && (
                      <p className="text-xs text-gray-600 mt-2 italic">{leaveType.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* African Holidays Calendar Preview */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Upcoming African Holidays (Uganda)</h3>
        </div>
        <div className="p-6">
          {calendarLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner />
              <p className="ml-3 text-sm text-gray-500">Loading holidays...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidaysData.length > 0 ? (
                holidaysData.map((holiday: any, index: number) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-sm font-medium text-red-800">{holiday.name}</div>
                    <div className="text-sm text-red-600 mt-1">
                      {new Date(holiday.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs text-red-500 mt-2 uppercase tracking-wide">
                      {new Date(holiday.date) > new Date() ? 'Upcoming' : 'Past'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No holiday data available
                </div>
              )}
            </div>
          )}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <CalendarIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">African Business Context</h4>
                <p className="text-sm text-blue-600 mt-1">
                  These holidays are automatically factored into leave calculations and payroll processing for Uganda. 
                  The system supports multiple African countries with their respective public holidays.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <XMarkIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">Reject Leave Request</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Please provide a reason for rejecting this leave request.
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter rejection reason..."
                  className="mt-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={4}
                />
              </div>
              <div className="items-center px-4 py-3">
                <div className="flex space-x-3">
                  <button
                    onClick={handleRejectConfirm}
                    disabled={rejectRequestMutation.isPending || !rejectReason.trim()}
                    className="px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectRequestMutation.isPending ? 'Rejecting...' : 'Reject Request'}
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(null);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leave Request Modal */}
      <LeaveRequestModal
        isOpen={showLeaveRequestModal}
        onClose={() => setShowLeaveRequestModal(false)}
        request={selectedLeaveRequest}
        onSuccess={handleModalSuccess}
      />

      {/* Leave Details Modal */}
      <LeaveDetailsModal
        isOpen={showLeaveDetailsModal}
        onClose={() => setShowLeaveDetailsModal(false)}
        leaveRequest={selectedLeaveRequest}
        onEdit={handleEditRequest}
        onApprove={() => selectedLeaveRequest && handleApprove(selectedLeaveRequest.id)}
        onReject={() => selectedLeaveRequest && handleReject(selectedLeaveRequest.id)}
        onCancel={() => selectedLeaveRequest && handleCancel(selectedLeaveRequest.id)}
      />

      {/* Leave Type Modal */}
      <LeaveTypeModal
        isOpen={showLeaveTypeModal}
        onClose={() => setShowLeaveTypeModal(false)}
        leaveType={selectedLeaveType}
        onSuccess={handleModalSuccess}
      />

      {/* Bulk Approval Modal */}
      <BulkApprovalModal
        isOpen={showBulkApproval}
        onClose={() => setShowBulkApproval(false)}
        onSuccess={handleModalSuccess}
      />

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

      <LeavePolicies />
      <LeaveEncashment />
      <LeaveReports />
    </div>
  );
}
