import { z } from "zod";

const discountStepSchema = z.object({
  stepOrder: z.number().int().min(1),
  discountPercent: z.coerce.number().min(0, "Diskon tidak boleh negatif").max(100, "Diskon maksimal 100%"),
});

export const customerSchema = z.object({
  name: z.string().min(1, "Nama customer wajib diisi").max(255),
  bonusThreshold: z.coerce.number().min(0, "Ambang batas bonus tidak boleh negatif"),
  discountsLM: z.array(discountStepSchema),
  discountsBR: z.array(discountStepSchema),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
