"use client";

import { useUsers, useAuth } from '@/hooks/useApi';
import { User } from '@/types';
import { 
  UserIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  UserPlusIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';

interface UserListProps {
  onSelectUser: (user: User) => void;
}

export function UserList({ onSelectUser }: UserListProps) {
  const { data: usersResponse, isLoading, isError } = useUsers();
  const { me } = useAuth();
  const currentUser = me.data?.data?.user;
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading colleagues...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">
            Failed to load users
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Please try again later or contact support.
          </p>
        </div>
      </div>
    );
  }

  const users = Array.isArray(usersResponse?.data) ? usersResponse.data : [];
  const filteredUsers = users.filter((user: User) => 
    user.id !== currentUser?.id && // Exclude current user
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group users by department
  const usersByDepartment = filteredUsers.reduce((acc: { [key: string]: User[] }, user: User) => {
    const department = user.department?.name || 'No Department';
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(user);
    return acc;
  }, {});

  return (
    <div className="h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/20 dark:border-gray-700/20">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search colleagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <div className="text-center">
              <UserPlusIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                {searchQuery ? 'No users found' : 'No colleagues available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {searchQuery 
                  ? `Try adjusting your search for "${searchQuery}"`
                  : 'No other users are currently available to chat with.'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="p-2">
            {Object.entries(usersByDepartment).map(([department, departmentUsers]) => (
              <div key={department} className="mb-6">
                {/* Department Header */}
                <div className="flex items-center space-x-2 mb-3 px-2">
                  <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                    {department}
                  </h3>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-gray-600"></div>
                  <span className="text-xs text-gray-400">
                    {(departmentUsers as User[]).length}
                  </span>
                </div>

                {/* Users in Department */}
                <div className="space-y-1">
                  {(departmentUsers as User[]).map((user: User) => (
                    <div
                      key={user.id}
                      className="group p-3 hover:bg-white/60 dark:hover:bg-gray-700/60 rounded-xl cursor-pointer transition-all duration-200 border border-transparent hover:border-white/40 dark:hover:border-gray-600/40 hover:shadow-md"
                      onClick={() => onSelectUser(user)}
                    >
                      <div className="flex items-center space-x-3">
                        {/* Avatar with Status */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={user.profile_photo_path || `https://i.pravatar.cc/150?u=${user.id}`}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-700"
                          />
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {user.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {typeof user.position === 'object' && user.position !== null ? user.position.name : (user.position || 'Team Member')}
                          </p>
                        </div>

                        {/* Chat Icon */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                            <ChatBubbleLeftRightIcon className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-gray-50/50 to-white/50 dark:from-gray-800/50 dark:to-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <UserIcon className="h-3 w-3" />
            <span>{filteredUsers.length} colleagues available</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Start chatting</span>
          </div>
        </div>
      </div>
    </div>
  );
}
