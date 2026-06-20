"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { productSchema, ProductFormValues } from "@/lib/validations/product";
import { Prisma } from "@prisma/client";

// Mappers for Decimal <-> number
function mapProductToPlain(product: any) {
  if (!product) return null;
  return {
    ...product,
    hargaModal: Number(product.hargaModal),
    hargaBase: Number(product.hargaBase),
  };
}

export async function getProducts(includeDeleted = false) {
  try {
    const products = await prisma.product.findMany({
      where: includeDeleted ? undefined : { isDeleted: false },
      orderBy: { name: "asc" },
    });
    return { data: products.map(mapProductToPlain) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch products" };
  }
}

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) return { error: "Product not found" };
    return { data: mapProductToPlain(product) };
  } catch (error: any) {
    return { error: error.message || "Failed to fetch product" };
  }
}

export async function createProduct(data: ProductFormValues) {
  try {
    const validated = productSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { name, tipe, hargaModal, hargaBase } = validated.data;

    const product = await prisma.product.create({
      data: {
        name,
        tipe,
        hargaModal: new Prisma.Decimal(hargaModal),
        hargaBase: new Prisma.Decimal(hargaBase),
      },
    });

    revalidatePath("/products");
    return { success: true, data: mapProductToPlain(product) };
  } catch (error: any) {
    return { error: error.message || "Failed to create product" };
  }
}

export async function updateProduct(id: string, data: ProductFormValues) {
  try {
    const validated = productSchema.safeParse(data);
    if (!validated.success) {
      return { error: validated.error.issues[0].message };
    }

    const { name, tipe, hargaModal, hargaBase } = validated.data;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        tipe,
        hargaModal: new Prisma.Decimal(hargaModal),
        hargaBase: new Prisma.Decimal(hargaBase),
      },
    });

    revalidatePath("/products");
    return { success: true, data: mapProductToPlain(product) };
  } catch (error: any) {
    return { error: error.message || "Failed to update product" };
  }
}

export async function deleteProduct(id: string) {
  try {
    // Soft delete per AC-3.5
    await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    revalidatePath("/products");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete product" };
  }
}
