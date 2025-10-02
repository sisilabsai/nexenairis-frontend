'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useApi } from '@/hooks/useApi';
import { 
  CameraIcon, 
  DevicePhoneMobileIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  QrCodeIcon,
  ArrowPathIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';

// Declare BarcodeDetector for TypeScript
declare global {
  interface Window {
    BarcodeDetector: any;
  }
}

interface ScanResult {
  id: string;
  data: string;
  timestamp: string;
  type: 'pairing' | 'product';
  status: 'success' | 'error';
  message?: string;
}

export default function MobileScanPage() {
  const { post } = useApi();
  
  // Device state
  const [paired, setPaired] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [deviceUid, setDeviceUid] = useState('');
  
  // Camera and scanning state
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('prompt');
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate device name based on user agent
  const getDeviceName = useCallback(() => {
    const userAgent = navigator.userAgent;
    if (/iPhone/i.test(userAgent)) return 'iPhone';
    if (/iPad/i.test(userAgent)) return 'iPad';
    if (/Android/i.test(userAgent)) return 'Android Device';
    if (/Windows/i.test(userAgent)) return 'Windows Device';
    if (/Mac/i.test(userAgent)) return 'Mac Device';
    return 'Mobile Device';
  }, []);

  // Initialize device UID and check pairing status
  useEffect(() => {
    let uid = localStorage.getItem('device_uid');
    if (!uid) {
      uid = `mobile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device_uid', uid);
    }
    setDeviceUid(uid);

    // Set default device name if not set
    const savedName = localStorage.getItem('device_name');
    if (!savedName) {
      const defaultName = getDeviceName();
      setDeviceName(defaultName);
      localStorage.setItem('device_name', defaultName);
    } else {
      setDeviceName(savedName);
    }

    // Check if device was previously paired
    const wasPaired = localStorage.getItem('device_paired') === 'true';
    if (wasPaired) {
      setPaired(true);
    }
  }, [getDeviceName]);

  // Clear messages after timeout
  const clearMessages = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    scanTimeoutRef.current = setTimeout(() => {
      setSuccess(null);
      setError(null);
    }, 4000);
  }, []);

  // Check camera permissions
  const checkCameraPermissions = useCallback(async () => {
    try {
      console.log('Checking camera permissions...');
      setCameraPermission('checking');
      setError(null);
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Try simple camera access first
      let stream;
      try {
        // Try back camera first
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }
        });
      } catch (backCameraError) {
        console.log('Back camera failed, trying front camera:', backCameraError);
        // Fallback to front camera
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user' }
        });
      }
      
      // Stop the stream immediately - we just needed to check permission
      stream.getTracks().forEach(track => track.stop());
      
      console.log('Camera permission granted');
      setCameraPermission('granted');
      setSuccess('Camera access granted! Click "Start Scanning" to begin.');
      clearMessages();
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
      } else {
        setCameraPermission('prompt');
        setError(`Camera error: ${err.message || 'Unknown error occurred'}`);
      }
      
      clearMessages();
      return false;
    }
  }, [clearMessages]);

  // Start native camera scanner
  const startScanner = useCallback(async () => {
    if (scannerActive) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Starting native camera scanner...');

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Clear any existing scan interval
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }

      // Try to get camera access
      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer back camera
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (backCameraError) {
        console.log('Back camera failed, trying front camera');
        // Fallback to front camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
      }

      streamRef.current = stream;

      // Set up video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setScannerActive(true);
      setCameraPermission('granted');
      setSuccess('Camera started! Point at a QR code to scan.');

      // Start scanning for QR codes
      startQRCodeDetection();

    } catch (err: any) {
      console.error('Failed to start camera:', err);
      
      let errorMessage = 'Failed to start camera';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access denied. Please allow camera access and try again.';
        setCameraPermission('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
        setCameraPermission('denied');
      } else if (err.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
        setCameraPermission('denied');
      } else {
        errorMessage = err.message || 'Unknown camera error occurred';
        setCameraPermission('prompt');
      }
      
      setError(errorMessage);
      
    } finally {
      setIsLoading(false);
    }
  }, [scannerActive]);

  // QR Code detection using canvas and BarcodeDetector API
  const startQRCodeDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set up scanning interval
    scanIntervalRef.current = setInterval(async () => {
      if (!video.videoWidth || !video.videoHeight || isLoading) return;

      try {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Try to detect QR codes using browser's native barcode detection API if available
        if ('BarcodeDetector' in window) {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await barcodeDetector.detect(canvas);
          
          if (barcodes.length > 0) {
            const qrCode = barcodes[0];
            handleQRCodeDetected(qrCode.rawValue);
          }
        }
      } catch (err) {
        // Silently handle detection errors
        console.log('Barcode detection error:', err);
      }
    }, 500); // Check every 500ms
  }, [isLoading]);

  // Handle QR code detection
  const handleQRCodeDetected = useCallback(async (decodedText: string) => {
    if (!decodedText || isLoading) return;

    try {
      console.log('QR Code detected:', decodedText);
      setIsLoading(true);

      // Stop scanning temporarily
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }

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
              status: 'success',
              message: 'Device paired successfully!'
            };
            
            setScanResults(prev => [result, ...prev]);
            setSuccess('Device paired successfully! You can now scan products.');
          } else {
            throw new Error(response.message || 'Pairing failed');
          }
        } else {
          throw new Error('Invalid pairing QR code format');
        }
      } else {
        // Scan product
        const response = await post('/mobile/scan-product', {
          device_uid: deviceUid,
          scanned_data: decodedText,
        });

        const result: ScanResult = {
          id: Date.now().toString(),
          data: decodedText,
          timestamp: new Date().toISOString(),
          type: 'product',
          status: response.success ? 'success' : 'error',
          message: response.success ? 'Product scanned successfully' : response.message || 'Scan failed'
        };
        
        setScanResults(prev => [result, ...prev]);
        
        if (response.success) {
          setSuccess(`Product scanned successfully: ${decodedText}`);
        } else {
          setError(`Failed to process scan: ${response.message || decodedText}`);
        }
      }

      // Resume scanning after delay
      setTimeout(() => {
        setSuccess(null);
        setError(null);
        setIsLoading(false);
        if (scannerActive) {
          startQRCodeDetection();
        }
      }, 2000);

    } catch (err: any) {
      console.error('Scan processing error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to process scan');
      
      const result: ScanResult = {
        id: Date.now().toString(),
        data: decodedText,
        timestamp: new Date().toISOString(),
        type: paired ? 'product' : 'pairing',
        status: 'error',
        message: err.response?.data?.message || err.message || 'Processing failed'
      };
      
      setScanResults(prev => [result, ...prev]);
      
      // Resume scanning after error
      setTimeout(() => {
        setIsLoading(false);
        if (scannerActive) {
          startQRCodeDetection();
        }
      }, 2000);
    }
  }, [paired, deviceName, deviceUid, post, isLoading, scannerActive, startQRCodeDetection]);

  // Stop scanner
  const stopScanner = useCallback(async () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setScannerActive(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  // Request camera permission and start scanner
  const handleStartScanning = async () => {
    try {
      setError(null);
      setSuccess(null);
      
      // If camera permission not granted, request it first
      if (cameraPermission !== 'granted') {
        const hasPermission = await checkCameraPermissions();
        if (!hasPermission) {
          return;
        }
      }
      
      // Start the scanner
      await startScanner();
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start scanner');
    }
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

  // Handle manual input
  const handleManualSubmit = async () => {
    if (!manualInput.trim()) return;
    
    await handleQRCodeDetected(manualInput.trim());
    setManualInput('');
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

          {/* Manual Camera Access Button (when not active and permission not granted) */}
          {!scannerActive && cameraPermission !== 'granted' && (
            <div className="mb-4 text-center">
              <button
                onClick={checkCameraPermissions}
                disabled={isLoading || cameraPermission === 'checking'}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading || cameraPermission === 'checking' ? (
                  <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CameraIcon className="w-4 h-4 mr-2" />
                )}
                {cameraPermission === 'checking' ? 'Checking Camera...' : 'Request Camera Access'}
              </button>
              
              {/* Debug info */}
              <div className="mt-2 text-xs text-gray-500">
                Status: {cameraPermission} | Mobile: {/Mobi|Android/i.test(navigator.userAgent) ? 'Yes' : 'No'}
              </div>
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

              {cameraPermission === 'granted' && !scannerActive && (
                <div className="text-center py-8">
                  <CameraIcon className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Scan</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {paired 
                      ? 'Point your camera at a product barcode to scan inventory' 
                      : 'Point your camera at the admin\'s QR code to pair this device'
                    }
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleStartScanning}
                      disabled={isLoading}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <CameraIcon className="w-5 h-5 mr-2" />
                      )}
                      {isLoading ? 'Starting Camera...' : 'Start Scanning'}
                    </button>
                    
                    {/* Debug button for testing camera access */}
                    <div className="text-center">
                      <button
                        onClick={async () => {
                          try {
                            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                            setSuccess('Camera test successful!');
                            stream.getTracks().forEach(track => track.stop());
                          } catch (err: any) {
                            setError(`Camera test failed: ${err.message}`);
                          }
                        }}
                        className="text-xs text-blue-600 underline"
                      >
                        Test Camera Access
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {cameraPermission === 'prompt' && !scannerActive && (
                <div className="text-center py-8">
                  <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Access Needed</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click the button below to request camera access and start scanning
                  </p>
                  <div className="space-y-3">
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
                      {isLoading ? 'Starting Camera...' : 'Start Camera & Scan'}
                    </button>
                    
                    {/* Debug button for testing camera access */}
                    <div className="text-center">
                      <button
                        onClick={async () => {
                          try {
                            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                            setSuccess('Camera test successful!');
                            stream.getTracks().forEach(track => track.stop());
                          } catch (err: any) {
                            setError(`Camera test failed: ${err.message}`);
                          }
                        }}
                        className="text-xs text-blue-600 underline"
                      >
                        Test Camera Access
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {scannerActive && (
                <div>
                  <div className="relative">
                    <video 
                      ref={videoRef}
                      className="w-full h-64 bg-black rounded-lg object-cover"
                      playsInline
                      muted
                    />
                    <canvas 
                      ref={canvasRef}
                      className="hidden"
                    />
                    
                    {/* Scanning overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg"></div>
                    </div>
                    
                    {/* BarcodeDetector support indicator */}
                    {'BarcodeDetector' in window ? (
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Native Scanner Active
                      </div>
                    ) : (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                        Manual Input Only
                      </div>
                    )}
                  </div>
                  
                  {isLoading && (
                    <div className="mt-4 flex items-center justify-center">
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin text-blue-600" />
                      <span className="text-sm text-blue-600">Processing scan...</span>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-center space-x-3">
                    <button
                      onClick={stopScanner}
                      disabled={isLoading}
                      className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      <StopIcon className="w-4 h-4 mr-2" />
                      Stop Scanning
                    </button>
                    
                    {paired && (
                      <button
                        onClick={handleResetPairing}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        Unpair Device
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Manual Input (if BarcodeDetector not supported) */}
          {scannerActive && !('BarcodeDetector' in window) && (
            <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Manual Input</h3>
              <p className="text-xs text-gray-600 mb-3">
                Your browser doesn't support automatic QR scanning. Please enter the code manually:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter QR code or barcode"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualInput.trim() || isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

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
                        {result.message && (
                          <p className={`text-xs ${result.status === 'success' ? 'text-green-600' : 'text-red-600'} mb-1`}>
                            {result.message}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {new Date(result.timestamp).toLocaleString()} • {result.type}
                        </p>
                      </div>
                      <div className="ml-2">
                        {result.status === 'success' ? (
                          <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="w-5 h-5 text-red-500" />
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