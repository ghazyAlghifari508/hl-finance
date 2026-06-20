import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi").max(255),
  tipe: z.enum(["LM", "BR"], { message: "Tipe produk wajib dipilih" }),
  hargaModal: z.coerce.number().min(0, "Harga modal tidak boleh negatif"),
  hargaBase: z.coerce.number().min(0, "Harga jual/base tidak boleh negatif"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
