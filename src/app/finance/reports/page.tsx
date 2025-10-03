'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
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
import { 
  FileDown, 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  Filter,
  Download,
  Eye,
  BarChart3,
  PieChart,
  LineChart,
  Settings,
  Lightbulb,
  Calculator,
  DollarSign,
  Target,
  Award,
  Zap,
  BookOpen,
  RefreshCw,
  Share2,
  Mail,
  Printer,
  ChevronDown,
  ChevronRight,
  Info,
  Star,
  Bookmark,
  Clock
} from 'lucide-react';
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

// Enhanced Balance Sheet with Financial Health Analytics
const EnhancedBalanceSheetStatement = () => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [compareDate, setCompareDate] = useState('');
    const [expandedSections, setExpandedSections] = useState<string[]>(['assets', 'liabilities', 'equity']);

    const { data: apiResponse, isLoading, error, refetch } = useBalanceSheet({
        date,
        compare_date: compareDate,
    });

    const data = apiResponse?.data as BalanceSheetData;
    const primaryData = data?.primary;

    const handleGenerateReport = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleExport = useCallback(async (format: 'excel' | 'pdf' | 'email') => {
        setIsExporting(true);
        try {
            if (format === 'email') {
                console.log('Email sharing functionality to be implemented');
                return;
            }
            
            if (format === 'pdf') {
                const canvas = await html2canvas(reportRef.current!, {
                    backgroundColor: '#ffffff',
                    scale: 2
                });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                pdf.setFontSize(20);
                pdf.text('Balance Sheet', 20, 20);
                pdf.setFontSize(12);
                pdf.text(`As of: ${date}`, 20, 30);
                pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
                
                const imgWidth = 170;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);
                
                pdf.save(`Balance_Sheet_${date}.pdf`);
            } else {
                const response = await api.get(`/finance/reports/balance-sheet/export?format=${format}&date=${date}`, {
                    responseType: 'blob',
                });
                const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `Balance_Sheet_${date}.xlsx`);
            }
        } catch (error) {
            console.error('Failed to export report', error);
        } finally {
            setIsExporting(false);
        }
    }, [date]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const financialRatios = useMemo(() => {
        if (!primaryData) return null;
        
        const currentAssets = primaryData.assets?.reduce((sum: number, asset: any) => {
            return asset.name?.toLowerCase().includes('current') || 
                   asset.name?.toLowerCase().includes('cash') ||
                   asset.name?.toLowerCase().includes('bank') ||
                   asset.name?.toLowerCase().includes('receivable') ? sum + (asset.balance || 0) : sum;
        }, 0) || 0;
        
        const currentLiabilities = primaryData.liabilities?.reduce((sum: number, liability: any) => {
            return liability.name?.toLowerCase().includes('current') ||
                   liability.name?.toLowerCase().includes('payable') ? sum + (liability.balance || 0) : sum;
        }, 0) || 1;
        
        const currentRatio = currentAssets / currentLiabilities;
        const debtToEquityRatio = (primaryData.total_liabilities || 0) / (primaryData.total_equity || 1);
        const assetTurnover = (primaryData.total_assets || 0) / (primaryData.total_liabilities + primaryData.total_equity || 1);
        
        return { currentRatio, debtToEquityRatio, assetTurnover, currentAssets, currentLiabilities };
    }, [primaryData]);

    const getHealthIndicator = (ratio: number, type: 'current' | 'debt' | 'asset') => {
        switch (type) {
            case 'current':
                if (ratio >= 2) return { color: 'green', label: 'Excellent', icon: CheckCircle2 };
                if (ratio >= 1.2) return { color: 'blue', label: 'Good', icon: CheckCircle2 };
                if (ratio >= 1) return { color: 'yellow', label: 'Adequate', icon: AlertTriangle };
                return { color: 'red', label: 'Poor', icon: AlertTriangle };
            case 'debt':
                if (ratio <= 0.3) return { color: 'green', label: 'Conservative', icon: CheckCircle2 };
                if (ratio <= 0.6) return { color: 'blue', label: 'Moderate', icon: CheckCircle2 };
                if (ratio <= 1) return { color: 'yellow', label: 'Leveraged', icon: AlertTriangle };
                return { color: 'red', label: 'High Risk', icon: AlertTriangle };
            default:
                return { color: 'blue', label: 'Normal', icon: CheckCircle2 };
        }
    };

    return (
        <div className="space-y-6">
            {/* Smart Insights */}
            <SmartInsights reportType="balance_sheet" data={data} />
            
            {/* Report Header */}
            <ReportHeader
                title="Balance Sheet"
                subtitle={`Financial Position as of ${date}`}
                onExport={handleExport}
                isExporting={isExporting}
                onRefresh={handleGenerateReport}
            />

            {/* Date Filters */}
            <Card className="bg-gradient-to-r from-gray-50 to-slate-50">
                <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-gray-800">
                        <Calendar className="mr-2 h-5 w-5" />
                        Report Date
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">As of Date</label>
                            <Input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)}
                                className="focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Compare to Date (Optional)</label>
                            <Input 
                                type="date" 
                                value={compareDate} 
                                onChange={(e) => setCompareDate(e.target.value)}
                                className="focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button 
                                onClick={handleGenerateReport}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                            >
                                <Calculator className="mr-2 h-4 w-4" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {isLoading && (
                <Card className="p-12">
                    <div className="flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Analyzing financial position...</span>
                    </div>
                </Card>
            )}
            
            {error && <ErrorMessage message="Failed to load Balance Sheet. Please try again." />}
            
            {primaryData && (
                <div ref={reportRef} className="space-y-6">
                    {/* Financial Health Indicators */}
                    {financialRatios && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Object.entries({
                                'Current Ratio': { value: financialRatios.currentRatio, type: 'current' as const },
                                'Debt-to-Equity': { value: financialRatios.debtToEquityRatio, type: 'debt' as const },
                                'Asset Efficiency': { value: financialRatios.assetTurnover, type: 'asset' as const }
                            }).map(([label, { value, type }]) => {
                                const health = getHealthIndicator(value, type);
                                const Icon = health.icon;
                                
                                return (
                                    <Card key={label} className={`border-2 ${
                                        health.color === 'green' ? 'border-green-200 bg-green-50' :
                                        health.color === 'blue' ? 'border-blue-200 bg-blue-50' :
                                        health.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' :
                                        'border-red-200 bg-red-50'
                                    }`}>
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className={`text-sm font-medium ${
                                                        health.color === 'green' ? 'text-green-700' :
                                                        health.color === 'blue' ? 'text-blue-700' :
                                                        health.color === 'yellow' ? 'text-yellow-700' :
                                                        'text-red-700'
                                                    }`}>{label}</p>
                                                    <p className={`text-2xl font-bold ${
                                                        health.color === 'green' ? 'text-green-900' :
                                                        health.color === 'blue' ? 'text-blue-900' :
                                                        health.color === 'yellow' ? 'text-yellow-900' :
                                                        'text-red-900'
                                                    }`}>{value.toFixed(2)}</p>
                                                    <p className={`text-xs ${
                                                        health.color === 'green' ? 'text-green-600' :
                                                        health.color === 'blue' ? 'text-blue-600' :
                                                        health.color === 'yellow' ? 'text-yellow-600' :
                                                        'text-red-600'
                                                    }`}>{health.label}</p>
                                                </div>
                                                <Icon className={`h-8 w-8 ${
                                                    health.color === 'green' ? 'text-green-600' :
                                                    health.color === 'blue' ? 'text-blue-600' :
                                                    health.color === 'yellow' ? 'text-yellow-600' :
                                                    'text-red-600'
                                                }`} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {/* Main Balance Sheet */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-gray-900">Balance Sheet</CardTitle>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>As of {primaryData.date}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                                {/* Financial Statement */}
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Assets */}
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                            <div 
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSection('assets')}
                                            >
                                                <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                                                    <DollarSign className="mr-2 h-5 w-5" />
                                                    Assets
                                                </h3>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg font-bold text-blue-700">
                                                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.total_assets)}
                                                    </span>
                                                    {expandedSections.includes('assets') ? 
                                                        <ChevronDown className="h-5 w-5 text-blue-600" /> :
                                                        <ChevronRight className="h-5 w-5 text-blue-600" />
                                                    }
                                                </div>
                                            </div>
                                            
                                            {expandedSections.includes('assets') && primaryData.assets && (
                                                <div className="mt-4 space-y-2">
                                                    {primaryData.assets.map((asset: any, index: number) => (
                                                        <div key={index} className="flex justify-between items-center py-2 pl-4 bg-white rounded border">
                                                            <a 
                                                                href={`/finance/transactions?account=${asset.name}`} 
                                                                className="text-blue-700 hover:text-blue-900 font-medium"
                                                            >
                                                                {asset.name}
                                                            </a>
                                                            <span className="text-blue-800 font-semibold">
                                                                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(asset.balance)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Liabilities & Equity */}
                                    <div className="space-y-4">
                                        {/* Liabilities */}
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                            <div 
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSection('liabilities')}
                                            >
                                                <h3 className="text-lg font-semibold text-red-900 flex items-center">
                                                    <AlertTriangle className="mr-2 h-5 w-5" />
                                                    Liabilities
                                                </h3>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg font-bold text-red-700">
                                                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.total_liabilities)}
                                                    </span>
                                                    {expandedSections.includes('liabilities') ? 
                                                        <ChevronDown className="h-5 w-5 text-red-600" /> :
                                                        <ChevronRight className="h-5 w-5 text-red-600" />
                                                    }
                                                </div>
                                            </div>
                                            
                                            {expandedSections.includes('liabilities') && primaryData.liabilities && (
                                                <div className="mt-4 space-y-2">
                                                    {primaryData.liabilities.map((liability: any, index: number) => (
                                                        <div key={index} className="flex justify-between items-center py-2 pl-4 bg-white rounded border">
                                                            <a 
                                                                href={`/finance/transactions?account=${liability.name}`} 
                                                                className="text-red-700 hover:text-red-900 font-medium"
                                                            >
                                                                {liability.name}
                                                            </a>
                                                            <span className="text-red-800 font-semibold">
                                                                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(liability.balance)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Equity */}
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                            <div 
                                                className="flex items-center justify-between cursor-pointer"
                                                onClick={() => toggleSection('equity')}
                                            >
                                                <h3 className="text-lg font-semibold text-green-900 flex items-center">
                                                    <Award className="mr-2 h-5 w-5" />
                                                    Equity
                                                </h3>
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-lg font-bold text-green-700">
                                                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.total_equity)}
                                                    </span>
                                                    {expandedSections.includes('equity') ? 
                                                        <ChevronDown className="h-5 w-5 text-green-600" /> :
                                                        <ChevronRight className="h-5 w-5 text-green-600" />
                                                    }
                                                </div>
                                            </div>
                                            
                                            {expandedSections.includes('equity') && primaryData.equity && (
                                                <div className="mt-4 space-y-2">
                                                    {primaryData.equity.map((equity: any, index: number) => (
                                                        <div key={index} className="flex justify-between items-center py-2 pl-4 bg-white rounded border">
                                                            <a 
                                                                href={`/finance/transactions?account=${equity.name}`} 
                                                                className="text-green-700 hover:text-green-900 font-medium"
                                                            >
                                                                {equity.name}
                                                            </a>
                                                            <span className="text-green-800 font-semibold">
                                                                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(equity.balance)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Balance Verification */}
                                    <div className="md:col-span-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg p-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-bold text-indigo-900 flex items-center">
                                                <CheckCircle2 className="mr-2 h-6 w-6 text-green-600" />
                                                Balance Verification
                                            </h3>
                                            <div className="text-right">
                                                <p className="text-sm text-indigo-700">Total Assets</p>
                                                <p className="text-lg font-bold text-indigo-900">
                                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.total_assets)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-center">
                                            <div className="text-center">
                                                <p className="text-sm text-indigo-600">Liabilities + Equity</p>
                                                <p className="text-lg font-bold text-indigo-800">
                                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.total_liabilities_and_equity)}
                                                </p>
                                                <div className="mt-2">
                                                    {Math.abs(primaryData.total_assets - primaryData.total_liabilities_and_equity) < 1 ? (
                                                        <div className="flex items-center text-green-600">
                                                            <CheckCircle2 className="mr-1 h-4 w-4" />
                                                            <span className="text-sm font-medium">Balance Sheet Balanced ✓</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center text-red-600">
                                                            <AlertTriangle className="mr-1 h-4 w-4" />
                                                            <span className="text-sm font-medium">Balance Difference Detected</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium">Asset Composition</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CustomPieChart 
                                                data={[
                                                    { name: 'Assets', value: primaryData.total_assets },
                                                    { name: 'Liabilities', value: primaryData.total_liabilities },
                                                    { name: 'Equity', value: primaryData.total_equity }
                                                ]} 
                                                dataKey="value" 
                                                nameKey="name" 
                                            />
                                        </CardContent>
                                    </Card>
                                    
                                    {primaryData.assets && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="text-sm font-medium">Asset Distribution</CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CustomBarChart 
                                                    data={primaryData.assets.map((asset: any) => ({
                                                        name: asset.name.substring(0, 10) + (asset.name.length > 10 ? '...' : ''),
                                                        value: asset.balance
                                                    }))} 
                                                    barKey="value" 
                                                    xAxisKey="name" 
                                                />
                                            </CardContent>
                                        </Card>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

// Enhanced Profit & Loss Statement with Smart Analytics
const EnhancedProfitAndLossStatement = () => {
    const reportRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [dateRange, setDateRange] = useState('this_month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [viewMode, setViewMode] = useState<'standard' | 'comparative' | 'trend'>('standard');
    const [expandedSections, setExpandedSections] = useState<string[]>(['revenue', 'expenses']);

    const getDates = (range: string, customStart: string, customEnd: string) => {
        const today = new Date();
        let start = '';
        let end = new Date().toISOString().split('T')[0];

        switch (range) {
            case 'today':
                start = end;
                break;
            case 'this_week':
                const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
                start = startOfWeek.toISOString().split('T')[0];
                break;
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
        }
        return { start, end };
    };

    const { start: startDate, end: endDate } = getDates(dateRange, customStartDate, customEndDate);

    const { data: apiResponse, isLoading, error, refetch } = useProfitAndLoss({
        start_date: startDate,
        end_date: endDate,
    });

    const data = apiResponse?.data as ProfitAndLossData;
    const primaryData = data?.primary;

    const handleGenerateReport = useCallback(() => {
        refetch();
    }, [refetch]);

    const handleExport = useCallback(async (format: 'excel' | 'pdf' | 'email') => {
        setIsExporting(true);
        try {
            if (format === 'email') {
                // Implement email sharing
                console.log('Email sharing functionality to be implemented');
                return;
            }
            
            if (format === 'pdf') {
                const canvas = await html2canvas(reportRef.current!, {
                    backgroundColor: '#ffffff',
                    scale: 2
                });
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                
                // Enhanced PDF with branding and formatting
                pdf.setFontSize(20);
                pdf.text('Profit & Loss Statement', 20, 20);
                pdf.setFontSize(12);
                pdf.text(`Period: ${startDate} to ${endDate}`, 20, 30);
                pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
                
                const imgWidth = 170;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 20, 45, imgWidth, imgHeight);
                
                pdf.save(`P&L_Statement_${new Date().toISOString().split('T')[0]}.pdf`);
            } else {
                const response = await api.get(`/finance/reports/profit-and-loss/export?format=${format}&start_date=${startDate}&end_date=${endDate}`, {
                    responseType: 'blob',
                });
                const blob = new Blob([response.data as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `P&L_Statement_${new Date().toISOString().split('T')[0]}.xlsx`);
            }
        } catch (error) {
            console.error('Failed to export report', error);
        } finally {
            setIsExporting(false);
        }
    }, [startDate, endDate]);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => 
            prev.includes(section) 
                ? prev.filter(s => s !== section)
                : [...prev, section]
        );
    };

    const profitMetrics = useMemo(() => {
        if (!primaryData) return null;
        
        const grossMargin = ((primaryData.revenue - (primaryData.expenses * 0.6)) / primaryData.revenue * 100) || 0;
        const netMargin = ((primaryData.net_income / primaryData.revenue) * 100) || 0;
        const operatingMargin = (((primaryData.revenue - primaryData.expenses) / primaryData.revenue) * 100) || 0;
        
        return { grossMargin, netMargin, operatingMargin };
    }, [primaryData]);

    return (
        <div className="space-y-6">
            {/* Smart Insights */}
            <SmartInsights reportType="pnl" data={data} />
            
            {/* Tax Compliance Helper */}
            <TaxComplianceHelper reportData={data} />
            
            {/* Report Header */}
            <ReportHeader
                title="Profit & Loss Statement"
                subtitle={primaryData?.period ? `${primaryData.period.start_date} to ${primaryData.period.end_date}` : undefined}
                onExport={handleExport}
                isExporting={isExporting}
                onRefresh={handleGenerateReport}
                customActions={
                    <div className="flex items-center space-x-2">
                        <select 
                            value={viewMode} 
                            onChange={(e) => setViewMode(e.target.value as any)}
                            className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="standard">Standard View</option>
                            <option value="comparative">Comparative Analysis</option>
                            <option value="trend">Trend Analysis</option>
                        </select>
                    </div>
                }
            />
            
            {/* Interactive Filters */}
            <ReportFilters
                dateRange={dateRange}
                setDateRange={setDateRange}
                customStartDate={customStartDate}
                setCustomStartDate={setCustomStartDate}
                customEndDate={customEndDate}
                setCustomEndDate={setCustomEndDate}
                onGenerate={handleGenerateReport}
            />

            {isLoading && (
                <Card className="p-12">
                    <div className="flex items-center justify-center">
                        <LoadingSpinner />
                        <span className="ml-3 text-gray-600">Generating financial insights...</span>
                    </div>
                </Card>
            )}
            
            {error && <ErrorMessage message="Failed to load Profit & Loss statement. Please try again." />}
            
            {primaryData && (
                <div ref={reportRef} className="space-y-6">
                    {/* Key Metrics Cards */}
                    {profitMetrics && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-700">Gross Margin</p>
                                            <p className="text-2xl font-bold text-green-900">{profitMetrics.grossMargin.toFixed(1)}%</p>
                                        </div>
                                        <TrendingUp className="h-8 w-8 text-green-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-700">Operating Margin</p>
                                            <p className="text-2xl font-bold text-blue-900">{profitMetrics.operatingMargin.toFixed(1)}%</p>
                                        </div>
                                        <Target className="h-8 w-8 text-blue-600" />
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card className={`bg-gradient-to-r ${profitMetrics.netMargin >= 0 ? 'from-emerald-50 to-green-50 border-emerald-200' : 'from-red-50 to-rose-50 border-red-200'}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`text-sm font-medium ${profitMetrics.netMargin >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Net Margin</p>
                                            <p className={`text-2xl font-bold ${profitMetrics.netMargin >= 0 ? 'text-emerald-900' : 'text-red-900'}`}>
                                                {profitMetrics.netMargin.toFixed(1)}%
                                            </p>
                                        </div>
                                        {profitMetrics.netMargin >= 0 ? (
                                            <Award className="h-8 w-8 text-emerald-600" />
                                        ) : (
                                            <AlertTriangle className="h-8 w-8 text-red-600" />
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Main P&L Report */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-bold text-gray-900">Financial Performance</CardTitle>
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                    <Calendar className="h-4 w-4" />
                                    <span>{primaryData.period?.start_date} to {primaryData.period?.end_date}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Financial Statement */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Revenue Section */}
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                        <div 
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleSection('revenue')}
                                        >
                                            <h3 className="text-lg font-semibold text-green-900 flex items-center">
                                                <DollarSign className="mr-2 h-5 w-5" />
                                                Revenue
                                            </h3>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg font-bold text-green-700">
                                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.revenue)}
                                                </span>
                                                {expandedSections.includes('revenue') ? 
                                                    <ChevronDown className="h-5 w-5 text-green-600" /> :
                                                    <ChevronRight className="h-5 w-5 text-green-600" />
                                                }
                                            </div>
                                        </div>
                                        
                                        {expandedSections.includes('revenue') && primaryData.revenue_accounts && (
                                            <div className="mt-4 space-y-2">
                                                {primaryData.revenue_accounts.map((account: any) => (
                                                    <div key={account.id} className="flex justify-between items-center py-2 pl-4 bg-white rounded border">
                                                        <a 
                                                            href={`/finance/transactions?account=${account.account_name}`} 
                                                            className="text-green-700 hover:text-green-900 font-medium"
                                                        >
                                                            {account.account_name}
                                                        </a>
                                                        <span className="text-green-800 font-semibold">
                                                            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(account.balance || 0)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Expenses Section */}
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                        <div 
                                            className="flex items-center justify-between cursor-pointer"
                                            onClick={() => toggleSection('expenses')}
                                        >
                                            <h3 className="text-lg font-semibold text-red-900 flex items-center">
                                                <Target className="mr-2 h-5 w-5" />
                                                Expenses
                                            </h3>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-lg font-bold text-red-700">
                                                    {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.expenses)}
                                                </span>
                                                {expandedSections.includes('expenses') ? 
                                                    <ChevronDown className="h-5 w-5 text-red-600" /> :
                                                    <ChevronRight className="h-5 w-5 text-red-600" />
                                                }
                                            </div>
                                        </div>
                                        
                                        {expandedSections.includes('expenses') && primaryData.expense_accounts && (
                                            <div className="mt-4 space-y-2">
                                                {primaryData.expense_accounts.map((account: any) => (
                                                    <div key={account.id} className="flex justify-between items-center py-2 pl-4 bg-white rounded border">
                                                        <a 
                                                            href={`/finance/transactions?account=${account.account_name}`} 
                                                            className="text-red-700 hover:text-red-900 font-medium"
                                                        >
                                                            {account.account_name}
                                                        </a>
                                                        <span className="text-red-800 font-semibold">
                                                            {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(account.balance || 0)}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Net Income */}
                                    <div className={`border-2 rounded-lg p-6 ${
                                        primaryData.net_income >= 0 
                                            ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-300' 
                                            : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-300'
                                    }`}>
                                        <div className="flex items-center justify-between">
                                            <h3 className={`text-xl font-bold flex items-center ${
                                                primaryData.net_income >= 0 ? 'text-emerald-900' : 'text-red-900'
                                            }`}>
                                                {primaryData.net_income >= 0 ? (
                                                    <Award className="mr-2 h-6 w-6" />
                                                ) : (
                                                    <AlertTriangle className="mr-2 h-6 w-6" />
                                                )}
                                                Net Income
                                            </h3>
                                            <span className={`text-2xl font-bold ${
                                                primaryData.net_income >= 0 ? 'text-emerald-700' : 'text-red-700'
                                            }`}>
                                                {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(primaryData.net_income)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts and Analytics */}
                                <div className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium">Revenue vs Expenses</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <CustomBarChart 
                                                data={[
                                                    { name: 'Revenue', value: primaryData.revenue },
                                                    { name: 'Expenses', value: primaryData.expenses }
                                                ]} 
                                                barKey="value" 
                                                xAxisKey="name" 
                                            />
                                        </CardContent>
                                    </Card>
                                    
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-sm font-medium">Expense Distribution</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {primaryData.expense_accounts && (
                                                <CustomPieChart 
                                                    data={primaryData.expense_accounts.map((account: any) => ({
                                                        name: account.account_name,
                                                        value: Math.abs(account.balance || 0)
                                                    }))} 
                                                    dataKey="value" 
                                                    nameKey="name" 
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

// Smart Insights Component for AI-Powered Analysis
const SmartInsights = ({ reportType, data }: { reportType: string; data: any }) => {
  const insights = useMemo(() => {
    if (!data) return [];
    
    const insights = [];
    
    if (reportType === 'pnl' && data.primary) {
      const netMargin = ((data.primary.net_income / data.primary.revenue) * 100) || 0;
      const expenseRatio = ((data.primary.expenses / data.primary.revenue) * 100) || 0;
      
      if (netMargin > 20) {
        insights.push({
          type: 'positive',
          icon: Award,
          title: 'Excellent Profitability',
          message: `Your ${netMargin.toFixed(1)}% net profit margin is excellent for African businesses.`
        });
      } else if (netMargin < 5) {
        insights.push({
          type: 'warning',
          icon: AlertTriangle,
          title: 'Low Profit Margin',
          message: `Consider reviewing expenses. Current margin: ${netMargin.toFixed(1)}%`
        });
      }
      
      if (expenseRatio > 80) {
        insights.push({
          type: 'warning',
          icon: Target,
          title: 'High Expense Ratio',
          message: 'Expenses are consuming a large portion of revenue. Review cost structure.'
        });
      }
    }
    
    if (reportType === 'balance_sheet' && data.primary) {
      const currentRatio = (data.primary.current_assets || 0) / (data.primary.current_liabilities || 1);
      if (currentRatio < 1) {
        insights.push({
          type: 'critical',
          icon: AlertTriangle,
          title: 'Liquidity Concern',
          message: 'Current assets may not cover short-term liabilities.'
        });
      } else if (currentRatio > 2) {
        insights.push({
          type: 'positive',
          icon: CheckCircle2,
          title: 'Strong Liquidity',
          message: 'Excellent current ratio indicates good short-term financial health.'
        });
      }
    }
    
    return insights.slice(0, 3); // Limit to 3 insights
  }, [reportType, data]);

  if (insights.length === 0) return null;

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-900">
          <Lightbulb className="mr-2 h-5 w-5 text-yellow-500" />
          Smart Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            const colorClasses = {
              positive: 'border-green-200 bg-green-50 text-green-800',
              warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
              critical: 'border-red-200 bg-red-50 text-red-800'
            };
            
            return (
              <div key={index} className={`p-4 rounded-lg border-2 ${colorClasses[insight.type as keyof typeof colorClasses]}`}>
                <div className="flex items-start space-x-3">
                  <Icon className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">{insight.title}</h4>
                    <p className="text-xs mt-1 opacity-80">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced Report Header with Analytics
const ReportHeader = ({ 
  title, 
  subtitle, 
  onExport, 
  isExporting, 
  onRefresh, 
  customActions 
}: { 
  title: string; 
  subtitle?: string; 
  onExport: (format: 'excel' | 'pdf' | 'email') => void; 
  isExporting: boolean; 
  onRefresh?: () => void;
  customActions?: React.ReactNode;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="mr-3 h-6 w-6 text-blue-600" />
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {customActions}
          
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              className="flex items-center"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          )}
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('pdf')}
              disabled={isExporting}
              className="flex items-center"
            >
              <FileDown className="mr-2 h-4 w-4" />
              {isExporting ? 'Exporting...' : 'PDF'}
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('excel')}
              disabled={isExporting}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Excel
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('email')}
              disabled={isExporting}
              className="flex items-center"
            >
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interactive Filters Component
const ReportFilters = ({ 
  dateRange, 
  setDateRange, 
  customStartDate, 
  setCustomStartDate, 
  customEndDate, 
  setCustomEndDate,
  showComparison = true,
  onGenerate 
}: any) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  return (
    <Card className="mb-6 bg-gradient-to-r from-gray-50 to-slate-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Report Filters
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs"
          >
            {showAdvanced ? 'Simple' : 'Advanced'}
            <ChevronDown className={`ml-1 h-3 w-3 transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Primary Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Period</label>
              <select 
                value={dateRange} 
                onChange={(e) => setDateRange(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="this_quarter">This Quarter</option>
                <option value="last_quarter">Last Quarter</option>
                <option value="this_year">This Year</option>
                <option value="last_year">Last Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Start Date</label>
                  <Input 
                    type="date" 
                    value={customStartDate} 
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">End Date</label>
                  <Input 
                    type="date" 
                    value={customEndDate} 
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}
            
            <div className="flex items-end">
              <Button 
                onClick={onGenerate}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
              >
                <Calculator className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Currency</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option value="all">All Currencies</option>
                    <option value="KES">KES - Kenyan Shilling</option>
                    <option value="UGX">UGX - Ugandan Shilling</option>
                    <option value="TZS">TZS - Tanzanian Shilling</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Report Format</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option value="detailed">Detailed View</option>
                    <option value="summary">Summary Only</option>
                    <option value="comparative">Comparative Analysis</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Include Zero Balances</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// African Business Tax Compliance Helper
const TaxComplianceHelper = ({ reportData }: { reportData: any }) => {
  const taxInsights = useMemo(() => {
    if (!reportData?.primary) return [];
    
    const insights = [];
    const revenue = reportData.primary.revenue || 0;
    
    // VAT Calculation (16% for Kenya, 18% for Uganda, etc.)
    const estimatedVAT = revenue * 0.16;
    
    // Corporate Tax (30% for Kenya)
    const estimatedCorporateTax = (reportData.primary.net_income || 0) * 0.30;
    
    // PAYE considerations
    const estimatedPAYE = revenue * 0.05; // Rough estimate
    
    insights.push({
      title: 'VAT Liability (Est.)',
      amount: estimatedVAT,
      description: 'Estimated VAT based on 16% rate (Kenya)',
      type: 'tax'
    });
    
    insights.push({
      title: 'Corporate Tax (Est.)',
      amount: estimatedCorporateTax,
      description: 'Estimated corporate tax at 30% rate',
      type: 'tax'
    });
    
    insights.push({
      title: 'PAYE Estimate',
      amount: estimatedPAYE,
      description: 'Rough PAYE estimate for planning',
      type: 'payroll'
    });
    
    return insights;
  }, [reportData]);

  return (
    <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center text-green-900">
          <Calculator className="mr-2 h-5 w-5 text-green-600" />
          Tax Compliance Helper
          <div className="ml-auto">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              African Business
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {taxInsights.map((insight, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-gray-900">{insight.title}</h4>
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-lg font-bold text-green-700 mb-1">
                {new Intl.NumberFormat('en-KE', { 
                  style: 'currency', 
                  currency: 'KES' 
                }).format(insight.amount)}
              </p>
              <p className="text-xs text-gray-600">{insight.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <Info className="inline mr-1 h-3 w-3" />
            These are estimates for planning purposes. Consult with a qualified tax advisor for accurate calculations and compliance requirements.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReportsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [selectedReports, setSelectedReports] = useState<string[]>([]);
    const [showBookmarks, setShowBookmarks] = useState(false);

    // Dashboard Overview Data
    const dashboardMetrics = useMemo(() => [
      {
        title: 'Quick P&L',
        value: 'KES 1.2M',
        change: '+12%',
        trend: 'up',
        icon: TrendingUp,
        color: 'green'
      },
      {
        title: 'Cash Position',
        value: 'KES 450K',
        change: '-5%',
        trend: 'down',
        icon: DollarSign,
        color: 'blue'
      },
      {
        title: 'Monthly Revenue',
        value: 'KES 2.8M',
        change: '+8%',
        trend: 'up',
        icon: BarChart3,
        color: 'green'
      },
      {
        title: 'Expense Ratio',
        value: '68%',
        change: '-3%',
        trend: 'down',
        icon: Target,
        color: 'orange'
      }
    ], []);

    return (
        <ProtectedRoute>
            <DashboardLayout>
                {/* Enhanced Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <BookOpen className="mr-3 h-8 w-8 text-blue-600" />
                                Financial Reports Center
                            </h1>
                            <p className="text-gray-600 mt-2">Comprehensive financial analysis and reporting for African businesses</p>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setShowBookmarks(!showBookmarks)}
                                className="flex items-center"
                            >
                                <Bookmark className="mr-2 h-4 w-4" />
                                Bookmarks
                            </Button>
                            
                            <Button variant="outline" onClick={() => router.push('/finance')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Finance
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Overview */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Quick Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {dashboardMetrics.map((metric, index) => {
                                const Icon = metric.icon;
                                const colorClasses = {
                                    green: 'from-green-400 to-green-600',
                                    blue: 'from-blue-400 to-blue-600',
                                    orange: 'from-orange-400 to-orange-600',
                                    red: 'from-red-400 to-red-600'
                                };
                                
                                return (
                                    <Card key={index} className="relative overflow-hidden">
                                        <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[metric.color as keyof typeof colorClasses]} opacity-5`} />
                                        <CardContent className="p-6">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                                    <div className="flex items-center mt-2">
                                                        {metric.trend === 'up' ? (
                                                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                                                        ) : (
                                                            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                                                        )}
                                                        <span className={`text-sm font-medium ${
                                                            metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                                        }`}>
                                                            {metric.change}
                                                        </span>
                                                        <span className="text-sm text-gray-500 ml-1">vs last month</span>
                                                    </div>
                                                </div>
                                                <div className={`p-3 rounded-full bg-gradient-to-r ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                                                    <Icon className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                        
                        {/* Report Templates */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                                    Quick Report Templates
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[
                                        { name: 'Monthly P&L', desc: 'Profit & Loss for current month', icon: BarChart3, action: () => setActiveTab('pnl') },
                                        { name: 'Cash Flow', desc: 'Cash movement analysis', icon: LineChart, action: () => setActiveTab('cash_flow') },
                                        { name: 'Balance Sheet', desc: 'Financial position snapshot', icon: PieChart, action: () => setActiveTab('balance_sheet') },
                                        { name: 'Tax Summary', desc: 'VAT and tax compliance report', icon: Calculator, action: () => {} },
                                        { name: 'A/R Aging', desc: 'Customer payment analysis', icon: Clock, action: () => setActiveTab('ar_aging') },
                                        { name: 'Custom Report', desc: 'Build your own report', icon: Settings, action: () => {} }
                                    ].map((template, index) => {
                                        const Icon = template.icon;
                                        return (
                                            <div 
                                                key={index} 
                                                onClick={template.action}
                                                className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200 group"
                                            >
                                                <div className="flex items-center space-x-3">
                                                    <Icon className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                    <div>
                                                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                                                        <p className="text-sm text-gray-500">{template.desc}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Enhanced Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6 mb-6">
                        <TabsTrigger value="dashboard" className="flex items-center">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </TabsTrigger>
                        <TabsTrigger value="pnl" className="flex items-center">
                            <TrendingUp className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">P&L</span>
                        </TabsTrigger>
                        <TabsTrigger value="balance_sheet" className="flex items-center">
                            <PieChart className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Balance Sheet</span>
                        </TabsTrigger>
                        <TabsTrigger value="cash_flow" className="flex items-center">
                            <LineChart className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Cash Flow</span>
                        </TabsTrigger>
                        <TabsTrigger value="equity" className="flex items-center">
                            <Award className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Equity</span>
                        </TabsTrigger>
                        <TabsTrigger value="ar_aging" className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">A/R Aging</span>
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pnl">
                        <EnhancedProfitAndLossStatement />
                    </TabsContent>
                    <TabsContent value="balance_sheet">
                        <EnhancedBalanceSheetStatement />
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
