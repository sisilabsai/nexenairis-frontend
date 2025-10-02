'use client';

import { useState, useEffect } from 'react';
import {
  QrCodeIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { api } from '../lib/api';

interface ConnectionCode {
  code: string;
  created_at: string;
  expires_at: string;
  is_used: boolean;
  used_by_device?: string;
  used_at?: string;
  permissions: {
    scan_products: boolean;
    add_products: boolean;
    view_inventory: boolean;
    sync_data: boolean;
  };
}

interface ConnectedDevice {
  id: string;
  name: string;
  type: 'mobile' | 'desktop';
  user_agent: string;
  ip_address: string;
  connected_at: string;
  last_ping: string;
  connection_type: string;
  paired_by_code?: string;
  paired_by_user?: number;
  permissions: any;
  is_active: boolean;
  trust_level: string;
  is_online: boolean;
}

export default function MobileDeviceManager() {
  const [activeTab, setActiveTab] = useState<'pairing' | 'devices' | 'codes'>('pairing');
  const [connectionCodes, setConnectionCodes] = useState<ConnectionCode[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<ConnectionCode | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadConnectionCodes();
    loadConnectedDevices();
  }, []);

  const loadConnectionCodes = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/mobile/active-codes');
      if (response.success) {
        setConnectionCodes((response.data as any).codes);
      }
    } catch (err) {
      console.error('Failed to load connection codes:', err);
      setError('Failed to load connection codes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadConnectedDevices = async () => {
    try {
      const response = await api.get('/mobile/devices');
      if (response.success) {
        setConnectedDevices((response.data as any).devices);
      }
    } catch (err) {
      console.error('Failed to load connected devices:', err);
    }
  };

  const generateConnectionCode = async () => {
    try {
      setIsGeneratingCode(true);
      setError(null);

      const response = await api.post('/mobile/generate-code');

      if (response.success) {
        const newCode = (response.data as any);
        setGeneratedCode(newCode);

        // Use QR code URL from backend response or generate one
        if (newCode.qr_code_url) {
          setQrCodeUrl(newCode.qr_code_url);
        } else {
          // Fallback: Generate QR code URL for display
          const qrData = newCode.qr_code_data;
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`);
        }

        // Reload codes list
        await loadConnectionCodes();

        setSuccess('Connection code generated successfully!');
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to generate connection code:', err);
      setError(err.response?.data?.message || 'Failed to generate connection code');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const revokeConnectionCode = async (code: string) => {
    if (!confirm(`Are you sure you want to revoke connection code ${code}?`)) {
      return;
    }

    try {
      const response = await api.post('/mobile/revoke-code', { connection_code: code });

      if (response.success) {
        setSuccess('Connection code revoked successfully!');
        await loadConnectionCodes();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err: any) {
      console.error('Failed to revoke connection code:', err);
      setError(err.response?.data?.message || 'Failed to revoke connection code');
    }
  };

  const getStatusIcon = (code: ConnectionCode) => {
    if (code.is_used) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }

    const now = new Date();
    const expiresAt = new Date(code.expires_at);

    if (now > expiresAt) {
      return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }

    const minutesUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));

    if (minutesUntilExpiry <= 5) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
    }

    return <ClockIcon className="h-5 w-5 text-blue-500" />;
  };

  const getStatusText = (code: ConnectionCode) => {
    if (code.is_used) {
      return 'Used';
    }

    const now = new Date();
    const expiresAt = new Date(code.expires_at);

    if (now > expiresAt) {
      return 'Expired';
    }

    const minutesUntilExpiry = Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60));
    return `Expires in ${minutesUntilExpiry}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">📱 Mobile Device Management</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {connectedDevices.filter(d => d.is_online).length} online
            </span>
            <ArrowPathIcon
              className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => {
                loadConnectionCodes();
                loadConnectedDevices();
              }}
            />
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'pairing', label: 'Device Pairing', icon: QrCodeIcon },
            { key: 'devices', label: 'Connected Devices', icon: DevicePhoneMobileIcon, count: connectedDevices.length },
            { key: 'codes', label: 'Connection Codes', icon: QrCodeIcon, count: connectionCodes.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-6">
        {/* Device Pairing Tab */}
        {activeTab === 'pairing' && (
          <div className="space-y-6">
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Generate Connection Code</h4>
              <p className="text-sm text-gray-600 mb-4">
                Generate a secure, one-time use connection code that expires in 15 minutes.
                Mobile devices can scan the QR code or enter the code manually to pair with the system.
              </p>

              <button
                onClick={generateConnectionCode}
                disabled={isGeneratingCode || connectionCodes.length >= 10}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingCode ? (
                  <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <QrCodeIcon className="h-5 w-5 mr-2" />
                )}
                {isGeneratingCode ? 'Generating...' : 'Generate Connection Code'}
              </button>

              {connectionCodes.length >= 10 && (
                <p className="text-sm text-orange-600 mt-2">
                  Maximum of 10 active connection codes reached. Revoke unused codes to generate new ones.
                </p>
              )}
            </div>

            {/* Generated Code Display */}
            {generatedCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <h5 className="text-lg font-semibold text-blue-900 mb-2">New Connection Code Generated</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-blue-700 mb-1">Connection Code:</p>
                        <p className="text-2xl font-mono font-bold text-blue-900 bg-white px-3 py-2 rounded border">
                          {generatedCode.code}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700 mb-1">Expires:</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {formatDateTime(generatedCode.expires_at)}
                        </p>
                        <p className="text-sm text-blue-600">15 minutes from now</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-blue-700 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(generatedCode.permissions).map(([key, value]) => (
                          <span
                            key={key}
                            className={`px-2 py-1 text-xs rounded-full ${
                              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {key.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex-shrink-0">
                    <div className="bg-white p-4 rounded-lg border">
                      <img
                        src={qrCodeUrl}
                        alt="Connection QR Code"
                        className="w-32 h-32"
                      />
                      <p className="text-xs text-center text-gray-500 mt-2">
                        Scan with mobile device
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Instructions:</strong> Have the mobile device user scan this QR code or manually enter the connection code
                    in the mobile scanning app. The code will expire automatically after 15 minutes or when used once.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Connected Devices Tab */}
        {activeTab === 'devices' && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Connected Mobile Devices</h4>

            {connectedDevices.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <DevicePhoneMobileIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No devices connected yet</p>
                <p className="text-sm mt-1">Generate a connection code to pair mobile devices</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedDevices.map((device) => (
                  <div key={device.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${device.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <h5 className="font-medium text-gray-900">{device.name}</h5>
                          <p className="text-sm text-gray-500">{device.type} • {device.trust_level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {device.is_online ? 'Online' : 'Offline'}
                        </p>
                        <p className="text-xs text-gray-400">
                          Connected {formatDateTime(device.connected_at)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">IP Address</p>
                        <p className="font-mono">{device.ip_address}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Last Ping</p>
                        <p>{formatDateTime(device.last_ping)}</p>
                      </div>
                    </div>

                    {device.paired_by_code && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          Paired using code: <span className="font-mono">{device.paired_by_code}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Connection Codes Tab */}
        {activeTab === 'codes' && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-900">Active Connection Codes</h4>

            {connectionCodes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <QrCodeIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p>No active connection codes</p>
                <p className="text-sm mt-1">Generate a connection code to start pairing devices</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectionCodes.map((code) => (
                  <div key={code.code} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(code)}
                        <div>
                          <p className="font-mono text-lg font-semibold">{code.code}</p>
                          <p className="text-sm text-gray-500">{getStatusText(code)}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {/* View details */}}
                          className="p-2 text-gray-400 hover:text-gray-600"
                          title="View details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>

                        {!code.is_used && (
                          <button
                            onClick={() => revokeConnectionCode(code.code)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Revoke code"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Created</p>
                        <p>{formatDateTime(code.created_at)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Expires</p>
                        <p>{formatDateTime(code.expires_at)}</p>
                      </div>
                    </div>

                    {code.is_used && code.used_by_device && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                          Used by device: <span className="font-mono">{code.used_by_device}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Used at: {formatDateTime(code.used_at!)}
                        </p>
                      </div>
                    )}

                    <div className="mt-3">
                      <p className="text-sm text-gray-500 mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(code.permissions).map(([key, value]) => (
                          <span
                            key={key}
                            className={`px-2 py-1 text-xs rounded-full ${
                              value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {key.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
