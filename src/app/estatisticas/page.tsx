import Link from "next/link";
import { getStats, getToday, shiftDate } from "@/lib/analytics";
import { links } from "@/lib/links";

// Sempre dado fresco — painel do Danilo, não faz sentido cachear.
export const dynamic = "force-dynamic";

type Preset = "hoje" | "7" | "30" | "tudo" | "custom";

const PRESETS: { key: Exclude<Preset, "custom">; label: string }[] = [
  { key: "hoje", label: "Hoje" },
  { key: "7", label: "7 dias" },
  { key: "30", label: "30 dias" },
  { key: "tudo", label: "Tudo" },
];

/** "2026-07-29" -> "29/07" */
function br(dateStr: string): string {
  const [, m, d] = dateStr.split("-");
  return `${d}/${m}`;
}

export default async function Estatisticas({
  searchParams,
}: {
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const today = getToday();

  const preset: Preset =
    sp.preset === "hoje" ||
    sp.preset === "7" ||
    sp.preset === "30" ||
    sp.preset === "tudo"
      ? sp.preset
      : sp.from || sp.to
        ? "custom"
        : "tudo";

  let range: { from?: string; to?: string } | undefined;
  if (preset === "hoje") range = { from: today, to: today };
  else if (preset === "7") range = { from: shiftDate(today, -6), to: today };
  else if (preset === "30") range = { from: shiftDate(today, -29), to: today };
  else if (preset === "custom") range = { from: sp.from, to: sp.to };
  else range = undefined; // tudo

  const stats = await getStats(range);

  if (!stats) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Estatísticas indisponíveis</h1>
        <p className="mt-2 text-muted">
          Não consegui ler os dados — confira se o Upstash Redis está conectado
          ao projeto (envs `KV_REST_API_URL` / `KV_REST_API_TOKEN`).
        </p>
      </main>
    );
  }

  const byItem = Object.entries(stats.byItem)
    .map(([slug, clicks]) => {
      const item = links.find((l) => l.slug === slug);
      return { slug, title: item?.title ?? slug, clicks };
    })
    .sort((a, b) => b.clicks - a.clicks);

  const rangeLabel =
    preset === "hoje"
      ? "Hoje"
      : preset === "7"
        ? "Últimos 7 dias"
        : preset === "30"
          ? "Últimos 30 dias"
          : preset === "tudo"
            ? stats.firstDay
              ? `Desde ${br(stats.firstDay)}`
              : "Todo o período"
            : `${br(stats.from)} – ${br(stats.to)}`;

  const minDate = stats.firstDay ?? today;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Estatísticas — Uso e Indico</h1>
      <p className="mt-1 text-sm text-muted">
        {rangeLabel}
        {stats.lastUpdated && (
          <>
            {" · "}atualizado em{" "}
            {new Date(stats.lastUpdated).toLocaleString("pt-BR")}
          </>
        )}
      </p>

      {/* Filtro por data */}
      <nav
        aria-label="Período"
        className="mt-5 flex flex-wrap items-center gap-2"
      >
        {PRESETS.map((p) => {
          const active = preset === p.key;
          return (
            <Link
              key={p.key}
              href={`/estatisticas?preset=${p.key}`}
              aria-current={active ? "page" : undefined}
              className={`min-h-9 rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "border-accent bg-accent text-white"
                  : "border-border text-muted hover:border-accent-soft hover:text-white"
              }`}
            >
              {p.label}
            </Link>
          );
        })}

        <form
          action="/estatisticas"
          method="get"
          className="ml-auto flex flex-wrap items-center gap-2"
        >
          <input
            type="date"
            name="from"
            defaultValue={stats.from}
            min={minDate}
            max={today}
            aria-label="Data inicial"
            className="min-h-9 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-white"
          />
          <span className="text-muted">–</span>
          <input
            type="date"
            name="to"
            defaultValue={stats.to}
            min={minDate}
            max={today}
            aria-label="Data final"
            className="min-h-9 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-sm text-white"
          />
          <button
            type="submit"
            className="min-h-9 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Filtrar
          </button>
        </form>
      </nav>

      {/* KPIs do período */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-2xl font-bold tabular-nums">
            {stats.pageviews}
          </div>
          <div className="text-xs text-muted">Visitas na home</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-2xl font-bold tabular-nums">{stats.clicks}</div>
          <div className="text-xs text-muted">Cliques em produto</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-2xl font-bold tabular-nums">
            {byItem.filter((r) => r.clicks > 0).length}
          </div>
          <div className="text-xs text-muted">Produtos clicados</div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-bold">Por produto</h2>
      {byItem.length === 0 ? (
        <p className="mt-2 text-muted">
          Sem cliques nesse período. Tente um intervalo maior (ex: “Tudo”).
        </p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2">Produto</th>
              <th className="py-2 text-right">Cliques</th>
            </tr>
          </thead>
          <tbody>
            {byItem.map((row) => (
              <tr key={row.slug} className="border-b border-border">
                <td className="py-2">{row.title}</td>
                <td className="py-2 text-right tabular-nums">{row.clicks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p className="mt-8 text-xs text-muted">
        Cliques de robôs (crawlers, preview de link do WhatsApp/Telegram) são
        ignorados — a contagem é só de acesso humano.
      </p>
    </main>
  );
}
