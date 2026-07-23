import type { Metadata } from "next";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/links";
import "./globals.css";

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  description:
    "Curadoria pessoal do Danilo Magno: os produtos que eu uso no dia a dia, com o porquê de cada um — e os que ainda quero comprar.",
  icons: { icon: "/favicon-emblem.png" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_TAGLINE,
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
