'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog } from '@headlessui/react';
import { UserIcon } from '@heroicons/react/24/outline';
import { User } from '@/types';

interface UserSelectorProps {
  selectedUserId?: number | null;
  selectedUserName?: string | null;
  onUserSelect: (user: User | null) => void;
}

export function UserSelector({ selectedUserId, selectedUserName, onUserSelect }: UserSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['employees', searchQuery],
    queryFn: async () => {
      try {
        const response = await api.get<User[]>('/hr/employees');
        const employees = response.data ?? [];
        console.log('Raw API Response:', response);
        console.log('Employees data:', employees);
        console.log('Found employees:', employees.length);
        
        return employees;
      } catch (error) {
        console.error('Error fetching employees:', error);
        return [];
      }
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  console.log('Users in state:', users);

  console.log('Users before filtering:', users);
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = !searchQuery || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());
    console.log('Filtering user:', user.name, 'matches:', matchesSearch);
    return matchesSearch;
  });
  console.log('Filtered users:', filteredUsers);

  return (
    <>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => setIsOpen(true)}
        >
          {selectedUserName ? (
            <span>{selectedUserName}</span>
          ) : (
            <span className="text-gray-500">Select contact person...</span>
          )}
        </Button>
        {selectedUserId && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onUserSelect(null)}
          >
            ×
          </Button>
        )}
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6 w-full">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              Select Contact Person
            </Dialog.Title>
            
            <div className="mt-4">
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4"
              />

              {isLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : (
                <div className="max-h-80 overflow-auto">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      {isLoading ? 'Loading users...' : (
                        <>
                          No users found
                          {searchQuery && <div className="text-sm">No matches for "{searchQuery}"</div>}
                          <div className="text-xs mt-1">Total users: {users.length}</div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map((user: User) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            onUserSelect(user);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2"
                        >
                          <UserIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div>{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}