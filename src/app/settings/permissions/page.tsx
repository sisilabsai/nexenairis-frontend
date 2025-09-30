'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAccessApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@/types';
import { ShieldCheckIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Input } from '@/components/ui/input';


const PermissionsPage = () => {
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const { data, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['userAccessControl'],
    queryFn: userAccessApi.getAccessControl,
  });

  const users = data?.data as User[] | undefined;
  const modules = useMemo(() => {
    if ((data as any)?.modules) {
      const serverModules: string[] = (data as any).modules || [];
      // Ensure we include newly added modules like 'assets' and 'settings'
      const required = ['assets', 'settings'];
      for (const r of required) {
        if (!serverModules.includes(r)) serverModules.push(r);
      }
      return serverModules.map((module: string) => ({ id: module, name: module }));
    }
    return [];
  }, [data]);

  const updateUserModulesMutation = useMutation({
    mutationFn: (data: { userId: number; modules: string[] }) =>
      userAccessApi.updateUserModules(data.userId, data.modules),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAccessControl'] });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    },
  });

  const handleModuleChange = (module: string, checked: boolean) => {
    if (selectedUser) {
      const currentModules = selectedUser.modules || [];
      const newModules = checked
        ? [...currentModules, module]
        : currentModules.filter(m => m !== module);
      setSelectedUser({ ...selectedUser, modules: newModules });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (selectedUser) {
      const newModules = checked ? modules.map((m: { id: any; }) => String(m.id)) : [];
      setSelectedUser({ ...selectedUser, modules: newModules });
    }
  };

  const handleSave = () => {
    if (selectedUser) {
      updateUserModulesMutation.mutate({
        userId: selectedUser.id,
        modules: selectedUser.modules || [],
      });
    }
  };

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  if (isLoadingUsers) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h3 className="text-gray-700 text-3xl font-medium">User Access Control</h3>
      <div className="mt-8">
        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="md:col-span-1 border-r">
                <div className="p-4">
                  <Input
                    placeholder="Search employees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <ul className="divide-y">
                  {filteredUsers.map(user => (
                    <li
                      key={user.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? 'bg-blue-100' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center">
                        <UserCircleIcon className="h-8 w-8 text-gray-500" />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="md:col-span-2 p-6">
                {selectedUser ? (
                  <div>
                    <h4 className="text-xl font-semibold text-gray-800">
                      Permissions for {selectedUser.name}
                    </h4>
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center">
                          <Checkbox
                            onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                            checked={selectedUser.modules?.length === modules.length}
                          />
                          <span className="ml-2 text-sm font-medium">Select All</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {modules.map((module: { id: React.Key | null | undefined; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                          <div key={module.id} className="flex items-center p-3 bg-gray-50 rounded-md">
                            <Checkbox
                              id={`module-${module.id}`}
                              checked={selectedUser.modules?.includes(String(module.id))}
                              onCheckedChange={(checked: boolean) => handleModuleChange(String(module.id), checked)}
                            />
                            <label htmlFor={`module-${module.id}`} className="ml-3 text-sm text-gray-700">{module.name}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-8 flex justify-end items-center">
                      {showSuccess && (
                        <div className="text-green-600 mr-4">
                          Permissions updated successfully!
                        </div>
                      )}
                      <Button onClick={handleSave}>Save Changes</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShieldCheckIcon className="h-16 w-16 text-gray-400" />
                    <h4 className="mt-4 text-lg font-semibold text-gray-700">Select an employee</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Choose an employee from the list to manage their module access.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PermissionsPage;
