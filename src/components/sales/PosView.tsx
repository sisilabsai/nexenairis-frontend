'use client';

import { FC, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  CubeIcon,
  TrashIcon,
  XMarkIcon,
  SparklesIcon,
  ShoppingCartIcon,
  UserIcon,
  TagIcon,
  QrCodeIcon,
  StarIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  FireIcon,
  HeartIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  GiftIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import QuickKeysPanel from '../QuickKeysPanel';
import CustomerSelectionModal from '../CustomerSelectionModal';
import { CartItem, Customer } from '../../types';

interface PosViewProps {
  products: any[];
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateCartQuantity: (productId: number, newQuantity: number) => void;
  applyItemDiscount: (productId: number, discountPercent: number) => void;
  clearCart: () => void;
  cartTotals: {
    subtotal: number;
    discountTotal: number;
    taxAmount: number;
    total: number;
    itemCount: number;
  };
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  isCustomerModalOpen: boolean;
  setIsCustomerModalOpen: (isOpen: boolean) => void;
  globalDiscount: number;
  setGlobalDiscount: (discount: number) => void;
  animatedProductId: number | null;
  smartRecommendations: any[];
  dynamicPricing: any[];
  addToCartWithDiscount: (product: any, discountPercent: number) => void;
}

const PosView: FC<PosViewProps> = ({
  products,
  cart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  applyItemDiscount,
  clearCart,
  cartTotals,
  selectedCustomer,
  setSelectedCustomer,
  isCustomerModalOpen,
  setIsCustomerModalOpen,
  globalDiscount,
  setGlobalDiscount,
  animatedProductId,
  smartRecommendations,
  dynamicPricing,
  addToCartWithDiscount,
}) => {
  const [productSearch, setProductSearch] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
  const [quickAddQuantity, setQuickAddQuantity] = useState<{[key: number]: number}>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const cats = products.reduce((acc, product) => {
      if (product.category && !acc.includes(product.category)) {
        acc.push(product.category);
      }
      return acc;
    }, ['all']);
    return cats;
  }, [products]);

  // Smart search with fuzzy matching and recommendations
  const searchProducts = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      setSearchSuggestions([]);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    // Advanced search logic: exact matches, starts with, contains, fuzzy
    const exactMatches = products.filter(product => 
      product.name.toLowerCase() === searchLower ||
      product.sku.toLowerCase() === searchLower
    );

    const startsWithMatches = products.filter(product => 
      (product.name.toLowerCase().startsWith(searchLower) ||
       product.sku.toLowerCase().startsWith(searchLower)) &&
      !exactMatches.includes(product)
    );

    const containsMatches = products.filter(product => 
      (product.name.toLowerCase().includes(searchLower) ||
       product.sku.toLowerCase().includes(searchLower) ||
       product.category?.toLowerCase().includes(searchLower)) &&
      !exactMatches.includes(product) &&
      !startsWithMatches.includes(product)
    );

    // Smart recommendations based on popular products, category relevance
    const recommendations = products.filter(product => {
      if (exactMatches.includes(product) || startsWithMatches.includes(product) || containsMatches.includes(product)) {
        return false;
      }
      // Add products from same category as found products
      const foundCategories = [...exactMatches, ...startsWithMatches, ...containsMatches]
        .map(p => p.category).filter(Boolean);
      return foundCategories.includes(product.category);
    }).slice(0, 3);

    const filtered = [...exactMatches, ...startsWithMatches, ...containsMatches].slice(0, 8);
    setFilteredProducts(filtered);
    setSearchSuggestions(recommendations);
  };

  // Filter products by category
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter(product => product.category === selectedCategory);
  }, [products, selectedCategory]);

  // Quick add with animation - using useCallback to avoid dependency issues
  const handleQuickAdd = useCallback((product: any, quantity: number = 1) => {
    addToCart(product, quantity);
    
    // Show success toast with product name
    toast.success(`Added ${quantity}x ${product.name} to cart`, {
      icon: '🛒',
      duration: 2000,
      style: {
        borderRadius: '10px',
        background: '#10B981',
        color: '#fff',
      },
    });

    // Clear search after adding
    if (productSearch) {
      setProductSearch('');
      setFilteredProducts([]);
      setSearchSuggestions([]);
    }
  }, [addToCart, productSearch, setProductSearch, setFilteredProducts, setSearchSuggestions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 for search focus
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to clear search
      if (e.key === 'Escape' && isSearchFocused) {
        setProductSearch('');
        setFilteredProducts([]);
        setSearchSuggestions([]);
        searchInputRef.current?.blur();
      }
      // Enter to add first search result
      if (e.key === 'Enter' && isSearchFocused && filteredProducts.length > 0) {
        e.preventDefault();
        handleQuickAdd(filteredProducts[0]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused, filteredProducts, handleQuickAdd]);

  const handleQuantityChange = (productId: number, quantity: number) => {
    setQuickAddQuantity(prev => ({
      ...prev,
      [productId]: Math.max(1, quantity)
    }));
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { color: 'text-red-600', label: 'Out of Stock', icon: XMarkIcon };
    if (stock <= 5) return { color: 'text-orange-600', label: 'Low Stock', icon: ClockIcon };
    if (stock <= 20) return { color: 'text-yellow-600', label: 'Limited', icon: AdjustmentsHorizontalIcon };
    return { color: 'text-green-600', label: 'In Stock', icon: CheckIcon };
  };

  const handleSalesScan = (scannedCode: string) => {
    const product = products.find(p => p.sku === scannedCode || p.barcode === scannedCode);
    if (product) {
      handleQuickAdd(product);
    } else {
      toast.error('Product not found', { icon: '❌' });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Panel - Product Selection */}
      <div className="lg:col-span-2 space-y-6">
        <QuickKeysPanel onProductSelect={(product) => {
          const fullProduct = products.find(p => p.id === product.product_id);
          if (fullProduct) {
            handleQuickAdd(fullProduct);
          }
        }} />

        {/* 🔍 Magic Search Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 shadow-lg rounded-xl border border-blue-200">
          <div className="px-6 py-5">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <SparklesIcon className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Product Search</h3>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">F2</span>
            </div>
            
            {/* Search Input with Magic */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search products by name, SKU, or scan barcode... (Press F2)"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  searchProducts(e.target.value);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-sm bg-white shadow-sm"
              />
              {productSearch && (
                <button
                  onClick={() => {
                    setProductSearch('');
                    setFilteredProducts([]);
                    setSearchSuggestions([]);
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Search Results with Magic */}
            {(filteredProducts.length > 0 || searchSuggestions.length > 0) && isSearchFocused && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto">
                {/* Direct Matches */}
                {filteredProducts.length > 0 && (
                  <div className="p-3">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                      <BoltIcon className="h-4 w-4 mr-1" />
                      Found {filteredProducts.length} matches
                    </div>
                    <div className="space-y-2">
                      {filteredProducts.map((product, index) => {
                        const stock = getStockStatus(product.current_stock);
                        const Icon = stock.icon;
                        return (
                          <div
                            key={product.id}
                            onClick={() => handleQuickAdd(product)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:bg-blue-50 hover:border-blue-300 ${
                              index === 0 ? 'ring-2 ring-purple-500 bg-purple-50' : 'border-gray-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                                  {index === 0 && (
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Press Enter</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-3 mt-1">
                                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                                  <div className={`flex items-center space-x-1 ${stock.color}`}>
                                    <Icon className="h-3 w-3" />
                                    <span className="text-xs">{product.current_stock} left</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm font-semibold text-green-600">
                                  UGX {product.selling_price?.toLocaleString()}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuickAdd(product);
                                  }}
                                  className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Smart Suggestions */}
                {searchSuggestions.length > 0 && (
                  <div className="p-3 border-t border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center">
                      <LightBulbIcon className="h-4 w-4 mr-1" />
                      Smart Suggestions
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {searchSuggestions.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleQuickAdd(product)}
                          className="p-2 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 truncate">{product.name}</p>
                              <p className="text-xs text-gray-500">Related product</p>
                            </div>
                            <span className="text-xs text-green-600 font-medium">
                              UGX {product.selling_price?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 🏷️ Category Filter Magic */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Product Categories</h3>
              <span className="text-xs text-gray-500">{categoryFilteredProducts.length} products</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {categories.map((category: string) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'all' ? 'All Products' : category}
                  {category !== 'all' && (
                    <span className="ml-1 text-xs opacity-75">
                      ({products.filter(p => p.category === category).length})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🛍️ Magic Product Grid */}
        <div className="bg-white shadow-xl rounded-xl border border-gray-200">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <FireIcon className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedCategory === 'all' ? 'All Products' : selectedCategory}
                </h3>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {categoryFilteredProducts.length} items
                </span>
              </div>
              <button
                onClick={() => {
                  if (productSearch) handleSalesScan(productSearch);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
              >
                <QrCodeIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Scan</span>
              </button>
            </div>

            {/* Enhanced Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categoryFilteredProducts.slice(0, 20).map((product: any) => {
                const stock = getStockStatus(product.current_stock);
                const Icon = stock.icon;
                const currentQuantity = quickAddQuantity[product.id] || 1;
                const isAnimated = animatedProductId === product.id;
                
                return (
                  <div
                    key={product.id}
                    className={`group relative bg-white border-2 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                      isAnimated ? 'ring-4 ring-green-400 scale-110' : 'border-gray-200 hover:border-purple-300'
                    } ${product.current_stock <= 0 ? 'opacity-50' : ''}`}
                  >
                    {/* Product Image */}
                    <div className="relative w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <CubeIcon className="h-12 w-12 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      )}
                      
                      {/* Stock Status Badge */}
                      <div className={`absolute top-2 right-2 flex items-center space-x-1 bg-white rounded-full px-2 py-1 shadow-lg ${stock.color}`}>
                        <Icon className="h-3 w-3" />
                        <span className="text-xs font-medium">{product.current_stock}</span>
                      </div>

                      {/* Quick Action Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                        <div className="transform scale-0 group-hover:scale-100 transition-transform duration-300">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickAdd(product, currentQuantity);
                            }}
                            disabled={product.current_stock <= 0}
                            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
                          >
                            <ShoppingCartIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-sm text-gray-900 truncate group-hover:text-purple-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">SKU: {product.sku}</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">
                          UGX {(parseFloat(product.selling_price) || 0).toLocaleString()}
                        </p>
                      </div>

                      {/* Quick Quantity Selector */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(product.id, currentQuantity - 1);
                            }}
                            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                            {currentQuantity}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuantityChange(product.id, currentQuantity + 1);
                            }}
                            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded transition-colors"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAdd(product, currentQuantity);
                          }}
                          disabled={product.current_stock <= 0}
                          className="bg-purple-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Special Indicators */}
                    {smartRecommendations.find(r => r.product_id === product.id) && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                        ⭐ Recommended
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {categoryFilteredProducts.length > 20 && (
              <div className="text-center mt-6">
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                  Load More Products ({categoryFilteredProducts.length - 20} remaining)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🎯 AI Smart Recommendations */}
        {smartRecommendations.length > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 shadow-lg rounded-xl border border-orange-200">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SparklesIcon className="h-6 w-6 text-yellow-600 mr-3" />
                AI Smart Recommendations
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  Boost Sales
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {smartRecommendations.map((rec: any) => (
                  <div
                    key={rec.product_id}
                    className="bg-white rounded-lg p-4 border border-orange-200 hover:border-orange-400 cursor-pointer transition-all duration-200 hover:shadow-lg"
                    onClick={() => addToCartWithDiscount(rec.product, rec.suggested_discount || 0)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{rec.product?.name}</h4>
                        <p className="text-sm text-gray-600">{rec.reason}</p>
                        {rec.suggested_discount > 0 && (
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="text-sm text-orange-600 font-medium">
                              {rec.suggested_discount}% OFF
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                              UGX {rec.original_price?.toLocaleString()}
                            </span>
                            <span className="text-sm font-semibold text-green-600">
                              UGX {rec.discounted_price?.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCartWithDiscount(rec.product, rec.suggested_discount || 0);
                        }}
                        className="bg-yellow-500 text-white p-2 rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        <GiftIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 💰 Dynamic Pricing Magic */}
        {dynamicPricing.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg rounded-xl border border-green-200">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TagIcon className="h-6 w-6 text-green-600 mr-3" />
                Smart Pricing Alerts
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Live Updates
                </span>
              </h3>
              <div className="space-y-3">
                {dynamicPricing.map((pricing: any) => (
                  <div
                    key={pricing.product_id}
                    className="bg-white rounded-lg p-4 border border-green-200 hover:border-green-400 cursor-pointer transition-all duration-200"
                    onClick={() => handleQuickAdd(pricing.product)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{pricing.product?.name}</h4>
                        <p className="text-sm text-gray-600">{pricing.reason}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500 line-through">
                            UGX {pricing.old_price?.toLocaleString()}
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            UGX {pricing.new_price?.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-green-600 font-medium">
                          Save UGX {(pricing.old_price - pricing.new_price)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🛒 Magical Shopping Cart */}
      <div className="space-y-6">
        {/* 👤 Smart Customer Selection */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg rounded-xl border border-blue-200">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <UserIcon className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">F3</span>
              </div>
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-lg"
              >
                <PlusIcon className="h-4 w-4" />
                <span>{selectedCustomer ? 'Change' : 'Select'}</span>
              </button>
            </div>

            {selectedCustomer ? (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-semibold text-gray-900 truncate">{selectedCustomer.name}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          selectedCustomer.customer_type === 'vip' ? 'bg-gold-100 text-gold-800' :
                          selectedCustomer.customer_type === 'wholesale' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedCustomer.customer_type?.toUpperCase()}
                        </span>
                        {selectedCustomer.loyalty_points > 0 && (
                          <div className="flex items-center space-x-1 text-yellow-600">
                            <StarIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{selectedCustomer.loyalty_points} pts</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Customer Stats */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      UGX {selectedCustomer.total_purchases?.toLocaleString() || '0'}
                    </p>
                    <p className="text-xs text-gray-500">Total Purchases</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedCustomer.loyalty_points || 0}
                    </p>
                    <p className="text-xs text-gray-500">Loyalty Points</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-dashed border-blue-300 text-center">
                <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-3">No customer selected</p>
                <p className="text-sm text-gray-500">Click &quot;Select&quot; or press F3 to choose a customer</p>
              </div>
            )}
          </div>
        </div>
        {/* 🛒 Enhanced Shopping Cart */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 shadow-xl rounded-xl border border-purple-200">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <ShoppingCartIcon className="h-6 w-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Shopping Cart
                </h3>
                <span className="bg-purple-100 text-purple-800 text-sm px-2 py-1 rounded-full font-medium">
                  {cartTotals.itemCount} items
                </span>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="bg-white rounded-lg p-8 border border-dashed border-purple-300 text-center">
                <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add products to start shopping</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div 
                    key={item.product_id} 
                    className={`bg-white p-4 rounded-lg border-2 transition-all duration-300 ${
                      animatedProductId === item.product_id 
                        ? 'border-green-400 bg-green-50 scale-105 shadow-lg' 
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {item.product_name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">SKU: {item.sku}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                            >
                              <MinusIcon className="h-4 w-4 text-gray-600" />
                            </button>
                            <span className="w-12 text-center font-medium text-gray-900">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                              className="w-8 h-8 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center transition-colors"
                            >
                              <PlusIcon className="h-4 w-4 text-purple-600" />
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            {item.discount_percent > 0 && (
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                -{item.discount_percent}%
                              </span>
                            )}
                            <button 
                              onClick={() => removeFromCart(item.product_id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Price Information */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-gray-500">
                            UGX {item.unit_price.toLocaleString()} × {item.quantity}
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-gray-900">
                              UGX {item.line_total.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 💰 Cart Totals & Checkout */}
        {cart.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 shadow-xl rounded-xl border border-green-200">
            <div className="px-6 py-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 mr-3" />
                Order Summary
              </h3>
              
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium text-gray-900">
                    UGX {cartTotals.subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Global Discount Input */}
                <div className="flex justify-between items-center text-sm border-t pt-3">
                  <span className="text-gray-600">Global Discount:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={globalDiscount}
                      onChange={(e) => setGlobalDiscount(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-16 px-2 py-1 border border-gray-300 rounded-md text-right text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <span className="text-gray-500">%</span>
                  </div>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Discounts:</span>
                  <span className="font-medium text-orange-600">
                    -UGX {cartTotals.discountTotal.toLocaleString()}
                  </span>
                </div>

                {cartTotals.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium text-gray-900">
                      UGX {cartTotals.taxAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      UGX {cartTotals.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    💳 Process Payment
                  </button>
                  <button className="px-4 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors">
                    💾 Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CustomerSelectionModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(customer) => setSelectedCustomer(customer)}
      />
    </div>
  );
};

export default PosView;
