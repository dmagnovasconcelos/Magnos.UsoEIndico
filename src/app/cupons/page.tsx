import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  coupons,
  isExpired,
  isLastDay,
  daysLeft,
  formatValidUntil,
  type Coupon,
  type PromoPick,
} from "@/lib/coupons";
import { formatPrice, discountPercent, PLATFORM_LABEL } from "@/lib/format";
import { SITE_NAME } from "@/lib/links";
import { TrackPageview } from "../TrackPageview";
import { CopyCode } from "./CopyCode";

// Curto de propósito: a validade do cupom é calculada no servidor, então a
// página precisa virar de estado sozinha perto da data de expiração.
export const revalidate = 600;

export const metadata: Metadata = {
  title: `Cupons de desconto — ${SITE_NAME}`,
  description:
    "Cupons ativos que eu encontro e testo. Copie o código, use no carrinho e economize.",
};

export default function CuponsPage() {
  const active = coupons.filter((c) => !isExpired(c));
  const expired = coupons.filter((c) => isExpired(c));

  return (
    <>
      <TrackPageview />

      {/* Barra fixa — mesma assinatura de marca do resto do site */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5 sm:py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/dmagno-emblem.png"
              alt=""
              width={28}
              height={27}
              className="h-6 w-auto sm:h-7"
            />
            <Image
              src="/dmagno-wordmark.png"
              alt="DMAGNO"
              width={533}
              height={52}
              className="h-3.5 w-auto sm:h-4"
              priority
            />
          </Link>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-20 sm:pt-24">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">Cupons de desconto</h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Quando aparece um cupom que vale a pena, eu coloco aqui com as
            regras na frente — pra você não descobrir a pegadinha só no
            checkout.
          </p>
        </header>

        {active.length === 0 && expired.length > 0 && (
          <NoActiveCoupons />
        )}

        {active.map((coupon) => (
          <ActiveCoupon key={coupon.code} coupon={coupon} />
        ))}

        {/* Cupons encerrados não somem sem explicação: quem chegou por um print
            antigo merece saber que acabou, em vez de achar que o site quebrou. */}
        {active.length > 0 &&
          expired.map((coupon) => (
            <ExpiredCoupon key={coupon.code} coupon={coupon} />
          ))}

        <footer className="mt-14 border-t border-border pt-6 text-center text-sm text-muted">
          <p>
            Links de afiliado — comprar por aqui apoia o meu trabalho, sem custo
            extra pra você. 💜
          </p>
          <p className="mt-2 text-xs">
            Cupons são promoções da própria loja: quem define regras, prazo e
            estoque é ela, não eu. Confira sempre o valor no carrinho antes de
            fechar.
          </p>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs">
            <Image
              src="/dmagno-emblem.png"
              alt=""
              width={14}
              height={14}
              className="h-3.5 w-auto opacity-60"
            />
            por DMAGNO
          </p>
        </footer>
      </main>
    </>
  );
}

/* ---------------------------------------------------------------- cupom ativo */

function ActiveCoupon({ coupon }: { coupon: Coupon }) {
  const lastDay = isLastDay(coupon);
  const left = daysLeft(coupon);
  const { label: platformLabel } = PLATFORM_LABEL[coupon.platform];

  return (
    <section className="mb-12">
      {/* Cartão do cupom — a estrela da página */}
      <div className="relative overflow-hidden rounded-2xl border border-discount/30 bg-surface p-6 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-discount/10 blur-3xl"
        />

        <div className="relative flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-medium text-muted">
            {platformLabel}
          </span>

          <p className="mt-4 text-3xl font-bold text-discount sm:text-4xl">
            {coupon.discountLabel}
          </p>
          <p className="mt-1 text-sm text-muted">
            em qualquer produto do {platformLabel}
          </p>

          <div className="mt-6 flex w-full justify-center">
            <CopyCode code={coupon.code} />
          </div>

          {/* Urgência real, derivada da data — nunca "corre que acaba" inventado */}
          <p
            className={`mt-4 text-sm font-semibold ${
              lastDay ? "text-wish" : "text-muted"
            }`}
          >
            {lastDay ? (
              <>⏳ Último dia — vale só até hoje, {formatValidUntil(coupon)}</>
            ) : (
              <>
                Válido até {formatValidUntil(coupon)}
                {left <= 3 && ` — faltam ${left} ${left === 1 ? "dia" : "dias"}`}
              </>
            )}
          </p>
        </div>
      </div>

      <HowToUse coupon={coupon} />
      <Terms coupon={coupon} />
      <MinPurchaseHelper coupon={coupon} />
      <Picks coupon={coupon} />
      <CatalogCta coupon={coupon} />
    </section>
  );
}

/* ------------------------------------------------------------- como usar */

function HowToUse({ coupon }: { coupon: Coupon }) {
  const steps = [
    {
      title: "Copie o código",
      body: (
        <>
          Toque no <strong className="text-white">{coupon.code}</strong> aí em
          cima.
        </>
      ),
    },
    {
      title: "Escolha o produto",
      body: <>Abra qualquer item desta página ou do meu catálogo.</>,
    },
    {
      title: "Cole no carrinho",
      body: (
        <>
          No checkout, procure{" "}
          <strong className="text-white">“Inserir código de cupom”</strong> e
          cole antes de pagar.
        </>
      ),
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="mb-1 text-center text-lg font-bold">Como usar</h2>
      {/* O ponto que mais gera cupom "não funcionou": ele NÃO vem no link. */}
      <p className="mb-4 text-center text-sm text-muted">
        O desconto não vem aplicado no link — você digita o código no carrinho.
      </p>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-bold text-white">
              {i + 1}
            </span>
            <h3 className="mt-2.5 font-semibold">{step.title}</h3>
            <p className="mt-1 text-sm text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ----------------------------------------------------------------- regras */

function Terms({ coupon }: { coupon: Coupon }) {
  return (
    <div className="mt-6 rounded-xl border border-border bg-surface-2/50 p-4">
      <h2 className="text-sm font-bold">Regras do cupom</h2>
      <ul className="mt-2 space-y-1.5">
        {coupon.terms.map((term) => (
          <li key={term} className="flex gap-2 text-sm text-muted">
            <span aria-hidden className="text-discount">
              •
            </span>
            {term}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------- alerta de compra mínima */

/**
 * Achados abaixo da compra mínima não seriam um problema visível — o cupom
 * simplesmente é recusado no carrinho e o visitante acha que o site mentiu.
 * Então em vez de esconder, a página resolve: mostra quanto falta e sugere
 * juntar dois itens.
 */
function MinPurchaseHelper({ coupon }: { coupon: Coupon }) {
  const min = coupon.minPurchase;
  if (!min) return null;

  const below = coupon.picks.filter((p) => p.price != null && p.price < min);
  if (below.length === 0) return null;

  // Só sugere o combo se ele de fato passa do mínimo — sugerir uma dupla que
  // continua abaixo seria mandar o visitante levar o dobro e tomar a mesma
  // recusa no carrinho.
  const pairTotal =
    below.length >= 2
      ? below.slice(0, 2).reduce((sum, p) => sum + (p.price ?? 0), 0)
      : null;
  const pair = pairTotal != null && pairTotal >= min;

  return (
    <div className="mt-6 rounded-xl border border-wish/30 bg-wish/10 p-4">
      <h2 className="flex items-center gap-2 text-sm font-bold text-wish">
        <span aria-hidden>⚠️</span> Atenção à compra mínima de{" "}
        {formatPrice(min)}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {below.length === 1 ? (
          <>
            O item de {formatPrice(below[0].price)} aqui embaixo{" "}
            <strong className="text-white">
              sozinho não atinge o mínimo
            </strong>{" "}
            — o cupom seria recusado no carrinho.
          </>
        ) : (
          <>
            {below.length} dos achados abaixo custam menos que isso, então{" "}
            <strong className="text-white">
              comprar um só não libera o cupom
            </strong>{" "}
            — ele seria recusado no carrinho.
          </>
        )}
      </p>
      {pair && pairTotal != null && (
        <p className="mt-2 text-sm text-muted">
          <strong className="text-wish">Saída:</strong> leve dois juntos —{" "}
          {formatPrice(pairTotal)} no carrinho, passa do mínimo e aí sim o
          desconto entra.
        </p>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- achados */

function Picks({ coupon }: { coupon: Coupon }) {
  if (coupon.picks.length === 0) return null;
  return (
    <div className="mt-10">
      <h2 className="text-center text-lg font-bold">Achados da promo</h2>
      <p className="mx-auto mt-1 mb-5 max-w-lg text-center text-sm text-muted">
        Produtos que eu garimpei nessa promoção. Não são itens do meu uso diário
        — são achados de preço que eu conferi um por um.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {coupon.picks.map((pick) => (
          <PickCard key={pick.slug} pick={pick} code={coupon.code} />
        ))}
      </div>
    </div>
  );
}

function PickCard({ pick, code }: { pick: PromoPick; code: string }) {
  const price = formatPrice(pick.price);
  const originalPrice = formatPrice(pick.originalPrice);
  const discount = discountPercent(pick.price, pick.originalPrice);

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      {/* "Plate" clara atrás da foto — as fotos do ML têm fundo branco e ficariam
          coladas no card escuro sem isso (mesmo padrão dos cards da home). */}
      <div className="relative aspect-square bg-[#f4f2ee]">
        <Image
          src={pick.image}
          alt={pick.title}
          fill
          sizes="(max-width: 640px) 100vw, 25vw"
          className="object-contain p-3"
        />
        {discount && (
          <span className="absolute left-2 top-2 rounded bg-discount px-2 py-0.5 text-xs font-bold text-bg">
            {discount}% OFF
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-semibold leading-snug">{pick.title}</h3>
        {pick.note && (
          <span className="mt-1 text-xs text-muted">{pick.note}</span>
        )}

        <div className="mt-2 flex flex-wrap items-baseline gap-1.5">
          {originalPrice && discount && (
            <span className="text-xs text-muted line-through">
              {originalPrice}
            </span>
          )}
          {price && <span className="font-bold text-white">{price}</span>}
        </div>
        <p className="mt-0.5 text-xs text-muted">antes do cupom</p>

        <Link
          href={`/r/${pick.slug}`}
          rel="nofollow sponsored"
          target="_blank"
          className="mt-auto flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-accent px-4 py-2.5 pt-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Quero esse
        </Link>
        <p className="mt-1.5 text-center text-xs text-muted">
          use <span className="font-mono text-discount">{code}</span> no carrinho
        </p>
      </div>
    </article>
  );
}

/* --------------------------------------------------------------- cta final */

/**
 * O cupom vale em qualquer item do ML — então a página não é uma vitrine de 4
 * produtos, é uma porta de entrada pro catálogo inteiro. Sem isso, a promo
 * ficaria valendo muito menos do que realmente vale.
 */
function CatalogCta({ coupon }: { coupon: Coupon }) {
  return (
    <div className="mt-10 rounded-2xl border border-accent/30 bg-accent/10 p-6 text-center">
      <h2 className="text-lg font-bold">
        O cupom vale no resto do catálogo também
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
        Todo produto do Mercado Livre que eu indico no site aceita o{" "}
        <span className="font-mono font-bold text-discount">{coupon.code}</span>.
        Se você já ia comprar alguma coisa de lá, é agora.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
      >
        Ver tudo que eu uso e indico →
      </Link>
    </div>
  );
}

/* ------------------------------------------------------------- estados off */

function ExpiredCoupon({ coupon }: { coupon: Coupon }) {
  return (
    <section className="mt-8 rounded-xl border border-border bg-surface/50 p-5 text-center">
      <p className="text-sm text-muted">
        <span className="font-mono line-through">{coupon.code}</span> —{" "}
        {coupon.discountLabel}, encerrado em {formatValidUntil(coupon)}.
      </p>
    </section>
  );
}

function NoActiveCoupons() {
  return (
    <section className="rounded-2xl border border-border bg-surface p-10 text-center">
      <h2 className="text-lg font-bold">Nenhum cupom ativo agora</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        O último acabou e ainda não apareceu outro que valha a pena. Prefiro
        deixar vazio a deixar um código que não funciona no seu carrinho.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
      >
        Ver o catálogo →
      </Link>
    </section>
  );
}
