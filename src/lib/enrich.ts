import type { LinkConfig } from "./links";

export interface EnrichedLink extends LinkConfig {
  title: string;
  image?: string;
  description?: string;
  price?: number;
  /** de onde vieram os dados: manual | scraped | fallback */
  source: "manual" | "scraped" | "fallback";
}

interface ScrapedMeta {
  title?: string;
  image?: string;
  description?: string;
  price?: number;
}

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function extractMeta(html: string, property: string): string | undefined {
  // cobre property="og:x" e name="og:x", com content antes ou depois
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      "i"
    ),
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return decodeEntities(m[1]);
  }
  return undefined;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractJsonLdPrice(html: string): number | undefined {
  const blocks = html.matchAll(
    /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
  );
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1]);
      const nodes = Array.isArray(data) ? data : [data];
      for (const node of nodes) {
        const items = node["@graph"] ?? [node];
        for (const item of items) {
          if (item["@type"] !== "Product" && item["@type"] !== "Offer") continue;
          const offer = item.offers ?? item;
          const raw =
            offer?.price ?? offer?.lowPrice ?? offer?.highPrice ?? undefined;
          const price = typeof raw === "string" ? parseFloat(raw) : raw;
          if (typeof price === "number" && !isNaN(price) && price > 0)
            return price;
        }
      }
    } catch {
      // JSON-LD malformado — ignora o bloco
    }
  }
  return undefined;
}

async function fetchPage(url: string): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "pt-BR,pt;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
      // cache de 24h — scraping roda no build/revalidação, nunca por visitante
      next: { revalidate: 86400 },
    });
    if (!res.ok) return undefined;
    return await res.text();
  } catch {
    return undefined;
  }
}

/** Remove parâmetros de tracking/afiliado — às vezes destrava o OG */
function cleanUrl(url: string): string {
  try {
    const u = new URL(url);
    u.search = "";
    return u.toString();
  } catch {
    return url;
  }
}

async function scrape(url: string): Promise<ScrapedMeta> {
  // camada 1: URL original · camada 2: URL limpa
  const candidates = [url];
  const cleaned = cleanUrl(url);
  if (cleaned !== url) candidates.push(cleaned);

  for (const candidate of candidates) {
    const html = await fetchPage(candidate);
    if (!html) continue;

    const title =
      extractMeta(html, "og:title") ?? extractMeta(html, "twitter:title");
    // páginas de bloqueio/captcha têm título mas não og:image — exige ambos
    const image =
      extractMeta(html, "og:image") ?? extractMeta(html, "twitter:image");
    if (!title) continue;

    return {
      title,
      image,
      description:
        extractMeta(html, "og:description") ??
        extractMeta(html, "description"),
      price:
        extractJsonLdPrice(html) ??
        parsePriceMeta(extractMeta(html, "og:price:amount")) ??
        parsePriceMeta(extractMeta(html, "product:price:amount")),
    };
  }
  return {};
}

function parsePriceMeta(raw?: string): number | undefined {
  if (!raw) return undefined;
  const n = parseFloat(raw.replace(",", "."));
  return isNaN(n) || n <= 0 ? undefined : n;
}

/**
 * Camadas: overrides manuais do config sempre vencem;
 * o scraper completa o que faltar; se tudo falhar, fallback com o slug.
 */
export async function enrichLink(link: LinkConfig): Promise<EnrichedLink> {
  const needsScraping =
    !link.title || !link.image || !link.description || link.price == null;

  let scraped: ScrapedMeta = {};
  if (needsScraping) {
    scraped = await scrape(link.url);
  }

  const title = link.title ?? scraped.title;
  const hasAnyData = Boolean(title);

  return {
    ...link,
    title: title ?? humanizeSlug(link.slug),
    image: link.image ?? scraped.image,
    description: link.description ?? scraped.description,
    price: link.price ?? scraped.price,
    source: link.title
      ? "manual"
      : hasAnyData
        ? "scraped"
        : "fallback",
  };
}

function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function enrichAll(links: LinkConfig[]): Promise<EnrichedLink[]> {
  return Promise.all(links.map(enrichLink));
}
