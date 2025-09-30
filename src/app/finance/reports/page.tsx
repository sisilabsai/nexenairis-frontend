'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useProfitAndLoss, useBalanceSheet, useStatementOfChangesInEquity, useCashFlowStatement, useArAgingReport } from '@/hooks/useApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorMessage from '@/components/ErrorMessage';
import { ProfitAndLossData, BalanceSheetData, StatementOfChangesInEquityData, CashFlowData, ArAgingData } from '@/types';
import { saveAs } from 'file-saver';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDown, ArrowLeft } from 'lucide-react';
import CustomBarChart from '@/components/ui/bar-chart';
import CustomPieChart from '@/components/ui/pie-chart';
import CustomLineChart from '@/components/ui/line-chart';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ArAgingReport = () => {
    const { data: apiResponse, isLoading, error } = useArAgingReport();
    const data = apiResponse?.data as ArAgingData[];

    const chartData = data?.map(item => ({
        name: item.aging_bucket,
        value: item.total_due,
    })) || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>A/R Aging Report</CardTitle>
            </CardHeader>
            <CardContent>
                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message="Failed to load A/R Aging Report." />}
                {data && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <CustomBarChart data={chartData} barKey="value" xAxisKey="name" />
                        </div>
                        <div>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aging Bucket</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {data.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.aging_bucket}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Intl.NumberFormat().format(item.total_due)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.invoice_count}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const CashFlowStatement = () => {
    const [dateRange, setDateRange] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    const getDates = (range: string, customStart: string, customEnd: string) => {
        const today = new Date();
        let start = '';
        let end = new Date().toISOString().split('T')[0];

        switch (range) {
            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                break;
            case 'this_quarter':
                start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1).toISOString().split('T')[0];
                break;
            case 'this_year':
                start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                break;
            case 'custom':
                start = customStart;
                end = customEnd;
                break;
            default:
                break;
        }
        return { start, end };
    };

    const { start: startDate, end: endDate } = getDates(dateRange, customStartDate, customEndDate);

    const { data: apiResponse, isLoading, error, refetch } = useCashFlowStatement({
        start_date: startDate,
        end_date: endDate,
    });

    const data = apiResponse?.data as CashFlowData;
    const primaryData = data?.primary;

    const handleGenerateReport = () => {
        refetch();
    };

    const chartData = [
        { name: 'Operating Activities', value: primaryData?.operating_activities.net_cash_flow || 0 },
        { name: 'Investing Activities', value: primaryData?.investing_activities.net_cash_flow || 0 },
        { name: 'Financing Activities', value: primaryData?.financing_activities.net_cash_flow || 0 },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cash Flow Statement</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="p-2 border rounded">
                        <option value="this_month">This Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                        <option value="custom">Custom</option>
                    </select>
                    {dateRange === 'custom' && (
                        <>
                            <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                            <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                        </>
                    )}
                    <Button onClick={handleGenerateReport}>Generate Report</Button>
                </div>

                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message="Failed to load Cash Flow Statement." />}
                {primaryData && (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-gray-900">Net Cash from Operating Activities</span>
                                    <span className="font-medium">{new Intl.NumberFormat().format(primaryData.operating_activities.net_cash_flow)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-gray-900">Net Cash from Investing Activities</span>
                                    <span className="font-medium">{new Intl.NumberFormat().format(primaryData.investing_activities.net_cash_flow)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-gray-900">Net Cash from Financing Activities</span>
                                    <span className="font-medium">{new Intl.NumberFormat().format(primaryData.financing_activities.net_cash_flow)}</span>
                                </div>
                                <div className="flex justify-between py-4 border-t-2 border-gray-900 mt-4">
                                    <span className="font-bold text-lg text-gray-900">Net Increase in Cash</span>
                                    <span className="font-bold text-lg">{new Intl.NumberFormat().format(primaryData.net_increase_in_cash)}</span>
                                </div>
                            </div>
                            <div>
                                <CustomBarChart data={chartData} barKey="value" xAxisKey="name" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const StatementOfChangesInEquityStatement = () => {
    const reportRef = React.useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [dateRange, setDateRange] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [compareDateRange, setCompareDateRange] = useState('previous_period');
    const [customCompareStartDate, setCustomCompareStartDate] = useState('');
    const [customCompareEndDate, setCustomCompareEndDate] = useState('');

    const getDates = (range: string, customStart: string, customEnd: string) => {
        const today = new Date();
        let start = '';
        let end = new Date().toISOString().split('T')[0];

        switch (range) {
            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                break;
            case 'this_quarter':
                start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1).toISOString().split('T')[0];
                break;
            case 'this_year':
                start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                break;
            case 'custom':
                start = customStart;
                end = customEnd;
                break;
            default:
                break;
        }
        return { start, end };
    };

    const { start: startDate, end: endDate } = getDates(dateRange, customStartDate, customEndDate);

    const getCompareDates = () => {
        if (compareDateRange === 'custom') {
            return { start: customCompareStartDate, end: customCompareEndDate };
        }
        if (compareDateRange === 'previous_period') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diff = end.getTime() - start.getTime();
            const prevStart = new Date(start.getTime() - diff - 86400000); // Subtract one day for inclusive ranges
            const prevEnd = new Date(start.getTime() - 86400000);
            return { start: prevStart.toISOString().split('T')[0], end: prevEnd.toISOString().split('T')[0] };
        }
        return { start: '', end: '' };
    };

    const { start: compareStartDate, end: compareEndDate } = getCompareDates();

    const { data: apiResponse, isLoading, error, refetch } = useStatementOfChangesInEquity({
        start_date: startDate,
        end_date: endDate,
        compare_start_date: compareStartDate,
        compare_end_date: compareEndDate,
    });

    const data = apiResponse?.data as StatementOfChangesInEquityData;
    const primaryData = data?.primary;
    const comparisonData = data?.comparison;

    const handleGenerateReport = () => {
        refetch();
    };

    const chartData = [
        { name: 'Beginning Balance', value: primaryData?.beginning_balance || 0, comparison: comparisonData?.beginning_balance || 0 },
        { name: 'Net Income', value: primaryData?.net_income || 0, comparison: comparisonData?.net_income || 0 },
        { name: 'Ending Balance', value: primaryData?.ending_balance || 0, comparison: comparisonData?.ending_balance || 0 },
    ];

    const handleExport = async (format: 'excel' | 'pdf') => {
        setIsExporting(true);
        if (format === 'pdf') {
            const canvas = await html2canvas(reportRef.current!, {
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            (pdf as any).autoTable({
                head: [['Statement of Changes in Equity']],
                body: [
                    ['Beginning Balance', primaryData?.beginning_balance],
                    ['Net Income', primaryData?.net_income],
                    ['Ending Balance', primaryData?.ending_balance],
                ],
            });
            pdf.addImage(imgData, 'PNG', 15, 50, 180, 100);
            pdf.save(`statement_of_changes_in_equity_${new Date().toISOString().split('T')[0]}.pdf`);
            setIsExporting(false);
        } else {
            try {
                const response: any = await api.get(`/finance/reports/statement-of-changes-in-equity/export?format=${format}&start_date=${startDate}&end_date=${endDate}`, {
                    responseType: 'blob',
                });
                const contentType = 'text/csv';
                const blob = new Blob([response], { type: contentType });
                saveAs(blob, `statement_of_changes_in_equity_${new Date().toISOString().split('T')[0]}.csv`);
            } catch (error) {
                console.error('Failed to export report', error);
            } finally {
                setIsExporting(false);
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Statement of Changes in Equity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="p-2 border rounded">
                        <option value="this_month">This Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                        <option value="custom">Custom</option>
                    </select>
                    {dateRange === 'custom' && (
                        <>
                            <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                            <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                        </>
                    )}
                    <Button onClick={handleGenerateReport}>Generate Report</Button>
                </div>
                <div className="flex items-center space-x-4 mb-6">
                    <span className="font-medium">Compare to:</span>
                    <select value={compareDateRange} onChange={(e) => setCompareDateRange(e.target.value)} className="p-2 border rounded">
                        <option value="previous_period">Previous Period</option>
                        <option value="custom">Custom</option>
                    </select>
                    {compareDateRange === 'custom' && (
                        <>
                            <Input type="date" value={customCompareStartDate} onChange={(e) => setCustomCompareStartDate(e.target.value)} />
                            <Input type="date" value={customCompareEndDate} onChange={(e) => setCustomCompareEndDate(e.target.value)} />
                        </>
                    )}
                </div>

                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message="Failed to load Statement of Changes in Equity." />}
                {primaryData && primaryData.period && (
                    <div ref={reportRef}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold">Statement of Changes in Equity</h4>
                            <div>
                                <Button onClick={() => handleExport('excel')} variant="outline" size="sm" className="mr-2" disabled={isExporting}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                                </Button>
                                <Button onClick={() => handleExport('pdf')} variant="outline" size="sm" disabled={isExporting}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export to PDF'}
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">For the period from {primaryData.period.start_date} to {primaryData.period.end_date}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-gray-900">Beginning Balance</span>
                                    <span className="font-medium">{new Intl.NumberFormat().format(primaryData.beginning_balance)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-gray-900">Net Income</span>
                                    <span className="font-medium text-green-600">{new Intl.NumberFormat().format(primaryData.net_income)}</span>
                                </div>
                                <div className="flex justify-between py-4 border-t-2 border-gray-900 mt-4">
                                    <span className="font-bold text-lg text-gray-900">Ending Balance</span>
                                    <span className="font-bold text-lg">{new Intl.NumberFormat().format(primaryData.ending_balance)}</span>
                                </div>
                            </div>
                            <div>
                                <CustomLineChart data={chartData} lineKey="value" xAxisKey="name" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const BalanceSheetStatement = () => {
    const reportRef = React.useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [compareDate, setCompareDate] = useState('');

    const { data: apiResponse, isLoading, error, refetch } = useBalanceSheet({
        date,
        compare_date: compareDate,
    });

    const data = apiResponse?.data as BalanceSheetData;
    const primaryData = data?.primary;
    const comparisonData = data?.comparison;

    const handleGenerateReport = () => {
        refetch();
    };

    const chartData = [
        { name: 'Assets', value: primaryData?.total_assets || 0 },
        { name: 'Liabilities', value: primaryData?.total_liabilities || 0 },
        { name: 'Equity', value: primaryData?.total_equity || 0 },
    ];

    const handleExport = async (format: 'excel' | 'pdf') => {
        setIsExporting(true);
        if (format === 'pdf') {
            const canvas = await html2canvas(reportRef.current!, {
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            (pdf as any).autoTable({
                head: [['Balance Sheet']],
                body: [
                    ['Assets', primaryData?.total_assets],
                    ['Liabilities', primaryData?.total_liabilities],
                    ['Equity', primaryData?.total_equity],
                ],
            });
            pdf.addImage(imgData, 'PNG', 15, 50, 180, 100);
            pdf.save(`balance_sheet_${new Date().toISOString().split('T')[0]}.pdf`);
            setIsExporting(false);
        } else {
            try {
                const response: any = await api.get(`/finance/reports/balance-sheet/export?format=${format}&date=${date}`, {
                    responseType: 'blob',
                });
                const contentType = 'text/csv';
                const blob = new Blob([response], { type: contentType });
                saveAs(blob, `balance_sheet_${new Date().toISOString().split('T')[0]}.csv`);
            } catch (error) {
                console.error('Failed to export report', error);
            } finally {
                setIsExporting(false);
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Balance Sheet</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                    <span className="font-medium">Compare to:</span>
                    <Input type="date" value={compareDate} onChange={(e) => setCompareDate(e.target.value)} />
                    <Button onClick={handleGenerateReport}>Generate Report</Button>
                </div>

                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message="Failed to load Balance Sheet." />}
                {primaryData && primaryData.assets && (
                    <div ref={reportRef}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold">Balance Sheet</h4>
                            <div>
                                <Button onClick={() => handleExport('excel')} variant="outline" size="sm" className="mr-2" disabled={isExporting}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                                </Button>
                                <Button onClick={() => handleExport('pdf')} variant="outline" size="sm" disabled={isExporting}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export to PDF'}
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">As of {primaryData.date}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <CustomPieChart data={chartData} dataKey="value" nameKey="name" />
                            </div>
                            <div>
                                {/* Assets */}
                                <div>
                                    <h5 className="text-lg font-semibold mb-2 border-b pb-2">Assets</h5>
                                    {primaryData.assets.map((item, index) => (
                                        <div key={index} className="flex justify-between py-2">
                                            <a href={`/finance/transactions?account=${item.name}`} className="text-indigo-600 hover:text-indigo-800">{item.name}</a>
                                            <span>{new Intl.NumberFormat().format(item.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-4 border-t-2 border-gray-900 mt-4">
                                        <span className="font-bold">Total Assets</span>
                                        <span className="font-bold">{new Intl.NumberFormat().format(primaryData.total_assets)}</span>
                                    </div>
                                </div>

                                {/* Liabilities and Equity */}
                                <div>
                                    <h5 className="text-lg font-semibold mb-2 border-b pb-2">Liabilities</h5>
                                    {primaryData.liabilities.map((item, index) => (
                                        <div key={index} className="flex justify-between py-2">
                                            <a href={`/finance/transactions?account=${item.name}`} className="text-indigo-600 hover:text-indigo-800">{item.name}</a>
                                            <span>{new Intl.NumberFormat().format(item.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-2 border-t mt-2">
                                        <span className="font-medium">Total Liabilities</span>
                                        <span className="font-medium">{new Intl.NumberFormat().format(primaryData.total_liabilities)}</span>
                                    </div>

                                    <h5 className="text-lg font-semibold mt-6 mb-2 border-b pb-2">Equity</h5>
                                    {primaryData.equity.map((item, index) => (
                                        <div key={index} className="flex justify-between py-2">
                                            <a href={`/finance/transactions?account=${item.name}`} className="text-indigo-600 hover:text-indigo-800">{item.name}</a>
                                            <span>{new Intl.NumberFormat().format(item.balance)}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-2 border-t mt-2">
                                        <span className="font-medium">Total Equity</span>
                                        <span className="font-medium">{new Intl.NumberFormat().format(primaryData.total_equity)}</span>
                                    </div>

                                    <div className="flex justify-between py-4 border-t-2 border-gray-900 mt-4">
                                        <span className="font-bold">Total Liabilities & Equity</span>
                                        <span className="font-bold">{new Intl.NumberFormat().format(primaryData.total_liabilities_and_equity)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ProfitAndLossStatement = () => {
    const reportRef = React.useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [dateRange, setDateRange] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [compareDateRange, setCompareDateRange] = useState('previous_period');
    const [customCompareStartDate, setCustomCompareStartDate] = useState('');
    const [customCompareEndDate, setCustomCompareEndDate] = useState('');

    const getDates = (range: string, customStart: string, customEnd: string) => {
        const today = new Date();
        let start = '';
        let end = new Date().toISOString().split('T')[0];

        switch (range) {
            case 'this_month':
                start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                break;
            case 'this_quarter':
                start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1).toISOString().split('T')[0];
                break;
            case 'this_year':
                start = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0];
                break;
            case 'custom':
                start = customStart;
                end = customEnd;
                break;
            default:
                break;
        }
        return { start, end };
    };

    const { start: startDate, end: endDate } = getDates(dateRange, customStartDate, customEndDate);

    const getCompareDates = () => {
        if (compareDateRange === 'custom') {
            return { start: customCompareStartDate, end: customCompareEndDate };
        }
        if (compareDateRange === 'previous_period') {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diff = end.getTime() - start.getTime();
            const prevStart = new Date(start.getTime() - diff - 86400000); // Subtract one day for inclusive ranges
            const prevEnd = new Date(start.getTime() - 86400000);
            return { start: prevStart.toISOString().split('T')[0], end: prevEnd.toISOString().split('T')[0] };
        }
        return { start: '', end: '' };
    };

    const { start: compareStartDate, end: compareEndDate } = getCompareDates();

    const { data: apiResponse, isLoading, error, refetch } = useProfitAndLoss({
        start_date: startDate,
        end_date: endDate,
        compare_start_date: compareStartDate,
        compare_end_date: compareEndDate,
    });

    const data = apiResponse?.data as ProfitAndLossData;
    const primaryData = data?.primary;
    const comparisonData = data?.comparison;

    const handleGenerateReport = () => {
        refetch();
    };

    const chartData = [
        { name: 'Revenue', value: primaryData?.revenue || 0, comparison: comparisonData?.revenue || 0 },
        { name: 'Expenses', value: primaryData?.expenses || 0, comparison: comparisonData?.expenses || 0 },
    ];

    const handleExport = async (format: 'excel' | 'pdf') => {
        setIsExporting(true);
        if (format === 'pdf') {
            const canvas = await html2canvas(reportRef.current!, {
                backgroundColor: '#ffffff',
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            (pdf as any).autoTable({
                head: [['Profit & Loss Statement']],
                body: [
                    ['Revenue', primaryData?.revenue],
                    ['Expenses', primaryData?.expenses],
                    ['Net Income', primaryData?.net_income],
                ],
            });
            pdf.addImage(imgData, 'PNG', 15, 50, 180, 100);
            pdf.save(`profit_and_loss_${new Date().toISOString().split('T')[0]}.pdf`);
            setIsExporting(false);
        } else {
            try {
                const response: any = await api.get(`/finance/reports/profit-and-loss/export?format=${format}&start_date=${startDate}&end_date=${endDate}`, {
                    responseType: 'blob',
                });
                const contentType = 'text/csv';
                const blob = new Blob([response], { type: contentType });
                saveAs(blob, `profit_and_loss_${new Date().toISOString().split('T')[0]}.csv`);
            } catch (error) {
                console.error('Failed to export report', error);
            } finally {
                setIsExporting(false);
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profit & Loss Statement</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="p-2 border rounded">
                        <option value="this_month">This Month</option>
                        <option value="this_quarter">This Quarter</option>
                        <option value="this_year">This Year</option>
                        <option value="custom">Custom</option>
                    </select>
                    {dateRange === 'custom' && (
                        <>
                            <Input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                            <Input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                        </>
                    )}
                    <Button onClick={handleGenerateReport}>Generate Report</Button>
                </div>
                <div className="flex items-center space-x-4 mb-6">
                    <span className="font-medium">Compare to:</span>
                    <select value={compareDateRange} onChange={(e) => setCompareDateRange(e.target.value)} className="p-2 border rounded">
                        <option value="previous_period">Previous Period</option>
                        <option value="custom">Custom</option>
                    </select>
                    {compareDateRange === 'custom' && (
                        <>
                            <Input type="date" value={customCompareStartDate} onChange={(e) => setCustomCompareStartDate(e.target.value)} />
                            <Input type="date" value={customCompareEndDate} onChange={(e) => setCustomCompareEndDate(e.target.value)} />
                        </>
                    )}
                </div>

                {isLoading && <LoadingSpinner />}
                {error && <ErrorMessage message="Failed to load Profit & Loss statement." />}
                {primaryData && primaryData.period && (
                    <div ref={reportRef}>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xl font-semibold">Profit & Loss Statement</h4>
                            <div>
                                <Button onClick={() => handleExport('excel')} variant="outline" size="sm" className="mr-2" disabled={isExporting}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                                </Button>
                                <Button onClick={() => handleExport('pdf')} variant="outline" size="sm" disabled={isExporting}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    {isExporting ? 'Exporting...' : 'Export to PDF'}
                                </Button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">For the period from {primaryData.period.start_date} to {primaryData.period.end_date}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-gray-900">Revenue</span>
                                    <span className="font-medium text-green-600">{new Intl.NumberFormat().format(primaryData.revenue)}</span>
                                </div>
                                {primaryData.revenue_accounts.map((account) => (
                                    <div key={account.id} className="flex justify-between py-2 pl-4">
                                        <a href={`/finance/transactions?account=${account.account_name}`} className="text-indigo-600 hover:text-indigo-800">{account.account_name}</a>
                                    </div>
                                ))}
                                <div className="flex justify-between py-2 border-b">
                                    <span className="font-medium text-gray-900">Expenses</span>
                                    <span className="font-medium text-red-600">{new Intl.NumberFormat().format(primaryData.expenses)}</span>
                                </div>
                                {primaryData.expense_accounts.map((account) => (
                                    <div key={account.id} className="flex justify-between py-2 pl-4">
                                        <a href={`/finance/transactions?account=${account.account_name}`} className="text-indigo-600 hover:text-indigo-800">{account.account_name}</a>
                                    </div>
                                ))}
                                <div className="flex justify-between py-4 border-t-2 border-gray-900 mt-4">
                                    <span className="font-bold text-lg text-gray-900">Net Income</span>
                                    <span className={`font-bold text-lg ${primaryData.net_income >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {new Intl.NumberFormat().format(primaryData.net_income)}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <CustomBarChart data={chartData} barKey="value" xAxisKey="name" />
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function ReportsPage() {
    const router = useRouter();

    return (
        <ProtectedRoute>
            <DashboardLayout>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
                    <Button variant="outline" onClick={() => router.push('/finance')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Finance
                    </Button>
                </div>
                <Tabs defaultValue="pnl">
                    <TabsList>
                        <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
                        <TabsTrigger value="balance_sheet">Balance Sheet</TabsTrigger>
                        <TabsTrigger value="equity">Statement of Changes in Equity</TabsTrigger>
                        <TabsTrigger value="cash_flow">Cash Flow Statement</TabsTrigger>
                        <TabsTrigger value="ar_aging">A/R Aging Report</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pnl">
                        <ProfitAndLossStatement />
                    </TabsContent>
                    <TabsContent value="balance_sheet">
                        <BalanceSheetStatement />
                    </TabsContent>
                    <TabsContent value="equity">
                        <StatementOfChangesInEquityStatement />
                    </TabsContent>
                    <TabsContent value="cash_flow">
                        <CashFlowStatement />
                    </TabsContent>
                    <TabsContent value="ar_aging">
                        <ArAgingReport />
                    </TabsContent>
                </Tabs>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
