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
  Bars3Icon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import CustomerSelectionModal from '../CustomerSelectionModal';
import { CartItem, Customer } from '../../types';

interface MobilePosViewProps {
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

const MobilePosView: FC<MobilePosViewProps> = ({
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
  const [showFilters, setShowFilters] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
  const searchProducts = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
      setSearchSuggestions([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    
    // Multiple search criteria
    const filtered = products.filter(product => {
      return (
        product.name?.toLowerCase().includes(term) ||
        product.sku?.toLowerCase().includes(term) ||
        product.category?.toLowerCase().includes(term) ||
        product.barcode?.includes(term)
      );
    });

    // Sort by relevance
    const sorted = filtered.sort((a, b) => {
      const aNameMatch = a.name?.toLowerCase().startsWith(term) ? 2 : 
                         a.name?.toLowerCase().includes(term) ? 1 : 0;
      const bNameMatch = b.name?.toLowerCase().startsWith(term) ? 2 : 
                         b.name?.toLowerCase().includes(term) ? 1 : 0;
      
      if (aNameMatch !== bNameMatch) return bNameMatch - aNameMatch;
      
      return (b.current_stock || 0) - (a.current_stock || 0);
    });

    setFilteredProducts(sorted);
    setSearchSuggestions(sorted.slice(0, 5));
  }, [products]);

  // Filter by category
  const categoryFilteredProducts = useMemo(() => {
    const baseProducts = filteredProducts.length > 0 || productSearch ? filteredProducts : products;
    
    if (selectedCategory === 'all') {
      return baseProducts;
    }
    
    return baseProducts.filter(product => product.category === selectedCategory);
  }, [filteredProducts, products, selectedCategory, productSearch]);

  // Quick add functionality
  const handleQuickAdd = (product: any, quantity?: number) => {
    const qty = quantity || quickAddQuantity[product.id] || 1;
    addToCart(product, qty);
    setQuickAddQuantity({ ...quickAddQuantity, [product.id]: 1 });
    
    // Haptic feedback for mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  useEffect(() => {
    searchProducts(productSearch);
  }, [productSearch, searchProducts]);

  const getStockStatusColor = (stock: number) => {
    if (stock === 0) return 'text-red-600 bg-red-50';
    if (stock <= 5) return 'text-orange-600 bg-orange-50';
    if (stock <= 20) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getStockStatusText = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 5) return 'Low Stock';
    if (stock <= 20) return 'Limited';
    return 'In Stock';
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      {/* Mobile Search & Filter Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-4 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            placeholder="Search products, SKU, or scan barcode..."
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-2xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center space-x-2 pr-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <FunnelIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Filters - Always visible on mobile */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category: string) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/25'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? '🏷️ All' : `📦 ${category}`}
            </button>
          ))}
        </div>

        {/* Search Suggestions */}
        {isSearchFocused && searchSuggestions.length > 0 && (
          <div className="absolute left-4 right-4 mt-1 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto">
            {searchSuggestions.map((product) => (
              <button
                key={product.id}
                onClick={() => {
                  handleQuickAdd(product);
                  setProductSearch('');
                  setIsSearchFocused(false);
                }}
                className="w-full p-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <CubeIcon className="h-6 w-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">UGX {Number(product.selling_price).toLocaleString()}</p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStockStatusColor(product.current_stock)}`}>
                  {product.current_stock || 0}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Products Grid */}
        <div className="flex-1 p-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {categoryFilteredProducts.length} products
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </p>
            {cart.length > 0 && (
              <button
                onClick={() => setShowCart(!showCart)}
                className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium"
              >
                <ShoppingCartIcon className="h-4 w-4" />
                <span>Cart ({cartTotals.itemCount})</span>
              </button>
            )}
          </div>

          {/* Products Display */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {categoryFilteredProducts.map((product) => {
                const cartItem = cart.find(item => item.product_id === product.id);
                const inCart = !!cartItem;
                const isAnimated = animatedProductId === product.id;
                
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 ${
                      isAnimated ? 'scale-105 shadow-lg' : 'hover:shadow-md hover:scale-102'
                    } ${inCart ? 'ring-2 ring-green-500 ring-opacity-50' : ''}`}
                  >
                    {/* Product Image */}
                    <div className="aspect-square bg-gray-100 relative overflow-hidden">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <CubeIcon className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                      
                      {/* Stock Badge */}
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium ${getStockStatusColor(product.current_stock)}`}>
                        {product.current_stock || 0}
                      </div>
                      
                      {/* Quick Add Overlay */}
                      {product.current_stock > 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 flex items-center justify-center transition-all duration-200 opacity-0 hover:opacity-100">
                          <button
                            onClick={() => handleQuickAdd(product)}
                            className="bg-white text-green-600 p-2 rounded-full shadow-lg transform scale-90 hover:scale-100 transition-transform"
                          >
                            <PlusIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-3">
                      <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{product.sku}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">
                          UGX {Number(product.selling_price).toLocaleString()}
                        </span>
                        
                        {inCart ? (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs"
                            >
                              <MinusIcon className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{cartItem.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs"
                            >
                              <PlusIcon className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuickAdd(product)}
                            disabled={product.current_stock === 0}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                              product.current_stock > 0
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      
                      {product.current_stock === 0 && (
                        <div className="mt-2 text-center">
                          <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {categoryFilteredProducts.map((product) => {
                const cartItem = cart.find(item => item.product_id === product.id);
                const inCart = !!cartItem;
                
                return (
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex items-center space-x-3 ${
                      inCart ? 'ring-2 ring-green-500 ring-opacity-50' : ''
                    }`}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <CubeIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                      <p className="text-lg font-bold text-gray-900">UGX {Number(product.selling_price).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${getStockStatusColor(product.current_stock)}`}>
                        {product.current_stock || 0} left
                      </div>
                      
                      {inCart ? (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{cartItem.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleQuickAdd(product)}
                          disabled={product.current_stock === 0}
                          className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                            product.current_stock > 0
                              ? 'bg-green-600 text-white hover:bg-green-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {categoryFilteredProducts.length === 0 && (
            <div className="text-center py-12">
              <CubeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Mobile Cart Sidebar */}
        <div className={`lg:hidden fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-30 ${
          showCart ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full flex flex-col">
            {/* Cart Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              {cart.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">{cartTotals.itemCount} items</p>
              )}
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product_id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                        <CubeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.product_name}</p>
                        <p className="text-xs text-gray-500">UGX {item.unit_price.toLocaleString()} each</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                        >
                          <MinusIcon className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center"
                        >
                          <PlusIcon className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>UGX {cartTotals.subtotal.toLocaleString()}</span>
                  </div>
                  {cartTotals.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-UGX {cartTotals.discountTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {cartTotals.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>UGX {cartTotals.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>UGX {cartTotals.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Cart Sidebar */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-gray-50">
          <div className="h-full flex flex-col">
            {/* Cart Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Shopping Cart</h2>
                {selectedCustomer && (
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{selectedCustomer.name}</span>
                  </div>
                )}
              </div>
              {cart.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">{cartTotals.itemCount} items</p>
              )}
            </div>

            {/* Customer Selection */}
            <div className="p-4 bg-white border-b border-gray-200">
              <button
                onClick={() => setIsCustomerModalOpen(true)}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <UserIcon className="h-4 w-4" />
                <span>{selectedCustomer ? `${selectedCustomer.name}` : 'Select Customer'}</span>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mt-2">Add products to get started</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.product_id} className="bg-white p-3 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">{item.product_name}</h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center"
                          >
                            <MinusIcon className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center"
                          >
                            <PlusIcon className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">UGX {item.line_total.toLocaleString()}</p>
                          <p className="text-xs text-gray-500">UGX {item.unit_price.toLocaleString()} each</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Summary */}
            {cart.length > 0 && (
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>UGX {cartTotals.subtotal.toLocaleString()}</span>
                  </div>
                  {cartTotals.discountTotal > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-UGX {cartTotals.discountTotal.toLocaleString()}</span>
                    </div>
                  )}
                  {cartTotals.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>UGX {cartTotals.taxAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span>UGX {cartTotals.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => setIsCustomerModalOpen(true)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {selectedCustomer ? `👤 ${selectedCustomer.name}` : '👤 Select Customer'}
                  </button>
                  
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full px-3 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Cart Overlay Background */}
        {showCart && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setShowCart(false)}
          />
        )}
      </div>

      <CustomerSelectionModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(customer) => {
          setSelectedCustomer(customer);
          setIsCustomerModalOpen(false);
        }}
      />
    </div>
  );
};

export default MobilePosView;