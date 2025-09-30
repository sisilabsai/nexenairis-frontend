'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WellnessRecord {
  id?: number;
  employee_id: number;
  wellness_date: string;
  wellness_status: 'excellent' | 'good' | 'fair' | 'poor' | 'concerning';
  physical_health_score: number;
  mental_health_score: number;
  stress_level: 'low' | 'moderate' | 'high' | 'critical';
  sleep_hours: number;
  exercise_minutes: number;
  nutrition_rating: 'excellent' | 'good' | 'fair' | 'poor';
  work_life_balance: 'excellent' | 'good' | 'fair' | 'poor';
  concerns: string;
  recommendations: string;
  follow_up_date?: string;
  notes?: string;
}

interface WellnessRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  record?: WellnessRecord | null;
  employeeId?: number;
}

export default function WellnessRecordModal({
  isOpen,
  onClose,
  onSuccess,
  record = null,
  employeeId
}: WellnessRecordModalProps) {
  const [formData, setFormData] = useState<WellnessRecord>({
    employee_id: employeeId || 0,
    wellness_date: new Date().toISOString().split('T')[0],
    wellness_status: 'good',
    physical_health_score: 7,
    mental_health_score: 7,
    stress_level: 'moderate',
    sleep_hours: 7,
    exercise_minutes: 30,
    nutrition_rating: 'good',
    work_life_balance: 'good',
    concerns: '',
    recommendations: '',
    follow_up_date: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (record) {
      setFormData({
        employee_id: record.employee_id,
        wellness_date: record.wellness_date,
        wellness_status: record.wellness_status,
        physical_health_score: record.physical_health_score,
        mental_health_score: record.mental_health_score,
        stress_level: record.stress_level,
        sleep_hours: record.sleep_hours,
        exercise_minutes: record.exercise_minutes,
        nutrition_rating: record.nutrition_rating,
        work_life_balance: record.work_life_balance,
        concerns: record.concerns,
        recommendations: record.recommendations,
        follow_up_date: record.follow_up_date || '',
        notes: record.notes || ''
      });
    } else {
      setFormData({
        employee_id: employeeId || 0,
        wellness_date: new Date().toISOString().split('T')[0],
        wellness_status: 'good',
        physical_health_score: 7,
        mental_health_score: 7,
        stress_level: 'moderate',
        sleep_hours: 7,
        exercise_minutes: 30,
        nutrition_rating: 'good',
        work_life_balance: 'good',
        concerns: '',
        recommendations: '',
        follow_up_date: '',
        notes: ''
      });
    }
    setErrors({});
  }, [record, employeeId, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_id) {
      newErrors.employee_id = 'Employee is required';
    }

    if (!formData.wellness_date) {
      newErrors.wellness_date = 'Wellness date is required';
    }

    if (formData.physical_health_score < 1 || formData.physical_health_score > 10) {
      newErrors.physical_health_score = 'Physical health score must be between 1 and 10';
    }

    if (formData.mental_health_score < 1 || formData.mental_health_score > 10) {
      newErrors.mental_health_score = 'Mental health score must be between 1 and 10';
    }

    if (formData.sleep_hours < 0 || formData.sleep_hours > 24) {
      newErrors.sleep_hours = 'Sleep hours must be between 0 and 24';
    }

    if (formData.exercise_minutes < 0) {
      newErrors.exercise_minutes = 'Exercise minutes cannot be negative';
    }

    if (!formData.concerns.trim()) {
      newErrors.concerns = 'Concerns are required';
    }

    if (!formData.recommendations.trim()) {
      newErrors.recommendations = 'Recommendations are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // TODO: Implement actual API call
      console.log('Submitting wellness record:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving wellness record:', error);
      alert(`Error saving wellness record: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-blue-600';
    if (score >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'concerning': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {record ? 'Edit Wellness Record' : 'Add Wellness Record'}
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
          {/* Date and Overall Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wellness Date *
              </label>
              <input
                type="date"
                name="wellness_date"
                value={formData.wellness_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.wellness_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.wellness_date && <p className="text-red-500 text-xs mt-1">{errors.wellness_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Overall Wellness Status *
              </label>
              <select
                name="wellness_status"
                value={formData.wellness_status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="concerning">Concerning</option>
              </select>
            </div>
          </div>

          {/* Health Scores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Physical Health Score (1-10) *
              </label>
              <input
                type="number"
                name="physical_health_score"
                value={formData.physical_health_score}
                onChange={handleInputChange}
                min="1"
                max="10"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.physical_health_score ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.physical_health_score && <p className="text-red-500 text-xs mt-1">{errors.physical_health_score}</p>}
              <p className={`text-xs mt-1 ${getScoreColor(formData.physical_health_score)}`}>
                Score: {formData.physical_health_score}/10
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mental Health Score (1-10) *
              </label>
              <input
                type="number"
                name="mental_health_score"
                value={formData.mental_health_score}
                onChange={handleInputChange}
                min="1"
                max="10"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.mental_health_score ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.mental_health_score && <p className="text-red-500 text-xs mt-1">{errors.mental_health_score}</p>}
              <p className={`text-xs mt-1 ${getScoreColor(formData.mental_health_score)}`}>
                Score: {formData.mental_health_score}/10
              </p>
            </div>
          </div>

          {/* Stress Level and Sleep */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stress Level *
              </label>
              <select
                name="stress_level"
                value={formData.stress_level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sleep Hours (Last Night) *
              </label>
              <input
                type="number"
                name="sleep_hours"
                value={formData.sleep_hours}
                onChange={handleInputChange}
                min="0"
                max="24"
                step="0.5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.sleep_hours ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.sleep_hours && <p className="text-red-500 text-xs mt-1">{errors.sleep_hours}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {formData.sleep_hours < 6 ? '⚠️ Below recommended (6-8 hours)' : 
                 formData.sleep_hours > 9 ? '⚠️ Above recommended (6-8 hours)' : '✅ Optimal range'}
              </p>
            </div>
          </div>

          {/* Exercise and Nutrition */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise Minutes (Today) *
              </label>
              <input
                type="number"
                name="exercise_minutes"
                value={formData.exercise_minutes}
                onChange={handleInputChange}
                min="0"
                step="5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.exercise_minutes ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.exercise_minutes && <p className="text-red-500 text-xs mt-1">{errors.exercise_minutes}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {formData.exercise_minutes >= 30 ? '✅ Meets daily recommendation' : '⚠️ Below daily recommendation (30+ min)'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nutrition Rating *
              </label>
              <select
                name="nutrition_rating"
                value={formData.nutrition_rating}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Work-Life Balance and Follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Work-Life Balance *
              </label>
              <select
                name="work_life_balance"
                value={formData.work_life_balance}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Follow-up Date
              </label>
              <input
                type="date"
                name="follow_up_date"
                value={formData.follow_up_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Concerns */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Health Concerns *
            </label>
            <textarea
              name="concerns"
              value={formData.concerns}
              onChange={handleInputChange}
              rows={3}
              placeholder="Describe any health concerns, symptoms, or issues affecting wellness..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.concerns ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.concerns && <p className="text-red-500 text-xs mt-1">{errors.concerns}</p>}
          </div>

          {/* Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recommendations *
            </label>
            <textarea
              name="recommendations"
              value={formData.recommendations}
              onChange={handleInputChange}
              rows={3}
              placeholder="Provide specific recommendations for improving wellness..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.recommendations ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.recommendations && <p className="text-red-500 text-xs mt-1">{errors.recommendations}</p>}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Additional observations, context, or specific wellness insights..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Wellness Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Wellness Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Overall Status: </span>
                <span className={`font-medium ${getStatusColor(formData.wellness_status)}`}>
                  {formData.wellness_status.charAt(0).toUpperCase() + formData.wellness_status.slice(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Physical: </span>
                <span className={`font-medium ${getScoreColor(formData.physical_health_score)}`}>
                  {formData.physical_health_score}/10
                </span>
              </div>
              <div>
                <span className="text-gray-600">Mental: </span>
                <span className={`font-medium ${getScoreColor(formData.mental_health_score)}`}>
                  {formData.mental_health_score}/10
                </span>
              </div>
              <div>
                <span className="text-gray-600">Stress: </span>
                <span className={`font-medium ${
                  formData.stress_level === 'low' ? 'text-green-600' :
                  formData.stress_level === 'moderate' ? 'text-yellow-600' :
                  formData.stress_level === 'high' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {formData.stress_level.charAt(0).toUpperCase() + formData.stress_level.slice(1)}
                </span>
              </div>
            </div>
          </div>

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
              {record ? 'Update Record' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 