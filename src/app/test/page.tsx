'use client';

import { useState } from 'react';
import { useTest, useTestDatabase, useTestAida } from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/DashboardLayout';

export default function TestPage() {
  const [activeTest, setActiveTest] = useState<'api' | 'database' | 'aida'>('api');
  
  const { data: apiTest, isLoading: apiLoading, error: apiError, refetch: refetchApi } = useTest();
  const { data: dbTest, isLoading: dbLoading, error: dbError, refetch: refetchDb } = useTestDatabase();
  const { data: aidaTest, isLoading: aidaLoading, error: aidaError, refetch: refetchAida } = useTestAida();

  const tests = [
    { id: 'api', name: 'API Connection', data: apiTest, loading: apiLoading, error: apiError, refetch: refetchApi },
    { id: 'database', name: 'Database Connection', data: dbTest, loading: dbLoading, error: dbError, refetch: refetchDb },
    { id: 'aida', name: 'AIDA Integration', data: aidaTest, loading: aidaLoading, error: aidaError, refetch: refetchAida },
  ];

  const currentTest = tests.find(test => test.id === activeTest);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Page header */}
        <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">API Connection Test</h1>
        <p className="mt-1 text-sm text-gray-500">
          Test the connection between frontend and Laravel backend API.
        </p>
      </div>

      {/* Test Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tests.map((test) => (
            <button
              key={test.id}
              onClick={() => setActiveTest(test.id as any)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTest === test.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {test.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Test Results */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            {currentTest?.name} Test Results
          </h3>
          
          <div className="space-y-4">
            {currentTest?.loading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Testing {currentTest.name}...</span>
              </div>
            ) : currentTest?.error ? (
              <ErrorMessage 
                message={currentTest.error.message || `Failed to test ${currentTest.name}`}
                onRetry={currentTest.refetch}
              />
            ) : currentTest?.data ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{currentTest.name} is working correctly.</p>
                      <pre className="mt-2 bg-green-100 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(currentTest.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No test data available. Click "Try Again" to run the test.
              </div>
            )}
          </div>

          {/* Test Actions */}
          <div className="mt-6">
            <button
              onClick={() => currentTest?.refetch()}
              disabled={currentTest?.loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentTest?.loading ? 'Testing...' : 'Run Test'}
            </button>
          </div>
        </div>
      </div>

      {/* All Tests Summary */}
      <div className="mt-8">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">All Tests Summary</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {tests.map((test) => (
            <div key={test.id} className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-900">{test.name}</h4>
                <div className="flex items-center">
                  {test.loading ? (
                    <LoadingSpinner size="sm" />
                  ) : test.error ? (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : test.data ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  )}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {test.loading ? 'Testing...' : 
                 test.error ? 'Failed' : 
                 test.data ? 'Success' : 'Not tested'}
              </p>
            </div>
          ))}
        </div>
      </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }
