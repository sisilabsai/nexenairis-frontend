'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/ui/loader';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.';
      setErrors({ general: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const lastError = localStorage.getItem('login_error');
    if (lastError) {
      setErrors((prev) => ({ ...prev, general: lastError }));
      localStorage.removeItem('login_error');
    }
  }, []);

  return (
    <>
      {isSuccess && (
        <Loader 
          logoUrl="https://res.cloudinary.com/dc0uiujvn/image/upload/v1757896917/logo_g2mak4.png" 
          message="Login Successful! Redirecting..." 
        />
      )}
      <div className="w-full max-w-md mx-auto px-4 sm:px-6">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900">
            Welcome Back!
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-gray-600">
            Sign in to continue to NEXEN AIRIS
          </p>
        </div>

        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 sm:p-4 rounded-md shadow-md">
              <p className="text-sm">{errors.general}</p>
            </div>
          )}

          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-3 sm:py-3 text-sm sm:text-base border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
              placeholder="Email address"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">{errors.email}</p>
            )}
          </div>

          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-3 sm:px-4 py-3 sm:py-3 pr-10 sm:pr-12 text-sm sm:text-base border ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
              placeholder="Password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 touch-manipulation"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
            </button>
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">{errors.password}</p>
            )}
          </div>

          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded touch-manipulation"
              />
              <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                Remember me
              </label>
            </div>
            <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 text-center sm:text-left">
              Forgot your password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 sm:py-3 px-4 border border-transparent text-sm sm:text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105 touch-manipulation min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRightIcon className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline touch-manipulation">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
