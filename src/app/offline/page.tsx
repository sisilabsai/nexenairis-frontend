'use client';

import { useState, useEffect } from 'react';
import { 
  WifiIcon, 
  CloudIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  ChartBarIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Reload the page when back online
      window.location.reload();
    };

    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    window.location.reload();
  };

  const offlineFeatures = [
    {
      icon: QrCodeIcon,
      title: 'Mobile Scanner',
      description: 'Scan barcodes and QR codes offline',
      available: true
    },
    {
      icon: ChartBarIcon,
      title: 'View Cached Data',
      description: 'Access previously loaded inventory and reports',
      available: true
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Draft Operations',
      description: 'Create drafts that sync when online',
      available: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Status Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            {isOnline ? (
              <WifiIcon className="w-10 h-10 text-green-600" />
            ) : (
              <CloudIcon className="w-10 h-10 text-orange-600" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isOnline ? 'Connection Restored' : 'You\'re Offline'}
          </h1>
          
          <p className="text-gray-600">
            {isOnline 
              ? 'Great! Your connection has been restored.'
              : 'No internet connection detected. Don\'t worry, you can still use many features offline.'
            }
          </p>
        </div>

        {/* Connection Status */}
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${
          isOnline 
            ? 'bg-green-100 text-green-800' 
            : 'bg-orange-100 text-orange-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-orange-500'} ${
            !isOnline && 'animate-pulse'
          }`}></div>
          <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
        </div>

        {/* Offline Features */}
        {!isOnline && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Offline</h2>
            
            <div className="space-y-4">
              {offlineFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    feature.available ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <feature.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-sm font-medium text-gray-900">{feature.title}</h3>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <ArrowPathIcon className={`w-4 h-4 ${retryCount > 0 && 'animate-spin'}`} />
            <span>
              {retryCount > 0 ? 'Retrying...' : 'Try Again'}
            </span>
          </button>

          {!isOnline && (
            <>
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              
              <button
                onClick={() => window.location.href = '/mobile-scan'}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
              >
                <QrCodeIcon className="w-4 h-4" />
                <span>Use Mobile Scanner</span>
              </button>
            </>
          )}
        </div>

        {/* Tips */}
        {!isOnline && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <h3 className="text-sm font-medium text-blue-900 mb-1">Offline Tips</h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Your changes will sync automatically when online</li>
                  <li>• Some features may have limited functionality</li>
                  <li>• Check your internet connection and try again</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* PWA Info */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Nexen AIRIS PWA • Version 1.0</p>
        </div>
      </div>
    </div>
  );
}