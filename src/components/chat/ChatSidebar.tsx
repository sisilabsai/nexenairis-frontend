"use client";

import { useState } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { UserList } from '@/components/chat/UserList';
import { ChannelList } from '@/components/chat/ChannelList';
import { Button } from '@/components/ui/button';
import { useCreateConversation, useAuth } from '@/hooks/useApi';
import { Conversation, User } from '@/types';
import { Channel } from '@/types/chat';
import { 
  ChatBubbleLeftRightIcon, 
  HashtagIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  BellIcon
} from '@heroicons/react/24/outline';
import { 
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
  HashtagIcon as HashtagIconSolid,
  UserPlusIcon as UserPlusIconSolid
} from '@heroicons/react/24/solid';

interface ChatSidebarProps {
  onSelectConversation: (conversation: Conversation) => void;
  onSelectChannel: (channel: Channel) => void;
}

export function ChatSidebar({ onSelectConversation, onSelectChannel }: ChatSidebarProps) {
  const [view, setView] = useState<'conversations' | 'users' | 'channels'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');
  const createConversation = useCreateConversation();
  const { me } = useAuth();
  const user = me.data?.data?.user;

  const handleSelectUser = async (user: User) => {
    try {
      const response = await createConversation.mutateAsync({ user_ids: [user.id] });
      if (response.success && response.data) {
        onSelectConversation(response.data as Conversation);
        setView('conversations');
      } else {
        console.error('Failed to create conversation:', response.message);
      }
    } catch (error) {
      console.error('Failed to create conversation', error);
    }
  };

  const menuItems = [
    {
      key: 'conversations',
      label: 'Messages',
      icon: ChatBubbleLeftRightIcon,
      iconSolid: ChatBubbleLeftRightIconSolid,
      count: 0, // This could be fetched from the API
      color: 'indigo'
    },
    {
      key: 'channels',
      label: 'Channels',
      icon: HashtagIcon,
      iconSolid: HashtagIconSolid,
      count: 0, // This could be fetched from the API
      color: 'purple'
    },
    {
      key: 'users',
      label: 'New Chat',
      icon: UserPlusIcon,
      iconSolid: UserPlusIconSolid,
      count: null,
      color: 'green'
    }
  ];

  return (
    <div className="w-96 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/20 flex flex-col">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-white/20 dark:border-gray-700/20">
        {/* User Profile Section */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{user?.name}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {user?.department?.name || 'Available'}
            </p>
          </div>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search or press Ctrl+K..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              // Could trigger global search here
              if (searchQuery.trim()) {
                // setShowGlobalSearch(true);
              }
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-500 rounded">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700/50 rounded-xl p-1">
          {menuItems.map((item) => {
            const isActive = view === item.key;
            const IconComponent = isActive ? item.iconSolid : item.icon;
            const colorClasses = {
              indigo: isActive ? 'bg-indigo-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400',
              purple: isActive ? 'bg-purple-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400',
              green: isActive ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400'
            };

            return (
              <button
                key={item.key}
                onClick={() => setView(item.key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium text-sm ${colorClasses[item.color as keyof typeof colorClasses]} ${isActive ? 'shadow-lg transform scale-105' : 'hover:bg-white/50 dark:hover:bg-gray-600/50'}`}
              >
                <IconComponent className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.count !== null && item.count > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {item.count > 99 ? '99+' : item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="flex-1 overflow-hidden">
        {view === 'conversations' && (
          <div className="h-full">
            <div className="p-4 border-b border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <ChatBubbleLeftRightIconSolid className="h-4 w-4 text-indigo-500" />
                <span>Recent Conversations</span>
                <div className="flex-1"></div>
                <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <SparklesIcon className="h-4 w-4 text-gray-400 hover:text-indigo-500" />
                </button>
              </div>
            </div>
            <ConversationList onSelectConversation={onSelectConversation} />
          </div>
        )}
        
        {view === 'channels' && (
          <div className="h-full">
            <div className="p-4 border-b border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <HashtagIconSolid className="h-4 w-4 text-purple-500" />
                <span>Department Channels</span>
                <div className="flex-1"></div>
                <button className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                  <BellIcon className="h-4 w-4 text-gray-400 hover:text-purple-500" />
                </button>
              </div>
            </div>
            <ChannelList onSelectChannel={onSelectChannel} />
          </div>
        )}
        
        {view === 'users' && (
          <div className="h-full">
            <div className="p-4 border-b border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <UserPlusIconSolid className="h-4 w-4 text-green-500" />
                <span>Start New Conversation</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select a colleague to start chatting
              </p>
            </div>
            <UserList onSelectUser={handleSelectUser} />
          </div>
        )}
      </div>

      {/* Status Footer */}
      <div className="p-4 border-t border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Online • {user?.department?.name}</span>
          </div>
          <div className="flex items-center space-x-1">
            <SparklesIcon className="h-3 w-3" />
            <span>Premium</span>
          </div>
        </div>
      </div>
    </div>
  );
}
