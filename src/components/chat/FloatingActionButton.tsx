"use client";

import { useState } from 'react';
import { 
  PlusIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  PhoneIcon,
  VideoCameraIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  action: () => void;
}

interface FloatingActionButtonProps {
  onNewMessage: () => void;
  onNewChannel: () => void;
  onSearch: () => void;
  onCall: () => void;
}

export function FloatingActionButton({ 
  onNewMessage, 
  onNewChannel, 
  onSearch, 
  onCall 
}: FloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'search',
      label: 'Search Everything',
      icon: MagnifyingGlassIcon,
      color: 'from-blue-500 to-blue-600',
      action: () => {
        onSearch();
        setIsOpen(false);
      }
    },
    {
      id: 'message',
      label: 'New Message',
      icon: ChatBubbleLeftRightIcon,
      color: 'from-green-500 to-green-600',
      action: () => {
        onNewMessage();
        setIsOpen(false);
      }
    },
    {
      id: 'channel',
      label: 'Create Channel',
      icon: UserGroupIcon,
      color: 'from-purple-500 to-purple-600',
      action: () => {
        onNewChannel();
        setIsOpen(false);
      }
    },
    {
      id: 'call',
      label: 'Start Call',
      icon: PhoneIcon,
      color: 'from-orange-500 to-orange-600',
      action: () => {
        onCall();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Quick Action Items */}
      <div className={`flex flex-col-reverse space-y-reverse space-y-3 mb-4 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {quickActions.map((action, index) => (
          <div 
            key={action.id} 
            className="flex items-center space-x-3"
            style={{ 
              transitionDelay: isOpen ? `${index * 50}ms` : `${(quickActions.length - index - 1) * 50}ms` 
            }}
          >
            {/* Action Label */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg border border-white/20 dark:border-gray-700/20">
              <span className="text-sm font-medium text-gray-800 dark:text-white whitespace-nowrap">
                {action.label}
              </span>
            </div>
            
            {/* Action Button */}
            <button
              onClick={action.action}
              className={`w-12 h-12 rounded-full bg-gradient-to-r ${action.color} hover:shadow-lg hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-white shadow-md`}
              title={action.label}
            >
              <action.icon className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center text-white ${
          isOpen ? 'rotate-45 scale-110' : 'hover:scale-110'
        } active:scale-95`}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <PlusIcon className="h-6 w-6" />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 -z-10 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}