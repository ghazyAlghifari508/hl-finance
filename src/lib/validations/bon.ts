import { z } from "zod";

export const bonLineItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1, "Produk wajib dipilih"),
  quantity: z.coerce.number().int().min(1, "Quantity minimal 1"),
});

export const bonSchema = z.object({
  nomorBon: z.string().min(1, "Nomor bon wajib diisi").max(100),
  tanggal: z.coerce.date(),
  customerId: z.string().min(1, "Customer wajib dipilih"),
  ongkir: z.coerce.number().min(0, "Ongkir tidak boleh negatif").default(0),
  deskripsi: z.string().max(500).optional(),
  isBonus: z.boolean().default(false),
  // AC-5.5/5.6: satu bon bonus dapat memuat beberapa bonus sekaligus.
  bonusCount: z.coerce.number().int().min(1, "Jumlah bonus minimal 1").default(1),
  lineItems: z.array(bonLineItemSchema).min(1, "Minimal 1 produk harus ditambahkan"),
});

export type BonFormValues = z.infer<typeof bonSchema>;
