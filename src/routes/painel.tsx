import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

export const Route = createFileRoute("/painel")({
  head: () => ({ meta: [{ title: "Painel de integrações — AFRICA" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminPanel,
});

type KeyStatus = { elevenLabsConfigured: boolean; geminiConfigured: boolean };

function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [elevenLabsKey, setElevenLabsKey] = useState("");
  const [geminiKey, setGeminiKey] = useState("");
  const [status, setStatus] = useState<KeyStatus>({ elevenLabsConfigured: false, geminiConfigured: false });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStatus = async () => {
    const response = await fetch("/api/admin/keys", { credentials: "same-origin", cache: "no-store" });
    if (response.ok) {
      setStatus(await response.json() as KeyStatus);
      setAuthenticated(true);
    } else setAuthenticated(false);
  };

  useEffect(() => { void loadStatus(); }, []);

  const login = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username, password }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível entrar.");
      setPassword("");
      await loadStatus();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha de conexão."); }
    finally { setBusy(false); }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/keys", {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify({ elevenLabsKey, geminiKey }),
      });
      const result = await response.json() as KeyStatus & { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível salvar as chaves.");
      setStatus(result);
      setElevenLabsKey("");
      setGeminiKey("");
      setMessage("Chaves salvas com proteção no servidor.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Falha ao salvar."); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setElevenLabsKey("");
    setGeminiKey("");
    setMessage("Sessão encerrada.");
  };

  return (
    <main className="min-h-dvh bg-[#10140f] px-5 py-12 text-white sm:px-8">
      <div className="mx-auto w-full max-w-xl">
        <a href="/" className="text-xs uppercase tracking-[0.3em] text-lime-300">AFRICA · Admin</a>
        <h1 className="mt-8 font-display text-4xl font-light">Integrações do briefing</h1>
        <p className="mt-3 leading-relaxed text-white/60">Configure as credenciais usadas pelo servidor para interpretar respostas e gerar confirmações faladas.</p>

        {!authenticated ? (
          <form onSubmit={login} className="mt-10 space-y-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <label className="block text-sm text-white/75">Usuário<input autoComplete="username" required value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-lime-300" /></label>
            <label className="block text-sm text-white/75">Senha<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-lime-300" /></label>
            <button disabled={busy} className="w-full rounded-lg bg-lime-300 px-5 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Entrando…" : "Entrar no painel"}</button>
          </form>
        ) : (
          <form onSubmit={save} className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <KeyField label="ElevenLabs API key" configured={status.elevenLabsConfigured} value={elevenLabsKey} onChange={setElevenLabsKey} placeholder="xi-api-key" />
            <KeyField label="Gemini API key" configured={status.geminiConfigured} value={geminiKey} onChange={setGeminiKey} placeholder="AIza…" />
            <p className="text-xs leading-relaxed text-white/45">As chaves atuais nunca são exibidas. Deixe um campo vazio para manter a chave existente; para remover uma integração, use o botão Remover.</p>
            <div className="flex flex-wrap gap-3">
              <button disabled={busy || (!elevenLabsKey.trim() && !geminiKey.trim())} className="rounded-lg bg-lime-300 px-5 py-3 font-semibold text-black disabled:opacity-50">{busy ? "Salvando…" : "Salvar chaves"}</button>
              <button type="button" onClick={() => { setElevenLabsKey(""); setGeminiKey(""); }} className="rounded-lg border border-white/15 px-5 py-3 text-white/75">Limpar campos</button>
              <button type="button" onClick={logout} className="ml-auto px-3 py-3 text-white/50 hover:text-white">Sair</button>
            </div>
            {status.elevenLabsConfigured && <RemoveKey label="Remover ElevenLabs" field="elevenLabsKey" onDone={loadStatus} onMessage={setMessage} />}
            {status.geminiConfigured && <RemoveKey label="Remover Gemini" field="geminiKey" onDone={loadStatus} onMessage={setMessage} />}
          </form>
        )}
        {message && <p role="status" className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-lime-100">{message}</p>}
        <a href="/" className="mt-8 inline-block text-sm text-white/50 hover:text-white">← Voltar ao site</a>
      </div>
    </main>
  );
}

function KeyField({ label, configured, value, onChange, placeholder }: { label: string; configured: boolean; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-sm text-white/75">{label}<span className={`ml-2 text-xs ${configured ? "text-lime-300" : "text-white/40"}`}>{configured ? "configurada" : "não configurada"}</span><input type="password" autoComplete="new-password" value={value} onChange={(event) => onChange(event.target.value)} placeholder={configured ? "••••••••••••••••" : placeholder} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-white outline-none focus:border-lime-300" /></label>;
}

function RemoveKey({ label, field, onDone, onMessage }: { label: string; field: "elevenLabsKey" | "geminiKey"; onDone: () => Promise<void>; onMessage: (message: string) => void }) {
  const remove = async () => {
    const response = await fetch("/api/admin/keys", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ [field]: null }) });
    if (response.ok) { await onDone(); onMessage(`${label.replace("Remover ", "")} removida.`); }
    else onMessage("Não foi possível remover a chave.");
  };
  return <button type="button" onClick={() => void remove()} className="mr-4 text-xs text-red-300/70 hover:text-red-200">{label}</button>;
}
