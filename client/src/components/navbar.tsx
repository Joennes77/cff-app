import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";
import { CffLogo } from "./CffLogo";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/players", label: "Spelers" },
  { href: "/rounds/active", label: "Speelronde" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-sidebar-border bg-sidebar/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-16">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <CffLogo size={38} />
          <span className="font-display text-2xl tracking-wider text-white group-hover:text-white/80 transition-colors">
            CFF
          </span>
          <span className="hidden sm:block text-[10px] font-semibold text-muted-foreground tracking-widest uppercase border border-border/50 rounded px-1.5 py-0.5">
            Eredivisie
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                location === href
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
            >
              {label}
            </Link>
          ))}
          {user?.isAdmin && (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                location === "/admin"
                  ? "bg-gold/20 text-gold border border-gold/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-foreground leading-tight">{user?.username}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  );
}
