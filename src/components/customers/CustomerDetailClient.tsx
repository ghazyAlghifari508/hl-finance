"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Download } from "lucide-react";
import Link from "next/link";
import { settleMonth, settleBon } from "@/app/actions/settlement";

interface SummaryTotals {
  totalPiutang: number;
  totalDibayar: number;
  omzetLM: number;
  omzetBR: number;
  omzetTotal: number;
  totalLaba: number;
}

interface CustomerDetailProps {
  customer: any;
  bons: any[];
  availableMonths: string[]; // e.g., ["2026-06", "2026-05"]
  selectedMonth: string;
  summary: SummaryTotals;
}

export default function CustomerDetailClient({
  customer,
  bons,
  availableMonths,
  selectedMonth,
  summary,
}: CustomerDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [settleMode, setSettleMode] = useState<"bulk" | "single">("bulk");
  const [targetBonId, setTargetBonId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", newMonth);
    router.push(`/customers/${customer.id}?${params.toString()}`);
  };

  const openBulkSettleModal = () => {
    setSettleMode("bulk");
    setTargetBonId(null);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setModalOpen(true);
  };

  const openSingleSettleModal = (bonId: string) => {
    setSettleMode("single");
    setTargetBonId(bonId);
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setModalOpen(true);
  };

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let res;
    if (settleMode === "bulk") {
      res = await settleMonth(customer.id, selectedMonth, paymentDate);
    } else if (settleMode === "single" && targetBonId) {
      res = await settleBon(targetBonId, paymentDate);
    }

    if (res?.error) {
      setError(res.error);
    } else {
      setModalOpen(false);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-paper-white p-4 rounded-[16px] border border-sand">
        <div className="flex items-center gap-3">
          <label htmlFor="month" className="text-[14px] font-medium text-ink-black">
            Bulan:
          </label>
          <select
            id="month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="h-10 rounded-[8px] border border-fog bg-paper-white px-3 py-1 text-[14px] text-ink-black focus:outline-none focus:ring-2 focus:ring-electric-blue"
          >
            {availableMonths.map((m) => {
              // Convert "YYYY-MM" to readable "Bulan Tahun"
              const [year, month] = m.split("-");
              const date = new Date(Number(year), Number(month) - 1, 1);
              const label = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date);
              return (
                <option key={m} value={m}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>

        <div className="flex gap-2">
          <Link href={`/api/export/customer?customerId=${customer.id}&month=${selectedMonth}`} target="_blank">
            <Button variant="ghost" className="h-10 border border-sand">
              <Download className="mr-2 h-4 w-4" />
              Cetak PDF
            </Button>
          </Link>
          {summary.totalPiutang > 0 && (
            <Button variant="secondary" onClick={openBulkSettleModal}>
              Sudah Lunas (Bulan Ini)
            </Button>
          )}
        </div>
      </div>

      {/* Monthly Summary Cards (Parchment background per DESIGN.md) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-parchment rounded-[24px] border border-sand p-6 flex flex-col justify-center">
          <p className="text-[14px] text-steel mb-1">Total Piutang</p>
          <p className="text-[24px] font-bold tracking-[-0.04em] text-ember-orange tabular-nums">
            {formatCurrency(summary.totalPiutang)}
          </p>
        </div>
        <div className="bg-parchment rounded-[24px] border border-sand p-6 flex flex-col justify-center">
          <p className="text-[14px] text-steel mb-1">Sudah Dibayar</p>
          <p className="text-[24px] font-bold tracking-[-0.04em] text-electric-blue tabular-nums">
            {formatCurrency(summary.totalDibayar)}
          </p>
        </div>
        <div className="bg-parchment rounded-[24px] border border-sand p-6 flex flex-col justify-center">
          <p className="text-[14px] text-steel mb-1">Omzet (Lunas)</p>
          <p className="text-[24px] font-bold tracking-[-0.04em] text-ink-black tabular-nums">
            {formatCurrency(summary.omzetTotal)}
          </p>
          <div className="flex items-center gap-2 mt-2 text-[12px] text-steel">
            <span>LM: {formatCurrency(summary.omzetLM)}</span>
            <span>•</span>
            <span>BR: {formatCurrency(summary.omzetBR)}</span>
          </div>
        </div>
        <div className="bg-parchment rounded-[24px] border border-sand p-6 flex flex-col justify-center">
          <p className="text-[14px] text-steel mb-1">Laba HL (Lunas)</p>
          <p className="text-[24px] font-bold tracking-[-0.04em] text-ink-black tabular-nums">
            {formatCurrency(summary.totalLaba)}
          </p>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
        <div className="px-6 py-4 border-b border-sand">
          <h2 className="text-[18px] font-semibold tracking-[-0.36px]">Daftar Transaksi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
              <tr>
                <th className="px-6 py-4">Nomor Bon</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {bons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-steel">
                    Tidak ada transaksi di bulan ini.
                  </td>
                </tr>
              ) : (
                bons.map((bon) => (
                  <tr key={bon.id} className="hover:bg-parchment/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink-black flex items-center gap-2">
                      {bon.nomorBon}
                      {bon.isBonus && (
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-electric-blue/10 text-electric-blue px-2 py-0.5 rounded-full">
                          Bonus
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-steel">
                      {formatDate(bon.tanggal)}
                    </td>
                    <td className="px-6 py-4">
                      {bon.status === "lunas" ? (
                        <Badge variant="success">Lunas</Badge>
                      ) : (
                        <Badge variant="warning">Piutang</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium text-ink-black">
                      {formatCurrency(bon.totalOwed)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {bon.status === "piutang" && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-[12px]"
                            onClick={() => openSingleSettleModal(bon.id)}
                          >
                            Lunas
                          </Button>
                        )}
                        <Link href={`/bons/${bon.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settlement Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-black/50 backdrop-blur-sm">
          <div className="bg-paper-white rounded-[24px] shadow-md w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <form onSubmit={handleSettle}>
              <div className="px-6 py-4 border-b border-sand">
                <h2 className="text-[20px] font-semibold tracking-[-0.46px]">
                  {settleMode === "bulk" ? "Pelunasan Bulan Ini" : "Pelunasan Bon"}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-ember-orange/10 border border-ember-orange/20 text-ember-orange rounded-[12.8px] text-[14px]">
                    {error}
                  </div>
                )}
                <p className="text-[14px] text-steel">
                  {settleMode === "bulk"
                    ? "Tandai semua transaksi piutang di bulan ini sebagai Lunas."
                    : "Tandai transaksi ini sebagai Lunas."}
                </p>
                <div className="space-y-2">
                  <label htmlFor="paymentDate" className="text-[14px] font-medium text-ink-black">
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
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" variant="secondary" disabled={loading}>
                  {loading ? "Menyimpan..." : "Konfirmasi Lunas"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
