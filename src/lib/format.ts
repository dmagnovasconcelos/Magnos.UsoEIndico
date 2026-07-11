import type { Platform } from "./links";

export const PLATFORM_LABEL: Record<Platform, { icon: string; label: string }> =
  {
    MERCADO_LIVRE: { icon: "🛒", label: "Mercado Livre" },
    SHOPEE: { icon: "🧡", label: "Shopee" },
    AMAZON: { icon: "📦", label: "Amazon" },
    OUTRO: { icon: "🔗", label: "Loja" },
  };

export function formatPrice(price?: number): string | undefined {
  if (price == null) return undefined;
  return price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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
