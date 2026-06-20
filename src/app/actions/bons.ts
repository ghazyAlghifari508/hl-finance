"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bonSchema, BonFormValues } from "@/lib/validations/bon";
import { Prisma } from "@prisma/client";
import { calcLineItem, calcBonTotals } from "@/lib/calculations/bon";
import { calcBonusAvailable } from "@/lib/calculations/bonus";

// Helpers untuk mem-parse struktur DB yang memiliki Decimal
function mapLineItemToPlain(item: any) {
  return {
    ...item,
    quantity: Number(item.quantity),
    hargaBaseSnapshot: Number(item.hargaBaseSnapshot),
    discountedUnitPrice: Number(item.discountedUnitPrice),
    lineOmzet: Number(item.lineOmzet),
    lineLaba: Number(item.lineLaba),
  };
}

function mapBonToPlain(bon: any) {
  if (!bon) return null;
  return {
    ...bon,
    ongkir: Number(bon.ongkir),
    computedOmzet: Number(bon.computedOmzet),
    computedLaba: Number(bon.computedLaba),
    totalOwed: Number(bon.totalOwed),
    lineItems: bon.lineItems ? bon.lineItems.map(mapLineItemToPlain) : [],
    customer: bon.customer ? {
      ...bon.customer,
      bonusThreshold: Number(bon.customer.bonusThreshold)
    } : undefined,
  };
}

export async function getBons() {
  try {
    const bons = await prisma.bon.findMany({
      include: {
        customer: true,
        lineItems: true, // AC-6.3: dibutuhkan untuk breakdown omzet LM vs BR
      },
      orderBy: { tanggal: "desc" },
    });
    return { data: bons.map(mapBonToPlain) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch bons" };
  }
}

export async function getBonById(id: string) {
  try {
    const bon = await prisma.bon.findUnique({
      where: { id },
      include: {
        customer: true,
        lineItems: {
          include: { product: true }
        },
      },
    });
    if (!bon) return { error: "Bon not found" };
    return { data: mapBonToPlain(bon) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch bon detail" };
  }
}

export async function createBon(data: BonFormValues) {
  try {
    const validated = bonSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const { nomorBon, tanggal, customerId, ongkir, deskripsi, isBonus, bonusCount, lineItems } = validated.data;

    // Check unique nomor bon
    const existing = await prisma.bon.findUnique({ where: { nomorBon } });
    if (existing) return { error: "Nomor Bon sudah digunakan" };

    // Ambil detail Customer beserta diskon-nya
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { discounts: { orderBy: { stepOrder: "asc" } } },
    });
    if (!customer) return { error: "Customer tidak ditemukan" };

    // Ambil detail Produk untuk semua baris
    const productIds = lineItems.map((l) => l.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const calculatedLines: Array<{
      productId: string;
      quantity: number;
      productType: "LM" | "BR";
      hargaBaseSnapshot: Prisma.Decimal;
      discountedUnitPrice: Prisma.Decimal;
      lineOmzet: Prisma.Decimal;
      lineLaba: Prisma.Decimal;
    }> = [];

    // Proses kalkulasi masing-masing baris
    for (const item of lineItems) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return { error: `Produk dengan ID ${item.productId} tidak ditemukan` };

      // Cari urutan diskon yang sesuai (LM / BR)
      const discountSteps = customer.discounts
        .filter((d) => d.productType === prod.tipe)
        .map((d) => Number(d.discountPercent));

      const calcRes = calcLineItem({
        basePrice: Number(prod.hargaBase),
        modalPrice: Number(prod.hargaModal),
        quantity: item.quantity,
        discountSteps,
        isBonusLine: isBonus,
      });

      calculatedLines.push({
        productId: prod.id,
        quantity: item.quantity,
        productType: prod.tipe,
        hargaBaseSnapshot: new Prisma.Decimal(Number(prod.hargaBase)),
        discountedUnitPrice: new Prisma.Decimal(calcRes.discountedUnitPrice),
        lineOmzet: new Prisma.Decimal(calcRes.lineOmzet),
        lineLaba: new Prisma.Decimal(calcRes.lineLaba),
      });
    }

    // Kalkulasi Total
    const lineOutputs = calculatedLines.map((l) => ({
      discountedUnitPrice: Number(l.discountedUnitPrice),
      lineOmzet: Number(l.lineOmzet),
      lineLaba: Number(l.lineLaba),
    }));

    const totals = calcBonTotals(lineOutputs, ongkir);

    // ============================================
    // TRANSAKSI PRISMA: Bon + BonusLedger
    // ============================================
    const newBon = await prisma.$transaction(async (tx) => {
      // Jika user nge-klik isBonus = true, kita pastikan di DB benar-benar valid!
      if (isBonus) {
        const lunasBons = await tx.bon.aggregate({
          where: { customerId, status: "lunas", isBonus: false },
          _sum: { computedOmzet: true },
        });
        const accumulated = Number(lunasBons._sum.computedOmzet || 0);

        const ledgers = await tx.bonusLedger.aggregate({
          where: { customerId },
          _sum: { bonusCount: true },
        });
        const granted = Number(ledgers._sum.bonusCount || 0);

        const available = calcBonusAvailable(accumulated, Number(customer.bonusThreshold), granted);

        if (available < 1) {
          throw new Error("Customer belum memenuhi syarat bonus (Omzet tidak cukup).");
        }
        // AC-5.5/5.6: tidak boleh meng-assign bonus melebihi yang tersedia.
        if (bonusCount > available) {
          throw new Error(`Bonus tersedia hanya ${available}, tidak bisa mengambil ${bonusCount}.`);
        }
      }

      // Buat Bon
      const createdBon = await tx.bon.create({
        data: {
          nomorBon,
          tanggal,
          customerId,
          ongkir: new Prisma.Decimal(ongkir),
          deskripsi,
          isBonus,
          status: "piutang", // Default AC-4.9
          computedOmzet: new Prisma.Decimal(totals.totalOmzet),
          computedLaba: new Prisma.Decimal(totals.totalLaba),
          totalOwed: new Prisma.Decimal(totals.totalOwed),
          lineItems: {
            create: calculatedLines,
          },
        },
      });

      // Jika isBonus, potong Ledger sebanyak bonusCount (AC-5.6: tiap bonus konsumsi 1 threshold).
      if (isBonus) {
        await tx.bonusLedger.create({
          data: {
            customerId,
            bonId: createdBon.id,
            bonusCount,
            omzetConsumed: new Prisma.Decimal(Number(customer.bonusThreshold) * bonusCount),
          },
        });
      }

      return createdBon;
    });

    revalidatePath("/bons");
    return { success: true, data: mapBonToPlain(newBon) };
  } catch (error: any) {
    return { error: error.message || "Failed to create bon" };
  }
}

export async function updateBon(id: string, data: BonFormValues) {
  try {
    const validated = bonSchema.safeParse(data);
    if (!validated.success) return { error: validated.error.issues[0].message };

    const { nomorBon, tanggal, customerId, ongkir, deskripsi, lineItems } = validated.data;

    // Pastikan bon ada
    const existingBon = await prisma.bon.findUnique({ where: { id } });
    if (!existingBon) return { error: "Bon tidak ditemukan" };

    // AC-4.2: Nomor Bon unik kecuali milik dirinya sendiri
    const duplicate = await prisma.bon.findUnique({ where: { nomorBon } });
    if (duplicate && duplicate.id !== id) {
      return { error: "Nomor Bon sudah digunakan" };
    }

    // Ambil customer + diskon
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { discounts: { orderBy: { stepOrder: "asc" } } },
    });
    if (!customer) return { error: "Customer tidak ditemukan" };

    const productIds = lineItems.map((l) => l.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    // AC-4.10.1: recalculate omzet/laba/totals dari awal.
    // isBonus dipertahankan dari bon yang ada (bonus mechanics tidak diubah lewat edit
    // agar BonusLedger tidak drift — pengubahan bonus dilakukan dgn hapus + buat ulang).
    const isBonus = existingBon.isBonus;

    const calculatedLines: Array<{
      productId: string;
      quantity: number;
      productType: "LM" | "BR";
      hargaBaseSnapshot: Prisma.Decimal;
      discountedUnitPrice: Prisma.Decimal;
      lineOmzet: Prisma.Decimal;
      lineLaba: Prisma.Decimal;
    }> = [];

    for (const item of lineItems) {
      const prod = products.find((p) => p.id === item.productId);
      if (!prod) return { error: `Produk dengan ID ${item.productId} tidak ditemukan` };

      const discountSteps = customer.discounts
        .filter((d) => d.productType === prod.tipe)
        .map((d) => Number(d.discountPercent));

      const calcRes = calcLineItem({
        basePrice: Number(prod.hargaBase),
        modalPrice: Number(prod.hargaModal),
        quantity: item.quantity,
        discountSteps,
        isBonusLine: isBonus,
      });

      calculatedLines.push({
        productId: prod.id,
        quantity: item.quantity,
        productType: prod.tipe,
        hargaBaseSnapshot: new Prisma.Decimal(Number(prod.hargaBase)),
        discountedUnitPrice: new Prisma.Decimal(calcRes.discountedUnitPrice),
        lineOmzet: new Prisma.Decimal(calcRes.lineOmzet),
        lineLaba: new Prisma.Decimal(calcRes.lineLaba),
      });
    }

    const lineOutputs = calculatedLines.map((l) => ({
      discountedUnitPrice: Number(l.discountedUnitPrice),
      lineOmzet: Number(l.lineOmzet),
      lineLaba: Number(l.lineLaba),
    }));

    const totals = calcBonTotals(lineOutputs, ongkir);

    const updatedBon = await prisma.$transaction(async (tx) => {
      // Hapus line item lama, buat ulang dari data terbaru
      await tx.bonLineItem.deleteMany({ where: { bonId: id } });

      return tx.bon.update({
        where: { id },
        data: {
          nomorBon,
          tanggal,
          customerId,
          ongkir: new Prisma.Decimal(ongkir),
          deskripsi,
          computedOmzet: new Prisma.Decimal(totals.totalOmzet),
          computedLaba: new Prisma.Decimal(totals.totalLaba),
          totalOwed: new Prisma.Decimal(totals.totalOwed),
          lineItems: {
            create: calculatedLines,
          },
        },
      });
    });

    revalidatePath("/bons");
    revalidatePath("/bons/[id]", "page");
    revalidatePath("/dashboard");
    revalidatePath("/recap");
    revalidatePath("/customers/[id]", "page");
    return { success: true, data: mapBonToPlain(updatedBon) };
  } catch (error: any) {
    return { error: error.message || "Failed to update bon" };
  }
}

export async function deleteBon(id: string) {
  try {
    await prisma.bon.delete({ where: { id } });
    revalidatePath("/bons");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete bon" };
  }
}
