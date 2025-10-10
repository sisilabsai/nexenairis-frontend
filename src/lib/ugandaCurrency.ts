/**
 * Currency Utilities for Ugandan Market
 * All amounts in UGX (Ugandan Shillings)
 */

/**
 * Format amount as UGX currency
 * @param amount - Amount in UGX
 * @param showSymbol - Whether to show UGX symbol
 */
export const formatUGX = (amount: number, showSymbol: boolean = true): string => {
  const formatted = new Intl.NumberFormat('en-UG', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return showSymbol ? `UGX ${formatted}` : formatted;
};

/**
 * Format amount in abbreviated form (e.g., 1.5M, 250K)
 */
export const formatUGXAbbreviated = (amount: number, showSymbol: boolean = true): string => {
  const absAmount = Math.abs(amount);
  let formatted: string;

  if (absAmount >= 1_000_000_000) {
    formatted = `${(amount / 1_000_000_000).toFixed(1)}B`;
  } else if (absAmount >= 1_000_000) {
    formatted = `${(amount / 1_000_000).toFixed(1)}M`;
  } else if (absAmount >= 1_000) {
    formatted = `${(amount / 1_000).toFixed(1)}K`;
  } else {
    formatted = amount.toFixed(0);
  }

  return showSymbol ? `UGX ${formatted}` : formatted;
};

/**
 * Parse UGX string to number
 */
export const parseUGX = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0;
};

/**
 * Market-specific constants for Uganda
 */
export const UgandaMarketConstants = {
  // Average transaction values
  AVERAGE_TRANSACTION: 120_000, // UGX 120,000
  MIN_TRANSACTION: 10_000, // UGX 10,000
  MAX_TRANSACTION: 5_000_000, // UGX 5,000,000
  
  // Customer lifetime value estimates
  LOW_CLV: 500_000, // UGX 500K
  MEDIUM_CLV: 1_500_000, // UGX 1.5M
  HIGH_CLV: 5_000_000, // UGX 5M
  CHAMPION_CLV: 10_000_000, // UGX 10M
  
  // Mobile money transaction fees (approximate)
  MOBILE_MONEY_FEE_RATE: 0.015, // 1.5%
  
  // Market benchmarks
  HEALTHY_VERIFICATION_RATE: 0.65, // 65%
  HEALTHY_TRUST_SCORE: 6.5,
  HEALTHY_CHURN_RATE: 0.08, // 8%
  TARGET_WHATSAPP_ADOPTION: 0.75, // 75%
  
  // Growth metrics
  AVERAGE_MONTHLY_GROWTH: 0.12, // 12%
  TARGET_QUARTERLY_GROWTH: 0.40, // 40%
};

/**
 * Calculate CLV based on trust level and verification
 */
export const calculateCLV = (
  trustLevel: number,
  verified: boolean,
  transactionCount: number = 10
): number => {
  const baseCLV = UgandaMarketConstants.AVERAGE_TRANSACTION * transactionCount;
  const trustMultiplier = 1 + (trustLevel / 10);
  const verificationBonus = verified ? 1.5 : 1.0;
  
  return Math.round(baseCLV * trustMultiplier * verificationBonus);
};

/**
 * Estimate revenue potential
 */
export const estimateRevenuePotential = (
  contactCount: number,
  averageCLV: number,
  conversionRate: number = 0.23
): number => {
  return Math.round(contactCount * averageCLV * conversionRate);
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Calculate growth rate
 */
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

/**
 * Mobile Money Provider specific data
 */
export const MobileMoneyProviders = {
  MTN: {
    name: 'MTN Mobile Money',
    marketShare: 0.60, // 60%
    transactionLimit: 5_000_000,
  },
  AIRTEL: {
    name: 'Airtel Money',
    marketShare: 0.30, // 30%
    transactionLimit: 4_000_000,
  },
  AFRICELL: {
    name: 'Africell Money',
    marketShare: 0.10, // 10%
    transactionLimit: 2_000_000,
  },
};
