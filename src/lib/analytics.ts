/**
 * Analytics leve — sem banco de dados. Os contadores vivem num arquivo
 * JSON versionado no branch `analytics-data` do próprio repo (não o
 * `main`, pra não disparar deploy na Vercel a cada evento).
 *
 * Best-effort: se der conflito de concorrência (dois eventos ao mesmo
 * tempo) ou o token não estiver configurado, falha silenciosamente —
 * analytics nunca pode quebrar o funil real do site.
 */

const REPO = "dmagnovasconcelos/Magnos.UsoEIndico";
const BRANCH = "analytics-data";
const PATH = "stats.json";

interface Stats {
  pageviews: number;
  clicks: number;
  completions: number;
  byItem: Record<string, { clicks: number; completions: number }>;
  lastUpdated: string | null;
}

type EventType = "pageview" | "click" | "completion";

async function githubRequest(path: string, init?: RequestInit) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return null;
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...init?.headers,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function readStats(): Promise<{ stats: Stats; sha: string } | null> {
  const data = await githubRequest(
    `/repos/${REPO}/contents/${PATH}?ref=${BRANCH}`
  );
  if (!data?.content) return null;
  const decoded = Buffer.from(data.content, "base64").toString("utf-8");
  return { stats: JSON.parse(decoded), sha: data.sha };
}

async function writeStats(stats: Stats, sha: string): Promise<boolean> {
  const content = Buffer.from(JSON.stringify(stats, null, 2)).toString(
    "base64"
  );
  const result = await githubRequest(`/repos/${REPO}/contents/${PATH}`, {
    method: "PUT",
    body: JSON.stringify({
      message: `analytics: +1 ${stats.lastUpdated}`,
      content,
      sha,
      branch: BRANCH,
    }),
  });
  return result !== null;
}

/** Fire-and-forget — nunca lançar erro nem bloquear quem chamou. */
export async function trackEvent(type: EventType, itemSlug?: string) {
  try {
    const current = await readStats();
    if (!current) return;
    const { stats, sha } = current;

    stats.lastUpdated = new Date().toISOString();
    if (type === "pageview") stats.pageviews += 1;
    if (type === "click") {
      stats.clicks += 1;
      if (itemSlug) {
        stats.byItem[itemSlug] ??= { clicks: 0, completions: 0 };
        stats.byItem[itemSlug].clicks += 1;
      }
    }
    if (type === "completion") {
      stats.completions += 1;
      if (itemSlug) {
        stats.byItem[itemSlug] ??= { clicks: 0, completions: 0 };
        stats.byItem[itemSlug].completions += 1;
      }
    }

    await writeStats(stats, sha);
  } catch {
    // best-effort — silencia qualquer falha (conflito de concorrência, rede, etc.)
  }
}

export async function getStats(): Promise<Stats | null> {
  const current = await readStats();
  return current?.stats ?? null;
}
