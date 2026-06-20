"use client";

import { useState } from "react";
import { CustomerFormValues } from "@/lib/validations/customer";
import { createCustomer, updateCustomer } from "@/app/actions/customers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerFormProps {
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CustomerForm({ initialData, onSuccess, onCancel }: CustomerFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"LM" | "BR">("LM");

  // Load existing discounts or start with empty arrays
  const initialLM = initialData?.discounts
    ?.filter((d: any) => d.productType === "LM")
    .map((d: any) => ({ stepOrder: d.stepOrder, discountPercent: d.discountPercent })) || [];

  const initialBR = initialData?.discounts
    ?.filter((d: any) => d.productType === "BR")
    .map((d: any) => ({ stepOrder: d.stepOrder, discountPercent: d.discountPercent })) || [];

  const [formData, setFormData] = useState<CustomerFormValues>({
    name: initialData?.name || "",
    bonusThreshold: initialData?.bonusThreshold || 0,
    discountsLM: initialLM,
    discountsBR: initialBR,
  });

  const handleAddDiscount = (type: "LM" | "BR") => {
    const key = type === "LM" ? "discountsLM" : "discountsBR";
    const list = formData[key];
    setFormData({
      ...formData,
      [key]: [...list, { stepOrder: list.length + 1, discountPercent: 0 }],
    });
  };

  const handleRemoveDiscount = (type: "LM" | "BR", index: number) => {
    const key = type === "LM" ? "discountsLM" : "discountsBR";
    const list = [...formData[key]];
    list.splice(index, 1);
    // Reorder stepOrder
    const reorderedList = list.map((item, i) => ({ ...item, stepOrder: i + 1 }));
    setFormData({ ...formData, [key]: reorderedList });
  };

  const handleDiscountChange = (type: "LM" | "BR", index: number, value: number) => {
    const key = type === "LM" ? "discountsLM" : "discountsBR";
    const list = [...formData[key]];
    list[index].discountPercent = value;
    setFormData({ ...formData, [key]: list });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = initialData
      ? await updateCustomer(initialData.id, formData)
      : await createCustomer(formData);

    if (res.error) {
      setError(res.error);
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  const renderDiscountsTab = (type: "LM" | "BR") => {
    const list = type === "LM" ? formData.discountsLM : formData.discountsBR;

    return (
      <div className="space-y-3 mt-4">
        {list.length === 0 ? (
          <p className="text-steel text-[14px] text-center py-4 bg-parchment rounded-[12.8px] border border-sand">
            Belum ada diskon {type} untuk customer ini.
          </p>
        ) : (
          list.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <span className="text-steel text-[14px] font-medium w-6">#{item.stepOrder}</span>
                <div className="relative flex-1">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    required
                    value={item.discountPercent}
                    onChange={(e) => handleDiscountChange(type, index, Number(e.target.value))}
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-steel text-[14px]">
                    %
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveDiscount(type, index)}
                className="text-ember-orange hover:text-ember-orange/80 hover:bg-ember-orange/10 px-2"
                aria-label="Hapus diskon"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleAddDiscount(type)}
          className="w-full mt-2 rounded-[12.8px] border-dashed border-fog text-steel hover:text-ink-black hover:border-electric-blue"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Diskon {type}
        </Button>
      </div>
    );
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
          <Label htmlFor="name">Nama Customer</Label>
          <Input
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Contoh: Toko Emas Abadi"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bonusThreshold">Ambang Batas Bonus (Rp)</Label>
          <Input
            id="bonusThreshold"
            type="number"
            min="0"
            required
            value={formData.bonusThreshold || ""}
            onChange={(e) => setFormData({ ...formData, bonusThreshold: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-sand">
        <Label className="mb-2 block">Skema Diskon Kaskade</Label>

        {/* Custom Tabs */}
        <div className="flex bg-parchment rounded-[12.8px] p-1 border border-sand">
          <button
            type="button"
            onClick={() => setActiveTab("LM")}
            className={cn(
              "flex-1 py-1.5 text-[14px] font-medium rounded-[8px] transition-colors",
              activeTab === "LM"
                ? "bg-paper-white text-electric-blue shadow-sm"
                : "text-steel hover:text-ink-black"
            )}
          >
            Logam Mulia (LM)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("BR")}
            className={cn(
              "flex-1 py-1.5 text-[14px] font-medium rounded-[8px] transition-colors",
              activeTab === "BR"
                ? "bg-paper-white text-electric-blue shadow-sm"
                : "text-steel hover:text-ink-black"
            )}
          >
            Barang (BR)
          </button>
        </div>

        {renderDiscountsTab(activeTab)}
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-sand">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Batal
        </Button>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Customer"}
        </Button>
      </div>
    </form>
  );
}
