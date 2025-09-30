'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { employeeSupportApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Task } from '@/types';

const EmployeeSupportPage = () => {
  const { data: user, isLoading: isLoadingUser } = useQuery({ queryKey: ['employeeDetails'], queryFn: async () => (await employeeSupportApi.getEmployeeDetails()).data as User });
  const { data: tasks, isLoading: isLoadingTasks } = useQuery({ queryKey: ['employeeTasks'], queryFn: async () => (await employeeSupportApi.getTasks()).data as Task[] });

  if (isLoadingUser || isLoadingTasks) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employee Support</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>My Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Department:</strong> {user?.department?.name}</p>
            <p><strong>Position:</strong> {user?.position?.name}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Hire Date:</strong> {user?.hire_date}</p>
            <p><strong>Salary:</strong> {user?.salary}</p>
            <p><strong>Contract:</strong> {user?.employeeContracts?.[0]?.contract_type}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle>My Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              {tasks?.map(task => (
                <li key={task.id}>{task.name}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeSupportPage;
