"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RecapData } from "@/app/actions/recap";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface RecapClientProps {
  data: RecapData;
  mode: "month" | "year";
  availableMonths: string[];
  availableYears: string[];
  selectedPeriod: string;
}

export default function RecapClient({
  data,
  mode,
  availableMonths,
  availableYears,
  selectedPeriod,
}: RecapClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overall" | "customer" | "type" | "bonus">("overall");

  const periodOptions = mode === "year" ? availableYears : availableMonths;

  const formatPeriodLabel = (value: string) => {
    if (mode === "year") return value;
    const [year, month] = value.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(date);
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    params.set("mode", mode);
    params.set("period", e.target.value);
    router.push(`/recap?${params.toString()}`);
  };

  const handleModeChange = (newMode: "month" | "year") => {
    if (newMode === mode) return;
    const params = new URLSearchParams();
    params.set("mode", newMode);
    // Tidak set period → server pakai default period mode tsb (bulan/tahun ini).
    router.push(`/recap?${params.toString()}`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-paper-white border border-sand p-3 rounded-[12.8px] shadow-sm">
          <p className="text-[14px] font-medium text-ink-black mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[12px]" style={{ color: entry.color }}>
              {entry.name}: <span className="font-semibold tabular-nums">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Format data for Recharts
  const customerChartData = data.byCustomer.slice(0, 10).map((c) => ({
    name: c.customerName,
    Omzet: c.totalOmzet,
    Piutang: c.totalPiutang,
  }));

  const typeChartData = [
    { name: "Logam Mulia (LM)", Omzet: data.byType.omzetLM, Laba: data.byType.labaLM },
    { name: "Barang (BR)", Omzet: data.byType.omzetBR, Laba: data.byType.labaBR },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">Laporan Recap</h1>
          <p className="text-steel text-[16px] mt-1">
            Ringkasan bisnis {mode === "year" ? "per tahun" : "per bulan"} (Cash Basis)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle Bulan / Tahun (AC-7.4) */}
          <div className="flex bg-parchment rounded-[8px] p-1 border border-sand">
            {(["month", "year"] as const).map((m) => (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                className={cn(
                  "px-3 py-1.5 text-[13px] font-medium rounded-[6px] transition-colors",
                  mode === m ? "bg-paper-white text-electric-blue shadow-sm" : "text-steel hover:text-ink-black"
                )}
              >
                {m === "month" ? "Bulan" : "Tahun"}
              </button>
            ))}
          </div>

          <select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            className="h-10 rounded-[8px] border border-fog bg-paper-white px-3 py-1 text-[14px] text-ink-black focus:outline-none focus:ring-2 focus:ring-electric-blue"
          >
            {periodOptions.map((p) => (
              <option key={p} value={p}>
                {formatPeriodLabel(p)}
              </option>
            ))}
          </select>

          <Link href={`/api/export/recap?period=${selectedPeriod}&mode=${mode}`} target="_blank">
            <Button variant="ghost" size="sm" className="h-10 border border-sand">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </Link>
        </div>
      </div>

      {/* Custom Tabs */}
      <div className="flex bg-parchment rounded-[12.8px] p-1 border border-sand w-full max-w-2xl">
        {[
          { id: "overall", label: "Overall" },
          { id: "customer", label: "Per Customer" },
          { id: "type", label: "Per Tipe Produk" },
          { id: "bonus", label: "Bonus Log" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-2 text-[14px] font-medium rounded-[8px] transition-colors",
              activeTab === tab.id
                ? "bg-paper-white text-electric-blue shadow-sm"
                : "text-steel hover:text-ink-black"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: OVERALL */}
      {activeTab === "overall" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-parchment rounded-[24px] border border-sand p-6">
              <p className="text-[14px] text-steel mb-1">Total Omzet (Lunas)</p>
              <p className="text-[32px] font-bold tracking-[-0.06em] text-ink-black tabular-nums">
                {formatCurrency(data.overall.totalOmzet)}
              </p>
            </div>
            <div className="bg-paper-white rounded-[24px] border border-dashed border-fog p-6">
              <p className="text-[14px] text-steel mb-1">Total Laba HL (Lunas)</p>
              <p className="text-[32px] font-bold tracking-[-0.06em] text-electric-blue tabular-nums">
                {formatCurrency(data.overall.totalLaba)}
              </p>
            </div>
            <div className="bg-parchment rounded-[24px] border border-sand p-6">
              <p className="text-[14px] text-steel mb-1">Total Piutang (Aktif)</p>
              <p className="text-[32px] font-bold tracking-[-0.06em] text-ember-orange tabular-nums">
                {formatCurrency(data.overall.totalPiutang)}
              </p>
            </div>
            <div className="bg-parchment rounded-[24px] border border-sand p-6">
              <p className="text-[14px] text-steel mb-1">Total Sudah Dibayar</p>
              <p className="text-[32px] font-bold tracking-[-0.06em] text-ink-black tabular-nums">
                {formatCurrency(data.overall.totalDibayar)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PER CUSTOMER */}
      {activeTab === "customer" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {data.byCustomer.length > 0 && (
            <div className="bg-paper-white rounded-[24px] border border-sand p-6 h-[400px]">
              <h2 className="text-[18px] font-semibold tracking-[-0.36px] mb-6">Top 10 Customer by Omzet</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerChartData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfd8" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6e6e6e" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6e6e6e" }} tickFormatter={(val) => `Rp${val / 1000000}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                  <Bar dataKey="Omzet" fill="#5196fe" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="Piutang" fill="#f9754e" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4 text-right">Omzet Lunas</th>
                  <th className="px-6 py-4 text-right">Piutang Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {data.byCustomer.map((c) => (
                  <tr key={c.customerId} className="hover:bg-parchment/50">
                    <td className="px-6 py-4 font-medium text-ink-black">{c.customerName}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-electric-blue font-medium">{formatCurrency(c.totalOmzet)}</td>
                    <td className="px-6 py-4 text-right tabular-nums text-ember-orange font-medium">{formatCurrency(c.totalPiutang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PER TYPE */}
      {activeTab === "type" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-paper-white rounded-[24px] border border-sand p-6 h-[350px]">
              <h2 className="text-[18px] font-semibold tracking-[-0.36px] mb-6">Perbandingan Omzet & Laba</h2>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeChartData} margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1dfd8" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6e6e6e" }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6e6e6e" }} tickFormatter={(val) => `Rp${val / 1000000}M`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
                  <Bar dataKey="Omzet" fill="#1b1d20" radius={[4, 4, 0, 0]} maxBarSize={60} />
                  <Bar dataKey="Laba" fill="#5196fe" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div className="bg-parchment rounded-[24px] border border-sand p-6">
                <h3 className="font-semibold text-ink-black mb-4">Logam Mulia (LM)</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-steel text-[14px]">Omzet</span>
                  <span className="font-semibold tabular-nums text-[16px]">{formatCurrency(data.byType.omzetLM)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-steel text-[14px]">Laba HL</span>
                  <span className="font-semibold tabular-nums text-electric-blue text-[16px]">{formatCurrency(data.byType.labaLM)}</span>
                </div>
              </div>

              <div className="bg-parchment rounded-[24px] border border-sand p-6">
                <h3 className="font-semibold text-ink-black mb-4">Barang (BR)</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-steel text-[14px]">Omzet</span>
                  <span className="font-semibold tabular-nums text-[16px]">{formatCurrency(data.byType.omzetBR)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-steel text-[14px]">Laba HL</span>
                  <span className="font-semibold tabular-nums text-electric-blue text-[16px]">{formatCurrency(data.byType.labaBR)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: BONUS LOG (AC-7.7) */}
      {activeTab === "bonus" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-[16px] p-4 text-[14px] text-steel">
            Transaksi bonus dicatat terpisah dan <span className="font-medium text-ink-black">tidak dihitung</span> dalam Omzet, Laba, maupun Piutang.
          </div>

          <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
                <tr>
                  <th className="px-6 py-4">Nomor Bon</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4 text-right">Jumlah Bonus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand">
                {data.bonusLog.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-steel">
                      Tidak ada transaksi bonus pada periode ini.
                    </td>
                  </tr>
                ) : (
                  data.bonusLog.map((b) => (
                    <tr key={b.bonId} className="hover:bg-parchment/50">
                      <td className="px-6 py-4 font-medium text-ink-black">{b.nomorBon}</td>
                      <td className="px-6 py-4">{b.customerName}</td>
                      <td className="px-6 py-4 text-steel">{formatDate(b.tanggal)}</td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium text-electric-blue">
                        {b.bonusCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
