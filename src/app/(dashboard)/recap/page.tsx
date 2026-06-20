import { getRecapData } from "@/app/actions/recap";
import RecapClient from "@/components/recap/RecapClient";
import prisma from "@/lib/prisma";

export default async function RecapPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const resolvedParams = await searchParams;
  const currentMonthStr = resolvedParams.month || new Date().toISOString().slice(0, 7);

  const res = await getRecapData(currentMonthStr);
  const data = res.data || {
    overall: { totalOmzet: 0, totalLaba: 0, totalPiutang: 0, totalDibayar: 0 },
    byType: { omzetLM: 0, omzetBR: 0, labaLM: 0, labaBR: 0 },
    byCustomer: [],
  };

  // Build available months from all Bons in DB
  const allBons = await prisma.bon.findMany({ select: { tanggal: true } });
  const monthSet = new Set<string>();
  allBons.forEach((b) => {
    monthSet.add(new Date(b.tanggal).toISOString().slice(0, 7));
  });
  monthSet.add(new Date().toISOString().slice(0, 7)); // Always include current month
  const availableMonths = Array.from(monthSet).sort((a, b) => b.localeCompare(a));

  return (
    <RecapClient
      data={data}
      availableMonths={availableMonths}
      selectedMonth={currentMonthStr}
    />
  );
}
