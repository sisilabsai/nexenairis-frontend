'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  DevicePhoneMobileIcon,
  ArrowDownTrayIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface PWAInstallPromptProps {
  onInstalled?: () => void;
}

export default function PWAInstallPrompt({ onInstalled }: PWAInstallPromptProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    // Check if iOS
    const checkIOS = () => {
      const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                 (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      setIsIOS(ios);
    };

    checkInstalled();
    checkIOS();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not already installed
      if (!isInstalled && !localStorage.getItem('pwa-prompt-dismissed')) {
        setTimeout(() => setShowPrompt(true), 3000);
      }
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
      onInstalled?.();
      
      // Show success message
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Nexen AIRIS Installed!', {
          body: 'App successfully installed. You can now access it from your home screen.',
          icon: '/icons/icon-192x192.png'
        });
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isInstalled, onInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        setDeferredPrompt(null);
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    
    // Show again in 7 days
    setTimeout(() => {
      localStorage.removeItem('pwa-prompt-dismissed');
    }, 7 * 24 * 60 * 60 * 1000);
  };

  const handleIOSInstall = () => {
    setShowPrompt(false);
    // Show iOS install instructions
    const instructions = `
      To install Nexen AIRIS on your device:
      1. Tap the Share button in Safari
      2. Scroll down and tap "Add to Home Screen"
      3. Tap "Add" to confirm
    `;
    alert(instructions);
  };

  // Don't show if already installed or user is not on a supported platform
  if (isInstalled || (!deferredPrompt && !isIOS) || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg p-4 border border-blue-500/20 backdrop-blur-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1 mb-1">
              <SparklesIcon className="w-4 h-4 text-yellow-300" />
              <h3 className="text-sm font-semibold">Install Nexen AIRIS</h3>
            </div>
            <p className="text-xs text-blue-100 mb-3">
              Get the full app experience with faster loading, offline access, and native features!
            </p>
            
            <div className="flex space-x-2">
              {isIOS ? (
                <button
                  onClick={handleIOSInstall}
                  className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Install</span>
                </button>
              ) : (
                <button
                  onClick={handleInstall}
                  className="flex-1 bg-white text-blue-600 hover:bg-blue-50 text-xs font-medium py-2 px-3 rounded-md transition-colors flex items-center justify-center space-x-1"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>Install App</span>
                </button>
              )}
              
              <button
                onClick={handleDismiss}
                className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-md transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Features list */}
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2 text-xs text-blue-100">
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <span>Offline Access</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <span>Push Notifications</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <span>Camera Scanning</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <span>Native Performance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}