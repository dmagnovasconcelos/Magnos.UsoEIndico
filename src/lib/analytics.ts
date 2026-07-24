/**
 * Analytics leve — sem banco de dados. Os contadores vivem num único
 * arquivo JSON (`stats.json`) no Vercel Blob: um storage de verdade,
 * gravável em runtime (o filesystem do deploy é read-only na Vercel).
 *
 * Padrão: lê o JSON → soma +1 → grava o JSON (mesmo modelo do antigo
 * backend no GitHub, só que Vercel-native). Best-effort: se o store não
 * estiver configurado ou der qualquer erro, falha em silêncio — analytics
 * nunca pode quebrar o funil real do site.
 *
 * Provisionar em produção: Vercel → Storage → Create → Blob → conectar ao
 * projeto. Isso injeta a env `BLOB_READ_WRITE_TOKEN` automaticamente
 * (nada de colar token na mão). Sem a env, o site funciona igual, só não
 * contabiliza.
 */

import { put, list } from "@vercel/blob";

const BLOB_PATH = "stats.json";

interface Stats {
  pageviews: number;
  clicks: number;
  completions: number;
  byItem: Record<string, { clicks: number; completions: number }>;
  lastUpdated: string | null;
}

type EventType = "pageview" | "click" | "completion";

function emptyStats(): Stats {
  return {
    pageviews: 0,
    clicks: 0,
    completions: 0,
    byItem: {},
    lastUpdated: null,
  };
}

function isConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/**
 * URL pública do blob, cacheada entre invocações quentes da função. Sem
 * isso, cada leitura chamaria `list()` (advanced operation, cota mais
 * escassa). Com o cache, o `list()` só roda no cold start; as leituras
 * seguintes são um fetch simples da URL.
 */
let cachedUrl: string | null = null;

async function resolveUrl(): Promise<string | null> {
  if (cachedUrl) return cachedUrl;
  const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
  const found = blobs.find((b) => b.pathname === BLOB_PATH);
  cachedUrl = found?.url ?? null;
  return cachedUrl;
}

async function readStats(): Promise<Stats> {
  const url = await resolveUrl();
  if (!url) return emptyStats();
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return emptyStats();
  return (await res.json()) as Stats;
}

async function writeStats(stats: Stats): Promise<void> {
  const result = await put(BLOB_PATH, JSON.stringify(stats, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
    // sem cache de CDN: o próximo evento precisa ler o valor recém-gravado
    cacheControlMaxAge: 0,
  });
  cachedUrl = result.url;
}

/** Fire-and-forget — nunca lançar erro nem bloquear quem chamou. */
export async function trackEvent(type: EventType, itemSlug?: string) {
  if (!isConfigured()) return;
  try {
    const stats = await readStats();

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

    await writeStats(stats);
  } catch {
    // best-effort — silencia qualquer falha (store indisponível, rede, etc.)
  }
}

export async function getStats(): Promise<Stats | null> {
  // Store não configurado → null (a página mostra o estado "indisponível").
  if (!isConfigured()) return null;
  try {
    const url = await resolveUrl();
    // Configurado mas sem nenhum evento ainda → zeros, não "indisponível".
    if (!url) return emptyStats();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Stats;
  } catch {
    return null;
  }
}
