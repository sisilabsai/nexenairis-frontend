'use client';

import { useState, useEffect } from 'react';
import { useApi } from '@/hooks/useApi';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRef } from 'react';
import DashboardLayout from '@/components/DashboardLayout';

export default function MobileScanPage() {
  const { post } = useApi();
  const [paired, setPaired] = useState(false);
  const [scannedData, setScannedData] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceUid, setDeviceUid] = useState('');

  useEffect(() => {
    // Generate a unique device ID
    const uid = localStorage.getItem('device_uid') || `device_${Date.now()}`;
    localStorage.setItem('device_uid', uid);
    setDeviceUid(uid);
  }, []);

  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        scannerRef.current.id,
        { fps: 10, qrbox: 250 },
        false
      );
      scanner.render(
        async (data: string) => {
          if (data) {
            if (!paired) {
              try {
                const qrData = JSON.parse(data);
                await post('/mobile/pair-device', {
                  code: qrData.code,
                  device_name: deviceName || 'Unnamed Device',
                  device_uid: deviceUid,
                });
                setPaired(true);
                alert('Device paired successfully!');
              } catch (error) {
                console.error('Failed to pair device', error);
                alert('Failed to pair device. Please try again.');
              }
            } else {
              try {
                await post('/mobile/scan-product', {
                  device_uid: deviceUid,
                  scanned_data: data,
                });
                setScannedData(data);
                alert(`Scanned: ${data}`);
              } catch (error) {
                console.error('Failed to scan product', error);
                alert('Failed to scan product. Please try again.');
              }
            }
          }
        },
        (error: any) => {
          // Optionally handle scan errors
        }
      );
      return () => {
        scanner.clear();
      };
    }
  }, [paired, deviceName, deviceUid, post]);

  return (
    <DashboardLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-center mb-4">
          {paired ? 'Scan Products' : 'Pair Device'}
        </h1>
        {!paired && (
          <input
            type="text"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="Enter Device Name"
            className="w-full p-2 border rounded mb-4"
          />
        )}
        <div id="qr-scanner" ref={scannerRef} style={{ width: '100%' }} />
        {scannedData && <p className="mt-4 text-center">Last Scanned: {scannedData}</p>}
      </div>
    </DashboardLayout>
  );
}
