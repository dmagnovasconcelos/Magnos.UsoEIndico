import Image from "next/image";
import Link from "next/link";
import { links, SITE_NAME, SITE_TAGLINE, KIND_LABEL } from "@/lib/links";
import { enrichAll, type EnrichedLink } from "@/lib/enrich";
import {
  PLATFORM_LABEL,
  formatPrice,
  formatShortDate,
  usingFor,
  discountPercent,
  normalizeText,
  type SortKey,
} from "@/lib/format";
import { coupons, isExpired, isLastDay } from "@/lib/coupons";
import { TrackPageview } from "./TrackPageview";
import { ShareButton } from "./ShareButton";
import { SortSelect } from "./SortSelect";
import { SearchInput } from "./SearchInput";

// Revalida a cada 1h para a faixa de cupom expirar em tempo hábil (senão a home
// anunciaria um desconto morto por até um dia). Não aumenta o scraping: cada
// fetch do enrich tem cache próprio de 24h, então isso só re-renderiza o HTML.
export const revalidate = 3600;

type ItemKind = "uso" | "lista";

/** Itens sem `kind` são da prateleira "eu uso" — padrão histórico do catálogo. */
function kindOf(item: EnrichedLink): ItemKind {
  return item.kind ?? "uso";
}

/** Monta a URL preservando só os filtros que continuam fazendo sentido. */
function buildHref(params: {
  cat?: string;
  sort?: SortKey;
  q?: string;
  kind?: ItemKind;
}): string {
  const sp = new URLSearchParams();
  if (params.kind === "lista") sp.set("tipo", "lista");
  if (params.cat) sp.set("cat", params.cat);
  if (params.q) sp.set("q", params.q);
  if (params.sort && params.sort !== "default") sp.set("sort", params.sort);
  const qs = sp.toString();
  return qs ? `/?${qs}` : "/";
}

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
  searchParams: Promise<{
    cat?: string;
    sort?: string;
    q?: string;
    tipo?: string;
  }>;
}) {
  const { cat, sort: sortParam, q, tipo } = await searchParams;
  const sort: SortKey =
    sortParam === "price-asc" || sortParam === "discount-desc"
      ? sortParam
      : "default";
  const items = await enrichAll(links);
  const activeCoupon = coupons.find((c) => !isExpired(c));

  // Prateleira ativa: "uso" (padrão) ou "lista" (quero comprar, ainda não usei)
  const kind: ItemKind = tipo === "lista" ? "lista" : "uso";
  const kindCounts = {
    uso: items.filter((i) => kindOf(i) === "uso").length,
    lista: items.filter((i) => kindOf(i) === "lista").length,
  };
  // O filtro só existe quando as duas prateleiras têm conteúdo — enquanto a
  // lista estiver vazia, o site se comporta exatamente como antes.
  const hasBothKinds = kindCounts.uso > 0 && kindCounts.lista > 0;
  const inKind = hasBothKinds
    ? items.filter((i) => kindOf(i) === kind)
    : items;

  const categories = [...new Set(inKind.flatMap((i) => i.categories))];
  const categoryCounts = categories.reduce<Record<string, number>>((acc, c) => {
    acc[c] = inKind.filter((i) => i.categories.includes(c)).length;
    return acc;
  }, {});
  const byCategory = cat
    ? inKind.filter((i) => i.categories.includes(cat))
    : inKind;
  const query = q?.trim() ? normalizeText(q.trim()) : "";
  const matchesQuery = (i: EnrichedLink) =>
    normalizeText(
      `${i.title ?? ""} ${i.description ?? ""} ${i.categories.join(" ")}`
    ).includes(query);
  const filtered = query ? byCategory.filter(matchesQuery) : byCategory;

  // Busca sem resultado aqui, mas com resultado na outra prateleira: em vez de
  // "nada encontrado", aponta pro outro lado (senão metade do acervo some).
  const otherKind: ItemKind = kind === "uso" ? "lista" : "uso";
  const otherKindHits =
    query && hasBothKinds
      ? items.filter((i) => kindOf(i) === otherKind && matchesQuery(i)).length
      : 0;

  /*
   * Teto de 3 destaques renderizados. Com 9 itens marcados `featured` o topo
   * do mobile virava um paredão de ~5000px e o primeiro item do grid só
   * aparecia depois de 6 telas — destaque demais é destaque nenhum. O excedente
   * NÃO some: cai no grid normal, então marcar `featured: true` continua sendo
   * uma preferência do Danilo, não uma promessa de card gigante.
   */
  const MAX_FEATURED = 3;
  const allFeatured = filtered.filter((i) => i.featured);
  const featured = allFeatured.slice(0, MAX_FEATURED);
  const regular = sortItems(
    [...filtered.filter((i) => !i.featured), ...allFeatured.slice(MAX_FEATURED)],
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

      <main id="topo" className="mx-auto max-w-5xl px-4 pb-10 pt-20 sm:pt-24">
        {/* Hero */}
        <header className="mb-10 flex flex-col items-center text-center">
          {/*
            O wordmark é imagem (a fonte Nebula não pode ser embutida — ver
            CLAUDE.md), então o <h1> envolve a imagem em vez de repetir texto.
            Sem isso a home não tinha nenhum h1: o Google via só os <h2> dos
            produtos e nenhum título principal.
          */}
          <h1 className="leading-none">
            <Image
              src="/hero-wordmark.png"
              alt={SITE_NAME}
              width={1216}
              height={71}
              className="h-8 w-auto sm:h-10"
              priority
            />
          </h1>
          <p className="mt-3 text-muted">{SITE_TAGLINE} ✦</p>
        </header>

        {/* Faixa de cupom — só existe enquanto houver cupom válido. Some sozinha
            quando expira, então a home nunca anuncia desconto que já acabou. */}
        {activeCoupon && (
          <Link
            href="/cupons"
            className="mb-8 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-discount/40 bg-discount/10 px-4 py-3 text-center transition-colors hover:bg-discount/20 sm:flex-row sm:gap-3"
          >
            <span className="text-sm font-bold text-discount">
              🎟️ {activeCoupon.discountLabel} com o cupom{" "}
              <span className="font-mono">{activeCoupon.code}</span>
            </span>
            <span className="text-xs text-muted">
              {isLastDay(activeCoupon)
                ? "último dia — ver como usar →"
                : "ver como usar →"}
            </span>
          </Link>
        )}

        {/* Sobre o Danilo */}
        <section className="mb-10 flex flex-col items-center gap-4 rounded-2xl border border-border bg-surface p-6 text-center sm:flex-row sm:text-left">
          {/*
            A foto é escura e sobre o navy escuro virava um círculo vazio.
            Anel de 2px + leve realce de brilho/contraste resolvem sem trocar
            a imagem — o problema era contraste, não resolução (500x500).
          */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-accent-soft/60 bg-surface-2 ring-2 ring-accent/20">
            <Image
              src="/danilo-avatar.jpg"
              alt="Danilo Magno"
              fill
              sizes="64px"
              className="object-cover brightness-125 contrast-110"
            />
          </div>
          {/*
            No mobile a bio inteira (7 linhas) empurrava o primeiro produto pra
            fora da primeira tela — quem vem do Instagram chegava e não via
            nenhum item. Agora só a primeira frase aparece, e o resto abre num
            <details> nativo (sem JS, sem custo de hidratação). No desktop, onde
            sobra espaço, o texto continua inteiro.
          */}
          <div className="text-sm text-muted">
            <p>
              Sou o Danilo Magno — filho de Deus, marido e pai de dois filhos
              lindos.
              <span className="hidden sm:inline">
                {" "}
                Estou em constante transformação de espírito, alma e corpo,
                organizando a vida e buscando viver com mais qualidade,
                propósito e intenção. Esse site é a minha curadoria pessoal: o
                que eu uso no dia a dia — e o que ainda está na minha lista pra
                comprar.
              </span>
            </p>
            <details className="group mt-1 sm:hidden">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center text-xs font-semibold text-accent-soft">
                <span className="group-open:hidden">ler mais</span>
                <span className="hidden group-open:inline">ler menos</span>
              </summary>
              <p className="pb-1">
                Estou em constante transformação de espírito, alma e corpo,
                organizando a vida e buscando viver com mais qualidade,
                propósito e intenção. Esse site é a minha curadoria pessoal: o
                que eu uso no dia a dia — e o que ainda está na minha lista pra
                comprar.
              </p>
            </details>
          </div>
        </section>

        {/* Prateleira: eixo acima das categorias (só existe se as duas têm itens) */}
        {hasBothKinds && (
          <nav
            aria-label="Prateleira"
            className="mb-5 flex justify-center"
          >
            <div className="inline-flex rounded-full border border-border bg-surface p-1">
              {(["uso", "lista"] as const).map((k) => (
                <Link
                  key={k}
                  href={buildHref({ kind: k, q, sort })}
                  aria-current={kind === k ? "page" : undefined}
                  className={`min-h-11 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
                    kind === k
                      ? k === "lista"
                        ? "bg-wish text-bg"
                        : "bg-accent text-white"
                      : "text-muted hover:text-white"
                  }`}
                >
                  {KIND_LABEL[k].label}{" "}
                  <span className="opacity-60">({kindCounts[k]})</span>
                </Link>
              ))}
            </div>
          </nav>
        )}

        {/* Contexto da prateleira "lista" — honestidade explícita, não letra miúda */}
        {hasBothKinds && kind === "lista" && (
          <p className="mx-auto mb-5 max-w-xl rounded-xl border border-wish/30 bg-wish/10 px-4 py-3 text-center text-sm text-muted">
            Esses eu <strong className="text-wish">ainda não comprei</strong> —
            pesquisei, gostei e estão na minha lista. Não posso dizer “eu uso”,
            mas posso dizer “eu quero”.
          </p>
        )}

        {/* Filtro de categorias */}
        {/*
          Eram 8 pills quebrando em 4 linhas no telefone (~150px só de filtro,
          antes de qualquer produto). Vira uma faixa de linha única com rolagem
          horizontal — padrão de app de catálogo. No desktop volta a quebrar
          linha e centralizar, que lá tem largura de sobra.
        */}
        <nav
          aria-label="Categorias"
          className="-mx-4 mb-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          <CategoryPill
            label="Todos"
            count={inKind.length}
            href={buildHref({ kind, q, sort })}
            active={!cat}
          />
          {categories.map((c) => (
            <CategoryPill
              key={c}
              label={c}
              count={categoryCounts[c]}
              href={buildHref({ cat: c, kind, q, sort })}
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
          <section aria-labelledby="destaques" className="mb-10 space-y-4">
            <h2
              id="destaques"
              className="text-xs font-bold uppercase tracking-widest text-muted"
            >
              Destaques
            </h2>
            {featured.map((item) => (
              <FeaturedCard key={item.slug} item={item} />
            ))}
          </section>
        )}

        {/* Grid — 2 colunas no telefone: com 90 itens, 1 coluna dava um rolo de
            mais de 40.000px e comparar dois produtos exigia ir e voltar. Duas
            colunas é o padrão de todo catálogo mobile; o card encolhe junto. */}
        {regular.length > 0 ? (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {regular.map((item) => (
              <ProductCard key={item.slug} item={item} />
            ))}
          </section>
        ) : (
          featured.length === 0 && (
            <div className="rounded-xl border border-border bg-surface p-10 text-center">
              <p className="text-lg">
                {query
                  ? `Nenhum produto encontrado para “${q}”${
                      hasBothKinds ? ` em “${KIND_LABEL[kind].label}”` : ""
                    }.`
                  : "Ainda não há produtos nessa categoria."}
              </p>
              {otherKindHits > 0 ? (
                <Link
                  href={buildHref({ kind: otherKind, q, sort })}
                  className="mt-3 inline-block rounded-lg bg-accent px-5 py-2.5 font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Ver {otherKindHits}{" "}
                  {otherKindHits === 1 ? "resultado" : "resultados"} em “
                  {KIND_LABEL[otherKind].label}” →
                </Link>
              ) : (
                <Link
                  href={buildHref({ kind })}
                  className="mt-2 inline-block text-accent underline"
                >
                  Ver todos os produtos
                </Link>
              )}
            </div>
          )
        )}

        <footer className="mt-14 border-t border-border pt-6 text-center text-sm text-muted">
          <p>
            Links de afiliado — comprar por aqui apoia o meu trabalho, sem
            custo extra pra você. 💜
          </p>
          {/*
            Aviso de preço em letra visível, não em letra miúda. O valor de
            cada card é o do dia da conferência (carimbado no próprio card);
            o Mercado Livre muda preço sozinho, e é melhor o visitante saber
            disso aqui do que estranhar no checkout.
          */}
          <p className="mx-auto mt-3 max-w-xl text-xs">
            <strong className="text-white">Sobre os preços:</strong> cada card
            mostra o valor que eu vi no dia em que conferi o anúncio — a data
            está do lado do preço. O Mercado Livre muda preço e estoque
            sozinho, então{" "}
            <strong className="text-white">
              confirme o valor no anúncio antes de fechar a compra
            </strong>
            .
          </p>
          {/*
            A vitrine da Shopee tem URL própria pra ser divulgada solta no
            Instagram, mas quem chega pela home também precisa achar — daí o
            link aqui, discreto, sem competir com o catálogo.
          */}
          <p className="mt-4 text-xs">
            <Link
              href="/shopee"
              className="inline-flex min-h-11 items-center justify-center font-semibold text-accent-soft transition-colors hover:text-white"
            >
              Ver minha seleção na Shopee →
            </Link>
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
        {/*
          Com 90 itens a página passa de 20.000px mesmo em duas colunas, e no
          telefone não existe atalho de "Home" como no teclado. Âncora simples
          em vez de botão com JS: não custa hidratação e funciona sem script.
          Só aparece no telefone, onde o problema existe.
        */}
        <a
          href="#topo"
          className="fixed bottom-4 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/90 text-muted shadow-lg backdrop-blur transition-colors hover:border-accent-soft hover:text-white sm:hidden"
          aria-label="Voltar ao topo"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </a>
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
      className={`inline-flex min-h-11 shrink-0 snap-start items-center gap-1 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
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

/**
 * Preço + a data em que ele foi visto.
 *
 * O preço do Mercado Livre muda sozinho, então o número aqui é um retrato do
 * dia em que conferi o anúncio — não uma promessa. Em vez de um aviso genérico
 * de rodapé ("valores sujeitos a alteração"), cada card carimba a própria
 * data: o visitante vê na hora se aquele preço é de ontem ou de um mês atrás
 * e sabe o quanto confiar nele.
 */
function PriceTag({ item }: { item: EnrichedLink }) {
  const price = formatPrice(item.price);
  const originalPrice = formatPrice(item.originalPrice);
  const discount = discountPercent(item.price, item.originalPrice);
  const seenAt = formatShortDate(item.verifiedAt);
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
      {seenAt && (
        <span
          className="text-[10px] text-muted"
          title="O preço do Mercado Livre muda sozinho. Este é o valor que eu vi nessa data — confira no anúncio antes de comprar."
        >
          preço visto em {seenAt}
        </span>
      )}
    </span>
  );
}

/**
 * Selo só nos itens da lista de desejo. O "eu uso" é a norma do site e não
 * precisa de rótulo — marcar a exceção evita poluir 47 cards e deixa claro,
 * mesmo fora da aba, que aquele item não é um "eu uso".
 */
function KindBadge({ item }: { item: EnrichedLink }) {
  if (kindOf(item) !== "lista") return null;
  return (
    <span className="mb-1 inline-flex w-fit items-center gap-1 rounded bg-wish/20 px-2 py-0.5 text-xs font-bold tracking-wide text-wish">
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {KIND_LABEL.lista.badge}
    </span>
  );
}

/*
 * min-h-11 (44px) é alvo de toque mínimo. Estes botões tinham 36px e são 49
 * na home — justamente os das ofertas multiplataforma, no mobile, que é de
 * onde vem o tráfego. Alvo pequeno aqui é clique perdido.
 */
function OfferLinks({ item }: { item: EnrichedLink }) {
  if (!item.offers || item.offers.length === 0) return null;
  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {item.offers.map((offer) => (
        <a
          key={offer.platform + offer.url}
          href={`/r/${item.slug}?p=${offer.platform}`}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border border-border bg-surface-2 px-2 py-2 text-[11px] text-muted transition-colors hover:border-accent-soft hover:text-white sm:px-3 sm:text-xs"
        >
          {/*
            "Também na Amazon" quebrava em 3 linhas dentro da coluna de 171px do
            grid de telefone. No mobile fica só o nome da loja (o ícone já diz
            que é outra plataforma); a frase inteira volta a partir do sm.
          */}
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <PlatformIcon platform={offer.platform} />
            <span className="truncate">
              <span className="hidden sm:inline">Também na </span>
              {PLATFORM_LABEL[offer.platform].label}
              {offer.note ? ` · ${offer.note}` : ""}
            </span>
          </span>
          {offer.price != null && (
            <span className="shrink-0 font-bold text-white">
              {formatPrice(offer.price)}
            </span>
          )}
        </a>
      ))}
    </div>
  );
}

/*
 * No mobile o card de destaque tinha ~600px (foto de 176px de altura + p-6),
 * e com 5 destaques o primeiro produto do grid só aparecia depois de 5 telas.
 * Compactado só no telefone: foto de 128px e padding menor. No desktop nada
 * muda.
 */
function FeaturedCard({ item }: { item: EnrichedLink }) {
  const usage = usingFor(item.usingSince);
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-accent/40 bg-gradient-to-br from-surface to-surface-2 p-4 sm:flex-row sm:gap-5 sm:p-6">
      {item.image && (
        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 p-2 sm:h-44 sm:w-44 sm:p-3">
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
        <KindBadge item={item} />
        <h3 className="text-xl font-bold">{item.title}</h3>
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
        <OfferLinks item={item} />
      </div>
    </article>
  );
}

function ProductCard({ item }: { item: EnrichedLink }) {
  const usage = usingFor(item.usingSince);
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-accent-soft/50">
      <div className="relative h-28 bg-surface-2 p-2 sm:h-40 sm:p-3">
        {item.image ? (
          <div className="relative h-full w-full overflow-hidden rounded-lg bg-[#f4f2ee]">
            <Image
              src={item.image}
              alt={item.title}
              fill
              /* O grid virou 2 colunas no telefone: dizer 100vw aqui faz o
                 navegador baixar imagem do dobro do necessário em cada card. */
              sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 30vw"
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
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <KindBadge item={item} />
        {/*
          Em duas colunas o título de um produto de marketplace (que costuma ter
          15 palavras) tomava o card inteiro. Cortado em 3 linhas no telefone —
          o nome completo continua no atributo e na página de destino.
        */}
        <h3 className="line-clamp-3 text-sm font-semibold leading-snug sm:line-clamp-none sm:text-base">
          {item.title}
        </h3>
        {item.review && (
          <p className="mt-1 line-clamp-4 text-xs italic text-accent-soft sm:line-clamp-none sm:text-sm">
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
              className="flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg bg-accent px-2 py-2.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 sm:px-4 sm:text-sm"
            >
              Quero esse <span aria-hidden className="ml-1">→</span>
            </a>
            <ShareButton title={item.title} slug={item.slug} />
          </div>
          <OfferLinks item={item} />
        </div>
      </div>
    </article>
  );
}
