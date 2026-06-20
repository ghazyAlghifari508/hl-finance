"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { settleBon } from "@/app/actions/settlement";

/**
 * AC-6.6: Melunasi satu Bon dari halaman detail.
 * Menampilkan tombol "Tandai Lunas" → modal Tanggal Pelunasan → settleBon().
 * Pola modal mengikuti CustomerDetailClient agar konsisten.
 */
export function SettleBonButton({ bonId }: { bonId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await settleBon(bonId, paymentDate);

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
    }
  };

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        Tandai Lunas
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-paper-white rounded-[24px] shadow-md w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSettle}>
              <div className="px-6 py-4 border-b border-sand">
                <h2 className="text-[20px] font-semibold tracking-[-0.46px]">
                  Pelunasan Bon
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-ember-orange/10 border border-ember-orange/20 text-ember-orange rounded-[12.8px] text-[14px]">
                    {error}
                  </div>
                )}
                <p className="text-[14px] text-steel">
                  Tandai transaksi ini sebagai Lunas.
                </p>
                <div className="space-y-2">
                  <label
                    htmlFor="paymentDate"
                    className="text-[14px] font-medium text-ink-black"
                  >
                    Tanggal Pembayaran
                  </label>
                  <input
                    id="paymentDate"
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="flex h-10 w-full rounded-[12.8px] border border-fog bg-paper-white px-3 py-2 text-[14px] text-ink-black focus:outline-none focus:ring-2 focus:ring-electric-blue"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-sand flex justify-end gap-3 bg-parchment">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Menyimpan..." : "Konfirmasi Lunas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
