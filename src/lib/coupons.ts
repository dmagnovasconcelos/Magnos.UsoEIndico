import type { Platform } from "./links";

/**
 * Produto que aparece SÓ na página de cupons.
 *
 * Por que não vai pro `links.ts`: o catálogo é curadoria pessoal — "eu uso" ou
 * "está na minha lista". Achado de promoção não é nenhum dos dois. Misturar
 * jogaria suspeita sobre os itens verificados (ver a seção das duas prateleiras
 * no CLAUDE.md). Aqui o contrato com o visitante é outro e está explícito na
 * página: "achado da promo", não "produto que eu uso".
 */
export interface PromoPick {
  /** Usado em /r/:slug — prefixo `promo-` separa da curadoria no analytics */
  slug: string;
  /** URL de afiliado */
  url: string;
  platform: Platform;
  title: string;
  image: string;
  price?: number;
  originalPrice?: number;
  /** Nota curta exibível (ex: "cor café", "no Pix") */
  note?: string;
  /** ISO date da verificação pelo método do container do botão "Ir para produto" */
  verifiedAt?: string;
}

export interface Coupon {
  /** O código que o visitante digita no checkout */
  code: string;
  platform: Platform;
  /** Chamada curta do desconto (ex: "até 25% OFF") */
  discountLabel: string;
  /** Compra mínima pra o cupom ser aceito */
  minPurchase?: number;
  /** Teto do desconto em reais */
  maxDiscount?: number;
  /**
   * Último dia de validade (ISO, YYYY-MM-DD) — inclusive.
   * A página expira sozinha depois dessa data: o código some e vira aviso de
   * encerrado. Nunca deixar uma data passada "no ar" como se valesse.
   */
  validUntil: string;
  /** Condições em letra visível — nunca em letra miúda */
  terms: string[];
  /** Achados verificados dessa promo */
  picks: PromoPick[];
}

/**
 * ATENÇÃO — `validUntil` é a data que faz a página se auto-expirar.
 * Conferir no painel/e-mail de afiliado do ML antes de publicar. Se estiver
 * errada pra mais, o site promete um desconto que o checkout vai recusar.
 */
export const coupons: Coupon[] = [
  {
    code: "QUEROPROMO",
    platform: "MERCADO_LIVRE",
    discountLabel: "até 25% OFF",
    minPurchase: 29,
    maxDiscount: 100,
    // O ML informou "expira 03/08 às 00h" — ou seja, morre na virada de 02 pra
    // 03. Como `validUntil` é o último dia INCLUSIVE, o valor certo é 02/08.
    // Pôr 03/08 deixaria a página anunciando o cupom o dia todo depois de morto.
    validUntil: "2026-08-02",
    terms: [
      "Compra mínima de R$ 29.",
      "Desconto máximo de R$ 100.",
      "Válido enquanto durarem os estoques.",
      "O código é digitado no carrinho do Mercado Livre, não vem aplicado no link.",
    ],
    picks: [
      {
        slug: "promo-mousepad-bullpad-20x20-azul-marinho",
        url: "https://meli.la/228zVzX",
        platform: "MERCADO_LIVRE",
        title: "Mousepad Bullpad 20x20cm Fundo Emborrachado — Azul-marinho",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_968226-MLA99459904218_112025-V.webp",
        price: 19.9,
        originalPrice: 29.9,
        note: "cor azul-marinho",
        verifiedAt: "2026-07-31",
      },
      {
        slug: "promo-mousepad-bullpad-20x20-cafe",
        url: "https://meli.la/1GB6uH5",
        platform: "MERCADO_LIVRE",
        title: "Mousepad Bullpad 20x20cm Fundo Emborrachado — Café",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_729533-MLA100104761047_122025-V.webp",
        price: 19.9,
        originalPrice: 29.9,
        note: "cor café",
        verifiedAt: "2026-07-31",
      },
      {
        slug: "promo-vitamina-b12-true-source-morango-30ml",
        url: "https://meli.la/1s9qrnv",
        platform: "MERCADO_LIVRE",
        title:
          "Vitamina B12 Metilcobalamina Líquida True Source — Morango 30ml",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_729281-MLB114069854498_072026-V.webp",
        price: 37.43,
        verifiedAt: "2026-07-31",
      },
      {
        slug: "promo-1gh-crie-musculos-sem-sabor",
        url: "https://meli.la/2XzWcXD",
        platform: "MERCADO_LIVRE",
        title: "1 GH — Crie Músculos, Sem Sabor (Ghmuscle)",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_790677-MLB91989401072_092025-V.webp",
        price: 140.5,
        originalPrice: 147.9,
        note: "preço no Pix",
        verifiedAt: "2026-07-31",
      },
    ],
  },
];

/** Todos os achados de promo, achatados — usado pelo /r/:slug pra resolver clique */
export const promoPicks: PromoPick[] = coupons.flatMap((c) => c.picks);

/** Data de hoje (YYYY-MM-DD) no fuso de Brasília — mesma regra do analytics */
export function todayInBrazil(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Expirado = o último dia de validade já passou (a data final é inclusive). */
export function isExpired(coupon: Coupon, now: Date = new Date()): boolean {
  return todayInBrazil(now) > coupon.validUntil;
}

/** Último dia — dispara o aviso de urgência real (não urgência inventada). */
export function isLastDay(coupon: Coupon, now: Date = new Date()): boolean {
  return todayInBrazil(now) === coupon.validUntil;
}

/** Quantos dias faltam (0 = hoje é o último dia). Negativo = já expirou. */
export function daysLeft(coupon: Coupon, now: Date = new Date()): number {
  const today = new Date(`${todayInBrazil(now)}T12:00:00Z`);
  const end = new Date(`${coupon.validUntil}T12:00:00Z`);
  return Math.round((end.getTime() - today.getTime()) / 86_400_000);
}

/** Formata a validade pra exibição: "31 de julho" */
export function formatValidUntil(coupon: Coupon): string {
  return new Date(`${coupon.validUntil}T12:00:00Z`).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    timeZone: "America/Sao_Paulo",
  });
}
