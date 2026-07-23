import type { LinkConfig, Offer } from "./links";

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function str(s: string): string {
  return `"${esc(s)}"`;
}

function strArray(arr: string[]): string {
  return `[${arr.map(str).join(", ")}]`;
}

/** Serializa um LinkConfig de volta pro formato do arquivo — usado pela migração e pelo painel de edição. */
export function formatLinkItem(item: LinkConfig): string {
  const lines: string[] = ["  {"];
  lines.push(`    slug: ${str(item.slug)},`);
  lines.push(`    url: ${str(item.url)},`);
  lines.push(`    platform: ${str(item.platform)},`);
  lines.push(`    categories: ${strArray(item.categories)},`);
  if (item.featured) lines.push(`    featured: true,`);
  if (item.review) lines.push(`    review: ${str(item.review)},`);
  if (item.usingSince) lines.push(`    usingSince: ${str(item.usingSince)},`);
  if (item.verifiedAt) lines.push(`    verifiedAt: ${str(item.verifiedAt)},`);
  if (item.verificationNote)
    lines.push(`    verificationNote: ${str(item.verificationNote)},`);
  if (item.title) lines.push(`    title: ${str(item.title)},`);
  if (item.image) lines.push(`    image: ${str(item.image)},`);
  if (item.description) lines.push(`    description: ${str(item.description)},`);
  if (item.price != null) lines.push(`    price: ${item.price},`);
  if (item.originalPrice != null)
    lines.push(`    originalPrice: ${item.originalPrice},`);
  if (item.offers && item.offers.length > 0) {
    lines.push(`    offers: [`);
    for (const offer of item.offers) {
      lines.push(`      ${formatOffer(offer)},`);
    }
    lines.push(`    ],`);
  }
  lines.push("  },");
  return lines.join("\n");
}

function formatOffer(offer: Offer): string {
  const parts = [
    `platform: ${str(offer.platform)}`,
    `url: ${str(offer.url)}`,
  ];
  if (offer.price != null) parts.push(`price: ${offer.price}`);
  if (offer.note) parts.push(`note: ${str(offer.note)}`);
  return `{ ${parts.join(", ")} }`;
}

export function formatLinksFile(items: LinkConfig[]): string {
  const header = `export type Platform = "MERCADO_LIVRE" | "SHOPEE" | "AMAZON" | "TIKTOK" | "OUTRO";

/** Oferta alternativa do mesmo produto em outra plataforma (ou outra entrega no ML) */
export interface Offer {
  platform: Platform;
  /** URL de afiliado da oferta */
  url: string;
  /** Preço na plataforma no momento do cadastro — conferir periodicamente */
  price?: number;
  /** Nota curta exibível (ex: "kit 4 cores", "cor preta", "entrega Full") */
  note?: string;
}

export interface LinkConfig {
  /** Usado em /r/:slug — não mude depois de compartilhar */
  slug: string;
  /** URL de afiliado */
  url: string;
  platform: Platform;
  /** Um item pode pertencer a mais de uma categoria */
  categories: string[];
  featured?: boolean;
  /** "Por que eu uso" — 1 frase, voz pessoal */
  review?: string;
  /** ISO date de quando começou a usar (exibido como "uso há X meses") */
  usingSince?: string;
  /** ISO date da última verificação de imagem/título via método do container do botão "Ir para produto" */
  verifiedAt?: string;
  /** Nota livre sobre correções/instabilidades encontradas na verificação */
  verificationNote?: string;
  /**
   * Overrides manuais — o scraper só preenche o que estiver vazio.
   * Obrigatório para Shopee (SPA, não raspável server-side).
   */
  title?: string;
  image?: string;
  description?: string;
  /** Preço atual (com desconto, se houver) — conferir periodicamente, preço do ML varia */
  price?: number;
  /** Preço "de" riscado, quando o item está em promoção */
  originalPrice?: number;
  /** Ofertas do mesmo produto em outras plataformas — o visitante escolhe onde comprar */
  offers?: Offer[];
}

export const SITE_NAME = "Uso e Indico";
export const SITE_TAGLINE = "Só entra aqui o que eu realmente uso";

export const links: LinkConfig[] = [
`;
  const body = items.map(formatLinkItem).join("\n");
  return `${header}${body}\n];\n`;
}
