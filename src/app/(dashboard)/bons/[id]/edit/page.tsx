import { getBonById } from "@/app/actions/bons";
import { getCustomers } from "@/app/actions/customers";
import { getProducts } from "@/app/actions/products";
import { getAllCustomerBonusStats } from "@/app/actions/bonus";
import { BonForm } from "@/components/bons/BonForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function EditBonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [bonRes, customersRes, productsRes, bonusStatsRes] = await Promise.all([
    getBonById(id),
    getCustomers(false),
    getProducts(false),
    getAllCustomerBonusStats(),
  ]);

  if (bonRes.error || !bonRes.data) {
    notFound();
  }

  const bon = bonRes.data;

  const initialData = {
    id: bon.id,
    nomorBon: bon.nomorBon,
    tanggal: bon.tanggal,
    customerId: bon.customerId,
    ongkir: bon.ongkir,
    deskripsi: bon.deskripsi,
    isBonus: bon.isBonus,
    lineItems: (bon.lineItems || []).map((l: any) => ({
      productId: l.productId,
      quantity: l.quantity,
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/bons/${bon.id}`} className="h-10 w-10 rounded-full border border-sand flex items-center justify-center hover:bg-parchment transition-colors text-steel hover:text-ink-black">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">Edit Bon</h1>
          <p className="text-steel text-[16px] mt-1">Perbarui transaksi {bon.nomorBon}</p>
        </div>
      </div>

      <BonForm
        mode="edit"
        initialData={initialData}
        customers={customersRes.data || []}
        products={productsRes.data || []}
        bonusStats={bonusStatsRes.data || {}}
      />
    </div>
  );
}
