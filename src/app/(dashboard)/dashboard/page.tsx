import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight, Gift, ReceiptText, Eye } from "lucide-react";
import Link from "next/link";
import { getDashboardData } from "@/app/actions/dashboard";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const res = await getDashboardData();
  const data = res.data || {
    totalPiutang: 0,
    omzetBulanIni: 0,
    labaBulanIni: 0,
    recentBons: [],
    pendingBonus: { totalAvailable: 0, customerCount: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">
            Dashboard
          </h1>
          <p className="text-steel text-[16px] mt-1">
            Ringkasan penjualan, piutang, dan bonus HL
          </p>
        </div>
        <Link href="/bons/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Buat Bon Baru
          </Button>
        </Link>
      </div>

      {/* Bonus Notification Widget */}
      {data.pendingBonus.totalAvailable > 0 && (
        <div className="bg-electric-blue/10 border border-electric-blue/20 rounded-[16px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-electric-blue rounded-[12.8px] flex items-center justify-center text-paper-white shrink-0">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-ink-black tracking-[-0.14px]">
                {data.pendingBonus.totalAvailable} Bonus Tersedia
              </p>
              <p className="text-[14px] text-steel">
                Ada {data.pendingBonus.customerCount} customer yang berhak mendapatkan bonus gratis.
              </p>
            </div>
          </div>
          <Link href="/customers">
            <Button variant="ghost" size="sm" className="h-9 px-4 text-electric-blue hover:bg-electric-blue/20">
              Lihat Customer <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Piutang (Ember Orange highlight) */}
        <div className="bg-parchment rounded-[24px] border border-sand p-6 flex flex-col justify-center">
          <p className="text-[14px] text-steel mb-1">Total Piutang (Aktif)</p>
          <p className="text-[32px] font-bold tracking-[-0.06em] text-ember-orange tabular-nums">
            {formatCurrency(data.totalPiutang)}
          </p>
        </div>

        {/* Omzet (Electric Blue highlight) */}
        <div className="bg-parchment rounded-[24px] border border-sand p-6 flex flex-col justify-center">
          <p className="text-[14px] text-steel mb-1">Omzet (Lunas Bulan Ini)</p>
          <p className="text-[32px] font-bold tracking-[-0.06em] text-electric-blue tabular-nums">
            {formatCurrency(data.omzetBulanIni)}
          </p>
        </div>

        {/* Laba */}
        <div className="bg-paper-white rounded-[24px] border border-dashed border-fog p-6 flex flex-col justify-center">
          <p className="text-[14px] text-steel mb-1">Laba HL (Lunas Bulan Ini)</p>
          <p className="text-[32px] font-bold tracking-[-0.06em] text-ink-black tabular-nums">
            {formatCurrency(data.labaBulanIni)}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
        <div className="px-6 py-4 border-b border-sand flex items-center justify-between">
          <h2 className="text-[18px] font-semibold tracking-[-0.36px]">Transaksi Terbaru</h2>
          <Link href="/bons" className="text-[14px] text-electric-blue hover:underline font-medium">
            Lihat Semua
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
              <tr>
                <th className="px-6 py-4">Bon</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Tagihan</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {data.recentBons.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-steel">
                    Belum ada transaksi yang dicatat.
                  </td>
                </tr>
              ) : (
                data.recentBons.map((bon: any) => (
                  <tr key={bon.id} className="hover:bg-parchment/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-ink-black">{bon.nomorBon}</span>
                        <span className="text-[12px] text-steel">{formatDate(bon.tanggal)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-ink-black">
                      {bon.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {bon.status === "lunas" ? (
                          <Badge variant="success">Lunas</Badge>
                        ) : (
                          <Badge variant="warning">Piutang</Badge>
                        )}
                        {bon.isBonus && (
                          <span className="text-[10px] font-bold tracking-wider uppercase bg-electric-blue/10 text-electric-blue px-2 py-0.5 rounded-full">
                            Bonus
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-medium text-ink-black">
                      {formatCurrency(bon.totalOwed)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/bons/${bon.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
