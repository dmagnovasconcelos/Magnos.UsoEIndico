import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { links, type LinkConfig } from "@/lib/links";
import { formatLinksFile } from "@/lib/linksFormat";

const LINKS_PATH = path.join(process.cwd(), "src/lib/links.ts");

function guardDevOnly() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Painel de edição só funciona em ambiente local (pnpm dev)." },
      { status: 403 }
    );
  }
  return null;
}

export async function GET() {
  const blocked = guardDevOnly();
  if (blocked) return blocked;
  return NextResponse.json({ links });
}

function isValidLink(item: unknown): item is LinkConfig {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.slug === "string" &&
    i.slug.trim().length > 0 &&
    typeof i.url === "string" &&
    i.url.trim().length > 0 &&
    typeof i.platform === "string" &&
    ["MERCADO_LIVRE", "SHOPEE", "AMAZON", "TIKTOK", "OUTRO"].includes(i.platform) &&
    Array.isArray(i.categories) &&
    i.categories.length > 0 &&
    i.categories.every((c) => typeof c === "string" && c.trim().length > 0) &&
    (i.kind === undefined || i.kind === "uso" || i.kind === "lista")
  );
}

export async function POST(request: Request) {
  const blocked = guardDevOnly();
  if (blocked) return blocked;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const items = (body as { links?: unknown[] })?.links;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { error: "Payload precisa ter 'links' como array não-vazio." },
      { status: 400 }
    );
  }
  if (!items.every(isValidLink)) {
    return NextResponse.json(
      {
        error:
          "Item inválido: slug, url, platform e categories (não-vazio) são obrigatórios.",
      },
      { status: 400 }
    );
  }

  const slugs = new Set<string>();
  for (const item of items as LinkConfig[]) {
    if (slugs.has(item.slug)) {
      return NextResponse.json(
        { error: `Slug duplicado: ${item.slug}` },
        { status: 400 }
      );
    }
    slugs.add(item.slug);
  }

  const content = formatLinksFile(items as LinkConfig[]);
  await fs.writeFile(LINKS_PATH, content, "utf-8");

  return NextResponse.json({ ok: true, count: items.length });
}
