import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface AuditLog {
  id: number;
  user: { name: string };
  action: string;
  old_values: any;
  new_values: any;
  created_at: string;
}

interface Props {
  auditable_id: number;
  auditable_type: string;
}

const AuditTrail: React.FC<Props> = ({ auditable_id, auditable_type }) => {
  const [actionFilter, setActionFilter] = useState('');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit_logs', auditable_id, auditable_type, actionFilter, dateFilter],
    queryFn: () => {
      const params = new URLSearchParams({
        auditable_id: auditable_id.toString(),
        auditable_type,
        action: actionFilter,
        start_date: dateFilter.start,
        end_date: dateFilter.end,
      });
      return api.get(`/finance/audit-logs?${params.toString()}`);
    },
  });

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Audit Trail</h3>
        <div className="flex items-center space-x-2">
          <Input 
            type="date" 
            value={dateFilter.start} 
            onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            className="w-40"
          />
          <Input 
            type="date" 
            value={dateFilter.end} 
            onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            className="w-40"
          />
          <select 
            value={actionFilter} 
            onChange={(e) => setActionFilter(e.target.value)}
            className="rounded-md border-gray-300 text-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">All Actions</option>
            <option value="created">Created</option>
            <option value="updated">Updated</option>
            <option value="deleted">Deleted</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-4">Loading...</td>
              </tr>
            ) : (
              (auditLogs as any)?.data?.map((log: AuditLog) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.user?.name || 'System'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{log.action}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                      {JSON.stringify({ old: log.old_values, new: log.new_values }, null, 2)}
                    </pre>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTrail;
