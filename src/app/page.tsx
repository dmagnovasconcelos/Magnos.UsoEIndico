import Image from "next/image";
import Link from "next/link";
import { links, SITE_NAME, SITE_TAGLINE } from "@/lib/links";
import { enrichAll, type EnrichedLink } from "@/lib/enrich";
import { PLATFORM_LABEL, formatPrice, usingFor } from "@/lib/format";

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
    <main className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className="mb-10 text-center">
        <h1 className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-4xl font-extrabold text-transparent">
          {SITE_NAME}
        </h1>
        <p className="mt-2 text-muted">{SITE_TAGLINE} ✦</p>
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
        Links de afiliado — comprar por aqui apoia o meu trabalho, sem custo
        extra pra você. 💜
      </footer>
    </main>
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

function FeaturedCard({ item }: { item: EnrichedLink }) {
  const price = formatPrice(item.price);
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
          {price && (
            <span className="font-semibold text-white">· {price}</span>
          )}
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
  const price = formatPrice(item.price);
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
          {price && (
            <p className="mb-2 text-sm font-bold text-white">{price}</p>
          )}
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
