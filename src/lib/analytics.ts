/**
 * Analytics leve — Upstash Redis (via marketplace da Vercel), incremento
 * ATÔMICO (`INCR`/`HINCRBY`), agora com HISTÓRICO POR DIA.
 *
 * Modelo: um balde de contadores por dia (fuso de Brasília), pra permitir
 * filtro por data na página. Chaves:
 *   av:pv:{YYYY-MM-DD}   -> visitas na home no dia            (INCR)
 *   av:ck:{YYYY-MM-DD}   -> cliques em produto no dia         (INCR)
 *   av:it:{YYYY-MM-DD}   -> hash slug->cliques no dia         (HINCRBY)
 *   av:days              -> sorted set dos dias com dado      (ZADD)
 *   av:lastUpdated       -> ISO do último evento              (SET)
 *
 * Por que Redis e não arquivo JSON: contador em arquivo faz lê-soma-grava,
 * que perde incrementos em rajada (comprovado com o Blob: 5 cliques → 2).
 * `INCR`/`HINCRBY` somam no servidor, sem race.
 *
 * O modelo antigo (chaves `analytics:*`, só total acumulado, sem data)
 * ficou órfão — este usa prefixo `av:*`, então nasce do zero.
 *
 * Sem `KV_REST_API_URL`/`KV_REST_API_TOKEN`, tudo é best-effort silencioso.
 */

import { Redis } from "@upstash/redis";

const KEY_DAYS = "av:days";
const KEY_LAST = "av:lastUpdated";
const TZ = "America/Sao_Paulo";

export interface RangeStats {
  pageviews: number;
  clicks: number;
  /** slug -> cliques no período */
  byItem: Record<string, number>;
  /** intervalo efetivamente somado (YYYY-MM-DD) */
  from: string;
  to: string;
  /** menor dia com dado registrado (pra limitar o seletor); null se vazio */
  firstDay: string | null;
  /** hoje no fuso de Brasília (limite superior do seletor) */
  today: string;
  lastUpdated: string | null;
}

function isConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
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

/** YYYY-MM-DD no fuso de Brasília (pra "hoje" ser o dia do Danilo). */
export function bucketDate(d: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function getToday(): string {
  return bucketDate(new Date());
}

/** Soma/subtrai dias de um YYYY-MM-DD sem sofrer com fuso (usa UTC ao meio-dia). */
export function shiftDate(s: string, delta: number): string {
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

function score(dateStr: string): number {
  return Number(dateStr.replace(/-/g, ""));
}

/**
 * Detecta acesso não-humano (crawler, bot de preview de link do WhatsApp/
 * Telegram, monitor, etc.). Sem user-agent também conta como bot. Usado nas
 * rotas pra não inflar a contagem com robô.
 */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent) return true;
  return /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|slackbot|discordbot|embedly|preview|monitor|headless|phantom|python-requests|curl|wget|axios|node-fetch|go-http|okhttp|java\/|bingpreview|googlebot|bingbot|yandex|baidu|duckduck|semrush|ahrefs|mj12|petalbot|applebot|pingdom|uptimerobot|lighthouse|gtmetrix/i.test(
    userAgent
  );
}

/** Visita na home — 1 evento por pageview real (client chama /api/track). */
export async function trackPageview() {
  if (!isConfigured()) return;
  try {
    const day = getToday();
    const p = redis().pipeline();
    p.incr(`av:pv:${day}`);
    p.zadd(KEY_DAYS, { score: score(day), member: day });
    p.set(KEY_LAST, new Date().toISOString());
    await p.exec();
  } catch {
    // best-effort — analytics nunca quebra o funil
  }
}

/**
 * Um redirect = 1 clique no produto (sempre completa se chegou aqui).
 * Uma escrita atômica por dia, sem race nem subcontagem.
 */
export async function trackRedirect(itemSlug: string) {
  if (!isConfigured()) return;
  try {
    const day = getToday();
    const p = redis().pipeline();
    p.incr(`av:ck:${day}`);
    p.hincrby(`av:it:${day}`, itemSlug, 1);
    p.zadd(KEY_DAYS, { score: score(day), member: day });
    p.set(KEY_LAST, new Date().toISOString());
    await p.exec();
  } catch {
    // best-effort
  }
}

/**
 * Lê o intervalo [from, to] (YYYY-MM-DD). Sem argumentos → tudo (do primeiro
 * dia registrado até hoje). Só lê os dias que existem no intervalo, então é
 * barato mesmo com janela grande.
 */
export async function getStats(range?: {
  from?: string;
  to?: string;
}): Promise<RangeStats | null> {
  if (!isConfigured()) return null;
  try {
    const r = redis();
    const today = getToday();

    const allDays = ((await r.zrange(KEY_DAYS, 0, -1)) as string[]) ?? [];
    const firstDay = allDays.length ? allDays[0] : null;

    let from = range?.from || firstDay || today;
    let to = range?.to || today;
    if (from > to) [from, to] = [to, from];

    const daysInRange =
      ((await r.zrange(KEY_DAYS, score(from), score(to), {
        byScore: true,
      })) as string[]) ?? [];

    const perDay = await Promise.all(
      daysInRange.map(async (d) => {
        const [pv, ck, items] = await Promise.all([
          r.get<number>(`av:pv:${d}`),
          r.get<number>(`av:ck:${d}`),
          r.hgetall<Record<string, number>>(`av:it:${d}`),
        ]);
        return { pv: toNum(pv), ck: toNum(ck), items: items ?? {} };
      })
    );

    let pageviews = 0;
    let clicks = 0;
    const byItem: Record<string, number> = {};
    for (const { pv, ck, items } of perDay) {
      pageviews += pv;
      clicks += ck;
      for (const [slug, n] of Object.entries(items)) {
        byItem[slug] = (byItem[slug] ?? 0) + toNum(n);
      }
    }

    const lastUpdated = (await r.get<string>(KEY_LAST)) ?? null;

    return { pageviews, clicks, byItem, from, to, firstDay, today, lastUpdated };
  } catch {
    return null;
  }
}
