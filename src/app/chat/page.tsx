"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageWindow } from '@/components/chat/MessageWindow';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { Conversation } from '@/types';
import { Channel } from '@/types/chat';
import { useAuth } from '@/hooks/useApi';
import ManageChannelsModal from '@/components/chat/ManageChannelsModal';
import { NotificationCenter } from '@/components/chat/NotificationCenter';
import { GlobalSearch } from '@/components/chat/GlobalSearch';
import { FloatingActionButton } from '@/components/chat/FloatingActionButton';
import { 
  ChatBubbleLeftRightIcon, 
  SparklesIcon, 
  BellIcon,
  Cog6ToothIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

export default function ChatPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { me } = useAuth();
  const user = me.data?.data?.user;

  // Keyboard shortcuts
  useEffect(() => {
    // Only add event listener if running in the browser
    if (typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key) {
            case 'k':
              e.preventDefault();
              setShowSearch(true);
              break;
            case 'n':
              e.preventDefault();
              setShowNotifications(!showNotifications);
              break;
          }
        }
        if (e.key === 'Escape') {
          setShowSearch(false);
          setShowNotifications(false);
          setShowSettings(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showNotifications]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setSelectedChannel(null);
  };

  const handleSelectChannel = (channel: Channel) => {
    setSelectedChannel(channel);
    setSelectedConversation(null);
  };

  const handleSearchResult = (result: any) => {
    if (result.conversation) {
      // Navigate to conversation
      setSelectedConversation(result.conversation);
      setSelectedChannel(null);
    } else if (result.channel) {
      // Navigate to channel
      setSelectedChannel(result.channel);
      setSelectedConversation(null);
    }
    setShowSearch(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900">
      {/* Enhanced Sidebar */}
      <ChatSidebar 
        onSelectConversation={handleSelectConversation} 
        onSelectChannel={handleSelectChannel} 
      />
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Premium Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-gray-700/20">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Airis Messenger
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.department?.name ? `${user.department.name} Department` : 'Internal Communication'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Notifications Bell */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 group"
              >
                <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              </button>
              
              {/* Settings */}
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white dark:hover:bg-gray-700 transition-all duration-200 group"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-600 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
              </button>
              
              {/* Executive Channel Management */}
              {user?.department?.name === 'Executive' && (
                <ManageChannelsModal />
              )}
              
              {/* Back to Dashboard */}
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 relative overflow-hidden">
          {selectedConversation ? (
            <MessageWindow conversation={selectedConversation} />
          ) : selectedChannel ? (
            <MessageWindow channel={selectedChannel} />
          ) : (
            <div className="flex items-center justify-center h-full relative">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-indigo-100/40 dark:from-gray-800/40 dark:to-indigo-900/40"></div>
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), 
                                 radial-gradient(circle at 75% 75%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)`,
              }}></div>
              
              {/* Welcome Content */}
              <div className="relative text-center max-w-lg px-8">
                <div className="mb-8">
                  <div className="relative inline-block">
                    <SparklesIcon className="h-20 w-20 text-indigo-500 mx-auto mb-6 animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                  Welcome, {user?.name}! 👋
                </h2>
                
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Connect with your team through our powerful internal communication platform. 
                  Select a conversation or channel to start collaborating.
                </p>
                
                {/* Feature Highlights */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                    <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-1">🎯 Smart Features</div>
                    <div className="text-gray-600 dark:text-gray-400">Voice notes, file sharing, reactions</div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                    <div className="text-purple-600 dark:text-purple-400 font-semibold mb-1">⚡ Real-time</div>
                    <div className="text-gray-600 dark:text-gray-400">Instant messaging & notifications</div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                    <div className="text-pink-600 dark:text-pink-400 font-semibold mb-1">🏢 Enterprise</div>
                    <div className="text-gray-600 dark:text-gray-400">Department channels & security</div>
                  </div>
                  
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 dark:border-gray-700/20">
                    <div className="text-green-600 dark:text-green-400 font-semibold mb-1">📱 Modern</div>
                    <div className="text-gray-600 dark:text-gray-400">Beautiful UI with dark mode</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Global Search */}
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSelectResult={handleSearchResult}
      />

      {/* Floating Action Button */}
      <FloatingActionButton
        onNewMessage={() => {
          // Switch to users tab in sidebar
          // This would need to be implemented to communicate with ChatSidebar
        }}
        onNewChannel={() => {
          // Open channel creation modal
        }}
        onSearch={() => setShowSearch(true)}
        onCall={() => {
          // Open call interface
        }}
      />
    </div>
  );
}
