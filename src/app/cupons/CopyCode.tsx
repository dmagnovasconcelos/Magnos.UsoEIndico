"use client";

import { useEffect, useState } from "react";

/**
 * O código do cupom como botão gigante de copiar.
 *
 * Por que o código inteiro é o botão (e não um "copiar" discreto do lado):
 * o cupom do ML é digitado no carrinho, não vai colado no link. Copiar é o
 * gesto que faz a promo funcionar — se ele falhar, o desconto não acontece e
 * o visitante culpa o site. Então é o maior alvo de toque da página.
 */
export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!copied && !failed) return;
    const t = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 2500);
    return () => clearTimeout(t);
  }, [copied, failed]);

  /**
   * Fallback pra quando a Clipboard API não existe ou é negada.
   *
   * Isso NÃO é zelo teórico: a maior parte do tráfego chega pelo navegador
   * interno do Instagram/WhatsApp, que em várias versões bloqueia
   * `navigator.clipboard`. Sem esse caminho, o botão principal da página
   * simplesmente não funcionaria pra quem vem da bio.
   */
  function legacyCopy(text: string): boolean {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      el.setSelectionRange(0, text.length); // iOS ignora só o select()
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setFailed(false);
      return;
    } catch {
      // cai no fallback abaixo
    }
    if (legacyCopy(code)) {
      setCopied(true);
      setFailed(false);
    } else {
      // Nem fingir sucesso, nem deixar o visitante sem saída: o código está
      // visível e é `select-all`, então dá pra copiar na mão.
      setFailed(true);
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={copy}
        aria-label={`Copiar cupom ${code}`}
        className="group flex min-h-14 w-full max-w-sm items-center justify-between gap-3 rounded-xl border-2 border-dashed border-discount/60 bg-discount/10 px-4 py-3 transition-colors hover:bg-discount/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-discount"
      >
        <span className="select-all font-mono text-xl font-bold tracking-wider text-discount sm:text-2xl">
          {code}
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-discount px-3 py-2 text-sm font-bold text-bg">
          {copied ? (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Copiado!
            </>
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect width="13" height="13" x="9" y="9" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copiar
            </>
          )}
        </span>
      </button>

      {/* aria-live: quem usa leitor de tela precisa saber que copiou */}
      <p aria-live="polite" className="min-h-5 text-xs text-muted">
        {copied && "Código copiado — agora é só colar no carrinho."}
        {failed && "Não consegui copiar. Selecione o código acima e copie."}
      </p>
    </div>
  );
}
