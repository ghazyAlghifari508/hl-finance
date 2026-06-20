"use client";

import { useState } from "react";
import { ProductFormValues } from "@/lib/validations/product";
import { createProduct, updateProduct } from "@/app/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductFormProps {
  initialData?: any; // any product object
  onSuccess: () => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<ProductFormValues>({
    name: initialData?.name || "",
    tipe: initialData?.tipe || "LM",
    hargaModal: initialData?.hargaModal || 0,
    hargaBase: initialData?.hargaBase || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = initialData
      ? await updateProduct(initialData.id, formData)
      : await createProduct(formData);

    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-ember-orange/10 border border-ember-orange/20 text-ember-orange rounded-[12.8px] text-[14px]">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Produk</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Logam Mulia 5gr"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipe">Tipe Produk</Label>
          <select
            id="tipe"
            value={formData.tipe}
            onChange={(e) => setFormData({ ...formData, tipe: e.target.value as "LM" | "BR" })}
            className="flex h-10 w-full rounded-[12.8px] border border-fog bg-paper-white px-3 py-2 text-[16px] text-ink-black focus:outline-none focus:ring-2 focus:ring-electric-blue"
          >
            <option value="LM">Logam Mulia (LM)</option>
            <option value="BR">Barang (BR)</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hargaModal">
            Harga Modal <span className="text-steel font-normal text-[12px]">(Hanya untuk perhitungan laba internal)</span>
          </Label>
          <Input
            id="hargaModal"
            type="number"
            min="0"
            required
            value={formData.hargaModal || ""}
            onChange={(e) => setFormData({ ...formData, hargaModal: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hargaBase">Harga Jual (Base)</Label>
          <Input
            id="hargaBase"
            type="number"
            min="0"
            required
            value={formData.hargaBase || ""}
            onChange={(e) => setFormData({ ...formData, hargaBase: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-sand">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Produk"}
        </Button>
      </div>
    </form>
  );
}
