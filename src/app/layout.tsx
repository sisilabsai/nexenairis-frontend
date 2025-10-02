'use client';
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import QueryProvider from "../providers/QueryProvider";
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import AidaChat from "@/components/AidaChat";
import AidaChatButton from "@/components/AidaChatButton";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import PWAStatus from "@/components/PWAStatus";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/ui/toast";
import Script from 'next/script';
import Head from 'next/head';
import { reportWebVitals } from "@/utils/webVitals";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Initialize service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(
        (registration) => {
          console.log('Service Worker registration successful with scope: ', registration.scope);
        },
        (err) => {
          console.log('Service Worker registration failed: ', err);
        }
      );
    }

    // Start web vitals monitoring
    reportWebVitals();
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Nexen AIRIS" />
        <meta name="application-name" content="Nexen AIRIS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48x48.png" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/icons/icon-128x128.png" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        
        {/* iOS Splash Screens */}
        <link rel="apple-touch-startup-image" href="/icons/splash-iphone5-320x568.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-iphone6-375x667.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-iphone6plus-414x736.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-iphonex-375x812.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-iphonexr-414x896.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-ipad-768x1024.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/icons/splash-ipadpro-1024x1366.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
        
        {/* Microsoft Tiles */}
        <meta name="msapplication-square70x70logo" content="/icons/icon-72x72.png" />
        <meta name="msapplication-square150x150logo" content="/icons/icon-152x152.png" />
        <meta name="msapplication-wide310x150logo" content="/icons/icon-384x384.png" />
        <meta name="msapplication-square310x310logo" content="/icons/icon-512x512.png" />
        
        {/* Preconnect to API domain */}
        <link rel="preconnect" href="https://nexenairis.com" />
        <link rel="dns-prefetch" href="https://nexenairis.com" />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased bg-gray-50`}
      >
        <QueryProvider>
          <AuthProvider>
            <PermissionProvider>
              <ToastProvider>
                {children}
                <AidaChatButton onClick={() => setIsChatOpen(true)} />
                <AidaChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
                <PWAInstallPrompt />
                <PWAStatus />
                <PerformanceMonitor />
              </ToastProvider>
            </PermissionProvider>
          </AuthProvider>
        </QueryProvider>
        <Script
          src="https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js"
          onLoad={() => {
            const beamsClient = new (window as any).PusherPushNotifications.Client({
              instanceId: '2b2b7b06-2db8-4465-a1a0-7aafcfe611f6',
            });

            beamsClient.start()
              .then(() => beamsClient.addDeviceInterest('hello'))
              .then(() => console.log('Successfully registered and subscribed!'))
              .catch(console.error);
          }}
        />
      </body>
    </html>
  );
}
