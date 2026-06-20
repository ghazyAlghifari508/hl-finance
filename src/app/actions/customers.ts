"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { customerSchema, CustomerFormValues } from "@/lib/validations/customer";
import { Prisma } from "@prisma/client";

// Mapper Decimal -> number
function mapCustomerToPlain(customer: any) {
  if (!customer) return null;
  return {
    ...customer,
    bonusThreshold: Number(customer.bonusThreshold),
    discounts: customer.discounts?.map((d: any) => ({
      ...d,
      discountPercent: Number(d.discountPercent),
    })),
  };
}

export async function getCustomers(includeDeleted = false) {
  try {
    const customers = await prisma.customer.findMany({
      where: includeDeleted ? undefined : { isDeleted: false },
      include: {
        discounts: {
          orderBy: { stepOrder: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return { data: customers.map(mapCustomerToPlain) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch customers" };
  }
}

export async function getCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        discounts: {
          orderBy: { stepOrder: "asc" },
        },
      },
    });
    if (!customer) return { error: "Customer not found" };
    return { data: mapCustomerToPlain(customer) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch customer" };
  }
}

export async function createCustomer(data: CustomerFormValues) {
  try {
    const validated = customerSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { name, bonusThreshold, discountsLM, discountsBR } = validated.data;

    // Gabungkan array LM dan BR untuk nested create
    const combinedDiscounts = [
      ...discountsLM.map((d) => ({
        productType: "LM" as const,
        stepOrder: d.stepOrder,
        discountPercent: new Prisma.Decimal(d.discountPercent),
      })),
      ...discountsBR.map((d) => ({
        productType: "BR" as const,
        stepOrder: d.stepOrder,
        discountPercent: new Prisma.Decimal(d.discountPercent),
      })),
    ];

    const customer = await prisma.customer.create({
      data: {
        name,
        bonusThreshold: new Prisma.Decimal(bonusThreshold),
        discounts: {
          create: combinedDiscounts,
        },
      },
      include: { discounts: true },
    });

    revalidatePath("/customers");
    return { success: true, data: mapCustomerToPlain(customer) };
  } catch (error: any) {
    return { error: error.message || "Failed to create customer" };
  }
}

export async function updateCustomer(id: string, data: CustomerFormValues) {
  try {
    const validated = customerSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { name, bonusThreshold, discountsLM, discountsBR } = validated.data;

    const combinedDiscounts = [
      ...discountsLM.map((d) => ({
        productType: "LM" as const,
        stepOrder: d.stepOrder,
        discountPercent: new Prisma.Decimal(d.discountPercent),
      })),
      ...discountsBR.map((d) => ({
        productType: "BR" as const,
        stepOrder: d.stepOrder,
        discountPercent: new Prisma.Decimal(d.discountPercent),
      })),
    ];

    // Gunakan update dengan menghapus relasi discount yang lama dan menggantinya dengan yang baru
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        bonusThreshold: new Prisma.Decimal(bonusThreshold),
        discounts: {
          deleteMany: {}, // Hapus semua discount yang ada
          create: combinedDiscounts, // Buat ulang berdasarkan data form terbaru
        },
      },
      include: { discounts: true },
    });

    revalidatePath("/customers");
    return { success: true, data: mapCustomerToPlain(customer) };
  } catch (error: any) {
    return { error: error.message || "Failed to update customer" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    // Soft delete
    await prisma.customer.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath("/customers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete customer" };
  }
}
