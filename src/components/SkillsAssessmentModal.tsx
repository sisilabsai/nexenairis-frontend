'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SkillsAssessment {
  id?: number;
  employee_id: number;
  skill_name: string;
  skill_category: 'technical' | 'soft_skills' | 'leadership' | 'domain_knowledge' | 'tools' | 'languages';
  proficiency_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  self_rating: number;
  manager_rating: number;
  assessment_date: string;
  next_review_date: string;
  development_goals: string;
  training_recommendations: string;
  notes?: string;
}

interface SkillsAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  assessment?: SkillsAssessment | null;
  employeeId?: number;
}

export default function SkillsAssessmentModal({
  isOpen,
  onClose,
  onSuccess,
  assessment = null,
  employeeId
}: SkillsAssessmentModalProps) {
  const [formData, setFormData] = useState<SkillsAssessment>({
    employee_id: employeeId || 0,
    skill_name: '',
    skill_category: 'technical',
    proficiency_level: 'intermediate',
    self_rating: 3,
    manager_rating: 3,
    assessment_date: new Date().toISOString().split('T')[0],
    next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    development_goals: '',
    training_recommendations: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (assessment) {
      setFormData({
        employee_id: assessment.employee_id,
        skill_name: assessment.skill_name,
        skill_category: assessment.skill_category,
        proficiency_level: assessment.proficiency_level,
        self_rating: assessment.self_rating,
        manager_rating: assessment.manager_rating,
        assessment_date: assessment.assessment_date,
        next_review_date: assessment.next_review_date,
        development_goals: assessment.development_goals,
        training_recommendations: assessment.training_recommendations,
        notes: assessment.notes || ''
      });
    } else {
      setFormData({
        employee_id: employeeId || 0,
        skill_name: '',
        skill_category: 'technical',
        proficiency_level: 'intermediate',
        self_rating: 3,
        manager_rating: 3,
        assessment_date: new Date().toISOString().split('T')[0],
        next_review_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        development_goals: '',
        training_recommendations: '',
        notes: ''
      });
    }
    setErrors({});
  }, [assessment, employeeId, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
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

    if (!formData.skill_name.trim()) {
      newErrors.skill_name = 'Skill name is required';
    }

    if (formData.self_rating < 1 || formData.self_rating > 5) {
      newErrors.self_rating = 'Self rating must be between 1 and 5';
    }

    if (formData.manager_rating < 1 || formData.manager_rating > 5) {
      newErrors.manager_rating = 'Manager rating must be between 1 and 5';
    }

    if (!formData.assessment_date) {
      newErrors.assessment_date = 'Assessment date is required';
    }

    if (!formData.next_review_date) {
      newErrors.next_review_date = 'Next review date is required';
    }

    if (!formData.development_goals.trim()) {
      newErrors.development_goals = 'Development goals are required';
    }

    if (!formData.training_recommendations.trim()) {
      newErrors.training_recommendations = 'Training recommendations are required';
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
      console.log('Submitting skills assessment:', formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error saving skills assessment:', error);
      alert(`Error saving skills assessment: ${error?.message || 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingLabel = (rating: number) => {
    const labels = ['Not Applicable', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'];
    return labels[rating] || 'Unknown';
  };

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return 'text-red-600';
    if (rating <= 3) return 'text-yellow-600';
    if (rating <= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {assessment ? 'Edit Skills Assessment' : 'Add Skills Assessment'}
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
          {/* Skill Name and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                name="skill_name"
                value={formData.skill_name}
                onChange={handleInputChange}
                placeholder="e.g., JavaScript, Project Management, Customer Service"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.skill_name ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.skill_name && <p className="text-red-500 text-xs mt-1">{errors.skill_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Category *
              </label>
              <select
                name="skill_category"
                value={formData.skill_category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="technical">Technical Skills</option>
                <option value="soft_skills">Soft Skills</option>
                <option value="leadership">Leadership</option>
                <option value="domain_knowledge">Domain Knowledge</option>
                <option value="tools">Tools & Software</option>
                <option value="languages">Languages</option>
              </select>
            </div>
          </div>

          {/* Proficiency Level and Ratings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency Level *
              </label>
              <select
                name="proficiency_level"
                value={formData.proficiency_level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Self Rating (1-5) *
              </label>
              <input
                type="number"
                name="self_rating"
                value={formData.self_rating}
                onChange={handleInputChange}
                min="1"
                max="5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.self_rating ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.self_rating && <p className="text-red-500 text-xs mt-1">{errors.self_rating}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {getRatingLabel(formData.self_rating)} - {formData.self_rating}/5
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Manager Rating (1-5) *
              </label>
              <input
                type="number"
                name="manager_rating"
                value={formData.manager_rating}
                onChange={handleInputChange}
                min="1"
                max="5"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.manager_rating ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.manager_rating && <p className="text-red-500 text-xs mt-1">{errors.manager_rating}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {getRatingLabel(formData.manager_rating)} - {formData.manager_rating}/5
              </p>
            </div>
          </div>

          {/* Assessment Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Date *
              </label>
              <input
                type="date"
                name="assessment_date"
                value={formData.assessment_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.assessment_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.assessment_date && <p className="text-red-500 text-xs mt-1">{errors.assessment_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next Review Date *
              </label>
              <input
                type="date"
                name="next_review_date"
                value={formData.next_review_date}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.next_review_date ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.next_review_date && <p className="text-red-500 text-xs mt-1">{errors.next_review_date}</p>}
            </div>
          </div>

          {/* Development Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Development Goals *
            </label>
            <textarea
              name="development_goals"
              value={formData.development_goals}
              onChange={handleInputChange}
              rows={3}
              placeholder="Specific goals for improving this skill in the next review period..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.development_goals ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.development_goals && <p className="text-red-500 text-xs mt-1">{errors.development_goals}</p>}
          </div>

          {/* Training Recommendations */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Training Recommendations *
            </label>
            <textarea
              name="training_recommendations"
              value={formData.training_recommendations}
              onChange={handleInputChange}
              rows={3}
              placeholder="Recommended training courses, certifications, or learning resources..."
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.training_recommendations ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {errors.training_recommendations && <p className="text-red-500 text-xs mt-1">{errors.training_recommendations}</p>}
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
              placeholder="Additional observations, context, or specific examples of skill demonstration..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Rating Comparison */}
          {formData.self_rating > 0 && formData.manager_rating > 0 && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Rating Comparison</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="text-gray-600">Self Assessment: </span>
                  <span className={`font-medium ${getRatingColor(formData.self_rating)}`}>
                    {formData.self_rating}/5 - {getRatingLabel(formData.self_rating)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-600">Manager Assessment: </span>
                  <span className={`font-medium ${getRatingColor(formData.manager_rating)}`}>
                    {formData.manager_rating}/5 - {getRatingLabel(formData.manager_rating)}
                  </span>
                </div>
                <div className="text-sm col-span-2">
                  <span className="text-gray-600">Rating Difference: </span>
                  <span className={`font-medium ${
                    Math.abs(formData.self_rating - formData.manager_rating) <= 1 ? 'text-green-600' : 'text-orange-600'
                  }`}>
                    {Math.abs(formData.self_rating - formData.manager_rating)} points
                    {Math.abs(formData.self_rating - formData.manager_rating) <= 1 ? ' (Aligned)' : ' (Needs Discussion)'}
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
              {assessment ? 'Update Assessment' : 'Add Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 