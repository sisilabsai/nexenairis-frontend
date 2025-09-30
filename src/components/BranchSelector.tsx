import React from 'react';
import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import { useBranches, useSwitchBranch, useCurrentBranch } from '@/hooks/useBranch';
import { Branch } from '@/types/branch';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

export const BranchSelector = () => {
  const { me } = useAuth();
  const { data: branches, isLoading } = useBranches();
  const { data: currentBranch } = useCurrentBranch();
  const switchBranchMutation = useSwitchBranch();

  // If tenant doesn't have branches enabled, don't show the selector
  if (!me?.tenant?.settings?.branches_enabled) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="h-9 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
    );
  }

  const handleBranchSwitch = (branchId: number) => {
    switchBranchMutation.mutate(branchId);
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="inline-flex w-full items-center justify-between gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
          <BuildingOfficeIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
          <span className="ml-2">{currentBranch?.name || 'Select Branch'}</span>
          <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            {branches?.map((branch: Branch) => (
              <Menu.Item key={branch.id}>
                {({ active }) => (
                  <button
                    onClick={() => handleBranchSwitch(branch.id)}
                    className={cn(
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                      'block w-full px-4 py-2 text-left text-sm',
                      branch.id === currentBranch?.id && 'font-medium'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span>{branch.name}</span>
                      {branch.is_main_branch && (
                        <span className="ml-2 text-xs text-gray-500">(Main)</span>
                      )}
                    </div>
                  </button>
                )}
              </Menu.Item>
            ))}
            
            {/* Option for consolidated view if allowed */}
            {me?.tenant?.settings?.consolidated_reporting_enabled && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => handleBranchSwitch(0)} // 0 indicates consolidated view
                      className={cn(
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                        'block w-full px-4 py-2 text-left text-sm'
                      )}
                    >
                      Consolidated View
                    </button>
                  )}
                </Menu.Item>
              </>
            )}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};