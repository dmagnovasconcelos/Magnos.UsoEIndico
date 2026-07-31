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
  /**
   * Loja a que o cupom se restringe. Ausente = vale em qualquer produto da
   * plataforma. Cupom de afiliado do ML quase sempre é preso a UM vendedor —
   * sem dizer isso, o visitante tenta usar em outro produto e leva recusa.
   */
  seller?: string;
  /** Percentual de desconto (usar com `maxDiscount`) — exclusivo com `discountAmount` */
  discountPercent?: number;
  /** Desconto fixo em reais — exclusivo com `discountPercent` */
  discountAmount?: number;
  /** Compra mínima pra o cupom ser aceito */
  minPurchase?: number;
  /**
   * Teto do desconto em reais. **O campo mais importante deste arquivo.**
   * O painel do ML anuncia "50% OFF" e esconde no texto das condições que o
   * máximo é R$ 4 — publicar o percentual sem o teto é mentir. Sempre abrir
   * "Condições do cupom" e copiar o teto real antes de cadastrar.
   */
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
    discountPercent: 25,
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

/*
 * Cupons pessoais gerados no painel de afiliado (prefixo DMAGNO), 2026-07-31.
 *
 * Só entram aqui cupons cujo TETO foi conferido em "Condições do cupom". Na
 * mesma leva havia um "50% OFF" (teto R$ 4) e um "30% OFF" (teto R$ 5) — foram
 * descartados de propósito: anunciar o percentual sem entregar o valor é o tipo
 * de promessa que o carrinho desmente e que queima a confiança do site inteiro.
 */
export const affiliateCoupons: Coupon[] = [
  {
    code: "#DMAGNOUNDER20",
    platform: "MERCADO_LIVRE",
    discountLabel: "20% OFF",
    seller: "Under Labz",
    discountPercent: 20,
    minPurchase: 1,
    // Teto de R$ 1.000.000 nas condições = sem teto na prática. Omitido de
    // propósito: exibir "máximo R$ 1.000.000" seria ruído, não informação.
    validUntil: "2026-08-01",
    terms: [
      "Vale só em produtos da Under Labz.",
      "20% de desconto de verdade, sem teto na prática.",
      "Aplicado automaticamente no carrinho — não precisa ativar.",
      "1 uso por CPF.",
    ],
    picks: [
      {
        slug: "promo-creatina-under-labz-300g",
        url: "https://meli.la/2RfiNoP",
        platform: "MERCADO_LIVRE",
        title: "Creatina Monohidratada Under Labz 300g",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_667553-MLA106088509105_012026-E.webp",
        price: 78.9,
        verifiedAt: "2026-07-31",
      },
      {
        slug: "promo-creatina-under-labz-150g",
        url: "https://meli.la/1m2Zsen",
        platform: "MERCADO_LIVRE",
        title: "Creatina Monohidratada 100% Pura Under Labz Sem Sabor 150g",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_774496-MLA99560774592_122025-E.webp",
        price: 49.9,
        verifiedAt: "2026-07-31",
      },
      {
        slug: "promo-pre-treino-psycofuze-under-labz",
        url: "https://meli.la/1mTn8Ni",
        platform: "MERCADO_LIVRE",
        title: "Pré-treino Psycofuze Nitra Fuze 150g — Beta Alanina e Cafeína",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_737588-MLA113055876287_062026-E.webp",
        price: 71.91,
        note: "sabor Pink Lemonade",
        verifiedAt: "2026-07-31",
      },
    ],
  },
  {
    code: "#DMAGNODARK40",
    platform: "MERCADO_LIVRE",
    discountLabel: "R$ 40 OFF",
    seller: "Dark Lab",
    discountAmount: 40,
    minPurchase: 50,
    maxDiscount: 40,
    validUntil: "2026-07-31",
    terms: [
      "Vale só em produtos da Dark Lab.",
      "Compra mínima de R$ 50.",
      "Aplicado automaticamente no carrinho — não precisa ativar.",
      "1 uso por CPF.",
    ],
    picks: [
      {
        slug: "promo-whey-dark-lab-1kg-pacoca",
        url: "https://meli.la/2DL7sqC",
        platform: "MERCADO_LIVRE",
        title: "Whey Protein Concentrado 1kg Dark Lab — Paçoca",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_624287-MLA99416632622_112025-E.webp",
        price: 349.9,
        verifiedAt: "2026-07-31",
      },
      {
        slug: "promo-omega-3-dark-lab-240caps",
        url: "https://meli.la/1byEM9j",
        platform: "MERCADO_LIVRE",
        title: "Ômega 3 EPA DHA Dark Lab — 240 cápsulas",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_751123-MLB96644447253_102025-E--omega-3-epa-dha-dark-lab-240-capsulas.webp",
        price: 299.9,
        verifiedAt: "2026-07-31",
      },
      {
        slug: "promo-camiseta-dry-fit-dark-lab",
        url: "https://meli.la/2yUeErX",
        platform: "MERCADO_LIVRE",
        title: "Camiseta Dry-fit Preta Caveira Unissex Dark Lab",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_907332-MLB97660814552_112025-E-camiseta-dry-fit-preta-caveira-unisex-dark-lab.webp",
        price: 69.31,
        verifiedAt: "2026-07-31",
      },
    ],
  },
];

coupons.push(...affiliateCoupons);

/**
 * Preço final do item com o cupom aplicado — ou null quando o cupom não pega.
 *
 * Calculado em vez de digitado: assim o preço "com cupom" nunca diverge do
 * preço e das regras cadastradas, e o teto (`maxDiscount`) é sempre respeitado.
 */
export function priceWithCoupon(
  coupon: Coupon,
  price?: number
): number | null {
  if (price == null) return null;
  if (coupon.minPurchase != null && price < coupon.minPurchase) return null;
  let off = coupon.discountAmount ?? 0;
  if (coupon.discountPercent) off = (price * coupon.discountPercent) / 100;
  if (coupon.maxDiscount != null) off = Math.min(off, coupon.maxDiscount);
  if (off <= 0) return null;
  return Math.round((price - off) * 100) / 100;
}

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
