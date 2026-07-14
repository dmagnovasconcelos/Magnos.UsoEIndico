import type { Platform } from "./links";

export const PLATFORM_LABEL: Record<Platform, { label: string }> = {
  MERCADO_LIVRE: { label: "Mercado Livre" },
  SHOPEE: { label: "Shopee" },
  AMAZON: { label: "Amazon" },
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
