'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { profileApi } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PayslipHistory from '@/components/PayslipHistory';
import NotificationModal from '@/components/NotificationModal';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: 'success' | 'error';
  }>({
    isOpen: false,
    title: '',
    description: '',
    variant: 'success',
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response: any = await profileApi.getActivities();
        if (response.success) {
          setActivities(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    };

    fetchActivities();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setNotification({
        isOpen: true,
        title: 'Error',
        description: "New passwords don't match.",
        variant: 'error',
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await profileApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });
      if (response.success) {
        setNotification({
          isOpen: true,
          title: 'Success',
          description: 'Password changed successfully.',
          variant: 'success',
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setNotification({
          isOpen: true,
          title: 'Error',
          description: response.message || 'Failed to change password.',
          variant: 'error',
        });
      }
    } catch (error: any) {
      setNotification({
        isOpen: true,
        title: 'Error',
        description: error.message || 'An error occurred while changing password.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        description={notification.description}
        variant={notification.variant}
      />
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Hello {name},</h1>
        <p className="text-gray-600">Welcome to your profile. Please report to an admin in the chat page in case any information doesn't seem right or you want to make any updates.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                <Input id="name" type="text" value={user.name} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <Input id="email" type="email" value={user.email} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <Input id="phone" type="text" value={user.phone || 'N/A'} disabled className="mt-1" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea id="bio" value={user.bio || 'N/A'} disabled className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-100" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Employment Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">Employee ID</label>
                <Input id="employee_id" type="text" value={user.employee_id || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <Input id="department" type="text" value={(user.department as any)?.name || user.department || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                <Input id="position" type="text" value={(user.position as any)?.name || user.position || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">Hire Date</label>
                <Input id="hire_date" type="text" value={user.hire_date || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry</label>
                <Input id="industry" type="text" value={user.tenant?.industry?.name || 'N/A'} disabled className="mt-1" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary</label>
                <Input id="salary" type="text" value={user.salary ? `UGX ${user.salary}` : 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700">Payment Method</label>
                <Input id="payment_method" type="text" value={user.payment_method || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">Bank Name</label>
                <Input id="bank_name" type="text" value={user.bank_name || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700">Bank Account</label>
                <Input id="bank_account" type="text" value={user.bank_account || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="mobile_money_provider" className="block text-sm font-medium text-gray-700">Mobile Money Provider</label>
                <Input id="mobile_money_provider" type="text" value={user.mobile_money_provider || 'N/A'} disabled className="mt-1" />
              </div>
              <div>
                <label htmlFor="mobile_money_number" className="block text-sm font-medium text-gray-700">Mobile Money Number</label>
                <Input id="mobile_money_number" type="text" value={user.mobile_money_number || 'N/A'} disabled className="mt-1" />
              </div>
            </CardContent>
          </Card>
          <PayslipHistory />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                  <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                  <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1" />
                </div>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {activities.map((activity) => (
                  <li key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.activity_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">{new Date(activity.created_at).toLocaleString()}</p>
                      <p className="text-sm text-gray-500">{activity.ip_address}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
