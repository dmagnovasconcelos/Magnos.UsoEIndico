import type { Platform } from "./links";

export const PLATFORM_LABEL: Record<Platform, { label: string }> = {
  MERCADO_LIVRE: { label: "Mercado Livre" },
  SHOPEE: { label: "Shopee" },
  AMAZON: { label: "Amazon" },
  TIKTOK: { label: "TikTok Shop" },
  OUTRO: { label: "Loja" },
};

export type SortKey = "default" | "price-asc" | "discount-desc";

export const SORT_LABEL: Record<SortKey, string> = {
  default: "Ordem padrão",
  "price-asc": "Menor preço",
  "discount-desc": "Maior desconto",
};

export function formatPrice(price?: number): string | undefined {
  if (price == null) return undefined;
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function discountPercent(
  price?: number,
  originalPrice?: number
): number | undefined {
  if (price == null || originalPrice == null || originalPrice <= price)
    return undefined;
  return Math.round((1 - price / originalPrice) * 100);
}

/**
 * Data curta ("09/08") para carimbar quando o preço foi visto.
 *
 * O preço do ML muda sozinho — o valor no card é o do dia em que conferi o
 * anúncio, não uma promessa. Mostrar a data ao lado transforma um número que
 * pode estar velho numa informação honesta e datada.
 */
export function formatShortDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T12:00:00Z`);
  if (isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function usingFor(usingSince?: string): string | undefined {
  if (!usingSince) return undefined;
  const start = new Date(usingSince);
  if (isNaN(start.getTime())) return undefined;
  const months = Math.floor(
    (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  if (months < 1) return "uso recente";
  if (months < 12) return `uso há ${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  return `uso há ${years} ${years === 1 ? "ano" : "anos"}`;
}
