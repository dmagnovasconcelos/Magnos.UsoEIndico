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
  /** Preço atual (com desconto, se houver) */
  price?: number;
  /** Preço "de" riscado, quando o item está em promoção */
  originalPrice?: number;
}

export const SITE_NAME = "Uso e Indico";
export const SITE_TAGLINE = "Só entra aqui o que eu realmente uso";

export const links: LinkConfig[] = [
  {
    slug: "mousepad-couro-volpe",
    url: "https://meli.la/22Jo5tQ",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Mouse Pad Couro Legítimo Volpe — Caramelo",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_957368-MLA110083075342_042026-O.webp",
    price: 29.95, // com desconto (23% OFF) — conferir periodicamente, preço do ML varia
    originalPrice: 38.9,
  },
  {
    slug: "suporte-celular-360",
    url: "https://meli.la/1s5Waug",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Suporte de Mesa para Celular Alumínio Giratório 360°",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_645748-MLB102235431879_122025-O.webp",
    price: 33.13, // com desconto (41% OFF) — conferir periodicamente, preço do ML varia
    originalPrice: 57,
  },
  {
    slug: "suporte-notebook-360",
    url: "https://meli.la/1Ua1tQD",
    platform: "MERCADO_LIVRE",
    category: "Setup",
    featured: true,
    // TODO(Danilo): adicionar review pessoal e usingSince
    title: "Suporte de Mesa para Notebook 360° Ajustável — Metal",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_877748-MLB105697398301_012026-O.webp",
    price: 129.9, // conferir — preço pode variar no ML
  },
];
