import React from 'react';
import { 
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface LeaveDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequest: any;
  onEdit?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}

export default function LeaveDetailsModal({ 
  isOpen, 
  onClose, 
  leaveRequest, 
  onEdit,
  onApprove,
  onReject,
  onCancel
}: LeaveDetailsModalProps) {
  if (!isOpen || !leaveRequest) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-6 border w-full max-w-2xl shadow-lg rounded-lg bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Leave Request Details</h3>
              <p className="text-sm text-gray-500">Request #{leaveRequest.request_number || leaveRequest.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(leaveRequest.status)}`}>
            {getStatusIcon(leaveRequest.status)} {leaveRequest.status.charAt(0).toUpperCase() + leaveRequest.status.slice(1)}
          </span>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Employee Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <UserIcon className="h-5 w-5 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Employee</h4>
              </div>
              <p className="text-lg font-semibold text-gray-900">{leaveRequest.employee?.name || 'N/A'}</p>
              <p className="text-sm text-gray-600">{leaveRequest.employee?.email || 'N/A'}</p>
              <p className="text-sm text-gray-600">ID: {leaveRequest.employee?.employee_id || 'N/A'}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-gray-900">Leave Type</h4>
              </div>
              <p className="text-lg font-semibold text-blue-900">{leaveRequest.leave_type?.name || 'N/A'}</p>
              <p className="text-sm text-blue-700">Code: {leaveRequest.leave_type?.code || 'N/A'}</p>
            </div>
          </div>

          {/* Date Information */}
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <ClockIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-gray-900">Duration</h4>
              </div>
              <p className="text-lg font-semibold text-green-900">{leaveRequest.days_requested} Days</p>
              <div className="text-sm text-green-700 space-y-1">
                <p><strong>From:</strong> {formatDate(leaveRequest.start_date)}</p>
                <p><strong>To:</strong> {formatDate(leaveRequest.end_date)}</p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <DocumentTextIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-gray-900">Request Info</h4>
              </div>
              <p className="text-sm text-purple-700">
                <strong>Submitted:</strong> {formatDateTime(leaveRequest.created_at)}
              </p>
              {leaveRequest.approved_at && (
                <p className="text-sm text-purple-700">
                  <strong>Processed:</strong> {formatDateTime(leaveRequest.approved_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-2">Reason for Leave</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700">{leaveRequest.reason || 'No reason provided'}</p>
          </div>
        </div>

        {/* Approval Information */}
        {(leaveRequest.approved_by || leaveRequest.approval_notes) && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Approval Information</h4>
            <div className={`rounded-lg p-4 border ${
              leaveRequest.status === 'approved' ? 'bg-green-50 border-green-200' : 
              leaveRequest.status === 'rejected' ? 'bg-red-50 border-red-200' : 
              'bg-gray-50 border-gray-200'
            }`}>
              {leaveRequest.approved_by && (
                <p className="text-sm mb-2">
                  <strong>Processed by:</strong> {leaveRequest.approved_by?.name || 'N/A'}
                </p>
              )}
              {leaveRequest.approval_notes && (
                <div>
                  <strong className="text-sm">Notes:</strong>
                  <p className="text-sm mt-1 text-gray-700">{leaveRequest.approval_notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Close
          </button>

          {leaveRequest.status === 'pending' && (
            <>
              {onReject && (
                <button
                  onClick={onReject}
                  className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                  Reject
                </button>
              )}
              {onApprove && (
                <button
                  onClick={onApprove}
                  className="px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                  Approve
                </button>
              )}
            </>
          )}

          {leaveRequest.status === 'approved' && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-orange-300 rounded-md text-sm font-medium text-orange-700 hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Cancel Request
            </button>
          )}

          {(leaveRequest.status === 'pending' || leaveRequest.status === 'rejected') && onEdit && (
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



