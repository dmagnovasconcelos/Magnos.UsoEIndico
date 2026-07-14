import Image from "next/image";
import Link from "next/link";
import { links, SITE_NAME, SITE_TAGLINE } from "@/lib/links";
import { enrichAll, type EnrichedLink } from "@/lib/enrich";
import {
  PLATFORM_LABEL,
  formatPrice,
  usingFor,
  discountPercent,
} from "@/lib/format";
import { TrackPageview } from "./TrackPageview";

// Revalida a cada 24h — scraping roda aqui, nunca por visitante
export const revalidate = 86400;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const items = await enrichAll(links);

  const categories = [...new Set(items.map((i) => i.category))];
  const filtered = cat ? items.filter((i) => i.category === cat) : items;
  const featured = filtered.filter((i) => i.featured);
  const regular = filtered.filter((i) => !i.featured);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: SITE_NAME,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: item.title,
        ...(item.image && { image: item.image }),
        ...(item.description && { description: item.description }),
        ...(item.price && {
          offers: {
            "@type": "Offer",
            price: item.price,
            priceCurrency: "BRL",
          },
        }),
      },
    })),
  };

  return (
    <>
      <TrackPageview />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Barra fixa — presença da marca visível durante o scroll */}
      <div className="fixed inset-x-0 top-0 z-50 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-2.5 sm:py-3">
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
            className="hidden h-3.5 w-auto sm:block"
          />
          <span className="hidden text-border sm:inline">·</span>
          <Image
            src="/hero-wordmark.png"
            alt="Uso e Indico"
            width={1216}
            height={71}
            className="h-4 w-auto sm:h-[18px]"
            priority
          />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-20 sm:pt-24">
        {/* Hero */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-1.5 opacity-80">
            <Image
              src="/dmagno-emblem.png"
              alt=""
              width={28}
              height={27}
              className="h-4 w-auto"
            />
            <Image
              src="/dmagno-wordmark.png"
              alt="DMAGNO"
              width={533}
              height={52}
              className="h-3 w-auto"
            />
          </div>
          <Image
            src="/hero-wordmark.png"
            alt="Uso e Indico"
            width={1216}
            height={71}
            className="h-8 w-auto sm:h-10"
            priority
          />
          <p className="mt-3 text-muted">{SITE_TAGLINE} ✦</p>
        </header>

        {/* Filtro de categorias */}
        <nav
          aria-label="Categorias"
          className="mb-8 flex flex-wrap justify-center gap-2"
        >
          <CategoryPill label="Todos" href="/" active={!cat} />
          {categories.map((c) => (
            <CategoryPill
              key={c}
              label={c}
              href={`/?cat=${encodeURIComponent(c)}`}
              active={cat === c}
            />
          ))}
        </nav>

        {/* Destaques */}
        {featured.length > 0 && (
          <section aria-label="Destaques" className="mb-10 space-y-4">
            {featured.map((item) => (
              <FeaturedCard key={item.slug} item={item} />
            ))}
          </section>
        )}

        {/* Grid */}
        {regular.length > 0 ? (
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {regular.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </section>
        ) : (
          featured.length === 0 && (
            <div className="rounded-xl border border-border bg-surface p-10 text-center">
              <p className="text-lg">Ainda não há produtos nessa categoria.</p>
              <Link href="/" className="mt-2 inline-block text-accent underline">
                Ver todos os produtos
              </Link>
            </div>
          )
        )}

        <footer className="mt-14 border-t border-border pt-6 text-center text-sm text-muted">
          <p>
            Links de afiliado — comprar por aqui apoia o meu trabalho, sem
            custo extra pra você. 💜
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

function CategoryPill({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`min-h-11 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
        active
          ? "border-accent bg-accent text-white"
          : "border-border text-muted hover:border-accent-soft hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function PlatformBadge({ platform }: { platform: EnrichedLink["platform"] }) {
  const { icon, label } = PLATFORM_LABEL[platform];
  return (
    <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
      <span aria-hidden>{icon}</span> {label}
    </span>
  );
}

function PriceTag({ item }: { item: EnrichedLink }) {
  const price = formatPrice(item.price);
  const originalPrice = formatPrice(item.originalPrice);
  const discount = discountPercent(item.price, item.originalPrice);
  if (!price) return null;
  return (
    <span className="inline-flex flex-wrap items-baseline gap-1.5">
      {originalPrice && discount && (
        <span className="text-xs text-muted line-through">
          {originalPrice}
        </span>
      )}
      <span className="font-bold text-white">{price}</span>
      {discount && (
        <span className="rounded bg-discount/15 px-1.5 py-0.5 text-[10px] font-bold text-discount">
          -{discount}%
        </span>
      )}
    </span>
  );
}

function FeaturedCard({ item }: { item: EnrichedLink }) {
  const usage = usingFor(item.usingSince);
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-accent/40 bg-gradient-to-br from-surface to-surface-2 p-6 sm:flex-row">
      {item.image && (
        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-44">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, 176px"
            className="object-contain"
          />
        </div>
      )}
      <div className="flex flex-col">
        <span className="mb-1 w-fit rounded bg-accent/20 px-2 py-0.5 text-xs font-bold tracking-wide text-accent-soft">
          ★ DESTAQUE
        </span>
        <h2 className="text-xl font-bold">{item.title}</h2>
        {item.review && (
          <p className="mt-1 italic text-accent-soft">“{item.review}”</p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
          <PlatformBadge platform={item.platform} />
          {usage && <span>· {usage}</span>}
        </div>
        <div className="mt-2">
          <PriceTag item={item} />
        </div>
        <a
          href={`/r/${item.slug}`}
          target="_blank"
          rel="noopener"
          className="mt-4 inline-flex min-h-11 w-fit items-center rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
        >
          Ver produto →
        </a>
      </div>
    </article>
  );
}

function ProductCard({ item }: { item: EnrichedLink }) {
  const usage = usingFor(item.usingSince);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-soft/50">
      <div className="relative h-40 bg-surface-2">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center text-4xl"
          >
            🛍️
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="font-semibold leading-snug">{item.title}</h2>
        {item.review && (
          <p className="mt-1 text-sm italic text-accent-soft">
            “{item.review}”
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <PlatformBadge platform={item.platform} />
          {usage && <span>{usage}</span>}
        </div>
        <div className="mt-auto pt-3">
          <p className="mb-2 text-sm">
            <PriceTag item={item} />
          </p>
          <a
            href={`/r/${item.slug}`}
            target="_blank"
            rel="noopener"
            className="flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Ver produto →
          </a>
        </div>
      </div>
    </article>
  );
}
