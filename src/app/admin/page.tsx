import { AdminPanel } from "./AdminPanel";

export default function AdminPage() {
  if (process.env.NODE_ENV === "production") {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg">
          O painel de edição só funciona rodando localmente (
          <code className="rounded bg-surface-2 px-1.5 py-0.5">pnpm dev</code>
          ) — ele escreve direto no arquivo do catálogo.
        </p>
      </main>
    );
  }
  return <AdminPanel />;
}
