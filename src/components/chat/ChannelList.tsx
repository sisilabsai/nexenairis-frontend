"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Channel } from '@/types/chat';
import { 
  HashtagIcon,
  LockClosedIcon,
  GlobeAltIcon,
  UsersIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { HashtagIcon as HashtagIconSolid } from '@heroicons/react/24/solid';

interface ChannelListProps {
  onSelectChannel: (channel: Channel) => void;
}

export function ChannelList({ onSelectChannel }: ChannelListProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelType, setNewChannelType] = useState<'public' | 'private'>('public');

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat/channels');
      console.log('Channels API response:', response);
      // Handle the structured API response
      if ((response.data as any)?.success && (response.data as any)?.data) {
        setChannels((response.data as any).data);
      } else if (Array.isArray(response.data)) {
        // Fallback for direct array response
        setChannels(response.data as Channel[]);
      } else {
        setChannels([]);
      }
    } catch (error) {
      console.error('Failed to fetch channels', error);
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim()) {
      alert('Please enter a channel name');
      return;
    }
    
    try {
      const response = await api.post('/chat/channels', {
        name: newChannelName,
        description: newChannelDescription,
        type: newChannelType,
      });
      console.log('Create channel response:', response);
      setNewChannelName('');
      setNewChannelDescription('');
      setNewChannelType('public');
      setShowCreateModal(false);
      fetchChannels();
    } catch (error) {
      console.error('Error creating channel:', error);
      alert('Failed to create channel. Please try again.');
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group channels by type
  const publicChannels = filteredChannels.filter(channel => channel.type === 'public');
  const privateChannels = filteredChannels.filter(channel => channel.type === 'private');

  const getChannelIcon = (channel: Channel) => {
    switch (channel.type) {
      case 'private':
        return <LockClosedIcon className="h-4 w-4 text-red-500" />;
      default:
        return <GlobeAltIcon className="h-4 w-4 text-green-500" />;
    }
  };

  const renderChannelGroup = (title: string, channels: Channel[], icon: React.ReactNode, color: string) => {
    if (channels.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-3 px-2">
          {icon}
          <h3 className={`text-sm font-semibold ${color} uppercase tracking-wide`}>
            {title}
          </h3>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
          <span className="text-xs text-gray-400">
            {channels.length}
          </span>
        </div>
        <div className="space-y-1">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="group p-3 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-white/40 dark:hover:border-gray-600/40 hover:shadow-md"
              onClick={() => onSelectChannel(channel)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
                    <HashtagIconSolid className="h-5 w-5" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                      {channel.name}
                    </h4>
                    {getChannelIcon(channel)}
                  </div>
                  {channel.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {channel.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <UsersIcon className="h-3 w-3" />
                      <span>{channel.users?.length || 0} members</span>
                    </div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <HashtagIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading channels...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <HashtagIcon className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            {error}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Please try refreshing or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/20 dark:border-gray-700/20">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredChannels.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <HashtagIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {searchQuery ? 'No channels found' : 'No channels available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {searchQuery 
                  ? `No channels match "${searchQuery}"`
                  : 'No channels have been created yet.'
                }
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200">
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Channel</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-2">
            {renderChannelGroup(
              'Public Channels',
              publicChannels,
              <GlobeAltIcon className="h-4 w-4 text-green-500" />,
              'text-green-600 dark:text-green-400'
            )}
            
            {renderChannelGroup(
              'Private Channels',
              privateChannels,
              <LockClosedIcon className="h-4 w-4 text-red-500" />,
              'text-red-600 dark:text-red-400'
            )}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <HashtagIcon className="h-3 w-3" />
            <span>{filteredChannels.length} channels available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span>Join channels</span>
          </div>
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create New Channel
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel Name
                </label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="Enter channel name"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  placeholder="Enter channel description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Channel Type
                </label>
                <select
                  value={newChannelType}
                  onChange={(e) => setNewChannelType(e.target.value as 'public' | 'private')}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="public">Public - Anyone can join</option>
                  <option value="private">Private - Invitation only</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
