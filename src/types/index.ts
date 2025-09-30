











// Sales Transaction Types
export interface SaleItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

export interface Sale {
  id: string | number;
  transaction_number: string;
  customer_name?: string;
  cashier_name?: string;
  items: SaleItem[];
  total_amount: number;
  transaction_date: string;
}

export interface SalesHistoryResponse {
  data: Sale[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface TransactionLine {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  debit_amount: number;
  credit_amount: number;
  chart_of_account?: {
    account_name: string;
  };
}

export interface Transaction {
  id: string | number;
  transaction_number: string;
  customer_name?: string;
  cashier_name?: string;
  transaction_lines: TransactionLine[];
  total_amount: number;
  transaction_date: string;
}

export interface DailySummary {
  total_revenue: number;
  total_transactions: number;
  average_transaction_value: number;
  top_products: { product_name: string; total_quantity: number; total_revenue: number }[];
  total_discounts: number;
}

export interface DailySalesSummaryResponse {
  data: {
    summary: DailySummary;
  };
}

// Tenant Type
export interface Tenant {
  id: number;
  name: string;
  address?: string;
  contactInfo?: string;
  company_name?: string;
  company_address?: string;
  company_phone?: string;
  company_email?: string;
  currency?: string;
  logo?: string;
}

// POS-specific types
export interface CartItem {
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

export interface Customer {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyalty_points: number;
  total_purchases: number;
  customer_type: 'regular' | 'vip' | 'wholesale';
  last_purchase: string;
}

// User Type
export interface User {
  id: number;
  name: string;
  email: string;
  branch_id?: number;
  department?: { name: string };
  position?: { name: string };
  department_id?: number;
  position_id?: number;
  hire_date?: string;
  salary?: string | number;
  employee_id?: string;
  phone?: string;
  employeeContracts?: { contract_type: string }[];
  modules?: string[];
  profile_photo_path?: string;
  avatar?: string;
  is_active?: boolean;
}

export interface Branch {
  id?: number;
  name: string;
  company_name?: string;
  company_email?: string;
  company_phone?: string;
  company_address?: string;
  tax_id?: string;
  manager_id?: number | null;
  is_active?: boolean;
}

// Role & Permission Types
export interface Permission {
  id: number;
  name: string;
  module: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

// Task Type
export interface Task {
  id: number;
  name: string;
}

// Chat Types
export interface MessageReaction {
  id: number;
  user_id: number;
  message_id: number;
  reaction: string;
}

export interface Message {
  user_id: number;
  id: number;
  content: string;
  user: User;
  created_at: string;
  read_at: string | null;
  type: 'text' | 'image' | 'file' | 'voice_note';
  file_path?: string;
  voice_note_path?: string;
  media?: { id: number; file_path: string; file_type: string }[];
  reactions?: MessageReaction[];
}

export interface Conversation {
  id: number;
  name?: string;
  users: User[];
  messages: Message[];
  unread_messages_count?: number;
}

export interface SendMessagePayload {
  content: string;
  files?: File[];
  voice_note?: Blob;
}

export interface VoiceCall {
  id: number;
  caller_id: number;
  receiver_id: number;
  status: 'dialing' | 'answered' | 'ended';
  started_at?: string;
  ended_at?: string;
  caller: User;
  receiver: User;
}

export interface ProfitAndLossPeriodData {
  period: {
    start_date: string;
    end_date: string;
  };
  revenue: number;
  expenses: number;
  net_income: number;
  revenue_accounts: { id: number; account_name: string }[];
  expense_accounts: { id: number; account_name: string }[];
}

export interface ProfitAndLossData {
  primary: ProfitAndLossPeriodData;
  comparison: ProfitAndLossPeriodData | null;
}

export interface BalanceSheetReportData {
  date: string;
  assets: { name: string; balance: number }[];
  liabilities: { name: string; balance: number }[];
  equity: { name: string; balance: number }[];
  total_assets: number;
  total_liabilities: number;
  total_equity: number;
  total_liabilities_and_equity: number;
}

export interface BalanceSheetData {
  primary: BalanceSheetReportData;
  comparison: BalanceSheetReportData | null;
}

export interface StatementOfChangesInEquityPeriodData {
  period: {
    start_date: string;
    end_date: string;
  };
  beginning_balance: number;
  net_income: number;
  ending_balance: number;
}

export interface StatementOfChangesInEquityData {
  primary: StatementOfChangesInEquityPeriodData;
  comparison: StatementOfChangesInEquityPeriodData | null;
}

export interface CashFlowData {
    primary: {
        operating_activities: {
            inflows: number;
            outflows: number;
            net_cash_flow: number;
        };
        investing_activities: {
            inflows: number;
            outflows: number;
            net_cash_flow: number;
        };
        financing_activities: {
            inflows: number;
            outflows: number;
            net_cash_flow: number;
        };
        net_increase_in_cash: number;
    };
}

export interface ArAgingData {
    aging_bucket: string;
    total_due: number;
    invoice_count: number;
}
