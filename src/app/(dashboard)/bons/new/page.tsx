import { getCustomers } from "@/app/actions/customers";
import { getProducts } from "@/app/actions/products";
import { getAllCustomerBonusStats } from "@/app/actions/bonus";
import { BonForm } from "@/components/bons/BonForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewBonPage() {
  const [customersRes, productsRes, bonusStatsRes] = await Promise.all([
    getCustomers(false), // don't include soft-deleted customers
    getProducts(false),   // don't include soft-deleted products
    getAllCustomerBonusStats()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/bons" className="h-10 w-10 rounded-full border border-sand flex items-center justify-center hover:bg-parchment transition-colors text-steel hover:text-ink-black">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">Buat Bon Baru</h1>
          <p className="text-steel text-[16px] mt-1">Catat transaksi penjualan dan piutang</p>
        </div>
      </div>

      <BonForm
        customers={customersRes.data || []}
        products={productsRes.data || []}
        bonusStats={bonusStatsRes.data || {}}
      />
    </div>
  );
}
