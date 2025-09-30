'use client';

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import {
  CubeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  ShoppingCartIcon,
  UserIcon,
  TagIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  StarIcon,
  QrCodeIcon,
  ChartBarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LoadingSpinner from '../../components/LoadingSpinner';

import DashboardLayout from '../../components/DashboardLayout';
import {
  useProducts,
  useProcessTransaction,
  useSalesHistory,
  useSmartRecommendations,
  useDynamicPricing,
  useDailySalesSummary,
  useSalesAnalytics,
  useHourlySalesPattern,
  useTopSellingProducts,
  useContacts,
  useTenantSettings,
  useAuth
} from '../../hooks/useApi';
import ProtectedRoute from '../../components/ProtectedRoute';
import Receipt from '@/components/Receipt';
import { Tenant } from '@/types';
import CustomerSelectionModal from '../../components/CustomerSelectionModal';

// Lazy load the view components
const PosView = lazy(() => import('../../components/sales/PosView'));
const AnalyticsView = lazy(() => import('../../components/sales/AnalyticsView'));
const CustomerIntelligenceView = lazy(() => import('../../components/sales/CustomerIntelligenceView'));
const HistoryView = lazy(() => import('../../components/sales/HistoryView'));
const ReceiptsView = lazy(() => import('../../components/sales/ReceiptsView'));

// SALES & POS INTERFACES (These should eventually be moved to a types file)
interface CartItem {
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  discount_percent: number;
  discount_amount: number;
  line_total: number;
  available_stock: number;
  category: string;
  image?: string;
}

interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  loyalty_points: number;
  total_purchases: number;
  customer_type: 'regular' | 'vip' | 'wholesale';
  last_purchase: string;
}

interface PaymentMethod {
  type: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'credit';
  amount: number;
  reference?: string;
  provider?: string;
}

export default function SalesPage() {
  // STATE
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [smartRecommendations, setSmartRecommendations] = useState<any[]>([]);
  const [dynamicPricing, setDynamicPricing] = useState<any[]>([]);
  const [dailySalesSummary, setDailySalesSummary] = useState<any>(null);
  const [isLoadingSalesData, setIsLoadingSalesData] = useState(false);
  const [hourlyPattern, setHourlyPattern] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [taxSettings, setTaxSettings] = useState({
    defaultRate: 0.18,
    taxablePaymentMethods: ['card', 'mobile_money', 'bank_transfer'],
  });
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([
    { id: 'cash', name: 'Cash' },
    { id: 'card', name: 'Card' },
    { id: 'mobile_money', name: 'Mobile Money' },
    { id: 'bank_transfer', name: 'Bank Transfer' },
    { id: 'credit', name: 'Credit' },
  ]);
  const [momoReference, setMomoReference] = useState('');
  const [customAlert, setCustomAlert] = useState<{
    show: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  });
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [salesMode, setSalesMode] = useState<'pos' | 'analytics' | 'customers' | 'history' | 'receipts'>('pos');
  const [selectedPaymentType, setSelectedPaymentType] = useState<'cash' | 'card' | 'mobile_money' | 'bank_transfer' | 'credit'>('cash');
  const [animatedProductId, setAnimatedProductId] = useState<number | null>(null);

  // DATA FETCHING
  const { data: productsData, refetch: refetchProducts } = useProducts({});
  const { data: contactsData } = useContacts();
  const { data: tenantSettingsData, isLoading: isTenantLoading, error: tenantError } = useTenantSettings();
  const { me } = useAuth();
  const processTransactionMutation = useProcessTransaction();
  const { data: dailySalesSummaryData } = useDailySalesSummary();
  const { data: hourlySalesPatternData } = useHourlySalesPattern();
  const { data: topSellingProductsData } = useTopSellingProducts();

  const products = (productsData?.data?.data as unknown as any[]) || [];
  const contacts = (contactsData?.data?.data as unknown as any[]) || [];

  useEffect(() => {
    if (tenantSettingsData?.data) {
      const settings = tenantSettingsData.data as any;
      if (settings.tax_settings) {
        setTaxSettings({
          defaultRate: settings.tax_settings.defaultRate / 100,
          taxablePaymentMethods: settings.tax_settings.taxablePaymentMethods,
        });
      }
    }
  }, [tenantSettingsData]);
  
  const tenant = useMemo(() => {
    if (me?.data?.data?.user?.tenant) {
      return me.data.data.user.tenant;
    }
    return {
      name: 'NEXEN AIRIS',
      address: 'Kampala',
      contactInfo: 'info@singo.com',
      company_name: 'NEXEN AIRIS',
      company_address: 'Plot 19 - Ntinda Kampala',
      company_phone: '',
      company_email: '',
      currency: 'UGX',
      logo: '',
    };
  }, [me]);

  const receiptComponentRef = useRef(null);
  const [lastSale, setLastSale] = useState<any>(null);

  // FUNCTIONS
  const addToCart = (product: any, quantity: number = 1) => {
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { 
              ...item, 
              quantity: Math.min(item.quantity + quantity, item.available_stock),
              line_total: (Math.min(item.quantity + quantity, item.available_stock)) * item.unit_price * (1 - item.discount_percent / 100)
            }
          : item
      ));
    } else {
      const cartItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: parseFloat(product.selling_price) || 0,
        quantity: Math.min(quantity, product.current_stock || 0),
        discount_percent: 0,
        discount_amount: 0,
        line_total: Math.min(quantity, product.current_stock || 0) * (parseFloat(product.selling_price) || 0),
        available_stock: product.current_stock || 0,
        category: product.category || 'General',
        image: product.image
      };
      setCart([...cart, cartItem]);
    }
    setAnimatedProductId(product.id);
    setTimeout(() => setAnimatedProductId(null), 500);
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const updateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.product_id === productId 
        ? { 
            ...item, 
            quantity: Math.min(newQuantity, item.available_stock),
            line_total: Math.min(newQuantity, item.available_stock) * item.unit_price * (1 - item.discount_percent / 100)
          }
        : item
    ));
  };

  const applyItemDiscount = (productId: number, discountPercent: number) => {
    setCart(cart.map(item => 
      item.product_id === productId 
        ? { 
            ...item, 
            discount_percent: Math.min(discountPercent, 100),
            discount_amount: item.quantity * item.unit_price * (discountPercent / 100),
            line_total: item.quantity * item.unit_price * (1 - discountPercent / 100)
          }
        : item
    ));
  };

  const addToCartWithDiscount = (product: any, discountPercent: number) => {
    const quantity = 1;
    const newCart = [...cart];
    const existingItemIndex = newCart.findIndex(item => item.product_id === product.id);

    if (existingItemIndex > -1) {
      const existingItem = newCart[existingItemIndex];
      const newQuantity = Math.min(existingItem.quantity + quantity, existingItem.available_stock);
      const newDiscountPercent = Math.min(discountPercent, 100);
      existingItem.quantity = newQuantity;
      existingItem.discount_percent = newDiscountPercent;
      existingItem.discount_amount = newQuantity * existingItem.unit_price * (newDiscountPercent / 100);
      existingItem.line_total = newQuantity * existingItem.unit_price * (1 - newDiscountPercent / 100);
    } else {
      const newDiscountPercent = Math.min(discountPercent, 100);
      const unitPrice = parseFloat(product.selling_price) || 0;
      const newQuantity = Math.min(quantity, product.current_stock || 0);
      
      const cartItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        unit_price: unitPrice,
        quantity: newQuantity,
        discount_percent: newDiscountPercent,
        discount_amount: newQuantity * unitPrice * (newDiscountPercent / 100),
        line_total: newQuantity * unitPrice * (1 - newDiscountPercent / 100),
        available_stock: product.current_stock || 0,
        category: product.category || 'General',
        image: product.image
      };
      newCart.push(cartItem);
    }
    setCart(newCart);
  };

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const discountTotal = cart.reduce((sum, item) => sum + item.discount_amount, 0) + (subtotal * globalDiscount / 100);
    const taxableAmount = subtotal - discountTotal;
    const isTaxable = taxSettings.taxablePaymentMethods.includes(selectedPaymentType);
    const taxAmount = isTaxable ? taxableAmount * taxSettings.defaultRate : 0;
    const total = taxableAmount + taxAmount;
    
    return {
      subtotal,
      discountTotal,
      taxAmount,
      total,
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0)
    };
  }, [cart, globalDiscount, taxSettings, selectedPaymentType]);

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setCustomAlert({ show: true, type, title, message });
    setTimeout(() => setCustomAlert(prev => ({ ...prev, show: false })), 5000);
  };

  const processTransaction = async () => {
    if (cart.length === 0) {
      showAlert('warning', 'Empty Cart', 'Please add items to cart before checkout');
      return;
    }

    if (selectedPaymentType === 'credit' && !selectedCustomer) {
      showAlert('warning', 'Customer Required', 'Please select a customer for credit sales.');
      return;
    }

    const currentPaymentMethods = [{
        type: selectedPaymentType,
        amount: cartTotals.total,
        reference: selectedPaymentType === 'mobile_money' ? momoReference : `${selectedPaymentType.toUpperCase()}-${Date.now()}`
    }];

    try {
      const transactionData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          discount_percent: item.discount_percent || 0
        })),
        customer_id: selectedCustomer?.id || null,
        subtotal: cartTotals.subtotal,
        discount_total: cartTotals.discountTotal,
        tax_amount: cartTotals.taxAmount,
        total_amount: cartTotals.total,
        payment_methods: currentPaymentMethods,
        notes: ''
      };

      const result = await processTransactionMutation.mutateAsync(transactionData);

      const transactionId = (result as any)?.data?.transaction_number || (result as any)?.data?.id || `TXN-${Date.now()}`;
      const saleData = {
        id: transactionId,
        date: new Date().toISOString(),
        items: cart.map(item => ({
          name: item.product_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.line_total
        })),
        subtotal: cartTotals.subtotal,
        tax: cartTotals.taxAmount,
        total: cartTotals.total,
        customerName: contacts.find((c: any) => c.id === selectedCustomer?.id)?.name,
      };
      setLastSale(saleData);
      
      showAlert('success', 'Transaction Completed!', `Transaction #: ${transactionId} processed successfully`);

      setCart([]);
      setGlobalDiscount(0);
      setSmartRecommendations([]);

      setShowReceiptModal(true);

      await refetchProducts();

    } catch (error) {
      console.error('Transaction failed:', error);
      showAlert('error', 'Transaction Failed', error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const loadSalesAnalytics = () => {
    if (isLoadingSalesData) return;
    setIsLoadingSalesData(true);
    try {
      if (dailySalesSummaryData?.data) setDailySalesSummary(dailySalesSummaryData.data as any);
      // Type-safe check for hourlySalesPatternData
      const hourlyData = hourlySalesPatternData as any;
      if (hourlyData?.data) setHourlyPattern(hourlyData.data as any[] || []);
      if (topSellingProductsData?.data) setTopProducts((topSellingProductsData.data as any[]) || []);
    } catch (error) {
      console.error('Failed to load sales analytics:', error);
    } finally {
      setIsLoadingSalesData(false);
    }
  };

  const handleExportAsPDF = () => {
    if (!lastSale) return;

    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    let y = 15; // Initial y position

    // --- Helper function to check for page breaks ---
    const checkPageBreak = (heightNeeded = 10) => {
      if (y + heightNeeded > pageHeight - 15) {
        doc.addPage();
        y = 15;
      }
    };

    // --- Header ---
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(tenant.company_name || tenant.name, 105, y, { align: 'center' });
    y += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(tenant.company_address || tenant.address, 105, y, { align: 'center' });
    y += 5;
    doc.text(`${tenant.company_phone || ''} | ${tenant.company_email || tenant.contactInfo || ''}`, 105, y, { align: 'center' });
    y += 10;

    // --- Receipt Info ---
    doc.setDrawColor(0);
    doc.line(15, y, 195, y); // horizontal line
    y += 8;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("OFFICIAL RECEIPT", 15, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Receipt #: ${lastSale.id}`, 15, y);
    doc.text(`Date: ${new Date(lastSale.date).toLocaleString()}`, 195, y, { align: 'right' });
    y += 5;
    if (lastSale.customerName) {
      doc.text(`Customer: ${lastSale.customerName}`, 15, y);
    }
    y += 8;

    // --- Table Header ---
    doc.setDrawColor(180);
    doc.line(15, y, 195, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Item", 15, y);
    doc.text("Qty", 120, y, { align: 'center' });
    doc.text("Price", 155, y, { align: 'right' });
    doc.text("Total", 195, y, { align: 'right' });
    y += 2;
    doc.line(15, y, 195, y);
    y += 6;

    // --- Table Body ---
    doc.setFont("helvetica", "normal");
    lastSale.items.forEach((item: any) => {
      checkPageBreak(10);
      const itemText = doc.splitTextToSize(item.name, 80); // Handle long item names
      doc.text(itemText, 15, y);
      doc.text(item.quantity.toString(), 120, y, { align: 'center' });
      doc.text(`${tenant.currency || 'UGX'} ${Number(item.unit_price || 0).toFixed(2)}`, 155, y, { align: 'right' });
      doc.text(`${tenant.currency || 'UGX'} ${Number(item.total || 0).toFixed(2)}`, 195, y, { align: 'right' });
      y += (itemText.length * 5) + 3; // Adjust y based on number of lines for item name
    });

    // --- Totals ---
    y += 5;
    checkPageBreak(30);
    doc.line(120, y, 195, y);
    y += 5;

    doc.text("Subtotal:", 120, y);
    doc.text(`${tenant.currency || 'UGX'} ${Number(lastSale.subtotal).toFixed(2)}`, 195, y, { align: 'right' });
    y += 5;

    doc.text("Tax:", 120, y);
    doc.text(`${tenant.currency || 'UGX'} ${Number(lastSale.tax).toFixed(2)}`, 195, y, { align: 'right' });
    y += 5;

    doc.setFont("helvetica", "bold");
    doc.text("Total:", 120, y);
    doc.text(`${tenant.currency || 'UGX'} ${Number(lastSale.total).toFixed(2)}`, 195, y, { align: 'right' });
    y += 15;

    // --- Footer ---
    checkPageBreak(15);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for your business!", 105, y, { align: 'center' });
    y += 5;
    doc.text("Powered by NEXEN AIRIS (https://singo.com)", 105, y, { align: 'center' });

    doc.save(`Receipt-Transaction-${lastSale?.id}.pdf`);
  };

  useEffect(() => {
    if (salesMode === 'analytics') {
      loadSalesAnalytics();
    }
  }, [salesMode, dailySalesSummaryData, hourlySalesPatternData, topSellingProductsData]);

  if (isTenantLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner />
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (tenantError) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="text-red-500 text-center">
            Error loading tenant settings. Please try again later.
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const renderContent = () => {
    switch (salesMode) {
      case 'pos':
        return (
          <PosView
            products={products}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateCartQuantity={updateCartQuantity}
            applyItemDiscount={applyItemDiscount}
            clearCart={() => setCart([])}
            cartTotals={cartTotals}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            isCustomerModalOpen={isCustomerModalOpen}
            setIsCustomerModalOpen={setIsCustomerModalOpen}
            globalDiscount={globalDiscount}
            setGlobalDiscount={setGlobalDiscount}
            animatedProductId={animatedProductId}
            smartRecommendations={smartRecommendations}
            dynamicPricing={dynamicPricing}
            addToCartWithDiscount={addToCartWithDiscount}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            isLoading={isLoadingSalesData}
            dailySalesSummary={dailySalesSummary}
            hourlyPattern={hourlyPattern}
            topProducts={topProducts}
          />
        );
      case 'customers':
        return <CustomerIntelligenceView />;
      case 'history':
        return <HistoryView />;
      case 'receipts':
        return <ReceiptsView />;
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Smart Sales POS</h1>
          <p className="mt-1 text-sm text-gray-500">
            A powerful, AI-driven Point of Sale system.
          </p>
        </div>

        <div className="space-y-6">
          {/* Sales Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <button
                onClick={() => setSalesMode('pos')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  salesMode === 'pos'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🛒 Point of Sale
              </button>
              <button
                onClick={() => setSalesMode('analytics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  salesMode === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📊 Sales Analytics
              </button>
              <button
                onClick={() => setSalesMode('customers')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  salesMode === 'customers'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                👥 Customer Intelligence
              </button>
              <button
                onClick={() => setSalesMode('history')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  salesMode === 'history'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📜 Sales History
              </button>
              {/* <button
                onClick={() => setSalesMode('receipts')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  salesMode === 'receipts'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <EyeIcon className="h-5 w-5 inline-block mr-2" />
                View Receipts
              </button> */}
            </div>
            
            <div className="flex items-center space-x-3">
              {cart.length > 0 && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 border border-green-300 rounded-lg">
                  <ShoppingCartIcon className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">{cartTotals.itemCount} items • UGX {cartTotals.total.toLocaleString()}</span>
                </div>
              )}
              
              <div className="flex space-x-2">
                <select
                  value={selectedPaymentType}
                  onChange={(e) => setSelectedPaymentType(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  {availablePaymentMethods.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={processTransaction}
                  disabled={cart.length === 0 || processTransactionMutation.isPending}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    cart.length > 0
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {processTransactionMutation.isPending ? 'Processing...' : `💳 Checkout`}
                </button>
              </div>
              {selectedPaymentType === 'mobile_money' && (
                <input
                  type="text"
                  value={momoReference}
                  onChange={(e) => setMomoReference(e.target.value)}
                  placeholder="M-Pesa/MTN Ref..."
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              )}
            </div>
          </div>

          <Suspense fallback={<LoadingSpinner />}>
            {renderContent()}
          </Suspense>
        </div>

        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md flex flex-col" style={{ maxHeight: '90vh' }}>
              <div ref={receiptComponentRef} className="flex-grow overflow-y-auto pr-4">
                <Receipt tenant={tenant} sale={lastSale} />
              </div>
              <div className="mt-6 flex-shrink-0 flex justify-end space-x-4">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={handleExportAsPDF}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Download as PDF
                </button>
                <button
                  onClick={() => {
                    const whatsAppNumber = selectedCustomer?.whatsapp_number || selectedCustomer?.phone;
                    if (lastSale && selectedCustomer && whatsAppNumber) {
                      const items = lastSale.items.map((item: any) => `${item.name} (x${item.quantity}) - UGX ${item.total.toLocaleString()}`).join('\n');
                      const message = `
*${tenant.company_name || tenant.name}*
${tenant.company_address || tenant.address}
${tenant.company_phone || tenant.contactInfo}

*RECEIPT*
-----------------------------
Receipt ID: ${lastSale.id}
Date: ${new Date(lastSale.date).toLocaleString()}
Customer: ${lastSale.customerName || 'Walk-in'}
-----------------------------
*Items:*
${items}
-----------------------------
Subtotal: UGX ${lastSale.subtotal.toLocaleString()}
Tax: UGX ${lastSale.tax.toLocaleString()}
*Total: UGX ${lastSale.total.toLocaleString()}*

Thank you for your business!

Powered by NEXEN AIRIS (https://singo.com)
                      `;
                      window.open(`https://wa.me/${whatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
                    } else {
                      showAlert('info', 'Cannot Send WhatsApp', 'Please select a customer with a phone number to send a receipt via WhatsApp.');
                    }
                  }}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Send via WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        <CustomerSelectionModal
          isOpen={isCustomerModalOpen}
          onClose={() => setIsCustomerModalOpen(false)}
          onSelectCustomer={(customer) => setSelectedCustomer(customer)}
        />

        {customAlert.show && (
          <div className="fixed top-5 right-5 w-full max-w-sm z-50">
            <div className={`rounded-lg shadow-lg p-4 flex items-start space-x-3 ${
              customAlert.type === 'success' ? 'bg-green-100 border-green-400' :
              customAlert.type === 'error' ? 'bg-red-100 border-red-400' :
              customAlert.type === 'warning' ? 'bg-yellow-100 border-yellow-400' :
              'bg-blue-100 border-blue-400'
            }`}>
              <div className="flex-shrink-0">
                {customAlert.type === 'success' && <CheckCircleIcon className="h-6 w-6 text-green-600" />}
                {customAlert.type === 'error' && <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />}
                {customAlert.type === 'warning' && <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />}
                {customAlert.type === 'info' && <SparklesIcon className="h-6 w-6 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{customAlert.title}</p>
                <p className="text-sm text-gray-600">{customAlert.message}</p>
              </div>
              <button onClick={() => setCustomAlert(prev => ({ ...prev, show: false }))} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
