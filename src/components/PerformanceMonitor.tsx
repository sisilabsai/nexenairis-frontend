'use client';
import { useEffect, useState } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export default function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [memoryInfo, setMemoryInfo] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when explicitly enabled
    const showMonitor = process.env.NODE_ENV === 'development' || 
                        localStorage.getItem('pwa-performance-monitor') === 'true';
    setIsVisible(showMonitor);

    if (!showMonitor) return;

    // Network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setNetworkInfo({
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      });

      connection.addEventListener('change', () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      });
    }

    // Memory information
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      });

      // Update memory info every 5 seconds
      const memoryInterval = setInterval(() => {
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      }, 5000);

      return () => clearInterval(memoryInterval);
    }
  }, []);

  const formatBytes = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {/* Network Information */}
      {networkInfo && (
        <div className="mb-2">
          <h4 className="font-semibold text-blue-400">Network</h4>
          <div>Type: {networkInfo.effectiveType}</div>
          <div>Speed: {networkInfo.downlink} Mbps</div>
          <div>RTT: {networkInfo.rtt}ms</div>
          {networkInfo.saveData && <div className="text-yellow-400">Data Saver: ON</div>}
        </div>
      )}

      {/* Memory Information */}
      {memoryInfo && (
        <div className="mb-2">
          <h4 className="font-semibold text-green-400">Memory</h4>
          <div>Used: {formatBytes(memoryInfo.usedJSHeapSize)}</div>
          <div>Total: {formatBytes(memoryInfo.totalJSHeapSize)}</div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-1">
            <div
              className="bg-green-400 h-1 rounded-full"
              style={{
                width: `${(memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Recent Performance Metrics */}
      {metrics.length > 0 && (
        <div>
          <h4 className="font-semibold text-purple-400">Web Vitals</h4>
          {metrics.slice(-3).map((metric, index) => (
            <div key={index} className="flex justify-between">
              <span>{metric.name}:</span>
              <span className={getRatingColor(metric.rating)}>
                {metric.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Service Worker Status */}
      <div className="mt-2 pt-2 border-t border-gray-600">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${'serviceWorker' in navigator ? 'bg-green-400' : 'bg-red-400'}`} />
          <span className="text-xs">
            SW: {'serviceWorker' in navigator ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Toggle button for localStorage */}
      <button
        onClick={() => {
          localStorage.setItem('pwa-performance-monitor', 'false');
          setIsVisible(false);
        }}
        className="mt-2 text-xs text-gray-400 hover:text-white"
      >
        Hide (reload to show)
      </button>
    </div>
  );
}

// Helper function to enable the monitor
export function enablePerformanceMonitor() {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pwa-performance-monitor', 'true');
    window.location.reload();
  }
}