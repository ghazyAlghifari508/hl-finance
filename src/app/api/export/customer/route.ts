import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import prisma from "@/lib/prisma";
import { CustomerStatementDocument } from "@/lib/pdf/CustomerStatementDocument";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const customerId = searchParams.get("customerId");
  const monthStr = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId" }, { status: 400 });
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const startDate = new Date(`${monthStr}-01T00:00:00.000Z`);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const bons = await prisma.bon.findMany({
      where: {
        customerId,
        tanggal: { gte: startDate, lte: endDate },
      },
      orderBy: { tanggal: "asc" },
    });

    // Kalkulasi Totals
    let piutang = 0;
    let lunas = 0;
    let omzet = 0;

    bons.forEach((b) => {
      const totalOwed = Number(b.totalOwed);
      if (b.status === "piutang") {
        piutang += totalOwed;
      } else if (b.status === "lunas") {
        lunas += totalOwed;
        if (!b.isBonus) {
          omzet += Number(b.computedOmzet);
        }
      }
    });

    const doc = React.createElement(CustomerStatementDocument as any, {
      customer,
      bons,
      monthStr,
      totals: { piutang, lunas, omzet },
    }) as any;

    const stream = await renderToStream(doc);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Statement_${customer.name}_${monthStr}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
