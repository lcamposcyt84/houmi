/**
 * Currency utilities for USD and VES conversion
 */

export interface PriceDisplay {
  usd: string;
  ves: string;
  usdRaw: number;
  vesRaw: number;
}

/**
 * Format a number as USD currency
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as VES (Bolívares) currency
 */
export function formatVES(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "VES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as VES with "Bs" prefix (simpler format)
 */
export function formatBs(amount: number): string {
  return `Bs ${new Intl.NumberFormat("es-VE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)}`;
}

/**
 * Convert USD to VES using exchange rate
 */
export function convertUsdToVes(usd: number, exchangeRate: number): number {
  return usd * exchangeRate;
}

/**
 * Calculate price display with both currencies
 */
export function calculatePriceDisplay(
  priceUsd: number,
  exchangeRate: number,
  manualVes?: number | null,
  useManualVes?: boolean
): PriceDisplay {
  const vesRaw =
    useManualVes && manualVes != null
      ? manualVes
      : convertUsdToVes(priceUsd, exchangeRate);

  return {
    usd: formatUSD(priceUsd),
    ves: formatBs(vesRaw),
    usdRaw: priceUsd,
    vesRaw,
  };
}

/**
 * Apply percentage change to a price
 */
export function applyPercentageChange(
  price: number,
  percentage: number
): number {
  const multiplier = 1 + percentage / 100;
  return Math.round(price * multiplier * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate the new price after percentage change (for preview)
 */
export function previewPriceChange(
  currentPrice: number,
  percentage: number
): {
  before: number;
  after: number;
  difference: number;
  percentageApplied: number;
} {
  const after = applyPercentageChange(currentPrice, percentage);
  return {
    before: currentPrice,
    after,
    difference: after - currentPrice,
    percentageApplied: percentage,
  };
}





