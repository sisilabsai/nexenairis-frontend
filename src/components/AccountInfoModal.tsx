import React, { useState } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  PhoneIcon,
  BanknotesIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClipboardIcon,
} from '@heroicons/react/24/outline';

interface AccountInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AccountType {
  type: string;
  emoji: string;
  color: string;
  bgColor: string;
  textColor: string;
  description: string;
  purpose: string;
  examples: Array<{
    code: string;
    name: string;
    description: string;
    whenToUse: string;
  }>;
}

const AccountInfoModal: React.FC<AccountInfoModalProps> = ({ isOpen, onClose }) => {
  const [selectedType, setSelectedType] = useState<string>('asset');
  const [copiedCode, setCopiedCode] = useState<string>('');

  const accountTypes: Record<string, AccountType> = {
    asset: {
      type: 'Assets',
      emoji: '💰',
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
      textColor: 'text-green-700',
      description: 'Resources owned by your business that have economic value',
      purpose: 'Track what your business owns - cash, inventory, equipment, and amounts owed to you by customers',
      examples: [
        {
          code: '1010',
          name: 'Cash in Hand',
          description: 'Physical cash available in your business premises',
          whenToUse: 'Record cash sales, petty cash expenses, and cash on hand for daily operations'
        },
        {
          code: '1020',
          name: 'Bank Account - Local Currency',
          description: 'Money deposited in your business bank account in local currency (UGX)',
          whenToUse: 'Track all bank deposits, withdrawals, and transfers in Ugandan Shillings'
        },
        {
          code: '1030',
          name: 'Mobile Money - MTN',
          description: 'Funds available in your MTN Mobile Money business account',
          whenToUse: 'Record MTN Mobile Money receipts, payments, and balance tracking'
        },
        {
          code: '1031',
          name: 'Mobile Money - Airtel',
          description: 'Funds available in your Airtel Money business account',
          whenToUse: 'Track Airtel Money transactions, customer payments, and supplier payments'
        },
        {
          code: '1200',
          name: 'Accounts Receivable',
          description: 'Money owed to your business by customers for credit sales',
          whenToUse: 'When you sell goods/services on credit - customer promises to pay later'
        },
        {
          code: '1300',
          name: 'Inventory',
          description: 'Goods held for sale in the ordinary course of business',
          whenToUse: 'Track the cost of products you buy for resale or manufacture'
        }
      ]
    },
    liability: {
      type: 'Liabilities',
      emoji: '📋',
      color: 'from-red-500 to-pink-600',
      bgColor: 'bg-gradient-to-br from-red-50 to-pink-50',
      textColor: 'text-red-700',
      description: 'Debts and obligations your business owes to others',
      purpose: 'Track what your business owes - loans, unpaid bills, taxes, and amounts owed to suppliers',
      examples: [
        {
          code: '2010',
          name: 'Accounts Payable',
          description: 'Money your business owes to suppliers for purchases on credit',
          whenToUse: 'When you buy goods/services on credit - you promise to pay the supplier later'
        },
        {
          code: '2030',
          name: 'Tax Payable - VAT',
          description: 'Value Added Tax collected from customers but not yet paid to URA',
          whenToUse: 'Record VAT collected on sales that must be remitted to Uganda Revenue Authority'
        },
        {
          code: '2031',
          name: 'Tax Payable - PAYE',
          description: 'Pay As You Earn tax deducted from employee salaries',
          whenToUse: 'Track income tax deducted from staff salaries for remittance to URA'
        },
        {
          code: '2040',
          name: 'Short-term Loans',
          description: 'Money borrowed from banks, SACCOs, or individuals payable within one year',
          whenToUse: 'Record business loans, microfinance, or any borrowed funds for operations'
        }
      ]
    },
    equity: {
      type: 'Equity',
      emoji: '🏛️',
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      textColor: 'text-blue-700',
      description: 'Owner\'s interest in the business - what belongs to you after paying all debts',
      purpose: 'Track owner investments, retained profits, and the net worth of your business',
      examples: [
        {
          code: '3010',
          name: 'Share Capital',
          description: 'Initial investment put into the business by the owner(s)',
          whenToUse: 'Record the original money or assets invested to start the business'
        },
        {
          code: '3020',
          name: 'Retained Earnings',
          description: 'Profits from previous years that were kept in the business',
          whenToUse: 'Track accumulated profits not withdrawn by owners from past years'
        },
        {
          code: '3030',
          name: 'Current Year Earnings',
          description: 'Profit or loss generated in the current accounting period',
          whenToUse: 'Automatically calculated as Revenue minus Expenses for the current year'
        }
      ]
    },
    revenue: {
      type: 'Revenue',
      emoji: '💹',
      color: 'from-purple-500 to-violet-600',
      bgColor: 'bg-gradient-to-br from-purple-50 to-violet-50',
      textColor: 'text-purple-700',
      description: 'Income earned by your business from sales and other sources',
      purpose: 'Track all money coming into your business from sales, services, and other income',
      examples: [
        {
          code: '4010',
          name: 'Sales Revenue - Local',
          description: 'Income from selling goods or services to customers within Uganda',
          whenToUse: 'Record all sales made to local customers in Ugandan Shillings'
        },
        {
          code: '4020',
          name: 'Sales Revenue - Export',
          description: 'Income from selling goods or services to customers outside Uganda',
          whenToUse: 'Track sales made to foreign customers, usually in foreign currency'
        },
        {
          code: '4030',
          name: 'Service Revenue',
          description: 'Income earned from providing services rather than selling products',
          whenToUse: 'Record income from consultancy, repair work, professional services, etc.'
        },
        {
          code: '4100',
          name: 'Other Income',
          description: 'Income from sources other than main business operations',
          whenToUse: 'Record rental income, interest earned, commission received, etc.'
        }
      ]
    },
    expense: {
      type: 'Expenses',
      emoji: '💸',
      color: 'from-orange-500 to-amber-600',
      bgColor: 'bg-gradient-to-br from-orange-50 to-amber-50',
      textColor: 'text-orange-700',
      description: 'Costs incurred by your business to generate revenue and operate',
      purpose: 'Track all money going out of your business for operations, purchases, and other costs',
      examples: [
        {
          code: '5010',
          name: 'Cost of Goods Sold',
          description: 'Direct cost of products sold including purchase price and direct labor',
          whenToUse: 'Record the cost of inventory items when they are sold to customers'
        },
        {
          code: '6010',
          name: 'Salaries and Wages',
          description: 'Payment to employees for their work including bonuses and allowances',
          whenToUse: 'Record all staff payments - monthly salaries, daily wages, overtime, bonuses'
        },
        {
          code: '6020',
          name: 'Rent Expense',
          description: 'Payment for using business premises, equipment, or vehicles',
          whenToUse: 'Record monthly shop rent, office rent, equipment rental payments'
        },
        {
          code: '6030',
          name: 'Utilities',
          description: 'Payments for electricity, water, gas, and other utility services',
          whenToUse: 'Record UMEME bills, NWSC bills, internet, telephone charges'
        },
        {
          code: '6060',
          name: 'Transport & Travel',
          description: 'Costs for business travel, vehicle maintenance, and fuel',
          whenToUse: 'Record fuel costs, vehicle repairs, business trips, delivery expenses'
        },
        {
          code: '6070',
          name: 'Communications',
          description: 'Costs for phone, internet, and communication services',
          whenToUse: 'Record airtime, internet bundles, phone bills for business use'
        }
      ]
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const namingConventions = [
    {
      category: 'Asset Accounts',
      range: '1000-1999',
      structure: '1XXX',
      examples: ['1010 - Cash', '1200 - Accounts Receivable', '1300 - Inventory']
    },
    {
      category: 'Liability Accounts',
      range: '2000-2999',
      structure: '2XXX',
      examples: ['2010 - Accounts Payable', '2030 - VAT Payable', '2040 - Loans']
    },
    {
      category: 'Equity Accounts',
      range: '3000-3999',
      structure: '3XXX',
      examples: ['3010 - Share Capital', '3020 - Retained Earnings']
    },
    {
      category: 'Revenue Accounts',
      range: '4000-4999',
      structure: '4XXX',
      examples: ['4010 - Sales Revenue', '4030 - Service Revenue']
    },
    {
      category: 'Expense Accounts',
      range: '5000-6999',
      structure: '5XXX-6XXX',
      examples: ['5010 - Cost of Goods Sold', '6010 - Salaries', '6020 - Rent']
    }
  ];

  if (!isOpen) return null;

  const currentType = accountTypes[selectedType];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <LightBulbIcon className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">Chart of Accounts Learning Center</h2>
                <p className="text-indigo-100">Master accounting fundamentals for African businesses</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Account Types */}
          <div className="w-1/3 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Account Types
              </h3>
              <div className="space-y-3">
                {Object.entries(accountTypes).map(([key, type]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedType(key)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedType === key
                        ? `${type.bgColor} border-2 shadow-md`
                        : 'bg-white border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{type.emoji}</span>
                      <div>
                        <div className={`font-semibold ${selectedType === key ? type.textColor : 'text-gray-900'}`}>
                          {type.type}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Naming Conventions */}
            <div className="px-6 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Naming Conventions
              </h3>
              <div className="space-y-3">
                {namingConventions.map((convention, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="font-medium text-sm text-gray-900">{convention.category}</div>
                    <div className="text-xs text-indigo-600 font-mono">{convention.range}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {convention.examples.join(' • ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {/* Type Header */}
              <div className={`${currentType.bgColor} rounded-xl p-6 border border-gray-100 mb-6`}>
                <div className="flex items-center space-x-4 mb-4">
                  <span className="text-4xl">{currentType.emoji}</span>
                  <div>
                    <h2 className={`text-2xl font-bold ${currentType.textColor}`}>
                      {currentType.type}
                    </h2>
                    <p className="text-gray-600 mt-1">{currentType.description}</p>
                  </div>
                </div>
                
                <div className="bg-white/70 rounded-lg p-4 border border-gray-100">
                  <h4 className={`font-semibold ${currentType.textColor} mb-2 flex items-center`}>
                    <LightBulbIcon className="h-4 w-4 mr-2" />
                    Purpose & Usage
                  </h4>
                  <p className="text-gray-700">{currentType.purpose}</p>
                </div>
              </div>

              {/* Account Examples */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Example Accounts
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {currentType.examples.map((account, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`px-2 py-1 rounded font-mono text-sm ${currentType.bgColor} ${currentType.textColor}`}>
                            {account.code}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{account.name}</h4>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => copyToClipboard(`${account.code} - ${account.name}`, account.code)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Copy account code and name"
                        >
                          {copiedCode === account.code ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                          ) : (
                            <ClipboardIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-3">{account.description}</p>
                      
                      <div className="border-t border-gray-100 pt-3">
                        <h5 className="font-medium text-gray-900 text-sm mb-2 flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                          When to Use:
                        </h5>
                        <p className="text-gray-600 text-sm">{account.whenToUse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips Section */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                  <LightBulbIcon className="h-5 w-5 mr-2" />
                  Pro Tips for African Businesses
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <PhoneIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Mobile Money:</span> Always separate different providers (MTN, Airtel) for accurate tracking
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <BanknotesIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Multi-Currency:</span> Create separate accounts for USD, EUR if you deal in foreign currency
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <BuildingLibraryIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Tax Compliance:</span> Separate VAT and PAYE accounts help with URA reporting
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <UserGroupIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="font-medium">Local vs Export:</span> Separate revenue accounts help track different customer segments
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              💡 Use this guide to understand and create your own chart of accounts
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Got It, Thanks!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInfoModal;