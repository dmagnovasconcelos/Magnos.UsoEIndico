import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { trackPageview, isBot } from "@/lib/analytics";

export async function POST(req: NextRequest) {
  const { type } = await req.json().catch(() => ({}));
  // Só conta visita de navegador humano (bot não roda o client component,
  // mas a checagem de user-agent garante o corte de qualquer POST automatizado).
  // Mesmo opt-out do /r/[slug]: cookie `nt=1` marca navegador de teste/dono.
  const optedOut = req.cookies.get("nt")?.value === "1";
  if (!optedOut && type === "pageview" && !isBot(req.headers.get("user-agent"))) {
    after(() => trackPageview());
  }
  // 204 imediato — não espera o incremento no Redis terminar
  return new NextResponse(null, { status: 204 });
}
