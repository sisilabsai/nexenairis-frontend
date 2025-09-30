import React, { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Account {
  id: number;
  account_code: string;
  account_name: string;
  account_type: string;
  is_active: boolean;
  child_accounts: Account[];
}

interface Props {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  onAddChild: (account: Account) => void;
}

const AccountTree: React.FC<Props> = ({ accounts, onEdit, onDelete, onAddChild }) => {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const toggle = (id: number) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderAccount = (account: Account, level = 0) => {
    const isExpanded = expanded[account.id];
    const hasChildren = account.child_accounts && account.child_accounts.length > 0;

    return (
      <React.Fragment key={account.id}>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" style={{ paddingLeft: `${level * 20 + 24}px` }}>
            {hasChildren && (
              <button onClick={() => toggle(account.id)} className="mr-2">
                {isExpanded ? '[-]' : '[+]'}
              </button>
            )}
            {account.account_code} - {account.account_name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.account_type}</td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {account.is_active ? 'Active' : 'Inactive'}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button onClick={() => onAddChild(account)} className="text-gray-600 hover:text-gray-900 mr-3" title="Add Child Account">
              <PlusIcon className="h-4 w-4" />
            </button>
            <button onClick={() => onEdit(account)} className="text-indigo-600 hover:text-indigo-900 mr-3" title="Edit Account">
              <PencilIcon className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(account)} className="text-red-600 hover:text-red-900" title="Delete Account">
              <TrashIcon className="h-4 w-4" />
            </button>
          </td>
        </tr>
        {isExpanded && hasChildren && account.child_accounts.map(child => renderAccount(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {accounts.map(account => renderAccount(account))}
      </tbody>
    </table>
  );
};

export default AccountTree;
