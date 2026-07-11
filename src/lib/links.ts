export type Platform = "MERCADO_LIVRE" | "SHOPEE" | "AMAZON" | "OUTRO";

export interface LinkConfig {
  /** Usado em /r/:slug — não mude depois de compartilhar */
  slug: string;
  /** URL de afiliado */
  url: string;
  platform: Platform;
  category: string;
  featured?: boolean;
  /** "Por que eu uso" — 1 frase, voz pessoal */
  review?: string;
  /** ISO date de quando começou a usar (exibido como "uso há X meses") */
  usingSince?: string;
  /**
   * Overrides manuais — o scraper só preenche o que estiver vazio.
   * Obrigatório para Shopee (SPA, não raspável server-side).
   */
  title?: string;
  image?: string;
  description?: string;
  price?: number;
}

export const SITE_NAME = "Uso e Indico";
export const SITE_TAGLINE = "Só entra aqui o que eu realmente uso";

export const links: LinkConfig[] = [
  {
    slug: "echo-dot-5",
    url: "https://www.amazon.com.br/dp/B09B8VGCR8",
    platform: "AMAZON",
    category: "Tech",
    featured: true,
    review: "Uso todo dia pra controlar as luzes e timer de treino.",
    usingSince: "2024-11-01",
    // Amazon bloqueia scraping — override manual garante o card
    title: "Echo Dot 5ª geração",
    image:
      "https://m.media-amazon.com/images/I/71xoR4A6q-L._AC_SL1000_.jpg",
    price: 379,
  },
  {
    slug: "teclado-exemplo-ml",
    url: "https://www.mercadolivre.com.br/teclado-mecanico-gamer-redragon-kumara-k552-rgb-switch-blue/p/MLB15825995",
    platform: "MERCADO_LIVRE",
    category: "Tech",
    review: "Digito nele há mais de um ano, switch blue é vício.",
    usingSince: "2025-03-01",
    // Sem overrides — teste real do scraper no Mercado Livre
  },
  {
    slug: "garrafa-exemplo-shopee",
    url: "https://shopee.com.br/product/366296833/22348777918",
    platform: "SHOPEE",
    category: "Fitness",
    review: "Vai comigo pra academia desde o início do ano.",
    usingSince: "2026-01-05",
    // Shopee = SPA, scraper não alcança — dados manuais
    // (imagem de exemplo; troque pela URL real do produto na Shopee)
    title: "Garrafa Térmica Inox 1L",
    image: "https://picsum.photos/seed/garrafa/600/600",
    price: 49.9,
  },
];
