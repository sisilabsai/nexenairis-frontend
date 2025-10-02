// Performance monitoring and optimization utilities for PWA
import { lazy } from 'react';

// Web Vitals monitoring
export const reportWebVitals = (metric: any) => {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', metric);
  }
  
  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    // Send to Google Analytics, Mixpanel, or your preferred analytics service
    if ('gtag' in window) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      });
    }
  }
};

// Lazy loading utility for heavy components
export const createLazyComponent = (importFunc: () => Promise<any>) => {
  return lazy(importFunc);
};

// Image optimization configuration
export const imageOptimization = {
  // Use Next.js Image component optimizations
  formats: ['webp', 'avif'],
  sizes: {
    mobile: '(max-width: 768px) 100vw',
    tablet: '(max-width: 1024px) 50vw',
    desktop: '33vw'
  },
  placeholder: 'blur',
  quality: 75
};

// Bundle analysis helper
export const analyzeBundle = () => {
  if (process.env.ANALYZE === 'true') {
    console.log('Bundle analysis enabled');
    // This works with @next/bundle-analyzer
  }
};

// Performance observer for monitoring
export const initPerformanceObserver = () => {
  if ('PerformanceObserver' in window) {
    // Monitor Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', lastEntry.startTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Monitor First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('FID:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Monitor Cumulative Layout Shift
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('CLS:', clsValue);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
};

// Resource hints optimization
export const addResourceHints = () => {
  // Preload critical resources
  const criticalResources = [
    '/icons/icon-192x192.png',
    '/manifest.json'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.png') ? 'image' : 'fetch';
    document.head.appendChild(link);
  });
};

// Critical CSS inlining helper
export const inlineCriticalCSS = () => {
  // This should be handled at build time, but we can optimize runtime
  const criticalCSS = `
    .loading { opacity: 0.5; }
    .skeleton { 
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = criticalCSS;
  document.head.appendChild(style);
};

// Memory management for PWA
export const optimizeMemoryUsage = () => {
  // Clear caches periodically
  if ('caches' in window) {
    const clearOldCaches = async () => {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(name => 
        !name.includes(process.env.NEXT_PUBLIC_VERSION || 'current')
      );
      
      await Promise.all(
        oldCaches.map(cache => caches.delete(cache))
      );
    };

    // Clear old caches every hour
    setInterval(clearOldCaches, 60 * 60 * 1000);
  }
};

// Network-aware loading
export const isSlowConnection = () => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
};

// Adaptive loading based on network conditions
export const adaptiveLoad = (highQualityContent: () => void, lowQualityContent: () => void) => {
  if (isSlowConnection()) {
    lowQualityContent();
  } else {
    highQualityContent();
  }
};

// Service worker update handler
export const handleSWUpdate = (registration: ServiceWorkerRegistration) => {
  if (registration.waiting) {
    // New version available
    const updateSW = () => {
      registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    };

    // Show update notification to user
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div class="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50">
        <p>New version available!</p>
        <button onclick="window.updateSW()" class="mt-2 bg-white text-blue-600 px-3 py-1 rounded">
          Update Now
        </button>
      </div>
    `;
    document.body.appendChild(notification);
    (window as any).updateSW = updateSW;
  }
};

export default {
  reportWebVitals,
  createLazyComponent,
  imageOptimization,
  analyzeBundle,
  initPerformanceObserver,
  addResourceHints,
  inlineCriticalCSS,
  optimizeMemoryUsage,
  isSlowConnection,
  adaptiveLoad,
  handleSWUpdate
};