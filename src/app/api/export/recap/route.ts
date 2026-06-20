import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getRecapData } from "@/app/actions/recap";
import { RecapDocument } from "@/lib/pdf/RecapDocument";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("mode") === "year" ? "year" : "month";
  const defaultPeriod =
    mode === "year"
      ? String(new Date().getFullYear())
      : new Date().toISOString().slice(0, 7);
  const period = searchParams.get("period") || defaultPeriod;

  const res = await getRecapData(period);

  if (res.error || !res.data) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }

  try {
    const doc = React.createElement(RecapDocument as any, { period, mode, data: res.data }) as any;
    const stream = await renderToStream(doc);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Recap_HL_${period}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
