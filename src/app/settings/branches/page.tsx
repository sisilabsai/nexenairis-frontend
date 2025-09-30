'use client';
import { useState, useMemo } from 'react';
import { 
  useBranches, 
  useCreateBranch, 
  useUpdateBranch, 
  useDeleteBranch, 
  useToggleBranchStatus 
} from '@/hooks/useBranch';
// Update the import path to the correct location of use-toast
import { useToast } from '@/components/ui/toast';
import { useQuery } from '@tanstack/react-query';
import { UserSelector } from './UserSelector';

import { Branch, BranchFormData } from '@/types/branch';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { Dialog } from '@headlessui/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';

export default function BranchManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [deleteConfirmBranch, setDeleteConfirmBranch] = useState<Branch | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [filterName, setFilterName] = useState('');
  const [filterCode, setFilterCode] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // 'active', 'inactive', or '' for all
  const [filterType, setFilterType] = useState(''); // 'main', 'branch', or '' for all

  const { addToast } = useToast();
  const { data: branches, isLoading, error: branchError } = useBranches();

  // Show error toast if branches failed to load
  useMemo(() => {
    if (branchError) {
      addToast("Failed to load branches. Please refresh the page to try again.", "error");
    }
  }, [branchError, addToast]);
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch(editingBranch?.id ?? 0);
  const deleteBranch = useDeleteBranch();
  const toggleStatus = useToggleBranchStatus(editingBranch?.id ?? 0);

  const filteredBranches = useMemo(() => {
    if (!branches) return [];

    return branches.filter((branch) => {
      const matchesName = branch.name.toLowerCase().includes(filterName.toLowerCase());
      const matchesCode = branch.code.toLowerCase().includes(filterCode.toLowerCase());
      const matchesStatus = filterStatus === '' || branch.status === filterStatus;
      const matchesType = filterType === '' || (filterType === 'main' ? branch.is_main_branch : !branch.is_main_branch);
      return matchesName && matchesCode && matchesStatus && matchesType;
    });
  }, [branches, filterName, filterCode, filterStatus, filterType]);

  const handleSubmit = async (formData: BranchFormData) => {
    try {
      if (editingBranch) {
        await updateBranch.mutateAsync(formData);
        setEditingBranch(null);
        addToast(`Branch "${formData.name}" has been updated successfully.`, "success");
      } else {
        await createBranch.mutateAsync(formData);
        setIsCreateModalOpen(false);
        addToast(`Branch "${formData.name}" has been created successfully.`, "success");
      }
      setFormErrors({});
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setFormErrors(error.response.data.errors);
        // Show toast for validation errors
        addToast(Object.values(error.response.data.errors).flat().join(", "), "error");
      } else {
        console.error('Error submitting form:', error);
        setFormErrors({ 
          general: ['An unexpected error occurred while saving the branch. Please try again.'] 
        });
        addToast("An unexpected error occurred while saving the branch. Please try again.", "error");
      }
    }
  };

  const handleDelete = async (branch: Branch) => {
    try {
      await deleteBranch.mutateAsync(branch.id);
      setDeleteConfirmBranch(null);
      addToast(`Branch "${branch.name}" has been deleted successfully.`, "success");
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      addToast(error.response?.data?.message || "An error occurred while deleting the branch.", "error");
    }
  };

  const handleToggleStatus = async (branch: Branch) => {
    await toggleStatus.mutateAsync();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Branch Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your organization's branches and their settings
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            variant="default"
          >
            <PlusIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
            Add Branch
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          type="text"
          placeholder="Filter by Name"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          className="w-full"
        />
        <Input
          type="text"
          placeholder="Filter by Code"
          value={filterCode}
          onChange={(e) => setFilterCode(e.target.value)}
          className="w-full"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
        >
          <option value="">All Types</option>
          <option value="main">Main Branch</option>
          <option value="branch">Branch</option>
        </select>
      </div>

      {/* Branches List */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Contact Person
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Type
                    </th>
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredBranches.map((branch: Branch) => (
                    <tr key={branch.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {branch.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{branch.code}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {branch.contact_person || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <Badge
                          variant={branch.status === 'active' ? 'default' : 'destructive'}
                        >
                          {branch.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {branch.is_main_branch ? 'Main Branch' : 'Branch'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => setEditingBranch(branch)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          {!branch.is_main_branch && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteConfirmBranch(branch)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Dialog
        open={isCreateModalOpen || !!editingBranch}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingBranch(null);
        }}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              {editingBranch ? 'Edit Branch' : 'Create New Branch'}
            </Dialog.Title>
            <BranchForm
              initialData={editingBranch}
              errors={formErrors}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsCreateModalOpen(false);
                setEditingBranch(null);
                setFormErrors({});
              }}
            />
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={!!deleteConfirmBranch}
        onClose={() => setDeleteConfirmBranch(null)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-sm rounded bg-white p-6">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
              Delete Branch
            </Dialog.Title>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete {deleteConfirmBranch?.name}? This action cannot be undone.
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmBranch(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmBranch && handleDelete(deleteConfirmBranch)}
              >
                Delete
              </Button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}

interface BranchFormProps {
  initialData?: Branch | null;
  errors: Record<string, string[]>;
  onSubmit: (data: BranchFormData) => void;
  onCancel: () => void;
}

function BranchForm({ initialData, errors, onSubmit, onCancel }: BranchFormProps) {
  const [formData, setFormData] = useState<BranchFormData>({
    name: initialData?.name || '',
    code: initialData?.code || '',
    address: initialData?.address || '',
    contact_person: initialData?.contact_person || '',
    contact_person_id: initialData?.contact_person_id,
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    is_main_branch: initialData?.is_main_branch || false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Branch Name *
        </label>
        <Input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
          onChange={handleChange}
          className={errors.name ? 'border-red-500' : ''}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">
            {errors.name.join(', ')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Branch Code *
        </label>
        <Input
          type="text"
          name="code"
          id="code"
          required
          value={formData.code}
          onChange={handleChange}
          className={errors.code ? 'border-red-500' : ''}
        />
        {errors.code && (
          <p className="mt-1 text-sm text-red-500">
            {errors.code.join(', ')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Address
        </label>
        <Input
          type="text"
          name="address"
          id="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Contact Person
        </label>
        <UserSelector
          selectedUserId={formData.contact_person_id}
          selectedUserName={formData.contact_person}
          onUserSelect={(user) => {
            setFormData(prev => ({
              ...prev,
              contact_person: user?.name || '',
              contact_person_id: user?.id,
            }));
          }}
        />
        {errors.contact_person_id && (
          <p className="mt-1 text-sm text-red-500">
            {errors.contact_person_id.join(', ')}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Phone
        </label>
        <Input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          type="email"
          name="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center">
        <Toggle
          pressed={formData.is_main_branch}
          onPressedChange={(pressed) => setFormData(prev => ({ ...prev, is_main_branch: pressed }))}
          aria-label="Toggle main branch"
          className="data-[state=on]:bg-primary"
        >
          <span className="sr-only">Set as main branch</span>
        </Toggle>
        <label className="ml-2 block text-sm font-medium text-gray-700">
          Set as Main Branch
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="default">
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
