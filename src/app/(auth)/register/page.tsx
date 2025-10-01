'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, UserPlusIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import Loader from '@/components/ui/loader';

interface Tenant {
  id: number;
  name: string;
  domain: string;
}

interface Industry {
  id: number;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [registrationMode, setRegistrationMode] = useState<'new' | 'existing'>('new');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    position: '',
    department: '',
    company_name: '',
    company_email: '',
    company_phone: '',
    company_address: '',
    tax_id: '',
    tenant_id: '',
    industry_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(true);

  useEffect(() => {
    const fetchIndustries = async () => {
      try {
        // Use NEXT_PUBLIC_API_URL for absolute API path
        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'https://api.nexenairis.com/api';
        const response = await fetch(`${apiBase}/industries`, {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setIndustries(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch industries:', error);
      }
    };
    fetchIndustries();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long';
    if (formData.password !== formData.password_confirmation) newErrors.password_confirmation = 'Passwords do not match';

    if (registrationMode === 'new') {
      if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
      if (!formData.company_email) newErrors.company_email = 'Company email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.company_email)) newErrors.company_email = 'Please enter a valid company email';
      if (!formData.industry_id) newErrors.industry_id = 'Please select an industry';
    } else {
      if (!formData.tenant_id) newErrors.tenant_id = 'Please select a company';
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
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.phone,
        position: formData.position,
        department: formData.department,
        ...(registrationMode === 'new' ? {
          company_name: formData.company_name,
          company_email: formData.company_email,
          company_phone: formData.company_phone,
          company_address: formData.company_address,
          tax_id: formData.tax_id,
          industry_id: parseInt(formData.industry_id),
        } : {
          tenant_id: parseInt(formData.tenant_id),
        })
      };

      const success = await register(registrationData);
      if (success) {
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setErrors({ general: 'Registration failed. Please try again.' });
      }
    } catch (error: any) {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors) {
        setErrors(Object.entries(serverErrors).reduce((acc, [key, value]) => {
          acc[key] = Array.isArray(value) ? value[0] : value;
          return acc;
        }, {} as Record<string, string>));
      } else {
        setErrors({ general: error.response?.data?.message || 'An unexpected error occurred.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isSuccess && (
        <Loader 
          logoUrl="https://res.cloudinary.com/dc0uiujvn/image/upload/v1757190921/SINGO_logo_vpsb3e.png" 
          message="Registration Successful! Redirecting..." 
        />
      )}
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join NEXEN AIRIS to revolutionize your business.
          </p>
        </div>

        <div className="mb-6 flex justify-center">
          <div className="flex rounded-full bg-gray-200 p-1 shadow-inner">
            <button
              onClick={() => setRegistrationMode('new')}
              className={`px-6 py-2 text-sm font-semibold rounded-full flex items-center transition-all duration-300 ${
                registrationMode === 'new' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-600'
              }`}
            >
              <BuildingOffice2Icon className="h-5 w-5 mr-2" />
              New Company
            </button>
            <button
              onClick={() => setRegistrationMode('existing')}
              className={`px-6 py-2 text-sm font-semibold rounded-full flex items-center transition-all duration-300 ${
                registrationMode === 'existing' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-600'
              }`}
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Existing Company
            </button>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow-md">
              <p>{errors.general}</p>
            </div>
          )}

          {/* Render form based on mode */}
          {registrationMode === 'new' ? (
            <NewCompanyFields formData={formData} handleInputChange={handleInputChange} errors={errors} industries={industries} />
          ) : (
            <ExistingCompanyFields formData={formData} handleInputChange={handleInputChange} errors={errors} tenants={tenants} />
          )}

          <PersonalInformationFields formData={formData} handleInputChange={handleInputChange} errors={errors} />
          <AccountSecurityFields formData={formData} handleInputChange={handleInputChange} errors={errors} showPassword={showPassword} setShowPassword={setShowPassword} showConfirmPassword={showConfirmPassword} setShowConfirmPassword={setShowConfirmPassword} />

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRightIcon className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}

// Helper components for form fields
const FormField = ({ id, name, label, type = 'text', value, onChange, error, placeholder, required = false, children }: any) => (
  <div className="relative">
    <label htmlFor={id} className="sr-only">{label}</label>
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full px-4 py-3 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
      placeholder={placeholder}
    />
    {children}
    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

const NewCompanyFields = ({ formData, handleInputChange, errors, industries }: any) => (
  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
    <h3 className="font-semibold text-gray-800">Company Information</h3>
    <FormField id="company_name" name="company_name" label="Company Name" value={formData.company_name} onChange={handleInputChange} error={errors.company_name} placeholder="Company Name *" required />
    <FormField id="company_email" name="company_email" label="Company Email" type="email" value={formData.company_email} onChange={handleInputChange} error={errors.company_email} placeholder="Company Email *" required />
    <div className="relative">
      <select
        id="industry_id"
        name="industry_id"
        value={formData.industry_id}
        onChange={handleInputChange}
        required
        className={`w-full px-4 py-3 border ${errors.industry_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
      >
        <option value="">Select an industry</option>
        {industries.map((industry: Industry) => (
          <option key={industry.id} value={industry.id}>{industry.name}</option>
        ))}
      </select>
      {errors.industry_id && <p className="mt-1 text-xs text-red-600">{errors.industry_id}</p>}
    </div>
    <FormField id="company_phone" name="company_phone" label="Company Phone" type="tel" value={formData.company_phone} onChange={handleInputChange} error={errors.company_phone} placeholder="Company Phone" />
    <FormField id="company_address" name="company_address" label="Company Address" value={formData.company_address} onChange={handleInputChange} error={errors.company_address} placeholder="Company Address" />
    <FormField id="tax_id" name="tax_id" label="Tax ID" value={formData.tax_id} onChange={handleInputChange} error={errors.tax_id} placeholder="Tax ID (Optional)" />
  </div>
);

const ExistingCompanyFields = ({ formData, handleInputChange, errors, tenants }: any) => (
  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
    <h3 className="font-semibold text-gray-800">Select Your Company</h3>
    <div className="relative">
      <select
        id="tenant_id"
        name="tenant_id"
        value={formData.tenant_id}
        onChange={handleInputChange}
        required
        className={`w-full px-4 py-3 border ${errors.tenant_id ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
      >
        <option value="">Select a company</option>
        {tenants.map((tenant: Tenant) => (
          <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
        ))}
      </select>
      {errors.tenant_id && <p className="mt-1 text-xs text-red-600">{errors.tenant_id}</p>}
    </div>
  </div>
);

const PersonalInformationFields = ({ formData, handleInputChange, errors }: any) => (
  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
    <h3 className="font-semibold text-gray-800">Personal Information</h3>
    <FormField id="name" name="name" label="Full Name" value={formData.name} onChange={handleInputChange} error={errors.name} placeholder="Full Name *" required />
    <FormField id="email" name="email" label="Email Address" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} placeholder="Your Email *" required />
    <FormField id="phone" name="phone" label="Phone Number" type="tel" value={formData.phone} onChange={handleInputChange} error={errors.phone} placeholder="Phone Number" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label htmlFor="position" className="sr-only">Position</label>
        <select
          id="position"
          name="position"
          value={formData.position}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border ${errors.position ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
        >
          <option value="">Select a position</option>
          <option value="CEO">CEO</option>
          <option value="CTO">CTO</option>
          <option value="CFO">CFO</option>
          <option value="COO">COO</option>
          <option value="Director">Director</option>
          <option value="Manager">Manager</option>
        </select>
        {errors.position && <p className="mt-1 text-xs text-red-600">{errors.position}</p>}
      </div>
      <div>
        <label htmlFor="department" className="sr-only">Department</label>
        <select
          id="department"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border ${errors.department ? 'border-red-500' : 'border-gray-300'} rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
        >
          <option value="">Select a department</option>
          <option value="Executive">Executive</option>
          <option value="Finance">Finance</option>
          <option value="Human Resources">Human Resources</option>
          <option value="IT">IT</option>
          <option value="Marketing">Marketing</option>
          <option value="Operations">Operations</option>
          <option value="Sales">Sales</option>
        </select>
        {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
      </div>
    </div>
  </div>
);

const AccountSecurityFields = ({ formData, handleInputChange, errors, showPassword, setShowPassword, showConfirmPassword, setShowConfirmPassword }: any) => (
  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
    <h3 className="font-semibold text-gray-800">Account Security</h3>
    <FormField id="password" name="password" label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} error={errors.password} placeholder="Password *" required>
      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </FormField>
    <FormField id="password_confirmation" name="password_confirmation" label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={formData.password_confirmation} onChange={handleInputChange} error={errors.password_confirmation} placeholder="Confirm Password *" required>
      <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
        {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </FormField>
  </div>
);
