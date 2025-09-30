'use client';

import { useState, useEffect } from 'react';
import { 
  CogIcon, 
  XMarkIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useSupplierCodeSettings, useUpdateSupplierCodePrefix } from '../hooks/useApi';
import LoadingSpinner from './LoadingSpinner';

interface SupplierCodeSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CodeSettings {
  current_prefix: string;
  current_sequence: number;
  next_code_preview: string;
  company_name: string;
}

export default function SupplierCodeSettings({ isOpen, onClose }: SupplierCodeSettingsProps) {
  const [newPrefix, setNewPrefix] = useState('');
  const [resetSequence, setResetSequence] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { data: settingsData, isLoading: settingsLoading, error: settingsError } = useSupplierCodeSettings();
  const updatePrefixMutation = useUpdateSupplierCodePrefix();

  const settings = settingsData?.data as CodeSettings;

  useEffect(() => {
    if (settings?.current_prefix) {
      setNewPrefix(settings.current_prefix);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetSequence) {
      setShowConfirmation(true);
      return;
    }

    try {
      await updatePrefixMutation.mutateAsync({
        prefix: newPrefix.toUpperCase(),
        reset_sequence: false
      });
      onClose();
    } catch (error) {
      console.error('Failed to update prefix:', error);
    }
  };

  const handleConfirmedUpdate = async () => {
    try {
      await updatePrefixMutation.mutateAsync({
        prefix: newPrefix.toUpperCase(),
        reset_sequence: resetSequence
      });
      setShowConfirmation(false);
      onClose();
    } catch (error) {
      console.error('Failed to update prefix:', error);
    }
  };

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '');
    if (value.length <= 5) {
      setNewPrefix(value);
    }
  };

  const generatePreview = () => {
    if (newPrefix && newPrefix.length >= 2) {
      const sequenceNumber = resetSequence ? 1 : (settings?.current_sequence || 0) + 1;
      return `${newPrefix}-SUP-${sequenceNumber.toString().padStart(3, '0')}`;
    }
    return '';
  };

  const isValidPrefix = newPrefix.length >= 2 && newPrefix.length <= 5 && /^[A-Z]+$/.test(newPrefix);
  const hasChanges = settings && (newPrefix !== settings.current_prefix || resetSequence);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <CogIcon className="h-6 w-6 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">
              Supplier Code Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {settingsLoading ? (
          <div className="text-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : settingsError ? (
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load settings</p>
          </div>
        ) : showConfirmation ? (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Confirm Sequence Reset
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      You are about to reset the supplier sequence to start from 001. 
                      This action cannot be undone.
                    </p>
                    <p className="mt-2">
                      Current sequence: <span className="font-semibold">{settings?.current_sequence}</span>
                    </p>
                    <p>
                      New sequence will start from: <span className="font-semibold">1</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmedUpdate}
                disabled={updatePrefixMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {updatePrefixMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Confirm Reset'
                )}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Company Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p><strong>Company:</strong> {settings?.company_name}</p>
                    <p><strong>Current Prefix:</strong> {settings?.current_prefix}</p>
                    <p><strong>Current Sequence:</strong> {settings?.current_sequence}</p>
                    <p><strong>Next Code:</strong> {settings?.next_code_preview}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Code Prefix *
              </label>
              <input
                type="text"
                value={newPrefix}
                onChange={handlePrefixChange}
                placeholder="e.g., MH, ABC, KTS"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  isValidPrefix 
                    ? 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' 
                    : 'border-red-300 focus:ring-red-500 focus:border-red-500'
                }`}
                maxLength={5}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                2-5 uppercase letters only. This will be used for all new supplier codes.
              </p>
              {!isValidPrefix && newPrefix && (
                <p className="mt-1 text-xs text-red-600">
                  Prefix must be 2-5 uppercase letters only
                </p>
              )}
            </div>

            {generatePreview() && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code Preview
                </label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-green-50 text-green-900 font-mono text-center">
                  <span className="font-semibold">{generatePreview()}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  This is how the next supplier code will look
                </p>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="resetSequence"
                checked={resetSequence}
                onChange={(e) => setResetSequence(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="resetSequence" className="ml-2 block text-sm text-gray-900">
                Reset sequence to start from 001
              </label>
            </div>

            {resetSequence && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <p className="ml-2 text-xs text-yellow-700">
                    Warning: This will reset the sequence counter. Future suppliers will start from 001.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!hasChanges || !isValidPrefix || updatePrefixMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatePrefixMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Update Settings'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}



