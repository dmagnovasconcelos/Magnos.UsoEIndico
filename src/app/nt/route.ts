import { NextRequest, NextResponse } from "next/server";

/**
 * Liga/desliga o "não me contabilize" no navegador que abrir esta rota.
 *
 * Por que existe: o filtro de bot corta crawler e curl pelo user-agent, mas
 * não corta navegador de verdade. Então toda vez que o Danilo abre o próprio
 * site pra conferir — ou eu abro pra verificar um link — aquilo entra como
 * visita e clique reais. Foi assim que o histórico ficou com 93 produtos
 * distintos "clicados" em jul-ago com apenas 118 visitas no mesmo período.
 *
 * Uso: abrir /nt uma vez no celular/navegador. Para voltar a contar, /nt?off=1.
 * O cookie dura 1 ano e é por navegador (não afeta ninguém mais).
 */
export async function GET(req: NextRequest) {
  const off = req.nextUrl.searchParams.get("off") === "1";
  const res = NextResponse.redirect(new URL("/", req.url), 302);

  if (off) {
    res.cookies.delete("nt");
  } else {
    res.cookies.set("nt", "1", {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
  }
  return res;
}
