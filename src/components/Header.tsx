'use client';

import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon, UserIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <BellIcon className="h-6 w-6" />
          </button>
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
          
          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              className="flex items-center gap-x-4 rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
              <span className="hidden lg:flex lg:items-center">
                <span className="text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">
                  {user?.name || 'User'}
                </span>
              </span>
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-gray-500">{user?.email}</div>
                  {user?.position && (
                    <div className="text-gray-500 text-xs">{typeof user.position === 'object' ? user.position.name : user.position}</div>
                  )}
                </div>
                <Link href="/profile" className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <UserIcon className="mr-3 h-4 w-4" />
                  View Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
