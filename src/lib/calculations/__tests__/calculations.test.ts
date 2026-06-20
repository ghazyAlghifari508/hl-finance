import { describe, it, expect } from "vitest";
import { calcDiscountedPrice, calcEffectiveDiscountPercent } from "../discount";
import { calcLineItem, calcBonTotals } from "../bon";
import { calcBonusAvailable } from "../bonus";

describe("Discount Calculations", () => {
  it("AC-2.9: calculates cascading discount correctly", () => {
    // Expected: 100 * 0.8 * 0.8 * 0.9 = 57.6
    expect(calcDiscountedPrice(100, [20, 20, 10])).toBe(57.6);
  });

  it("returns base price if no discounts applied", () => {
    expect(calcDiscountedPrice(150, [])).toBe(150);
    expect(calcDiscountedPrice(150, [0])).toBe(150);
  });

  it("calculates effective discount percentage", () => {
    // 100 -> 57.6 is a 42.4% discount
    expect(calcEffectiveDiscountPercent([20, 20, 10])).toBe(42.4);
    // 100 -> 50 -> 25 is a 75% discount
    expect(calcEffectiveDiscountPercent([50, 50])).toBe(75);
  });
});

describe("Bon Calculations", () => {
  it("calculates single line item correctly", () => {
    const input = {
      basePrice: 100000,
      modalPrice: 40000,
      quantity: 2,
      discountSteps: [10], // 90,000 unit price
    };

    const result = calcLineItem(input);
    expect(result.discountedUnitPrice).toBe(90000);
    expect(result.lineOmzet).toBe(180000); // 90k * 2
    expect(result.lineLaba).toBe(100000);  // (90k - 40k) * 2
  });

  it("AC-5.7: bonus line items have 0 omzet and 0 laba", () => {
    const input = {
      basePrice: 100000,
      modalPrice: 40000,
      quantity: 5,
      discountSteps: [10],
      isBonusLine: true,
    };

    const result = calcLineItem(input);
    expect(result.discountedUnitPrice).toBe(0);
    expect(result.lineOmzet).toBe(0);
    expect(result.lineLaba).toBe(0);
  });

  it("AC-4.12: calculates transaction totals correctly with ongkir", () => {
    const line1 = calcLineItem({ basePrice: 100, modalPrice: 50, quantity: 2, discountSteps: [] }); // omzet 200, laba 100
    const line2 = calcLineItem({ basePrice: 200, modalPrice: 150, quantity: 1, discountSteps: [50] }); // omzet 100, laba -50

    const totals = calcBonTotals([line1, line2], 25);

    expect(totals.totalOmzet).toBe(300);
    expect(totals.totalLaba).toBe(50);
    expect(totals.totalOwed).toBe(325); // 300 omzet + 25 ongkir
  });

  it("ongkir does not increase laba", () => {
    const line1 = calcLineItem({ basePrice: 100, modalPrice: 50, quantity: 1, discountSteps: [] });

    // High ongkir
    const totals = calcBonTotals([line1], 500);

    expect(totals.totalOmzet).toBe(100);
    expect(totals.totalLaba).toBe(50); // Remains 50, not affected by ongkir
    expect(totals.totalOwed).toBe(600);
  });
});

describe("Bonus Calculations", () => {
  it("AC-5.3: calculates available bonuses correctly", () => {
    // 25M accumulated, 10M threshold => 2 total earned. 0 granted => 2 available.
    expect(calcBonusAvailable(25000000, 10000000, 0)).toBe(2);

    // 1 already granted => 1 available.
    expect(calcBonusAvailable(25000000, 10000000, 1)).toBe(1);

    // 2 already granted => 0 available.
    expect(calcBonusAvailable(25000000, 10000000, 2)).toBe(0);
  });

  it("returns 0 if threshold is not reached", () => {
    expect(calcBonusAvailable(9000, 10000, 0)).toBe(0);
  });

  it("safeguards against negative values", () => {
    expect(calcBonusAvailable(-5000, 10000, 0)).toBe(0);
  });
});
