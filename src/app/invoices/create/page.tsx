'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  SparklesIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  LightBulbIcon,
  ShoppingCartIcon
} from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useCreateInvoice, useProducts, useContacts } from '@/hooks/useApi';

export default function CreateInvoicePage() {
  const router = useRouter();
  const createInvoiceMutation = useCreateInvoice();
  const { data: productsData } = useProducts();
  const { data: contactsData } = useContacts();
  
  const [contactId, setContactId] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [invoiceItems, setInvoiceItems] = useState([
    { product_id: '', quantity: 1, unit_price: 0, product_name: '' },
  ]);

  const contactSearchRef = useRef<HTMLInputElement>(null);
  const productSearchRef = useRef<HTMLInputElement>(null);

  const products = productsData?.data?.data || [];
  const contacts = contactsData?.data?.data || [];

  // Smart Due Date Suggestions
  useEffect(() => {
    if (invoiceDate && !dueDate) {
      const invoiceDateObj = new Date(invoiceDate);
      invoiceDateObj.setDate(invoiceDateObj.getDate() + 30); // Default 30 days
      setDueDate(invoiceDateObj.toISOString().split('T')[0]);
    }
  }, [invoiceDate, dueDate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setShowContactSuggestions(true);
        contactSearchRef.current?.focus();
      }
      if (e.key === 'F3') {
        e.preventDefault();
        setShowProductSearch(true);
        productSearchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowContactSuggestions(false);
        setShowProductSearch(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Filter contacts based on search
  const filteredContacts = contacts.filter((contact: any) =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    (contact.email && contact.email.toLowerCase().includes(contactSearch.toLowerCase()))
  );

  // Filter products based on search
  const filteredProducts = products.filter((product: any) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (product.code && product.code.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };

    if (field === 'product_id') {
      const product = products.find((p: any) => p.id === parseInt(value));
      if (product) {
        newItems[index].unit_price = product.selling_price;
        newItems[index].product_name = product.name;
      }
    }

    setInvoiceItems(newItems);
  };

  const handleProductSelect = (product: any, index: number) => {
    handleItemChange(index, 'product_id', product.id.toString());
    setProductSearch('');
    setShowProductSearch(false);
  };

  const handleContactSelect = (contact: any) => {
    setContactId(contact.id.toString());
    setContactSearch(contact.name);
    setShowContactSuggestions(false);
  };

  const addItem = () => {
    setInvoiceItems([...invoiceItems, { product_id: '', quantity: 1, unit_price: 0, product_name: '' }]);
  };

  const removeItem = (index: number) => {
    if (invoiceItems.length > 1) {
      const newItems = invoiceItems.filter((_, i) => i !== index);
      setInvoiceItems(newItems);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoiceMutation.mutate(
      {
        contact_id: contactId,
        invoice_date: invoiceDate,
        due_date: dueDate,
        notes,
        invoice_items: invoiceItems.filter(item => item.product_id), // Only include items with products
      },
      {
        onSuccess: () => {
          router.push('/invoices');
        },
      }
    );
  };

  const subtotal = invoiceItems.reduce((acc, item) => 
    item.product_id ? acc + (item.quantity * item.unit_price) : acc, 0
  );

  const stepTitles = ['Customer & Dates', 'Add Items', 'Review & Submit'];
  const isStepValid = (step: number) => {
    switch (step) {
      case 1: return contactId && invoiceDate && dueDate;
      case 2: return invoiceItems.some(item => item.product_id);
      case 3: return true;
      default: return false;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        {/* Magical Header */}
        <div className="relative mb-8 p-8 rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-white/80 hover:text-white mb-4 transition-colors duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Invoices
                </button>
                <h1 className="text-3xl font-bold flex items-center">
                  <SparklesIcon className="h-8 w-8 mr-3 animate-pulse" />
                  Create Magical Invoice
                </h1>
                <p className="mt-2 text-blue-100">
                  Press F2 for customer search, F3 for product search ✨
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-100">Step {currentStep} of 3</p>
                <p className="text-2xl font-bold">
                  {stepTitles[currentStep - 1]}
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="relative z-10 mt-6">
            <div className="flex items-center justify-between mb-2">
              {stepTitles.map((title, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index + 1 <= currentStep 
                      ? 'bg-white text-purple-600' 
                      : 'bg-white/20 text-white/60'
                  }`}>
                    {index + 1 <= currentStep ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < stepTitles.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded ${
                      index + 1 < currentStep ? 'bg-white' : 'bg-white/20'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Floating decoration elements */}
          <div className="absolute top-4 right-20 w-12 h-12 bg-white/10 rounded-full animate-bounce"></div>
          <div className="absolute bottom-4 left-20 w-8 h-8 bg-white/5 rounded-full animate-pulse"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Customer & Dates */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Customer Selection */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <UserIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Customer Information</h2>
                </div>
                
                <div className="relative">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      ref={contactSearchRef}
                      type="text"
                      placeholder="Search for a customer... (Press F2)"
                      value={contactSearch}
                      onChange={(e) => {
                        setContactSearch(e.target.value);
                        setShowContactSuggestions(true);
                      }}
                      onFocus={() => setShowContactSuggestions(true)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
                    />
                  </div>
                  
                  {/* Customer Suggestions */}
                  {showContactSuggestions && filteredContacts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {filteredContacts.slice(0, 5).map((contact: any) => (
                        <button
                          key={contact.id}
                          type="button"
                          onClick={() => handleContactSelect(contact)}
                          className="w-full text-left px-4 py-3 hover:bg-purple-50 border-b border-gray-100 last:border-b-0 transition-colors duration-200"
                        >
                          <div className="font-medium text-gray-900">{contact.name}</div>
                          {contact.email && <div className="text-sm text-gray-500">{contact.email}</div>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {contactId && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">Customer selected: {contactSearch}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dates */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <CalendarIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Invoice Dates</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Invoice Date *
                    </label>
                    <input
                      type="date"
                      value={invoiceDate}
                      onChange={(e) => setInvoiceDate(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
                      required
                    />
                    {invoiceDate && dueDate && (
                      <div className="mt-2 flex items-center text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {Math.ceil((new Date(dueDate).getTime() - new Date(invoiceDate).getTime()) / (1000 * 60 * 60 * 24))} days payment term
                      </div>
                    )}
                  </div>
                </div>

                {/* Smart suggestions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Quick options:</span>
                  {[7, 15, 30, 60].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => {
                        const date = new Date(invoiceDate);
                        date.setDate(date.getDate() + days);
                        setDueDate(date.toISOString().split('T')[0]);
                      }}
                      className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors duration-200"
                    >
                      {days} days
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Add Items */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <ShoppingCartIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Invoice Items</h2>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Items: {invoiceItems.filter(item => item.product_id).length}</p>
                  <p className="text-lg font-bold text-purple-600">UGX {subtotal.toLocaleString()}</p>
                </div>
              </div>

              {/* Product Search */}
              {showProductSearch && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-purple-400" />
                    <input
                      ref={productSearchRef}
                      type="text"
                      placeholder="Search products... (Press F3)"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-purple-300 rounded-xl text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
                    />
                  </div>
                  
                  {filteredProducts.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto">
                      {filteredProducts.slice(0, 5).map((product: any) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => {
                            const emptyIndex = invoiceItems.findIndex(item => !item.product_id);
                            if (emptyIndex !== -1) {
                              handleProductSelect(product, emptyIndex);
                            } else {
                              setInvoiceItems([...invoiceItems, { 
                                product_id: product.id.toString(), 
                                quantity: 1, 
                                unit_price: product.selling_price,
                                product_name: product.name
                              }]);
                              setProductSearch('');
                              setShowProductSearch(false);
                            }
                          }}
                          className="w-full text-left p-3 mt-1 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">
                                {product.code && `Code: ${product.code} • `}
                                Stock: {product.stock_quantity}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-purple-600">
                              UGX {product.selling_price.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Items List */}
              <div className="space-y-4">
                {invoiceItems.map((item, index) => (
                  <div key={index} className="group p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-all duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      {/* Product Selection */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-700 mb-1">Product</label>
                        <select
                          value={item.product_id}
                          onChange={(e) => handleItemChange(index, 'product_id', e.target.value)}
                          className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                        >
                          <option value="">Select a product</option>
                          {products.map((product: any) => (
                            <option key={product.id} value={product.id}>
                              {product.name} - UGX {product.selling_price}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Qty</label>
                        <input
                          type="number"
                          placeholder="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                          min="1"
                        />
                      </div>

                      {/* Unit Price */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Unit Price</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      {/* Total */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Total</label>
                        <div className="w-full p-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm font-bold text-gray-900">
                          UGX {(item.quantity * item.unit_price).toLocaleString()}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-end justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={invoiceItems.length === 1}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Item Button */}
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowProductSearch(true)}
                  className="group inline-flex items-center px-6 py-3 border-2 border-dashed border-purple-300 text-purple-600 font-medium rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200"
                >
                  <MagnifyingGlassIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Search & Add Product (F3)
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="ml-4 group inline-flex items-center px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-xl hover:border-gray-500 hover:bg-gray-50 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform duration-200" />
                  Add Empty Row
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Review Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-6">
                  <DocumentIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Review Invoice</h2>
                </div>

                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-bold text-blue-900 mb-2">Customer</h3>
                    <p className="text-blue-800">{contactSearch}</p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-bold text-green-900 mb-2">Dates</h3>
                    <p className="text-green-800 text-sm">
                      Invoice: {invoiceDate}<br />
                      Due: {dueDate}
                    </p>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="mb-6">
                  <h3 className="font-bold text-gray-900 mb-3">Items ({invoiceItems.filter(item => item.product_id).length})</h3>
                  <div className="space-y-2">
                    {invoiceItems.filter(item => item.product_id).map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{item.product_name}</span>
                          <span className="text-gray-500 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-bold">UGX {(item.quantity * item.unit_price).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-2xl font-bold">
                    <span>Total Amount:</span>
                    <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                      UGX {subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center mb-4">
                  <LightBulbIcon className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Additional Notes</h2>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any additional notes or terms for this invoice..."
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Previous
                </button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-xl shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!isStepValid(currentStep)}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                >
                  Next Step
                  <span className="ml-2">→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={createInvoiceMutation.isPending || !isStepValid(currentStep)}
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
                >
                  {createInvoiceMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Magic...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-5 w-5 mr-2" />
                      Create Invoice
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
