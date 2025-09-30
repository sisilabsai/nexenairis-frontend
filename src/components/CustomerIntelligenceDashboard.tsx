'use client';

import { useState, useMemo } from 'react';
import { useContacts, useCustomerSegmentationAI } from '../hooks/useApi';
import { 
  UserGroupIcon, 
  MagnifyingGlassIcon, 
  SparklesIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CalendarIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from './LoadingSpinner';
import { api } from '../lib/api';

// Type definitions for segments from backend
type Segment = {
  customer_id: number;
  customer_name: string;
  segment: 'VIP' | 'High Value' | 'At Risk' | 'New' | 'Loyal Regular' | 'Potential Growth' | 'General';
  total_spent: number;
  transaction_count: number;
  last_purchase_date: string | null;
  days_since_last_purchase: number;
  avg_order_value: number;
  customer_lifetime_days: number;
  loyalty_points: number;
  risk_score: number;
  clv_estimate: number;
  next_best_action: string;
};

type CustomerSegmentationResponse = {
  data: {
    segments: Segment[];
    insights?: any;
    summary?: any;
  };
};

export default function CustomerIntelligenceDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(100);
  const [selectedSegmentFilter, setSelectedSegmentFilter] = useState<string>('All');

  const { data: contactsData, isLoading: isLoadingContacts, refetch: refetchContacts } = useContacts({ per_page: 100 });
  const { data: segmentationData, isLoading: isLoadingSegmentation } = useCustomerSegmentationAI();

  // Merge CRM contacts with AI segmentation data
  const customers = useMemo(() => {
    const contacts = contactsData?.data?.data || [];
    const segments = (segmentationData as CustomerSegmentationResponse | undefined)?.data?.segments || [];
    
    return contacts.map((contact: any) => {
      const segment = segments.find((s: any) => s.customer_id === contact.id);
      if (segment) {
        // Use the enhanced data from segmentation when available
        return {
          ...contact,
          segment: segment.segment,
          total_spent: segment.total_spent,
          transaction_count: segment.transaction_count,
          avg_order_value: segment.avg_order_value,
          risk_score: segment.risk_score,
          clv_estimate: segment.clv_estimate,
          next_best_action: segment.next_best_action,
          days_since_last_purchase: segment.days_since_last_purchase,
          last_purchase_date: segment.last_purchase_date,
          loyalty_points: segment.loyalty_points // Use real-time calculated loyalty points
        };
      } else {
        // Fallback to original contact data
        return { 
          ...contact, 
          segment: 'General',
          total_spent: contact.total_purchases || 0,
          transaction_count: 0,
          avg_order_value: 0,
          risk_score: 0,
          clv_estimate: 0,
          next_best_action: 'Contact to understand needs better',
          days_since_last_purchase: 999,
          last_purchase_date: contact.last_purchase
        };
      }
    });
  }, [contactsData, segmentationData]);

  const insights = useMemo(() => {
    return (segmentationData as CustomerSegmentationResponse | undefined)?.data?.insights;
  }, [segmentationData]);

  const filteredCustomers = useMemo(() => {
    let filtered = customers;
    
    if (selectedSegmentFilter !== 'All') {
      filtered = filtered.filter(customer => customer.segment === selectedSegmentFilter);
    }
    
    if (searchTerm) {
      filtered = filtered.filter((customer: any) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.segment.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => b.total_spent - a.total_spent);
  }, [customers, searchTerm, selectedSegmentFilter]);

  const handleSelectCustomer = async (customer: any) => {
    setSelectedCustomer(customer);
    if (customer) {
      try {
        const { data } = await api.get<{ data: any[] }>(`/sales/transactions?contact_id=${customer.id}`);
        setRecentTransactions(data?.data || []);
      } catch (error) {
        setRecentTransactions([]);
      }
    } else {
      setRecentTransactions([]);
    }
  };

  const handleRedeemPoints = async () => {
    if (!selectedCustomer || pointsToRedeem < 100) {
      alert('Please enter a value of 100 or more.');
      return;
    }

    try {
      await api.post('/sales/redeem-points', {
        contact_id: selectedCustomer.id,
        points_to_redeem: pointsToRedeem,
      });
      alert('Points redeemed successfully!');
      setIsRedeemModalOpen(false);
      // Refresh both contacts and segmentation data to get updated loyalty points
      refetchContacts();
      window.location.reload(); // Force a complete refresh to ensure all data is updated
    } catch (error) {
      alert('Failed to redeem points.');
    }
  };

  const getSegmentBadgeStyle = (segment: string) => {
    const styles = {
      'VIP': 'bg-purple-100 text-purple-800 border-purple-200',
      'High Value': 'bg-green-100 text-green-800 border-green-200',
      'At Risk': 'bg-red-100 text-red-800 border-red-200',
      'New': 'bg-blue-100 text-blue-800 border-blue-200',
      'Loyal Regular': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Potential Growth': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'General': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return styles[segment as keyof typeof styles] || styles.General;
  };

  const getRiskBadgeStyle = (riskScore: number) => {
    if (riskScore > 0.7) return 'bg-red-100 text-red-800 border-red-200';
    if (riskScore > 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const formatCurrency = (amount: number) => {
    return `UGX ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoadingContacts || isLoadingSegmentation) {
    return <div className="flex justify-center items-center p-8"><LoadingSpinner /></div>;
  }

  const uniqueSegments = ['All', ...Array.from(new Set(customers.map(c => c.segment)))];

  return (
    <div className="space-y-6">
      {/* Intelligence Overview Cards */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-gray-900">{insights.total_customers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.total_revenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ChartBarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Revenue/Customer</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights.average_revenue_per_customer)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Risk Customers</p>
                <p className="text-2xl font-bold text-gray-900">{insights.high_risk_customers}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Customer List */}
        <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <UserGroupIcon className="h-6 w-6 mr-2 text-purple-600" />
              Customer Intelligence
            </h3>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Segment Filter */}
              <select
                value={selectedSegmentFilter}
                onChange={(e) => setSelectedSegmentFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                {uniqueSegments.map(segment => (
                  <option key={segment} value={segment}>{segment}</option>
                ))}
              </select>
              
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Segment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Purchase</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer: any) => (
                  <tr 
                    key={customer.id} 
                    onClick={() => handleSelectCustomer(customer)} 
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${getSegmentBadgeStyle(customer.segment)}`}>
                        {customer.segment}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(customer.total_spent)}</div>
                      {customer.avg_order_value > 0 && (
                        <div className="text-xs text-gray-500">Avg: {formatCurrency(customer.avg_order_value)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.transaction_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(customer.last_purchase_date)}</div>
                      {customer.days_since_last_purchase < 999 && (
                        <div className="text-xs text-gray-500">{customer.days_since_last_purchase} days ago</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel - Customer Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <StarIcon className="h-5 w-5 mr-2 text-purple-600" />
            Customer Profile
          </h3>
          {selectedCustomer ? (
            <div className="space-y-6">
              {/* Customer Header */}
              <div className="border-b pb-4">
                <h4 className="text-xl font-bold text-gray-900">{selectedCustomer.name}</h4>
                <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                <div className="mt-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSegmentBadgeStyle(selectedCustomer.segment)}`}>
                    {selectedCustomer.segment}
                  </span>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Total Spent</p>
                        <p className="text-sm font-bold text-blue-900">{formatCurrency(selectedCustomer.total_spent)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <ShoppingCartIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Transactions</p>
                        <p className="text-sm font-bold text-green-900">{selectedCustomer.transaction_count}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced analytics if available */}
                {selectedCustomer.clv_estimate > 0 && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-medium text-gray-900 mb-2">Advanced Analytics</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer Lifetime Value:</span>
                        <span className="font-medium">{formatCurrency(selectedCustomer.clv_estimate)}</span>
                      </div>
                      {selectedCustomer.risk_score > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Risk Score:</span>
                          <span className={`font-medium ${selectedCustomer.risk_score > 0.7 ? 'text-red-600' : selectedCustomer.risk_score > 0.4 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {(selectedCustomer.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Avg Order Value:</span>
                        <span className="font-medium">{formatCurrency(selectedCustomer.avg_order_value)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Loyalty Points:</span>
                    <span className="font-medium">{selectedCustomer.loyalty_points || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Customer Since:</span>
                    <span className="font-medium">{selectedCustomer.created_at ? new Date(selectedCustomer.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>

                {/* Loyalty Points Actions */}
                {(selectedCustomer.loyalty_points || 0) >= 100 && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">Loyalty Points: {selectedCustomer.loyalty_points}</p>
                      <button 
                        onClick={() => setIsRedeemModalOpen(true)}
                        className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Recommendation */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h5 className="font-medium text-purple-900 mb-2 flex items-center">
                    <SparklesIcon className="h-5 w-5 text-purple-600 mr-2" />
                    Aida's Next Best Action
                  </h5>
                  <p className="text-sm text-purple-800">
                    {selectedCustomer.next_best_action || (
                      selectedCustomer.segment === 'High Value' ? `Nurture this relationship. Offer exclusive access to new products.` :
                      selectedCustomer.segment === 'At Risk' ? `Re-engage with a personalized 20% discount offer on their favorite category.` :
                      selectedCustomer.segment === 'New' ? `Encourage a second purchase with a "come back soon" 10% voucher.` :
                      `Offer a small discount on their next purchase to build loyalty.`
                    )}
                  </p>
                </div>

                {/* Recent Transactions */}
                <div className="border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Recent Transactions</h5>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {recentTransactions.slice(0, 5).map((tx: any) => (
                        <div key={tx.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                          <div className="text-gray-600">
                            <div>{tx.display_datetime || tx.formatted_datetime || new Date(tx.created_at || tx.transaction_date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {tx.formatted_time || new Date(tx.created_at || tx.transaction_date).toLocaleTimeString()}
                            </div>
                          </div>
                          <span className="font-medium text-gray-900">{formatCurrency(tx.total_amount)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No recent transactions.</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Select a customer to view their detailed analytics.</p>
            </div>
          )}
        </div>
      </div>

      {/* Loyalty Points Redemption Modal */}
      {isRedeemModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Redeem Loyalty Points</h3>
            <p className="mb-2">Redeem points for <strong>{selectedCustomer.name}</strong></p>
            <p className="mb-4 text-sm text-gray-600">Available Points: <strong>{selectedCustomer.loyalty_points}</strong></p>
            <input 
              type="number"
              value={pointsToRedeem}
              onChange={(e) => setPointsToRedeem(Number(e.target.value))}
              className="border rounded w-full py-2 px-3 mb-4"
              min="100"
              max={selectedCustomer.loyalty_points}
              placeholder="Enter points to redeem (min 100)"
            />
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsRedeemModalOpen(false)} 
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button 
                onClick={handleRedeemPoints} 
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400"
                disabled={pointsToRedeem < 100 || pointsToRedeem > selectedCustomer.loyalty_points}
              >
                Confirm Redemption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}