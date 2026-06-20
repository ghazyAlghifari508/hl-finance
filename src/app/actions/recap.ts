"use server";

import prisma from "@/lib/prisma";

export interface RecapData {
  overall: {
    totalOmzet: number;
    totalLaba: number;
    totalPiutang: number;
    totalDibayar: number;
  };
  byType: {
    omzetLM: number;
    omzetBR: number;
    labaLM: number;
    labaBR: number;
  };
  byCustomer: Array<{
    customerId: string;
    customerName: string;
    totalOmzet: number;
    totalLaba: number;
    totalPiutang: number;
    totalDibayar: number;
  }>;
  // AC-7.7: bonus dilaporkan terpisah (tidak menggelembungkan omzet/laba).
  bonusLog: Array<{
    bonId: string;
    nomorBon: string;
    customerName: string;
    tanggal: string;
    bonusCount: number;
  }>;
}

/**
 * Menghitung rentang tanggal dari sebuah period.
 * - "YYYY-MM" → satu bulan penuh (AC-7.4 per bulan)
 * - "YYYY"    → satu tahun penuh (AC-7.4 per tahun)
 */
function resolvePeriodRange(period: string): { startDate: Date; endDate: Date } {
  const isYearOnly = /^\d{4}$/.test(period);
  if (isYearOnly) {
    const year = Number(period);
    return {
      startDate: new Date(year, 0, 1, 0, 0, 0, 0),
      endDate: new Date(year, 11, 31, 23, 59, 59, 999),
    };
  }
  const startDate = new Date(`${period}-01T00:00:00.000Z`);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

export async function getRecapData(period: string): Promise<{ data?: RecapData; error?: string }> {
  try {
    const { startDate, endDate } = resolvePeriodRange(period);

    const bons = await prisma.bon.findMany({
      where: {
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        customer: true,
        lineItems: true,
        bonusLedger: true,
      },
    });

    const recap: RecapData = {
      overall: { totalOmzet: 0, totalLaba: 0, totalPiutang: 0, totalDibayar: 0 },
      byType: { omzetLM: 0, omzetBR: 0, labaLM: 0, labaBR: 0 },
      byCustomer: [],
      bonusLog: [],
    };

    const customerMap = new Map<string, RecapData["byCustomer"][0]>();

    bons.forEach((bon) => {
      const isLunas = bon.status === "lunas";
      const isBonus = bon.isBonus;

      // 1. Process Piutang vs Dibayar (Includes Ongkir, Includes Bonus cost if any, though bonuses are free)
      const totalOwed = Number(bon.totalOwed);
      if (bon.status === "piutang") {
        recap.overall.totalPiutang += totalOwed;
      } else if (isLunas) {
        recap.overall.totalDibayar += totalOwed;
      }

      // 2. Process Omzet & Laba (Cash basis = Lunas only, Excludes Bonus)
      let bonOmzet = 0;
      let bonLaba = 0;

      if (isLunas && !isBonus) {
        bonOmzet = Number(bon.computedOmzet);
        bonLaba = Number(bon.computedLaba);

        recap.overall.totalOmzet += bonOmzet;
        recap.overall.totalLaba += bonLaba;

        // Breakdown by Line Item for LM vs BR
        bon.lineItems.forEach((line) => {
          const lOmzet = Number(line.lineOmzet);
          const lLaba = Number(line.lineLaba);

          if (line.productType === "LM") {
            recap.byType.omzetLM += lOmzet;
            recap.byType.labaLM += lLaba;
          } else if (line.productType === "BR") {
            recap.byType.omzetBR += lOmzet;
            recap.byType.labaBR += lLaba;
          }
        });
      }

      // 3. Process Customer Aggregation
      if (!customerMap.has(bon.customerId)) {
        customerMap.set(bon.customerId, {
          customerId: bon.customerId,
          customerName: bon.customer?.name || "Unknown",
          totalOmzet: 0,
          totalLaba: 0,
          totalPiutang: 0,
          totalDibayar: 0,
        });
      }

      const cData = customerMap.get(bon.customerId)!;
      if (bon.status === "piutang") cData.totalPiutang += totalOwed;
      if (isLunas) cData.totalDibayar += totalOwed;
      if (isLunas && !isBonus) {
        cData.totalOmzet += bonOmzet;
        cData.totalLaba += bonLaba;
      }

      // 4. Bonus log (AC-7.7): dilaporkan terpisah dari omzet/laba.
      if (isBonus) {
        recap.bonusLog.push({
          bonId: bon.id,
          nomorBon: bon.nomorBon,
          customerName: bon.customer?.name || "Unknown",
          tanggal: bon.tanggal.toISOString(),
          bonusCount: bon.bonusLedger?.bonusCount ?? 0,
        });
      }
    });

    // Sort customers by Omzet descending
    recap.byCustomer = Array.from(customerMap.values()).sort((a, b) => b.totalOmzet - a.totalOmzet);

    return { data: recap };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch recap data" };
  }
}
