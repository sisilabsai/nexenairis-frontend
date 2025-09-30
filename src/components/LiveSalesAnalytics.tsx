'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSalesHistory, useDailySalesSummary } from '../hooks/useApi';
import {
  ArrowDownTrayIcon,
  ShoppingCartIcon,
  UserIcon,
  ChevronDownIcon,
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

// Skeleton Loader Component
const SaleSkeleton = () => (
  <div className="p-3 bg-gray-50 rounded-lg animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
          <div className="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export default function LiveSalesAnalytics() {
  type SaleItem = {
    product_name: string;
    quantity: number;
    unit_price: number;
  };

  type Sale = {
    id: string | number;
    customer_name?: string;
    items: SaleItem[];
    total_amount: number;
    transaction_date: string;
    created_at?: string;
  };

  type SalesHistoryResponse = {
    data: {
      data: Sale[];
    };
  };

  type DailySummary = {
    total_revenue: number;
    total_transactions: number;
  };

  type DailySalesSummaryResponse = {
    data: {
      summary: DailySummary;
    };
  };

  const [filterPeriod, setFilterPeriod] = useState('today');
  
  const { startDate, endDate } = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    end.setHours(23, 59, 59, 999); // End of today
    const start = new Date(today);
    start.setHours(0, 0, 0, 0); // Start of today

    switch (filterPeriod) {
      case '7days':
        start.setDate(today.getDate() - 6);
        break;
      case '30days':
        start.setDate(today.getDate() - 29);
        break;
    }
    return { 
      startDate: start.toISOString(), 
      endDate: end.toISOString() 
    };
  }, [filterPeriod]);

  const { data: salesHistoryData, isLoading: isHistoryLoading } = useSalesHistory({
    per_page: 100, // Fetch more for filtering/downloading
    status: 'completed',
    start_date: startDate,
    end_date: endDate,
    refetchInterval: filterPeriod === 'today' ? 5000 : 0, // Only refetch for today's view
  }) as { data: SalesHistoryResponse; isLoading: boolean };

  const { data: dailySalesSummaryData } = useDailySalesSummary({ 
    refetchInterval: 5000,
    enabled: filterPeriod === 'today',
  }) as { data: DailySalesSummaryResponse };

  const [sales, setSales] = useState<Sale[]>([]);
  const [expandedSale, setExpandedSale] = useState<string | number | null>(null);
  const [newSaleIds, setNewSaleIds] = useState<Set<string | number>>(new Set());
  const [isMuted, setIsMuted] = useState(true); // Muted by default
  const audioRef = useRef<HTMLAudioElement>(null);

  const summary = useMemo(() => dailySalesSummaryData?.data?.summary, [dailySalesSummaryData]);

  useEffect(() => {
    if (salesHistoryData?.data?.data) {
      const newSales = salesHistoryData.data.data;
      if (filterPeriod === 'today') {
        const existingSaleIds = new Set(sales.map(s => s.id));
        const incomingNewSales = newSales.filter(s => !existingSaleIds.has(s.id));

        if (incomingNewSales.length > 0 && sales.length > 0 && !isMuted) {
          audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
          const newIds = new Set(incomingNewSales.map(s => s.id));
          setNewSaleIds(newIds);
          setTimeout(() => setNewSaleIds(new Set()), 2000);
        }
      }
      setSales(newSales);
    }
  }, [salesHistoryData, isMuted, filterPeriod]);

  const toggleSaleDetails = (id: string | number) => {
    setExpandedSale(expandedSale === id ? null : id);
  };

  const handleDownload = () => {
    if (sales.length === 0) {
      alert("No sales data to download.");
      return;
    }

    const headers = ['Transaction ID', 'Customer', 'Date', 'Time', 'Total Amount (UGX)', 'Product Name', 'Quantity', 'Unit Price (UGX)', 'Line Total (UGX)'];
    let csvContent = headers.join(',') + '\n';

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const dateSource = sale.created_at ?? sale.transaction_date;
        const row = [
          sale.id,
          `"${sale.customer_name || 'Walk-in Customer'}"`,
          new Date(dateSource).toLocaleDateString(),
          new Date(dateSource).toLocaleTimeString(),
          sale.total_amount,
          `"${item.product_name}"`,
          item.quantity,
          item.unit_price,
          item.quantity * item.unit_price
        ].join(',');
        csvContent += row + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${filterPeriod}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <audio ref={audioRef} src="/sounds/cash-register.mp3" preload="auto" />
      
      <div className="border-b pb-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            {filterPeriod === 'today' && <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>}
            {filterPeriod === 'today' ? 'Live Sales Feed' : 'Sales History'}
          </h3>
          <div className="flex items-center space-x-2">
            <button onClick={() => setIsMuted(!isMuted)} className="p-2 text-gray-500 hover:text-gray-700" title={isMuted ? "Unmute Notifications" : "Mute Notifications"}>
              {isMuted ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
            </button>
            <div className="relative">
              <CalendarIcon className="h-5 w-5 text-gray-500 absolute top-1/2 left-3 -translate-y-1/2" />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                className="pl-10 pr-4 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 appearance-none"
              >
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
            <button onClick={handleDownload} className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center">
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Download
            </button>
          </div>
        </div>
        
        {filterPeriod === 'today' && (
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center text-green-700">
                <CurrencyDollarIcon className="h-6 w-6 mr-2" />
                <span className="font-medium">Today's Revenue</span>
              </div>
              <p className="text-2xl font-bold text-green-800 mt-1">
                UGX {summary?.total_revenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center text-blue-700">
                <ReceiptPercentIcon className="h-6 w-6 mr-2" />
                <span className="font-medium">Transactions</span>
              </div>
              <p className="text-2xl font-bold text-blue-800 mt-1">
                {summary?.total_transactions || '0'}
              </p>
            </div>
          </div>
        )}
      </div>

      {isHistoryLoading && sales.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <SaleSkeleton key={i} />)}
        </div>
      ) : sales.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-gray-500">No sales found for the selected period.</p>
        </div>
      ) : (
        <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {sales.map((sale: Sale) => (
            <li 
              key={sale.id} 
              className={`rounded-lg transition-all duration-500 ${newSaleIds.has(sale.id) ? 'bg-green-100 shadow-lg scale-105' : 'bg-gray-50'}`}
            >
              <button 
                onClick={() => toggleSaleDetails(sale.id)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 p-2 rounded-full">
                      {sale.customer_name ? <UserIcon className="h-5 w-5 text-gray-600" /> : <ShoppingCartIcon className="h-5 w-5 text-gray-600" />}
                    </div>
                    <div>
                      <p className="font-semibold">{sale.customer_name || 'Walk-in Customer'}</p>
                      <p className="text-sm text-gray-600">{sale.items.reduce((acc, item) => acc + item.quantity, 0)} items</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-3">
                    <div>
                      <p className="font-semibold text-green-600">UGX {sale.total_amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{new Date(sale.created_at ?? sale.transaction_date).toLocaleTimeString()}</p>
                    </div>
                    <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform ${expandedSale === sale.id ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>
              {expandedSale === sale.id && (
                <div className="px-4 pb-3 mt-1 border-t border-gray-200">
                  <ul className="mt-2 space-y-1 text-sm text-gray-700">
                    {sale.items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center py-1">
                        <div>
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-mono font-semibold">UGX {(item.quantity * item.unit_price).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
