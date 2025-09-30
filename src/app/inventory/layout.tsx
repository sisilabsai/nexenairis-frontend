'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden lg:pl-64">
        <div className="lg:hidden">
          <div className="flex items-center justify-between bg-gray-800 p-4 text-white">
            <button onClick={() => setSidebarOpen(true)}>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold">NEXEN AIRIS</h1>
          </div>
        </div>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
