# NEXEN AIRIS Frontend

This is the Next.js frontend for the NEXEN AIRIS system, designed to work seamlessly with the Laravel backend.

## 🚀 **Frontend-Backend Integration Complete!**

### **✅ What's Been Implemented:**

#### **🔧 API Integration Layer:**
- **Comprehensive API Service** (`src/lib/api.ts`)
  - Axios-based HTTP client with interceptors
  - Automatic token management
  - Error handling and retry logic
  - Type-safe API responses

#### **📊 React Query Integration:**
- **Query Client Configuration** (`src/lib/queryClient.ts`)
  - Optimized caching strategies
  - Automatic background refetching
  - Error retry with exponential backoff
  - DevTools for debugging

#### **🎣 Custom Hooks:**
- **Complete API Hooks** (`src/hooks/useApi.ts`)
  - All CRUD operations for every module
  - Automatic cache invalidation
  - Loading and error states
  - Optimistic updates

#### **🎨 UI Components:**
- **Loading Spinner** (`src/components/LoadingSpinner.tsx`)
- **Error Messages** (`src/components/ErrorMessage.tsx`)
- **Query Provider** (`src/providers/QueryProvider.tsx`)

#### **📱 Updated Pages:**
- **Dashboard** - Real-time stats and activity
- **Finance** - Live transaction data
- **Test Page** - API connection verification

### **🔗 Backend Connection:**

The frontend is configured to connect to the Laravel backend at:
```
http://localhost:8000/api
```

### **⚙️ Environment Setup:**

Create a `.env.local` file in the frontend directory:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Development Configuration
NEXT_PUBLIC_APP_ENV=development
```

### **🚀 Running the Application:**

1. **Start the Laravel Backend:**
   ```bash
   cd singo-erp
   php artisan serve
   ```

2. **Start the Next.js Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api

### **🧪 Testing the Integration:**

1. **Navigate to the Test Page:**
   - Go to http://localhost:3000/test
   - Click "API Test" in the sidebar

2. **Run API Tests:**
   - API Connection Test
   - Database Connection Test
   - AIDA Integration Test

3. **Check Dashboard:**
   - Visit http://localhost:3000
   - Verify real-time data loading
   - Test error handling with network issues

### **📊 Available API Endpoints:**

#### **Authentication:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

#### **Dashboard:**
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent-activity` - Recent activities

#### **Finance:**
- `GET /api/finance/stats` - Financial statistics
- `GET /api/finance/transactions` - Get transactions

> Note: Creating, updating and deleting sales-like transactions are handled under the Sales domain.

- `POST /api/sales/transactions` - Create transaction
- `PUT /api/sales/transactions/{id}` - Update transaction
- `DELETE /api/sales/transactions/{id}` - Delete transaction

#### **Inventory:**
- `GET /api/inventory/stats` - Inventory statistics
- `GET /api/inventory/products` - Get products
- `POST /api/inventory/products` - Create product
- `PUT /api/inventory/products/{id}` - Update product
- `DELETE /api/inventory/products/{id}` - Delete product

#### **CRM:**
- `GET /api/crm/stats` - CRM statistics
- `GET /api/crm/contacts` - Get contacts
- `POST /api/crm/contacts` - Create contact
- `PUT /api/crm/contacts/{id}` - Update contact
- `DELETE /api/crm/contacts/{id}` - Delete contact

#### **HR:**
- `GET /api/hr/stats` - HR statistics
- `GET /api/hr/employees` - Get employees
- `POST /api/hr/employees` - Create employee
- `PUT /api/hr/employees/{id}` - Update employee
- `DELETE /api/hr/employees/{id}` - Delete employee

#### **Projects:**
- `GET /api/projects/stats` - Project statistics
- `GET /api/projects` - Get projects
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

#### **Analytics:**
- `GET /api/analytics/stats` - Analytics statistics
- `GET /api/analytics/metrics` - Get metrics
- `GET /api/analytics/top-products` - Top products
- `GET /api/analytics/recent-metrics` - Recent metrics

#### **AIDA:**
- `POST /api/aida/conversations` - Start conversation
- `POST /api/aida/conversations/{id}/messages` - Send message
- `GET /api/aida/conversations/{id}/messages` - Get messages
- `POST /api/aida/analyze` - Analyze data
- `GET /api/aida/capabilities` - Get capabilities

#### **System:**
- `GET /api/system/settings` - Get settings
- `PUT /api/system/settings` - Update settings
- `GET /api/system/audit-logs` - Get audit logs
- `GET /api/system/health` - System health
- `GET /api/system/summary` - System summary

#### **Test:**
- `GET /api/test` - Basic API test
- `GET /api/test/database` - Database connection test
- `GET /api/test/aida` - AIDA integration test

### **🔧 Features:**

#### **✅ Real-time Data Loading:**
- Automatic data fetching on page load
- Background data refresh
- Optimistic updates for better UX

#### **✅ Error Handling:**
- Graceful error display
- Retry mechanisms
- Fallback to mock data when API is unavailable

#### **✅ Loading States:**
- Spinner components during data loading
- Skeleton loading for better UX
- Disabled states during operations

#### **✅ Caching:**
- Intelligent data caching
- Automatic cache invalidation
- Background data synchronization

#### **✅ Authentication:**
- Token-based authentication
- Automatic token refresh
- Secure logout functionality

### **🎯 Next Steps:**

1. **Test the Integration:**
   - Visit http://localhost:3000/test
   - Run all API tests
   - Verify data flows correctly

2. **Explore the Dashboard:**
   - Check real-time statistics
   - Test error scenarios
   - Verify loading states

3. **Test All Modules:**
   - Finance transactions
   - Inventory management
   - CRM contacts
   - HR employees
   - Project management

### **🐛 Troubleshooting:**

#### **API Connection Issues:**
1. Ensure Laravel backend is running on port 8000
2. Check CORS configuration in Laravel
3. Verify API routes are accessible
4. Check browser console for errors

#### **Data Not Loading:**
1. Check network tab for failed requests
2. Verify API endpoints are working
3. Check authentication token
4. Test with Postman or similar tool

#### **Authentication Issues:**
1. Clear browser localStorage
2. Check token expiration
3. Verify login endpoint
4. Check CORS headers

### **📈 Performance Optimizations:**

- **React Query Caching** - Reduces API calls
- **Optimistic Updates** - Instant UI feedback
- **Background Refetching** - Always fresh data
- **Error Retry Logic** - Resilient to network issues

### **🔒 Security Features:**

- **Token-based Authentication** - Secure API access
- **Automatic Token Refresh** - Seamless user experience
- **CORS Protection** - Cross-origin security
- **Error Sanitization** - Safe error messages

The frontend is now fully integrated with the Laravel backend and ready for production use! 🚀
