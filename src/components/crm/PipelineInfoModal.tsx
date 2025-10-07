'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  InformationCircleIcon,
  PlayIcon,
  PlusIcon,
  ArrowRightIcon,
  ChartBarIcon,
  UserGroupIcon,
  BoltIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface PipelineInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PipelineInfoModal: React.FC<PipelineInfoModalProps> = ({ isOpen, onClose }) => {
  const features = [
    {
      icon: PlusIcon,
      title: 'Add New Deals',
      description: 'Click the "+" button in any stage to create new deals. Fill in customer details, deal value in UGX, and expected close date.',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: ArrowRightIcon,
      title: 'Move Deals',
      description: 'Drag and drop deals between stages to update their progress. Changes are saved automatically to your database.',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics',
      description: 'View detailed analytics including pipeline value, conversion rates, and forecasts. All data is calculated from your real deals.',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      icon: UserGroupIcon,
      title: 'Collaboration',
      description: 'See who is viewing or editing deals in real-time. Lock deals while making changes to prevent conflicts.',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: BoltIcon,
      title: 'Smart Automation',
      description: 'Set up automated workflows, lead scoring, and follow-up reminders to streamline your sales process.',
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      icon: SparklesIcon,
      title: 'AI Insights',
      description: 'Get AI-powered suggestions for deal improvements, email templates, and performance coaching.',
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  const quickTips = [
    'All monetary values are displayed in UGX (Uganda Shillings)',
    'Your data is tenant-specific and completely private',
    'Changes are auto-saved to your backend database',
    'Use filters to focus on specific deal types or stages',
    'Export your pipeline data for external analysis',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 overflow-y-auto"
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <InformationCircleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">Pipeline Guide</h2>
                        <p className="text-indigo-100">Learn how to master your sales pipeline</p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {/* Welcome Message */}
                  <div className="mb-8 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Welcome to Your Dynamic Sales Pipeline! 🎉
                    </h3>
                    <p className="text-gray-700">
                      This pipeline is completely dynamic and connected to your backend database. 
                      All data, including deals, customers, and analytics, are real and specific to your tenant.
                      Values are displayed in UGX for our East African focus.
                    </p>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {features.map((feature, index) => {
                      const Icon = feature.icon;
                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 ${feature.bg} rounded-lg`}>
                              <Icon className={`w-5 h-5 ${feature.color}`} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                              <p className="text-sm text-gray-600">{feature.description}</p>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Quick Tips */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                      <PlayIcon className="w-5 h-5 mr-2" />
                      Quick Tips
                    </h4>
                    <ul className="space-y-2">
                      {quickTips.map((tip, index) => (
                        <li key={index} className="flex items-start text-sm text-yellow-700">
                          <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Need help? Contact support or check our documentation.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PipelineInfoModal;