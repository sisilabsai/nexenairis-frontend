'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  EyeIcon,
  PencilIcon,
  ChatBubbleBottomCenterTextIcon,
  BellIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  UsersIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline';
import {
  UserIcon as UserSolidIcon,
  BellIcon as BellSolidIcon,
} from '@heroicons/react/24/solid';

// Types for real-time collaboration
interface User {
  id: number;
  name: string;
  avatar?: string;
  color: string;
  is_online: boolean;
}

interface CollaborationEvent {
  id: string;
  type: 'deal_moved' | 'deal_edited' | 'user_viewing' | 'deal_locked' | 'comment_added' | 'deal_created';
  user: User;
  deal_id?: number;
  stage_id?: number;
  message?: string;
  timestamp: string;
  data?: any;
}

interface PipelineComment {
  id: string;
  deal_id: number;
  user: User;
  message: string;
  timestamp: string;
  is_system?: boolean;
}

interface DealLock {
  deal_id: number;
  user: User;
  locked_at: string;
  expires_at: string;
}

interface CollaborationState {
  online_users: User[];
  viewing_users: { [dealId: number]: User[] };
  recent_activities: CollaborationEvent[];
  deal_locks: DealLock[];
  comments: { [dealId: number]: PipelineComment[] };
}

class PipelineWebSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private callbacks: { [event: string]: Function[] } = {};

  constructor(private userId: number, private tenantId: number) {}

  connect() {
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:6001'}/app/pipeline?user_id=${this.userId}&tenant_id=${this.tenantId}`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('Pipeline WebSocket connected');
        this.startPing();
        this.emit('connected');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit(data.type, data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('Pipeline WebSocket disconnected');
        this.stopPing();
        this.scheduleReconnect();
        this.emit('disconnected');
      };

      this.ws.onerror = (error) => {
        console.error('Pipeline WebSocket error:', error);
        this.emit('error', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.stopPing();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startPing() {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    
    this.reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect Pipeline WebSocket...');
      this.connect();
      this.reconnectTimer = null;
    }, 5000);
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  on(event: string, callback: Function) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Pipeline-specific methods
  viewDeal(dealId: number) {
    this.send({
      type: 'view_deal',
      deal_id: dealId,
      timestamp: new Date().toISOString()
    });
  }

  stopViewingDeal(dealId: number) {
    this.send({
      type: 'stop_viewing_deal',
      deal_id: dealId,
      timestamp: new Date().toISOString()
    });
  }

  lockDeal(dealId: number) {
    this.send({
      type: 'lock_deal',
      deal_id: dealId,
      timestamp: new Date().toISOString()
    });
  }

  unlockDeal(dealId: number) {
    this.send({
      type: 'unlock_deal',
      deal_id: dealId,
      timestamp: new Date().toISOString()
    });
  }

  moveDeal(dealId: number, fromStageId: number, toStageId: number) {
    this.send({
      type: 'move_deal',
      deal_id: dealId,
      from_stage_id: fromStageId,
      to_stage_id: toStageId,
      timestamp: new Date().toISOString()
    });
  }

  addComment(dealId: number, message: string) {
    this.send({
      type: 'add_comment',
      deal_id: dealId,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

// Online Users Indicator
const OnlineUsers = ({ users }: { users: User[] }) => {
  const [showAll, setShowAll] = useState(false);
  const displayUsers = showAll ? users : users.slice(0, 5);
  const remainingCount = users.length - 5;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex -space-x-2">
        {displayUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user.name.split(' ').map(n => n[0]).join('').substring(0, 2)
              )}
            </div>
            {user.is_online && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            )}
          </motion.div>
        ))}
        {remainingCount > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAll(!showAll)}
            className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-600 text-xs font-bold"
          >
            +{remainingCount}
          </motion.button>
        )}
      </div>
      <span className="text-sm text-gray-600">
        {users.length} online
      </span>
    </div>
  );
};

// Activity Feed
const ActivityFeed = ({ 
  activities, 
  isOpen, 
  onToggle 
}: { 
  activities: CollaborationEvent[];
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'deal_moved':
        return <CheckCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'deal_edited':
        return <PencilIcon className="w-4 h-4 text-orange-500" />;
      case 'user_viewing':
        return <EyeIcon className="w-4 h-4 text-green-500" />;
      case 'deal_locked':
        return <LockClosedIcon className="w-4 h-4 text-red-500" />;
      case 'comment_added':
        return <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-purple-500" />;
      case 'deal_created':
        return <ExclamationCircleIcon className="w-4 h-4 text-indigo-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityMessage = (activity: CollaborationEvent) => {
    switch (activity.type) {
      case 'deal_moved':
        return `moved a deal to ${activity.data?.stage_name}`;
      case 'deal_edited':
        return `edited deal "${activity.data?.deal_title}"`;
      case 'user_viewing':
        return `is viewing deal "${activity.data?.deal_title}"`;
      case 'deal_locked':
        return `locked deal "${activity.data?.deal_title}"`;
      case 'comment_added':
        return `commented on deal "${activity.data?.deal_title}"`;
      case 'deal_created':
        return `created new deal "${activity.data?.deal_title}"`;
      default:
        return activity.message || 'performed an action';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow"
      >
        <BellSolidIcon className="w-5 h-5 text-indigo-600" />
        <span className="text-sm font-medium">Activity</span>
        {activities.length > 0 && (
          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
            {activities.length > 99 ? '99+' : activities.length}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {activities.length > 0 ? (
                <div className="p-2">
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: activity.user.color }}
                      >
                        {activity.user.avatar ? (
                          <img src={activity.user.avatar} alt={activity.user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          activity.user.name.split(' ').map(n => n[0]).join('').substring(0, 2)
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          {getActivityIcon(activity.type)}
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {activity.user.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {getActivityMessage(activity)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <BellIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Deal Collaboration Indicators
const DealCollaborationIndicators = ({ 
  dealId, 
  viewingUsers, 
  lock, 
  commentCount = 0 
}: { 
  dealId: number;
  viewingUsers: User[];
  lock?: DealLock;
  commentCount?: number;
}) => {
  if (viewingUsers.length === 0 && !lock && commentCount === 0) {
    return null;
  }

  return (
    <div className="absolute top-2 left-2 flex items-center space-x-1">
      {/* Viewing users */}
      {viewingUsers.length > 0 && (
        <div className="flex -space-x-1">
          {viewingUsers.slice(0, 3).map((user) => (
            <motion.div
              key={user.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <div
                className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: user.color }}
                title={`${user.name} is viewing`}
              >
                <EyeIcon className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
          {viewingUsers.length > 3 && (
            <div className="w-5 h-5 bg-gray-400 rounded-full border border-white flex items-center justify-center text-white text-xs font-bold">
              +{viewingUsers.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Lock indicator */}
      {lock && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full"
          title={`Locked by ${lock.user.name}`}
        >
          <LockClosedIcon className="w-3 h-3 text-red-600" />
          <span className="text-xs text-red-600 font-medium">{lock.user.name}</span>
        </motion.div>
      )}

      {/* Comment count */}
      {commentCount > 0 && (
        <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
          <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-purple-600" />
          <span className="text-xs text-purple-600 font-medium">{commentCount}</span>
        </div>
      )}
    </div>
  );
};

// Real-time Collaboration Hook
const useRealTimeCollaboration = (userId: number, tenantId: number) => {
  const [collaborationState, setCollaborationState] = useState<CollaborationState>({
    online_users: [],
    viewing_users: {},
    recent_activities: [],
    deal_locks: [],
    comments: {},
  });
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<PipelineWebSocket | null>(null);

  useEffect(() => {
    // Initialize WebSocket connection
    wsRef.current = new PipelineWebSocket(userId, tenantId);
    
    const ws = wsRef.current;

    // Set up event listeners
    ws.on('connected', () => {
      setIsConnected(true);
    });

    ws.on('disconnected', () => {
      setIsConnected(false);
    });

    ws.on('collaboration_state', (data: CollaborationState) => {
      setCollaborationState(data);
    });

    ws.on('user_joined', (data: { user: User }) => {
      setCollaborationState(prev => ({
        ...prev,
        online_users: [...prev.online_users.filter(u => u.id !== data.user.id), data.user]
      }));
    });

    ws.on('user_left', (data: { user_id: number }) => {
      setCollaborationState(prev => ({
        ...prev,
        online_users: prev.online_users.filter(u => u.id !== data.user_id)
      }));
    });

    ws.on('deal_viewing_updated', (data: { deal_id: number; users: User[] }) => {
      setCollaborationState(prev => ({
        ...prev,
        viewing_users: {
          ...prev.viewing_users,
          [data.deal_id]: data.users
        }
      }));
    });

    ws.on('deal_locked', (data: DealLock) => {
      setCollaborationState(prev => ({
        ...prev,
        deal_locks: [...prev.deal_locks.filter(l => l.deal_id !== data.deal_id), data]
      }));
    });

    ws.on('deal_unlocked', (data: { deal_id: number }) => {
      setCollaborationState(prev => ({
        ...prev,
        deal_locks: prev.deal_locks.filter(l => l.deal_id !== data.deal_id)
      }));
    });

    ws.on('new_activity', (data: CollaborationEvent) => {
      setCollaborationState(prev => ({
        ...prev,
        recent_activities: [data, ...prev.recent_activities.slice(0, 49)] // Keep last 50 activities
      }));
    });

    ws.on('comment_added', (data: { deal_id: number; comment: PipelineComment }) => {
      setCollaborationState(prev => ({
        ...prev,
        comments: {
          ...prev.comments,
          [data.deal_id]: [...(prev.comments[data.deal_id] || []), data.comment]
        }
      }));
    });

    // Connect
    ws.connect();

    // Cleanup
    return () => {
      ws.disconnect();
    };
  }, [userId, tenantId]);

  const viewDeal = useCallback((dealId: number) => {
    wsRef.current?.viewDeal(dealId);
  }, []);

  const stopViewingDeal = useCallback((dealId: number) => {
    wsRef.current?.stopViewingDeal(dealId);
  }, []);

  const lockDeal = useCallback((dealId: number) => {
    wsRef.current?.lockDeal(dealId);
  }, []);

  const unlockDeal = useCallback((dealId: number) => {
    wsRef.current?.unlockDeal(dealId);
  }, []);

  const moveDeal = useCallback((dealId: number, fromStageId: number, toStageId: number) => {
    wsRef.current?.moveDeal(dealId, fromStageId, toStageId);
  }, []);

  const addComment = useCallback((dealId: number, message: string) => {
    wsRef.current?.addComment(dealId, message);
  }, []);

  return {
    collaborationState,
    isConnected,
    viewDeal,
    stopViewingDeal,
    lockDeal,
    unlockDeal,
    moveDeal,
    addComment,
  };
};

export {
  OnlineUsers,
  ActivityFeed,
  DealCollaborationIndicators,
  useRealTimeCollaboration,
  PipelineWebSocket,
};

export type {
  User,
  CollaborationEvent,
  PipelineComment,
  DealLock,
  CollaborationState,
};