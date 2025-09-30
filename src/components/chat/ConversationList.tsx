"use client";

import { useConversations, useAuth } from '@/hooks/useApi';
import { Conversation, User } from '@/types';
import { useState, useEffect } from 'react';
import { 
  ClockIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

interface ConversationListProps {
  onSelectConversation: (conversation: Conversation) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { me } = useAuth();
  const user = me.data?.data?.user;
  const [page, setPage] = useState(1);
  const { data: conversationsResponse, isLoading, isError } = useConversations(page);

  const conversations = conversationsResponse?.data?.data || [];
  const hasMore = conversationsResponse?.data?.next_page_url !== null;

  useEffect(() => {
    console.log('conversationsResponse', conversationsResponse);
  }, [conversationsResponse]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const getOtherUser = (conversation: Conversation) => {
    if (!conversation.users || !Array.isArray(conversation.users) || conversation.users.length === 0) {
      return null;
    }
    return conversation.users.find(u => u?.id !== user?.id) || conversation.users[0] || null;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center max-w-sm">
          <ChatBubbleLeftIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No conversations yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Start a new conversation by selecting "New Chat" to connect with your colleagues.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent" onScroll={handleScroll}>
        <div className="space-y-1 p-2">
          {Array.isArray(conversations) && conversations.map((conversation: Conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.messages?.[0];
            const hasUnread = conversation.unread_messages_count && conversation.unread_messages_count > 0;
            
            // Skip conversations with invalid structure
            if (!conversation.id) {
              return null;
            }
            
            return (
              <div
                key={conversation.id}
                className="group p-4 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-white/40 dark:hover:border-gray-600/40 hover:shadow-md"
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar with Status */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={otherUser?.profile_photo_path || `https://i.pravatar.cc/150?u=${otherUser?.id || 'default'}`}
                      alt={otherUser?.name || 'Unknown User'}
                      className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-700"
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`text-sm font-semibold truncate ${hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {conversation.name || otherUser?.name || 'Unknown User'}
                      </h3>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {lastMessage && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(lastMessage.created_at)}
                          </span>
                        )}
                        {(conversation.users?.length || 0) > 2 && (
                          <UserGroupIcon className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {lastMessage && (
                          <>
                            {lastMessage.user?.id === user?.id && (
                              <div className="flex-shrink-0">
                                {lastMessage.read_at ? (
                                  <CheckCircleIconSolid className="h-3 w-3 text-blue-500" />
                                ) : (
                                  <CheckCircleIcon className="h-3 w-3 text-gray-400" />
                                )}
                              </div>
                            )}
                            <p className={`text-xs truncate ${hasUnread ? 'font-medium text-gray-800 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                              {lastMessage.type === 'voice_note' ? '🎤 Voice message' : 
                               lastMessage.content || 'Media attachment'}
                            </p>
                          </>
                        )}
                        {!lastMessage && (
                          <p className="text-xs text-gray-400 italic">No messages yet</p>
                        )}
                      </div>

                      {/* Unread Badge */}
                      {hasUnread && (
                        <div className="flex-shrink-0">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                            {(conversation.unread_messages_count || 0) > 9 ? '9+' : conversation.unread_messages_count}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2 flex justify-end space-x-2">
                  <button className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <ClockIcon className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          }).filter(Boolean)}
        </div>
        
        {isLoading && conversations.length > 0 && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
