"use client";

import { Button } from "@/components/ui/button";
import { Plus, Eye, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteBon } from "@/app/actions/bons";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function BonsClient({ initialBons }: { initialBons: any[] }) {

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus Bon ini secara permanen?")) {
      await deleteBon(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">Transaksi (Bon)</h1>
          <p className="text-steel text-[16px] mt-1">Kelola data penjualan dan piutang pelanggan</p>
        </div>
        <Link href="/bons/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" />
            Buat Bon Baru
          </Button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[14px]">
            <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
              <tr>
                <th className="px-6 py-4">Nomor Bon</th>
                <th className="px-6 py-4">Tanggal</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Total Tagihan</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {initialBons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-steel">
                    Belum ada transaksi. Silakan buat bon baru.
                  </td>
                </tr>
              ) : (
                initialBons.map((bon) => (
                  <tr key={bon.id} className="hover:bg-parchment/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-ink-black flex items-center gap-2">
                      {bon.nomorBon}
                      {bon.isBonus && (
                        <span className="text-[10px] font-bold tracking-wider uppercase bg-electric-blue/10 text-electric-blue px-2 py-0.5 rounded-full">
                          Bonus
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-steel whitespace-nowrap">
                      {formatDate(bon.tanggal)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {bon.customer?.name || "Unknown"}
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
                        <Link href={`/bons/${bon.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-electric-blue hover:text-electric-blue/80 hover:bg-electric-blue/10">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(bon.id)} className="h-8 px-2 text-ember-orange hover:text-ember-orange/80 hover:bg-ember-orange/10">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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
