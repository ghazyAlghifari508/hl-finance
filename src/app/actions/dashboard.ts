"use server";

import prisma from "@/lib/prisma";
import { getAllCustomerBonusStats } from "./bonus";

export async function getDashboardData() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Total Piutang (ALL TIME)
    const piutangAggr = await prisma.bon.aggregate({
      where: { status: "piutang" },
      _sum: { totalOwed: true },
    });
    const totalPiutang = Number(piutangAggr._sum.totalOwed || 0);

    // 2. Omzet & Laba (LUNAS, THIS MONTH, NON-BONUS)
    const lunasAggr = await prisma.bon.aggregate({
      where: {
        status: "lunas",
        isBonus: false,
        tanggal: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { computedOmzet: true, computedLaba: true },
    });
    const omzetBulanIni = Number(lunasAggr._sum.computedOmzet || 0);
    const labaBulanIni = Number(lunasAggr._sum.computedLaba || 0);

    // 3. Recent 5 Bons
    const recentBonsRaw = await prisma.bon.findMany({
      take: 5,
      orderBy: { tanggal: "desc" },
      include: { customer: { select: { name: true } } },
    });
    const recentBons = recentBonsRaw.map((b) => ({
      id: b.id,
      nomorBon: b.nomorBon,
      tanggal: b.tanggal.toISOString(),
      customerName: b.customer?.name || "Unknown",
      status: b.status,
      isBonus: b.isBonus,
      totalOwed: Number(b.totalOwed),
    }));

    // 4. Bonus Pending Calculation
    const bonusStatsRes = await getAllCustomerBonusStats();
    let pendingBonusCount = 0;
    let customersWithBonus = 0;

    if (bonusStatsRes.data) {
      Object.values(bonusStatsRes.data).forEach((available) => {
        if (available > 0) {
          customersWithBonus++;
          pendingBonusCount += available;
        }
      });
    }

    return {
      data: {
        totalPiutang,
        omzetBulanIni,
        labaBulanIni,
        recentBons,
        pendingBonus: {
          totalAvailable: pendingBonusCount,
          customerCount: customersWithBonus,
        },
      },
    };
  } catch (error: any) {
    return { error: error.message || "Failed to load dashboard data" };
  }
}
