import React from "react";
import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { getRecapData } from "@/app/actions/recap";
import { RecapDocument } from "@/lib/pdf/RecapDocument";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const monthStr = searchParams.get("month") || new Date().toISOString().slice(0, 7);

  const res = await getRecapData(monthStr);

  if (res.error || !res.data) {
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }

  try {
    const doc = React.createElement(RecapDocument as any, { monthStr, data: res.data }) as any;
    const stream = await renderToStream(doc);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Recap_HL_${monthStr}.pdf"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
