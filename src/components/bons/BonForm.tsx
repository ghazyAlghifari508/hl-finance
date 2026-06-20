"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBon } from "@/app/actions/bons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { calcLineItem, calcBonTotals } from "@/lib/calculations/bon";

interface BonFormProps {
  customers: any[];
  products: any[];
  bonusStats: Record<string, number>;
}

export function BonForm({ customers, products, bonusStats }: BonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [tanggal, setTanggal] = useState<string>(new Date().toISOString().split("T")[0]);
  const [nomorBon, setNomorBon] = useState<string>("");
  const [customerId, setCustomerId] = useState<string>("");
  const [ongkir, setOngkir] = useState<number>(0);
  const [deskripsi, setDeskripsi] = useState<string>("");
  const [isBonus, setIsBonus] = useState<boolean>(false);
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: "", quantity: 1 }
  ]);

  // Derived State (Calculations)
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === customerId) || null;
  }, [customerId, customers]);

  const availableBonuses = selectedCustomer ? (bonusStats[selectedCustomer.id] || 0) : 0;
  const canClaimBonus = availableBonuses > 0;

  // Auto-reset isBonus if user changes customer to someone without bonuses
  if (isBonus && !canClaimBonus && customerId) {
    setIsBonus(false);
  }

  const calculationPreview = useMemo(() => {
    if (!selectedCustomer || lineItems.length === 0) {
      return { lines: [], totals: { totalOmzet: 0, totalLaba: 0, totalOwed: 0 } };
    }

    const calculatedLines = lineItems.map((item) => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return { ...item, lineOmzet: 0, lineLaba: 0, discountedUnitPrice: 0, productDetails: null, discountSteps: [] };

      const discountSteps = selectedCustomer.discounts
        ?.filter((d: any) => d.productType === prod.tipe)
        ?.map((d: any) => Number(d.discountPercent)) || [];

      const calcRes = calcLineItem({
        basePrice: Number(prod.hargaBase),
        modalPrice: Number(prod.hargaModal),
        quantity: item.quantity,
        discountSteps,
        isBonusLine: isBonus,
      });

      return {
        ...item,
        productDetails: prod,
        discountSteps,
        ...calcRes
      };
    });

    // Only sum valid products
    const validLines = calculatedLines.filter(l => l.productDetails);
    const totals = calcBonTotals(validLines, ongkir);

    return { lines: calculatedLines, totals };
  }, [selectedCustomer, lineItems, products, ongkir, isBonus]);

  // Handlers
  const handleAddLine = () => {
    setLineItems([...lineItems, { productId: "", quantity: 1 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lineItems.length === 1) return; // Prevent removing last line
    const list = [...lineItems];
    list.splice(index, 1);
    setLineItems(list);
  };

  const handleLineChange = (index: number, field: "productId" | "quantity", value: any) => {
    const list = [...lineItems];
    list[index] = { ...list[index], [field]: value };
    setLineItems(list);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Prepare data
    const formData = {
      nomorBon,
      tanggal: new Date(tanggal),
      customerId,
      ongkir,
      deskripsi,
      isBonus,
      lineItems: lineItems.filter(l => l.productId !== "")
    };

    if (formData.lineItems.length === 0) {
      setError("Silakan tambahkan minimal 1 produk.");
      setLoading(false);
      return;
    }

    const res = await createBon(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/bons");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-ember-orange/10 border border-ember-orange/20 text-ember-orange rounded-[12.8px] text-[14px]">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Form Inputs */}
        <div className="lg:col-span-2 space-y-8">

          {/* Metadata Section */}
          <div className="bg-paper-white rounded-[24px] border border-sand p-6 space-y-4">
            <h2 className="text-[18px] font-semibold tracking-[-0.36px]">Informasi Dasar</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nomorBon">Nomor Bon</Label>
                <Input
                  id="nomorBon"
                  required
                  value={nomorBon}
                  onChange={(e) => setNomorBon(e.target.value)}
                  placeholder="Contoh: INV-001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <select
                id="customerId"
                required
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="flex h-12 w-full rounded-[12.8px] border border-fog bg-paper-white px-3 py-2 text-[16px] text-ink-black focus:outline-none focus:ring-2 focus:ring-electric-blue"
              >
                <option value="" disabled>-- Pilih Customer --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isBonus"
                checked={isBonus}
                disabled={!canClaimBonus || !selectedCustomer}
                onChange={(e) => setIsBonus(e.target.checked)}
                className="h-4 w-4 rounded border-fog text-electric-blue focus:ring-electric-blue disabled:opacity-50"
              />
              <Label htmlFor="isBonus" className={`font-normal ${!canClaimBonus ? "text-steel" : "cursor-pointer"}`}>
                Tandai sebagai Bon Bonus (Gratis)
              </Label>
              {selectedCustomer && (
                <span className="ml-auto text-[12px] font-medium bg-parchment px-2 py-1 rounded-full border border-sand">
                  {availableBonuses} Tersedia
                </span>
              )}
            </div>
          </div>

          {/* Line Items Section */}
          <div className="bg-paper-white rounded-[24px] border border-sand p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-semibold tracking-[-0.36px]">Daftar Produk</h2>
            </div>

            <div className="space-y-4">
              {lineItems.map((item, index) => {
                const calcPreview = calculationPreview.lines[index];
                const productOptions = products.filter(p => !p.isDeleted || p.id === item.productId);

                return (
                  <div key={index} className="flex flex-col sm:flex-row gap-3 p-4 bg-parchment rounded-[12.8px] border border-sand">
                    <div className="flex-1 space-y-2">
                      <Label className="text-[12px] text-steel">Produk</Label>
                      <select
                        required
                        value={item.productId}
                        onChange={(e) => handleLineChange(index, "productId", e.target.value)}
                        className="flex h-10 w-full rounded-[8px] border border-fog bg-paper-white px-3 text-[14px] text-ink-black focus:outline-none focus:ring-2 focus:ring-electric-blue"
                      >
                        <option value="" disabled>Pilih Produk</option>
                        {productOptions.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.tipe})</option>
                        ))}
                      </select>

                      {/* Price Preview helper */}
                      {calcPreview?.productDetails && (
                        <div className="text-[12px] text-steel flex justify-between">
                          <span>Harga Jual: {formatCurrency(Number(calcPreview.productDetails.hargaBase))}</span>
                          {calcPreview.discountSteps.length > 0 && !isBonus && (
                            <span className="text-electric-blue font-medium">
                              Diskon: {calcPreview.discountSteps.map((d:any)=>`${d}%`).join(' + ')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-full sm:w-24 space-y-2">
                      <Label className="text-[12px] text-steel">Qty</Label>
                      <Input
                        type="number"
                        min="1"
                        required
                        className="h-10 text-[14px]"
                        value={item.quantity || ""}
                        onChange={(e) => handleLineChange(index, "quantity", Number(e.target.value))}
                      />
                    </div>

                    <div className="w-full sm:w-32 space-y-2">
                      <Label className="text-[12px] text-steel">Omzet Baris</Label>
                      <div className="h-10 flex items-center px-3 text-[14px] font-medium text-ink-black bg-paper-white rounded-[8px] border border-transparent">
                        {calcPreview?.lineOmzet ? formatCurrency(calcPreview.lineOmzet) : "-"}
                      </div>
                    </div>

                    <div className="flex items-end pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveLine(index)}
                        disabled={lineItems.length === 1}
                        className="h-10 w-10 text-ember-orange hover:bg-ember-orange/10 disabled:opacity-30"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="w-full mt-2 rounded-[12.8px] border border-dashed border-fog text-steel hover:text-ink-black hover:border-electric-blue hover:bg-parchment h-12 flex items-center justify-center transition-colors text-[14px] font-medium font-body"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk Lainnya
            </button>
          </div>

          {/* Additional Info Section */}
          <div className="bg-paper-white rounded-[24px] border border-sand p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ongkir">Ongkos Kirim</Label>
                <Input
                  id="ongkir"
                  type="number"
                  min="0"
                  value={ongkir || ""}
                  onChange={(e) => setOngkir(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deskripsi">Catatan / Deskripsi (Opsional)</Label>
                <Input
                  id="deskripsi"
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Tambahkan catatan..."
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Calculation Summary Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-parchment rounded-[24px] border border-sand p-6 space-y-6">
            <h3 className="font-heading font-semibold text-[20px] tracking-[-0.46px]">Ringkasan Bon</h3>

            {!selectedCustomer ? (
              <p className="text-[14px] text-steel">Silakan pilih customer untuk melihat ringkasan.</p>
            ) : (
              <div className="space-y-4 text-[14px]">

                <div className="flex justify-between items-center text-steel">
                  <span>Customer</span>
                  <span className="font-medium text-ink-black truncate ml-4">{selectedCustomer.name}</span>
                </div>

                <div className="h-px bg-sand w-full my-2" />

                <div className="flex justify-between items-center text-steel">
                  <span>Total Omzet</span>
                  <span className="font-medium text-ink-black tabular-nums">
                    {formatCurrency(calculationPreview.totals.totalOmzet)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-steel">
                  <span>Ongkos Kirim</span>
                  <span className="font-medium text-ink-black tabular-nums">
                    {formatCurrency(ongkir || 0)}
                  </span>
                </div>

                <div className="h-px bg-sand w-full my-2" />

                <div className="flex justify-between items-end pt-2">
                  <span className="font-medium text-ink-black">Total Tagihan (Piutang)</span>
                  <span className="text-[24px] font-bold tracking-[-0.04em] text-ember-orange tabular-nums leading-none">
                    {formatCurrency(calculationPreview.totals.totalOwed)}
                  </span>
                </div>

                {/* Internal / Admin only stats */}
                <div className="mt-8 p-3 rounded-[8px] bg-paper-white border border-dashed border-fog">
                  <p className="text-[10px] uppercase tracking-wider text-steel font-semibold mb-2">Internal (Laba)</p>
                  <div className="flex justify-between items-center text-[12px]">
                    <span className="text-steel">Proyeksi Laba HL</span>
                    <span className="font-medium text-electric-blue tabular-nums">
                      {formatCurrency(calculationPreview.totals.totalLaba)}
                    </span>
                  </div>
                </div>

                <div className="pt-6">
                  <Button type="submit" variant="primary" className="w-full" disabled={loading || lineItems.length === 0}>
                    {loading ? "Menyimpan..." : "Simpan & Buat Bon"}
                  </Button>
                  <Link href="/bons" className="block mt-3">
                    <Button type="button" variant="ghost" className="w-full">
                      Batal
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </form>
  );
}
