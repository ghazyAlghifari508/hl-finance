"use server";

import prisma from "@/lib/prisma";
import { calcBonusAvailable } from "@/lib/calculations/bonus";

/**
 * Helper to fetch how many bonuses a specific customer has available to claim.
 * It calculates Omzet Lunas and compares it with BonusLedger.
 */
export async function getCustomerBonusStats(customerId: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: { bonusThreshold: true },
    });

    if (!customer) throw new Error("Customer not found");

    // 1. Calculate accumulated Lunas Omzet (non-bonus only)
    const lunasBons = await prisma.bon.findMany({
      where: {
        customerId,
        status: "lunas",
        isBonus: false,
      },
      select: { computedOmzet: true },
    });
    const accumulatedOmzet = lunasBons.reduce((acc, bon) => acc + Number(bon.computedOmzet), 0);

    // 2. Count already granted bonuses
    const ledgers = await prisma.bonusLedger.findMany({
      where: { customerId },
      select: { bonusCount: true },
    });
    const grantedCount = ledgers.reduce((acc, l) => acc + l.bonusCount, 0);

    // 3. Calculate available
    const available = calcBonusAvailable(
      accumulatedOmzet,
      Number(customer.bonusThreshold),
      grantedCount
    );

    return { data: { available, accumulatedOmzet, grantedCount, threshold: Number(customer.bonusThreshold) } };
  } catch (error: any) {
    return { error: error.message };
  }
}

/**
 * Returns available bonuses map for ALL active customers (useful for Form preview).
 */
export async function getAllCustomerBonusStats() {
  try {
    const customers = await prisma.customer.findMany({
      where: { isDeleted: false },
      select: { id: true, bonusThreshold: true },
    });

    const lunasBons = await prisma.bon.groupBy({
      by: ["customerId"],
      where: { status: "lunas", isBonus: false },
      _sum: { computedOmzet: true },
    });

    const ledgers = await prisma.bonusLedger.groupBy({
      by: ["customerId"],
      _sum: { bonusCount: true },
    });

    const statsMap: Record<string, number> = {};

    customers.forEach((c) => {
      const omzet = lunasBons.find(b => b.customerId === c.id)?._sum.computedOmzet || 0;
      const granted = ledgers.find(l => l.customerId === c.id)?._sum.bonusCount || 0;

      statsMap[c.id] = calcBonusAvailable(Number(omzet), Number(c.bonusThreshold), Number(granted));
    });

    return { data: statsMap };
  } catch (error: any) {
    return { error: error.message };
  }
}
