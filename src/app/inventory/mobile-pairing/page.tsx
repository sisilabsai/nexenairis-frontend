'use client';

import { useState } from 'react';
import { DevicePhoneMobileIcon, QrCodeIcon, BoltIcon, CpuChipIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import MobileDeviceManager from '../../../components/MobileDeviceManager';

export default function MobilePairingPage() {
  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Game-Changing Mobile Device Pairing Introduction */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <DevicePhoneMobileIcon className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">🚀 Game-Changing Mobile Device Pairing</h3>
              <p className="text-gray-700 mb-2">
                Transform your inventory management with secure mobile device pairing! Perfect for restocking scenarios - 
                admins can pair mobile phones to scan products and sync directly with the main system.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>QR Code Pairing</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>Time-Limited Security</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>Cross-Network Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                  <span>Real-Time Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Device Manager Component */}
        <MobileDeviceManager />

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
               onClick={() => window.open('/mobile-scan', '_blank')}>
            <QrCodeIcon className="h-8 w-8 text-blue-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Open Mobile Scanner</h4>
            <p className="text-sm text-gray-600">Launch the mobile scanning interface in a new window</p>
          </div>
          
          <div className="bg-white border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
            <BoltIcon className="h-8 w-8 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">Bulk Scanning Session</h4>
            <p className="text-sm text-gray-600">Start a bulk product scanning session for restocking</p>
          </div>
          
          <div className="bg-white border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
            <CpuChipIcon className="h-8 w-8 text-purple-500 mx-auto mb-3" />
            <h4 className="font-medium text-gray-900 mb-2">AI-Powered Scanning</h4>
            <p className="text-sm text-gray-600">Enable AI-powered product recognition and smart suggestions</p>
          </div>
        </div>

        {/* Integration Instructions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">🎯 How to Use Mobile Device Pairing</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">For Administrators</h4>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                    <div>
                      <strong>Generate Connection Code:</strong> Click "Generate Connection Code" above to create a secure, time-limited pairing code
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                    <div>
                      <strong>Share QR Code:</strong> Show the QR code to team members who need to scan products
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                    <div>
                      <strong>Monitor Devices:</strong> Track connected devices and their scanning activity in real-time
                    </div>
                  </li>
                </ol>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">For Mobile Users</h4>
                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</span>
                    <div>
                      <strong>Open Mobile Scanner:</strong> Navigate to the mobile scanning page on your phone
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</span>
                    <div>
                      <strong>Scan QR Code:</strong> Use your phone to scan the admin's QR code for secure pairing
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</span>
                    <div>
                      <strong>Start Scanning:</strong> Begin scanning product barcodes - they sync automatically with the main system
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
