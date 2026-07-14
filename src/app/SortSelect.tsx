"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SORT_LABEL, type SortKey } from "@/lib/format";

export function SortSelect({ current }: { current: SortKey }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "default") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    const query = params.toString();
    router.push(query ? `/?${query}` : "/");
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      aria-label="Ordenar produtos"
      className="min-h-11 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-accent-soft/50 hover:text-white"
    >
      {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
        <option key={key} value={key} className="bg-surface text-white">
          {SORT_LABEL[key]}
        </option>
      ))}
    </select>
  );
}
