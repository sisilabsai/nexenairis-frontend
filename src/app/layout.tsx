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
import { useState, useEffect } from "react";
import { ToastProvider } from "@/components/ui/toast";
import Script from 'next/script';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
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
  }, []);

  return (
    <html lang="en">
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
