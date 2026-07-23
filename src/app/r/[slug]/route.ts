import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { links } from "@/lib/links";
import { trackEvent } from "@/lib/analytics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const link = links.find((l) => l.slug === slug);

  after(() => trackEvent("click", slug));

  if (!link) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // ?p=AMAZON etc. escolhe uma oferta alternativa; sem ?p= vai pro link principal
  const offerPlatform = req.nextUrl.searchParams.get("p");
  const offer = offerPlatform
    ? link.offers?.find((o) => o.platform === offerPlatform)
    : undefined;
  const destination = offer?.url ?? link.url;

  // Log estruturado de clique — visível nos logs da Vercel
  console.log(
    JSON.stringify({
      event: "click",
      slug,
      platform: offer?.platform ?? link.platform,
      referrer: req.headers.get("referer") ?? undefined,
      ua: req.headers.get("user-agent") ?? undefined,
      ts: new Date().toISOString(),
    })
  );

  after(() => trackEvent("completion", slug));

  return NextResponse.redirect(destination, 302);
}
