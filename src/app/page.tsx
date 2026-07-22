import Image from "next/image";
import Link from "next/link";
import { links, SITE_NAME, SITE_TAGLINE } from "@/lib/links";
import { enrichAll, type EnrichedLink } from "@/lib/enrich";
import {
  PLATFORM_LABEL,
  formatPrice,
  usingFor,
  discountPercent,
  normalizeText,
  type SortKey,
} from "@/lib/format";
import { TrackPageview } from "./TrackPageview";
import { ShareButton } from "./ShareButton";
import { SortSelect } from "./SortSelect";
import { SearchInput } from "./SearchInput";

// Revalida a cada 24h — scraping roda aqui, nunca por visitante
export const revalidate = 86400;

function sortItems(items: EnrichedLink[], sort: SortKey): EnrichedLink[] {
  if (sort === "price-asc") {
    return [...items].sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  }
  if (sort === "discount-desc") {
    return [...items].sort(
      (a, b) =>
        (discountPercent(b.price, b.originalPrice) ?? -1) -
        (discountPercent(a.price, a.originalPrice) ?? -1)
    );
  }
  return items;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; sort?: string; q?: string }>;
}) {
  const { cat, sort: sortParam, q } = await searchParams;
  const sort: SortKey =
    sortParam === "price-asc" || sortParam === "discount-desc"
      ? sortParam
      : "default";
  const items = await enrichAll(links);

  const categories = [...new Set(items.flatMap((i) => i.categories))];
  const categoryCounts = categories.reduce<Record<string, number>>((acc, c) => {
    acc[c] = items.filter((i) => i.categories.includes(c)).length;
    return acc;
  }, {});
  const byCategory = cat ? items.filter((i) => i.categories.includes(cat)) : items;
  const query = q?.trim() ? normalizeText(q.trim()) : "";
  const filtered = query
    ? byCategory.filter((i) =>
        normalizeText(
          `${i.title ?? ""} ${i.description ?? ""} ${i.categories.join(" ")}`
        ).includes(query)
      )
    : byCategory;
  const featured = filtered.filter((i) => i.featured);
  const regular = sortItems(
    filtered.filter((i) => !i.featured),
    sort
  );

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
            className="h-3.5 w-auto sm:h-4"
            priority
          />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-10 pt-20 sm:pt-24">
        {/* Hero */}
        <header className="mb-10 flex flex-col items-center text-center">
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

        {/* Sobre o Danilo */}
        <section className="mb-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-accent/40 bg-surface-2">
            <Image
              src="/danilo-avatar.jpg"
              alt="Danilo Magno"
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
          <p className="text-sm text-muted">
            Sou o Danilo Magno — filho de Deus, marido e pai de dois filhos
            lindos. Estou em constante transformação de espírito, alma e
            corpo, organizando a vida e buscando viver com mais qualidade,
            propósito e intenção. Esse site é a minha curadoria pessoal: só
            entra aqui o que eu realmente uso.
          </p>
        </section>

        {/* Filtro de categorias */}
        <nav
          aria-label="Categorias"
          className="mb-4 flex flex-wrap justify-center gap-2"
        >
          <CategoryPill label="Todos" count={items.length} href="/" active={!cat} />
          {categories.map((c) => (
            <CategoryPill
              key={c}
              label={c}
              count={categoryCounts[c]}
              href={`/?cat=${encodeURIComponent(c)}`}
              active={cat === c}
            />
          ))}
        </nav>

        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SearchInput current={q ?? ""} />
          <SortSelect current={sort} />
        </div>

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
              <p className="text-lg">
                {query
                  ? `Nenhum produto encontrado para "${q}".`
                  : "Ainda não há produtos nessa categoria."}
              </p>
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
  count,
  href,
  active,
}: {
  label: string;
  count: number;
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
      {label} <span className="opacity-60">({count})</span>
    </Link>
  );
}

function PlatformIcon({ platform }: { platform: EnrichedLink["platform"] }) {
  const common = {
    width: 12,
    height: 12,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (platform === "MERCADO_LIVRE" || platform === "SHOPEE") {
    return (
      <svg {...common}>
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    );
  }
  if (platform === "AMAZON") {
    return (
      <svg {...common}>
        <path d="M21 8V7l-3-3H3v4" />
        <path d="M3 8h18v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <path d="M3 8V7l3-3" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function PlatformBadge({ platform }: { platform: EnrichedLink["platform"] }) {
  const { label } = PLATFORM_LABEL[platform];
  return (
    <span className="inline-flex items-center gap-1 rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
      <PlatformIcon platform={platform} /> {label}
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
        <div className="relative h-44 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 p-3 sm:w-44">
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#f4f2ee]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 176px"
              className="object-contain p-2"
            />
          </div>
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
        <div className="mt-4 flex gap-2">
          <a
            href={`/r/${item.slug}`}
            target="_blank"
            rel="noopener"
            className="inline-flex min-h-11 w-fit items-center rounded-lg bg-accent px-6 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
          >
            Quero esse →
          </a>
          <ShareButton title={item.title} slug={item.slug} />
        </div>
      </div>
    </article>
  );
}

function ProductCard({ item }: { item: EnrichedLink }) {
  const usage = usingFor(item.usingSince);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-soft/50">
      <div className="relative h-40 bg-surface-2 p-3">
        {item.image ? (
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#f4f2ee]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-2"
            />
          </div>
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
          <div className="flex gap-2">
            <a
              href={`/r/${item.slug}`}
              target="_blank"
              rel="noopener"
              className="flex min-h-11 flex-1 items-center justify-center rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Quero esse →
            </a>
            <ShareButton title={item.title} slug={item.slug} />
          </div>
        </div>
      </div>
    </article>
  );
}
