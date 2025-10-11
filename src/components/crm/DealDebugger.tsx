'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BugAntIcon, 
  XMarkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';
import { PipelineApiService } from '../../services/PipelineApiService';
import { useContacts, useAuth, useUsers } from '../../hooks/useApi';

interface DebugResult {
  field: string;
  value: any;
  type: string;
  status: 'valid' | 'invalid' | 'warning';
  message: string;
}

export const DealDebugger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugResults, setDebugResults] = useState<DebugResult[]>([]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<any>(null);

  const { data: contactsData } = useContacts();
  const { data: usersData } = useUsers();
  const { me } = useAuth();
  const currentUser = me?.data as any;

  const testDealCreation = async () => {
    setIsLoading(true);
    setDebugResults([]);
    setApiResponse(null);
    setApiError(null);

    const results: DebugResult[] = [];

    // Get first contact
    const contacts = contactsData?.data?.data || [];
    const firstContact = Array.isArray(contacts) && contacts.length > 0 ? contacts[0] : null;

    // Get first user
    const users = usersData?.data || [];
    const firstUser = Array.isArray(users) && users.length > 0 ? users[0] : null;

    // Build test data
    const testData = {
      title: 'DEBUG TEST DEAL - ' + new Date().toISOString(),
      contact_id: firstContact?.id || null,
      description: 'This is a test deal created by the debugger',
      expected_value: 1000000,
      currency: 'UGX',
      probability: 50,
      expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      sales_pipeline_stage_id: 1, // Assuming stage 1 exists
      source: 'Debug Tool',
      notes: 'Created by Deal Debugger',
      assigned_to: firstUser?.id || currentUser?.user?.id || currentUser?.id || null,
    };

    // Validate each field
    results.push({
      field: 'title',
      value: testData.title,
      type: typeof testData.title,
      status: testData.title ? 'valid' : 'invalid',
      message: testData.title ? '✓ Title is set' : '✗ Title is missing'
    });

    results.push({
      field: 'contact_id',
      value: testData.contact_id,
      type: typeof testData.contact_id,
      status: testData.contact_id ? 'valid' : 'invalid',
      message: testData.contact_id ? `✓ Contact ID: ${testData.contact_id}` : '✗ No contacts available'
    });

    results.push({
      field: 'expected_value',
      value: testData.expected_value,
      type: typeof testData.expected_value,
      status: testData.expected_value > 0 ? 'valid' : 'invalid',
      message: testData.expected_value > 0 ? `✓ Value: ${testData.expected_value}` : '✗ Value must be > 0'
    });

    results.push({
      field: 'currency',
      value: testData.currency,
      type: typeof testData.currency,
      status: testData.currency && testData.currency.length === 3 ? 'valid' : 'invalid',
      message: testData.currency ? `✓ Currency: ${testData.currency}` : '✗ Currency missing'
    });

    results.push({
      field: 'probability',
      value: testData.probability,
      type: typeof testData.probability,
      status: testData.probability >= 0 && testData.probability <= 100 ? 'valid' : 'warning',
      message: `${testData.probability >= 0 && testData.probability <= 100 ? '✓' : '⚠'} Probability: ${testData.probability}%`
    });

    results.push({
      field: 'expected_close_date',
      value: testData.expected_close_date,
      type: typeof testData.expected_close_date,
      status: testData.expected_close_date ? 'valid' : 'invalid',
      message: testData.expected_close_date ? `✓ Close Date: ${testData.expected_close_date}` : '✗ Date missing'
    });

    results.push({
      field: 'sales_pipeline_stage_id',
      value: testData.sales_pipeline_stage_id,
      type: typeof testData.sales_pipeline_stage_id,
      status: testData.sales_pipeline_stage_id ? 'valid' : 'invalid',
      message: testData.sales_pipeline_stage_id ? `✓ Stage ID: ${testData.sales_pipeline_stage_id}` : '✗ Stage ID missing'
    });

    results.push({
      field: 'assigned_to',
      value: testData.assigned_to,
      type: typeof testData.assigned_to,
      status: testData.assigned_to ? 'valid' : 'warning',
      message: testData.assigned_to ? `✓ Assigned to User ID: ${testData.assigned_to}` : '⚠ No user assigned (backend should default)'
    });

    setDebugResults(results);

    // Try to create the deal
    try {
      console.log('🐛 DEBUG: Sending deal data:', testData);
      const response = await PipelineApiService.createDeal(testData);
      console.log('🐛 DEBUG: API Response:', response);
      setApiResponse(response);
    } catch (error: any) {
      console.error('🐛 DEBUG: API Error:', error);
      console.error('🐛 DEBUG: Error Response:', error.response);
      console.error('🐛 DEBUG: Error Data:', error.response?.data);
      setApiError({
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        errors: error.response?.data?.errors,
        fullError: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert('Copied to clipboard!');
  };

  return (
    <>
      {/* Debug Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-40 p-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full shadow-lg flex items-center space-x-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <BugAntIcon className="w-6 h-6" />
        <span className="font-semibold">Debug Deal Creation</span>
      </motion.button>

      {/* Debug Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              onClick={() => setIsOpen(false)}
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
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BugAntIcon className="w-8 h-8 text-white" />
                        <div>
                          <h2 className="text-xl font-bold text-white">Deal Creation Debugger</h2>
                          <p className="text-yellow-100">Test deal creation and identify issues</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                      >
                        <XMarkIcon className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                    {/* Action Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={testDealCreation}
                        disabled={isLoading}
                        className={`px-6 py-3 rounded-lg font-semibold text-white ${
                          isLoading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        {isLoading ? 'Testing...' : '🧪 Run Deal Creation Test'}
                      </button>
                    </div>

                    {/* Field Validation Results */}
                    {debugResults.length > 0 && (
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
                          <h3 className="font-semibold text-gray-900">Field Validation</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                          {debugResults.map((result, index) => (
                            <div key={index} className="p-4 flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                {result.status === 'valid' && (
                                  <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                )}
                                {result.status === 'invalid' && (
                                  <XCircleIcon className="w-6 h-6 text-red-500" />
                                )}
                                {result.status === 'warning' && (
                                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-gray-900">{result.field}</span>
                                  <span className="text-xs text-gray-500 font-mono">{result.type}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                  Value: {JSON.stringify(result.value)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* API Success Response */}
                    {apiResponse && (
                      <div className="border border-green-300 rounded-lg overflow-hidden bg-green-50">
                        <div className="bg-green-100 px-4 py-2 border-b border-green-300 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircleIcon className="w-5 h-5 text-green-600" />
                            <h3 className="font-semibold text-green-900">✅ Success! Deal Created</h3>
                          </div>
                          <button
                            onClick={() => copyToClipboard(apiResponse)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <ClipboardDocumentIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-4">
                          <pre className="text-xs text-gray-800 overflow-x-auto">
                            {JSON.stringify(apiResponse, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* API Error Response */}
                    {apiError && (
                      <div className="border border-red-300 rounded-lg overflow-hidden bg-red-50">
                        <div className="bg-red-100 px-4 py-2 border-b border-red-300 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <XCircleIcon className="w-5 h-5 text-red-600" />
                            <h3 className="font-semibold text-red-900">
                              ❌ Error: {apiError.status} {apiError.statusText}
                            </h3>
                          </div>
                          <button
                            onClick={() => copyToClipboard(apiError)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <ClipboardDocumentIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Error Message */}
                          <div>
                            <h4 className="font-semibold text-red-900 mb-2">Error Message:</h4>
                            <p className="text-sm text-red-800">{apiError.message}</p>
                          </div>

                          {/* Laravel Validation Errors */}
                          {apiError.errors && (
                            <div>
                              <h4 className="font-semibold text-red-900 mb-2">Validation Errors:</h4>
                              <div className="space-y-2">
                                {Object.keys(apiError.errors).map((field) => (
                                  <div key={field} className="bg-white p-3 rounded border border-red-200">
                                    <p className="font-semibold text-red-900">{field}:</p>
                                    <ul className="list-disc list-inside text-sm text-red-700">
                                      {apiError.errors[field].map((error: string, i: number) => (
                                        <li key={i}>{error}</li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Full Response Data */}
                          {apiError.data && (
                            <div>
                              <h4 className="font-semibold text-red-900 mb-2">Full Response:</h4>
                              <pre className="text-xs text-red-800 overflow-x-auto bg-white p-3 rounded">
                                {JSON.stringify(apiError.data, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Instructions */}
                    {!isLoading && debugResults.length === 0 && (
                      <div className="text-center text-gray-600 space-y-2">
                        <p>Click the button above to test deal creation.</p>
                        <p className="text-sm">
                          This will attempt to create a test deal and show you:
                        </p>
                        <ul className="text-sm text-left max-w-md mx-auto list-disc list-inside space-y-1">
                          <li>Field validation results</li>
                          <li>Actual data being sent to API</li>
                          <li>Full API response or error</li>
                          <li>Backend validation errors (if any)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
