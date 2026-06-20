/**
 * Rounds a number to a specified number of decimal places (default 2).
 * Important for financial math in JS to avoid 0.1 + 0.2 = 0.30000000000000004 issues.
 */
export function roundCurrency(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculates the final price after applying cascading percentage discounts sequentially.
 * Per AC-2.9: Discounted unit price = B × (1 - d1/100) × (1 - d2/100) × ... × (1 - dn/100)
 * Example: Base 100, discounts [20, 20, 10] => 57.6
 */
export function calcDiscountedPrice(basePrice: number, discountSteps: number[]): number {
  if (!discountSteps || discountSteps.length === 0) {
    return roundCurrency(basePrice);
  }

  const finalPrice = discountSteps.reduce(
    (price, step) => price * (1 - step / 100),
    basePrice
  );

  return roundCurrency(finalPrice);
}

/**
 * Calculates the effective total discount percentage.
 * Example: discounts [20, 20, 10] => 42.4%
 */
export function calcEffectiveDiscountPercent(discountSteps: number[]): number {
  if (!discountSteps || discountSteps.length === 0) return 0;

  // Calculate how much is left of 100 (which represents 100%)
  const remainingMultiplier = discountSteps.reduce(
    (acc, step) => acc * (1 - step / 100),
    1
  );

  // The discount is what's missing from 100%
  const effectiveDiscount = (1 - remainingMultiplier) * 100;

  return roundCurrency(effectiveDiscount);
}
