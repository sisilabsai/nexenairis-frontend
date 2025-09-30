'use client';

import React from 'react';
import { XMarkIcon, LightBulbIcon } from '@heroicons/react/24/outline';

interface PerformanceInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PerformanceInfoModal: React.FC<PerformanceInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <LightBulbIcon className="h-6 w-6 text-yellow-500 mr-2" />
            How to Use the Performance & Wellness Module
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="space-y-4 text-sm text-gray-700">
          <p>This module is designed to provide a comprehensive overview of employee performance and well-being. Here's how to get the most out of it:</p>
          
          <div>
            <h3 className="font-semibold text-gray-900">1. Wellness Dashboard</h3>
            <p>This section provides a snapshot of your employees' well-being. To use it, encourage your employees to regularly submit wellness records. This will help you identify trends and proactively address potential burnout or stress-related issues.</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">2. Performance Analytics</h3>
            <p>Track key performance metrics for your employees. You can add new metrics, such as productivity, quality, and teamwork, to monitor progress over time. The AI-powered insights will help you identify top performers and areas for improvement.</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">3. Skills Gap Analysis</h3>
            <p>Identify skills gaps within your organization by conducting skills assessments. This feature helps you create targeted development plans to upskill your workforce and prepare for future challenges.</p>
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <p className="font-semibold text-xs text-gray-800">Example:</p>
              <p className="text-xs text-gray-600">You can create an assessment for "Project Management" skills, setting the required level at 4 out of 5. If an employee's current level is 2, a skill gap of 2 will be identified, and you can create a development plan to address it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceInfoModal;
