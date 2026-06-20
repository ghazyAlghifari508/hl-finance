import { getBonById } from "@/app/actions/bons";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SettleBonButton } from "@/components/bons/SettleBonButton";

export default async function BonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getBonById(resolvedParams.id);
  const bon = result.data;

  if (result.error || !bon) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/bons" className="h-10 w-10 rounded-full border border-sand flex items-center justify-center hover:bg-parchment transition-colors text-steel hover:text-ink-black">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">{bon.nomorBon}</h1>
              {bon.status === "lunas" ? (
                <Badge variant="success">Lunas</Badge>
              ) : (
                <Badge variant="warning">Piutang</Badge>
              )}
              {bon.isBonus && (
                <Badge variant="default" className="bg-electric-blue">Bonus</Badge>
              )}
            </div>
            <p className="text-steel text-[16px] mt-1">{formatDate(bon.tanggal)}</p>
          </div>
        </div>

        {/* AC-4.10: edit transaksi; AC-6.6: settle satu Bon */}
        <div className="flex items-center gap-3">
          <Link href={`/bons/${bon.id}/edit`}>
            <Button variant="ghost" className="border border-sand">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          {bon.status === "piutang" && <SettleBonButton bonId={bon.id} />}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Details */}
        <div className="lg:col-span-2 space-y-8">

          <div className="bg-paper-white rounded-[24px] border border-sand p-6">
            <h2 className="text-[18px] font-semibold tracking-[-0.36px] mb-4">Informasi Customer</h2>
            <div className="grid grid-cols-2 gap-y-4 text-[14px]">
              <div>
                <p className="text-steel mb-1">Nama Customer</p>
                <p className="font-medium text-ink-black">{bon.customer?.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-steel mb-1">Status Pembayaran</p>
                <p className="font-medium text-ink-black">
                  {bon.status === "lunas" ? `Dibayar pada ${formatDate(bon.paymentDate!)}` : "Belum dibayar"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-steel mb-1">Catatan</p>
                <p className="font-medium text-ink-black">{bon.deskripsi || "-"}</p>
              </div>
            </div>
          </div>

          <div className="bg-paper-white rounded-[24px] border border-sand overflow-hidden">
            <div className="px-6 py-4 border-b border-sand">
              <h2 className="text-[18px] font-semibold tracking-[-0.36px]">Daftar Produk</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[14px]">
                <thead className="bg-parchment text-steel border-b border-sand uppercase tracking-wider text-[12px] font-medium">
                  <tr>
                    <th className="px-6 py-4">Produk</th>
                    <th className="px-6 py-4 text-center">Tipe</th>
                    <th className="px-6 py-4 text-right">Harga Satuan</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Omzet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand">
                  {bon.lineItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-parchment/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-ink-black">{item.product?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline">{item.productType}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums text-steel">
                        {formatCurrency(item.discountedUnitPrice)}
                      </td>
                      <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                      <td className="px-6 py-4 text-right tabular-nums font-medium text-ink-black">
                        {formatCurrency(item.lineOmzet)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 bg-parchment rounded-[24px] border border-sand p-6 space-y-6">
            <h3 className="font-heading font-semibold text-[20px] tracking-[-0.46px]">Ringkasan Bon</h3>

            <div className="space-y-4 text-[14px]">
              <div className="flex justify-between items-center text-steel">
                <span>Total Omzet</span>
                <span className="font-medium text-ink-black tabular-nums">
                  {formatCurrency(bon.computedOmzet)}
                </span>
              </div>
              <div className="flex justify-between items-center text-steel">
                <span>Ongkos Kirim</span>
                <span className="font-medium text-ink-black tabular-nums">
                  {formatCurrency(bon.ongkir)}
                </span>
              </div>

              <div className="h-px bg-sand w-full my-2" />

              <div className="flex justify-between items-end pt-2">
                <span className="font-medium text-ink-black">
                  {bon.status === "lunas" ? "Total Dibayar" : "Total Tagihan"}
                </span>
                <span className={`text-[24px] font-bold tracking-[-0.04em] tabular-nums leading-none ${bon.status === "lunas" ? "text-electric-blue" : "text-ember-orange"}`}>
                  {formatCurrency(bon.totalOwed)}
                </span>
              </div>

              <div className="mt-8 p-3 rounded-[8px] bg-paper-white border border-dashed border-fog">
                <p className="text-[10px] uppercase tracking-wider text-steel font-semibold mb-2">Internal (Laba)</p>
                <div className="flex justify-between items-center text-[12px]">
                  <span className="text-steel">Laba HL</span>
                  <span className="font-medium text-electric-blue tabular-nums">
                    {formatCurrency(bon.computedLaba)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
