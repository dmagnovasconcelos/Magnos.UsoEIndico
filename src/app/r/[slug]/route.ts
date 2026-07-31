import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { links } from "@/lib/links";
import { promoPicks } from "@/lib/coupons";
import { trackRedirect, isBot } from "@/lib/analytics";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  // Achados da página de cupons não estão no catálogo (são promo, não curadoria),
  // mas o clique passa pelo mesmo redirect pra entrar no analytics.
  const link =
    links.find((l) => l.slug === slug) ??
    promoPicks.find((p) => p.slug === slug);

  if (!link) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // Só conta acesso humano — crawler/preview de link (WhatsApp, Telegram,
  // indexadores) não infla a contagem.
  if (!isBot(req.headers.get("user-agent"))) {
    after(() => trackRedirect(slug));
  }

  // ?p=AMAZON etc. escolhe uma oferta alternativa; sem ?p= vai pro link principal
  const offerPlatform = req.nextUrl.searchParams.get("p");
  const offers = "offers" in link ? link.offers : undefined;
  const offer = offerPlatform
    ? offers?.find((o) => o.platform === offerPlatform)
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

  return NextResponse.redirect(destination, 302);
}
