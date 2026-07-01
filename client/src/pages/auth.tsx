import { useState } from "react";
import { useAuth } from "../lib/auth";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.username, form.email, form.password);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background pitch lines */}
      <div className="absolute inset-0 pitch-bg opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/80" />

      {/* Decorative circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-white/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border border-primary/30 shadow-2xl shadow-primary/20 mb-2">
            <span className="text-4xl">⚽</span>
          </div>
          <h1 className="font-display text-5xl tracking-widest text-white">
            CFF
          </h1>
          <p className="text-sm font-semibold tracking-widest text-primary uppercase">
            Championship Football Factory
          </p>
          <p className="text-xs text-muted-foreground">Eredivisie fantasy football 2026/27</p>
        </div>

        {/* Card */}
        <div className="bg-card/80 backdrop-blur border border-border/50 rounded-2xl p-6 shadow-2xl space-y-4">
          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border/50 p-1 gap-1 bg-background/50">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === m
                    ? "bg-primary text-black shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Inloggen" : "Registreren"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="text-xs font-semibold block mb-1.5 text-muted-foreground uppercase tracking-wider">
                  Gebruikersnaam
                </label>
                <input
                  className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Jouw teamnaam"
                  value={form.username}
                  onChange={set("username")}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold block mb-1.5 text-muted-foreground uppercase tracking-wider">
                E-mailadres
              </label>
              <input
                type="email"
                className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="jij@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1.5 text-muted-foreground uppercase tracking-wider">
                Wachtwoord
              </label>
              <input
                type="password"
                className="w-full border border-input rounded-xl px-3 py-2.5 text-sm bg-background/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black rounded-xl py-3 text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20 tracking-wide"
            >
              {loading ? "Bezig…" : mode === "login" ? "Inloggen" : "Account aanmaken"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
