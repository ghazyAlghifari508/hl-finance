"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Melunasi semua transaksi berstatus 'piutang' untuk satu customer pada bulan tertentu.
 * @param customerId ID Customer
 * @param monthStr String bulan format 'YYYY-MM'
 * @param paymentDate Tanggal pelunasan (ISO string)
 */
export async function settleMonth(customerId: string, monthStr: string, paymentDate: string) {
  try {
    const startDate = new Date(`${monthStr}-01T00:00:00.000Z`);
    // Cari tanggal akhir di bulan tersebut
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const updated = await prisma.bon.updateMany({
      where: {
        customerId,
        status: "piutang",
        tanggal: {
          gte: startDate,
          lte: endDate,
        },
      },
      data: {
        status: "lunas",
        paymentDate: new Date(paymentDate),
      },
    });

    revalidatePath("/customers/[id]", "page");
    revalidatePath("/dashboard");
    revalidatePath("/recap");

    return { success: true, count: updated.count };
  } catch (error: any) {
    return { error: error.message || "Gagal melunasi bulan ini" };
  }
}

/**
 * Melunasi satu transaksi Bon.
 * @param bonId ID Bon
 * @param paymentDate Tanggal pelunasan (ISO string)
 */
export async function settleBon(bonId: string, paymentDate: string) {
  try {
    await prisma.bon.update({
      where: { id: bonId },
      data: {
        status: "lunas",
        paymentDate: new Date(paymentDate),
      },
    });

    revalidatePath("/customers/[id]", "page");
    revalidatePath("/bons/[id]", "page");
    revalidatePath("/bons");
    revalidatePath("/dashboard");
    revalidatePath("/recap");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Gagal melunasi bon" };
  }
}
