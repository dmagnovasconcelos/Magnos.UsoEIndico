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
 * Conferir no painel de afiliado do ML antes de publicar. Se estiver errada
 * pra mais, o site promete um desconto que o checkout vai recusar.
 *
 * Cupom expirado é REMOVIDO deste arquivo (o histórico fica no git). A página
 * já esconde expirado sozinha — provado em produção entre 31/07 e 04/08, em
 * que os três cupons de julho morreram e a home limpou a faixa sem ninguém
 * mexer. Mas deixar linhas de "encerrado em..." acumulando só polui a página.
 *
 * REGRA APRENDIDA NA MARRA (04/08): cupom de VALOR FIXO ("R$ 40 OFF") tem teto
 * igual ao próprio valor e entrega o que promete. Cupom de PERCENTUAL costuma
 * esconder teto ridículo no texto das condições — achamos "50% OFF" com teto
 * de R$ 4 e "30% OFF" com teto de R$ 5. Priorizar valor fixo; para percentual,
 * abrir "Condições do cupom" e ler o "Máximo de desconto" ANTES de cadastrar.
 */
export const coupons: Coupon[] = [
  {
    code: "#DMAGNODARKLAB40",
    platform: "MERCADO_LIVRE",
    discountLabel: "R$ 40 OFF",
    seller: "Dark Lab",
    discountAmount: 40,
    minPurchase: 50,
    maxDiscount: 40,
    validUntil: "2026-08-30",
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
        price: 169.9,
        originalPrice: 349.9,
        note: "4.9 ★ · +10 mil vendidos",
        verifiedAt: "2026-08-04",
      },
    ],
  },
  {
    code: "#DMAGNOMVP25",
    platform: "MERCADO_LIVRE",
    discountLabel: "R$ 25 OFF",
    seller: "MVP Fitness",
    discountAmount: 25,
    // Mínimo alto (R$ 200), mas os três tênis passam folgado — conferido em
    // "Condições do cupom", não deduzido do nome do container.
    minPurchase: 200,
    maxDiscount: 25,
    validUntil: "2026-08-20",
    terms: [
      "Vale só em produtos da MVP Fitness.",
      "Compra mínima de R$ 200.",
      "Os R$ 25 são de verdade — o teto do cupom é o próprio valor.",
      "1 uso por CPF.",
    ],
    picks: [
      {
        slug: "promo-tenis-crossfit-mvp-rx-fly-black-white",
        url: "https://meli.la/21YTX39",
        platform: "MERCADO_LIVRE",
        title: "Tênis Crossfit MVP RX Fly Black/White — Treino e Academia",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_903382-MLB82639769065_022025-E-tnis-para-crossfit-mvp-rx-fly-black-white-treino-academia.webp",
        price: 357,
        originalPrice: 670.8,
        verifiedAt: "2026-08-04",
      },
      {
        slug: "promo-tenis-crossfit-mvp-4x4-lpo-grip",
        url: "https://meli.la/135X69m",
        platform: "MERCADO_LIVRE",
        title: "Tênis Crossfit MVP 4x4 LPO Grip — Rope Climb",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_961194-MLB74330213005_012024-E-tnis-para-crossfit-mvp-4x4-lpo-grip-confortavel-rope-climb.webp",
        price: 436.02,
        originalPrice: 670.8,
        note: "4.8 ★ · +100 vendidos",
        verifiedAt: "2026-08-04",
      },
      {
        slug: "promo-tenis-crossfit-mvp-6x6-white-lpo",
        url: "https://meli.la/1KpQCu8",
        platform: "MERCADO_LIVRE",
        title: "Tênis Crossfit MVP Fitness 6x6 White LPO — Academia",
        image:
          "https://http2.mlstatic.com/D_Q_NP_2X_833779-MLB113362096263_062026-E--tenis-para-crossfit--mvp-fitness-6x6-white-lpo-academia.webp",
        price: 529.28,
        originalPrice: 790.8,
        verifiedAt: "2026-08-04",
      },
    ],
  },
];

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
