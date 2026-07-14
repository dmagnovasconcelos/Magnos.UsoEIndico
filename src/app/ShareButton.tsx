"use client";

export function ShareButton({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  function handleShare() {
    const url = `${window.location.origin}/r/${slug}`;
    const text = `Olha isso que eu uso e indico: ${title}\n${url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener"
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label="Compartilhar no WhatsApp"
      title="Compartilhar no WhatsApp"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-accent-soft/50 hover:text-white"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" />
        <line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
      </svg>
    </button>
  );
}
