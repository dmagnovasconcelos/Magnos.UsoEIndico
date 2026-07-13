"use client";

import { useEffect } from "react";

/**
 * A home é ISR (revalidate 24h), então rastrear pageview no Server
 * Component só contaria 1x por regeneração, não por visitante. Esse
 * client component dispara no navegador de cada visitante real.
 */
export function TrackPageview() {
  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "pageview" }),
      keepalive: true,
    }).catch(() => {});
  }, []);

  return null;
}
