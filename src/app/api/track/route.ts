import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const { type } = await req.json().catch(() => ({}));
  if (type === "pageview") {
    after(() => trackEvent("pageview"));
  }
  // 204 imediato — não espera a escrita no Vercel Blob terminar
  return new NextResponse(null, { status: 204 });
}
