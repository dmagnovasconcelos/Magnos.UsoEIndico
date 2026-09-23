import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { links, SITE_NAME, type LinkConfig } from "@/lib/links";
import { formatPrice, discountPercent, usingFor } from "@/lib/format";
import { TrackPageview } from "../TrackPageview";
import { ShareButton } from "../ShareButton";

/*
 * Vitrine dos itens do catálogo que também estão na Shopee.
 *
 * Por que uma página própria e não um filtro de plataforma na home: o Danilo
 * divulga esta URL como "minha seleção na Shopee", então ela precisa de título,
 * contexto e OG próprios. O clique continua passando pelo /r/{slug} de sempre,
 * com ?p=SHOPEE — o tracking é o mesmo do resto do site.
 *
 * Só entra item que REALMENTE tem link da Shopee cadastrado. Nada de mandar
 * pra busca da Shopee ou pra "produto parecido": se não tem o link do item,
 * o item não aparece aqui.
 */

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `Minha seleção na Shopee — ${SITE_NAME}`,
  description:
    "Os itens que eu uso e que também estão na Shopee, com o preço que eu vi na plataforma.",
};

/** Item do catálogo resolvido para o que interessa aqui: o link e o preço da Shopee. */
interface ItemShopee {
  item: LinkConfig;
  url: string;
  price?: number;
  note?: string;
  /** true quando a Shopee é a plataforma principal do item, não uma oferta */
  principal: boolean;
}

function resolveShopee(item: LinkConfig): ItemShopee | null {
  if (item.platform === "SHOPEE") {
    return { item, url: item.url, price: item.price, principal: true };
  }
  const oferta = item.offers?.find((o) => o.platform === "SHOPEE");
  if (!oferta) return null;
  return {
    item,
    url: oferta.url,
    price: oferta.price,
    note: oferta.note,
    principal: false,
  };
}

export default function ShopeePage() {
  const todos = links
    .map(resolveShopee)
    .filter((x): x is ItemShopee => x !== null);

  // "Eu uso" primeiro: a prateleira de desejo não sustenta a mesma promessa.
  const uso = todos.filter((x) => (x.item.kind ?? "uso") === "uso");
  const lista = todos.filter((x) => x.item.kind === "lista");

  return (
    <>
      <TrackPageview />

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
          <h1 className="text-3xl font-bold sm:text-4xl">
            Minha seleção na Shopee
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Estes são itens do meu catálogo que também estão na Shopee. É a
            mesma curadoria — muda só o lugar da compra.
          </p>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted">
            O preço mostrado é o que eu vi na Shopee no dia em que cadastrei.
            Confira no anúncio antes de fechar.
          </p>
        </header>

        {uso.length === 0 ? (
          <div className="rounded-xl border border-border bg-surface p-10 text-center">
            <p className="text-lg">Ainda não tem nenhum item aqui.</p>
            <p className="mt-2 text-sm text-muted">
              Enquanto isso, o catálogo completo continua no ar.
            </p>
            <Link
              href="/"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Ver o catálogo completo →
            </Link>
          </div>
        ) : (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {uso.map((x) => (
              <CardShopee key={x.item.slug} entrada={x} />
            ))}
          </section>
        )}

        {lista.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-widest text-wish">
              Na minha lista
            </h2>
            <p className="mb-4 text-sm text-muted">
              Esses eu ainda não comprei — pesquisei, gostei e estão na minha
              lista. Não posso dizer “eu uso”, mas posso dizer “eu quero”.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {lista.map((x) => (
                <CardShopee key={x.item.slug} entrada={x} />
              ))}
            </div>
          </section>
        )}

        <footer className="mt-14 border-t border-border pt-6 text-center text-sm text-muted">
          <p>
            {uso.length + lista.length} de {links.length} itens do catálogo
            estão na Shopee. O resto está em outras lojas.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-2.5 font-semibold transition-colors hover:border-accent-soft hover:text-white"
          >
            Ver o catálogo completo →
          </Link>
        </footer>
      </main>
    </>
  );
}

function CardShopee({ entrada }: { entrada: ItemShopee }) {
  const { item, price, note, principal } = entrada;
  const usage = usingFor(item.usingSince);
  /*
   * Desconto só aparece quando o riscado é da MESMA plataforma. Quando a Shopee
   * é oferta, o `originalPrice` do item é do anúncio do Mercado Livre — cruzar
   * os dois inventaria um desconto que a Shopee não está dando.
   */
  const desconto = principal
    ? discountPercent(item.price, item.originalPrice)
    : undefined;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-soft/50">
      <div className="relative h-28 bg-surface-2 p-2 sm:h-40 sm:p-3">
        {item.image && (
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#f4f2ee]">
            <Image
              src={item.image}
              alt={item.title ?? item.slug}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 30vw"
              className="object-contain p-2"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug sm:line-clamp-none sm:text-base">
          {item.title ?? item.slug}
        </h3>

        {item.review && (
          <p className="mt-1 line-clamp-4 text-xs italic text-accent-soft sm:line-clamp-none sm:text-sm">
            “{item.review}”
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-2 py-0.5 font-medium">
            Shopee
          </span>
          {note && <span>{note}</span>}
          {usage && <span>{usage}</span>}
        </div>

        <div className="mt-auto pt-3">
          <p className="mb-2 flex flex-wrap items-baseline gap-1.5 text-sm">
            {price != null ? (
              <span className="font-bold">{formatPrice(price)}</span>
            ) : (
              <span className="text-xs text-muted">preço no anúncio</span>
            )}
            {desconto != null && (
              <span className="rounded bg-discount/15 px-1.5 py-0.5 text-xs font-bold text-discount">
                -{desconto}%
              </span>
            )}
          </p>
          <div className="flex gap-2">
            <a
              href={`/r/${item.slug}?p=SHOPEE`}
              target="_blank"
              rel="noopener"
              className="flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-accent px-2 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
            >
              Quero esse <span aria-hidden className="ml-1">→</span>
            </a>
            <ShareButton title={item.title ?? item.slug} slug={item.slug} />
          </div>
        </div>
      </div>
    </article>
  );
}
