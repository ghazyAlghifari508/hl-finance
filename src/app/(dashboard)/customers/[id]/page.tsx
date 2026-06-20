import { getCustomerById } from "@/app/actions/customers";
import { getBons } from "@/app/actions/bons";
import CustomerDetailClient from "@/components/customers/CustomerDetailClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { calcBonusAvailable } from "@/lib/calculations/bonus";
import { Badge } from "@/components/ui/badge";

export default async function CustomerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const customerId = resolvedParams.id;
  const currentMonthStr =
    resolvedSearchParams.month || new Date().toISOString().slice(0, 7); // YYYY-MM

  const [customerRes, bonsRes] = await Promise.all([
    getCustomerById(customerId),
    getBons(),
  ]);

  if (customerRes.error || !customerRes.data) {
    notFound();
  }

  const customer = customerRes.data;
  // Filter all bons for this customer
  const customerBons = (bonsRes.data || []).filter(
    (b: any) => b.customerId === customerId
  );

  // Generate available months for the selector (descending order)
  const monthSet = new Set<string>();
  customerBons.forEach((b: any) => {
    monthSet.add(new Date(b.tanggal).toISOString().slice(0, 7));
  });
  // Ensure current month is always an option even if no transactions
  monthSet.add(new Date().toISOString().slice(0, 7));
  const availableMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));

  // Filter bons for the SELECTED month
  const bonsThisMonth = customerBons.filter(
    (b: any) => new Date(b.tanggal).toISOString().slice(0, 7) === currentMonthStr
  );

  // Calculate monthly summary
  let totalPiutang = 0;
  let totalDibayar = 0;
  let omzetLM = 0;
  let omzetBR = 0;
  let omzetTotal = 0;
  let totalLaba = 0;

  bonsThisMonth.forEach((b: any) => {
    if (b.status === "piutang") {
      totalPiutang += b.totalOwed;
    } else if (b.status === "lunas") {
      totalDibayar += b.totalOwed;
      if (!b.isBonus) {
        omzetTotal += b.computedOmzet;
        totalLaba += b.computedLaba;

        // Breakdown OMZET per line
        b.lineItems?.forEach((line: any) => {
          if (line.productType === "LM") {
            omzetLM += line.lineOmzet;
          } else if (line.productType === "BR") {
            omzetBR += line.lineOmzet;
          }
        });
      }
    }
  });

  // Calculate bonus status globally (all time)
  let accumulatedBonusOmzet = 0;
  customerBons.forEach((b: any) => {
    if (b.status === "lunas" && !b.isBonus) {
      accumulatedBonusOmzet += b.computedOmzet;
    }
  });

  // Asumsi dummy alreadyGranted = 0 untuk sekarang (Phase 6.4 belum menyentuh mutasi bonusLedger)
  const bonusesAvailable = calcBonusAvailable(
    accumulatedBonusOmzet,
    customer.bonusThreshold,
    0
  );

  return (
    <div className="space-y-6">
      {/* Header Profile */}
      <div className="flex items-center gap-4">
        <Link
          href="/customers"
          className="h-10 w-10 rounded-full border border-sand flex items-center justify-center hover:bg-parchment transition-colors text-steel hover:text-ink-black"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[32px] leading-[1.16] tracking-[-0.96px] font-semibold">
              {customer.name}
            </h1>
            {bonusesAvailable > 0 && (
              <Badge variant="default" className="bg-electric-blue">
                {bonusesAvailable} Bonus Tersedia
              </Badge>
            )}
          </div>
          <p className="text-steel text-[16px] mt-1">
            Buku besar bulanan pelanggan
          </p>
        </div>
      </div>

      <CustomerDetailClient
        customer={customer}
        bons={bonsThisMonth}
        availableMonths={availableMonths}
        selectedMonth={currentMonthStr}
        summary={{
          totalPiutang,
          totalDibayar,
          omzetLM,
          omzetBR,
          omzetTotal,
          totalLaba,
        }}
      />
    </div>
  );
}
