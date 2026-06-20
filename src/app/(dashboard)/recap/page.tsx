import { getRecapData } from "@/app/actions/recap";
import RecapClient from "@/components/recap/RecapClient";
import prisma from "@/lib/prisma";

export default async function RecapPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; mode?: string }>;
}) {
  const resolvedParams = await searchParams;
  const mode: "month" | "year" = resolvedParams.mode === "year" ? "year" : "month";

  const defaultPeriod =
    mode === "year"
      ? String(new Date().getFullYear())
      : new Date().toISOString().slice(0, 7);
  const currentPeriod = resolvedParams.period || defaultPeriod;

  const res = await getRecapData(currentPeriod);
  const data = res.data || {
    overall: { totalOmzet: 0, totalLaba: 0, totalPiutang: 0, totalDibayar: 0 },
    byType: { omzetLM: 0, omzetBR: 0, labaLM: 0, labaBR: 0 },
    byCustomer: [],
    bonusLog: [],
  };

  // Bangun daftar period dari seluruh Bon (per bulan & per tahun).
  const allBons = await prisma.bon.findMany({ select: { tanggal: true } });
  const monthSet = new Set<string>();
  const yearSet = new Set<string>();
  allBons.forEach((b) => {
    const iso = new Date(b.tanggal).toISOString();
    monthSet.add(iso.slice(0, 7));
    yearSet.add(iso.slice(0, 4));
  });
  monthSet.add(new Date().toISOString().slice(0, 7));
  yearSet.add(String(new Date().getFullYear()));

  const availableMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  const availableYears = Array.from(yearSet).sort((a, b) => b.localeCompare(a));

  return (
    <RecapClient
      data={data}
      mode={mode}
      availableMonths={availableMonths}
      availableYears={availableYears}
      selectedPeriod={currentPeriod}
    />
  );
}
