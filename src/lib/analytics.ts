/**
 * Analytics leve — sem banco relacional. Contadores no Upstash Redis
 * (via marketplace da Vercel), com incremento ATÔMICO (`INCR`/`HINCRBY`).
 *
 * Por que Redis e não um arquivo JSON: contador em arquivo faz
 * "lê-soma-grava", que perde incrementos quando dois eventos batem juntos
 * (comprovado em produção com o Blob: 5 cliques viraram 2). `INCR` soma no
 * servidor, sem race — conta exato mesmo em rajada.
 *
 * Provisionar: Vercel → Storage → Upstash for Redis (grátis) → conectar ao
 * projeto. Injeta `KV_REST_API_URL` + `KV_REST_API_TOKEN` sozinho. Sem
 * essas envs, tudo é best-effort silencioso (site funciona, só não conta).
 */

import { Redis } from "@upstash/redis";

const K = {
  pageviews: "analytics:pageviews",
  clicks: "analytics:clicks",
  completions: "analytics:completions",
  itemClicks: "analytics:item:clicks",
  itemCompletions: "analytics:item:completions",
  lastUpdated: "analytics:lastUpdated",
} as const;

interface Stats {
  pageviews: number;
  clicks: number;
  completions: number;
  byItem: Record<string, { clicks: number; completions: number }>;
  lastUpdated: string | null;
}

type EventType = "pageview" | "click" | "completion";

function isConfigured(): boolean {
  return Boolean(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );
}

let client: Redis | null = null;
function redis(): Redis {
  client ??= new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
  });
  return client;
}

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Um redirect = click + completion no mesmo momento. Incrementa os dois de
 * forma atômica (INCR/HINCRBY) numa pipeline — sem race, sem subcontagem.
 */
export async function trackRedirect(itemSlug: string) {
  if (!isConfigured()) return;
  try {
    const p = redis().pipeline();
    p.incr(K.clicks);
    p.incr(K.completions);
    p.hincrby(K.itemClicks, itemSlug, 1);
    p.hincrby(K.itemCompletions, itemSlug, 1);
    p.set(K.lastUpdated, new Date().toISOString());
    await p.exec();
  } catch {
    // best-effort — analytics nunca quebra o funil real
  }
}

/** Fire-and-forget — nunca lançar erro nem bloquear quem chamou. */
export async function trackEvent(type: EventType, itemSlug?: string) {
  if (!isConfigured()) return;
  try {
    const r = redis();
    if (type === "pageview") {
      const p = r.pipeline();
      p.incr(K.pageviews);
      p.set(K.lastUpdated, new Date().toISOString());
      await p.exec();
    } else if (type === "click" && itemSlug) {
      const p = r.pipeline();
      p.incr(K.clicks);
      p.hincrby(K.itemClicks, itemSlug, 1);
      p.set(K.lastUpdated, new Date().toISOString());
      await p.exec();
    } else if (type === "completion" && itemSlug) {
      const p = r.pipeline();
      p.incr(K.completions);
      p.hincrby(K.itemCompletions, itemSlug, 1);
      p.set(K.lastUpdated, new Date().toISOString());
      await p.exec();
    }
  } catch {
    // best-effort
  }
}

export async function getStats(): Promise<Stats | null> {
  // Store não configurado → null (a página mostra o estado "indisponível").
  if (!isConfigured()) return null;
  try {
    const r = redis();
    const [pageviews, clicks, completions, itemClicks, itemCompletions, lastUpdated] =
      await Promise.all([
        r.get<number>(K.pageviews),
        r.get<number>(K.clicks),
        r.get<number>(K.completions),
        r.hgetall<Record<string, number>>(K.itemClicks),
        r.hgetall<Record<string, number>>(K.itemCompletions),
        r.get<string>(K.lastUpdated),
      ]);

    const byItem: Stats["byItem"] = {};
    for (const [slug, n] of Object.entries(itemClicks ?? {})) {
      byItem[slug] = { clicks: toNum(n), completions: 0 };
    }
    for (const [slug, n] of Object.entries(itemCompletions ?? {})) {
      byItem[slug] ??= { clicks: 0, completions: 0 };
      byItem[slug].completions = toNum(n);
    }

    return {
      pageviews: toNum(pageviews),
      clicks: toNum(clicks),
      completions: toNum(completions),
      byItem,
      lastUpdated: lastUpdated ?? null,
    };
  } catch {
    return null;
  }
}
