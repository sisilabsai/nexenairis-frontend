"use client";

import { useState, useEffect } from 'react';
import { 
  BellIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid';

interface Notification {
  id: number;
  type: 'message' | 'mention' | 'channel' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  avatar?: string;
  conversationId?: number;
  channelId?: number;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: 'message',
      title: 'New message from John Doe',
      message: 'Hey, can we discuss the project timeline?',
      timestamp: '2 minutes ago',
      read: false,
      avatar: 'https://i.pravatar.cc/150?u=1',
      conversationId: 1
    },
    {
      id: 2,
      type: 'mention',
      title: 'You were mentioned in #general',
      message: '@you Please review the latest updates',
      timestamp: '5 minutes ago',
      read: false,
      channelId: 1
    },
    {
      id: 3,
      type: 'channel',
      title: 'New channel created',
      message: '#marketing channel has been created',
      timestamp: '1 hour ago',
      read: true,
      channelId: 2
    },
    {
      id: 4,
      type: 'system',
      title: 'System Update',
      message: 'Chat system has been updated with new features',
      timestamp: '2 hours ago',
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500" />;
      case 'mention':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'channel':
        return <UserGroupIcon className="h-5 w-5 text-purple-500" />;
      case 'system':
        return <InformationCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div className="fixed right-4 top-20 w-96 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/20 z-50 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <BellIconSolid className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              {unreadCount > 0 && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-48">
              <div className="text-center">
                <BellIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No notifications</p>
              </div>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`group p-4 rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-4 mb-2 ${
                    notification.read
                      ? 'border-gray-200 dark:border-gray-600 opacity-70'
                      : 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon/Avatar */}
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <img
                          src={notification.avatar}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className={`text-sm font-medium truncate ${
                          notification.read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-red-500 transition-all duration-200"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">
                          {notification.timestamp}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{notifications.length} total notifications</span>
            <div className="flex items-center space-x-1">
              <CheckCircleIcon className="h-3 w-3" />
              <span>Auto-refresh enabled</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}