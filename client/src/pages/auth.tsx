import { useState } from "react";
import { useAuth } from "../lib/auth";
import { CLUB_LOGOS, clubAbbr } from "../lib/clubs";

const CLUBS = Object.keys(CLUB_LOGOS);

// Fixed positions for floating club logos on the pitch side
const LOGO_POSITIONS = [
  { top: "8%",  left: "12%", size: 44, delay: "0s" },
  { top: "14%", left: "62%", size: 36, delay: "0.4s" },
  { top: "28%", left: "30%", size: 52, delay: "0.8s" },
  { top: "22%", left: "80%", size: 40, delay: "1.2s" },
  { top: "44%", left: "8%",  size: 38, delay: "0.6s" },
  { top: "42%", left: "52%", size: 48, delay: "1.0s" },
  { top: "56%", left: "75%", size: 36, delay: "0.2s" },
  { top: "60%", left: "22%", size: 44, delay: "1.4s" },
  { top: "72%", left: "45%", size: 52, delay: "0.5s" },
  { top: "76%", left: "82%", size: 38, delay: "0.9s" },
  { top: "82%", left: "10%", size: 36, delay: "1.6s" },
  { top: "88%", left: "62%", size: 44, delay: "0.3s" },
];

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
    <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* ── LEFT: Pitch hero ── */}
      <div className="relative hidden lg:flex flex-1 flex-col items-center justify-center overflow-hidden">

        {/* Pitch background */}
        <div className="absolute inset-0 pitch-bg" />

        {/* Stadium lights: bright radial glows from top corners */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-40 bg-background/60 blur-2xl" />
        </div>

        {/* Pitch SVG markings */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 160"
          preserveAspectRatio="none"
        >
          <rect x="5" y="3" width="90" height="154" fill="none" stroke="white" strokeWidth="0.3" opacity="0.12"/>
          <line x1="5" y1="81" x2="95" y2="81" stroke="white" strokeWidth="0.3" opacity="0.12"/>
          <circle cx="50" cy="81" r="15" fill="none" stroke="white" strokeWidth="0.3" opacity="0.12"/>
          <circle cx="50" cy="81" r="1" fill="white" opacity="0.2"/>
          <rect x="25" y="3"  width="50" height="24" fill="none" stroke="white" strokeWidth="0.25" opacity="0.1"/>
          <rect x="35" y="3"  width="30" height="10" fill="none" stroke="white" strokeWidth="0.2" opacity="0.08"/>
          <rect x="25" y="133" width="50" height="24" fill="none" stroke="white" strokeWidth="0.25" opacity="0.1"/>
          <rect x="35" y="147" width="30" height="10" fill="none" stroke="white" strokeWidth="0.2" opacity="0.08"/>
          <circle cx="50" cy="21" r="1" fill="white" opacity="0.15"/>
          <circle cx="50" cy="141" r="1" fill="white" opacity="0.15"/>
          <path d="M 36 27 A 13 13 0 0 1 64 27" fill="none" stroke="white" strokeWidth="0.25" opacity="0.08"/>
          <path d="M 36 133 A 13 13 0 0 0 64 133" fill="none" stroke="white" strokeWidth="0.25" opacity="0.08"/>
          {/* Corner arcs */}
          <path d="M 5 8 A 5 5 0 0 1 10 3"    fill="none" stroke="white" strokeWidth="0.25" opacity="0.1"/>
          <path d="M 90 3 A 5 5 0 0 1 95 8"   fill="none" stroke="white" strokeWidth="0.25" opacity="0.1"/>
          <path d="M 5 154 A 5 5 0 0 0 10 157" fill="none" stroke="white" strokeWidth="0.25" opacity="0.1"/>
          <path d="M 90 157 A 5 5 0 0 0 95 154" fill="none" stroke="white" strokeWidth="0.25" opacity="0.1"/>
        </svg>

        {/* Floating club logos */}
        {LOGO_POSITIONS.map((pos, i) => {
          const club = CLUBS[i % CLUBS.length];
          const url = CLUB_LOGOS[club];
          return (
            <div
              key={i}
              className="absolute"
              style={{ top: pos.top, left: pos.left, animationDelay: pos.delay }}
            >
              <div
                className="rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-xl float-logo"
                style={{ width: pos.size, height: pos.size }}
              >
                {url ? (
                  <img
                    src={url}
                    alt={club}
                    className="object-contain p-1"
                    style={{ width: pos.size * 0.65, height: pos.size * 0.65 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white/60">{clubAbbr(club)}</span>
                )}
              </div>
            </div>
          );
        })}

        {/* Central branding */}
        <div className="relative z-10 text-center select-none">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 shadow-2xl shadow-primary/30 mb-6">
            <span className="text-5xl">⚽</span>
          </div>
          <h1 className="font-display text-[clamp(5rem,10vw,9rem)] tracking-widest text-white leading-none drop-shadow-2xl">
            CFF
          </h1>
          <p className="text-primary font-bold tracking-[0.3em] text-sm uppercase mt-2 drop-shadow-lg">
            Championship Football Factory
          </p>
          <p className="text-white/40 text-xs tracking-widest mt-3 uppercase">
            Eredivisie Fantasy 2026 / 27
          </p>
        </div>

        {/* Bottom gradient fade into form side */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-r from-transparent to-background/80 pointer-events-none" />
      </div>

      {/* ── RIGHT: Login form ── */}
      <div className="relative flex flex-col items-center justify-center lg:w-[420px] min-h-screen px-8 py-12 bg-background">

        {/* Subtle top-left glow */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        {/* Mobile logo (only visible on small screens) */}
        <div className="lg:hidden text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border border-primary/30 mb-3">
            <span className="text-3xl">⚽</span>
          </div>
          <h1 className="font-display text-6xl tracking-widest text-white">CFF</h1>
          <p className="text-primary text-xs font-bold tracking-widest uppercase mt-1">Championship Football Factory</p>
        </div>

        <div className="w-full max-w-sm space-y-6 relative z-10">
          {/* Heading */}
          <div>
            <h2 className="font-display text-4xl tracking-wider text-white">
              {mode === "login" ? "Welkom terug" : "Meld je aan"}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "login"
                ? "Log in op jouw CFF-account"
                : "Maak een gratis account aan"}
            </p>
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl border border-border/60 p-1 gap-1 bg-card/50">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${
                  mode === m
                    ? "bg-primary text-black shadow-lg shadow-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "login" ? "Inloggen" : "Registreren"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Teamnaam
                </label>
                <input
                  className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                  placeholder="Jouw teamnaam"
                  value={form.username}
                  onChange={set("username")}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                E-mailadres
              </label>
              <input
                type="email"
                className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                placeholder="jij@example.com"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Wachtwoord
              </label>
              <input
                type="password"
                className="w-full border border-input rounded-xl px-4 py-3 text-sm bg-card/60 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-muted-foreground/50"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-black rounded-xl py-3.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 tracking-wider mt-2"
            >
              {loading
                ? "Bezig…"
                : mode === "login"
                ? "⚽  Inloggen"
                : "⚽  Account aanmaken"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground pt-2">
            Eredivisie Fantasy Football &nbsp;·&nbsp; 2026/27
          </p>
        </div>
      </div>

      <style>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.55; }
          50%       { transform: translateY(-10px) rotate(3deg); opacity: 0.8; }
        }
        .float-logo {
          animation: floatLogo 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
