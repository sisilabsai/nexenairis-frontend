"use client";

import React from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Toaster } from 'react-hot-toast';

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Toaster />
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsLayout;
