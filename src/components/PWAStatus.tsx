'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowPathIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  CloudIcon,
  WifiIcon
} from '@heroicons/react/24/outline';

export default function PWAStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'pending'>('synced');

  useEffect(() => {
    // Check if running as PWA
    const checkPWA = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
      setIsPWA(standalone);
    };

    // Online/Offline detection
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Service Worker update detection
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
        setUpdateAvailable(true);
      }
    };

    // Initial checks
    setIsOnline(navigator.onLine);
    checkPWA();

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);

    // Check for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          setUpdateAvailable(true);
        });
      });
    }

    // Simulate sync status (in real app, this would come from your sync manager)
    const syncInterval = setInterval(() => {
      if (!isOnline) {
        setSyncStatus('pending');
      } else {
        setSyncStatus('synced');
      }
    }, 1000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
      clearInterval(syncInterval);
    };
  }, [isOnline]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }
    } catch (error) {
      console.error('Error updating app:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Don't show status if not PWA
  if (!isPWA) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="flex flex-col space-y-2">
        {/* Connection Status */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {isOnline ? (
            <WifiIcon className="w-4 h-4" />
          ) : (
            <CloudIcon className="w-4 h-4" />
          )}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Sync Status */}
        {syncStatus !== 'synced' && (
          <div className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all ${
            syncStatus === 'syncing' 
              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
              : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
            {syncStatus === 'syncing' ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <ExclamationTriangleIcon className="w-4 h-4" />
            )}
            <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Sync Pending'}</span>
          </div>
        )}

        {/* Update Available */}
        {updateAvailable && (
          <div className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-2 rounded-full">
            <button
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex items-center space-x-2 text-xs font-medium hover:text-purple-900 transition-colors"
            >
              {isUpdating ? (
                <ArrowPathIcon className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="w-4 h-4" />
              )}
              <span>{isUpdating ? 'Updating...' : 'Update Available'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}