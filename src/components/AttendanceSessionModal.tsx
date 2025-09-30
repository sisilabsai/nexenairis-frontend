'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AttendanceSession {
  id?: number;
  employee_id: number;
  date: string;
  check_in_time: string;
  check_out_time?: string;
  break_start_time?: string;
  break_end_time?: string;
  total_hours: number;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'leave' | 'remote';
  location: 'office' | 'remote' | 'client_site' | 'travel';
  notes?: string;
  overtime_hours?: number;
  is_approved: boolean;
}

interface AttendanceSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  session?: AttendanceSession | null;
  employeeId?: number;
}

export default function AttendanceSessionModal({
  isOpen,
  onClose,
  onSuccess,
  session = null,
  employeeId
}: AttendanceSessionModalProps) {
  const [formData, setFormData] = useState<AttendanceSession>({
    employee_id: employeeId || 0,
    date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    break_start_time: '',
    break_end_time: '',
    total_hours: 0,
    status: 'present',
    location: 'office',
    notes: '',
    overtime_hours: 0,
    is_approved: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session) {
      setFormData({
        employee_id: session.employee_id,
        date: session.date,
        check_in_time: session.check_in_time,
        check_out_time: session.check_out_time || '',
        break_start_time: session.break_start_time || '',
        break_end_time: session.break_end_time || '',
        total_hours: session.total_hours,
        status: session.status,
        location: session.location,
        notes: session.notes || '',
        overtime_hours: session.overtime_hours || 0,
        is_approved: session.is_approved
      });
    } else {
      setFormData({
        employee_id: employeeId || 0,
        date: new Date().toISOString().split('T')[0],
        check_in_time: '',
        check_out_time: '',
        break_start_time: '',
        break_end_time: '',
        total_hours: 0,
        status: 'present',
        location: 'office',
        notes: '',
        overtime_hours: 0,
        is_approved: false
      });
    }
    setErrors({});
  }, [session, employeeId, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const calculateTotalHours = () => {
    if (!formData.check_in_time || !formData.check_out_time) return 0;
    
    const checkIn = new Date(`2000-01-01T${formData.check_in_time}`);
    const checkOut = new Date(`2000-01-01T${formData.check_out_time}`);
    
    let totalMs = checkOut.getTime() - checkIn.getTime();
    
    // Subtract break time if provided
    if (formData.break_start_time && formData.break_end_time) {
      const breakStart = new Date(`2000-01-01T${formData.break_start_time}`);
      const breakEnd = new Date(`2000-01-01T${formData.break_end_time}`);
      const breakMs = breakEnd.getTime() - breakStart.getTime();
      totalMs -= breakMs;
    }
    
    const totalHours = totalMs / (1000 * 60 * 60);
    return Math.max(0, totalHours);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.check_in_time) {
      newErrors.check_in_time = 'Check-in time is required';
    }

    if (formData.check_out_time && formData.check_in_time) {
      const checkIn = new Date(`2000-01-01T${formData.check_in_time}`);
      const checkOut = new Date(`2000-01-01T${formData.check_out_time}`);
      
      if (checkOut <= checkIn) {
        newErrors.check_out_time = 'Check-out time must be after check-in time';
      }
    }

    if (formData.break_start_time && formData.break_end_time) {
      const breakStart = new Date(`2000-01-01T${formData.break_start_time}`);
      const breakEnd = new Date(`2000-01-01T${formData.break_end_time}`);
      
      if (breakEnd <= breakStart) {
        newErrors.break_end_time = 'Break end time must be after break start time';
      }
    }

    if (formData.total_hours < 0) {
      newErrors.total_hours = 'Total hours cannot be negative';
    }

    if (formData.overtime_hours && formData.overtime_hours < 0) {
      newErrors.overtime_hours = 'Overtime hours cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate total hours before validation
    const calculatedHours = calculateTotalHours();
    setFormData(prev => ({ ...prev, total_hours: calculatedHours }));
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual API call
      console.log('Submitting attendance session:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving attendance session:', error);
      alert(`Error saving attendance session: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'text-green-600';
      case 'absent': return 'text-red-600';
      case 'late': return 'text-orange-600';
      case 'half_day': return 'text-yellow-600';
      case 'leave': return 'text-blue-600';
      case 'remote': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {session ? 'Edit Attendance Session' : 'Add Attendance Session'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="half_day">Half Day</option>
                <option value="leave">Leave</option>
                <option value="remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="client_site">Client Site</option>
                <option value="travel">Travel</option>
              </select>
            </div>
          </div>

          {/* Check-in and Check-out Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-in Time *
              </label>
              <input
                type="time"
                name="check_in_time"
                value={formData.check_in_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.check_in_time ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.check_in_time && <p className="text-red-500 text-xs mt-1">{errors.check_in_time}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Check-out Time
              </label>
              <input
                type="time"
                name="check_out_time"
                value={formData.check_out_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.check_out_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.check_out_time && <p className="text-red-500 text-xs mt-1">{errors.check_out_time}</p>}
            </div>
          </div>

          {/* Break Times */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break Start Time
              </label>
              <input
                type="time"
                name="break_start_time"
                value={formData.break_start_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.break_start_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.break_start_time && <p className="text-red-500 text-xs mt-1">{errors.break_start_time}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break End Time
              </label>
              <input
                type="time"
                name="break_end_time"
                value={formData.break_end_time}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.break_end_time ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.break_end_time && <p className="text-red-500 text-xs mt-1">{errors.break_end_time}</p>}
            </div>
          </div>

          {/* Hours and Overtime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Hours
              </label>
              <input
                type="number"
                name="total_hours"
                value={formData.total_hours.toFixed(2)}
                onChange={handleInputChange}
                step="0.25"
                min="0"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.total_hours ? 'border-red-500' : 'border-gray-300'
                }`}
                readOnly
              />
              {errors.total_hours && <p className="text-red-500 text-xs mt-1">{errors.total_hours}</p>}
              <p className="text-xs text-gray-500 mt-1">Auto-calculated from check-in/out times</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overtime Hours
              </label>
              <input
                type="number"
                name="overtime_hours"
                value={formData.overtime_hours}
                onChange={handleInputChange}
                step="0.25"
                min="0"
                placeholder="0.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.overtime_hours ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.overtime_hours && <p className="text-red-500 text-xs mt-1">{errors.overtime_hours}</p>}
              <p className="text-xs text-gray-500 mt-1">Hours worked beyond standard workday</p>
            </div>
          </div>

          {/* Approval Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_approved"
              checked={formData.is_approved}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">Approved by Manager</label>
            <p className="ml-2 text-xs text-gray-500">(Mark as approved when verified)</p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional notes about attendance, reasons for late arrival, or special circumstances..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Session Summary */}
          {formData.check_in_time && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Session Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status: </span>
                  <span className={`font-medium ${getStatusColor(formData.status)}`}>
                    {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Location: </span>
                  <span className="font-medium text-gray-900">
                    {formData.location.charAt(0).toUpperCase() + formData.location.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Total Hours: </span>
                  <span className="font-medium text-gray-900">
                    {formData.total_hours.toFixed(2)}h
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Overtime: </span>
                  <span className="font-medium text-gray-900">
                    {formData.overtime_hours}h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 flex items-center"
            >
              {isSubmitting && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {session ? 'Update Session' : 'Add Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 