import { NextRequest, NextResponse } from "next/server";
import { links } from "@/lib/links";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const link = links.find((l) => l.slug === slug);

  if (!link) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Log estruturado de clique — visível nos logs da Vercel
  // (substitui o ClickEvent do plano original nesta fase sem banco)
  console.log(
    JSON.stringify({
      event: "click",
      slug,
      platform: link.platform,
      referrer: req.headers.get("referer") ?? undefined,
      ua: req.headers.get("user-agent") ?? undefined,
      ts: new Date().toISOString(),
    })
  );

  return NextResponse.redirect(link.url, 302);
}
