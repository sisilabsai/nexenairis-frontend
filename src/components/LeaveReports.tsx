import React, { useState } from 'react';
import { useLeaveReports } from '../hooks/useApi';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function LeaveReports() {
  const [reportType, setReportType] = useState('leave_balance');
  const [year, setYear] = useState(new Date().getFullYear());

  const { data: reportData, refetch } = useLeaveReports({
    report_type: reportType,
    year,
  });

  const handleGenerateReport = () => {
    refetch();
  };

  const handleDownloadReport = () => {
    const data = reportData?.data;
    if (!data || !Array.isArray(data) || data.length === 0) return;

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map((row: any) => Object.values(row).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mt-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Leave Reports</h2>
      <div className="flex space-x-4 mb-4">
        <select
          value={reportType}
          onChange={e => setReportType(e.target.value)}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        >
          <option value="leave_balance">Leave Balance</option>
          <option value="leave_history">Leave History</option>
        </select>
        <input
          type="number"
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
        />
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Generate
        </button>
        <button
          onClick={handleDownloadReport}
          disabled={!reportData?.data}
          className="px-4 py-2 bg-green-600 text-white rounded-md flex items-center disabled:bg-gray-400"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Download
        </button>
      </div>
    </div>
  );
}
