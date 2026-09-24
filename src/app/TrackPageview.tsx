"use client";

import { useEffect } from "react";

/**
 * A home é ISR, então rastrear pageview no Server Component contaria 1x por
 * regeneração, não por visitante. Esse client component dispara no navegador
 * de cada visitante real.
 *
 * Também manda a ORIGEM: `?s=` na URL (ex: /?s=bio) diz de qual canal veio a
 * visita. Sem isso, dá pra ver quantas visitas houve, mas não qual post as
 * trouxe — que é a pergunta que interessa pra quem vende com a audiência.
 */
export function TrackPageview() {
  useEffect(() => {
    let source: string | null = null;
    try {
      source = new URLSearchParams(window.location.search).get("s");
    } catch {
      // URL exótica — segue sem origem, a visita ainda conta
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview", source }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
