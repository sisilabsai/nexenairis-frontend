'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { Html5QrcodeScanner, Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { 
  CameraIcon, 
  DevicePhoneMobileIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  QrCodeIcon,
  BoltIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';

interface ScanResult {
  id: string;
  data: string;
  timestamp: string;
  type: 'pairing' | 'product';
  status: 'success' | 'error';
}

export default function MobileScanPage() {
  const { post } = useApi();
  
  // Device state
  const [paired, setPaired] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceUid, setDeviceUid] = useState('');
  
  // Camera and scanning state
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Refs
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Initialize device UID
  useEffect(() => {
    const uid = localStorage.getItem('device_uid') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('device_uid', uid);
    setDeviceUid(uid);

    // Check if device was previously paired
    const wasPaired = localStorage.getItem('device_paired') === 'true';
    const pairedDeviceName = localStorage.getItem('device_name');
    
    if (wasPaired && pairedDeviceName) {
      setPaired(true);
      setDeviceName(pairedDeviceName);
    }
  }, []);

  // Check camera permissions
  const checkCameraPermissions = useCallback(async () => {
    try {
      console.log('Checking camera permissions...');
      setCameraPermission('checking');
      setError(null);
      
      // First check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Set a timeout for the permission request
      const permissionPromise = navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' } // Prefer back camera but allow front camera as fallback
        } 
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Camera permission request timed out')), 8000)
      );

      // Try to get camera permission with timeout
      const stream = await Promise.race([permissionPromise, timeoutPromise]) as MediaStream;
      
      // Stop the stream immediately as we just needed to check permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log('Camera permission granted');
      setCameraPermission('granted');
      setSuccess('Camera access granted! You can now start scanning.');
      return true;
    } catch (err: any) {
      console.error('Camera permission error:', err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraPermission('denied');
        setError('Camera access denied. Please allow camera access in your browser settings and try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraPermission('denied');
        setError('No camera found on this device.');
      } else if (err.name === 'NotReadableError') {
        setCameraPermission('denied');
        setError('Camera is already in use by another application.');
      } else if (err.message.includes('timed out')) {
        setCameraPermission('prompt');
        setError('Camera permission request timed out. Click "Request Camera Access" to try again.');
      } else {
        setCameraPermission('prompt');
        setError(`Camera error: ${err.message}. Click "Request Camera Access" to try again.`);
      }
      
      return false;
    }
  }, []);

  // Check camera permissions on component mount
  useEffect(() => {
    checkCameraPermissions();
  }, [checkCameraPermissions]);

  // Start QR scanner
  const startScanner = useCallback(async () => {
    if (!scannerRef.current || scannerActive) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check camera permissions first
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) return;

      // Clean up any existing scanner
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch (e) {
          console.log('No active scanner to stop');
        }
      }

      // Create new scanner instance
      const html5QrCode = new Html5Qrcode("qr-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE, Html5QrcodeSupportedFormats.CODE_128, Html5QrcodeSupportedFormats.CODE_39],
        verbose: false
      });
      
      html5QrCodeRef.current = html5QrCode;

      const qrCodeSuccessCallback = async (decodedText: string, decodedResult: any) => {
        try {
          console.log('QR Code scanned:', decodedText);
          
          if (!paired) {
            // Try to parse as pairing QR code
            let qrData;
            try {
              qrData = JSON.parse(decodedText);
            } catch (parseErr) {
              // If not JSON, treat as direct code
              qrData = { code: decodedText };
            }

            if (qrData.code) {
              setIsLoading(true);
              const response = await post('/mobile/pair-device', {
                code: qrData.code,
                device_name: deviceName || `Mobile Device ${new Date().toLocaleString()}`,
                device_uid: deviceUid,
              });

              if (response.success) {
                setPaired(true);
                localStorage.setItem('device_paired', 'true');
                localStorage.setItem('device_name', deviceName || `Mobile Device ${new Date().toLocaleString()}`);
                
                const result: ScanResult = {
                  id: Date.now().toString(),
                  data: decodedText,
                  timestamp: new Date().toISOString(),
                  type: 'pairing',
                  status: 'success'
                };
                
                setScanResults(prev => [result, ...prev]);
                setSuccess('Device paired successfully! You can now scan products.');
              }
            } else {
              throw new Error('Invalid pairing QR code format');
            }
          } else {
            // Scan product
            setIsLoading(true);
            const response = await post('/mobile/scan-product', {
              device_uid: deviceUid,
              scanned_data: decodedText,
            });

            const result: ScanResult = {
              id: Date.now().toString(),
              data: decodedText,
              timestamp: new Date().toISOString(),
              type: 'product',
              status: response.success ? 'success' : 'error'
            };
            
            setScanResults(prev => [result, ...prev]);
            
            if (response.success) {
              setSuccess(`Product scanned successfully: ${decodedText}`);
            } else {
              setError(`Failed to process scan: ${decodedText}`);
            }
          }
          
          // Clear messages after 3 seconds
          setTimeout(() => {
            setSuccess(null);
            setError(null);
          }, 3000);

        } catch (err: any) {
          console.error('Scan processing error:', err);
          setError(err.response?.data?.message || err.message || 'Failed to process scan');
          
          const result: ScanResult = {
            id: Date.now().toString(),
            data: decodedText,
            timestamp: new Date().toISOString(),
            type: paired ? 'product' : 'pairing',
            status: 'error'
          };
          
          setScanResults(prev => [result, ...prev]);
        } finally {
          setIsLoading(false);
        }
      };

      const qrCodeErrorCallback = (errorMessage: string) => {
        // Ignore frequent "No QR code found" messages
        if (!errorMessage.includes('No QR code found')) {
          console.log('QR scan error:', errorMessage);
        }
      };

      // Start scanning with back camera
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        qrCodeSuccessCallback,
        qrCodeErrorCallback
      );

      setScannerActive(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setError(`Failed to start camera: ${err.message}`);
      setCameraPermission('denied');
    } finally {
      setIsLoading(false);
    }
  }, [scannerActive, paired, deviceName, deviceUid, post, checkCameraPermissions]);

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (html5QrCodeRef.current && scannerActive) {
      try {
        await html5QrCodeRef.current.stop();
        setScannerActive(false);
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  }, [scannerActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Request camera permission and start scanner
  const handleStartScanning = () => {
    startScanner();
  };

  // Reset pairing
  const handleResetPairing = () => {
    localStorage.removeItem('device_paired');
    localStorage.removeItem('device_name');
    setPaired(false);
    setDeviceName('');
    setScanResults([]);
    stopScanner();
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              {paired ? (
                <QrCodeIcon className="w-8 h-8 text-blue-600" />
              ) : (
                <DevicePhoneMobileIcon className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {paired ? 'Product Scanner' : 'Device Pairing'}
            </h1>
            <p className="text-sm text-gray-600">
              {paired 
                ? 'Scan product barcodes to manage inventory' 
                : 'Scan the QR code from your admin to pair this device'
              }
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Device Name Input (only when not paired) */}
          {!paired && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Device Name (Optional)
              </label>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., John's Phone, Warehouse Scanner"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Manual Camera Access Button (always visible when not active) */}
          {!scannerActive && (
            <div className="mb-4 text-center">
              <button
                onClick={checkCameraPermissions}
                disabled={isLoading || cameraPermission === 'checking'}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isLoading || cameraPermission === 'checking' ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CameraIcon className="w-4 h-4 mr-2" />
                )}
                {cameraPermission === 'checking' ? 'Checking...' : 'Check Camera Access'}
              </button>
            </div>
          )}

          {/* Camera Scanner */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4">
              {cameraPermission === 'checking' && (
                <div className="text-center py-8">
                  <ArrowPathIcon className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-gray-600">Checking camera permissions...</p>
                  <p className="text-xs text-gray-500 mt-2">This may take a few seconds...</p>
                </div>
              )}

              {cameraPermission === 'denied' && (
                <div className="text-center py-8">
                  <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Access Required</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    To use the scanner, please allow camera access in your browser.
                  </p>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                      <button
                        onClick={checkCameraPermissions}
                        disabled={isLoading}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CameraIcon className="w-4 h-4 mr-2" />
                        )}
                        Request Camera Access
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <ArrowPathIcon className="w-4 h-4 mr-2" />
                        Reload Page
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      If the button doesn't work, manually enable camera access in your browser settings for this website.
                    </p>
                  </div>
                </div>
              )}

              {(cameraPermission === 'granted' || cameraPermission === 'prompt') && !scannerActive && (
                <div className="text-center py-8">
                  <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {cameraPermission === 'granted' ? 'Ready to Scan' : 'Camera Access Needed'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {cameraPermission === 'granted' 
                      ? (paired ? 'Point your camera at a product barcode' : 'Point your camera at the admin\'s QR code')
                      : 'Click the button below to request camera access'
                    }
                  </p>
                  <button
                    onClick={handleStartScanning}
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <CameraIcon className="w-5 h-5 mr-2" />
                    )}
                    {isLoading ? 'Starting Camera...' : (cameraPermission === 'granted' ? 'Start Scanning' : 'Request Camera Access')}
                  </button>
                </div>
              )}

              {scannerActive && (
                <div>
                  <div id="qr-reader" ref={scannerRef} className="w-full"></div>
                  
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      onClick={stopScanner}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Stop Scanning
                    </button>
                    
                    {paired && (
                      <button
                        onClick={handleResetPairing}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Unpair Device
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Device Status */}
          {paired && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">Device Paired Successfully</p>
                  <p className="text-xs text-green-600">
                    Device: {deviceName || 'Unnamed Device'} | ID: {deviceUid.slice(-8)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scan Results */}
          {scanResults.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Scans</h3>
              </div>
              <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                {scanResults.slice(0, 10).map((result) => (
                  <div key={result.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {result.data}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleString()} • {result.type}
                        </p>
                      </div>
                      <div className="ml-2">
                        {result.status === 'success' ? (
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
