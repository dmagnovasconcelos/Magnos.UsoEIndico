"use client";

import { useEffect, useMemo, useState } from "react";
import type { LinkConfig, Platform } from "@/lib/links";

const PLATFORMS: Platform[] = ["MERCADO_LIVRE", "SHOPEE", "AMAZON", "OUTRO"];

const EMPTY_ITEM: LinkConfig = {
  slug: "",
  url: "",
  platform: "MERCADO_LIVRE",
  categories: [],
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function AdminPanel() {
  const [items, setItems] = useState<LinkConfig[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [draft, setDraft] = useState<LinkConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/links")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setItems(data.links);
      })
      .catch(() => setError("Falha ao carregar o catálogo."));
  }, []);

  const knownCategories = useMemo(() => {
    if (!items) return [];
    return [...new Set(items.flatMap((i) => i.categories))].sort();
  }, [items]);

  function startEdit(item: LinkConfig) {
    setEditingSlug(item.slug);
    setDraft({ ...item, categories: [...item.categories] });
    setMessage(null);
  }

  function startNew() {
    setEditingSlug("__new__");
    setDraft({ ...EMPTY_ITEM });
    setMessage(null);
  }

  function cancelEdit() {
    setEditingSlug(null);
    setDraft(null);
  }

  async function persist(nextItems: LinkConfig[]) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: nextItems }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao salvar.");
        return false;
      }
      setItems(nextItems);
      return true;
    } catch {
      setError("Erro de rede ao salvar.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveDraft() {
    if (!draft || !items) return;
    if (!draft.slug.trim() || !draft.url.trim() || draft.categories.length === 0) {
      setError("Slug, URL e ao menos 1 categoria são obrigatórios.");
      return;
    }
    const isNew = editingSlug === "__new__";
    const nextItems = isNew
      ? [...items, draft]
      : items.map((i) => (i.slug === editingSlug ? draft : i));

    const ok = await persist(nextItems);
    if (ok) {
      setMessage(isNew ? "Item adicionado." : "Item salvo.");
      cancelEdit();
    }
  }

  async function deleteItem(slug: string) {
    if (!items) return;
    if (!confirm(`Remover "${slug}" do catálogo?`)) return;
    const nextItems = items.filter((i) => i.slug !== slug);
    const ok = await persist(nextItems);
    if (ok) setMessage("Item removido.");
  }

  function updateDraft<K extends keyof LinkConfig>(key: K, value: LinkConfig[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  function toggleCategory(cat: string) {
    if (!draft) return;
    const has = draft.categories.includes(cat);
    updateDraft(
      "categories",
      has ? draft.categories.filter((c) => c !== cat) : [...draft.categories, cat]
    );
  }

  function addNewCategory() {
    const name = prompt("Nome da nova categoria:");
    if (!name?.trim()) return;
    if (!draft) return;
    if (!draft.categories.includes(name.trim())) {
      updateDraft("categories", [...draft.categories, name.trim()]);
    }
  }

  if (error && !items) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg text-red-400">{error}</p>
      </main>
    );
  }

  if (!items) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center text-muted">
        Carregando catálogo...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 pb-24">
      <h1 className="text-2xl font-bold">Painel de edição — Uso e Indico</h1>
      <p className="mt-1 text-sm text-muted">
        Escreve direto em <code>src/lib/links.ts</code>. Depois de editar, confira
        o <code>git diff</code>, rode <code>pnpm build</code> e dê o commit/push
        você mesmo.
      </p>

      {message && (
        <p className="mt-4 rounded-lg border border-discount/40 bg-discount/10 px-4 py-2 text-sm text-discount">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-lg border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={startNew}
        disabled={editingSlug !== null}
        className="mt-6 min-h-11 rounded-lg bg-accent px-5 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        + Adicionar novo item
      </button>

      {editingSlug === "__new__" && draft && (
        <EditForm
          draft={draft}
          knownCategories={knownCategories}
          onChange={updateDraft}
          onToggleCategory={toggleCategory}
          onAddCategory={addNewCategory}
          onSave={saveDraft}
          onCancel={cancelEdit}
          saving={saving}
          isNew
        />
      )}

      <ul className="mt-8 space-y-2">
        {items.map((item) => (
          <li
            key={item.slug}
            className="rounded-xl border border-border bg-surface p-4"
          >
            <div className="flex items-center gap-3">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.image}
                  alt=""
                  className="h-12 w-12 rounded-lg bg-[#f4f2ee] object-contain p-1"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-surface-2" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{item.title || item.slug}</p>
                <p className="truncate text-xs text-muted">
                  {item.categories.join(", ")}
                  {item.price != null && ` · R$ ${item.price}`}
                </p>
              </div>
              <button
                onClick={() => startEdit(item)}
                disabled={editingSlug !== null}
                className="min-h-9 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent-soft hover:text-white disabled:opacity-40"
              >
                Editar
              </button>
              <button
                onClick={() => deleteItem(item.slug)}
                disabled={editingSlug !== null || saving}
                className="min-h-9 rounded-lg border border-red-400/30 px-3 py-1.5 text-sm font-medium text-red-400 transition-colors hover:border-red-400 disabled:opacity-40"
              >
                Excluir
              </button>
            </div>

            {editingSlug === item.slug && draft && (
              <EditForm
                draft={draft}
                knownCategories={knownCategories}
                onChange={updateDraft}
                onToggleCategory={toggleCategory}
                onAddCategory={addNewCategory}
                onSave={saveDraft}
                onCancel={cancelEdit}
                saving={saving}
              />
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}

function EditForm({
  draft,
  knownCategories,
  onChange,
  onToggleCategory,
  onAddCategory,
  onSave,
  onCancel,
  saving,
  isNew,
}: {
  draft: LinkConfig;
  knownCategories: string[];
  onChange: <K extends keyof LinkConfig>(key: K, value: LinkConfig[K]) => void;
  onToggleCategory: (cat: string) => void;
  onAddCategory: () => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  isNew?: boolean;
}) {
  return (
    <div className="mt-4 space-y-3 border-t border-border pt-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Slug">
          <div className="flex gap-2">
            <input
              value={draft.slug}
              onChange={(e) => onChange("slug", e.target.value)}
              className="input"
              disabled={!isNew}
            />
            {isNew && draft.title && (
              <button
                type="button"
                onClick={() => onChange("slug", slugify(draft.title ?? ""))}
                className="min-h-11 shrink-0 rounded-lg border border-border px-3 text-xs text-muted hover:border-accent-soft"
              >
                gerar do título
              </button>
            )}
          </div>
        </Field>
        <Field label="URL de afiliado">
          <input
            value={draft.url}
            onChange={(e) => onChange("url", e.target.value)}
            className="input"
          />
        </Field>
        <Field label="Plataforma">
          <select
            value={draft.platform}
            onChange={(e) => onChange("platform", e.target.value as Platform)}
            className="input"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Destaque">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!draft.featured}
              onChange={(e) => onChange("featured", e.target.checked)}
            />
            Mostrar na seção de destaques
          </label>
        </Field>
      </div>

      <Field label="Categorias (pode marcar mais de uma)">
        <div className="flex flex-wrap gap-2">
          {knownCategories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => onToggleCategory(cat)}
              className={`min-h-9 rounded-full border px-3 py-1 text-sm ${
                draft.categories.includes(cat)
                  ? "border-accent bg-accent text-white"
                  : "border-border text-muted hover:border-accent-soft"
              }`}
            >
              {cat}
            </button>
          ))}
          <button
            type="button"
            onClick={onAddCategory}
            className="min-h-9 rounded-full border border-dashed border-border px-3 py-1 text-sm text-muted hover:border-accent-soft"
          >
            + nova categoria
          </button>
        </div>
      </Field>

      <Field label="Título">
        <input
          value={draft.title ?? ""}
          onChange={(e) => onChange("title", e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Imagem (URL)">
        <input
          value={draft.image ?? ""}
          onChange={(e) => onChange("image", e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Review pessoal — Por que eu uso">
        <textarea
          value={draft.review ?? ""}
          onChange={(e) => onChange("review", e.target.value)}
          className="input min-h-20"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Preço atual (R$)">
          <input
            type="number"
            step="0.01"
            value={draft.price ?? ""}
            onChange={(e) =>
              onChange(
                "price",
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
            className="input"
          />
        </Field>
        <Field label="Preço original (R$, opcional)">
          <input
            type="number"
            step="0.01"
            value={draft.originalPrice ?? ""}
            onChange={(e) =>
              onChange(
                "originalPrice",
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
            className="input"
          />
        </Field>
        <Field label="Usando desde (opcional)">
          <input
            type="date"
            value={draft.usingSince ?? ""}
            onChange={(e) => onChange("usingSince", e.target.value || undefined)}
            className="input"
          />
        </Field>
        <Field label="Verificado em (opcional)">
          <input
            type="date"
            value={draft.verifiedAt ?? ""}
            onChange={(e) => onChange("verifiedAt", e.target.value || undefined)}
            className="input"
          />
        </Field>
      </div>

      <Field label="Nota de verificação (opcional)">
        <textarea
          value={draft.verificationNote ?? ""}
          onChange={(e) => onChange("verificationNote", e.target.value)}
          className="input min-h-16"
        />
      </Field>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onSave}
          disabled={saving}
          className="min-h-11 rounded-lg bg-accent px-5 py-2.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="min-h-11 rounded-lg border border-border px-5 py-2.5 font-semibold text-muted hover:border-accent-soft hover:text-white"
        >
          Cancelar
        </button>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          min-height: 44px;
          border-radius: 0.5rem;
          border: 1px solid var(--color-border);
          background: var(--color-surface-2);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: white;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
