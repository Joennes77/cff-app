import { Link, useLocation } from "wouter";
import { useAuth } from "../lib/auth";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/players", label: "Spelers" },
  { href: "/rounds/active", label: "Speelronde" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  return (
    <header className="border-b bg-sidebar text-sidebar-foreground sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-6 h-14">
        <Link href="/" className="font-display font-bold text-lg text-sidebar-primary shrink-0">
          ⚽ CFF
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location === href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60"
              }`}
            >
              {label}
            </Link>
          ))}
          {user?.isAdmin ? (
            <Link
              href="/admin"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location === "/admin"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/60"
              }`}
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm text-sidebar-foreground/70 hidden sm:block">{user?.username}</span>
          <button
            onClick={logout}
            className="text-sm px-3 py-1.5 rounded-md bg-sidebar-accent hover:bg-sidebar-accent/80 transition-colors"
          >
            Uitloggen
          </button>
        </div>
      </div>
    </header>
  );
}
