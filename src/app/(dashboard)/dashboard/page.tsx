import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Construction } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">
            Dashboard
          </h1>
          <p className="text-steel text-[16px] mt-1">
            Ringkasan penjualan, piutang, dan bonus bisnis HL
          </p>
        </div>
        <Link href="/bons/new">
          <Button variant="primary">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Buat Bon Baru
          </Button>
        </Link>
      </div>

      {/* Placeholder — diisi pada Phase 7 (Dashboard Redesign) */}
      <Card className="bg-parchment border-sand">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <div className="h-12 w-12 rounded-[12.8px] bg-paper-white border border-sand flex items-center justify-center text-steel">
            <Construction className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-[18px] font-medium text-ink-black">
            Dashboard sedang dibangun
          </p>
          <p className="text-[14px] text-steel max-w-md">
            Stat piutang, omzet &amp; laba (Lunas), serta notifikasi bonus akan
            tampil di sini setelah modul Customers, Products, dan Bons siap.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
