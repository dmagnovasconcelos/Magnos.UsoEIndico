import { getStats } from "@/lib/analytics";
import { links } from "@/lib/links";

// Sempre busca dado fresco — página só pro Danilo acompanhar, não faz
// sentido cachear
export const dynamic = "force-dynamic";

function pct(part: number, total: number): string {
  if (total === 0) return "—";
  return `${((part / total) * 100).toFixed(1)}%`;
}

export default async function Estatisticas() {
  const stats = await getStats();

  if (!stats) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-xl font-bold">Estatísticas indisponíveis</h1>
        <p className="mt-2 text-muted">
          Não consegui ler o arquivo de estatísticas — confira se o store do
          Vercel Blob está conectado ao projeto (env `BLOB_READ_WRITE_TOKEN`).
        </p>
      </main>
    );
  }

  const byItem = Object.entries(stats.byItem)
    .map(([slug, data]) => {
      const item = links.find((l) => l.slug === slug);
      return { slug, title: item?.title ?? slug, ...data };
    })
    .sort((a, b) => b.clicks - a.clicks);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold">Estatísticas — Uso e Indico</h1>
      <p className="mt-1 text-sm text-muted">
        Atualizado em{" "}
        {stats.lastUpdated
          ? new Date(stats.lastUpdated).toLocaleString("pt-BR")
          : "nunca"}
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-2xl font-bold">{stats.pageviews}</div>
          <div className="text-xs text-muted">Visitas na home</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-2xl font-bold">{stats.clicks}</div>
          <div className="text-xs text-muted">
            Cliques em produto ({pct(stats.clicks, stats.pageviews)} das
            visitas)
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="text-2xl font-bold">{stats.completions}</div>
          <div className="text-xs text-muted">
            Redirects concluídos ({pct(stats.completions, stats.clicks)} dos
            cliques)
          </div>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-bold">Por produto</h2>
      {byItem.length === 0 ? (
        <p className="mt-2 text-muted">Ainda sem cliques registrados.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="py-2">Produto</th>
              <th className="py-2 text-right">Cliques</th>
              <th className="py-2 text-right">Completions</th>
            </tr>
          </thead>
          <tbody>
            {byItem.map((row) => (
              <tr key={row.slug} className="border-b border-border">
                <td className="py-2">{row.title}</td>
                <td className="py-2 text-right">{row.clicks}</td>
                <td className="py-2 text-right">{row.completions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
