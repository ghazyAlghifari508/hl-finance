import { calcDiscountedPrice, roundCurrency } from "./discount";

export interface LineCalcInput {
  basePrice: number;
  modalPrice: number;
  quantity: number;
  discountSteps: number[];
  isBonusLine?: boolean;
}

export interface LineCalcOutput {
  discountedUnitPrice: number;
  lineOmzet: number;
  lineLaba: number;
}

/**
 * Calculates Omzet and Laba for a single product line item.
 * Per AC-4.12:
 * - Line omzet = discounted unit price × quantity
 * - Line Laba HL = (discounted unit price − harga modal) × quantity
 * - Bonus items are free -> 0 omzet, 0 laba (AC-5.7)
 */
export function calcLineItem(input: LineCalcInput): LineCalcOutput {
  if (input.isBonusLine) {
    return {
      discountedUnitPrice: 0,
      lineOmzet: 0,
      lineLaba: 0,
    };
  }

  const discountedUnitPrice = calcDiscountedPrice(input.basePrice, input.discountSteps);
  const lineOmzet = roundCurrency(discountedUnitPrice * input.quantity);
  const lineLaba = roundCurrency((discountedUnitPrice - input.modalPrice) * input.quantity);

  return {
    discountedUnitPrice,
    lineOmzet,
    lineLaba,
  };
}

export interface BonTotalsOutput {
  totalOmzet: number;
  totalLaba: number;
  totalOwed: number;
}

/**
 * Calculates aggregate totals for an entire transaction (Bon).
 * Per AC-4.12:
 * - Transaction omzet = Σ line omzet, ongkir excluded
 * - Amount owed (Piutang) = transaction omzet + ongkir
 * - Transaction Laba HL = Σ line Laba HL, ongkir excluded — pass-through
 */
export function calcBonTotals(lines: LineCalcOutput[], ongkir: number = 0): BonTotalsOutput {
  const totalOmzet = lines.reduce((sum, line) => sum + line.lineOmzet, 0);
  const totalLaba = lines.reduce((sum, line) => sum + line.lineLaba, 0);

  // Ongkir only affects owed amount, not omzet or laba
  const safeOngkir = Math.max(0, ongkir);
  const totalOwed = totalOmzet + safeOngkir;

  return {
    totalOmzet: roundCurrency(totalOmzet),
    totalLaba: roundCurrency(totalLaba),
    totalOwed: roundCurrency(totalOwed),
  };
}
