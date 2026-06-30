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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="text-5xl mb-2">⚽</div>
          <h1 className="font-display text-2xl font-bold">Championship Football Factory</h1>
          <p className="text-muted-foreground text-sm mt-1">Eredivisie fantasy football</p>
        </div>

        {/* Card */}
        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          {/* Mode toggle */}
          <div className="flex rounded-lg overflow-hidden border">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-medium transition-colors ${
                  mode === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                {m === "login" ? "Inloggen" : "Registreren"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="text-sm font-medium block mb-1">Gebruikersnaam</label>
                <input
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Jouw naam"
                  value={form.username}
                  onChange={set("username")}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium block mb-1">E-mailadres</label>
              <input
                type="email"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="jij@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium block mb-1">Wachtwoord</label>
              <input
                type="password"
                className="w-full border rounded-md px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? "Bezig…" : mode === "login" ? "Inloggen" : "Account aanmaken"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
