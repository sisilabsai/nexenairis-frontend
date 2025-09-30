'use client';

import { useState, useEffect } from 'react';
import {
  CogIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  KeyIcon,
  CheckIcon,
  DocumentTextIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';
import { useTenantSettings, useUpdateSystemSettings, useAuth, useUpdateUserProfile, useNotificationSettings, useUpdateNotificationSettings, useSecuritySettings, useUpdateSecuritySettings, useChangePassword, useBillingDetails, useUpdateBillingDetails, useUpdateTenantSettings } from '../../hooks/useApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import ProtectedRoute from '../../components/ProtectedRoute';
import toast from 'react-hot-toast';
import { countries, currencies, languages } from '../../lib/localization';
import SampleInvoiceModal from '../../components/SampleInvoiceModal';
import SampleReceiptModal from '../../components/SampleReceiptModal';
import TenantSettings from '../../components/TenantSettings';

export default function SettingsPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const BASE_URL = API_URL.replace('/api', '');
  const [activeTab, setActiveTab] = useState('profile');
  const { data: tenantSettingsData, isLoading: tenantSettingsLoading, error: tenantSettingsError, refetch: refetchTenantSettings } = useTenantSettings();
  const updateSettingsMutation = useUpdateSystemSettings();
  const { me } = useAuth();
  const updateUserProfileMutation = useUpdateUserProfile();
  const { data: notificationSettingsData, isLoading: notificationSettingsLoading } = useNotificationSettings();
  const updateNotificationSettingsMutation = useUpdateNotificationSettings();
  const { data: securitySettingsData, isLoading: securitySettingsLoading } = useSecuritySettings();
  const updateSecuritySettingsMutation = useUpdateSecuritySettings();
  const changePasswordMutation = useChangePassword();
  const { data: billingDetailsData, isLoading: billingDetailsLoading } = useBillingDetails();
  const updateBillingDetailsMutation = useUpdateBillingDetails();
  const updateTenantSettingsMutation = useUpdateTenantSettings();

  const billingDetails = billingDetailsData?.data as any;

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });

  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});

  const [billingData, setBillingData] = useState({
    card_holder_name: '',
    card_number: '',
    expiry_date: '',
    cvv: '',
    billing_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
  });

  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    company_name: '',
    position: '',
    address: '',
    logo: '',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [activeInvoiceTemplate, setActiveInvoiceTemplate] = useState('Modern');
  const [invoiceCustomization, setInvoiceCustomization] = useState({
    showHeader: true,
    showFooter: true,
    showLogo: true,
    accentColor: '#4f46e5',
    contactEmail: '',
    contactPhone: '',
    customCSS: '',
  });
  const [isSampleInvoiceModalOpen, setIsSampleInvoiceModalOpen] = useState(false);
  const [isSampleReceiptModalOpen, setIsSampleReceiptModalOpen] = useState(false);

  const [domainPrefix, setDomainPrefix] = useState('');

  const [taxSettings, setTaxSettings] = useState({
    defaultRate: 18, // Default tax rate in percentage
    taxablePaymentMethods: ['card', 'mobile_money', 'bank_transfer'],
  });

  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'cash', name: 'Cash' },
    { id: 'card', name: 'Card' },
    { id: 'mobile_money', name: 'Mobile Money' },
    { id: 'bank_transfer', name: 'Bank Transfer' },
  ]);

  const [activeReceiptTemplate, setActiveReceiptTemplate] = useState('Modern');
  const [receiptCustomization, setReceiptCustomization] = useState({
    showHeader: true,
    showFooter: true,
    showLogo: true,
    accentColor: '#4f46e5',
    contactEmail: '',
    contactPhone: '',
    customCSS: '',
  });

  const handleInvoiceCustomizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setInvoiceCustomization(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleReceiptCustomizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setReceiptCustomization(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleBillingInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBillingData(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (tenantSettingsData && me.data?.data?.user) {
      const tenant = tenantSettingsData as any;
      const user = me.data.data.user;
      setProfileData({
        first_name: user.name?.split(' ')[0] || '',
        last_name: user.name?.split(' ')[1] || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || 'Software engineer with 5+ years of experience in web development.',
        company_name: tenant.name || 'NEXEN AIRIS Solutions',
        position: user.position || 'Software Engineer',
        address: tenant.address || 'Kampala, Uganda',
        logo: tenant.logo_url || tenant.logo || '',
      });

      if (tenant.logo_url) {
        setLogoPreview(tenant.logo_url);
      }

      if (tenant.settings?.invoice) {
        setActiveInvoiceTemplate(tenant.settings.invoice.template || 'Modern');
        setInvoiceCustomization(tenant.settings.invoice.customization || {
          showHeader: true,
          showFooter: true,
          showLogo: true,
          accentColor: '#4f46e5',
          contactEmail: '',
          contactPhone: '',
        });
      }

      if (tenant.settings?.tax) {
        setTaxSettings(tenant.settings.tax);
      }
      if (tenant.domain) {
        const prefix = tenant.domain.split('.')[0];
        setDomainPrefix(prefix);
      }
    }
  }, [tenantSettingsData, me.data]);

  useEffect(() => {
    if (billingDetails) {
      setBillingData(billingDetails);
    }
  }, [billingDetails]);

  const systemSettings = (tenantSettingsData as any)?.settings?.system || [];

  const [localizationData, setLocalizationData] = useState({
    country: '',
    currency: '',
    language: '',
  });

  useEffect(() => {
    // Fetch the user's country based on their IP address
    fetch('/api/system/location')
      .then((response) => response.json())
      .then((data) => {
        const country = countries.find((c) => c.code === data.country_code);
        if (country) {
          setLocalizationData((prev) => ({
            ...prev,
            country: country.name,
            currency: country.currency,
            language: country.languages[0],
          }));
        }
      });
  }, []);

  useEffect(() => {
    const data = tenantSettingsData as any;
    if (data?.settings) {
      const settings = data.settings;
      setLocalizationData({
        country: settings.country || '',
        currency: settings.currency || '',
        language: settings.language || '',
      });
    }
  }, [tenantSettingsData]);

  const [notifications, setNotifications] = useState({
    email_notifications: true,
    push_notifications: false,
    monthly_newsletter: true,
  });

  useEffect(() => {
    if (notificationSettingsData?.data) {
      const data = notificationSettingsData.data as { email_notifications: boolean, push_notifications: boolean, monthly_newsletter: boolean };
      setNotifications({
        email_notifications: data.email_notifications,
        push_notifications: data.push_notifications,
        monthly_newsletter: data.monthly_newsletter,
      });
    }
  }, [notificationSettingsData]);

  const [security, setSecurity] = useState({
    two_factor_authentication: false,
    login_alerts: false,
  });

  useEffect(() => {
    if (securitySettingsData?.data) {
      const data = securitySettingsData.data as { two_factor_authentication: boolean, login_alerts: boolean };
      setSecurity({
        two_factor_authentication: data.two_factor_authentication,
        login_alerts: data.login_alerts,
      });
    }
  }, [securitySettingsData]);

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSecurityToggle = (key: keyof typeof security) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileData(prev => ({ ...prev, logo: file as any }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdatePassword = () => {
    setPasswordErrors({});
    changePasswordMutation.mutate(passwordData, {
      onError: (error: any) => {
        if (error.response && error.response.data && error.response.data.errors) {
          setPasswordErrors(error.response.data.errors);
        } else {
          toast.error(error.response?.data?.message || 'An unexpected error occurred.');
        }
      },
    });
  };

  const handleSaveSettings = () => {
    if (activeTab === 'profile') {
      const formData = new FormData();
      formData.append('company_name', profileData.company_name);
      formData.append('company_address', profileData.address);
      if (profileData.logo && typeof profileData.logo === 'object') {
        formData.append('logo', profileData.logo as any);
      }
  
      if (domainPrefix) {
        formData.append('domain', `${domainPrefix}.nexenairis.com`);
      }
  
      updateTenantSettingsMutation.mutate(formData);

      updateUserProfileMutation.mutate({
        name: `${profileData.first_name} ${profileData.last_name}`,
        email: profileData.email,
        phone: profileData.phone,
        bio: profileData.bio,
      });
    } else if (activeTab === 'invoice-templates') {
      const formData = new FormData();
      formData.append('invoice_template', activeInvoiceTemplate);
      formData.append('invoice_customization', JSON.stringify(invoiceCustomization));
      updateTenantSettingsMutation.mutate(formData);
    } else if (activeTab === 'receipt-templates') {
      const formData = new FormData();
      formData.append('receipt_template', activeReceiptTemplate);
      formData.append('receipt_customization', JSON.stringify(receiptCustomization));
      updateTenantSettingsMutation.mutate(formData);
    } else if (activeTab === 'tax-payments') {
      const formData = new FormData();
      formData.append('tax_settings', JSON.stringify(taxSettings));
      updateTenantSettingsMutation.mutate(formData);
    } else if (activeTab === 'notifications') {
      updateNotificationSettingsMutation.mutate(notifications);
    } else if (activeTab === 'security') {
      updateSecuritySettingsMutation.mutate(security);
    } else if (activeTab === 'system') {
      updateSettingsMutation.mutate({
        key: 'country',
        value: localizationData.country,
        type: 'string',
        category: 'localization',
      });
      updateSettingsMutation.mutate({
        key: 'currency',
        value: localizationData.currency,
        type: 'string',
        category: 'localization',
      });
      updateSettingsMutation.mutate({
        key: 'language',
        value: localizationData.language,
        type: 'string',
        category: 'localization',
      });
    } else if (activeTab === 'billing') {
      updateBillingDetailsMutation.mutate(billingDetails);
    }
  };

  let logoSrc = logoPreview;
  if (!logoSrc && profileData.logo && typeof profileData.logo === 'string') {
    logoSrc = profileData.logo;
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserCircleIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'system', name: 'System', icon: CogIcon },
    { id: 'billing', name: 'Billing', icon: CreditCardIcon },
    { id: 'invoice-templates', name: 'Invoice Templates', icon: DocumentTextIcon },
    { id: 'receipt-templates', name: 'Receipt Templates', icon: DocumentTextIcon },
    { id: 'tax-payments', name: 'Tax & Payments', icon: CreditCardIcon },
  ];

  return (
    <ProtectedRoute>
      <div>
        <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your account preferences and system configuration.
            </p>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={updateUserProfileMutation.isPending || updateSettingsMutation.isPending || updateNotificationSettingsMutation.isPending || updateSecuritySettingsMutation.isPending || !['profile', 'system', 'notifications', 'security', 'invoice-templates', 'receipt-templates', 'tax-payments'].includes(activeTab)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {updateUserProfileMutation.isPending || updateSettingsMutation.isPending || updateNotificationSettingsMutation.isPending || updateSecuritySettingsMutation.isPending ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <CheckIcon className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </button>
        </div>
      </div>

      <div className="mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                activeTab === tab.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={profileData.first_name}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={profileData.last_name}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Bio</label>
                  <textarea
                    rows={3}
                    name="bio"
                    value={profileData.bio}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Company Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Business Logo</label>
                  <div className="mt-1 flex items-center">
                    <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                      {logoSrc ? (
                        <img className="h-full w-full object-cover" src={logoSrc} alt="Logo" />
                      ) : (
                        <PhotoIcon className="h-full w-full text-gray-300" />
                      )}
                    </span>
                    <input
                      type="file"
                      id="logo-upload"
                      name="logo"
                      className="hidden"
                      onChange={handleLogoChange}
                      accept="image/*"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      Change
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input
                    type="text"
                    name="company_name"
                    value={profileData.company_name}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Position</label>
                  <input
                    type="text"
                    name="position"
                    value={profileData.position}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={profileData.address}
                    onChange={handleProfileInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Domain</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="domain"
                      value={domainPrefix}
                      onChange={(e) => setDomainPrefix(e.target.value)}
                      className="block w-full min-w-0 flex-1 rounded-none rounded-l-md border-gray-300 px-3 py-2 text-sm"
                      placeholder="your-company"
                    />
                    <span className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                      .nexenairis.com
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Notification Preferences</h3>
            {notificationSettingsLoading ? <LoadingSpinner /> : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Get emails about your account activity.</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('email_notifications')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notifications.email_notifications ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.email_notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Get push notifications on your mobile device.</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('push_notifications')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notifications.push_notifications ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.push_notifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Monthly Newsletter</h4>
                    <p className="text-sm text-gray-500">Subscribe to our monthly newsletter.</p>
                  </div>
                  <button
                    onClick={() => handleNotificationToggle('monthly_newsletter')}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                      notifications.monthly_newsletter ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        notifications.monthly_newsletter ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Security Settings</h3>
              {securitySettingsLoading ? <LoadingSpinner /> : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-500">Require a second authentication step.</p>
                    </div>
                    <button
                      onClick={() => handleSecurityToggle('two_factor_authentication')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        security.two_factor_authentication ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          security.two_factor_authentication ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Login Alerts</h4>
                      <p className="text-sm text-gray-500">Get notified when a new device logs in.</p>
                    </div>
                    <button
                      onClick={() => handleSecurityToggle('login_alerts')}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        security.login_alerts ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          security.login_alerts ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
              </div>
              )}
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Change Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    name="current_password"
                    value={passwordData.current_password}
                    onChange={handlePasswordInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  {passwordErrors.current_password?.map((error, index) => (
                    <p key={index} className="text-red-500 text-xs mt-1">{error}</p>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    name="new_password"
                    value={passwordData.new_password}
                    onChange={handlePasswordInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                  {passwordErrors.new_password?.map((error, index) => (
                    <p key={index} className="text-red-500 text-xs mt-1">{error}</p>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    value={passwordData.new_password_confirmation}
                    onChange={handlePasswordInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <button
                  onClick={handleUpdatePassword}
                  disabled={changePasswordMutation.isPending}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <KeyIcon className="h-4 w-4 mr-2" />
                  Update Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Tenant Settings</h3>
              <TenantSettings />
            </div>
          </div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">System Configuration</h3>
              {tenantSettingsLoading ? (
                <LoadingSpinner size="lg" className="py-8" />
            ) : tenantSettingsError ? (
              <ErrorMessage
                message={tenantSettingsError.message || 'Failed to load system settings'}
                onRetry={refetchTenantSettings}
              />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      value={localizationData.country}
                      onChange={(e) => {
                        const country = countries.find((c) => c.name === e.target.value);
                        if (country) {
                          setLocalizationData({
                            country: country.name,
                            currency: country.currency,
                            language: country.languages[0],
                          });
                        }
                      }}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.name}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Currency</label>
                    <select
                      value={localizationData.currency}
                      onChange={(e) => setLocalizationData(prev => ({ ...prev, currency: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      {Object.entries(currencies).map(([code, currency]) => (
                        <option key={code} value={code}>
                          {currency.name} ({currency.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select
                      value={localizationData.language}
                      onChange={(e) => setLocalizationData(prev => ({ ...prev, language: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      {Object.entries(languages).map(([code, name]) => (
                        <option key={code} value={code}>
                          {name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <hr/>
                {systemSettings.map((setting: any) => (
                  <div key={setting.key} className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{setting.key}</h4>
                      <p className="text-sm text-gray-500">{setting.description}</p>
                    </div>
                    <button
                      onClick={() => {
                        // Temporarily disable state update for system settings until API is ready
                        console.log("Toggling system setting:", setting.key);
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        setting.value ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          setting.value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Billing Details</h3>
              {billingDetailsLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Holder Name</label>
                    <input
                      type="text"
                      name="card_holder_name"
                      value={billingData.card_holder_name}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Number</label>
                    <input
                      type="text"
                      name="card_number"
                      value={billingData.card_number}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      type="text"
                      name="expiry_date"
                      value={billingData.expiry_date}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVV</label>
                    <input
                      type="text"
                      name="cvv"
                      value={billingData.cvv}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                    <input
                      type="text"
                      name="billing_address"
                      value={billingData.billing_address}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      name="city"
                      value={billingData.city}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <input
                      type="text"
                      name="state"
                      value={billingData.state}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zip Code</label>
                    <input
                      type="text"
                      name="zip_code"
                      value={billingData.zip_code}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={billingData.country}
                      onChange={handleBillingInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'invoice-templates' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Invoice Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h4 className="text-md font-medium text-gray-900 mb-2">Select a Template</h4>
                <div className="space-y-2">
                  {['Modern', 'Classic', 'Simple'].map((template) => (
                    <button
                      key={template}
                      onClick={() => setActiveInvoiceTemplate(template)}
                      className={`w-full text-left p-2 rounded-md ${
                        activeInvoiceTemplate === template
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
                <hr className="my-4" />
                <h4 className="text-md font-medium text-gray-900 mb-2">Customization</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="showHeader" className="text-sm font-medium text-gray-700">Show Header</label>
                    <input
                      id="showHeader"
                      name="showHeader"
                      type="checkbox"
                      checked={invoiceCustomization.showHeader}
                      onChange={handleInvoiceCustomizationChange}
                      className="rounded text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="showFooter" className="text-sm font-medium text-gray-700">Show Footer</label>
                    <input
                      id="showFooter"
                      name="showFooter"
                      type="checkbox"
                      checked={invoiceCustomization.showFooter}
                      onChange={handleInvoiceCustomizationChange}
                      className="rounded text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="showLogo" className="text-sm font-medium text-gray-700">Show Logo</label>
                    <input
                      id="showLogo"
                      name="showLogo"
                      type="checkbox"
                      checked={invoiceCustomization.showLogo}
                      onChange={handleInvoiceCustomizationChange}
                      className="rounded text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="accentColor" className="text-sm font-medium text-gray-700">Accent Color</label>
                    <input
                      id="accentColor"
                      name="accentColor"
                      type="color"
                      value={invoiceCustomization.accentColor}
                      onChange={handleInvoiceCustomizationChange}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={invoiceCustomization.contactEmail}
                      onChange={handleInvoiceCustomizationChange}
                      className="w-2/3 border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={invoiceCustomization.contactPhone}
                      onChange={handleInvoiceCustomizationChange}
                      className="w-2/3 border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="customCSS" className="block text-sm font-medium text-gray-700">Custom CSS</label>
                    <textarea
                      id="customCSS"
                      name="customCSS"
                      rows={5}
                      value={invoiceCustomization.customCSS}
                      onChange={handleInvoiceCustomizationChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder=".invoice-preview { font-family: 'Times New Roman', serif; }"
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-md font-medium text-gray-900 mb-2">Live Preview ({activeInvoiceTemplate})</h4>
                <div className="border rounded-lg p-8 h-[48rem] overflow-y-auto bg-gray-50" style={{'--accent-color': invoiceCustomization.accentColor} as React.CSSProperties}>
                  <style>{invoiceCustomization.customCSS}</style>
                  {/* Invoice Preview */}
                  {invoiceCustomization.showHeader && (
                    <div className={`flex justify-between items-start pb-4 border-b-2 border-gray-200 ${activeInvoiceTemplate === 'Classic' ? 'flex-row-reverse' : ''}`}>
                      <div>
                        {invoiceCustomization.showLogo && logoSrc && <img src={logoSrc} alt="Business Logo" className="h-20 mb-4" />}
                        <h1 className={`text-3xl font-bold ${activeInvoiceTemplate === 'Simple' ? 'text-[var(--accent-color)]' : ''}`}>{profileData.company_name}</h1>
                        <p className="text-gray-500">{profileData.address}</p>
                        <p className="text-gray-500">{invoiceCustomization.contactEmail}</p>
                        <p className="text-gray-500">{invoiceCustomization.contactPhone}</p>
                      </div>
                      <div className="text-right">
                        <h2 className={`text-4xl font-bold text-gray-400 ${activeInvoiceTemplate === 'Modern' ? 'text-[var(--accent-color)]' : ''}`}>INVOICE</h2>
                        <p className="text-gray-500 mt-2">#[Invoice Number]</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between mt-8">
                    <div>
                      <p className="font-bold">Bill To:</p>
                      <p>[Customer Name]</p>
                      <p>[Customer Address]</p>
                    </div>
                    <div className="text-right">
                      <p><span className="font-bold">Invoice #:</span> [Invoice Number]</p>
                      <p><span className="font-bold">Date:</span> [Invoice Date]</p>
                      <p><span className="font-bold">Due Date:</span> [Due Date]</p>
                    </div>
                  </div>
                  <table className="w-full mt-8 border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-3 text-left font-bold text-gray-600">Item</th>
                        <th className="p-3 text-right font-bold text-gray-600">Quantity</th>
                        <th className="p-3 text-right font-bold text-gray-600">Price</th>
                        <th className="p-3 text-right font-bold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">[Item Description]</td>
                        <td className="p-3 text-right">[Qty]</td>
                        <td className="p-3 text-right">{localizationData.currency} [Price]</td>
                        <td className="p-3 text-right">{localizationData.currency} [Total]</td>
                      </tr>
                      <tr className="border-b">
                        <td className="p-3">[Item Description]</td>
                        <td className="p-3 text-right">[Qty]</td>
                        <td className="p-3 text-right">{localizationData.currency} [Price]</td>
                        <td className="p-3 text-right">{localizationData.currency} [Total]</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-end mt-4">
                    <div className="w-1/2">
                      <div className="flex justify-between">
                        <p>Subtotal:</p>
                        <p>{localizationData.currency} [Subtotal]</p>
                      </div>
                      <div className="flex justify-between">
                        <p>Tax ([Tax Rate]%):</p>
                        <p>{localizationData.currency} [Tax Amount]</p>
                      </div>
                      <div className="flex justify-between font-bold">
                        <p>Total:</p>
                        <p>{localizationData.currency} [Total Amount]</p>
                      </div>
                    </div>
                  </div>
                  {invoiceCustomization.showFooter && (
                    <div className="mt-8 pt-4 border-t-2 border-gray-200 text-center text-sm text-gray-500">
                      <p>Thank you for your business!</p>
                      <p>Powered by <a href="mailto:sales@singoerp.com" className="text-[var(--accent-color)]">NEXEN AIRIS</a></p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={() => setIsSampleInvoiceModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Create Sample Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'receipt-templates' && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Receipt Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <h4 className="text-md font-medium text-gray-900 mb-2">Select a Template</h4>
                <div className="space-y-2">
                  {['Modern', 'Classic', 'Simple'].map((template) => (
                    <button
                      key={template}
                      onClick={() => setActiveReceiptTemplate(template)}
                      className={`w-full text-left p-2 rounded-md ${
                        activeReceiptTemplate === template
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {template}
                    </button>
                  ))}
                </div>
                <hr className="my-4" />
                <h4 className="text-md font-medium text-gray-900 mb-2">Customization</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="showHeader" className="text-sm font-medium text-gray-700">Show Header</label>
                    <input
                      id="showHeader"
                      name="showHeader"
                      type="checkbox"
                      checked={receiptCustomization.showHeader}
                      onChange={handleReceiptCustomizationChange}
                      className="rounded text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="showFooter" className="text-sm font-medium text-gray-700">Show Footer</label>
                    <input
                      id="showFooter"
                      name="showFooter"
                      type="checkbox"
                      checked={receiptCustomization.showFooter}
                      onChange={handleReceiptCustomizationChange}
                      className="rounded text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="showLogo" className="text-sm font-medium text-gray-700">Show Logo</label>
                    <input
                      id="showLogo"
                      name="showLogo"
                      type="checkbox"
                      checked={receiptCustomization.showLogo}
                      onChange={handleReceiptCustomizationChange}
                      className="rounded text-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="accentColor" className="text-sm font-medium text-gray-700">Accent Color</label>
                    <input
                      id="accentColor"
                      name="accentColor"
                      type="color"
                      value={receiptCustomization.accentColor}
                      onChange={handleReceiptCustomizationChange}
                      className="w-8 h-8"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="contactEmail" className="text-sm font-medium text-gray-700">Contact Email</label>
                    <input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={receiptCustomization.contactEmail}
                      onChange={handleReceiptCustomizationChange}
                      className="w-2/3 border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="contactPhone" className="text-sm font-medium text-gray-700">Contact Phone</label>
                    <input
                      id="contactPhone"
                      name="contactPhone"
                      type="tel"
                      value={receiptCustomization.contactPhone}
                      onChange={handleReceiptCustomizationChange}
                      className="w-2/3 border border-gray-300 rounded-md px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="customCSS" className="block text-sm font-medium text-gray-700">Custom CSS</label>
                    <textarea
                      id="customCSS"
                      name="customCSS"
                      rows={5}
                      value={receiptCustomization.customCSS}
                      onChange={handleReceiptCustomizationChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      placeholder=".receipt-preview { font-family: 'Times New Roman', serif; }"
                    />
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-md font-medium text-gray-900 mb-2">Live Preview ({activeReceiptTemplate})</h4>
                <div className="border rounded-lg p-8 h-[48rem] overflow-y-auto bg-gray-50" style={{'--accent-color': receiptCustomization.accentColor} as React.CSSProperties}>
                  <style>{receiptCustomization.customCSS}</style>
                  {/* Receipt Preview */}
                  {receiptCustomization.showHeader && (
                    <div className={`flex justify-between items-start pb-4 border-b-2 border-gray-200 ${activeReceiptTemplate === 'Classic' ? 'flex-row-reverse' : ''}`}>
                      <div>
                        {receiptCustomization.showLogo && logoSrc && <img src={logoSrc} alt="Business Logo" className="h-20 mb-4" />}
                        <h1 className={`text-3xl font-bold ${activeReceiptTemplate === 'Simple' ? 'text-[var(--accent-color)]' : ''}`}>{profileData.company_name}</h1>
                        <p className="text-gray-500">{profileData.address}</p>
                        <p className="text-gray-500">{receiptCustomization.contactEmail}</p>
                        <p className="text-gray-500">{receiptCustomization.contactPhone}</p>
                      </div>
                      <div className="text-right">
                        <h2 className={`text-4xl font-bold text-gray-400 ${activeReceiptTemplate === 'Modern' ? 'text-[var(--accent-color)]' : ''}`}>RECEIPT</h2>
                        <p className="text-gray-500 mt-2">#[Receipt Number]</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between mt-8">
                    <div>
                      <p className="font-bold">Received From:</p>
                      <p>[Customer Name]</p>
                      <p>[Customer Address]</p>
                    </div>
                    <div className="text-right">
                      <p><span className="font-bold">Receipt #:</span> [Receipt Number]</p>
                      <p><span className="font-bold">Date:</span> [Receipt Date]</p>
                    </div>
                  </div>
                  <table className="w-full mt-8 border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="p-3 text-left font-bold text-gray-600">Item</th>
                        <th className="p-3 text-right font-bold text-gray-600">Quantity</th>
                        <th className="p-3 text-right font-bold text-gray-600">Price</th>
                        <th className="p-3 text-right font-bold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="p-3">[Item Description]</td>
                        <td className="p-3 text-right">[Qty]</td>
                        <td className="p-3 text-right">{localizationData.currency} [Price]</td>
                        <td className="p-3 text-right">{localizationData.currency} [Total]</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="flex justify-end mt-4">
                    <div className="w-1/2">
                      <div className="flex justify-between font-bold">
                        <p>Total Paid:</p>
                        <p>{localizationData.currency} [Total Amount]</p>
                      </div>
                    </div>
                  </div>
                  {receiptCustomization.showFooter && (
                    <div className="mt-8 pt-4 border-t-2 border-gray-200 text-center text-sm text-gray-500">
                      <p>Thank you for your payment!</p>
                      <p>Powered by <a href="mailto:sales@singoerp.com" className="text-[var(--accent-color)]">NEXEN AIRIS</a></p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end">
                  <button onClick={() => setIsSampleReceiptModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    Create Sample Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <SampleInvoiceModal
        isOpen={isSampleInvoiceModalOpen}
        onClose={() => setIsSampleInvoiceModalOpen(false)}
        profileData={profileData}
        invoiceCustomization={invoiceCustomization}
        activeInvoiceTemplate={activeInvoiceTemplate}
        logoSrc={logoSrc}
      />
      {activeTab === 'tax-payments' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Tax Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    value={taxSettings.defaultRate}
                    onChange={(e) => setTaxSettings(prev => ({ ...prev, defaultRate: Number(e.target.value) }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Taxable Payment Methods</h4>
                  <p className="text-sm text-gray-500">Select which payment methods are subject to tax.</p>
                  <div className="mt-2 space-y-2">
                    {paymentMethods.map(method => (
                      <div key={method.id} className="flex items-center">
                        <input
                          id={`taxable-${method.id}`}
                          type="checkbox"
                          checked={taxSettings.taxablePaymentMethods.includes(method.id)}
                          onChange={(e) => {
                            const { checked } = e.target;
                            setTaxSettings(prev => {
                              const newTaxableMethods = checked
                                ? [...prev.taxablePaymentMethods, method.id]
                                : prev.taxablePaymentMethods.filter(id => id !== method.id);
                              return { ...prev, taxablePaymentMethods: newTaxableMethods };
                            });
                          }}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                        />
                        <label htmlFor={`taxable-${method.id}`} className="ml-2 block text-sm text-gray-900">
                          {method.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Payment Methods</h3>
              <p className="text-sm text-gray-500 mb-4">Manage the payment methods available at checkout.</p>
              {/* In a future step, we can add functionality to add/edit/delete these */}
              <div className="space-y-2">
                {paymentMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-2 border rounded-md">
                    <span className="text-sm font-medium">{method.name}</span>
                    {/* Add edit/delete buttons here later */}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <SampleReceiptModal
        isOpen={isSampleReceiptModalOpen}
        onClose={() => setIsSampleReceiptModalOpen(false)}
        profileData={profileData}
        receiptCustomization={receiptCustomization}
        activeReceiptTemplate={activeReceiptTemplate}
        logoSrc={logoSrc}
      />
      </div>
    </ProtectedRoute>
  );
  }
