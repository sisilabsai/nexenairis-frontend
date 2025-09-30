'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract token from URL
  const token = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('token') 
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid reset token');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords don't match");
      return;
    }

    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password has been reset successfully.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="text-center text-red-600">
            Invalid or missing reset token. Please request a new password reset link.
          </div>
          <div className="mt-4 text-center">
            <Link href="/forgot-password" className="text-indigo-600 hover:text-indigo-500">
              Go back to forgot password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  placeholder="New password"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="password_confirmation" className="sr-only">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                  placeholder="Confirm new password"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600">
                {success}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}